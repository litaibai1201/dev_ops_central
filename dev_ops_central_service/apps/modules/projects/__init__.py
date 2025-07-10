"""
专案模块初始化
"""

from .views import projects_blp
from .controllers import ProjectController
from .models import ProjectModel

__all__ = ['projects_blp', 'ProjectController', 'ProjectModel']
