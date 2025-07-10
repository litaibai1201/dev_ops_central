from marshmallow import Schema, fields, validate, post_load, validates, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from apps.models import User, Group, Project, ApiMethod, Environment, TestCase, TestResult, JoinRequest, ApiFolder

# Base response schemas
class ApiResponseSchema(Schema):
    success = fields.Boolean(required=True)
    data = fields.Raw()
    message = fields.String()
    code = fields.Integer()

class PaginationSchema(Schema):
    page = fields.Integer(missing=1, validate=validate.Range(min=1))
    page_size = fields.Integer(missing=20, validate=validate.Range(min=1, max=100))
    sort_by = fields.String(missing='created_at')
    sort_order = fields.String(missing='desc', validate=validate.OneOf(['asc', 'desc']))

class PaginatedResponseSchema(Schema):
    data = fields.List(fields.Raw())
    total = fields.Integer()
    page = fields.Integer()
    page_size = fields.Integer()
    total_pages = fields.Integer()

# User schemas
class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ('password_hash',)
        dump_only = ('id', 'created_at', 'updated_at')

class UserCreateSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=8))
    role = fields.String(missing='user', validate=validate.OneOf(['user', 'system_admin']))

class UserUpdateSchema(Schema):
    username = fields.String(validate=validate.Length(min=3, max=80))
    email = fields.Email()
    avatar = fields.String()

# Authentication schemas
class LoginSchema(Schema):
    username = fields.String(required=True)
    password = fields.String(required=True)
    remember = fields.Boolean(missing=False)

class RegisterSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=8))
    confirm_password = fields.String(required=True)
    
    @validates('confirm_password')
    def validate_passwords_match(self, value):
        if 'password' in self.context and value != self.context['password']:
            raise ValidationError('密码确认不匹配')

class ChangePasswordSchema(Schema):
    current_password = fields.String(required=True)
    new_password = fields.String(required=True, validate=validate.Length(min=8))

class EmailSchema(Schema):
    email = fields.Email(required=True)

class ResetPasswordSchema(Schema):
    token = fields.String(required=True)
    new_password = fields.String(required=True, validate=validate.Length(min=8))

# Group schemas
class GroupMemberSchema(Schema):
    id = fields.String(dump_only=True)
    user_id = fields.String(required=True)
    group_id = fields.String(dump_only=True)
    user = fields.Nested(UserSchema, dump_only=True)
    role = fields.String(missing='member', validate=validate.OneOf(['member', 'admin']))
    permissions = fields.Dict(missing=lambda: {
        'can_approve_members': False,
        'can_edit_project': False,
        'can_manage_members': False
    })
    joined_at = fields.DateTime(dump_only=True)

class GroupSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Group
        load_instance = True
        dump_only = ('id', 'created_at', 'updated_at', 'project_count')
    
    owner = fields.Nested(UserSchema, dump_only=True)
    members = fields.Nested(GroupMemberSchema, many=True, dump_only=True)
    project_count = fields.Integer(dump_only=True)

class GroupCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String()
    member_ids = fields.List(fields.String())

class GroupUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=1, max=100))
    description = fields.String()

# Project schemas
class ProjectSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Project
        load_instance = True
        dump_only = ('id', 'created_at', 'updated_at', 'api_count')
    
    group = fields.Nested(GroupSchema, dump_only=True)
    api_count = fields.Integer(dump_only=True)

class ProjectCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String()
    group_id = fields.String(required=True)
    is_public = fields.Boolean(missing=True)
    tags = fields.List(fields.String())
    version = fields.String(missing='v1.0.0')

class ProjectUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=1, max=100))
    description = fields.String()
    is_public = fields.Boolean()
    tags = fields.List(fields.String())
    version = fields.String()
    status = fields.String(validate=validate.OneOf(['active', 'inactive', 'archived']))

# API schemas
class ApiParamSchema(Schema):
    id = fields.String(dump_only=True)
    name = fields.String(required=True)
    type = fields.String(required=True, validate=validate.OneOf(['string', 'number', 'boolean', 'object', 'array']))
    required = fields.Boolean(missing=False)
    description = fields.String()
    example = fields.String()
    default_value = fields.String()

class ApiResponseSchema(Schema):
    id = fields.String(dump_only=True)
    status_code = fields.Integer(required=True)
    description = fields.String()
    headers = fields.Dict()
    body = fields.String()
    example = fields.String()

