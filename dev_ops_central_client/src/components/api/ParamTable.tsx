import React from 'react';
import { Table, Input, Select, Switch, Button, Space, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

export interface ParamLocation {
  value: string;
  label: string;
  description: string;
}

export interface ParamType {
  value: string;
  label: string;
}

export interface BaseParam {
  key: string;
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
  parentKey?: string;
  level: number;
}

export interface RequestParam extends BaseParam {
  location: string;
}

export interface ResponseParam extends BaseParam {}

export interface ParamTableProps<T extends BaseParam> {
  params: T[];
  onParamChange: (key: string, field: keyof T, value: any) => void;
  onAddParam: (parentKey?: string) => void;
  onRemoveParam: (key: string) => void;
  paramTypes: ParamType[];
  supportedLocations?: ParamLocation[];
  type: 'request' | 'response';
  emptyText?: string;
  showLocationColumn?: boolean;
}

export const DEFAULT_PARAM_TYPES: ParamType[] = [
  { value: 'string', label: 'String (字符串)' },
  { value: 'number', label: 'Number (数字)' },
  { value: 'integer', label: 'Integer (整数)' },
  { value: 'boolean', label: 'Boolean (布尔)' },
  { value: 'array', label: 'Array (数组)' },
  { value: 'object', label: 'Object (对象)' },
  { value: 'file', label: 'File (文件)' }
];

export const DEFAULT_PARAM_LOCATIONS: ParamLocation[] = [
  { value: 'query', label: '查询参数 (Query)', description: '附加在URL后面，如 ?page=1&size=10' },
  { value: 'path', label: '路径参数 (Path)', description: '嵌入在URL路径中，如 /users/{id}' },
  { value: 'body', label: '请求体 (Body)', description: 'JSON格式的请求数据' }
];

function ParamTable<T extends BaseParam>({
  params,
  onParamChange,
  onAddParam,
  onRemoveParam,
  paramTypes,
  supportedLocations = [],
  type,
  emptyText = '暂无参数',
  showLocationColumn = true
}: ParamTableProps<T>) {
  
  // 渲染嵌套参数名称
  const renderNestedParamName = (text: string, record: T) => {
    const indent = record.level * 20;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: indent }} />
        {record.level > 0 && (
          <span style={{ color: '#999', marginRight: 8 }}>
            {'└'.repeat(record.level)}
          </span>
        )}
        <Input
          value={text}
          onChange={(e) => onParamChange(record.key, 'name' as keyof T, e.target.value)}
          placeholder={type === 'request' ? '参数名称' : '响应字段名'}
          size="small"
          style={{ width: `calc(100% - ${indent + (record.level > 0 ? 30 : 0)}px)` }}
        />
      </div>
    );
  };

  // 基础列配置
  const baseColumns: ColumnsType<T> = [
    {
      title: type === 'request' ? '参数名' : '字段名',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: renderNestedParamName,
    },
    {
      title: type === 'request' ? '参数类型' : '字段类型',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => onParamChange(record.key, 'type' as keyof T, value)}
          size="small"
          style={{ width: '100%' }}
        >
          {paramTypes.map(paramType => (
            <Select.Option key={paramType.value} value={paramType.value}>
              {paramType.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: type === 'request' ? '必填' : '必返回',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (checked, record) => (
        <Switch
          checked={checked}
          onChange={(checked) => onParamChange(record.key, 'required' as keyof T, checked)}
          size="small"
        />
      ),
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => onParamChange(record.key, 'description' as keyof T, e.target.value)}
          placeholder={type === 'request' ? '参数说明' : '字段说明'}
          size="small"
        />
      ),
    },
    {
      title: '示例值',
      dataIndex: 'example',
      key: 'example',
      width: 120,
      render: (text, record) => (
        <Input
          value={text || ''}
          onChange={(e) => onParamChange(record.key, 'example' as keyof T, e.target.value)}
          placeholder="示例"
          size="small"
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {(record.type === 'object' || record.type === 'array') && (
            <Tooltip title={type === 'request' ? '添加子参数' : '添加子字段'}>
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => onAddParam(record.key)}
              />
            </Tooltip>
          )}
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onRemoveParam(record.key)}
          />
        </Space>
      ),
    },
  ];

  // 请求参数需要添加位置列
  const requestColumns: ColumnsType<T> = [
    baseColumns[0], // 参数名
    ...(showLocationColumn ? [{
      title: '参数位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (text: string, record: T) => (
        <Select
          value={text}
          onChange={(value) => onParamChange(record.key, 'location' as keyof T, value)}
          size="small"
          style={{ width: '100%' }}
          disabled={!!record.parentKey}
        >
          {supportedLocations.map(location => (
            <Select.Option key={location.value} value={location.value}>
              {location.label}
            </Select.Option>
          ))}
        </Select>
      ),
    }] : []),
    ...baseColumns.slice(1), // 其他列
  ];

  const columns = (type === 'request' && showLocationColumn) ? requestColumns : baseColumns;

  return (
    <Table
      columns={columns}
      dataSource={params}
      pagination={false}
      size="small"
      locale={{ emptyText }}
      rowKey="key"
    />
  );
}

export default ParamTable;