import React, { useState } from 'react';
import { Button, Space, Typography, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ApiOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export interface ApiPageHeaderProps {
  title?: string;
  subtitle?: string;
  projectName?: string;
  onBack?: () => void;
  onSave?: () => Promise<void> | void;
  backText?: string;
  saveText?: string;
  showSaveButton?: boolean;
  showBackButton?: boolean;
  loading?: boolean;
  extraActions?: React.ReactNode;
  style?: React.CSSProperties;
}

const ApiPageHeader: React.FC<ApiPageHeaderProps> = ({
  title = '新增接口',
  subtitle,
  projectName,
  onBack,
  onSave,
  backText = '返回',
  saveText = '保存接口',
  showSaveButton = true,
  showBackButton = true,
  loading = false,
  extraActions,
  style
}) => {
  const [saveLoading, setSaveLoading] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setSaveLoading(true);
      await onSave();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setSaveLoading(false);
    }
  };

  const finalSubtitle = subtitle || (projectName ? `为 ${projectName} 添加新的API接口` : undefined);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      marginBottom: 24,
      ...style
    }}>
      <div>
        <Title level={2} style={{ margin: 0 }}>
          <ApiOutlined /> {title}
        </Title>
        {finalSubtitle && (
          <Text type="secondary">{finalSubtitle}</Text>
        )}
      </div>
      <Space>
        {extraActions}
        {showBackButton && onBack && (
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
          >
            {backText}
          </Button>
        )}
        {showSaveButton && onSave && (
          <Button 
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading || saveLoading}
            size="large"
          >
            {saveText}
          </Button>
        )}
      </Space>
    </div>
  );
};

export default ApiPageHeader;