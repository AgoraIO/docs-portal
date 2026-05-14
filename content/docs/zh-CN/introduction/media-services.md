---
title: 媒体服务
description: 从录制、推流、拉流、转码和交付链路出发，快速找到声网媒体服务相关文档。
---

## 这一类能力包括什么

参考当前声网文档中心的产品结构，媒体服务主要覆盖录制、推流、拉流、转码和协议网关等扩展能力，用来补齐实时互动之后的生产级媒体处理链路。

## 对应的官方产品文档

- [查看云端录制](https://doc.shengwang.cn/doc/cloud-recording/restful/landing-page)
- [查看本地服务端录制](https://doc.shengwang.cn/doc/recording/cpp/landing-page)
- [查看旁路推流](https://doc.shengwang.cn/doc/media-push/restful/landing-page)
- [查看输入在线媒体流](https://doc.shengwang.cn/doc/media-pull/restful/landing-page)
- [查看云端转码](https://doc.shengwang.cn/doc/cloud-transcoder/restful/landing-page)
- [查看 RTMP 网关](https://doc.shengwang.cn/doc/rtmp-gateway/restful/landing-page)

## 当前仓库里最接近的文档

这个仓库目前没有把上述各个媒体服务产品完整迁移进来，但有一篇和语音输入输出链路强相关的文档可以直接阅读：

- [查看音频模态文档](/zh-CN/realtime-media/audio-modality)

## 什么时候应该进入媒体服务

### 你已经跑通 RTC 或 AI 主链路

当实时会话已经可用，但你还需要把内容录下来、推送出去、接入外部媒体流或做转码处理时，就应该进入媒体服务域。

### 你需要生产环境级的媒体交付

如果需求已经超出“实时会话本身”，例如归档、回放、广播、多平台分发或协议互通，媒体服务通常就是下一步。
