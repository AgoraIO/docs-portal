---
title: 安全与合规
description: 围绕身份认证、回调安全、地理策略和生产接入边界整理安全与合规能力。
---

## 关键控制项

### HTTP 基础认证

在把服务端链路扩展到生产系统前，先补齐基础认证能力。

- [打开 HTTP 基础认证文档](/zh-CN/api-reference/conversational-ai/rest-api/authentication)

### 区域访问控制

通过区域访问控制收窄服务覆盖范围，降低特定地区的合规风险。

- [打开地理围栏文档](/zh-CN/ai/best-practices/regional-restrictions)

### 回调安全

启用回调前，先验证事件订阅、来源可信度和下游数据处理边界。

- [打开回调启用文档](/zh-CN/api-reference/enable-ncs)

## 平台层意图

安全与合规内容应该在平台层就被看到，而不是等用户接完主链路之后才发现。
