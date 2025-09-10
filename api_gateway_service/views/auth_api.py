# -*- coding: utf-8 -*-
"""
@文件: auth_api.py
@說明: 認證API (优化版本)
@時間: 2025-01-09
@作者: LiDong
"""

from flask import request, g
from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from common.common_method import fail_response_result, response_result
from controllers.auth_controller import AuthController
from serializes.response_serialize import (RspMsgDictSchema, RspMsgSchema)
from serializes.auth_serialize import (
    UserRegisterSchema, UserLoginSchema, TokenRefreshRequestSchema,
    SessionRevokeSchema
)
from common.common_tools import CommonTools
from loggers import logger


blp = Blueprint("auth_api", __name__)


class BaseAuthView(MethodView):
    """认证API基类 - 统一控制器管理和错误处理"""
    
    def __init__(self):
        super().__init__()
        # 使用单例模式的控制器，避免重复初始化
        if not hasattr(g, 'auth_controller'):
            g.auth_controller = AuthController()
        self.ac = g.auth_controller
    
    def _build_response(self, result, flag, success_msg="操作成功", error_prefix=""):
        """统一响应构建"""
        if flag:
            return response_result(content=result, msg=success_msg)
        error_msg = f"{error_prefix}{result}" if error_prefix else str(result)
        logger.warning(f"API操作失败: {error_msg}")
        return fail_response_result(msg=error_msg)


