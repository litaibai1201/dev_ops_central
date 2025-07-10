"""
分页工具模块
包含查询分页相关的工具函数
"""

import math
from sqlalchemy import or_

def paginate_query(query, page=1, page_size=20, max_page_size=100):
    """分页查询 - 符合API文档规范"""
    page_size = min(page_size, max_page_size)
    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        'data': items,
        'total': total,
        'page': page,
        'pageSize': page_size,  # 使用camelCase符合前端规范
        'totalPages': total_pages  # 使用camelCase符合前端规范
    }

def paginate_query_with_schema(query, schema, page=1, page_size=20, max_page_size=100):
    """带Schema序列化的分页查询"""
    page_size = min(page_size, max_page_size)
    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    # 使用Schema序列化数据
    serialized_items = schema.dump(items, many=True)
    
    return {
        'data': serialized_items,
        'total': total,
        'page': page,
        'pageSize': page_size,
        'totalPages': total_pages
    }

def apply_search_filter(query, model, search_term, search_fields):
    """应用搜索过滤"""
    if search_term:
        conditions = []
        for field in search_fields:
            if hasattr(model, field):
                conditions.append(getattr(model, field).ilike(f'%{search_term}%'))
        if conditions:
            query = query.filter(or_(*conditions))
    return query

def apply_sort(query, model, sort_by='created_at', sort_order='desc'):
    """应用排序"""
    if hasattr(model, sort_by):
        field = getattr(model, sort_by)
        if sort_order == 'asc':
            query = query.order_by(field.asc())
        else:
            query = query.order_by(field.desc())
    return query

def get_pagination_params(request_args):
    """从请求参数中提取分页参数"""
    return {
        'page': int(request_args.get('page', 1)),
        'page_size': min(int(request_args.get('page_size', 20)), 100),
        'sort_by': request_args.get('sort_by', 'created_at'),
        'sort_order': request_args.get('sort_order', 'desc')
    }
