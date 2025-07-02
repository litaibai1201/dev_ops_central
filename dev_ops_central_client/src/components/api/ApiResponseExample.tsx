import React from 'react';
import { Button, Tag, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { ApiResponse } from '../../types';

interface ApiResponseExampleProps {
  responses: ApiResponse[];
}

const ApiResponseExample: React.FC<ApiResponseExampleProps> = ({ responses }) => {
  if (!responses || responses.length === 0) return null;

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
        响应示例
      </h3>
      {responses.map(response => (
        <div key={response.id} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <Tag color={response.statusCode < 300 ? 'green' : 'red'} style={{ marginRight: 8 }}>
                {response.statusCode}
              </Tag>
              <span>{response.description}</span>
            </div>
            <Button 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(response.example);
                message.success('复制成功');
              }}
              title="复制响应示例"
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
            {response.example}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default ApiResponseExample;