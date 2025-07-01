# 群组详情页面面包屑导航修改

## 修改概述
为群组详情页面添加完整的面包屑导航，显示路径：首页 > 群组管理 > 群组名称，同时确保在Web端和移动端都只显示一个面包屑导航。

## 修改内容

### 1. PageContext 扩展
**文件**: `src/components/common/PageContext.tsx`

添加了群组名称的状态管理：
```typescript
interface PageContextType {
  // 现有属性...
  groupName?: string;
  setGroupName: (name: string) => void;
}
```

### 2. 面包屑导航逻辑更新
**文件**: `src/components/common/PageBreadcrumb.tsx`

#### 主要修改：
1. **导入 TeamOutlined 图标**
2. **获取群组名称**: 从 PageContext 中获取 `groupName`
3. **更新群组路径逻辑**:
   ```typescript
   } else if (pathSegments[0] === 'groups') {
     if (pathSegments.length === 1) {
       // 群组列表页：首页 > 群组管理
       breadcrumbItems.push({
         title: (
           <span>
             <TeamOutlined style={{ marginRight: '4px' }} />
             群组管理
           </span>
         )
       });
     } else if (pathSegments.length >= 2) {
       // 群组详情页：首页 > 群组管理 > 群组名称
       breadcrumbItems.push({
         title: '群组管理',
         href: '/groups'
       });
       breadcrumbItems.push({
         title: groupName || '群组详情'
       });
     }
   }
   ```

### 3. 群组详情页面更新
**文件**: `src/pages/groups/GroupDetailPage.tsx`

#### 主要修改：
1. **导入 usePageContext**
2. **获取 setGroupName 函数**
3. **设置群组名称**: 在数据加载完成后设置群组名称到上下文
4. **清理机制**: 组件卸载时清理上下文状态

```typescript
const { setGroupName } = usePageContext();

// 组件卸载时清理上下文
useEffect(() => {
  return () => {
    setGroupName('');
  };
}, [setGroupName]);

// 在 fetchGroupData 中设置群组名称
setGroupName(mockGroup.name);
```

## 面包屑导航展示效果

### 群组列表页 (`/groups`)
```
首页 > 群组管理
```

### 群组详情页 (`/groups/123`)
```
首页 > 群组管理 > 前端开发组
```

## 兼容性保证

### Web端和移动端统一
- 使用相同的 `PageBreadcrumb` 组件
- 通过 `MainLayout` 中的逻辑控制显示
- Web端显示在 Header 中，移动端显示在独立区域
- 保证只有一个面包屑导航实例

### 现有布局系统
在 `MainLayout.tsx` 中：
```typescript
{/* 桌面端显示在 Header 中 */}
{!isMobile && (
  <div style={{ flex: 1, maxWidth: '400px', marginLeft: '16px' }}>
    <PageBreadcrumb style={{ padding: '0', margin: '0' }} />
  </div>
)}

{/* 移动端面包屑导航 */}
{isMobile && (
  <div style={{
    backgroundColor: '#fff',
    padding: '8px 16px',
    borderBottom: '1px solid #f0f0f0',
    position: 'sticky',
    top: '64px',
    zIndex: 999
  }}>
    <PageBreadcrumb style={{ padding: '0', margin: '0' }} />
  </div>
)}
```

## 状态管理

### 生命周期管理
- **设置时机**: 群组数据加载完成后
- **清理时机**: 组件卸载时
- **更新机制**: 当群组ID变化时重新设置

### 内存管理
通过 `useEffect` 的清理函数确保：
- 避免内存泄漏
- 防止状态污染
- 组件卸载时及时清理

## 测试要点

1. **路径正确性**
   - 群组列表页显示：首页 > 群组管理
   - 群组详情页显示：首页 > 群组名称

2. **导航功能**
   - 点击"首页"跳转到 dashboard
   - 点击"群组管理"跳转到群组列表
   - 群组名称不可点击（当前页面）

3. **响应式兼容**
   - Web端在 Header 中显示
   - 移动端在独立区域显示
   - 两端都只显示一个面包屑导航

4. **状态管理**
   - 进入群组详情页面后面包屑显示群组名称
   - 离开页面后上下文状态被清理
   - 切换不同群组时名称正确更新

5. **异常处理**
   - 群组数据加载失败时显示"群组详情"
   - 群组名称为空时的降级显示

## 技术优势

1. **统一性**: Web端和移动端使用相同的组件和逻辑
2. **可维护性**: 集中的状态管理和清晰的数据流
3. **性能优化**: 合理的状态更新和清理机制
4. **用户体验**: 清晰的导航路径和一致的界面表现