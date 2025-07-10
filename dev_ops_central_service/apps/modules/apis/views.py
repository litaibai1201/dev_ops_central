"""
API模块 - 视图层
"""

from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from apps.utils import get_current_user, error_response
from apps.schemas import (
    ApiSearchSchema, ApiMethodCreateSchema, ApiMethodUpdateSchema,
    ApiTestRequestSchema, ApiResponseSchema, ApiCopySchema,
    ApiBulkUpdateSchema, GlobalApiSearchSchema
)
from .controllers import ApiController

apis_blp = Blueprint('apis', __name__, url_prefix='/api/projects', description='API接口管理相关接口')

@apis_blp.route('/<string:project_id>/apis')
class ProjectApisAPI(MethodView):
    @jwt_required()
    @apis_blp.arguments(ApiSearchSchema, location='query')
    @apis_blp.response(200, ApiResponseSchema)
    def get(self, query_args, project_id):
        """获取专案的API列表"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.get_project_apis(current_user, project_id, query_args)
    
    @jwt_required()
    @apis_blp.arguments(ApiMethodCreateSchema)
    @apis_blp.response(201, ApiResponseSchema)
    def post(self, api_data, project_id):
        """创建API"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.create_api(current_user, project_id, api_data)

@apis_blp.route('/<string:project_id>/apis/<string:api_id>')
class ApiMethodAPI(MethodView):
    @jwt_required()
    @apis_blp.response(200, ApiResponseSchema)
    def get(self, project_id, api_id):
        """获取API详情"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.get_api(current_user, project_id, api_id)
    
    @jwt_required()
    @apis_blp.arguments(ApiMethodUpdateSchema)
    @apis_blp.response(200, ApiResponseSchema)
    def put(self, api_data, project_id, api_id):
        """更新API"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.update_api(current_user, project_id, api_id, api_data)
    
    @jwt_required()
    @apis_blp.response(200, ApiResponseSchema)
    def delete(self, project_id, api_id):
        """删除API"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.delete_api(current_user, project_id, api_id)

@apis_blp.route('/<string:project_id>/apis/<string:api_id>/test')
class ApiTestAPI(MethodView):
    @jwt_required()
    @apis_blp.arguments(ApiTestRequestSchema)
    @apis_blp.response(200, ApiResponseSchema)
    def post(self, test_data, project_id, api_id):
        """测试API"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.test_api(current_user, project_id, api_id, test_data)

@apis_blp.route('/<string:project_id>/apis/<string:api_id>/copy')
class ApiCopyAPI(MethodView):
    @jwt_required()
    @apis_blp.arguments(ApiCopySchema)
    @apis_blp.response(201, ApiResponseSchema)
    def post(self, copy_data, project_id, api_id):
        """复制API"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.copy_api(current_user, project_id, api_id, copy_data)

@apis_blp.route('/<string:project_id>/apis/<string:api_id>/versions')
class ApiVersionsAPI(MethodView):
    @jwt_required()
    @apis_blp.response(200, ApiResponseSchema)
    def get(self, project_id, api_id):
        """获取API版本历史"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.get_api_versions(current_user, project_id, api_id)

@apis_blp.route('/<string:project_id>/apis/bulk-update')
class ApiBulkUpdateAPI(MethodView):
    @jwt_required()
    @apis_blp.arguments(ApiBulkUpdateSchema)
    @apis_blp.response(200, ApiResponseSchema)
    def post(self, bulk_data, project_id):
        """批量更新API"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.bulk_update_apis(current_user, project_id, bulk_data)

# 全局API搜索
@apis_blp.route('/search')
class GlobalApiSearchAPI(MethodView):
    @jwt_required()
    @apis_blp.arguments(GlobalApiSearchSchema, location='query')
    @apis_blp.response(200, ApiResponseSchema)
    def get(self, query_args):
        """跨专案搜索API"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ApiController.search_apis(current_user, query_args)
