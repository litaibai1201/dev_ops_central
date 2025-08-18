# -*- coding: utf-8 -*-
"""
@文件: model_tables.py
@说明: 数据库模型表定义
@时间: 2025-08-18
@作者: LiDong
"""

import uuid
import bcrypt
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey, Table, JSON, Index
from sqlalchemy.orm import relationship, backref
from typing import Optional

from common.common_tools import CommonTools
from dbs.mysql_db import db


class BaseModel(db.Model):
    """基础模型类"""
    __abstract__ = True

    created_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False,
        comment="创建时间"
    )
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc),
        comment="更新时间"
    )


# 群组成员关联表
group_members = Table('group_members', db.metadata,
    Column('id', String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('user_id', String(36), ForeignKey('users.id'), nullable=False),
    Column('group_id', String(36), ForeignKey('groups.id'), nullable=False),
    Column('role', String(20), default='member', comment='成员角色'),  # member, admin
    Column('permissions', JSON, comment='权限设置'),
    Column('joined_at', DateTime, default=lambda: datetime.now(timezone.utc), comment='加入时间'),
    mysql_engine='InnoDB',
    mysql_charset='utf8mb4'
)

# 创建索引
Index('idx_group_members_user_id', group_members.c.user_id)
Index('idx_group_members_group_id', group_members.c.group_id)
Index('idx_group_members_user_group', group_members.c.user_id, group_members.c.group_id)


class User(BaseModel):
    """用户模型"""
    __tablename__ = 'users'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="用户ID")
    username = Column(String(80), unique=True, nullable=False, index=True, comment="用户名")
    email = Column(String(120), unique=True, nullable=False, index=True, comment="邮箱")
    password_hash = Column(String(255), nullable=False, comment="密码哈希")
    role = Column(String(20), default='user', index=True, comment="用户角色")  # user, system_admin
    avatar = Column(String(255), comment="头像")
    
    # 关系定义
    owned_groups = relationship('Group', backref='owner', lazy=True)
    group_memberships = relationship('Group', secondary=group_members, backref='members')
    created_apis = relationship('ApiMethod', backref='creator', lazy=True)
    
    def set_password(self, password: str) -> None:
        """设置密码"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """验证密码"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def __repr__(self):
        return f'<User {self.username}>'


class Group(BaseModel):
    """群组模型"""
    __tablename__ = 'groups'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="群组ID")
    name = Column(String(100), unique=True, nullable=False, index=True, comment="群组名称")
    description = Column(Text, comment="群组描述")
    owner_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True, comment="群组所有者ID")
    
    # 关系定义
    projects = relationship('Project', backref='group', lazy=True)
    
    @property
    def project_count(self) -> int:
        """项目数量"""
        return len(self.projects)
    
    def __repr__(self):
        return f'<Group {self.name}>'


class Project(BaseModel):
    """项目模型"""
    __tablename__ = 'projects'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="项目ID")
    name = Column(String(100), nullable=False, index=True, comment="项目名称")
    description = Column(Text, comment="项目描述")
    group_id = Column(String(36), ForeignKey('groups.id'), nullable=False, index=True, comment="所属群组ID")
    is_public = Column(Boolean, default=True, index=True, comment="是否公开")
    tags = Column(JSON, comment="标签")
    version = Column(String(20), default='v1.0.0', comment="版本")
    status = Column(String(20), default='active', index=True, comment="状态")  # active, inactive, archived
    
    # 关系定义
    apis = relationship('ApiMethod', backref='project', lazy=True)
    folders = relationship('ApiFolder', backref='project', lazy=True)
    environments = relationship('Environment', backref='project', lazy=True)
    
    @property
    def api_count(self) -> int:
        """API数量"""
        return len(self.apis)
    
    def __repr__(self):
        return f'<Project {self.name}>'


class ApiFolder(BaseModel):
    """API文件夹模型"""
    __tablename__ = 'api_folders'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="文件夹ID")
    name = Column(String(100), nullable=False, index=True, comment="文件夹名称")
    description = Column(Text, comment="文件夹描述")
    project_id = Column(String(36), ForeignKey('projects.id'), nullable=False, index=True, comment="所属项目ID")
    parent_id = Column(String(36), ForeignKey('api_folders.id'), index=True, comment="父文件夹ID")
    
    # 自引用关系
    children = relationship('ApiFolder', backref=backref('parent', remote_side=[id]), lazy=True)
    apis = relationship('ApiMethod', backref='folder', lazy=True)
    
    def __repr__(self):
        return f'<ApiFolder {self.name}>'


