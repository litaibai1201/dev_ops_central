# -*- coding: utf-8 -*-
"""
@文件: db_config.py
@說明: db配置
@時間: 2023/10/19 19:03:19
@作者: LiDong
"""


from configs import secrets

db_account = secrets.db_account


db_config_dict = {
    "mysql_db": {
        "host": "114.33.127.60",
        "port": 3306,
        "database_name": "database_service",
        "username": db_account["mysql_db"]["username"],
        "password": db_account["mysql_db"]["password"],
    },
    "redis": {
        "host": "10.126.1.128",
        "port": "6379",
        "database_name": "0",
        "username": db_account["redis"]["username"],
        "password": db_account["redis"]["password"],
    },
    "minio": {
        "host": "114.33.127.60",
        "port": 9000,
        "database_name": "",
        "username": db_account["minio"]["username"],
        "password": db_account["minio"]["password"],
    },
    "s3": {
        "host": "172.18.150.101",
        "port": "8080",
        "endpoint": "http://172.18.150.101:8080",
        "username": db_account["s3"]["username"],
        "password": db_account["s3"]["password"],
    },
    "mongodb": {
        "host": "114.33.127.60",
        "port": 27017,
        "database_name": "automl",
        "username": db_account["mongodb"]["username"],
        "password": db_account["mongodb"]["password"],
    }
}


es_config_dict = {
    "ip": "172.18.150.100",
    "port": "30920",
    "station_nm": "sz_sma"
}
