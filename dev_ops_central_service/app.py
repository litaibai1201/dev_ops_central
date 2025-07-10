#!/usr/bin/env python3
"""
DevOps Central API Service
主应用启动文件
"""

import os
from flask import redirect

from apps import create_app, db

def create_sample_data():
    """创建示例数据"""
    from apps.models import User, Group, Project, ApiMethod, Environment, JoinRequest, ApiFolder
    
    # 检查是否已有数据
    if User.query.first():
        print("数据库已有数据，跳过示例数据创建")
        return
    
    print("创建示例数据...")
    
    try:
        # 创建示例用户
        admin_user = User(username='admin', email='admin@example.com', role='system_admin')
        admin_user.set_password('admin123')
        
        group_owner = User(username='groupowner', email='owner@example.com', role='user')
        group_owner.set_password('owner123')
        
        project_admin = User(username='projectadmin', email='projectadmin@example.com', role='user')
        project_admin.set_password('admin123')
        
        normal_user = User(username='user', email='user@example.com', role='user')
        normal_user.set_password('user123')
        
        db.session.add_all([admin_user, group_owner, project_admin, normal_user])
        db.session.flush()  # 获取用户ID
        
        # 创建示例群组
        frontend_group = Group(
            name='前端开发组',
            description='负责前端相关项目开发',
            owner_id=group_owner.id
        )
        
        backend_group = Group(
            name='后端开发组',
            description='负责后端服务开发',
            owner_id=group_owner.id
        )
        
        db.session.add_all([frontend_group, backend_group])
        db.session.flush()
        
        # 添加群组成员
        from apps.models import group_members
        db.session.execute(
            group_members.insert().values(
                user_id=project_admin.id,
                group_id=frontend_group.id,
                role='admin',
                permissions={
                    'can_approve_members': True,
                    'can_edit_project': True,
                    'can_manage_members': True
                }
            )
        )
        
        db.session.execute(
            group_members.insert().values(
                user_id=normal_user.id,
                group_id=frontend_group.id,
                role='member',
                permissions={
                    'can_approve_members': False,
                    'can_edit_project': False,
                    'can_manage_members': False
                }
            )
        )
        
        # 创建示例专案
        user_api_project = Project(
            name='用户管理系统API',
            description='提供用户注册、登录、个人信息管理等功能的API接口',
            group_id=frontend_group.id,
            is_public=True,
            tags=['用户管理', '认证'],
            version='v1.0.0',
            status='active'
        )
        
        order_api_project = Project(
            name='订单系统API',
            description='电商平台订单管理相关接口',
            group_id=backend_group.id,
            is_public=True,
            tags=['订单', '支付'],
            version='v2.1.0',
            status='active'
        )
        
        db.session.add_all([user_api_project, order_api_project])
        db.session.flush()
        
        # 创建示例API文件夹
        auth_folder = ApiFolder(
            name='认证模块',
            description='用户认证相关接口',
            project_id=user_api_project.id
        )
        
        user_folder = ApiFolder(
            name='用户管理',
            description='用户信息管理接口',
            project_id=user_api_project.id
        )
        
        db.session.add_all([auth_folder, user_folder])
        db.session.flush()
        
        # 创建示例API接口
        login_api = ApiMethod(
            name='用户登录',
            description='用户通过用户名和密码登录系统',
            method='POST',
            url='/api/auth/login',
            project_id=user_api_project.id,
            folder_id=auth_folder.id,
            headers={'Content-Type': 'application/json'},
            params=[
                {
                    'name': 'username',
                    'type': 'string',
                    'required': True,
                    'description': '用户名',
                    'example': 'johndoe'
                },
                {
                    'name': 'password',
                    'type': 'string',
                    'required': True,
                    'description': '密码',
                    'example': 'password123'
                }
            ],
            body={
                'type': 'json',
                'content': '{\n  "username": "string",\n  "password": "string",\n  "remember": false\n}'
            },
            responses=[
                {
                    'status_code': 200,
                    'description': '登录成功',
                    'headers': {'Content-Type': 'application/json'},
                    'body': '{\n  "success": true,\n  "data": {\n    "user": {},\n    "token": "string"\n  }\n}',
                    'example': '{\n  "success": true,\n  "data": {\n    "user": {\n      "id": "123",\n      "username": "johndoe"\n    },\n    "token": "eyJhbGciOiJIUzI1NiIs..."\n  }\n}'
                }
            ],
            tags=['认证', '用户'],
            status='published',
            created_by=project_admin.id
        )
        
        register_api = ApiMethod(
            name='用户注册',
            description='新用户注册账号',
            method='POST',
            url='/api/auth/register',
            project_id=user_api_project.id,
            folder_id=auth_folder.id,
            headers={'Content-Type': 'application/json'},
            params=[
                {
                    'name': 'username',
                    'type': 'string',
                    'required': True,
                    'description': '用户名',
                    'example': 'newuser'
                },
                {
                    'name': 'email',
                    'type': 'string',
                    'required': True,
                    'description': '邮箱',
                    'example': 'user@example.com'
                },
                {
                    'name': 'password',
                    'type': 'string',
                    'required': True,
                    'description': '密码',
                    'example': 'password123'
                }
            ],
            body={
                'type': 'json',
                'content': '{\n  "username": "string",\n  "email": "string",\n  "password": "string",\n  "confirm_password": "string"\n}'
            },
            responses=[
                {
                    'status_code': 201,
                    'description': '注册成功',
                    'headers': {'Content-Type': 'application/json'},
                    'body': '{\n  "success": true,\n  "data": {\n    "user": {},\n    "token": "string"\n  }\n}',
                    'example': '{\n  "success": true,\n  "data": {\n    "user": {\n      "id": "124",\n      "username": "newuser"\n    },\n    "token": "eyJhbGciOiJIUzI1NiIs..."\n  }\n}'
                }
            ],
            tags=['认证', '用户'],
            status='published',
            created_by=project_admin.id
        )
        
        get_user_api = ApiMethod(
            name='获取用户信息',
            description='获取当前登录用户的详细信息',
            method='GET',
            url='/api/auth/me',
            project_id=user_api_project.id,
            folder_id=user_folder.id,
            headers={'Authorization': 'Bearer {token}'},
            params=[],
            responses=[
                {
                    'status_code': 200,
                    'description': '获取成功',
                    'headers': {'Content-Type': 'application/json'},
                    'body': '{\n  "success": true,\n  "data": {\n    "id": "string",\n    "username": "string",\n    "email": "string",\n    "role": "string"\n  }\n}',
                    'example': '{\n  "success": true,\n  "data": {\n    "id": "123",\n    "username": "johndoe",\n    "email": "john@example.com",\n    "role": "user"\n  }\n}'
                }
            ],
            tags=['用户', '信息'],
            status='published',
            created_by=project_admin.id
        )
        
        db.session.add_all([login_api, register_api, get_user_api])
        
        # 创建示例环境配置
        dev_env = Environment(
            name='开发环境',
            description='本地开发环境配置',
            project_id=user_api_project.id,
            base_url='http://localhost:3000',
            variables={
                'API_VERSION': 'v1',
                'TIMEOUT': '5000'
            },
            headers={
                'Content-Type': 'application/json',
                'X-API-Version': 'v1'
            }
        )
        
        prod_env = Environment(
            name='生产环境',
            description='生产环境配置',
            project_id=user_api_project.id,
            base_url='https://api.example.com',
            variables={
                'API_VERSION': 'v1',
                'TIMEOUT': '10000'
            },
            headers={
                'Content-Type': 'application/json',
                'X-API-Version': 'v1'
            }
        )
        
        db.session.add_all([dev_env, prod_env])
        
        # 创建示例入组申请
        join_request = JoinRequest(
            user_id=normal_user.id,
            group_id=backend_group.id,
            message='希望加入后端开发组，学习后端技术',
            status='pending'
        )
        
        db.session.add(join_request)
        
        db.session.commit()
        print("示例数据创建成功！")
        
        # 打印测试账号信息
        print("\n=== 测试账号信息 ===")
        print("系统管理员: admin / admin123")
        print("群主: groupowner / owner123")
        print("专案管理员: projectadmin / admin123")
        print("普通用户: user / user123")
        print("=====================")
        
    except Exception as e:
        db.session.rollback()
        print(f"创建示例数据失败: {str(e)}")