class ApiMethod(BaseModel):
    """API方法模型"""
    __tablename__ = 'api_methods'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="API ID")
    name = Column(String(100), nullable=False, comment="API名称")
    description = Column(Text, comment="API描述")
    method = Column(String(10), nullable=False, index=True, comment="HTTP方法")  # GET, POST, PUT, DELETE, PATCH
    url = Column(String(500), nullable=False, comment="请求URL")
    project_id = Column(String(36), ForeignKey('projects.id'), nullable=False, index=True, comment="所属项目ID")
    folder_id = Column(String(36), ForeignKey('api_folders.id'), index=True, comment="所属文件夹ID")
    headers = Column(JSON, comment="请求头")
    params = Column(JSON, comment="请求参数")
    body = Column(JSON, comment="请求体")
    responses = Column(JSON, comment="响应示例")
    tags = Column(JSON, comment="标签")
    status = Column(String(20), default='draft', index=True, comment="状态")  # draft, published, deprecated
    created_by = Column(String(36), ForeignKey('users.id'), nullable=False, index=True, comment="创建者ID")
    
    def __repr__(self):
        return f'<ApiMethod {self.method} {self.name}>'


class Environment(BaseModel):
    """环境配置模型"""
    __tablename__ = 'environments'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="环境ID")
    name = Column(String(100), nullable=False, index=True, comment="环境名称")
    description = Column(Text, comment="环境描述")
    project_id = Column(String(36), ForeignKey('projects.id'), nullable=False, index=True, comment="所属项目ID")
    variables = Column(JSON, comment="环境变量")
    base_url = Column(String(500), comment="基础URL")
    headers = Column(JSON, comment="默认请求头")
    
    def __repr__(self):
        return f'<Environment {self.name}>'


class TestCase(BaseModel):
    """测试用例模型"""
    __tablename__ = 'test_cases'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="测试用例ID")
    name = Column(String(100), nullable=False, comment="测试用例名称")
    description = Column(Text, comment="测试用例描述")
    api_id = Column(String(36), ForeignKey('api_methods.id'), nullable=False, index=True, comment="关联API ID")
    project_id = Column(String(36), ForeignKey('projects.id'), nullable=False, index=True, comment="所属项目ID")
    environment = Column(String(100), index=True, comment="测试环境")
    headers = Column(JSON, comment="请求头")
    params = Column(JSON, comment="请求参数")
    body = Column(JSON, comment="请求体")
    assertions = Column(JSON, comment="断言规则")
    created_by = Column(String(36), ForeignKey('users.id'), nullable=False, index=True, comment="创建者ID")
    
    # 关系定义
    test_results = relationship('TestResult', backref='test_case', lazy=True)
    creator = relationship('User', foreign_keys=[created_by], backref='created_test_cases')
    api = relationship('ApiMethod', foreign_keys=[api_id], backref='test_cases')
    project = relationship('Project', foreign_keys=[project_id])
    
    def __repr__(self):
        return f'<TestCase {self.name}>'


class TestResult(BaseModel):
    """测试结果模型"""
    __tablename__ = 'test_results'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="测试结果ID")
    test_case_id = Column(String(36), ForeignKey('test_cases.id'), nullable=False, index=True, comment="测试用例ID")
    status = Column(String(20), index=True, comment="测试状态")  # passed, failed, error
    response_time = Column(Integer, comment="响应时间(毫秒)")
    response_code = Column(Integer, comment="响应状态码")
    response_body = Column(Text, comment="响应体")
    errors = Column(JSON, comment="错误信息")
    executed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, comment="执行时间")
    executed_by = Column(String(36), ForeignKey('users.id'), nullable=False, index=True, comment="执行者ID")
    
    # 关系定义
    executor = relationship('User', foreign_keys=[executed_by], backref='executed_test_results')
    
    def __repr__(self):
        return f'<TestResult {self.status}>'


class JoinRequest(BaseModel):
    """入组申请模型"""
    __tablename__ = 'join_requests'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), comment="申请ID")
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True, comment="申请用户ID")
    group_id = Column(String(36), ForeignKey('groups.id'), nullable=False, index=True, comment="目标群组ID")
    message = Column(Text, comment="申请说明")
    status = Column(String(20), default='pending', index=True, comment="申请状态")  # pending, approved, rejected
    reviewed_by = Column(String(36), ForeignKey('users.id'), index=True, comment="审核者ID")
    review_message = Column(Text, comment="审核说明")
    reviewed_at = Column(DateTime, comment="审核时间")
    
    # 关系定义
    user = relationship('User', foreign_keys=[user_id], backref='submitted_join_requests')
    reviewer = relationship('User', foreign_keys=[reviewed_by], backref='reviewed_join_requests')
    group = relationship('Group', backref='join_requests')
    
    def __repr__(self):
        return f'<JoinRequest {self.user_id} -> {self.group_id}>'


# 创建复合索引
Index('idx_join_requests_user_group_status', JoinRequest.user_id, JoinRequest.group_id, JoinRequest.status)