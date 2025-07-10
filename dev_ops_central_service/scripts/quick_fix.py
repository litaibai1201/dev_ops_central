#!/usr/bin/env python3
"""
快速修复脚本 - 安装MySQL依赖并初始化数据库
"""

import subprocess
import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

def install_dependencies():
    """安装必要的依赖"""
    print("🔧 安装MySQL相关依赖...")
    
    dependencies = [
        "mysql-connector-python==8.2.0",
        "PyMySQL==1.1.0", 
        "cryptography==41.0.7"
    ]
    
    for dep in dependencies:
        try:
            print(f"安装 {dep}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            print(f"✅ {dep} 安装成功")
        except subprocess.CalledProcessError as e:
            print(f"❌ {dep} 安装失败: {e}")
            return False
    
    return True

def check_env_file():
    """检查环境变量文件"""
    env_path = os.path.join(project_root, '.env')
    env_example_path = os.path.join(project_root, '.env.example')
    
    if not os.path.exists(env_path):
        print("📝 创建.env文件...")
        if os.path.exists(env_example_path):
            import shutil
            shutil.copy(env_example_path, env_path)
            print("✅ 已从.env.example复制配置文件")
            print("请编辑.env文件配置您的MySQL数据库连接信息")
            return False
        else:
            print("❌ .env.example文件不存在")
            return False
    
    # 检查配置是否为示例配置
    with open(env_path, 'r') as f:
        content = f.read()
        if 'username:password' in content:
            print("⚠️  .env文件包含示例配置，请修改为实际的数据库连接信息")
            return False
    
    return True

def test_mysql_connection():
    """测试MySQL连接"""
    try:
        # 切换到项目目录
        original_cwd = os.getcwd()
        os.chdir(project_root)
        
        # 测试基本的数据库连接
        from apps import create_app, db
        
        app = create_app()
        with app.app_context():
            # 尝试连接数据库
            db.engine.execute("SELECT 1")
            print("✅ 数据库连接测试成功")
            return True
            
    except Exception as e:
        print(f"❌ 数据库连接测试失败: {e}")
        return False
    finally:
        os.chdir(original_cwd)

def run_mysql_init():
    """运行MySQL初始化"""
    try:
        original_cwd = os.getcwd()
        os.chdir(project_root)
        
        # 直接运行MySQL初始化脚本
        result = subprocess.run([
            sys.executable, 
            os.path.join('scripts', 'init_mysql.py')
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ MySQL初始化完成")
            print(result.stdout)
            return True
        else:
            print("❌ MySQL初始化失败")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ 运行MySQL初始化时出错: {e}")
        return False
    finally:
        os.chdir(original_cwd)

def run_db_init():
    """运行数据库表初始化"""
    try:
        original_cwd = os.getcwd()
        os.chdir(project_root)
        
        # 直接运行数据库初始化脚本
        result = subprocess.run([
            sys.executable, 
            os.path.join('scripts', 'init_db.py')
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ 数据库表初始化完成")
            print(result.stdout)
            return True
        else:
            print("❌ 数据库表初始化失败")
            print(result.stderr)
            
            # 尝试Flask-Migrate方式
            print("尝试使用Flask-Migrate...")
            os.environ['FLASK_APP'] = 'app.py'
            
            try:
                if not os.path.exists('migrations'):
                    subprocess.check_call([sys.executable, "-m", "flask", "db", "init"])
                subprocess.check_call([sys.executable, "-m", "flask", "db", "migrate", "-m", "Initial migration"])
                subprocess.check_call([sys.executable, "-m", "flask", "db", "upgrade"])
                print("✅ Flask-Migrate初始化完成")
                return True
            except Exception as migrate_error:
                print(f"❌ Flask-Migrate也失败了: {migrate_error}")
                return False
            
    except Exception as e:
        print(f"❌ 运行数据库初始化时出错: {e}")
        return False
    finally:
        os.chdir(original_cwd)

def main():
    """主函数"""
    print("=== DevOps Central Service 快速修复 ===")
    print(f"项目根目录: {project_root}")
    
    # 切换到项目目录
    original_cwd = os.getcwd()
    os.chdir(project_root)
    
    try:
        # 1. 安装依赖
        if not install_dependencies():
            print("❌ 依赖安装失败")
            return
        
        # 2. 检查环境文件
        if not check_env_file():
            print("📋 请按以下步骤配置:")
            print("1. 编辑 .env 文件")
            print("2. 修改 DATABASE_URL 为您的MySQL连接信息")
            print("   格式: mysql+pymysql://用户名:密码@主机:端口/数据库名")
            print("   示例: mysql+pymysql://root:mypassword@localhost:3306/dev_ops_central")
            print("3. 保存文件后重新运行: python scripts/quick_fix.py")
            return
        
        # 3. 测试MySQL连接
        print("🔍 测试MySQL连接...")
        if not test_mysql_connection():
            # 如果连接失败，尝试初始化MySQL
            print("尝试初始化MySQL数据库...")
            if not run_mysql_init():
                print("❌ MySQL初始化失败")
                print("请检查MySQL服务是否启动，以及连接信息是否正确")
                return
        
        # 4. 初始化数据库表
        print("📊 初始化数据库表...")
        if not run_db_init():
            print("❌ 数据库表初始化失败")
            return
        
        print("\n🎉 初始化完成！")
        print("现在可以启动应用:")
        print("  python app.py")
        print("\n或使用启动脚本:")
        print("  ./start.sh  (Linux/macOS)")
        print("  start.bat   (Windows)")
        
        # 最后测试一下应用是否能正常导入
        try:
            from apps import create_app
            app = create_app()
            print("\n✅ 应用创建测试成功")
        except Exception as e:
            print(f"\n⚠️  应用创建测试失败: {e}")
    
    finally:
        os.chdir(original_cwd)

if __name__ == '__main__':
    main()
