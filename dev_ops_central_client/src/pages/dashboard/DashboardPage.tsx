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
  EditOutlined,
  PlusOutlined,
  FolderAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Project, User, Group } from '../../types';
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
import { groupService } from '../../services/group';

interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [ownedGroups, setOwnedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchUserGroups();
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
          isPublic: false,
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

  const fetchUserGroups = async () => {
    try {
      // 获取用户的群组列表
      const response = await groupService.getUserGroups(user.id);
      if (response.success) {
        setUserGroups(response.data);
        // 筛选出用户作为群主的群组
        const owned = response.data.filter(group => group.ownerId === user.id);
        setOwnedGroups(owned);
      }
    } catch (error) {
      console.error('获取用户群组失败:', error);
      // 使用模拟数据作为后备
      const mockGroups: Group[] = [
        {
          id: '1',
          name: '前端开发组',
          description: '负责前端相关项目开发',
          ownerId: user.id, // 假设当前用户是群主
          owner: user,
          members: [],
          projectCount: 3,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '2',
          name: '后端开发组',
          description: '负责后端服务开发',
          ownerId: 'other-user-id',
          owner: {} as User,
          members: [],
          projectCount: 5,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];
      setUserGroups(mockGroups);
      const owned = mockGroups.filter(group => group.ownerId === user.id);
      setOwnedGroups(owned);
    }
  };

  // 快捷操作处理函数
  const handleCreateProject = () => {
    // TODO: 打开创建专案模态框或跳转到创建页面
    console.log('创建专案');
  };

  const handleCreateGroup = () => {
    // TODO: 打开创建群组模态框或跳转到创建页面
    console.log('创建群组');
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
    myGroups: userGroups.length,
    ownedGroups: ownedGroups.length
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
      title: '我的群组',
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

        if (user.role === 'system_admin') {
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

        {/* 快捷操作区域 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusOutlined style={{ color: '#1890ff' }} />
              <span>快捷操作</span>
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          <Space size="large" wrap>
            {/* 创建群组按钮 - 所有用户都可以创建 */}
            <Tooltip title="创建新的团队群组，邀请成员协作开发">
              <Button 
                type="primary"
                icon={<TeamOutlined />}
                size="large"
                onClick={handleCreateGroup}
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  padding: '0 24px',
                  fontWeight: 500,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                创建群组
              </Button>
            </Tooltip>
            
            {/* 创建专案按钮 - 只有群主才能创建 */}
            {ownedGroups.length > 0 ? (
              <Tooltip title={`在你管理的 ${ownedGroups.length} 个群组中创建新专案`}>
                <Button 
                  type="primary"
                  icon={<FolderAddOutlined />}
                  size="large"
                  onClick={handleCreateProject}
                  style={{
                    borderRadius: '8px',
                    height: '48px',
                    padding: '0 24px',
                    fontWeight: 500,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)'
                  }}
                >
                  创建专案
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="你需要先成为群组的群主才能创建专案。可以创建新群组或联系现有群组的群主转移所有权。">
                <Button 
                  icon={<FolderAddOutlined />}
                  size="large"
                  disabled
                  style={{
                    borderRadius: '8px',
                    height: '48px',
                    padding: '0 24px',
                    fontWeight: 500
                  }}
                >
                  创建专案
                </Button>
              </Tooltip>
            )}
            
            {/* 状态说明 */}
            <div style={{
              padding: '12px 16px',
              background: ownedGroups.length > 0 ? '#f6ffed' : '#fff2e8',
              border: `1px solid ${ownedGroups.length > 0 ? '#b7eb8f' : '#ffd591'}`,
              borderRadius: '8px',
              fontSize: '14px',
              color: ownedGroups.length > 0 ? '#52c41a' : '#fa8c16'
            }}>
              {ownedGroups.length > 0 ? (
                <>
                  <strong>✓ 您是 {ownedGroups.length} 个群组的群主</strong>
                  <br />
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    群组：{ownedGroups.map(g => g.name).join('、')}
                  </span>
                </>
              ) : (
                <>
                  <strong>⚠ 暂无群组管理权限</strong>
                  <br />
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    需要成为群主才能创建专案
                  </span>
                </>
              )}
            </div>
          </Space>
        </Card>

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
                  当前身份：{user.role === 'system_admin' ? '系统管理员' : '普通用户'}
                </h4>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#1c5aa0' }}>
                    参与群组：{stats.myGroups} 个 | 管理群组：{stats.ownedGroups} 个
                  </span>
                </div>
                <ul style={{ fontSize: '14px', color: '#1c5aa0', lineHeight: '1.6', paddingLeft: '16px' }}>
                  <li>• 可以查看所有公开专案的基本信息</li>
                  <li>• 可以创建群组并邀请成员加入</li>
                  {ownedGroups.length > 0 && (
                    <li>• 作为群主可以在管理的群组中创建专案</li>
                  )}
                  {user.role === 'system_admin' && (
                    <>
                      <li>• 拥有系统最高管理权限</li>
                      <li>• 可以管理所有用户和群组</li>
                    </>
                  )}
                </ul>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ padding: '16px', backgroundColor: '#f6ffed', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 500, color: '#389e0d', marginBottom: '8px' }}>权限说明</h4>
                <ul style={{ fontSize: '14px', color: '#52c41a', lineHeight: '1.6', paddingLeft: '16px' }}>
                  <li>• <strong>创建群组</strong>：所有用户都可以创建群组</li>
                  <li>• <strong>创建专案</strong>：仅群主可以在其群组中创建专案</li>
                  <li>• <strong>群主权限</strong>：管理群组成员、分配角色、创建专案</li>
                  <li>• <strong>专案管理员</strong>：在具体专案中的管理权限</li>
                  <li>• <strong>角色相对性</strong>：同一用户可以是多个群组的成员，某些群组的群主</li>
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