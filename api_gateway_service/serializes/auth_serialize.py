# -*- coding: utf-8 -*-
"""
@文件: auth_serialize.py  
@說明: 認證序列化器 (优化版本)
@時間: 2025-01-09
@作者: LiDong
"""

from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from dbs.mysql_db import CommonModelDbSchema
from dbs.mysql_db.model_tables import UserModel, RefreshTokenModel, LoginLogModel
from marshmallow import post_load

class UserRegisterSchema(Schema):
    """用户注册请求参数"""
    username = fields.String(
        required=True,
        validate=validate.And(
            validate.Length(min=3, max=50),
            validate.Regexp(r'^[a-zA-Z0-9_]+$', error="用戶名只能包含字母、數字和下劃線")
        ),
        metadata={"description": "用戶名"}
    )
    email = fields.Email(
        required=True,
        validate=validate.Length(max=100),
        metadata={"description": "郵箱地址"}
    )
    password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=128),
        metadata={"description": "密碼"}
    )
    full_name = fields.String(
        missing="",
        validate=validate.Length(max=100),
        metadata={"description": "全名"}
    )
    phone = fields.String(
        missing="",
        validate=validate.And(
            validate.Length(max=20),
            validate.Regexp(r'^[0-9+\-\s()]*$', error="手機號格式不正確")
        ),
        metadata={"description": "手機號"}
    )
    
    @validates_schema
    def validate_password_strength(self, data, **kwargs):
        """验证密码强度"""
        password = data.get('password', '')
        if len(password) < 6:
            raise ValidationError("密碼長度至少6位", field_name='password')
        
        # 检查是否包含数字和字母
        has_digit = any(c.isdigit() for c in password)
        has_letter = any(c.isalpha() for c in password)
        
        if not (has_digit and has_letter):
            raise ValidationError("密碼必須包含字母和數字", field_name='password')


class UserLoginSchema(Schema):
    """用户登录请求参数"""
    credential = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100),
        metadata={"description": "登錄憑證(用戶名或郵箱)"}
    )
    password = fields.String(
        required=True,
        validate=validate.Length(min=1, max=128),
        metadata={"description": "密碼"}
    )
    remember_me = fields.Boolean(
        missing=False,
        metadata={"description": "記住我"}
    )


class TokenRefreshRequestSchema(Schema):
    """刷新令牌请求参数"""
    refresh_token = fields.String(
        required=True,
        validate=validate.Length(min=1),
        metadata={"description": "刷新令牌"}
    )


class UserInfoSchema(Schema):
    """用户信息响应Schema"""
    user_id = fields.Int(metadata={"description": "用戶ID"})
    username = fields.String(metadata={"description": "用戶名"})
    email = fields.String(metadata={"description": "郵箱"})
    full_name = fields.String(metadata={"description": "全名"})
    phone = fields.String(metadata={"description": "手機號"})
    avatar_url = fields.String(metadata={"description": "頭像URL"})
    role = fields.String(metadata={"description": "角色"})
    is_email_verified = fields.Boolean(metadata={"description": "郵箱是否已驗證"})
    last_login_at = fields.String(metadata={"description": "最後登錄時間"})
    created_at = fields.String(metadata={"description": "創建時間"})


class TokenResponseSchema(Schema):
    """令牌响应Schema"""
    access_token = fields.String(metadata={"description": "訪問令牌"})
    refresh_token = fields.String(metadata={"description": "刷新令牌"})
    token_type = fields.String(metadata={"description": "令牌類型"})
    expires_in = fields.Int(metadata={"description": "過期時間(秒)"})
    user_info = fields.Nested(UserInfoSchema, metadata={"description": "用戶信息"})


class UserProfileResponseSchema(Schema):
    """用户档案响应Schema"""
    user_info = fields.Nested(UserInfoSchema, metadata={"description": "用戶基本信息"})
    security_info = fields.Dict(metadata={"description": "安全信息"})


class SessionInfoSchema(Schema):
    """会话信息Schema"""
    token_id = fields.Int(metadata={"description": "令牌ID"})
    device_info = fields.String(metadata={"description": "設備信息"})
    ip_address = fields.String(metadata={"description": "IP地址"})
    created_at = fields.String(metadata={"description": "創建時間"})
    expires_at = fields.String(metadata={"description": "過期時間"})
    is_current = fields.Boolean(metadata={"description": "是否當前會話"})
    status = fields.String(metadata={"description": "會話狀態"})


class UserSessionsResponseSchema(Schema):
    """用户会话列表响应Schema"""
    user_id = fields.Int(metadata={"description": "用戶ID"})
    total_sessions = fields.Int(metadata={"description": "會話總數"})
    active_sessions = fields.Int(metadata={"description": "活躍會話數"})
    sessions = fields.List(
        fields.Nested(SessionInfoSchema),
        metadata={"description": "會話列表"}
    )


class SessionRevokeSchema(Schema):
    """撤销会话请求参数"""
    token_id = fields.Int(
        required=True,
        metadata={"description": "令牌ID"}
    )


class UserUpdateSchema(Schema):
    """用户更新请求参数"""
    full_name = fields.String(
        validate=validate.Length(max=100),
        metadata={"description": "全名"}
    )
    phone = fields.String(
        validate=validate.And(
            validate.Length(max=20),
            validate.Regexp(r'^[0-9+\-\s()]*$', error="手機號格式不正確")
        ),
        metadata={"description": "手機號"}
    )
    avatar_url = fields.String(
        validate=validate.Length(max=500),
        metadata={"description": "頭像URL"}
    )


class PasswordChangeSchema(Schema):
    """密码修改请求参数"""
    current_password = fields.String(
        required=True,
        validate=validate.Length(min=1, max=128),
        metadata={"description": "當前密碼"}
    )
    new_password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=128),
        metadata={"description": "新密碼"}
    )
    confirm_password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=128),
        metadata={"description": "確認密碼"}
    )
    
    @validates_schema
    def validate_passwords_match(self, data, **kwargs):
        """验证密码匹配"""
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        
        if new_password != confirm_password:
            raise ValidationError("新密碼和確認密碼不匹配", field_name='confirm_password')


# 数据库模型序列化器
class UserModelSchema(CommonModelDbSchema):
    """用户模型Schema"""
    __modelclass__ = UserModel
    
    password_hash = fields.String(load_only=True)  # 只用于加载，不序列化输出

    @post_load
    def post_load(self, instance, **kwargs):
        return UserModel(**instance)
    
    class Meta:
        load_instance = True


class RefreshTokenModelSchema(CommonModelDbSchema):
    """刷新令牌模型Schema"""
    __modelclass__ = RefreshTokenModel
    
    token_hash = fields.String(load_only=True)  # 敏感信息不输出
    
    class Meta:
        load_instance = True


class LoginLogModelSchema(CommonModelDbSchema):
    """登录日志模型Schema"""
    __modelclass__ = LoginLogModel
    
    class Meta:
        load_instance = True