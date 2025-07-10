# DevOps Central API Service

一个基于Flask的API文档管理和测试平台，采用MVC架构设计，支持团队协作的API开发工作流。

## ✨ 主要特性

- 🏗️ **MVC架构**: 清晰的代码结构，易于维护和扩展
- 🗄️ **MySQL数据库**: 高性能关系型数据库，支持复杂查询
- 👥 **团队协作**: 群组管理、权限控制、成员审批
- 📝 **API文档**: 完整的API接口文档管理
- 🧪 **接口测试**: 内置API测试功能，支持批量测试
- 🔒 **权限管理**: 细粒度的用户权限控制
- 📊 **数据统计**: 项目、API、用户等多维度统计
- 🐳 **Docker支持**: 容器化部署，开箱即用

## 🏛️ 技术架构

### 后端技术栈
- **Framework**: Flask 2.3.3
- **Database**: MySQL 8.0 + SQLAlchemy
- **Authentication**: JWT (Flask-JWT-Extended)
- **API Documentation**: Flask-Smorest + OpenAPI 3.0
- **Database Migration**: Flask-Migrate
- **Validation**: Marshmallow
- **CORS**: Flask-CORS

### 项目结构 (MVC架构)
```
app/
├── modules/          # 功能模块 (MVC架构)
│   ├── auth/         # 认证模块
│   ├── users/        # 用户管理
│   ├── groups/       # 群组管理
│   ├── projects/     # 专案管理
│   ├── apis/         # API接口管理
│   └── join_requests/# 入组申请管理
├── utils/           # 公共工具模块
├── models/          # 数据模型
├── schemas/         # 数据序列化
└── __init__.py      # 应用工厂
```

## 🚀 快速开始

### 1. 环境要求

- Python 3.9+
- MySQL 8.0+
- Git

### 2. 安装和配置

#### 方式1: 自动安装（推荐）

**Linux/macOS:**
```bash
# 克隆项目
git clone <repository-url>
cd dev_ops_central_service

# 运行启动脚本
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
# 克隆项目
git clone <repository-url>
cd dev_ops_central_service

# 运行启动脚本
start.bat
```

#### 方式2: Docker Compose

```bash
# 启动所有服务（包括MySQL）
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

#### 方式3: 手动安装

1. **创建虚拟环境**
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接
```

4. **初始化数据库**
```bash
# 创建数据库
python scripts/init_mysql.py

# 初始化表结构
python scripts/init_db.py
```

5. **启动应用**
```bash
python app.py
```

### 3. 访问应用

- **API服务**: http://localhost:5000
- **API文档**: http://localhost:5000/docs
- **健康检查**: http://localhost:5000/api/health

## 🔧 配置说明

### 环境变量

关键配置项（`.env` 文件）：

```bash
# MySQL数据库配置
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/dev_ops_central

# JWT配置
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES=86400

# 应用配置
FLASK_ENV=development
FLASK_DEBUG=True

# CORS配置
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 数据库配置

详细的MySQL配置和迁移指南请参考：[MYSQL_MIGRATION_GUIDE.md](./MYSQL_MIGRATION_GUIDE.md)

## 👥 测试账号

系统启动后会自动创建测试数据：

| 角色 | 用户名 | 密码 | 描述 |
|------|--------|------|------|
| 系统管理员 | admin | admin123 | 系统管理员权限 |
| 群组负责人 | groupowner | owner123 | 群组创建者 |
| 专案管理员 | projectadmin | admin123 | 专案管理权限 |
| 普通用户 | user | user123 | 基础用户权限 |

## 📖 API文档

### 主要API端点

#### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

#### 用户管理
- `GET /api/users` - 获取用户列表
- `GET /api/users/{id}` - 获取用户详情
- `PUT /api/users/{id}` - 更新用户信息
- `DELETE /api/users/{id}` - 删除用户

#### 群组管理
- `GET /api/groups` - 获取群组列表
- `POST /api/groups` - 创建群组
- `GET /api/groups/{id}` - 获取群组详情
- `PUT /api/groups/{id}` - 更新群组信息
- `DELETE /api/groups/{id}` - 删除群组

#### 专案管理
- `GET /api/projects` - 获取专案列表
- `POST /api/projects` - 创建专案
- `GET /api/projects/{id}` - 获取专案详情
- `PUT /api/projects/{id}` - 更新专案信息
- `DELETE /api/projects/{id}` - 删除专案

#### API接口管理
- `GET /api/projects/{id}/apis` - 获取专案API列表
- `POST /api/projects/{id}/apis` - 创建API接口
- `GET /api/projects/{project_id}/apis/{api_id}` - 获取API详情
- `PUT /api/projects/{project_id}/apis/{api_id}` - 更新API接口
- `DELETE /api/projects/{project_id}/apis/{api_id}` - 删除API接口

完整的API文档请访问：http://localhost:5000/docs

## 🧪 测试

### 运行测试

```bash
# 单元测试
python -m pytest tests/

# 测试覆盖率
python -m pytest --cov=app tests/

# 特定模块测试
python -m pytest tests/test_auth.py
```

### API测试

使用内置的API测试功能：

1. 在Web界面中创建测试用例
2. 配置测试环境和参数
3. 执行单个或批量测试
4. 查看测试结果和报告

## 📊 监控和日志

### 应用监控

- **健康检查**: `/api/health`
- **应用指标**: 用户数、群组数、专案数、API数
- **性能监控**: 响应时间、错误率

### 日志配置

```python
# 在生产环境中启用日志
import logging
logging.basicConfig(level=logging.INFO)
```

## 🚢 部署

### Docker部署

```bash
# 构建镜像
docker build -t devops-central-api .

# 运行容器
docker run -d \
  --name devops-central \
  -p 5000:5000 \
  -e DATABASE_URL=mysql+pymysql://user:pass@host:3306/db \
  devops-central-api
```

### 生产环境部署

1. **环境准备**
   - MySQL数据库服务器
   - Redis缓存服务器（可选）
   - Nginx反向代理

2. **应用配置**
   ```bash
   export FLASK_ENV=production
   export DATABASE_URL=mysql+pymysql://prod_user:password@db_host:3306/prod_db
   ```

3. **启动服务**
   ```bash
   gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
   ```

## 🔨 开发指南

### 添加新功能模块

1. 在 `app/modules/` 下创建新模块目录
2. 创建 MVC 文件：
   - `models.py` - 数据操作
   - `controllers.py` - 业务逻辑
   - `views.py` - API端点
   - `__init__.py` - 模块导出

3. 在 `app/__init__.py` 中注册蓝图

### 代码规范

- 遵循 PEP 8 代码风格
- 使用类型提示
- 编写文档字符串
- 单元测试覆盖率 > 80%

### 数据库迁移

```bash
# 创建迁移文件
flask db migrate -m "Add new feature"

# 应用迁移
flask db upgrade

# 回滚迁移
flask db downgrade
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 支持

如遇到问题，请：

1. 查看 [故障排除指南](./MYSQL_MIGRATION_GUIDE.md#故障排除)
2. 检查 [Issues](../../issues) 中是否有类似问题
3. 创建新的 Issue 并提供详细信息

## 📝 更新日志

### v2.0.0 (Latest)
- ✅ 重构为MVC架构
- ✅ 迁移至MySQL数据库
- ✅ 优化性能和索引
- ✅ 完善API文档
- ✅ 添加Docker支持

### v1.0.0
- ✅ 基础功能实现
- ✅ SQLite数据库
- ✅ 用户认证和权限
- ✅ API接口管理

---

**Built with ❤️ by DevOps Team**
