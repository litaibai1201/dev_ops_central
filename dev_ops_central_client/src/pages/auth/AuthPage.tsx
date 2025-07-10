import React, { useState } from 'react';
import { Card, message, Tabs, Checkbox, Form, Button } from 'antd';
import { LoginForm, RegisterForm } from '../../types';
import { AuthForm, loginFormFields, registerFormFields } from '../../components/common';
import { authService } from '../../services/auth';

interface AuthPageProps {
  onLogin: (userData: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      
      if (response.success) {
        // 保存用户信息和token到localStorage
        const userWithToken = {
          ...response.data.user,
          token: response.data.token
        };
        localStorage.setItem('user', JSON.stringify(userWithToken));
        
        onLogin(userWithToken);
        message.success('登录成功！');
      } else {
        throw new Error(response.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      message.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterForm) => {
    setLoading(true);
    try {
      const response = await authService.register(values);
      
      if (response.success) {
        message.success('注册成功！请登录');
        setActiveTab('login');
      } else {
        throw new Error(response.message || '注册失败');
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      message.error(error.message || '注册失败，请重试');
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
          <p style={{ margin: '4px 0' }}>使用您的账号登录系统</p>
          <p style={{ margin: '4px 0' }}>如需帮助，请联系系统管理员</p>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;