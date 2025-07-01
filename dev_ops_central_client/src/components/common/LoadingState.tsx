import React from 'react';
import { Spin, Empty, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingStateProps {
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyText?: string;
  emptyDescription?: string;
  children: React.ReactNode;
  loadingText?: string;
  loadingSize?: 'small' | 'default' | 'large';
  minHeight?: string | number;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  loading = false,
  error,
  empty = false,
  emptyText = '暂无数据',
  emptyDescription,
  children,
  loadingText = '加载中...',
  loadingSize = 'default',
  minHeight = '200px'
}) => {
  const containerStyle = {
    minHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  if (error) {
    return (
      <div style={containerStyle}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <Spin 
          size={loadingSize}
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        >
          <div style={{ padding: '20px', textAlign: 'center' }}>
            {loadingText}
          </div>
        </Spin>
      </div>
    );
  }

  if (empty) {
    return (
      <div style={containerStyle}>
        <Empty
          description={
            <div>
              <div>{emptyText}</div>
              {emptyDescription && (
                <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                  {emptyDescription}
                </div>
              )}
            </div>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingState;
