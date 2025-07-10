"""
数据验证工具模块
包含数据验证相关的工具函数
"""

import re
from datetime import datetime, timezone

def validate_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password):
    """验证密码强度"""
    if len(password) < 8:
        return False, '密码长度至少8位'
    
    if not re.search(r'[A-Z]', password):
        return False, '密码必须包含大写字母'
    
    if not re.search(r'[a-z]', password):
        return False, '密码必须包含小写字母'
    
    if not re.search(r'\d', password):
        return False, '密码必须包含数字'
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, '密码必须包含特殊字符'
    
    return True, '密码强度符合要求'

def validate_username(username):
    """验证用户名格式"""
    if not username:
        return False, '用户名不能为空'
    
    if len(username) < 3:
        return False, '用户名长度至少3位'
    
    if len(username) > 80:
        return False, '用户名长度不能超过80位'
    
    # 只允许字母、数字、下划线
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, '用户名只能包含字母、数字和下划线'
    
    return True, '用户名格式正确'

def validate_group_name(name):
    """验证群组名称"""
    if not name:
        return False, '群组名称不能为空'
    
    if len(name) > 100:
        return False, '群组名称长度不能超过100位'
    
    return True, '群组名称格式正确'

def validate_project_name(name):
    """验证专案名称"""
    if not name:
        return False, '专案名称不能为空'
    
    if len(name) > 100:
        return False, '专案名称长度不能超过100位'
    
    return True, '专案名称格式正确'

def validate_api_url(url):
    """验证API URL格式"""
    if not url:
        return False, 'API URL不能为空'
    
    if len(url) > 500:
        return False, 'API URL长度不能超过500位'
    
    # 简单的URL格式验证
    if not url.startswith('/'):
        return False, 'API URL必须以/开头'
    
    return True, 'API URL格式正确'

def validate_http_method(method):
    """验证HTTP方法"""
    valid_methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
    if method.upper() not in valid_methods:
        return False, f'无效的HTTP方法，支持的方法: {", ".join(valid_methods)}'
    
    return True, 'HTTP方法有效'

def validate_version_format(version):
    """验证版本号格式"""
    if not version:
        return False, '版本号不能为空'
    
    # 简单的语义化版本验证
    pattern = r'^v?\d+\.\d+\.\d+$'
    if not re.match(pattern, version):
        return False, '版本号格式错误，请使用语义化版本格式（如v1.0.0）'
    
    return True, '版本号格式正确'

def validate_json_format(json_str):
    """验证JSON格式"""
    if not json_str:
        return True, 'JSON格式正确'  # 空字符串认为是有效的
    
    try:
        import json
        json.loads(json_str)
        return True, 'JSON格式正确'
    except json.JSONDecodeError as e:
        return False, f'JSON格式错误: {str(e)}'

def sanitize_input(input_str, max_length=None):
    """清理输入字符串"""
    if not input_str:
        return ''
    
    # 移除前后空白
    cleaned = input_str.strip()
    
    # 限制长度
    if max_length and len(cleaned) > max_length:
        cleaned = cleaned[:max_length]
    
    return cleaned

def validate_pagination_params(page, page_size):
    """验证分页参数"""
    try:
        page = int(page)
        page_size = int(page_size)
    except (ValueError, TypeError):
        return False, '分页参数必须为整数'
    
    if page < 1:
        return False, '页码必须大于0'
    
    if page_size < 1:
        return False, '每页大小必须大于0'
    
    if page_size > 100:
        return False, '每页大小不能超过100'
    
    return True, '分页参数有效'

def validate_sort_params(sort_by, sort_order, allowed_fields):
    """验证排序参数"""
    if sort_by and sort_by not in allowed_fields:
        return False, f'排序字段无效，允许的字段: {", ".join(allowed_fields)}'
    
    if sort_order and sort_order not in ['asc', 'desc']:
        return False, '排序方向只能是asc或desc'
    
    return True, '排序参数有效'

def validate_date_range(start_date, end_date):
    """验证日期范围"""
    try:
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            start_dt = None
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        else:
            end_dt = None
        
        if start_dt and end_dt and start_dt > end_dt:
            return False, '开始日期不能晚于结束日期'
        
        return True, '日期范围有效'
    
    except ValueError:
        return False, '日期格式错误，请使用ISO 8601格式'

def validate_tags(tags):
    """验证标签列表"""
    if not tags:
        return True, '标签有效'
    
    if not isinstance(tags, list):
        return False, '标签必须是数组格式'
    
    if len(tags) > 20:
        return False, '标签数量不能超过20个'
    
    for tag in tags:
        if not isinstance(tag, str):
            return False, '标签必须是字符串'
        
        if len(tag) > 50:
            return False, '单个标签长度不能超过50字符'
    
    return True, '标签有效'
