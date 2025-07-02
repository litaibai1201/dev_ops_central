import React from 'react';
import { Space, Button, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface ActionButton {
  key: string;
  text: string;
  type?: 'default' | 'primary' | 'ghost' | 'dashed' | 'link' | 'text';
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showBackButton?: boolean; // 新增属性，与showBack相同
  onBack?: () => void;
  backText?: string;
  actions?: ActionButton[];
  tags?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showBackButton = false, // 新增属性
  onBack,
  backText = '返回',
  actions = [],
  tags,
  extra,
  style,
  className
}) => {
  return (
    <div 
      style={{
        marginBottom: '24px',
        ...style
      }}
      className={className}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          {(showBack || showBackButton) && (
            <>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={onBack}
                size="large"
                style={{ marginRight: '16px' }}
              >
                {backText}
              </Button>
              <Divider type="vertical" style={{ height: '32px', marginRight: '16px' }} />
            </>
          )}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px' 
            }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0,
                marginRight: '12px'
              }}>
                {title}
              </h1>
              {tags}
            </div>
            {subtitle && (
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '16px'
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          {extra}
          {actions.length > 0 && (
            <Space size="middle" style={{ marginLeft: '12px' }}>
              {actions.map(action => (
                <Button
                  key={action.key}
                  type={action.type || 'default'}
                  icon={action.icon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  loading={action.loading}
                  size="large"
                >
                  {action.text}
                </Button>
              ))}
            </Space>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
