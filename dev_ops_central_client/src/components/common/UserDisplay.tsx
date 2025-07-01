import React from 'react';
import { Avatar, Space } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';

interface UserDisplayProps {
  username: string;
  email?: string;
  avatar?: string;
  showEmail?: boolean;
  showCrown?: boolean;
  size?: 'small' | 'default' | 'large';
  avatarSize?: number | 'small' | 'default' | 'large';
  layout?: 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}

const UserDisplay: React.FC<UserDisplayProps> = ({
  username,
  email,
  avatar,
  showEmail = true,
  showCrown = false,
  size = 'default',
  avatarSize = 'default',
  layout = 'horizontal',
  style
}) => {
  const getFontSizes = (size: string) => {
    const sizeMap = {
      small: { username: '12px', email: '10px' },
      default: { username: '14px', email: '12px' },
      large: { username: '16px', email: '14px' }
    };
    return sizeMap[size as keyof typeof sizeMap] || sizeMap.default;
  };

  const fonts = getFontSizes(size);

  const userInfo = (
    <div style={{ minWidth: 0, flex: 1 }}>
      <div 
        className="font-medium user-info-text"
        style={{ 
          fontSize: fonts.username,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.4'
        }}
      >
        {username}
        {showCrown && (
          <CrownOutlined 
            className="ml-2 text-yellow-500" 
            style={{ fontSize: fonts.username }}
          />
        )}
      </div>
      {showEmail && email && (
        <div 
          className="text-gray-500 user-info-text"
          style={{ 
            fontSize: fonts.email,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '1.3'
          }}
        >
          {email}
        </div>
      )}
    </div>
  );

  if (layout === 'vertical') {
    return (
      <div style={{ textAlign: 'center', ...style }}>
        <Avatar 
          size={avatarSize} 
          src={avatar} 
          icon={<UserOutlined />} 
          className="mb-2"
          style={{
            border: '2px solid #e8e8e8',
            backgroundColor: avatar ? 'transparent' : '#1890ff',
            transition: 'all 0.3s ease'
          }}
        />
        {userInfo}
      </div>
    );
  }

  return (
    <div 
      className="flex items-center" 
      style={{ 
        gap: '12px',
        minWidth: 0,
        ...style 
      }}
    >
      <Avatar 
        size={avatarSize} 
        src={avatar} 
        icon={<UserOutlined />} 
        style={{
          border: '2px solid #e8e8e8',
          backgroundColor: avatar ? 'transparent' : '#1890ff',
          flexShrink: 0,
          transition: 'all 0.3s ease'
        }}
      />
      {userInfo}
    </div>
  );
};

export default UserDisplay;
