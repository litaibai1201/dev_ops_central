import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Badge, 
  Space, 
  Avatar, 
  Tooltip,
  Button,
  Modal,
  message
} from 'antd';
import {
  ApiOutlined,
  TeamOutlined,
  EyeOutlined,
  LockOutlined,
  GlobalOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Project, User, GroupMember } from '../types';
import { StatusTag } from './common';
import { createPermissionChecker, getUserProjectPermissionLevel, PermissionLevel } from '../utils/permissions';
import { groupService } from '../services/group';

interface ProjectListProps {
  projects: Project[];
  user: User;
  userGroupMemberships: GroupMember[];
  loading?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onJoinGroup?: (project: Project) => void;
}

interface ProjectCardProps {
  project: Project;
  user: User;
  userGroupMemberships: GroupMember[];
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onJoinGroup?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  user,
  userGroupMemberships,
  onEdit,
  onDelete,
  onJoinGroup
}) => {
  const navigate = useNavigate();
  const [joinRequestLoading, setJoinRequestLoading] = useState(false);
  
  const checker = createPermissionChecker(user);
  const permissionLevel = getUserProjectPermissionLevel(user, project, userGroupMemberships);
  const canViewDetails = checker.canViewProjectDetails(project, userGroupMemberships);
  const canEdit = checker.canEditProject(project, userGroupMemberships);
  const canDelete = checker.canDeleteProject(project, userGroupMemberships);
  const needsJoinRequest = checker.needsJoinRequest(project, userGroupMemberships);

  const handleViewProject = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(project);
  };

  const handleDeleteProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除项目',
      content: `确定要删除项目"${project.name}"吗？此操作不可恢复。`,
      icon: <ExclamationCircleOutlined />,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        onDelete?.(project);
      }
    });
  };

  const handleJoinGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setJoinRequestLoading(true);
    
    try {
      // 检查是否已有待处理的申请
      const userRequests = await groupService.getUserJoinRequests(user.id);
      const existingRequest = userRequests.data.find(
        req => req.groupId === project.groupId && req.status === 'pending'
      );
      
      if (existingRequest) {
        message.warning('您已经提交过申请，请等待群主审批');
        return;
      }
      
      onJoinGroup?.(project);
    } catch (error) {
      console.error('检查申请状态失败:', error);
      onJoinGroup?.(project);
    } finally {
      setJoinRequestLoading(false);
    }
  };

  const getPermissionIcon = () => {
    if (project.isPublic) {
      return (
        <Tooltip title="公开项目">
          <GlobalOutlined className="text-green-500" />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="私密项目">
          <LockOutlined className="text-orange-500" />
        </Tooltip>
      );
    }
  };

  const getAccessActions = () => {
    const actions = [];

    // 查看按钮 - 所有人都可以点击
    actions.push(
      <Button
        key="view"
        type="primary"
        icon={<EyeOutlined />}
        onClick={handleViewProject}
        size="small"
      >
        {canViewDetails ? '查看项目' : '查看详情'}
      </Button>
    );

    // 申请加入按钮 - 需要申请权限时显示
    if (needsJoinRequest && !project.isPublic) {
      actions.push(
        <Button
          key="join"
          icon={<UserAddOutlined />}
          onClick={handleJoinGroup}
          loading={joinRequestLoading}
          size="small"
        >
          申请加入
        </Button>
      );
    }

    return actions;
  };

  const getManagementActions = () => {
    const actions = [];

    if (canEdit) {
      actions.push(
        <Button
          key="edit"
          icon={<EditOutlined />}
          onClick={handleEditProject}
          size="small"
          type="text"
        >
          编辑
        </Button>
      );
    }

    if (canDelete) {
      actions.push(
        <Button
          key="delete"
          icon={<DeleteOutlined />}
          onClick={handleDeleteProject}
          size="small"
          type="text"
          danger
        >
          删除
        </Button>
      );
    }

    return actions;
  };

  const getPermissionLevelBadge = () => {
    const levelConfig = {
      [PermissionLevel.NONE]: { color: 'default', text: '无权限' },
      [PermissionLevel.VIEW_BASIC]: { color: 'orange', text: '基本信息' },
      [PermissionLevel.VIEW_DETAILS]: { color: 'blue', text: '详细查看' },
      [PermissionLevel.EDIT]: { color: 'green', text: '编辑权限' },
      [PermissionLevel.ADMIN]: { color: 'purple', text: '管理权限' }
    };

    const config = levelConfig[permissionLevel];
    return (
      <Badge 
        color={config.color} 
        text={config.text}
        style={{ fontSize: '12px' }}
      />
    );
  };

  return (
    <Card
      hoverable
      className={`transition-all duration-200 ${
        !canViewDetails ? 'opacity-75' : ''
      }`}
      styles={{
        body: { padding: '16px' }
      }}
    >
      <div className="space-y-3">
        {/* 项目头部信息 */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-lg font-medium truncate">{project.name}</h4>
              {getPermissionIcon()}
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
              {project.description}
            </p>
          </div>
        </div>

        {/* 项目统计信息 */}
        <div className="flex items-center justify-between">
          <Space size="middle">
            <div className="flex items-center space-x-1">
              <ApiOutlined className="text-blue-500" />
              <span className="text-sm">{project.apiCount} 个接口</span>
            </div>
            <div className="flex items-center space-x-1">
              <TeamOutlined className="text-green-500" />
              <span className="text-sm">{project.group.name}</span>
            </div>
          </Space>
          
          <div className="text-right">
            {getPermissionLevelBadge()}
          </div>
        </div>

        {/* 项目标签 */}
        <div className="flex flex-wrap gap-1">
          <StatusTag 
            status={`v${project.version}`} 
            statusMap={{
              [`v${project.version}`]: { color: 'blue', text: `v${project.version}` }
            }}
            size="small"
          />
          <StatusTag status={project.status} size="small" />
          {project.tags.slice(0, 3).map(tag => (
            <StatusTag 
              key={tag} 
              status={tag} 
              statusMap={{[tag]: { color: 'geekblue', text: tag }}}
              size="small"
            />
          ))}
          {project.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{project.tags.length - 3}</span>
          )}
        </div>

        {/* 权限提示信息 */}
        {!canViewDetails && !project.isPublic && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <LockOutlined className="text-orange-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-orange-700 font-medium">私密项目</div>
                <div className="text-xs text-orange-600 mt-1">
                  需要加入"{project.group.name}"群组才能查看项目详情
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 项目元信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Avatar size="small" icon={<TeamOutlined />} />
            <span>群主: {project.group.owner?.username || '未知'}</span>
          </div>
          <div>
            更新于 {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Space size="small">
            {getAccessActions()}
          </Space>
          
          {getManagementActions().length > 0 && (
            <Space size="small">
              {getManagementActions()}
            </Space>
          )}
        </div>
      </div>
    </Card>
  );
};

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  user,
  userGroupMemberships,
  loading = false,
  onEdit,
  onDelete,
  onJoinGroup
}) => {
  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Col key={index} xs={24} sm={12} lg={8} xl={6}>
            <Card loading />
          </Col>
        ))}
      </Row>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">暂无项目</div>
        <div className="text-gray-500 text-sm">
          还没有任何项目，创建第一个项目开始管理您的API吧！
        </div>
      </div>
    );
  }

  // 按权限级别排序项目
  const sortedProjects = [...projects].sort((a, b) => {
    const levelA = getUserProjectPermissionLevel(user, a, userGroupMemberships);
    const levelB = getUserProjectPermissionLevel(user, b, userGroupMemberships);
    
    const levelOrder = {
      [PermissionLevel.ADMIN]: 5,
      [PermissionLevel.EDIT]: 4,
      [PermissionLevel.VIEW_DETAILS]: 3,
      [PermissionLevel.VIEW_BASIC]: 2,
      [PermissionLevel.NONE]: 1
    };
    
    return levelOrder[levelB] - levelOrder[levelA];
  });

  return (
    <Row gutter={[16, 16]}>
      {sortedProjects.map(project => (
        <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
          <ProjectCard
            project={project}
            user={user}
            userGroupMemberships={userGroupMemberships}
            onEdit={onEdit}
            onDelete={onDelete}
            onJoinGroup={onJoinGroup}
          />
        </Col>
      ))}
    </Row>
  );
};

export default ProjectList;