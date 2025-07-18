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
  UserDisplay,
  TableActions,
  createViewAction,
  createEditAction,
  createDeleteAction,
  PermissionChecker
} from '../../components/common';
import { useGroupData, useJoinRequestData, useOperations } from '../../components/common/DataService';
import { groupService } from '../../services/group';
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

  const permissions = new PermissionChecker(user);
  
  // 使用真实的API数据
  const { data: groups, loading: groupsLoading, error: groupsError, refetch: refetchGroups } = useGroupData(user);
  const { data: joinRequests, loading: requestsLoading, error: requestsError, refetch: refetchRequests } = useJoinRequestData();
  const { loading: operationLoading, executeOperation } = useOperations();

  // 过滤群组数据
  const filteredGroups = groups?.filter(group =>
    group.name.toLowerCase().includes(searchText.toLowerCase()) ||
    group.description.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  // 根据用户角色过滤群组
  const myGroups = user.role === 'system_admin' ? 
    filteredGroups : 
    filteredGroups.filter(group => 
      group.ownerId === user.id || 
      group.members?.some(member => member.userId === user.id)
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
        <Badge count={members?.length || 0} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: '专案数量',
      dataIndex: 'projectCount',
      key: 'projectCount',
      render: (count: number) => (
        <Badge count={count || 0} showZero style={{ backgroundColor: '#1890ff' }} />
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
            createDeleteAction(() => handleDeleteGroup(record), record.name)
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
    try {
      console.log('Group creation successful, refreshing data...');
      setCreateModalVisible(false);
      await refetchGroups();
      console.log('Group data refreshed');
    } catch (error) {
      console.error('Error refreshing groups after creation:', error);
      message.error('刷新群组数据失败');
    }
  };

  // 处理群组编辑
  const handleEditGroup = async (values: any) => {
    if (!selectedGroup) return;

    await executeOperation(
      async () => {
        const response = await groupService.updateGroup(selectedGroup.id, {
          name: values.name,
          description: values.description
        });

        if (!response.success) {
          throw new Error(response.message || '更新群组失败');
        }

        setEditModalVisible(false);
        setSelectedGroup(null);
        await refetchGroups();
      },
      '群组更新成功',
      '更新群组失败'
    );
  };

  // 处理群组删除
  const handleDeleteGroup = async (group: Group) => {
    await executeOperation(
      async () => {
        const response = await groupService.deleteGroup(group.id);

        if (!response.success) {
          throw new Error(response.message || '删除群组失败');
        }

        await refetchGroups();
      },
      '群组删除成功',
      '删除群组失败'
    );
  };

  // 处理申请审批
  const handleApproveRequest = async (requestId: string, approved: boolean) => {
    await executeOperation(
      async () => {
        const response = await groupService.handleJoinRequest(requestId, {
          action: approved ? 'approve' : 'reject',
          reviewMessage: approved ? '申请已通过' : '申请被拒绝'
        });

        if (!response.success) {
          throw new Error(response.message || '处理申请失败');
        }

        await refetchRequests();
        if (approved) {
          await refetchGroups(); // 如果通过申请，需要刷新群组数据以更新成员数量
        }
      },
      approved ? '申请已批准' : '申请已拒绝',
      '处理申请失败'
    );
  };

  // 错误处理
  if (groupsError) {
    return (
      <div>
        <PageHeader
          title="群组管理"
          subtitle="管理和组织您的开发团队"
        />
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#ff4d4f' }}>
              {groupsError}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 对于加入请求错误，只显示警告但不阻止页面渲染
  if (requestsError) {
    console.warn('加入请求数据加载失败:', requestsError);
  }

  const pendingRequestsCount = joinRequests?.filter(req => req.status === 'pending').length || 0;

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
            loading={groupsLoading}
            locale={{
              emptyText: groupsError ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ color: '#ff4d4f', marginBottom: '8px' }}>\u52a0\u8f7d\u5931\u8d25</p>
                  <p style={{ color: '#666', fontSize: '14px' }}>{groupsError}</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ color: '#666' }}>暂无群组数据</p>
                  <p style={{ color: '#999', fontSize: '14px' }}>点击上方“创建群组”按钮来创建您的第一个群组</p>
                </div>
              )
            }}
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
          {pendingRequestsCount > 0 && (
            <Badge 
              count={pendingRequestsCount} 
              style={{ marginLeft: 8 }} 
            />
          )}
        </span>
      ),
      children: (
        <Table
          columns={requestColumns}
          dataSource={joinRequests || []}
          rowKey="id"
          loading={requestsLoading}
          locale={{
            emptyText: requestsError ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#ff4d4f', marginBottom: '8px' }}>加载失败</p>
                <p style={{ color: '#666', fontSize: '14px' }}>{requestsError}</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#666' }}>暂无入组申请</p>
                <p style={{ color: '#999', fontSize: '14px' }}>当有用户申请加入您管理的群组时，将在此处显示</p>
              </div>
            )
          }}
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
        loading={operationLoading}
      />
    </div>
  );
};

export default GroupManagementPage;
