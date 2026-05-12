---
title: Choose your integration path
description: 在 Agent Studio、REST API、服务端 SDK、客户端接入和 Device AI 之间选出最适合当前阶段的路径。
---

## 先看你当前卡在哪一层

### 只想先验证体验

先看 [Start with Agent Studio](/?tab=ai&page=ai-start-with-agent-studio)。

### 想尽快跑通一条可执行链路

先看 [Voice AI quickstart](/docs/convoai/restful/get-started/quick-start)。

### 后端要控制生命周期和配置

优先走 REST API 或服务端 SDK：

- [Create and start an agent](/docs/convoai/restful/operations/start-agent)
- [Go SDK](/docs/convoai/restful/get-started/quick-start-go)
- [Java SDK](/docs/convoai/restful/get-started/quick-start-java)

### 客户端要承接语音与事件体验

优先补客户端接入、实时音频、字幕与业务状态同步能力：

- [Realtime audio](/docs/convoai/restful/user-guides/audio-modality)
- [Transcripts and subtitles](/docs/convoai/restful/user-guides/realtime-sub)
- [Business data](/docs/convoai/restful/user-guides/custom-data)

## 选择路径后的原则

- 先跑通一条最短闭环，再扩展模型和上下文。
- 先补鉴权、状态和事件，再补“更聪明”的行为。
- 先确定入口，再逐步下钻到 Build、Connect、Operate 和 Reference。
