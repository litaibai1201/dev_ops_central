"""
入组申请模块初始化
"""

from .views import join_requests_blp
from .controllers import JoinRequestController
from .models import JoinRequestModel

__all__ = ['join_requests_blp', 'JoinRequestController', 'JoinRequestModel']
