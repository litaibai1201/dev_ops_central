# -*- coding: utf-8 -*-
"""
@文件: auth_api.py
@说明: 认证API
@时间: 2025-08-18
@作者: LiDong
"""

from flask import request
from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from common.common_method import fail_response_result
from controllers.auth_controller import AuthController
from serializes.response_serialize import RspMsgSchema, RspMsgDictSchema
from serializes.auth_serialize import (
    LoginSchema, RegisterSchema, ChangePasswordSchema,
    ForgotPasswordSchema, ResetPasswordSchema,
    LoginResponseSchema, RefreshTokenResponseSchema
)

blp = Blueprint("auth_api", __name__, url_prefix="/api/auth", description="用户认证相关接口")


@blp.route("/login")
class LoginAPI(MethodView):
    """用户登录API"""
    
    def __init__(self) -> None:
        super().__init__()
        self.ac = AuthController()
    
    @blp.arguments(LoginSchema)
    @blp.response(200, RspMsgDictSchema)
    def post(self, payload):
        """用户登录"""
        result, flag = self.ac.login(
            username=payload['username'],
            password=payload['password'],
            remember=payload.get('remember', False)
        )
        if flag:
            return result
        return result


@blp.route("/register")
class RegisterAPI(MethodView):
    """用户注册API"""
    
    def __init__(self) -> None:
        super().__init__()
        self.ac = AuthController()
    
    @blp.arguments(RegisterSchema)
    @blp.response(201, RspMsgDictSchema)
    def post(self, payload):
        """用户注册"""
        result, flag = self.ac.register(
            username=payload['username'],
            email=payload['email'],
            password=payload['password'],
            confirm_password=payload['confirm_password']
        )
        if flag:
            return result
        return result


@blp.route("/me")
class CurrentUserAPI(MethodView):
    """当前用户信息API"""
    
    def __init__(self) -> None:
        super().__init__()
        self.ac = AuthController()
    
    @jwt_required()
    @blp.response(200, RspMsgDictSchema)
    def get(self):
        """获取当前用户信息"""
        identity = get_jwt_identity()
        if not identity or not isinstance(identity, dict):
            return fail_response_result(msg="无效的身份令牌")
        
        user_id = identity.get('user_id')
        if not user_id:
            return fail_response_result(msg="缺少用户身份信息")
        
        result, flag = self.ac.get_current_user(user_id)
        if flag:
            return result
        return result


@blp.route("/refresh-token")
class RefreshTokenAPI(MethodView):
    """刷新令牌API"""
    
    def __init__(self) -> None:
        super().__init__()
        self.ac = AuthController()
    
    @jwt_required()
    @blp.response(200, RspMsgDictSchema)
    def post(self):
        """刷新访问令牌"""
        identity = get_jwt_identity()
        if not identity or not isinstance(identity, dict):
            return fail_response_result(msg="无效的身份令牌")
        
        user_id = identity.get('user_id')
        if not user_id:
            return fail_response_result(msg="缺少用户身份信息")
        
        result, flag = self.ac.refresh_token(user_id)
        if flag:
            return result
        return result


@blp.route("/logout")
class LogoutAPI(MethodView):
    """用户登出API"""
    
    def __init__(self) -> None:
        super().__init__()
        self.ac = AuthController()
    
    @jwt_required()
    @blp.response(200, RspMsgSchema)
    def post(self):
        """用户登出"""
        identity = get_jwt_identity()
        if not identity or not isinstance(identity, dict):
            return fail_response_result(msg="无效的身份令牌")
        
        user_id = identity.get('user_id')
        if not user_id:
            return fail_response_result(msg="缺少用户身份信息")
        
        result, flag = self.ac.logout(user_id)
        if flag:
            return result
        return result


@blp.route("/change-password")
class ChangePasswordAPI(MethodView):
    """修改密码API"""
    
    def __init__(self) -> None:
        super().__init__()
        self.ac = AuthController()
    
    @jwt_required()
    @blp.arguments(ChangePasswordSchema)
    @blp.response(200, RspMsgSchema)
    def post(self, payload):
        """修改密码"""
        identity = get_jwt_identity()
        if not identity or not isinstance(identity, dict):
            return fail_response_result(msg="无效的身份令牌")
        
        user_id = identity.get('user_id')
        if not user_id:
            return fail_response_result(msg="缺少用户身份信息")
        
        result, flag = self.ac.change_password(
            user_id=user_id,
            current_password=payload['current_password'],
            new_password=payload['new_password']
        )
        if flag:
            return result
        return result


@blp.route("/forgot-password")
class ForgotPasswordAPI(MethodView):
    """忘记密码API"""
    
    def __init__(self) -> None:
        super().__init__()
        self.ac = AuthController()
    
    @blp.arguments(ForgotPasswordSchema)
    @blp.response(200, RspMsgSchema)
    def post(self, payload):
        """忘记密码 - 发送重置邮件"""
        # TODO: 实现忘记密码功能
        return fail_response_result(msg="功能暂未实现")


@blp.route("/reset-password")
class ResetPasswordAPI(MethodView):
    """重置密码API"""
    
    def __init__(self) -> None:
        super().__init__()
        self.ac = AuthController()
    
    @blp.arguments(ResetPasswordSchema)
    @blp.response(200, RspMsgSchema)
    def post(self, payload):
        """重置密码"""
        # TODO: 实现重置密码功能
        return fail_response_result(msg="功能暂未实现")