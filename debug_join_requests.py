#!/usr/bin/env python3
"""
调试 join-requests API 的脚本
"""

import requests
import json
import sys
import os

# API 基础配置
API_BASE_URL = "http://localhost:5001/api"
LOGIN_URL = f"{API_BASE_URL}/auth/login"
JOIN_REQUESTS_URL = f"{API_BASE_URL}/join-requests"

def login_user(username, password):
    """用户登录"""
    try:
        response = requests.post(LOGIN_URL, json={
            "username": username,
            "password": password
        })
        
        print(f"Login response status: {response.status_code}")
        print(f"Login response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data['data']['token']
            else:
                print(f"Login failed: {data.get('message')}")
                return None
        else:
            print(f"Login request failed with status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_join_requests_api(token):
    """测试 join-requests API"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\n=== Testing JOIN REQUESTS API ===")
    
    try:
        # 测试基本的 GET 请求
        print("\n1. Testing basic GET /join-requests")
        response = requests.get(JOIN_REQUESTS_URL, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Message: {data.get('message')}")
            print(f"Data length: {len(data.get('data', []))}")
        
        # 测试带参数的请求
        print("\n2. Testing GET /join-requests with params")
        params = {"status": "pending"}
        response = requests.get(JOIN_REQUESTS_URL, headers=headers, params=params)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"API test error: {e}")
        return False

def check_server_health():
    """检查服务器健康状态"""
    try:
        print("\n=== Checking Server Health ===")
        health_url = "http://localhost:5001/api/health"
        response = requests.get(health_url)
        
        print(f"Health check status: {response.status_code}")
        print(f"Health check response: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Health check error: {e}")
        return False

def main():
    """主函数"""
    print("=== JOIN REQUESTS API DEBUG SCRIPT ===")
    
    # 1. 检查服务器健康状态
    if not check_server_health():
        print("❌ Server is not healthy, exiting...")
        return
    
    # 2. 尝试登录不同的用户
    test_users = [
        ("admin", "admin123"),
        ("groupowner", "owner123"),
        ("projectadmin", "admin123"),
        ("user", "user123")
    ]
    
    for username, password in test_users:
        print(f"\n=== Testing with user: {username} ===")
        
        # 登录
        token = login_user(username, password)
        if not token:
            print(f"❌ Failed to login as {username}")
            continue
        
        print(f"✅ Successfully logged in as {username}")
        
        # 测试 join-requests API
        success = test_join_requests_api(token)
        if success:
            print(f"✅ join-requests API test successful for {username}")
        else:
            print(f"❌ join-requests API test failed for {username}")
        
        print("-" * 50)
    
    print("\n=== Debug script completed ===")

if __name__ == "__main__":
    main()
