#!/usr/bin/env python3
"""
测试用户群组API修复
"""

import sys
import os
import requests
import json

# API基础URL
BASE_URL = "http://localhost:5001/api"

def test_user_groups_api():
    """测试用户群组API"""
    print("=== 测试用户群组API修复 ===\n")
    
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
    
    # 2. 测试获取用户群组
    print(f"\n2. 测试获取用户群组: GET /users/{user_id}/groups")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/users/{user_id}/groups", headers=headers)
        response.raise_for_status()
        groups_result = response.json()
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应数据: {json.dumps(groups_result, indent=2, ensure_ascii=False)}")
        
        if groups_result.get('success'):
            groups_data = groups_result.get('data', [])
            print(f"✅ 成功获取 {len(groups_data)} 个群组")
            
            # 检查数据结构
            if groups_data:
                group = groups_data[0]
                required_fields = ['id', 'name', 'ownerId', 'owner', 'members', 'projectCount', 'createdAt']
                missing_fields = [field for field in required_fields if field not in group]
                
                if missing_fields:
                    print(f"⚠️  缺少字段: {missing_fields}")
                else:
                    print("✅ 数据结构完整")
                    
                # 检查成员数据结构
                if 'members' in group and group['members']:
                    member = group['members'][0]
                    member_required_fields = ['id', 'userId', 'groupId', 'user', 'role', 'permissions', 'joinedAt']
                    member_missing_fields = [field for field in member_required_fields if field not in member]
                    
                    if member_missing_fields:
                        print(f"⚠️  成员数据缺少字段: {member_missing_fields}")
                    else:
                        print("✅ 成员数据结构完整")
                        
                    # 检查permissions字段
                    if 'permissions' in member:
                        perms = member['permissions']
                        perm_fields = ['canApproveMembers', 'canEditProject', 'canManageMembers']
                        missing_perm_fields = [field for field in perm_fields if field not in perms]
                        
                        if missing_perm_fields:
                            print(f"⚠️  权限字段缺少: {missing_perm_fields}")
                        else:
                            print("✅ 权限字段完整")
                else:
                    print("ℹ️  群组暂无成员")
                    
            return True
        else:
            print(f"❌ API返回失败: {groups_result.get('message')}")
            return False
            
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def test_with_different_users():
    """测试不同用户的群组数据"""
    print("\n\n=== 测试不同用户的群组数据 ===\n")
    
    test_users = [
        {"username": "groupowner", "password": "owner123"},
        {"username": "projectadmin", "password": "admin123"},
        {"username": "user", "password": "user123"}
    ]
    
    for user_info in test_users:
        print(f"\n--- 测试用户: {user_info['username']} ---")
        
        try:
            # 登录
            response = requests.post(f"{BASE_URL}/auth/login", json=user_info)
            login_result = response.json()
            
            if not login_result.get('success'):
                print(f"❌ 登录失败: {login_result.get('message')}")
                continue
                
            token = login_result['data']['token']
            user_id = login_result['data']['user']['id']
            
            # 获取群组
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{BASE_URL}/users/{user_id}/groups", headers=headers)
            groups_result = response.json()
            
            if groups_result.get('success'):
                groups_count = len(groups_result.get('data', []))
                print(f"✅ 用户 {user_info['username']} 有 {groups_count} 个群组")
            else:
                print(f"❌ 获取群组失败: {groups_result.get('message')}")
                
        except Exception as e:
            print(f"❌ 测试用户 {user_info['username']} 失败: {e}")

if __name__ == "__main__":
    print("开始测试用户群组API修复...\n")
    
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
    if test_user_groups_api():
        test_with_different_users()
        print("\n🎉 测试完成！")
    else:
        print("\n❌ 基础测试失败")
        sys.exit(1)
