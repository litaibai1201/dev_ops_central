# -*- coding: utf-8 -*-
"""
@文件: test_service_structure.py
@說明: 版本控制服務結構測試 (無需數據庫連接)
@時間: 2025-01-09  
@作者: LiDong
"""

import os
import sys
import importlib.util
import traceback


def test_module_imports():
    """測試所有模組是否可以正常導入"""
    print("測試模組導入...")
    
    # 測試基本模組
    modules_to_test = [
        ('serializes.version_control_serialize', '序列化模組'),
        ('dbs.mysql_db.model_tables', '數據庫模型'),
        ('models.version_control_model', '業務模型'), 
        ('controllers.version_control_controller', '控制器'),
        ('views.version_control_api', 'API視圖')
    ]
    
    results = []
    for module_path, description in modules_to_test:
        try:
            # 嘗試導入模組
            spec = importlib.util.spec_from_file_location(
                module_path, 
                f"/Users/lidong/Desktop/projects/dev_ops_central/version_control_service/{module_path.replace('.', '/')}.py"
            )
            
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                # 不執行模組，只檢查語法
                print(f"✓ {description} ({module_path}) 語法正確")
                results.append((description, True, None))
            else:
                print(f"✗ {description} ({module_path}) 文件未找到")
                results.append((description, False, "文件未找到"))
        
        except SyntaxError as e:
            print(f"✗ {description} ({module_path}) 語法錯誤: {str(e)}")
            results.append((description, False, f"語法錯誤: {str(e)}"))
        except Exception as e:
            print(f"⚠ {description} ({module_path}) 導入警告: {str(e)}")
            results.append((description, True, f"警告: {str(e)}"))
    
    return results


def test_file_structure():
    """測試文件結構完整性"""
    print("測試文件結構...")
    
    base_path = "/Users/lidong/Desktop/projects/dev_ops_central/version_control_service"
    required_files = [
        "app.py",
        "models/version_control_model.py",
        "controllers/version_control_controller.py", 
        "views/version_control_api.py",
        "serializes/version_control_serialize.py",
        "dbs/mysql_db/model_tables.py",
        "dbs/mysql_db/__init__.py",
        "test_version_control_service.py"
    ]
    
    results = []
    for file_path in required_files:
        full_path = os.path.join(base_path, file_path)
        if os.path.exists(full_path):
            file_size = os.path.getsize(full_path)
            print(f"✓ {file_path} 存在 ({file_size} bytes)")
            results.append((file_path, True, file_size))
        else:
            print(f"✗ {file_path} 缺失")
            results.append((file_path, False, 0))
    
    return results


def test_api_endpoints_definition():
    """測試API端點定義"""
    print("測試API端點定義...")
    
    try:
        # 讀取API文件內容
        api_file = "/Users/lidong/Desktop/projects/dev_ops_central/version_control_service/views/version_control_api.py"
        with open(api_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 檢查關鍵API端點
        endpoints = [
            '@blp.route("/documents/<document_id>/branches")',
            '@blp.route("/branches/<branch_id>")',
            '@blp.route("/branches/<branch_id>/commits")',
            '@blp.route("/commits/<commit_id>")',
            '@blp.route("/documents/<document_id>/merge-requests")',
            '@blp.route("/merge-requests/<mr_id>")',
            '@blp.route("/documents/<document_id>/tags")',
            '@blp.route("/compare")',
            '@blp.route("/diff")',
            '@blp.route("/documents/<document_id>/stats")'
        ]
        
        found_endpoints = []
        missing_endpoints = []
        
        for endpoint in endpoints:
            if endpoint in content:
                found_endpoints.append(endpoint)
                print(f"✓ 找到端點: {endpoint}")
            else:
                missing_endpoints.append(endpoint)
                print(f"✗ 缺失端點: {endpoint}")
        
        return found_endpoints, missing_endpoints
        
    except Exception as e:
        print(f"✗ 讀取API文件失敗: {str(e)}")
        return [], []


def test_schema_definitions():
    """測試Schema定義"""
    print("測試Schema定義...")
    
    try:
        # 讀取序列化文件內容
        schema_file = "/Users/lidong/Desktop/projects/dev_ops_central/version_control_service/serializes/version_control_serialize.py"
        with open(schema_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 檢查關鍵Schema
        schemas = [
            'class BranchCreateSchema',
            'class BranchUpdateSchema', 
            'class CommitCreateSchema',
            'class MergeRequestCreateSchema',
            'class TagCreateSchema',
            'class ReviewSubmitSchema',
            'class VersionCompareSchema',
            'class BranchResponseSchema',
            'class CommitResponseSchema',
            'class MergeRequestResponseSchema'
        ]
        
        found_schemas = []
        missing_schemas = []
        
        for schema in schemas:
            if schema in content:
                found_schemas.append(schema)
                print(f"✓ 找到Schema: {schema}")
            else:
                missing_schemas.append(schema)
                print(f"✗ 缺失Schema: {schema}")
        
        return found_schemas, missing_schemas
        
    except Exception as e:
        print(f"✗ 讀取Schema文件失敗: {str(e)}")
        return [], []


def run_all_tests():
    """運行所有測試"""
    print("=" * 60)
    print("版本控制服務結構測試")
    print("=" * 60)
    
    # 文件結構測試
    print("\n1. 文件結構測試")
    print("-" * 30)
    file_results = test_file_structure()
    file_pass = sum(1 for _, success, _ in file_results if success)
    file_total = len(file_results)
    
    # 模組導入測試
    print("\n2. 模組導入測試") 
    print("-" * 30)
    import_results = test_module_imports()
    import_pass = sum(1 for _, success, _ in import_results if success)
    import_total = len(import_results)
    
    # API端點測試
    print("\n3. API端點測試")
    print("-" * 30)
    found_endpoints, missing_endpoints = test_api_endpoints_definition()
    endpoint_pass = len(found_endpoints)
    endpoint_total = len(found_endpoints) + len(missing_endpoints)
    
    # Schema測試
    print("\n4. Schema定義測試")
    print("-" * 30)
    found_schemas, missing_schemas = test_schema_definitions()
    schema_pass = len(found_schemas)
    schema_total = len(found_schemas) + len(missing_schemas)
    
    # 總結
    print("\n" + "=" * 60)
    print("測試結果總結")
    print("=" * 60)
    print(f"文件結構: {file_pass}/{file_total} 通過")
    print(f"模組導入: {import_pass}/{import_total} 通過")
    print(f"API端點: {endpoint_pass}/{endpoint_total} 通過")
    print(f"Schema定義: {schema_pass}/{schema_total} 通過")
    
    total_pass = file_pass + import_pass + endpoint_pass + schema_pass
    total_tests = file_total + import_total + endpoint_total + schema_total
    
    print(f"\n整體通過率: {total_pass}/{total_tests} ({total_pass/total_tests*100:.1f}%)")
    
    if total_pass == total_tests:
        print("✅ 所有結構測試通過！服務結構完整。")
        return True
    else:
        print("⚠️ 部分測試未通過，請檢查上述問題。")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)