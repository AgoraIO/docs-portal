---
title: RESTful 鉴权
description: 配置对话式 AI REST API 请求所需的 RESTful 鉴权。
---

对话式 AI REST API 请求需要 RESTful 鉴权。你可以使用 RTC Token 鉴权或 HTTP 基本认证。

:::info
为降低数据泄露风险，请在服务端实现鉴权逻辑。
:::

## RTC Token 鉴权

RTC Token 鉴权使用你的 App ID 和 App Certificate 在服务端生成 Token。使用 Token 鉴权时，在每个请求中添加 `Authorization` 请求头：

```text
Authorization: agora token=<your_token>
```

### 前提条件

开始前，请在[声网控制台](https://console.shengwang.cn/)获取以下信息：

- **App ID**：项目的唯一标识。
- **App Certificate**：用于生成 Token 的证书。

:::warning
不要在客户端代码或公开仓库中暴露 App Certificate。请只在服务端生成 Token。
:::

Token 的最长有效期为 86400 秒。

### 请求示例

```bash
curl --request POST \
  --url https://api.agora.io/cn/api/conversational-ai-agent/v2/projects/:appid/join \
  --header 'Authorization: agora token=<your_token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "<agent_name>",
    "properties": {
      "channel": "<channel_name>",
      "token": "<rtc_token>",
      "agent_rtc_uid": "0",
      "remote_rtc_uids": ["123"]
    }
  }'
```

## HTTP 基本认证

HTTP 基本认证使用声网提供的客户 ID 和客户密钥。将 `customer_id:customer_secret` 字符串进行 Base64 编码后，添加到 `Authorization` 请求头：

```text
Authorization: Basic <base64_credentials>
```

你可以在声网控制台的 **开发者工具** > **RESTful API** 中生成客户 ID 和客户密钥。

## 相关页面

- [对话式 AI 概览](index)
- [创建对话式智能体](join)
- [停止对话式智能体](leave)
