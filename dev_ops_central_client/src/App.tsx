import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { User } from './types';
import MainLayout from './components/layout/MainLayout';
import AuthPage from './pages/auth/AuthPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import ApiDetailPage from './pages/apis/ApiDetailPage';
import CreateApiPage from './pages/apis/CreateApiPage';
import GroupManagementPage from './pages/groups/GroupManagementPage';
import CreateGroupPage from './pages/groups/CreateGroupPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查是否有已保存的用户信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ fontSize: '18px' }}>加载中...</div>
      </div>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      {!user ? (
        // 未登录状态 - 显示登录页面（不需要Router）
        <AuthPage onLogin={handleLogin} />
      ) : (
        // 已登录状态 - 显示主应用（使用Router）
        <Router>
          <MainLayout user={user} onLogout={handleLogout}>
            <Routes>
              {/* 默认重定向到仪表板 */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 仪表板 */}
              <Route path="/dashboard" element={<DashboardPage user={user} />} />
              
              {/* 专案管理 */}
              <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
              <Route path="/projects/create" element={<CreateProjectPage user={user} />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage user={user} />} />
              <Route path="/projects/:projectId/apis/create" element={<CreateApiPage user={user} />} />
              <Route path="/projects/:projectId/apis/:apiId" element={<ApiDetailPage user={user} />} />
              
              {/* 群组管理 */}
              <Route path="/groups" element={<GroupManagementPage user={user} />} />
              <Route path="/groups/create" element={<CreateGroupPage user={user} />} />
              <Route path="/groups/:groupId" element={<GroupDetailPage user={user} />} />
              
              {/* 系统管理员路由 */}
              {user.role === 'system_admin' && (
                <Route path="/admin/*" element={
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    系统管理功能开发中...
                  </div>
                } />
              )}
              
              {/* 个人设置 */}
              <Route path="/profile" element={
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  个人资料页面开发中...
                </div>
              } />
              <Route path="/settings" element={
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  设置页面开发中...
                </div>
              } />
              <Route path="/notifications" element={
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  通知页面开发中...
                </div>
              } />
              
              {/* 404页面 */}
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    marginBottom: '1rem' 
                  }}>
                    页面未找到
                  </h2>
                  <p style={{ color: '#4b5563' }}>您访问的页面不存在</p>
                </div>
              } />
            </Routes>
          </MainLayout>
        </Router>
      )}
    </ConfigProvider>
  );
};

export default App;