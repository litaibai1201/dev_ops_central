# -*- coding: utf-8 -*-
"""
@文件: redis_oper.py
@说明: Redis操作模块
@时间: 2025-08-18
@作者: LiDong
"""

import redis
from typing import Optional, Any
from flask import Flask

from loggers import logger


class RedisClient:
    """Redis客户端封装"""
    
    def __init__(self, app: Optional[Flask] = None):
        self.redis_client: Optional[redis.Redis] = None
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app: Flask) -> None:
        """初始化Redis连接"""
        try:
            redis_url = app.config.get('REDIS_URL')
            if redis_url:
                self.redis_client = redis.from_url(redis_url)
                # 测试连接
                self.redis_client.ping()
                logger.info("Redis连接成功")
            else:
                logger.warning("未配置Redis连接")
        except Exception as e:
            logger.error(f"Redis连接失败: {e}")
            self.redis_client = None
    
    def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """设置缓存"""
        try:
            if self.redis_client:
                result = self.redis_client.set(key, value)
                if expire:
                    self.redis_client.expire(key, expire)
                return result
            return False
        except Exception as e:
            logger.error(f"Redis设置失败: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存"""
        try:
            if self.redis_client:
                return self.redis_client.get(key)
            return None
        except Exception as e:
            logger.error(f"Redis获取失败: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """删除缓存"""
        try:
            if self.redis_client:
                return bool(self.redis_client.delete(key))
            return False
        except Exception as e:
            logger.error(f"Redis删除失败: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """检查key是否存在"""
        try:
            if self.redis_client:
                return bool(self.redis_client.exists(key))
            return False
        except Exception as e:
            logger.error(f"Redis检查失败: {e}")
            return False


# 全局Redis客户端实例
redis_client = RedisClient()