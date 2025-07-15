import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

interface AuthFormField {
  name: string;
  label?: string;
  type: 'text' | 'password' | 'email' | 'username';
  required?: boolean;
  placeholder?: string;
  rules?: any[];
  dependencies?: string[];
  validator?: (rule: any, value: any, callback: any) => void;
}

interface AuthFormProps {
  fields: AuthFormField[];
  onFinish: (values: any) => void;
  loading?: boolean;
  submitText?: string;
  initialValues?: Record<string, any>;
  layout?: 'horizontal' | 'vertical' | 'inline';
  size?: 'small' | 'middle' | 'large';
  showCancel?: boolean;
  onCancel?: () => void;
  cancelText?: string;
  footer?: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({
  fields,
  onFinish,
  loading = false,
  submitText = '提交',
  initialValues,
  layout = 'vertical',
  size = 'large',
  showCancel = false,
  onCancel,
  cancelText = '取消',
  footer
}) => {
  const getFieldIcon = (type: string) => {
    const iconMap = {
      username: <UserOutlined />,
      email: <MailOutlined />,
      password: <LockOutlined />,
      text: <UserOutlined />
    };
    return iconMap[type as keyof typeof iconMap];
  };

  const getInputComponent = (field: AuthFormField) => {
    switch (field.type) {
      case 'password':
        return (
          <Input.Password 
            prefix={getFieldIcon(field.type)}
            placeholder={field.placeholder}
            size={size}
          />
        );
      case 'email':
        return (
          <Input 
            prefix={getFieldIcon(field.type)}
            placeholder={field.placeholder}
            type="email"
            size={size}
          />
        );
      default:
        return (
          <Input 
            prefix={getFieldIcon(field.type)}
            placeholder={field.placeholder}
            size={size}
          />
        );
    }
  };

  const getFieldRules = (field: AuthFormField) => {
    const rules = [...(field.rules || [])];
    
    if (field.required) {
      rules.unshift({ required: true, message: `请输入${field.label || field.placeholder || field.name}!` });
    }
    
    if (field.type === 'email') {
      rules.push({ type: 'email', message: '请输入有效的邮箱地址!' });
    }
    
    if (field.validator) {
      rules.push(field.validator);
    }
    
    return rules;
  };

  return (
    <Form
      layout={layout}
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
      size={size}
    >
      {fields.map(field => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          rules={getFieldRules(field)}
          dependencies={field.dependencies}
        >
          {getInputComponent(field)}
        </Form.Item>
      ))}

      {footer || (
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            {showCancel && (
              <Button onClick={onCancel}>
                {cancelText}
              </Button>
            )}
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block={!showCancel}
            >
              {submitText}
            </Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );
};

// 预设表单配置
export const loginFormFields: AuthFormField[] = [
  {
    name: 'username',
    type: 'username',
    placeholder: '用户名',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    placeholder: '密码',
    required: true
  }
];

export const registerFormFields: AuthFormField[] = [
  {
    name: 'username',
    type: 'username',
    placeholder: '用户名',
    required: true,
    rules: [{ min: 3, message: '用户名至少3个字符!' }]
  },
  {
    name: 'email',
    type: 'email',
    placeholder: '邮箱',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    placeholder: '密码',
    required: true,
    rules: [{ min: 8, message: '密码至少8个字符!' }]
  },
  {
    name: 'confirm_password',
    type: 'password',
    placeholder: '确认密码',
    required: true,
    dependencies: ['password'],
    validator: ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue('password') === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('两次输入的密码不一致!'));
      },
    })
  }
];

export default AuthForm;
