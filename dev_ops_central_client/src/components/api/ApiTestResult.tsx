import React, { useState } from 'react';
import { Card, Button, Tag, Tabs, Empty, Space, Row, Col, Progress, Statistic, Typography } from 'antd';
import { CopyOutlined, DownloadOutlined, ShareAltOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface TestResultData {
  status: number;
  statusText: string;
  responseTime: number;
  size: number;
  headers: Record<string, string>;
  body: string;
  timestamp: string;
}

const ApiTestResult: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResultData | null>({
    status: 200,
    statusText: 'OK',
    responseTime: 245,
    size: 1247,
    headers: {
      'content-type': 'application/json',
      'content-length': '1247',
      'date': 'Wed, 20 Jan 2024 10:30:00 GMT',
      'server': 'nginx/1.18.0',
      'x-powered-by': 'Express',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({
      "success": true,
      "message": "用户注册成功",
      "data": {
        "id": "12345",
        "username": "john_doe",
        "email": "john@example.com",
        "createdAt": "2024-01-20T10:30:00Z",
        "profile": {
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "https://example.com/avatar.jpg"
        }
      },
      "meta": {
        "requestId": "req_abc123",
        "version": "1.0.0",
        "timestamp": "2024-01-20T10:30:00Z"
      }
    }, null, 2),
    timestamp: '2024-01-20 10:30:00'
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    if (status >= 400) return 'error';
    return 'default';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!result) {
    return (
      <Card title="响应结果">
        <Empty 
          description="点击发送请求查看响应结果"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card 
      title="响应结果"
      extra={
        <Space>
          <Button size="small" icon={<ReloadOutlined />}>重新发送</Button>
          <Button size="small" icon={<ShareAltOutlined />}>分享</Button>
          <Button size="small" icon={<DownloadOutlined />}>导出</Button>
        </Space>
      }
    >
      {/* 响应概览 */}
      <Card 
        size="small" 
        style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Statistic
              title="状态码"
              value={result.status}
              suffix={result.statusText}
              valueStyle={{ 
                color: getStatusColor(result.status) === 'success' ? '#52c41a' : 
                       getStatusColor(result.status) === 'error' ? '#ff4d4f' : '#faad14',
                fontSize: '18px',
                fontWeight: 600
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="响应时间"
              value={result.responseTime}
              suffix="ms"
              valueStyle={{ fontSize: '18px', fontWeight: 600 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="响应大小"
              value={formatBytes(result.size)}
              valueStyle={{ fontSize: '18px', fontWeight: 600 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="请求时间"
              value={result.timestamp}
              valueStyle={{ fontSize: '14px' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 性能分析 */}
      <Card size="small" style={{ marginBottom: 16 }} title="性能分析">
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">DNS 查询</Text>
                <Text>12ms</Text>
              </div>
              <Progress percent={5} size="small" strokeColor="#1890ff" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">TCP 连接</Text>
                <Text>45ms</Text>
              </div>
              <Progress percent={18} size="small" strokeColor="#52c41a" />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">服务器响应</Text>
                <Text>156ms</Text>
              </div>
              <Progress percent={64} size="small" strokeColor="#faad14" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">内容下载</Text>
                <Text>32ms</Text>
              </div>
              <Progress percent={13} size="small" strokeColor="#722ed1" />
            </div>
          </Col>
        </Row>
      </Card>

      {/* 响应详情 */}
      <Tabs
        items={[
          {
            key: 'body',
            label: '响应体',
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Space>
                    <Tag color="blue">JSON</Tag>
                    <Text type="secondary">{formatBytes(result.size)}</Text>
                  </Space>
                  <Space>
                    <Button size="small" onClick={() => copyToClipboard(result.body)}>
                      <CopyOutlined /> 复制
                    </Button>
                    <Button size="small">格式化</Button>
                    <Button size="small">下载</Button>
                  </Space>
                </div>
                <div 
                  style={{
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e8e8e8',
                    borderRadius: '6px',
                    maxHeight: '500px',
                    overflow: 'auto'
                  }}
                >
                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {result.body}
                  </pre>
                </div>
              </div>
            )
          },
          {
            key: 'headers',
            label: `响应头 (${Object.keys(result.headers).length})`,
            children: (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Button 
                    size="small" 
                    onClick={() => copyToClipboard(Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join('\n'))}
                  >
                    <CopyOutlined /> 复制所有
                  </Button>
                </div>
                <div style={{ 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  {Object.entries(result.headers).map(([key, value], index) => (
                    <div 
                      key={key}
                      style={{
                        display: 'flex',
                        borderBottom: index < Object.entries(result.headers).length - 1 ? '1px solid #f0f0f0' : 'none',
                        backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff'
                      }}
                    >
                      <div style={{
                        padding: '8px 12px',
                        fontWeight: 500,
                        minWidth: '200px',
                        borderRight: '1px solid #f0f0f0',
                        fontFamily: 'monospace',
                        fontSize: '13px'
                      }}>
                        {key}
                      </div>
                      <div style={{
                        padding: '8px 12px',
                        flex: 1,
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        wordBreak: 'break-all'
                      }}>
                        {value}
                      </div>
                      <div style={{
                        padding: '8px 12px',
                        borderLeft: '1px solid #f0f0f0'
                      }}>
                        <Button 
                          type="text" 
                          size="small"
                          onClick={() => copyToClipboard(`${key}: ${value}`)}
                        >
                          <CopyOutlined />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            key: 'test',
            label: '测试断言',
            children: (
              <div>
                <Card size="small" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: '16px', fontWeight: 500 }}>断言测试结果</span>
                    <Tag color="green">3/3 通过</Tag>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
                    <div style={{ marginBottom: 8 }}>✓ 状态码等于 200</div>
                    <div style={{ marginBottom: 8 }}>✓ 响应时间小于 1000ms</div>
                    <div>✓ 响应体包含 success 字段且值为 true</div>
                  </div>
                </Card>

                <Card size="small" title="JSON 路径验证">
                  <div style={{ marginBottom: 12 }}>
                    <Row gutter={8}>
                      <Col span={8}>
                        <Text type="secondary">$.success</Text>
                      </Col>
                      <Col span={8}>
                        <Tag color="green">true</Tag>
                      </Col>
                      <Col span={8}>
                        <Text type="success">✓ 验证通过</Text>
                      </Col>
                    </Row>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Row gutter={8}>
                      <Col span={8}>
                        <Text type="secondary">$.data.id</Text>
                      </Col>
                      <Col span={8}>
                        <Tag>"12345"</Tag>
                      </Col>
                      <Col span={8}>
                        <Text type="success">✓ 存在</Text>
                      </Col>
                    </Row>
                  </div>
                  <div>
                    <Row gutter={8}>
                      <Col span={8}>
                        <Text type="secondary">$.data.email</Text>
                      </Col>
                      <Col span={8}>
                        <Tag>"john@example.com"</Tag>
                      </Col>
                      <Col span={8}>
                        <Text type="success">✓ 格式正确</Text>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </div>
            )
          },
          {
            key: 'raw',
            label: '原始响应',
            children: (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Button 
                    size="small" 
                    onClick={() => copyToClipboard(`HTTP/1.1 ${result.status} ${result.statusText}\n${Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${result.body}`)}
                  >
                    <CopyOutlined /> 复制原始响应
                  </Button>
                </div>
                <pre style={{
                  backgroundColor: '#f5f5f5',
                  padding: '16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  overflow: 'auto',
                  maxHeight: '500px',
                  border: '1px solid #e8e8e8',
                  fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace'
                }}>
{`HTTP/1.1 ${result.status} ${result.statusText}
${Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}

${result.body}`}
                </pre>
              </div>
            )
          }
        ]}
      />
    </Card>
  );
};

export default ApiTestResult;