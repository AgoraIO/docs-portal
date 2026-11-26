# Single Document Content Fidelity Audit

Generated: 2026-07-15T06:01:35.243Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtc-server-sdk/landing-page.mdx`
New source: `/Users/yangyixuan/Documents/GitHub/docs-portal/content/docs/zh-CN/realtime-media/rtc-server-sdk/index.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtc-server-sdk`, platform=`all`

## Summary

- Source records: 10
- Target records: 40
- Exact matches: 0
- Missing: 9
- Extra: 39
- Changed: 1
- Moved: 0
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 49

## Missing (9)

- `old:heading:2`  > 立即体验 @ 9 "立即体验"
- `old:list-item`  > 立即体验 @ 12 "实时音视频核心功能"
- `old:heading:2`  > 快速入门 @ 17 "快速入门"
- `old:list-item`  > 快速入门 @ 22 "实现发送和接收媒体流"
- `old:heading:2`  > 热门文档 @ 27 "热门文档"
- `old:list-item`  > 热门文档 @ 32 "最新版发布"
- `old:list-item`  > 热门文档 @ 38 "合图"
- `old:list-item`  > 热门文档 @ 44 "应对防火墙限制"
- `old:list-item`  > 热门文档 @ 50 "使用String型用户ID"

## Extra (39)

- `new:paragraph` (root) @ 3 "下图展示了RTC服务端SDK的几种应用，包括在频道中播放本地文件，直推CDN，以及与企业呼叫中心互通。服务端SDK将SD&#8209;RTN™ 中的媒体流转换为指定格式，输出给其他模块，并将其他模块的媒体流编码，发送到SD&#8209;RTN™。"
- `new:image` (root) @ 5 "服务端SDK架构"
- `new:callout` (root) @ 7 "warning 注意"
- `new:list-item` (root) @ 8 "在RTC服务端SDK和客户端SDK互通的场景中，请确保客户端SDK的频道场景设为LIVEBROADCASTING。"
- `new:list-item` (root) @ 9 "RTC服务端SDK不支持SIP转码。"
- `new:heading:2`  > 开始构建 @ 12 "开始构建"
- `new:list-item`  > 开始构建 @ 16 "快速开始"
- `new:list-item`  > 开始构建 @ 19 "下载SDK"
- `new:list-item`  > 开始构建 @ 22 "构建功能"
- `new:list-item`  > 开始构建 @ 25 "参考信息"
- `new:heading:2`  > 产品特性 @ 30 "产品特性"
- `new:table-row`  > 产品特性 @ 32 "特性 | 描述"
- `new:table-row`  > 产品特性 @ 34 "兼容 | 与Android、iOS、Windows、macOS、及框架平台互通。与声网的Web RTC SDK（3.0.0或更高版本）以及小程序声网RTC SDK (2.4.2)互通。"
- `new:table-row`  > 产品特性 @ 35 "可靠 | 支持集群部署，动态扩容，服务高可用。"
- `new:table-row`  > 产品特性 @ 36 "流畅 | 基于SD-RTN™ 的音视频抗丢包特性，实现低延迟的服务器到客户端的内容传递。"
- `new:table-row`  > 产品特性 @ 37 "高并发 | 同时支持推拉数百路音视频流。"
- `new:table-row`  > 产品特性 @ 38 "安全 | 提供音视频通话、数据传输、数据存储等端到端安全保障机制，详情可参考信息安全说明。"
- `new:heading:2`  > 适用场景 @ 40 "适用场景"
- `new:paragraph`  > 适用场景 @ 42 "RTC服务端SDK应用广泛，目前可以在以下场景中发挥重要作用："
- `new:table-row`  > 适用场景 @ 44 "场景 | 功能描述"
- `new:table-row`  > 适用场景 @ 46 "AI虚拟人 | 服务端SDK深度融合了AI算法，构建了AI虚拟人多模态交互的音视频通讯基础。使用服务端SDK，可以实现用户和虚拟人之间低延迟、高清音视频的实时互动，用户可以享受身临其境的交流体验。"
- `new:table-row`  > 适用场景 @ 47 "AI互动课堂 | AI互动课堂是一种个性化在线教学方式，利用AI技术对学生的表现进行智能分析，向学生推送针对性的音视频课件讲解，做到因材施教。使用服务端SDK，可以向频道中不同的用户ID发送不同的课件视频。"
- `new:table-row`  > 适用场景 @ 48 "IoT | 服务端SDK可以支持智能穿戴设备、摄像头、传感器等物联网设备间的实时音视频传输，实现智能安防、远程监控、远程会议等功能。"
- `new:table-row`  > 适用场景 @ 49 "云游戏 | 服务端SDK能够处理云游戏画面的实时捕捉、编码和传输，确保玩家在云端大型游戏中获得低延迟、高画质的体验。"
- `new:table-row`  > 适用场景 @ 50 "网络测试 | 在上课之前，服务端SDK作为机器人进入频道，与老师和学生通话，测试端到端网络情况。"
- `new:table-row`  > 适用场景 @ 51 "呼叫中心 | 使用服务端SDK为企业传统的呼叫中心系统（VoIP/PSTN）建立音频连接，让用户可以在App上方便、快捷地发起音频呼叫，联络客服坐席。"
- `new:heading:2`  > 产品功能 @ 53 "产品功能"
- `new:table-row`  > 产品功能 @ 55 "功能 | 描述"
- `new:table-row`  > 产品功能 @ 57 "发送和接收多种格式的音视频数据 | 支持向SD-RTN™ 发送多种格式的媒体流或媒体文件。"
- `new:table-row`  > 产品功能 @ 58 "媒体流发送和接收相互独立 | 可同时发送和接收媒体流、仅发送或仅接收媒体流、音频和视频的发送和接收相互独立。"
- `new:table-row`  > 产品功能 @ 59 "单进程多频道 | 同时针对多个频道发送或接收媒体流。"
- `new:table-row`  > 产品功能 @ 60 "支持String型用户ID | 支持使用String型用户ID加入频道。"
- `new:table-row`  > 产品功能 @ 61 "接收指定用户ID的流 | 支持接收频道内指定用户ID的流。"
- `new:table-row`  > 产品功能 @ 62 "混音 | 支持将接收的多路音频流进行混音。"
- `new:table-row`  > 产品功能 @ 63 "媒体流加密 | 支持多种加密模式，详见媒体流加密。"
- `new:table-row`  > 产品功能 @ 64 "云代理 | 支持云代理服务。用户只需要在防火墙上将特定的IP及端口列入白名单，就可以实现内网访问声网服务。"
- `new:table-row`  > 产品功能 @ 65 "发送数据流消息 | 支持发送文本等数据流消息。"
- `new:heading:2`  > 计费 @ 67 "计费"
- `new:paragraph`  > 计费 @ 69 "RTC服务端SDK和实时互动RTC的计费方式一致，你可以参考计费策略了解详细信息。"

## Changed (1)

- `old:paragraph` (root) @ 6 "声网RTC服务端SDK部署在服务端，可与集成了声网RTC客户端SDK的App通过SD-RTN™ 进行实时通信，实现收发音视频流的功能。"
  - target: `new:paragraph` (root) @ 1 "声网RTC服务端SDK部署在服务端，可与集成了声网RTC客户端SDK的App通过SD-RTN™ 进行实时通信，实现向客户端发送音视频流和从客户端接收音视频流的功能。"
  - similarity: 1.00

## Moved (0)

- None

## Unsupported (0)

- None
