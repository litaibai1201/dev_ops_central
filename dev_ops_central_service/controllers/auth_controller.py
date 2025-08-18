# -*- coding: utf-8 -*-
"""
@文件: auth_controller.py
@说明: 认证控制器
@时间: 2025-08-18
@作者: LiDong
"""

import re
from typing import Tuple, Dict, Any
from flask_jwt_extended import create_access_token

from common.common_method import response_result, fail_response_result
from common.common_tools import CommonTools, TryExcept
from dbs.mysql_db import db, DBFunction
from dbs.mysql_db.model_tables import User
from models.auth_model import OperUserModel
from loggers import logger


class AuthController:
    """认证控制器"""
    
    def __init__(self):
        self.oper_user = OperUserModel()
    
    def _validate_email(self, email: str) -> bool:
        """验证邮箱格式"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _validate_password_strength(self, password: str) -> Tuple[bool, str]:
        """验证密码强度"""
        if len(password) < 6:
            return False, "密码长度至少6位"
        if len(password) > 20:
            return False, "密码长度不能超过20位"
        return True, "密码强度合格"
    
    @TryExcept("用户登录失败")
    def login(self, username: str, password: str, remember: bool = False) -> Tuple[Dict[str, Any], bool]:
        """
        用户登录
        
        Args:
            username: 用户名或邮箱
            password: 密码
            remember: 是否记住登录
            
        Returns:
            Tuple[Dict, bool]: (响应数据, 是否成功)
        """
        # 查找用户
        user, success = self.oper_user.find_user_by_username_or_email(username)
        if not success or not user:
            return fail_response_result(msg="用户名或密码错误"), False
        
        # 验证密码
        if not user.check_password(password):
            return fail_response_result(msg="用户名或密码错误"), False
        
        # 创建访问令牌
        expires_delta = None  # 使用配置中的默认过期时间
        access_token = create_access_token(
            identity={"user_id": user.id, "username": user.username},
            expires_delta=expires_delta
        )
        
        # 记录日志
        logger.info(f"用户登录成功: {user.username}")
        
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "avatar": user.avatar
        }
        
        return response_result(
            content={
                "user": user_data,
                "token": access_token
            },
            msg="登录成功"
        ), True
    
    @TryExcept("用户注册失败")
    def register(self, username: str, email: str, password: str, confirm_password: str) -> Tuple[Dict[str, Any], bool]:
        """
        用户注册
        
        Args:
            username: 用户名
            email: 邮箱
            password: 密码
            confirm_password: 确认密码
            
        Returns:
            Tuple[Dict, bool]: (响应数据, 是否成功)
        """
        # 验证密码确认
        if password != confirm_password:
            return fail_response_result(msg="密码确认不匹配"), False
        
        # 验证邮箱格式
        if not self._validate_email(email):
            return fail_response_result(msg="邮箱格式无效"), False
        
        # 验证密码强度
        is_strong, message = self._validate_password_strength(password)
        if not is_strong:
            return fail_response_result(msg=message), False
        
        # 检查用户名是否已存在
        exists, success = self.oper_user.check_username_exists(username)
        if success and exists:
            return fail_response_result(msg="用户名已存在"), False
        
        # 检查邮箱是否已存在
        exists, success = self.oper_user.check_email_exists(email)
        if success and exists:
            return fail_response_result(msg="邮箱已被注册"), False
        
        # 创建新用户
        user = User(
            username=username,
            email=email,
            role='user'
        )
        user.set_password(password)
        
        # 保存用户
        result, success = self.oper_user.add(user)
        if not success:
            return fail_response_result(msg="注册失败，请重试"), False
        
        # 提交事务
        try:
            DBFunction.commit()
        except Exception as e:
            logger.error(f"用户注册事务提交失败: {e}")
            return fail_response_result(msg="注册失败，请重试"), False
        
        # 创建访问令牌
        access_token = create_access_token(
            identity={"user_id": user.id, "username": user.username}
        )
        
        logger.info(f"用户注册成功: {user.username}")
        
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "avatar": user.avatar
        }
        
        return response_result(
            content={
                "user": user_data,
                "token": access_token
            },
            msg="注册成功"
        ), True
    
    @TryExcept("获取用户信息失败")
    def get_current_user(self, user_id: str) -> Tuple[Dict[str, Any], bool]:
        """
        获取当前用户信息
        
        Args:
            user_id: 用户ID
            
        Returns:
            Tuple[Dict, bool]: (响应数据, 是否成功)
        """
        user, success = self.oper_user.get_by_id(user_id)
        if not success or not user:
            return fail_response_result(msg="用户不存在"), False
        
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "avatar": user.avatar,
            "created_at": CommonTools.format_datetime(user.created_at)
        }
        
        return response_result(content=user_data, msg="获取成功"), True
    
    @TryExcept("刷新令牌失败")
    def refresh_token(self, user_id: str) -> Tuple[Dict[str, Any], bool]:
        """
        刷新访问令牌
        
        Args:
            user_id: 用户ID
            
        Returns:
            Tuple[Dict, bool]: (响应数据, 是否成功)
        """
        user, success = self.oper_user.get_by_id(user_id)
        if not success or not user:
            return fail_response_result(msg="用户不存在"), False
        
        # 创建新的访问令牌
        access_token = create_access_token(
            identity={"user_id": user.id, "username": user.username}
        )
        
        return response_result(
            content={"token": access_token},
            msg="令牌刷新成功"
        ), True
    
    @TryExcept("用户登出失败")
    def logout(self, user_id: str) -> Tuple[Dict[str, Any], bool]:
        """
        用户登出
        
        Args:
            user_id: 用户ID
            
        Returns:
            Tuple[Dict, bool]: (响应数据, 是否成功)
        """
        # JWT是无状态的，这里只记录日志并返回成功响应
        logger.info(f"用户登出: {user_id}")
        
        return response_result(msg="登出成功"), True
    
    @TryExcept("修改密码失败")
    def change_password(self, user_id: str, current_password: str, new_password: str) -> Tuple[Dict[str, Any], bool]:
        """
        修改密码
        
        Args:
            user_id: 用户ID
            current_password: 当前密码
            new_password: 新密码
            
        Returns:
            Tuple[Dict, bool]: (响应数据, 是否成功)
        """
        user, success = self.oper_user.get_by_id(user_id)
        if not success or not user:
            return fail_response_result(msg="用户不存在"), False
        
        # 验证当前密码
        if not user.check_password(current_password):
            return fail_response_result(msg="当前密码错误"), False
        
        # 验证新密码强度
        is_strong, message = self._validate_password_strength(new_password)
        if not is_strong:
            return fail_response_result(msg=message), False
        
        # 更新密码
        user.set_password(new_password)
        result, success = self.oper_user.update(user, {})
        if not success:
            return fail_response_result(msg="密码修改失败"), False
        
        # 提交事务
        try:
            DBFunction.commit()
            logger.info(f"用户修改密码成功: {user.username}")
            return response_result(msg="密码修改成功"), True
        except Exception as e:
            logger.error(f"修改密码事务提交失败: {e}")
            return fail_response_result(msg="密码修改失败"), False