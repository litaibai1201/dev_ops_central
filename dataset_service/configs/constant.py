# -*- coding: utf-8 -*-
"""
@文件: constant.py
@說明: 常量配置 (优化版本)
@時間: 2023/10/19 19:03:05
@作者: LiDong
"""
import os


class Config:
    """配置管理类 - 支持环境变量覆盖"""
    
    # 存储桶配置
    BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "automl")
    
    # 支持的文件类型
    ALLOWED_EXTENTSIONS = {
        'txt', 'csv', 'json', 'xlsx', 'xls', 'parquet', 
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
        'pdf', 'doc', 'docx', 'zip', 'tar', 'gz'
    }
    
    # 文件大小限制 (默认100MB)
    MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 100 * 1024 * 1024))
    
    # 批量上传限制 (默认1GB)  
    MAX_BATCH_SIZE = int(os.getenv("MAX_BATCH_SIZE", 1024 * 1024 * 1024))
    
    # 数据集名称最大长度
    MAX_DATASET_NAME_LENGTH = int(os.getenv("MAX_DATASET_NAME_LENGTH", 100))
    
    # 描述最大长度
    MAX_DESCRIPTION_LENGTH = int(os.getenv("MAX_DESCRIPTION_LENGTH", 500))
    
    # 分页默认配置
    DEFAULT_PAGE_SIZE = int(os.getenv("DEFAULT_PAGE_SIZE", 10))
    MAX_PAGE_SIZE = int(os.getenv("MAX_PAGE_SIZE", 100))


# 向后兼容
conf = {
    "BUCKET_NAME": Config.BUCKET_NAME,
    "ALLOWED_EXTENTSIONS": Config.ALLOWED_EXTENTSIONS,
    "MAX_FILE_SIZE": Config.MAX_FILE_SIZE,
    "MAX_BATCH_SIZE": Config.MAX_BATCH_SIZE,
    "MAX_DATASET_NAME_LENGTH": Config.MAX_DATASET_NAME_LENGTH,
    "MAX_DESCRIPTION_LENGTH": Config.MAX_DESCRIPTION_LENGTH,
    "DEFAULT_PAGE_SIZE": Config.DEFAULT_PAGE_SIZE,
    "MAX_PAGE_SIZE": Config.MAX_PAGE_SIZE,
}
