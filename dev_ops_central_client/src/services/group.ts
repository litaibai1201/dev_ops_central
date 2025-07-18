import { apiClient } from './api';
import { 
  Group,
  GroupForm,
  GroupMember,
  JoinRequest,
  User,
  PaginationParams,
  PaginatedResponse,
  ApiResponseData 
} from '../types';

export const groupService = {
  // 获取群组列表
  getGroups: async (params?: PaginationParams & { 
    search?: string; 
    ownerId?: string;
  }): Promise<ApiResponseData<PaginatedResponse<Group>>> => {
    try {
      const response = await apiClient.get('/groups', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取用户的群组列表
  getUserGroups: async (userId: string): Promise<ApiResponseData<Group[]>> => {
    try {
      const response = await apiClient.get(`/users/${userId}/groups`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取用户的群组成员关系
  getUserGroupMemberships: async (userId: string): Promise<ApiResponseData<GroupMember[]>> => {
    try {
      const response = await apiClient.get(`/users/${userId}/group-memberships`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取群组详情
  getGroup: async (groupId: string): Promise<ApiResponseData<Group>> => {
    try {
      const response = await apiClient.get(`/groups/${groupId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 创建群组
  createGroup: async (data: GroupForm): Promise<ApiResponseData<Group>> => {
    try {
      const response = await apiClient.post('/groups', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取可添加到群组的用户列表
  getAvailableUsers: async (params?: {
    search?: string;
    excludeGroupId?: string;
  }): Promise<ApiResponseData<User[]>> => {
    try {
      const response = await apiClient.get('/users/available-for-group', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 更新群组信息
  updateGroup: async (groupId: string, data: Partial<GroupForm>): Promise<ApiResponseData<Group>> => {
    try {
      const response = await apiClient.put(`/groups/${groupId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 删除群组
  deleteGroup: async (groupId: string): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.delete(`/groups/${groupId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取群组成员列表
  getGroupMembers: async (groupId: string): Promise<ApiResponseData<GroupMember[]>> => {
    try {
      const response = await apiClient.get(`/groups/${groupId}/members`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 添加群组成员
  addGroupMember: async (groupId: string, data: {
    userId: string;
    role?: 'member' | 'admin';
    permissions?: {
      canApproveMembers?: boolean;
      canEditProject?: boolean;
      canManageMembers?: boolean;
    };
  }): Promise<ApiResponseData<GroupMember>> => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/members`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 更新群组成员权限
  updateGroupMember: async (groupId: string, memberId: string, data: {
    role?: 'member' | 'admin';
    permissions?: {
      canApproveMembers?: boolean;
      canEditProject?: boolean;
      canManageMembers?: boolean;
    };
  }): Promise<ApiResponseData<GroupMember>> => {
    try {
      const response = await apiClient.put(`/groups/${groupId}/members/${memberId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 移除群组成员
  removeGroupMember: async (groupId: string, memberId: string): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.delete(`/groups/${groupId}/members/${memberId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 提交加入群组申请
  submitJoinRequest: async (data: {
    groupId: string;
    message: string;
  }): Promise<ApiResponseData<JoinRequest>> => {
    try {
      const response = await apiClient.post('/join-requests', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取加入申请列表
  getJoinRequests: async (params?: {
    groupId?: string;
    userId?: string;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<ApiResponseData<JoinRequest[]>> => {
    try {
      console.log('Getting join requests with params:', params);
      const response = await apiClient.get('/join-requests', params);
      console.log('Join requests response:', response);
      return response;
    } catch (error: any) {
      console.error('Failed to get join requests:', error);
      // 提供更详细的错误信息
      const errorMessage = error?.message || '获取加入申请列表失败';
      throw new Error(errorMessage);
    }
  },

  // 获取用户的申请历史
  getUserJoinRequests: async (userId: string): Promise<ApiResponseData<JoinRequest[]>> => {
    try {
      const response = await apiClient.get(`/users/${userId}/join-requests`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 处理加入申请
  handleJoinRequest: async (requestId: string, data: {
    action: 'approve' | 'reject';
    reviewMessage?: string;
  }): Promise<ApiResponseData<JoinRequest>> => {
    try {
      const response = await apiClient.post(`/join-requests/${requestId}/handle`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 批量处理加入申请
  batchHandleJoinRequests: async (data: {
    requestIds: string[];
    action: 'approve' | 'reject';
    reviewMessage?: string;
  }): Promise<ApiResponseData<JoinRequest[]>> => {
    try {
      const response = await apiClient.post('/join-requests/batch-handle', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 撤销加入申请
  cancelJoinRequest: async (requestId: string): Promise<ApiResponseData<null>> => {
    try {
      const response = await apiClient.delete(`/join-requests/${requestId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取群组统计信息
  getGroupStats: async (groupId: string): Promise<ApiResponseData<{
    memberCount: number;
    projectCount: number;
    apiCount: number;
    pendingRequestCount: number;
    recentActivity: Array<{
      id: string;
      type: 'member_joined' | 'project_created' | 'api_created';
      description: string;
      createdAt: string;
      user: User;
    }>;
  }>> => {
    try {
      const response = await apiClient.get(`/groups/${groupId}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 检查用户是否可以加入群组
  checkJoinEligibility: async (groupId: string): Promise<ApiResponseData<{
    canJoin: boolean;
    reason?: string;
    existingRequest?: JoinRequest;
  }>> => {
    try {
      const response = await apiClient.get(`/groups/${groupId}/join-eligibility`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 转移群组所有权
  transferOwnership: async (groupId: string, data: {
    newOwnerId: string;
  }): Promise<ApiResponseData<Group>> => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/transfer-ownership`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }
};