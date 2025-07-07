import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Tag,
  Space,
  message,
  Typography,
  Divider,
  Card,
  Row,
  Col,
  Upload,
  Tooltip
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  CloseOutlined,
  GlobalOutlined,
  LockOutlined,
  TagsOutlined,
  FileTextOutlined,
  UploadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Project } from '../../types';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ProjectEditModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
  onSave: (updatedProject: Partial<Project>) => void;
  loading?: boolean;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  open,
  onClose,
  onSave,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [inputTags, setInputTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (open && project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        version: project.version,
        isPublic: project.isPublic,
        status: project.status,
      });
      setInputTags(project.tags || []);
    }
  }, [open, project, form]);

  const handleAddTag = () => {
    if (inputValue && !inputTags.includes(inputValue)) {
      setInputTags([...inputTags, inputValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setInputTags(inputTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const updatedProject = {
        ...values,
        tags: inputTags,
        updatedAt: new Date().toISOString()
      };
      onSave(updatedProject);
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
      message.error('请检查表单内容');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setInputTags(project.tags || []);
    setInputValue('');
    onClose();
  };

  const statusOptions = [
    { value: 'active', label: '活跃', color: '#52c41a' },
    { value: 'inactive', label: '非活跃', color: '#faad14' },
    { value: 'archived', label: '已归档', color: '#d9d9d9' },
    { value: 'deprecated', label: '已废弃', color: '#ff4d4f' }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EditOutlined />
          <span>编辑专案</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} size="large">
          取消
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          size="large"
        >
          保存更改
        </Button>
      ]}
      width={800}
      destroyOnClose
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Card title="基本信息" size="small" style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="专案名称"
                name="name"
                rules={[
                  { required: true, message: '请输入专案名称' },
                  { min: 2, message: '专案名称至少2个字符' },
                  { max: 50, message: '专案名称最多50个字符' }
                ]}
              >
                <Input
                  placeholder="请输入专案名称"
                  size="large"
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="版本号"
                name="version"
                rules={[
                  { required: true, message: '请输入版本号' },
                  { pattern: /^v?\d+\.\d+\.\d+$/, message: '版本号格式：v1.0.0 或 1.0.0' }
                ]}
              >
                <Input
                  placeholder="如：v1.0.0"
                  size="large"
                  addonBefore="版本"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="专案描述"
            name="description"
            rules={[
              { required: true, message: '请输入专案描述' },
              { min: 10, message: '专案描述至少10个字符' },
              { max: 200, message: '专案描述最多200个字符' }
            ]}
          >
            <TextArea
              placeholder="请详细描述专案的功能和用途..."
              rows={4}
              size="large"
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Card>

        <Card title="标签管理" size="small" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              <InfoCircleOutlined /> 标签有助于更好地分类和搜索专案
            </Text>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              {inputTags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                  color="blue"
                  style={{ marginBottom: 8 }}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>

          <Space.Compact style={{ display: 'flex' }}>
            <Input
              placeholder="添加新标签"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleAddTag}
              size="large"
              prefix={<TagsOutlined />}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              onClick={handleAddTag}
              disabled={!inputValue || inputTags.includes(inputValue)}
              size="large"
            >
              <PlusOutlined />
              添加
            </Button>
          </Space.Compact>
        </Card>

        <Card title="专案设置" size="small">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="专案状态"
                name="status"
                tooltip="设置专案的当前状态"
              >
                <Select
                  placeholder="选择专案状态"
                  size="large"
                  options={statusOptions.map(option => ({
                    ...option,
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: option.color
                          }}
                        />
                        {option.label}
                      </div>
                    )
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="可见性设置"
                name="isPublic"
                valuePropName="checked"
                tooltip="公开专案可被所有用户查看，私有专案仅群组成员可见"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Switch
                    size="default"
                    checkedChildren={<GlobalOutlined />}
                    unCheckedChildren={<LockOutlined />}
                  />
                  <Text style={{ fontSize: 14 }}>
                    公开专案
                  </Text>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: 16, 
            borderRadius: 8,
            border: '1px solid #e9ecef'
          }}>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              <InfoCircleOutlined /> 编辑提示
            </Title>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>修改专案名称后，相关的API路径和文档链接不会自动更新</li>
              <li>更改可见性设置会影响专案的访问权限</li>
              <li>标签修改会影响专案的搜索和分类</li>
            </ul>
          </div>
        </Card>
      </Form>
    </Modal>
  );
};

export default ProjectEditModal;