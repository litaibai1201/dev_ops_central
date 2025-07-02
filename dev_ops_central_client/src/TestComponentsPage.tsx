// 测试文件：验证公共组件是否能正常导入和使用
import React from 'react';
import { 
  PageHeader, 
  LoadingState,
  usePermissions,
  formatDate
} from '../components/common';

const TestPage: React.FC = () => {
  // 模拟用户数据
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user' as const,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  const permissions = usePermissions(mockUser);

  return (
    <div>
      <PageHeader
        title="测试页面"
        subtitle="验证公共组件是否正常工作"
      />
      
      <LoadingState loading={false} empty={false}>
        <div style={{ padding: '20px' }}>
          <h3>基本信息测试</h3>
          <p>用户名: {mockUser.username}</p>
          <p>是否系统管理员: {permissions.isSystemAdmin() ? '是' : '否'}</p>
          <p>格式化日期: {formatDate(mockUser.createdAt, 'full')}</p>
          
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#f6ffed', 
            borderRadius: '8px',
            marginTop: '16px'
          }}>
            ✅ 如果能看到这个页面，说明公共组件导入正常
          </div>
        </div>
      </LoadingState>
    </div>
  );
};

export default TestPage;
