import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  message,
  Tag,
  Row,
  Col,
  Switch,
  Alert,
  List,
  Avatar,
  Popconfirm,
  Divider
} from 'antd';
import {
  FolderAddOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CrownOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { User, Group, ProjectForm } from '../../types';
import { 
  PageHeader,
  UserSearch,
  FormValidators,
  useOperations,
  usePermissions,
  CreateHelpCard
} from '../../components/common';
import { groupService } from '../../services/group';

const { TextArea } = Input;
const { Option } = Select;

interface ProjectManager {
  id: string;
  user: User;
  employeeId?: string;
  isGroupMember: boolean;
  memberRole?: 'owner' | 'admin' | 'member';
}

interface CreateProjectPageProps {
  user: User;
}

const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ user }) => {
  const [form] = Form.useForm();
  const [ownedGroups, setOwnedGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const navigate = useNavigate();
  const { loading, executeOperation } = useOperations();
  const permissions = usePermissions(user);

  // 获取用户拥有的群组
  useEffect(() => {
    fetchOwnedGroups();
  }, []);

  // 初始化项目负责人（默认为群主）
  useEffect(() => {
    if (selectedGroup) {
      const ownerManager: ProjectManager = {
        id: '1',
        user: {
          ...user,
          email: user.email || 'user@example.com'
        },
        isGroupMember: true,
        memberRole: 'owner',
        employeeId: user.username
      };
      setProjectManagers([ownerManager]);
    }
  }, [selectedGroup, user]);

  const fetchOwnedGroups = async () => {
    try {
      const response = await groupService.getUserGroups(user.id);
      if (response.success) {
        const owned = response.data.filter(group => group.ownerId === user.id);
        setOwnedGroups(owned);
        
        if (owned.length === 1) {
          setSelectedGroup(owned[0]);
          form.setFieldsValue({ groupId: owned[0].id });
          fetchGroupMembers(owned[0].id);
        }
      }
    } catch (error) {
      // 使用模拟数据
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
            ownerId: user.id,
            owner: user,
            members: [],
            projectCount: 3,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          {
            id: '2',
            name: '全栈开发组',
            description: '负责全栈应用开发',
            ownerId: user.id,
            owner: user,
            members: [],
            projectCount: 2,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        );
      }
      
      setOwnedGroups(mockGroups);
      
      if (mockGroups.length === 1) {
        setSelectedGroup(mockGroups[0]);
        form.setFieldsValue({ groupId: mockGroups[0].id });
        fetchGroupMembers(mockGroups[0].id);
      }
    }
  };

  // 获取群组成员
  const fetchGroupMembers = async (groupId: string) => {
    try {
      const response = await groupService.getGroupMembers(groupId);
      if (response.success) {
        const members = response.data.map(member => member.user);
        setGroupMembers(members);
      }
    } catch (error) {
      // 使用模拟数据
      const mockMembers: User[] = [
        {
          id: '2',
          username: 'alice',
          email: 'alice@example.com',
          role: 'user',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '3',
          username: 'bob',
          email: 'bob@example.com',
          role: 'user',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];
      setGroupMembers(mockMembers);
    }
  };

  // 选择群组变化
  const handleGroupChange = (groupId: string) => {
    const group = ownedGroups.find(g => g.id === groupId);
    setSelectedGroup(group || null);
    fetchGroupMembers(groupId);
    setProjectManagers([]);
  };

  // 添加项目负责人（从群组成员）
  const handleAddManagerFromGroup = (selectedUserId: string) => {
    const selectedUser = groupMembers.find(u => u.id === selectedUserId);
    if (!selectedUser) return;

    const newManager: ProjectManager = {
      id: Date.now().toString(),
      user: selectedUser,
      isGroupMember: true,
      memberRole: selectedUser.id === user.id ? 'owner' : 'member',
      employeeId: selectedUser.username
    };
    
    setProjectManagers(prev => [...prev, newManager]);
  };

  // 通过工号添加负责人
  const handleAddByEmployeeId = (addedUser: User) => {
    const newManager: ProjectManager = {
      id: Date.now().toString(),
      user: addedUser,
      isGroupMember: false,
      employeeId: addedUser.username
    };
    
    setProjectManagers(prev => [...prev, newManager]);
    message.success(`已添加负责人 ${addedUser.username}`);
  };

  // 移除项目负责人
  const handleRemoveManager = (managerId: string) => {
    const manager = projectManagers.find(m => m.id === managerId);
    if (manager?.memberRole === 'owner') {
      message.warning('不能移除群主作为项目负责人');
      return;
    }
    
    setProjectManagers(prev => prev.filter(m => m.id !== managerId));
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    if (!selectedGroup) {
      message.error('请选择群组');
      return;
    }

    if (projectManagers.length === 0) {
      message.error('至少需要一个项目负责人');
      return;
    }

    await executeOperation(
      async () => {
        const projectData: ProjectForm & { managers: ProjectManager[] } = {
          name: values.projectName,
          description: values.description,
          groupId: selectedGroup.id,
          isPublic: values.isPublic || false,
          tags: values.tags || [],
          version: values.version || 'v1.0.0',
          managers: projectManagers
        };
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        navigate('/dashboard');
      },
      '专案创建成功！',
      '创建专案失败，请重试'
    );
  };

  // 获取可选的群组成员（排除已添加的）
  const getAvailableGroupMembers = () => {
    const addedUserIds = projectManagers.map(m => m.user.id);
    return groupMembers.filter(member => !addedUserIds.includes(member.id));
  };

  // 渲染角色标签
  const renderRoleTag = (manager: ProjectManager) => {
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
      <PageHeader
        title="创建专案"
        subtitle="在群组中创建新的API专案"
        actions={[
          {
            key: 'back',
            text: '返回',
            type: 'default',
            onClick: () => navigate(-1)
          }
        ]}
      />

      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
            >
              {/* 基本信息 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <FolderAddOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontSize: '16px', fontWeight: 500 }}>基本信息</span>
                </div>

                <Form.Item
                  name="groupId"
                  label="所属群组"
                  rules={[{ required: true, message: '请选择群组' }]}
                >
                  <Select
                    placeholder="选择要在哪个群组中创建专案"
                    onChange={handleGroupChange}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {ownedGroups.map(group => (
                      <Option key={group.id} value={group.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <TeamOutlined />
                          <span>{group.name}</span>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            ({group.projectCount} 个专案)
                          </span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {ownedGroups.length === 0 && (
                  <Alert
                    message="无可用群组"
                    description="您还没有管理任何群组，请先创建群组后再创建专案。"
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                    action={
                      <Button size="small" onClick={() => navigate('/groups/create')}>
                        创建群组
                      </Button>
                    }
                  />
                )}

                <Form.Item
                  name="projectName"
                  label="专案名称"
                  rules={[{ validator: FormValidators.validateName(2, 100, true) }]}
                >
                  <Input
                    placeholder="请输入专案名称"
                    maxLength={100}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="专案描述"
                  rules={[{ validator: FormValidators.validateDescription(10, 500) }]}
                >
                  <TextArea
                    placeholder="请描述专案的功能、用途或API接口类型..."
                    rows={4}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="version"
                      label="版本号"
                      initialValue="v1.0.0"
                      rules={[{ validator: FormValidators.validateVersion }]}
                    >
                      <Input placeholder="例如: v1.0.0" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="isPublic"
                      label="可见性"
                      valuePropName="checked"
                      initialValue={false}
                    >
                      <Switch
                        checkedChildren="公开"
                        unCheckedChildren="私有"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* 项目负责人 */}
              {selectedGroup && (
                <Card 
                  size="small" 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserOutlined style={{ color: '#52c41a' }} />
                      <span>项目负责人</span>
                    </div>
                  }
                  style={{ marginBottom: '24px' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* 从群组成员选择 */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        从群组成员中选择
                      </label>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="选择群组成员作为项目负责人"
                        onChange={handleAddManagerFromGroup}
                        value={undefined}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as unknown as string)
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {getAvailableGroupMembers()
                          .sort((a, b) => {
                            const aRole = a.id === user.id ? 'owner' : 'member';
                            const bRole = b.id === user.id ? 'owner' : 'member';
                            const roleOrder = { owner: 0, admin: 1, member: 2 };
                            return roleOrder[aRole as keyof typeof roleOrder] - roleOrder[bRole as keyof typeof roleOrder];
                          })
                          .map(member => (
                            <Option key={member.id} value={member.id}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Avatar size="small" icon={<UserOutlined />} />
                                <span>{member.username}</span>
                                <span style={{ fontSize: '12px', color: '#666' }}>
                                  ({member.email})
                                </span>
                                {member.id === user.id && <CrownOutlined style={{ color: '#faad14' }} />}
                              </div>
                            </Option>
                          ))}
                      </Select>
                    </div>

                    <Divider style={{ margin: '12px 0' }}>或</Divider>

                    {/* 通过工号搜索 */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        通过工号添加外部负责人
                      </label>
                      <UserSearch
                        onAddUser={handleAddByEmployeeId}
                        placeholder="输入员工工号"
                      />
                    </div>
                  </Space>
                </Card>
              )}

              {/* 提交按钮 */}
              <Form.Item>
                <Space size="middle">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    icon={<CheckCircleOutlined />}
                    disabled={ownedGroups.length === 0}
                    style={{
                      borderRadius: '8px',
                      height: '48px',
                      padding: '0 32px',
                      fontWeight: 500
                    }}
                  >
                    {loading ? '创建中...' : '创建专案'}
                  </Button>
                  
                  <Button
                    size="large"
                    onClick={() => navigate(-1)}
                    style={{
                      borderRadius: '8px',
                      height: '48px',
                      padding: '0 32px'
                    }}
                  >
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          {/* 项目负责人列表 */}
          {projectManagers.length > 0 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TeamOutlined style={{ color: '#722ed1' }} />
                  <span>已选择的负责人 ({projectManagers.length})</span>
                </div>
              }
              style={{ marginBottom: '24px' }}
            >
              <List
                dataSource={projectManagers}
                renderItem={(manager) => (
                  <List.Item
                    actions={
                      manager.memberRole !== 'owner' ? [
                        <Popconfirm
                          title="确定要移除该负责人吗？"
                          onConfirm={() => handleRemoveManager(manager.id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button 
                            type="link" 
                            danger 
                            size="small"
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      ] : []
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{manager.user.username}</span>
                          {renderRoleTag(manager)}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ color: '#666' }}>{manager.user.email}</div>
                          {manager.employeeId && (
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              工号: {manager.employeeId}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* 帮助信息 */}
          <CreateHelpCard
            title="创建说明"
            helpTexts={[
              "项目负责人说明：",
              "• 默认包含群主作为项目负责人",
              "• 可以添加群组内的其他成员",
              "• 可以通过工号添加外部成员",
              "• 负责人将拥有项目管理权限",
              "",
              "权限说明：",
              "• 群主 拥有最高管理权限",
              "• 管理员 可以管理项目和成员",
              "• 普通成员 可以查看和编辑API",
              "• 外部成员 仅有项目访问权限"
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CreateProjectPage;
