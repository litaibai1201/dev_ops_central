import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Descriptions, Tag, Table, Tabs, Divider, Tooltip, Badge, Empty, Row, Col } from 'antd';
import { 
  ArrowLeftOutlined, 
  ApiOutlined, 
  EditOutlined, 
  ShareAltOutlined, 
  SettingOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  TeamOutlined,
  GlobalOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Project, ApiMethod, ApiFolder } from '../../types';
import { 
  StatusTag,
  UserDisplay,
  LoadingState,
  TableActions,
  createViewAction,
  createEditAction,
  createDeleteAction,
  createTestAction,
  HttpMethodTag,
  usePageContext
} from '../../components/common';
import type { ColumnsType } from 'antd/es/table';

interface ProjectDetailPageProps {
  user: User;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ user }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { setProjectName } = usePageContext();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [apis, setApis] = useState<ApiMethod[]>([]);
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟获取项目数据
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟项目数据
        const mockProject: Project = {
          id: projectId || '1',
          name: projectId === '1' ? '用户管理系统API' : '订单系统API',
          description: projectId === '1' 
            ? '提供用户注册、登录、个人信息管理等功能的API接口，支持多种认证方式和权限控制'
            : '电商平台订单管理相关接口，包含订单创建、查询、更新、支付等功能',
          groupId: projectId === '1' ? '1' : '2',
          group: {
            id: projectId === '1' ? '1' : '2',
            name: projectId === '1' ? '前端开发组' : '后端开发组',
            description: projectId === '1' ? '负责前端相关项目开发' : '负责后端服务开发',
            ownerId: '1',
            owner: {
              id: '1',
              username: 'admin',
              email: 'admin@example.com',
              role: 'system_admin',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01'
            },
            members: [],
            projectCount: projectId === '1' ? 3 : 5,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          isPublic: true,
          apiCount: projectId === '1' ? 15 : 28,
          tags: projectId === '1' ? ['用户管理', '认证', 'JWT'] : ['订单', '支付', '电商'],
          version: projectId === '1' ? 'v1.0.0' : 'v2.1.0',
          status: 'active',
          createdAt: projectId === '1' ? '2024-01-15' : '2024-02-01',
          updatedAt: projectId === '1' ? '2024-01-20' : '2024-02-15'
        };

        // 模拟API接口数据
        const mockApis: ApiMethod[] = projectId === '1' ? [
          {
            id: '1',
            name: '用户注册',
            description: '创建新用户账户',
            method: 'POST',
            url: '/api/auth/register',
            projectId: '1',
            headers: { 'Content-Type': 'application/json' },
            params: [],
            responses: [],
            tags: ['认证', '用户'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-20'
          },
          {
            id: '2',
            name: '用户登录',
            description: '用户身份验证',
            method: 'POST',
            url: '/api/auth/login',
            projectId: '1',
            headers: { 'Content-Type': 'application/json' },
            params: [],
            responses: [],
            tags: ['认证'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-20'
          },
          {
            id: '3',
            name: '获取用户信息',
            description: '获取当前用户的详细信息',
            method: 'GET',
            url: '/api/users/profile',
            projectId: '1',
            headers: { 'Authorization': 'Bearer {token}' },
            params: [],
            responses: [],
            tags: ['用户'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-01-16',
            updatedAt: '2024-01-20'
          },
          {
            id: '4',
            name: '更新用户信息',
            description: '更新用户的个人信息',
            method: 'PUT',
            url: '/api/users/profile',
            projectId: '1',
            headers: { 'Authorization': 'Bearer {token}', 'Content-Type': 'application/json' },
            params: [],
            responses: [],
            tags: ['用户'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-01-17',
            updatedAt: '2024-01-20'
          },
          {
            id: '5',
            name: '删除用户',
            description: '删除用户账户（需要管理员权限）',
            method: 'DELETE',
            url: '/api/users/{id}',
            projectId: '1',
            headers: { 'Authorization': 'Bearer {token}' },
            params: [],
            responses: [],
            tags: ['用户', '管理'],
            status: 'draft',
            createdBy: '1',
            createdAt: '2024-01-18',
            updatedAt: '2024-01-20'
          }
        ] : [
          {
            id: '6',
            name: '创建订单',
            description: '创建新的订单',
            method: 'POST',
            url: '/api/orders',
            projectId: '2',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {token}' },
            params: [],
            responses: [],
            tags: ['订单'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-02-01',
            updatedAt: '2024-02-15'
          },
          {
            id: '7',
            name: '查询订单列表',
            description: '获取用户的订单列表',
            method: 'GET',
            url: '/api/orders',
            projectId: '2',
            headers: { 'Authorization': 'Bearer {token}' },
            params: [],
            responses: [],
            tags: ['订单'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-02-02',
            updatedAt: '2024-02-15'
          },
          {
            id: '8',
            name: '订单支付',
            description: '处理订单支付',
            method: 'POST',
            url: '/api/orders/{id}/pay',
            projectId: '2',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {token}' },
            params: [],
            responses: [],
            tags: ['订单', '支付'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-02-03',
            updatedAt: '2024-02-15'
          }
        ];

        setProject(mockProject);
        setApis(mockApis);
        // 设置面包屑上下文
        setProjectName(mockProject.name);
      } catch (error) {
        console.error('Failed to fetch project data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // API表格列配置
  const apiColumns: ColumnsType<ApiMethod> = [
    {
      title: 'API名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div
            style={{
              fontWeight: 500,
              color: '#1890ff',
              cursor: 'pointer',
              marginBottom: 4
            }}
            onClick={() => navigate(`/projects/${projectId}/apis/${record.id}`)}
            title="点击查看API详情"
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
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (method) => <HttpMethodTag method={method} />,
    },
    {
      title: 'URL路径',
      dataIndex: 'url',
      key: 'url',
      render: (url) => (
        <code style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '2px 6px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {url}
        </code>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div>
          {tags.map(tag => (
            <Tag key={tag} size="small">{tag}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => {
        const actions = [
          createViewAction(() => navigate(`/projects/${projectId}/apis/${record.id}`)),
          createTestAction(() => console.log('测试API:', record.id)),
          createEditAction(() => console.log('编辑API:', record.id))
        ];
        return <TableActions actions={actions} />;
      },
    },
  ];

  if (loading) {
    return <LoadingState loading={true} />;
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>专案未找到</h2>
        <Button onClick={() => navigate('/dashboard')}>返回仪表板</Button>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <EyeOutlined />
          概览
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* 基本信息 */}
            <Card title="基本信息" style={{ height: '100%' }}>
              <Descriptions column={2} bordered labelStyle={{ width: '120px' }}>
                <Descriptions.Item label="专案名称">{project.name}</Descriptions.Item>
                <Descriptions.Item label="版本">{project.version}</Descriptions.Item>
                <Descriptions.Item label="所属群组">
                  <UserDisplay 
                    username={project.group.name}
                    showEmail={false}
                    avatarSize="small"
                  />
                </Descriptions.Item>
                <Descriptions.Item label="可见性">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {project.isPublic ? (
                      <>
                        <GlobalOutlined style={{ color: '#52c41a' }} />
                        <span>公开</span>
                      </>
                    ) : (
                      <>
                        <LockOutlined style={{ color: '#faad14' }} />
                        <span>私有</span>
                      </>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <StatusTag status={project.status} />
                </Descriptions.Item>
                <Descriptions.Item label="接口数量">
                  <Badge count={project.apiCount} showZero style={{ backgroundColor: '#1890ff' }} />
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(project.createdAt).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="标签" span={2}>
                  <div>
                    {project.tags.map(tag => (
                      <Tag key={tag} color="blue">{tag}</Tag>
                    ))}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {project.description}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            {/* 快速统计 */}
            <Card title="快速统计" size="small">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff', marginBottom: 4 }}>{apis.length}</div>
                  <div style={{ color: '#666', fontSize: 12 }}>总接口数</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f6ffed', borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a', marginBottom: 4 }}>
                    {apis.filter(api => api.status === 'published').length}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>已发布</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#fffbe6', borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14', marginBottom: 4 }}>
                    {apis.filter(api => api.status === 'draft').length}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>草稿</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#fff2f0', borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f', marginBottom: 4 }}>
                    {apis.filter(api => api.status === 'deprecated').length}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>已废弃</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'apis',
      label: (
        <span>
          <ApiOutlined />
          API接口 ({apis.length})
        </span>
      ),
      children: (
        <Card>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>API接口列表</h3>
            <Button type="primary" icon={<ApiOutlined />}>
              添加接口
            </Button>
          </div>
          <Table
            columns={apiColumns}
            dataSource={apis}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'docs',
      label: (
        <span>
          <FileTextOutlined />
          文档
        </span>
      ),
      children: (
        <Card>
          <Empty 
            description="文档功能开发中"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary">创建文档</Button>
          </Empty>
        </Card>
      ),
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined />
          设置
        </span>
      ),
      children: (
        <Card>
          <Empty 
            description="设置功能开发中"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary">配置设置</Button>
          </Empty>
        </Card>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0,
          minWidth: 0,
          flex: '1 1 auto'
        }}>
          {project.name}
        </h1>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard')}
          size="large"
          style={{ flexShrink: 0 }}
        >
          返回
        </Button>
      </div>

      {/* 项目描述 */}
      {project.description && (
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          marginBottom: 16,
          lineHeight: 1.6
        }}>
          {project.description}
        </p>
      )}

      {/* 标签页和操作按钮 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems.map(item => ({
              ...item,
              children: undefined // 移除children，稍后单独渲染
            }))}
            size="large"
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>
        <div style={{ flexShrink: 0, alignSelf: 'flex-end', marginBottom: 8 }}>
          <Space size="small">
            <Tooltip title="分享专案">
              <Button icon={<ShareAltOutlined />} size="middle" />
            </Tooltip>
            <Button icon={<EditOutlined />} size="middle">编辑</Button>
            <Button type="primary" icon={<ApiOutlined />} size="middle">
              添加接口
            </Button>
          </Space>
        </div>
      </div>

      {/* 标签页内容 */}
      <div>
        {tabItems.find(item => item.key === activeTab)?.children}
      </div>
    </div>
  );
};

export default ProjectDetailPage;