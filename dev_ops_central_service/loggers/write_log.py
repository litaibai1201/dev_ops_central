# -*- coding: utf-8 -*-
"""
@文件: write_log.py
@说明: 日志写入模块
@时间: 2025-08-18
@作者: LiDong
"""

import logging
from configs.log_conf import setup_logging

# 初始化日志配置
setup_logging()

# 获取logger实例
logger = logging.getLogger(__name__)