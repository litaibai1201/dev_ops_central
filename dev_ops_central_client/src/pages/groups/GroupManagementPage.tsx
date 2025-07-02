import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  message,
  Tabs,
  Badge,
  Avatar,
  Tag
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Group, User, JoinRequest, GroupMember } from '../../types';
import {
  PageHeader,
  SearchAndFilterBar,
  StatusTag,
  ModalForm,
  groupFormFields,
  LoadingState,
  UserDisplay,
  TableActions,
  createViewAction,
  createEditAction,
  createDeleteAction,
  PermissionChecker
} from '../../components/common';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import type { ColumnsType } from 'antd/es/table';

interface GroupManagementPageProps {
  user: User;
}

const GroupManagementPage: React.FC<GroupManagementPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-groups');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchText, setSearchText] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const permissions = new PermissionChecker(user);

  // 模拟群组数据
  const groups: Group[] = [
    {
      id: '1',
      name: '前端开发组',
      description: '负责前端项目开发和维护',
      ownerId: user.id,
      owner: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      members: [
        {
          id: '1',
          userId: user.id,
          groupId: '1',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
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
          groupId: '1',
          user: {
            id: '2',
            username: 'developer1',
            email: 'dev1@company.com',
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
      projectCount: 3,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: '后端开发组',
      description: '负责后端 API 开发和数据库设计',
      ownerId: '3',
      owner: {
        id: '3',
        username: 'backend_leader',
        email: 'backend@company.com',
        role: 'user',
        createdAt: '2024-01-03',
        updatedAt: '2024-01-03'
      },
      members: [
        {
          id: '3',
          userId: '3',
          groupId: '2',
          user: {
            id: '3',
            username: 'backend_leader',
            email: 'backend@company.com',
            role: 'user',
            createdAt: '2024-01-03',
            updatedAt: '2024-01-03'
          },
          role: 'admin',
          permissions: {
            canApproveMembers: true,
            canEditProject: true,
            canManageMembers: true
          },
          joinedAt: '2024-01-03'
        },
        {
          id: '4',
          userId: user.id,
          groupId: '2',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          role: 'member',
          permissions: {
            canApproveMembers: false,
            canEditProject: false,
            canManageMembers: false
          },
          joinedAt: '2024-01-05'
        }
      ],
      projectCount: 2,
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03'
    }
  ];

  // 模拟加入请求数据
  const joinRequests: JoinRequest[] = [
    {
      id: '1',
      userId: '4',
      groupId: '1',
      user: {
        id: '4',
        username: 'new_developer',
        email: 'newdev@company.com',
        role: 'user',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      group: groups[0],
      message: '希望加入前端开发组，有3年React开发经验',
      status: 'pending',
      createdAt: '2024-01-10'
    }
  ];

  // 过滤群组数据
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchText.toLowerCase()) ||
    group.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // 根据用户角色过滤群组
  const myGroups = user.role === 'system_admin' ? 
    filteredGroups : 
    filteredGroups.filter(group => 
      group.ownerId === user.id || 
      group.members.some(member => member.userId === user.id)
    );

  // 群组表格列配置
  const groupColumns: ColumnsType<Group> = [
    {
      title: '群组信息',
      key: 'info',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <Avatar 
              size="large" 
              icon={<TeamOutlined />} 
              style={{ marginRight: 12, backgroundColor: '#1890ff' }}
            />
            <div>
              <div 
                style={{ 
                  fontWeight: 500, 
                  fontSize: 16,
                  cursor: 'pointer',
                  color: '#1890ff'
                }}
                onClick={() => navigate(`/groups/${record.id}`)}
                title="点击查看群组详情"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#40a9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1890ff';
                }}
              >
                {record.name}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>{record.description}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '群主',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner: User) => (
        <UserDisplay 
          username={owner.username}
          email={owner.email}
          showCrown={true}
        />
      ),
    },
    {
      title: '成员数量',
      dataIndex: 'members',
      key: 'memberCount',
      render: (members: GroupMember[]) => (
        <Badge count={members.length} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: '专案数量',
      dataIndex: 'projectCount',
      key: 'projectCount',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const actions = [];
        
        // 查看权限
        if (permissions.canViewGroup(record)) {
          actions.push(
            createViewAction(() => navigate(`/groups/${record.id}`))
          );
        }
        
        // 编辑权限
        if (permissions.canEditGroup(record)) {
          actions.push(
            createEditAction(() => {
              setSelectedGroup(record);
              setEditModalVisible(true);
            })
          );
        }
        
        // 删除权限
        if (permissions.canDeleteGroup(record)) {
          actions.push(
            createDeleteAction(() => handleDeleteGroup(), record.name)
          );
        }

        return <TableActions actions={actions} />;
      },
    },
  ];

  // 加入请求表格列配置
  const requestColumns: ColumnsType<JoinRequest> = [
    {
      title: '申请人',
      dataIndex: 'user',
      key: 'user',
      render: (user: User) => (
        <UserDisplay 
          username={user.username}
          email={user.email}
        />
      ),
    },
    {
      title: '申请群组',
      dataIndex: 'group',
      key: 'group',
      render: (group: Group) => group.name,
    },
    {
      title: '申请理由',
      dataIndex: 'message',
      key: 'message',
      render: (message: string) => (
        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={message}>
          {message}
        </div>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => {
        if (record.status !== 'pending') return null;
        
        const canApprove = permissions.canApproveMembers(record.group);

        if (!canApprove) return null;

        const actions = [
          { key: 'approve', label: '通过', type: 'primary' as const, onClick: () => handleApproveRequest(record.id, true) },
          { key: 'reject', label: '拒绝', onClick: () => handleApproveRequest(record.id, false) }
        ];

        return <TableActions actions={actions} />;
      },
    },
  ];

  // 处理群组创建
  const handleCreateGroup = async () => {
    setCreateModalVisible(false);
    message.success('群组创建成功');
  };

  // 处理群组编辑
  const handleEditGroup = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('群组更新成功');
      setEditModalVisible(false);
      setSelectedGroup(null);
    } catch (error) {
      message.error('更新群组失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理群组删除
  const handleDeleteGroup = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('群组删除成功');
    } catch (error) {
      message.error('删除群组失败');
    }
  };

  // 处理申请审批
  const handleApproveRequest = async (requestId: string, approved: boolean) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success(approved ? '申请已批准' : '申请已拒绝');
    } catch (error) {
      message.error('处理申请失败');
    }
  };

  const tabItems = [
    {
      key: 'my-groups',
      label: (
        <span>
          <TeamOutlined />
          我的群组
        </span>
      ),
      children: (
        <div>
          <SearchAndFilterBar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="搜索群组名称或描述..."
            showCreateButton={true}
            createButtonText="创建群组"
            createButtonIcon={<PlusOutlined />}
            onCreateClick={() => setCreateModalVisible(true)}
          />
          <Table
            columns={groupColumns}
            dataSource={myGroups}
            rowKey="id"
            loading={false}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
          />
        </div>
      ),
    },
    {
      key: 'join-requests',
      label: (
        <span>
          <UserAddOutlined />
          入组申请
          {joinRequests.filter(req => req.status === 'pending').length > 0 && (
            <Badge 
              count={joinRequests.filter(req => req.status === 'pending').length} 
              style={{ marginLeft: 8 }} 
            />
          )}
        </span>
      ),
      children: (
        <Table
          columns={requestColumns}
          dataSource={joinRequests}
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

  return (
    <LoadingState loading={false} empty={groups.length === 0}>
      <div>
        <PageHeader
          title="群组管理"
          subtitle="管理和组织您的开发团队"
        />

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Card>

        {/* 创建群组模态框 */}
        <CreateGroupModal
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={handleCreateGroup}
          currentUser={user}
        />

        {/* 编辑群组模态框 */}
        <ModalForm
          title="编辑群组"
          visible={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedGroup(null);
          }}
          onFinish={handleEditGroup}
          fields={groupFormFields}
          initialValues={selectedGroup}
          okText="更新"
          loading={loading}
        />
      </div>
    </LoadingState>
  );
};

export default GroupManagementPage;
