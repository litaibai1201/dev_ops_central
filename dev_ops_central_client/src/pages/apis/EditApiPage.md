# API 编辑页面 (EditApiPage)

## 概述

EditApiPage 是一个专门用于编辑现有 API 接口的页面组件，基于 CreateApiPage 的设计模式，提供完整的 API 编辑功能。

## 功能特性

### 🔧 核心功能
- ✅ 加载现有 API 数据并填充到表单
- ✅ 支持编辑所有 API 属性（名称、方法、URL、描述等）
- ✅ 实时表单验证
- ✅ 参数和响应结构编辑
- ✅ 请求头配置编辑
- ✅ 保存更改并返回详情页

### 📋 编辑内容
- **基本信息**: 接口名称、HTTP方法、URL、描述、标签、状态
- **请求参数**: 支持嵌套结构的参数编辑
- **请求头**: HTTP头部信息配置
- **响应参数**: 返回数据结构定义

### 🎯 用户体验
- **加载状态**: 显示数据加载进度
- **表单预填充**: 自动填充现有API数据
- **实时同步**: 表单数据实时更新
- **操作确认**: 保存/取消操作确认
- **错误处理**: 友好的错误提示

## 页面结构

```
EditApiPage/
├── 页面头部 (ApiPageHeader)
│   ├── 标题: "编辑接口 - {接口名称}"
│   ├── 副标题: "编辑 {项目名称} 中的API接口"
│   ├── 取消按钮: 返回详情页
│   ├── 保存按钮: 保存更改
│   └── 额外信息: 最后更新时间
│
└── 表单内容 (ApiForm)
    ├── 接口基本信息
    ├── 请求参数配置
    ├── 请求头配置
    ├── 响应参数配置
    └── 操作提示
```

## 路由配置

```tsx
// 在 App.tsx 中添加路由
<Route 
  path="/projects/:projectId/apis/:apiId/edit" 
  element={<EditApiPage user={user} />} 
/>
```

## 使用方式

### 1. 从 API 详情页跳转
```tsx
// 在 ApiDetailPage 中的编辑按钮
<Button 
  type="primary" 
  icon={<EditOutlined />}
  onClick={() => navigate(`/projects/${projectId}/apis/${apiId}/edit`)}
>
  编辑接口
</Button>
```

### 2. 直接访问 URL
```
/projects/{projectId}/apis/{apiId}/edit
```

## 数据流程

### 1. 页面初始化
```typescript
// 1. 获取项目和API信息
const fetchData = async () => {
  // 加载项目数据
  const project = await getProject(projectId);
  // 加载API数据
  const api = await getApi(apiId);
  
  // 设置页面上下文
  setProjectName(project.name);
  setApiName(`编辑 ${api.name}`);
  
  // 转换并设置表单数据
  const formData = convertApiToFormData(api);
  form.setFieldsValue(formData);
  setFormData(formData);
};
```

### 2. 表单数据转换
```typescript
// API数据 → 表单数据
const convertApiToFormData = (api: ApiMethod): ApiFormData => {
  return {
    name: api.name,
    method: api.method,
    url: api.url,
    description: api.description,
    tags: api.tags,
    status: api.status,
    requestParams: convertParams(api.params),
    requestHeaders: convertHeaders(api.headers),
    responseParams: convertResponse(api.responses)
  };
};
```

### 3. 保存更改
```typescript
const handleSubmit = async () => {
  // 验证表单
  const values = await form.validateFields();
  
  // 合并数据
  const updatedData = {
    ...values,
    ...formData,
    id: apiId,
    updatedBy: user.id,
    updatedAt: new Date().toISOString()
  };
  
  // 调用更新API
  await updateApi(updatedData);
  
  // 跳转回详情页
  navigate(`/projects/${projectId}/apis/${apiId}`);
};
```

## 与 CreateApiPage 的区别

| 特性 | CreateApiPage | EditApiPage |
|------|---------------|-------------|
| **用途** | 创建新接口 | 编辑现有接口 |
| **数据初始化** | 空表单 | 预填充现有数据 |
| **页面标题** | "新增接口" | "编辑接口 - {名称}" |
| **保存操作** | 创建 API | 更新 API |
| **取消操作** | 返回项目页 | 返回详情页 |
| **URL 路径** | `/create` | `/{apiId}/edit` |

## 组件依赖

```typescript
// 核心组件
import { ApiPageHeader, ApiForm } from '../../components/api';

// 工具和类型
import { User, Project, ApiMethod } from '../../types';
import { usePageContext } from '../../components/common';
```

## 状态管理

```typescript
const [loading, setLoading] = useState(false);           // 保存加载状态
const [initialLoading, setInitialLoading] = useState(true); // 初始化加载
const [project, setProject] = useState<Project | null>(null);
const [api, setApi] = useState<ApiMethod | null>(null);
const [formData, setFormData] = useState<Partial<ApiFormData>>({});
```

## 错误处理

### 1. 数据加载错误
```typescript
try {
  const data = await fetchApiData();
  setApi(data);
} catch (error) {
  console.error('获取API信息失败:', error);
  message.error('获取API信息失败');
}
```

### 2. 表单验证错误
```typescript
try {
  const values = await form.validateFields();
  // 处理有效数据
} catch (error) {
  message.error('请检查表单内容');
}
```

### 3. 保存失败
```typescript
try {
  await updateApi(data);
  message.success('API接口更新成功！');
} catch (error) {
  console.error('更新API失败:', error);
  message.error('更新失败，请重试');
}
```

## 性能优化

### 1. 懒加载
- 页面组件按需加载
- 表单数据延迟初始化

### 2. 缓存策略
- 项目信息缓存
- 表单状态保持

### 3. 组件复用
- 复用 CreateApiPage 的 ApiForm 组件
- 共享验证逻辑和工具函数

## 最佳实践

### 1. 数据一致性
```typescript
// 确保表单数据与API数据同步
useEffect(() => {
  if (api) {
    const convertedData = convertApiToFormData(api);
    setFormData(convertedData);
    form.setFieldsValue(convertedData);
  }
}, [api, form]);
```

### 2. 用户体验
```typescript
// 提供清晰的操作反馈
const handleCancel = () => {
  // 可以添加未保存更改的确认提示
  if (hasUnsavedChanges) {
    Modal.confirm({
      title: '确认离开？',
      content: '您有未保存的更改，确认要离开吗？',
      onOk: () => navigate(`/projects/${projectId}/apis/${apiId}`)
    });
  } else {
    navigate(`/projects/${projectId}/apis/${apiId}`);
  }
};
```

### 3. 表单状态管理
```typescript
// 监听表单变化，标记是否有未保存的更改
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

const handleFormDataChange = (data: Partial<ApiFormData>) => {
  setFormData(prev => ({ ...prev, ...data }));
  setHasUnsavedChanges(true);
};
```

## 扩展功能

### 1. 版本控制
- 保存编辑历史
- 支持版本回滚
- 变更日志记录

### 2. 协作功能
- 多人同时编辑检测
- 实时同步更改
- 冲突解决机制

### 3. 高级编辑
- 代码编辑器集成
- JSON Schema 验证
- 自动补全和提示