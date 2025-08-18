# -*- coding: utf-8 -*-
"""
@文件: auth_serialize.py
@说明: 认证相关序列化
@时间: 2025-08-18
@作者: LiDong
"""

from marshmallow import Schema, fields, validate, validates, ValidationError


class LoginSchema(Schema):
    """登录请求schema"""
    username = fields.String(
        required=True,
        validate=validate.Length(min=1, max=80),
        description="用户名或邮箱",
        example="admin"
    )
    password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=20),
        description="密码",
        example="admin123"
    )
    remember = fields.Boolean(
        missing=False,
        description="是否记住登录",
        example=False
    )


class RegisterSchema(Schema):
    """注册请求schema"""
    username = fields.String(
        required=True,
        validate=validate.Length(min=3, max=80),
        description="用户名",
        example="newuser"
    )
    email = fields.Email(
        required=True,
        description="邮箱地址",
        example="user@example.com"
    )
    password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=20),
        description="密码",
        example="password123"
    )
    confirm_password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=20),
        description="确认密码",
        example="password123"
    )


class ChangePasswordSchema(Schema):
    """修改密码请求schema"""
    current_password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=20),
        description="当前密码"
    )
    new_password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=20),
        description="新密码"
    )


class ForgotPasswordSchema(Schema):
    """忘记密码请求schema"""
    email = fields.Email(
        required=True,
        description="注册邮箱地址"
    )


class ResetPasswordSchema(Schema):
    """重置密码请求schema"""
    token = fields.String(
        required=True,
        description="重置令牌"
    )
    new_password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=20),
        description="新密码"
    )


class UserSchema(Schema):
    """用户信息schema"""
    id = fields.String(description="用户ID")
    username = fields.String(description="用户名")
    email = fields.String(description="邮箱")
    role = fields.String(description="用户角色")
    avatar = fields.String(description="头像URL", allow_none=True)
    created_at = fields.DateTime(description="创建时间")
    updated_at = fields.DateTime(description="更新时间")


class LoginResponseSchema(Schema):
    """登录响应数据schema"""
    user = fields.Nested(UserSchema, description="用户信息")
    token = fields.String(description="访问令牌")


class RefreshTokenResponseSchema(Schema):
    """刷新令牌响应schema"""
    token = fields.String(description="新的访问令牌")