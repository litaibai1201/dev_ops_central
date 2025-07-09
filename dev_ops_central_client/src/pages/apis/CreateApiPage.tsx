import React, { useState, useEffect } from 'react';
import { Form, message, Typography } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Project } from '../../types';
import { usePageContext } from '../../components/common';
import {
  ApiPageHeader,
  ApiForm,
  ApiFormData
} from '../../components/api';

const { Title } = Typography;

interface CreateApiPageProps {
  user: User;
}

const CreateApiPage: React.FC<CreateApiPageProps> = ({ user }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { setProjectName, setApiName } = usePageContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<ApiFormData>>({});

  useEffect(() => {
    // 模拟获取项目信息
    const fetchProject = async () => {
      try {
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
        setProject(mockProject);
        setProjectName(mockProject.name);
        setApiName('新增接口');
      } catch (error) {
        console.error('获取项目信息失败:', error);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, user, setProjectName, setApiName]);

  // 监听表单数据变化
  const handleFormDataChange = (data: Partial<ApiFormData>) => {
    setFormData(data);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 构建API数据
      const apiData = {
        ...values,
        ...formData,
        projectId,
        status: 'draft',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('API数据:', apiData);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('API接口创建成功！');
      navigate(`/projects/${projectId}`);
      
    } catch (error) {
      console.error('创建API失败:', error);
      message.error('请检查表单内容');
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Title level={3}>加载中...</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 页面头部 */}
      <ApiPageHeader
        title="新增接口"
        projectName={project.name}
        onBack={() => navigate(`/projects/${projectId}`)}
        onSave={handleSubmit}
        loading={loading}
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
          onFormDataChange={handleFormDataChange}
        />
      </Form>
    </div>
  );
};

export default CreateApiPage;