@blp.route("/auth/register")
class UserRegisterApi(BaseAuthView):
    """用户注册API (优化版本)"""

    @blp.arguments(UserRegisterSchema)
    @blp.response(200, RspMsgDictSchema)
    def post(self, payload):
        """用户注册"""
        try:
            result, flag = self.ac.register(payload)
            return self._build_response(result, flag, "註冊成功")
        except Exception as e:
            logger.error(f"用戶註冊異常: {str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


@blp.route("/auth/login")
class UserLoginApi(BaseAuthView):
    """用户登录API (优化版本)"""

    @blp.arguments(UserLoginSchema)
    @blp.response(200, RspMsgDictSchema)
    def post(self, payload):
        """用户登录"""
        try:
            result, flag = self.ac.login(payload)
            return self._build_response(result, flag, "登錄成功")
        except Exception as e:
            logger.error(f"用戶登錄異常: {str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


@blp.route("/auth/refresh")
class TokenRefreshApi(BaseAuthView):
    """刷新令牌API (优化版本)"""

    @blp.arguments(TokenRefreshRequestSchema)
    @blp.response(200, RspMsgDictSchema)
    def post(self, payload):
        """刷新访问令牌"""
        try:
            refresh_token = payload.get('refresh_token')
            if not refresh_token:
                return fail_response_result(msg="缺少刷新令牌")
            
            result, flag = self.ac.refresh_token(refresh_token)
            return self._build_response(result, flag, "令牌刷新成功")
        except Exception as e:
            logger.error(f"刷新令牌異常: {str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


@blp.route("/auth/profile")
class UserProfileApi(BaseAuthView):
    """用户档案API (优化版本)"""

    @jwt_required()
    @blp.response(200, RspMsgDictSchema)
    def get(self):
        """获取当前用户信息"""
        try:
            current_user_id = get_jwt_identity()
            if not current_user_id:
                return fail_response_result(msg="無效的用戶身份")
            
            user_id = int(current_user_id)
            result, flag = self.ac.get_profile(user_id)
            return self._build_response(result, flag, "獲取用戶信息成功")
        except Exception as e:
            logger.error(f"獲取用戶檔案異常: {str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


@blp.route("/auth/logout")
class UserLogoutApi(BaseAuthView):
    """用户登出API (优化版本)"""

    @jwt_required()  # 需要有效的access token才能logout
    @blp.arguments(TokenRefreshRequestSchema)
    @blp.response(200, RspMsgSchema)
    def post(self, payload):
        """用户登出"""
        try:
            # 从Authorization header获取access token (已通过@jwt_required验证)
            auth_header = request.headers.get('Authorization')
            access_token = None
            if auth_header and auth_header.startswith('Bearer '):
                access_token = auth_header.split(' ')[1]
            
            # 从请求体获取refresh token
            refresh_token = payload.get('refresh_token')
            
            if not refresh_token:
                return fail_response_result(msg="缺少刷新令牌")
            
            result, flag = self.ac.logout(refresh_token, access_token)
            return self._build_response(result, flag, "登出成功")
        except Exception as e:
            logger.error(f"用戶登出異常: {str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


# 额外的管理API
@blp.route("/auth/sessions")
class UserSessionsApi(BaseAuthView):
    """用户会话管理API (MVC架构优化版本)"""

    @jwt_required()
    @blp.response(200, RspMsgDictSchema)
    def get(self):
        """获取用户的活跃会话列表"""
        try:
            current_user_id = get_jwt_identity()
            user_id = int(current_user_id)
            
            # 通过控制器获取会话列表，符合MVC架构
            result, flag = self.ac.get_user_sessions(user_id)
            return self._build_response(result, flag, "獲取會話列表成功")
        except Exception as e:
            logger.error(f"獲取會話列表異常: {str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")

    @jwt_required()
    @blp.arguments(SessionRevokeSchema)
    @blp.response(200, RspMsgSchema)
    def delete(self, payload):
        """撤销指定会话"""
        try:
            current_user_id = get_jwt_identity()
            user_id = int(current_user_id)
            token_id = payload['token_id']
            
            # 通过控制器撤销会话，符合MVC架构
            result, flag = self.ac.revoke_user_session(user_id, token_id)
            return self._build_response(result, flag, "會話撤銷成功")
        except Exception as e:
            logger.error(f"撤銷會話異常: {str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


@blp.route("/auth/health")
class AuthHealthApi(MethodView):
    """认证服务健康检查API"""

    @blp.response(200, RspMsgDictSchema)
    def get(self):
        """健康检查"""
        health_data = {
            'status': 'healthy',
            'service': 'auth-api',
            'timestamp': CommonTools.get_now(),
            'version': '1.0.0'
        }
        
        issues = []
        
        # 检查数据库连接
        try:
            from dbs.mysql_db import db
            from sqlalchemy import text
            result = db.session.execute(text('SELECT 1'))
            result.fetchone()  # 确保查询执行成功
            health_data['database'] = 'connected'
        except Exception as db_error:
            logger.error(f"数据库连接检查失敗: {str(db_error)}")
            health_data['database'] = f'error: {str(db_error)}'
            issues.append(f'数据库: {str(db_error)}')
        
        # 检查缓存连接
        try:
            from cache import redis_client
            if redis_client.redis_client is None:
                health_data['cache'] = 'not_initialized'
                issues.append('缓存: Redis客户端未初始化')
            else:
                redis_client.ping()
                health_data['cache'] = 'connected'
        except Exception as cache_error:
            logger.error(f"缓存连接检查失敗: {str(cache_error)}")
            health_data['cache'] = f'error: {str(cache_error)}'
            issues.append(f'缓存: {str(cache_error)}')
        
        # 判断整体健康状态
        if issues:
            health_data['status'] = 'unhealthy'
            health_data['issues'] = issues
            return fail_response_result(content=health_data, msg="服務異常")
        else:
            return response_result(content=health_data, msg="服務正常")


# 错误处理器
@blp.errorhandler(401)
def handle_unauthorized(error):
    """处理401未授权错误"""
    _ = error  # 避免未使用参数警告
    return fail_response_result(msg="未授權訪問，請先登錄")


@blp.errorhandler(403)
def handle_forbidden(error):
    """处理403禁止访问错误"""
    _ = error  # 避免未使用参数警告
    return fail_response_result(msg="禁止訪問，權限不足")


@blp.errorhandler(422)
def handle_validation_error(error):
    """处理422验证错误"""
    _ = error  # 避免未使用参数警告
    return fail_response_result(msg="請求參數驗證失敗")


@blp.errorhandler(500)
def handle_internal_error(error):
    """处理500内部错误"""
    logger.error(f"內部服務器錯誤: {str(error)}")
    return fail_response_result(msg="內部服務器錯誤")


# 请求前处理
@blp.before_request
def before_request():
    """请求前处理"""
    # 记录API访问日志
    if request.endpoint and not request.endpoint.endswith('health'):
        logger.info(f"API訪問: {request.method} {request.path} - IP: {request.remote_addr}")


# 响应后处理
@blp.after_request
def after_request(response):
    """响应后处理"""
    # 添加安全头
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response