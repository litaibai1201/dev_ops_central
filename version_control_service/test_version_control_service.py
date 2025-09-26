# -*- coding: utf-8 -*-
"""
@文件: test_version_control_service.py
@說明: 版本控制服務測試腳本 (Version Control Service Test)
@時間: 2025-01-09
@作者: LiDong
"""

import requests
import json
from datetime import datetime
import uuid


class VersionControlServiceTest:
    """版本控制服務測試類"""
    
    def __init__(self, base_url="http://localhost:5060"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.auth_token = None
        self.test_data = {}
    
    def setup_auth(self):
        """設置認證 (使用測試token)"""
        # 這是一個測試token，實際應用中需要通過認證服務獲取
        test_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0X3VzZXJfMDAxIiwiZXhwIjoxNzQwNzc0NDAwLCJyb2xlIjoiYWRtaW4ifQ.test_signature"
        self.auth_token = f"Bearer {test_token}"
        self.session.headers.update({"Authorization": self.auth_token})
        print("✓ 認證設置完成")
    
    def test_health_check(self):
        """測試健康檢查"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 404:
                print("⚠ 健康檢查端點不存在，跳過測試")
                return True
            
            print(f"健康檢查狀態: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"✗ 健康檢查失敗: {str(e)}")
            return False
    
    def test_create_branch(self):
        """測試創建分支"""
        try:
            document_id = str(uuid.uuid4())
            self.test_data['document_id'] = document_id
            
            branch_data = {
                "branch_name": "main",
                "document_type": "diagram",
                "parent_branch_id": None
            }
            
            response = self.session.post(
                f"{self.base_url}/documents/{document_id}/branches", 
                json=branch_data
            )
            
            print(f"創建分支狀態: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                if result.get('flag'):
                    branch_data = result.get('content', {})
                    self.test_data['main_branch_id'] = branch_data.get('id')
                    print(f"✓ 主分支創建成功: {self.test_data['main_branch_id']}")
                    return True
                else:
                    print(f"✗ 創建分支失敗: {result.get('msg')}")
            
            return False
        except Exception as e:
            print(f"✗ 創建分支測試異常: {str(e)}")
            return False
    
    def test_get_branches(self):
        """測試獲取分支列表"""
        try:
            if not self.test_data.get('document_id'):
                print("✗ 缺少測試數據，跳過獲取分支測試")
                return False
            
            response = self.session.get(
                f"{self.base_url}/documents/{self.test_data['document_id']}/branches",
                params={"document_type": "diagram"}
            )
            
            print(f"獲取分支列表狀態: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                if result.get('flag'):
                    branches = result.get('content', [])
                    print(f"✓ 獲取分支列表成功，共 {len(branches)} 個分支")
                    return True
                else:
                    print(f"✗ 獲取分支列表失敗: {result.get('msg')}")
            
            return False
        except Exception as e:
            print(f"✗ 獲取分支列表測試異常: {str(e)}")
            return False
    
    def test_create_commit(self):
        """測試創建提交"""
        try:
            if not self.test_data.get('main_branch_id'):
                print("✗ 缺少分支ID，跳過創建提交測試")
                return False
            
            commit_data = {
                "branch_id": self.test_data['main_branch_id'],
                "commit_message": "Initial commit - test diagram",
                "document_snapshot": {
                    "nodes": [
                        {"id": "node1", "type": "start", "label": "開始"},
                        {"id": "node2", "type": "process", "label": "處理數據"},
                        {"id": "node3", "type": "end", "label": "結束"}
                    ],
                    "edges": [
                        {"from": "node1", "to": "node2"},
                        {"from": "node2", "to": "node3"}
                    ]
                },
                "changes_summary": {
                    "type": "create",
                    "files_changed": 1,
                    "insertions": 10,
                    "deletions": 0,
                    "description": "創建初始流程圖"
                }
            }
            
            response = self.session.post(
                f"{self.base_url}/branches/{self.test_data['main_branch_id']}/commits",
                json=commit_data
            )
            
            print(f"創建提交狀態: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                if result.get('flag'):
                    commit_data = result.get('content', {})
                    self.test_data['first_commit_id'] = commit_data.get('id')
                    print(f"✓ 首次提交創建成功: {self.test_data['first_commit_id']}")
                    return True
                else:
                    print(f"✗ 創建提交失敗: {result.get('msg')}")
            
            return False
        except Exception as e:
            print(f"✗ 創建提交測試異常: {str(e)}")
            return False
    
    def test_get_commit_history(self):
        """測試獲取提交歷史"""
        try:
            if not self.test_data.get('main_branch_id'):
                print("✗ 缺少分支ID，跳過獲取提交歷史測試")
                return False
            
            response = self.session.get(
                f"{self.base_url}/branches/{self.test_data['main_branch_id']}/commits",
                params={"limit": 10}
            )
            
            print(f"獲取提交歷史狀態: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                if result.get('flag'):
                    history = result.get('content', {})
                    commits = history.get('commits', [])
                    print(f"✓ 獲取提交歷史成功，共 {len(commits)} 個提交")
                    return True
                else:
                    print(f"✗ 獲取提交歷史失敗: {result.get('msg')}")
            
            return False
        except Exception as e:
            print(f"✗ 獲取提交歷史測試異常: {str(e)}")
            return False
    
    def test_create_feature_branch(self):
        """測試創建功能分支"""
        try:
            if not self.test_data.get('document_id') or not self.test_data.get('main_branch_id'):
                print("✗ 缺少測試數據，跳過創建功能分支測試")
                return False
            
            branch_data = {
                "branch_name": "feature/user-auth",
                "document_type": "diagram",
                "parent_branch_id": self.test_data['main_branch_id']
            }
            
            response = self.session.post(
                f"{self.base_url}/documents/{self.test_data['document_id']}/branches",
                json=branch_data
            )
            
            print(f"創建功能分支狀態: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                if result.get('flag'):
                    branch_data = result.get('content', {})
                    self.test_data['feature_branch_id'] = branch_data.get('id')
                    print(f"✓ 功能分支創建成功: {self.test_data['feature_branch_id']}")
                    return True
                else:
                    print(f"✗ 創建功能分支失敗: {result.get('msg')}")
            
            return False
        except Exception as e:
            print(f"✗ 創建功能分支測試異常: {str(e)}")
            return False
    
    def test_create_merge_request(self):
        """測試創建合併請求"""
        try:
            if not (self.test_data.get('feature_branch_id') and self.test_data.get('main_branch_id')):
                print("✗ 缺少分支ID，跳過創建合併請求測試")
                return False
            
            mr_data = {
                "source_branch_id": self.test_data['feature_branch_id'],
                "target_branch_id": self.test_data['main_branch_id'],
                "title": "添加用戶認證功能",
                "description": "實現用戶登錄、註冊和認證流程",
                "reviewers": ["reviewer_001", "reviewer_002"],
                "assignee_id": "assignee_001"
            }
            
            response = self.session.post(
                f"{self.base_url}/documents/{self.test_data['document_id']}/merge-requests",
                json=mr_data
            )
            
            print(f"創建合併請求狀態: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                if result.get('flag'):
                    mr_data = result.get('content', {})
                    self.test_data['merge_request_id'] = mr_data.get('id')
                    print(f"✓ 合併請求創建成功: {self.test_data['merge_request_id']}")
                    return True
                else:
                    print(f"✗ 創建合併請求失敗: {result.get('msg')}")
            
            return False
        except Exception as e:
            print(f"✗ 創建合併請求測試異常: {str(e)}")
            return False
    
    def test_create_tag(self):
        """測試創建標籤"""
        try:
            if not self.test_data.get('first_commit_id'):
                print("✗ 缺少提交ID，跳過創建標籤測試")
                return False
            
            tag_data = {
                "tag_name": "v1.0.0",
                "commit_id": self.test_data['first_commit_id'],
                "tag_type": "release",
                "description": "第一個版本發布",
                "document_type": "diagram"
            }
            
            response = self.session.post(
                f"{self.base_url}/documents/{self.test_data['document_id']}/tags",
                json=tag_data
            )
            
            print(f"創建標籤狀態: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                if result.get('flag'):
                    tag_data = result.get('content', {})
                    self.test_data['tag_id'] = tag_data.get('id')
                    print(f"✓ 標籤創建成功: {self.test_data['tag_id']}")
                    return True
                else:
                    print(f"✗ 創建標籤失敗: {result.get('msg')}")
            
            return False
        except Exception as e:
            print(f"✗ 創建標籤測試異常: {str(e)}")
            return False
    
    def test_get_document_stats(self):
        """測試獲取文檔統計"""
        try:
            if not self.test_data.get('document_id'):
                print("✗ 缺少文檔ID，跳過獲取統計測試")
                return False
            
            response = self.session.get(
                f"{self.base_url}/documents/{self.test_data['document_id']}/stats",
                params={"document_type": "diagram"}
            )
            
            print(f"獲取文檔統計狀態: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                if result.get('flag'):
                    stats = result.get('content', {})
                    print(f"✓ 獲取文檔統計成功: {json.dumps(stats, ensure_ascii=False, indent=2)}")
                    return True
                else:
                    print(f"✗ 獲取文檔統計失敗: {result.get('msg')}")
            
            return False
        except Exception as e:
            print(f"✗ 獲取文檔統計測試異常: {str(e)}")
            return False
    
    def run_all_tests(self):
        """運行所有測試"""
        print("=" * 60)
        print("版本控制服務測試開始")
        print("=" * 60)
        
        # 設置認證
        self.setup_auth()
        
        # 運行測試
        tests = [
            ("健康檢查", self.test_health_check),
            ("創建分支", self.test_create_branch),
            ("獲取分支列表", self.test_get_branches),
            ("創建提交", self.test_create_commit),
            ("獲取提交歷史", self.test_get_commit_history),
            ("創建功能分支", self.test_create_feature_branch),
            ("創建合併請求", self.test_create_merge_request),
            ("創建標籤", self.test_create_tag),
            ("獲取文檔統計", self.test_get_document_stats)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n--- {test_name} ---")
            try:
                if test_func():
                    passed += 1
                    print(f"✓ {test_name} 通過")
                else:
                    failed += 1
                    print(f"✗ {test_name} 失敗")
            except Exception as e:
                failed += 1
                print(f"✗ {test_name} 異常: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"測試結果: 通過 {passed}/{passed + failed}")
        print(f"測試數據: {json.dumps(self.test_data, ensure_ascii=False, indent=2)}")
        print("=" * 60)
        
        return passed, failed


def main():
    """主函數"""
    import argparse
    
    parser = argparse.ArgumentParser(description='版本控制服務測試腳本')
    parser.add_argument('--host', default='localhost', help='服務主機')
    parser.add_argument('--port', default=5060, type=int, help='服務端口')
    parser.add_argument('--verbose', action='store_true', help='詳細輸出')
    
    args = parser.parse_args()
    
    base_url = f"http://{args.host}:{args.port}"
    
    if args.verbose:
        print(f"測試目標: {base_url}")
    
    # 運行測試
    test_runner = VersionControlServiceTest(base_url)
    passed, failed = test_runner.run_all_tests()
    
    # 退出碼
    exit_code = 0 if failed == 0 else 1
    exit(exit_code)


if __name__ == "__main__":
    main()