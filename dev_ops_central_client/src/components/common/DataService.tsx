import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { Group, Project, User, JoinRequest } from '../../types';
import { groupService } from '../../services/group';
import { projectService } from '../../services/project';
import { userService } from '../../services/user';

// 通用数据服务Hook
export const useDataService = <T,>(
  fetchFunction: () => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err: any) {
      let errorMessage = '获取数据失败';
      
      // 处理不同类型的错误
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error('数据获取失败:', {
        error: err,
        message: errorMessage,
        stack: err?.stack
      });
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
};

// 项目数据服务
export const useProjectData = (user: User) => {
  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    try {
      const response = await projectService.getProjects({
        page: 1,
        pageSize: 100 // 获取所有项目
      });
      
      if (response.success) {
        return response.data.data;
      }
      throw new Error(response.message || '获取项目列表失败');
    } catch (error: any) {
      console.error('获取项目列表失败:', error);
      throw new Error(error.message || '获取项目列表失败');
    }
  }, []);

  return useDataService(fetchProjects);
};

// 群组数据服务
export const useGroupData = (user: User) => {
  const fetchGroups = useCallback(async (): Promise<Group[]> => {
    try {
      const response = await groupService.getUserGroups(user.id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '获取群组列表失败');
    } catch (error: any) {
      console.error('获取群组列表失败:', error);
      throw new Error(error.message || '获取群组列表失败');
    }
  }, [user.id]);

  return useDataService(fetchGroups);
};

// 所有群组数据服务（用于浏览群组页面）
export const useAllGroupData = () => {
  const fetchAllGroups = useCallback(async (): Promise<Group[]> => {
    try {
      const response = await groupService.getGroups({
        page: 1,
        pageSize: 100 // 获取所有群组
      });
      
      if (response.success) {
        return response.data.data;
      }
      throw new Error(response.message || '获取群组列表失败');
    } catch (error: any) {
      console.error('获取群组列表失败:', error);
      throw new Error(error.message || '获取群组列表失败');
    }
  }, []);

  return useDataService(fetchAllGroups);
};

// 群组详情数据服务
export const useGroupDetail = (groupId: string) => {
  const fetchGroupDetail = useCallback(async (): Promise<{
    group: Group;
    projects: Project[];
  }> => {
    try {
      // 并行获取群组详情和项目列表
      const [groupResponse, projectsResponse] = await Promise.all([
        groupService.getGroup(groupId),
        projectService.getProjects({ 
          groupId, 
          page: 1, 
          pageSize: 100 
        })
      ]);

      if (!groupResponse.success) {
        throw new Error(groupResponse.message || '获取群组详情失败');
      }

      if (!projectsResponse.success) {
        throw new Error(projectsResponse.message || '获取项目列表失败');
      }

      return {
        group: groupResponse.data,
        projects: projectsResponse.data.data
      };
    } catch (error: any) {
      console.error('获取群组详情失败:', error);
      throw new Error(error.message || '获取群组详情失败');
    }
  }, [groupId]);

  return useDataService(fetchGroupDetail);
};

// 加入请求数据服务
export const useJoinRequestData = (groupId?: string) => {
  const fetchJoinRequests = useCallback(async (): Promise<JoinRequest[]> => {
    try {
      console.log('Fetching join requests for groupId:', groupId);
      const params = groupId ? { groupId } : {};
      const response = await groupService.getJoinRequests(params);
      
      console.log('Join requests API response:', response);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '获取加入申请失败');
    } catch (error: any) {
      console.error('获取加入申请失败:', error);
      // 如果是权限错误，返回空数组而不是抛出错误
      if (error.code === 403 || error.message?.includes('权限')) {
        console.warn('无权限查看加入申请，返回空列表');
        return [];
      }
      throw new Error(error.message || '获取加入申请失败');
    }
  }, [groupId]);

  return useDataService(fetchJoinRequests);
};

// 用户统计数据服务
export const useUserStats = (userId: string) => {
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await userService.getUserStats(userId);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '获取用户统计失败');
    } catch (error: any) {
      console.error('获取用户统计失败:', error);
      throw new Error(error.message || '获取用户统计失败');
    }
  }, [userId]);

  return useDataService(fetchUserStats);
};

// 群组统计数据服务
export const useGroupStats = (groupId: string) => {
  const fetchGroupStats = useCallback(async () => {
    try {
      const response = await groupService.getGroupStats(groupId);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '获取群组统计失败');
    } catch (error: any) {
      console.error('获取群组统计失败:', error);
      throw new Error(error.message || '获取群组统计失败');
    }
  }, [groupId]);

  return useDataService(fetchGroupStats);
};

// 可添加到群组的用户数据服务
export const useAvailableUsers = (excludeGroupId?: string) => {
  const fetchAvailableUsers = useCallback(async (): Promise<User[]> => {
    try {
      const response = await groupService.getAvailableUsers({ 
        excludeGroupId 
      });
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '获取可用用户列表失败');
    } catch (error: any) {
      console.error('获取可用用户列表失败:', error);
      throw new Error(error.message || '获取可用用户列表失败');
    }
  }, [excludeGroupId]);

  return useDataService(fetchAvailableUsers);
};

// 用户搜索服务
export const useUserSearch = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await userService.searchUsers(query);
      
      if (response.success) {
        setUsers(response.data);
      } else {
        throw new Error(response.message || '搜索用户失败');
      }
    } catch (error: any) {
      const errorMessage = error.message || '搜索用户失败';
      setError(errorMessage);
      console.error('搜索用户失败:', error);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { users, loading, error, searchUsers };
};

// 操作处理Hook
export const useOperations = () => {
  const [loading, setLoading] = useState(false);

  const executeOperation = useCallback(async (
    operation: () => Promise<void>,
    successMessage: string,
    errorMessage: string = '操作失败'
  ) => {
    setLoading(true);
    try {
      await operation();
      message.success(successMessage);
    } catch (error: any) {
      const msg = error?.message || errorMessage;
      message.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, executeOperation };
};
