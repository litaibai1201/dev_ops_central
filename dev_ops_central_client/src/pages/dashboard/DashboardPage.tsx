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
  LoadingState,
  getProjectColumns,
  getProjectStats,
  QuickActions,
  PermissionInfo,
  PermissionChecker
} from '../../components/common';
import { useProjectData, useGroupData, useUserStats } from '../../components/common/DataService';

interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const permissions = new PermissionChecker(user);
  
  // 使用真实的API数据
  const { data: projects, loading: projectsLoading, error: projectsError } = useProjectData(user);
  const { data: userGroups, loading: groupsLoading, error: groupsError } = useGroupData(user);
  const { data: userStats, loading: statsLoading } = useUserStats(user.id);
  
  // 综合加载状态
  const loading = projectsLoading || groupsLoading || statsLoading;
  
  // 获取用户拥有的群组
  const ownedGroups = userGroups ? permissions.getOwnedGroups(userGroups) : [];
  
  // 表格列配置
  const columns = getProjectColumns(user, (id) => navigate(`/projects/${id}`));

  // 统计数据
  const projectStats = projects ? getProjectStats(projects) : { 
    totalProjects: 0, 
    totalApis: 0, 
    activeProjects: 0 
  };
  
  const statisticsData = [
    {
      title: '总专案数',
      value: userStats?.projectCount || projectStats.totalProjects,
      prefix: <ProjectOutlined />,
      color: '#1890ff'
    },
    {
      title: '总接口数',
      value: userStats?.apiCount || projectStats.totalApis,
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
      value: userStats?.groupCount || (userGroups?.length || 0),
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

  // 错误处理
  if (projectsError || groupsError) {
    return (
      <div>
        <PageHeader
          title="专案总览"
          subtitle="查看和管理平台上的所有专案"
        />
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#ff4d4f' }}>
              {projectsError || groupsError}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <LoadingState loading={loading} empty={!projects || projects.length === 0}>
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
          userGroups={userGroups || []}
          onCreateGroup={handleCreateGroup}
          onCreateProject={handleCreateProject}
        />

        {/* 专案列表 */}
        <Card>
          <Table
            columns={columns}
            dataSource={projects || []}
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
          userGroups={userGroups || []}
          ownedGroups={ownedGroups}
        />
      </div>
    </LoadingState>
  );
};

export default DashboardPage;
