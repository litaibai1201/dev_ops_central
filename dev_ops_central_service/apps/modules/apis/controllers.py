"""
API模块 - 业务逻辑控制器
"""

from apps import db
from apps.utils import (
    success_response, error_response, forbidden_response, not_found_response,
    conflict_response, can_access_project, check_project_edit_permission,
    test_api_request
)
from .models import ApiModel

class ApiController:
    """API相关业务逻辑"""
    
    @staticmethod
    def get_project_apis(current_user, project_id, query_args):
        """获取专案的API列表"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        search = query_args.get('search', '')
        method = query_args.get('method', '')
        folder_id = query_args.get('folder_id', '')
        
        # 获取API列表
        apis = ApiModel.get_project_apis(project_id, search, method, folder_id).all()
        
        from apps.schemas.models_schema import ApiMethodSchema
        api_schema = ApiMethodSchema(many=True)
        apis_data = api_schema.dump(apis)
        
        return success_response(apis_data, '获取成功')
    
    @staticmethod
    def create_api(current_user, project_id, api_data):
        """创建API"""
        from apps.models import Project
        project = Project.query.get(project_id)
        if not project:
            return not_found_response('专案')
        
        # 检查编辑权限
        if not check_project_edit_permission(current_user.id, project_id):
            return forbidden_response('无API编辑权限')
        
        name = api_data['name']
        description = api_data.get('description', '')
        method = api_data['method']
        url = api_data['url']
        folder_id = api_data.get('folder_id')
        headers = api_data.get('headers', {})
        params = api_data.get('params', [])
        body = api_data.get('body')
        tags = api_data.get('tags', [])
        status = api_data.get('status', 'draft')
        
        # 验证文件夹是否存在且属于同一专案
        if not ApiModel.validate_folder_belongs_to_project(folder_id, project_id):
            return error_response('文件夹不存在或不属于该专案')
        
        # 检查同专案内URL是否重复
        if ApiModel.check_api_exists_in_project(method, url, project_id):
            return conflict_response('同专案内该方法和URL的API已存在')
        
        # 创建API
        try:
            api_method = ApiModel.create_api(
                name=name, description=description, method=method, url=url,
                project_id=project_id, folder_id=folder_id, headers=headers,
                params=params, body=body, tags=tags, status=status,
                created_by=current_user.id
            )
            db.session.add(api_method)
            db.session.commit()
            
            # 重新查询以获取完整数据
            api_method = ApiModel.get_api_with_relations(api_method.id)
            
            from apps.schemas.models_schema import ApiMethodSchema
            api_schema = ApiMethodSchema()
            api_data = api_schema.dump(api_method)
            
            return success_response(api_data, '创建成功', 201)
            
        except Exception as e:
            db.session.rollback()
            return error_response('创建失败，请重试', 500)
    
    @staticmethod
    def get_api(current_user, project_id, api_id):
        """获取API详情"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        api_method = ApiModel.get_api_with_relations(api_id)
        
        if not api_method or api_method.project_id != project_id:
            return not_found_response('API')
        
        from apps.schemas.models_schema import ApiMethodSchema
        api_schema = ApiMethodSchema()
        api_data = api_schema.dump(api_method)
        
        return success_response(api_data, '获取成功')
    
    @staticmethod
    def update_api(current_user, project_id, api_id, api_data):
        """更新API"""
        from apps.models import Project
        project = Project.query.get(project_id)
        if not project:
            return not_found_response('专案')
        
        # 检查编辑权限
        if not check_project_edit_permission(current_user.id, project_id):
            return forbidden_response('无API编辑权限')
        
        api_method = ApiModel.get_api_by_id(api_id)
        if not api_method or api_method.project_id != project_id:
            return not_found_response('API')
        
        # 验证文件夹是否存在且属于同一专案
        folder_id = api_data.get('folder_id')
        if folder_id and not ApiModel.validate_folder_belongs_to_project(folder_id, project_id):
            return error_response('文件夹不存在或不属于该专案')
        
        # 检查URL是否重复
        if 'method' in api_data and 'url' in api_data:
            if ApiModel.check_api_exists_in_project(
                api_data['method'], api_data['url'], project_id, api_id
            ):
                return conflict_response('同专案内该方法和URL的API已存在')
        
        # 更新API
        try:
            ApiModel.update_api(api_method, api_data)
            db.session.commit()
            
            from apps.schemas.models_schema import ApiMethodSchema
            api_schema = ApiMethodSchema()
            api_data = api_schema.dump(api_method)
            
            return success_response(api_data, '更新成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('更新失败，请重试', 500)
    
    @staticmethod
    def delete_api(current_user, project_id, api_id):
        """删除API"""
        from apps.models import Project
        project = Project.query.get(project_id)
        if not project:
            return not_found_response('专案')
        
        # 检查编辑权限
        if not check_project_edit_permission(current_user.id, project_id):
            return forbidden_response('无API编辑权限')
        
        api_method = ApiModel.get_api_by_id(api_id)
        if not api_method or api_method.project_id != project_id:
            return not_found_response('API')
        
        try:
            ApiModel.delete_api(api_method)
            db.session.commit()
            
            return success_response(None, '删除成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('删除失败，请重试', 500)
    
    @staticmethod
    def test_api(current_user, project_id, api_id, test_data):
        """测试API"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        api_method = ApiModel.get_api_with_relations(api_id)
        if not api_method or api_method.project_id != project_id:
            return not_found_response('API')
        
        environment = test_data.get('environment')
        headers = test_data.get('headers', {})
        params = test_data.get('params', {})
        body = test_data.get('body')
        
        # 构建完整的请求URL
        # 这里应该根据环境配置构建完整URL
        # 暂时使用API的URL作为测试URL
        test_url = api_method.url
        
        # 合并headers
        merged_headers = {**api_method.headers, **headers}
        
        try:
            # 执行API测试
            response = test_api_request(
                method=api_method.method,
                url=test_url,
                headers=merged_headers,
                params=params,
                body=body
            )
            
            return success_response(response, '测试完成')
            
        except Exception as e:
            return error_response(f'测试失败: {str(e)}', 500)
    
    @staticmethod
    def copy_api(current_user, project_id, api_id, copy_data):
        """复制API"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        # 获取源API
        source_api = ApiModel.get_api_by_id(api_id)
        if not source_api or source_api.project_id != project_id:
            return not_found_response('API')
        
        target_project_id = copy_data.get('target_project_id', project_id)
        new_name = copy_data.get('new_name')
        
        # 检查目标专案的编辑权限
        if not check_project_edit_permission(current_user.id, target_project_id):
            return forbidden_response('无目标专案编辑权限')
        
        try:
            # 复制API
            api_copy = ApiModel.copy_api(source_api, target_project_id, new_name)
            api_copy.created_by = current_user.id
            
            db.session.add(api_copy)
            db.session.commit()
            
            from apps.schemas.models_schema import ApiMethodSchema
            api_schema = ApiMethodSchema()
            api_data = api_schema.dump(api_copy)
            
            return success_response(api_data, '复制成功', 201)
            
        except Exception as e:
            db.session.rollback()
            return error_response('复制失败，请重试', 500)
    
    @staticmethod
    def bulk_update_apis(current_user, project_id, bulk_data):
        """批量更新API"""
        if not check_project_edit_permission(current_user.id, project_id):
            return forbidden_response('无API编辑权限')
        
        api_ids = bulk_data.get('api_ids', [])
        update_data = bulk_data.get('update_data', {})
        
        if not api_ids:
            return error_response('请选择要更新的API')
        
        try:
            # 验证所有API都属于该专案
            apis = ApiModel.get_project_apis(project_id).filter(
                ApiModel.api_method.id.in_(api_ids)
            ).all()
            
            if len(apis) != len(api_ids):
                return error_response('部分API不存在或不属于该专案')
            
            # 批量更新
            updated_apis = ApiModel.bulk_update_apis(api_ids, update_data)
            db.session.commit()
            
            from apps.schemas.models_schema import ApiMethodSchema
            api_schema = ApiMethodSchema(many=True)
            apis_data = api_schema.dump(updated_apis)
            
            return success_response(apis_data, f'成功更新{len(updated_apis)}个API')
            
        except Exception as e:
            db.session.rollback()
            return error_response('批量更新失败，请重试', 500)
    
    @staticmethod
    def search_apis(current_user, query_args):
        """跨专案搜索API"""
        search_query = query_args.get('q', '')
        method = query_args.get('method')
        status = query_args.get('status')
        tags = query_args.get('tags', [])
        
        if not search_query:
            return success_response([], '请输入搜索关键词')
        
        filters = {}
        if method:
            filters['method'] = method
        if status:
            filters['status'] = status
        if tags:
            filters['tags'] = tags
        
        # 执行搜索
        apis = ApiModel.search_apis_across_projects(
            current_user.id, search_query, filters
        ).limit(50).all()
        
        from apps.schemas.models_schema import ApiMethodSchema
        api_schema = ApiMethodSchema(many=True)
        apis_data = api_schema.dump(apis)
        
        return success_response(apis_data, '搜索完成')
    
    @staticmethod
    def get_api_versions(current_user, project_id, api_id):
        """获取API版本历史"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        api_method = ApiModel.get_api_by_id(api_id)
        if not api_method or api_method.project_id != project_id:
            return not_found_response('API')
        
        versions = ApiModel.get_api_versions(api_id)
        
        return success_response(versions, '获取成功')
