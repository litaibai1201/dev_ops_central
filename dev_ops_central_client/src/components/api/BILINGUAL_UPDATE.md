# API测试配置中英文对照更新

## 更新概览

为了提供更好的国际化支持和用户体验，在所有中文标签、字段和说明文本旁边添加了英文对照。

## 详细更新内容

### 1. 标签页标题 (Tab Titles)

| 中文 | 英文 | 更新后显示 |
|------|------|-----------|
| 请求参数 | Params | 请求参数 (Params) |
| 身份认证 | Authorization | 身份认证 (Authorization) |
| 请求头 | Headers | 请求头 (Headers) |
| 请求体 | Body | 请求体 (Body) |
| 设置 | Settings | 设置 (Settings) |

### 2. 表格列标题 (Table Column Headers)

| 中文 | 英文 | 更新后显示 |
|------|------|-----------|
| 参数名 | Key | 参数名 (Key) |
| 参数值 | Value | 参数值 (Value) |
| 类型 | Type | 类型 (Type) |
| 值/文件 | Value/File | 值/文件 (Value/File) |
| 描述 | Description | 描述 (Description) |

### 3. 输入框占位符 (Input Placeholders)

#### 基础输入框
```tsx
placeholder="请输入参数名 (Enter key name)"
placeholder="请输入参数值 (Enter parameter value)"
placeholder="请输入描述 (Enter description)"
placeholder="请输入请求URL (Enter request URL)"
```

#### 特殊输入框
```tsx
placeholder="请输入Bearer Token (Enter your bearer token)"
placeholder="请输入用户名 (Enter username)"
placeholder="请输入密码 (Enter password)"
placeholder="API Key名称 (API Key name)"
placeholder="API Key值 (API Key value)"
placeholder="请输入请求体内容 (Enter request body)"
```

### 4. 按钮文本 (Button Text)

```tsx
// 发送按钮
发送请求 (Send)

// 文件上传按钮
选择文件 (Select File)

// 二进制文件上传
选择二进制文件 (Select Binary File)

// 功能按钮
格式化 (Beautify)
压缩 (Minify)
```

### 5. 下拉选项 (Select Options)

#### 认证类型
```tsx
<Option value="none">无认证 (No Auth)</Option>
<Option value="bearer">Bearer Token</Option>
<Option value="basic">基础认证 (Basic Auth)</Option>
<Option value="api-key">API Key</Option>
```

#### 文件类型
```tsx
<Option value="text">文本 (Text)</Option>
<Option value="file">文件 (File)</Option>
```

#### 添加位置
```tsx
<Option value="header">请求头 (Header)</Option>
<Option value="query">查询参数 (Query Params)</Option>
```

#### 数据格式
```tsx
<Option value="text">文本 (Text)</Option>
<Option value="javascript">JavaScript</Option>
<Option value="json">JSON</Option>
<Option value="html">HTML</Option>
<Option value="xml">XML</Option>
```

### 6. 请求体类型 (Body Types)

```tsx
{ value: 'none', label: '无 (None)' }
{ value: 'form-data', label: 'form-data' }
{ value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' }
{ value: 'raw', label: '原始数据 (Raw)' }
{ value: 'binary', label: '二进制 (Binary)' }
```

### 7. 字段标签 (Field Labels)

#### 认证相关
```tsx
用户名 (Username)
密码 (Password)
Key名称 (Key Name)
Key值 (Key Value)
添加到 (Add to)
```

#### 设置相关
```tsx
请求超时时间 (Request timeout) (毫秒 ms)
最大重定向次数 (Max redirects)
跟随重定向 (Follow redirects)
保持原始HTTP方法 (Follow original HTTP method)
```

### 8. 说明文本 (Description Text)

#### 请求参数说明
```
查询参数将附加在请求URL的末尾，跟在'?'之后。
(Query parameters are appended to the end of the request URL, following '?'.)
```

#### 请求头说明
```
请求头允许客户端和服务器传递HTTP请求或响应的附加信息。
(Headers let the client and the server pass additional information with the HTTP request or response.)
```

#### Bearer Token说明
```
此Token将在Authorization请求头中以"Bearer {token}"的形式发送
(This token will be sent in the Authorization header as "Bearer {token}")
```

#### Form-data说明
```
表单数据允许您发送键值对，也可以发送文件。
(Form data allows you to send key-value pairs, and you can also send files.)
```

#### URL编码说明
```
URL编码的表单数据，键值对将以URL编码的格式发送。
(URL-encoded form data, key-value pairs will be sent in URL-encoded format.)
```

#### 二进制文件说明
```
支持上传任意格式的二进制文件
(Support uploading binary files in any format)
```

#### 设置项说明
```
等待响应的最长时间（毫秒）
(How long to wait for a response in milliseconds)

允许跟随的最大重定向次数
(Maximum number of redirects to follow)

自动跟随HTTP重定向
(Automatically follow HTTP redirects)

在跟随重定向时使用原始的HTTP方法
(Use the original HTTP method when following redirects)
```

#### 字符计数
```
{bodyContent.length} 个字符 ({bodyContent.length} characters)
```

#### 空状态提示
```
此请求没有请求体
(This request does not have a body)
```

### 9. 占位符更新细节 (Placeholder Details)

#### Form-data 特殊处理
```tsx
// 根据是否为form-data调整占位符
placeholder={isFormData ? "请输入值 (Enter value)" : "请输入参数值 (Enter parameter value)"}
```

#### 文件上传按钮
```tsx
{record.file ? record.file.name : '选择文件 (Select File)'}
```

#### 认证配置占位符
```tsx
placeholder="选择认证类型 (Select auth type)"
placeholder="0表示无限制 (0 for infinite)"
```

## 设计原则

### 1. 一致性 (Consistency)
- 所有中文文本后面都用括号加英文对照
- 格式统一：`中文 (English)`
- 专业术语保持原样（如 Bearer Token, JSON, XML 等）

### 2. 简洁性 (Simplicity)
- 英文翻译简洁明了，避免冗长
- 常用术语使用标准缩写
- 保持界面整洁，不会因为文本过长影响布局

### 3. 专业性 (Professionalism)
- 使用标准的API和HTTP术语
- 保持技术文档的准确性
- 遵循国际通用的命名规范

### 4. 用户友好性 (User-Friendly)
- 为中文用户提供熟悉的界面
- 为国际用户提供英文参考
- 降低学习成本和使用门槛

## 受益群体

### 1. 中文用户
- 熟悉的中文界面
- 不用担心英文理解障碍
- 专业术语有英文对照可以参考

### 2. 国际用户
- 可以通过英文对照理解功能
- 熟悉的英文术语
- 便于与其他工具（如Postman）对比

### 3. 开发团队
- 统一的中英文对照标准
- 便于后续国际化扩展
- 提升产品的专业形象

这次更新使得API测试界面具备了完整的中英文对照支持，为不同语言背景的用户提供了更好的使用体验。