import React, { useState, useEffect } from 'react';
import { Form, message, Typography } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Project, ApiMethod } from '../../types';
import { usePageContext } from '../../components/common';
import {
  ApiPageHeader,
  ApiForm,
  ApiFormData
} from '../../components/api';

const { Title } = Typography;

interface EditApiPageProps {
  user: User;
}

const EditApiPage: React.FC<EditApiPageProps> = ({ user }) => {
  const { projectId, apiId } = useParams<{ projectId: string; apiId: string }>();
  const navigate = useNavigate();
  const { setProjectName, setApiName } = usePageContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [api, setApi] = useState<ApiMethod | null>(null);
  const [formData, setFormData] = useState<Partial<ApiFormData>>({});

  useEffect(() => {
    // 模拟获取项目和API信息
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟项目数据
        const mockProject: Project = {
          id: projectId || '1',
          name: projectId === '1' ? '用户管理系统API' : '订单系统API',
          description: '项目描述',
          groupId: '1',
          group: {
            id: '1',
            name: '开发组',
            description: '',
            ownerId: '1',
            owner: user,
            members: [],
            projectCount: 1,
            createdAt: '',
            updatedAt: ''
          },
          isPublic: true,
          apiCount: 0,
          tags: [],
          version: 'v1.0.0',
          status: 'active',
          createdAt: '',
          updatedAt: ''
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
        setProjectName(mockProject.name);
        setApiName(`编辑 ${selectedApi?.name || '接口'}`);

        // 设置表单初始值
        if (selectedApi) {
          const initialValues = {
            name: selectedApi.name,
            method: selectedApi.method,
            url: selectedApi.url,
            description: selectedApi.description,
            tags: selectedApi.tags,
            status: selectedApi.status
          };
          
          form.setFieldsValue(initialValues);

          // 转换API数据为表单数据格式
          const convertedRequestParams = selectedApi.params?.map((param, index) => ({
            key: param.id || index.toString(),
            name: param.name,
            type: param.type,
            location: 'body', // 根据实际情况设置
            required: param.required,
            description: param.description,
            example: param.example,
            level: 0,
            parentKey: undefined
          })) || [];

          const convertedRequestHeaders = Object.entries(selectedApi.headers).map(([key, value], index) => ({
            key: index.toString(),
            name: key,
            value: value,
            required: key === 'Content-Type',
            description: key === 'Content-Type' ? '请求内容类型' : '',
            readonly: key === 'Content-Type'
          }));

          const convertedResponseParams = selectedApi.responses?.[0] ? 
            // 这里可以解析response example来生成参数结构
            [
              {
                key: '1',
                name: 'success',
                type: 'boolean',
                required: true,
                description: '请求是否成功',
                example: 'true',
                level: 0,
                parentKey: undefined
              },
              {
                key: '2',
                name: 'message',
                type: 'string',
                required: true,
                description: '响应消息',
                example: '操作成功',
                level: 0,
                parentKey: undefined
              },
              {
                key: '3',
                name: 'data',
                type: 'object',
                required: true,
                description: '响应数据',
                example: '{}',
                level: 0,
                parentKey: undefined
              }
            ] : [];

          const formDataWithParams: Partial<ApiFormData> = {
            ...initialValues,
            requestParams: convertedRequestParams,
            requestHeaders: convertedRequestHeaders,
            responseParams: convertedResponseParams
          };

          setFormData(formDataWithParams);
        }
      } catch (error) {
        console.error('获取API信息失败:', error);
        message.error('获取API信息失败');
      } finally {
        setInitialLoading(false);
      }
    };

    if (projectId && apiId) {
      fetchData();
    }
  }, [projectId, apiId, user, setProjectName, setApiName, form]);

  // 监听表单数据变化
  const handleFormDataChange = (data: Partial<ApiFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 构建更新的API数据
      const updatedApiData = {
        ...values,
        ...formData,
        id: apiId,
        projectId,
        updatedBy: user.id,
        updatedAt: new Date().toISOString()
      };

      console.log('更新API数据:', updatedApiData);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('API接口更新成功！');
      navigate(`/projects/${projectId}/apis/${apiId}`);
      
    } catch (error) {
      console.error('更新API失败:', error);
      message.error('请检查表单内容');
    } finally {
      setLoading(false);
    }
  };

  // 处理取消操作
  const handleCancel = () => {
    navigate(`/projects/${projectId}/apis/${apiId}`);
  };

  if (initialLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Title level={3}>加载中...</Title>
      </div>
    );
  }

  if (!project || !api) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Title level={3}>API接口未找到</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 页面头部 */}
      <ApiPageHeader
        title={`编辑接口 - ${api.name}`}
        subtitle={`编辑 ${project.name} 中的API接口`}
        onBack={handleCancel}
        onSave={handleSubmit}
        loading={loading}
        backText="取消"
        saveText="保存更改"
        extraActions={
          <div style={{ fontSize: '14px', color: '#666' }}>
            最后更新：{new Date(api.updatedAt).toLocaleString()}
          </div>
        }
      />

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          method: 'GET',
          status: 'draft'
        }}
      >
        <ApiForm
          form={form}
          initialValues={formData}
          onFormDataChange={handleFormDataChange}
        />
      </Form>
    </div>
  );
};

export default EditApiPage;