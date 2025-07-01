import { apiClient } from './api';
import { LoginForm, RegisterForm, User, ApiResponseData } from '../types';

export const authService = {
  // 用户登录
  login: async (data: LoginForm): Promise<ApiResponseData<{ user: User; token: string }>> => {
    try {
      const response = await apiClient.post('/auth/login', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 用户注册
  register: async (data: RegisterForm): Promise<ApiResponseData<{ user: User; token: string }>> => {
    try {
      const response = await apiClient.post('/auth/register', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<ApiResponseData<User>> => {
    try {
      const response = await apiClient.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 刷新token
  refreshToken: async (): Promise<ApiResponseData<{ token: string }>> => {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 用户登出
  logout: async (): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 修改密码
  changePassword: async (data: { 
    currentPassword: string; 
    newPassword: string; 
  }): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.post('/auth/change-password', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 忘记密码
  forgotPassword: async (email: string): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 重置密码
  resetPassword: async (data: { 
    token: string; 
    newPassword: string; 
  }): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      return response;
    } catch (error) {
      throw error;
    }
  }
};