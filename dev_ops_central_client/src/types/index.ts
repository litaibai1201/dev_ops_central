export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'system_admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  owner: User;
  members: GroupMember[];
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  user: User;
  role: 'member' | 'admin';
  permissions: {
    canApproveMembers: boolean;
    canEditProject: boolean;
    canManageMembers: boolean;
  };
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  groupId: string;
  group: Group;
  isPublic: boolean;
  apiCount: number;
  tags: string[];
  version: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ApiMethod {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  projectId: string;
  folderId?: string;
  headers: Record<string, string>;
  params: ApiParam[];
  body?: {
    type: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
    content: string;
  };
  responses: ApiResponse[];
  tags: string[];
  status: 'draft' | 'published' | 'deprecated';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiParam {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: string;
  defaultValue?: string;
}

export interface ApiResponse {
  id: string;
  statusCode: number;
  description: string;
  headers: Record<string, string>;
  body: string;
  example: string;
}

export interface ApiFolder {
  id: string;
  name: string;
  description: string;
  projectId: string;
  parentId?: string;
  children: ApiFolder[];
  apis: ApiMethod[];
  createdAt: string;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  apiId: string;
  environment: string;
  headers: Record<string, string>;
  params: Record<string, any>;
  body?: any;
  assertions: TestAssertion[];
  createdBy: string;
  createdAt: string;
}

export interface TestAssertion {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  expectedValue: any;
  description: string;
}

export interface TestResult {
  id: string;
  testCaseId: string;
  status: 'passed' | 'failed' | 'error';
  responseTime: number;
  responseCode: number;
  responseBody: string;
  errors: string[];
  executedAt: string;
  executedBy: string;
}

export interface Environment {
  id: string;
  name: string;
  description: string;
  projectId: string;
  variables: Record<string, string>;
  baseUrl: string;
  headers: Record<string, string>;
}

export interface JoinRequest {
  id: string;
  userId: string;
  groupId: string;
  user: User;
  group: Group;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponseData<T = any> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProjectForm {
  name: string;
  description: string;
  groupId: string;
  isPublic: boolean;
  tags: string[];
  version: string;
}

export interface GroupForm {
  name: string;
  description: string;
  memberIds?: string[]; // 创建群组时添加的成员ID列表
}

export interface ApiMethodForm {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  folderId?: string;
  headers: Array<{key: string; value: string}>;
  params: ApiParam[];
  body?: {
    type: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
    content: string;
  };
  tags: string[];
  status: 'draft' | 'published' | 'deprecated';
}

export interface UserPermissions {
  canViewProjects: boolean;
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canManageGroups: boolean;
  canManageUsers: boolean;
  canManageSystem: boolean;
}
