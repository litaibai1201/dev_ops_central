-- MySQL初始化脚本
-- 创建必要的数据库和用户

-- 创建测试数据库
CREATE DATABASE IF NOT EXISTS `dev_ops_central_test` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 确保用户有足够的权限
GRANT ALL PRIVILEGES ON `dev_ops_central`.* TO 'devops_user'@'%';
GRANT ALL PRIVILEGES ON `dev_ops_central_test`.* TO 'devops_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 显示创建的数据库
SHOW DATABASES;
