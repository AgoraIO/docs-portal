---
title: Demo Server API
description: Convo AI Device Kit 开发流程使用的服务端 API 参考。
---

Demo Server 提供 3 个用于设备流程的 RESTful API。示例工程默认没有做鉴权，你可以按实际需要补上。

**Base URL**：`https://your-domain.com/`

**认证**：无

## 获取设备 RTC Token

- **方法**：POST
- **路径**：`/device`
- **请求体**：

```json
{
  "channel_name": "DEVICE_ID",
  "uid": "DEVICE_USER_ID"
}
```

## 启动对话式智能体

- **方法**：POST
- **路径**：`/agent/start`
- **请求体**：

```json
{
  "channel_name": "DEVICE_ID",
  "uid": "DEVICE_USER_ID",
  "agent_uid": "AGENT_USER_ID"
}
```

## 停止对话式智能体

- **方法**：POST
- **路径**：`/agent/stop`
- **请求体**：

```json
{
  "agent_id": "AGENT_ID"
}
```
