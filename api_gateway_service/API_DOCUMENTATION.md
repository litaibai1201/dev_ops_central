# API Gateway Service - 接口说明文档

## 📋 概述

API Gateway Service 是基于 Flask 构建的认证服务，提供用户注册、登录、令牌管理等功能。

- **服务地址**: `http://localhost:25698`
- **API文档**: `http://localhost:25698/swagger-ui`
- **健康检查**: `http://localhost:25698/auth/health`

## 🔐 认证接口

### 1. 用户注册

**接口**: `POST /auth/register`

**描述**: 创建新用户账户

**请求参数**:
```json
{
  "username": "testuser",           // 用户名 (必填, 3-50位, 只能包含字母数字下划线)
  "email": "test@example.com",      // 邮箱 (必填, 有效邮箱格式)
  "password": "Password123",        // 密码 (必填, 6-128位, 必须包含字母和数字)
  "full_name": "测试用户",           // 全名 (可选, 最长100位)
  "phone": "+86 138 0013 8000"      // 手机号 (可选, 最长20位)
}
```

**成功响应**:
```json
{
  "code": "S10000",
  "msg": "註冊成功",
  "content": {
    "user_id": 12345,
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "测试用户",
    "created_at": "2025-01-09 10:30:00"
  }
}
```

**错误响应**:
```json
{
  "code": "F42201",
  "msg": "用戶已存在",
  "content": {}
}
```

---

### 2. 用户登录

**接口**: `POST /auth/login`

**描述**: 用户登录获取访问令牌

**请求参数**:
```json
{
  "credential": "testuser",         // 登录凭证 (必填, 支持用户名或邮箱)
  "password": "Password123",        // 密码 (必填)
  "remember_me": false              // 记住我 (可选, 默认false)
}
```

**成功响应**:
```json
{
  "code": "S10000",
  "msg": "登錄成功",
  "content": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "user_info": {
      "user_id": 12345,
      "username": "testuser",
      "email": "test@example.com",
      "full_name": "测试用户",
      "role": "user",
      "avatar_url": null
    }
  }
}
```

**错误响应**:
```json
{
  "code": "F40101",
  "msg": "用戶名或密碼錯誤",
  "content": {}
}
```

---

### 3. 刷新令牌

**接口**: `POST /auth/refresh`

**描述**: 使用刷新令牌获取新的访问令牌

