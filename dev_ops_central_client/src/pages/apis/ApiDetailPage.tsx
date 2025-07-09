import React, { useState, useEffect } from 'react';
import { Button, Space, Tabs, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined, FileTextOutlined, HistoryOutlined, BugOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Project, ApiMethod } from '../../types';
import { LoadingState, usePageContext } from '../../components/common';
import { ApiDetailsTab, ApiTestTab, ApiCodeExamples } from '../../components/api';

interface ApiDetailPageProps {
  user: User;
}

const ApiDetailPage: React.FC<ApiDetailPageProps> = ({ user }) => {
  const { projectId, apiId } = useParams<{ projectId: string; apiId: string }>();
  const navigate = useNavigate();
  const { setProjectName, setApiName } = usePageContext();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [api, setApi] = useState<ApiMethod | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // 模拟获取API数据
  useEffect(() => {
    const fetchApiData = async () => {
      setLoading(true);
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟项目数据
        const mockProject: Project = {
          id: projectId || '1',
          name: projectId === '1' ? '用户管理系统API' : '订单系统API',
          description: projectId === '1' 
            ? '提供用户注册、登录、个人信息管理等功能的API接口'
            : '电商平台订单管理相关接口',
          groupId: projectId === '1' ? '1' : '2',
          group: {
            id: projectId === '1' ? '1' : '2',
            name: projectId === '1' ? '前端开发组' : '后端开发组',
            description: '',
            ownerId: '1',
            owner: {} as User,
            members: [],
            projectCount: 0,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          isPublic: true,
          apiCount: 15,
          tags: [],
          version: 'v1.0.0',
          status: 'active',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20'
        };

        // 模拟API数据
        const mockApiData: { [key: string]: ApiMethod } = {
          '1': {
            id: '1',
            name: '用户注册',
            description: '创建新用户账户，需要提供用户名、邮箱和密码',
            method: 'POST',
            url: '/api/auth/register',
            projectId: projectId || '1',
            headers: { 'Content-Type': 'application/json' },
            params: [
              {
                id: '1',
                name: 'username',
                type: 'string',
                required: true,
                description: '用户名，长度在3-20个字符',
                example: 'john_doe'
              },
              {
                id: '2',
                name: 'email',
                type: 'string',
                required: true,
                description: '邮箱地址',
                example: 'john@example.com'
              },
              {
                id: '3',
                name: 'password',
                type: 'string',
                required: true,
                description: '密码，最少8位',
                example: 'password123'
              }
            ],
            body: {
              type: 'json',
              content: JSON.stringify({
                username: 'john_doe',
                email: 'john@example.com',
                password: 'password123'
              }, null, 2)
            },
            responses: [
              {
                id: '1',
                statusCode: 201,
                description: '注册成功',
                headers: { 'Content-Type': 'application/json' },
                body: '',
                example: JSON.stringify({
                  success: true,
                  message: '注册成功',
                  data: {
                    id: '12345',
                    username: 'john_doe',
                    email: 'john@example.com',
                    createdAt: '2024-01-20T10:30:00Z'
                  }
                }, null, 2)
              }
            ],
            tags: ['认证', '用户'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-20'
          },
          '2': {
            id: '2',
            name: '用户登录',
            description: '用户身份验证，成功后返回JWT Token',
            method: 'POST',
            url: '/api/auth/login',
            projectId: projectId || '1',
            headers: { 'Content-Type': 'application/json' },
            params: [
              {
                id: '1',
                name: 'email',
                type: 'string',
                required: true,
                description: '邮箱地址',
                example: 'john@example.com'
              },
              {
                id: '2',
                name: 'password',
                type: 'string',
                required: true,
                description: '密码',
                example: 'password123'
              }
            ],
            body: {
              type: 'json',
              content: JSON.stringify({
                email: 'john@example.com',
                password: 'password123'
              }, null, 2)
            },
            responses: [
              {
                id: '1',
                statusCode: 200,
                description: '登录成功',
                headers: { 'Content-Type': 'application/json' },
                body: '',
                example: JSON.stringify({
                  success: true,
                  message: '登录成功',
                  data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: '12345',
                      username: 'john_doe',
                      email: 'john@example.com'
                    }
                  }
                }, null, 2)
              }
            ],
            tags: ['认证'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-20'
          }
        };

        const selectedApi = mockApiData[apiId || '1'];
        
        setProject(mockProject);
        setApi(selectedApi);
        // 设置面包屑上下文
        setProjectName(mockProject.name);
        if (selectedApi) {
          setApiName(selectedApi.name);
        }
      } catch (error) {
        console.error('Failed to fetch API data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && apiId) {
      fetchApiData();
    }
  }, [projectId, apiId, setProjectName, setApiName]);

  if (loading) {
    return <LoadingState loading={true} />;
  }

  if (!project || !api) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>API接口未找到</h2>
        <Button onClick={() => navigate('/dashboard')}>返回仪表板</Button>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'details',
      label: (
        <span>
          <FileTextOutlined />
          接口详情
        </span>
      ),
      children: <ApiDetailsTab api={api} />,
    },
    {
      key: 'test',
      label: (
        <span>
          <BugOutlined />
          在线测试
        </span>
      ),
      children: <ApiTestTab api={api} />,
    },
    {
      key: 'code',
      label: (
        <span>
          <FileTextOutlined />
          示例代码
        </span>
      ),
      children: <ApiCodeExamples api={api} />,
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          变更历史
        </span>
      ),
      children: (
        <Empty 
          description="变更历史功能开发中"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary">查看历史</Button>
        </Empty>
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
          {api.name}
        </h1>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/projects/${projectId}`)}
          size="large"
          style={{ flexShrink: 0 }}
        >
          返回
        </Button>
      </div>

      {/* API描述 */}
      {api.description && (
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          marginBottom: 16,
          lineHeight: 1.6
        }}>
          {api.description}
        </p>
      )}

      {/* 标签页和操作按钮 */}
      <div style={{
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 24
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems.map(item => ({
                key: item.key,
                label: item.label
              }))}
              size="large"
              tabBarStyle={{ marginBottom: 0, borderBottom: 'none' }}
            />
          </div>
          <div style={{ flexShrink: 0, alignSelf: 'flex-end', marginBottom: 8 }}>
            <Space size="small">
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                size="middle"
                onClick={() => navigate(`/projects/${projectId}/apis/${apiId}/edit`)}
              >
                编辑接口
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* 标签页内容 */}
      <div>
        {tabItems.find(item => item.key === activeTab)?.children}
      </div>
    </div>
  );
};

export default ApiDetailPage;