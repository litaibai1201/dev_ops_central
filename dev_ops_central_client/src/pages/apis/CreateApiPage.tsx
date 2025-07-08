import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Table,
  Tag,
  message,
  Switch,
  Alert,
  Tooltip,
  Badge,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ApiOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Project } from '../../types';
import { usePageContext } from '../../components/common';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CreateApiPageProps {
  user: User;
}

interface RequestParam {
  key: string;
  name: string;
  type: string;
  location: string; // 参数位置：query, path, body
  required: boolean;
  description: string;
  example?: string;
  parentKey?: string; // 父级参数的key，用于嵌套结构
  level: number; // 层级深度，从0开始
}

interface RequestHeader {
  key: string;
  name: string;
  value: string;
  required: boolean;
  description: string;
}

interface ResponseParam {
  key: string;
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
  parentKey?: string; // 父级参数的key，用于嵌套结构
  level: number; // 层级深度，从0开始
}

const CreateApiPage: React.FC<CreateApiPageProps> = ({ user }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { setProjectName, setApiName } = usePageContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('GET');
  
  // 请求参数
  const [requestParams, setRequestParams] = useState<RequestParam[]>([]);
  // 请求头
  const [requestHeaders, setRequestHeaders] = useState<RequestHeader[]>([
    {
      key: '1',
      name: 'Content-Type',
      value: 'application/json',
      required: true,
      description: '请求内容类型'
    }
  ]);
  // 响应参数
  const [responseParams, setResponseParams] = useState<ResponseParam[]>([]);

  // HTTP方法配置
  const httpMethods = [
    { 
      value: 'GET', 
      label: 'GET', 
      color: '#52c41a',
      description: '获取数据',
      hasRequestBody: false,
      supportedLocations: ['query', 'path']
    },
    { 
      value: 'POST', 
      label: 'POST', 
      color: '#1890ff',
      description: '创建数据',
      hasRequestBody: true,
      supportedLocations: ['query', 'path', 'body']
    },
    { 
      value: 'PUT', 
      label: 'PUT', 
      color: '#faad14',
      description: '更新数据',
      hasRequestBody: true,
      supportedLocations: ['path', 'body']
    },
    { 
      value: 'DELETE', 
      label: 'DELETE', 
      color: '#ff4d4f',
      description: '删除数据',
      hasRequestBody: false,
      supportedLocations: ['path', 'query']
    },
    { 
      value: 'PATCH', 
      label: 'PATCH', 
      color: '#722ed1',
      description: '部分更新',
      hasRequestBody: true,
      supportedLocations: ['path', 'body']
    }
  ];

  // 参数类型选项
  const paramTypes = [
    { value: 'string', label: 'String (字符串)' },
    { value: 'number', label: 'Number (数字)' },
    { value: 'integer', label: 'Integer (整数)' },
    { value: 'boolean', label: 'Boolean (布尔)' },
    { value: 'array', label: 'Array (数组)' },
    { value: 'object', label: 'Object (对象)' },
    { value: 'file', label: 'File (文件)' }
  ];

  // 参数位置选项
  const paramLocations = [
    { value: 'query', label: '查询参数 (Query)', description: '附加在URL后面，如 ?page=1&size=10' },
    { value: 'path', label: '路径参数 (Path)', description: '嵌入在URL路径中，如 /users/{id}' },
    { value: 'body', label: '请求体 (Body)', description: 'JSON格式的请求数据' }
  ];

  // 获取当前方法配置
  const getCurrentMethodConfig = () => {
    return httpMethods.find(method => method.value === selectedMethod);
  };

  // 获取支持的参数位置
  const getSupportedLocations = () => {
    const methodConfig = getCurrentMethodConfig();
    return paramLocations.filter(location => 
      methodConfig?.supportedLocations.includes(location.value)
    );
  };

  useEffect(() => {
    // 模拟获取项目信息
    const fetchProject = async () => {
      try {
        const mockProject: Project = {
          id: projectId || '1',
          name: projectId === '1' ? '用户管理系统API' : '订单系统API',
          description: '项目描述',
          groupId: '1',
          group: {
            id: '1',
            name: '开发组',
            description: '',
            ownerId: '1',
            owner: user,
            members: [],
            projectCount: 1,
            createdAt: '',
            updatedAt: ''
          },
          isPublic: true,
          apiCount: 0,
          tags: [],
          version: 'v1.0.0',
          status: 'active',
          createdAt: '',
          updatedAt: ''
        };
        setProject(mockProject);
        setProjectName(mockProject.name);
        setApiName('新增接口');
      } catch (error) {
        console.error('获取项目信息失败:', error);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, user, setProjectName, setApiName]);

  // 添加请求参数
  const addRequestParam = (parentKey?: string) => {
    const supportedLocations = getSupportedLocations();
    const defaultLocation = supportedLocations.length > 0 ? supportedLocations[0].value : 'query';
    
    // 计算层级
    let level = 0;
    if (parentKey) {
      const parentParam = requestParams.find(p => p.key === parentKey);
      level = parentParam ? parentParam.level + 1 : 0;
    }
    
    const newParam: RequestParam = {
      key: Date.now().toString(),
      name: '',
      type: 'string',
      location: parentKey ? (requestParams.find(p => p.key === parentKey)?.location || defaultLocation) : defaultLocation,
      required: false,
      description: '',
      example: '',
      parentKey,
      level
    };
    
    if (parentKey) {
      // 找到父参数的位置
      const parentIndex = requestParams.findIndex(p => p.key === parentKey);
      // 找到该父参数的所有子参数的最后位置
      let insertIndex = parentIndex + 1;
      
      // 查找当前父参数下所有子参数的结束位置
      for (let i = parentIndex + 1; i < requestParams.length; i++) {
        const currentParam = requestParams[i];
        // 如果是当前父参数的子参数或子参数的子参数
        if (isChildOfParent(currentParam, parentKey, requestParams)) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }
      
      const newParams = [...requestParams];
      newParams.splice(insertIndex, 0, newParam);
      setRequestParams(newParams);
    } else {
      setRequestParams([...requestParams, newParam]);
    }
  };
  
  // 检查参数是否是指定父参数的子参数（包括间接子参数）
  const isChildOfParent = (param: RequestParam, targetParentKey: string, allParams: RequestParam[]): boolean => {
    if (!param.parentKey) return false;
    if (param.parentKey === targetParentKey) return true;
    
    // 递归检查是否是间接子参数
    const directParent = allParams.find(p => p.key === param.parentKey);
    if (directParent) {
      return isChildOfParent(directParent, targetParentKey, allParams);
    }
    return false;
  };

  // 添加请求头
  const addRequestHeader = () => {
    const newHeader: RequestHeader = {
      key: Date.now().toString(),
      name: '',
      value: '',
      required: false,
      description: ''
    };
    setRequestHeaders([...requestHeaders, newHeader]);
  };

  // 删除请求参数（及其子参数）
  const removeRequestParam = (key: string) => {
    // 递归删除子参数
    const getChildKeys = (parentKey: string): string[] => {
      const children = requestParams.filter(p => p.parentKey === parentKey);
      let allKeys = [parentKey];
      children.forEach(child => {
        allKeys = allKeys.concat(getChildKeys(child.key));
      });
      return allKeys;
    };
    
    const keysToRemove = getChildKeys(key);
    setRequestParams(requestParams.filter(p => !keysToRemove.includes(p.key)));
  };

  // 删除请求头
  const removeRequestHeader = (key: string) => {
    setRequestHeaders(requestHeaders.filter(h => h.key !== key));
  };

  // 更新请求参数
  const updateRequestParam = (key: string, field: keyof RequestParam, value: any) => {
    setRequestParams(requestParams.map(p => {
      if (p.key === key) {
        const updatedParam = { ...p, [field]: value };
        // 如果修改了类型为object或array，可以添加子参数
        if (field === 'type' && (value === 'object' || value === 'array')) {
          // 自动更新子参数的location
          const childParams = requestParams.filter(cp => cp.parentKey === key);
          childParams.forEach(child => {
            updateRequestParam(child.key, 'location', updatedParam.location);
          });
        }
        return updatedParam;
      }
      return p;
    }));
  };

  // 更新请求头
  const updateRequestHeader = (key: string, field: keyof RequestHeader, value: any) => {
    setRequestHeaders(requestHeaders.map(h => 
      h.key === key ? { ...h, [field]: value } : h
    ));
  };

  // 添加响应参数
  const addResponseParam = (parentKey?: string) => {
    // 计算层级
    let level = 0;
    if (parentKey) {
      const parentParam = responseParams.find(p => p.key === parentKey);
      level = parentParam ? parentParam.level + 1 : 0;
    }
    
    const newParam: ResponseParam = {
      key: Date.now().toString(),
      name: '',
      type: 'string',
      required: false,
      description: '',
      example: '',
      parentKey,
      level
    };
    
    if (parentKey) {
      // 找到父参数的位置
      const parentIndex = responseParams.findIndex(p => p.key === parentKey);
      // 找到该父参数的所有子参数的最后位置
      let insertIndex = parentIndex + 1;
      
      // 查找当前父参数下所有子参数的结束位置
      for (let i = parentIndex + 1; i < responseParams.length; i++) {
        const currentParam = responseParams[i];
        // 如果是当前父参数的子参数或子参数的子参数
        if (isResponseChildOfParent(currentParam, parentKey, responseParams)) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }
      
      const newParams = [...responseParams];
      newParams.splice(insertIndex, 0, newParam);
      setResponseParams(newParams);
    } else {
      setResponseParams([...responseParams, newParam]);
    }
  };
  
  // 检查响应参数是否是指定父参数的子参数（包括间接子参数）
  const isResponseChildOfParent = (param: ResponseParam, targetParentKey: string, allParams: ResponseParam[]): boolean => {
    if (!param.parentKey) return false;
    if (param.parentKey === targetParentKey) return true;
    
    // 递归检查是否是间接子参数
    const directParent = allParams.find(p => p.key === param.parentKey);
    if (directParent) {
      return isResponseChildOfParent(directParent, targetParentKey, allParams);
    }
    return false;
  };

  // 删除响应参数（及其子参数）
  const removeResponseParam = (key: string) => {
    // 递归删除子参数
    const getChildKeys = (parentKey: string): string[] => {
      const children = responseParams.filter(p => p.parentKey === parentKey);
      let allKeys = [parentKey];
      children.forEach(child => {
        allKeys = allKeys.concat(getChildKeys(child.key));
      });
      return allKeys;
    };
    
    const keysToRemove = getChildKeys(key);
    setResponseParams(responseParams.filter(p => !keysToRemove.includes(p.key)));
  };

  // 更新响应参数
  const updateResponseParam = (key: string, field: keyof ResponseParam, value: any) => {
    setResponseParams(responseParams.map(p => 
      p.key === key ? { ...p, [field]: value } : p
    ));
  };

  // 渲染嵌套参数名称
  const renderNestedParamName = (text: string, record: RequestParam) => {
    const indent = record.level * 20; // 每一层级缩进20px
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
          onChange={(e) => updateRequestParam(record.key, 'name', e.target.value)}
          placeholder="参数名称"
          size="small"
          style={{ width: `calc(100% - ${indent + (record.level > 0 ? 30 : 0)}px)` }}
        />
      </div>
    );
  };

  // 请求参数表格列配置
  const requestParamColumns: ColumnsType<RequestParam> = [
    {
      title: '参数名',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: renderNestedParamName,
    },
    {
      title: '参数位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateRequestParam(record.key, 'location', value)}
          size="small"
          style={{ width: '100%' }}
          disabled={!!record.parentKey} // 子参数的位置由父参数决定
        >
          {getSupportedLocations().map(location => (
            <Select.Option key={location.value} value={location.value}>
              {location.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '参数类型',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateRequestParam(record.key, 'type', value)}
          size="small"
          style={{ width: '100%' }}
        >
          {paramTypes.map(type => (
            <Select.Option key={type.value} value={type.value}>
              {type.label}
            </Select.Option>
          ))}
        </Select>
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
          onChange={(checked) => updateRequestParam(record.key, 'required', checked)}
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
          onChange={(e) => updateRequestParam(record.key, 'description', e.target.value)}
          placeholder="参数说明"
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
          onChange={(e) => updateRequestParam(record.key, 'example', e.target.value)}
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
            <Tooltip title="添加子参数">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => addRequestParam(record.key)}
              />
            </Tooltip>
          )}
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => removeRequestParam(record.key)}
          />
        </Space>
      ),
    },
  ];

  // 请求头表格列配置
  const requestHeaderColumns: ColumnsType<RequestHeader> = [
    {
      title: '请求头名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateRequestHeader(record.key, 'name', e.target.value)}
          placeholder="如：Authorization"
          size="small"
          disabled={record.name === 'Content-Type'} // Content-Type不可修改
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
          onChange={(e) => updateRequestHeader(record.key, 'value', e.target.value)}
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
          onChange={(checked) => updateRequestHeader(record.key, 'required', checked)}
          size="small"
          disabled={record.name === 'Content-Type'} // Content-Type不能修改
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
          onChange={(e) => updateRequestHeader(record.key, 'description', e.target.value)}
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
          onClick={() => removeRequestHeader(record.key)}
          disabled={record.name === 'Content-Type'} // Content-Type不能删除
        />
      ),
    },
  ];

  // 渲染嵌套响应参数名称
  const renderNestedResponseName = (text: string, record: ResponseParam) => {
    const indent = record.level * 20; // 每一层级缩进20px
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
          onChange={(e) => updateResponseParam(record.key, 'name', e.target.value)}
          placeholder="响应字段名"
          size="small"
          style={{ width: `calc(100% - ${indent + (record.level > 0 ? 30 : 0)}px)` }}
        />
      </div>
    );
  };

  // 响应参数表格列配置
  const responseParamColumns: ColumnsType<ResponseParam> = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: renderNestedResponseName,
    },
    {
      title: '字段类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateResponseParam(record.key, 'type', value)}
          size="small"
          style={{ width: '100%' }}
        >
          {paramTypes.map(type => (
            <Select.Option key={type.value} value={type.value}>
              {type.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '必返回',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (checked, record) => (
        <Switch
          checked={checked}
          onChange={(checked) => updateResponseParam(record.key, 'required', checked)}
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
          onChange={(e) => updateResponseParam(record.key, 'description', e.target.value)}
          placeholder="字段说明"
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
          onChange={(e) => updateResponseParam(record.key, 'example', e.target.value)}
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
            <Tooltip title="添加子字段">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => addResponseParam(record.key)}
              />
            </Tooltip>
          )}
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => removeResponseParam(record.key)}
          />
        </Space>
      ),
    },
  ];

  // 监听方法变化
  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    form.setFieldsValue({ method });
    
    // 清理不支持的参数位置
    const methodConfig = getCurrentMethodConfig();
    if (methodConfig) {
      const supportedLocations = methodConfig.supportedLocations;
      setRequestParams(prev => prev.filter(param => 
        supportedLocations.includes(param.location)
      ));
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 构建API数据
      const apiData = {
        ...values,
        method: selectedMethod,
        projectId,
        requestParams: requestParams,
        requestHeaders: requestHeaders,
        responseParams: responseParams,
        status: 'draft',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('API数据:', apiData);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('API接口创建成功！');
      navigate(`/projects/${projectId}`);
      
    } catch (error) {
      console.error('创建API失败:', error);
      message.error('请检查表单内容');
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Title level={3}>加载中...</Title>
      </div>
    );
  }

  const currentMethodConfig = getCurrentMethodConfig();

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 页面头部 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            返回项目
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ApiOutlined /> 添加新接口
            </Title>
            <Text type="secondary">为 {project.name} 添加新的API接口</Text>
          </div>
        </div>
        <Space>
          <Button 
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={loading}
            size="large"
          >
            保存接口
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          method: 'GET',
          status: 'draft'
        }}
      >
        {/* 接口基本信息 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <InfoCircleOutlined />
              <span>接口基本信息</span>
            </div>
          }
          style={{ marginBottom: 24 }}
        >
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
                <Select 
                  size="large" 
                  placeholder="选择请求方式"
                  onChange={handleMethodChange}
                >
                  {httpMethods.map(method => (
                    <Select.Option key={method.value} value={method.value}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color={method.color} style={{ margin: 0, minWidth: 60, textAlign: 'center' }}>
                          {method.label}
                        </Tag>
                        <span style={{ color: '#666' }}>
                          {method.description}
                        </span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
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
                <Select defaultValue="/api" style={{ width: 80 }}>
                  <Select.Option value="/api">/api</Select.Option>
                  <Select.Option value="/v1">/v1</Select.Option>
                  <Select.Option value="/v2">/v2</Select.Option>
                </Select>
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
                  <Select.Option value="用户">用户</Select.Option>
                  <Select.Option value="认证">认证</Select.Option>
                  <Select.Option value="订单">订单</Select.Option>
                  <Select.Option value="支付">支付</Select.Option>
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

          {/* 方法特性提示 */}
          {currentMethodConfig && (
            <Alert
              message={`${currentMethodConfig.label} 请求特性`}
              description={
                <div>
                  <p><Text strong>用途：</Text>{currentMethodConfig.description}</p>
                  <p>
                    <Text strong>支持的参数位置：</Text>
                    {getSupportedLocations().map(location => (
                      <Tag key={location.value} style={{ margin: '0 4px' }}>
                        {location.label}
                      </Tag>
                    ))}
                  </p>
                  {!currentMethodConfig.hasRequestBody && (
                    <p><Text type="warning">注意：{currentMethodConfig.label} 请求通常不包含请求体参数</Text></p>
                  )}
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>

        {/* 请求参数配置 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>请求参数配置</span>
              <Badge count={requestParams.length} showZero color="#1890ff" />
              <Tooltip title={`${selectedMethod} 请求支持的参数位置`}>
                <QuestionCircleOutlined style={{ color: '#999' }} />
              </Tooltip>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => addRequestParam()}
            >
              添加请求参数
            </Button>
          }
          style={{ marginBottom: 24 }}
        >
          <Alert
            message="请求参数说明"
            description={
              <div>
                <p>根据选择的请求方式 <Tag color={currentMethodConfig?.color}>{selectedMethod}</Tag>，您可以添加以下类型的参数：</p>
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  {getSupportedLocations().map(location => (
                    <li key={location.value}>
                      <Text strong>{location.label}：</Text>{location.description}
                    </li>
                  ))}
                </ul>
                <Divider style={{ margin: '12px 0' }} />
                <p style={{ marginBottom: 0 }}>
                  <Text strong>支持嵌套结构：</Text>选择类型为 Object 或 Array 的参数可以添加子参数，用于描述复杂的数据结构。
                </p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Table
            columns={requestParamColumns}
            dataSource={requestParams}
            pagination={false}
            size="small"
            locale={{ emptyText: '暂无请求参数，点击右上角按钮添加' }}
          />
        </Card>

        {/* 请求头配置 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>请求头配置</span>
              <Badge count={requestHeaders.length} showZero color="#722ed1" />
              <Tooltip title="定义HTTP请求头信息">
                <QuestionCircleOutlined style={{ color: '#999' }} />
              </Tooltip>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addRequestHeader}
            >
              添加请求头
            </Button>
          }
          style={{ marginBottom: 24 }}
        >
          <Alert
            message="请求头说明"
            description="请求头包含关于请求的元数据信息，如内容类型、认证令牌、缓存控制等。Content-Type 是必需的请求头，无法删除。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Table
            columns={requestHeaderColumns}
            dataSource={requestHeaders}
            pagination={false}
            size="small"
            locale={{ emptyText: '暂无请求头，点击右上角按钮添加' }}
          />
        </Card>

        {/* 响应参数配置 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>响应参数配置</span>
              <Badge count={responseParams.length} showZero color="#52c41a" />
              <Tooltip title="定义接口返回的数据结构">
                <QuestionCircleOutlined style={{ color: '#999' }} />
              </Tooltip>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => addResponseParam()}
            >
              添加响应字段
            </Button>
          }
        >
          <Alert
            message="响应参数说明"
            description={
              <div>
                <p>定义接口成功返回时的数据结构，帮助前端开发者了解返回的字段含义和类型。</p>
                <p style={{ marginBottom: 0 }}>
                  <Text strong>支持嵌套结构：</Text>选择类型为 Object 或 Array 的字段可以添加子字段，用于描述复杂的响应数据结构。
                </p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Table
            columns={responseParamColumns}
            dataSource={responseParams}
            pagination={false}
            size="small"
            locale={{ emptyText: '暂无响应字段，点击右上角按钮添加' }}
          />
        </Card>

        {/* 创建提示 */}
        <Alert
          message="温馨提示"
          description={
            <div>
              <p>• 请根据选择的请求方式合理配置参数类型和位置</p>
              <p>• 响应参数有助于前端开发者快速理解接口返回结构</p>
              <p>• 接口创建后可以在详情页面进行在线测试</p>
              <p>• 建议先保存为草稿，完善后再发布</p>
            </div>
          }
          type="success"
          showIcon
          style={{ marginTop: 24 }}
        />
      </Form>
    </div>
  );
};

export default CreateApiPage;