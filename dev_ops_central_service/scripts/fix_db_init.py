#!/usr/bin/env python3
"""
数据库初始化修复脚本
解决 Flask-Migrate 初始化问题和 MySQL 索引长度限制问题
"""

import os
import sys
import shutil

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from flask_migrate import init, migrate, upgrade
from apps import create_app, db

def fix_migrations():
    """修复 migrations 目录问题"""
    app = create_app()
    
    with app.app_context():
        try:
            migrations_dir = os.path.join(project_root, 'migrations')
            
            # 如果migrations目录存在但内容不完整，先删除
            if os.path.exists(migrations_dir):
                print("删除不完整的migrations目录...")
                shutil.rmtree(migrations_dir)
            
            # 重新初始化migrations
            print("重新初始化Flask-Migrate...")
            init(directory=migrations_dir)
            print("✅ Flask-Migrate初始化完成")
            
            # 检查env.py是否存在
            env_py_path = os.path.join(migrations_dir, 'env.py')
            if os.path.exists(env_py_path):
                print("✅ env.py文件创建成功")
            else:
                print("❌ env.py文件未创建")
                return False
            
            # 创建初始迁移
            print("创建初始迁移文件...")
            migrate(message='Initial migration with MySQL optimization')
            print("✅ 迁移文件创建成功")
            
            # 应用迁移
            print("应用数据库迁移...")
            upgrade()
            print("✅ 数据库迁移完成")
            
            return True
            
        except Exception as e:
            print(f"❌ 修复过程中出现错误: {e}")
            return False

def fix_models():
    """修复模型定义中的MySQL索引长度问题"""
    models_file = os.path.join(project_root, 'apps', 'models', '__init__.py')
    
    try:
        with open(models_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 备份原文件
        backup_file = models_file + '.backup'
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ 已备份原模型文件到: {backup_file}")
        
        # 修复索引定义
        # 移除或修改过长的索引
        fixes = [
            # 移除可能导致问题的复合索引
            ("Index('idx_api_methods_method_url', ApiMethod.method, ApiMethod.url)", 
             "# Index('idx_api_methods_method_url', ApiMethod.method, ApiMethod.url)  # 已注释，索引过长"),
            
            # 减少URL字段长度
            ("url = Column(String(1000), nullable=False)", 
             "url = Column(String(500), nullable=False)"),
            
            # 减少其他长字段的长度
            ("avatar = Column(String(500))", 
             "avatar = Column(String(255))"),
            
            ("base_url = Column(String(1000))", 
             "base_url = Column(String(500))"),
        ]
        
        for old_text, new_text in fixes:
            if old_text in content:
                content = content.replace(old_text, new_text)
                print(f"✅ 已修复: {old_text[:50]}...")
        
        # 写入修复后的内容
        with open(models_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ 模型文件修复完成")
        return True
        
    except Exception as e:
        print(f"❌ 修复模型文件时出错: {e}")
        return False

def create_tables_directly():
    """直接创建数据表（备用方案）"""
    print("\n=== 使用备用方案：直接创建数据表 ===")
    app = create_app()
    
    with app.app_context():
        try:
            # 导入所有模型
            from apps.models import (
                User, Group, Project, ApiMethod, ApiFolder, 
                Environment, TestCase, TestResult, JoinRequest
            )
            
            # 删除所有表（小心使用）
            print("删除现有表...")
            db.drop_all()
            
            # 创建所有表
            print("创建数据表...")
            db.create_all()
            
            # 验证表创建
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            expected_tables = [
                'users', 'groups', 'projects', 'group_members',
                'api_methods', 'api_folders', 'environments',
                'test_cases', 'test_results', 'join_requests'
            ]
            
            created_tables = [table for table in expected_tables if table in tables]
            missing_tables = [table for table in expected_tables if table not in tables]
            
            print(f"✅ 成功创建 {len(created_tables)} 个数据表")
            print(f"创建的表: {', '.join(created_tables)}")
            
            if missing_tables:
                print(f"⚠️  未创建的表: {', '.join(missing_tables)}")
            
            # 创建基础索引（避免过长索引）
            print("创建基础索引...")
            try:
                with db.engine.connect() as conn:
                    # 为 api_methods 表创建单独的索引
                    conn.execute("CREATE INDEX idx_api_methods_method ON api_methods (method)")
                    conn.execute("CREATE INDEX idx_api_methods_url_prefix ON api_methods (url(100))")  # 只索引URL前100字符
                    conn.commit()
                print("✅ 基础索引创建完成")
            except Exception as e:
                print(f"⚠️  索引创建警告: {e}")
            
            return True
            
        except Exception as e:
            print(f"❌ 直接创建表失败: {e}")
            print(f"错误类型: {type(e).__name__}")
            return False

def main():
    """主修复流程"""
    print("=== 数据库初始化修复工具 ===\n")
    
    # 步骤1：修复模型定义
    print("步骤1：修复模型定义...")
    if not fix_models():
        print("❌ 模型修复失败，终止操作")
        return False
    
    # 步骤2：尝试使用 Flask-Migrate
    print("\n步骤2：尝试使用 Flask-Migrate...")
    if fix_migrations():
        print("✅ Flask-Migrate 修复成功")
        return True
    
    # 步骤3：使用备用方案
    print("\n步骤3：使用备用方案...")
    if create_tables_directly():
        print("✅ 使用备用方案成功创建数据表")
        return True
    
    print("❌ 所有修复方案都失败了")
    return False

if __name__ == '__main__':
    success = main()
    
    if success:
        print("\n" + "="*50)
        print("✅ 数据库初始化修复完成！")
        print("="*50)
        print("\n建议：")
        print("1. 重新运行 python scripts/init_db.py 验证")
        print("2. 检查应用是否能正常启动")
        print("3. 如果还有问题，请查看错误日志")
    else:
        print("\n" + "="*50)
        print("❌ 数据库初始化修复失败")
        print("="*50)
        print("\n请检查：")
        print("1. MySQL服务是否正常运行")
        print("2. 数据库连接配置是否正确")
        print("3. 数据库用户权限是否足够")
        print("4. 查看上述详细错误信息")
        sys.exit(1)
