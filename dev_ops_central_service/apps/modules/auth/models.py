"""
认证模块 - 数据模型
"""

from apps.models import User

class AuthModel:
    """认证相关数据操作"""
    
    @staticmethod
    def find_user_by_username_or_email(username):
        """通过用户名或邮箱查找用户"""
        return User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
    
    @staticmethod
    def find_user_by_username(username):
        """通过用户名查找用户"""
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def find_user_by_email(email):
        """通过邮箱查找用户"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_user_by_id(user_id):
        """通过ID查找用户"""
        return User.query.get(user_id)
    
    @staticmethod
    def create_user(username, email, password, role='user'):
        """创建新用户"""
        user = User(username=username, email=email, role=role)
        user.set_password(password)
        return user
    
    @staticmethod
    def update_user_password(user, new_password):
        """更新用户密码"""
        user.set_password(new_password)
        return user
