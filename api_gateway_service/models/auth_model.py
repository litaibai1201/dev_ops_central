# -*- coding: utf-8 -*-
"""
@文件: auth_model.py
@說明: 認證模型操作類 (优化版本)
@時間: 2025-01-09
@作者: LiDong
"""

import hashlib
from datetime import datetime, timedelta
from sqlalchemy import and_, or_
from sqlalchemy.orm import load_only

from common.common_tools import CommonTools, TryExcept
from dbs.mysql_db import db
from dbs.mysql_db.model_tables import UserModel, RefreshTokenModel, LoginLogModel, UserSessionModel


class OperUserModel:
    """用户模型操作类 (优化版本)"""
    
    def __init__(self):
        self.model = UserModel
    
    @TryExcept("創建用戶失敗")
    def create_user(self, user_data):
        """创建新用户"""
        # 数据验证
        if not user_data.username or not user_data.username.strip():
            raise ValueError("用戶名不能為空")
        
        if not user_data.email or not user_data.email.strip():
            raise ValueError("郵箱不能為空")
            
        if not user_data.password_hash:
            raise ValueError("密碼不能為空")
        
        # 检查用户名是否已存在
        existing_user = self.model.query.filter(
            or_(
                self.model.username == user_data.username.strip(),
                self.model.email == user_data.email.strip()
            )
        ).filter(self.model.status == 1).first()
        
        if existing_user:
            if existing_user.username == user_data.username.strip():
                raise ValueError("用戶名已存在")
            else:
                raise ValueError("郵箱已被註冊")
        
        db.session.add(user_data)
        return True
    
    def get_by_username(self, username):
        """根据用户名获取用户"""
        return self.model.query.filter(
            and_(
                self.model.username == username,
                self.model.status == 1
            )
        ).first()
    
    def get_by_email(self, email):
        """根据邮箱获取用户"""
        return self.model.query.filter(
            and_(
                self.model.email == email,
                self.model.status == 1
            )
        ).first()
    
    def get_by_id(self, user_id):
        """根据ID获取用户"""
        return self.model.query.filter(
            and_(
                self.model.id == user_id,
                self.model.status == 1
            )
        ).options(
            # 只加载必要字段，排除密码
            load_only(
                self.model.id, self.model.username, self.model.email,
                self.model.full_name, self.model.phone, self.model.avatar_url,
                self.model.role, self.model.is_email_verified, 
                self.model.last_login_at, self.model.created_at
            )
        ).first()
    
    def get_by_login_credential(self, credential):
        """根据登录凭证获取用户(支持用户名或邮箱)"""
        return self.model.query.filter(
            and_(
                or_(
                    self.model.username == credential,
                    self.model.email == credential
                ),
                self.model.status == 1
            )
        ).first()
    
    @TryExcept("更新用戶失敗")
    def update_user(self, user, update_data):
        """更新用户信息"""
        allowed_fields = ['full_name', 'phone', 'avatar_url', 'is_email_verified']
        
        for field, value in update_data.items():
            if field in allowed_fields and hasattr(user, field):
                setattr(user, field, value)
        
        user.updated_at = CommonTools.get_now()
        return True
    
    @TryExcept("更新最後登錄時間失敗")
    def update_last_login(self, user, ip_address=None):
        """更新最后登录时间和IP"""
        user.last_login_at = CommonTools.get_now()
        if ip_address:
            user.login_ip = ip_address
        user.updated_at = CommonTools.get_now()
        return True
    
    def verify_password(self, user, password):
        """验证密码"""
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        return user.password_hash == password_hash
    
    @staticmethod
    def hash_password(password):
        """密码哈希"""
        return hashlib.sha256(password.encode()).hexdigest()


