# -*- coding: utf-8 -*-
"""
@文件: auth_controller.py
@說明: 認證控制器 (优化版本)
@時間: 2025-01-09
@作者: LiDong
"""

import hashlib
import secrets
import uuid
import traceback
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any, Optional, List
from flask import request, g
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token
from sqlalchemy import and_, or_, func

from common.common_tools import CommonTools
from dbs.mysql_db import DBFunction
from dbs.mysql_db.model_tables import (
    UserModel, UserSessionModel, UserRoleModel, UserRoleAssignmentModel,
    LoginAttemptModel, OAuthProviderModel, UserOAuthAccountModel
)
from models.auth_model import (
    OperUserModel, OperUserSessionModel, OperUserRoleModel,
    OperLoginAttemptModel, OperOAuthProviderModel
)
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
        self.oper_session = OperUserSessionModel()
        self.oper_role = OperUserRoleModel()
        self.oper_login_attempt = OperLoginAttemptModel()
        self.oper_oauth = OperOAuthProviderModel()
        
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
    
    def _is_account_locked(self, user):
        """检查账户是否被锁定"""
        # 检查数据库中的锁定状态
        if self.oper_user.is_account_locked(user):
            return True
            
        # 检查缓存中的失败尝试次数
        cache_key = f"failed_attempts:{user.id}"
        attempts = redis_client.get(cache_key)
        
        if attempts and int(attempts) >= self.max_login_attempts:
            return True
        
        # 检查最近的失败登录尝试
        failed_count = self.oper_login_attempt.get_recent_failed_attempts(
            user.email, 'email', self.lockout_duration
        )
        return failed_count >= self.max_login_attempts
    
    def _record_failed_attempt(self, user, credential, reason):
        """记录失败尝试"""
        cache_key = f"failed_attempts:{user.id if user else 'unknown'}"
        current_attempts = redis_client.get(cache_key) or 0
        redis_client.setex(cache_key, self.lockout_duration * 3600, int(current_attempts) + 1)
        
        # 记录到数据库
        client_info = self._get_client_info()
        attempt_data = LoginAttemptModel(
            email=credential if '@' in credential else None,
            username=credential if '@' not in credential else None,
            ip_address=client_info['ip_address'],
            user_agent=client_info['user_agent'],
            success=False,
            failure_reason=reason
        )
        self.oper_login_attempt.create_attempt(attempt_data)
        
        # 如果用户存在且失败次数过多，锁定账户
        if user and int(current_attempts) + 1 >= self.max_login_attempts:
            self.oper_user.lock_user(user, self.lockout_duration * 60)
    
    def _clear_failed_attempts(self, user):
        """清除失败尝试记录"""
        cache_key = f"failed_attempts:{user.id}"
        redis_client.delete(cache_key)
        
        # 重置数据库中的失败次数
        self.oper_user.update_user(user, {'failed_login_attempts': 0, 'locked_until': None})
    
    def _create_user_session(self, user_id, session_token, refresh_token):
        """创建用户会话"""
        client_info = self._get_client_info()
        refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        
        # 计算过期时间
        expires_at = datetime.now() + timedelta(days=Config.REFRESH_TOKEN_EXPIRE_DAYS)
        
        session_data = UserSessionModel(
            user_id=user_id,
            session_token=session_token,
            refresh_token_hash=refresh_token_hash,
            device_info={
                'type': client_info['device_info'],
                'user_agent': client_info['user_agent']
            },
            ip_address=client_info['ip_address'],
            expires_at=expires_at
        )
        
        return self.oper_session.create_session(session_data)
    
    def _record_successful_login(self, user, credential):
        """记录成功登录"""
        client_info = self._get_client_info()
        attempt_data = LoginAttemptModel(
            email=credential if '@' in credential else user.email,
            username=credential if '@' not in credential else user.username,
            ip_address=client_info['ip_address'],
            user_agent=client_info['user_agent'],
            success=True
        )
        return self.oper_login_attempt.create_attempt(attempt_data)

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
            
            # 创建密码哈希和盐值
            password_hash, salt = OperUserModel.create_password_hash(data['password'])
            
            # 生成邮箱验证令牌
            verification_token = secrets.token_urlsafe(32)
            verification_expires = datetime.now() + timedelta(hours=24)
            
            # 创建用户对象
            user_obj = UserModel(
                username=data['username'].strip(),
                email=data['email'].strip().lower(),
                password_hash=password_hash,
                salt=salt,
                display_name=data.get('display_name', data['username'].strip()),
                phone=data.get('phone', '').strip(),
                timezone=data.get('timezone', 'UTC'),
                language=data.get('language', 'en'),
                email_verification_token=verification_token,
                email_verification_expires=verification_expires,
                status='pending_verification'
            )
            
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
                'display_name': created_user.display_name,
                'status': created_user.status,
                'email_verification_token': verification_token,
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
            if self._is_account_locked(user):
                self._record_failed_attempt(user, credential, "賬戶被鎖定")
                return f"賬戶被鎖定，請在{self.lockout_duration}小時後重試", False
            
            # 检查账户状态
            if user.status not in ['active', 'pending_verification']:
                self._record_failed_attempt(user, credential, f"賬戶狀態：{user.status}")
                return f"賬戶狀態異常：{user.status}", False
            
            # 验证密码
            if not self.oper_user.verify_password(user, password):
                self._record_failed_attempt(user, credential, "密碼錯誤")
                return "用戶名或密碼錯誤", False
            
            # 清除失败尝试记录
            self._clear_failed_attempts(user)
            
            # 创建JWT令牌
            session_id = str(uuid.uuid4())
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    'username': user.username,
                    'session_id': session_id,
                    'jti': str(uuid.uuid4())
                }
            )
            refresh_token = create_refresh_token(
                identity=str(user.id),
                additional_claims={
                    'username': user.username,
                    'session_id': session_id,
                    'jti': str(uuid.uuid4())
                }
            )
            
            def _login_transaction():
                # 创建用户会话
                session_result, session_flag = self._create_user_session(user.id, session_id, refresh_token)
                if not session_flag:
                    raise Exception(f"創建用戶會話失敗: {session_result}")
                
                # 更新最后登录时间
                login_result, login_flag = self.oper_user.update_last_login(
                    user, self._get_client_info()['ip_address']
                )
                if not login_flag:
                    logger.warning(f"更新最後登錄時間失敗: {login_result}")
                
                # 记录成功登录
                attempt_result, attempt_flag = self._record_successful_login(user, credential)
                if not attempt_flag:
                    logger.warning(f"記錄成功登錄失敗: {attempt_result}")
                
                return {
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'token_type': 'Bearer',
                    'session_id': session_id,
                    'user_info': {
                        'user_id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'display_name': user.display_name,
                        'status': user.status,
                        'email_verified': user.email_verified,
                        'two_factor_enabled': user.two_factor_enabled,
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
            
            # 获取活跃的用户会话数量
            active_sessions = self.oper_session.get_active_sessions_by_user(user_id)
            
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
                    'active_sessions': len(active_sessions),
                    'last_login_ip': user.last_login_ip
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
            # 获取活跃的用户会话
            active_sessions = self.oper_session.get_active_sessions_by_user(user_id)
            
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
    
    # ==================== 新增的功能方法 ====================
    
    def forgot_password(self, email: str) -> Tuple[Any, bool]:
        """忘记密码"""
        try:
            user = self.oper_user.get_by_email(email)
            if not user:
                # 為了安全性，即使用戶不存在也返回成功消息
                return "如果該郵箱已註冊，您將收到密碼重置郵件", True
            
            # 生成密碼重置令牌
            reset_token = secrets.token_urlsafe(32)
            reset_expires = datetime.now() + timedelta(hours=1)
            
            def _forgot_password_transaction():
                result, flag = self.oper_user.set_password_reset_token(user, reset_token, reset_expires)
                if not flag:
                    raise Exception(f"設置密碼重置令牌失敗: {result}")
                
                return {
                    'reset_token': reset_token,
                    'expires_at': reset_expires.isoformat(),
                    'message': '密碼重置郵件已發送'
                }
            
            return self._execute_with_transaction(_forgot_password_transaction, "忘記密碼")
            
        except Exception as e:
            logger.error(f"忘記密碼異常: {str(e)}")
            return "處理忘記密碼請求失敗", False
    
    def reset_password(self, token: str, new_password: str) -> Tuple[Any, bool]:
        """重置密码"""
        try:
            # 验证密码强度
            password_error = self._validate_password_strength(new_password)
            if password_error:
                return password_error, False
            
            # 查找具有有效重置令牌的用戶
            user = self.oper_user.model.query.filter(
                and_(
                    self.oper_user.model.password_reset_token == token,
                    self.oper_user.model.password_reset_expires > datetime.now()
                )
            ).first()
            
            if not user:
                return "密碼重置令牌無效或已過期", False
            
            def _reset_password_transaction():
                result, flag = self.oper_user.update_password(user, new_password)
                if not flag:
                    raise Exception(f"更新密碼失敗: {result}")
                
                return "密碼重置成功"
            
            return self._execute_with_transaction(_reset_password_transaction, "重置密碼")
            
        except Exception as e:
            logger.error(f"重置密碼異常: {str(e)}")
            return "重置密碼失敗", False
    
    def change_password(self, user_id: str, old_password: str, new_password: str) -> Tuple[Any, bool]:
        """修改密码"""
        try:
            # 验证新密码强度
            password_error = self._validate_password_strength(new_password)
            if password_error:
                return password_error, False
            
            user = self.oper_user.get_by_id(user_id)
            if not user:
                return "用戶不存在", False
            
            # 验证旧密码
            if not self.oper_user.verify_password(user, old_password):
                return "原密碼錯誤", False
            
            def _change_password_transaction():
                result, flag = self.oper_user.update_password(user, new_password)
                if not flag:
                    raise Exception(f"更新密碼失敗: {result}")
                
                return "密碼修改成功"
            
            return self._execute_with_transaction(_change_password_transaction, "修改密碼")
            
        except Exception as e:
            logger.error(f"修改密碼異常: {str(e)}")
            return "修改密碼失敗", False
    
    def send_verification_email(self, user_id: str) -> Tuple[Any, bool]:
        """发送验证邮件"""
        try:
            user = self.oper_user.get_by_id(user_id)
            if not user:
                return "用戶不存在", False
            
            if user.email_verified:
                return "郵箱已經驗證過了", False
            
            # 生成新的驗證令牌
            verification_token = secrets.token_urlsafe(32)
            verification_expires = datetime.now() + timedelta(hours=24)
            
            def _send_verification_transaction():
                result, flag = self.oper_user.set_email_verification_token(
                    user, verification_token, verification_expires
                )
                if not flag:
                    raise Exception(f"設置郵箱驗證令牌失敗: {result}")
                
                return {
                    'verification_token': verification_token,
                    'expires_at': verification_expires.isoformat(),
                    'message': '驗證郵件已發送'
                }
            
            return self._execute_with_transaction(_send_verification_transaction, "發送驗證郵件")
            
        except Exception as e:
            logger.error(f"發送驗證郵件異常: {str(e)}")
            return "發送驗證郵件失敗", False
    
    def verify_email(self, token: str) -> Tuple[Any, bool]:
        """验证邮箱"""
        try:
            # 查找具有有效驗證令牌的用戶
            user = self.oper_user.model.query.filter(
                and_(
                    self.oper_user.model.email_verification_token == token,
                    self.oper_user.model.email_verification_expires > datetime.now()
                )
            ).first()
            
            if not user:
                return "郵箱驗證令牌無效或已過期", False
            
            if user.email_verified:
                return "郵箱已經驗證過了", False
            
            def _verify_email_transaction():
                result, flag = self.oper_user.verify_email(user)
                if not flag:
                    raise Exception(f"驗證郵箱失敗: {result}")
                
                return "郵箱驗證成功"
            
            return self._execute_with_transaction(_verify_email_transaction, "驗證郵箱")
            
        except Exception as e:
            logger.error(f"驗證郵箱異常: {str(e)}")
            return "驗證郵箱失敗", False
    
    def setup_two_factor(self, user_id: str) -> Tuple[Any, bool]:
        """设置双重认证"""
        try:
            user = self.oper_user.get_by_id(user_id)
            if not user:
                return "用戶不存在", False
            
            if user.two_factor_enabled:
                return "雙重認證已經啟用", False
            
            # 生成2FA密鑰和備用碼
            import pyotp
            secret = pyotp.random_base32()
            backup_codes = [secrets.token_hex(4).upper() for _ in range(10)]
            
            def _setup_2fa_transaction():
                result, flag = self.oper_user.setup_two_factor(user, secret, backup_codes)
                if not flag:
                    raise Exception(f"設置雙重認證失敗: {result}")
                
                return {
                    'secret': secret,
                    'backup_codes': backup_codes,
                    'qr_code_url': pyotp.totp.TOTP(secret).provisioning_uri(
                        user.email,
                        issuer_name="DevOps Central"
                    )
                }
            
            return self._execute_with_transaction(_setup_2fa_transaction, "設置雙重認證")
            
        except Exception as e:
            logger.error(f"設置雙重認證異常: {str(e)}")
            return "設置雙重認證失敗", False
    
    def verify_two_factor(self, user_id: str, token: str) -> Tuple[Any, bool]:
        """验证双重认证"""
        try:
            user = self.oper_user.get_by_id(user_id)
            if not user or not user.two_factor_enabled:
                return "雙重認證未啟用", False
            
            import pyotp
            totp = pyotp.TOTP(user.two_factor_secret)
            
            # 驗證TOTP令牌或備用碼
            is_valid = totp.verify(token, valid_window=1)
            if not is_valid and user.backup_codes:
                is_valid = token.upper() in user.backup_codes
                if is_valid:
                    # 使用備用碼後移除它
                    user.backup_codes.remove(token.upper())
                    db.session.commit()
            
            if not is_valid:
                return "驗證碼錯誤", False
            
            return "雙重認證驗證成功", True
            
        except Exception as e:
            logger.error(f"驗證雙重認證異常: {str(e)}")
            return "驗證雙重認證失敗", False
    
    def disable_two_factor(self, user_id: str, password: str) -> Tuple[Any, bool]:
        """禁用双重认证"""
        try:
            user = self.oper_user.get_by_id(user_id)
            if not user:
                return "用戶不存在", False
            
            if not user.two_factor_enabled:
                return "雙重認證未啟用", False
            
            # 验证密码
            if not self.oper_user.verify_password(user, password):
                return "密碼錯誤", False
            
            def _disable_2fa_transaction():
                result, flag = self.oper_user.disable_two_factor(user)
                if not flag:
                    raise Exception(f"禁用雙重認證失敗: {result}")
                
                return "雙重認證已禁用"
            
            return self._execute_with_transaction(_disable_2fa_transaction, "禁用雙重認證")
            
        except Exception as e:
            logger.error(f"禁用雙重認證異常: {str(e)}")
            return "禁用雙重認證失敗", False
    
    def validate_token_internal(self, token: str) -> Tuple[Any, bool]:
        """内部服务验证令牌"""
        try:
            # 解析JWT令牌
            try:
                token_data = decode_token(token)
                user_id = token_data['sub']
                session_id = token_data.get('session_id')
            except Exception:
                return "令牌無效", False
            
            # 检查用户是否存在
            user = self.oper_user.get_by_id(user_id)
            if not user:
                return "用戶不存在", False
            
            # 检查会话是否有效
            if session_id:
                session = self.oper_session.get_by_session_token(session_id)
                if not session or not self.oper_session.is_session_valid(session):
                    return "會話無效", False
            
            # 检查令牌是否在黑名单中
            jti = token_data.get('jti')
            if jti:
                blacklist_key = f"blacklisted_token:{jti}"
                if redis_client.get(blacklist_key):
                    return "令牌已被撤銷", False
            
            return {
                'valid': True,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'status': user.status
            }, True
            
        except Exception as e:
            logger.error(f"驗證令牌異常: {str(e)}")
            return "驗證令牌失敗", False
    
    def get_user_batch(self, user_ids: List[str]) -> Tuple[Any, bool]:
        """批量获取用户信息"""
        try:
            users = self.oper_user.get_users_by_ids(user_ids)
            
            users_data = []
            for user in users:
                users_data.append({
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'display_name': user.display_name,
                    'avatar_url': user.avatar_url,
                    'status': user.status,
                    'created_at': user.created_at
                })
            
            return {
                'users': users_data,
                'total': len(users_data)
            }, True
            
        except Exception as e:
            logger.error(f"批量獲取用戶信息異常: {str(e)}")
            return "獲取用戶信息失敗", False