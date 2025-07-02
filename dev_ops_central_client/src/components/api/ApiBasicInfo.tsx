import React from 'react';
import { Card, Button, Tag, Descriptions, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { ApiMethod } from '../../types';
import { StatusTag, HttpMethodTag } from '../common';

interface ApiBasicInfoProps {
  api: ApiMethod;
}

const ApiBasicInfo: React.FC<ApiBasicInfoProps> = ({ api }) => {
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
        基本信息
      </h3>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="接口名称">{api.name}</Descriptions.Item>
        <Descriptions.Item label="请求方法">
          <HttpMethodTag method={api.method} />
        </Descriptions.Item>
        <Descriptions.Item label="URL路径">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              fontSize: '14px',
              flex: 1
            }}>
              {api.url}
            </span>
            <Button 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(api.url);
                message.success('复制成功');
              }}
              title="复制URL"
            />
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <StatusTag status={api.status} />
        </Descriptions.Item>
        <Descriptions.Item label="标签" span={2}>
          <div>
            {api.tags.map(tag => (
              <Tag key={tag} color="blue">{tag}</Tag>
            ))}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={2}>
          {api.description}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default ApiBasicInfo;