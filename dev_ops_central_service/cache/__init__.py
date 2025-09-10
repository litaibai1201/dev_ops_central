# -*- coding: utf-8 -*-
"""
@文件: __init__.py
@说明: 缓存模块初始化
@时间: 2025-08-18
@作者: LiDong
"""

from .redis_oper import redis_client

__all__ = ['redis_client']