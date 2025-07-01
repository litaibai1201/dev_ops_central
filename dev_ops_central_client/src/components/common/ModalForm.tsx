import React from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';

interface FormField {
  name: string;
  label: string;
  type?: 'input' | 'textarea' | 'select' | 'number';
  required?: boolean;
  placeholder?: string;
  rules?: any[];
  options?: { label: string; value: any }[];
  rows?: number;
}

interface ModalFormProps {
  title: string;
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  fields: FormField[];
  loading?: boolean;
  width?: number;
  initialValues?: Record<string, any>;
  okText?: string;
  cancelText?: string;
  destroyOnClose?: boolean;
  form?: any;
}

const ModalForm: React.FC<ModalFormProps> = ({
  title,
  visible,
  onCancel,
  onFinish,
  fields,
  loading = false,
  width = 520,
  initialValues,
  okText = '确定',
  cancelText = '取消',
  destroyOnClose = true,
  form
}) => {
  const [internalForm] = Form.useForm();
  const formInstance = form || internalForm;

  const handleCancel = () => {
    formInstance.resetFields();
    onCancel();
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <Input.TextArea 
            placeholder={field.placeholder}
            rows={field.rows || 3}
          />
        );
      case 'number':
        return (
          <Input 
            type="number"
            placeholder={field.placeholder}
          />
        );
      case 'select':
        return (
          <select placeholder={field.placeholder}>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <Input placeholder={field.placeholder} />
        );
    }
  };

  const getFieldRules = (field: FormField) => {
    const rules = [...(field.rules || [])];
    if (field.required) {
      rules.unshift({ required: true, message: `请输入${field.label}` });
    }
    return rules;
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={width}
      destroyOnClose={destroyOnClose}
    >
      <Form
        form={formInstance}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
      >
        {fields.map(field => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={getFieldRules(field)}
          >
            {renderField(field)}
          </Form.Item>
        ))}
        
        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel}>
              {cancelText}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              {okText}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 预设字段配置
export const groupFormFields: FormField[] = [
  {
    name: 'name',
    label: '群组名称',
    required: true,
    rules: [{ min: 2, message: '群组名称至少2个字符' }]
  },
  {
    name: 'description',
    label: '群组描述',
    type: 'textarea',
    required: true,
    placeholder: '输入群组描述',
    rows: 3
  }
];

export const projectFormFields: FormField[] = [
  {
    name: 'name',
    label: '项目名称',
    required: true,
    rules: [{ min: 2, message: '项目名称至少2个字符' }]
  },
  {
    name: 'description',
    label: '项目描述',
    type: 'textarea',
    required: true,
    placeholder: '输入项目描述',
    rows: 3
  },
  {
    name: 'version',
    label: '版本号',
    placeholder: '如: v1.0.0'
  }
];

export default ModalForm;
