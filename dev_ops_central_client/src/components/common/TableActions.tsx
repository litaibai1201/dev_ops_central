import React from 'react';
import { Button, Space, Tooltip, Popconfirm } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined,
  SettingOutlined,
  MoreOutlined
} from '@ant-design/icons';

interface ActionButton {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  type?: 'text' | 'link' | 'primary' | 'ghost' | 'dashed' | 'default';
  danger?: boolean;
  disabled?: boolean;
  tooltip?: string;
  confirm?: {
    title: string;
    description?: string;
    okText?: string;
    cancelText?: string;
  };
}

interface TableActionsProps {
  actions: ActionButton[];
  size?: 'small' | 'middle' | 'large';
  maxVisible?: number;
}

const TableActions: React.FC<TableActionsProps> = ({ 
  actions, 
  size = 'small',
  maxVisible = 3
}) => {
  const visibleActions = actions.slice(0, maxVisible);
  const hiddenActions = actions.slice(maxVisible);

  const renderButton = (action: ActionButton) => {
    const button = (
      <Button
        type={action.type || 'text'}
        size={size}
        icon={action.icon}
        onClick={action.onClick}
        danger={action.danger}
        disabled={action.disabled}
      >
        {action.label}
      </Button>
    );

    let wrappedButton = button;

    // 添加确认对话框
    if (action.confirm) {
      wrappedButton = (
        <Popconfirm
          title={action.confirm.title}
          description={action.confirm.description}
          okText={action.confirm.okText || '确定'}
          cancelText={action.confirm.cancelText || '取消'}
          onConfirm={action.onClick}
        >
          {button}
        </Popconfirm>
      );
    }

    // 添加工具提示
    if (action.tooltip) {
      wrappedButton = (
        <Tooltip title={action.tooltip}>
          {wrappedButton}
        </Tooltip>
      );
    }

    return wrappedButton;
  };

  return (
    <Space>
      {visibleActions.map(action => (
        <React.Fragment key={action.key}>
          {renderButton(action)}
        </React.Fragment>
      ))}
      {hiddenActions.length > 0 && (
        <Button 
          type="text" 
          size={size}
          icon={<MoreOutlined />}
          // 这里可以添加下拉菜单来显示更多操作
        />
      )}
    </Space>
  );
};

// 预设的常用操作按钮配置
export const createViewAction = (onClick: () => void): ActionButton => ({
  key: 'view',
  label: '查看',
  icon: <EyeOutlined />,
  onClick,
  tooltip: '查看详情'
});

export const createEditAction = (onClick: () => void): ActionButton => ({
  key: 'edit',
  label: '编辑',
  icon: <EditOutlined />,
  onClick,
  tooltip: '编辑'
});

export const createDeleteAction = (onClick: () => void, itemName?: string): ActionButton => ({
  key: 'delete',
  label: '删除',
  icon: <DeleteOutlined />,
  onClick,
  danger: true,
  tooltip: '删除',
  confirm: {
    title: '确认删除',
    description: itemName ? `确定要删除 "${itemName}" 吗？此操作不可恢复。` : '确定要删除吗？此操作不可恢复。',
    okText: '删除',
    cancelText: '取消'
  }
});

export const createTestAction = (onClick: () => void): ActionButton => ({
  key: 'test',
  label: '测试',
  icon: <PlayCircleOutlined />,
  onClick,
  tooltip: '测试接口'
});

export const createSettingsAction = (onClick: () => void): ActionButton => ({
  key: 'settings',
  label: '设置',
  icon: <SettingOutlined />,
  onClick,
  tooltip: '设置'
});

export default TableActions;
