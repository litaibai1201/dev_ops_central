from marshmallow import Schema, fields, validate, post_load, validates, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from apps.models import User, Group, Project, ApiMethod, Environment, TestCase, TestResult, JoinRequest, ApiFolder


### User
class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ('password_hash',)
        dump_only = ('id',  'created_at', 'updated_at')


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


### Group
class GroupSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Group
        load_instance = True
        dump_only = ('id', 'created_at', 'updated_at', 'project_count')
    
    owner = fields.Nested(UserSchema, dump_only=True)
    members = fields.Nested(GroupMemberSchema, many=True, dump_only=True)
    project_count = fields.Integer(dump_only=True)



### Project
class ProjectSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Project
        load_instance = True
        dump_only = ('id', 'created_at', 'updated_at', 'api_count')
    
    group = fields.Nested(GroupSchema, dump_only=True)
    api_count = fields.Integer(dump_only=True)


### ApiMethod
class ApiMethodSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ApiMethod
        load_instance = True
        dump_only = ('id', 'created_at', 'updated_at')
    
    creator = fields.Nested(UserSchema, dump_only=True)
    project = fields.Nested(ProjectSchema, dump_only=True)
    params = fields.Dict()
    responses = fields.Dict()
    body = fields.Dict()


### Environment
class EnvironmentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Environment
        load_instance = True
        dump_only = ('id', 'created_at')


### Folder
class ApiFolderSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ApiFolder
        load_instance = True
        dump_only = ('id', 'created_at')
    
    children = fields.Nested('self', many=True, dump_only=True)
    apis = fields.Nested(ApiMethodSchema, many=True, dump_only=True)


### Join request schemas
class JoinRequestSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = JoinRequest
        load_instance = True
        dump_only = ('id', 'created_at', 'reviewed_at')
    
    user = fields.Nested(UserSchema, dump_only=True)
    group = fields.Nested(GroupSchema, dump_only=True)


# Test schemas
class TestAssertionSchema(Schema):
    id = fields.String(dump_only=True)
    field = fields.String(required=True)
    operator = fields.String(required=True, validate=validate.OneOf(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']))
    expected_value = fields.Raw()
    description = fields.String()


### TestCase
class TestCaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = TestCase
        load_instance = True
        dump_only = ('id', 'created_at')
    
    api = fields.Nested(ApiMethodSchema, dump_only=True)
    assertions = fields.Nested(TestAssertionSchema, many=True)


### TestResult
class TestResultSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = TestResult
        load_instance = True
        dump_only = ('id', 'executed_at')
    
    test_case = fields.Nested(TestCaseSchema, dump_only=True)
