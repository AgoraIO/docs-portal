---
title: Production checklist
description: 从鉴权、状态观测、错误处理到支持路径，整理 AI 智能体上线前应该逐项确认的内容。
---

## 上线前至少确认这些事

- 鉴权与 Token 生成方式稳定
- 生命周期控制都在后端统一处理
- 状态、转写、错误和轮次都有可观察入口
- Webhook 与日志链路可用于排障
- 响应码和重试策略已经定义

## 推荐页面

- [Authentication and tokens](/docs/convoai/restful/user-guides/http-basic-auth)
- [Monitor status](/docs/convoai/restful/operations/query-agent-status)
- [Webhook events](/docs/convoai/restful/webhook/ncs-events)
- [Status codes](/docs/convoai/restful/api/response-code)
