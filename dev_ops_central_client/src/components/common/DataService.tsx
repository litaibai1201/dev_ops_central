import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { Group, Project, User, JoinRequest, GroupMember } from '../../types';
import { groupService } from '../../services/group';

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取数据失败';
      setError(errorMessage);
      console.error('数据获取失败:', err);
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: '1',
        name: '用户管理系统API',
        description: '提供用户注册、登录、个人信息管理等功能的API接口',
        groupId: '1',
        group: {
          id: '1',
          name: '前端开发组',
          description: '负责前端相关项目开发',
          ownerId: '1',
          owner: {} as User,
          members: [],
          projectCount: 3,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        isPublic: true,
        apiCount: 15,
        tags: ['用户管理', '认证'],
        version: 'v1.0.0',
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: '2',
        name: '订单系统API',
        description: '电商平台订单管理相关接口',
        groupId: '2',
        group: {
          id: '2',
          name: '后端开发组',
          description: '负责后端服务开发',
          ownerId: '2',
          owner: {} as User,
          members: [],
          projectCount: 5,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        isPublic: true,
        apiCount: 28,
        tags: ['订单', '支付'],
        version: 'v2.1.0',
        status: 'active',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-15'
      },
      {
        id: '3',
        name: '内部工具API',
        description: '公司内部使用的工具类接口',
        groupId: '1',
        group: {
          id: '1',
          name: '前端开发组',
          description: '负责前端相关项目开发',
          ownerId: '1',
          owner: {} as User,
          members: [],
          projectCount: 3,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        isPublic: false,
        apiCount: 8,
        tags: ['内部工具'],
        version: 'v1.2.0',
        status: 'active',
        createdAt: '2024-03-01',
        updatedAt: '2024-03-10'
      }
    ];
  }, [user]);

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
      throw new Error('获取群组失败');
    } catch (error) {
      // 使用模拟数据作为后备
      const mockGroups: Group[] = [];
      
      if (user.username === 'groupuser') {
        mockGroups.push({
          id: '10',
          name: '测试开发组',
          description: '用于测试创建专案功能的群组',
          ownerId: user.id,
          owner: user,
          members: [],
          projectCount: 0,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        });
      } else {
        mockGroups.push(
          {
            id: '1',
            name: '前端开发组',
            description: '负责前端相关项目开发',
            ownerId: user.username === 'user' ? user.id : 'other-user-id',
            owner: user.username === 'user' ? user : {} as User,
            members: [],
            projectCount: 3,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          {
            id: '2',
            name: '后端开发组',
            description: '负责后端服务开发',
            ownerId: 'other-user-id',
            owner: {} as User,
            members: [],
            projectCount: 5,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        );
      }
      
      return mockGroups;
    }
  }, [user]);

  return useDataService(fetchGroups);
};

// 群组详情数据服务
export const useGroupDetail = (groupId: string, user: User) => {
  const fetchGroupDetail = useCallback(async (): Promise<{
    group: Group;
    projects: Project[];
  }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockGroup: Group = {
      id: groupId,
      name: '前端开发组',
      description: '负责前端项目开发和维护，使用React、Vue等现代前端技术栈',
      ownerId: user.username === 'groupuser' ? user.id : '1',
      owner: {
        id: user.username === 'groupuser' ? user.id : '1',
        username: user.username === 'groupuser' ? user.username : 'group_owner',
        email: 'owner@company.com',
        role: 'user',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      members: [
        {
          id: '1',
          userId: user.username === 'groupuser' ? user.id : '1',
          groupId: groupId,
          user: {
            id: user.username === 'groupuser' ? user.id : '1',
            username: user.username === 'groupuser' ? user.username : 'group_owner',
            email: 'owner@company.com',
            role: 'user',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          role: 'admin',
          permissions: {
            canApproveMembers: true,
            canEditProject: true,
            canManageMembers: true
          },
          joinedAt: '2024-01-01'
        },
        {
          id: '2',
          userId: '2',
          groupId: groupId,
          user: {
            id: '2',
            username: 'alice',
            email: 'alice@company.com',
            role: 'user',
            createdAt: '2024-01-02',
            updatedAt: '2024-01-02'
          },
          role: 'member',
          permissions: {
            canApproveMembers: false,
            canEditProject: false,
            canManageMembers: false
          },
          joinedAt: '2024-01-02'
        }
      ],
      projectCount: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    };

    const mockProjects: Project[] = [
      {
        id: '1',
        name: '用户管理系统',
        description: '企业级用户管理系统前端',
        groupId: groupId,
        group: mockGroup,
        isPublic: true,
        apiCount: 15,
        tags: ['React', '用户管理'],
        version: 'v1.0.0',
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: '2',
        name: '数据可视化平台',
        description: '实时数据展示和分析平台',
        groupId: groupId,
        group: mockGroup,
        isPublic: false,
        apiCount: 28,
        tags: ['Vue', '数据可视化'],
        version: 'v2.1.0',
        status: 'active',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-15'
      }
    ];

    return { group: mockGroup, projects: mockProjects };
  }, [groupId, user]);

  return useDataService(fetchGroupDetail);
};

// 加入请求数据服务
export const useJoinRequestData = () => {
  const fetchJoinRequests = useCallback(async (): Promise<JoinRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        userId: '4',
        groupId: '1',
        user: {
          id: '4',
          username: 'new_developer',
          email: 'newdev@company.com',
          role: 'user',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-10'
        },
        group: {
          id: '1',
          name: '前端开发组',
          description: '负责前端相关项目开发',
          ownerId: '1',
          owner: {} as User,
          members: [],
          projectCount: 3,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        message: '希望加入前端开发组，有3年React开发经验',
        status: 'pending',
        createdAt: '2024-01-10'
      }
    ];
  }, []);

  return useDataService(fetchJoinRequests);
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
    } catch (error) {
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, executeOperation };
};
