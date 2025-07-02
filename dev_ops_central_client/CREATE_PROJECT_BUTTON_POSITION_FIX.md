# 创建专案页面返回按钮位置调整

## 修改内容

将创建专案页面的返回按钮从标题左侧移动到标题右侧。

### 修改前：
```typescript
<PageHeader
  title="创建专案"
  subtitle="在群组中创建新的API专案"
  showBack={true}
  onBack={() => navigate(-1)}
  backText="返回"
/>
```
**效果：** 返回按钮显示在"创建专案"标题的左侧

### 修改后：
```typescript
<PageHeader
  title="创建专案"
  subtitle="在群组中创建新的API专案"
  actions={[
    {
      key: 'back',
      text: '返回',
      type: 'default',
      onClick: () => navigate(-1)
    }
  ]}
/>
```
**效果：** 返回按钮显示在"创建专案"标题的右侧

## 视觉效果

### 修改前：
```
[← 返回] 创建专案                                    
         在群组中创建新的API专案
```

### 修改后：
```
创建专案                                    [返回]
在群组中创建新的API专案
```

## 技术说明

- 移除了 `showBack`、`onBack`、`backText` 属性
- 使用 `actions` 属性将返回按钮添加到页面标题的右侧操作区域
- 按钮功能保持不变，仍然执行 `navigate(-1)` 返回上一页

## 修改文件

**文件：** `src/pages/projects/CreateProjectPage.tsx`
**修改行数：** 290-297行
**影响范围：** 仅影响创建专案页面的返回按钮位置

## 一致性

此修改使创建专案页面的返回按钮位置与其他页面的操作按钮布局保持一致，所有操作按钮都位于页面标题的右侧。
