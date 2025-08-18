# -*- coding: utf-8 -*-
"""
@文件: dataset_history.py
@說明: 數據集版本歷史ORM模型
@時間: 2025-08-08
@作者: LiDong
"""

from datetime import datetime
from mongoengine import (
    Document, 
    StringField, 
    FloatField,
    DateTimeField,
    EmbeddedDocument,
    EmbeddedDocumentListField
)


class VersionInfo(EmbeddedDocument):
    """
    版本信息嵌套文檔
    """
    version = StringField(max_length=20, required=True, help_text="版本號")
    version_code = FloatField(required=True, help_text="版本代碼")
    created_by = StringField(max_length=16, help_text="創建人")
    created_at = DateTimeField(default=datetime.utcnow, help_text="創建時間")


class DatasetHistory(Document):
    """
    數據集版本歷史模型
    """
    meta = {
        'collection': 'dataset_history',
        'indexes': [
            'dataset_id',
            'current_version',
            'created_at',
            ('dataset_id', 'current_version')
        ]
    }
    
    # 數據集業務ID
    dataset_id = StringField(max_length=50, required=True, help_text="數據集ID")
    
    # 當前版本
    current_version = StringField(max_length=20, required=True, help_text="當前版本")
    
    # 版本列表
    version_list = EmbeddedDocumentListField(VersionInfo, help_text="版本列表")
    
    # 創建時間
    created_at = DateTimeField(default=datetime.utcnow, help_text="創建時間")
    
    # 更新時間
    updated_at = DateTimeField(default=datetime.utcnow, help_text="更新時間")
    
    def save(self, *args, **kwargs):
        """
        重寫保存方法，自動更新時間
        """
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    @classmethod
    def create_dataset_history(cls, dataset_id: str, initial_version: str = "v1.0",
                             initial_version_code: float = 1.0, created_by: str = None):
        """
        創建數據集歷史記錄
        """
        initial_version_info = VersionInfo(
            version=initial_version,
            version_code=initial_version_code,
            created_by=created_by
        )
        
        history = cls(
            dataset_id=dataset_id,
            current_version=initial_version,
            version_list=[initial_version_info]
        )
        return history.save()
    
    def add_new_version(self, version: str, version_code: float, created_by: str = None):
        """
        添加新版本
        """
        # 檢查版本是否已存在
        if self.get_version_info(version):
            raise ValueError(f"版本 {version} 已存在")
        
        new_version = VersionInfo(
            version=version,
            version_code=version_code,
            created_by=created_by
        )
        
        self.version_list.append(new_version)
        self.current_version = version
        return self.save()
    
    def get_version_info(self, version: str):
        """
        獲取指定版本信息
        """
        for version_info in self.version_list:
            if version_info.version == version:
                return version_info
        return None
    
    def get_latest_version(self):
        """
        獲取最新版本信息
        """
        if self.version_list:
            return max(self.version_list, key=lambda v: v.version_code)
        return None
    
    def get_version_history(self):
        """
        獲取版本歷史，按版本代碼排序
        """
        return sorted(self.version_list, key=lambda v: v.version_code, reverse=True)
    
    def update_current_version(self, version: str):
        """
        更新當前版本
        """
        version_info = self.get_version_info(version)
        if not version_info:
            raise ValueError(f"版本 {version} 不存在")
        
        self.current_version = version
        return self.save()
    
    @classmethod
    def get_by_dataset_id(cls, dataset_id: str):
        """
        根據數據集ID獲取歷史記錄
        """
        return cls.objects(dataset_id=dataset_id).first()
    
    @classmethod
    def get_datasets_by_version_count(cls, min_versions: int = 1):
        """
        獲取版本數量大於等於指定數量的數據集
        """
        pipeline = [
            {
                "$match": {
                    "$expr": {
                        "$gte": [{"$size": "$version_list"}, min_versions]
                    }
                }
            }
        ]
        return list(cls.objects.aggregate(pipeline))
    
    def get_version_count(self):
        """
        獲取版本總數
        """
        return len(self.version_list)
    
    def to_dict(self):
        """
        轉換為字典
        """
        return {
            'id': str(self.id),
            'dataset_id': self.dataset_id,
            'current_version': self.current_version,
            'version_list': [
                {
                    'version': v.version,
                    'version_code': v.version_code,
                    'created_by': v.created_by,
                    'created_at': v.created_at
                } for v in self.version_list
            ],
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }