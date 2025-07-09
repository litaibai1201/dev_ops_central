# API 组件库

这是一个专门用于构建API文档管理界面的组件库，包含了创建、编辑和展示API接口所需的各种组件。

## 组件概览

### 基础组件

#### 1. ApiMethodSelector
HTTP方法选择器组件
```tsx
import { ApiMethodSelector } from '../../components/api';

<ApiMethodSelector
  value="GET"
  onChange={handleMethodChange}
  size="large"
/>
```

#### 2. ParamTable
参数表格组件，支持嵌套结构
```tsx
import { ParamTable } from '../../components/api';

<ParamTable
  params={requestParams}
  onParamChange={updateRequestParam}
  onAddParam={addRequestParam}
  onRemoveParam={removeRequestParam}
  type="request"
  supportedLocations={supportedLocations}
/>
```

#### 3. RequestHeaderTable
请求头配置表格
```tsx
import { RequestHeaderTable } from '../../components/api';

<RequestHeaderTable
  headers={requestHeaders}
  onHeaderChange={updateRequestHeader}
  onRemoveHeader={removeRequestHeader}
/>
```

### 高级组件

#### 4. ApiParamSection
参数配置区域组件，包含表格和相关说明
```tsx
import { ApiParamSection } from '../../components/api';

<ApiParamSection
  title="请求参数配置"
  params={requestParams}
  onParamChange={updateRequestParam}
  onAddParam={addRequestParam}
  onRemoveParam={removeRequestParam}
  type="request"
  supportedLocations={getSupportedLocations()}
/>
```

#### 5. RequestHeaderSection
请求头配置区域组件
```tsx
import { RequestHeaderSection } from '../../components/api';

<RequestHeaderSection
  headers={requestHeaders}
  onHeaderChange={updateRequestHeader}
  onAddHeader={addRequestHeader}
  onRemoveHeader={removeRequestHeader}
/>
```

#### 6. ApiBasicForm
API基本信息表单
```tsx
import { ApiBasicForm } from '../../components/api';

<ApiBasicForm
  form={form}
  selectedMethod={selectedMethod}
  onMethodChange={handleMethodChange}
/>
```

### 布局组件

#### 7. ApiPageHeader
API页面头部组件
```tsx
import { ApiPageHeader } from '../../components/api';

<ApiPageHeader
  title="新增接口"
  projectName={project.name}
  onBack={() => navigate('/projects')}
  onSave={handleSubmit}
  loading={loading}
/>
```

#### 8. ApiFormSection
表单区域包装组件
```tsx
import { ApiFormSection } from '../../components/api';

<ApiFormSection title="接口基本信息">
  {/* 表单内容 */}
</ApiFormSection>
```

#### 9. ApiFormTips
表单提示信息组件
```tsx
import { ApiFormTips } from '../../components/api';

<ApiFormTips 
  tips={['提示1', '提示2']}
  type="success"
/>
```

### 组合组件

#### 10. ApiForm
完整的API表单组件，包含所有API配置功能
```tsx
import { ApiForm } from '../../components/api';

<ApiForm
  form={form}
  onFormDataChange={handleFormDataChange}
  showMethodInfo={true}
  showRequestParams={true}
  showResponseParams={true}
  showRequestHeaders={true}
/>
```

### 工具

#### 11. useApiParams Hook
管理API参数状态的自定义Hook
```tsx
import { useApiParams } from '../../components/api';

const {
  requestParams,
  responseParams,
  requestHeaders,
  addRequestParam,
  removeRequestParam,
  updateRequestParam,
  // ... 其他方法
} = useApiParams({
  supportedLocations: ['query', 'path', 'body']
});
```

#### 12. paramUtils
参数操作工具函数
```tsx
import { paramUtils } from '../../components/api';

// 添加请求参数
paramUtils.addRequestParam(params, setParams, supportedLocations, parentKey);

// 删除请求参数
paramUtils.removeRequestParam(params, setParams, key);

// 更新请求参数
paramUtils.updateRequestParam(params, setParams, key, field, value);
```

## 使用示例

### 创建API页面的简化实现

