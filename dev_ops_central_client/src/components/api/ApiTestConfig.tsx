import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Tag, Select, Switch, Tabs, Space, Row, Col, message, Table, Checkbox, Upload, Modal, Dropdown, MenuProps, Tooltip } from 'antd';
import { PlayCircleOutlined, DeleteOutlined, UploadOutlined, ImportOutlined, DownOutlined } from '@ant-design/icons';
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

// 临时缓存存储 - 页面刷新后会重置
interface TestConfigCache {
  baseUrl: string;
  fullUrl: string;
  queryParams: ParamRow[];
  headers: ParamRow[];
  bodyType: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';
  bodyContent: string;
  formData: ParamRow[];
  authType: 'none' | 'bearer' | 'basic' | 'api-key';
  authToken: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  apiKey?: {
    name: string;
    value: string;
    addTo: 'header' | 'query';
  };
  settings?: {
    timeout: number;
    maxRedirects: number;
    followRedirects: boolean;
    followOriginalMethod: boolean;
  };
}

// 内存中的缓存存储 - 以API ID为键
const testConfigCache: Map<string, TestConfigCache> = new Map();

const ApiTestConfig: React.FC<ApiTestConfigProps> = ({ api }) => {
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');
  const [fullUrl, setFullUrl] = useState(`${baseUrl}${api.url}`);
  
  // 请求参数状态
  const [queryParams, setQueryParams] = useState<ParamRow[]>([
    { key: '', value: '', description: '', enabled: true }
  ]);
  
  // 导入示例参数的模态框状态
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [jsonToConvertModalVisible, setJsonToConvertModalVisible] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [convertTarget, setConvertTarget] = useState<'params' | 'formData' | 'headers'>('params');
  
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
  const [basicUsername, setBasicUsername] = useState('');
  const [basicPassword, setBasicPassword] = useState('');
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiKeyAddTo, setApiKeyAddTo] = useState<'header' | 'query'>('header');
  
  // 设置状态
  const [timeout, setTimeout] = useState(0);
  const [maxRedirects, setMaxRedirects] = useState(5);
  const [followRedirects, setFollowRedirects] = useState(true);
  const [followOriginalMethod, setFollowOriginalMethod] = useState(false);

  // 缓存保存函数
  const saveToCache = () => {
    const cacheData: TestConfigCache = {
      baseUrl,
      fullUrl,
      queryParams,
      headers,
      bodyType,
      bodyContent,
      formData,
      authType,
      authToken,
      basicAuth: {
        username: basicUsername,
        password: basicPassword
      },
      apiKey: {
        name: apiKeyName,
        value: apiKeyValue,
        addTo: apiKeyAddTo
      },
      settings: {
        timeout,
        maxRedirects,
        followRedirects,
        followOriginalMethod
      }
    };
    testConfigCache.set(api.id, cacheData);
  };

  // 从缓存加载函数
  const loadFromCache = () => {
    const cached = testConfigCache.get(api.id);
    if (cached) {
      setBaseUrl(cached.baseUrl);
      setFullUrl(cached.fullUrl);
      setQueryParams(cached.queryParams);
      setHeaders(cached.headers);
      setBodyType(cached.bodyType);
      setBodyContent(cached.bodyContent);
      setFormData(cached.formData);
      setAuthType(cached.authType);
      setAuthToken(cached.authToken);
      if (cached.basicAuth) {
        setBasicUsername(cached.basicAuth.username);
        setBasicPassword(cached.basicAuth.password);
      }
      if (cached.apiKey) {
        setApiKeyName(cached.apiKey.name);
        setApiKeyValue(cached.apiKey.value);
        setApiKeyAddTo(cached.apiKey.addTo);
      }
      if (cached.settings) {
        setTimeout(cached.settings.timeout);
        setMaxRedirects(cached.settings.maxRedirects);
        setFollowRedirects(cached.settings.followRedirects);
        setFollowOriginalMethod(cached.settings.followOriginalMethod);
      }
      return true;
    }
    return false;
  };

  // 清除缓存函数
  const clearCache = () => {
    testConfigCache.delete(api.id);
    // 重置为默认值
    setBaseUrl('https://api.example.com');
    setFullUrl(`https://api.example.com${api.url}`);
    setQueryParams([{ key: '', value: '', description: '', enabled: true }]);
    setHeaders(
      Object.entries(api.headers).map(([key, value]) => ({ 
        key, 
        value, 
        description: key === 'Content-Type' ? '请求内容类型' : '', 
        enabled: true 
      })).concat([{ key: '', value: '', description: '', enabled: true }])
    );
    setBodyType('raw');
    setBodyContent(api.body?.content || '');
    setFormData([{ key: '', value: '', description: '', enabled: true, type: 'text' }]);
    setAuthType('none');
    setAuthToken('');
    setBasicUsername('');
    setBasicPassword('');
    setApiKeyName('');
    setApiKeyValue('');
    setApiKeyAddTo('header');
    setTimeout(0);
    setMaxRedirects(5);
    setFollowRedirects(true);
    setFollowOriginalMethod(false);
    message.success('缓存已清除，数据已重置');
  };
  const parseUrlParams = (url: string): ParamRow[] => {
    try {
      const urlObj = new URL(url);
      const params: ParamRow[] = [];
      urlObj.searchParams.forEach((value, key) => {
        params.push({ key, value, description: '', enabled: true });
      });
      // 始终添加一个空行
      params.push({ key: '', value: '', description: '', enabled: true });
      return params;
    } catch {
      // 如果不是完整URL，尝试解析查询参数部分
      const queryIndex = url.indexOf('?');
      if (queryIndex !== -1) {
        const queryString = url.substring(queryIndex + 1);
        const params: ParamRow[] = [];
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((value, key) => {
          params.push({ key, value, description: '', enabled: true });
        });
        params.push({ key: '', value: '', description: '', enabled: true });
        return params;
      }
      return [{ key: '', value: '', description: '', enabled: true }];
    }
  };

  // 构建带参数的URL
  const buildUrlWithParams = (baseUrl: string, params: ParamRow[]): string => {
    const enabledParams = params.filter(p => p.enabled && p.key.trim());
    if (enabledParams.length === 0) {
      return baseUrl;
    }
    
    const [urlPart] = baseUrl.split('?');
    const searchParams = new URLSearchParams();
    enabledParams.forEach(param => {
      searchParams.append(param.key, param.value);
    });
    
    return `${urlPart}?${searchParams.toString()}`;
  };

  // 初始化时加载缓存或解析URL参数
  useEffect(() => {
    // 先尝试从缓存加载
    const cacheLoaded = loadFromCache();
    
    if (!cacheLoaded) {
      // 如果没有缓存，使用默认初始化
      const initialUrl = `${baseUrl}${api.url}`;
      setFullUrl(initialUrl);
      const parsedParams = parseUrlParams(initialUrl);
      if (parsedParams.length > 1 || parsedParams[0].key) {
        setQueryParams(parsedParams);
      }
    }
  }, [api.id]); // 依赖api.id，当切换API时重新加载

  // 数据变化时自动保存到缓存
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToCache();
    }, 500); // 防抖动，500ms后保存

    return () => clearTimeout(timeoutId);
  }, [
    baseUrl, fullUrl, queryParams, headers, bodyType, bodyContent, formData,
    authType, authToken, basicUsername, basicPassword, apiKeyName, apiKeyValue, apiKeyAddTo,
    timeout, maxRedirects, followRedirects, followOriginalMethod
  ]);

  // 当URL变化时同步参数
  const handleUrlChange = (newUrl: string) => {
    setFullUrl(newUrl);
    const parsedParams = parseUrlParams(newUrl);
    setQueryParams(parsedParams);
  };

  // 当参数变化时同步URL
  const handleParamsChange = (newParams: ParamRow[]) => {
    setQueryParams(newParams);
    const [urlPart] = fullUrl.split('?');
    const newUrl = buildUrlWithParams(urlPart, newParams);
    setFullUrl(newUrl);
  };

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
    
    // 如果是查询参数，需要同步URL
    if (params === queryParams) {
      handleParamsChange(newParams);
    } else {
      setParams(newParams);
    }
  };

  const removeParamRow = (
    params: ParamRow[], 
    setParams: React.Dispatch<React.SetStateAction<ParamRow[]>>, 
    index: number
  ) => {
    if (params.length > 1) {
      const newParams = params.filter((_, i) => i !== index);
      // 如果是查询参数，需要同步URL
      if (params === queryParams) {
        handleParamsChange(newParams);
      } else {
        setParams(newParams);
      }
    }
  };

  // 参数表格列配置
  const getParamColumns = (
    params: ParamRow[], 
    updateFunction: (newParams: ParamRow[]) => void,
    showDescription = true,
    isFormData = false
  ) => {
    const updateRow = (index: number, field: keyof ParamRow, value: string | boolean | File | null) => {
      const newParams = [...params];
      newParams[index] = { ...newParams[index], [field]: value };
      
      // 如果是最后一行且key不为空，自动添加新行
      if (index === params.length - 1 && field === 'key' && value && typeof value === 'string') {
        const newRow: ParamRow = { key: '', value: '', description: '', enabled: true };
        if (isFormData) {
          newRow.type = 'text';
        }
        newParams.push(newRow);
      }
      
      updateFunction(newParams);
    };

    const removeRow = (index: number) => {
      if (params.length > 1) {
        const newParams = params.filter((_, i) => i !== index);
        updateFunction(newParams);
      }
    };

    return [
    {
      title: '',
      dataIndex: 'enabled',
      width: 40,
      render: (enabled: boolean, record: ParamRow, index: number) => (
        <Checkbox
          checked={enabled}
          onChange={(e) => updateRow(index, 'enabled', e.target.checked)}
        />
      ),
    },
    {
      title: '参数名 (Key)',
      dataIndex: 'key',
      width: isFormData ? '20%' : '25%',
      render: (key: string, record: ParamRow, index: number) => (
        <Input
          placeholder="请输入参数名 (Enter key name)"
          value={key}
          onChange={(e) => updateRow(index, 'key', e.target.value)}
          style={{ border: 'none', boxShadow: 'none' }}
        />
      ),
    },
    ...(isFormData ? [{
      title: '类型 (Type)',
      dataIndex: 'type',
      width: '15%',
      render: (type: string, record: ParamRow, index: number) => (
        <Select
          value={type || 'text'}
          onChange={(value) => {
            updateRow(index, 'type', value);
            // 如果切换到text类型，清除文件
            if (value === 'text') {
              updateRow(index, 'file', null);
            }
          }}
          style={{ width: '100%', border: 'none' }}
          size="small"
        >
          <Option value="text">文本 (Text)</Option>
          <Option value="file">文件 (File)</Option>
        </Select>
      ),
    }] : []),
    {
      title: isFormData ? '值/文件 (Value/File)' : '参数值 (Value)',
      dataIndex: 'value',
      width: isFormData ? '30%' : (showDescription ? '35%' : '60%'),
      render: (value: string, record: ParamRow, index: number) => {
        if (isFormData && record.type === 'file') {
          return (
            <Upload
              beforeUpload={(file) => {
                updateRow(index, 'file', file);
                updateRow(index, 'value', file.name);
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
                {record.file ? record.file.name : '选择文件 (Select File)'}
              </Button>
            </Upload>
          );
        }
        
        return (
          <Input
            placeholder={isFormData ? "请输入值 (Enter value)" : "请输入参数值 (Enter parameter value)"}
            value={value}
            onChange={(e) => updateRow(index, 'value', e.target.value)}
            style={{ border: 'none', boxShadow: 'none' }}
          />
        );
      },
    },
    ...(showDescription ? [{
      title: '描述 (Description)',
      dataIndex: 'description',
      width: isFormData ? '25%' : '30%',
      render: (description: string, record: ParamRow, index: number) => (
        <Input
          placeholder="请输入描述 (Enter description)"
          value={description}
          onChange={(e) => updateRow(index, 'description', e.target.value)}
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
            onClick={() => removeRow(index)}
          />
        )
      ),
    },
  ];
  };

  const formatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(bodyContent), null, 2);
      setBodyContent(formatted);
      message.success('JSON格式化成功');
    } catch (error) {
      message.error('JSON格式化失败，请检查格式');
    }
  };

  // 导入示例参数
  const importExampleParams = () => {
    if (api.params && api.params.length > 0) {
      const exampleParams: ParamRow[] = api.params.map(param => ({
        key: param.name,
        value: param.example || '',
        description: param.description || '',
        enabled: true
      }));
      exampleParams.push({ key: '', value: '', description: '', enabled: true });
      handleParamsChange(exampleParams);
      message.success('示例参数导入成功');
    } else {
      message.info('没有可导入的示例参数');
    }
  };

  // 导入示例请求头
  const importExampleHeaders = () => {
    const exampleHeaders: ParamRow[] = Object.entries(api.headers).map(([key, value]) => ({
      key,
      value,
      description: key === 'Content-Type' ? '请求内容类型' : '',
      enabled: true
    }));
    exampleHeaders.push({ key: '', value: '', description: '', enabled: true });
    setHeaders(exampleHeaders);
    message.success('示例请求头导入成功');
  };

  // 导入示例请求体
  const importExampleBody = () => {
    if (api.body?.content) {
      setBodyContent(api.body.content);
      setBodyType('raw');
      message.success('示例请求体导入成功');
    } else {
      message.info('没有可导入的示例请求体');
    }
  };

  // JSON转列表数据
  const convertJsonToParams = () => {
    try {
      const jsonObj = JSON.parse(jsonContent);
      const newParams: ParamRow[] = [];
      
      const flattenObject = (obj: any, prefix = ''): void => {
        Object.keys(obj).forEach(key => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          const value = obj[key];
          
          if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            flattenObject(value, fullKey);
          } else {
            newParams.push({
              key: fullKey,
              value: Array.isArray(value) ? JSON.stringify(value) : String(value),
              description: '',
              enabled: true,
              ...(convertTarget === 'formData' ? { type: 'text' as const } : {})
            });
          }
        });
      };
      
      flattenObject(jsonObj);
      newParams.push({ 
        key: '', 
        value: '', 
        description: '', 
        enabled: true,
        ...(convertTarget === 'formData' ? { type: 'text' as const } : {})
      });
      
      if (convertTarget === 'params') {
        handleParamsChange(newParams);
      } else if (convertTarget === 'formData') {
        setFormData(newParams);
      } else if (convertTarget === 'headers') {
        setHeaders(newParams);
      }
      
      setJsonToConvertModalVisible(false);
      setJsonContent('');
      message.success('JSON数据转换成功');
    } catch (error) {
      message.error('JSON格式错误，请检查后重试');
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
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="请输入请求URL (Enter request URL)"
                size="large"
                style={{ fontFamily: 'monospace' }}
              />
            </Col>
            <Col span={4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<PlayCircleOutlined />}
                  block
                  style={{ fontWeight: 600 }}
                >
                  发送请求 (Send)
                </Button>
                {testConfigCache.has(api.id) && (
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#52c41a', 
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                  }}>
                    <span style={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      backgroundColor: '#52c41a',
                      display: 'inline-block'
                    }}></span>
                    已缓存
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* 参数配置标签页 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            {/* 空占位符，让按钮右对齐 */}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tooltip title={`清除当前API的缓存数据，恢复为默认设置。当前全局缓存: ${testConfigCache.size} 个API`}>
              <Button 
                type="default" 
                size="small"
                onClick={clearCache}
                style={{ color: '#ff4d4f' }}
                disabled={!testConfigCache.has(api.id)}
              >
                清除缓存
              </Button>
            </Tooltip>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'importParams',
                    label: '导入示例参数',
                    onClick: importExampleParams
                  },
                  {
                    key: 'importHeaders', 
                    label: '导入示例请求头',
                    onClick: importExampleHeaders
                  },
                  {
                    key: 'importBody',
                    label: '导入示例请求体',
                    onClick: importExampleBody
                  },
                  {
                    key: 'divider1',
                    type: 'divider'
                  },
                  {
                    key: 'jsonToParams',
                    label: 'JSON转查询参数',
                    onClick: () => {
                      setConvertTarget('params');
                      setJsonToConvertModalVisible(true);
                    }
                  },
                  {
                    key: 'jsonToFormData',
                    label: 'JSON转Form-data',
                    onClick: () => {
                      setConvertTarget('formData');
                      setJsonToConvertModalVisible(true);
                    }
                  },
                  {
                    key: 'jsonToHeaders',
                    label: 'JSON转请求头',
                    onClick: () => {
                      setConvertTarget('headers');
                      setJsonToConvertModalVisible(true);
                    }
                  }
                ]
              }}
              placement="bottomRight"
            >
              <Button icon={<ImportOutlined />}>
                导入示例参数 <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>
        <Tabs
          defaultActiveKey="params"
          items={[
            {
              key: 'params',
              label: (
                <span>
                  请求参数 (Params)
                  <Tag color="blue" style={{ marginLeft: 4 }}>
                    {queryParams.filter(p => p.enabled && p.key).length}
                  </Tag>
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                    查询参数将附加在请求URL的末尾，跟在'?'之后。(Query parameters are appended to the end of the request URL, following '?'.)
                  </div>
                  <Table
                    dataSource={queryParams}
                    columns={getParamColumns(queryParams, handleParamsChange)}
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
              label: '身份认证 (Authorization)',
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Select
                      value={authType}
                      onChange={setAuthType}
                      style={{ width: 240 }}
                      placeholder="选择认证类型 (Select auth type)"
                    >
                      <Option value="none">无认证 (No Auth)</Option>
                      <Option value="bearer">Bearer Token</Option>
                      <Option value="basic">基础认证 (Basic Auth)</Option>
                      <Option value="api-key">API Key</Option>
                    </Select>
                  </div>
                  
                  {authType === 'bearer' && (
                    <div>
                      <div style={{ marginBottom: 8, fontWeight: 500 }}>Token</div>
                      <Input.Password
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        placeholder="请输入Bearer Token (Enter your bearer token)"
                        style={{ fontFamily: 'monospace' }}
                      />
                      <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                        此Token将在Authorization请求头中以"Bearer {'{token}'}"的形式发送
                        <br />
                        (This token will be sent in the Authorization header as "Bearer {'{token}'}")
                      </div>
                    </div>
                  )}
                  
                  {authType === 'basic' && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>用户名 (Username)</div>
                        <Input 
                          placeholder="请输入用户名 (Enter username)" 
                          value={basicUsername}
                          onChange={(e) => setBasicUsername(e.target.value)}
                        />
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>密码 (Password)</div>
                        <Input.Password 
                          placeholder="请输入密码 (Enter password)" 
                          value={basicPassword}
                          onChange={(e) => setBasicPassword(e.target.value)}
                        />
                      </Col>
                    </Row>
                  )}
                  
                  {authType === 'api-key' && (
                    <Row gutter={16}>
                      <Col span={8}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Key名称 (Key Name)</div>
                        <Input 
                          placeholder="API Key名称 (API Key name)" 
                          value={apiKeyName}
                          onChange={(e) => setApiKeyName(e.target.value)}
                        />
                      </Col>
                      <Col span={8}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Key值 (Key Value)</div>
                        <Input.Password 
                          placeholder="API Key值 (API Key value)" 
                          value={apiKeyValue}
                          onChange={(e) => setApiKeyValue(e.target.value)}
                        />
                      </Col>
                      <Col span={8}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>添加到 (Add to)</div>
                        <Select 
                          value={apiKeyAddTo} 
                          onChange={setApiKeyAddTo}
                          style={{ width: '100%' }}
                        >
                          <Option value="header">请求头 (Header)</Option>
                          <Option value="query">查询参数 (Query Params)</Option>
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
                  请求头 (Headers)
                  <Tag color="green" style={{ marginLeft: 4 }}>
                    {headers.filter(h => h.enabled && h.key).length}
                  </Tag>
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                    请求头允许客户端和服务器传递HTTP请求或响应的附加信息。
                    <br />
                    (Headers let the client and the server pass additional information with the HTTP request or response.)
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
              label: '请求体 (Body)',
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      {[
                        { value: 'none', label: '无 (None)' },
                        { value: 'form-data', label: 'form-data' },
                        { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
                        { value: 'raw', label: '原始数据 (Raw)' },
                        { value: 'binary', label: '二进制 (Binary)' }
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
                      <br />
                      (This request does not have a body)
                    </div>
                  )}

                  {bodyType === 'form-data' && (
                    <div>
                      <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                        表单数据允许您发送键值对，也可以发送文件。
                        <br />
                        (Form data allows you to send key-value pairs, and you can also send files.)
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
                        <br />
                        (URL-encoded form data, key-value pairs will be sent in URL-encoded format.)
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
                          <Option value="text">文本 (Text)</Option>
                          <Option value="javascript">JavaScript</Option>
                          <Option value="json">JSON</Option>
                          <Option value="html">HTML</Option>
                          <Option value="xml">XML</Option>
                        </Select>
                        <Button size="small" onClick={formatJson}>格式化 (Beautify)</Button>
                        <Button size="small">压缩 (Minify)</Button>
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: 'auto' }}>
                          {bodyContent.length} 个字符 ({bodyContent.length} characters)
                        </span>
                      </div>
                      <TextArea
                        value={bodyContent}
                        onChange={(e) => setBodyContent(e.target.value)}
                        placeholder="请输入请求体内容 (Enter request body)"
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
                        <Button icon={<UploadOutlined />}>选择二进制文件 (Select Binary File)</Button>
                      </Upload>
                      <div style={{ marginTop: 8 }}>
                        支持上传任意格式的二进制文件
                        <br />
                        (Support uploading binary files in any format)
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'settings',
              label: '设置 (Settings)',
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div style={{ marginBottom: 8, fontWeight: 500 }}>请求超时时间 (Request timeout) (毫秒 ms)</div>
                      <Input 
                        type="number" 
                        value={timeout} 
                        onChange={(e) => setTimeout(Number(e.target.value))}
                        placeholder="0表示无限制 (0 for infinite)" 
                      />
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        等待响应的最长时间（毫秒）
                        <br />
                        (How long to wait for a response in milliseconds)
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 8, fontWeight: 500 }}>最大重定向次数 (Max redirects)</div>
                      <Input 
                        type="number" 
                        value={maxRedirects} 
                        onChange={(e) => setMaxRedirects(Number(e.target.value))}
                      />
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        允许跟随的最大重定向次数
                        <br />
                        (Maximum number of redirects to follow)
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch 
                          checked={followRedirects} 
                          onChange={setFollowRedirects}
                        />
                        <span>跟随重定向 (Follow redirects)</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        自动跟随HTTP重定向
                        <br />
                        (Automatically follow HTTP redirects)
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch 
                          checked={followOriginalMethod}
                          onChange={setFollowOriginalMethod}
                        />
                        <span>保持原始HTTP方法 (Follow original HTTP method)</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        在跟随重定向时使用原始的HTTP方法
                        <br />
                        (Use the original HTTP method when following redirects)
                      </div>
                    </Col>
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Card>
      
      {/* JSON转换模态框 */}
      <Modal
        title="JSON转列表数据"
        open={jsonToConvertModalVisible}
        onOk={convertJsonToParams}
        onCancel={() => {
          setJsonToConvertModalVisible(false);
          setJsonContent('');
        }}
        width={600}
        okText="转换"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            转换目标：
            {convertTarget === 'params' && '查询参数 (Query Parameters)'}
            {convertTarget === 'formData' && 'Form-data'}
            {convertTarget === 'headers' && '请求头 (Headers)'}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 12 }}>
            请输入JSON数据，将会自动解析为键值对。嵌套对象将使用点号分隔符连接。
            <br />
            (Enter JSON data, it will be automatically parsed into key-value pairs. Nested objects will be connected with dot notation.)
          </div>
          <TextArea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            placeholder='{
  "username": "john_doe",
  "profile": {
    "email": "john@example.com",
    "age": 25
  },
  "tags": ["developer", "admin"]
}'
            rows={12}
            style={{ 
              fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
              fontSize: '13px'
            }}
          />
          <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
            示例输出：username=john_doe, profile.email=john@example.com, profile.age=25, tags=["developer","admin"]
            <br />
            (Example output: username=john_doe, profile.email=john@example.com, profile.age=25, tags=["developer","admin"])
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApiTestConfig;