---
title: 模型、语音与上下文
description: 梳理 LLM、ASR、TTS、记忆和业务上下文在智能体链路中的分工，以及应该优先看的现有文档。
---

## 这一层解决什么问题

当你已经跑通一个最基本的智能体会话后，下一步通常不是立刻扩更多接口，而是先让智能体“说得像、听得懂、记得住、贴业务”。

## 相关能力通常分成四部分

### 模型

决定推理逻辑、提示词结构、工具调用方式和上下文理解能力。

### 语音

ASR 负责把用户语音变成文本，TTS 负责把模型输出播报回频道。

### 记忆

短期记忆决定智能体是否能跨多轮对话延续上下文。

### 业务上下文

自定义数据和房间状态决定智能体是否能理解用户当前场景，而不是只做通用问答。

## 推荐先看的文档

- [Configure LLM](/zh-CN/ai/custom-llm)
- [Configure ASR and TTS](/zh-CN/ai/configure-asr-and-tts)
- [Manage memory and context](/zh-CN/ai/short-term-memory)
- [Business data](/zh-CN/ai/custom-data)
