# -*- coding: utf-8 -*-
"""
@文件: common_method.py
@說明: API響應方法
@時間: 2023/10/19 14:15:34
@作者: LiDong
"""


def response_result(content=None, msg="OK", code="S10000"):
    """
    成功响应构建函数 (优化版本)
    
    Args:
        content: 响应内容，默认为空列表
        msg: 响应消息
        code: 响应代码
    """
    if content is None:
        content = []
        
    return {
        "code": code,
        "msg": msg,
        "content": content
    }


def fail_response_result(content=None, msg="Error", code="F10001"):
    """
    失败响应构建函数 (优化版本)
    
    Args:
        content: 错误内容，默认为空字典
        msg: 错误消息
        code: 错误代码
    """
    if content is None:
        content = {}
        
    return {
        "code": code,
        "msg": msg,
        "content": content
    }
