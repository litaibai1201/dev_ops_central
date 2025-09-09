import React from 'react';
import { Button, Space, Tooltip, Card, Row, Col, Tag, Divider, Input } from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  FolderAddOutlined,
  CrownOutlined,
  UserOutlined,
  ProjectOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { User, Group } from '../../types';
import { usePermissions } from './PermissionUtils';

interface QuickActionsProps {
  user: User;
  ownedGroups: Group[];
  onCreateGroup: () => void;
  onCreateProject: () => void;
  userGroups?: Group[];
}

const QuickActions: React.FC<QuickActionsProps> = ({
  user,
  ownedGroups,
  onCreateGroup,
  onCreateProject,
  userGroups = []
}) => {
  const permissions = usePermissions(user);
  const stats = {
    myGroups: userGroups.length,
    ownedGroups: ownedGroups.length
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusOutlined style={{ color: '#1890ff' }} />
          <span>快捷操作</span>
        </div>
      }
      style={{ marginBottom: '24px' }}
    >
      <Space size="large" wrap>
        {/* 创建群组按钮 - 所有用户都可以创建 */}
        <Tooltip title="创建新的团队群组，邀请成员协作开发">
          <Button 
            type="primary"
            icon={<TeamOutlined />}
            size="large"
            onClick={onCreateGroup}
            style={{
              borderRadius: '8px',
              height: '48px',
              padding: '0 24px',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            创建群组
          </Button>
        </Tooltip>
        
        {/* 创建专案按钮 - 只有群主才能创建 */}
        {ownedGroups.length > 0 ? (
          <Tooltip title={`在你管理的 ${ownedGroups.length} 个群组中创建新专案`}>
            <Button 
              type="primary"
              icon={<FolderAddOutlined />}
              size="large"
              onClick={onCreateProject}
              style={{
                borderRadius: '8px',
                height: '48px',
                padding: '0 24px',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)'
              }}
            >
              创建专案
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title="你需要先成为群组的群主才能创建专案。可以创建新群组或联系现有群组的群主转移所有权。">
            <Button 
              icon={<FolderAddOutlined />}
              size="large"
              disabled
              style={{
                borderRadius: '8px',
                height: '48px',
                padding: '0 24px',
                fontWeight: 500
              }}
            >
              创建专案
            </Button>
          </Tooltip>
        )}
        
        {/* 状态说明 */}
        <div style={{
          padding: '12px 16px',
          background: ownedGroups.length > 0 ? '#f6ffed' : '#fff2e8',
          border: `1px solid ${ownedGroups.length > 0 ? '#b7eb8f' : '#ffd591'}`,
          borderRadius: '8px',
          fontSize: '14px',
          color: ownedGroups.length > 0 ? '#52c41a' : '#fa8c16'
        }}>
          {ownedGroups.length > 0 ? (
            <>
              <strong>✓ 您是 {ownedGroups.length} 个群组的群主</strong>
              <br />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                群组：{ownedGroups.map(g => g.name).join('、')}
              </span>
            </>
          ) : (
            <>
              <strong>⚠ 暂无群组管理权限</strong>
              <br />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                需要成为群主才能创建专案
              </span>
            </>
          )}
        </div>
      </Space>
    </Card>
  );
};

interface PermissionInfoProps {
  user: User;
  userGroups: Group[];
  ownedGroups: Group[];
}

