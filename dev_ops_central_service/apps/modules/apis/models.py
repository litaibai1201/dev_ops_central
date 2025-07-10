"""
API模块 - 数据模型
"""

from sqlalchemy.orm import joinedload
from sqlalchemy import or_, and_

from apps import db
from apps.models import ApiMethod, Project, Group, group_members

class ApiModel:
    """API相关数据操作"""
    
    @staticmethod
    def get_api_by_id(api_id):
        """通过ID获取API"""
        return ApiMethod.query.get(api_id)
    
    @staticmethod
    def get_api_with_relations(api_id):
        """获取包含关联数据的API"""
        return ApiMethod.query.options(
            joinedload(ApiMethod.creator),
            joinedload(ApiMethod.project),
            joinedload(ApiMethod.folder)
        ).get(api_id)
    
    @staticmethod
    def get_project_apis(project_id, search='', method='', folder_id=''):
        """获取专案的API列表"""
        query = ApiMethod.query.filter_by(project_id=project_id).options(
            joinedload(ApiMethod.creator),
            joinedload(ApiMethod.folder)
        )
        
        # 应用搜索过滤
        if search:
            query = query.filter(
                or_(
                    ApiMethod.name.ilike(f'%{search}%'),
                    ApiMethod.description.ilike(f'%{search}%'),
                    ApiMethod.url.ilike(f'%{search}%')
                )
            )
        
        # 应用方法过滤
        if method:
            query = query.filter(ApiMethod.method == method)
        
        # 应用文件夹过滤
        if folder_id:
            query = query.filter(ApiMethod.folder_id == folder_id)
        
        return query.order_by(ApiMethod.created_at.desc())
    
    @staticmethod
    def create_api(name, description, method, url, project_id, folder_id=None, 
                   headers=None, params=None, body=None, tags=None, status='draft', created_by=None):
        """创建API"""
        api_method = ApiMethod(
            name=name,
            description=description,
            method=method,
            url=url,
            project_id=project_id,
            folder_id=folder_id,
            headers=headers or {},
            params=params or [],
            body=body,
            responses=[],  # 初始为空，后续可以添加
            tags=tags or [],
            status=status,
            created_by=created_by
        )
        return api_method
    
    @staticmethod
    def update_api(api_method, data):
        """更新API信息"""
        for key, value in data.items():
            if hasattr(api_method, key):
                setattr(api_method, key, value)
        return api_method
    
    @staticmethod
    def delete_api(api_method):
        """删除API"""
        db.session.delete(api_method)
    
    @staticmethod
    def check_api_exists_in_project(method, url, project_id, exclude_api_id=None):
        """检查同专案内URL是否重复"""
        query = ApiMethod.query.filter(
            and_(
                ApiMethod.project_id == project_id,
                ApiMethod.method == method,
                ApiMethod.url == url
            )
        )
        if exclude_api_id:
            query = query.filter(ApiMethod.id != exclude_api_id)
        return query.first() is not None
    
    @staticmethod
    def validate_folder_belongs_to_project(folder_id, project_id):
        """验证文件夹是否属于指定专案"""
        if not folder_id:
            return True
        
        from apps.models import ApiFolder
        folder = ApiFolder.query.get(folder_id)
        return folder and folder.project_id == project_id
    
    @staticmethod
    def copy_api(source_api, target_project_id, new_name=None):
        """复制API到其他专案"""
        api_copy = ApiMethod(
            name=new_name or f"{source_api.name} (副本)",
            description=source_api.description,
            method=source_api.method,
            url=source_api.url,
            project_id=target_project_id,
            folder_id=None,  # 复制到目标专案的根目录
            headers=source_api.headers,
            params=source_api.params,
            body=source_api.body,
            responses=source_api.responses,
            tags=source_api.tags,
            status='draft',  # 复制的API默认为草稿状态
            created_by=source_api.created_by
        )
        return api_copy
    
    @staticmethod
    def bulk_update_apis(api_ids, update_data):
        """批量更新API"""
        query = ApiMethod.query.filter(ApiMethod.id.in_(api_ids))
        apis = query.all()
        
        for api in apis:
            for key, value in update_data.items():
                if hasattr(api, key):
                    setattr(api, key, value)
        
        return apis
    
    @staticmethod
    def get_api_versions(api_id):
        """获取API版本历史（模拟数据）"""
        # 在实际项目中，这里应该从版本记录表查询
        return [
            {
                'version': '1.0.0',
                'description': '初始版本',
                'created_at': '2024-01-01T00:00:00Z',
                'created_by': 'user_id'
            }
        ]
    
    @staticmethod
    def search_apis_across_projects(user_id, search_query, filters=None):
        """跨专案搜索API"""
        # 获取用户有权限访问的专案
        accessible_projects = []
        
        # 用户拥有的群组的专案
        owned_groups = Group.query.filter_by(owner_id=user_id).all()
        for group in owned_groups:
            accessible_projects.extend([p.id for p in group.projects])
        
        # 用户是成员的群组的专案
        member_groups = db.session.query(group_members.c.group_id).filter(
            group_members.c.user_id == user_id
        ).all()
        member_group_ids = [g.group_id for g in member_groups]
        member_group_projects = Project.query.filter(
            Project.group_id.in_(member_group_ids)
        ).all()
        accessible_projects.extend([p.id for p in member_group_projects])
        
        # 公开专案
        public_projects = Project.query.filter_by(is_public=True).all()
        accessible_projects.extend([p.id for p in public_projects])
        
        # 去重
        accessible_projects = list(set(accessible_projects))
        
        # 构建搜索查询
        query = ApiMethod.query.filter(
            ApiMethod.project_id.in_(accessible_projects)
        ).options(
            joinedload(ApiMethod.creator),
            joinedload(ApiMethod.project)
        )
        
        if search_query:
            query = query.filter(
                or_(
                    ApiMethod.name.ilike(f'%{search_query}%'),
                    ApiMethod.description.ilike(f'%{search_query}%'),
                    ApiMethod.url.ilike(f'%{search_query}%')
                )
            )
        
        # 应用过滤器
        if filters:
            if filters.get('method'):
                query = query.filter(ApiMethod.method == filters['method'])
            if filters.get('status'):
                query = query.filter(ApiMethod.status == filters['status'])
            if filters.get('tags'):
                # PostgreSQL JSON数组查询
                for tag in filters['tags']:
                    query = query.filter(ApiMethod.tags.op('?')(tag))
        
        return query.order_by(ApiMethod.created_at.desc())
