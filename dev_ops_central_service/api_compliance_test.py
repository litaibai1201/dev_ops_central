#!/usr/bin/env python3
"""
API文档符合性验证脚本
验证后端接口是否完全符合API文档规范
"""

import os
import sys
import json

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

def test_response_format():
    """测试响应格式是否符合API文档规范"""
    try:
        print("🔍 测试响应格式...")
        
        from apps.utils import success_response, error_response, paginated_response
        
        # 测试成功响应
        success_resp = success_response({"test": "data"}, "测试成功")
        expected_keys = {'success', 'data', 'message', 'code'}
        
        if not isinstance(success_resp, tuple) or len(success_resp) != 2:
            print("❌ 响应格式错误：应该返回 (response_data, status_code)")
            return False
        
        response_data, status_code = success_resp
        if not all(key in response_data for key in expected_keys):
            print(f"❌ 响应缺少必要字段，期望: {expected_keys}, 实际: {set(response_data.keys())}")
            return False
        
        if response_data['success'] != True or status_code != 200:
            print("❌ 成功响应格式错误")
            return False
        
        # 测试分页响应
        paginated_resp = paginated_response([{"id": 1}], 100, 1, 20, "获取成功")
        response_data, status_code = paginated_resp
        
        if 'data' not in response_data or not isinstance(response_data['data'], dict):
            print("❌ 分页响应格式错误")
            return False
        
        pagination_keys = {'data', 'total', 'page', 'pageSize', 'totalPages'}
        if not all(key in response_data['data'] for key in pagination_keys):
            print(f"❌ 分页响应缺少字段，期望: {pagination_keys}")
            return False
        
        print("✅ 响应格式测试通过")
        return True
        
    except Exception as e:
        print(f"❌ 响应格式测试失败: {e}")
        return False

def test_schema_definitions():
    """测试Schema定义是否完整"""
    try:
        print("🔍 测试Schema定义...")
        
        # 测试新增的Schema
        schemas_to_test = [
            'UserStatsSchema', 'GroupStatsSchema', 'ActivitySchema',
            'JoinEligibilitySchema', 'TransferOwnershipSchema',
            'ApiTestResponseSchema', 'TestResultSchema',
            'GroupMemberCreateSchema', 'GroupMemberUpdateSchema'
        ]
        
        for schema_name in schemas_to_test:
            try:
                from apps.schemas import __dict__ as schemas_dict
                if schema_name not in schemas_dict:
                    print(f"❌ 缺少Schema定义: {schema_name}")
                    return False
                
                # 尝试实例化Schema
                schema_class = schemas_dict[schema_name]
                schema_instance = schema_class()
                print(f"  ✅ {schema_name} 定义正确")
                
            except Exception as e:
                print(f"❌ {schema_name} 实例化失败: {e}")
                return False
        
        print("✅ Schema定义测试通过")
        return True
        
    except Exception as e:
        print(f"❌ Schema定义测试失败: {e}")
        return False

