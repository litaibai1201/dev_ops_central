"""
群组模块初始化
"""

from .views import groups_blp
from .controllers import GroupController
from .models import GroupModel

__all__ = ['groups_blp', 'GroupController', 'GroupModel']