def main():
    """主函数"""
    # 获取配置环境
    config_name = os.getenv('FLASK_ENV', 'development')
    
    # 创建应用
    app = create_app(config_name)
    
    with app.app_context():
        # 创建数据库表
        print("正在创建数据库表...")
        db.create_all()
        
        # 创建示例数据
        create_sample_data()
        
        print(f"\n应用启动成功！")
        print(f"配置环境: {config_name}")
        print(f"数据库: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print(f"API文档: http://localhost:5001/docs")
        print(f"健康检查: http://localhost:5001/api/health")
    
    return app

# 创建应用实例
app = main()

# 添加健康检查端点
@app.route('/api/health')
def health_check():
    """健康检查端点"""
    return {
        'status': 'healthy',
        'message': 'DevOps Central API Service is running',
        'version': '1.0.0'
    }

# 添加根路径重定向
@app.route('/')
def index():
    """根路径重定向到API文档"""
    return redirect('/docs')

if __name__ == '__main__':
    # 开发模式运行
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"\n启动开发服务器...")
    print(f"地址: http://localhost:{port}")
    print(f"调试模式: {debug}")
    
    try:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=debug
        )
    except ImportError as e:
        if 'watchdog' in str(e) or 'EVENT_TYPE_OPENED' in str(e):
            print(f"\n❌ watchdog 版本兼容性问题: {e}")
            print("\n解决方案:")
            print("1. 运行: pip install watchdog==3.0.0")
            print("2. 或者运行: bash scripts/fix_watchdog.sh")
            print("3. 或者禁用调试模式")
            print("\n尝试使用非调试模式启动...")
            
            try:
                app.run(
                    host='0.0.0.0',
                    port=port,
                    debug=False,
                    use_reloader=False
                )
            except Exception as fallback_e:
                print(f"❌ 启动失败: {fallback_e}")
                print("\n请运行以下命令修复:")
                print("pip install watchdog==3.0.0")
        else:
            raise e
