"""
活动记录工具模块
包含活动记录和日志相关的工具函数
"""

import uuid
from datetime import datetime, timezone

def create_activity_record(user_id, activity_type, description, related_id=None, metadata=None):
    """创建活动记录"""
    return {
        'id': str(uuid.uuid4()),
        'user_id': user_id,
        'type': activity_type,
        'description': description,
        'related_id': related_id,
        'metadata': metadata or {},
        'created_at': datetime.now(timezone.utc).isoformat()
    }

def log_user_activity(user_id, action, resource_type, resource_id=None, details=None):
    """记录用户活动"""
    activity_types = {
        'login': '用户登录',
        'logout': '用户登出',
        'register': '用户注册',
        'create_group': '创建群组',
        'join_group': '加入群组',
        'leave_group': '离开群组',
        'create_project': '创建专案',
        'update_project': '更新专案',
        'delete_project': '删除专案',
        'create_api': '创建API',
        'update_api': '更新API',
        'delete_api': '删除API',
        'test_api': '测试API',
        'approve_request': '审批申请',
        'reject_request': '拒绝申请'
    }
    
    description = activity_types.get(action, action)
    if resource_type and resource_id:
        description += f' - {resource_type}:{resource_id}'
    
    return create_activity_record(
        user_id=user_id,
        activity_type=action,
        description=description,
        related_id=resource_id,
        metadata={
            'resource_type': resource_type,
            'details': details
        }
    )

def log_system_event(event_type, description, user_id=None, metadata=None):
    """记录系统事件"""
    return create_activity_record(
        user_id=user_id,
        activity_type=f'system_{event_type}',
        description=f'[系统] {description}',
        metadata=metadata
    )

def get_user_recent_activities(user_id, limit=10):
    """获取用户最近活动（模拟数据）"""
    # 在实际项目中，这里应该从数据库查询
    sample_activities = [
        {
            'id': str(uuid.uuid4()),
            'type': 'create_api',
            'description': '创建了API接口：用户登录',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'type': 'join_group',
            'description': '加入了群组：前端开发组',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    return sample_activities[:limit]

def get_group_recent_activities(group_id, limit=10):
    """获取群组最近活动（模拟数据）"""
    sample_activities = [
        {
            'id': str(uuid.uuid4()),
            'type': 'member_joined',
            'description': '新成员加入群组',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'type': 'project_created',
            'description': '创建了新专案',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    return sample_activities[:limit]

def get_project_recent_activities(project_id, limit=10):
    """获取专案最近活动（模拟数据）"""
    sample_activities = [
        {
            'id': str(uuid.uuid4()),
            'type': 'api_created',
            'description': '创建了新API接口',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'type': 'test_executed',
            'description': '执行了API测试',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    return sample_activities[:limit]

def format_activity_message(activity_type, actor_name, target_name=None):
    """格式化活动消息"""
    messages = {
        'create_group': f'{actor_name} 创建了群组',
        'join_group': f'{actor_name} 加入了群组',
        'leave_group': f'{actor_name} 离开了群组',
        'create_project': f'{actor_name} 创建了专案',
        'update_project': f'{actor_name} 更新了专案',
        'delete_project': f'{actor_name} 删除了专案',
        'create_api': f'{actor_name} 创建了API接口',
        'update_api': f'{actor_name} 更新了API接口',
        'delete_api': f'{actor_name} 删除了API接口',
        'test_api': f'{actor_name} 测试了API接口',
        'approve_request': f'{actor_name} 通过了入组申请',
        'reject_request': f'{actor_name} 拒绝了入组申请'
    }
    
    message = messages.get(activity_type, f'{actor_name} 执行了 {activity_type}')
    if target_name:
        message += f'：{target_name}'
    
    return message

def get_activity_icon(activity_type):
    """获取活动图标"""
    icons = {
        'login': 'user-check',
        'logout': 'log-out',
        'register': 'user-plus',
        'create_group': 'users',
        'join_group': 'user-plus',
        'leave_group': 'user-minus',
        'create_project': 'folder-plus',
        'update_project': 'edit',
        'delete_project': 'trash-2',
        'create_api': 'plus-circle',
        'update_api': 'edit',
        'delete_api': 'x-circle',
        'test_api': 'play-circle',
        'approve_request': 'check-circle',
        'reject_request': 'x-circle'
    }
    
    return icons.get(activity_type, 'activity')

def get_activity_color(activity_type):
    """获取活动颜色"""
    colors = {
        'create_group': 'green',
        'join_group': 'blue',
        'leave_group': 'orange',
        'create_project': 'green',
        'update_project': 'blue',
        'delete_project': 'red',
        'create_api': 'green',
        'update_api': 'blue',
        'delete_api': 'red',
        'test_api': 'purple',
        'approve_request': 'green',
        'reject_request': 'red'
    }
    
    return colors.get(activity_type, 'gray')
