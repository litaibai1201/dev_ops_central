import { useState, useCallback } from 'react';
import { RequestParam, ResponseParam } from './ParamTable';
import { RequestHeader } from './RequestHeaderTable';
import { paramUtils } from './paramUtils';

export interface UseApiParamsResult {
  // 请求参数
  requestParams: RequestParam[];
  setRequestParams: React.Dispatch<React.SetStateAction<RequestParam[]>>;
  addRequestParam: (parentKey?: string) => void;
  removeRequestParam: (key: string) => void;
  updateRequestParam: (key: string, field: keyof RequestParam, value: any) => void;
  
  // 响应参数
  responseParams: ResponseParam[];
  setResponseParams: React.Dispatch<React.SetStateAction<ResponseParam[]>>;
  addResponseParam: (parentKey?: string) => void;
  removeResponseParam: (key: string) => void;
  updateResponseParam: (key: string, field: keyof ResponseParam, value: any) => void;
  
  // 请求头
  requestHeaders: RequestHeader[];
  setRequestHeaders: React.Dispatch<React.SetStateAction<RequestHeader[]>>;
  addRequestHeader: () => void;
  removeRequestHeader: (key: string) => void;
  updateRequestHeader: (key: string, field: keyof RequestHeader, value: any) => void;
  
  // 重置所有参数
  resetAllParams: () => void;
}

export interface UseApiParamsOptions {
  supportedLocations?: string[];
  initialRequestParams?: RequestParam[];
  initialResponseParams?: ResponseParam[];
  initialRequestHeaders?: RequestHeader[];
}

const defaultRequestHeaders: RequestHeader[] = [
  {
    key: '1',
    name: 'Content-Type',
    value: 'application/json',
    required: true,
    description: '请求内容类型',
    readonly: true
  }
];

export const useApiParams = (options: UseApiParamsOptions = {}): UseApiParamsResult => {
  const {
    supportedLocations = ['query', 'path', 'body'],
    initialRequestParams = [],
    initialResponseParams = [],
    initialRequestHeaders = defaultRequestHeaders
  } = options;

  // 请求参数状态
  const [requestParams, setRequestParams] = useState<RequestParam[]>(initialRequestParams);
  
  // 响应参数状态
  const [responseParams, setResponseParams] = useState<ResponseParam[]>(initialResponseParams);
  
  // 请求头状态
  const [requestHeaders, setRequestHeaders] = useState<RequestHeader[]>(initialRequestHeaders);

  // 请求参数操作方法
  const addRequestParam = useCallback((parentKey?: string) => {
    paramUtils.addRequestParam(requestParams, setRequestParams, supportedLocations, parentKey);
  }, [requestParams, supportedLocations]);

  const removeRequestParam = useCallback((key: string) => {
    paramUtils.removeRequestParam(requestParams, setRequestParams, key);
  }, [requestParams]);

  const updateRequestParam = useCallback((key: string, field: keyof RequestParam, value: any) => {
    paramUtils.updateRequestParam(requestParams, setRequestParams, key, field, value);
  }, [requestParams]);

  // 响应参数操作方法
  const addResponseParam = useCallback((parentKey?: string) => {
    paramUtils.addResponseParam(responseParams, setResponseParams, parentKey);
  }, [responseParams]);

  const removeResponseParam = useCallback((key: string) => {
    paramUtils.removeResponseParam(responseParams, setResponseParams, key);
  }, [responseParams]);

  const updateResponseParam = useCallback((key: string, field: keyof ResponseParam, value: any) => {
    paramUtils.updateResponseParam(responseParams, setResponseParams, key, field, value);
  }, [responseParams]);

  // 请求头操作方法
  const addRequestHeader = useCallback(() => {
    const newHeader: RequestHeader = {
      key: Date.now().toString(),
      name: '',
      value: '',
      required: false,
      description: ''
    };
    setRequestHeaders(prev => [...prev, newHeader]);
  }, []);

  const removeRequestHeader = useCallback((key: string) => {
    setRequestHeaders(prev => prev.filter(h => h.key !== key));
  }, []);

  const updateRequestHeader = useCallback((key: string, field: keyof RequestHeader, value: any) => {
    setRequestHeaders(prev => prev.map(h => 
      h.key === key ? { ...h, [field]: value } : h
    ));
  }, []);

  // 重置所有参数
  const resetAllParams = useCallback(() => {
    setRequestParams(initialRequestParams);
    setResponseParams(initialResponseParams);
    setRequestHeaders(initialRequestHeaders);
  }, [initialRequestParams, initialResponseParams, initialRequestHeaders]);

  return {
    // 请求参数
    requestParams,
    setRequestParams,
    addRequestParam,
    removeRequestParam,
    updateRequestParam,
    
    // 响应参数
    responseParams,
    setResponseParams,
    addResponseParam,
    removeResponseParam,
    updateResponseParam,
    
    // 请求头
    requestHeaders,
    setRequestHeaders,
    addRequestHeader,
    removeRequestHeader,
    updateRequestHeader,
    
    // 重置
    resetAllParams
  };
};

export default useApiParams;