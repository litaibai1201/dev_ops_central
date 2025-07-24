from marshmallow import Schema, fields, validate, post_load, validates, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from apps.models import User, Group, Project, ApiMethod, Environment, TestCase, TestResult, JoinRequest, ApiFolder


### User
class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ('password_hash',)
        dump_only = ('id', 'created_at', 'updated_at')
    
    # 映射字段名以匹配前端期望
    created_at = fields.DateTime(data_key='createdAt', dump_only=True)
    updated_at = fields.DateTime(data_key='updatedAt', dump_only=True)


# Group schemas - 简化版本不包含members字段处理
class GroupMemberSchema(Schema):
    id = fields.String(dump_only=True)
    user_id = fields.String(required=True, data_key='userId')
    group_id = fields.String(dump_only=True, data_key='groupId')
    user = fields.Nested(UserSchema, dump_only=True)
    role = fields.String(missing='member', validate=validate.OneOf(['member', 'admin']))
    permissions = fields.Dict()
    joined_at = fields.DateTime(dump_only=True, data_key='joinedAt')


### Group
class GroupSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Group
        load_instance = True
        dump_only = ('id', 'created_at', 'updated_at', 'project_count')
    
    # 映射字段名以匹配前端期望
    owner_id = fields.String(data_key='ownerId', dump_only=True)
    created_at = fields.DateTime(data_key='createdAt', dump_only=True)
    updated_at = fields.DateTime(data_key='updatedAt', dump_only=True)
    project_count = fields.Integer(data_key='projectCount', dump_only=True)
    
    owner = fields.Nested(UserSchema, dump_only=True)
    # 暂时移除members字段，将通过单独的API endpoint处理
    # members = fields.Method('get_members', dump_only=True)


### Project
class ProjectSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Project
        load_instance = True
        dump_only = ('id', 'created_at', 'updated_at', 'api_count')
    
    # 映射字段名以匹配前端期望
    group_id = fields.String(data_key='groupId', dump_only=True)
    is_public = fields.Boolean(data_key='isPublic')
    api_count = fields.Integer(data_key='apiCount', dump_only=True)
    created_at = fields.DateTime(data_key='createdAt', dump_only=True)
    updated_at = fields.DateTime(data_key='updatedAt', dump_only=True)
    
    group = fields.Nested('GroupSchema', dump_only=True)  # 使用字符串引用避免循环导入


### ApiMethod
class ApiMethodSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ApiMethod
        load_instance = True
        dump_only = ('id', 'created_at', 'updated_at')
    
    # 映射字段名以匹配前端期望
    project_id = fields.String(data_key='projectId', dump_only=True)
    folder_id = fields.String(data_key='folderId')
    created_by = fields.String(data_key='createdBy', dump_only=True)
    created_at = fields.DateTime(data_key='createdAt', dump_only=True)
    updated_at = fields.DateTime(data_key='updatedAt', dump_only=True)
    
    creator = fields.Nested(UserSchema, dump_only=True)
    project = fields.Nested('ProjectSchema', dump_only=True)  # 使用字符串引用避免循环导入
    params = fields.List(fields.Dict())
    responses = fields.List(fields.Dict())
    body = fields.Dict()


### Environment
class EnvironmentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Environment
        load_instance = True
        dump_only = ('id', 'created_at')
    
    # 映射字段名以匹配前端期望
    project_id = fields.String(data_key='projectId', dump_only=True)
    base_url = fields.String(data_key='baseUrl')
    created_at = fields.DateTime(data_key='createdAt', dump_only=True)


### Folder
class ApiFolderSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ApiFolder
        load_instance = True
        dump_only = ('id', 'created_at')
    
    # 映射字段名以匹配前端期望
    project_id = fields.String(data_key='projectId', dump_only=True)
    parent_id = fields.String(data_key='parentId')
    created_at = fields.DateTime(data_key='createdAt', dump_only=True)
    
    children = fields.Nested('self', many=True, dump_only=True)
    apis = fields.Nested(ApiMethodSchema, many=True, dump_only=True)


### Join request schemas
class JoinRequestSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = JoinRequest
        load_instance = True
        dump_only = ('id', 'created_at', 'reviewed_at')
    
    # 映射字段名以匹配前端期望
    user_id = fields.String(data_key='userId', dump_only=True)
    group_id = fields.String(data_key='groupId', dump_only=True)
    reviewed_by = fields.String(data_key='reviewedBy')
    review_message = fields.String(data_key='reviewMessage')
    reviewed_at = fields.DateTime(data_key='reviewedAt', dump_only=True)
    created_at = fields.DateTime(data_key='createdAt', dump_only=True)
    
    user = fields.Nested(UserSchema, dump_only=True)
    group = fields.Nested(GroupSchema, dump_only=True)


# Test schemas
class TestAssertionSchema(Schema):
    id = fields.String(dump_only=True)
    field = fields.String(required=True)
    operator = fields.String(required=True, validate=validate.OneOf(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']))
    expected_value = fields.Raw(data_key='expectedValue')
    description = fields.String()


### TestCase
class TestCaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = TestCase
        load_instance = True
        dump_only = ('id', 'created_at')
    
    # 映射字段名以匹配前端期望
    api_id = fields.String(data_key='apiId', dump_only=True)
    project_id = fields.String(data_key='projectId', dump_only=True)
    created_by = fields.String(data_key='createdBy', dump_only=True)
    created_at = fields.DateTime(data_key='createdAt', dump_only=True)
    
    api = fields.Nested(ApiMethodSchema, dump_only=True)
    assertions = fields.Nested(TestAssertionSchema, many=True)


### TestResult
class TestResultSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = TestResult
        load_instance = True
        dump_only = ('id', 'executed_at')
    
    # 映射字段名以匹配前端期望
    test_case_id = fields.String(data_key='testCaseId', dump_only=True)
    response_time = fields.Integer(data_key='responseTime')
    response_code = fields.Integer(data_key='responseCode')
    response_body = fields.String(data_key='responseBody')
    executed_at = fields.DateTime(data_key='executedAt', dump_only=True)
    executed_by = fields.String(data_key='executedBy', dump_only=True)
    
    test_case = fields.Nested(TestCaseSchema, dump_only=True)
