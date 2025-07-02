# 群组详情页面权限标签显示修复

## 问题描述

在群组详情页面的成员管理标签页中，成员权限信息的背景框宽度设置不当，导致显示效果不佳。

### 修复前的问题：
```typescript
// 使用div和固定样式
<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
  {record.permissions.canManageMembers && <Tag size="small">管理成员</Tag>}
  {record.permissions.canEditProject && <Tag size="small">编辑专案</Tag>}
  {record.permissions.canApproveMembers && <Tag size="small">审批申请</Tag>}
</div>
```

**问题：** div容器的宽度不会自动适应内容，导致背景框可能比实际文字宽度更宽或更窄。

## 修复方案

### 修复后的代码：
```typescript
// 使用Space组件和fit-content宽度
<Space direction="vertical" size={2} style={{ width: 'fit-content' }}>
  {record.permissions.canManageMembers && <Tag size="small">管理成员</Tag>}
  {record.permissions.canEditProject && <Tag size="small">编辑专案</Tag>}
  {record.permissions.canApproveMembers && <Tag size="small">审批申请</Tag>}
</Space>
```

### 修复优点：

1. **自适应宽度** - `width: 'fit-content'` 确保容器宽度完全适应内容
2. **更好的间距控制** - `size={2}` 提供更精确的间距控制
3. **更语义化** - 使用Ant Design的Space组件比div更语义化
4. **垂直对齐** - `direction="vertical"` 确保标签垂直排列

## 实际效果

### 修复前：
- 权限标签的背景框可能过宽
- 标签间距不统一
- 整体显示不够紧凑

### 修复后：
- ✅ 权限标签背景框完全贴合文字内容
- ✅ 标签间距统一且合适（2px）
- ✅ 整体显示更加紧凑美观
- ✅ 保持垂直排列的清晰层次

## 文件修改

**修改文件：** `/src/pages/groups/GroupDetailPage.tsx`

**修改位置：** 成员管理表格的权限列渲染函数

**影响范围：** 仅影响群组详情页面的成员权限显示，不影响其他功能

## 测试验证

修复后，可以在群组详情页面的"成员管理"标签页中看到：
- 权限标签的背景框精确匹配文字宽度
- 多个权限标签垂直整齐排列
- 整体视觉效果更加统一和专业

这个修复提升了用户界面的视觉质量，使权限信息的显示更加精确和美观。
