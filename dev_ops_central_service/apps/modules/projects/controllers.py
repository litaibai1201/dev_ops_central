"""
专案模块 - 业务逻辑控制器
"""

from apps import db
from apps.utils import (
    success_response, error_response, forbidden_response, not_found_response,
    conflict_response, paginate_query, can_access_project, check_project_edit_permission
)
from .models import ProjectModel

class ProjectController:
    """专案相关业务逻辑"""
    
    @staticmethod
    def get_projects(current_user, query_args):
        """获取专案列表（分页）"""
        page = query_args.get('page', 1)
        page_size = query_args.get('page_size', 20)
        search = query_args.get('search', '')
        group_id = query_args.get('group_id', '')
        status = query_args.get('status', '')
        sort_by = query_args.get('sort_by', 'created_at')
        sort_order = query_args.get('sort_order', 'desc')
        
        # 获取查询
        query = ProjectModel.get_projects_with_pagination(
            current_user=current_user, page=page, page_size=page_size,
            search=search, group_id=group_id, status=status,
            sort_by=sort_by, sort_order=sort_order
        )
        
        # 分页
        result = paginate_query(query, page, page_size)
        
        # 序列化数据
        from apps.schemas.models_schema import ProjectSchema
        project_schema = ProjectSchema(many=True)
        result['data'] = project_schema.dump(result['data'])
        
        return success_response(result, '获取成功')
    
    @staticmethod
    def create_project(current_user, project_data):
        """创建专案"""
        group_id = project_data['group_id']
        name = project_data['name']
        description = project_data.get('description', '')
        is_public = project_data.get('is_public', True)
        tags = project_data.get('tags', [])
        version = project_data.get('version', 'v1.0.0')
        
        # 检查群组是否存在
        from apps.models import Group
        group = Group.query.get(group_id)
        if not group:
            return not_found_response('群组')
        
        # 检查权限
        if not check_project_edit_permission(current_user.id, group_id):
            return forbidden_response('无专案创建权限')
        
        # 检查同群组内专案名称是否重复
        if ProjectModel.check_project_name_exists_in_group(name, group_id):
            return conflict_response('同群组内专案名称已存在')
        
        # 创建专案
        try:
            project = ProjectModel.create_project(
                name=name, description=description, group_id=group_id,
                is_public=is_public, tags=tags, version=version
            )
            db.session.add(project)
            db.session.commit()
            
            # 重新查询以获取完整数据
            project = ProjectModel.get_project_with_relations(project.id)
            
            from apps.schemas.models_schema import ProjectSchema
            project_schema = ProjectSchema()
            project_data = project_schema.dump(project)
            
            return success_response(project_data, '创建成功', 201)
            
        except Exception as e:
            db.session.rollback()
            return error_response('创建失败，请重试', 500)
    
    @staticmethod
    def get_project(current_user, project_id):
        """获取专案详情"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        project = ProjectModel.get_project_with_relations(project_id)
        
        if not project:
            return not_found_response('专案')
        
        from apps.schemas.models_schema import ProjectSchema
        project_schema = ProjectSchema()
        project_data = project_schema.dump(project)
        
        return success_response(project_data, '获取成功')
    
    @staticmethod
    def update_project(current_user, project_id, project_data):
        """更新专案信息"""
        project = ProjectModel.get_project_by_id(project_id)
        if not project:
            return not_found_response('专案')
        
        # 检查编辑权限
        if not check_project_edit_permission(current_user.id, project_id):
            return forbidden_response('无专案编辑权限')
        
        # 检查名称是否重复
        if 'name' in project_data:
            if ProjectModel.check_project_name_exists_in_group(
                project_data['name'], project.group_id, project_id
            ):
                return conflict_response('同群组内专案名称已存在')
        
        # 更新专案信息
        try:
            ProjectModel.update_project(project, project_data)
            db.session.commit()
            
            from apps.schemas.models_schema import ProjectSchema
            project_schema = ProjectSchema()
            project_data = project_schema.dump(project)
            
            return success_response(project_data, '更新成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('更新失败，请重试', 500)
    
    @staticmethod
    def delete_project(current_user, project_id):
        """删除专案"""
        project = ProjectModel.get_project_by_id(project_id)
        if not project:
            return not_found_response('专案')
        
        # 检查删除权限（只有群主和系统管理员可以删除）
        group = project.group
        if (group.owner_id != current_user.id and 
            current_user.role != 'system_admin'):
            return forbidden_response('无专案删除权限')
        
        try:
            ProjectModel.delete_project(project)
            db.session.commit()
            
            return success_response(None, '删除成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('删除失败，请重试', 500)
    
    @staticmethod
    def get_project_folders(current_user, project_id):
        """获取专案文件夹"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        # 获取根级文件夹
        folders = ProjectModel.get_project_folders(project_id)
        
        from apps.schemas.models_schema import ApiFolderSchema
        folder_schema = ApiFolderSchema(many=True)
        folders_data = folder_schema.dump(folders)
        
        return success_response(folders_data, '获取成功')
    
    @staticmethod
    def create_folder(current_user, project_id, folder_data):
        """创建文件夹"""
        project = ProjectModel.get_project_by_id(project_id)
        if not project:
            return not_found_response('专案')
        
        # 检查编辑权限
        if not check_project_edit_permission(current_user.id, project_id):
            return forbidden_response('无专案编辑权限')
        
        name = folder_data['name']
        description = folder_data.get('description', '')
        parent_id = folder_data.get('parent_id')
        
        # 验证父文件夹是否存在且属于同一专案
        if parent_id:
            from apps.models import ApiFolder
            parent_folder = ApiFolder.query.get(parent_id)
            if not parent_folder or parent_folder.project_id != project_id:
                return error_response('父文件夹不存在或不属于该专案')
        
        # 创建文件夹
        try:
            folder = ProjectModel.create_folder(
                name=name, description=description,
                project_id=project_id, parent_id=parent_id
            )
            db.session.add(folder)
            db.session.commit()
            
            from apps.schemas.models_schema import ApiFolderSchema
            folder_schema = ApiFolderSchema()
            folder_data = folder_schema.dump(folder)
            
            return success_response(folder_data, '创建成功', 201)
            
        except Exception as e:
            db.session.rollback()
            return error_response('创建失败，请重试', 500)
    
    @staticmethod
    def get_project_environments(current_user, project_id):
        """获取环境配置"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        environments = ProjectModel.get_project_environments(project_id)
        
        from apps.schemas.models_schema import EnvironmentSchema
        env_schema = EnvironmentSchema(many=True)
        envs_data = env_schema.dump(environments)
        
        return success_response(envs_data, '获取成功')
    
    @staticmethod
    def create_environment(current_user, project_id, env_data):
        """创建环境配置"""
        project = ProjectModel.get_project_by_id(project_id)
        if not project:
            return not_found_response('专案')
        
        # 检查编辑权限
        if not check_project_edit_permission(current_user.id, project_id):
            return forbidden_response('无专案编辑权限')
        
        name = env_data['name']
        description = env_data.get('description', '')
        base_url = env_data.get('base_url', '')
        variables = env_data.get('variables', {})
        headers = env_data.get('headers', {})
        
        # 检查环境名称是否重复
        if ProjectModel.check_environment_name_exists(name, project_id):
            return conflict_response('环境名称已存在')
        
        # 创建环境配置
        try:
            environment = ProjectModel.create_environment(
                name=name, description=description, project_id=project_id,
                base_url=base_url, variables=variables, headers=headers
            )
            db.session.add(environment)
            db.session.commit()
            
            from apps.schemas.models_schema import EnvironmentSchema
            env_schema = EnvironmentSchema()
            env_data = env_schema.dump(environment)
            
            return success_response(env_data, '创建成功', 201)
            
        except Exception as e:
            db.session.rollback()
            return error_response('创建失败，请重试', 500)
    
    @staticmethod
    def get_project_test_cases(current_user, project_id, query_args):
        """获取测试用例"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        api_id = query_args.get('api_id')
        
        test_cases = ProjectModel.get_project_test_cases(project_id, api_id)
        
        from apps.schemas.models_schema import TestCaseSchema
        test_case_schema = TestCaseSchema(many=True)
        test_cases_data = test_case_schema.dump(test_cases)
        
        return success_response(test_cases_data, '获取成功')
    
    @staticmethod
    def run_test_case(current_user, project_id, test_case_id):
        """运行测试用例"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        test_case = ProjectModel.get_test_case_by_id(test_case_id, project_id)
        
        if not test_case:
            return not_found_response('测试用例')
        
        # TODO: 实现实际的测试执行逻辑
        # 这里返回模拟的测试结果
        from apps.models import TestResult
        import uuid
        from datetime import datetime, timezone
        
        try:
            test_result = TestResult(
                id=str(uuid.uuid4()),
                test_case_id=test_case_id,
                status='passed',
                response_time=150,
                response_code=200,
                response_body='{"success": true}',
                errors=[],
                executed_by=current_user.id,
                executed_at=datetime.now(timezone.utc)
            )
            db.session.add(test_result)
            db.session.commit()
            
            from apps.schemas.models_schema import TestResultSchema
            result_schema = TestResultSchema()
            result_data = result_schema.dump(test_result)
            
            return success_response(result_data, '测试执行成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('测试执行失败，请重试', 500)
    
    @staticmethod
    def batch_test_apis(current_user, project_id, test_data):
        """批量运行测试"""
        if not can_access_project(current_user.id, project_id):
            return forbidden_response('无专案访问权限')
        
        environment = test_data.get('environment')
        api_ids = test_data.get('api_ids', [])
        
        # 获取要测试的用例
        test_cases = ProjectModel.get_test_cases_for_batch_run(
            project_id, api_ids, environment
        )
        
        if not test_cases:
            return not_found_response('匹配的测试用例')
        
        # TODO: 实现实际的批量测试执行逻辑
        # 这里返回模拟的测试结果
        from apps.models import TestResult
        from apps.schemas.models_schema import TestResultSchema
        import uuid
        from datetime import datetime, timezone
        
        results = []
        try:
            for test_case in test_cases:
                test_result = TestResult(
                    id=str(uuid.uuid4()),
                    test_case_id=test_case.id,
                    status='passed',
                    response_time=150,
                    response_code=200,
                    response_body='{"success": true}',
                    errors=[],
                    executed_by=current_user.id,
                    executed_at=datetime.now(timezone.utc)
                )
                db.session.add(test_result)
                results.append(test_result)
            
            db.session.commit()
            
            result_schema = TestResultSchema(many=True)
            results_data = result_schema.dump(results)
            
            return success_response(results_data, '批量测试执行成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('批量测试执行失败，请重试', 500)
