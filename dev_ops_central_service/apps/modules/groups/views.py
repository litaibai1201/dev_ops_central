"""
群组模块 - 视图层
"""

from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from apps.utils import get_current_user, error_response
from apps.schemas import (
    GroupSearchSchema, GroupCreateSchema, GroupUpdateSchema,
    ApiResponseSchema, GroupMemberCreateSchema, GroupMemberUpdateSchema,
    TransferOwnershipSchema
)
from .controllers import GroupController

groups_blp = Blueprint('groups', __name__, url_prefix='/api/groups', description='群组管理相关接口')

@groups_blp.route('')
class GroupsAPI(MethodView):
    @jwt_required()
    @groups_blp.arguments(GroupSearchSchema, location='query')
    @groups_blp.response(200, ApiResponseSchema)
    def get(self, query_args):
        """获取群组列表（分页）"""
        return GroupController.get_groups(query_args)
    
    @jwt_required()
    @groups_blp.arguments(GroupCreateSchema)
    @groups_blp.response(201, ApiResponseSchema)
    def post(self, group_data):
        """创建群组"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return GroupController.create_group(current_user, group_data)

@groups_blp.route('/<string:group_id>')
class GroupAPI(MethodView):
    @jwt_required()
    @groups_blp.response(200, ApiResponseSchema)
    def get(self, group_id):
        """获取群组详情"""
        return GroupController.get_group(group_id)
    
    @jwt_required()
    @groups_blp.arguments(GroupUpdateSchema)
    @groups_blp.response(200, ApiResponseSchema)
    def put(self, group_data, group_id):
        """更新群组信息"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return GroupController.update_group(current_user, group_id, group_data)
    
    @jwt_required()
    @groups_blp.response(200, ApiResponseSchema)
    def delete(self, group_id):
        """删除群组"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return GroupController.delete_group(current_user, group_id)

@groups_blp.route('/<string:group_id>/members')
class GroupMembersAPI(MethodView):
    @jwt_required()
    @groups_blp.response(200, ApiResponseSchema)
    def get(self, group_id):
        """获取群组成员列表"""
        return GroupController.get_group_members(group_id)
    
    @jwt_required()
    @groups_blp.arguments(GroupMemberCreateSchema)
    @groups_blp.response(201, ApiResponseSchema)
    def post(self, member_data, group_id):
        """添加群组成员"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return GroupController.add_group_member(current_user, group_id, member_data)

@groups_blp.route('/<string:group_id>/members/<string:member_id>')
class GroupMemberAPI(MethodView):
    @jwt_required()
    @groups_blp.arguments(GroupMemberUpdateSchema)
    @groups_blp.response(200, ApiResponseSchema)
    def put(self, member_data, group_id, member_id):
        """更新群组成员权限"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return GroupController.update_group_member(current_user, group_id, member_id, member_data)
    
    @jwt_required()
    @groups_blp.response(200, ApiResponseSchema)
    def delete(self, group_id, member_id):
        """移除群组成员"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return GroupController.remove_group_member(current_user, group_id, member_id)

@groups_blp.route('/<string:group_id>/stats')
class GroupStatsAPI(MethodView):
    @jwt_required()
    @groups_blp.response(200, ApiResponseSchema)
    def get(self, group_id):
        """获取群组统计信息"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return GroupController.get_group_stats(current_user, group_id)

@groups_blp.route('/<string:group_id>/join-eligibility')
class GroupJoinEligibilityAPI(MethodView):
    @jwt_required()
    @groups_blp.response(200, ApiResponseSchema)
    def get(self, group_id):
        """检查用户是否可以加入群组"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return GroupController.check_join_eligibility(current_user, group_id)

@groups_blp.route('/<string:group_id>/transfer-ownership')
class GroupTransferOwnershipAPI(MethodView):
    @jwt_required()
    @groups_blp.arguments(TransferOwnershipSchema)
    @groups_blp.response(200, ApiResponseSchema)
    def post(self, transfer_data, group_id):
        """转移群组所有权"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return GroupController.transfer_ownership(current_user, group_id, transfer_data)
