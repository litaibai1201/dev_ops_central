import React from 'react';

const ApiResponseParameters: React.FC = () => {
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
        响应参数
      </h3>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>字段名</th>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>类型</th>
              <th style={{ padding: '12px', border: '1px solid #f0f0f0', textAlign: 'left' }}>描述</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                success
              </td>
              <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                boolean
              </td>
              <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>请求是否成功</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                message
              </td>
              <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                string
              </td>
              <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>响应消息</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                data
              </td>
              <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                object
              </td>
              <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>返回数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiResponseParameters;