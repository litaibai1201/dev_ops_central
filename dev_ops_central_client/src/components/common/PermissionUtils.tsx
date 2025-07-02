import { User, Group, GroupMember } from '../../types';

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

  // 检查是否为群主
  isGroupOwner(group: Group): boolean {
    return group.ownerId === this.user.id;
  }

  // 检查是否为群组成员
  isGroupMember(group: Group): boolean {
    return group.members.some(member => member.userId === this.user.id);
  }

  // 检查是否为群组管理员
  isGroupAdmin(group: Group): boolean {
    const memberInfo = group.members.find(member => member.userId === this.user.id);
    return memberInfo?.role === 'admin';
  }

  // 检查是否有群组编辑权限
  canEditGroup(group: Group): boolean {
    return this.isSystemAdmin() || this.isGroupOwner(group) || this.isGroupAdmin(group);
  }

  // 检查是否有群组删除权限
  canDeleteGroup(group: Group): boolean {
    return this.isSystemAdmin() || this.isGroupOwner(group);
  }

  // 检查是否可以批准成员申请
  canApproveMembers(group: Group): boolean {
    if (this.isSystemAdmin() || this.isGroupOwner(group)) {
      return true;
    }
    
    const memberInfo = group.members.find(member => member.userId === this.user.id);
    return memberInfo?.permissions.canApproveMembers || false;
  }

  // 检查是否可以管理群组成员
  canManageMembers(group: Group): boolean {
    if (this.isSystemAdmin() || this.isGroupOwner(group)) {
      return true;
    }
    
    const memberInfo = group.members.find(member => member.userId === this.user.id);
    return memberInfo?.permissions.canManageMembers || false;
  }

  // 检查是否可以创建项目
  canCreateProject(): boolean {
    return this.isSystemAdmin();
  }

  // 检查是否可以在指定群组中创建项目
  canCreateProjectInGroup(group: Group): boolean {
    return this.isSystemAdmin() || this.isGroupOwner(group);
  }

  // 检查是否可以查看群组详情
  canViewGroup(group: Group): boolean {
    return this.isSystemAdmin() || this.isGroupMember(group);
  }

  // 获取用户在群组中的角色
  getUserRoleInGroup(group: Group): 'owner' | 'admin' | 'member' | null {
    if (this.isGroupOwner(group)) {
      return 'owner';
    }
    
    const memberInfo = group.members.find(member => member.userId === this.user.id);
    return memberInfo?.role as 'admin' | 'member' || null;
  }

  // 获取用户管理的群组
  getOwnedGroups(groups: Group[]): Group[] {
    return groups.filter(group => this.isGroupOwner(group));
  }

  // 获取用户参与的群组
  getJoinedGroups(groups: Group[]): Group[] {
    return groups.filter(group => this.isGroupMember(group));
  }

  // 检查是否可以移除群组成员
  canRemoveMember(group: Group, targetMember: GroupMember): boolean {
    // 不能移除自己
    if (targetMember.userId === this.user.id) {
      return false;
    }
    
    // 不能移除群主
    if (targetMember.role === 'admin' && this.isGroupOwner(group)) {
      return false;
    }
    
    return this.isSystemAdmin() || this.isGroupOwner(group) || 
           (this.isGroupAdmin(group) && targetMember.role === 'member');
  }
}

// Hook: 使用权限检查器
export const usePermissions = (user: User) => {
  return new PermissionChecker(user);
};

// 权限相关的常量
export const PERMISSIONS = {
  ROLES: {
    SYSTEM_ADMIN: 'system_admin',
    USER: 'user'
  },
  GROUP_ROLES: {
    OWNER: 'owner',
    ADMIN: 'admin', 
    MEMBER: 'member'
  }
} as const;
