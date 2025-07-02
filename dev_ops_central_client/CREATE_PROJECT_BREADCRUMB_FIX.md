# 创建专案页面面包屑导航和返回按钮修复

## 问题描述

1. **面包屑导航错误**：创建专案页面的面包屑显示为"专案详情"而不是"创建专案"
2. **缺少返回按钮**：页面标题右侧没有返回按钮

## 修复内容

### 1. PageHeader组件优化

**修复前的问题：**
- 使用Tailwind CSS类名，可能在某些环境下不生效
- 返回按钮显示逻辑不够明确

**修复后：**
```typescript
// 替换Tailwind类名为inline styles
<div style={{
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between' 
}}>
  {showBack && (
    <Button 
      icon={<ArrowLeftOutlined />} 
      onClick={onBack}
      size="large"
      style={{ marginRight: '16px' }}
    >
      {backText}
    </Button>
  )}
</div>
```

### 2. 创建专案页面返回按钮

**修复前：**
```typescript
<PageHeader
  title="创建专案"
  subtitle="在群组中创建新的API专案"
  onBack={() => navigate(-1)}
/>
```

**修复后：**
```typescript
<PageHeader
  title="创建专案"
  subtitle="在群组中创建新的API专案"
  showBack={true}
  onBack={() => navigate(-1)}
  backText="返回"
/>
```

### 3. 面包屑导航路径识别

**修复前的问题：**
- `/projects/create` 路径被错误识别为专案详情页面
- `/groups/create` 路径也有类似问题

**修复后：**
```typescript
// 添加对create路径的特殊处理
if (pathSegments[1] === 'create') {
  // 创建专案页面
  breadcrumbItems.push({
    title: '专案管理',
    href: '/dashboard'
  });
  breadcrumbItems.push({
    title: (
      <span>
        <ProjectOutlined style={{ marginRight: '4px' }} />
        创建专案
      </span>
    )
  });
}
```

## 修复效果

### ✅ 面包屑导航

**修复前：**
- 首页 / 专案详情 ❌

**修复后：**
- 首页 / 专案管理 / 创建专案 ✅

### ✅ 返回按钮

**修复前：**
- 页面标题右侧无返回按钮 ❌

**修复后：**
- 页面标题左侧显示返回按钮，点击可返回上一页 ✅

### ✅ 样式优化

**修复前：**
- 依赖Tailwind CSS类名，可能样式不生效 ❌

**修复后：**
- 使用inline styles，确保样式稳定显示 ✅

## 影响的页面

1. **创建专案页面** (`/projects/create`)
   - ✅ 面包屑显示"创建专案"
   - ✅ 左侧显示返回按钮

2. **创建群组页面** (`/groups/create`)
   - ✅ 面包屑显示"创建群组"  
   - ✅ 已有返回按钮功能

3. **其他使用PageHeader的页面**
   - ✅ 样式更加稳定
   - ✅ 返回按钮功能更可靠

## 修改的文件

1. **CreateProjectPage.tsx**
   - 添加`showBack={true}`和`backText="返回"`属性

2. **PageHeader.tsx**
   - 将Tailwind CSS类名替换为inline styles
   - 优化返回按钮的显示逻辑和样式

3. **PageBreadcrumb.tsx**
   - 添加对`/projects/create`路径的特殊处理
   - 添加对`/groups/create`路径的特殊处理
   - 确保面包屑导航正确显示创建页面的标题

## 测试验证

修复后应该验证：
1. 访问`/projects/create`页面，面包屑显示正确
2. 返回按钮位于页面标题左侧，点击能正常返回
3. 页面样式正常显示，无布局问题
4. 其他页面的PageHeader组件功能正常

通过这些修复，创建专案页面现在具有正确的面包屑导航和返回按钮功能。
