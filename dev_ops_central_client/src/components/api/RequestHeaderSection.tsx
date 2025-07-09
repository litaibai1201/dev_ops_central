import React from 'react';
import { Card, Button, Badge, Tooltip, Alert } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import RequestHeaderTable, { RequestHeader } from './RequestHeaderTable';

export interface RequestHeaderSectionProps {
  title?: string;
  headers: RequestHeader[];
  onHeaderChange: (key: string, field: keyof RequestHeader, value: any) => void;
  onAddHeader: () => void;
  onRemoveHeader: (key: string) => void;
  alertMessage?: string;
  alertDescription?: React.ReactNode;
  emptyText?: string;
  badgeColor?: string;
  tooltip?: string;
  addButtonText?: string;
  style?: React.CSSProperties;
}

const RequestHeaderSection: React.FC<RequestHeaderSectionProps> = ({
  title = '请求头配置',
  headers,
  onHeaderChange,
  onAddHeader,
  onRemoveHeader,
  alertMessage = '请求头说明',
  alertDescription = '请求头包含关于请求的元数据信息，如内容类型、认证令牌、缓存控制等。Content-Type 是必需的请求头，无法删除。',
  emptyText = '暂无请求头，点击右上角按钮添加',
  badgeColor = '#722ed1',
  tooltip = '定义HTTP请求头信息',
  addButtonText = '添加请求头',
  style
}) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{title}</span>
          <Badge count={headers.length} showZero color={badgeColor} />
          <Tooltip title={tooltip}>
            <QuestionCircleOutlined style={{ color: '#999' }} />
          </Tooltip>
        </div>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddHeader}
        >
          {addButtonText}
        </Button>
      }
      style={style}
    >
      <Alert
        message={alertMessage}
        description={alertDescription}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <RequestHeaderTable
        headers={headers}
        onHeaderChange={onHeaderChange}
        onRemoveHeader={onRemoveHeader}
        emptyText={emptyText}
      />
    </Card>
  );
};

export default RequestHeaderSection;