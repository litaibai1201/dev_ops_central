# -*- coding: utf-8 -*-
"""
@文件: constant.py
@說明: 常量配置
@時間: 2023/10/19 19:03:05
@作者: LiDong
"""

conf = {
    "BUCKET_NAME": "automl",
    "ALLOWED_EXTENTSIONS": {
        'txt', 'csv', 'json', 'xlsx', 'xls', 'parquet', 
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'
    },
    "MAX_FILE_SIZE": 100 * 1024 * 1024  # 100MB
}
