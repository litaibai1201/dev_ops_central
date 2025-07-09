import React from 'react';
import { Select, Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

export interface HttpMethod {
  value: string;
  label: string;
  color: string;
  description: string;
  hasRequestBody: boolean;
  supportedLocations: string[];
}

export interface ApiMethodSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  size?: 'small' | 'middle' | 'large';
  placeholder?: string;
  disabled?: boolean;
  methods?: HttpMethod[];
}

export const DEFAULT_HTTP_METHODS: HttpMethod[] = [
  { 
    value: 'GET', 
    label: 'GET', 
    color: '#52c41a',
    description: '获取数据',
    hasRequestBody: false,
    supportedLocations: ['query', 'path']
  },
  { 
    value: 'POST', 
    label: 'POST', 
    color: '#1890ff',
    description: '创建数据',
    hasRequestBody: true,
    supportedLocations: ['query', 'path', 'body']
  },
  { 
    value: 'PUT', 
    label: 'PUT', 
    color: '#faad14',
    description: '更新数据',
    hasRequestBody: true,
    supportedLocations: ['path', 'body']
  },
  { 
    value: 'DELETE', 
    label: 'DELETE', 
    color: '#ff4d4f',
    description: '删除数据',
    hasRequestBody: false,
    supportedLocations: ['path', 'query']
  },
  { 
    value: 'PATCH', 
    label: 'PATCH', 
    color: '#722ed1',
    description: '部分更新',
    hasRequestBody: true,
    supportedLocations: ['path', 'body']
  }
];

const ApiMethodSelector: React.FC<ApiMethodSelectorProps> = ({
  value,
  onChange,
  size = 'middle',
  placeholder = '选择请求方式',
  disabled = false,
  methods = DEFAULT_HTTP_METHODS
}) => {
  return (
    <Select 
      value={value}
      onChange={onChange}
      size={size}
      placeholder={placeholder}
      disabled={disabled}
      style={{ width: '100%' }}
    >
      {methods.map(method => (
        <Select.Option key={method.value} value={method.value}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color={method.color} style={{ margin: 0, minWidth: 60, textAlign: 'center' }}>
              {method.label}
            </Tag>
            <span style={{ color: '#666' }}>
              {method.description}
            </span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

export default ApiMethodSelector;