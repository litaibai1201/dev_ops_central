"""
认证模块 - 视图层
"""

from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from apps.schemas import (
    LoginSchema, RegisterSchema, ChangePasswordSchema,
    ApiResponseSchema, EmailSchema, ResetPasswordSchema
)
from .controllers import AuthController

auth_blp = Blueprint('auth', __name__, url_prefix='/api/auth', description='用户认证相关接口')

@auth_blp.route('/login')
class LoginAPI(MethodView):
    @auth_blp.arguments(LoginSchema)
    @auth_blp.response(200, ApiResponseSchema)
    def post(self, login_data):
        """用户登录"""
        return AuthController.login(
            username=login_data['username'],
            password=login_data['password'],
            remember=login_data.get('remember', False)
        )

@auth_blp.route('/register')
class RegisterAPI(MethodView):
    @auth_blp.arguments(RegisterSchema)
    @auth_blp.response(201, ApiResponseSchema)
    def post(self, register_data):
        """用户注册"""
        return AuthController.register(
            username=register_data['username'],
            email=register_data['email'],
            password=register_data['password'],
            confirm_password=register_data['confirm_password']
        )

@auth_blp.route('/me')
class CurrentUserAPI(MethodView):
    @jwt_required()
    @auth_blp.response(200, ApiResponseSchema)
    def get(self):
        """获取当前用户信息"""
        current_user_id = get_jwt_identity()
        return AuthController.get_current_user(current_user_id)

@auth_blp.route('/refresh')
class RefreshTokenAPI(MethodView):
    @jwt_required()
    @auth_blp.response(200, ApiResponseSchema)
    def post(self):
        """刷新访问令牌"""
        current_user_id = get_jwt_identity()
        return AuthController.refresh_token(current_user_id)

@auth_blp.route('/logout')
class LogoutAPI(MethodView):
    @jwt_required()
    @auth_blp.response(200, ApiResponseSchema)
    def post(self):
        """用户登出"""
        current_user_id = get_jwt_identity()
        return AuthController.logout(current_user_id)

@auth_blp.route('/change-password')
class ChangePasswordAPI(MethodView):
    @jwt_required()
    @auth_blp.arguments(ChangePasswordSchema)
    @auth_blp.response(200, ApiResponseSchema)
    def post(self, password_data):
        """修改密码"""
        current_user_id = get_jwt_identity()
        return AuthController.change_password(
            user_id=current_user_id,
            current_password=password_data['current_password'],
            new_password=password_data['new_password']
        )

@auth_blp.route('/forgot-password')
class ForgotPasswordAPI(MethodView):
    @auth_blp.arguments(EmailSchema)
    @auth_blp.response(200, ApiResponseSchema)
    def post(self, email_data):
        """忘记密码"""
        return AuthController.forgot_password(email_data['email'])

@auth_blp.route('/reset-password')
class ResetPasswordAPI(MethodView):
    @auth_blp.arguments(ResetPasswordSchema)
    @auth_blp.response(200, ApiResponseSchema)
    def post(self, reset_data):
        """重置密码"""
        return AuthController.reset_password(
            token=reset_data['token'],
            new_password=reset_data['new_password']
        )
