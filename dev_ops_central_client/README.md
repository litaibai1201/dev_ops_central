# API管理调试平台

一个功能完整的接口管理与调试平台，支持团队协作和权限管理。

## 功能特色

### 🔐 完善的权限管理体系
- **普通用户**: 可查看公开专案接口信息并进行测试，但无法编辑
- **专案管理员**: 可编辑管理的专案信息和接口，可能具有审批群组申请的权限
- **群主**: 拥有群组的完整管理权限，可创建专案、分配权限
- **系统管理员**: 拥有系统最高管理权限，可管理所有用户和群组

### 📁 专案管理
- 专案基本信息对外公开（名称、描述、创建时间、接口数量、所属组等）
- 接口详情仅群组成员可见
- 支持专案版本管理和状态控制
- 完整的标签分类系统

### 🔌 接口管理
- 支持 RESTful API 的完整生命周期管理
- 直观的接口文档编辑器
- 实时接口测试功能
- 接口分组和目录结构管理
- 多环境配置支持

### 👥 团队协作
- 群组管理和成员权限分配
- 入组申请审批流程
- 实时通知系统
- 协作历史记录

### 🧪 测试功能
- 接口实时测试
- 测试用例管理
- 批量测试执行
- 测试结果统计

## 技术栈

- **前端框架**: React 19 + TypeScript
- **UI组件库**: Ant Design 5
- **路由管理**: React Router 6
- **状态管理**: React Hooks
- **HTTP客户端**: Axios
- **样式方案**: Tailwind CSS + Ant Design
- **构建工具**: Vite
- **代码规范**: ESLint + TypeScript

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 测试账号

平台提供了以下测试账号，用于体验不同角色的功能：

- **系统管理员**: 用户名 `admin`，密码任意
- **群主**: 用户名 `groupowner`，密码任意  
- **专案管理员**: 用户名 `projectadmin`，密码任意
- **普通用户**: 用户名 `user`，密码任意

## 项目结构

```
src/
├── components/          # 公共组件
│   └── layout/         # 布局组件
├── pages/              # 页面组件
│   ├── auth/          # 认证相关页面
│   ├── dashboard/     # 仪表板
│   ├── projects/      # 专案管理
│   └── groups/        # 群组管理
├── services/          # API服务
├── types/             # TypeScript类型定义
└── App.tsx           # 应用主组件
```

## 功能模块详解

### 1. 用户认证
- 登录/注册功能
- JWT Token管理
- 权限验证
- 自动登录

### 2. 专案总览
- 专案统计信息
- 权限说明
- 快速操作入口
- 搜索和筛选

### 3. 接口管理
- 接口CRUD操作
- 接口文档编写
- 目录结构管理
- 接口测试

### 4. 群组管理
- 群组创建和管理
- 成员权限配置
- 入组申请处理
- 群组统计

### 5. 权限控制
- 基于角色的权限管理
- 页面级权限控制
- 操作级权限验证
- 数据访问控制

## 开发指南

### 添加新页面
1. 在 `src/pages/` 下创建页面组件
2. 在 `src/App.tsx` 中添加路由配置
3. 根据需要添加权限控制

### 添加新的API服务
1. 在 `src/services/` 下创建服务文件
2. 使用统一的 `apiClient` 进行HTTP请求
3. 添加对应的TypeScript类型定义

### 权限控制
- 在组件中通过 `user.role` 判断用户角色
- 使用条件渲染控制UI元素显示
- 在API调用前进行权限验证

## 部署说明

### 环境变量配置
创建 `.env.production` 文件：
```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### 构建和部署
```bash
# 构建
npm run build

# 部署到服务器
# 将 dist/ 目录下的文件部署到Web服务器
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系我们

如有问题或建议，请联系：
- 项目Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 邮箱: your-email@example.com

---

**注意**: 这是一个演示项目，当前使用模拟数据。在生产环境中使用时，需要连接真实的后端API服务。