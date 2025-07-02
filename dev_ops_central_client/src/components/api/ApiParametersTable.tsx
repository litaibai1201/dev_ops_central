import React from 'react';
import { Tag } from 'antd';
import { ApiParam } from '../../types';

interface ApiParametersTableProps {
  params: ApiParam[];
  title: string;
}

const ApiParametersTable: React.FC<ApiParametersTableProps> = ({ params, title }) => {
  if (!params || params.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: 600, 
        color: '#262626', 
        marginBottom: 16,
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: 8
      }}>
        {title}
      </h3>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>参数名</th>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>类型</th>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>必填</th>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>示例</th>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>描述</th>
            </tr>
          </thead>
          <tbody>
            {params.map(param => (
              <tr key={param.id}>
                <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                  {param.name}
                </td>
                <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                  {param.type}
                </td>
                <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                  {param.required ? (
                    <Tag color="red">必填</Tag>
                  ) : (
                    <Tag color="default">可选</Tag>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                  {param.example}
                </td>
                <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                  {param.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiParametersTable;