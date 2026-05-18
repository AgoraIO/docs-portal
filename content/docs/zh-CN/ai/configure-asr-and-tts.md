---
title: 配置 ASR 与 TTS
description: 说明语音识别与语音合成在智能体链路中的角色，以及应该从哪些现有文档继续深入。
---

## 这部分解决什么问题

ASR 决定用户语音如何变成文本输入，TTS 决定智能体如何把生成结果播报回去。它们直接影响延迟、自然度和交互稳定性。

## 当前仓库里的相关页面

- [实时音频能力](/zh-CN/realtime-media/speech-to-text/audio-modality)
- [配置大模型](/zh-CN/ai/custom-llm)
- [处理打断](/zh-CN/ai/interrupt-agent)

## 配置时要先确认

- 选择哪种 ASR / TTS 供应商
- 采样率、语言、声音角色和风格
- 打断时 TTS 是否立即停止
- 是否要为不同场景准备不同播报风格
