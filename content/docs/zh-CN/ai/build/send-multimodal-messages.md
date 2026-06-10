---
title: 发送图片给智能体
description: 从客户端发送图片消息，帮助智能体更好地理解用户意图。
---

如果你的智能体接入了支持图像输入的模型，你可以从客户端发送图片消息，让智能体在后续对话中结合图片内容理解用户意图。

## 适合的场景

- 用户拍照提问
- 设备侧上传当前画面做辅助理解
- 结合文字和图片完成多模态问答

## 前提条件

- 已完成 [Voice agent 快速开始](../get-started/quickstart.mdx)
- 已集成 RTC SDK
- 已开通 Signaling/RTM，并具备基础消息收发能力
- 接入的 LLM 或 MLLM 支持图片输入

## 基本接入方式

1. 集成客户端组件
2. 订阅用于消息传输的频道
3. 启动智能体时打开 RTM 和数据通道
4. 调用组件的 `chat` 或等效接口发送图片消息
5. 通过消息回执回调确认结果

示意代码如下：

```typescript
const uuid = 'unique-image-id-123'
const imageUrl = 'https://example.com/image.jpg'

api.chat('agentUserId', {
  uuid,
  imageUrl,
  type: 'image'
})
```

## 注意事项

- 发送成功的回调通常只代表“发送请求已受理”，不代表模型已经完成理解
- 图片理解能力取决于底层模型
- 如果你的业务会话需要审计或归档，建议同时保存图片消息的元数据

## 相关页面

- [显示实时转写](transcripts.md)
- [MLLM 模型](../models/mllm/index.md)
- [调试智能体故障](debug-agent-failures.mdx)
