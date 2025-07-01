import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Button,
  Space,
  Tooltip
} from 'antd';
import {
  ProjectOutlined,
  ApiOutlined,
  TeamOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Project, User } from '../../types';
import type { ColumnsType } from 'antd/es/table';
import { 
  StatisticsCards, 
  PageHeader, 
  SearchAndFilterBar, 
  StatusTag, 
  UserDisplay,
  TableActions,
  createViewAction,
  createEditAction,
  LoadingState
} from '../../components/common';


interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProjects: Project[] = [
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
          isPublic: true, // 公开项目
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
          isPublic: true, // 公开项目
          apiCount: 28,
          tags: ['订单', '支付'],
          version: 'v2.1.0',
          status: 'active',
          createdAt: '2024-02-01',
          updatedAt: '2024-02-15'
        },
        {
          id: '3',
          name: '内部工具API',
          description: '公司内部使用的工具类接口',
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
          isPublic: false, // 私密项目
          apiCount: 8,
          tags: ['内部工具'],
          version: 'v1.2.0',
          status: 'active',
          createdAt: '2024-03-01',
          updatedAt: '2024-03-10'
        }
      ];
      
      setProjects(mockProjects);
    } catch (error) {
      console.error('获取专案数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchText.toLowerCase()) ||
    project.description.toLowerCase().includes(searchText.toLowerCase()) ||
    project.group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const stats = {
    totalProjects: projects.length,
    totalApis: projects.reduce((sum, project) => sum + project.apiCount, 0),
    activeProjects: projects.filter(p => p.status === 'active').length,
    myGroups: user.role === 'group_owner' ? 3 : user.role === 'project_admin' ? 1 : 0
  };

  const statisticsData = [
    {
      title: '总专案数',
      value: stats.totalProjects,
      prefix: <ProjectOutlined />,
      color: '#1890ff'
    },
    {
      title: '总接口数',
      value: stats.totalApis,
      prefix: <ApiOutlined />,
      color: '#52c41a'
    },
    {
      title: '活跃专案',
      value: stats.activeProjects,
      prefix: <ProjectOutlined />,
      color: '#faad14'
    },
    {
      title: user.role === 'group_owner' ? '管理群组' : user.role === 'project_admin' ? '参与群组' : '可访问群组',
      value: stats.myGroups,
      prefix: <TeamOutlined />,
      color: '#722ed1'
    }
  ];

  const columns: ColumnsType<Project> = [
    {
      title: '专案名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div 
            style={{
              fontWeight: 500,
              color: '#1890ff',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#40a9ff';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#1890ff';
              e.currentTarget.style.textDecoration = 'none';
            }}
            onClick={() => navigate(`/projects/${record.id}`)}
            title="点击查看专案详情"
          >
            {text}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#999', 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '300px'
          }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: '所属群组',
      dataIndex: 'group',
      key: 'group',
      render: (group) => (
        <UserDisplay 
          username={group.name}
          avatarSize="small"
          showEmail={false}
        />
      ),
    },
    {
      title: '接口数量',
      dataIndex: 'apiCount',
      key: 'apiCount',
      sorter: (a, b) => a.apiCount - b.apiCount,
      render: (count) => (
        <span style={{ fontWeight: 500 }}>{count} 个</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '活跃', value: 'active' },
        { text: '暂停', value: 'inactive' },
        { text: '已归档', value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div>
          {tags.map(tag => (
            <StatusTag key={tag} status={tag} statusMap={{[tag]: { color: 'blue', text: tag }}} size="small" />
          ))}
        </div>
      ),
    },
    {
      title: '可见性',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic) => (
        <StatusTag status={isPublic ? 'public' : 'private'} />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => {
        const actions = [
          createViewAction(() => navigate(`/projects/${record.id}`))
        ];

        if (user.role === 'project_admin' || user.role === 'group_owner' || user.role === 'system_admin') {
          actions.push(createEditAction(() => navigate(`/projects/${record.id}/edit`)));
        }

        return <TableActions actions={actions} />;
      },
    },
  ];

  return (
    <LoadingState loading={loading} empty={projects.length === 0}>
      <div>
        <PageHeader
          title="专案总览"
          subtitle="查看和管理平台上的所有专案"
        />

        {/* 统计卡片 */}
        <StatisticsCards data={statisticsData} />



        {/* 专案列表 */}
        <Card>
          <SearchAndFilterBar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="搜索专案、描述或群组..."
          />
          
          <Table
            columns={columns}
            dataSource={filteredProjects}
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
        <Card style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>权限说明</h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div style={{ padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 500, color: '#1c4e80', marginBottom: '8px' }}>
                  当前角色：{
                    user.role === 'user' ? '普通用户' : 
                    user.role === 'project_admin' ? '专案管理员' : 
                    user.role === 'group_owner' ? '群主' : '系统管理员'
                  }
                </h4>
                <ul style={{ fontSize: '14px', color: '#1c5aa0', lineHeight: '1.6', paddingLeft: '16px' }}>
                  {user.role === 'user' && (
                    <>
                      <li>• 可以查看所有公开专案的接口信息</li>
                      <li>• 可以测试接口但不能修改</li>
                      <li>• 可以申请加入群组</li>
                    </>
                  )}
                  {user.role === 'project_admin' && (
                    <>
                      <li>• 可以编辑所管理专案的信息</li>
                      <li>• 可以管理专案内的接口</li>
                      <li>• 可能具有审批群组申请的权限</li>
                    </>
                  )}
                  {user.role === 'group_owner' && (
                    <>
                      <li>• 拥有群组的完整管理权限</li>
                      <li>• 可以创建和管理专案</li>
                      <li>• 可以分配群组内的角色和权限</li>
                    </>
                  )}
                  {user.role === 'system_admin' && (
                    <>
                      <li>• 拥有系统最高管理权限</li>
                      <li>• 可以管理所有用户和群组</li>
                      <li>• 可以进行系统配置</li>
                    </>
                  )}
                </ul>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ padding: '16px', backgroundColor: '#f6ffed', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 500, color: '#389e0d', marginBottom: '8px' }}>平台特色</h4>
                <ul style={{ fontSize: '14px', color: '#52c41a', lineHeight: '1.6', paddingLeft: '16px' }}>
                  <li>• 专案基本信息对外公开</li>
                  <li>• 接口详情仅群组成员可见</li>
                  <li>• 完善的权限管理体系</li>
                  <li>• 实时的接口测试功能</li>
                  <li>• 团队协作与版本管理</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </LoadingState>
  );
};

export default DashboardPage;