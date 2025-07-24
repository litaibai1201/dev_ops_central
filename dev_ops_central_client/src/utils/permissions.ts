import { User, Project, Group, GroupMember } from '../types';

// 权限检查工具类
export class PermissionChecker {
  private user: User;

  constructor(user: User) {
    this.user = user;
  }

  // 检查是否为系统管理员
  isSystemAdmin(): boolean {
    return this.user.role === 'system_admin';
  }

  // 检查是否可以查看项目基本信息（所有用户都可以）
  canViewProjectBasicInfo(): boolean {
    return true; // 所有用户都可以查看项目的基本信息
  }

  // 检查是否可以查看项目详情（接口明细和测试）
  canViewProjectDetails(project: Project, userGroupMemberships: GroupMember[] = []): boolean {
    // 系统管理员可以查看所有项目
    if (this.isSystemAdmin()) {
      return true;
    }

    // 如果项目是公开的，所有人都可以查看
    if (project.isPublic) {
      return true;
    }

    // 如果项目是私密的，只有群组成员可以查看
    if (!project.isPublic) {
      return this.isGroupMember(project.groupId, userGroupMemberships);
    }

    return false;
  }

  // 检查是否可以创建项目
  canCreateProject(): boolean {
    return true; // 所有用户都可以创建项目
  }

  // 检查是否可以编辑项目
  canEditProject(project: Project, userGroupMemberships: GroupMember[] = []): boolean {
    // 系统管理员可以编辑所有项目
    if (this.isSystemAdmin()) {
      return true;
    }

    // 群组管理员或成员可以编辑项目
    const membership = this.getGroupMembership(project.groupId, userGroupMemberships);
    if (membership) {
      return membership.role === 'admin' || membership.permissions.canEditProject;
    }

    return false;
  }

  // 检查是否可以删除项目
  canDeleteProject(project: Project, userGroupMemberships: GroupMember[] = []): boolean {
    // 系统管理员可以删除所有项目
    if (this.isSystemAdmin()) {
      return true;
    }

    // 只有群组管理员可以删除项目
    const membership = this.getGroupMembership(project.groupId, userGroupMemberships);
    return membership?.role === 'admin';
  }

  // 检查是否可以创建群组
  canCreateGroup(): boolean {
    return true; // 所有用户都可以创建群组
  }

  // 检查是否可以管理群组
  canManageGroup(group: Group): boolean {
    // 系统管理员可以管理所有群组
    if (this.isSystemAdmin()) {
      return true;
    }

    // 群组所有者可以管理群组
    return group.ownerId === this.user.id;
  }

  // 检查是否可以编辑群组信息
  canEditGroup(group: Group, userGroupMemberships: GroupMember[] = []): boolean {
    // 系统管理员可以编辑所有群组
    if (this.isSystemAdmin()) {
      return true;
    }

    // 群组所有者可以编辑
    if (group.ownerId === this.user.id) {
      return true;
    }

    // 群组管理员可以编辑
    const membership = this.getGroupMembership(group.id, userGroupMemberships);
    return membership?.role === 'admin';
  }

  // 检查是否可以管理群组成员
  canManageGroupMembers(group: Group, userGroupMemberships: GroupMember[] = []): boolean {
    // 系统管理员可以管理所有群组成员
    if (this.isSystemAdmin()) {
      return true;
    }

    // 群组所有者可以管理成员
    if (group.ownerId === this.user.id) {
      return true;
    }

    // 有管理成员权限的群组管理员可以管理成员
    const membership = this.getGroupMembership(group.id, userGroupMemberships);
    return membership?.permissions.canManageMembers === true;
  }

  // 检查是否可以审批加入申请
  canApproveJoinRequests(group: Group, userGroupMemberships: GroupMember[] = []): boolean {
    // 系统管理员可以审批所有申请
    if (this.isSystemAdmin()) {
      return true;
    }

    // 群组所有者可以审批
    if (group.ownerId === this.user.id) {
      return true;
    }

    // 有审批权限的成员可以审批
    const membership = this.getGroupMembership(group.id, userGroupMemberships);
    return membership?.permissions.canApproveMembers === true;
  }

  // 检查是否需要申请加入群组才能查看私密项目
  needsJoinRequest(project: Project, userGroupMemberships: GroupMember[] = []): boolean {
    // 如果项目是公开的，不需要申请
    if (project.isPublic) {
      return false;
    }

    // 如果已经是群组成员，不需要申请
    if (this.isGroupMember(project.groupId, userGroupMemberships)) {
      return false;
    }

    // 系统管理员不需要申请
    if (this.isSystemAdmin()) {
      return false;
    }

    return true;
  }

  // 检查是否可以创建/编辑API
  canEditApi(project: Project, userGroupMemberships: GroupMember[] = []): boolean {
    // 系统管理员可以编辑所有API
    if (this.isSystemAdmin()) {
      return true;
    }

    // 群组成员且有编辑权限可以编辑API
    const membership = this.getGroupMembership(project.groupId, userGroupMemberships);
    return membership?.permissions.canEditProject === true;
  }

