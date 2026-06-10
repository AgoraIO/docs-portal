---
title: 显示实时转写
description: 在与 voice agent 的对话过程中显示实时字幕和转写结果。
---

在实时语音互动场景里，实时转写不仅是“字幕”，它还会影响用户对会话状态的理解、等待感知和纠错能力。本文介绍如何在应用中接收并展示实时转写。

## 技术思路

声网提供的对话式 AI 客户端组件支持从运行时回调中接收转写结果，常见回调包括：

- `onTranscriptUpdated`
- 相关消息送达状态回调
- 智能体状态变化回调

你可以展示三类内容：

- **智能体转写**：智能体当前正在说什么，以及最终输出结果
- **用户转写**：用户语音识别结果
- **转写状态**：例如进行中、完成、被打断

## 接入前提

- 已完成 [Voice agent 快速开始](../get-started/quickstart.mdx)
- 已集成 RTC SDK 并完成基础音视频链路
- 已开通 Signaling/RTM，并完成基础消息链路

## 显示建议

- 将用户转写与智能体转写分开展示，避免混淆说话方
- 对“流式更新中”的内容做弱样式处理，最终结果再固化
- 如果智能体被打断，要让 UI 能清楚反映“当前句子已中断”

## 与其他能力的关系

- 和[打断智能体](interrupt-agent.mdx)配合时，转写状态要能体现中断
- 和[多模态消息](send-multimodal-messages.md)配合时，建议把图片消息与转写归到同一会话流
- 和[延迟优化](../best-practices/optimize-latency.mdx)配合时，转写是感知性能的重要一层

## 相关页面

- [监听运行时事件](get-runtime-events.mdx)
- [发送图片给智能体](send-multimodal-messages.md)
- [优化端到端对话延迟](../best-practices/optimize-latency.mdx)
