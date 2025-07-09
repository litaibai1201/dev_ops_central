import React from 'react';
import { RequestParam, ResponseParam } from './ParamTable';

export interface ParamUtils {
  // 请求参数相关工具方法
  addRequestParam: (
    params: RequestParam[], 
    setParams: React.Dispatch<React.SetStateAction<RequestParam[]>>,
    supportedLocations: string[],
    parentKey?: string
  ) => void;
  
  removeRequestParam: (
    params: RequestParam[], 
    setParams: React.Dispatch<React.SetStateAction<RequestParam[]>>,
    key: string
  ) => void;
  
  updateRequestParam: (
    params: RequestParam[], 
    setParams: React.Dispatch<React.SetStateAction<RequestParam[]>>,
    key: string, 
    field: keyof RequestParam, 
    value: any
  ) => void;
  
  // 响应参数相关工具方法
  addResponseParam: (
    params: ResponseParam[], 
    setParams: React.Dispatch<React.SetStateAction<ResponseParam[]>>,
    parentKey?: string
  ) => void;
  
  removeResponseParam: (
    params: ResponseParam[], 
    setParams: React.Dispatch<React.SetStateAction<ResponseParam[]>>,
    key: string
  ) => void;
  
  updateResponseParam: (
    params: ResponseParam[], 
    setParams: React.Dispatch<React.SetStateAction<ResponseParam[]>>,
    key: string, 
    field: keyof ResponseParam, 
    value: any
  ) => void;
}

// 检查参数是否是指定父参数的子参数（包括间接子参数）
const isChildOfParent = (param: RequestParam | ResponseParam, targetParentKey: string, allParams: (RequestParam | ResponseParam)[]): boolean => {
  if (!param.parentKey) return false;
  if (param.parentKey === targetParentKey) return true;
  
  // 递归检查是否是间接子参数
  const directParent = allParams.find(p => p.key === param.parentKey);
  if (directParent) {
    return isChildOfParent(directParent, targetParentKey, allParams);
  }
  return false;
};

// 递归获取所有子参数的key
const getChildKeys = (parentKey: string, allParams: (RequestParam | ResponseParam)[]): string[] => {
  const children = allParams.filter(p => p.parentKey === parentKey);
  let allKeys = [parentKey];
  children.forEach(child => {
    allKeys = allKeys.concat(getChildKeys(child.key, allParams));
  });
  return allKeys;
};

// 添加请求参数
const addRequestParam = (
  params: RequestParam[], 
  setParams: React.Dispatch<React.SetStateAction<RequestParam[]>>,
  supportedLocations: string[],
  parentKey?: string
) => {
  const defaultLocation = supportedLocations.length > 0 ? supportedLocations[0] : 'query';
  
  // 计算层级
  let level = 0;
  if (parentKey) {
    const parentParam = params.find(p => p.key === parentKey);
    level = parentParam ? parentParam.level + 1 : 0;
  }
  
  const newParam: RequestParam = {
    key: Date.now().toString(),
    name: '',
    type: 'string',
    location: parentKey ? (params.find(p => p.key === parentKey)?.location || defaultLocation) : defaultLocation,
    required: false,
    description: '',
    example: '',
    parentKey,
    level
  };
  
  if (parentKey) {
    // 找到父参数的位置
    const parentIndex = params.findIndex(p => p.key === parentKey);
    // 找到该父参数的所有子参数的最后位置
    let insertIndex = parentIndex + 1;
    
    // 查找当前父参数下所有子参数的结束位置
    for (let i = parentIndex + 1; i < params.length; i++) {
      const currentParam = params[i];
      // 如果是当前父参数的子参数或子参数的子参数
      if (isChildOfParent(currentParam, parentKey, params)) {
        insertIndex = i + 1;
      } else {
        break;
      }
    }
    
    const newParams = [...params];
    newParams.splice(insertIndex, 0, newParam);
    setParams(newParams);
  } else {
    setParams([...params, newParam]);
  }
};

// 删除请求参数（及其子参数）
const removeRequestParam = (
  params: RequestParam[], 
  setParams: React.Dispatch<React.SetStateAction<RequestParam[]>>,
  key: string
) => {
  const keysToRemove = getChildKeys(key, params);
  setParams(params.filter(p => !keysToRemove.includes(p.key)));
};

// 更新请求参数
const updateRequestParam = (
  params: RequestParam[], 
  setParams: React.Dispatch<React.SetStateAction<RequestParam[]>>,
  key: string, 
  field: keyof RequestParam, 
  value: any
) => {
  setParams(params.map(p => {
    if (p.key === key) {
      const updatedParam = { ...p, [field]: value };
      // 如果修改了类型为object或array，自动更新子参数的location
      if (field === 'type' && (value === 'object' || value === 'array')) {
        const childParams = params.filter(cp => cp.parentKey === key);
        childParams.forEach(child => {
          updateRequestParam(params, setParams, child.key, 'location', updatedParam.location);
        });
      }
      return updatedParam;
    }
    return p;
  }));
};

// 添加响应参数
const addResponseParam = (
  params: ResponseParam[], 
  setParams: React.Dispatch<React.SetStateAction<ResponseParam[]>>,
  parentKey?: string
) => {
  // 计算层级
  let level = 0;
  if (parentKey) {
    const parentParam = params.find(p => p.key === parentKey);
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
    const parentIndex = params.findIndex(p => p.key === parentKey);
    // 找到该父参数的所有子参数的最后位置
    let insertIndex = parentIndex + 1;
    
    // 查找当前父参数下所有子参数的结束位置
    for (let i = parentIndex + 1; i < params.length; i++) {
      const currentParam = params[i];
      // 如果是当前父参数的子参数或子参数的子参数
      if (isChildOfParent(currentParam, parentKey, params)) {
        insertIndex = i + 1;
      } else {
        break;
      }
    }
    
    const newParams = [...params];
    newParams.splice(insertIndex, 0, newParam);
    setParams(newParams);
  } else {
    setParams([...params, newParam]);
  }
};

// 删除响应参数（及其子参数）
const removeResponseParam = (
  params: ResponseParam[], 
  setParams: React.Dispatch<React.SetStateAction<ResponseParam[]>>,
  key: string
) => {
  const keysToRemove = getChildKeys(key, params);
  setParams(params.filter(p => !keysToRemove.includes(p.key)));
};

// 更新响应参数
const updateResponseParam = (
  params: ResponseParam[], 
  setParams: React.Dispatch<React.SetStateAction<ResponseParam[]>>,
  key: string, 
  field: keyof ResponseParam, 
  value: any
) => {
  setParams(params.map(p => 
    p.key === key ? { ...p, [field]: value } : p
  ));
};

export const paramUtils: ParamUtils = {
  addRequestParam,
  removeRequestParam,
  updateRequestParam,
  addResponseParam,
  removeResponseParam,
  updateResponseParam
};

export default paramUtils;