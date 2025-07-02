import React from 'react';
import { Card, Table } from 'antd';
import {
  ProjectOutlined,
  ApiOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { 
  PageHeader, 
  StatisticsCards, 
  SearchAndFilterBar, 
  LoadingState,
  getProjectColumns,
  getProjectStats,
  QuickActions,
  PermissionInfo,
  PermissionChecker
} from '../../components/common';

interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const permissions = new PermissionChecker(user);
  
  // 模拟项目数据
  const projects = [
    {
      id: '1',
      name: '用户管理系统API',
      description: '提供用户注册、登录、个人信息管理等功能的API接口',
      groupId: '1',
      group: {
        id: '1',
        name: '前端开发组',
        description: '负责前端相关项目开发',
        ownerId: '1',
        owner: {} as User,
        members: [],
        projectCount: 3,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      isPublic: true,
      apiCount: 15,
      tags: ['用户管理', '认证'],
      version: 'v1.0.0',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: '订单系统API',
      description: '电商平台订单管理相关接口',
      groupId: '2',
      group: {
        id: '2',
        name: '后端开发组',
        description: '负责后端服务开发',
        ownerId: '2',
        owner: {} as User,
        members: [],
        projectCount: 5,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      isPublic: true,
      apiCount: 28,
      tags: ['订单', '支付'],
      version: 'v2.1.0',
      status: 'active',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-15'
    }
  ];

  // 模拟群组数据
  const userGroups = [
    {
      id: '1',
      name: '前端开发组',
      description: '负责前端相关项目开发',
      ownerId: user.id,
      owner: user,
      members: [],
      projectCount: 3,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];
  
  // 获取用户拥有的群组
  const ownedGroups = permissions.getOwnedGroups(userGroups);
  
  // 表格列配置
  const columns = getProjectColumns(user, (id) => navigate(`/projects/${id}`));

  // 统计数据
  const projectStats = getProjectStats(projects);
  const statisticsData = [
    {
      title: '总专案数',
      value: projectStats.totalProjects,
      prefix: <ProjectOutlined />,
      color: '#1890ff'
    },
    {
      title: '总接口数',
      value: projectStats.totalApis,
      prefix: <ApiOutlined />,
      color: '#52c41a'
    },
    {
      title: '活跃专案',
      value: projectStats.activeProjects,
      prefix: <ProjectOutlined />,
      color: '#faad14'
    },
    {
      title: '我的群组',
      value: userGroups.length,
      prefix: <TeamOutlined />,
      color: '#722ed1'
    }
  ];

  // 快捷操作处理函数
  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleCreateGroup = () => {
    navigate('/groups/create');
  };

  return (
    <LoadingState loading={false} empty={projects.length === 0}>
      <div>
        <PageHeader
          title="专案总览"
          subtitle="查看和管理平台上的所有专案"
        />

        {/* 统计卡片 */}
        <StatisticsCards data={statisticsData} />

        {/* 快捷操作区域 */}
        <QuickActions
          user={user}
          ownedGroups={ownedGroups}
          userGroups={userGroups}
          onCreateGroup={handleCreateGroup}
          onCreateProject={handleCreateProject}
        />

        {/* 专案列表 */}
        <Card>
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* 权限说明 */}
        <PermissionInfo
          user={user}
          userGroups={userGroups}
          ownedGroups={ownedGroups}
        />
      </div>
    </LoadingState>
  );
};

export default DashboardPage;
