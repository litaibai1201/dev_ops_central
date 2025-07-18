import axios from 'axios';
import { ApiResponseData } from '../types';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 处理通用错误
    if (error.response?.status === 401) {
      // 未授权，清除用户信息并重定向到根路径
      localStorage.removeItem('user');
      // 只有在不是根路径时才重定向，避免无限重定向
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject({
      message: error.response?.data?.message || error.message || '请求失败',
      code: error.response?.status || 500,
      data: error.response?.data
    });
  }
);

// 通用API方法
export const apiClient = {
  get: <T = any>(url: string, params?: any): Promise<ApiResponseData<T>> => 
    api.get(url, { params }),
    
  post: <T = any>(url: string, data?: any): Promise<ApiResponseData<T>> => 
    api.post(url, data),
    
  put: <T = any>(url: string, data?: any): Promise<ApiResponseData<T>> => 
    api.put(url, data),
    
  delete: <T = any>(url: string): Promise<ApiResponseData<T>> => 
    api.delete(url),
    
  patch: <T = any>(url: string, data?: any): Promise<ApiResponseData<T>> => 
    api.patch(url, data),
};

export default api;