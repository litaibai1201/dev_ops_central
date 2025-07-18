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
      
      console.log('Fetching available users with search:', search);
      
      // 调用真实的API接口
      const response = await groupService.getAvailableUsers({ 
        search: search || '' 
      });
      
      console.log('Available users response:', response);
      
      if (response.success) {
        // 过滤掉当前用户
        const filteredUsers = response.data.filter(user => user.id !== currentUser.id);
        setAvailableUsers(filteredUsers);
      } else {
        console.error('Failed to fetch users:', response.message);
        setAvailableUsers([]);
      }
    } catch (error: any) {
      console.error('Error fetching available users:', error);
      const errorMessage = error?.message || '获取用户列表失败';
      message.error(errorMessage);
      setAvailableUsers([]);
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

      console.log('Creating group with data:', formData);
      
      // 调用真实的API接口
      const response = await groupService.createGroup(formData);
      
      console.log('Create group response:', response);
      
      if (response.success) {
        message.success('群组创建成功！');
        handleCancel();
        onSuccess();
      } else {
        throw new Error(response.message || '创建群组失败');
      }
    } catch (error: any) {
      console.error('Create group error:', error);
      const errorMessage = error?.message || '创建群组失败';
      message.error(errorMessage);
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
