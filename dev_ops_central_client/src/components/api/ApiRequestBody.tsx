import React from 'react';
import { Button, Tag, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

interface ApiRequestBodyProps {
  body: {
    type: string;
    content: string;
  };
}

const ApiRequestBody: React.FC<ApiRequestBodyProps> = ({ body }) => {
  if (!body) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: 600, 
        color: '#262626', 
        marginBottom: 16,
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: 8
      }}>
        请求体
      </h3>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Tag color="blue">{body.type}</Tag>
          <Button 
            size="small" 
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(body.content);
              message.success('复制成功');
            }}
            title="复制请求体"
          >
            复制
          </Button>
        </div>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '8px',
          fontSize: '14px',
          overflow: 'auto'
        }}>
          {body.content}
        </pre>
      </div>
    </div>
  );
};

export default ApiRequestBody;