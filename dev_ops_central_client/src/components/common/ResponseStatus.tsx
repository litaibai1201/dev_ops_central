import React from 'react';
import { Tag, Badge, Row, Col, Typography } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ResponseStatusProps {
  status: number;
  statusText?: string;
  responseTime?: number;
  requestSize?: number;
  responseSize?: number;
  showMetrics?: boolean;
}

const ResponseStatus: React.FC<ResponseStatusProps> = ({
  status,
  statusText,
  responseTime,
  requestSize,
  responseSize,
  showMetrics = true
}) => {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'orange';
    if (status >= 400 && status < 500) return 'red';
    if (status >= 500) return 'volcano';
    return 'default';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircleOutlined />;
    return <ExclamationCircleOutlined />;
  };

  const isSuccess = status >= 200 && status < 300;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Text strong>状态码</Text>
        <Tag 
          color={getStatusColor(status)} 
          icon={getStatusIcon(status)}
          style={{ fontSize: '14px', padding: '4px 8px' }}
        >
          {status} {statusText}
        </Tag>
      </div>
      
      {showMetrics && (responseTime || requestSize || responseSize) && (
        <Row gutter={16}>
          {responseTime && (
            <Col span={8}>
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-sm text-gray-500">响应时间</div>
                <div className="text-lg font-medium text-blue-600">{responseTime}ms</div>
              </div>
            </Col>
          )}
          {requestSize && (
            <Col span={8}>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-500">请求大小</div>
                <div className="text-lg font-medium text-green-600">{requestSize}B</div>
              </div>
            </Col>
          )}
          {responseSize && (
            <Col span={8}>
              <div className="text-center p-3 bg-orange-50 rounded">
                <div className="text-sm text-gray-500">响应大小</div>
                <div className="text-lg font-medium text-orange-600">{responseSize}B</div>
              </div>
            </Col>
          )}
        </Row>
      )}

      {showMetrics && responseTime && (
        <Badge 
          status={isSuccess ? 'success' : 'error'}
          text={`${responseTime}ms`}
          style={{ marginTop: '8px' }}
        />
      )}
    </div>
  );
};

export default ResponseStatus;
