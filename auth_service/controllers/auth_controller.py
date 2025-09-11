# -*- coding: utf-8 -*-
"""
@文件: auth_controller.py
@說明: 認證控制器 (优化版本)
@時間: 2025-01-09
@作者: LiDong
"""

import hashlib
import traceback
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any, Optional
from flask import request, g
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token

from common.common_tools import CommonTools
from dbs.mysql_db import DBFunction
from dbs.mysql_db.model_tables import UserModel, RefreshTokenModel, LoginLogModel
from models.auth_model import OperUserModel, OperRefreshTokenModel, OperLoginLogModel
from configs.constant import Config
from loggers import logger
from cache import redis_client


class AuthController:
    """認證控制器 (优化版本)"""
    
    # 类级别的单例缓存
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AuthController, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        # 避免重复初始化
        if AuthController._initialized:
            return
            
        self.oper_user = OperUserModel()
        self.oper_refresh_token = OperRefreshTokenModel()
        self.oper_login_log = OperLoginLogModel()
        
        # 配置项
        self.max_login_attempts = Config.MAX_LOGIN_ATTEMPTS
        self.lockout_duration = Config.ACCOUNT_LOCKOUT_DURATION
        self.password_min_length = Config.PASSWORD_MIN_LENGTH
        
        AuthController._initialized = True

    # ==================== 公共验证和工具方法 ====================
    
    def _get_client_info(self):
        """获取客户端信息"""
        return {
            'ip_address': request.remote_addr or '未知',
            'user_agent': request.headers.get('User-Agent', '未知'),
            'device_info': self._parse_device_info(request.headers.get('User-Agent', ''))
        }
    
    def _parse_device_info(self, user_agent):
        """解析设备信息"""
        # 简化的设备信息解析
        if 'Mobile' in user_agent:
            return '移動設備'
        elif 'Tablet' in user_agent:
            return '平板設備'
        else:
            return '桌面設備'
    
    def _validate_password_strength(self, password):
        """验证密码强度"""
        if len(password) < self.password_min_length:
            return f"密碼長度至少需要{self.password_min_length}位"
        
        # 检查是否包含数字和字母
        has_digit = any(c.isdigit() for c in password)
        has_letter = any(c.isalpha() for c in password)
        
        if not (has_digit and has_letter):
            return "密碼必須包含字母和數字"
        
        return None
    
    def _validate_email_format(self, email):
        """验证邮箱格式"""
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return "郵箱格式不正確"
        return None
    
    def _is_account_locked(self, user_id):
        """检查账户是否被锁定"""
        cache_key = f"failed_attempts:{user_id}"
        attempts = redis_client.get(cache_key)
        
        if attempts and int(attempts) >= self.max_login_attempts:
            return True
        
        # 数据库检查
        failed_count = self.oper_login_log.get_failed_login_attempts(user_id, self.lockout_duration)
        return failed_count >= self.max_login_attempts
    
    def _record_failed_attempt(self, user_id):
        """记录失败尝试"""
        cache_key = f"failed_attempts:{user_id}"
        current_attempts = redis_client.get(cache_key) or 0
        redis_client.setex(cache_key, self.lockout_duration * 3600, int(current_attempts) + 1)
    
    def _clear_failed_attempts(self, user_id):
        """清除失败尝试记录"""
        cache_key = f"failed_attempts:{user_id}"
        redis_client.delete(cache_key)
    
    def _create_refresh_token_record(self, user_id, refresh_token):
        """创建刷新令牌记录"""
        client_info = self._get_client_info()
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        # 计算过期时间
        expires_at = CommonTools.get_now(days=Config.REFRESH_TOKEN_EXPIRE_DAYS)
        
        token_data = {
            'user_id': user_id,
            'token_hash': token_hash,
            'expires_at': expires_at,
            'device_info': client_info['device_info'],
            'ip_address': client_info['ip_address']
        }
        
        # 直接创建模型实例
        from dbs.mysql_db.model_tables import RefreshTokenModel
        token_obj = RefreshTokenModel(**token_data)
        print(f"Debug: Token object created: user_id={token_obj.user_id}, token_hash={token_obj.token_hash}")
        
        result = self.oper_refresh_token.create_refresh_token(token_obj)
        print(f"Debug: Token creation result = {result}")
        return result
    
    def _create_login_log(self, user_id, login_type="password", result="success", fail_reason=None):
        """创建登录日志"""
        client_info = self._get_client_info()
        
        log_data = {
            'user_id': user_id,
            'login_type': login_type,
            'ip_address': client_info['ip_address'],
            'user_agent': client_info['user_agent'],
            'device_info': client_info['device_info'],
            'login_result': result,
            'fail_reason': fail_reason
        }
        
        # 直接创建模型实例
        from dbs.mysql_db.model_tables import LoginLogModel
        log_obj = LoginLogModel(**log_data)
        
        return self.oper_login_log.create_login_log(log_obj)

    # ==================== 事务处理装饰器 ====================
    
    def _execute_with_transaction(self, operation_func, operation_name: str, *args, **kwargs):
        """事务执行装饰器"""
        try:
            result = operation_func(*args, **kwargs)
            commit_result, commit_flag = DBFunction.do_commit(f"{operation_name}成功", True)
            if commit_flag:
                return result, True
            else:
                raise Exception(f"提交事務失敗: {commit_result}")
        except Exception as e:
            DBFunction.db_rollback()
            logger.error(f"{operation_name}失敗: {str(e)}")
            traceback.print_exc()
            return f"{operation_name}失敗: {str(e)}", False

    # ==================== 主要业务方法 ====================
    
    def register(self, data: Dict) -> Tuple[Any, bool]:
        """用户注册"""
        def _register_operation():
            # 验证密码强度
            password_error = self._validate_password_strength(data['password'])
            if password_error:
                raise ValueError(password_error)
            
            # 验证邮箱格式
            email_error = self._validate_email_format(data['email'])
            if email_error:
                raise ValueError(email_error)
            
            # 创建用户对象
            user_data = {
                'username': data['username'].strip(),
                'email': data['email'].strip().lower(),
                'password_hash': OperUserModel.hash_password(data['password']),
                'full_name': data.get('full_name', '').strip(),
                'phone': data.get('phone', '').strip(),
                'role': 'user'  # 默认用户角色
            }
            
            # 直接创建模型实例
            from dbs.mysql_db.model_tables import UserModel
            user_obj = UserModel(**user_data)
            
            # 创建用户
            result, flag = self.oper_user.create_user(user_obj)
            if not flag:
                raise Exception(f"創建用戶失敗: {result}")
            
            # 获取创建的用户信息
            created_user = self.oper_user.get_by_username(user_data['username'])
            if not created_user:
                raise Exception("用戶創建成功但無法獲取用戶信息")
            
            return {
                'user_id': created_user.id,
                'username': created_user.username,
                'email': created_user.email,
                'full_name': created_user.full_name,
                'created_at': created_user.created_at
            }
        
        return self._execute_with_transaction(_register_operation, "用戶註冊")
    
    def login(self, data: Dict) -> Tuple[Any, bool]:
        """用户登录"""
        try:
            credential = data['credential'].strip()  # 支持用户名或邮箱
            password = data['password']
            
            # 获取用户
            user = self.oper_user.get_by_login_credential(credential)
            if not user:
                return "用戶名或密碼錯誤", False
            
            # 检查账户是否被锁定
            if self._is_account_locked(user.id):
                self._create_login_log(user.id, "password", "failed", "賬戶被鎖定")
                return f"賬戶被鎖定，請在{self.lockout_duration}小時後重試", False
            
            # 验证密码
            if not self.oper_user.verify_password(user, password):
                self._record_failed_attempt(user.id)
                self._create_login_log(user.id, "password", "failed", "密碼錯誤")
                return "用戶名或密碼錯誤", False
            
            # 清除失败尝试记录
            self._clear_failed_attempts(user.id)
            
            # 创建JWT令牌
            import uuid
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    'username': user.username,
                    'jti': str(uuid.uuid4())  # 添加唯一标识符用于撤销
                }
            )
            refresh_token = create_refresh_token(
                identity=str(user.id),
                additional_claims={
                    'username': user.username,
                    'jti': str(uuid.uuid4())  # 添加唯一标识符用于撤销
                }
            )
            
            def _login_transaction():
                # 创建刷新令牌记录
                token_result, token_flag = self._create_refresh_token_record(user.id, refresh_token)
                if not token_flag:
                    raise Exception(f"創建刷新令牌失敗: {token_result}")
                
                # 更新最后登录时间
                login_result, login_flag = self.oper_user.update_last_login(
                    user, self._get_client_info()['ip_address']
                )
                if not login_flag:
                    logger.warning(f"更新最後登錄時間失敗: {login_result}")
                
                # 创建登录日志
                log_result, log_flag = self._create_login_log(user.id, "password", "success")
                if not log_flag:
                    logger.warning(f"創建登錄日誌失敗: {log_result}")
                
                return {
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'token_type': 'Bearer',
                    'user_info': {
                        'user_id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'full_name': user.full_name,
                        'role': user.role,
                        'avatar_url': user.avatar_url
                    }
                }
            
            return self._execute_with_transaction(_login_transaction, "用戶登錄")
            
        except Exception as e:
            logger.error(f"登錄異常: {str(e)}")
            return "登錄失敗，系統內部錯誤", False
    
    def refresh_token(self, refresh_token: str) -> Tuple[Any, bool]:
        """刷新访问令牌"""
        try:
            # 验证刷新令牌
            try:
                token_data = decode_token(refresh_token)
                user_id = int(token_data['sub'])  # sub is now a string containing user_id
            except Exception:
                traceback.print_exc()
                return "刷新令牌無效", False
            
            # 检查令牌记录
            token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
            print(f"Debug: token_hash = {token_hash}")
            token_record = self.oper_refresh_token.get_by_token_hash(token_hash)
            print(f"Debug: token_record = {token_record}")
            
            if not token_record:
                print("Debug: No token record found")
                return "刷新令牌已過期或無效", False
            
            is_valid = self.oper_refresh_token.is_token_valid(token_record)
            print(f"Debug: is_token_valid = {is_valid}")
            if not is_valid:
                print(f"Debug: Token invalid - status: {token_record.status}, is_revoked: {token_record.is_revoked}, expires_at: {token_record.expires_at}")
                return "刷新令牌已過期或無效", False
            
            # 获取用户信息
            user = self.oper_user.get_by_id(user_id)
            if not user:
                return "用戶不存在", False
            
            # 创建新的访问令牌
            import uuid
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    'username': user.username,
                    'jti': str(uuid.uuid4())  # 添加唯一标识符用于撤销
                }
            )
            
            def _refresh_transaction():
                # 记录刷新日志
                log_result, log_flag = self._create_login_log(
                    user.id, "refresh", "success"
                )
                if not log_flag:
                    logger.warning(f"創建刷新日誌失敗: {log_result}")
                
                return {
                    'access_token': access_token,
                    'token_type': 'Bearer',
                    'user_info': {
                        'user_id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'full_name': user.full_name,
                        'role': user.role
                    }
                }
            
            return _refresh_transaction(), True
            
        except Exception as e:
            logger.error(f"刷新令牌異常: {str(e)}")
            return "刷新令牌失敗", False
    
    def get_profile(self, user_id: int) -> Tuple[Any, bool]:
        """获取用户档案"""
        try:
            user = self.oper_user.get_by_id(user_id)
            if not user:
                return "用戶不存在", False
            
            # 获取活跃的刷新令牌数量
            active_tokens = self.oper_refresh_token.get_active_tokens_by_user(user_id)
            
            profile_data = {
                'user_info': {
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'full_name': user.full_name,
                    'phone': user.phone,
                    'avatar_url': user.avatar_url,
                    'role': user.role,
                    'is_email_verified': user.is_email_verified,
                    'last_login_at': user.last_login_at,
                    'created_at': user.created_at
                },
                'security_info': {
                    'active_sessions': len(active_tokens),
                    'last_login_ip': user.login_ip
                }
            }
            
            return profile_data, True
            
        except Exception as e:
            logger.error(f"獲取用戶檔案異常: {str(e)}")
            return "獲取用戶信息失敗", False
    
    def logout(self, refresh_token: str, access_token: str = None) -> Tuple[Any, bool]:
        """用户登出"""
        try:
            # 撤销刷新令牌
            token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
            token_record = self.oper_refresh_token.get_by_token_hash(token_hash)
            
            def _logout_transaction():
                # 撤销refresh token
                if token_record:
                    revoke_result, revoke_flag = self.oper_refresh_token.revoke_token(token_record)
                    if not revoke_flag:
                        raise Exception(f"撤銷刷新令牌失敗: {revoke_result}")
                
                # 将refresh token加入黑名单
                try:
                    refresh_token_data = decode_token(refresh_token)
                    refresh_jti = refresh_token_data.get('jti')
                    refresh_exp = refresh_token_data.get('exp')
                    
                    if refresh_jti and refresh_exp:
                        import time
                        remaining_time = refresh_exp - int(time.time())
                        if remaining_time > 0:
                            blacklist_key = f"blacklisted_token:{refresh_jti}"
                            redis_client.setex(blacklist_key, remaining_time, "revoked")
                            logger.info(f"Refresh token已加入黑名單: {refresh_jti}")
                except Exception as e:
                    logger.warning(f"撤銷refresh token黑名單失敗: {str(e)}")
                
                # 如果提供了access token，将其加入黑名单
                if access_token:
                    try:
                        # 解析access token获取jti和过期时间
                        access_token_data = decode_token(access_token)
                        jti = access_token_data.get('jti')
                        exp = access_token_data.get('exp')
                        
                        if jti and exp:
                            # 计算token剩余有效时间
                            import time
                            remaining_time = exp - int(time.time())
                            if remaining_time > 0:
                                # 将token jti加入Redis黑名单，过期时间设置为token的剩余有效时间
                                blacklist_key = f"blacklisted_token:{jti}"
                                redis_client.setex(blacklist_key, remaining_time, "revoked")
                                logger.info(f"Access token已加入黑名單: {jti}")
                    except Exception as e:
                        logger.warning(f"撤銷access token失敗: {str(e)}")
                        # 不影响整体logout流程
                
                return "登出成功"
            
            return self._execute_with_transaction(_logout_transaction, "用戶登出")
            
        except Exception as e:
            logger.error(f"登出異常: {str(e)}")
            return "登出失敗", False
    
    def get_user_sessions(self, user_id: int, current_token_hash: str = None) -> Tuple[Any, bool]:
        """获取用户会话列表 (MVC架构优化版本)"""
        try:
            # 获取活跃的刷新令牌
            active_tokens = self.oper_refresh_token.get_active_tokens_by_user(user_id)
            
            sessions_data = []
            for token in active_tokens:
                # 检测是否为当前会话
                is_current = False
                if current_token_hash and token.token_hash == current_token_hash:
                    is_current = True
                
                session_info = {
                    'token_id': token.id,
                    'device_info': token.device_info or "未知設備",
                    'ip_address': token.ip_address or "未知IP",
                    'created_at': token.created_at,
                    'expires_at': token.expires_at,
                    'is_current': is_current,
                    'status': '活躍' if self.oper_refresh_token.is_token_valid(token) else '已過期'
                }
                sessions_data.append(session_info)
            
            # 按创建时间倒序排序
            sessions_data.sort(key=lambda x: x['created_at'], reverse=True)
            
            result = {
                'user_id': user_id,
                'total_sessions': len(sessions_data),
                'active_sessions': len([s for s in sessions_data if s['status'] == '活躍']),
                'sessions': sessions_data
            }
            
            return result, True
            
        except Exception as e:
            logger.error(f"獲取用戶會話列表異常: {str(e)}")
            return "獲取會話列表失敗", False
    
    def revoke_user_session(self, user_id: int, token_id: int) -> Tuple[Any, bool]:
        """撤销指定用户会话"""
        try:
            # 获取令牌记录
            token_record = None
            active_tokens = self.oper_refresh_token.get_active_tokens_by_user(user_id)
            
            for token in active_tokens:
                if token.id == token_id:
                    token_record = token
                    break
            
            if not token_record:
                return "會話不存在或已失效", False
            
            def _revoke_session_transaction():
                revoke_result, revoke_flag = self.oper_refresh_token.revoke_token(token_record)
                if not revoke_flag:
                    raise Exception(f"撤銷會話失敗: {revoke_result}")
                
                return f"會話已成功撤銷"
            
            return self._execute_with_transaction(_revoke_session_transaction, "撤銷用戶會話")
            
        except Exception as e:
            logger.error(f"撤銷用戶會話異常: {str(e)}")
            return "撤銷會話失敗", False