# -*- coding: utf-8 -*-
"""
@文件: auth_model.py
@说明: 认证模块数据操作
@时间: 2025-08-18
@作者: LiDong
"""

from sqlalchemy import and_, or_
from sqlalchemy.orm import load_only
from typing import Optional, Tuple, Any

from common.common_tools import CommonTools, TryExcept
from dbs.mysql_db import db, DBFunction
from dbs.mysql_db.model_tables import User


class OperUserModel:
    """用户模型操作类"""
    
    def __init__(self):
        self.model = User
    
    @TryExcept("新增用户失败")
    def add(self, data: User) -> bool:
        """添加用户"""
        db.session.add(data)
        return True
    
    @TryExcept("查找用户失败")
    def find_user_by_username_or_email(self, username_or_email: str) -> Optional[User]:
        """通过用户名或邮箱查找用户"""
        return self.model.query.filter(
            or_(
                self.model.username == username_or_email,
                self.model.email == username_or_email
            )
        ).first()
    
    @TryExcept("查找用户失败")
    def get_by_id(self, user_id: str) -> Optional[User]:
        """根据ID获取用户"""
        return self.model.query.filter(self.model.id == user_id).first()
    
    @TryExcept("查找用户失败")
    def get_by_username(self, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return self.model.query.filter(self.model.username == username).first()
    
    @TryExcept("查找用户失败")
    def get_by_email(self, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        return self.model.query.filter(self.model.email == email).first()
    
    @TryExcept("获取用户列表失败")
    def get_list(self, filters: dict = None, page: int = 1, size: int = 10):
        """获取用户列表"""
        load_fields = load_only(
            self.model.id, self.model.username, self.model.email,
            self.model.role, self.model.avatar, self.model.created_at
        )
        
        query = self.model.query.options(load_fields)
        
        if filters:
            if filters.get('keyword'):
                keyword = f"%{filters['keyword']}%"
                query = query.filter(
                    or_(
                        self.model.username.like(keyword),
                        self.model.email.like(keyword)
                    )
                )
            if filters.get('role'):
                query = query.filter(self.model.role == filters['role'])
        
        query = query.order_by(self.model.created_at.desc())
        
        return query.paginate(
            page=page, per_page=size, error_out=False
        )
    
    @TryExcept("更新用户失败")
    def update(self, user: User, data: dict) -> bool:
        """更新用户信息"""
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'avatar' in data:
            user.avatar = data['avatar']
        
        user.updated_at = CommonTools.get_now()
        return True
    
    @TryExcept("删除用户失败")
    def delete(self, user: User) -> bool:
        """删除用户"""
        db.session.delete(user)
        return True
    
    @TryExcept("检查用户名是否存在失败")
    def check_username_exists(self, username: str, exclude_id: str = None) -> bool:
        """检查用户名是否存在"""
        query = self.model.query.filter(self.model.username == username)
        if exclude_id:
            query = query.filter(self.model.id != exclude_id)
        return query.first() is not None
    
    @TryExcept("检查邮箱是否存在失败")
    def check_email_exists(self, email: str, exclude_id: str = None) -> bool:
        """检查邮箱是否存在"""
        query = self.model.query.filter(self.model.email == email)
        if exclude_id:
            query = query.filter(self.model.id != exclude_id)
        return query.first() is not None