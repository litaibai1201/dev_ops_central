import React, { useState } from 'react';
import { Card, Button, Input, Tag, Select, Switch, Tabs, Space, Row, Col, message, Table, Checkbox, Upload } from 'antd';
import { PlayCircleOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { ApiMethod } from '../../types';
import { HttpMethodTag } from '../common';

const { TextArea } = Input;
const { Option } = Select;

interface ApiTestConfigProps {
  api: ApiMethod;
}

interface ParamRow {
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
  type?: 'text' | 'file'; // 用于form-data类型选择
  file?: File | null; // 用于存储上传的文件
}

const ApiTestConfig: React.FC<ApiTestConfigProps> = ({ api }) => {
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');
  const [fullUrl, setFullUrl] = useState(`${baseUrl}${api.url}`);
  
  // 请求参数状态
  const [queryParams, setQueryParams] = useState<ParamRow[]>([
    { key: '', value: '', description: '', enabled: true }
  ]);
  
  // 请求头状态
  const [headers, setHeaders] = useState<ParamRow[]>(
    Object.entries(api.headers).map(([key, value]) => ({ 
      key, 
      value, 
      description: key === 'Content-Type' ? '请求内容类型' : '', 
      enabled: true 
    })).concat([{ key: '', value: '', description: '', enabled: true }])
  );
  
  // 请求体状态
  const [bodyType, setBodyType] = useState<'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary'>('raw');
  const [bodyContent, setBodyContent] = useState(api.body?.content || '');
  const [formData, setFormData] = useState<ParamRow[]>([
    { key: '', value: '', description: '', enabled: true, type: 'text' }
  ]);
  
  // 认证状态
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic' | 'api-key'>('none');
  const [authToken, setAuthToken] = useState('');

  // 通用的参数更新函数
  const updateParamRow = (
    params: ParamRow[], 
    setParams: React.Dispatch<React.SetStateAction<ParamRow[]>>, 
    index: number, 
    field: keyof ParamRow, 
    value: string | boolean | File | null
  ) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    
    // 如果是最后一行且key不为空，自动添加新行
    if (index === params.length - 1 && field === 'key' && value && typeof value === 'string') {
      const newRow: ParamRow = { key: '', value: '', description: '', enabled: true };
      if (params === formData) {
        newRow.type = 'text';
      }
      newParams.push(newRow);
    }
    
    setParams(newParams);
  };

  const removeParamRow = (
    params: ParamRow[], 
    setParams: React.Dispatch<React.SetStateAction<ParamRow[]>>, 
    index: number
  ) => {
    if (params.length > 1) {
      const newParams = params.filter((_, i) => i !== index);
      setParams(newParams);
    }
  };

  // 参数表格列配置
  const getParamColumns = (
    params: ParamRow[], 
    setParams: React.Dispatch<React.SetStateAction<ParamRow[]>>,
    showDescription = true,
    isFormData = false
  ) => [
    {
      title: '',
      dataIndex: 'enabled',
      width: 40,
      render: (enabled: boolean, record: ParamRow, index: number) => (
        <Checkbox
          checked={enabled}
          onChange={(e) => updateParamRow(params, setParams, index, 'enabled', e.target.checked)}
        />
      ),
    },
    {
      title: '参数名',
      dataIndex: 'key',
      width: isFormData ? '20%' : '25%',
      render: (key: string, record: ParamRow, index: number) => (
        <Input
          placeholder="请输入参数名"
          value={key}
          onChange={(e) => updateParamRow(params, setParams, index, 'key', e.target.value)}
          style={{ border: 'none', boxShadow: 'none' }}
        />
      ),
    },
    ...(isFormData ? [{
      title: '类型',
      dataIndex: 'type',
      width: '15%',
      render: (type: string, record: ParamRow, index: number) => (
        <Select
          value={type || 'text'}
          onChange={(value) => {
            updateParamRow(params, setParams, index, 'type', value);
            // 如果切换到text类型，清除文件
            if (value === 'text') {
              updateParamRow(params, setParams, index, 'file', null);
            }
          }}
          style={{ width: '100%', border: 'none' }}
          size="small"
        >
          <Option value="text">文本</Option>
          <Option value="file">文件</Option>
        </Select>
      ),
    }] : []),
    {
      title: isFormData ? '值/文件' : '参数值',
      dataIndex: 'value',
      width: isFormData ? '30%' : (showDescription ? '35%' : '60%'),
      render: (value: string, record: ParamRow, index: number) => {
        if (isFormData && record.type === 'file') {
          return (
            <Upload
              beforeUpload={(file) => {
                updateParamRow(params, setParams, index, 'file', file);
                updateParamRow(params, setParams, index, 'value', file.name);
                return false; // 阻止自动上传
              }}
              showUploadList={false}
              accept="*/*"
            >
              <Button 
                size="small" 
                icon={<UploadOutlined />}
                style={{ width: '100%' }}
              >
                {record.file ? record.file.name : '选择文件'}
              </Button>
            </Upload>
          );
        }
        
        return (
          <Input
            placeholder={isFormData ? "请输入值" : "请输入参数值"}
            value={value}
            onChange={(e) => updateParamRow(params, setParams, index, 'value', e.target.value)}
            style={{ border: 'none', boxShadow: 'none' }}
          />
        );
      },
    },
    ...(showDescription ? [{
      title: '描述',
      dataIndex: 'description',
      width: isFormData ? '25%' : '30%',
      render: (description: string, record: ParamRow, index: number) => (
        <Input
          placeholder="请输入描述"
          value={description}
          onChange={(e) => updateParamRow(params, setParams, index, 'description', e.target.value)}
          style={{ border: 'none', boxShadow: 'none' }}
        />
      ),
    }] : []),
    {
      title: '',
      width: 40,
      render: (text: any, record: ParamRow, index: number) => (
        params.length > 1 && (
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeParamRow(params, setParams, index)}
          />
        )
      ),
    },
  ];

  const formatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(bodyContent), null, 2);
      setBodyContent(formatted);
      message.success('JSON格式化成功');
    } catch (error) {
      message.error('JSON格式化失败，请检查格式');
    }
  };

  return (
    <div>
      {/* URL配置区域 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={8} align="middle">
            <Col span={2}>
              <Select value={api.method} style={{ width: '100%' }}>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="DELETE">DELETE</Option>
                <Option value="PATCH">PATCH</Option>
              </Select>
            </Col>
            <Col span={18}>
              <Input
                value={fullUrl}
                onChange={(e) => setFullUrl(e.target.value)}
                placeholder="请输入请求URL"
                size="large"
                style={{ fontFamily: 'monospace' }}
              />
            </Col>
            <Col span={4}>
              <Button 
                type="primary" 
                size="large" 
                icon={<PlayCircleOutlined />}
                block
                style={{ fontWeight: 600 }}
              >
                发送请求
              </Button>
            </Col>
          </Row>
        </div>

        {/* 参数配置标签页 */}
        <Tabs
          defaultActiveKey="params"
          items={[
            {
              key: 'params',
              label: (
                <span>
                  请求参数
                  <Tag color="blue" style={{ marginLeft: 4 }}>
                    {queryParams.filter(p => p.enabled && p.key).length}
                  </Tag>
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                    查询参数将附加在请求URL的末尾，跟在'?'之后。
                  </div>
                  <Table
                    dataSource={queryParams}
                    columns={getParamColumns(queryParams, setQueryParams)}
                    pagination={false}
                    size="small"
                    rowKey={(record, index) => index?.toString() || ''}
                    showHeader={true}
                    style={{ 
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'authorization',
              label: '身份认证',
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Select
                      value={authType}
                      onChange={setAuthType}
                      style={{ width: 200 }}
                      placeholder="选择认证类型"
                    >
                      <Option value="none">无认证</Option>
                      <Option value="bearer">Bearer Token</Option>
                      <Option value="basic">基础认证</Option>
                      <Option value="api-key">API Key</Option>
                    </Select>
                  </div>
                  
                  {authType === 'bearer' && (
                    <div>
                      <div style={{ marginBottom: 8, fontWeight: 500 }}>Token</div>
                      <Input.Password
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        placeholder="请输入Bearer Token"
                        style={{ fontFamily: 'monospace' }}
                      />
                      <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                        此Token将在Authorization请求头中以"Bearer {'{token}'}"的形式发送
                      </div>
                    </div>
                  )}
                  
                  {authType === 'basic' && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>用户名</div>
                        <Input placeholder="请输入用户名" />
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>密码</div>
                        <Input.Password placeholder="请输入密码" />
                      </Col>
                    </Row>
                  )}
                  
                  {authType === 'api-key' && (
                    <Row gutter={16}>
                      <Col span={8}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Key名称</div>
                        <Input placeholder="API Key名称" />
                      </Col>
                      <Col span={8}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Key值</div>
                        <Input.Password placeholder="API Key值" />
                      </Col>
                      <Col span={8}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>添加到</div>
                        <Select defaultValue="header" style={{ width: '100%' }}>
                          <Option value="header">请求头</Option>
                          <Option value="query">查询参数</Option>
                        </Select>
                      </Col>
                    </Row>
                  )}
                </div>
              ),
            },
            {
              key: 'headers',
              label: (
                <span>
                  请求头
                  <Tag color="green" style={{ marginLeft: 4 }}>
                    {headers.filter(h => h.enabled && h.key).length}
                  </Tag>
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                    请求头允许客户端和服务器传递HTTP请求或响应的附加信息。
                  </div>
                  <Table
                    dataSource={headers}
                    columns={getParamColumns(headers, setHeaders)}
                    pagination={false}
                    size="small"
                    rowKey={(record, index) => index?.toString() || ''}
                    showHeader={true}
                    style={{ 
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'body',
              label: '请求体',
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      {[
                        { value: 'none', label: '无' },
                        { value: 'form-data', label: 'form-data' },
                        { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
                        { value: 'raw', label: '原始数据' },
                        { value: 'binary', label: '二进制' }
                      ].map(type => (
                        <label key={type.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="bodyType"
                            value={type.value}
                            checked={bodyType === type.value}
                            onChange={(e) => setBodyType(e.target.value as any)}
                            style={{ marginRight: 4 }}
                          />
                          {type.label}
                        </label>
                      ))}
                    </Space>
                  </div>

                  {bodyType === 'none' && (
                    <div style={{ 
                      padding: '40px', 
                      textAlign: 'center', 
                      color: '#999',
                      border: '1px dashed #d9d9d9',
                      borderRadius: '6px'
                    }}>
                      此请求没有请求体
                    </div>
                  )}

                  {bodyType === 'form-data' && (
                    <div>
                      <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                        表单数据允许您发送键值对，也可以发送文件。
                      </div>
                      <Table
                        dataSource={formData}
                        columns={getParamColumns(formData, setFormData, true, true)}
                        pagination={false}
                        size="small"
                        rowKey={(record, index) => index?.toString() || ''}
                        showHeader={true}
                        style={{ 
                          border: '1px solid #f0f0f0',
                          borderRadius: '6px'
                        }}
                      />
                    </div>
                  )}

                  {bodyType === 'x-www-form-urlencoded' && (
                    <div>
                      <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                        URL编码的表单数据，键值对将以URL编码的格式发送。
                      </div>
                      <Table
                        dataSource={formData}
                        columns={getParamColumns(formData, setFormData, false)}
                        pagination={false}
                        size="small"
                        rowKey={(record, index) => index?.toString() || ''}
                        showHeader={true}
                        style={{ 
                          border: '1px solid #f0f0f0',
                          borderRadius: '6px'
                        }}
                      />
                    </div>
                  )}

                  {bodyType === 'raw' && (
                    <div>
                      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Select value="json" style={{ width: 120 }}>
                          <Option value="text">文本</Option>
                          <Option value="javascript">JavaScript</Option>
                          <Option value="json">JSON</Option>
                          <Option value="html">HTML</Option>
                          <Option value="xml">XML</Option>
                        </Select>
                        <Button size="small" onClick={formatJson}>格式化</Button>
                        <Button size="small">压缩</Button>
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: 'auto' }}>
                          {bodyContent.length} 个字符
                        </span>
                      </div>
                      <TextArea
                        value={bodyContent}
                        onChange={(e) => setBodyContent(e.target.value)}
                        placeholder="请输入请求体内容"
                        rows={15}
                        style={{ 
                          fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  )}

                  {bodyType === 'binary' && (
                    <div style={{ 
                      padding: '40px', 
                      textAlign: 'center', 
                      color: '#999',
                      border: '1px dashed #d9d9d9',
                      borderRadius: '6px'
                    }}>
                      <Upload>
                        <Button icon={<UploadOutlined />}>选择二进制文件</Button>
                      </Upload>
                      <div style={{ marginTop: 8 }}>支持上传任意格式的二进制文件</div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'settings',
              label: '设置',
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div style={{ marginBottom: 8, fontWeight: 500 }}>请求超时时间 (毫秒)</div>
                      <Input type="number" defaultValue="0" placeholder="0表示无限制" />
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        等待响应的最长时间（毫秒）
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 8, fontWeight: 500 }}>最大重定向次数</div>
                      <Input type="number" defaultValue="5" />
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        允许跟随的最大重定向次数
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch defaultChecked />
                        <span>跟随重定向</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        自动跟随HTTP重定向
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch />
                        <span>保持原始HTTP方法</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        在跟随重定向时使用原始的HTTP方法
                      </div>
                    </Col>
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ApiTestConfig;