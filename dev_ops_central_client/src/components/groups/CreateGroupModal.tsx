import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Space, 
  Select, 
  message,
  Avatar,
  Tag,
  Spin
} from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { User, GroupForm } from '../../types';
import { groupService } from '../../services/group';
import { userService } from '../../services/user';

interface CreateGroupModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  currentUser: User;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  currentUser
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      fetchAvailableUsers();
    }
  }, [visible]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchText.trim()) {
        fetchAvailableUsers(searchText);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  const fetchAvailableUsers = async (search?: string) => {
    try {
      setSearchLoading(true);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟用户数据
      const mockUsers: User[] = [
        {
          id: '2',
          username: 'developer1',
          email: 'dev1@company.com',
          role: 'user',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02'
        },
        {
          id: '3',
          username: 'developer2',
          email: 'dev2@company.com',
          role: 'user',
          createdAt: '2024-01-03',
          updatedAt: '2024-01-03'
        },
        {
          id: '4',
          username: 'designer1',
          email: 'design1@company.com',
          role: 'user',
          createdAt: '2024-01-04',
          updatedAt: '2024-01-04'
        },
        {
          id: '5',
          username: 'tester1',
          email: 'test1@company.com',
          role: 'user',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-05'
        }
      ];

      // 过滤掉当前用户
      const filteredUsers = mockUsers.filter(user => user.id !== currentUser.id);
      
      // 如果有搜索条件，进行过滤
      const searchedUsers = search 
        ? filteredUsers.filter(user => 
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
          )
        : filteredUsers;

      setAvailableUsers(searchedUsers);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedMembers([]);
    setSearchText('');
    onCancel();
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const formData: GroupForm = {
        name: values.name,
        description: values.description,
        memberIds: selectedMembers.map(member => member.id)
      };

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('群组创建成功！');
      handleCancel();
      onSuccess();
    } catch (error) {
      message.error('创建群组失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    if (user && !selectedMembers.find(m => m.id === userId)) {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleMemberRemove = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== userId));
  };

  const renderUserOption = (user: User) => (
    <Select.Option key={user.id} value={user.id}>
      <div className="flex items-center">
        <Avatar 
          size="small" 
          icon={<UserOutlined />} 
          className="mr-2"
        />
        <div>
          <div className="font-medium">{user.username}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      </div>
    </Select.Option>
  );

  return (
    <Modal
      title="创建群组"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="群组名称"
          rules={[
            { required: true, message: '请输入群组名称' },
            { min: 2, message: '群组名称至少2个字符' },
            { max: 50, message: '群组名称不能超过50个字符' }
          ]}
        >
          <Input placeholder="输入群组名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="群组描述"
          rules={[
            { required: true, message: '请输入群组描述' },
            { max: 200, message: '群组描述不能超过200个字符' }
          ]}
        >
          <Input.TextArea 
            placeholder="输入群组描述"
            rows={3}
          />
        </Form.Item>

        <Form.Item label="添加成员（可选）">
          <Select
            showSearch
            placeholder="搜索并选择要添加的成员"
            notFoundContent={searchLoading ? <Spin size="small" /> : '暂无数据'}
            filterOption={false}
            onSearch={setSearchText}
            onSelect={handleMemberSelect}
            value={undefined} // 保持搜索框为空
            dropdownRender={menu => (
              <div>
                {menu}
                {availableUsers.length === 0 && !searchLoading && (
                  <div className="p-3 text-center text-gray-500">
                    <SearchOutlined className="mr-2" />
                    输入用户名或邮箱搜索用户
                  </div>
                )}
              </div>
            )}
          >
            {availableUsers.map(renderUserOption)}
          </Select>
          
          {/* 已选择的成员 */}
          {selectedMembers.length > 0 && (
            <div className="mt-3">
              <div className="text-sm text-gray-600 mb-2">已选择成员：</div>
              <div className="space-y-2">
                {selectedMembers.map(member => (
                  <Tag
                    key={member.id}
                    closable
                    onClose={() => handleMemberRemove(member.id)}
                    className="flex items-center p-2"
                  >
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />} 
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">{member.username}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </Tag>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                提示：您将自动成为该群组的群主，所选成员将以普通成员身份加入群组
              </div>
            </div>
          )}
        </Form.Item>

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              创建群组
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateGroupModal;
