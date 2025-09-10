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
        "database_name": "api_gateway_service",
        "username": db_account["mysql_db"]["username"],
        "password": db_account["mysql_db"]["password"],
    },
    "redis": {
        "host": "localhost",
        "port": 6379,
        "database_name": "0",
        "password": db_account.get("redis", {}).get("password", ""),
    }
}
