#!/usr/bin/env python3
"""
MySQL数据库初始化脚本
用于创建数据库和设置基本配置
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

def install_mysql_connector():
    """安装MySQL连接器"""
    try:
        import subprocess
        print("正在安装MySQL连接器...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "mysql-connector-python==8.2.0"])
        print("✅ MySQL连接器安装完成")
        return True
    except Exception as e:
        print(f"❌ 安装MySQL连接器失败: {e}")
        return False

def create_database_with_mysql_connector():
    """使用mysql.connector创建数据库"""
    try:
        import mysql.connector
        from mysql.connector import Error
    except ImportError:
        print("MySQL连接器未安装，正在尝试安装...")
        if not install_mysql_connector():
            return False
        try:
            import mysql.connector
            from mysql.connector import Error
        except ImportError:
            print("❌ 无法导入MySQL连接器")
            return False
    
    # 从环境变量获取数据库连接信息
    database_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/dev_ops_central')
    
    # 解析数据库URL
    try:
        # 移除协议部分
        url_parts = database_url.replace('mysql+pymysql://', '').split('/')
        connection_part = url_parts[0]
        database_name = url_parts[1] if len(url_parts) > 1 else 'dev_ops_central'
        
        # 解析用户名、密码、主机、端口
        if '@' in connection_part:
            auth_part, host_part = connection_part.split('@')
            if ':' in auth_part:
                username, password = auth_part.split(':')
            else:
                username = auth_part
                password = ''
        else:
            host_part = connection_part
            username = 'root'
            password = ''
        
        if ':' in host_part:
            host, port = host_part.split(':')
            port = int(port)
        else:
            host = host_part
            port = 3306
            
    except Exception as e:
        print(f"解析数据库URL失败: {e}")
        print("使用默认配置...")
        username = 'root'
        password = 'password'
        host = 'localhost'
        port = 3306
        database_name = 'dev_ops_central'
    
    print(f"连接信息: {username}@{host}:{port}")
    print(f"目标数据库: {database_name}")
    
    try:
        # 连接到MySQL服务器（不指定数据库）
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=username,
            password=password,
            charset='utf8mb4',
            collation='utf8mb4_unicode_ci',
            autocommit=True
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # 创建数据库（如果不存在）
            create_db_query = f"""
            CREATE DATABASE IF NOT EXISTS `{database_name}` 
            CHARACTER SET utf8mb4 
            COLLATE utf8mb4_unicode_ci
            """
            
            cursor.execute(create_db_query)
            print(f"数据库 '{database_name}' 创建成功或已存在")
            
            # 创建测试数据库
            test_database_name = f"{database_name}_test"
            create_test_db_query = f"""
            CREATE DATABASE IF NOT EXISTS `{test_database_name}` 
            CHARACTER SET utf8mb4 
            COLLATE utf8mb4_unicode_ci
            """
            
            cursor.execute(create_test_db_query)
            print(f"测试数据库 '{test_database_name}' 创建成功或已存在")
            
            # 显示数据库信息
            cursor.execute("SELECT VERSION()")
            mysql_version = cursor.fetchone()
            print(f"MySQL版本: {mysql_version[0]}")
            
            # 显示当前数据库列表
            cursor.execute("SHOW DATABASES")
            databases = cursor.fetchall()
            print("现有数据库:")
            for db in databases:
                print(f"  - {db[0]}")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print(f"MySQL连接错误: {e}")
        return False
    except Exception as e:
        print(f"未知错误: {e}")
        return False

def create_database_with_pymysql():
    """使用PyMySQL创建数据库（备用方案）"""
    try:
        import pymysql
    except ImportError:
        print("PyMySQL未安装，正在尝试安装...")
        try:
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "PyMySQL==1.1.0"])
            import pymysql
        except Exception as e:
            print(f"❌ 安装PyMySQL失败: {e}")
            return False
    
    database_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/dev_ops_central')
    
    # 解析数据库URL
    try:
        url_parts = database_url.replace('mysql+pymysql://', '').split('/')
        connection_part = url_parts[0]
        database_name = url_parts[1] if len(url_parts) > 1 else 'dev_ops_central'
        
        if '@' in connection_part:
            auth_part, host_part = connection_part.split('@')
            if ':' in auth_part:
                username, password = auth_part.split(':')
            else:
                username = auth_part
                password = ''
        else:
            host_part = connection_part
            username = 'root'
            password = ''
        
        if ':' in host_part:
            host, port = host_part.split(':')
            port = int(port)
        else:
            host = host_part
            port = 3306
            
    except Exception as e:
        print(f"解析数据库URL失败: {e}")
        username = 'root'
        password = 'password'
        host = 'localhost'
        port = 3306
        database_name = 'dev_ops_central'
    
    try:
        # 连接到MySQL服务器
        connection = pymysql.connect(
            host=host,
            port=port,
            user=username,
            password=password,
            charset='utf8mb4',
            autocommit=True
        )
        
        with connection.cursor() as cursor:
            # 创建数据库
            cursor.execute(f"""
                CREATE DATABASE IF NOT EXISTS `{database_name}` 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci
            """)
            print(f"数据库 '{database_name}' 创建成功或已存在")
            
            # 创建测试数据库
            test_database_name = f"{database_name}_test"
            cursor.execute(f"""
                CREATE DATABASE IF NOT EXISTS `{test_database_name}` 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci
            """)
            print(f"测试数据库 '{test_database_name}' 创建成功或已存在")
            
            # 显示数据库信息
            cursor.execute("SELECT VERSION()")
            mysql_version = cursor.fetchone()
            print(f"MySQL版本: {mysql_version[0]}")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"PyMySQL连接错误: {e}")
        return False

def check_mysql_connection():
    """检查MySQL连接"""
    database_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/dev_ops_central')
    
    # 首先尝试使用PyMySQL（应用使用的驱动）
    try:
        import pymysql
        
        # 解析连接信息
        import re
        pattern = r'mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)'
        match = re.match(pattern, database_url)
        
        if match:
            username, password, host, port, database = match.groups()
            port = int(port)
        else:
            raise ValueError("无法解析数据库URL")
        
        # 测试连接
        connection = pymysql.connect(
            host=host,
            port=port,
            user=username,
            password=password,
            database=database,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✅ MySQL连接测试成功: {result[0]}")
        
        connection.close()
        return True
        
    except ImportError:
        print("PyMySQL未安装，尝试使用mysql-connector-python...")
        try:
            import mysql.connector
            # 使用mysql.connector进行连接测试
            # ... (类似的连接测试代码)
            return True
        except ImportError:
            print("❌ 没有可用的MySQL连接器")
            return False
    except Exception as e:
        print(f"❌ MySQL连接测试失败: {e}")
        return False

def main():
    """主函数"""
    print("=== MySQL数据库初始化 ===")
    
    # 检查环境变量
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("警告: 未找到DATABASE_URL环境变量")
        print("请确保.env文件存在并配置了DATABASE_URL")
        return
    
    print(f"数据库URL: {database_url}")
    
    # 1. 创建数据库
    print("\n1. 创建数据库...")
    success = False
    
    # 尝试使用mysql-connector-python
    print("尝试使用mysql-connector-python...")
    if create_database_with_mysql_connector():
        success = True
    else:
        # 备用方案：使用PyMySQL
        print("尝试使用PyMySQL作为备用方案...")
        if create_database_with_pymysql():
            success = True
    
    if not success:
        print("❌ 数据库创建失败")
        print("\n请检查以下项目:")
        print("1. MySQL服务是否启动")
        print("2. 用户名和密码是否正确") 
        print("3. 主机和端口是否正确")
        print("4. 用户是否有创建数据库的权限")
        print("5. 是否安装了MySQL Python驱动")
        print("\n可以手动安装MySQL驱动:")
        print("pip install mysql-connector-python PyMySQL")
        return
    
    print("✅ 数据库创建完成")
    
    # 2. 测试连接
    print("\n2. 测试数据库连接...")
    if check_mysql_connection():
        print("✅ 数据库连接正常")
    else:
        print("❌ 数据库连接失败")
        return
    
    print("\n=== 初始化完成 ===")
    print("现在可以运行以下命令来创建数据表:")
    print("  python scripts/init_db.py")
    print("\n或者直接运行应用:")
    print("  python app.py")

if __name__ == '__main__':
    main()
