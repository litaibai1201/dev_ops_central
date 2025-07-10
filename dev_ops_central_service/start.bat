@echo off
REM DevOps Central Service 启动脚本 (Windows)

echo === DevOps Central Service 启动脚本 ===

REM 检查Python环境
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python 未安装或未添加到PATH
    pause
    exit /b 1
)

REM 检查虚拟环境
if not exist "venv" (
    echo 📦 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
echo 🔄 激活虚拟环境...
call venv\Scripts\activate

REM 升级pip
echo ⬆️  升级pip...
python -m pip install --upgrade pip

REM 安装依赖
echo 📦 安装依赖包...
pip install -r requirements.txt

REM 检查.env文件
if not exist ".env" (
    echo ⚠️  .env文件不存在，从.env.example复制...
    copy .env.example .env
    echo 请编辑.env文件配置数据库连接信息后重新运行此脚本
    echo 示例配置:
    echo DATABASE_URL=mysql+pymysql://root:password@localhost:3306/dev_ops_central
    pause
    exit /b 1
)

REM 检查MySQL连接配置
findstr /C:"username:password" .env >nul
if %ERRORLEVEL% equ 0 (
    echo ⚠️  请先配置.env文件中的MySQL数据库连接信息
    echo 当前配置包含示例用户名密码，请修改为实际的数据库连接信息
    pause
    exit /b 1
)

REM 初始化MySQL数据库
echo 🗄️  初始化MySQL数据库...
python scripts\init_mysql.py

if %ERRORLEVEL% neq 0 (
    echo ❌ MySQL初始化失败
    echo.
    echo 常见解决方案:
    echo 1. 确保MySQL服务已启动
    echo 2. 检查数据库连接信息是否正确
    echo 3. 确保用户有创建数据库的权限
    echo 4. 手动安装MySQL驱动: pip install mysql-connector-python PyMySQL
    pause
    exit /b 1
)

REM 初始化数据库表
echo 📊 初始化数据库表...
python scripts\init_db.py

if %ERRORLEVEL% neq 0 (
    echo ❌ 数据库表初始化失败
    echo 尝试使用Flask-Migrate方式初始化...
    
    REM 尝试Flask-Migrate方式
    set FLASK_APP=app.py
    if not exist "migrations" (
        flask db init
    )
    flask db migrate -m "Initial migration"
    flask db upgrade
    
    if %ERRORLEVEL% neq 0 (
        echo ❌ 数据库迁移也失败了
        pause
        exit /b 1
    )
)

REM 启动应用
echo 🚀 启动应用...
echo 应用将在 http://localhost:5001 启动
echo API文档: http://localhost:5001/docs
echo 健康检查: http://localhost:5001/api/health
echo.
echo 按 Ctrl+C 停止服务
echo.

python app.py

pause
