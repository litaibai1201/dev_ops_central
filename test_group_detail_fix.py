#!/usr/bin/env python3
"""
测试群组详情API和页面修复
"""

import sys
import os
import requests
import json

# API基础URL
BASE_URL = "http://localhost:5001/api"

def test_group_detail_api():
    """测试群组详情API"""
    print("=== 测试群组详情API修复 ===\n")
    
    # 1. 先登录获取token
    print("1. 登录获取token...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        response.raise_for_status()
        login_result = response.json()
        
        if not login_result.get('success'):
            print(f"❌ 登录失败: {login_result.get('message')}")
            return False
            
        token = login_result['data']['token']
        user_id = login_result['data']['user']['id']
        print(f"✅ 登录成功, 用户ID: {user_id}")
        
    except Exception as e:
        print(f"❌ 登录请求失败: {e}")
        return False
    
    # 2. 先获取用户群组列表，然后获取第一个群组的详情
    print(f"\n2. 获取用户群组列表...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/users/{user_id}/groups", headers=headers)
        response.raise_for_status()
        groups_result = response.json()
        
        if not groups_result.get('success') or not groups_result.get('data'):
            print(f"❌ 获取群组列表失败: {groups_result.get('message')}")
            return False
            
        groups = groups_result['data']
        if not groups:
            print("⚠️  用户没有群组，无法测试群组详情")
            return False
            
        first_group = groups[0]
        group_id = first_group['id']
        print(f"✅ 获取到 {len(groups)} 个群组，测试群组: {first_group['name']} (ID: {group_id})")
        
    except Exception as e:
        print(f"❌ 获取群组列表失败: {e}")
        return False
    
    # 3. 测试群组详情API
    print(f"\n3. 测试群组详情API: GET /groups/{group_id}")
    
    try:
        response = requests.get(f"{BASE_URL}/groups/{group_id}", headers=headers)
        response.raise_for_status()
        group_detail_result = response.json()
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应数据: {json.dumps(group_detail_result, indent=2, ensure_ascii=False)}")
        
        if group_detail_result.get('success'):
            group_data = group_detail_result.get('data', {})
            print(f"✅ 成功获取群组详情")
            
            # 检查数据结构
            required_fields = ['id', 'name', 'ownerId', 'owner', 'members', 'projectCount', 'createdAt']
            missing_fields = [field for field in required_fields if field not in group_data]
            
            if missing_fields:
                print(f"⚠️  缺少字段: {missing_fields}")
                return False
            else:
                print("✅ 群组详情数据结构完整")
                
            # 检查成员数据
            members = group_data.get('members', [])
            print(f"✅ 群组包含 {len(members)} 个成员")
            
            if members:
                member = members[0]
                member_required_fields = ['id', 'userId', 'groupId', 'user', 'role', 'permissions', 'joinedAt']
                member_missing_fields = [field for field in member_required_fields if field not in member]
                
                if member_missing_fields:
                    print(f"⚠️  成员数据缺少字段: {member_missing_fields}")
                else:
                    print("✅ 成员数据结构完整")
                    
            return True
        else:
            print(f"❌ API返回失败: {group_detail_result.get('message')}")
            return False
            
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def test_group_projects_api():
    """测试群组项目API"""
    print("\n\n=== 测试群组项目API ===\n")
    
    # 1. 登录
    login_data = {"username": "admin", "password": "admin123"}
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        login_result = response.json()
        
        if not login_result.get('success'):
            print(f"❌ 登录失败: {login_result.get('message')}")
            return False
            
        token = login_result['data']['token']
        user_id = login_result['data']['user']['id']
        headers = {"Authorization": f"Bearer {token}"}
        
    except Exception as e:
        print(f"❌ 登录失败: {e}")
        return False
    
    # 2. 获取群组列表
    try:
        response = requests.get(f"{BASE_URL}/users/{user_id}/groups", headers=headers)
        groups_result = response.json()
        
        if not groups_result.get('success') or not groups_result.get('data'):
            print(f"❌ 获取群组列表失败")
            return False
            
        groups = groups_result['data']
        if not groups:
            print("⚠️  用户没有群组")
            return False
            
        first_group = groups[0]
        group_id = first_group['id']
        
    except Exception as e:
        print(f"❌ 获取群组列表失败: {e}")
        return False
    
    # 3. 测试获取群组的项目列表
    print(f"测试获取群组项目: GET /projects?groupId={group_id}")
    
    try:
        response = requests.get(f"{BASE_URL}/projects", headers=headers, params={"groupId": group_id})
        response.raise_for_status()
        projects_result = response.json()
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应数据: {json.dumps(projects_result, indent=2, ensure_ascii=False)}")
        
        if projects_result.get('success'):
            projects_data = projects_result.get('data', {})
            projects = projects_data.get('data', []) if isinstance(projects_data, dict) else projects_data
            print(f"✅ 成功获取 {len(projects)} 个项目")
            
            if projects:
                project = projects[0]
                required_fields = ['id', 'name', 'groupId', 'isPublic', 'apiCount', 'createdAt']
                missing_fields = [field for field in required_fields if field not in project]
                
                if missing_fields:
                    print(f"⚠️  项目数据缺少字段: {missing_fields}")
                else:
                    print("✅ 项目数据结构完整")
                    
            return True
        else:
            print(f"❌ 获取项目失败: {projects_result.get('message')}")
            return False
            
    except Exception as e:
        print(f"❌ 获取项目请求失败: {e}")
        return False

def test_frontend_error_handling():
    """测试前端错误处理"""
    print("\n\n=== 前端错误处理建议 ===\n")
    
    print("1. 在GroupDetailPage中添加更好的错误边界:")
    print("   - 检查group.members是否存在再调用权限检查")
    print("   - 为projects数组提供默认值")
    print("   - 添加try-catch包围权限检查逻辑")
    
    print("\n2. 在useGroupDetail Hook中添加更详细的错误日志:")
    print("   - 记录API响应的详细信息")
    print("   - 区分网络错误和数据错误")
    print("   - 提供fallback数据结构")
    
    print("\n3. 建议的修复方式:")
    print("   - 确保所有API返回的数据结构与前端TypeScript类型定义匹配")
    print("   - 在前端组件中添加空值检查")
    print("   - 使用React Error Boundary捕获渲染错误")

if __name__ == "__main__":
    print("开始测试群组详情API修复...\n")
    
    # 检查服务是否运行
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ API服务正在运行\n")
        else:
            print("❌ API服务未正常运行")
            sys.exit(1)
    except Exception as e:
        print(f"❌ 无法连接到API服务: {e}")
        print("请确保服务正在运行: python app.py")
        sys.exit(1)
    
    # 运行测试
    success1 = test_group_detail_api()
    success2 = test_group_projects_api()
    test_frontend_error_handling()
    
    if success1 and success2:
        print("\n🎉 API测试完成！")
        print("\n下一步: 重启前端应用并测试群组详情页面")
    else:
        print("\n❌ 部分测试失败，请检查API实现")
        sys.exit(1)
