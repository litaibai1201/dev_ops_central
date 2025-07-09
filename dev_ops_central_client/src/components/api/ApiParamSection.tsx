import React from 'react';
import { Card, Button, Badge, Tooltip, Alert } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ParamTable, { 
  BaseParam, 
  RequestParam, 
  ResponseParam, 
  ParamType, 
  ParamLocation,
  DEFAULT_PARAM_TYPES,
  DEFAULT_PARAM_LOCATIONS
} from './ParamTable';

export interface ApiParamSectionProps<T extends BaseParam> {
  title: string;
  params: T[];
  onParamChange: (key: string, field: keyof T, value: any) => void;
  onAddParam: (parentKey?: string) => void;
  onRemoveParam: (key: string) => void;
  type: 'request' | 'response';
  supportedLocations?: ParamLocation[];
  paramTypes?: ParamType[];
  showLocationColumn?: boolean;
  alertMessage?: string;
  alertDescription?: React.ReactNode;
  emptyText?: string;
  badgeColor?: string;
  tooltip?: string;
  addButtonText?: string;
  style?: React.CSSProperties;
}

function ApiParamSection<T extends BaseParam>({
  title,
  params,
  onParamChange,
  onAddParam,
  onRemoveParam,
  type,
  supportedLocations = DEFAULT_PARAM_LOCATIONS,
  paramTypes = DEFAULT_PARAM_TYPES,
  showLocationColumn = true,
  alertMessage,
  alertDescription,
  emptyText,
  badgeColor = '#1890ff',
  tooltip,
  addButtonText = '添加参数',
  style
}: ApiParamSectionProps<T>) {
  const defaultEmptyText = type === 'request' ? '暂无请求参数，点击右上角按钮添加' : '暂无响应字段，点击右上角按钮添加';

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{title}</span>
          <Badge count={params.length} showZero color={badgeColor} />
          {tooltip && (
            <Tooltip title={tooltip}>
              <QuestionCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          )}
        </div>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => onAddParam()}
        >
          {addButtonText}
        </Button>
      }
      style={style}
    >
      {(alertMessage || alertDescription) && (
        <Alert
          message={alertMessage}
          description={alertDescription}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <ParamTable
        params={params}
        onParamChange={onParamChange}
        onAddParam={onAddParam}
        onRemoveParam={onRemoveParam}
        paramTypes={paramTypes}
        supportedLocations={supportedLocations}
        type={type}
        emptyText={emptyText || defaultEmptyText}
        showLocationColumn={showLocationColumn}
      />
    </Card>
  );
}

export default ApiParamSection;