  // 检查是否可以测试API
  canTestApi(project: Project, userGroupMemberships: GroupMember[] = []): boolean {
    // 能查看项目详情就能测试API
    return this.canViewProjectDetails(project, userGroupMemberships);
  }

  // === 群组相关权限检查方法 ===
  
  // 检查是否为群组所有者
  isGroupOwner(group: Group): boolean {
    return group.ownerId === this.user.id;
  }
  
  // 检查是否为群组成员（包括所有者）
  isGroupMember(group: Group): boolean {
    // 群组所有者也是成员
    if (this.isGroupOwner(group)) {
      return true;
    }
    
    // 检查是否在成员列表中
    return group.members?.some(member => member.userId === this.user.id) || false;
  }
  
  // 检查是否为群组管理员
  isGroupAdmin(group: Group): boolean {
    // 群组所有者是管理员
    if (this.isGroupOwner(group)) {
      return true;
    }
    
    // 检查是否有admin角色
    const membership = group.members?.find(member => member.userId === this.user.id);
    return membership?.role === 'admin';
  }
  
  // 检查是否可以查看群组
  canViewGroup(group: Group): boolean {
    // 系统管理员、群组成员都可以查看
    return this.isSystemAdmin() || this.isGroupMember(group);
  }
  
  // 检查是否可以删除群组
  canDeleteGroup(group: Group): boolean {
    // 只有系统管理员和群组所有者可以删除
    return this.isSystemAdmin() || this.isGroupOwner(group);
  }
  
  // 检查是否可以审批成员申请
  canApproveMembers(group: Group): boolean {
    // 系统管理员和群组所有者可以审批
    if (this.isSystemAdmin() || this.isGroupOwner(group)) {
      return true;
    }
    
    // 有审批权限的成员可以审批
    const membership = group.members?.find(member => member.userId === this.user.id);
    return membership?.permissions.canApproveMembers || false;
  }
  
  // 检查是否可以管理成员
  canManageMembers(group: Group): boolean {
    // 系统管理员和群组所有者可以管理
    if (this.isSystemAdmin() || this.isGroupOwner(group)) {
      return true;
    }
    
    // 有管理成员权限的成员可以管理
    const membership = group.members?.find(member => member.userId === this.user.id);
    return membership?.permissions.canManageMembers || false;
  }

  // 私有辅助方法
  private isGroupMember(groupId: string, userGroupMemberships: GroupMember[] = []): boolean {
    return userGroupMemberships.some(membership => membership.groupId === groupId);
  }

  private getGroupMembership(groupId: string, userGroupMemberships: GroupMember[] = []): GroupMember | undefined {
    return userGroupMemberships.find(membership => membership.groupId === groupId);
  }
}

// 权限检查的便捷函数
export const createPermissionChecker = (user: User) => new PermissionChecker(user);

// 权限相关的常量
export const PERMISSION_MESSAGES = {
  PROJECT_PRIVATE: '此项目为私密项目，需要申请加入所属群组才能查看详细内容',
  NO_PERMISSION: '您没有执行此操作的权限',
  NEED_LOGIN: '请先登录后再进行此操作',
  NEED_JOIN_GROUP: '请申请加入群组以获得访问权限'
} as const;

// 项目可见性枚举
export enum ProjectVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

// 权限级别枚举
export enum PermissionLevel {
  NONE = 'none',
  VIEW_BASIC = 'view_basic',
  VIEW_DETAILS = 'view_details', 
  EDIT = 'edit',
  ADMIN = 'admin'
}

// 获取用户对项目的权限级别
export const getUserProjectPermissionLevel = (
  user: User, 
  project: Project, 
  userGroupMemberships: GroupMember[] = []
): PermissionLevel => {
  const checker = createPermissionChecker(user);

  // 所有用户都可以查看基本信息
  if (!checker.canViewProjectBasicInfo()) {
    return PermissionLevel.NONE;
  }

  // 检查是否可以查看项目详情
  if (!checker.canViewProjectDetails(project, userGroupMemberships)) {
    return PermissionLevel.VIEW_BASIC;
  }

  // 可以查看详情，但不能编辑
  if (!checker.canEditApi(project, userGroupMemberships)) {
    return PermissionLevel.VIEW_DETAILS;
  }

  // 可以编辑API和项目
  if (checker.canEditProject(project, userGroupMemberships)) {
    return PermissionLevel.EDIT;
  }

  // 系统管理员或可以删除项目的用户
  if (checker.canDeleteProject(project, userGroupMemberships) || checker.isSystemAdmin()) {
    return PermissionLevel.ADMIN;
  }

  return PermissionLevel.VIEW_DETAILS;
};