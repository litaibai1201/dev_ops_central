"""
专案模块 - 视图层
"""

from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from apps.utils import get_current_user, error_response
from apps.schemas import (
    ProjectSearchSchema, ProjectCreateSchema, ProjectUpdateSchema,
    EnvironmentCreateSchema, ApiFolderCreateSchema, ApiResponseSchema,
    TestCaseQuerySchema, BatchTestSchema
)
from .controllers import ProjectController

projects_blp = Blueprint('projects', __name__, url_prefix='/api/projects', description='专案管理相关接口')

@projects_blp.route('')
class ProjectsAPI(MethodView):
    @jwt_required()
    @projects_blp.arguments(ProjectSearchSchema, location='query')
    @projects_blp.response(200, ApiResponseSchema)
    def get(self, query_args):
        """获取专案列表（分页）"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.get_projects(current_user, query_args)
    
    @jwt_required()
    @projects_blp.arguments(ProjectCreateSchema)
    @projects_blp.response(201, ApiResponseSchema)
    def post(self, project_data):
        """创建专案"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.create_project(current_user, project_data)

@projects_blp.route('/<string:project_id>')
class ProjectAPI(MethodView):
    @jwt_required()
    @projects_blp.response(200, ApiResponseSchema)
    def get(self, project_id):
        """获取专案详情"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.get_project(current_user, project_id)
    
    @jwt_required()
    @projects_blp.arguments(ProjectUpdateSchema)
    @projects_blp.response(200, ApiResponseSchema)
    def put(self, project_data, project_id):
        """更新专案信息"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.update_project(current_user, project_id, project_data)
    
    @jwt_required()
    @projects_blp.response(200, ApiResponseSchema)
    def delete(self, project_id):
        """删除专案"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.delete_project(current_user, project_id)

@projects_blp.route('/<string:project_id>/folders')
class ProjectFoldersAPI(MethodView):
    @jwt_required()
    @projects_blp.response(200, ApiResponseSchema)
    def get(self, project_id):
        """获取专案文件夹"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.get_project_folders(current_user, project_id)
    
    @jwt_required()
    @projects_blp.arguments(ApiFolderCreateSchema)
    @projects_blp.response(201, ApiResponseSchema)
    def post(self, folder_data, project_id):
        """创建文件夹"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.create_folder(current_user, project_id, folder_data)

@projects_blp.route('/<string:project_id>/environments')
class ProjectEnvironmentsAPI(MethodView):
    @jwt_required()
    @projects_blp.response(200, ApiResponseSchema)
    def get(self, project_id):
        """获取环境配置"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.get_project_environments(current_user, project_id)
    
    @jwt_required()
    @projects_blp.arguments(EnvironmentCreateSchema)
    @projects_blp.response(201, ApiResponseSchema)
    def post(self, env_data, project_id):
        """创建环境配置"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.create_environment(current_user, project_id, env_data)

@projects_blp.route('/<string:project_id>/test-cases')
class ProjectTestCasesAPI(MethodView):
    @jwt_required()
    @projects_blp.arguments(TestCaseQuerySchema, location='query')
    @projects_blp.response(200, ApiResponseSchema)
    def get(self, query_args, project_id):
        """获取测试用例"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.get_project_test_cases(current_user, project_id, query_args)

@projects_blp.route('/<string:project_id>/test-cases/<string:test_case_id>/run')
class TestCaseRunAPI(MethodView):
    @jwt_required()
    @projects_blp.response(200, ApiResponseSchema)
    def post(self, project_id, test_case_id):
        """运行测试用例"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.run_test_case(current_user, project_id, test_case_id)

@projects_blp.route('/<string:project_id>/test-all')
class ProjectTestAllAPI(MethodView):
    @jwt_required()
    @projects_blp.arguments(BatchTestSchema)
    @projects_blp.response(200, ApiResponseSchema)
    def post(self, test_data, project_id):
        """批量运行测试"""
        current_user = get_current_user()
        if not current_user:
            return error_response('用户不存在', 404)
        
        return ProjectController.batch_test_apis(current_user, project_id, test_data)
