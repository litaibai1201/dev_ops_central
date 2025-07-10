#!/bin/bash

# 一键修复脚本 - 解决所有常见问题

echo "=== DevOps Central Service 一键修复 ==="

# 设置错误时退出
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Python环境
check_python() {
    print_status "检查Python环境..."
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 未安装"
        exit 1
    fi
    
    python_version=$(python3 --version | cut -d' ' -f2)
    print_success "Python版本: $python_version"
}

# 设置虚拟环境
setup_venv() {
    print_status "设置虚拟环境..."
    
    if [ ! -d "venv" ]; then
        print_status "创建虚拟环境..."
        python3 -m venv venv
    fi
    
    print_status "激活虚拟环境..."
    source venv/bin/activate
    
    print_status "升级pip..."
    pip install --upgrade pip --quiet
    
    print_success "虚拟环境准备完成"
}

# 安装依赖
install_dependencies() {
    print_status "安装项目依赖..."
    
    # 先安装基础依赖
    pip install --quiet mysql-connector-python==8.2.0 PyMySQL==1.1.0 cryptography==41.0.7
    
    # 再安装所有依赖
    pip install -r requirements.txt --quiet
    
    print_success "依赖安装完成"
}

# 配置环境文件
setup_env() {
    print_status "配置环境文件..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning ".env文件已从.env.example创建"
            print_warning "请编辑.env文件配置您的MySQL连接信息"
            print_warning "示例: DATABASE_URL=mysql+pymysql://root:password@localhost:3306/dev_ops_central"
            
            read -p "是否现在配置.env文件? (y/n): " configure_now
            if [ "$configure_now" = "y" ] || [ "$configure_now" = "Y" ]; then
                echo "请输入MySQL连接信息:"
                read -p "主机 (默认: localhost): " db_host
                db_host=${db_host:-localhost}
                
                read -p "端口 (默认: 3306): " db_port
                db_port=${db_port:-3306}
                
                read -p "用户名 (默认: root): " db_user
                db_user=${db_user:-root}
                
                read -s -p "密码: " db_password
                echo ""
                
                read -p "数据库名 (默认: dev_ops_central): " db_name
                db_name=${db_name:-dev_ops_central}
                
                # 更新.env文件
                sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=mysql+pymysql://$db_user:$db_password@$db_host:$db_port/$db_name|" .env
                print_success "数据库配置已更新"
            else
                print_error "请手动编辑.env文件后重新运行此脚本"
                exit 1
            fi
        else
            print_error ".env.example文件不存在"
            exit 1
        fi
    fi
    
    # 检查是否还是示例配置
    if grep -q "username:password" .env; then
        print_error ".env文件仍包含示例配置，请修改为实际的数据库连接信息"
        exit 1
    fi
    
    print_success "环境配置完成"
}

# 检查MySQL服务
check_mysql_service() {
    print_status "检查MySQL服务..."
    
    # 尝试连接MySQL
    if command -v mysql &> /dev/null; then
        # 从.env文件读取配置
        eval $(grep "^DATABASE_URL=" .env)
        
        # 解析连接字符串
        db_info=$(echo $DATABASE_URL | sed 's|mysql+pymysql://||' | sed 's|/.*||')
        if [[ $db_info == *"@"* ]]; then
            auth_part=$(echo $db_info | cut -d'@' -f1)
            host_part=$(echo $db_info | cut -d'@' -f2)
            
            if [[ $auth_part == *":"* ]]; then
                db_user=$(echo $auth_part | cut -d':' -f1)
                db_password=$(echo $auth_part | cut -d':' -f2)
            else
                db_user=$auth_part
                db_password=""
            fi
            
            if [[ $host_part == *":"* ]]; then
                db_host=$(echo $host_part | cut -d':' -f1)
            else
                db_host=$host_part
            fi
            
            # 测试连接
            if mysql -h "$db_host" -u "$db_user" -p"$db_password" -e "SELECT 1;" &> /dev/null; then
                print_success "MySQL连接测试成功"
            else
                print_warning "MySQL连接失败，尝试启动MySQL服务..."
                
                # 尝试启动MySQL服务
                if command -v systemctl &> /dev/null; then
                    sudo systemctl start mysql 2>/dev/null || true
                elif command -v brew &> /dev/null; then
                    brew services start mysql 2>/dev/null || true
                fi
                
                sleep 2
                
                # 再次测试
                if mysql -h "$db_host" -u "$db_user" -p"$db_password" -e "SELECT 1;" &> /dev/null; then
                    print_success "MySQL服务启动成功"
                else
                    print_error "MySQL服务无法连接，请检查:"
                    echo "1. MySQL是否已安装并启动"
                    echo "2. 用户名和密码是否正确"
                    echo "3. 主机和端口是否正确"
                    exit 1
                fi
            fi
        fi
    else
        print_warning "MySQL客户端未安装，跳过连接测试"
    fi
}

