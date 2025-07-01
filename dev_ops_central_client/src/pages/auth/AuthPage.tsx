import React, { useState } from 'react';
import { Card, message, Tabs, Checkbox, Form, Button } from 'antd';
import { LoginForm, RegisterForm } from '../../types';
import { AuthForm, loginFormFields, registerFormFields } from '../../components/common';

interface AuthPageProps {
  onLogin: (userData: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟用户数据
      const userData = {
        id: '1',
        username: values.username,
        email: 'user@example.com',
        role: values.username === 'admin' ? 'system_admin' : 
              values.username === 'groupowner' ? 'group_owner' :
              values.username === 'projectadmin' ? 'project_admin' : 'user',
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onLogin(userData);
      message.success('登录成功！');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterForm) => {
    setLoading(true);
    try {
      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('注册成功！请登录');
      setActiveTab('login');
    } catch (error) {
      message.error('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <Form
      layout="vertical"
      onFinish={handleLogin}
      initialValues={{ remember: true }}
      size="large"
    >
      {loginFormFields.map(field => (
        <Form.Item
          key={field.name}
          name={field.name}
          rules={field.required ? [{ required: true, message: `请输入${field.placeholder}!` }] : []}
        >
          {field.type === 'password' ? (
            <input 
              type="password"
              placeholder={field.placeholder}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          ) : (
            <input 
              type="text"
              placeholder={field.placeholder}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          )}
        </Form.Item>
      ))}
      
      <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: '16px' }}>
        <Checkbox>记住我</Checkbox>
      </Form.Item>
      
      <Form.Item style={{ marginBottom: 0 }}>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          block
          size="large"
        >
          {loading ? '登录中...' : '登录'}
        </Button>
      </Form.Item>
    </Form>
  );

  const registerForm = (
    <Form
      layout="vertical"
      onFinish={handleRegister}
      size="large"
    >
      {registerFormFields.map(field => (
        <Form.Item
          key={field.name}
          name={field.name}
          rules={[
            ...(field.required ? [{ required: true, message: `请输入${field.placeholder}!` }] : []),
            ...(field.rules || [])
          ]}
          dependencies={field.dependencies}
        >
          {field.type === 'password' ? (
            <input 
              type="password"
              placeholder={field.placeholder}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          ) : field.type === 'email' ? (
            <input 
              type="email"
              placeholder={field.placeholder}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          ) : (
            <input 
              type="text"
              placeholder={field.placeholder}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          )}
        </Form.Item>
      ))}
      
      <Form.Item style={{ marginBottom: 0 }}>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          block
          size="large"
        >
          {loading ? '注册中...' : '注册'}
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: loginForm,
    },
    {
      key: 'register',
      label: '注册',
      children: registerForm,
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <Card style={{
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: 0,
            marginBottom: '8px'
          }}>
            API管理平台
          </h1>
          <p style={{ 
            color: '#6b7280', 
            margin: 0,
            fontSize: '14px'
          }}>
            接口管理与调试的专业平台
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={tabItems}
        />

        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center', 
          fontSize: '12px', 
          color: '#666',
          lineHeight: '1.4'
        }}>
          <p style={{ margin: '4px 0' }}>测试账号：</p>
          <p style={{ margin: '4px 0' }}>管理员: admin / 群主: groupowner</p>
          <p style={{ margin: '4px 0' }}>专案管理员: projectadmin / 普通用户: user</p>
          <p style={{ margin: '4px 0' }}>密码随意</p>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;