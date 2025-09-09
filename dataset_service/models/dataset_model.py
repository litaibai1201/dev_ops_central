# -*- coding: utf-8 -*-
"""
@文件: dataset_model.py
@說明: 數據集模型操作
@時間: 2025-08-08
@作者: LiDong
"""

from sqlalchemy import and_, func
from sqlalchemy.orm import load_only
from common.common_tools import CommonTools, TryExcept
from dbs.mysql_db import db
from dbs.mysql_db.model_tables import DatasetModel, DatasetFileModel, ProjectDatasetModel


class OperDatasetModel:
    """数据集模型操作类 (优化版本)"""
    
    def __init__(self):
        self.model = DatasetModel
    
    @TryExcept("新增數據集失敗")
    def add(self, data):
        # 添加数据验证
        if not data.dataset_nm or not data.dataset_nm.strip():
            raise ValueError("數據集名稱不能為空")
        
        # 检查重名
        existing = self.model.query.filter_by(dataset_nm=data.dataset_nm.strip()).first()
        if existing and existing.status == 1:
            raise ValueError(f"數據集名稱 '{data.dataset_nm}' 已存在")
            
        db.session.add(data)
        return True

    def get_by_id(self, dataset_id, project_id):
        """根据ID和项目ID获取数据集 (优化版本)"""
        return self.model.query.join(
            ProjectDatasetModel, self.model.id == ProjectDatasetModel.dataset_id
        ).filter(
            and_(
                self.model.id == dataset_id, 
                self.model.status == 1,
                ProjectDatasetModel.status == 1,
                ProjectDatasetModel.project_id == project_id
            )
        ).options(
            # 只加载需要的字段，提高查询性能
            load_only(self.model.id, self.model.dataset_nm, self.model.description, 
                     self.model.version, self.model.created_by, self.model.created_at)
        ).first()
    
    @TryExcept("獲取數據集列表失敗")
    def get_list(self, filters, project_id, page=1, size=10):
        load_fields = load_only(
            self.model.id, self.model.dataset_nm, self.model.description, 
            self.model.version, self.model.created_by, self.model.created_at
        )
        query = self.model.query.options(load_fields).join(
            ProjectDatasetModel, self.model.id == ProjectDatasetModel.dataset_id
        ).filter(
            and_(
                self.model.status == 1,
                ProjectDatasetModel.status == 1,
                ProjectDatasetModel.project_id == project_id
            )
        )
        
        if filters:
            if filters.get('keyword'):
                query = query.filter(self.model.dataset_nm.like(f"%{filters['keyword']}%"))
            if filters.get('created_by'):
                query = query.filter(self.model.created_by == filters['created_by'])
        
        return query.paginate(
            page=page, per_page=size, error_out=False
        )
    
    @TryExcept("更新數據集失敗")
    def update(self, dataset, data):
        if 'dataset_nm' in data:
            dataset.dataset_nm = data['dataset_nm']
        if 'description' in data:
            dataset.description = data['description']
        if 'created_by' in data:
            dataset.created_by = data['created_by']
        if 'status' in data:
            dataset.status = data['status']
            dataset.status_update_at = CommonTools.get_now()
        
        dataset.updated_at = CommonTools.get_now()
        return True
    
    def get_file_count(self, dataset_id, dataset_version):
        """獲取數據集的文件數量"""
        try:
            return DatasetFileModel.query.filter(
                and_(
                    DatasetFileModel.dataset_id == dataset_id, 
                    DatasetFileModel.status == 1,
                    DatasetFileModel.dataset_version == dataset_version
                )
            ).count()
        except Exception:
            return 0
        
class OperProjectDatasetModel:
    def __init__(self):
        self.model = DatasetModel
    
    @TryExcept("新增項目數據集關聯失敗")
    def _add_project_dataset_relation(self, data):
        db.session.add(data)
        return True
    
    
class OperDatasetFileModel:
    def __init__(self):
        self.model = DatasetFileModel
    
    @TryExcept("新增數據集文件記錄失敗")  
    def _add_dataset_file_record(self, data):
        db.session.add(data)
        return True

    @TryExcept("獲取數據集文件列表失敗")
    def get_dataset_files(self, dataset_id, args):
        """获取数据集的文件详情"""
        page = args.get('page', 1)
        size = args.get('size', 10)
        version = args.get("version")
        # 按 dataset_version 倒序排序，然后根据 file_id, dataset_id 去重
        subquery = db.session.query(
            self.model.dataset_id,
            self.model.file_id,
            func.max(self.model.dataset_version).label('max_version')
        ).filter(
            self.model.dataset_id == dataset_id,
            self.model.dataset_version <= version
        ).group_by(self.model.dataset_id, self.model.file_id).subquery()
        
        query = db.session.query(
            self.model.file_id, self.model.file_version_id
        ).join(
            subquery, 
            and_(
                self.model.dataset_id == subquery.c.dataset_id,
                self.model.file_id == subquery.c.file_id,
                self.model.dataset_version == subquery.c.max_version
            )
        ).order_by(self.model.dataset_version.desc())
        
        # 分页处理
        result = query.slice((page-1)*size, page*size).all()
        total_count = query.count()

        return {
            "items":result,
            "pages": CommonTools.get_total_page(size, total_count),
            "total": total_count
        }