def test_api_endpoints():
    """测试API端点是否符合文档规范"""
    try:
        print("🔍 测试API端点...")
        
        from apps import create_app
        
        app = create_app()
        
        # 检查必要的API端点
        required_endpoints = [
            # 认证相关
            'auth.LoginAPI', 'auth.RegisterAPI', 'auth.CurrentUserAPI',
            'auth.RefreshTokenAPI', 'auth.LogoutAPI', 'auth.ChangePasswordAPI',
            
            # 用户管理
            'users.UsersAPI', 'users.UserAPI', 'users.UserStatsAPI',
            'users.UserGroupsAPI', 'users.UserSearchAPI',
            
            # 群组管理
            'groups.GroupsAPI', 'groups.GroupAPI', 'groups.GroupMembersAPI',
            'groups.GroupStatsAPI', 'groups.GroupJoinEligibilityAPI',
            'groups.GroupTransferOwnershipAPI',
            
            # 项目管理
            'projects.ProjectsAPI', 'projects.ProjectAPI',
            'projects.ProjectFoldersAPI', 'projects.ProjectEnvironmentsAPI',
            
            # API接口管理
            'apis.ProjectApisAPI', 'apis.ApiMethodAPI', 'apis.ApiTestAPI',
            'apis.ApiCopyAPI', 'apis.GlobalApiSearchAPI',
            
            # 入组申请
            'join_requests.JoinRequestsAPI', 'join_requests.JoinRequestAPI'
        ]
        
        with app.app_context():
            # 获取所有路由规则
            all_endpoints = set()
            for rule in app.url_map.iter_rules():
                if rule.endpoint and '.' in rule.endpoint:
                    all_endpoints.add(rule.endpoint)
            
            missing_endpoints = []
            for endpoint in required_endpoints:
                if endpoint not in all_endpoints:
                    missing_endpoints.append(endpoint)
            
            if missing_endpoints:
                print(f"❌ 缺少API端点: {missing_endpoints}")
                print(f"现有端点: {sorted(all_endpoints)}")
                return False
        
        print("✅ API端点测试通过")
        return True
        
    except Exception as e:
        print(f"❌ API端点测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_controller_methods():
    """测试控制器方法是否符合API文档要求"""
    try:
        print("🔍 测试控制器方法...")
        
        # 测试用户控制器
        from apps.modules.users.controllers import UserController
        user_methods = [
            'get_users', 'get_user', 'update_user', 'delete_user',
            'get_user_stats', 'search_users', 'get_available_users_for_group'
        ]
        
        for method_name in user_methods:
            if not hasattr(UserController, method_name):
                print(f"❌ UserController缺少方法: {method_name}")
                return False
        
        # 测试群组控制器
        from apps.modules.groups.controllers import GroupController
        group_methods = [
            'get_groups', 'create_group', 'get_group', 'update_group',
            'get_group_stats', 'check_join_eligibility', 'transfer_ownership'
        ]
        
        for method_name in group_methods:
            if not hasattr(GroupController, method_name):
                print(f"❌ GroupController缺少方法: {method_name}")
                return False
        
        print("✅ 控制器方法测试通过")
        return True
        
    except Exception as e:
        print(f"❌ 控制器方法测试失败: {e}")
        return False

def test_api_documentation():
    """测试API文档生成"""
    try:
        print("🔍 测试API文档生成...")
        
        from apps import create_app
        
        app = create_app()
        
        with app.app_context():
            try:
                # 测试OpenAPI规范生成
                spec = app.extensions['flask-smorest'].spec.to_dict()
                
                # 检查基本结构
                required_sections = ['openapi', 'info', 'paths', 'components']
                for section in required_sections:
                    if section not in spec:
                        print(f"❌ OpenAPI规范缺少部分: {section}")
                        return False
                
                # 检查路径数量
                if len(spec.get('paths', {})) < 20:
                    print(f"❌ API路径数量不足: {len(spec.get('paths', {}))}")
                    return False
                
                print(f"✅ API文档包含 {len(spec['paths'])} 个路径")
                print("✅ API文档生成测试通过")
                return True
                
            except Exception as e:
                print(f"❌ OpenAPI规范生成失败: {e}")
                return False
        
    except Exception as e:
        print(f"❌ API文档测试失败: {e}")
        return False

def test_database_models():
    """测试数据库模型是否正确"""
    try:
        print("🔍 测试数据库模型...")
        
        from apps import create_app, db
        from apps.models import User, Group, Project, ApiMethod, JoinRequest
        
        app = create_app()
        
        with app.app_context():
            # 测试模型关系
            user_relationships = [
                'owned_groups', 'group_memberships', 'created_apis',
                'submitted_join_requests', 'reviewed_join_requests'
            ]
            
            for rel in user_relationships:
                if not hasattr(User, rel):
                    print(f"❌ User模型缺少关系: {rel}")
                    return False
            
            # 测试JoinRequest模型关系
            join_request_relationships = ['user', 'reviewer', 'group']
            for rel in join_request_relationships:
                if not hasattr(JoinRequest, rel):
                    print(f"❌ JoinRequest模型缺少关系: {rel}")
                    return False
            
            print("✅ 数据库模型测试通过")
            return True
        
    except Exception as e:
        print(f"❌ 数据库模型测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def generate_compliance_report():
    """生成API文档符合性报告"""
    print("=" * 60)
    print("📋 API文档符合性验证报告")
    print("=" * 60)
    
    tests = [
        ("响应格式规范", test_response_format),
        ("Schema定义完整性", test_schema_definitions),
        ("API端点覆盖", test_api_endpoints),
        ("控制器方法", test_controller_methods),
        ("API文档生成", test_api_documentation),
        ("数据库模型", test_database_models)
    ]
    
    passed = 0
    total = len(tests)
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 {test_name}")
        print("-" * 40)
        
        success = test_func()
        results.append((test_name, success))
        
        if success:
            passed += 1
            print(f"✅ {test_name} - 通过")
        else:
            print(f"❌ {test_name} - 失败")
    
    print("\n" + "=" * 60)
    print(f"📊 测试结果总结: {passed}/{total} 通过")
    print("=" * 60)
    
    if passed == total:
        print("🎉 恭喜！后端完全符合API文档规范")
        print("\n✅ 可以执行的操作:")
        print("  • python scripts/init_db.py  # 初始化数据库")
        print("  • python app.py              # 启动应用")
        print("  • 访问 http://localhost:5000/docs  # 查看API文档")
        return True
    else:
        print("❌ 部分测试失败，需要进一步修复")
        print("\n失败的测试:")
        for test_name, success in results:
            if not success:
                print(f"  • {test_name}")
        return False

def main():
    """主函数"""
    print("🚀 开始API文档符合性验证...")
    
    try:
        success = generate_compliance_report()
        return 0 if success else 1
    except Exception as e:
        print(f"\n💥 验证过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
