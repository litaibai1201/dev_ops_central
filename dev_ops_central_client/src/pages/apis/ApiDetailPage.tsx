import React from 'react';
import { Card, Button, Space, Tag } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../../types';

interface ApiDetailPageProps {
  user: User;
}

const ApiDetailPage: React.FC<ApiDetailPageProps> = ({ user }) => {
  const { projectId, apiId } = useParams<{ projectId: string; apiId: string }>();
  const navigate = useNavigate();

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/projects/${projectId}`)}
            style={{ marginBottom: '8px' }}
          >
            返回专案
          </Button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            API接口详情
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            专案ID: {projectId} | API ID: {apiId}
          </p>
        </div>
        <Space>
          <Button icon={<PlayCircleOutlined />}>
            测试接口
          </Button>
          <Button type="primary" icon={<EditOutlined />}>
            编辑接口
          </Button>
        </Space>
      </div>

      {/* API基本信息 */}
      <Card title="接口信息" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Tag color="blue">GET</Tag>
            <span style={{ fontSize: '16px', fontWeight: 500 }}>/api/users/{apiId}</span>
          </div>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            获取用户详细信息的API接口
          </p>
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
              API详情页面开发中...
            </h3>
            <p style={{ color: '#999', marginBottom: '24px' }}>
              此页面将显示API的详细文档、参数说明、响应示例、测试工具等内容
            </p>
            <Space>
              <Button onClick={() => navigate(`/projects/${projectId}`)}>
                返回专案
              </Button>
              <Button type="primary" onClick={() => navigate('/dashboard')}>
                返回仪表板
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* 功能预览 */}
      <Card title="即将推出的功能">
        <div style={{ padding: '16px' }}>
          <ul style={{ fontSize: '14px', color: '#666', lineHeight: '2' }}>
            <li>• API接口详细文档</li>
            <li>• 请求参数和响应格式说明</li>
            <li>• 在线API测试工具</li>
            <li>• 代码示例生成（多种语言）</li>
            <li>• 接口调用统计和监控</li>
            <li>• 版本历史和变更记录</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ApiDetailPage;