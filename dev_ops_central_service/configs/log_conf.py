# -*- coding: utf-8 -*-
"""
@文件: log_conf.py
@说明: 日志配置
@时间: 2025-08-18
@作者: LiDong
"""

import os
import logging.config
from configs.constant import conf

# 日志配置
LOG_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'detailed': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
        },
        'simple': {
            'format': '%(asctime)s - %(levelname)s - %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'simple',
            'stream': 'ext://sys.stdout'
        },
        'info_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'INFO',
            'formatter': 'detailed',
            'filename': os.path.join(conf.get("PATH", {}).get("LOG_PATH", "./logs"), 'info/server_info.log'),
            'maxBytes': 50 * 1024 * 1024,  # 50MB
            'backupCount': 5,
            'encoding': 'utf-8'
        },
        'error_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'ERROR',
            'formatter': 'detailed',
            'filename': os.path.join(conf.get("PATH", {}).get("LOG_PATH", "./logs"), 'error/server_error.log'),
            'maxBytes': 50 * 1024 * 1024,  # 50MB
            'backupCount': 5,
            'encoding': 'utf-8'
        },
        'warn_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'WARNING',
            'formatter': 'detailed',
            'filename': os.path.join(conf.get("PATH", {}).get("LOG_PATH", "./logs"), 'warn/server_warn.log'),
            'maxBytes': 50 * 1024 * 1024,  # 50MB
            'backupCount': 5,
            'encoding': 'utf-8'
        },
        'critical_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'CRITICAL',
            'formatter': 'detailed',
            'filename': os.path.join(conf.get("PATH", {}).get("LOG_PATH", "./logs"), 'critical/server_critical.log'),
            'maxBytes': 50 * 1024 * 1024,  # 50MB
            'backupCount': 5,
            'encoding': 'utf-8'
        }
    },
    'loggers': {
        '': {  # root logger
            'handlers': ['console', 'info_file', 'error_file', 'warn_file', 'critical_file'],
            'level': 'INFO',
            'propagate': False
        }
    }
}

def setup_logging():
    """设置日志配置"""
    # 确保日志目录存在
    log_path = conf.get("PATH", {}).get("LOG_PATH", "./logs")
    os.makedirs(os.path.join(log_path, 'info'), exist_ok=True)
    os.makedirs(os.path.join(log_path, 'error'), exist_ok=True)
    os.makedirs(os.path.join(log_path, 'warn'), exist_ok=True)
    os.makedirs(os.path.join(log_path, 'critical'), exist_ok=True)
    
    logging.config.dictConfig(LOG_CONFIG)