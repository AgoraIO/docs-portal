---
title: Configure presets
description: 用预设配置把常见场景的语音、模型和会话参数整理成更容易复用的接入方式。
---

## 为什么需要预设

当同一个智能体需要支持多个业务场景时，预设可以帮助你把常见配置组合成更稳定、可复用的入口，而不是每次都从零拼参数。

## 预设通常包含什么

- 语音角色与播报风格
- LLM 的模型与提示词
- ASR / TTS 供应商配置
- 中断、记忆、上下文等行为策略

## 推荐先看的页面

- [Configure LLM](/docs/convoai/restful/user-guides/custom-llm)
- [Configure ASR and TTS](/?tab=ai&page=ai-configure-asr-and-tts)
- [Manage memory and context](/docs/convoai/restful/user-guides/short-term-memory)

## 实践建议

先用最少的预设跑通主场景，再逐步拆分为客服、陪伴、设备、教育等不同模板。