**请求参数**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."  // 刷新令牌 (必填)
}
```

**成功响应**:
```json
{
  "code": "S10000",
  "msg": "令牌刷新成功",
  "content": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "user_info": {
      "user_id": 12345,
      "username": "testuser",
      "email": "test@example.com",
      "full_name": "测试用户",
      "role": "user"
    }
  }
}
```

---

### 4. 获取用户信息

**接口**: `GET /auth/profile`

**描述**: 获取当前登录用户的详细信息

**请求头**:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**成功响应**:
```json
{
  "code": "S10000",
  "msg": "獲取用戶信息成功",
  "content": {
    "user_info": {
      "user_id": 12345,
      "username": "testuser",
      "email": "test@example.com",
      "full_name": "测试用户",
      "phone": "+86 138 0013 8000",
      "avatar_url": null,
      "role": "user",
      "is_email_verified": false,
      "last_login_at": "2025-01-09 10:30:00",
      "created_at": "2025-01-08 15:20:00"
    },
    "security_info": {
      "active_sessions": 2,
      "last_login_ip": "192.168.1.100"
    }
  }
}
```

---

### 5. 用户登出

**接口**: `POST /auth/logout`

**描述**: 用户登出，撤销刷新令牌

**请求头**:
```
Authorization: Bearer refresh_token_here
```

**请求参数** (可选，也可通过请求体传递):
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**成功响应**:
```json
{
  "code": "S10000",
  "msg": "登出成功",
  "content": "登出成功"
}
```

---

### 6. 获取用户会话列表

**接口**: `GET /auth/sessions`

**描述**: 获取当前用户的所有活跃会话

**请求头**:
```
Authorization: Bearer access_token_here
```

**成功响应**:
```json
{
  "code": "S10000",
  "msg": "獲取會話列表成功",
  "content": {
    "user_id": 12345,
    "total_sessions": 3,
    "active_sessions": 2,
    "sessions": [
      {
        "token_id": 101,
        "device_info": "桌面設備",
        "ip_address": "192.168.1.100",
        "created_at": "2025-01-09 10:30:00",
        "expires_at": "2025-02-08 10:30:00",
        "is_current": true,
        "status": "活躍"
      },
      {
        "token_id": 102,
        "device_info": "移動設備",
        "ip_address": "192.168.1.101", 
        "created_at": "2025-01-08 15:20:00",
        "expires_at": "2025-02-07 15:20:00",
        "is_current": false,
        "status": "活躍"
      }
    ]
  }
}
```

---

### 7. 撤销指定会话

**接口**: `DELETE /auth/sessions`

**描述**: 撤销指定的用户会话

**请求头**:
```
Authorization: Bearer access_token_here
```

**请求参数**:
```json
{
  "token_id": 102                   // 令牌ID (必填)
}
```

**成功响应**:
```json
{
  "code": "S10000",
  "msg": "會話撤銷成功",
  "content": "會話已成功撤銷"
}
```

---

### 8. 健康检查

**接口**: `GET /auth/health`

**描述**: 检查服务健康状态

**成功响应**:
```json
{
  "code": "S10000",
  "msg": "服務正常",
  "content": {
    "status": "healthy",
    "service": "auth-api",
    "timestamp": "2025-01-09 10:30:00",
    "version": "1.0.0"
  }
}
```

## 🔧 错误码说明

| 错误码 | 说明 | 常见场景 |
|--------|------|----------|
| `S10000` | 操作成功 | 所有成功请求 |
| `F40001` | 未授权访问 | 缺少或无效的访问令牌 |
| `F40003` | 禁止访问 | 权限不足 |
| `F40101` | 用户名或密码错误 | 登录凭证错误 |
| `F40102` | 账户被锁定 | 多次登录失败 |
| `F40103` | 令牌已过期 | 访问令牌或刷新令牌过期 |
| `F40104` | 令牌无效 | 令牌格式错误或已被撤销 |
| `F42201` | 用户已存在 | 注册时用户名或邮箱重复 |
| `F42202` | 用户不存在 | 用户信息查询失败 |
| `F42203` | 密码强度不够 | 密码不符合安全要求 |
| `F50000` | 系统内部错误 | 服务器内部异常 |

## 🛡️ 安全特性

### 密码强度要求
- 最少6位字符
- 必须包含字母和数字
- 推荐包含大小写字母、数字和特殊字符

### 账户锁定保护
- 连续5次登录失败将锁定账户24小时
- 锁定期间无法登录

### 令牌管理
- 访问令牌有效期: 2小时
- 刷新令牌有效期: 30天
- 支持多设备同时登录
- 可撤销指定会话

## 📝 使用示例

### cURL 示例

**用户注册**:
```bash
curl -X POST http://localhost:25698/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123",
    "full_name": "测试用户"
  }'
```

**用户登录**:
```bash
curl -X POST http://localhost:25698/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "testuser",
    "password": "Password123"
  }'
```

**获取用户信息**:
```bash
curl -X GET http://localhost:25698/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**刷新令牌**:
```bash
curl -X POST http://localhost:25698/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### JavaScript 示例

```javascript
// 用户登录
const loginResponse = await fetch('http://localhost:25698/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    credential: 'testuser',
    password: 'Password123'
  })
});

const loginData = await loginResponse.json();
const accessToken = loginData.content.access_token;

// 获取用户信息
const profileResponse = await fetch('http://localhost:25698/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const profileData = await profileResponse.json();
console.log('用户信息:', profileData.content.user_info);
```

## 🔗 相关链接

- **Swagger UI**: http://localhost:25698/swagger-ui
- **项目代码**: `/api_gateway_service/`
- **日志文件**: `/api_gateway_service/logs/`

---

*最后更新: 2025-01-09*  
*版本: v1.0.0*