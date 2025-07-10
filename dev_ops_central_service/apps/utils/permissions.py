"""
权限管理工具模块
包含用户权限检查相关的工具函数
"""

from functools import wraps
from flask import request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from sqlalchemy import and_

from apps import db
from apps.models import User, Group, Project, group_members
from apps.utils.responses import api_response

def require_auth(f):
    """需要认证的装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        return f(*args, **kwargs)
    return decorated_function

def require_role(role):
    """需要特定角色的装饰器"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or user.role != role:
                return api_response(False, None, '权限不足', 403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_group_permission(permission_type='read'):
    """需要群组权限的装饰器"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            group_id = kwargs.get('group_id') or request.view_args.get('group_id')
            
            if not group_id:
                return api_response(False, None, '缺少群组ID', 400)
            
            user = User.query.get(current_user_id)
            if not user:
                return api_response(False, None, '用户不存在', 404)
            
            # 系统管理员拥有所有权限
            if user.role == 'system_admin':
                return f(*args, **kwargs)
            
            group = Group.query.get(group_id)
            if not group:
                return api_response(False, None, '群组不存在', 404)
            
            # 群主拥有所有权限
            if group.owner_id == current_user_id:
                return f(*args, **kwargs)
            
            # 检查是否为群组成员
            member = db.session.query(group_members).filter(
                and_(
                    group_members.c.user_id == current_user_id,
                    group_members.c.group_id == group_id
                )
            ).first()
            
            if not member:
                return api_response(False, None, '非群组成员', 403)
            
            # 根据权限类型检查具体权限
            permissions = member.permissions or {}
            if permission_type == 'manage_members' and not permissions.get('can_manage_members', False):
                return api_response(False, None, '无成员管理权限', 403)
            elif permission_type == 'approve_members' and not permissions.get('can_approve_members', False):
                return api_response(False, None, '无成员审批权限', 403)
            elif permission_type == 'edit_project' and not permissions.get('can_edit_project', False):
                return api_response(False, None, '无专案编辑权限', 403)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_project_permission(permission_type='read'):
    """需要专案权限的装饰器"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            project_id = kwargs.get('project_id') or request.view_args.get('project_id')
            
            if not project_id:
                return api_response(False, None, '缺少专案ID', 400)
            
            user = User.query.get(current_user_id)
            if not user:
                return api_response(False, None, '用户不存在', 404)
            
            project = Project.query.get(project_id)
            if not project:
                return api_response(False, None, '专案不存在', 404)
            
            # 系统管理员拥有所有权限
            if user.role == 'system_admin':
                return f(*args, **kwargs)
            
            # 公开专案的读权限
            if project.is_public and permission_type == 'read':
                return f(*args, **kwargs)
            
            # 检查群组权限
            group = project.group
            if group.owner_id == current_user_id:
                return f(*args, **kwargs)
            
            # 检查是否为群组成员
            member = db.session.query(group_members).filter(
                and_(
                    group_members.c.user_id == current_user_id,
                    group_members.c.group_id == group.id
                )
            ).first()
            
            if not member:
                return api_response(False, None, '无专案访问权限', 403)
            
            # 写权限需要额外检查
            if permission_type in ['write', 'edit', 'delete']:
                permissions = member.permissions or {}
                if not permissions.get('can_edit_project', False):
                    return api_response(False, None, '无专案编辑权限', 403)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def get_current_user():
    """获取当前用户"""
    current_user_id = get_jwt_identity()
    if current_user_id:
        return User.query.get(current_user_id)
    return None

def is_group_member(user_id, group_id):
    """检查用户是否为群组成员"""
    member = db.session.query(group_members).filter(
        and_(
            group_members.c.user_id == user_id,
            group_members.c.group_id == group_id
        )
    ).first()
    return member is not None

def is_group_owner(user_id, group_id):
    """检查用户是否为群组所有者"""
    group = Group.query.get(group_id)
    return group and group.owner_id == user_id

def can_access_project(user_id, project_id):
    """检查用户是否可以访问专案"""
    project = Project.query.get(project_id)
    if not project:
        return False
    
    user = User.query.get(user_id)
    if not user:
        return False
    
    # 系统管理员
    if user.role == 'system_admin':
        return True
    
    # 公开专案
    if project.is_public:
        return True
    
    # 群组成员
    return is_group_member(user_id, project.group_id)

def check_group_edit_permission(user_id, group_id):
    """检查用户是否有群组编辑权限"""
    group = Group.query.get(group_id)
    if not group:
        return False
    
    user = User.query.get(user_id)
    if not user:
        return False
    
    # 系统管理员和群主有编辑权限
    if user.role == 'system_admin' or group.owner_id == user_id:
        return True
    
    # 检查群组成员权限
    member = db.session.query(group_members).filter(
        and_(
            group_members.c.user_id == user_id,
            group_members.c.group_id == group_id
        )
    ).first()
    
    if member:
        permissions = member.permissions or {}
        return permissions.get('can_edit_project', False)
    
    return False

def check_project_edit_permission(user_id, project_id):
    """检查用户是否有专案编辑权限"""
    project = Project.query.get(project_id)
    if not project:
        return False
    
    return check_group_edit_permission(user_id, project.group_id)

def check_group_manage_members_permission(user_id, group_id):
    """检查用户是否有群组成员管理权限"""
    group = Group.query.get(group_id)
    if not group:
        return False
    
    user = User.query.get(user_id)
    if not user:
        return False
    
    # 系统管理员和群主有管理权限
    if user.role == 'system_admin' or group.owner_id == user_id:
        return True
    
    # 检查群组成员权限
    member = db.session.query(group_members).filter(
        and_(
            group_members.c.user_id == user_id,
            group_members.c.group_id == group_id
        )
    ).first()
    
    if member:
        permissions = member.permissions or {}
        return permissions.get('can_manage_members', False)
    
    return False

def check_group_approve_members_permission(user_id, group_id):
    """检查用户是否有成员审批权限"""
    group = Group.query.get(group_id)
    if not group:
        return False
    
    user = User.query.get(user_id)
    if not user:
        return False
    
    # 系统管理员和群主有审批权限
    if user.role == 'system_admin' or group.owner_id == user_id:
        return True
    
    # 检查群组成员权限
    member = db.session.query(group_members).filter(
        and_(
            group_members.c.user_id == user_id,
            group_members.c.group_id == group_id
        )
    ).first()
    
    if member:
        permissions = member.permissions or {}
        return permissions.get('can_approve_members', False)
    
    return False
