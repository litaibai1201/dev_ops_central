# 角色系统简化修改总结

## 修改概述

根据需求，从系统中移除了 `group_owner` 和 `project_admin` 两个角色，简化角色体系为只有两个主体角色：
- `user` - 普通用户
- `system_admin` - 系统管理员

## 修改文件列表

### 1. 类型定义 (`src/types/index.ts`)
**修改内容：**
```typescript
// 修改前
role: 'user' | 'admin' | 'group_owner' | 'project_admin' | 'system_admin';

// 修改后  
role: 'user' | 'system_admin';
```

**影响：**
- 统一了用户角色类型定义
- 移除了 `admin`、`group_owner`、`project_admin` 三个角色
- 保留 `user` 和 `system_admin` 作为主体角色

### 2. 登录页面 (`src/pages/auth/AuthPage.tsx`)

#### 登录逻辑简化
**修改内容：**
```typescript
// 修改前
role: values.username === 'admin' ? 'system_admin' : 
      values.username === 'groupowner' ? 'group_owner' :
      values.username === 'projectadmin' ? 'project_admin' : 'user'

// 修改后
role: values.username === 'admin' ? 'system_admin' : 'user'
```

#### 测试账号说明更新
**修改内容：**
```html
<!-- 修改前 -->
<p>管理员: admin / 群主: groupowner</p>
<p>专案管理员: projectadmin / 普通用户: user</p>

<!-- 修改后 -->
<p>管理员: admin / 普通用户: user</p>
```

**影响：**
- 简化了登录测试逻辑
- 只保留 `admin` 和 `user` 两个测试账号
- 清理了页面上的角色说明文本

### 3. 主布局 (`src/components/layout/MainLayout.tsx`)

#### 角色显示名称映射
**修改内容：**
```typescript
// 修改前
const roleMap = {
  user: '普通用户',
  project_admin: '专案管理员',
  group_owner: '群主',  
  system_admin: '系统管理员'
};

// 修改后
const roleMap = {
  user: '普通用户',
  system_admin: '系统管理员'
};
```

**影响：**
- 右上角用户下拉框只显示 "普通用户" 或 "系统管理员"
- 清理了无效的角色映射
- 统一了角色显示逻辑

### 4. 专案总览页面 (`src/pages/dashboard/DashboardPage.tsx`)

#### 操作权限控制
**修改内容：**
```typescript
// 修改前
if (user.role === 'project_admin' || user.role === 'group_owner' || user.role === 'system_admin') {
  actions.push(createEditAction(() => navigate(`/projects/${record.id}/edit`)));
}

// 修改后
if (user.role === 'system_admin') {
  actions.push(createEditAction(() => navigate(`/projects/${record.id}/edit`)));
}
```

**影响：**
- 专案列表中的编辑操作只有系统管理员可以使用
- 普通用户只能查看专案详情
- 简化了权限判断逻辑

## 角色体系重新设计

### 🎯 **新的角色逻辑**

#### 主体角色
1. **普通用户 (`user`)**
   - 系统的基础角色
   - 可以查看公开专案
   - 可以创建群组
   - 成为群主后可以在群组中创建专案

2. **系统管理员 (`system_admin`)**
   - 系统最高权限角色
   - 可以管理所有用户和群组
   - 可以编辑所有专案
   - 具有系统配置权限

#### 相对角色（基于具体关系）
1. **群主**
   - 基于具体群组的相对角色
   - 通过 `Group.ownerId` 字段确定
   - 可以在其管理的群组中创建专案
   - 可以管理群组成员和权限

2. **专案管理员**
   - 基于具体专案的相对角色
   - 通过 `GroupMember.role` 和权限字段确定
   - 可以管理具体专案的API接口
   - 由群主分配和管理

### 🔄 **角色判断逻辑**

#### 群主身份判断
```typescript
// 检查用户是否为某个群组的群主
const isGroupOwner = (userId: string, groupId: string) => {
  return group.ownerId === userId;
};

// 获取用户管理的所有群组
const ownedGroups = userGroups.filter(group => group.ownerId === user.id);
```

#### 专案管理权限判断
```typescript
// 检查用户是否可以管理专案
const canManageProject = (user: User, project: Project) => {
  return user.role === 'system_admin' || 
         project.group.ownerId === user.id;
};
```

### 📊 **权限矩阵**

| 操作 | 普通用户 | 群主(相对) | 系统管理员 |
|------|----------|------------|------------|
| 查看公开专案 | ✅ | ✅ | ✅ |
| 创建群组 | ✅ | ✅ | ✅ |
| 创建专案 | ❌ | ✅ (在管理的群组中) | ✅ |
| 编辑专案 | ❌ | ✅ (在管理的群组中) | ✅ |
| 管理群组成员 | ❌ | ✅ (在管理的群组中) | ✅ |
| 系统管理 | ❌ | ❌ | ✅ |

### 🎨 **用户界面影响**

#### 登录页面
- 简化测试账号说明
- 移除了不再使用的角色测试入口
- 保持界面整洁

#### 右上角用户显示
- 只显示两种主体角色
- 角色名称更加清晰
- 避免混淆相对角色

#### 专案总览页面
- 快捷操作区域根据实际群主身份动态显示
- 权限说明更加准确
- 突出了角色的相对性概念

### 🔍 **数据关系保持**

虽然移除了角色常量，但相关的数据关系仍然保持：
- `Group.ownerId` 继续标识群主关系
- `GroupMember.role` 继续管理群组内角色
- `GroupMember.permissions` 继续控制具体权限

### ✅ **验证要点**

1. **登录测试**
   - `admin` 用户登录后显示为 "系统管理员"
   - `user` 用户登录后显示为 "普通用户"
   - 移除的角色账号不再可用

2. **权限验证**
   - 系统管理员可以编辑所有专案
   - 普通用户只能查看专案
   - 群主可以在快捷操作区域创建专案

3. **界面一致性**
   - 所有角色显示统一使用新的映射
   - 移除了废弃角色的相关文本
   - 保持了良好的用户体验

这次修改成功简化了角色系统，让主体角色和相对角色的概念更加清晰，同时保持了系统的完整功能。
