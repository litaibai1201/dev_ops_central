# -*- coding: utf-8 -*-
"""
@文件: dataset_files.py
@說明: 數據集文件ORM模型
@時間: 2025-08-08
@作者: LiDong
"""

from datetime import datetime
from mongoengine import (
    Document, 
    StringField, 
    IntField,
    LongField,
    DateTimeField,
    ListField,
    EmbeddedDocument,
    EmbeddedDocumentListField
)


class FileVersion(EmbeddedDocument):
    """
    文件版本嵌套文檔
    """
    version_id = StringField(max_length=36, required=True, help_text="版本ID")
    file_size = LongField(required=True, help_text="文件大小")
    created_by = StringField(max_length=16, help_text="創建人")
    created_at = DateTimeField(default=datetime.utcnow, help_text="創建時間")


class DatasetFiles(Document):
    """
    數據集文件模型
    """
    meta = {
        'collection': 'dataset_files',
        'indexes': [
            'file_name',
            'file_path',
            'current_version_id',
            'created_at',
            'status'
        ]
    }
    
    # 文件名
    file_name = StringField(max_length=255, required=True, help_text="文件名")
    
    # 文件路徑
    file_path = StringField(max_length=500, required=True, help_text="文件路徑")
    
    # 文件擴展名
    file_extension = StringField(max_length=10, required=True, help_text="文件擴展名")
    
    # 文件大小
    file_size = LongField(required=True, help_text="文件大小")
    
    # 當前版本ID
    current_version_id = StringField(max_length=36, help_text="當前版本ID")
    
    # 縮略圖路徑
    thumbnail_path = StringField(max_length=500, help_text="縮略圖路徑")
    
    # 圖片類型(僅當file_extension為圖片格式時存儲)
    img_type = StringField(max_length=20, help_text="圖片類型")
    
    # 版本列表
    versions = EmbeddedDocumentListField(FileVersion, help_text="版本列表")
    
    # 狀態 (1:正常, 0:已刪除)
    status = IntField(default=1, choices=[0, 1], help_text="狀態")
    
    # 創建時間
    created_at = DateTimeField(default=datetime.utcnow, help_text="創建時間")
    
    # 更新時間
    updated_at = DateTimeField(default=datetime.utcnow, help_text="更新時間")
    
    # 狀態更新時間
    status_updated_at = DateTimeField(default=datetime.utcnow, help_text="狀態更新時間")
    
    def save(self, *args, **kwargs):
        """
        重寫保存方法，自動更新時間
        """
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def clean(self):
        """
        數據驗證和清理
        """
        # 根據文件擴展名決定是否需要img_type字段
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
        if self.file_extension.lower() in image_extensions:
            if not self.img_type:
                self.img_type = self.file_extension.lower().replace('.', '')
        else:
            self.img_type = None
    
    @classmethod
    def create_file_record(cls, file_name: str, file_path: str, 
                         file_extension: str, file_size: int,
                         current_version_id: str = None, thumbnail_path: str = None,
                         **kwargs):
        """
        創建文件記錄
        """
        file_record = cls(
            file_name=file_name,
            file_path=file_path,
            file_extension=file_extension,
            file_size=file_size,
            current_version_id=current_version_id,
            thumbnail_path=thumbnail_path,
            **kwargs
        )
        file_record.clean()
        return file_record.save()
    
    def add_version(self, version_id: str, file_size: int, created_by: str = None):
        """
        添加新版本
        """
        version = FileVersion(
            version_id=version_id,
            file_size=file_size,
            created_by=created_by
        )
        self.versions.append(version)
        self.current_version_id = version_id
        self.file_size = file_size
        return self.save()
    
    def get_version(self, version_id: str):
        """
        獲取指定版本
        """
        for version in self.versions:
            if version.version_id == version_id:
                return version
        return None
    
    def get_latest_version(self):
        """
        獲取最新版本
        """
        if self.versions:
            return max(self.versions, key=lambda v: v.created_at)
        return None
    
    def update_status(self, status: int):
        """
        更新狀態
        """
        self.status = status
        self.status_updated_at = datetime.utcnow()
        return self.save()
    
    @classmethod
    def get_files_by_status(cls, status: int = 1, limit: int = 100, skip: int = 0):
        """
        根據狀態獲取文件列表
        """
        return cls.objects(status=status).order_by('-created_at').skip(skip).limit(limit)
    
    @classmethod
    def search_files_by_name(cls, file_name: str, status: int = 1):
        """
        根據文件名搜索
        """
        return cls.objects(file_name__icontains=file_name, status=status)
    
    @classmethod
    def get_by_id(cls, file_id: str):
        """
        根據ID獲取文件記錄
        """
        try:
            return cls.objects(id=file_id, status=1).first()
        except Exception:
            return None
    
    def to_dict(self):
        """
        轉換為字典
        """
        return {
            'id': str(self.id),
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_extension': self.file_extension,
            'file_size': self.file_size,
            'current_version_id': self.current_version_id,
            'thumbnail_path': self.thumbnail_path,
            'img_type': self.img_type,
            'versions': [
                {
                    'version_id': v.version_id,
                    'file_size': v.file_size,
                    'created_by': v.created_by,
                    'created_at': v.created_at
                } for v in self.versions
            ],
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'status_updated_at': self.status_updated_at
        }