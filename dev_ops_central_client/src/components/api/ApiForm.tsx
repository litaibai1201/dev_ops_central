import React, { useState, useEffect } from 'react';
import { Form, message, Badge, Divider, Typography } from 'antd';
import ApiMethodInfo from './ApiMethodInfo';
import ApiParamSection from './ApiParamSection';
import RequestHeaderSection from './RequestHeaderSection';
import ApiBasicForm from './ApiBasicForm';
import ApiFormTips from './ApiFormTips';
import ApiFormSection from './ApiFormSection';
import { useApiParams } from './useApiParams';
import { HttpMethod, DEFAULT_HTTP_METHODS } from './ApiMethodSelector';
import { RequestParam, ResponseParam, DEFAULT_PARAM_TYPES, DEFAULT_PARAM_LOCATIONS } from './ParamTable';
import { RequestHeader } from './RequestHeaderTable';

const { Text } = Typography;

export interface ApiFormData {
  name: string;
  method: string;
  url: string;
  description: string;
  tags?: string[];
  status: string;
  requestParams: RequestParam[];
  responseParams: ResponseParam[];
  requestHeaders: RequestHeader[];
}

export interface ApiFormProps {
  form: any;
  initialValues?: Partial<ApiFormData>;
  onMethodChange?: (method: string) => void;
  methods?: HttpMethod[];
  showMethodInfo?: boolean;
  showRequestParams?: boolean;
  showResponseParams?: boolean;
  showRequestHeaders?: boolean;
  showTips?: boolean;
  tips?: string[];
  onFormDataChange?: (data: Partial<ApiFormData>) => void;
  disabled?: boolean;
  loading?: boolean;
}

const ApiForm: React.FC<ApiFormProps> = ({
  form,
  initialValues,
  onMethodChange,
  methods = DEFAULT_HTTP_METHODS,
  showMethodInfo = true,
  showRequestParams = true,
  showResponseParams = true,
  showRequestHeaders = true,
  showTips = true,
  tips,
  onFormDataChange,
  disabled = false,
  loading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>(initialValues?.method || 'GET');
  
  // 获取当前方法配置
  const getCurrentMethodConfig = (): HttpMethod | undefined => {
    return methods.find(method => method.value === selectedMethod);
  };

  // 获取支持的参数位置
  const getSupportedLocations = () => {
    const methodConfig = getCurrentMethodConfig();
    return DEFAULT_PARAM_LOCATIONS.filter(location => 
      methodConfig?.supportedLocations.includes(location.value)
    );
  };

  // 获取支持的位置值
  const getSupportedLocationValues = () => {
    return getSupportedLocations().map(location => location.value);
  };

  // 使用自定义Hook管理参数
  const {
    requestParams,
    responseParams,
    requestHeaders,
    addRequestParam,
    removeRequestParam,
    updateRequestParam,
    addResponseParam,
    removeResponseParam,
    updateResponseParam,
    addRequestHeader,
    removeRequestHeader,
    updateRequestHeader
  } = useApiParams({
    supportedLocations: getSupportedLocationValues(),
    initialRequestParams: initialValues?.requestParams || [],
    initialResponseParams: initialValues?.responseParams || [],
    initialRequestHeaders: initialValues?.requestHeaders
  });

  // 监听方法变化
  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    form.setFieldsValue({ method });
    
    // 清理不支持的参数位置
    const methodConfig = methods.find(m => m.value === method);
    if (methodConfig && requestParams.length > 0) {
      const supportedLocations = methodConfig.supportedLocations;
      // 这里可以添加清理逻辑或者提示用户
    }
    
    onMethodChange?.(method);
  };

  // 监听表单数据变化
  useEffect(() => {
    if (onFormDataChange) {
      const formValues = form.getFieldsValue();
      onFormDataChange({
        ...formValues,
        method: selectedMethod,
        requestParams,
        responseParams,
        requestHeaders
      });
    }
  }, [selectedMethod, requestParams, responseParams, requestHeaders, form, onFormDataChange]);

  const currentMethodConfig = getCurrentMethodConfig();

  return (
    <>
      {/* 接口基本信息 */}
      <ApiFormSection
        title="接口基本信息"
        style={{ marginBottom: 24 }}
      >
        <ApiBasicForm
          form={form}
          selectedMethod={selectedMethod}
          onMethodChange={handleMethodChange}
          methods={methods}
        />

        {/* 方法特性提示 */}
        {showMethodInfo && currentMethodConfig && (
          <ApiMethodInfo
            method={currentMethodConfig}
            supportedLocations={getSupportedLocations()}
            style={{ marginTop: 16 }}
          />
        )}
      </ApiFormSection>

      {/* 请求参数配置 */}
      {showRequestParams && (
        <ApiParamSection
          title="请求参数配置"
          params={requestParams}
          onParamChange={updateRequestParam}
          onAddParam={addRequestParam}
          onRemoveParam={removeRequestParam}
          type="request"
          supportedLocations={getSupportedLocations()}
          paramTypes={DEFAULT_PARAM_TYPES}
          tooltip={`${selectedMethod} 请求支持的参数位置`}
          addButtonText="添加请求参数"
          alertMessage="请求参数说明"
          alertDescription={
            <div>
              <p>根据选择的请求方式 <Badge color={currentMethodConfig?.color} text={selectedMethod} />，您可以添加以下类型的参数：</p>
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
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 请求头配置 */}
      {showRequestHeaders && (
        <RequestHeaderSection
          headers={requestHeaders}
          onHeaderChange={updateRequestHeader}
          onAddHeader={addRequestHeader}
          onRemoveHeader={removeRequestHeader}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 响应参数配置 */}
      {showResponseParams && (
        <ApiParamSection
          title="响应参数配置"
          params={responseParams}
          onParamChange={updateResponseParam}
          onAddParam={addResponseParam}
          onRemoveParam={removeResponseParam}
          type="response"
          showLocationColumn={false}
          paramTypes={DEFAULT_PARAM_TYPES}
          badgeColor="#52c41a"
          tooltip="定义接口返回的数据结构"
          addButtonText="添加响应字段"
          alertMessage="响应参数说明"
          alertDescription={
            <div>
              <p>定义接口成功返回时的数据结构，帮助前端开发者了解返回的字段含义和类型。</p>
              <p style={{ marginBottom: 0 }}>
                <Text strong>支持嵌套结构：</Text>选择类型为 Object 或 Array 的字段可以添加子字段，用于描述复杂的响应数据结构。
              </p>
            </div>
          }
        />
      )}

      {/* 提示信息 */}
      {showTips && (
        <ApiFormTips 
          tips={tips}
          style={{ marginTop: 24 }} 
        />
      )}
    </>
  );
};

export default ApiForm;