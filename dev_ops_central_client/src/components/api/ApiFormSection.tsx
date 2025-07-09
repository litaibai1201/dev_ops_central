import React from 'react';
import { Card } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

export interface ApiFormSectionProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

const ApiFormSection: React.FC<ApiFormSectionProps> = ({
  title = '接口基本信息',
  icon = <InfoCircleOutlined />,
  children,
  extra,
  style,
  bodyStyle
}) => {
  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <span>{title}</span>
        </div>
      }
      extra={extra}
      style={style}
      bodyStyle={bodyStyle}
    >
      {children}
    </Card>
  );
};

export default ApiFormSection;