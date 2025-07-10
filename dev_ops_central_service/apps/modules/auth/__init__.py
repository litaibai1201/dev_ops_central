"""
认证模块初始化
"""

from .views import auth_blp
from .controllers import AuthController
from .models import AuthModel

__all__ = ['auth_blp', 'AuthController', 'AuthModel']
