#!/usr/bin/env python3
"""
Flask-Migrate数据库迁移脚本
"""

import os
import sys

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from flask_migrate import init, migrate, upgrade
from apps import create_app, db

def init_db():
    """初始化数据库迁移"""
    app = create_app()
    
    with app.app_context():
        try:
            # 检查并创建migrations目录
            migrations_dir = os.path.join(project_root, 'migrations')
            
            # 初始化迁移（如果未初始化）
            if not os.path.exists(migrations_dir):
                print("初始化数据库迁移...")
                init()
                print("✅ 迁移初始化完成")
            else:
                print("迁移目录已存在，跳过初始化")
            
            # 创建迁移文件
            print("创建迁移文件...")
            try:
                migrate(message='Initial migration for MySQL')
                print("✅ 迁移文件创建完成")
            except Exception as e:
                print(f"创建迁移文件时出现警告: {e}")
                print("这可能是因为没有检测到模型变化，继续执行...")
            
            # 应用迁移
            print("应用数据库迁移...")
            upgrade()
            print("✅ 数据库迁移完成")
            
            # 验证表是否创建成功
            print("验证数据库表...")
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            expected_tables = ['users', 'groups', 'projects', 'group_members', 
                             'api_methods', 'api_folders', 'environments', 
                             'test_cases', 'test_results', 'join_requests']
            
            created_tables = [table for table in expected_tables if table in tables]
            print(f"✅ 成功创建 {len(created_tables)} 个数据表: {', '.join(created_tables)}")
            
            if len(created_tables) < len(expected_tables):
                missing_tables = [table for table in expected_tables if table not in tables]
                print(f"⚠️  缺少表: {', '.join(missing_tables)}")
            
            print("\n数据库初始化成功！")
            
        except Exception as e:
            print(f"❌ 数据库初始化失败: {e}")
            print(f"错误类型: {type(e).__name__}")
            
            # 提供详细的错误信息和解决建议
            if "Access denied" in str(e):
                print("\n解决建议:")
                print("1. 检查数据库用户名和密码是否正确")
                print("2. 确保用户有足够的数据库权限")
            elif "Can't connect" in str(e):
                print("\n解决建议:")
                print("1. 检查MySQL服务是否启动")
                print("2. 检查主机和端口是否正确")
                print("3. 检查防火墙设置")
            elif "Unknown database" in str(e):
                print("\n解决建议:")
                print("1. 先运行: python scripts/init_mysql.py")
                print("2. 确保数据库已创建")
            else:
                print(f"\n详细错误信息: {e}")
            
            sys.exit(1)

def create_tables_directly():
    """直接创建数据表（备用方案）"""
    print("尝试直接创建数据表...")
    app = create_app()
    
    with app.app_context():
        try:
            # 导入所有模型确保它们被注册
            from apps.models import (
                User, Group, Project, ApiMethod, ApiFolder, 
                Environment, TestCase, TestResult, JoinRequest
            )
            
            # 创建所有表
            db.create_all()
            
            # 验证表是否创建
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"✅ 直接创建表成功，共创建 {len(tables)} 个表")
            print(f"表列表: {', '.join(tables)}")
            
            return True
            
        except Exception as e:
            print(f"❌ 直接创建表失败: {e}")
            return False

if __name__ == '__main__':
    try:
        init_db()
    except SystemExit:
        # 如果Flask-Migrate失败，尝试直接创建表
        print("\n=== 尝试备用方案 ===")
        if create_tables_directly():
            print("✅ 使用备用方案成功创建数据表")
        else:
            print("❌ 所有方案都失败了")
            print("\n请检查:")
            print("1. MySQL服务是否正常运行")
            print("2. 数据库连接配置是否正确")
            print("3. 数据库用户是否有足够权限")
            sys.exit(1)
