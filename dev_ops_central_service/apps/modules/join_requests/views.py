"""
入组申请模块 - 视图层
"""

from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from apps.utils import get_current_user, error_response
from apps.schemas import (
    JoinRequestSearchSchema, JoinRequestCreateSchema, JoinRequestHandleSchema,
    BatchJoinRequestHandleSchema, ApiResponseSchema, RequestStatisticsQuerySchema
)
from .controllers import JoinRequestController

join_requests_blp = Blueprint('join_requests', __name__, url_prefix='/api/join-requests', description='入组申请相关接口')

@join_requests_blp.route('')
class JoinRequestsAPI(MethodView):
    @jwt_required()
    @join_requests_blp.arguments(JoinRequestSearchSchema, location='query')
    @join_requests_blp.response(200, ApiResponseSchema)
    def get(self, query_args):
        """获取入组申请列表"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return JoinRequestController.get_join_requests(current_user, query_args)
    
    @jwt_required()
    @join_requests_blp.arguments(JoinRequestCreateSchema)
    @join_requests_blp.response(201, ApiResponseSchema)
    def post(self, request_data):
        """提交入组申请"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return JoinRequestController.create_join_request(current_user, request_data)

@join_requests_blp.route('/<string:request_id>/handle')
class JoinRequestHandleAPI(MethodView):
    @jwt_required()
    @join_requests_blp.arguments(JoinRequestHandleSchema)
    @join_requests_blp.response(200, ApiResponseSchema)
    def post(self, handle_data, request_id):
        """处理入组申请"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return JoinRequestController.handle_join_request(current_user, request_id, handle_data)

@join_requests_blp.route('/batch-handle')
class BatchJoinRequestHandleAPI(MethodView):
    @jwt_required()
    @join_requests_blp.arguments(BatchJoinRequestHandleSchema)
    @join_requests_blp.response(200, ApiResponseSchema)
    def post(self, handle_data):
        """批量处理入组申请"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return JoinRequestController.batch_handle_requests(current_user, handle_data)

@join_requests_blp.route('/<string:request_id>')
class JoinRequestAPI(MethodView):
    @jwt_required()
    @join_requests_blp.response(200, ApiResponseSchema)
    def get(self, request_id):
        """获取申请详情"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return JoinRequestController.get_join_request(current_user, request_id)
    
    @jwt_required()
    @join_requests_blp.response(200, ApiResponseSchema)
    def delete(self, request_id):
        """撤销入组申请"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return JoinRequestController.cancel_join_request(current_user, request_id)

@join_requests_blp.route('/user/<string:user_id>/history')
class UserJoinHistoryAPI(MethodView):
    @jwt_required()
    @join_requests_blp.response(200, ApiResponseSchema)
    def get(self, user_id):
        """获取用户入组申请历史"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return JoinRequestController.get_user_join_history(current_user, user_id)

@join_requests_blp.route('/group/<string:group_id>/pending')
class GroupPendingRequestsAPI(MethodView):
    @jwt_required()
    @join_requests_blp.response(200, ApiResponseSchema)
    def get(self, group_id):
        """获取群组待处理申请"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return JoinRequestController.get_group_pending_requests(current_user, group_id)

@join_requests_blp.route('/statistics')
class RequestsStatisticsAPI(MethodView):
    @jwt_required()
    @join_requests_blp.arguments(RequestStatisticsQuerySchema, location='query')
    @join_requests_blp.response(200, ApiResponseSchema)
    def get(self, query_args):
        """获取申请统计信息"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        group_id = query_args.get('group_id')
        user_id = query_args.get('user_id')
        
        return JoinRequestController.get_requests_statistics(current_user, group_id, user_id)
