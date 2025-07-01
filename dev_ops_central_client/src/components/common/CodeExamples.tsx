import React from 'react';
import { Tabs, message } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import CodeBlock from './CodeBlock';

interface CodeExamplesProps {
  api: {
    method: string;
    url: string;
    params?: any[];
    body?: {
      content: string;
    };
  };
  onCopy?: (code: string) => void;
}

const CodeExamples: React.FC<CodeExamplesProps> = ({ api, onCopy }) => {
  const handleCopy = (code: string) => {
    message.success('已复制到剪贴板');
    if (onCopy) {
      onCopy(code);
    }
  };

  const getCodeExample = (language: string) => {
    const examples = {
      javascript: `// JavaScript (Fetch API)
const response = await fetch('${api.url}', {
  method: '${api.method}',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: '123456',
    remember: true
  })
});

const data = await response.json();
console.log(data);`,

      python: `# Python (requests)
import requests

url = "${api.url}"
headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}
data = {
    'username': 'admin',
    'password': '123456',
    'remember': True
}

response = requests.${api.method.toLowerCase()}(url, headers=headers, json=data)
print(response.json())`,

      java: `// Java (OkHttp)
import okhttp3.*;
import com.google.gson.Gson;

OkHttpClient client = new OkHttpClient();

String json = new Gson().toJson(Map.of(
    "username", "admin",
    "password", "123456",
    "remember", true
));

RequestBody body = RequestBody.create(
    json, MediaType.get("application/json; charset=utf-8"));

Request request = new Request.Builder()
    .url("${api.url}")
    .${api.method.toLowerCase()}(body)
    .addHeader("Content-Type", "application/json")
    .build();

Response response = client.newCall(request).execute();
System.out.println(response.body().string());`,

      csharp: `// C# (HttpClient)
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

var client = new HttpClient();
var data = new {
    username = "admin",
    password = "123456",
    remember = true
};

var json = JsonConvert.SerializeObject(data);
var content = new StringContent(json, Encoding.UTF8, "application/json");

var response = await client.${api.method === 'GET' ? 'GetAsync' : 'PostAsync'}("${api.url}"${api.method !== 'GET' ? ', content' : ''});
var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`,

      php: `<?php
// PHP (cURL)
$curl = curl_init();

$data = array(
    'username' => 'admin',
    'password' => '123456',
    'remember' => true
);

curl_setopt_array($curl, array(
    CURLOPT_URL => '${api.url}',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => '${api.method}',
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json',
        'Accept: application/json'
    ),
));

$response = curl_exec($curl);
curl_close($curl);

echo $response;
?>`,

      c: `// C (libcurl)
#include <stdio.h>
#include <curl/curl.h>

int main() {
    CURL *curl;
    CURLcode res;
    
    curl = curl_easy_init();
    if(curl) {
        curl_easy_setopt(curl, CURLOPT_URL, "${api.url}");
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, 
            "{\\"username\\":\\"admin\\",\\"password\\":\\"123456\\",\\"remember\\":true}");
        
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, "Accept: application/json");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        
        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);
    }
    return 0;
}`,

      http: `### HTTP Raw Request
${api.method} ${api.url} HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json

{
  "username": "admin",
  "password": "123456",
  "remember": true
}`
    };

    return examples[language as keyof typeof examples] || '';
  };

  const languageIcons = {
    javascript: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0Y3REYxRSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6bTIyLjAzNCAyMi45N2MtLjY4IDAtMS4yMDctLjI3LTEuNzEtLjY4LS41NjItLjQ2OC0uODQzLTEuMTUtLjg0My0yLjAzN1Y5Ljc5M2MwLS44ODcuMjgtMS41NjkuODQzLTIuMDM3LjUwMy0uNDEgMS4wMy0uNjggMS43MS0uNjhzMS4yMDcuMjcgMS43MS42OGMuNTYyLjQ2OC44NDMgMS4xNS44NDMgMi4wMzd2MTAuNDZjMCAuODg3LS4yOCAxLjU2OS0uODQzIDIuMDM3LS41MDMuNDEtMS4wMy42OC0xLjcxLjY4eiIvPgo8L3N2Zz4=",
    python: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzM3NzZBQiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6Ii8+Cjwvc3ZnPg==",
    // 其他语言图标...
  };

  const tabItems = [
    { 
      key: 'javascript', 
      label: (
        <span>
          <img src={languageIcons.javascript} alt="JS" style={{ width: 16, height: 16, marginRight: 4 }} />
          JavaScript
        </span>
      ), 
      children: (
        <CodeBlock
          code={getCodeExample('javascript')}
          language="javascript"
          theme="dark"
          onCopy={handleCopy}
        />
      )
    },
    { 
      key: 'python', 
      label: (
        <span>
          <img src={languageIcons.python} alt="Python" style={{ width: 16, height: 16, marginRight: 4 }} />
          Python
        </span>
      ), 
      children: (
        <CodeBlock
          code={getCodeExample('python')}
          language="python"
          theme="dark"
          onCopy={handleCopy}
        />
      )
    },
    { 
      key: 'java', 
      label: 'Java', 
      children: (
        <CodeBlock
          code={getCodeExample('java')}
          language="java"
          theme="github"
          onCopy={handleCopy}
        />
      )
    },
    { 
      key: 'csharp', 
      label: 'C#', 
      children: (
        <CodeBlock
          code={getCodeExample('csharp')}
          language="csharp"
          theme="light"
          onCopy={handleCopy}
        />
      )
    },
    { 
      key: 'php', 
      label: 'PHP', 
      children: (
        <CodeBlock
          code={getCodeExample('php')}
          language="php"
          theme="light"
          onCopy={handleCopy}
        />
      )
    },
    { 
      key: 'c', 
      label: 'C', 
      children: (
        <CodeBlock
          code={getCodeExample('c')}
          language="c"
          theme="light"
          onCopy={handleCopy}
        />
      )
    },
    { 
      key: 'http', 
      label: (
        <span>
          <GlobalOutlined style={{ marginRight: 4 }} />
          HTTP
        </span>
      ), 
      children: (
        <CodeBlock
          code={getCodeExample('http')}
          language="http"
          theme="light"
          onCopy={handleCopy}
        />
      )
    }
  ];

  return (
    <Tabs
      type="card"
      size="small"
      items={tabItems}
    />
  );
};

export default CodeExamples;
