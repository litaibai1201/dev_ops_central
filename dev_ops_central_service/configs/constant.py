# -*- coding: utf-8 -*-
"""
@文件: constant.py
@说明: 常量配置
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

# 全局配置
conf = load_config()

# 常用常量
DEFAULT_PAGE_SIZE = conf.get("CONSTANT", {}).get("DEFAULT_PAGE_SIZE", 20)
MAX_PAGE_SIZE = conf.get("CONSTANT", {}).get("MAX_PAGE_SIZE", 100)
JWT_SECRET_KEY = conf.get("CONSTANT", {}).get("JWT_SECRET_KEY", "Avary88!")
JWT_ACCESS_TOKEN_EXPIRES = conf.get("CONSTANT", {}).get("JWT_ACCESS_TOKEN_EXPIRES", 2592000)