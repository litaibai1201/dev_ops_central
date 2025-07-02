import React from 'react';
import { Project, Group, User, GroupMember, JoinRequest } from '../../types';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Tag, Avatar } from 'antd';
import { TeamOutlined, CrownOutlined, UserOutlined } from '@ant-design/icons';
import UserDisplay from './UserDisplay';
import StatusTag from './StatusTag';
import TableActions, { createViewAction, createEditAction, createDeleteAction } from './TableActions';
import { PermissionChecker } from './PermissionUtils';

// 项目表格列配置
export const getProjectColumns = (
  user: User,
  onView: (id: string) => void,
  onEdit?: (id: string) => void
): ColumnsType<Project> => {
  const permissions = new PermissionChecker(user);

  return [
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
            onClick={() => onView(record.id)}
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
          createViewAction(() => onView(record.id))
        ];

        if (permissions.isSystemAdmin() && onEdit) {
          actions.push(createEditAction(() => onEdit(record.id)));
        }

        return <TableActions actions={actions} />;
      },
    },
  ];
};

// Hook版本的项目表格列配置
export const useProjectColumns = (
  user: User,
  onView: (id: string) => void,
  onEdit?: (id: string) => void
): ColumnsType<Project> => {
  return React.useMemo(() => getProjectColumns(user, onView, onEdit), [user, onView, onEdit]);
};

// 群组表格列配置
export const getGroupColumns = (
  user: User,
  onView: (id: string) => void,
  onEdit?: (group: Group) => void,
  onDelete?: () => void
): ColumnsType<Group> => {
  const permissions = new PermissionChecker(user);

  return [
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
                onClick={() => onView(record.id)}
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
            createViewAction(() => onView(record.id))
          );
        }
        
        // 编辑权限
        if (permissions.canEditGroup(record) && onEdit) {
          actions.push(
            createEditAction(() => onEdit(record))
          );
        }
        
        // 删除权限
        if (permissions.canDeleteGroup(record) && onDelete) {
          actions.push(
            createDeleteAction(onDelete, record.name)
          );
        }

        return <TableActions actions={actions} />;
      },
    },
  ];
};

// Hook版本的群组表格列配置
export const useGroupColumns = (
  user: User,
  onView: (id: string) => void,
  onEdit?: (group: Group) => void,
  onDelete?: () => void
): ColumnsType<Group> => {
  return React.useMemo(() => getGroupColumns(user, onView, onEdit, onDelete), [user, onView, onEdit, onDelete]);
};

// 群组成员表格列配置
export const getGroupMemberColumns = (
  user: User
): ColumnsType<GroupMember> => {
  return [
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {record.permissions.canManageMembers && <Tag size="small">管理成员</Tag>}
          {record.permissions.canEditProject && <Tag size="small">编辑专案</Tag>}
          {record.permissions.canApproveMembers && <Tag size="small">审批申请</Tag>}
        </div>
      ),
    },
  ];
};

// Hook版本的群组成员表格列配置
export const useGroupMemberColumns = (
  user: User
): ColumnsType<GroupMember> => {
  return React.useMemo(() => getGroupMemberColumns(user), [user]);
};

// 加入请求表格列配置
export const getJoinRequestColumns = (
  user: User,
  onApprove: (requestId: string, approved: boolean) => void
): ColumnsType<JoinRequest> => {
  const permissions = new PermissionChecker(user);

  return [
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
          { key: 'approve', label: '通过', type: 'primary' as const, onClick: () => onApprove(record.id, true) },
          { key: 'reject', label: '拒绝', onClick: () => onApprove(record.id, false) }
        ];

        return <TableActions actions={actions} />;
      },
    },
  ];
};

// Hook版本的加入请求表格列配置
export const useJoinRequestColumns = (
  user: User,
  onApprove: (requestId: string, approved: boolean) => void
): ColumnsType<JoinRequest> => {
  return React.useMemo(() => getJoinRequestColumns(user, onApprove), [user, onApprove]);
};

// 统计数据配置
export const getProjectStats = (projects: Project[]) => ({
  totalProjects: projects.length,
  totalApis: projects.reduce((sum, project) => sum + project.apiCount, 0),
  activeProjects: projects.filter(p => p.status === 'active').length,
});

export const getGroupStats = (groups: Group[], user: User) => {
  const permissions = new PermissionChecker(user);
  const ownedGroups = permissions.getOwnedGroups(groups);
  
  return {
    totalGroups: groups.length,
    ownedGroups: ownedGroups.length,
    joinedGroups: permissions.getJoinedGroups(groups).length,
  };
};
