# -*- coding: utf-8 -*-
"""
@文件: response_serialize.py
@说明: API响应序列化
@时间: 2025-08-18
@作者: LiDong
"""

from marshmallow import Schema, fields


class RspBaseSchema(Schema):
    """基础响应schema"""
    code = fields.String(example="S10000", description="响应代码")
    msg = fields.String(example="OK", description="响应消息")


class RspMsgSchema(RspBaseSchema):
    """消息响应schema"""
    content = fields.Raw(description="响应内容")


class RspMsgDictSchema(RspBaseSchema):
    """字典响应schema"""
    content = fields.Dict(description="响应内容")


class RspMsgListSchema(RspBaseSchema):
    """列表响应schema"""
    content = fields.List(fields.Dict(), description="响应内容")


class PaginationSchema(Schema):
    """分页信息schema"""
    page = fields.Integer(description="当前页码")
    size = fields.Integer(description="每页大小") 
    total = fields.Integer(description="总记录数")
    pages = fields.Integer(description="总页数")
    has_next = fields.Boolean(description="是否有下一页")
    has_prev = fields.Boolean(description="是否有上一页")


class RspPaginationSchema(RspBaseSchema):
    """分页响应schema"""
    class PaginatedContent(Schema):
        items = fields.List(fields.Dict(), description="数据列表")
        pagination = fields.Nested(PaginationSchema, description="分页信息")
    
    content = fields.Nested(PaginatedContent, description="分页响应内容")