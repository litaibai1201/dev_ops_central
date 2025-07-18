import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { User } from './types';
import MainLayout from './components/layout/MainLayout';
import AuthPage from './pages/auth/AuthPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import { ApiDetailPage, CreateApiPage, EditApiPage } from './pages/apis';
import GroupManagementPage from './pages/groups/GroupManagementPage';
import CreateGroupPage from './pages/groups/CreateGroupPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';

// 登录后的主应用组件
const MainApp: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 登录后检查当前路径，如果是根路径或不存在的路径，跳转到dashboard
    if (location.pathname === '/' || location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <MainLayout user={user} onLogout={onLogout}>
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
        <Route path="/projects/:projectId/apis/:apiId/edit" element={<EditApiPage user={user} />} />
        
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
  );
};

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
    // 清除可能存在的路径状态，确保跳转到dashboard
    window.history.replaceState(null, '', '/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // 登出时清除路径状态
    window.history.replaceState(null, '', '/');
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
      <Router>
        {!user ? (
          // 未登录状态 - 显示登录页面
          <AuthPage onLogin={handleLogin} />
        ) : (
          // 已登录状态 - 显示主应用
          <MainApp user={user} onLogout={handleLogout} />
        )}
      </Router>
    </ConfigProvider>
  );
};

export default App;