class ApiBodySchema(Schema):
    type = fields.String(validate=validate.OneOf(['json', 'form-data', 'x-www-form-urlencoded', 'raw']))
    content = fields.String()

class ApiMethodSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ApiMethod
        load_instance = True
        dump_only = ('id', 'created_at', 'updated_at')
    
    creator = fields.Nested(UserSchema, dump_only=True)
    project = fields.Nested(ProjectSchema, dump_only=True)
    params = fields.Nested(ApiParamSchema, many=True)
    responses = fields.Nested(ApiResponseSchema, many=True)
    body = fields.Nested(ApiBodySchema)

class ApiMethodCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String()
    method = fields.String(required=True, validate=validate.OneOf(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']))
    url = fields.String(required=True, validate=validate.Length(min=1, max=500))
    folder_id = fields.String()
    headers = fields.Dict()
    params = fields.Nested(ApiParamSchema, many=True)
    body = fields.Nested(ApiBodySchema)
    tags = fields.List(fields.String())
    status = fields.String(missing='draft', validate=validate.OneOf(['draft', 'published', 'deprecated']))

class ApiMethodUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=1, max=100))
    description = fields.String()
    method = fields.String(validate=validate.OneOf(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']))
    url = fields.String(validate=validate.Length(min=1, max=500))
    folder_id = fields.String()
    headers = fields.Dict()
    params = fields.Nested(ApiParamSchema, many=True)
    body = fields.Nested(ApiBodySchema)
    tags = fields.List(fields.String())
    status = fields.String(validate=validate.OneOf(['draft', 'published', 'deprecated']))

# Folder schemas
class ApiFolderSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ApiFolder
        load_instance = True
        dump_only = ('id', 'created_at')
    
    children = fields.Nested('self', many=True, dump_only=True)
    apis = fields.Nested(ApiMethodSchema, many=True, dump_only=True)

class ApiFolderCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String()
    parent_id = fields.String()

# Environment schemas
class EnvironmentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Environment
        load_instance = True
        dump_only = ('id', 'created_at')

class EnvironmentCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String()
    base_url = fields.String()
    variables = fields.Dict()
    headers = fields.Dict()

# Test schemas
class TestAssertionSchema(Schema):
    id = fields.String(dump_only=True)
    field = fields.String(required=True)
    operator = fields.String(required=True, validate=validate.OneOf(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']))
    expected_value = fields.Raw()
    description = fields.String()

class TestCaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = TestCase
        load_instance = True
        dump_only = ('id', 'created_at')
    
    api = fields.Nested(ApiMethodSchema, dump_only=True)
    assertions = fields.Nested(TestAssertionSchema, many=True)

class TestResultSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = TestResult
        load_instance = True
        dump_only = ('id', 'executed_at')
    
    test_case = fields.Nested(TestCaseSchema, dump_only=True)

# Join request schemas
class JoinRequestSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = JoinRequest
        load_instance = True
        dump_only = ('id', 'created_at', 'reviewed_at')
    
    user = fields.Nested(UserSchema, dump_only=True)
    group = fields.Nested(GroupSchema, dump_only=True)

class JoinRequestCreateSchema(Schema):
    group_id = fields.String(required=True)
    message = fields.String()

class JoinRequestHandleSchema(Schema):
    action = fields.String(required=True, validate=validate.OneOf(['approve', 'reject']))
    review_message = fields.String()

class BatchJoinRequestHandleSchema(Schema):
    request_ids = fields.List(fields.String(), required=True)
    action = fields.String(required=True, validate=validate.OneOf(['approve', 'reject']))
    review_message = fields.String()

# API Test schemas
class ApiTestRequestSchema(Schema):
    environment = fields.String()
    headers = fields.Dict()
    params = fields.Dict()
    body = fields.Raw()

class ApiTestResponseSchema(Schema):
    status_code = fields.Integer()
    headers = fields.Dict()
    body = fields.String()
    response_time = fields.Integer()

# Statistics schemas
class UserStatsSchema(Schema):
    group_count = fields.Integer()
    project_count = fields.Integer()
    api_count = fields.Integer()
    recent_activity = fields.List(fields.Dict())

class GroupStatsSchema(Schema):
    member_count = fields.Integer()
    project_count = fields.Integer()
    api_count = fields.Integer()
    pending_request_count = fields.Integer()
    recent_activity = fields.List(fields.Dict())

# Search and filter schemas
class UserSearchSchema(PaginationSchema):
    search = fields.String()
    role = fields.String(validate=validate.OneOf(['user', 'system_admin']))

class GroupSearchSchema(PaginationSchema):
    search = fields.String()
    owner_id = fields.String()

class ProjectSearchSchema(PaginationSchema):
    search = fields.String()
    group_id = fields.String()
    status = fields.String(validate=validate.OneOf(['active', 'inactive', 'archived']))

class ApiSearchSchema(Schema):
    search = fields.String()
    method = fields.String(validate=validate.OneOf(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']))
    folder_id = fields.String()

class JoinRequestSearchSchema(Schema):
    group_id = fields.String()
    user_id = fields.String()
    status = fields.String(validate=validate.OneOf(['pending', 'approved', 'rejected']))

class TestCaseQuerySchema(Schema):
    api_id = fields.String()

class BatchTestSchema(Schema):
    environment = fields.String()
    api_ids = fields.List(fields.String())

class ApiCopySchema(Schema):
    target_project_id = fields.String(required=True)
    new_name = fields.String(required=True)

class ApiBulkUpdateSchema(Schema):
    api_ids = fields.List(fields.String(), required=True)
    update_data = fields.Dict(required=True)

class GlobalApiSearchSchema(Schema):
    q = fields.String()
    method = fields.String(validate=validate.OneOf(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']))
    status = fields.String(validate=validate.OneOf(['draft', 'published', 'deprecated']))
    tags = fields.List(fields.String())

# 新增：统计相关Schema
class ActivitySchema(Schema):
    """API文档中的活动记录Schema"""
    id = fields.String()
    type = fields.String()
    description = fields.String()
    createdAt = fields.DateTime()
    user = fields.Nested(UserSchema, dump_only=True)

class UserStatsSchema(Schema):
    """API文档中的用户统计Schema"""
    groupCount = fields.Integer()
    projectCount = fields.Integer()
    apiCount = fields.Integer()
    recentActivity = fields.Nested(ActivitySchema, many=True)

class GroupStatsSchema(Schema):
    """API文档中的群组统计Schema"""
    memberCount = fields.Integer()
    projectCount = fields.Integer()
    apiCount = fields.Integer()
    pendingRequestCount = fields.Integer()
    recentActivity = fields.Nested(ActivitySchema, many=True)

class JoinEligibilitySchema(Schema):
    """API文档中的加入资格Schema"""
    canJoin = fields.Boolean()
    reason = fields.String()
    existingRequest = fields.Nested(JoinRequestSchema, allow_none=True)

class TransferOwnershipSchema(Schema):
    """API文档中的所有权转移Schema"""
    newOwnerId = fields.String(required=True)

class GroupMemberCreateSchema(Schema):
    """API文档中的群组成员创建Schema"""
    user_id = fields.String(required=True)
    role = fields.String(missing='member', validate=validate.OneOf(['member', 'admin']))
    permissions = fields.Dict(missing=lambda: {
        'can_approve_members': False,
        'can_edit_project': False,
        'can_manage_members': False
    })

class GroupMemberUpdateSchema(Schema):
    """API文档中的群组成员更新Schema"""
    role = fields.String(validate=validate.OneOf(['member', 'admin']))
    permissions = fields.Dict()

# 新增：API测试相关Schema
class ApiTestResponseSchema(Schema):
    """API文档中的API测试响应Schema"""
    statusCode = fields.Integer()
    headers = fields.Dict()
    body = fields.String()
    responseTime = fields.Integer()

class TestResultSchema(Schema):
    """API文档中的测试结果Schema"""
    id = fields.String()
    testCaseId = fields.String()
    status = fields.String(validate=validate.OneOf(['passed', 'failed', 'error']))
    responseTime = fields.Integer()
    responseCode = fields.Integer()
    responseBody = fields.String()
    errors = fields.List(fields.String())
    executedAt = fields.DateTime()
    executedBy = fields.String()

class RequestStatisticsQuerySchema(Schema):
    """API文档中的申请统计查询Schema"""
    group_id = fields.String()
    user_id = fields.String()
