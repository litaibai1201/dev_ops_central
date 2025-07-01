import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Space,
  Typography,
  Modal,
  Divider
} from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  ProjectOutlined,
  RocketOutlined,
  UserAddOutlined,
  FileTextOutlined,
  SettingOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import CreateGroupModal from '../groups/CreateGroupModal';
import BrowseGroups from '../groups/BrowseGroups';

const { Title, Text } = Typography;

interface QuickActionsProps {
  user: User;
}

interface ActionItem {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type?: 'primary' | 'default';
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [browseGroupsVisible, setBrowseGroupsVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const handleCreateGroup = () => {
    setCreateGroupModalVisible(false);
    // 刷新页面数据或显示成功消息
  };

  // 基础操作 - 所有用户都可用
  const basicActions: ActionItem[] = [
    {
      key: 'create-group',
      title: '创建群组',
      description: '创建新的开发团队群组',
      icon: <TeamOutlined style={{ fontSize: '20px' }} />,
      type: 'primary',
      onClick: () => setCreateGroupModalVisible(true)
    },
    {
      key: 'manage-groups',
      title: '管理群组',
      description: '查看和管理我的群组',
      icon: <SettingOutlined style={{ fontSize: '20px' }} />,
      onClick: () => navigate('/groups')
    },
    {
      key: 'join-group',
      title: '申请入组',
      description: '浏览并申请加入现有群组',
      icon: <UserAddOutlined style={{ fontSize: '20px' }} />,
      onClick: () => setBrowseGroupsVisible(true)
    }
  ];

  // 高级操作 - 根据用户权限显示
  const advancedActions: ActionItem[] = [];
  
  if (user.role === 'project_admin' || user.role === 'group_owner' || user.role === 'system_admin') {
    advancedActions.push({
      key: 'create-project',
      title: '创建专案',
      description: '在群组中创建新的API专案',
      icon: <ProjectOutlined style={{ fontSize: '20px' }} />,
      type: 'primary',
      onClick: () => navigate('/projects/create')
    });
  }

  if (user.role === 'group_owner' || user.role === 'system_admin') {
    advancedActions.push({
      key: 'advanced-settings',
      title: '高级设置',
      description: '群组权限和系统配置',
      icon: <SettingOutlined style={{ fontSize: '20px' }} />,
      onClick: () => navigate('/admin')
    });
  }

  // 辅助功能
  const utilityActions: ActionItem[] = [
    {
      key: 'api-docs',
      title: 'API文档',
      description: '查看平台API使用文档',
      icon: <FileTextOutlined style={{ fontSize: '20px' }} />,
      onClick: () => navigate('/docs')
    },
    {
      key: 'help',
      title: '使用帮助',
      description: '查看功能说明和使用指南',
      icon: <QuestionCircleOutlined style={{ fontSize: '20px' }} />,
      onClick: () => setHelpModalVisible(true)
    }
  ];

  const renderActionCard = (action: ActionItem) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={action.key}>
      <Card
        hoverable
        style={{ 
          height: '100%',
          transition: 'all 0.2s',
          borderLeft: '4px solid transparent'
        }}
        bodyStyle={{ padding: '20px' }}
        onClick={action.onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderLeftColor = '#1890ff';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderLeftColor = 'transparent';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: action.type === 'primary' ? '#e6f7ff' : '#f5f5f5',
            color: action.type === 'primary' ? '#1890ff' : '#666'
          }}>
            {action.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ 
                fontWeight: 500, 
                color: '#1f1f1f', 
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {action.title}
              </h4>
              {action.badge && (
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  backgroundColor: '#fff2f0',
                  color: '#ff4d4f',
                  fontSize: '12px',
                  borderRadius: '10px'
                }}>
                  {action.badge}
                </span>
              )}
            </div>
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginTop: '4px',
              marginBottom: 0,
              lineHeight: '1.4'
            }}>
              {action.description}
            </p>
          </div>
        </div>
      </Card>
    </Col>
  );

  const HelpModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <QuestionCircleOutlined style={{ marginRight: '8px' }} />
          使用帮助
        </div>
      }
      open={helpModalVisible}
      onCancel={() => setHelpModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setHelpModalVisible(false)}>
          关闭
        </Button>
      ]}
      width={600}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <Title level={5}>🚀 快速开始</Title>
          <Text style={{ color: '#666' }}>
            欢迎使用DevOps Central API管理平台！以下是一些快速操作指南：
          </Text>
        </div>
        
        <div>
          <Title level={5}>👥 群组管理</Title>
          <ul style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', paddingLeft: '16px' }}>
            <li>• <strong>创建群组</strong>：任何用户都可以创建群组并成为群主</li>
            <li>• <strong>添加成员</strong>：创建群组时可以直接添加团队成员</li>
            <li>• <strong>申请入组</strong>：可以申请加入现有的群组</li>
            <li>• <strong>权限管理</strong>：群主可以管理成员权限和群组设置</li>
          </ul>
        </div>

        <div>
          <Title level={5}>📋 专案管理</Title>
          <ul style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', paddingLeft: '16px' }}>
            <li>• <strong>查看专案</strong>：可以查看所有公开的API专案</li>
            <li>• <strong>创建专案</strong>：群组成员可以在群组内创建API专案</li>
            <li>• <strong>接口测试</strong>：可以在线测试API接口</li>
            <li>• <strong>文档查看</strong>：查看详细的API文档和代码示例</li>
          </ul>
        </div>

        <div>
          <Title level={5}>🔑 权限说明</Title>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <p><strong>当前角色：</strong>
              {user.role === 'user' && '普通用户'}
              {user.role === 'project_admin' && '专案管理员'}
              {user.role === 'group_owner' && '群主'}
              {user.role === 'system_admin' && '系统管理员'}
            </p>
            <p style={{ marginTop: '8px' }}>
              不同角色拥有不同的操作权限，详细权限说明请查看页面底部的权限说明区域。
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <Title level={4} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <RocketOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              快速操作
            </Title>
            <Text type="secondary">
              选择下方操作快速开始使用平台功能
            </Text>
          </div>
        </div>

        {/* 基础操作区域 */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#666' }}>
            🎯 常用操作
          </Title>
          <Row gutter={[16, 16]}>
            {basicActions.map(renderActionCard)}
          </Row>
        </div>

        {/* 高级操作区域 */}
        {advancedActions.length > 0 && (
          <>
            <Divider />
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={{ marginBottom: '16px', color: '#666' }}>
                ⚡ 高级操作
              </Title>
              <Row gutter={[16, 16]}>
                {advancedActions.map(renderActionCard)}
              </Row>
            </div>
          </>
        )}

        {/* 辅助功能区域 */}
        <Divider />
        <div>
          <Title level={5} style={{ marginBottom: '16px', color: '#666' }}>
            📚 辅助功能
          </Title>
          <Row gutter={[16, 16]}>
            {utilityActions.map(renderActionCard)}
          </Row>
        </div>

        {/* 用户状态提示 */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#f0f8ff', 
          borderRadius: '8px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ 
              padding: '8px', 
              backgroundColor: '#e6f7ff', 
              borderRadius: '50%' 
            }}>
              <TeamOutlined style={{ color: '#1890ff' }} />
            </div>
            <div>
              <Title level={5} style={{ color: '#1c4e80', marginBottom: '4px' }}>
                欢迎，{user.username}！
              </Title>
              <Text style={{ color: '#1890ff', fontSize: '14px' }}>
                {user.role === 'user' && '作为普通用户，你可以创建群组、查看公开专案并申请加入团队。'}
                {user.role === 'project_admin' && '作为专案管理员，你可以管理专案和创建新的API接口。'}
                {user.role === 'group_owner' && '作为群主，你拥有群组的完全管理权限，可以管理成员和专案。'}
                {user.role === 'system_admin' && '作为系统管理员，你拥有平台的最高权限。'}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* 创建群组模态框 */}
      <CreateGroupModal
        visible={createGroupModalVisible}
        onCancel={() => setCreateGroupModalVisible(false)}
        onSuccess={handleCreateGroup}
        currentUser={user}
      />

      {/* 浏览群组模态框 */}
      <BrowseGroups
        user={user}
        visible={browseGroupsVisible}
        onCancel={() => setBrowseGroupsVisible(false)}
      />

      {/* 帮助模态框 */}
      <HelpModal />
    </>
  );
};

export default QuickActions;