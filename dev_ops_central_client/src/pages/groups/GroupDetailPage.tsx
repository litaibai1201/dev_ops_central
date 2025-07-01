import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tabs,
  Space,
  Avatar,
  Tag,
  Button,
  message,
  Descriptions,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  CrownOutlined,
  SettingOutlined,
  UserAddOutlined,
  ApiOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Group, GroupMember, Project, User } from '../../types';
import type { ColumnsType } from 'antd/es/table';
import {
  PageHeader,
  UserDisplay,
  StatusTag,
  LoadingState,
  TableActions,
  createViewAction
} from '../../components/common';
import { usePageContext } from '../../components/common/PageContext';

interface GroupDetailPageProps {
  user: User;
}

const GroupDetailPage: React.FC<GroupDetailPageProps> = ({ user }) => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { setGroupName } = usePageContext();

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  // 组件卸载时清理上下文
  useEffect(() => {
    return () => {
      setGroupName('');
    };
  }, [setGroupName]);

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟群组数据
      const mockGroup: Group = {
        id: groupId!,
        name: '前端开发组',
        description: '负责前端项目开发和维护，使用React、Vue等现代前端技术栈',
        ownerId: user.username === 'groupuser' ? user.id : '1',
        owner: {
          id: user.username === 'groupuser' ? user.id : '1',
          username: user.username === 'groupuser' ? user.username : 'group_owner',
          email: 'owner@company.com',
          role: 'user',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        members: [
          {
            id: '1',
            userId: user.username === 'groupuser' ? user.id : '1',
            groupId: groupId!,
            user: {
              id: user.username === 'groupuser' ? user.id : '1',
              username: user.username === 'groupuser' ? user.username : 'group_owner',
              email: 'owner@company.com',
              role: 'user',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01'
            },
            role: 'admin',
            permissions: {
              canApproveMembers: true,
              canEditProject: true,
              canManageMembers: true
            },
            joinedAt: '2024-01-01'
          },
          {
            id: '2',
            userId: '2',
            groupId: groupId!,
            user: {
              id: '2',
              username: 'alice',
              email: 'alice@company.com',
              role: 'user',
              createdAt: '2024-01-02',
              updatedAt: '2024-01-02'
            },
            role: 'member',
            permissions: {
              canApproveMembers: false,
              canEditProject: false,
              canManageMembers: false
            },
            joinedAt: '2024-01-02'
          }
        ],
        projectCount: 2,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      // 模拟项目数据
      const mockProjects: Project[] = [
        {
          id: '1',
          name: '用户管理系统',
          description: '企业级用户管理系统前端',
          groupId: groupId!,
          group: mockGroup,
          isPublic: true,
          apiCount: 15,
          tags: ['React', '用户管理'],
          version: 'v1.0.0',
          status: 'active',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20'
        },
        {
          id: '2',
          name: '数据可视化平台',
          description: '实时数据展示和分析平台',
          groupId: groupId!,
          group: mockGroup,
          isPublic: false,
          apiCount: 28,
          tags: ['Vue', '数据可视化'],
          version: 'v2.1.0',
          status: 'active',
          createdAt: '2024-02-01',
          updatedAt: '2024-02-15'
        }
      ];

      setGroup(mockGroup);
      setProjects(mockProjects);
      // 设置群组名称到页面上下文中，用于面包屑导航
      setGroupName(mockGroup.name);
    } catch (error) {
      message.error('获取群组详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (!group) {
    return <LoadingState loading={loading} />;
  }

  const isOwner = group.ownerId === user.id;
  const memberInfo = group.members.find(member => member.userId === user.id);
  const isMember = !!memberInfo;
  const isGroupAdmin = memberInfo?.role === 'admin';
  const isSystemAdmin = user.role === 'system_admin';

  const memberColumns: ColumnsType<GroupMember> = [
    {
      title: '成员信息',
      key: 'member',
      render: (_, record) => (
        <UserDisplay
          username={record.user.username}
          email={record.user.email}
          showEmail={true}
        />
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleConfig = {
          admin: { color: 'blue', text: '管理员' },
          member: { color: 'green', text: '普通成员' }
        };
        const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '权限',
      key: 'permissions',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.permissions.canManageMembers && <Tag size="small">管理成员</Tag>}
          {record.permissions.canEditProject && <Tag size="small">编辑专案</Tag>}
          {record.permissions.canApproveMembers && <Tag size="small">审批申请</Tag>}
        </Space>
      ),
    },
  ];

  const projectColumns: ColumnsType<Project> = [
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
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            {text}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: '接口数量',
      dataIndex: 'apiCount',
      key: 'apiCount',
      render: (count) => (
        <span style={{ fontWeight: 500 }}>{count} 个</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
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
        return <TableActions actions={actions} />;
      },
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <TeamOutlined />
          群组概览
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="群组信息" style={{ marginBottom: 24 }}>
              <Descriptions column={1}>
                <Descriptions.Item label="群组名称">{group.name}</Descriptions.Item>
                <Descriptions.Item label="群组描述">{group.description}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {(() => {
                    const date = new Date(group.createdAt);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}年${month}月${day}日`;
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="群主">
                  <UserDisplay
                    username={group.owner.username}
                    email={group.owner.email}
                    showCrown={true}
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card>
                  <Statistic
                    title="成员数量"
                    value={group.members.length}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card>
                  <Statistic
                    title="专案数量"
                    value={group.projectCount}
                    prefix={<ProjectOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      ),
    },
    {
      key: 'members',
      label: (
        <span>
          <UserOutlined />
          成员管理 ({group.members.length})
        </span>
      ),
      children: (
        <Table
          columns={memberColumns}
          dataSource={group.members}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      ),
    },
    {
      key: 'projects',
      label: (
        <span>
          <ProjectOutlined />
          专案列表 ({projects.length})
        </span>
      ),
      children: (
        <Table
          columns={projectColumns}
          dataSource={projects}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      ),
    },
  ];

  // 创建操作按钮数组
  const actionButtons = [];
  
  if (isOwner || isGroupAdmin || isSystemAdmin) {
    actionButtons.push(
      <Button
        key="settings"
        icon={<SettingOutlined />}
        onClick={() => message.info('群组设置功能开发中...')}
      >
        群组设置
      </Button>
    );
  }

  if (isOwner || isSystemAdmin) {
    actionButtons.push(
      <Button
        key="invite"
        type="primary"
        icon={<UserAddOutlined />}
        onClick={() => message.info('邀请成员功能开发中...')}
      >
        邀请成员
      </Button>
    );
  }

  return (
    <div>
      {/* 页面标题区域 - 将返回按钮移到右侧 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 24
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              margin: 0,
              marginRight: 16
            }}>
              {group.name}
            </h1>
            <Space>
              <Tag color="blue">{group.members.length} 名成员</Tag>
              <Tag color="green">{group.projectCount} 个专案</Tag>
              {isOwner && <Tag color="gold" icon={<CrownOutlined />}>群主</Tag>}
              {isGroupAdmin && !isOwner && <Tag color="blue">管理员</Tag>}
            </Space>
          </div>
          {group.description && (
            <p style={{ 
              color: '#666', 
              margin: 0,
              fontSize: '16px'
            }}>
              {group.description}
            </p>
          )}
        </div>
        
        {/* 返回按钮移到右侧 */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/groups')}
          size="large"
        >
          返回
        </Button>
      </div>

      {/* 分隔线 */}
      <div style={{
        borderTop: '1px solid #000',
        marginBottom: 24
      }} />

      {/* 直接放置 Tabs，移除 Card 包装 */}
      <Tabs
        items={tabItems}
        defaultActiveKey="overview"
        tabBarExtraContent={
          actionButtons.length > 0 ? (
            <Space>
              {actionButtons}
            </Space>
          ) : null
        }
      />
    </div>
  );
};

export default GroupDetailPage;