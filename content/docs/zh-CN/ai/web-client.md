---
title: Web client
description: 把 AI 智能体接到 Web 端时，建议优先确认的接入层、事件层和展示层要点。
---

## Web 端通常要处理什么

- 加入 Agora 实时频道
- 获取麦克风权限
- 展示智能体状态、字幕和错误
- 把事件同步到界面和业务逻辑

## 建议先看的页面

- [Realtime audio](/zh-CN/realtime-media/audio-modality)
- [Transcripts and subtitles](/zh-CN/ai/realtime-sub)
- [Events and webhooks](/zh-CN/api-reference/ncs-events)

## 设计建议

先把“加入频道并听到智能体说话”跑通，再补字幕、状态、错误提示和调试能力。
