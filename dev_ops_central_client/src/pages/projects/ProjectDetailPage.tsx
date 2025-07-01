import React from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined, ApiOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../../types';

interface ProjectDetailPageProps {
  user: User;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ user }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: '8px' }}
          >
            返回
          </Button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            专案详情
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            专案ID: {projectId}
          </p>
        </div>
        <Space>
          <Button type="primary" icon={<ApiOutlined />}>
            添加接口
          </Button>
        </Space>
      </div>

      {/* 专案信息 */}
      <Card title="专案信息" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
            专案详情页面开发中...
          </h3>
          <p style={{ color: '#999', marginBottom: '24px' }}>
            此页面将显示专案的详细信息、API接口列表、成员权限等内容
          </p>
          <Space>
            <Button onClick={() => navigate('/dashboard')}>
              返回仪表板
            </Button>
            <Button type="primary" onClick={() => navigate('/groups')}>
              管理群组
            </Button>
          </Space>
        </div>
      </Card>

      {/* 功能预览 */}
      <Card title="即将推出的功能">
        <div style={{ padding: '16px' }}>
          <ul style={{ fontSize: '14px', color: '#666', lineHeight: '2' }}>
            <li>• 专案基本信息展示和编辑</li>
            <li>• API接口列表和分类管理</li>
            <li>• 接口文档自动生成</li>
            <li>• 在线API测试工具</li>
            <li>• 团队成员权限管理</li>
            <li>• 版本控制和变更历史</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ProjectDetailPage;