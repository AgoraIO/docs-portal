---
title: 实时音视频
description: 帮你快速定位实时互动 RTC 的接入入口，以及它与当前 ConvoAI 文档的衔接关系。
---

## 这类能力解决什么问题

实时音视频负责低时延的音频、视频和频道会话，是通话、直播、互动课堂、语音房和 AI 实时对话的基础层。

## 对应的官方产品文档

- [查看实时互动 RTC 文档总览](https://doc.shengwang.cn/doc/rtc/homepage)
- [查看 Android 快速开始](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start)
- [查看 Web 快速开始](https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start)
- [查看 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)

## 和当前仓库的关系

这个仓库目前重点收录的是 ConvoAI RESTful 文档，所以你在这里看到的很多 AI 能力页，默认都建立在 RTC 已经打通的前提之上。

- [查看对话式 AI 快速开始](/zh-CN/ai/quick-start)
- [查看音频模态文档](/zh-CN/realtime-media/audio-modality)

## 常见接入顺序

### 先把 RTC 基础链路跑通

先完成频道加入、设备权限、音频采集和鉴权，再进入更上层的 AI 或媒体处理能力。

### 再补场景化能力

如果你后续要扩展到 AI 对话、录制、转录或消息协作，可以在 RTC 基础链路上继续叠加对应能力页，而不是一开始把所有产品混在一起。
