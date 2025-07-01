import React, { useState } from 'react';
import { 
  Alert, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message,
  Space,
  Card,
  Typography,
  Divider
} from 'antd';
import {
  LockOutlined,
  TeamOutlined,
  UserAddOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { User, Project, Group, GroupMember, JoinRequest } from '../../types';
import { createPermissionChecker, PERMISSION_MESSAGES } from '../../utils/permissions';
import { groupService } from '../../services/group';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface PermissionGuardProps {
  user: User;
  project: Project;
  userGroupMemberships: GroupMember[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showJoinRequestButton?: boolean;
}

interface JoinRequestModalProps {
  visible: boolean;
  onCancel: () => void;
  group: Group;
  user: User;
  onSuccess: () => void;
}

const JoinRequestModal: React.FC<JoinRequestModalProps> = ({
  visible,
  onCancel,
  group,
  user,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<JoinRequest | null>(null);

  React.useEffect(() => {
    if (visible) {
      checkExistingRequest();
    }
  }, [visible]);

  const checkExistingRequest = async () => {
    try {
      const response = await groupService.getUserJoinRequests(user.id);
      const existing = response.data.find(
        req => req.groupId === group.id && req.status === 'pending'
      );
      setExistingRequest(existing || null);
    } catch (error) {
      console.error('检查申请状态失败:', error);
    }
  };

  const handleSubmit = async (values: { message: string }) => {
    if (existingRequest) {
      message.warning('您已经提交过申请，请等待群主审批');
      return;
    }

    setLoading(true);
    try {
      await groupService.submitJoinRequest({
        groupId: group.id,
        message: values.message
      });
      message.success('申请已提交，请等待群主审批');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      message.error('提交申请失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!existingRequest) return;

    Modal.confirm({
      title: '确认撤销申请',
      content: '确定要撤销加入群组的申请吗？撤销后需要重新申请。',
      icon: <ExclamationCircleOutlined />,
      okText: '确认撤销',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await groupService.cancelJoinRequest(existingRequest.id);
          message.success('申请已撤销');
          setExistingRequest(null);
          onCancel();
        } catch (error) {
          message.error('撤销申请失败');
        }
      }
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <UserAddOutlined className="mr-2 text-blue-500" />
          申请加入群组
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div className="space-y-4">
        <Card size="small" className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <TeamOutlined className="text-blue-500 text-lg mt-1" />
            <div>
              <Title level={5} className="mb-1">{group.name}</Title>
              <Text type="secondary">{group.description}</Text>
              <div className="mt-2">
                <Text strong>群主: </Text>
                <Text>{group.owner.username}</Text>
              </div>
            </div>
          </div>
        </Card>

        {existingRequest ? (
          <Alert
            message="您已提交加入申请"
            description={
              <div>
                <p>申请时间: {new Date(existingRequest.createdAt).toLocaleString()}</p>
                <p>申请理由: {existingRequest.message}</p>
                <p className="text-orange-600 mt-2">请耐心等待群主审批，或联系群主加快处理进度。</p>
              </div>
            }
            type="info"
            showIcon
            action={
              <Button size="small" onClick={handleCancelRequest}>
                撤销申请
              </Button>
            }
          />
        ) : (
          <>
            <Alert
              message="需要加入群组才能查看此私密项目"
              description="此项目设置为私密访问，只有群组成员可以查看项目的详细内容和接口信息。请填写申请理由，我们会尽快处理您的申请。"
              type="warning"
              showIcon
            />
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                label="申请理由"
                name="message"
                rules={[
                  { required: true, message: '请填写申请理由' },
                  { min: 10, message: '申请理由至少10个字符' },
                  { max: 500, message: '申请理由不能超过500个字符' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="请简述您申请加入此群组的理由，如您的工作职责、项目经验或学习目的等..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <div className="flex justify-end space-x-2">
                  <Button onClick={onCancel}>
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={loading}
                    icon={<UserAddOutlined />}
                  >
                    提交申请
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </>
        )}
      </div>
    </Modal>
  );
};

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  user,
  project,
  userGroupMemberships,
  children,
  fallback,
  showJoinRequestButton = true
}) => {
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [userMemberships, setUserMemberships] = useState<GroupMember[]>(userGroupMemberships);

  const checker = createPermissionChecker(user);
  const canViewDetails = checker.canViewProjectDetails(project, userMemberships);
  const needsJoinRequest = checker.needsJoinRequest(project, userMemberships);

  // 如果可以查看详情，直接渲染子组件
  if (canViewDetails) {
    return <>{children}</>;
  }

  // 如果提供了自定义的fallback组件，使用它
  if (fallback) {
    return <>{fallback}</>;
  }

  // 默认的权限提示UI
  const handleJoinSuccess = () => {
    // 刷新用户的群组成员关系
    groupService.getUserGroupMemberships(user.id)
      .then(response => {
        setUserMemberships(response.data);
      })
      .catch(error => {
        console.error('刷新用户群组关系失败:', error);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-lg w-full shadow-lg">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <LockOutlined className="text-2xl text-orange-500" />
            </div>
          </div>

          <div>
            <Title level={4} className="mb-2">项目访问受限</Title>
            <Paragraph type="secondary" className="mb-4">
              {PERMISSION_MESSAGES.PROJECT_PRIVATE}
            </Paragraph>
          </div>

          <Divider />

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <TeamOutlined className="text-blue-500" />
              <div className="text-left">
                <div className="font-medium">{project.group.name}</div>
                <div className="text-sm text-gray-500">{project.group.description}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <Text strong>群主: </Text>
              <Text>{project.group.owner?.username || '未知'}</Text>
            </div>
          </div>

          {needsJoinRequest && showJoinRequestButton && (
            <div className="space-y-3">
              <Button 
                type="primary" 
                icon={<UserAddOutlined />}
                onClick={() => setJoinModalVisible(true)}
                size="large"
                className="w-full"
              >
                申请加入群组
              </Button>
              
              <div className="text-xs text-gray-500">
                申请加入群组后，群主审批通过即可访问项目内容
              </div>
            </div>
          )}

          {!needsJoinRequest && (
            <Alert
              message="无法访问"
              description="您暂时无法访问此项目，请联系项目管理员或群主获取权限。"
              type="error"
              showIcon
            />
          )}
        </div>
      </Card>

      <JoinRequestModal
        visible={joinModalVisible}
        onCancel={() => setJoinModalVisible(false)}
        group={project.group}
        user={user}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
};

export default PermissionGuard;