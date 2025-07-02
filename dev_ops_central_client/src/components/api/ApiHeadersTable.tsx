import React from 'react';

interface ApiHeadersTableProps {
  headers: Record<string, string>;
}

const ApiHeadersTable: React.FC<ApiHeadersTableProps> = ({ headers }) => {
  if (!headers || Object.keys(headers).length === 0) return null;

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
        请求头
      </h3>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>头部名称</th>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>值</th>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>描述</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(headers).map(([key, value]) => (
              <tr key={key}>
                <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                  {key}
                </td>
                <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                  {value}
                </td>
                <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                  {key === 'Content-Type' ? '请求内容类型' : 
                   key === 'Authorization' ? '身份验证信息' : 
                   '请求头参数'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiHeadersTable;