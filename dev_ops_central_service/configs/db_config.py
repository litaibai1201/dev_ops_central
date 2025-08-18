# -*- coding: utf-8 -*-
"""
@文件: db_config.py
@说明: 数据库配置读取
@时间: 2025-08-18 
@作者: LiDong
"""

import yaml
import os

def load_config():
    """加载配置文件"""
    config_path = os.path.join(os.path.dirname(__file__), 'conf', 'conf.yaml')
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        return config
    except Exception as e:
        print(f"加载配置文件失败: {e}")
        return {}

# 加载配置
config = load_config()

# 数据库配置字典
db_config_dict = {
    "mysql_db": {
        "host": config.get("DB", {}).get("MYSQL", {}).get("HOST", "localhost"),
        "port": config.get("DB", {}).get("MYSQL", {}).get("PORT", 3306),
        "database_name": config.get("DB", {}).get("MYSQL", {}).get("DATABASE_NAME", "dev_ops_central"),
        "username": config.get("DB", {}).get("MYSQL", {}).get("USERNAME", "root"),
        "password": config.get("DB", {}).get("MYSQL", {}).get("PASSWORD", "password"),
    },
    "redis": {
        "host": config.get("DB", {}).get("REDIS", {}).get("HOST", "localhost"),
        "port": config.get("DB", {}).get("REDIS", {}).get("PORT", 6379),
        "database_name": config.get("DB", {}).get("REDIS", {}).get("DATABASE_NAME", 0),
        "username": config.get("DB", {}).get("REDIS", {}).get("USERNAME", ""),
        "password": config.get("DB", {}).get("REDIS", {}).get("PASSWORD", ""),
    }
}