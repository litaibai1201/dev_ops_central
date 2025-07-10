"""
专案模块 - 数据模型
"""

from sqlalchemy.orm import joinedload
from sqlalchemy import or_, and_

from apps import db
from apps.models import Project, Group, Environment, TestCase, ApiFolder, group_members

class ProjectModel:
    """专案相关数据操作"""
    
    @staticmethod
    def get_project_by_id(project_id):
        """通过ID获取专案"""
        return Project.query.get(project_id)
    
    @staticmethod
    def get_project_with_relations(project_id):
        """获取包含关联数据的专案"""
        return Project.query.options(
            joinedload(Project.group).joinedload(Group.owner)
        ).get(project_id)
    
    @staticmethod
    def get_projects_with_pagination(current_user, page=1, page_size=20, search='', group_id='', status='', sort_by='created_at', sort_order='desc'):
        """分页获取专案列表"""
        query = Project.query.options(
            joinedload(Project.group).joinedload(Group.owner)
        )
        
        # 权限过滤
        if current_user.role != 'system_admin':
            # 获取用户可以访问的群组
            accessible_groups = []
            
            # 用户拥有的群组
            owned_groups = Group.query.filter_by(owner_id=current_user.id).all()
            accessible_groups.extend([g.id for g in owned_groups])
            
            # 用户是成员的群组
            member_groups = db.session.query(group_members.c.group_id).filter(
                group_members.c.user_id == current_user.id
            ).all()
            accessible_groups.extend([g.group_id for g in member_groups])
            
            # 过滤条件：公开专案或用户有权限的群组专案
            query = query.filter(
                or_(
                    Project.is_public == True,
                    Project.group_id.in_(accessible_groups)
                )
            )
        
        # 应用搜索过滤
        if search:
            query = query.filter(
                or_(
                    Project.name.ilike(f'%{search}%'),
                    Project.description.ilike(f'%{search}%')
                )
            )
        
        # 应用群组过滤
        if group_id:
            query = query.filter(Project.group_id == group_id)
        
        # 应用状态过滤
        if status:
            query = query.filter(Project.status == status)
        
        # 应用排序
        if hasattr(Project, sort_by):
            field = getattr(Project, sort_by)
            if sort_order == 'asc':
                query = query.order_by(field.asc())
            else:
                query = query.order_by(field.desc())
        
        return query
    
    @staticmethod
    def create_project(name, description, group_id, is_public=True, tags=None, version='v1.0.0'):
        """创建专案"""
        project = Project(
            name=name,
            description=description,
            group_id=group_id,
            is_public=is_public,
            tags=tags or [],
            version=version,
            status='active'
        )
        return project
    
    @staticmethod
    def update_project(project, data):
        """更新专案信息"""
        for key, value in data.items():
            if hasattr(project, key):
                setattr(project, key, value)
        return project
    
    @staticmethod
    def delete_project(project):
        """删除专案"""
        db.session.delete(project)
    
    @staticmethod
    def check_project_name_exists_in_group(name, group_id, exclude_project_id=None):
        """检查同群组内专案名称是否已存在"""
        query = Project.query.filter(
            and_(
                Project.group_id == group_id,
                Project.name == name
            )
        )
        if exclude_project_id:
            query = query.filter(Project.id != exclude_project_id)
        return query.first() is not None
    
    @staticmethod
    def get_project_folders(project_id, parent_id=None):
        """获取专案文件夹"""
        query = ApiFolder.query.filter(ApiFolder.project_id == project_id)
        if parent_id:
            query = query.filter(ApiFolder.parent_id == parent_id)
        else:
            query = query.filter(ApiFolder.parent_id.is_(None))
        
        return query.order_by(ApiFolder.created_at.asc()).all()
    
    @staticmethod
    def create_folder(name, description, project_id, parent_id=None):
        """创建文件夹"""
        folder = ApiFolder(
            name=name,
            description=description,
            project_id=project_id,
            parent_id=parent_id
        )
        return folder
    
    @staticmethod
    def get_project_environments(project_id):
        """获取环境配置"""
        return Environment.query.filter_by(project_id=project_id).order_by(
            Environment.created_at.asc()
        ).all()
    
    @staticmethod
    def create_environment(name, description, project_id, base_url='', variables=None, headers=None):
        """创建环境配置"""
        environment = Environment(
            name=name,
            description=description,
            project_id=project_id,
            base_url=base_url,
            variables=variables or {},
            headers=headers or {}
        )
        return environment
    
    @staticmethod
    def check_environment_name_exists(name, project_id, exclude_env_id=None):
        """检查环境名称是否已存在"""
        query = Environment.query.filter(
            and_(
                Environment.project_id == project_id,
                Environment.name == name
            )
        )
        if exclude_env_id:
            query = query.filter(Environment.id != exclude_env_id)
        return query.first() is not None
    
    @staticmethod
    def get_project_test_cases(project_id, api_id=None):
        """获取测试用例"""
        query = TestCase.query.filter_by(project_id=project_id)
        if api_id:
            query = query.filter_by(api_id=api_id)
        
        return query.order_by(TestCase.created_at.desc()).all()
    
    @staticmethod
    def get_test_case_by_id(test_case_id, project_id):
        """获取测试用例"""
        return TestCase.query.filter(
            and_(
                TestCase.id == test_case_id,
                TestCase.project_id == project_id
            )
        ).first()
    
    @staticmethod
    def get_test_cases_for_batch_run(project_id, api_ids=None, environment=None):
        """获取要批量测试的用例"""
        query = TestCase.query.filter_by(project_id=project_id)
        if api_ids:
            query = query.filter(TestCase.api_id.in_(api_ids))
        if environment:
            query = query.filter_by(environment=environment)
        
        return query.all()
