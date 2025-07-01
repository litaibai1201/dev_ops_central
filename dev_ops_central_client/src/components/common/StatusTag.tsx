import React from 'react';
import { Tag } from 'antd';

interface StatusTagProps {
  status: string;
  statusMap?: Record<string, { color: string; text: string }>;
  size?: 'small' | 'middle';
}

const StatusTag: React.FC<StatusTagProps> = ({ 
  status, 
  statusMap,
  size = 'middle'
}) => {
  const defaultStatusMap = {
    active: { color: 'green', text: '活跃' },
    inactive: { color: 'orange', text: '暂停' },
    archived: { color: 'red', text: '已归档' },
    published: { color: 'green', text: '已发布' },
    draft: { color: 'default', text: '草稿' },
    deprecated: { color: 'red', text: '已废弃' },
    pending: { color: 'orange', text: '待审批' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' },
    public: { color: 'green', text: '公开' },
    private: { color: 'orange', text: '私密' }
  };

  const finalStatusMap = statusMap || defaultStatusMap;
  const config = finalStatusMap[status];

  if (!config) {
    return <Tag>{status}</Tag>;
  }

  return (
    <Tag color={config.color} size={size}>
      {config.text}
    </Tag>
  );
};

export default StatusTag;
