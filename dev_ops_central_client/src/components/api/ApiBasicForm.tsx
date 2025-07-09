import React from 'react';
import { Form, Input, Select, Row, Col, Badge, Tooltip } from 'antd';
import { ApiOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ApiMethodSelector, { HttpMethod } from './ApiMethodSelector';

const { TextArea } = Input;

export interface ApiBasicInfo {
  name: string;
  method: string;
  url: string;
  description: string;
  tags?: string[];
  status: string;
}

export interface ApiBasicFormProps {
  form: any;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  methods?: HttpMethod[];
  showUrlPrefix?: boolean;
  urlPrefixOptions?: Array<{ value: string; label: string }>;
  tagOptions?: Array<{ value: string; label: string }>;
  initialValues?: Partial<ApiBasicInfo>;
}

const defaultUrlPrefixOptions = [
  { value: '/api', label: '/api' },
  { value: '/v1', label: '/v1' },
  { value: '/v2', label: '/v2' }
];

const defaultTagOptions = [
  { value: '用户', label: '用户' },
  { value: '认证', label: '认证' },
  { value: '订单', label: '订单' },
  { value: '支付', label: '支付' }
];

const ApiBasicForm: React.FC<ApiBasicFormProps> = ({
  form,
  selectedMethod,
  onMethodChange,
  methods,
  showUrlPrefix = true,
  urlPrefixOptions = defaultUrlPrefixOptions,
  tagOptions = defaultTagOptions,
  initialValues
}) => {
  return (
    <>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="接口名称"
            name="name"
            rules={[
              { required: true, message: '请输入接口名称' },
              { min: 2, max: 50, message: '接口名称长度为2-50字符' }
            ]}
          >
            <Input
              placeholder="如：获取用户信息、创建订单"
              size="large"
              prefix={<ApiOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <span>
                请求方式
                <Tooltip title="选择合适的HTTP方法，会影响参数类型的选择">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                </Tooltip>
              </span>
            }
            name="method"
            rules={[{ required: true, message: '请选择请求方式' }]}
          >
            <ApiMethodSelector
              value={selectedMethod}
              onChange={onMethodChange}
              size="large"
              methods={methods}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="接口URL"
        name="url"
        rules={[
          { required: true, message: '请输入接口URL' },
          { pattern: /^\//, message: 'URL必须以 / 开头' }
        ]}
      >
        <Input
          placeholder="/api/users 或 /api/users/{id}"
          size="large"
          addonBefore={
            showUrlPrefix ? (
              <Select defaultValue="/api" style={{ width: 80 }}>
                {urlPrefixOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            ) : null
          }
        />
      </Form.Item>

      <Form.Item
        label="接口描述"
        name="description"
        rules={[
          { required: true, message: '请输入接口描述' },
          { min: 10, max: 200, message: '描述长度为10-200字符' }
        ]}
      >
        <TextArea
          placeholder="详细描述该接口的功能，如：根据用户ID获取用户详细信息，包括基本资料、权限等..."
          rows={3}
          showCount
          maxLength={200}
        />
      </Form.Item>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="接口标签"
            name="tags"
          >
            <Select
              mode="tags"
              placeholder="添加标签以便分类"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            >
              {tagOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="接口状态"
            name="status"
          >
            <Select placeholder="选择接口状态">
              <Select.Option value="draft">
                <Badge status="default" text="草稿" />
              </Select.Option>
              <Select.Option value="published">
                <Badge status="success" text="已发布" />
              </Select.Option>
              <Select.Option value="deprecated">
                <Badge status="warning" text="已废弃" />
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default ApiBasicForm;