import React, { useState } from 'react';
import { Card, Button, Input, Tag, Select, Switch, Tabs, Space, Row, Col, message, Table, Checkbox } from 'antd';
import { PlayCircleOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, HistoryOutlined, ImportOutlined } from '@ant-design/icons';
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
    { key: '', value: '', description: '', enabled: true }
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
    value: string | boolean
  ) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    
    // 如果是最后一行且key不为空，自动添加新行
    if (index === params.length - 1 && field === 'key' && value && typeof value === 'string') {
      newParams.push({ key: '', value: '', description: '', enabled: true });
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
    showDescription = true
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
      title: 'Key',
      dataIndex: 'key',
      width: '25%',
      render: (key: string, record: ParamRow, index: number) => (
        <Input
          placeholder="参数名"
          value={key}
          onChange={(e) => updateParamRow(params, setParams, index, 'key', e.target.value)}
          style={{ border: 'none', boxShadow: 'none' }}
        />
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      width: showDescription ? '35%' : '60%',
      render: (value: string, record: ParamRow, index: number) => (
        <Input
          placeholder="参数值"
          value={value}
          onChange={(e) => updateParamRow(params, setParams, index, 'value', e.target.value)}
          style={{ border: 'none', boxShadow: 'none' }}
        />
      ),
    },
    ...(showDescription ? [{
      title: 'Description',
      dataIndex: 'description',
      width: '30%',
      render: (description: string, record: ParamRow, index: number) => (
        <Input
          placeholder="描述"
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
                Send
              </Button>
            </Col>
          </Row>
        </div>

        {/* 快速操作按钮 */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button size="small" icon={<SaveOutlined />}>Save</Button>
            <Button size="small" icon={<HistoryOutlined />}>History</Button>
            <Button size="small" icon={<ImportOutlined />}>Import</Button>
            <Tag color="blue">Saved requests: 12</Tag>
          </Space>
        </div>

        {/* 参数配置标签页 */}
        <Tabs
          defaultActiveKey="params"
          items={[
            {
              key: 'params',
              label: (
                <span>
                  Params 
                  <Tag color="blue" style={{ marginLeft: 4 }}>
                    {queryParams.filter(p => p.enabled && p.key).length}
                  </Tag>
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                    Query parameters are appended to the end of the request URL, following '?'.
                  </div>
                  <Table
                    dataSource={queryParams}
                    columns={getParamColumns(queryParams, setQueryParams)}
                    pagination={false}
                    size="small"
                    rowKey={(record, index) => index?.toString() || ''}
                    showHeader={queryParams.some(p => p.key)}
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
              label: 'Authorization',
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Select
                      value={authType}
                      onChange={setAuthType}
                      style={{ width: 200 }}
                      placeholder="Select auth type"
                    >
                      <Option value="none">No Auth</Option>
                      <Option value="bearer">Bearer Token</Option>
                      <Option value="basic">Basic Auth</Option>
                      <Option value="api-key">API Key</Option>
                    </Select>
                  </div>
                  
                  {authType === 'bearer' && (
                    <div>
                      <div style={{ marginBottom: 8, fontWeight: 500 }}>Token</div>
                      <Input.Password
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        placeholder="Enter your bearer token"
                        style={{ fontFamily: 'monospace' }}
                      />
                      <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                        This token will be sent in the Authorization header as "Bearer {'{token}'}"
                      </div>
                    </div>
                  )}
                  
                  {authType === 'basic' && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Username</div>
                        <Input placeholder="Username" />
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Password</div>
                        <Input.Password placeholder="Password" />
                      </Col>
                    </Row>
                  )}
                  
                  {authType === 'api-key' && (
                    <Row gutter={16}>
                      <Col span={8}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Key</div>
                        <Input placeholder="API Key name" />
                      </Col>
                      <Col span={8}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Value</div>
                        <Input.Password placeholder="API Key value" />
                      </Col>
                      <Col span={8}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Add to</div>
                        <Select defaultValue="header" style={{ width: '100%' }}>
                          <Option value="header">Header</Option>
                          <Option value="query">Query Params</Option>
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
                  Headers 
                  <Tag color="green" style={{ marginLeft: 4 }}>
                    {headers.filter(h => h.enabled && h.key).length}
                  </Tag>
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                    Headers let the client and the server pass additional information with the HTTP request or response.
                  </div>
                  <Table
                    dataSource={headers}
                    columns={getParamColumns(headers, setHeaders)}
                    pagination={false}
                    size="small"
                    rowKey={(record, index) => index?.toString() || ''}
                    showHeader={headers.some(h => h.key)}
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
              label: 'Body',
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      {['none', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary'].map(type => (
                        <label key={type} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="bodyType"
                            value={type}
                            checked={bodyType === type}
                            onChange={(e) => setBodyType(e.target.value as any)}
                            style={{ marginRight: 4 }}
                          />
                          {type === 'x-www-form-urlencoded' ? 'x-www-form-urlencoded' : 
                           type.charAt(0).toUpperCase() + type.slice(1)}
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
                      This request does not have a body
                    </div>
                  )}

                  {bodyType === 'form-data' && (
                    <div>
                      <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                        Form data allows you to send key-value pairs, and you can also send files.
                      </div>
                      <Table
                        dataSource={formData}
                        columns={getParamColumns(formData, setFormData, false)}
                        pagination={false}
                        size="small"
                        rowKey={(record, index) => index?.toString() || ''}
                        showHeader={formData.some(f => f.key)}
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
                          <Option value="text">Text</Option>
                          <Option value="javascript">JavaScript</Option>
                          <Option value="json">JSON</Option>
                          <Option value="html">HTML</Option>
                          <Option value="xml">XML</Option>
                        </Select>
                        <Button size="small" onClick={formatJson}>Beautify</Button>
                        <Button size="small">Minify</Button>
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: 'auto' }}>
                          {bodyContent.length} characters
                        </span>
                      </div>
                      <TextArea
                        value={bodyContent}
                        onChange={(e) => setBodyContent(e.target.value)}
                        placeholder="Enter request body"
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
                </div>
              ),
            },
            {
              key: 'pre-request',
              label: 'Pre-request Script',
              children: (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#999',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '6px'
                }}>
                  <div>Add JavaScript code to execute before sending the request</div>
                  <Button type="link">Learn more about pre-request scripts</Button>
                </div>
              ),
            },
            {
              key: 'tests',
              label: 'Tests',
              children: (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#999',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '6px'
                }}>
                  <div>Add JavaScript code to execute after receiving the response</div>
                  <Button type="link">Learn more about test scripts</Button>
                </div>
              ),
            },
            {
              key: 'settings',
              label: 'Settings',
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div style={{ marginBottom: 8, fontWeight: 500 }}>Request timeout (ms)</div>
                      <Input type="number" defaultValue="0" placeholder="0 for infinite" />
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        How long to wait for a response (milliseconds)
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 8, fontWeight: 500 }}>Max redirects</div>
                      <Input type="number" defaultValue="5" />
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        Maximum number of redirects to follow
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch defaultChecked />
                        <span>Follow redirects</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        Automatically follow HTTP redirects
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch />
                        <span>Follow original HTTP method</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        Use the original HTTP method when following redirects
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