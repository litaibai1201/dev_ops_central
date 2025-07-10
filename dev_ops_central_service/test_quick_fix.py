#!/usr/bin/env python3
"""
快速测试脚本 - 验证Flask-Smorest修复
"""

import os
import sys

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

def test_app_creation():
    """测试应用创建"""
    try:
        print("🔍 测试应用创建...")
        
        from apps import create_app
        
        app = create_app()
        print("✅ 应用创建成功")
        
        # 获取所有路由
        with app.app_context():
            routes = []
            for rule in app.url_map.iter_rules():
                routes.append(f"{rule.methods} {rule}")
            
            print(f"✅ 成功注册 {len(routes)} 个路由")
            
            # 检查特定的蓝图是否注册成功
            blueprints = list(app.blueprints.keys())
            expected_blueprints = ['auth', 'users', 'groups', 'projects', 'apis', 'join_requests']
            
            missing = []
            for bp in expected_blueprints:
                if bp not in blueprints:
                    missing.append(bp)
            
            if missing:
                print(f"❌ 缺少蓝图: {missing}")
                return False
            
            print(f"✅ 所有蓝图注册成功: {blueprints}")
            
            # 尝试生成OpenAPI文档
            try:
                spec = app.extensions['flask-smorest'].spec.to_dict()
                print(f"✅ OpenAPI文档生成成功，包含 {len(spec.get('paths', {}))} 个路径")
                return True
            except Exception as e:
                print(f"❌ OpenAPI文档生成失败: {e}")
                return False
        
    except Exception as e:
        print(f"❌ 应用创建失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函数"""
    print("=== Flask-Smorest 修复验证 ===")
    
    if test_app_creation():
        print("\n🎉 修复成功！现在可以运行:")
        print("  python scripts/init_db.py")
        print("  python app.py")
        return True
    else:
        print("\n❌ 仍有问题需要修复")
        return False

if __name__ == '__main__':
    main()
