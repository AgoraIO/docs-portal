---
title: 开通对话式 AI
description: 为 Agora 项目开通对话式 AI，并准备接入所需的项目凭据。
---

在开始构建 Voice Agent 之前，你需要先在 Agora 项目里开通对话式 AI，并准备后续调用 REST API 所需的项目信息。

## 必要准备

你需要准备：

- Agora 项目
- App ID
- Customer ID 和 Customer Secret
- RTC Token

## 开通步骤

1. 登录 [Agora Console](https://console.agora.io)
2. 打开目标项目
3. 为该项目开通 **Conversational AI**
4. 记录 App ID
5. 在 RESTful API 设置中生成 Customer ID 和 Customer Secret
6. 为测试环境生成临时 RTC Token

## 实践建议

- 生产环境里不要长期依赖控制台生成的临时 Token
- 把敏感凭据保存在后端或密钥管理系统中
- 在正式接入前，先确认项目的鉴权模式与业务部署方式一致

## 相关页面

- [启动和停止智能体](../build/start-stop-agent.mdx)
- [使用预设](../build/presets.mdx)
- [REST API 认证](../../api-reference/conversational-ai/rest-api/authentication.mdx)