```tsx
import React, { useState } from 'react';
import { Form } from 'antd';
import { 
  ApiPageHeader, 
  ApiForm, 
  ApiFormData 
} from '../../components/api';

const CreateApiPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ApiFormData>>({});

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const apiData = { ...values, ...formData };
      
      // 提交API数据
      await saveApi(apiData);
      
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ApiPageHeader
        title="新增接口"
        onSave={handleSubmit}
        loading={loading}
      />
      
      <Form form={form}>
        <ApiForm
          form={form}
          onFormDataChange={setFormData}
        />
      </Form>
    </div>
  );
};
```

### 自定义API编辑页面

```tsx
import React from 'react';
import { Form } from 'antd';
import { 
  ApiFormSection,
  ApiBasicForm,
  ApiParamSection,
  useApiParams 
} from '../../components/api';

const EditApiPage = ({ initialData }) => {
  const [form] = Form.useForm();
  const [selectedMethod, setSelectedMethod] = useState(initialData.method);
  
  const {
    requestParams,
    addRequestParam,
    removeRequestParam,
    updateRequestParam
  } = useApiParams({
    initialRequestParams: initialData.requestParams
  });

  return (
    <Form form={form} initialValues={initialData}>
      <ApiFormSection title="基本信息">
        <ApiBasicForm
          form={form}
          selectedMethod={selectedMethod}
          onMethodChange={setSelectedMethod}
        />
      </ApiFormSection>
      
      <ApiParamSection
        title="请求参数"
        params={requestParams}
        onParamChange={updateRequestParam}
        onAddParam={addRequestParam}
        onRemoveParam={removeRequestParam}
        type="request"
      />
    </Form>
  );
};
```

## 特性

### 1. 高度可配置
- 所有组件都支持通过props进行自定义配置
- 支持隐藏/显示特定功能模块
- 可自定义样式和行为

### 2. 类型安全
- 完整的TypeScript类型定义
- 严格的类型检查
- 智能提示和自动补全

### 3. 嵌套参数支持
- 支持多层级嵌套的参数结构
- 自动处理父子关系
- 可视化的层级展示

### 4. HTTP方法适配
- 根据HTTP方法自动调整参数位置选项
- 智能的参数验证
- 方法特性说明

### 5. 状态管理
- 内置的参数状态管理
- 支持外部状态管理
- 灵活的数据流控制

## 数据结构

### RequestParam
```tsx
interface RequestParam {
  key: string;
  name: string;
  type: string;
  location: string; // 'query' | 'path' | 'body'
  required: boolean;
  description: string;
  example?: string;
  parentKey?: string;
  level: number;
}
```

### ResponseParam
```tsx
interface ResponseParam {
  key: string;
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
  parentKey?: string;
  level: number;
}
```

### RequestHeader
```tsx
interface RequestHeader {
  key: string;
  name: string;
  value: string;
  required: boolean;
  description: string;
  readonly?: boolean;
}
```

### HttpMethod
```tsx
interface HttpMethod {
  value: string;
  label: string;
  color: string;
  description: string;
  hasRequestBody: boolean;
  supportedLocations: string[];
}
```

## 最佳实践

### 1. 组件组合
- 优先使用高级组合组件（如 ApiForm）
- 需要自定义时再使用基础组件
- 保持组件职责单一

### 2. 状态管理
- 使用 useApiParams Hook 管理复杂状态
- 避免直接操作状态数组
- 利用工具函数处理数据操作

### 3. 性能优化
- 合理使用 React.memo 优化渲染
- 避免在渲染函数中创建新对象
- 使用 useCallback 缓存事件处理函数

### 4. 错误处理
- 添加适当的错误边界
- 提供用户友好的错误提示
- 记录详细的错误日志

## 扩展指南

### 添加新的参数类型
1. 扩展 `DEFAULT_PARAM_TYPES` 常量
2. 更新相关的类型定义
3. 添加相应的验证逻辑

### 自定义HTTP方法
1. 扩展 `DEFAULT_HTTP_METHODS` 常量
2. 定义方法的特性配置
3. 更新相关的业务逻辑

### 添加新的参数位置
1. 扩展 `DEFAULT_PARAM_LOCATIONS` 常量
2. 更新 HTTP 方法的支持配置
3. 添加相应的处理逻辑

## 版本历史

### v1.0.0
- 初始版本发布
- 包含所有基础和高级组件
- 支持完整的API表单功能

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码变更
4. 创建 Pull Request

## 许可证

MIT License