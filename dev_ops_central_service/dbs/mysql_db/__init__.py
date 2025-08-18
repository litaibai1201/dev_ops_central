# -*- coding: utf-8 -*-
"""
@文件: __init__.py
@说明: MySQL数据库模块初始化
@时间: 2025-08-18
@作者: LiDong
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# 创建数据库实例
db = SQLAlchemy()
migrate = Migrate()

# 数据库函数类
class DBFunction:
    """数据库操作函数"""
    
    @staticmethod
    def commit():
        """提交事务"""
        try:
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
    
    @staticmethod
    def rollback():
        """回滚事务"""
        db.session.rollback()
    
    @staticmethod
    def close():
        """关闭会话"""
        db.session.close()

__all__ = ['db', 'migrate', 'DBFunction']