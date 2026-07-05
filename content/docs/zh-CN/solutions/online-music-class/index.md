---
title: "文档指引"
---
## 在线音乐教学是什么？

在线音乐教学可以帮助专业音乐老师开展一对一或一对多的音乐教学和陪练。为贴近线下教学场景，该方案利用声网实时互动技术和音乐场景专属的降噪算法，采用 48 kHz 采样率、192 Kbps 码率高度还原音质效果，同时支持教学白板、曲谱标注和鱼眼镜头畸变矫正等功能。

## 方案选择

声网对在线教育场景提供 PaaS 和 aPaaS 两种实现方案，你可以根据场景和资源评估选择哪一种方式搭建。

![PaaS 方案](/img/online-music/music-landing-page.png)

- **PaaS 方案**：集成不同功能的 SDK，实现定制化需求
  - 分别集成 RTC、RTM、白板和云端录制
  - 适用开发资源充足、定制化需求高的场景
  - 支持超过 20 个平台和框架
  - [方案介绍](/zh-CN/solutions/online-music-class/overview/product-overview#paas-技术方案)

![低代码方案/aPaaS 方案](/img/flexible-classroom/low-code.png)

- **低代码方案/aPaaS 方案**：快速、轻松地构建出在线互动教学场景
  - 封装 RTC、RTM、白板等产品的复杂 API
  - 覆盖教育和监考两大场景
  - 提供一对一，小班课和大班课多种班型
  - [方案介绍](/zh-CN/solutions/flexible-classroom/index)

## 快速搭建 PaaS 方案

    - [资源获取](/zh-CN/solutions/online-music-class/resources)

    - [开通服务](/zh-CN/solutions/online-music-class/get-started/enable-service)

    - [集成指引](/zh-CN/solutions/online-music-class/get-started/quick-start)

## PaaS 方案进阶功能

    - [实现鱼眼镜头畸变矫正](/zh-CN/solutions/online-music-class/advanced-features/fish-eye)

## API 参考

你可以基于声网在线音乐教学特殊版 SDK、RTM 1.x SDK 和互动白板 SDK 开发在线音乐教学场景。参考如下文档了解详细的 API 参考：

- [在线音乐教学 API 参考](/zh-CN/solutions/online-music-class/api/fish-eye)
- [实时消息 API 参考](https://docportal.shengwang.cn/cn/Real-time-Messaging/api-ref?platform=All%20Platforms)
- [云端录制 API 参考](/doc/cloud-recording/restful/cloud-recording/operations/post-v1-apps-appid-cloud_recording-acquire)

- [互动白板 API 参考](https://doc.shengwang.cn/api-ref/whiteboard/android/overview)

- [互动白板 API 参考](https://doc.shengwang.cn/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview)

## 如何计费？

在线音乐教学特殊版 SDK 是基于声网 RTC SDK 开发的，因此计费策略与 [RTC 计费策略](/doc/rtc//billing/billing-strategy)一致。

如果你的项目中还使用了 RTM SDK、互动白板 SDK 和云端录制，可以参考如下文档了解各服务的计费详情：

- [RTM SDK 计费说明](/zh-CN/realtime-media/rtm/overview/billing/billing-strategy)
- [云端录制计费说明](/zh-CN/realtime-media/recording/cloud-recording/overview/billing-strategy/billing)

- [互动白板计费说明](/doc/whiteboard//whiteboard-sdk/overview/billing)
