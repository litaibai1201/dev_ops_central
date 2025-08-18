# -*- coding: utf-8 -*-
"""
@文件: app_config.py
@说明: 应用配置生成
@时间: 2025-08-18
@作者: LiDong
"""

from configs.db_config import db_config_dict

SQLALCHEMY_DATABASE_URI = "mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8mb4".format(
    db_config_dict["mysql_db"]["username"],
    db_config_dict["mysql_db"]["password"],
    db_config_dict["mysql_db"]["host"],
    db_config_dict["mysql_db"]["port"],
    db_config_dict["mysql_db"]["database_name"],
)

REDIS_DATABASE_URI = "redis://{}:{}@{}:{}/{}".format(
    db_config_dict["redis"]["username"],
    db_config_dict["redis"]["password"],
    db_config_dict["redis"]["host"],
    db_config_dict["redis"]["port"],
    db_config_dict["redis"]["database_name"],
)