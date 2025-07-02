# API测试配置优化更新

## 主要改进

### 1. 移除不必要的按钮
- ❌ 移除了 Save 按钮
- ❌ 移除了 History 按钮  
- ❌ 移除了 Import 按钮
- ❌ 移除了 "Saved requests: 12" 标签
- ❌ 移除了 Pre-request Script 和 Tests 标签页

保留核心功能，界面更加简洁专注。

### 2. 表单标题固定显示
**之前**：只有在有数据时才显示表头
```tsx
showHeader={params.some(p => p.key)}
```

**现在**：始终显示表头
```tsx
showHeader={true}
```

这样用户始终能看到列的含义，提供更好的用户体验。

### 3. 中文化界面文本

#### 标签页标题
- `Params` → `请求参数`
- `Authorization` → `身份认证`  
- `Headers` → `请求头`
- `Body` → `请求体`
- `Settings` → `设置`

#### 表格列标题
- `Key` → `参数名`
- `Value` → `参数值`
- `Description` → `描述`

#### 提示文本
- `Enter request body` → `请输入请求体内容`
- `Query parameters are appended...` → `查询参数将附加在请求URL的末尾，跟在'?'之后。`
- `Headers let the client...` → `请求头允许客户端和服务器传递HTTP请求或响应的附加信息。`

#### 认证选项
- `No Auth` → `无认证`
- `Bearer Token` → `Bearer Token`
- `Basic Auth` → `基础认证`
- `API Key` → `API Key`

#### 请求体类型
- `none` → `无`
- `raw` → `原始数据`
- `binary` → `二进制`

### 4. Form-data 增强功能

#### 类型选择器
新增了类型选择列，支持：
- **文本**：普通的文本参数
- **文件**：文件上传参数

```tsx
{
  title: '类型',
  dataIndex: 'type',
  width: '15%',
  render: (type: string, record: ParamRow, index: number) => (
    <Select value={type || 'text'} onChange={(value) => {...}}>
      <Option value="text">文本</Option>
      <Option value="file">文件</Option>
    </Select>
  ),
}
```

#### 文件上传支持
当选择"文件"类型时，值列变为文件上传组件：

```tsx
if (isFormData && record.type === 'file') {
  return (
    <Upload
      beforeUpload={(file) => {
        updateParamRow(params, setParams, index, 'file', file);
        updateParamRow(params, setParams, index, 'value', file.name);
        return false; // 阻止自动上传
      }}
      showUploadList={false}
      accept="*/*"
    >
      <Button size="small" icon={<UploadOutlined />}>
        {record.file ? record.file.name : '选择文件'}
      </Button>
    </Upload>
  );
}
```

#### 智能列标题
form-data模式下，值列的标题变为"值/文件"，更准确地描述内容。

### 5. 数据结构优化

#### ParamRow 接口扩展
```tsx
interface ParamRow {
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
  type?: 'text' | 'file'; // 新增：用于form-data类型选择
  file?: File | null;     // 新增：用于存储上传的文件
}
```

#### 自动添加新行逻辑
```tsx
if (index === params.length - 1 && field === 'key' && value && typeof value === 'string') {
  const newRow: ParamRow = { key: '', value: '', description: '', enabled: true };
  if (params === formData) {
    newRow.type = 'text'; // form-data默认为文本类型
  }
  newParams.push(newRow);
}
```

### 6. 用户体验优化

#### 文件上传反馈
- 选择文件后，按钮文本变为文件名
- 支持所有文件类型 (`accept="*/*"`)
- 阻止自动上传，由用户控制

#### 类型切换逻辑
- 从文件切换到文本时，自动清除已选择的文件
- 智能的默认值设置

#### 一致的中文体验
- 所有用户可见的文本都已中文化
- 保持专业术语的准确性（如 Bearer Token）

## 界面效果对比

### Form-data 表格结构
```
☑ | 参数名     | 类型  | 值/文件        | 描述           | 操作
☑ | avatar    | 文件  | [选择文件]      | 用户头像        | 🗑
☑ | username  | 文本  | john_doe      | 用户名         | 🗑  
☑ | email     | 文本  | john@...      | 邮箱地址        | 🗑
  | [空行]    | 文本  | [空行]        | [空行]         |
```

### 其他参数表格结构
```
☑ | 参数名     | 参数值         | 描述           | 操作
☑ | username  | john_doe      | 用户名         | 🗑
☑ | email     | john@...      | 邮箱地址        | 🗑
  | [空行]    | [空行]        | [空行]         |
```

这次优化使得界面更加简洁易用，同时增强了form-data的文件上传功能，提供了完整的中文化体验。