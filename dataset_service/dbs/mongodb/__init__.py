# -*- coding: utf-8 -*-
"""
@文件: __init__.py
@說明: MongoDB ORM模塊
@時間: 2025-08-08
@作者: LiDong
"""

from mongoengine import connect, disconnect
from .dataset_history import DatasetHistory
from .dataset_files import DatasetFiles
from configs.db_config import db_config_dict

__all__ = ['DatasetHistory', 'DatasetFiles', 'connect_mongodb', 'disconnect_mongodb']

mongodb = db_config_dict.get("mongodb", {}) 

def connect_mongodb(host=mongodb["host"], port=mongodb["port"], db_name=mongodb["database_name"], 
                   username=mongodb["username"], password=mongodb["password"], **kwargs):
    """
    連接MongoDB數據庫
    
    :param host: MongoDB主機地址
    :param port: MongoDB端口
    :param db_name: 數據庫名稱
    :param username: 用戶名
    :param password: 密碼
    :param kwargs: 其他連接參數
    :return: 連接對象
    """
    connection_params = {
        'host': host,
        'port': port,
        'db': db_name,
        **kwargs
    }
    
    if username and password:
        connection_params.update({
            'username': username,
            'password': password
        })
    
    return connect(**connection_params)


def disconnect_mongodb():
    """
    斷開MongoDB連接
    """
    return disconnect()