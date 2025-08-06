import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tabs,
  Space,
  Button,
  Descriptions,
  Statistic,
  Row,
  Col,
  Tag,
  message,
  Avatar
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  CrownOutlined,
  SettingOutlined,
  UserAddOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Group, GroupMember, Project } from '../../types';
import {
  UserDisplay,
  StatusTag,
  LoadingState,
  TableActions,
  createViewAction,
  PermissionChecker
} from '../../components/common';
import { usePageContext } from '../../components/common/PageContext';
import { useGroupDetail } from '../../components/common/DataService';
import type { ColumnsType } from 'antd/es/table';

interface GroupDetailPageProps {
  user: User;
}

const GroupDetailPage: React.FC<GroupDetailPageProps> = ({ user }) => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { setGroupName } = usePageContext();
  
  // 使用真实的API数据
  const { data, loading, error } = useGroupDetail(groupId!);
  
  const permissions = new PermissionChecker(user);

  // 组件卸载时清理上下文
  useEffect(() => {
    return () => {
      setGroupName('');
    };
  }, [setGroupName]);

  // 设置群组名称到上下文
  useEffect(() => {
    if (data?.group) {
      setGroupName(data.group.name);
    }
  }, [data?.group, setGroupName]);

  // 错误处理
  if (error) {
    return (
      <div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/groups')}
          style={{ marginBottom: 16 }}
        >
          返回
        </Button>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#ff4d4f' }}>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading || !data) {
    return <LoadingState loading={loading} />;
  }

  const { group, projects } = data;

  // 数据完整性检查
  if (!group) {
    return (
      <div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/groups')}
          style={{ marginBottom: 16 }}
        >
          返回
        </Button>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#ff4d4f' }}>群组数据加载失败</p>
          </div>
        </Card>
      </div>
    );
  }

  // 确保关键字段存在
  if (!group.id || !group.name) {
    console.error('群组数据不完整:', group);
    return (
      <div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/groups')}
          style={{ marginBottom: 16 }}
        >
          返回
        </Button>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#ff4d4f' }}>群组数据结构异常</p>
            <p style={{ color: '#999', fontSize: '14px' }}>请刷新页面或联系管理员</p>
          </div>
        </Card>
      </div>
    );
  }

  // 日期格式化工具 - 添加错误处理
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '未知';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '无效日期';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}年${month}月${day}日`;
    } catch (error) {
      console.error('日期格式化错误:', error, '原始数据:', dateString);
      return '格式化错误';
    }
  };

  // 权限检查 - 添加空值检查
  const isOwner = group && permissions.isGroupOwner(group);
  const isMember = group && permissions.isGroupMember(group);
  const isGroupAdmin = group && permissions.isGroupAdmin(group);
  const isSystemAdmin = permissions.isSystemAdmin();

  // 群组成员表格列配置
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
        <Space direction="vertical" size={2} style={{ width: 'fit-content' }}>
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
      render: (text: string, record: Project) => (
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
      render: (count: number) => (
        <span style={{ fontWeight: 500 }}>{count} 个</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '可见性',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic: boolean) => (
        <StatusTag status={isPublic ? 'public' : 'private'} />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Project) => {
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
                <Descriptions.Item label="群组描述">{group.description || '无描述'}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {formatDate(group.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="群主">
                  {group.owner ? (
                    <UserDisplay
                      username={group.owner.username}
                      email={group.owner.email}
                      showCrown={true}
                    />
                  ) : (
                    <span style={{ color: '#999' }}>未知</span>
                  )}
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
                    value={group.members?.length || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card>
                  <Statistic
                    title="专案数量"
                    value={projects?.length || 0}
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
          成员管理 ({group.members?.length || 0})
        </span>
      ),
      children: (
        <Table
          columns={memberColumns}
          dataSource={group.members || []}
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
          专案列表 ({projects?.length || 0})
        </span>
      ),
      children: (
        <Table
          columns={projectColumns}
          dataSource={projects || []}
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

  // 创建操作按钮数组 - 添加空值检查
  const actionButtons = [];
  
  if (group && permissions.canEditGroup(group)) {
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

  if (group && permissions.canManageMembers(group)) {
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
              <Tag color="blue">{group.members?.length || 0} 名成员</Tag>
              <Tag color="green">{projects?.length || 0} 个专案</Tag>
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
