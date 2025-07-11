"""
群组模块 - 业务逻辑控制器
"""

from apps import db
from apps.utils import (
    success_response, error_response, forbidden_response, not_found_response,
    conflict_response, paginate_query_with_schema, created_response,
    get_group_recent_activities, check_group_manage_members_permission, is_group_member
)
from .models import GroupModel

class GroupController:
    """群组相关业务逻辑"""
    
    @staticmethod
    def get_groups(query_args):
        """获取群组列表（分页）"""
        page = query_args.get('page', 1)
        page_size = query_args.get('page_size', 20)
        search = query_args.get('search', '')
        owner_id = query_args.get('owner_id', '')
        sort_by = query_args.get('sort_by', 'created_at')
        sort_order = query_args.get('sort_order', 'desc')
        
        # 获取查询
        query = GroupModel.get_groups_with_pagination(
            page=page, page_size=page_size, search=search,
            owner_id=owner_id, sort_by=sort_by, sort_order=sort_order
        )
        
        # 分页
        result = paginate_query(query, page, page_size)
        
        # 序列化数据
        from apps.schemas.models_schema import GroupSchema
        group_schema = GroupSchema(many=True)
        result['data'] = group_schema.dump(result['data'])
        
        return success_response(result, '获取成功')
    
    @staticmethod
    def create_group(current_user, group_data):
        """创建群组"""
        name = group_data['name']
        description = group_data.get('description', '')
        member_ids = group_data.get('member_ids', [])
        
        # 检查群组名称是否已存在
        if GroupModel.check_group_name_exists(name):
            return conflict_response('群组名称已存在')
        
        # 创建群组
        try:
            group = GroupModel.create_group(name, description, current_user.id)
            db.session.add(group)
            db.session.flush()  # 获取群组ID
            
            # 添加初始成员
            if member_ids:
                from apps.models import User
                for member_id in member_ids:
                    # 验证用户是否存在
                    if User.query.get(member_id):
                        GroupModel.add_group_member(member_id, group.id)
            
            db.session.commit()
            
            # 重新查询群组以获取完整数据
            group = GroupModel.get_group_with_relations(group.id)
            
            from apps.schemas.models_schema import GroupSchema
            group_schema = GroupSchema()
            group_data = group_schema.dump(group)
            
            return success_response(group_data, '创建成功', 201)
            
        except Exception as e:
            db.session.rollback()
            return error_response('创建失败，请重试', 500)
    
    @staticmethod
    def get_group(group_id):
        """获取群组详情"""
        group = GroupModel.get_group_with_relations(group_id)
        
        if not group:
            return not_found_response('群组')
        
        from apps.schemas.models_schema import GroupSchema
        group_schema = GroupSchema()
        group_data = group_schema.dump(group)
        
        return success_response(group_data, '获取成功')
    
    @staticmethod
    def update_group(current_user, group_id, group_data):
        """更新群组信息"""
        group = GroupModel.get_group_by_id(group_id)
        if not group:
            return not_found_response('群组')
        
        # 检查权限（只有群主和系统管理员可以编辑）
        if group.owner_id != current_user.id and current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        # 检查群组名称是否已被其他群组使用
        if 'name' in group_data:
            if GroupModel.check_group_name_exists(group_data['name'], group_id):
                return conflict_response('群组名称已被使用')
        
        # 更新群组信息
        try:
            GroupModel.update_group(group, group_data)
            db.session.commit()
            
            from apps.schemas.models_schema import GroupSchema
            group_schema = GroupSchema()
            group_data = group_schema.dump(group)
            
            return success_response(group_data, '更新成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('更新失败，请重试', 500)
    
    @staticmethod
    def delete_group(current_user, group_id):
        """删除群组"""
        group = GroupModel.get_group_by_id(group_id)
        if not group:
            return not_found_response('群组')
        
        # 检查权限（只有群主和系统管理员可以删除）
        if group.owner_id != current_user.id and current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        # 检查是否还有关联的专案
        if group.projects:
            return error_response('群组下还有专案，无法删除')
        
        try:
            GroupModel.delete_group(group)
            db.session.commit()
            
            return success_response(None, '删除成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('删除失败，请重试', 500)
    
    @staticmethod
    def get_group_members(group_id):
        """获取群组成员列表"""
        group = GroupModel.get_group_by_id(group_id)
        if not group:
            return not_found_response('群组')
        
        members = GroupModel.get_group_members(group_id)
        
        return success_response(members, '获取成功')
    
    @staticmethod
    def add_group_member(current_user, group_id, member_data):
        """添加群组成员"""
        group = GroupModel.get_group_by_id(group_id)
        if not group:
            return not_found_response('群组')
        
        # 检查权限
        if not check_group_manage_members_permission(current_user.id, group_id):
            return forbidden_response('无成员管理权限')
        
        user_id = member_data['user_id']
        role = member_data.get('role', 'member')
        permissions = member_data.get('permissions', {
            'can_approve_members': False,
            'can_edit_project': False,
            'can_manage_members': False
        })
        
        # 检查用户是否存在
        from apps.models import User
        user = User.query.get(user_id)
        if not user:
            return not_found_response('用户')
        
        # 检查用户是否已经是成员
        if GroupModel.check_user_is_member(user_id, group_id):
            return conflict_response('用户已经是群组成员')
        
        # 添加成员
        try:
            GroupModel.add_group_member(user_id, group_id, role, permissions)
            db.session.commit()
            
            # 获取新增的成员信息
            new_member = GroupModel.get_group_member_by_user(user_id, group_id)
            
            from apps.schemas.models_schema import UserSchema
            member_data = {
                'id': new_member.id,
                'user_id': new_member.user_id,
                'group_id': new_member.group_id,
                'user': UserSchema().dump(user),
                'role': new_member.role,
                'permissions': new_member.permissions,
                'joined_at': new_member.joined_at.isoformat() if new_member.joined_at else None
            }
            
            return success_response(member_data, '添加成功', 201)
            
        except Exception as e:
            db.session.rollback()
            return error_response('添加失败，请重试', 500)
    
    @staticmethod
    def update_group_member(current_user, group_id, member_id, member_data):
        """更新群组成员权限"""
        group = GroupModel.get_group_by_id(group_id)
        if not group:
            return not_found_response('群组')
        
        # 检查权限
        if not check_group_manage_members_permission(current_user.id, group_id):
            return forbidden_response('无成员管理权限')
        
        # 查找要更新的成员
        target_member = GroupModel.get_group_member(member_id)
        if not target_member or target_member.group_id != group_id:
            return not_found_response('成员')
        
        # 更新成员信息
        try:
            role = member_data.get('role')
            permissions = member_data.get('permissions')
            
            GroupModel.update_group_member(member_id, role, permissions)
            db.session.commit()
            
            # 获取更新后的成员信息
            updated_member = GroupModel.get_group_member(member_id)
            
            from apps.models import User
            from apps.schemas.models_schema import UserSchema
            user = User.query.get(updated_member.user_id)
            member_data = {
                'id': updated_member.id,
                'user_id': updated_member.user_id,
                'group_id': updated_member.group_id,
                'user': UserSchema().dump(user),
                'role': updated_member.role,
                'permissions': updated_member.permissions,
                'joined_at': updated_member.joined_at.isoformat() if updated_member.joined_at else None
            }
            
            return success_response(member_data, '更新成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('更新失败，请重试', 500)
    
    @staticmethod
    def remove_group_member(current_user, group_id, member_id):
        """移除群组成员"""
        group = GroupModel.get_group_by_id(group_id)
        if not group:
            return not_found_response('群组')
        
        # 查找要移除的成员
        target_member = GroupModel.get_group_member(member_id)
        if not target_member or target_member.group_id != group_id:
            return not_found_response('成员')
        
        # 检查权限
        can_manage = check_group_manage_members_permission(current_user.id, group_id)
        is_self = target_member.user_id == current_user.id
        
        if not can_manage and not is_self:
            return forbidden_response('无成员管理权限')
        
        # 不能移除群主
        if target_member.user_id == group.owner_id:
            return error_response('不能移除群主')
        
        # 移除成员
        try:
            GroupModel.remove_group_member(member_id)
            db.session.commit()
            
            return success_response(None, '移除成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('移除失败，请重试', 500)
    
    @staticmethod
    def get_group_stats(current_user, group_id):
        """获取群组统计信息 - 符合API文档规范"""
        group = GroupModel.get_group_by_id(group_id)
        if not group:
            return not_found_response('群组')
        
        # 检查是否为群组成员或有权限
        if (not is_group_member(current_user.id, group_id) and 
            group.owner_id != current_user.id and
            current_user.role != 'system_admin'):
            return forbidden_response('权限不足')
        
        # 获取统计数据
        from apps.models import Project, ApiMethod, JoinRequest
        
        # 成员数量
        member_count = len(group.members) + 1  # +1为群主
        
        # 专案数量
        project_count = Project.query.filter_by(group_id=group_id).count()
        
        # API数量
        api_count = db.session.query(ApiMethod).join(Project).filter(
            Project.group_id == group_id
        ).count()
        
        # 待处理的申请数量
        pending_request_count = JoinRequest.query.filter_by(
            group_id=group_id, 
            status='pending'
        ).count()
        
        # 最近活动
        recent_activity = get_group_recent_activities(group_id, limit=10)
        
        # 格式化成API文档要求的格式
        stats_data = {
            'memberCount': member_count,
            'projectCount': project_count,
            'apiCount': api_count,
            'pendingRequestCount': pending_request_count,
            'recentActivity': [
                {
                    'id': activity['id'],
                    'type': activity['type'],
                    'description': activity['description'],
                    'createdAt': activity['created_at'],
                    'user': activity.get('user')  # 如果有用户信息
                } for activity in recent_activity
            ]
        }
        
        return success_response(stats_data, '获取群组统计信息成功')
    
    @staticmethod
    def check_join_eligibility(current_user, group_id):
        """检查用户是否可以加入群组 - 符合API文档规范"""
        group = GroupModel.get_group_by_id(group_id)
        if not group:
            return not_found_response('群组')
        
        # 检查是否已经是成员
        if is_group_member(current_user.id, group_id) or group.owner_id == current_user.id:
            return success_response({
                'canJoin': False,
                'reason': '已经是群组成员',
                'existingRequest': None
            }, '检查完成')
        
        # 检查是否有待处理的申请
        from apps.models import JoinRequest
        from sqlalchemy import and_
        existing_request = JoinRequest.query.filter(
            and_(
                JoinRequest.user_id == current_user.id,
                JoinRequest.group_id == group_id,
                JoinRequest.status == 'pending'
            )
        ).first()
        
        if existing_request:
            from apps.schemas.models_schema import JoinRequestSchema
            return success_response({
                'canJoin': False,
                'reason': '已有待处理的申请',
                'existingRequest': JoinRequestSchema().dump(existing_request)
            }, '检查完成')
        
        return success_response({
            'canJoin': True,
            'reason': '可以申请加入',
            'existingRequest': None
        }, '检查完成')
    
    @staticmethod
    def transfer_ownership(current_user, group_id, transfer_data):
        """转移群组所有权 - 符合API文档规范"""
        group = GroupModel.get_group_by_id(group_id)
        if not group:
            return not_found_response('群组')
        
        # 只有当前群主可以转移所有权
        if group.owner_id != current_user.id:
            return forbidden_response('只有群主可以转移所有权')
        
        new_owner_id = transfer_data['newOwnerId']  # 使用camelCase
        
        # 检查新群主是否存在
        from apps.models import User
        new_owner = User.query.get(new_owner_id)
        if not new_owner:
            return not_found_response('新群主')
        
        # 检查新群主是否为群组成员
        if not is_group_member(new_owner_id, group_id):
            return error_response('新群主必须是群组成员')
        
        # 转移所有权
        try:
            # 更新群组所有者
            group.owner_id = new_owner_id
            
            # 确保新群主有管理员权限
            from apps.models import group_members
            from sqlalchemy import and_
            
            # 查找新群主的成员记录
            member_record = db.session.query(group_members).filter(
                and_(
                    group_members.c.user_id == new_owner_id,
                    group_members.c.group_id == group_id
                )
            ).first()
            
            if member_record:
                # 更新权限为管理员
                db.session.execute(
                    group_members.update().where(
                        and_(
                            group_members.c.user_id == new_owner_id,
                            group_members.c.group_id == group_id
                        )
                    ).values(
                        role='admin',
                        permissions={
                            'can_approve_members': True,
                            'can_edit_project': True,
                            'can_manage_members': True
                        }
                    )
                )
            
            db.session.commit()
            
            # 记录活动
            from apps.utils import log_user_activity
            log_user_activity(
                current_user.id, 
                'transfer_ownership', 
                'group', 
                group_id,
                {'new_owner_id': new_owner_id}
            )
            
            # 重新查询群组以获取完整数据
            updated_group = GroupModel.get_group_with_relations(group_id)
            
            from apps.schemas.models_schema import GroupSchema
            group_schema = GroupSchema()
            group_data = group_schema.dump(updated_group)
            
            return success_response(group_data, '所有权转移成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('所有权转移失败，请重试', 500)
