# Postman 风格的API测试配置重构

## 设计理念

完全仿照 Postman 的界面设计和交互方式，为用户提供熟悉且专业的API测试体验。

## 主要特点

### 1. Postman风格的URL配置区
```
[GET ▼] [URL输入框                    ] [Send]
```
- HTTP方法下拉选择器
- 完整URL输入框（支持编辑）
- 醒目的Send按钮

### 2. 标签页式参数配置
仿照Postman的标签页布局，包含：
- **Params** - Query参数配置
- **Authorization** - 认证配置
- **Headers** - 请求头配置
- **Body** - 请求体配置
- **Pre-request Script** - 预请求脚本
- **Tests** - 测试脚本
- **Settings** - 高级设置

### 3. 表格式参数输入
使用与Postman相同的表格布局：
```
☑ | Key        | Value      | Description
☑ | username   | john_doe   | 用户名
☑ | email      | john@...   | 邮箱地址
  | [新行]     | [新行]     | [新行]
```

特点：
- Checkbox控制启用/禁用
- 内联编辑（无边框输入框）
- 自动添加新行
- 删除按钮

### 4. 认证配置
支持多种认证方式，完全模仿Postman：
- **No Auth** - 无认证
- **Bearer Token** - JWT令牌
- **Basic Auth** - 用户名密码
- **API Key** - API密钥

### 5. 请求体配置
Radio按钮选择体类型：
- **none** - 无请求体
- **form-data** - 表单数据
- **x-www-form-urlencoded** - URL编码
- **raw** - 原始数据（支持JSON/XML/Text等）
- **binary** - 二进制文件

### 6. 高级功能
- **Pre-request Script** - 预请求脚本执行
- **Tests** - 响应测试脚本
- **Settings** - 超时、重定向等设置

## 界面布局

```
┌─────────────────────────────────────────┐
│ [GET ▼] [URL输入框           ] [Send]    │
├─────────────────────────────────────────┤
│ [Save] [History] [Import] [Saved: 12]   │
├─────────────────────────────────────────┤
│ ┌─ Params(2) ─ Authorization ─ Headers(3) ─ Body ─ Pre-request ─ Tests ─ Settings ─┐
│ │                                                                                    │
│ │ ☑ | Key      | Value     | Description                                  | 🗑      │
│ │ ☑ | username | john_doe  | 用户名                                        |        │
│ │ ☑ | email    | john@...  | 邮箱地址                                      |        │
│ │   | [空行]   | [空行]    | [空行]                                        |        │
│ │                                                                                    │
│ └────────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────┐
```

## 技术实现

### 1. 表格式输入组件
```tsx
<Table
  dataSource={params}
  columns={getParamColumns(params, setParams)}
  pagination={false}
  size="small"
  showHeader={params.some(p => p.key)}
  style={{ border: '1px solid #f0f0f0', borderRadius: '6px' }}
/>
```

### 2. 自动添加新行逻辑
```tsx
// 如果是最后一行且key不为空，自动添加新行
if (index === params.length - 1 && field === 'key' && value) {
  newParams.push({ key: '', value: '', description: '', enabled: true });
}
```

### 3. 内联编辑样式
```tsx
<Input
  style={{ border: 'none', boxShadow: 'none' }}
  placeholder="参数名"
/>
```

### 4. 状态管理
使用React Hooks管理复杂的表单状态：
- `queryParams` - Query参数数组
- `headers` - 请求头数组
- `formData` - 表单数据数组
- `bodyType` - 请求体类型
- `authType` - 认证类型

## 用户体验优化

### 1. 智能交互
- 自动添加新行
- 实时计数显示
- Checkbox快速启用/禁用
- 一键美化JSON

### 2. 视觉设计
- 无边框内联编辑
- 统一的间距和颜色
- 清晰的分组和层次
- 专业的等宽字体

### 3. 功能完整性
- 完整的参数类型支持
- 多种认证方式
- 丰富的请求体选项
- 高级配置选项

## 对比优势

| 特性 | 原版本 | Postman风格版本 |
|------|--------|-----------------|
| 界面布局 | 折叠式卡片 | 标签页 |
| 参数输入 | 基础表单 | 表格式内联编辑 |
| 认证配置 | 简单下拉 | 完整的认证选项 |
| 请求体 | 单一文本框 | 多种格式选择 |
| 用户体验 | 一般 | 专业且熟悉 |
| 功能完整性 | 基础 | 企业级完整功能 |

这个Postman风格的重构版本提供了更专业、更直观的API测试体验，让用户能够快速上手并高效地进行API测试工作。