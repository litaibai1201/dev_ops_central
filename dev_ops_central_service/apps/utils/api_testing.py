"""
API测试工具模块
包含API请求测试相关的工具函数
"""

import time
import requests
from datetime import datetime, timezone
import uuid

def test_api_request(method, url, headers=None, params=None, body=None):
    """测试API请求"""
    start_time = time.time()
    
    try:
        # 准备请求参数
        request_kwargs = {
            'timeout': 30,
            'allow_redirects': True
        }
        
        if headers:
            request_kwargs['headers'] = headers
        
        if params:
            request_kwargs['params'] = params
        
        if body and method.upper() in ['POST', 'PUT', 'PATCH']:
            if headers and headers.get('Content-Type') == 'application/json':
                request_kwargs['json'] = body
            else:
                request_kwargs['data'] = body
        
        # 发送请求
        response = requests.request(method.upper(), url, **request_kwargs)
        
        # 计算响应时间
        response_time = int((time.time() - start_time) * 1000)
        
        return {
            'status_code': response.status_code,
            'headers': dict(response.headers),
            'body': response.text,
            'response_time': response_time,
            'success': True
        }
    
    except requests.exceptions.RequestException as e:
        response_time = int((time.time() - start_time) * 1000)
        return {
            'status_code': 0,
            'headers': {},
            'body': f'请求错误: {str(e)}',
            'response_time': response_time,
            'success': False,
            'error': str(e)
        }

def validate_test_assertions(response, assertions):
    """验证测试断言"""
    results = []
    
    for assertion in assertions:
        field = assertion.get('field')
        operator = assertion.get('operator')
        expected_value = assertion.get('expected_value')
        description = assertion.get('description', '')
        
        try:
            # 根据字段类型获取实际值
            if field == 'status_code':
                actual_value = response['status_code']
            elif field == 'response_time':
                actual_value = response['response_time']
            elif field.startswith('headers.'):
                header_name = field.split('.', 1)[1]
                actual_value = response['headers'].get(header_name)
            elif field.startswith('body.'):
                # 解析JSON响应体
                try:
                    import json
                    body_data = json.loads(response['body'])
                    field_path = field.split('.')[1:]
                    actual_value = get_nested_value(body_data, field_path)
                except:
                    actual_value = None
            else:
                actual_value = None
            
            # 执行断言
            assertion_result = execute_assertion(actual_value, operator, expected_value)
            
            results.append({
                'field': field,
                'operator': operator,
                'expected_value': expected_value,
                'actual_value': actual_value,
                'passed': assertion_result,
                'description': description
            })
        
        except Exception as e:
            results.append({
                'field': field,
                'operator': operator,
                'expected_value': expected_value,
                'actual_value': None,
                'passed': False,
                'description': description,
                'error': str(e)
            })
    
    return results

def execute_assertion(actual_value, operator, expected_value):
    """执行单个断言"""
    try:
        if operator == 'equals':
            return actual_value == expected_value
        elif operator == 'not_equals':
            return actual_value != expected_value
        elif operator == 'contains':
            return str(expected_value) in str(actual_value)
        elif operator == 'not_contains':
            return str(expected_value) not in str(actual_value)
        elif operator == 'greater_than':
            return float(actual_value) > float(expected_value)
        elif operator == 'less_than':
            return float(actual_value) < float(expected_value)
        elif operator == 'greater_than_or_equal':
            return float(actual_value) >= float(expected_value)
        elif operator == 'less_than_or_equal':
            return float(actual_value) <= float(expected_value)
        elif operator == 'exists':
            return actual_value is not None
        elif operator == 'not_exists':
            return actual_value is None
        elif operator == 'is_empty':
            return not actual_value
        elif operator == 'is_not_empty':
            return bool(actual_value)
        else:
            return False
    except (ValueError, TypeError):
        return False

def get_nested_value(data, path):
    """从嵌套字典中获取值"""
    current = data
    for key in path:
        if isinstance(current, dict) and key in current:
            current = current[key]
        elif isinstance(current, list) and key.isdigit() and int(key) < len(current):
            current = current[int(key)]
        else:
            return None
    return current

