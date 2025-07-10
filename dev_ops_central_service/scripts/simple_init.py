#!/usr/bin/env python3
"""
直接数据库初始化脚本 - 不依赖Flask-Migrate
"""

import os
import sys

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

def init_database():
    """直接初始化数据库"""
    try:
        print("=== 直接数据库初始化 ===")
        
        # 导入应用和数据库
        from apps import create_app, db
        
        # 创建应用实例
        app = create_app()
        
        with app.app_context():
            print("📊 创建数据库表...")
            
            # 导入所有模型以确保它们被注册
            from apps.models import (
                User, Group, Project, ApiMethod, ApiFolder, 
                Environment, TestCase, TestResult, JoinRequest, group_members
            )
            
            # 删除所有表（如果存在）
            print("清理旧表...")
            db.drop_all()
            
            # 创建所有表
            print("创建新表...")
            db.create_all()
            
            # 验证表是否创建成功
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            print(f"✅ 成功创建 {len(tables)} 个数据表:")
            for table in sorted(tables):
                print(f"  - {table}")
            
            # 检查预期的表是否都存在
            expected_tables = [
                'users', 'groups', 'projects', 'group_members', 
                'api_methods', 'api_folders', 'environments', 
                'test_cases', 'test_results', 'join_requests'
            ]
            
            missing_tables = [table for table in expected_tables if table not in tables]
            if missing_tables:
                print(f"⚠️  缺少预期的表: {', '.join(missing_tables)}")
            else:
                print("✅ 所有预期的表都已创建")
            
            print("\n数据库初始化完成！")
            return True
            
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        print(f"错误类型: {type(e).__name__}")
        
        # 提供详细的错误信息
        error_msg = str(e).lower()
        if "access denied" in error_msg:
            print("\n可能的解决方案:")
            print("1. 检查.env文件中的用户名和密码")
            print("2. 确保MySQL用户有CREATE、DROP、ALTER权限")
            print("3. 尝试使用root用户连接")
        elif "can't connect" in error_msg or "connection refused" in error_msg:
            print("\n可能的解决方案:")
            print("1. 检查MySQL服务是否启动: sudo systemctl start mysql")
            print("2. 检查端口是否正确（默认3306）")
            print("3. 检查主机地址是否正确")
        elif "unknown database" in error_msg:
            print("\n可能的解决方案:")
            print("1. 先运行: python scripts/init_mysql.py")
            print("2. 手动创建数据库")
        else:
            print(f"\n详细错误: {e}")
        
        return False

if __name__ == '__main__':
    # 切换到项目根目录
    original_cwd = os.getcwd()
    os.chdir(project_root)
    
    try:
        success = init_database()
        if success:
            print("\n🎉 数据库初始化成功!")
            print("现在可以启动应用: python app.py")
        else:
            print("\n❌ 数据库初始化失败")
            print("请检查错误信息并修复问题后重试")
            sys.exit(1)
    finally:
        os.chdir(original_cwd)
