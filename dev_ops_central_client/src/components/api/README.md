# API 组件重构说明

## 重构目标
将原来的大型 `ApiDetailPage.tsx` 文件按功能拆分成多个可复用的组件，提高代码的可维护性和复用率。

## 组件结构

### 基础组件 (`src/components/api/`)
1. **ApiBasicInfo.tsx** - API 基本信息展示
   - 接口名称、请求方法、URL路径、状态、标签、描述

2. **ApiHeadersTable.tsx** - 请求头表格
   - 显示API的请求头信息

3. **ApiParametersTable.tsx** - 参数表格
   - 可复用的参数表格组件，支持请求参数和响应参数

4. **ApiRequestBody.tsx** - 请求体展示
   - 显示API的请求体内容，支持复制功能

5. **ApiResponseParameters.tsx** - 响应参数表格
   - 标准响应参数结构展示

6. **ApiResponseExample.tsx** - 响应示例
   - 显示API响应示例，支持复制功能

7. **ApiTestConfig.tsx** - 测试配置面板
   - API在线测试的配置界面

8. **ApiTestResult.tsx** - 测试结果展示
   - 显示API测试结果，包含响应体、响应头、测试结果三个标签页

9. **ApiCodeExamples.tsx** - 代码示例
   - 多语言代码示例生成器

### 页面级组件
10. **ApiDetailsTab.tsx** - 接口详情标签页
    - 组合多个基础组件形成完整的详情页

11. **ApiTestTab.tsx** - 在线测试标签页
    - 组合测试配置和测试结果组件

### 主页面
12. **ApiDetailPage.tsx** - 重构后的主页面
    - 负责数据获取、状态管理和整体布局

## 优势

### 1. 可维护性
- 每个组件职责单一，便于维护和调试
- 代码结构清晰，逻辑分离

### 2. 可复用性
- 基础组件可以在其他页面中复用
- 参数表格组件支持不同类型的参数展示

### 3. 可测试性
- 每个组件可以独立测试
- 便于编写单元测试

### 4. 扩展性
- 新增功能时只需修改相关组件
- 便于添加新的API展示功能

## 使用方式

```tsx
import { ApiDetailsTab, ApiTestTab, ApiCodeExamples } from '../../components/api';

// 在页面中使用
<ApiDetailsTab api={apiData} />
<ApiTestTab api={apiData} />
<ApiCodeExamples api={apiData} />
```

## 文件大小对比
- **重构前**: `ApiDetailPage.tsx` 约 800+ 行
- **重构后**: 主文件约 200 行，功能分散到 12 个专门的组件文件中

每个组件文件都控制在合理的大小范围内，便于开发和维护。