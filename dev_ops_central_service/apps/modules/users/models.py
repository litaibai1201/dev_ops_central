"""
用户模块 - 数据模型
"""

from sqlalchemy.orm import joinedload
from sqlalchemy import or_, and_, text

from apps import db
from apps.models import User, Group, group_members

class UserModel:
    """用户相关数据操作"""
    
    @staticmethod
    def get_user_by_id(user_id):
        """通过ID获取用户"""
        return User.query.get(user_id)
    
    @staticmethod
    def get_users_with_pagination(page=1, page_size=20, search='', role='', sort_by='created_at', sort_order='desc'):
        """分页获取用户列表"""
        query = User.query
        
        # 应用搜索过滤
        if search:
            query = query.filter(
                or_(
                    User.username.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        # 应用角色过滤
        if role:
            query = query.filter(User.role == role)
        
        # 应用排序
        if hasattr(User, sort_by):
            field = getattr(User, sort_by)
            if sort_order == 'asc':
                query = query.order_by(field.asc())
            else:
                query = query.order_by(field.desc())
        
        return query
    
    @staticmethod
    def update_user(user, data):
        """更新用户信息"""
        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        return user
    
    @staticmethod
    def delete_user(user):
        """删除用户"""
        db.session.delete(user)
    
    @staticmethod
    def check_username_exists(username, exclude_user_id=None):
        """检查用户名是否已存在"""
        query = User.query.filter(User.username == username)
        if exclude_user_id:
            query = query.filter(User.id != exclude_user_id)
        return query.first() is not None
    
    @staticmethod
    def check_email_exists(email, exclude_user_id=None):
        """检查邮箱是否已存在"""
        query = User.query.filter(User.email == email)
        if exclude_user_id:
            query = query.filter(User.id != exclude_user_id)
        return query.first() is not None
    
    @staticmethod
    def search_users(search_query, limit=20):
        """搜索用户"""
        if not search_query:
            return []
        
        return User.query.filter(
            or_(
                User.username.ilike(f'%{search_query}%'),
                User.email.ilike(f'%{search_query}%')
            )
        ).limit(limit).all()
    
    @staticmethod
    def get_available_users_for_group(group_id, search='', exclude_user_ids=None):
        """获取可添加到群组的用户列表"""
        query = User.query
        
        # 应用搜索过滤
        if search:
            query = query.filter(
                or_(
                    User.username.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        # 排除指定用户
        if exclude_user_ids:
            query = query.filter(~User.id.in_(exclude_user_ids))
        
        # 排除指定群组的成员
        if group_id:
            existing_members = db.session.query(group_members.c.user_id).filter(
                group_members.c.group_id == group_id
            ).subquery()
            query = query.filter(~User.id.in_(existing_members))
        
        return query.limit(50).all()
    
    @staticmethod
    def get_user_groups(user_id):
        """获取用户所属的群组列表 - 包含成员信息"""
        user = User.query.get(user_id)
        if not user:
            return None
        
        # 获取用户拥有的群组
        owned_groups = Group.query.filter_by(owner_id=user_id).all()
        
        # 获取用户参与的群组（通过group_members表）
        member_group_ids = db.session.query(group_members.c.group_id).filter(
            group_members.c.user_id == user_id
        ).all()
        member_group_ids = [gid[0] for gid in member_group_ids]
        
        # 获取参与的群组（排除已拥有的群组）
        owned_group_ids = [g.id for g in owned_groups]
        member_only_group_ids = [gid for gid in member_group_ids if gid not in owned_group_ids]
        
        member_groups = []
        if member_only_group_ids:
            member_groups = Group.query.filter(Group.id.in_(member_only_group_ids)).all()
        
        # 合并所有群组
        all_groups = owned_groups + member_groups
        
        # 为每个群组预加载owner信息
        for group in all_groups:
            if not hasattr(group, 'owner') or group.owner is None:
                group.owner = User.query.get(group.owner_id)
        
        return all_groups
    
    @staticmethod
    def get_user_group_memberships(user_id):
        """获取用户的群组成员关系"""
        return db.session.query(group_members).filter(
            group_members.c.user_id == user_id
        ).all()
    
    @staticmethod
    def get_user_join_requests(user_id):
        """获取用户的入组申请历史"""
        from apps.models import JoinRequest
        return JoinRequest.query.filter_by(user_id=user_id).order_by(
            JoinRequest.created_at.desc()
        ).all()
    
    @staticmethod
    def get_user_stats(user_id):
        """获取用户统计信息"""
        user = User.query.get(user_id)
        if not user:
            return None
        
        # 统计群组数量
        group_count = len(user.group_memberships) + len(user.owned_groups)
        
        # 统计专案数量（通过群组）
        project_count = sum(group.project_count for group in user.owned_groups)
        for group in user.group_memberships:
            project_count += group.project_count
        
        # 统计API数量
        api_count = len(user.created_apis)
        
        return {
            'group_count': group_count,
            'project_count': project_count,
            'api_count': api_count
        }
