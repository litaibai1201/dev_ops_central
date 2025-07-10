"""
工具模块
包含项目中使用的各种工具函数
"""

# 响应工具
from .responses import (
    api_response, success_response, error_response, validation_error_response,
    not_found_response, forbidden_response, unauthorized_response,
    conflict_response, internal_error_response, paginated_response,
    created_response, no_content_response
)

# 分页工具
from .pagination import (
    paginate_query, paginate_query_with_schema, apply_search_filter, 
    apply_sort, get_pagination_params
)

# 权限工具
from .permissions import (
    require_auth, require_role, require_group_permission, require_project_permission,
    get_current_user, is_group_member, is_group_owner, can_access_project,
    check_group_edit_permission, check_project_edit_permission,
    check_group_manage_members_permission, check_group_approve_members_permission
)

# 验证工具
from .validators import (
    validate_email, validate_password_strength, validate_username,
    validate_group_name, validate_project_name, validate_api_url,
    validate_http_method, validate_version_format, validate_json_format,
    sanitize_input, validate_pagination_params, validate_sort_params,
    validate_date_range, validate_tags
)

# API测试工具
from .api_testing import (
    test_api_request, validate_test_assertions, execute_assertion,
    get_nested_value, prepare_test_environment, create_test_result_record,
    batch_test_apis, generate_test_report
)

# 活动记录工具
from .activity import (
    create_activity_record, log_user_activity, log_system_event,
    get_user_recent_activities, get_group_recent_activities,
    get_project_recent_activities, format_activity_message,
    get_activity_icon, get_activity_color
)

__all__ = [
    # 响应工具
    'api_response', 'success_response', 'error_response', 'validation_error_response',
    'not_found_response', 'forbidden_response', 'unauthorized_response',
    'conflict_response', 'internal_error_response', 'paginated_response',
    'created_response', 'no_content_response',
    
    # 分页工具
    'paginate_query', 'paginate_query_with_schema', 'apply_search_filter', 'apply_sort', 'get_pagination_params',
    
    # 权限工具
    'require_auth', 'require_role', 'require_group_permission', 'require_project_permission',
    'get_current_user', 'is_group_member', 'is_group_owner', 'can_access_project',
    'check_group_edit_permission', 'check_project_edit_permission',
    'check_group_manage_members_permission', 'check_group_approve_members_permission',
    
    # 验证工具
    'validate_email', 'validate_password_strength', 'validate_username',
    'validate_group_name', 'validate_project_name', 'validate_api_url',
    'validate_http_method', 'validate_version_format', 'validate_json_format',
    'sanitize_input', 'validate_pagination_params', 'validate_sort_params',
    'validate_date_range', 'validate_tags',
    
    # API测试工具
    'test_api_request', 'validate_test_assertions', 'execute_assertion',
    'get_nested_value', 'prepare_test_environment', 'create_test_result_record',
    'batch_test_apis', 'generate_test_report',
    
    # 活动记录工具
    'create_activity_record', 'log_user_activity', 'log_system_event',
    'get_user_recent_activities', 'get_group_recent_activities',
    'get_project_recent_activities', 'format_activity_message',
    'get_activity_icon', 'get_activity_color'
]
