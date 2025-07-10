"""
Flask应用工厂
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_smorest import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

from config.config import config

# Initialize extensions
db = SQLAlchemy()
ma = Marshmallow()
api = Api()
jwt = JWTManager()
cors = CORS()
migrate = Migrate()

def create_app(config_name='default'):
    """应用工厂模式创建Flask应用"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    api.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    migrate.init_app(app, db)
    
    # Register blueprints
    register_blueprints(api)
    
    # Register error handlers
    register_error_handlers(app, jwt)
    
    return app

def register_blueprints(api):
    """注册所有蓝图"""
    # 导入所有模块的蓝图
    from apps.modules.auth import auth_blp
    from apps.modules.users import users_blp
    from apps.modules.groups import groups_blp
    from apps.modules.projects import projects_blp
    from apps.modules.apis import apis_blp
    from apps.modules.join_requests import join_requests_blp
    
    # 注册蓝图
    api.register_blueprint(auth_blp)
    api.register_blueprint(users_blp)
    api.register_blueprint(groups_blp)
    api.register_blueprint(projects_blp)
    api.register_blueprint(apis_blp)
    api.register_blueprint(join_requests_blp)

def register_error_handlers(app, jwt):
    """注册错误处理器"""
    
    @app.errorhandler(404)
    def not_found(error):
        return {'success': False, 'message': '资源不存在', 'code': 404}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'success': False, 'message': '服务器内部错误', 'code': 500}, 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return {'success': False, 'message': '请求参数错误', 'code': 400}, 400
    
    @app.errorhandler(403)
    def forbidden(error):
        return {'success': False, 'message': '权限不足', 'code': 403}, 403
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'success': False, 'message': 'Token已过期', 'code': 401}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'success': False, 'message': '无效的Token', 'code': 401}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'success': False, 'message': '需要提供认证Token', 'code': 401}, 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return {'success': False, 'message': 'Token已被撤销', 'code': 401}, 401
    
    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return {'success': False, 'message': '需要新的Token', 'code': 401}, 401
