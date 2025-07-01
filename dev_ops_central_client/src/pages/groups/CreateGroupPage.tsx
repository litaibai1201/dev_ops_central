import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Table,
  Space,
  message,
  Tag,
  Popconfirm,
  AutoComplete,
  Row,
  Col,
  Divider
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  PlusOutlined,
  TeamOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { User, GroupForm } from '../../types';
import { PageHeader } from '../../components/common';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;
const { Option } = Select;

interface GroupMemberItem {
  id: string;
  user: User;
  role: 'owner' | 'admin' | 'member';
  employeeId?: string;
}

interface CreateGroupPageProps {
  user: User;
}

const CreateGroupPage: React.FC<CreateGroupPageProps> = ({ user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  // 初始化时将当前用户设为群主
  useEffect(() => {
    const ownerMember: GroupMemberItem = {
      id: '1',
      user: {
        ...user,
        email: user.email || 'user@example.com'
      },
      role: 'owner'
    };
    setMembers([ownerMember]);
  }, [user]);

  // 模拟用户搜索
  const handleUserSearch = async (value: string) => {
    if (!value) {
      setSearchUsers([]);
      return;
    }

    setSearchLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUsers: User[] = [
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
        },
        {
          id: '4',
          username: 'charlie',
          email: 'charlie@example.com',
          role: 'user',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];
      
      // 过滤已添加的成员和搜索关键词
      const existingUserIds = members.map(m => m.user.id);
      const filteredUsers = mockUsers.filter(u => 
        !existingUserIds.includes(u.id) &&
        (u.username.toLowerCase().includes(value.toLowerCase()) ||
         u.email.toLowerCase().includes(value.toLowerCase()))
      );
      
      setSearchUsers(filteredUsers);
    } catch (error) {
      console.error('搜索用户失败:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 添加成员
  const handleAddMember = (selectedUser: User, role: 'admin' | 'member' = 'member') => {
    const newMember: GroupMemberItem = {
      id: Date.now().toString(),
      user: selectedUser,
      role,
      employeeId: selectedUser.username // 模拟工号
    };
    
    setMembers(prev => [...prev, newMember]);
    setSearchUsers([]);
  };

  // 移除成员
  const handleRemoveMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  // 更改成员角色
  const handleRoleChange = (memberId: string, newRole: 'admin' | 'member') => {
    setMembers(prev => 
      prev.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      )
    );
  };

  // 通过工号添加成员
  const handleAddByEmployeeId = async (employeeId: string) => {
    if (!employeeId.trim()) return;
    
    try {
      // 模拟通过工号查找用户
      const mockUser: User = {
        id: Date.now().toString(),
        username: employeeId,
        email: `${employeeId}@company.com`,
        role: 'user',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      
      handleAddMember(mockUser, 'member');
      message.success(`已添加用户 ${employeeId}`);
    } catch (error) {
      message.error('未找到该工号对应的用户');
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const groupData: GroupForm & { members: GroupMemberItem[] } = {
        name: values.groupName,
        description: values.description,
        members: members.filter(m => m.role !== 'owner') // 排除群主，因为群主由ownerId确定
      };
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('群组创建成功！');
      navigate('/groups');
    } catch (error) {
      message.error('创建群组失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 群组名称验证
  const validateGroupName = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入群组名称'));
    }
    if (/[^a-zA-Z0-9\u4e00-\u9fa5_-]/.test(value)) {
      return Promise.reject(new Error('群组名称不能包含特殊字符，只允许中英文、数字、下划线和短横线'));
    }
    if (value.length < 2 || value.length > 50) {
      return Promise.reject(new Error('群组名称长度应在2-50个字符之间'));
    }
    return Promise.resolve();
  };

  // 成员表格列定义
  const memberColumns: ColumnsType<GroupMemberItem> = [
    {
      title: '用户名',
      dataIndex: ['user', 'username'],
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: '工号',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (employeeId) => employeeId || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => {
        const roleColors = {
          owner: 'gold',
          admin: 'blue',
          member: 'green'
        };
        
        const roleNames = {
          owner: '群主',
          admin: '管理员',
          member: '普通成员'
        };

        if (role === 'owner') {
          return <Tag color={roleColors[role]}>{roleNames[role]}</Tag>;
        }

        return (
          <Select
            value={role}
            size="small"
            style={{ width: 100 }}
            onChange={(newRole) => handleRoleChange(record.id, newRole)}
          >
            <Option value="admin">管理员</Option>
            <Option value="member">普通成员</Option>
          </Select>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => {
        if (record.role === 'owner') {
          return <span style={{ color: '#999' }}>群主</span>;
        }
        
        return (
          <Popconfirm
            title="确定要移除该成员吗？"
            onConfirm={() => handleRemoveMember(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              size="small"
              icon={<DeleteOutlined />}
            >
              移除
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="创建群组"
        subtitle="创建新的团队群组，邀请成员协作开发"
        onBack={() => navigate(-1)}
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              {/* 基本信息 */}
              <Card 
                size="small" 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                    <span>基本信息</span>
                  </div>
                }
                style={{ marginBottom: '24px' }}
              >
                <Form.Item
                  name="groupName"
                  label="群组名称"
                  rules={[{ validator: validateGroupName }]}
                >
                  <Input
                    placeholder="请输入群组名称（只允许中英文、数字、下划线和短横线）"
                    maxLength={50}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="群组描述"
                  rules={[
                    { required: true, message: '请输入群组描述' },
                    { min: 10, message: '描述至少需要10个字符' },
                    { max: 500, message: '描述不能超过500个字符' }
                  ]}
                >
                  <TextArea
                    placeholder="请描述群组的用途、目标或工作范围..."
                    rows={4}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              {/* 添加成员 */}
              <Card 
                size="small" 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserAddOutlined style={{ color: '#52c41a' }} />
                    <span>添加成员</span>
                  </div>
                }
                style={{ marginBottom: '24px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {/* 通过用户名/邮箱搜索 */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      搜索用户
                    </label>
                    <AutoComplete
                      style={{ width: '100%' }}
                      placeholder="输入用户名或邮箱搜索"
                      onSearch={handleUserSearch}
                      loading={searchLoading}
                      options={searchUsers.map(user => ({
                        key: user.id,
                        value: user.username,
                        label: (
                          <div 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onClick={() => handleAddMember(user)}
                          >
                            <div>
                              <div style={{ fontWeight: 500 }}>{user.username}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                            </div>
                            <PlusOutlined style={{ color: '#1890ff' }} />
                          </div>
                        )
                      }))}
                    />
                  </div>

                  <Divider style={{ margin: '12px 0' }}>或</Divider>

                  {/* 通过工号添加 */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      工号添加
                    </label>
                    <Input.Search
                      placeholder="输入员工工号"
                      enterButton="添加"
                      onSearch={handleAddByEmployeeId}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* 成员列表 */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TeamOutlined style={{ color: '#722ed1' }} />
                <span>群组成员 ({members.length})</span>
              </div>
            }
            style={{ marginBottom: '24px' }}
          >
            <Table
              columns={memberColumns}
              dataSource={members}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: '暂无成员，请添加群组成员'
              }}
            />
          </Card>

          {/* 提交按钮 */}
          <Form.Item>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<CheckCircleOutlined />}
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  padding: '0 32px',
                  fontWeight: 500
                }}
              >
                {loading ? '创建中...' : '创建群组'}
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
    </div>
  );
};

export default CreateGroupPage;