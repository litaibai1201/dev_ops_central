#!/bin/bash

# DevOps Central Service 启动脚本 (Linux/Mac)

echo "=== DevOps Central Service 启动脚本 ==="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装"
    exit 1
fi

# 检查pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 未安装"
    exit 1
fi

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔄 激活虚拟环境..."
source venv/bin/activate

# 升级pip
echo "⬆️  升级pip..."
pip install --upgrade pip

# 安装依赖
echo "📦 安装依赖包..."
pip install -r requirements.txt

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "⚠️  .env文件不存在，从.env.example复制..."
    cp .env.example .env
    echo "请编辑.env文件配置数据库连接信息后重新运行此脚本"
    echo ""
    echo "需要修改的配置:"
    echo "DATABASE_URL=mysql+pymysql://your_username:your_password@localhost:3306/dev_ops_central"
    echo ""
    echo "示例:"
    echo "DATABASE_URL=mysql+pymysql://root:mypassword@localhost:3306/dev_ops_central"
    exit 1
fi

# 检查MySQL连接配置
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2)
if [[ $DATABASE_URL == *"username:password"* ]]; then
    echo "⚠️  请先配置.env文件中的MySQL数据库连接信息"
    echo "当前配置包含示例用户名密码，请修改为实际的数据库连接信息"
    echo ""
    echo "编辑 .env 文件，修改以下行:"
    echo "DATABASE_URL=mysql+pymysql://your_username:your_password@localhost:3306/dev_ops_central"
    exit 1
fi

# 初始化MySQL数据库
echo "🗄️  初始化MySQL数据库..."
python scripts/init_mysql.py

if [ $? -ne 0 ]; then
    echo "❌ MySQL初始化失败"
    echo ""
    echo "常见解决方案:"
    echo "1. 确保MySQL服务已启动:"
    echo "   sudo systemctl start mysql  # Linux"
    echo "   brew services start mysql   # macOS"
    echo ""
    echo "2. 检查数据库连接信息是否正确"
    echo "3. 确保用户有创建数据库的权限"
    echo "4. 运行快速修复: python scripts/quick_fix.py"
    exit 1
fi

# 初始化数据库表
echo "📊 初始化数据库表..."
python scripts/simple_init.py

if [ $? -ne 0 ]; then
    echo "❌ 数据库表初始化失败，尝试其他方法..."
    
    # 尝试使用init_db.py
    echo "尝试使用 init_db.py..."
    python scripts/init_db.py
    
    if [ $? -ne 0 ]; then
        echo "尝试使用Flask-Migrate方式初始化..."
        
        # 尝试Flask-Migrate方式
        export FLASK_APP=app.py
        if [ ! -d "migrations" ]; then
            flask db init
        fi
        flask db migrate -m "Initial migration"
        flask db upgrade
        
        if [ $? -ne 0 ]; then
            echo "❌ 所有数据库初始化方法都失败了"
            echo ""
            echo "请尝试:"
            echo "1. 运行快速修复: python scripts/quick_fix.py"
            echo "2. 检查MySQL服务状态"
            echo "3. 验证数据库连接配置"
            exit 1
        fi
    fi
fi

echo "✅ 数据库初始化完成"

# 启动应用
echo ""
echo "🚀 启动应用..."
echo "应用将在以下地址启动:"
echo "  - 主服务: http://localhost:5001"
echo "  - API文档: http://localhost:5001/docs"
echo "  - 健康检查: http://localhost:5001/api/health"
echo ""
echo "测试账号:"
echo "  - 管理员: admin / admin123"
echo "  - 群主: groupowner / owner123" 
echo "  - 专案管理员: projectadmin / admin123"
echo "  - 普通用户: user / user123"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

python app.py
