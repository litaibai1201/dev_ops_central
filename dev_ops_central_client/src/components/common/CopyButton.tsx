import React from 'react';
import { Button, message, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

interface CopyButtonProps {
  text: string;
  successMessage?: string;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'ghost' | 'dashed' | 'link' | 'text';
  tooltip?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  successMessage = '已复制到剪贴板',
  size = 'middle',
  type = 'default',
  tooltip = '复制',
  children,
  style,
  className
}) => {
  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      await navigator.clipboard.writeText(text);
      message.success(successMessage);
    } catch (error) {
      message.error('复制失败');
    }
  };

  const button = (
    <Button
      icon={<CopyOutlined />}
      size={size}
      type={type}
      onClick={handleCopy}
      style={style}
      className={className}
    >
      {children || '复制'}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default CopyButton;
