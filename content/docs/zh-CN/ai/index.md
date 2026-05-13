---
title: Introduction
description: 构建能加入 Agora 实时频道、与用户自然对话、并把事件回传给应用与后端的语音 AI 智能体。
---

## 什么是 AI 智能体

Agora AI 智能体是实时会话中的参与者。它们可以加入频道、监听用户语音、通过 ASR 转成文本、调用大模型推理、用 TTS 播报回复，并把状态、转写、错误与生命周期事件回传给你的应用和后端。

和传统聊天机器人不同，这里的智能体不是一个脱离实时链路的独立服务，而是和用户、客户端、后端一起共享同一个 Agora 实时上下文。

## 为什么从这里开始

这篇 Introduction 页的目的不是替代所有具体文档，而是先帮助你建立一张总图：

- 智能体如何进入 Agora 频道
- 你的后端如何启动、更新、停止和查询智能体
- 模型、语音、上下文、事件分别放在哪一层
- 下一步应该进入 Agent Studio、快速开始、REST API，还是客户端接入

## AI 智能体如何接入 Agora

### 1. 你的应用加入或创建频道

用户通过 Web、移动端或设备端加入同一个 Agora 实时频道。

### 2. 你的后端启动智能体会话

后端负责凭证、生命周期控制、模型参数和业务规则，并通过 REST API 或服务端 SDK 启动一个智能体实例。

### 3. 智能体作为参与者加入频道

智能体和用户位于同一个频道内，因此可以像真正的通话参与者一样接收音频、发出语音并同步状态。

### 4. 音频通过 ASR、LLM 和 TTS 流转

用户语音输入进入语音识别，大模型决定下一步动作，再通过 TTS 把结果播报回频道。

### 5. 事件返回到你的应用

转写、状态变化、中断、错误、轮次信息和 Webhook 回调会持续把智能体状态同步到你的产品逻辑里。

## 当前仓库里建议先看的页面

- [Voice AI quickstart](/zh-CN/ai/quick-start)
- [Start with Agent Studio](/zh-CN/ai/start-with-agent-studio)
- [Set up project and credentials](/zh-CN/ai/enable-service)
- [How agents work](/zh-CN/ai/concepts)
- [Events and webhooks](/zh-CN/api-reference/ncs-events)

## 下一步推荐

如果你希望最快验证一条实时语音链路，先去看 Quickstart。

如果你希望先在浏览器里快速体验智能体形态，再决定如何集成，先去看 Agent Studio。
