import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined, ApiOutlined, ProjectOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePageContext } from './PageContext';

interface PageBreadcrumbItem {
  title: string | React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface PageBreadcrumbProps {
  items?: PageBreadcrumbItem[];
  style?: React.CSSProperties;
  className?: string;
}

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  items,
  style,
  className
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { apiName, groupName } = usePageContext();

  // 如果没有传入 items，根据当前路径自动生成
  const generateBreadcrumbItems = (): PageBreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems: PageBreadcrumbItem[] = [
      {
        title: (
          <span>
            <HomeOutlined />
            <span style={{ marginLeft: '4px' }}>首页</span>
          </span>
        ),
        href: '/dashboard'
      }
    ];

    if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
      return breadcrumbItems;
    }

    // 根据路径生成面包屑
    if (pathSegments[0] === 'projects') {
      if (pathSegments.length === 1) {
        breadcrumbItems.push({
          title: (
            <span>
              <ProjectOutlined style={{ marginRight: '4px' }} />
              专案管理
            </span>
          )
        });
      } else if (pathSegments.length >= 2) {
        breadcrumbItems.push({
          title: '专案详情',
          href: `/projects/${pathSegments[1]}`
        });
        
        if (pathSegments.length >= 4 && pathSegments[2] === 'apis') {
          breadcrumbItems.push({
            title: (
              <span>
                <ApiOutlined style={{ marginRight: '4px' }} />
                {apiName || '接口详情'}
              </span>
            )
          });
        }
      }
    } else if (pathSegments[0] === 'groups') {
      if (pathSegments.length === 1) {
        breadcrumbItems.push({
          title: (
            <span>
              <TeamOutlined style={{ marginRight: '4px' }} />
              群组管理
            </span>
          )
        });
      } else if (pathSegments.length >= 2) {
        breadcrumbItems.push({
          title: '群组管理',
          href: '/groups'
        });
        // 群组详情页面，显示群组名称
        breadcrumbItems.push({
          title: groupName || '群组详情'
        });
      }
    } else if (pathSegments[0] === 'users') {
      breadcrumbItems.push({
        title: (
          <span>
            <UserOutlined style={{ marginRight: '4px' }} />
            用户管理
          </span>
        )
      });
    }

    return breadcrumbItems;
  };

  const finalItems = items || generateBreadcrumbItems();

  const breadcrumbItems = finalItems.map((item, index) => ({
    title: item.title,
    href: item.href,
    onClick: item.onClick || (item.href ? () => navigate(item.href!) : undefined)
  }));

  return (
    <div 
      style={{ 
        padding: '8px 0',
        fontSize: '14px',
        ...style
      }}
      className={className}
    >
      <Breadcrumb
        items={breadcrumbItems}
        separator="/"
      />
    </div>
  );
};

export default PageBreadcrumb;
