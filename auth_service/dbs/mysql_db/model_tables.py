# -*- coding: utf-8 -*-
"""
@文件: model_tables.py
@說明: 認證相關數據模型表
@時間: 2025-01-09
@作者: LiDong
"""

from common.common_tools import CommonTools
from dbs.mysql_db import db


class BaseModel(db.Model):
    """基础模型类"""
    __abstract__ = True

    status = db.Column(db.Integer, default=1, comment="状态(1:正常,0:禁用,-1:删除)")
    created_at = db.Column(
        db.String(19), default=CommonTools.get_now, nullable=False,
        comment="創建時間"
    )
    status_update_at = db.Column(db.String(19), comment="状态更新時間")


class BaseMixinModel(BaseModel):
    """基础混合模型类"""
    __abstract__ = True

    updated_at = db.Column(db.String(19), comment="更新時間")


class UserModel(BaseMixinModel):
    """用户模型"""
    __tablename__ = "user_form"

    id = db.Column(db.BigInteger, nullable=False, primary_key=True, autoincrement=True, comment="用戶ID")
    username = db.Column(db.String(50), nullable=False, unique=True, comment="用戶名")
    email = db.Column(db.String(100), nullable=False, unique=True, comment="郵箱")
    password_hash = db.Column(db.String(255), nullable=False, comment="密碼哈希")
    full_name = db.Column(db.String(100), comment="全名")
    phone = db.Column(db.String(20), comment="手機號")
    avatar_url = db.Column(db.String(500), comment="頭像URL")
    role = db.Column(db.String(20), default="user", comment="角色(admin,user)")
    is_email_verified = db.Column(db.Boolean, default=False, comment="郵箱是否已驗證")
    last_login_at = db.Column(db.String(19), comment="最後登錄時間")
    login_ip = db.Column(db.String(45), comment="登錄IP")


class RefreshTokenModel(BaseModel):
    """刷新令牌模型"""
    __tablename__ = "refresh_token_form"

    id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True, comment="ID")
    user_id = db.Column(db.BigInteger, db.ForeignKey('user_form.id'), nullable=False, comment="用戶ID")
    token_hash = db.Column(db.String(255), nullable=False, unique=True, comment="令牌哈希")
    expires_at = db.Column(db.String(19), nullable=False, comment="過期時間")
    device_info = db.Column(db.String(500), comment="設備信息")
    ip_address = db.Column(db.String(45), comment="IP地址")
    is_revoked = db.Column(db.Boolean, default=False, comment="是否已撤銷")
    
    # 关系
    user = db.relationship('UserModel', backref='refresh_tokens')


class LoginLogModel(BaseModel):
    """登录日志模型"""
    __tablename__ = "login_log_form"

    id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True, comment="ID")
    user_id = db.Column(db.BigInteger, db.ForeignKey('user_form.id'), nullable=False, comment="用戶ID")
    login_type = db.Column(db.String(20), default="password", comment="登錄方式(password,refresh)")
    ip_address = db.Column(db.String(45), comment="IP地址")
    user_agent = db.Column(db.String(500), comment="用戶代理")
    device_info = db.Column(db.String(500), comment="設備信息")
    login_result = db.Column(db.String(20), default="success", comment="登錄結果(success,failed)")
    fail_reason = db.Column(db.String(100), comment="失敗原因")
    location = db.Column(db.String(100), comment="登錄地點")
    
    # 关系
    user = db.relationship('UserModel', backref='login_logs')


class UserSessionModel(BaseModel):
    """用户会话模型"""
    __tablename__ = "user_session_form"

    id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True, comment="ID")
    user_id = db.Column(db.BigInteger, db.ForeignKey('user_form.id'), nullable=False, comment="用戶ID")
    session_token = db.Column(db.String(255), nullable=False, unique=True, comment="會話令牌")
    expires_at = db.Column(db.String(19), nullable=False, comment="過期時間")
    ip_address = db.Column(db.String(45), comment="IP地址")
    user_agent = db.Column(db.String(500), comment="用戶代理")
    is_active = db.Column(db.Boolean, default=True, comment="是否活躍")
    
    # 关系
    user = db.relationship('UserModel', backref='sessions')