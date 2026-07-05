---
title: "文档指引"
---
## 在线美术教学是什么？

在线美术教学可以帮助专业美术老师对学生进行在线绘画教学或辅导。支持的课堂场景包括启蒙课、大班课、艺考、校考、联考等，具备高清还原作品色彩、拍摄画面能自动矫正、双摄支持、一镜翻转等功能，助力机构和学校构建体验最佳的在线课堂。

## 方案选择

声网对在线教育场景提供 PaaS 和 aPaaS 两种实现方案，你可以根据场景和资源评估选择哪一种方式搭建。

![PaaS 方案](/img/edu-paas/art-landing-page.png)

- **PaaS 方案**：集成不同功能的 SDK，实现定制化需求
  - 分别集成 RTC、RTM、白板和云端录制
  - 适用开发资源充足、定制化需求高的场景
  - 支持超过 20 个平台和框架
  - [方案介绍](/zh-CN/solutions/art-class/overview/product-overview)

![低代码方案/aPaaS 方案](/img/flexible-classroom/low-code.png)

- **低代码方案/aPaaS 方案**：快速、轻松地构建出在线互动教学场景
  - 封装 RTC、RTM、白板等产品的复杂 API
  - 覆盖教育和监考两大场景
  - 提供一对一、小班课和大班课等多种班型
  - [aPaaS 方案介绍、搭建及计费详见灵动课堂](https://doc.shengwang.cn/doc/flexible-classroom/android/landing-page)

## 快速搭建 PaaS 方案

    - [资源获取](/zh-CN/solutions/art-class/resources)

    - [开通服务](/zh-CN/solutions/art-class/get-started/enable-service)

    - [集成指引](/zh-CN/solutions/art-class/get-started/quick-start)

## PaaS 方案进阶功能

    - [实现明暗校正](/zh-CN/solutions/art-class/advanced-features/brightness-correction.android)

    - [实现透视校正](/zh-CN/solutions/art-class/advanced-features/trapezoid-correction)

## API 参考

你可以基于声网在线美术教学特殊版 SDK、RTM 1.x SDK 和互动白板 SDK 开发在线美术教学场景。参考如下文档了解详细的 API 参考：

- [在线美术教学 API 参考](/zh-CN/solutions/art-class/api/correction.android)
- [实时消息 API 参考](https://docportal.shengwang.cn/cn/Real-time-Messaging/api-ref?platform=All%20Platforms)
- [云端录制 API 参考](/doc/cloud-recording/restful/cloud-recording/operations/post-v1-apps-appid-cloud_recording-acquire)

- [互动白板 API 参考](https://doc.shengwang.cn/api-ref/whiteboard/android/overview)

- [互动白板 API 参考](https://doc.shengwang.cn/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview)

## PaaS 方案如何计费？

在线美术教育特殊版 SDK 是基于声网 RTC SDK 开发的，因此计费策略与 [RTC 计费策略](/doc/rtc//billing/billing-strategy)一致。

如果你的项目中还使用了 RTM SDK、互动白板 SDK 和云端录制，可以参考如下文档了解各服务的计费详情：

- [云端录制计费说明](/zh-CN/realtime-media/recording/cloud-recording/overview/billing-strategy/billing)

- [互动白板计费说明](/doc/whiteboard//overview/billing)
- [RTM SDK 计费说明](/doc/rtm2//overview/billing/billing-strategy)