def prepare_test_environment(environment_config, api_method):
    """准备测试环境配置"""
    base_url = environment_config.get('base_url', '')
    variables = environment_config.get('variables', {})
    env_headers = environment_config.get('headers', {})
    
    # 替换URL中的变量
    url = api_method['url']
    for var_name, var_value in variables.items():
        url = url.replace(f'{{{var_name}}}', str(var_value))
    
    # 完整URL
    full_url = base_url.rstrip('/') + url
    
    # 合并headers
    headers = {**env_headers, **api_method.get('headers', {})}
    
    return {
        'url': full_url,
        'headers': headers,
        'variables': variables
    }

def create_test_result_record(test_case_id, response, assertion_results, executed_by):
    """创建测试结果记录"""
    # 计算测试状态
    if not response.get('success', False):
        status = 'error'
        errors = [response.get('error', '请求失败')]
    elif assertion_results:
        failed_assertions = [r for r in assertion_results if not r['passed']]
        if failed_assertions:
            status = 'failed'
            errors = [f"{r['field']} {r['operator']} {r['expected_value']} - 实际值: {r['actual_value']}" 
                     for r in failed_assertions]
        else:
            status = 'passed'
            errors = []
    else:
        # 没有断言，仅检查响应状态码
        if 200 <= response.get('status_code', 0) < 300:
            status = 'passed'
            errors = []
        else:
            status = 'failed'
            errors = [f"HTTP状态码错误: {response.get('status_code', 0)}"]
    
    return {
        'id': str(uuid.uuid4()),
        'test_case_id': test_case_id,
        'status': status,
        'response_time': response.get('response_time', 0),
        'response_code': response.get('status_code', 0),
        'response_body': response.get('body', ''),
        'errors': errors,
        'assertion_results': assertion_results,
        'executed_at': datetime.now(timezone.utc).isoformat(),
        'executed_by': executed_by
    }

def batch_test_apis(test_cases, environment_config):
    """批量测试API"""
    results = []
    
    for test_case in test_cases:
        try:
            # 准备测试环境
            env_config = prepare_test_environment(environment_config, test_case['api'])
            
            # 合并测试用例参数
            headers = {**env_config['headers'], **test_case.get('headers', {})}
            params = test_case.get('params', {})
            body = test_case.get('body')
            
            # 执行API请求
            response = test_api_request(
                method=test_case['api']['method'],
                url=env_config['url'],
                headers=headers,
                params=params,
                body=body
            )
            
            # 验证断言
            assertion_results = []
            if test_case.get('assertions'):
                assertion_results = validate_test_assertions(response, test_case['assertions'])
            
            # 创建测试结果
            result = create_test_result_record(
                test_case_id=test_case['id'],
                response=response,
                assertion_results=assertion_results,
                executed_by=test_case.get('executed_by')
            )
            
            results.append(result)
            
        except Exception as e:
            # 测试执行异常
            error_result = {
                'id': str(uuid.uuid4()),
                'test_case_id': test_case['id'],
                'status': 'error',
                'response_time': 0,
                'response_code': 0,
                'response_body': '',
                'errors': [f'测试执行异常: {str(e)}'],
                'assertion_results': [],
                'executed_at': datetime.now(timezone.utc).isoformat(),
                'executed_by': test_case.get('executed_by')
            }
            results.append(error_result)
    
    return results

def generate_test_report(test_results):
    """生成测试报告"""
    total_tests = len(test_results)
    passed_tests = len([r for r in test_results if r['status'] == 'passed'])
    failed_tests = len([r for r in test_results if r['status'] == 'failed'])
    error_tests = len([r for r in test_results if r['status'] == 'error'])
    
    avg_response_time = sum(r['response_time'] for r in test_results) / total_tests if total_tests > 0 else 0
    
    return {
        'summary': {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'errors': error_tests,
            'success_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            'avg_response_time': round(avg_response_time, 2)
        },
        'details': test_results,
        'generated_at': datetime.now(timezone.utc).isoformat()
    }