# 修复数据库问题
fix_database_issues() {
    print_status "修复数据库问题..."
    
    if python scripts/fix_db_init.py; then
        print_success "数据库问题修复完成"
    else
        print_warning "数据库修复脚本失败，将尝试其他方法"
    fi
}

# 初始化数据库
init_database() {
    print_status "初始化MySQL数据库..."
    
    if python scripts/init_mysql.py; then
        print_success "MySQL数据库初始化完成"
    else
        print_error "MySQL数据库初始化失败"
        exit 1
    fi
    
    print_status "初始化数据库表..."
    
    # 尝试多种初始化方法
    if python scripts/simple_init.py; then
        print_success "数据库表初始化完成"
    elif python scripts/init_db.py; then
        print_success "数据库表初始化完成 (使用init_db.py)"
    else
        print_status "检测到数据库初始化问题，开始修复..."
        fix_database_issues
        
        # 修复后再次尝试
        if python scripts/init_db.py; then
            print_success "数据库表初始化完成 (修复后)"
        else
            print_status "尝试使用Flask-Migrate..."
            export FLASK_APP=app.py
            
            if [ ! -d "migrations" ]; then
                flask db init
            fi
            
            flask db migrate -m "Initial migration" 2>/dev/null || true
            flask db upgrade
            
            if [ $? -eq 0 ]; then
                print_success "数据库表初始化完成 (使用Flask-Migrate)"
            else
                print_error "所有数据库初始化方法都失败了"
                exit 1
            fi
        fi
    fi
}

# 测试应用
test_app() {
    print_status "测试应用..."
    
    # 测试应用导入
    if python -c "from app import create_app; app = create_app(); print('应用创建成功')" 2>/dev/null; then
        print_success "应用测试成功"
    else
        print_error "应用测试失败"
        exit 1
    fi
}

# 主函数
main() {
    echo "开始一键修复流程..."
    echo ""
    
    check_python
    setup_venv
    install_dependencies
    setup_env
    check_mysql_service
    init_database
    test_app
    
    echo ""
    print_success "🎉 一键修复完成！"
    echo ""
    echo "现在可以启动应用:"
    echo "  python app.py"
    echo ""
    echo "或者使用:"
    echo "  ./start.sh"
    echo ""
    echo "应用地址:"
    echo "  - 主服务: http://localhost:5001"
    echo "  - API文档: http://localhost:5001/docs"
    echo "  - 健康检查: http://localhost:5001/api/health"
    echo ""
    echo "测试账号:"
    echo "  - 管理员: admin / admin123"
    echo "  - 群主: groupowner / owner123"
    echo "  - 专案管理员: projectadmin / admin123"
    echo "  - 普通用户: user / user123"
    
    read -p "是否现在启动应用? (y/n): " start_now
    if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
        echo ""
        print_status "启动应用..."
        python app.py
    fi
}

# 错误处理
trap 'print_error "脚本执行失败，请检查错误信息"; exit 1' ERR

# 运行主函数
main
