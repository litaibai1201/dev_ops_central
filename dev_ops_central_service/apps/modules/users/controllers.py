"""
用户模块 - 业务逻辑控制器
"""

from apps import db
from apps.utils import (
    success_response, error_response, forbidden_response, not_found_response,
    conflict_response, paginate_query_with_schema, created_response,
    get_user_recent_activities
)
from .models import UserModel

class UserController:
    """用户相关业务逻辑"""
    
    @staticmethod
    def get_users(current_user, query_args):
        """获取用户列表（分页） - 符合API文档规范"""
        # 只有系统管理员可以查看所有用户
        if current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        page = query_args.get('page', 1)
        page_size = query_args.get('pageSize', 20)  # 使用camelCase
        search = query_args.get('search', '')
        role = query_args.get('role', '')
        sort_by = query_args.get('sortBy', 'created_at')  # 使用camelCase
        sort_order = query_args.get('sortOrder', 'desc')  # 使用camelCase
        
        # 获取查询
        query = UserModel.get_users_with_pagination(
            page=page, page_size=page_size, search=search, 
            role=role, sort_by=sort_by, sort_order=sort_order
        )
        
        # 分页并序列化数据
        from apps.schemas.models_schema import UserSchema
        user_schema = UserSchema()
        result = paginate_query_with_schema(query, user_schema, page, page_size)
        
        return success_response(result, '获取成功')
    
    @staticmethod
    def get_user(current_user, user_id):
        """获取用户详情"""
        # 用户只能查看自己的详情，除非是系统管理员
        if current_user.id != user_id and current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        user = UserModel.get_user_by_id(user_id)
        if not user:
            return not_found_response('用户')
        
        from apps.schemas.models_schema import UserSchema
        user_schema = UserSchema()
        user_data = user_schema.dump(user)
        
        return success_response(user_data, '获取成功')
    
    @staticmethod
    def update_user(current_user, user_id, user_data):
        """更新用户信息"""
        # 用户只能更新自己的信息，除非是系统管理员
        if current_user.id != user_id and current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        user = UserModel.get_user_by_id(user_id)
        if not user:
            return not_found_response('用户')
        
        # 检查用户名是否已被其他用户使用
        if 'username' in user_data:
            if UserModel.check_username_exists(user_data['username'], user_id):
                return conflict_response('用户名已被使用')
        
        # 检查邮箱是否已被其他用户使用
        if 'email' in user_data:
            if UserModel.check_email_exists(user_data['email'], user_id):
                return conflict_response('邮箱已被使用')
        
        # 更新用户信息
        try:
            UserModel.update_user(user, user_data)
            db.session.commit()
            
            from apps.schemas.models_schema import UserSchema
            user_schema = UserSchema()
            user_data = user_schema.dump(user)
            
            return success_response(user_data, '更新成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('更新失败，请重试', 500)
    
    @staticmethod
    def delete_user(current_user, user_id):
        """删除用户"""
        # 只有系统管理员可以删除用户
        if current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        user = UserModel.get_user_by_id(user_id)
        if not user:
            return not_found_response('用户')
        
        # 不能删除自己
        if user.id == current_user.id:
            return error_response('不能删除自己')
        
        try:
            UserModel.delete_user(user)
            db.session.commit()
            return success_response(None, '删除成功')
        except Exception as e:
            db.session.rollback()
            return error_response('删除失败，请重试', 500)
    
    @staticmethod
    def get_available_users_for_group(query_args):
        """获取可添加到群组的用户列表"""
        search = query_args.get('search', '')
        exclude_group_id = query_args.get('exclude_group_id')
        exclude_user_ids = query_args.get('exclude_user_ids', [])
        
        users = UserModel.get_available_users_for_group(
            group_id=exclude_group_id,
            search=search,
            exclude_user_ids=exclude_user_ids
        )
        
        from apps.schemas.models_schema import UserSchema
        user_schema = UserSchema(many=True)
        users_data = user_schema.dump(users)
        
        return success_response(users_data, '获取成功')
    
    @staticmethod
    def search_users(query_args):
        """搜索用户"""
        search_query = query_args.get('q', '')
        
        if not search_query:
            return success_response([], '搜索关键词不能为空')
        
        users = UserModel.search_users(search_query)
        
        from apps.schemas.models_schema import UserSchema
        user_schema = UserSchema(many=True)
        users_data = user_schema.dump(users)
        
        return success_response(users_data, '搜索成功')
    
    @staticmethod
    def get_user_stats(current_user, user_id):
        """获取用户统计信息 - 符合API文档规范"""
        # 用户只能查看自己的统计，除非是系统管理员
        if current_user.id != user_id and current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        user = UserModel.get_user_by_id(user_id)
        if not user:
            return not_found_response('用户')
        
        # 获取统计数据
        from apps.models import Group, Project, ApiMethod
        from sqlalchemy import or_
        
        # 群组数量（拥有的 + 参与的）
        owned_groups_count = Group.query.filter_by(owner_id=user_id).count()
        member_groups_count = len(user.group_memberships)
        group_count = owned_groups_count + member_groups_count
        
        # 专案数量（可访问的）
        accessible_group_ids = [g.id for g in user.group_memberships] + [g.id for g in user.owned_groups]
        project_count = Project.query.filter(
            or_(Project.group_id.in_(accessible_group_ids), Project.is_public == True)
        ).count()
        
        # API数量（创建的）
        api_count = ApiMethod.query.filter_by(created_by=user_id).count()
        
        # 最近活动
        recent_activity = get_user_recent_activities(user_id, limit=10)
        
        # 格式化成API文档要求的格式
        stats_data = {
            'groupCount': group_count,
            'projectCount': project_count,
            'apiCount': api_count,
            'recentActivity': [
                {
                    'id': activity['id'],
                    'type': activity['type'],
                    'description': activity['description'],
                    'createdAt': activity['created_at']
                } for activity in recent_activity
            ]
        }
        
        return success_response(stats_data, '获取统计信息成功')
    
    @staticmethod
    def get_user_groups(current_user, user_id):
        """获取用户所属的群组列表"""
        # 用户只能查看自己的群组，除非是系统管理员
        if current_user.id != user_id and current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        groups = UserModel.get_user_groups(user_id)
        if groups is None:
            return not_found_response('用户')
        
        from apps.schemas.models_schema import GroupSchema
        group_schema = GroupSchema(many=True)
        groups_data = group_schema.dump(groups)
        
        return success_response(groups_data, '获取成功')
    
    @staticmethod
    def get_user_group_memberships(current_user, user_id):
        """获取用户的群组成员关系"""
        # 用户只能查看自己的成员关系，除非是系统管理员
        if current_user.id != user_id and current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        user = UserModel.get_user_by_id(user_id)
        if not user:
            return not_found_response('用户')
        
        memberships = UserModel.get_user_group_memberships(user_id)
        
        from apps.schemas.models_schema import GroupMemberSchema
        membership_schema = GroupMemberSchema(many=True)
        memberships_data = membership_schema.dump(memberships)
        
        return success_response(memberships_data, '获取成功')
    
    @staticmethod
    def get_user_join_requests(current_user, user_id):
        """获取用户的入组申请历史"""
        # 用户只能查看自己的申请历史，除非是系统管理员
        if current_user.id != user_id and current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        join_requests = UserModel.get_user_join_requests(user_id)
        
        from apps.schemas.models_schema import JoinRequestSchema
        request_schema = JoinRequestSchema(many=True)
        requests_data = request_schema.dump(join_requests)
        
        return success_response(requests_data, '获取成功')
