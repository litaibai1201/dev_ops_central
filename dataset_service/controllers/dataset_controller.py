# -*- coding: utf-8 -*-
"""
@文件: dataset_controller.py
@說明: 數據集控制器 (重构优化版本)
@時間: 2025-08-08
@作者: LiDong
"""

import hashlib
import traceback
from werkzeug.utils import secure_filename
from typing import Tuple, List, Dict, Any, Optional

from common.common_minio import OperMinio
from dbs.mongodb import DatasetFiles, DatasetHistory, connect_mongodb
from models.dataset_model import OperDatasetModel, OperDatasetFileModel, OperProjectDatasetModel
from serializes.model_serialize import DatasetModelSchema, DatasetFileModelSchema, ProjectDatasetModelSchema
from common.common_tools import CommonTools
from dbs.mysql_db import DBFunction
from configs.constant import conf
from loggers import logger


class DatasetController:
    """數據集控制器 (重构优化版本)"""
    
    # 类级别的单例缓存
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatasetController, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        # 避免重复初始化
        if DatasetController._initialized:
            return
            
        self.oper_dataset = OperDatasetModel()
        self.oper_file = OperDatasetFileModel()
        self.oper_projectdataset = OperProjectDatasetModel()
        self.schema = DatasetModelSchema()
        self.file_schema = DatasetFileModelSchema()
        self.project_dataset_schema = ProjectDatasetModelSchema()
        self.allowed_extensions = conf["ALLOWED_EXTENTSIONS"]
        self.max_file_size = conf["MAX_FILE_SIZE"]
        
        # 初始化缓存
        self._minio_client = None
        self._mongo_connected = False
        
        DatasetController._initialized = True

    # ==================== 公共验证和初始化方法 ====================
    
    def _validate_dataset_access(self, dataset_id: int, project_id: int) -> Tuple[Any, bool]:
        """验证数据集是否存在且属于指定项目"""
        dataset = self.oper_dataset.get_by_id(dataset_id, project_id)
        if not dataset:
            return "數據集不存在", False
        return dataset, True
    
    def _ensure_mongo_connection(self) -> None:
        """确保MongoDB连接"""
        if not self._mongo_connected:
            connect_mongodb()
            self._mongo_connected = True
    
    def _get_minio_client(self) -> OperMinio:
        """获取MinIO客户端(单例模式)"""
        if self._minio_client is None:
            self._minio_client = OperMinio()
        return self._minio_client
    
    def _validate_files(self, files: List) -> Optional[str]:
        """验证上传文件 (增强版本)"""
        if not files or len(files) == 0:
            return "至少需要上傳一個文件"
            
        total_size = 0
        for file in files:
            if not file.filename:
                continue  # 跳过空文件名，后续处理
            
            # 检查文件扩展名
            file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
            if file_ext not in self.allowed_extensions:
                return f"不支持的文件類型: {file_ext}。支持的類型: {', '.join(self.allowed_extensions)}"
            
            # 估算文件大小(如果可能)
            file.seek(0, 2)  # 移动到文件末尾
            file_size = file.tell()
            file.seek(0)  # 重置位置
            
            if file_size > self.max_file_size:
                return f"文件 {file.filename} 超過大小限制 ({self.max_file_size // 1024 // 1024}MB)"
            
            total_size += file_size
        
        # 检查总大小(批量上传限制)
        max_total_size = self.max_file_size * 10  # 10倍单文件限制
        if total_size > max_total_size:
            return f"批量上傳總大小超出限制 ({max_total_size // 1024 // 1024}MB)"
        
        return None
    
    def _calculate_new_version(self, current_version: str) -> Tuple[str, float]:
        """计算新版本号 - 使用整数运算避免浮点精度问题"""
        version_str = current_version.replace('v', '') if 'v' in current_version else current_version
        
        # 将版本号转换为整数运算(乘以10)避免浮点精度问题
        current_version_int = int(float(version_str) * 10)
        new_version_int = current_version_int + 1  # 增加0.1版本 = 整数+1
        new_version_code = new_version_int / 10.0  # 转回浮点数
        
        # 确保精确到一位小数
        new_version_code = round(new_version_code, 1)
        new_version = f"v{new_version_code:.1f}"
        
        return new_version, new_version_code

    # ==================== 文件处理核心方法 ====================
    
    def _process_single_file(self, file, storage_path: str, created_by: str, is_existing_dataset: bool = False) -> Tuple[Dict, bool]:
        """处理单个文件上传的核心逻辑"""
        if not file.filename:
            return {}, True  # 跳过空文件名
            
        try:
            # 文件基本信息处理
            filename = secure_filename(file.filename)
            file_ext = f".{filename.rsplit('.', 1)[1].lower()}" if '.' in filename else ''
            
            # 读取文件内容
            file.seek(0)
            file_content = file.read()
            file.seek(0)
            
            file_size = len(file_content)
            if file_size > self.max_file_size:
                return {}, False, f"文件 {filename} 超過大小限制 ({self.max_file_size/1024/1024}M)"
            
            file_hash = hashlib.md5(file_content).hexdigest()
            minio_path = f"{storage_path}{filename}"
            
            # 上传到MinIO
            minio_client = self._get_minio_client()
            upload_result = minio_client.upload_stream_file(
                bucket_name=conf["BUCKET_NAME"],
                file_path=minio_path,
                stream_data=file_content
            )
            if not upload_result:
                return {}, False, f"上傳文件 {filename} 到MinIO失敗"
            
            version_id = upload_result.version_id
            
            # 处理MongoDB文件记录
            mongo_id = self._handle_mongo_file_record(
                filename, minio_path, file_ext, file_size, version_id, created_by, is_existing_dataset
            )
            
            return {
                'filename': filename,
                'size': file_size,
                'hash': file_hash,
                'path': minio_path,
                'mongo_id': mongo_id,
                'version_id': version_id,
            }, True, None
            
        except Exception as e:
            logger.error(f"處理文件 {file.filename} 失敗: {str(e)}")
            return {}, False, f"處理文件失敗: {str(e)}"
    
    def _handle_mongo_file_record(self, filename: str, minio_path: str, file_ext: str, 
                                file_size: int, version_id: str, created_by: str, 
                                is_existing_dataset: bool = False) -> str:
        """处理MongoDB文件记录"""
        self._ensure_mongo_connection()
        
        if is_existing_dataset:
            # 检查文件是否已存在
            existing_file = DatasetFiles.objects(
                file_name=filename,
                file_path=minio_path
            ).first()
            
            if existing_file:
                # 更新现有文件版本
                existing_file.current_version_id = version_id
                existing_file.file_size = file_size
                existing_file.add_version(
                    version_id=version_id,
                    file_size=file_size,
                    created_by=created_by
                )
                existing_file.save()
                return str(existing_file.id)
        
        # 创建新文件记录
        file_record = DatasetFiles.create_file_record(
            file_name=filename,
            file_path=minio_path,
            file_extension=file_ext,
            file_size=file_size,
            current_version_id=version_id,
            thumbnail_path="",
        )
        
        file_record.add_version(
            version_id=version_id,
            file_size=file_size,
            created_by=created_by
        )
        
        return str(file_record.id)
    
    def _create_dataset_file_records(self, uploaded_files: List[Dict], dataset_id: int, 
                                   dataset_version: str, created_by: str) -> None:
        """批量创建数据集文件记录"""
        for file_info in uploaded_files:
            file_data = {
                "file_nm": file_info['filename'],
                "file_id": file_info['mongo_id'],
                "file_version_id": file_info["version_id"],
                "dataset_id": dataset_id,
                "dataset_version": dataset_version,
                "created_by": created_by
            }
            file_obj = self.file_schema.load(self.file_schema.dump(file_data))
            result, flag = self.oper_file._add_dataset_file_record(file_obj)
            if not flag:
                raise Exception(f"創建數據集文件記錄失敗: {result}")

    # ==================== 事务处理装饰器 ====================
    
    def _execute_with_transaction(self, operation_func, operation_name: str, *args, **kwargs):
        """事务执行装饰器"""
        try:
            result = operation_func(*args, **kwargs)
            commit_result, commit_flag = DBFunction.do_commit(f"{operation_name}成功", True)
            if commit_flag:
                return result, True
            else:
                raise Exception(f"提交事務失敗: {commit_result}")
        except Exception as e:
            DBFunction.db_rollback()
            logger.error(f"{operation_name}失敗: {str(e)}")
            return f"{operation_name}失敗: {str(e)}", False

    # ==================== 主要业务方法 ====================
    
    def create(self, data: Dict, files: List, project_id: int) -> Tuple[Any, bool]:
        """創建數據集"""
        # 验证文件
        validation_error = self._validate_files(files)
        if validation_error:
            return validation_error, False
        
        def _create_operation():
            data["id"] = CommonTools.get_timestmp()
            data['version'] = "v1.0"
            
            # 处理文件上传
            result, flag, error = self._process_files_upload(data, files, data.get("created_by"))
            if not flag:
                raise Exception(error or result)
            
            data["files_info"] = result
            
            # 1. 创建项目与数据集关联
            self._create_project_dataset_relation(project_id, data["id"], data.get("created_by"))
            
            # 2. 创建数据集记录
            dataset_obj = self.schema.load(self.schema.dump(data))
            dataset_result, dataset_flag = self.oper_dataset.add(dataset_obj)
            if not dataset_flag:
                raise Exception(f"創建數據集失敗: {dataset_result}")
            
            # 3. 创建数据集文件记录
            uploaded_files, _ = data["files_info"]
            self._create_dataset_file_records(uploaded_files, data['id'], data['version'], data.get("created_by"))
            
            return data["id"]
        
        return self._execute_with_transaction(_create_operation, "數據集創建")
    
    def _create_project_dataset_relation(self, project_id: int, dataset_id: int, created_by: str) -> None:
        """创建项目数据集关联"""
        project_dataset_data = {
            "project_id": project_id,
            "dataset_id": dataset_id,
            "created_by": created_by
        }
        project_dataset_obj = self.project_dataset_schema.load(
            self.project_dataset_schema.dump(project_dataset_data)
        )
        result, flag = self.oper_projectdataset._add_project_dataset_relation(project_dataset_obj)
        if not flag:
            raise Exception(f"創建項目數據集關聯失敗: {result}")
    
    def _process_files_upload(self, data: Dict, files: List, created_by: str, 
                            is_existing_dataset: bool = False) -> Tuple[Any, bool, Optional[str]]:
        """统一的文件上传处理方法"""
        try:
            clean_dataset_nm = CommonTools.normalize_string(data['dataset_nm'])
            storage_path = f"datasets/{data['id']}_{clean_dataset_nm}/"
            
            uploaded_files = []
            total_size = 0
            
            # 处理版本历史(仅新数据集需要)
            if not is_existing_dataset:
                self._ensure_mongo_connection()
                # 确保初始版本号精度正确
                initial_version_str = data["version"].replace('v', '')
                initial_version_code = round(float(initial_version_str), 1)
                
                DatasetHistory.create_dataset_history(
                    dataset_id=str(data['id']),
                    initial_version=data["version"],
                    initial_version_code=initial_version_code,
                    created_by=created_by
                )
            
            # 处理每个文件
            for file in files:
                file_info, success, error = self._process_single_file(
                    file, storage_path, created_by, is_existing_dataset
                )
                if not success:
                    return None, False, error
                if file_info:  # 非空文件名的文件
                    uploaded_files.append(file_info)
                    total_size += file_info['size']
            
            return (uploaded_files, total_size), True, None
            
        except Exception as e:
            logger.error(f"處理文件上傳失敗: {str(e)}")
            traceback.print_exc()
            return None, False, f"處理文件上傳失敗: {str(e)}"

    def upload_dataset_files(self, dataset_id: int, project_id: int, files: List, data: Dict) -> Tuple[Any, bool]:
        """上傳數據集文件並更新版本"""
        # 验证数据集访问权限
        dataset, access_valid = self._validate_dataset_access(dataset_id, project_id)
        if not access_valid:
            return dataset, False
        
        # 验证文件
        validation_error = self._validate_files(files)
        if validation_error:
            return validation_error, False
        
        def _upload_operation():
            self._ensure_mongo_connection()
            
            # 获取版本历史并计算新版本
            dataset_history = DatasetHistory.get_by_dataset_id(str(dataset_id))
            if not dataset_history:
                raise Exception("數據集版本歷史不存在")
            
            new_version, new_version_code = self._calculate_new_version(dataset_history.current_version)
            
            # 准备上传数据
            upload_data = {
                "id": dataset_id,
                "dataset_nm": dataset.dataset_nm,
                "version": new_version
            }
            
            # 处理文件上传
            result, flag, error = self._process_files_upload(
                upload_data, files, data.get("created_by", "admin"), is_existing_dataset=True
            )
            if not flag:
                raise Exception(error or result)
            
            # 更新数据集版本
            dataset.version = new_version
            dataset.updated_at = CommonTools.get_now()
            
            # 添加新版本到历史记录
            dataset_history.add_new_version(
                version=new_version,
                version_code=new_version_code,
                created_by=data.get("created_by", "admin")
            )
            
            # 创建数据集文件记录
            uploaded_files, _ = result
            self._create_dataset_file_records(
                uploaded_files, dataset_id, new_version, data.get("created_by", "admin")
            )
            
            return {
                "dataset_id": dataset_id,
                "new_version": new_version,
                "uploaded_files_count": len(uploaded_files)
            }
        
        return self._execute_with_transaction(_upload_operation, "文件上傳")

    # ==================== 查询方法 ====================
    
    def get_list(self, filters: Dict, project_id: int, page: int = 1, size: int = 10) -> Tuple[Any, bool]:
        """獲取數據集列表"""
        result, flag = self.oper_dataset.get_list(filters, project_id, page, size)
        if flag:
            datasets = self.schema.dump(result.items, many=True)
            for dataset in datasets:
                dataset["file_count"] = self.oper_dataset.get_file_count(dataset["id"], dataset["version"])
            return {
                'datasets': datasets,
                'total_size': result.total,
                'total_page': result.pages
            }, True
        return result, False
    
    def get_dataset_files(self, dataset_id: int, project_id: int, args: Dict) -> Tuple[Any, bool]:
        """獲取數據集文件詳情"""
        dataset, access_valid = self._validate_dataset_access(dataset_id, project_id)
        if not access_valid:
            return dataset, False
            
        result, flag = self.oper_file.get_dataset_files(dataset_id, args)
        if flag:
            result = self._format_file_details(result)
            return result, True
        return result, False
    
    def get_dataset_files_url(self, dataset_id: int, project_id: int, args: Dict) -> Tuple[Any, bool]:
        """獲取數據集文件URL"""
        dataset, access_valid = self._validate_dataset_access(dataset_id, project_id)
        if not access_valid:
            return dataset, False
            
        result, flag = self.oper_file.get_dataset_files(dataset_id, args)
        if flag:
            result = self._format_file_urls(result)
            return result, True
        return result, False
    
    def _format_file_details(self, result: Dict) -> Dict:
        """格式化文件详情"""
        self._ensure_mongo_connection()
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
    
    def _format_file_urls(self, result: Dict) -> List[Dict]:
        """格式化文件URL列表"""
        self._ensure_mongo_connection()
        minio_client = self._get_minio_client()
        file_list = []
        
        for file_record in result["items"]:
            mongo_file = DatasetFiles.get_by_id(file_record[0])
            if mongo_file:
                url = minio_client.get_filename_url(
                    conf["BUCKET_NAME"], mongo_file.file_path, file_record[1]
                )
                thumbnail_url = url
                if mongo_file.thumbnail_path:
                    thumbnail_url = minio_client.get_filename_url(
                        conf["BUCKET_NAME"], mongo_file.thumbnail_path, file_record[1]
                    )
                
                file_info = {
                    "id": file_record[0],
                    "file_path": url,
                    "thumbnail_path": thumbnail_url
                }
                file_list.append(file_info)
        
        return file_list
    
    # def download_dataset_files(self, project_id: int, args: Dict) -> Tuple[Any, bool]:
    #     """批量下載數據集文件"""

    #     dataset_list = args.get("dataset_list", [])
    #     for dataset in dataset_list:
    #     dataset, access_valid = self._validate_dataset_access(dataset_id, project_id)
    #     if not access_valid:
    #         return dataset, False
        
    #     version = args.get("version")
    #     file_ids = args.get("file_ids", [])
        
    #     try:
    #         self._ensure_mongo_connection()
    #         minio_client = self._get_minio_client()
            
    #         # 获取指定版本的文件列表
    #         query_args = {"version": version}
    #         result, flag = self.oper_file.get_dataset_files(dataset_id, query_args)
    #         if not flag:
    #             return result, flag
            
    #         download_files = []
            
    #         # 处理文件列表
    #         for file_record in result["items"]:
    #             file_id = file_record[0]
    #             version_id = file_record[1]
                
    #             # 如果指定了文件ID列表，只下载指定文件
    #             if file_ids and file_id not in file_ids:
    #                 continue
                
    #             # 从MongoDB获取文件信息
    #             mongo_file = DatasetFiles.get_by_id(file_id)
    #             if not mongo_file:
    #                 continue
                
    #             # 生成预签名URL
    #             download_url = minio_client.get_filename_url(
    #                 conf["BUCKET_NAME"], 
    #                 mongo_file.file_path, 
    #                 version_id
    #             )
                
    #             if download_url:
    #                 download_files.append({
    #                     "file_id": file_id,
    #                     "file_name": mongo_file.file_name,
    #                     "file_size": mongo_file.file_size,
    #                     "file_extension": mongo_file.file_extension,
    #                     "download_url": download_url,
    #                     "version_id": version_id
    #                 })
            
    #         if not download_files:
    #             return "沒有可下載的文件", False
            
    #         return {
    #             "dataset_id": dataset_id,
    #             "version": version,
    #             "total_files": len(download_files),
    #             "files": download_files
    #         }, True
            
    #     except Exception as e:
    #         logger.error(f"生成下載鏈接失敗: {str(e)}")
    #         return f"生成下載鏈接失敗: {str(e)}", False
    
    def get_dataset_version_history(self, dataset_id: int, project_id: int) -> Tuple[Any, bool]:
        """獲取數據集版本歷史"""
        dataset, access_valid = self._validate_dataset_access(dataset_id, project_id)
        if not access_valid:
            return dataset, False
        
        try:
            self._ensure_mongo_connection()
            
            dataset_history = DatasetHistory.get_by_dataset_id(str(dataset_id))
            if not dataset_history:
                return "數據集版本歷史不存在", False
            
            version_history = dataset_history.get_version_history()
            
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
    
    def update(self, dataset_id: int, data: Dict, project_id: int) -> Tuple[Any, bool]:
        """更新數據集"""
        dataset, access_valid = self._validate_dataset_access(dataset_id, project_id)
        if not access_valid:
            return dataset, False
            
        result, flag = self.oper_dataset.update(dataset, data)
        if flag:
            return DBFunction.do_commit(result, flag)
        return result, flag