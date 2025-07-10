"""
响应工具模块
包含API响应格式化相关的工具函数
"""

def api_response(success=True, data=None, message='', code=200):
    """标准API响应格式 - 完全符合API文档规范"""
    return {
        'success': success,
        'data': data,
        'message': message,
        'code': code
    }, code

def success_response(data=None, message='操作成功', code=200):
    """成功响应快捷方法"""
    return api_response(True, data, message, code)

def error_response(message='操作失败', code=400, data=None):
    """错误响应快捷方法"""
    return api_response(False, data, message, code)

def paginated_response(items, total, page, page_size, message='获取成功'):
    """符合API文档规范的分页响应"""
    import math
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    data = {
        'data': items,
        'total': total,
        'page': page,
        'pageSize': page_size,
        'totalPages': total_pages
    }
    
    return api_response(True, data, message, 200)

def validation_error_response(errors):
    """验证错误响应"""
    return api_response(False, {'errors': errors}, '数据验证失败', 422)

def not_found_response(resource='资源'):
    """资源不存在响应"""
    return api_response(False, None, f'{resource}不存在', 404)

def forbidden_response(message='权限不足'):
    """权限不足响应"""
    return api_response(False, None, message, 403)

def unauthorized_response(message='请先登录'):
    """未授权响应"""
    return api_response(False, None, message, 401)

def conflict_response(message='资源冲突'):
    """资源冲突响应"""
    return api_response(False, None, message, 409)

def internal_error_response(message='服务器内部错误'):
    """服务器错误响应"""
    return api_response(False, None, message, 500)

def created_response(data=None, message='创建成功'):
    """创建成功响应 (201)"""
    return api_response(True, data, message, 201)

def no_content_response(message='操作成功'):
    """无内容响应 (204)"""
    return api_response(True, None, message, 204)
