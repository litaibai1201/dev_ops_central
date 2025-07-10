#!/usr/bin/env python3
"""
测试数据模型关系定义
用于验证SQLAlchemy模型关系是否正确配置
"""

import os
import sys

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

def test_model_relationships():
    """测试模型关系定义"""
    try:
        print("🔍 测试模型关系定义...")
        
        # 导入应用和模型
        from apps import create_app, db
        from apps.models import User, Group, Project, ApiMethod, JoinRequest, TestCase, TestResult
        
        # 创建应用上下文
        app = create_app()
        
        with app.app_context():
            print("✅ 应用创建成功")
            
            # 测试模型定义
            print("📊 检查模型关系...")
            
            # 检查User模型关系
            user_relationships = [
                'owned_groups',
                'group_memberships',
                'submitted_join_requests',
                'reviewed_join_requests', 
                'created_apis',
                'created_test_cases',
                'executed_test_results'
            ]
            
            for rel in user_relationships:
                if hasattr(User, rel):
                    print(f"  ✅ User.{rel} - 关系定义正确")
                else:
                    print(f"  ❌ User.{rel} - 关系定义缺失")
            
            # 检查JoinRequest模型关系
            join_request_relationships = ['user', 'reviewer', 'group']
            for rel in join_request_relationships:
                if hasattr(JoinRequest, rel):
                    print(f"  ✅ JoinRequest.{rel} - 关系定义正确")
                else:
                    print(f"  ❌ JoinRequest.{rel} - 关系定义缺失")
            
            # 测试模型创建
            print("🏗️ 测试数据库表创建...")
            db.create_all()
            print("✅ 数据库表创建成功")
            
            # 测试简单的模型操作
            print("🧪 测试模型操作...")
            
            # 创建测试用户
            test_user = User(
                username='test_user_' + str(os.getpid()),
                email=f'test_{os.getpid()}@example.com'
            )
            test_user.set_password('test123')
            
            db.session.add(test_user)
            db.session.commit()
            print("✅ 用户创建测试成功")
            
            # 创建测试群组
            test_group = Group(
                name=f'test_group_{os.getpid()}',
                description='测试群组',
                owner_id=test_user.id
            )
            
            db.session.add(test_group)
            db.session.commit()
            print("✅ 群组创建测试成功")
            
            # 测试关系访问
            print("🔗 测试关系访问...")
            
            # 访问用户的拥有群组
            owned_groups = test_user.owned_groups
            print(f"  ✅ User.owned_groups 访问成功: {len(owned_groups)} 个群组")
            
            # 访问群组的所有者
            group_owner = test_group.owner
            print(f"  ✅ Group.owner 访问成功: {group_owner.username}")
            
            # 清理测试数据
            db.session.delete(test_group)
            db.session.delete(test_user)
            db.session.commit()
            print("✅ 测试数据清理完成")
            
        print("\n🎉 所有模型关系测试通过！")
        return True
        
    except Exception as e:
        print(f"\n❌ 模型关系测试失败: {e}")
        import traceback
        print("详细错误信息:")
        traceback.print_exc()
        return False

def main():
    """主函数"""
    print("=== 数据模型关系测试 ===")
    
    if test_model_relationships():
        print("\n✅ 模型修复成功！现在可以安全运行:")
        print("  python scripts/quick_fix.py")
        print("  python app.py")
    else:
        print("\n❌ 模型还有问题，需要进一步修复")

if __name__ == '__main__':
    main()
