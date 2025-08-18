# -*- coding: utf-8 -*-
"""
@文件: common_tools.py
@说明: 通用工具方法
@时间: 2025-08-18
@作者: LiDong
"""

import functools
import traceback
from datetime import datetime
from typing import Callable, Any, Tuple
import math

from loggers import logger


class CommonTools:
    """通用工具类"""
    
    @staticmethod
    def get_now() -> str:
        """获取当前时间字符串"""
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    @staticmethod
    def get_total_page(size: int, total: int) -> int:
        """计算总页数"""
        if size <= 0:
            return 0
        return math.ceil(total / size)
    
    @staticmethod
    def format_datetime(dt: datetime) -> str:
        """格式化日期时间"""
        if dt is None:
            return ""
        return dt.strftime('%Y-%m-%d %H:%M:%S')


def TryExcept(error_msg: str = "操作失败"):
    """
    异常处理装饰器
    
    Args:
        error_msg: 错误提示信息
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Tuple[Any, bool]:
            try:
                result = func(*args, **kwargs)
                return result, True
            except Exception as e:
                logger.error(f"{error_msg}: {str(e)}")
                logger.error(f"详细错误: {traceback.format_exc()}")
                return f"{error_msg}: {str(e)}", False
        return wrapper
    return decorator