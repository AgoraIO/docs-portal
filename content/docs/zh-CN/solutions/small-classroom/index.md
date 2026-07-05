---
title: "文档指引"
---
## 一对 N 小班课是什么？

声网一对 N 在线小班课是指一位教师对多位学生进行在线辅导教学的场景。教师对学生授课，学生可实时向教师提问，学生之间也可进行实时互动。常见有一对二、一对四、一对六等场景。最多支持十六位学生同时在线。

## 方案选择

声网为在线教育场景提供 PaaS 和 aPaaS 两种实现方案，你可以根据业务场景和资源情况选择合适的搭建方式。

![PaaS 方案](/img/edu-paas/small-classroom.png)

- **PaaS 方案**：集成不同功能的 SDK，实现定制化需求
  - 分别集成 RTC、RTM、白板和云端录制
  - 适用开发资源充足、定制化需求高的场景
  - 支持超过 20 个平台和框架
  - [方案介绍](/zh-CN/solutions/small-classroom/paas/architecture)

![低代码方案/aPaaS 方案](/img/flexible-classroom/low-code.png)

- **低代码方案/aPaaS 方案**：快速、轻松地构建出在线互动教学场景
  - 封装 RTC、RTM、白板等产品的复杂 API
  - 覆盖教育和监考两大场景
  - 提供一对一、小班课和大班课等多种班型
  - [aPaaS 方案介绍、搭建方式及计费说明详见灵动课堂](/zh-CN/solutions/flexible-classroom/index)

## 如何搭建 PaaS 方案？

    - [集成指引](/zh-CN/solutions/small-classroom/paas/integration-guide)

    - [集成注意事项](/zh-CN/solutions/small-classroom/paas/best-practices)

## PaaS 方案如何计费？

一对 N 在线小班课方案基于 RTC SDK、RTM SDK、互动白板 SDK 和云端录制服务搭建。你可以参考以下文档，了解各服务的计费详情：

- [RTC SDK 计费说明](/doc/rtc//billing/billing-strategy)
- [云端录制计费说明](/zh-CN/realtime-media/recording/cloud-recording/overview/billing-strategy/billing)

- [RTM SDK 计费说明](/doc/rtm2//overview/billing/billing-strategy)
- [互动白板计费说明](/doc/whiteboard//whiteboard/overview/billing)