class OperRefreshTokenModel:
    """刷新令牌模型操作类"""
    
    def __init__(self):
        self.model = RefreshTokenModel
    
    @TryExcept("創建刷新令牌失敗")
    def create_refresh_token(self, token_data):
        """创建刷新令牌"""
        db.session.add(token_data)
        return True
    
    def get_by_token_hash(self, token_hash):
        """根据令牌哈希获取令牌记录"""
        return self.model.query.filter(
            and_(
                self.model.token_hash == token_hash,
                self.model.status == 1,
                self.model.is_revoked == False
            )
        ).first()
    
    def get_active_tokens_by_user(self, user_id, limit=10):
        """获取用户的活跃令牌"""
        current_time = CommonTools.get_now()
        return self.model.query.filter(
            and_(
                self.model.user_id == user_id,
                self.model.status == 1,
                self.model.is_revoked == False,
                self.model.expires_at > current_time
            )
        ).order_by(self.model.created_at.desc()).limit(limit).all()
    
    @TryExcept("撤銷令牌失敗")
    def revoke_token(self, token):
        """撤销令牌"""
        token.is_revoked = True
        token.status_update_at = CommonTools.get_now()
        return True
    
    @TryExcept("清理過期令牌失敗")
    def cleanup_expired_tokens(self):
        """清理过期令牌"""
        current_time = CommonTools.get_now()
        expired_tokens = self.model.query.filter(
            and_(
                self.model.expires_at <= current_time,
                self.model.status == 1
            )
        ).all()
        
        for token in expired_tokens:
            token.status = 0
            token.status_update_at = current_time
        
        return len(expired_tokens)
    
    def is_token_valid(self, token):
        """检查令牌是否有效"""
        if not token or token.is_revoked or token.status != 1:
            return False
        
        current_time = CommonTools.get_now()
        return token.expires_at > current_time


class OperLoginLogModel:
    """登录日志模型操作类"""
    
    def __init__(self):
        self.model = LoginLogModel
    
    @TryExcept("記錄登錄日誌失敗")
    def create_login_log(self, log_data):
        """创建登录日志"""
        db.session.add(log_data)
        return True
    
    def get_user_login_history(self, user_id, page=1, size=10):
        """获取用户登录历史"""
        return self.model.query.filter(
            and_(
                self.model.user_id == user_id,
                self.model.status == 1
            )
        ).order_by(self.model.created_at.desc()).paginate(
            page=page, per_page=size, error_out=False
        )
    
    def get_failed_login_attempts(self, user_id, hours=24):
        """获取指定时间内的失败登录次数"""
        since_time = CommonTools.get_now(
            datetime.now() - timedelta(hours=hours)
        )
        
        return self.model.query.filter(
            and_(
                self.model.user_id == user_id,
                self.model.login_result == "failed",
                self.model.created_at >= since_time,
                self.model.status == 1
            )
        ).count()


class OperUserSessionModel:
    """用户会话模型操作类"""
    
    def __init__(self):
        self.model = UserSessionModel
    
    @TryExcept("創建用戶會話失敗")
    def create_session(self, session_data):
        """创建用户会话"""
        db.session.add(session_data)
        return True
    
    def get_by_session_token(self, session_token):
        """根据会话令牌获取会话"""
        return self.model.query.filter(
            and_(
                self.model.session_token == session_token,
                self.model.status == 1,
                self.model.is_active == True
            )
        ).first()
    
    def get_active_sessions_by_user(self, user_id):
        """获取用户的活跃会话"""
        current_time = CommonTools.get_now()
        return self.model.query.filter(
            and_(
                self.model.user_id == user_id,
                self.model.status == 1,
                self.model.is_active == True,
                self.model.expires_at > current_time
            )
        ).order_by(self.model.created_at.desc()).all()
    
    @TryExcept("終止會話失敗")
    def terminate_session(self, session):
        """终止会话"""
        session.is_active = False
        session.status_update_at = CommonTools.get_now()
        return True
    
    def is_session_valid(self, session):
        """检查会话是否有效"""
        if not session or not session.is_active or session.status != 1:
            return False
        
        current_time = CommonTools.get_now()
        return session.expires_at > current_time