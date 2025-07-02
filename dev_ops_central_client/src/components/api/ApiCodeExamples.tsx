import React from 'react';
import { Button, Tabs, Card, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { ApiMethod } from '../../types';

interface ApiCodeExamplesProps {
  api: ApiMethod;
}

const ApiCodeExamples: React.FC<ApiCodeExamplesProps> = ({ api }) => {
  return (
    <div>
      <Tabs
        type="card"
        items={[
          {
            key: 'python',
            label: 'Python',
            children: (
              <div style={{ position: 'relative' }}>
                <Button 
                  size="small" 
                  icon={<CopyOutlined />}
                  onClick={() => {
                    const pythonCode = `import requests

url = "${api.url}"
headers = {
${Object.entries(api.headers).map(([key, value]) => `    "${key}": "${value}"`).join(',\n')}
}

${api.body ? `data = ${api.body.content}

` : ''}response = requests.${api.method.toLowerCase()}(url, headers=headers${api.body ? ', json=data' : ''})
print(response.json())`;
                    navigator.clipboard.writeText(pythonCode);
                    message.success('复制成功');
                  }}
                  title="复制Python代码"
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                >
                  复制
                </Button>
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
              </div>
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
  );
};

export default ApiCodeExamples;