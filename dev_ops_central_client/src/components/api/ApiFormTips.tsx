import React from 'react';
import { Alert } from 'antd';

export interface ApiFormTipsProps {
  tips?: string[];
  type?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  showIcon?: boolean;
  style?: React.CSSProperties;
}

const defaultTips = [
  '请根据选择的请求方式合理配置参数类型和位置',
  '响应参数有助于前端开发者快速理解接口返回结构',
  '接口创建后可以在详情页面进行在线测试',
  '建议先保存为草稿，完善后再发布'
];

const ApiFormTips: React.FC<ApiFormTipsProps> = ({
  tips = defaultTips,
  type = 'success',
  title = '温馨提示',
  showIcon = true,
  style
}) => {
  return (
    <Alert
      message={title}
      description={
        <div>
          {tips.map((tip, index) => (
            <p key={index} style={{ marginBottom: index === tips.length - 1 ? 0 : undefined }}>
              • {tip}
            </p>
          ))}
        </div>
      }
      type={type}
      showIcon={showIcon}
      style={style}
    />
  );
};

export default ApiFormTips;