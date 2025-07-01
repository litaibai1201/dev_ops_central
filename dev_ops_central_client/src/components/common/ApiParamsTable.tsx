import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { ApiParam } from '../../types';

const { Text } = Typography;

interface ApiParamsTableProps {
  params: ApiParam[];
  size?: 'small' | 'middle' | 'large';
  showRequired?: boolean;
  showExample?: boolean;
}

const ApiParamsTable: React.FC<ApiParamsTableProps> = ({
  params,
  size = 'small',
  showRequired = true,
  showExample = true
}) => {
  const columns = [
    {
      title: '参数名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ApiParam) => (
        <div>
          <Text>{name}</Text>
          {showRequired && record.required && (
            <Text type="danger" style={{ marginLeft: 4 }}>*</Text>
          )}
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    }
  ];

  if (showRequired) {
    columns.push({
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      render: (required: boolean) => required ? 
        <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
        <Text type="secondary">否</Text>,
    });
  }

  columns.push({
    title: '说明',
    dataIndex: 'description',
    key: 'description',
  });

  if (showExample) {
    columns.push({
      title: '示例',
      dataIndex: 'example',
      key: 'example',
      render: (example: string) => example ? <Text>{example}</Text> : '-',
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={params}
      rowKey="id"
      pagination={false}
      size={size}
    />
  );
};

export default ApiParamsTable;
