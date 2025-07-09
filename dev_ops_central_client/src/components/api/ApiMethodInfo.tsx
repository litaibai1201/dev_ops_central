import React from 'react';
import { Alert, Tag, Divider, Typography } from 'antd';
import { HttpMethod } from './ApiMethodSelector';
import { ParamLocation } from './ParamTable';

const { Text } = Typography;

export interface ApiMethodInfoProps {
  method: HttpMethod;
  supportedLocations: ParamLocation[];
  className?: string;
  style?: React.CSSProperties;
}

const ApiMethodInfo: React.FC<ApiMethodInfoProps> = ({
  method,
  supportedLocations,
  className,
  style
}) => {
  return (
    <Alert
      message={`${method.label} 请求特性`}
      description={
        <div>
          <p><Text strong>用途：</Text>{method.description}</p>
          <p>
            <Text strong>支持的参数位置：</Text>
            {supportedLocations.map(location => (
              <Tag key={location.value} style={{ margin: '0 4px' }}>
                {location.label}
              </Tag>
            ))}
          </p>
          {!method.hasRequestBody && (
            <p><Text type="warning">注意：{method.label} 请求通常不包含请求体参数</Text></p>
          )}
        </div>
      }
      type="info"
      showIcon
      className={className}
      style={style}
    />
  );
};

export default ApiMethodInfo;