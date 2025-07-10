"""
用户模块 - 视图层
"""

from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from apps.utils import get_current_user, error_response
from apps.schemas import (
    UserSearchSchema, UserUpdateSchema, ApiResponseSchema
)
from .controllers import UserController

users_blp = Blueprint('users', __name__, url_prefix='/api/users', description='用户管理相关接口')

@users_blp.route('')
class UsersAPI(MethodView):
    @jwt_required()
    @users_blp.arguments(UserSearchSchema, location='query')
    @users_blp.response(200, ApiResponseSchema)
    def get(self, query_args):
        """获取用户列表（分页）"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return UserController.get_users(current_user, query_args)

@users_blp.route('/<string:user_id>')
class UserAPI(MethodView):
    @jwt_required()
    @users_blp.response(200, ApiResponseSchema)
    def get(self, user_id):
        """获取用户详情"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return UserController.get_user(current_user, user_id)
    
    @jwt_required()
    @users_blp.arguments(UserUpdateSchema)
    @users_blp.response(200, ApiResponseSchema)
    def put(self, user_data, user_id):
        """更新用户信息"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return UserController.update_user(current_user, user_id, user_data)
    
    @jwt_required()
    @users_blp.response(200, ApiResponseSchema)
    def delete(self, user_id):
        """删除用户"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return UserController.delete_user(current_user, user_id)

@users_blp.route('/available-for-group')
class AvailableUsersAPI(MethodView):
    @jwt_required()
    @users_blp.arguments(UserSearchSchema, location='query')
    @users_blp.response(200, ApiResponseSchema)
    def get(self, query_args):
        """获取可添加到群组的用户列表"""
        return UserController.get_available_users_for_group(query_args)

@users_blp.route('/search')
class UserSearchAPI(MethodView):
    @jwt_required()
    @users_blp.arguments(UserSearchSchema, location='query')
    @users_blp.response(200, ApiResponseSchema)
    def get(self, query_args):
        """搜索用户"""
        return UserController.search_users(query_args)

@users_blp.route('/<string:user_id>/stats')
class UserStatsAPI(MethodView):
    @jwt_required()
    @users_blp.response(200, ApiResponseSchema)
    def get(self, user_id):
        """获取用户统计信息"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return UserController.get_user_stats(current_user, user_id)

@users_blp.route('/<string:user_id>/groups')
class UserGroupsAPI(MethodView):
    @jwt_required()
    @users_blp.response(200, ApiResponseSchema)
    def get(self, user_id):
        """获取用户所属的群组列表"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return UserController.get_user_groups(current_user, user_id)

@users_blp.route('/<string:user_id>/group-memberships')
class UserGroupMembershipsAPI(MethodView):
    @jwt_required()
    @users_blp.response(200, ApiResponseSchema)
    def get(self, user_id):
        """获取用户的群组成员关系"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return UserController.get_user_group_memberships(current_user, user_id)

@users_blp.route('/<string:user_id>/join-requests')
class UserJoinRequestsAPI(MethodView):
    @jwt_required()
    @users_blp.response(200, ApiResponseSchema)
    def get(self, user_id):
        """获取用户的入组申请历史"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return UserController.get_user_join_requests(current_user, user_id)
