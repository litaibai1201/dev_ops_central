import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, Descriptions, Typography, Tabs, Empty, Tooltip } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, EditOutlined, FileTextOutlined, HistoryOutlined, BugOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Project, ApiMethod } from '../../types';
import { 
  StatusTag,
  HttpMethodTag,
  LoadingState,
  usePageContext
} from '../../components/common';

interface ApiDetailPageProps {
  user: User;
}

const ApiDetailPage: React.FC<ApiDetailPageProps> = ({ user }) => {
  const { projectId, apiId } = useParams<{ projectId: string; apiId: string }>();
  const navigate = useNavigate();
  const { setProjectName, setApiName } = usePageContext();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [api, setApi] = useState<ApiMethod | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // 模拟获取API数据
  useEffect(() => {
    const fetchApiData = async () => {
      setLoading(true);
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟项目数据
        const mockProject: Project = {
          id: projectId || '1',
          name: projectId === '1' ? '用户管理系统API' : '订单系统API',
          description: projectId === '1' 
            ? '提供用户注册、登录、个人信息管理等功能的API接口'
            : '电商平台订单管理相关接口',
          groupId: projectId === '1' ? '1' : '2',
          group: {
            id: projectId === '1' ? '1' : '2',
            name: projectId === '1' ? '前端开发组' : '后端开发组',
            description: '',
            ownerId: '1',
            owner: {} as User,
            members: [],
            projectCount: 0,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          isPublic: true,
          apiCount: 15,
          tags: [],
          version: 'v1.0.0',
          status: 'active',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20'
        };

        // 模拟API数据
        const mockApiData: { [key: string]: ApiMethod } = {
          '1': {
            id: '1',
            name: '用户注册',
            description: '创建新用户账户，需要提供用户名、邮箱和密码',
            method: 'POST',
            url: '/api/auth/register',
            projectId: projectId || '1',
            headers: { 'Content-Type': 'application/json' },
            params: [
              {
                id: '1',
                name: 'username',
                type: 'string',
                required: true,
                description: '用户名，长度在3-20个字符',
                example: 'john_doe'
              },
              {
                id: '2',
                name: 'email',
                type: 'string',
                required: true,
                description: '邮箱地址',
                example: 'john@example.com'
              },
              {
                id: '3',
                name: 'password',
                type: 'string',
                required: true,
                description: '密码，最少8位',
                example: 'password123'
              }
            ],
            body: {
              type: 'json',
              content: JSON.stringify({
                username: 'john_doe',
                email: 'john@example.com',
                password: 'password123'
              }, null, 2)
            },
            responses: [
              {
                id: '1',
                statusCode: 201,
                description: '注册成功',
                headers: { 'Content-Type': 'application/json' },
                body: '',
                example: JSON.stringify({
                  success: true,
                  message: '注册成功',
                  data: {
                    id: '12345',
                    username: 'john_doe',
                    email: 'john@example.com',
                    createdAt: '2024-01-20T10:30:00Z'
                  }
                }, null, 2)
              }
            ],
            tags: ['认证', '用户'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-20'
          },
          '2': {
            id: '2',
            name: '用户登录',
            description: '用户身份验证，成功后返回JWT Token',
            method: 'POST',
            url: '/api/auth/login',
            projectId: projectId || '1',
            headers: { 'Content-Type': 'application/json' },
            params: [
              {
                id: '1',
                name: 'email',
                type: 'string',
                required: true,
                description: '邮箱地址',
                example: 'john@example.com'
              },
              {
                id: '2',
                name: 'password',
                type: 'string',
                required: true,
                description: '密码',
                example: 'password123'
              }
            ],
            body: {
              type: 'json',
              content: JSON.stringify({
                email: 'john@example.com',
                password: 'password123'
              }, null, 2)
            },
            responses: [
              {
                id: '1',
                statusCode: 200,
                description: '登录成功',
                headers: { 'Content-Type': 'application/json' },
                body: '',
                example: JSON.stringify({
                  success: true,
                  message: '登录成功',
                  data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: '12345',
                      username: 'john_doe',
                      email: 'john@example.com'
                    }
                  }
                }, null, 2)
              }
            ],
            tags: ['认证'],
            status: 'published',
            createdBy: '1',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-20'
          }
        };

        const selectedApi = mockApiData[apiId || '1'];
        
        setProject(mockProject);
        setApi(selectedApi);
        // 设置面包屑上下文
        setProjectName(mockProject.name);
        if (selectedApi) {
          setApiName(selectedApi.name);
        }
      } catch (error) {
        console.error('Failed to fetch API data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && apiId) {
      fetchApiData();
    }
  }, [projectId, apiId]);

  if (loading) {
    return <LoadingState loading={true} />;
  }

  if (!project || !api) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>API接口未找到</h2>
        <Button onClick={() => navigate('/dashboard')}>返回仪表板</Button>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'details',
      label: (
        <span>
          <FileTextOutlined />
          接口详情
        </span>
      ),
      children: (
        <div>
          {/* 基本信息 */}
          <Card title="基本信息" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="接口名称">{api.name}</Descriptions.Item>
              <Descriptions.Item label="请求方法">
                <HttpMethodTag method={api.method} />
              </Descriptions.Item>
              <Descriptions.Item label="URL路径">
                <code style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {api.url}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag status={api.status} />
              </Descriptions.Item>
              <Descriptions.Item label="标签" span={2}>
                <div>
                  {api.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {api.description}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 请求参数 */}
          {api.params && api.params.length > 0 && (
            <Card title="请求参数" style={{ marginBottom: 24 }}>
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
                    {api.params.map(param => (
                      <tr key={param.id}>
                        <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                          <code>{param.name}</code>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                          <Tag color="purple">{param.type}</Tag>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                          {param.required ? (
                            <Tag color="red">必填</Tag>
                          ) : (
                            <Tag color="default">可选</Tag>
                          )}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                          <code>{param.example}</code>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #f0f0f0' }}>
                          {param.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* 请求体 */}
          {api.body && (
            <Card title="请求体" style={{ marginBottom: 24 }}>
              <div>
                <Tag color="blue" style={{ marginBottom: 16 }}>{api.body.type}</Tag>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '16px', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  overflow: 'auto'
                }}>
                  {api.body.content}
                </pre>
              </div>
            </Card>
          )}

          {/* 响应示例 */}
          {api.responses && api.responses.length > 0 && (
            <Card title="响应示例">
              {api.responses.map(response => (
                <div key={response.id} style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 12 }}>
                    <Tag color={response.statusCode < 300 ? 'green' : 'red'} style={{ marginRight: 8 }}>
                      {response.statusCode}
                    </Tag>
                    <span>{response.description}</span>
                  </div>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    overflow: 'auto'
                  }}>
                    {response.example}
                  </pre>
                </div>
              ))}
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'test',
      label: (
        <span>
          <BugOutlined />
          在线测试
        </span>
      ),
      children: (
        <Card>
          <Empty 
            description="在线测试功能开发中"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlayCircleOutlined />}>开始测试</Button>
          </Empty>
        </Card>
      ),
    },
    {
      key: 'code',
      label: (
        <span>
          <FileTextOutlined />
          示例代码
        </span>
      ),
      children: (
        <div>
          <Tabs
            type="card"
            items={[
              {
                key: 'python',
                label: 'Python',
                children: (
                  <Card>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      overflow: 'auto'
                    }}>
{`import requests

url = "${api.url}"
headers = {
${Object.entries(api.headers).map(([key, value]) => `    "${key}": "${value}"`).join(',\n')}
}

${api.body ? `data = ${api.body.content}

` : ''}response = requests.${api.method.toLowerCase()}(url, headers=headers${api.body ? ', json=data' : ''})
print(response.json())`}
                    </pre>
                  </Card>
                ),
              },
              {
                key: 'java',
                label: 'Java',
                children: (
                  <Card>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      overflow: 'auto'
                    }}>
{`import java.net.http.*;
import java.net.URI;

public class ApiClient {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("${api.url}"))
            .method("${api.method}", ${api.body ? 'HttpRequest.BodyPublishers.ofString(' + JSON.stringify(api.body.content) + ')' : 'HttpRequest.BodyPublishers.noBody()'});
        
${Object.entries(api.headers).map(([key, value]) => `        requestBuilder.header("${key}", "${value}");`).join('\n')}
        
        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println(response.body());
    }
}`}
                    </pre>
                  </Card>
                ),
              },
              {
                key: 'c',
                label: 'C',
                children: (
                  <Card>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      overflow: 'auto'
                    }}>
{`#include <stdio.h>
#include <curl/curl.h>

struct string {
    char *ptr;
    size_t len;
};

void init_string(struct string *s) {
    s->len = 0;
    s->ptr = malloc(s->len+1);
    s->ptr[0] = '\\0';
}

size_t writefunc(void *ptr, size_t size, size_t nmemb, struct string *s) {
    size_t new_len = s->len + size*nmemb;
    s->ptr = realloc(s->ptr, new_len+1);
    memcpy(s->ptr+s->len, ptr, size*nmemb);
    s->ptr[new_len] = '\\0';
    s->len = new_len;
    return size*nmemb;
}

int main() {
    CURL *curl;
    CURLcode res;
    struct string s;
    
    init_string(&s);
    
    curl = curl_easy_init();
    if(curl) {
        curl_easy_setopt(curl, CURLOPT_URL, "${api.url}");
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writefunc);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &s);
        
        struct curl_slist *headers = NULL;
${Object.entries(api.headers).map(([key, value]) => `        headers = curl_slist_append(headers, "${key}: ${value}");`).join('\n')}
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        
        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
        
        printf("%s\\n", s.ptr);
        free(s.ptr);
    }
    return 0;
}`}
                    </pre>
                  </Card>
                ),
              },
              {
                key: 'csharp',
                label: 'C#',
                children: (
                  <Card>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      overflow: 'auto'
                    }}>
{`using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        using (HttpClient client = new HttpClient())
        {
${Object.entries(api.headers).map(([key, value]) => `            client.DefaultRequestHeaders.Add("${key}", "${value}");`).join('\n')}
            
            ${api.body ? `StringContent content = new StringContent(${JSON.stringify(api.body.content)}, Encoding.UTF8, "application/json");` : ''}
            
            HttpResponseMessage response = await client.${api.method === 'GET' ? 'GetAsync' : api.method === 'POST' ? 'PostAsync' : api.method === 'PUT' ? 'PutAsync' : 'DeleteAsync'}("${api.url}"${api.body ? ', content' : ''});
            string responseBody = await response.Content.ReadAsStringAsync();
            
            Console.WriteLine(responseBody);
        }
    }
}`}
                    </pre>
                  </Card>
                ),
              },
              {
                key: 'php',
                label: 'PHP',
                children: (
                  <Card>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      overflow: 'auto'
                    }}>
{`<?php

$url = "${api.url}";
$headers = [
${Object.entries(api.headers).map(([key, value]) => `    "${key}: ${value}"`).join(',\n')}
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${api.method}");

${api.body ? `$data = ${api.body.content};
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
` : ''}
$response = curl_exec($ch);
curl_close($ch);

echo $response;

?>`}
                    </pre>
                  </Card>
                ),
              },
              {
                key: 'javascript',
                label: 'JavaScript',
                children: (
                  <Card>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      overflow: 'auto'
                    }}>
{`fetch('${api.url}', {
    method: '${api.method}',
    headers: {
${Object.entries(api.headers).map(([key, value]) => `        '${key}': '${value}'`).join(',\n')}
    }${api.body ? `,\n    body: JSON.stringify(${api.body.content})` : ''}
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                    </pre>
                  </Card>
                ),
              },
              {
                key: 'http',
                label: 'HTTP',
                children: (
                  <Card>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      overflow: 'auto'
                    }}>
{`${api.method} ${api.url} HTTP/1.1
${Object.entries(api.headers).map(([key, value]) => `${key}: ${value}`).join('\n')}

${api.body ? api.body.content : ''}`}
                    </pre>
                  </Card>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          变更历史
        </span>
      ),
      children: (
        <Card>
          <Empty 
            description="变更历史功能开发中"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary">查看历史</Button>
          </Empty>
        </Card>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0,
          minWidth: 0,
          flex: '1 1 auto'
        }}>
          {api.name}
        </h1>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/projects/${projectId}`)}
          size="large"
          style={{ flexShrink: 0 }}
        >
          返回
        </Button>
      </div>

      {/* API描述 */}
      {api.description && (
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          marginBottom: 16,
          lineHeight: 1.6
        }}>
          {api.description}
        </p>
      )}

      {/* 标签页和操作按钮 */}
      <div style={{
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 24
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems.map(item => ({
                ...item,
                children: undefined // 移除children，稍后单独渲染
              }))}
              size="large"
              tabBarStyle={{ marginBottom: 0, borderBottom: 'none' }}
            />
          </div>
          <div style={{ flexShrink: 0, alignSelf: 'flex-end', marginBottom: 8 }}>
            <Space size="small">
              <Button type="primary" icon={<EditOutlined />} size="middle">
                编辑接口
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* 标签页内容 */}
      <div>
        {tabItems.find(item => item.key === activeTab)?.children}
      </div>
    </div>
  );
};

export default ApiDetailPage;