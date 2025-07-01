import React from 'react';
import { Tag } from 'antd';

interface HttpMethodTagProps {
  method: string;
  size?: 'small' | 'middle' | 'large';
  style?: React.CSSProperties;
}

const HttpMethodTag: React.FC<HttpMethodTagProps> = ({ method, size = 'middle', style }) => {
  const getMethodColor = (method: string) => {
    const colorMap = {
      GET: 'green',
      POST: 'blue',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple'
    };
    return colorMap[method as keyof typeof colorMap] || 'default';
  };

  const getSizeStyle = (size: string) => {
    const sizeMap = {
      small: { fontSize: '12px', padding: '2px 6px' },
      middle: { fontSize: '14px', padding: '4px 8px' },
      large: { fontSize: '16px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px' }
    };
    return sizeMap[size as keyof typeof sizeMap] || sizeMap.middle;
  };

  return (
    <Tag 
      color={getMethodColor(method)} 
      style={{
        ...getSizeStyle(size),
        ...style
      }}
    >
      {method}
    </Tag>
  );
};

export default HttpMethodTag;
