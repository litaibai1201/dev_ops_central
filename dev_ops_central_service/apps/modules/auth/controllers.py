"""
认证模块 - 业务逻辑控制器
"""

from flask_jwt_extended import create_access_token

from apps import db
from apps.utils import (
    validate_email, validate_password_strength, success_response, 
    error_response, conflict_response, unauthorized_response,
    log_user_activity
)
from .models import AuthModel

class AuthController:
    """认证相关业务逻辑"""
    
    @staticmethod
    def login(username, password, remember=False):
        """用户登录"""
        # 查找用户
        user = AuthModel.find_user_by_username_or_email(username)
        
        if not user or not user.check_password(password):
            return unauthorized_response('用户名或密码错误')
        
        # 创建访问令牌
        access_token = create_access_token(
            identity=user.id,
            expires_delta=None if remember else None
        )
        
        # 记录活动
        log_user_activity(user.id, 'login', 'user', user.id)
        
        from apps.schemas.models_schema import UserSchema
        user_schema = UserSchema()
        user_data = user_schema.dump(user)
        
        return success_response({
            'user': user_data,
            'token': access_token
        }, '登录成功')
    
    @staticmethod
    def register(username, email, password, confirm_password):
        """用户注册"""
        # 验证密码确认
        if password != confirm_password:
            return error_response('密码确认不匹配')
        
        # 验证邮箱格式
        if not validate_email(email):
            return error_response('邮箱格式无效')
        
        # 验证密码强度
        is_strong, message = validate_password_strength(password)
        if not is_strong:
            return error_response(message)
        
        # 检查用户名是否已存在
        if AuthModel.find_user_by_username(username):
            return conflict_response('用户名已存在')
        
        # 检查邮箱是否已存在
        if AuthModel.find_user_by_email(email):
            return conflict_response('邮箱已被注册')
        
        # 创建新用户
        try:
            user = AuthModel.create_user(username, email, password)
            db.session.add(user)
            db.session.commit()
            
            # 创建访问令牌
            access_token = create_access_token(identity=user.id)
            
            # 记录活动
            log_user_activity(user.id, 'register', 'user', user.id)
            
            from apps.schemas.models_schema import UserSchema
            user_schema = UserSchema()
            user_data = user_schema.dump(user)
            
            return success_response({
                'user': user_data,
                'token': access_token
            }, '注册成功', 201)
            
        except Exception as e:
            db.session.rollback()
            return error_response('注册失败，请重试', 500)
    
    @staticmethod
    def get_current_user(user_id):
        """获取当前用户信息"""
        user = AuthModel.find_user_by_id(user_id)
        
        if not user:
            return error_response('用户不存在', 404)
        
        from apps.schemas.models_schema import UserSchema
        user_schema = UserSchema()
        user_data = user_schema.dump(user)
        
        return success_response(user_data, '获取成功')
    
    @staticmethod
    def refresh_token(user_id):
        """刷新访问令牌"""
        user = AuthModel.find_user_by_id(user_id)
        
        if not user:
            return error_response('用户不存在', 404)
        
        # 创建新的访问令牌
        access_token = create_access_token(identity=user.id)
        
        return success_response({
            'token': access_token
        }, '令牌刷新成功')
    
    @staticmethod
    def logout(user_id):
        """用户登出"""
        # 记录活动
        log_user_activity(user_id, 'logout', 'user', user_id)
        
        # JWT是无状态的，这里只是返回成功响应
        return success_response(None, '登出成功')
    
    @staticmethod
    def change_password(user_id, current_password, new_password):
        """修改密码"""
        user = AuthModel.find_user_by_id(user_id)
        
        if not user:
            return error_response('用户不存在', 404)
        
        # 验证当前密码
        if not user.check_password(current_password):
            return error_response('当前密码错误')
        
        # 验证新密码强度
        is_strong, message = validate_password_strength(new_password)
        if not is_strong:
            return error_response(message)
        
        # 更新密码
        try:
            AuthModel.update_user_password(user, new_password)
            db.session.commit()
            
            # 记录活动
            log_user_activity(user_id, 'change_password', 'user', user_id)
            
            return success_response(None, '密码修改成功')
        except Exception as e:
            db.session.rollback()
            return error_response('密码修改失败，请重试', 500)
    
    @staticmethod
    def forgot_password(email):
        """忘记密码"""
        user = AuthModel.find_user_by_email(email)
        
        # 为了安全，即使用户不存在也返回成功
        if not user:
            return success_response(None, '如果该邮箱已注册，您将收到重置密码的邮件')
        
        # TODO: 实现发送重置密码邮件的逻辑
        # 这里可以生成重置令牌并发送邮件
        
        return success_response(None, '重置密码邮件已发送')
    
    @staticmethod
    def reset_password(token, new_password):
        """重置密码"""
        # TODO: 验证重置令牌的有效性
        # 这里需要实现令牌验证逻辑
        
        # 验证密码强度
        is_strong, message = validate_password_strength(new_password)
        if not is_strong:
            return error_response(message)
        
        # TODO: 根据令牌找到用户并重置密码
        
        return success_response(None, '密码重置成功')
