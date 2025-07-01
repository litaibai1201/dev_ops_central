import { apiClient } from './api';
import { 
  Project, 
  ProjectForm, 
  ApiMethod, 
  ApiMethodForm, 
  ApiFolder,
  Environment,
  TestCase,
  TestResult,
  PaginationParams,
  PaginatedResponse,
  ApiResponseData 
} from '../types';

export const projectService = {
  // 获取专案列表
  getProjects: async (params?: PaginationParams & { 
    search?: string; 
    groupId?: string; 
    status?: string;
  }): Promise<ApiResponseData<PaginatedResponse<Project>>> => {
    try {
      const response = await apiClient.get('/projects', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取专案详情
  getProject: async (projectId: string): Promise<ApiResponseData<Project>> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 创建专案
  createProject: async (data: ProjectForm): Promise<ApiResponseData<Project>> => {
    try {
      const response = await apiClient.post('/projects', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 更新专案
  updateProject: async (projectId: string, data: Partial<ProjectForm>): Promise<ApiResponseData<Project>> => {
    try {
      const response = await apiClient.put(`/projects/${projectId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 删除专案
  deleteProject: async (projectId: string): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取专案的API列表
  getProjectApis: async (projectId: string, params?: {
    search?: string;
    method?: string;
    folderId?: string;
  }): Promise<ApiResponseData<ApiMethod[]>> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/apis`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 创建API
  createApi: async (projectId: string, data: ApiMethodForm): Promise<ApiResponseData<ApiMethod>> => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/apis`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 更新API
  updateApi: async (projectId: string, apiId: string, data: Partial<ApiMethodForm>): Promise<ApiResponseData<ApiMethod>> => {
    try {
      const response = await apiClient.put(`/projects/${projectId}/apis/${apiId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 删除API
  deleteApi: async (projectId: string, apiId: string): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}/apis/${apiId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取API详情
  getApi: async (projectId: string, apiId: string): Promise<ApiResponseData<ApiMethod>> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/apis/${apiId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 测试API
  testApi: async (projectId: string, apiId: string, data: {
    environment?: string;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    body?: any;
  }): Promise<ApiResponseData<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    responseTime: number;
  }>> => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/apis/${apiId}/test`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取专案文件夹
  getProjectFolders: async (projectId: string): Promise<ApiResponseData<ApiFolder[]>> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/folders`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 创建文件夹
  createFolder: async (projectId: string, data: {
    name: string;
    description: string;
    parentId?: string;
  }): Promise<ApiResponseData<ApiFolder>> => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/folders`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取环境配置
  getEnvironments: async (projectId: string): Promise<ApiResponseData<Environment[]>> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/environments`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 创建环境配置
  createEnvironment: async (projectId: string, data: {
    name: string;
    description: string;
    baseUrl: string;
    variables: Record<string, string>;
    headers: Record<string, string>;
  }): Promise<ApiResponseData<Environment>> => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/environments`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取测试用例
  getTestCases: async (projectId: string, apiId?: string): Promise<ApiResponseData<TestCase[]>> => {
    try {
      const params = apiId ? { apiId } : {};
      const response = await apiClient.get(`/projects/${projectId}/test-cases`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 运行测试用例
  runTestCase: async (projectId: string, testCaseId: string): Promise<ApiResponseData<TestResult>> => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/test-cases/${testCaseId}/run`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 批量运行测试
  runAllTests: async (projectId: string, options?: {
    environment?: string;
    apiIds?: string[];
  }): Promise<ApiResponseData<TestResult[]>> => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/test-all`, options);
      return response;
    } catch (error) {
      throw error;
    }
  }
};