import { apiClient } from './api';
import { 
  User,
  PaginationParams,
  PaginatedResponse,
  ApiResponseData 
} from '../types';

export const userService = {
  // 获取用户列表
  getUsers: async (params?: PaginationParams & { 
    search?: string; 
    role?: string;
  }): Promise<ApiResponseData<PaginatedResponse<User>>> => {
    try {
      const response = await apiClient.get('/users', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取用户详情
  getUser: async (userId: string): Promise<ApiResponseData<User>> => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取可添加到群组的用户列表
  getAvailableUsersForGroup: async (params?: {
    search?: string;
    excludeGroupId?: string;
    excludeUserIds?: string[];
  }): Promise<ApiResponseData<User[]>> => {
    try {
      const response = await apiClient.get('/users/available-for-group', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 更新用户信息
  updateUser: async (userId: string, data: Partial<User>): Promise<ApiResponseData<User>> => {
    try {
      const response = await apiClient.put(`/users/${userId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 删除用户
  deleteUser: async (userId: string): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 搜索用户
  searchUsers: async (query: string): Promise<ApiResponseData<User[]>> => {
    try {
      const response = await apiClient.get('/users/search', { q: query });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取用户统计信息
  getUserStats: async (userId: string): Promise<ApiResponseData<{
    groupCount: number;
    projectCount: number;
    apiCount: number;
    recentActivity: Array<{
      id: string;
      type: 'group_joined' | 'project_created' | 'api_created';
      description: string;
      createdAt: string;
    }>;
  }>> => {
    try {
      const response = await apiClient.get(`/users/${userId}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};
