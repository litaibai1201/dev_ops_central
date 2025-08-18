# -*- coding: utf-8 -*-
"""
@文件: dataset_controller.py
@說明: 數據集控制器
@時間: 2025-08-08
@作者: LiDong
"""

import hashlib
import traceback
from werkzeug.utils import secure_filename

from common.common_minio import OperMinio
from dbs.mongodb import DatasetFiles, DatasetHistory, connect_mongodb
from models.dataset_model import OperDatasetModel, OperDatasetFileModel, OperProjectDatasetModel
from serializes.model_serialize import DatasetModelSchema, DatasetFileModelSchema, ProjectDatasetModelSchema
from common.common_tools import CommonTools
from dbs.mysql_db import DBFunction
from configs.constant import conf
from loggers import logger


class DatasetController:
    """數據集控制器"""
    
    def __init__(self):
        self.oper_dataset = OperDatasetModel()
        self.oper_file = OperDatasetFileModel()
        self.oper_projectdataset = OperProjectDatasetModel()
        self.schema = DatasetModelSchema()
        self.file_schema = DatasetFileModelSchema()
        self.project_dataset_schema = ProjectDatasetModelSchema()
        self.allowed_extensions = conf["ALLOWED_EXTENTSIONS"]
        self.max_file_size = conf["MAX_FILE_SIZE"]

    def create(self, data, files, project_id):
        """創建數據集"""
        if not files or len(files) == 0:
            return "至少需要上傳一個文件", False
        # 驗證文件
        validation_result = self._validate_files(files)
        if validation_result:
            return validation_result, False
        
        data["id"] = CommonTools.get_timestmp()
        data['version'] = "v1.0"  # 初始版本
        
        # 處理文件上傳
        result, flag = self._process_file_upload(data, files, data.get("created_by"))
        if not flag:
            return result, flag
            
        data["files_info"] = result
        
        try:
            # 1. 創建項目與數據集關聯記錄
            project_dataset_data = {
                "project_id": project_id,
                "dataset_id": data["id"],
                "created_by": data.get("created_by")
            }
            project_dataset_obj = self.project_dataset_schema.load(self.project_dataset_schema.dump(project_dataset_data))
            result, flag = self.oper_projectdataset._add_project_dataset_relation(project_dataset_obj)
            if not flag:
                raise Exception(f"創建項目數據集關聯失敗: {result}")
            
            # 2. 創建數據集記錄
            dataset_obj = self.schema.load(self.schema.dump(data))
            result, flag = self.oper_dataset.add(dataset_obj)
            if not flag:
                raise Exception(f"創建數據集失敗: {result}")
            
            # 3. 創建數據集文件記錄
            uploaded_files, _ = data["files_info"]
            for file_info in uploaded_files:
                file_data = {
                    "file_nm": file_info['filename'],
                    "file_id": file_info['mongo_id'],
                    "file_version_id": file_info["version_id"],
                    "dataset_id": data['id'],
                    "dataset_version": data['version'], 
                    "created_by": data.get("created_by")
                }
                file_obj = self.file_schema.load(self.file_schema.dump(file_data))
                file_result, file_flag = self.oper_file._add_dataset_file_record(file_obj)
                if not file_flag:
                    raise Exception(f"創建數據集文件記錄失敗: {file_result}")
            
            # 提交事務
            result, flag = DBFunction.do_commit("數據創建成功", True)
            
            if flag:
                return data["id"], flag
            else:
                raise Exception(f"提交事務失敗: {result}")
                
        except Exception as e:
            # 事務回滾
            DBFunction.db_rollback()
            logger.error(f"創建數據集失敗: {str(e)}")
            return str(e), False
 
    def _validate_files(self, files):
        """
        驗證上傳文件
        
        Args:
            files: 文件列表
            
        Returns:
            str: 錯誤信息或None
        """
        for file in files:
            if file.filename == '':
                return "文件名不能為空"
            
            # 檢查文件擴展名
            file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
            if file_ext not in self.allowed_extensions:
                return f"不支持的文件類型: {file_ext}"
        
        return None
    
    
    def _process_file_upload(self, data, files, created_by):
        """
        處理文件上傳
        
        Args:
            data: 數據集數據字典
            files: 文件列表
            created_by: 創建人
            
        Returns:
            tuple: ((uploaded_files, total_size), success_flag)
        """
        try:
            # 清理數據集名稱用於路徑
            clean_dataset_nm = CommonTools.normalize_string(data['dataset_nm'])
            storage_path = f"datasets/{data['id']}_{clean_dataset_nm}/"
            
            # 連接MongoDB
            connect_mongodb()
            # 初始化MinIO
            minio_client = OperMinio()

            uploaded_files = []
            total_size = 0

            # 創建數據集版本歷史
            dataset_history = DatasetHistory.create_dataset_history(
                dataset_id=str(data['id']),
                initial_version=data["version"],
                initial_version_code=float(data["version"][1:]),
                created_by=created_by
            )
            
            # 處理每個文件
            for file in files:
                if file.filename == '':
                    continue
                    
                # 安全文件名
                filename = secure_filename(file.filename)
                file_ext = f".{filename.rsplit('.', 1)[1].lower()}" if '.' in filename else ''
                
                # 讀取文件內容計算哈希
                file.seek(0)
                file_content = file.read()
                file.seek(0)
                
                file_size = len(file_content)
                if file_size > self.max_file_size:
                    return f"文件 {filename} 超過大小限制 ({self.max_file_size/1024/1024}M)", False
                
                file_hash = hashlib.md5(file_content).hexdigest()
                
                # MinIO存儲路徑
                minio_path = f"{storage_path}{filename}"
                
                # 上傳到MinIO
                result = minio_client.upload_stream_file(
                    bucket_name=conf["BUCKET_NAME"],
                    file_path=minio_path,
                    stream_data=file_content
                )
                if not result:
                    return f"上傳文件 {filename} 到MinIO失敗", False
                
                # 生成版本ID
                version_id = result.version_id
                
                # 創建MongoDB文件記錄
                file_record = DatasetFiles.create_file_record(
                    file_name=filename,
                    file_path=minio_path,  # 標記所屬數據集
                    file_extension=file_ext,
                    file_size=file_size,
                    current_version_id=version_id,
                    thumbnail_path="",
                )
                
                # 添加版本信息
                file_record.add_version(
                    version_id=version_id,
                    file_size=file_size,
                    created_by=created_by
                )
                
                uploaded_files.append({
                    'filename': filename,
                    'size': file_size,
                    'hash': file_hash,
                    'path': minio_path,
                    'mongo_id': str(file_record.id),
                    'version_id': version_id,
                })
                
                total_size += file_size
            
            return (uploaded_files, total_size), True
            
        except Exception as e:
            logger.error(f"處理文件上傳失敗: {str(e)}")
            traceback.print_exc()
            return f"處理文件上傳失敗: {str(e)}", False

    def download_dataset_files(self, dataset_id, project_id, args):
        """批量下載數據集文件"""
        # 驗證數據集是否存在且屬於該項目
        dataset = self.oper_dataset.get_by_id(dataset_id, project_id)
        if not dataset:
            return "數據集不存在", False
        
        version = args.get("version")
        file_ids = args.get("file_ids", [])
        
        try:
            # 連接MongoDB
            connect_mongodb()
            minio_client = OperMinio()
            
            # 獲取指定版本的文件列表
            query_args = {"version": version}
            result, flag = self.oper_file.get_dataset_files(dataset_id, query_args)
            if not flag:
                return result, flag
            
            download_files = []
            
            # 處理文件列表
            for file_record in result["items"]:
                file_id = file_record[0]
                version_id = file_record[1]
                
                # 如果指定了文件ID列表，只下載指定文件
                if file_ids and file_id not in file_ids:
                    continue
                
                # 從MongoDB獲取文件信息
                mongo_file = DatasetFiles.get_by_id(file_id)
                if not mongo_file:
                    continue
                
                # 生成預簽名URL
                download_url = minio_client.get_filename_url(
                    conf["BUCKET_NAME"], 
                    mongo_file.file_path, 
                    version_id
                )
                
                if download_url:
                    download_files.append({
                        "file_id": file_id,
                        "file_name": mongo_file.file_name,
                        "file_size": mongo_file.file_size,
                        "file_extension": mongo_file.file_extension,
                        "download_url": download_url,
                        "version_id": version_id
                    })
            
            if not download_files:
                return "沒有可下載的文件", False
            
            return {
                "dataset_id": dataset_id,
                "version": version,
                "total_files": len(download_files),
                "files": download_files
            }, True
            
        except Exception as e:
            logger.error(f"生成下載鏈接失敗: {str(e)}")
            return f"生成下載鏈接失敗: {str(e)}", False

    def get_list(self, filters, project_id, page=1, size=10):
        """獲取數據集列表"""
        result, flag = self.oper_dataset.get_list(filters, project_id, page, size)
        if flag:
            datasets = self.schema.dump(result.items, many=True)
            for dataset in datasets:
                print(dataset)
                dataset["file_count"] = self.oper_dataset.get_file_count(dataset["id"], dataset["version"])
            return {
                'datasets': datasets,
                'total_size': result.total,
                'total_page': result.pages
            }, True
        return result, False

    def __search_from_mongo(self, result):
        # 連接MongoDB獲取詳細信息
        connect_mongodb()
        file_list = []
        
        for file_record in result["items"]:
            mongo_file = DatasetFiles.get_by_id(file_record[0])
            if mongo_file:
                file_info = {
                    "id": file_record[0],
                    "file_name": mongo_file.file_name,
                    "file_path": mongo_file.file_path,
                    "file_extension": mongo_file.file_extension,
                    "thumbnail_path": mongo_file.thumbnail_path or "",
                    "file_size": mongo_file.file_size,
                    "current_version_id": file_record[1],
                    "created_at": ""
                }
                file_list.append(file_info)
        return {
            "total_page": result["pages"],
            "total_size": result["total"],
            "file_list": file_list
        }

    def get_dataset_files(self, dataset_id, project_id, args):
        """獲取數據集文件詳情"""
        dataset = self.oper_dataset.get_by_id(dataset_id, project_id)
        if not dataset:
            return "數據集不存在", False
        result, flag = self.oper_file.get_dataset_files(dataset_id, args)
        if flag:
            result = self.__search_from_mongo(result)
            return result, True
        return result, False
    
    def __search_file_url(self, result):
        # 連接MongoDB獲取詳細信息
        connect_mongodb()
        minio_client = OperMinio()
        file_list = []
        
        for file_record in result["items"]:
            mongo_file = DatasetFiles.get_by_id(file_record[0])
            if mongo_file:
                url = minio_client.get_filename_url(
                    conf["BUCKET_NAME"], mongo_file.file_path, file_record[1]
                )
                if mongo_file.thumbnail_path:
                    thumbnail_url = minio_client.get_filename_url(
                        conf["BUCKET_NAME"], mongo_file.thumbnail_path, file_record[1]
                    )
                else:
                    thumbnail_url = url
                file_info = {
                    "id": file_record[0],
                    "file_path": url,
                    "thumbnail_path": thumbnail_url
                }
                file_list.append(file_info)
        return file_list
    
    def get_dataset_files_url(self, dataset_id, project_id, args):
        """獲取數據集文件詳情"""
        dataset = self.oper_dataset.get_by_id(dataset_id, project_id)
        if not dataset:
            return "數據集不存在", False
        result, flag = self.oper_file.get_dataset_files(dataset_id, args)
        if flag:
            result = self.__search_file_url(result)
            return result, True
        return result, False

    def update(self, dataset_id, data, project_id):
        """更新數據集"""
        dataset = self.oper_dataset.get_by_id(dataset_id, project_id)
        if not dataset:
            return "數據集不存在", False
        result, flag = self.oper_dataset.update(dataset, data)
        if flag:
            return DBFunction.do_commit(result, flag)
        return result, flag

    def get_dataset_version_history(self, dataset_id, project_id):
        """獲取數據集版本歷史"""
        # 驗證數據集是否存在且屬於該項目
        dataset = self.oper_dataset.get_by_id(dataset_id, project_id)
        if not dataset:
            return "數據集不存在", False
        
        try:
            # 連接MongoDB
            connect_mongodb()
            
            # 獲取版本歷史記錄
            dataset_history = DatasetHistory.get_by_dataset_id(str(dataset_id))
            if not dataset_history:
                return "數據集版本歷史不存在", False
            
            # 獲取版本歷史列表
            version_history = dataset_history.get_version_history()
            
            # 格式化返回數據
            history_data = {
                "dataset_id": dataset_id,
                "current_version": dataset_history.current_version,
                "total_versions": dataset_history.get_version_count(),
                "version_list": [
                    {
                        "version": v.version,
                        "version_code": v.version_code,
                        "created_by": v.created_by,
                        "created_at": v.created_at.strftime("%Y-%m-%d %H:%M:%S") if v.created_at else ""
                    } for v in version_history
                ]
            }
            
            return history_data, True
            
        except Exception as e:
            logger.error(f"獲取數據集版本歷史失敗: {str(e)}")
            return f"獲取版本歷史失敗: {str(e)}", False
        
    def __get_new_version(self, current_version):
        # 計算新版本號
        version_code = float(current_version.replace('v', '')) if 'v' in current_version else float(current_version)
        new_version_code = version_code + 0.1
        new_version = f"v{new_version_code:.1f}"
        return new_version, new_version_code

    def upload_dataset_files(self, dataset_id, project_id, files, data):
        """上傳數據集文件並更新版本"""
        # 驗證數據集是否存在且屬於該項目
        dataset = self.oper_dataset.get_by_id(dataset_id, project_id)
        if not dataset:
            return "數據集不存在", False
        
        if not files or len(files) == 0:
            return "至少需要上傳一個文件", False
            
        # 驗證文件
        validation_result = self._validate_files(files)
        if validation_result:
            return validation_result, False
            
        try:
            # 連接MongoDB
            connect_mongodb()
            
            # 獲取當前數據集版本歷史
            dataset_history = DatasetHistory.get_by_dataset_id(str(dataset_id))
            if not dataset_history:
                return "數據集版本歷史不存在", False

            new_version, new_version_code = self.__get_new_version(dataset_history.current_version)
            
            # 處理文件上傳
            upload_data = {
                "id": dataset_id,
                "dataset_nm": dataset.dataset_nm,
                "version": new_version
            }
            
            result, flag = self._process_file_upload_for_existing_dataset(
                upload_data, files, data.get("created_by", "admin"), dataset_history
            )
            if not flag:
                return result, flag
            
            # 更新數據集版本
            dataset.version = new_version
            dataset.updated_at = CommonTools.get_now()
            
            # 添加新版本到歷史記錄
            dataset_history.add_new_version(
                version=new_version,
                version_code=new_version_code,
                created_by=data.get("created_by", "admin")
            )
            
            # 創建數據集文件記錄
            uploaded_files, _ = result
            for file_info in uploaded_files:
                file_data = {
                    "file_nm": file_info['filename'],
                    "file_id": file_info['mongo_id'],
                    "file_version_id": file_info["version_id"],
                    "dataset_id": dataset_id,
                    "dataset_version": new_version,
                    "created_by": data.get("created_by", "admin")
                }
                file_obj = self.file_schema.load(self.file_schema.dump(file_data))
                file_result, file_flag = self.oper_file._add_dataset_file_record(file_obj)
                if not file_flag:
                    raise Exception(f"創建數據集文件記錄失敗: {file_result}")
            
            # 提交事務
            result, flag = DBFunction.do_commit("文件上傳成功", True)
            
            if flag:
                return {
                    "dataset_id": dataset_id,
                    "new_version": new_version,
                    "uploaded_files_count": len(uploaded_files)
                }, True
            else:
                raise Exception(f"提交事務失敗: {result}")
                
        except Exception as e:
            # 事務回滾
            DBFunction.db_rollback()
            logger.error(f"上傳數據集文件失敗: {str(e)}")
            return f"上傳文件失敗: {str(e)}", False

    def _process_file_upload_for_existing_dataset(self, data, files, created_by, dataset_history):
        """處理現有數據集的文件上傳"""
        try:
            # 清理數據集名稱用於路徑
            clean_dataset_nm = CommonTools.normalize_string(data['dataset_nm'])
            storage_path = f"datasets/{data['id']}_{clean_dataset_nm}/"
            
            # 初始化MinIO
            minio_client = OperMinio()
            uploaded_files = []
            total_size = 0
            
            # 處理每個文件
            for file in files:
                if file.filename == '':
                    continue
                    
                # 安全文件名
                filename = secure_filename(file.filename)
                file_ext = f".{filename.rsplit('.', 1)[1].lower()}" if '.' in filename else ''
                
                # 讀取文件內容計算哈希
                file.seek(0)
                file_content = file.read()
                file.seek(0)
                
                file_size = len(file_content)
                if file_size > self.max_file_size:
                    return f"文件 {filename} 超過大小限制 ({self.max_file_size/1024/1024}M)", False
                
                file_hash = hashlib.md5(file_content).hexdigest()
                
                # MinIO存儲路徑
                minio_path = f"{storage_path}{filename}"
                
                # 檢查文件是否已存在
                existing_file = DatasetFiles.objects(
                    file_name=filename,
                    file_path=minio_path
                ).first()
                
                # 上傳到MinIO
                result = minio_client.upload_stream_file(
                    bucket_name=conf["BUCKET_NAME"],
                    file_path=minio_path,
                    stream_data=file_content
                )
                if not result:
                    return f"上傳文件 {filename} 到MinIO失敗", False
                
                # 生成版本ID
                version_id = result.version_id
                
                if existing_file:
                    # 文件已存在，更新版本信息
                    existing_file.current_version_id = version_id
                    existing_file.file_size = file_size
                    existing_file.add_version(
                        version_id=version_id,
                        file_size=file_size,
                        created_by=created_by
                    )
                    existing_file.save()
                    mongo_id = str(existing_file.id)
                else:
                    # 新文件，創建記錄
                    file_record = DatasetFiles.create_file_record(
                        file_name=filename,
                        file_path=minio_path,
                        file_extension=file_ext,
                        file_size=file_size,
                        current_version_id=version_id,
                        thumbnail_path="",
                    )
                    
                    # 添加版本信息
                    file_record.add_version(
                        version_id=version_id,
                        file_size=file_size,
                        created_by=created_by
                    )
                    mongo_id = str(file_record.id)
                
                uploaded_files.append({
                    'filename': filename,
                    'size': file_size,
                    'hash': file_hash,
                    'path': minio_path,
                    'mongo_id': mongo_id,
                    'version_id': version_id,
                })
                
                total_size += file_size
            
            return (uploaded_files, total_size), True
            
        except Exception as e:
            logger.error(f"處理文件上傳失敗: {str(e)}")
            traceback.print_exc()
            return f"處理文件上傳失敗: {str(e)}", False

    def download_dataset_files(self, dataset_id, project_id, args):
        """批量下載數據集文件"""
        # 驗證數據集是否存在且屬於該項目
        dataset = self.oper_dataset.get_by_id(dataset_id, project_id)
        if not dataset:
            return "數據集不存在", False
        
        version = args.get("version")
        file_ids = args.get("file_ids", [])
        
        try:
            # 連接MongoDB
            connect_mongodb()
            minio_client = OperMinio()
            
            # 獲取指定版本的文件列表
            query_args = {"version": version}
            result, flag = self.oper_file.get_dataset_files(dataset_id, query_args)
            if not flag:
                return result, flag
            
            download_files = []
            
            # 處理文件列表
            for file_record in result["items"]:
                file_id = file_record[0]
                version_id = file_record[1]
                
                # 如果指定了文件ID列表，只下載指定文件
                if file_ids and file_id not in file_ids:
                    continue
                
                # 從MongoDB獲取文件信息
                mongo_file = DatasetFiles.get_by_id(file_id)
                if not mongo_file:
                    continue
                
                # 生成預簽名URL
                download_url = minio_client.get_filename_url(
                    conf["BUCKET_NAME"], 
                    mongo_file.file_path, 
                    version_id
                )
                
                if download_url:
                    download_files.append({
                        "file_id": file_id,
                        "file_name": mongo_file.file_name,
                        "file_size": mongo_file.file_size,
                        "file_extension": mongo_file.file_extension,
                        "download_url": download_url,
                        "version_id": version_id
                    })
            
            if not download_files:
                return "沒有可下載的文件", False
            
            return {
                "dataset_id": dataset_id,
                "version": version,
                "total_files": len(download_files),
                "files": download_files
            }, True
            
        except Exception as e:
            logger.error(f"生成下載鏈接失敗: {str(e)}")
            return f"生成下載鏈接失敗: {str(e)}", False
