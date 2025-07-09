import React from 'react';
import { Table, Input, Switch, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

export interface RequestHeader {
  key: string;
  name: string;
  value: string;
  required: boolean;
  description: string;
  readonly?: boolean; // 只读头部，如 Content-Type
}

export interface RequestHeaderTableProps {
  headers: RequestHeader[];
  onHeaderChange: (key: string, field: keyof RequestHeader, value: any) => void;
  onRemoveHeader: (key: string) => void;
  emptyText?: string;
}

const RequestHeaderTable: React.FC<RequestHeaderTableProps> = ({
  headers,
  onHeaderChange,
  onRemoveHeader,
  emptyText = '暂无请求头'
}) => {
  const columns: ColumnsType<RequestHeader> = [
    {
      title: '请求头名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => onHeaderChange(record.key, 'name', e.target.value)}
          placeholder="如：Authorization"
          size="small"
          disabled={record.readonly}
        />
      ),
    },
    {
      title: '默认值',
      dataIndex: 'value',
      key: 'value',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => onHeaderChange(record.key, 'value', e.target.value)}
          placeholder="如：Bearer {token}"
          size="small"
        />
      ),
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (checked, record) => (
        <Switch
          checked={checked}
          onChange={(checked) => onHeaderChange(record.key, 'required', checked)}
          size="small"
          disabled={record.readonly}
        />
      ),
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <Input
          value={text || ''}
          onChange={(e) => onHeaderChange(record.key, 'description', e.target.value)}
          placeholder="请求头说明"
          size="small"
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onRemoveHeader(record.key)}
          disabled={record.readonly}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={headers}
      pagination={false}
      size="small"
      locale={{ emptyText }}
      rowKey="key"
    />
  );
};

export default RequestHeaderTable;