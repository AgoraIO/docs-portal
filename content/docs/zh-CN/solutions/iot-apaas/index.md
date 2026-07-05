---
title: "文档指引"
---
灵隼物联网云平台为音视频设备一站式上云和自主智能化开发提供连接管理、设备管理、上下行链路以及基于声网的实时音视频的呼叫管理能力。

## 产品介绍

灵隼物联网通过**设备端 SDK** 与**客户端示例项目**搭配提供云服务。其中设备端提供视频云存储、设备管理功能；客户端提供视频云存储、云端播放、用户管理、消息推送、设备绑定功能。点击了解更多的技术架构和功能信息。

<Cards>
  <Card
    title="技术架构"
    href="/doc/iot-apaas//overview/tech-architecture"
    description="了解设备端 SDK 与客户端如何交互，实现实时音视频、呼叫、设备管理等功能"
  />

  <Card
    title="产品概述"
    href="/doc/iot-apaas//overview/product-overview"
    description="了解灵隼的功能、适用场景和平台兼容信息"
  />
</Cards>

## 方案选择

灵隼为设备端和客户端提供**全功能**和**纯呼叫**两个版本的方案，其中全功能包含呼叫、通话、设备管理、告警；纯呼叫支持呼叫与通话。根据你的开发环境，选择对应的版本。

:::info[信息]
- 全功能方案和纯呼叫方案的技术实现有较大差异，你需要根据自身的业务需求正确选择方案。否则，如果后续需要更换技术方案，可能带来较大的迁移成本。
- 小程序端仅支持纯呼叫方案。
:::

### 全功能版本

使用全功能版本的设备端 SDK 和客户端 API 实现设备管理、呼叫、通话、告警。

如果你没有自研的设备管理等模块，可以选用全功能版本。

- [开通服务](/zh-CN/solutions/iot-apaas/get-started/enable-service)
- [设备端实现](/zh-CN/solutions/iot-apaas/get-started/device-call)
- [Android 客户端实现](/zh-CN/solutions/iot-apaas/get-started/client-call)
- [iOS 客户端实现](/zh-CN/solutions/iot-apaas/get-started/client-call)

### 纯呼叫版本

使用纯呼叫版本的设备端 SDK 和客户端 API 实现呼叫和通话功能。

如果你有自研的账号和设备管理等模块，可以选用纯呼叫版本。

- [开通服务](/zh-CN/solutions/iot-apaas/get-started/enable-service)
- [设备端实现](/zh-CN/solutions/iot-apaas/get-started/device-call-minimum)
- [Android 客户端实现](/zh-CN/solutions/iot-apaas/get-started/client-call-minimum)
- [iOS 客户端实现](/zh-CN/solutions/iot-apaas/get-started/client-call-minimum)
- [小程序客户端实现](/zh-CN/solutions/iot-apaas/get-started/client-call-minimum)

## 计费

联系 sales@shengwang.cn 了解灵隼的计费方式。
