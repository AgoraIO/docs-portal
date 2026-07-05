---
title: "文档指引"
---
## 一对一互动教学是什么？

一位老师对一位学生进行专属线上辅导教学，老师和学生能实时音视频互动，这就是典型的一对一互动教学场景。常见的一对一互动教学有一对一在线课外辅导、一对一在线语言教学和一对一在线音乐陪练等。

## 方案选择

声网对在线教育场景提供 PaaS 和 aPaaS 两种实现方案，你可以根据场景和资源评估选择哪一种方式搭建。

![PaaS 方案](/img/edu-paas/one-to-one-classroom.png)

- **PaaS 方案**：集成不同功能的 SDK，实现定制化需求
  - 分别集成 RTC、RTM、白板和云端录制
  - 适用开发资源充足、定制化需求高的场景
  - 支持超过 20 个平台和框架
  - [方案介绍](/zh-CN/solutions/one-to-one-classroom/paas/architecture)

![低代码方案/aPaaS 方案](/img/flexible-classroom/low-code.png)

- **低代码方案/aPaaS 方案**：快速、轻松地构建出在线互动教学场景
  - 封装 RTC、RTM、白板等产品的复杂 API
  - 覆盖教育和监考两大场景
  - 提供一对一、小班课和大班课等多种班型
  - [aPaaS 方案介绍、搭建及计费详见灵动课堂](/zh-CN/solutions/flexible-classroom/index)

## 如何搭建 PaaS 方案？

    - [集成指引](/zh-CN/solutions/one-to-one-classroom/paas/integration-guide)

    - [集成注意事项](/zh-CN/solutions/one-to-one-classroom/paas/best-practices)

## PaaS 方案如何计费？

一对一互动教学场景方案基于 RTC SDK、RTM SDK、互动白板 SDK 和云端录制搭建，你可以参考如下文档了解各服务的计费详情：

- [RTC SDK 计费说明](/doc/rtc//billing/billing-strategy)
- [云端录制计费说明](/zh-CN/realtime-media/recording/cloud-recording/overview/billing-strategy/billing)

- [RTM SDK 计费说明](/doc/rtm2//overview/billing/billing-strategy)
- [互动白板计费说明](/doc/whiteboard//overview/billing)
