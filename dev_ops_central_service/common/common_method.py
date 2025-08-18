# -*- coding: utf-8 -*-
"""
@文件: common_method.py
@说明: API响应方法
@时间: 2025-08-18
@作者: LiDong
"""

from typing import Dict, Any, Union, List

def response_result(content: Union[List, Dict, str, int] = [], msg: str = "OK", code: str = "S10000") -> Dict[str, Any]:
    """
    成功响应结果
    
    Args:
        content: 响应内容
        msg: 响应消息
        code: 响应代码
        
    Returns:
        Dict: 标准响应格式
    """
    return {
        "code": code,
        "msg": msg,
        "content": content
    }


def fail_response_result(content: Union[Dict, str] = {}, msg: str = "Error", code: str = "F10001") -> Dict[str, Any]:
    """
    失败响应结果
    
    Args:
        content: 错误内容
        msg: 错误消息
        code: 错误代码
        
    Returns:
        Dict: 标准错误响应格式
    """
    return {
        "code": code,
        "msg": msg,
        "content": content
    }


def paginate_response_result(items: List, total: int, page: int, size: int, msg: str = "OK") -> Dict[str, Any]:
    """
    分页响应结果
    
    Args:
        items: 数据列表
        total: 总数量
        page: 当前页
        size: 每页大小
        msg: 响应消息
        
    Returns:
        Dict: 分页响应格式
    """
    import math
    total_pages = math.ceil(total / size) if size > 0 else 0
    
    return response_result(
        content={
            "items": items,
            "pagination": {
                "page": page,
                "size": size,
                "total": total,
                "pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        },
        msg=msg
    )