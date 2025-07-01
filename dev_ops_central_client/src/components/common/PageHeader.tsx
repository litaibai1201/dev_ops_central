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
      className={`mb-6 ${className || ''}`}
      style={style}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBack && (
            <>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={onBack}
                size="large"
              >
                {backText}
              </Button>
              <Divider type="vertical" style={{ height: '32px' }} />
            </>
          )}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800 m-0">
                {title}
              </h1>
              {tags}
            </div>
            {subtitle && (
              <p className="text-gray-600 m-0 text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {extra}
          {actions.length > 0 && (
            <Space size="middle">
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
