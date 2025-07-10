"""
群组模块 - 数据模型
"""

from sqlalchemy.orm import joinedload
from sqlalchemy import or_, and_

from apps import db
from apps.models import Group, User, group_members

class GroupModel:
    """群组相关数据操作"""
    
    @staticmethod
    def get_group_by_id(group_id):
        """通过ID获取群组"""
        return Group.query.get(group_id)
    
    @staticmethod
    def get_group_with_relations(group_id):
        """获取包含关联数据的群组"""
        return Group.query.options(
            joinedload(Group.owner),
            joinedload(Group.members)
        ).get(group_id)
    
    @staticmethod
    def get_groups_with_pagination(page=1, page_size=20, search='', owner_id='', sort_by='created_at', sort_order='desc'):
        """分页获取群组列表"""
        query = Group.query.options(joinedload(Group.owner))
        
        # 应用搜索过滤
        if search:
            query = query.filter(
                or_(
                    Group.name.ilike(f'%{search}%'),
                    Group.description.ilike(f'%{search}%')
                )
            )
        
        # 应用所有者过滤
        if owner_id:
            query = query.filter(Group.owner_id == owner_id)
        
        # 应用排序
        if hasattr(Group, sort_by):
            field = getattr(Group, sort_by)
            if sort_order == 'asc':
                query = query.order_by(field.asc())
            else:
                query = query.order_by(field.desc())
        
        return query
    
    @staticmethod
    def create_group(name, description, owner_id):
        """创建群组"""
        group = Group(
            name=name,
            description=description,
            owner_id=owner_id
        )
        return group
    
    @staticmethod
    def update_group(group, data):
        """更新群组信息"""
        for key, value in data.items():
            if hasattr(group, key):
                setattr(group, key, value)
        return group
    
    @staticmethod
    def delete_group(group):
        """删除群组"""
        # 删除群组成员关系
        db.session.execute(
            group_members.delete().where(group_members.c.group_id == group.id)
        )
        # 删除群组
        db.session.delete(group)
    
    @staticmethod
    def check_group_name_exists(name, exclude_group_id=None):
        """检查群组名称是否已存在"""
        query = Group.query.filter(Group.name == name)
        if exclude_group_id:
            query = query.filter(Group.id != exclude_group_id)
        return query.first() is not None
    
    @staticmethod
    def get_group_members(group_id):
        """获取群组成员列表"""
        members_query = db.session.query(group_members).filter(
            group_members.c.group_id == group_id
        )
        
        members = []
        for member in members_query:
            user = User.query.get(member.user_id)
            if user:
                from apps.schemas import UserSchema
                member_data = {
                    'id': member.id,
                    'user_id': member.user_id,
                    'group_id': member.group_id,
                    'user': UserSchema().dump(user),
                    'role': member.role,
                    'permissions': member.permissions,
                    'joined_at': member.joined_at.isoformat() if member.joined_at else None
                }
                members.append(member_data)
        
        return members
    
    @staticmethod
    def add_group_member(user_id, group_id, role='member', permissions=None):
        """添加群组成员"""
        if permissions is None:
            permissions = {
                'can_approve_members': False,
                'can_edit_project': False,
                'can_manage_members': False
            }
        
        db.session.execute(
            group_members.insert().values(
                user_id=user_id,
                group_id=group_id,
                role=role,
                permissions=permissions
            )
        )
    
    @staticmethod
    def update_group_member(member_id, role=None, permissions=None):
        """更新群组成员权限"""
        update_data = {}
        if role is not None:
            update_data['role'] = role
        if permissions is not None:
            update_data['permissions'] = permissions
        
        if update_data:
            db.session.execute(
                group_members.update().where(
                    group_members.c.id == member_id
                ).values(**update_data)
            )
    
    @staticmethod
    def remove_group_member(member_id):
        """移除群组成员"""
        db.session.execute(
            group_members.delete().where(group_members.c.id == member_id)
        )
    
    @staticmethod
    def get_group_member(member_id):
        """获取群组成员信息"""
        return db.session.query(group_members).filter(
            group_members.c.id == member_id
        ).first()
    
    @staticmethod
    def get_group_member_by_user(user_id, group_id):
        """通过用户和群组获取成员信息"""
        return db.session.query(group_members).filter(
            and_(
                group_members.c.user_id == user_id,
                group_members.c.group_id == group_id
            )
        ).first()
    
    @staticmethod
    def check_user_is_member(user_id, group_id):
        """检查用户是否为群组成员"""
        member = db.session.query(group_members).filter(
            and_(
                group_members.c.user_id == user_id,
                group_members.c.group_id == group_id
            )
        ).first()
        return member is not None
    
    @staticmethod
    def get_group_stats(group_id):
        """获取群组统计信息"""
        group = Group.query.get(group_id)
        if not group:
            return None
        
        # 统计成员数量
        member_count = db.session.query(group_members).filter(
            group_members.c.group_id == group_id
        ).count()
        
        # 统计专案数量
        project_count = len(group.projects)
        
        # 统计API数量
        api_count = 0
        for project in group.projects:
            api_count += len(project.apis)
        
        # 统计待处理申请数量
        from apps.models import JoinRequest
        pending_request_count = JoinRequest.query.filter(
            and_(
                JoinRequest.group_id == group_id,
                JoinRequest.status == 'pending'
            )
        ).count()
        
        return {
            'member_count': member_count,
            'project_count': project_count,
            'api_count': api_count,
            'pending_request_count': pending_request_count
        }
    
    @staticmethod
    def transfer_group_ownership(group, new_owner_id):
        """转移群组所有权"""
        group.owner_id = new_owner_id
        return group