const PermissionInfo: React.FC<PermissionInfoProps> = ({ 
  user, 
  userGroups, 
  ownedGroups 
}) => {
  const stats = {
    myGroups: userGroups.length,
    ownedGroups: ownedGroups.length
  };

  return (
    <Card style={{ marginTop: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>权限说明</h3>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <div style={{ padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
            <h4 style={{ fontWeight: 500, color: '#1c4e80', marginBottom: '8px' }}>
              当前身份：{user.role === 'system_admin' ? '系统管理员' : '普通用户'}
            </h4>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#1c5aa0' }}>
                参与群组：{stats.myGroups} 个 | 管理群组：{stats.ownedGroups} 个
              </span>
            </div>
            <ul style={{ fontSize: '14px', color: '#1c5aa0', lineHeight: '1.6', paddingLeft: '16px' }}>
              <li>• 可以查看所有公开专案的基本信息</li>
              <li>• 可以创建群组并邀请成员加入</li>
              {ownedGroups.length > 0 && (
                <li>• 作为群主可以在管理的群组中创建专案</li>
              )}
              {user.role === 'system_admin' && (
                <>
                  <li>• 拥有系统最高管理权限</li>
                  <li>• 可以管理所有用户和群组</li>
                </>
              )}
            </ul>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ padding: '16px', backgroundColor: '#f6ffed', borderRadius: '8px' }}>
            <h4 style={{ fontWeight: 500, color: '#389e0d', marginBottom: '8px' }}>权限说明</h4>
            <ul style={{ fontSize: '14px', color: '#52c41a', lineHeight: '1.6', paddingLeft: '16px' }}>
              <li>• <strong>创建群组</strong>：所有用户都可以创建群组</li>
              <li>• <strong>创建专案</strong>：仅群主可以在其群组中创建专案</li>
              <li>• <strong>群主权限</strong>：管理群组成员、分配角色、创建专案</li>
              <li>• <strong>专案管理员</strong>：在具体专案中的管理权限</li>
              <li>• <strong>角色相对性</strong>：同一用户可以是多个群组的成员，某些群组的群主</li>
            </ul>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

interface CreateHelpCardProps {
  title: string;
  helpTexts: string[];
}

const CreateHelpCard: React.FC<CreateHelpCardProps> = ({ title, helpTexts }) => {
  return (
    <Card title={title} size="small">
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {helpTexts.map((text, index) => (
          <div key={index} style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {text}
          </div>
        ))}
      </Space>
    </Card>
  );
};

interface ProjectManagerDisplayProps {
  managers: Array<{
    id: string;
    user: User;
    role?: 'owner' | 'admin' | 'member';
    isGroupMember: boolean;
    memberRole?: 'owner' | 'admin' | 'member';
    employeeId?: string;
  }>;
  onRemove?: (managerId: string) => void;
}

const ProjectManagerDisplay: React.FC<ProjectManagerDisplayProps> = ({ 
  managers, 
  onRemove 
}) => {
  const renderRoleTag = (manager: any) => {
    if (manager.memberRole === 'owner') {
      return <Tag color="gold" icon={<CrownOutlined />}>群主</Tag>;
    }
    if (manager.memberRole === 'admin') {
      return <Tag color="blue">管理员</Tag>;
    }
    if (manager.isGroupMember) {
      return <Tag color="green">普通成员</Tag>;
    }
    return <Tag color="orange">外部成员</Tag>;
  };

  return (
    <div>
      {managers.map((manager) => (
        <div key={manager.id} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserOutlined style={{ fontSize: '16px', color: '#666' }} />
            <div>
              <div style={{ fontWeight: 500 }}>
                {manager.user.username}
                {renderRoleTag(manager)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {manager.user.email}
                {manager.employeeId && (
                  <span> | 工号: {manager.employeeId}</span>
                )}
              </div>
            </div>
          </div>
          {manager.memberRole !== 'owner' && onRemove && (
            <Button 
              type="link" 
              danger 
              size="small"
              onClick={() => onRemove(manager.id)}
            >
              移除
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

// 日期格式化工具
export const formatDate = (dateString: string, format: 'simple' | 'full' = 'simple') => {
  const date = new Date(dateString);
  
  if (format === 'full') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }
  
  return date.toLocaleDateString();
};

// 用户搜索组件
interface UserSearchProps {
  onAddUser: (user: User) => void;
  placeholder?: string;
  disabled?: boolean;
}

const UserSearch: React.FC<UserSearchProps> = ({ 
  onAddUser, 
  placeholder = "输入工号或姓名搜索用户",
  disabled = false
}) => {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = async (value: string) => {
    if (!value.trim()) return;
    
    try {
      // 模拟搜索用户
      const mockUser: User = {
        id: Date.now().toString(),
        username: value.trim(),
        email: `${value.trim()}@company.com`,
        role: 'user',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      
      onAddUser(mockUser);
      
      // 清空输入框
      setSearchValue('');
    } catch (error) {
      console.error('搜索用户失败:', error);
    }
  };

  return (
    <div>
      <Input.Search
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        enterButton="添加"
        size="large"
        onSearch={handleSearch}
        disabled={disabled}
        style={{ width: '100%' }}
      />
      <div style={{ 
        fontSize: '12px', 
        color: '#999', 
        marginTop: '8px',
        lineHeight: '1.4'
      }}>
        支持通过员工工号或姓名搜索添加成员
      </div>
    </div>
  );
};

export {
  QuickActions,
  PermissionInfo,
  CreateHelpCard,
  ProjectManagerDisplay,
  UserSearch
};
