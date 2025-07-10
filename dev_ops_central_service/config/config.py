import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/dev_ops_central')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': int(os.getenv('DB_POOL_SIZE', 10)),
        'pool_timeout': int(os.getenv('DB_POOL_TIMEOUT', 20)),
        'pool_recycle': int(os.getenv('DB_POOL_RECYCLE', 3600)),
        'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', 20)),
        'pool_pre_ping': True,  # 验证连接有效性
        'echo': False  # 设置为True可以打印SQL语句用于调试
    }
    
    # MySQL specific configurations
    MYSQL_DATABASE_CHARSET = 'utf8mb4'
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 86400)))
    JWT_ALGORITHM = 'HS256'
    
    # Flask-Smorest
    API_TITLE = os.getenv('APP_NAME', 'DevOps Central API')
    API_VERSION = os.getenv('APP_VERSION', 'v1')
    OPENAPI_VERSION = '3.0.2'
    OPENAPI_URL_PREFIX = '/'
    OPENAPI_SWAGGER_UI_PATH = '/docs'
    OPENAPI_SWAGGER_UI_URL = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist/'
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')
    
    # Pagination
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    
    # Email (optional)
    SMTP_HOST = os.getenv('SMTP_HOST')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USER = os.getenv('SMTP_USER')
    SMTP_PASS = os.getenv('SMTP_PASS')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    FLASK_ENV = 'development'
    # 开发环境可以启用SQL日志
    SQLALCHEMY_ENGINE_OPTIONS = {
        **Config.SQLALCHEMY_ENGINE_OPTIONS,
        'echo': False  # 设置为True可以查看SQL语句
    }

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    FLASK_ENV = 'production'
    # 生产环境优化数据库连接池
    SQLALCHEMY_ENGINE_OPTIONS = {
        **Config.SQLALCHEMY_ENGINE_OPTIONS,
        'pool_size': int(os.getenv('DB_POOL_SIZE', 20)),
        'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', 30)),
        'echo': False
    }

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    # 测试环境可以使用内存数据库或独立的测试数据库
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/dev_ops_central_test')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 5,
        'max_overflow': 10,
        'pool_pre_ping': True,
        'echo': False
    }

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
