#!/usr/bin/env python3
"""
Flask-Smorest 参数修复验证脚本
"""

import os
import sys

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

def test_app_creation():
    """测试应用创建和蓝图注册"""
    try:
        print("🔍 测试应用创建和蓝图注册...")
        
        # 导入应用和模块
        from apps import create_app
        
        # 创建应用
        app = create_app()
        print("✅ 应用创建成功")
        
        # 检查蓝图注册
        blueprint_names = [rule.endpoint.split('.')[0] for rule in app.url_map.iter_rules() if '.' in rule.endpoint]
        unique_blueprints = set(blueprint_names)
        
        expected_blueprints = ['auth', 'users', 'groups', 'projects', 'apis', 'join_requests']
        registered_blueprints = [bp for bp in expected_blueprints if bp in unique_blueprints]
        
        print(f"✅ 已注册的蓝图: {registered_blueprints}")
        
        if len(registered_blueprints) == len(expected_blueprints):
            print("✅ 所有蓝图注册成功")
            return True
        else:
            missing = set(expected_blueprints) - set(registered_blueprints)
            print(f"❌ 缺少蓝图: {missing}")
            return False
        
    except Exception as e:
        print(f"❌ 应用创建失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_schema_definitions():
    """测试新添加的Schema定义"""
    try:
        print("🔍 测试Schema定义...")
        
        from apps.schemas import (
            EmailSchema, ResetPasswordSchema, TestCaseQuerySchema,
            BatchTestSchema, ApiCopySchema, ApiBulkUpdateSchema,
            GlobalApiSearchSchema
        )
        
        schemas = {
            'EmailSchema': EmailSchema,
            'ResetPasswordSchema': ResetPasswordSchema,
            'TestCaseQuerySchema': TestCaseQuerySchema,
            'BatchTestSchema': BatchTestSchema,
            'ApiCopySchema': ApiCopySchema,
            'ApiBulkUpdateSchema': ApiBulkUpdateSchema,
            'GlobalApiSearchSchema': GlobalApiSearchSchema
        }
        
        for name, schema_class in schemas.items():
            try:
                schema = schema_class()
                print(f"✅ {name} 定义正确")
            except Exception as e:
                print(f"❌ {name} 定义错误: {e}")
                return False
        
        print("✅ 所有Schema定义正确")
        return True
        
    except Exception as e:
        print(f"❌ Schema导入失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_openapi_generation():
    """测试OpenAPI文档生成"""
    try:
        print("🔍 测试OpenAPI文档生成...")
        
        from apps import create_app
        
        app = create_app()
        
        # 尝试访问API文档生成
        with app.test_client() as client:
            # 测试swagger文档端点
            response = client.get('/docs')
            if response.status_code in [200, 301, 302]:  # 允许重定向
                print("✅ Swagger文档端点正常")
            else:
                print(f"⚠️ Swagger文档端点返回状态码: {response.status_code}")
        
        # 测试OpenAPI spec生成
        with app.app_context():
            try:
                spec = app.extensions['flask-smorest'].spec.to_dict()
                print("✅ OpenAPI规范生成成功")
                print(f"✅ 发现 {len(spec.get('paths', {}))} 个API路径")
                return True
            except Exception as e:
                print(f"❌ OpenAPI规范生成失败: {e}")
                return False
        
    except Exception as e:
        print(f"❌ OpenAPI测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函数"""
    print("=== Flask-Smorest 参数修复验证 ===")
    print(f"项目根目录: {project_root}")
    
    tests = [
        ("Schema定义测试", test_schema_definitions),
        ("应用创建测试", test_app_creation),
        ("OpenAPI生成测试", test_openapi_generation)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"🧪 {test_name}")
        print('='*50)
        
        if test_func():
            passed += 1
            print(f"✅ {test_name} 通过")
        else:
            print(f"❌ {test_name} 失败")
    
    print(f"\n{'='*50}")
    print(f"📊 测试结果: {passed}/{total} 通过")
    print('='*50)
    
    if passed == total:
        print("🎉 所有测试通过！现在可以安全运行:")
        print("  python scripts/init_db.py")
        print("  python app.py")
        return True
    else:
        print("❌ 部分测试失败，需要进一步修复")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
