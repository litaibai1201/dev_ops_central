from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey, Table, JSON, Index
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from flask_sqlalchemy import SQLAlchemy
import uuid
import bcrypt

from apps import db

# Association tables for many-to-many relationships
group_members = Table('group_members', db.metadata,
    Column('id', String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('user_id', String(36), ForeignKey('users.id'), nullable=False),
    Column('group_id', String(36), ForeignKey('groups.id'), nullable=False),
    Column('role', String(20), default='member'),  # member, admin
    Column('permissions', JSON),
    Column('joined_at', DateTime, default=lambda: datetime.now(timezone.utc)),
    # MySQL引擎和字符集设置
    mysql_engine='InnoDB',
    mysql_charset='utf8mb4'
)

# 创建索引（在表定义之后）
Index('idx_group_members_user_id', group_members.c.user_id)
Index('idx_group_members_group_id', group_members.c.group_id)
Index('idx_group_members_user_group', group_members.c.user_id, group_members.c.group_id)

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = (
        # MySQL引擎和字符集设置
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)  # 增加长度以支持bcrypt
    role = Column(String(20), default='user', index=True)  # user, system_admin
    avatar = Column(String(500))  # 增加长度以支持长URL
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    owned_groups = relationship('Group', backref='owner', lazy=True)
    group_memberships = relationship('Group', secondary=group_members, backref='members')
    created_apis = relationship('ApiMethod', backref='creator', lazy=True)
    
    def set_password(self, password):
        """Hash and set password."""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Check if provided password matches hash."""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def __repr__(self):
        return f'<User {self.username}>'

class Group(db.Model):
    __tablename__ = 'groups'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    owner_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    projects = relationship('Project', backref='group', lazy=True)
    
    @property
    def project_count(self):
        return len(self.projects)
    
    def __repr__(self):
        return f'<Group {self.name}>'

class Project(db.Model):
    __tablename__ = 'projects'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    group_id = Column(String(36), ForeignKey('groups.id'), nullable=False, index=True)
    is_public = Column(Boolean, default=True, index=True)
    tags = Column(JSON)  # Array of strings
    version = Column(String(20), default='v1.0.0')
    status = Column(String(20), default='active', index=True)  # active, inactive, archived
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    apis = relationship('ApiMethod', backref='project', lazy=True)
    folders = relationship('ApiFolder', backref='project', lazy=True)
    environments = relationship('Environment', backref='project', lazy=True)
    
    @property
    def api_count(self):
        return len(self.apis)
    
    def __repr__(self):
        return f'<Project {self.name}>'

class ApiFolder(db.Model):
    __tablename__ = 'api_folders'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    project_id = Column(String(36), ForeignKey('projects.id'), nullable=False, index=True)
    parent_id = Column(String(36), ForeignKey('api_folders.id'), index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Self-referential relationship
    children = relationship('ApiFolder', backref=backref('parent', remote_side=[id]), lazy=True)
    apis = relationship('ApiMethod', backref='folder', lazy=True)
    
    def __repr__(self):
        return f'<ApiFolder {self.name}>'

class ApiMethod(db.Model):
    __tablename__ = 'api_methods'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text)
    method = Column(String(10), nullable=False, index=True)  # GET, POST, PUT, DELETE, PATCH
    url = Column(String(1000), nullable=False)  # 增加长度以支持长URL
    project_id = Column(String(36), ForeignKey('projects.id'), nullable=False, index=True)
    folder_id = Column(String(36), ForeignKey('api_folders.id'), index=True)
    headers = Column(JSON)  # Key-value pairs
    params = Column(JSON)  # Array of parameter objects
    body = Column(JSON)  # Body configuration
    responses = Column(JSON)  # Array of response objects
    tags = Column(JSON)  # Array of strings
    status = Column(String(20), default='draft', index=True)  # draft, published, deprecated
    created_by = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships - 移除test_cases关系，在TestCase中定义
    
    def __repr__(self):
        return f'<ApiMethod {self.method} {self.name}>'

# 为ApiMethod创建复合索引
Index('idx_api_methods_method_url', ApiMethod.method, ApiMethod.url)

class Environment(db.Model):
    __tablename__ = 'environments'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    project_id = Column(String(36), ForeignKey('projects.id'), nullable=False, index=True)
    variables = Column(JSON)  # Key-value pairs
    base_url = Column(String(1000))  # 增加长度
    headers = Column(JSON)  # Key-value pairs
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f'<Environment {self.name}>'

class TestCase(db.Model):
    __tablename__ = 'test_cases'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text)
    api_id = Column(String(36), ForeignKey('api_methods.id'), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey('projects.id'), nullable=False, index=True)
    environment = Column(String(100), index=True)
    headers = Column(JSON)
    params = Column(JSON)
    body = Column(JSON)
    assertions = Column(JSON)  # Array of assertion objects
    created_by = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    test_results = relationship('TestResult', backref='test_case', lazy=True)
    creator = relationship('User', foreign_keys=[created_by], backref='created_test_cases')
    api = relationship('ApiMethod', foreign_keys=[api_id], backref='test_cases')
    project = relationship('Project', foreign_keys=[project_id])
    
    def __repr__(self):
        return f'<TestCase {self.name}>'

class TestResult(db.Model):
    __tablename__ = 'test_results'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_case_id = Column(String(36), ForeignKey('test_cases.id'), nullable=False, index=True)
    status = Column(String(20), index=True)  # passed, failed, error
    response_time = Column(Integer)  # milliseconds
    response_code = Column(Integer)
    response_body = Column(Text)
    errors = Column(JSON)  # Array of error messages
    executed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    executed_by = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    
    # Relationships
    executor = relationship('User', foreign_keys=[executed_by], backref='executed_test_results')
    
    def __repr__(self):
        return f'<TestResult {self.status}>'

class JoinRequest(db.Model):
    __tablename__ = 'join_requests'
    __table_args__ = (
        {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8mb4'}
    )
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    group_id = Column(String(36), ForeignKey('groups.id'), nullable=False, index=True)
    message = Column(Text)
    status = Column(String(20), default='pending', index=True)  # pending, approved, rejected
    reviewed_by = Column(String(36), ForeignKey('users.id'), index=True)
    review_message = Column(Text)
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    # Relationships with explicit foreign_keys to avoid ambiguity
    user = relationship('User', foreign_keys=[user_id], backref='submitted_join_requests')
    reviewer = relationship('User', foreign_keys=[reviewed_by], backref='reviewed_join_requests')
    group = relationship('Group', backref='join_requests')
    
    def __repr__(self):
        return f'<JoinRequest {self.user_id} -> {self.group_id}>'

# 为JoinRequest创建复合索引
Index('idx_join_requests_user_group_status', JoinRequest.user_id, JoinRequest.group_id, JoinRequest.status)
