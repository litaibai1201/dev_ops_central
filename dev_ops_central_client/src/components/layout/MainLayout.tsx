import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  TeamOutlined,
  ApiOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '../../types';
import PageBreadcrumb from '../common/PageBreadcrumb';
import { PageProvider } from '../common/PageContext';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const getMenuItems = (): MenuProps['items'] => {
    const baseItems = [
      {
        key: '/dashboard',
        icon: <ProjectOutlined />,
        label: '专案总览',
      },
      {
        key: '/groups',
        icon: <TeamOutlined />,
        label: '群组管理',
      },
    ];

    if (user.role === 'system_admin') {
      baseItems.push(
        {
          key: '/admin',
          icon: <SettingOutlined />,
          label: '系统管理',
          children: [
            {
              key: '/admin/users',
              label: '用户管理',
            },
            {
              key: '/admin/groups',
              label: '群组管理',
            },
            {
              key: '/admin/projects',
              label: '专案管理',
            },
            {
              key: '/admin/system',
              label: '系统设置',
            },
          ],
        }
      );
    }

    return baseItems;
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setMobileMenuVisible(false);
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      user: '普通用户',
      project_admin: '专案管理员',
      group_owner: '群主',
      system_admin: '系统管理员'
    };
    return roleMap[role as keyof typeof roleMap] || '未知角色';
  };

  const siderContent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={getMenuItems()}
      onClick={handleMenuClick}
    />
  );

  const siderWidth = collapsed ? 80 : 200;

  return (
    <PageProvider>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed}
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <h2 style={{ 
                color: 'white', 
                fontSize: '18px', 
                fontWeight: 'bold',
                margin: 0
              }}>
                {collapsed ? 'API' : 'API管理平台'}
              </h2>
            </div>
            {siderContent}
          </Sider>
        )}

        {/* Mobile Drawer */}
        <Drawer
          title="API管理平台"
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          styles={{ body: { padding: 0 } }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            onClick={handleMenuClick}
          />
        </Drawer>

        <Layout style={{ marginLeft: isMobile ? 0 : siderWidth }}>
          <Header 
            style={{ 
              padding: '0 24px', 
              background: '#fff', 
              borderBottom: '1px solid #f0f0f0',
              position: 'sticky',
              top: 0,
              zIndex: 1000
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              height: '100%' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Mobile menu button */}
                {isMobile && (
                  <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setMobileMenuVisible(true)}
                  />
                )}
                {/* Desktop collapse button */}
                {!isMobile && (
                  <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                  />
                )}
                
                {/* 面包屑导航 - 桌面端显示在 Header 中 */}
                {!isMobile && (
                  <div style={{ flex: 1, maxWidth: '400px', marginLeft: '16px' }}>
                    <PageBreadcrumb style={{ padding: '0', margin: '0' }} />
                  </div>
                )}
              </div>

              <Space size="middle">
                <Badge count={5} size="small">
                  <Button 
                    type="text" 
                    icon={<BellOutlined />}
                    onClick={() => navigate('/notifications')}
                  />
                </Badge>
                
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Space style={{ 
                    cursor: 'pointer', 
                    padding: '4px 8px', 
                    borderRadius: '4px'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />} 
                      src={user.avatar}
                    />
                    {!isMobile && (
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>
                          {user.username}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {getRoleDisplayName(user.role)}
                        </div>
                      </div>
                    )}
                  </Space>
                </Dropdown>
              </Space>
            </div>
          </Header>

          <Content
            style={{
              margin: '0',
              padding: 0,
              minHeight: 280,
              background: '#f5f5f5',
            }}
          >
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
            
            {/* 页面内容区域 */}
            <div style={{
              padding: '24px',
              background: '#fff',
              margin: '24px',
              borderRadius: '8px',
              minHeight: 'calc(100vh - 112px)'
            }}>
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </PageProvider>
  );
};

export default MainLayout;