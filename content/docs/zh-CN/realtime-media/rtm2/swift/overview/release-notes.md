---
title: 发版说明
description: 发版说明，用于说明 RTM 在该平台上的产品概览、版本变化或接入边界。
---

本文提供 RTM v2 SDK 的发版说明。

### 已知问题和局限性

自 2.2.0 起，RTM SDK 和 RTC SDK（4.3.0 及以上版本）都包含 `aosl.xframework` 库。如果你同时使用了 RTM 和 RTC SDK，为避免冲突，需进行如下操作：
- 如果你通过 CDN 手动集成 SDK，请手动删除更低版本的 `aosl.xframework` 库；
- 如果你使用依赖管理工具（如 Maven 或 CocoaPods） 集成 SDK，请确保在项目中引入更高版本的 `aosl.xframework` 库。

具体的集成指南可以参考[如何处理同时集成 RTM SDK 和 RTC SDK 遇到的问题？](/faq/integration-issues/rtm2-rtc-integration-issue)

- 2.2.8 RTM SDK `aosl.xframework` 库版本为 1.3.0。
- 2.2.7 RTM SDK `aosl.xframework` 库版本为 1.3.0。
- 2.2.3、2.2.4、2.2.5、2.2.6 RTM SDK `aosl.xframework` 库版本为 1.2.13。
- 2.2.2 RTM SDK `aosl.xframework` 库版本为 1.0.11。

该版本于 2026 年 2 月 12 日发布。

### 问题修复

- 修复部分场景下，App 从后台恢复并叠加网络切换时，可能导致服务连接状态异常的问题。
- 修复部分场景下，设置 [`Presence`](https://doc.shengwang.cn/api-ref/rtm2/swift/toc-presence/presence) 的临时用户状态后，事件通知无法正常下发的问题。

该版本于 2025 年 12 月 12 日发布。

### 升级必看

#### SDK 引用方式变更

从 v2.2.7 起，如果你使用 CocoaPods 将 RTM SDK 导入到项目中，则 `Podfile` 文件中引入 SDK 的代码需要进行如下变更：

详细集成步骤可以参考[快速开始](../get-started/quick-start)。

在同时集成了 RTC SDK v4.3.0 及以上版本的场景中，RTM 轻量库的引入代码方式详见 [FAQ](/faq/integration-issues/rtm2-rtc-integration-issue)。

### 改进

- 该版本在 [`AgoraRtmClientConfig`](https://doc.shengwang.cn/api-ref/rtm2/swift/toc-configuration/configuration#AgoraRtmClientConfig) 中新增 `callbackQueue` 参数，支持对回调所在的线程进行设置。
- 优化了登录操作 (`loginByToken`) 的响应机制。

### 问题修复

- 修复了某些极端情况下，调整设备时钟可能触发 SDK 进入重连状态的问题。
- 修复了在长时间和 RTM 服务断开的情况下，重新连接后，自身所在频道的 Presence 状态可能出现异常的问题。

该版本于 2025 年 10 月 31 日发布。

### 改进

#### 新增重连超时配置

该版本在 [`AgoraRtmClientConfig`](https://doc.shengwang.cn/api-ref/rtm2/swift/toc-configuration/configuration#rtmconfig) 中增加 `reconnectTimeout` 字段。你可以通过该字段配置 SDK 在登录或断线重连时，返回超时错误的时间，单位为秒。当登录或重连超过设置的时间，SDK 会通过回调报告当前的连接状态和原因。

该版本于 2025 年 7 月 1 日发布。

### 新特性

#### 支持 IoT 设备域名白名单

在 IoT 场景下，设备可能受限于互联网服务提供商 (ISP)。为解决这一限制，该版本在 [`AgoraRtmClientConfig`](https://doc.shengwang.cn/api-ref/rtm2/swift/toc-configuration/configuration#rtmconfig) 中增加 `ispPolicyEnabled` 字段。通过将该字段设为 `true`，SDK 会仅连接到已向运营商报备的域名或 IP 白名单中的服务器。

### 问题修复

- 某些场景下，Token 过期的通知可能被多次触发。
- 某些场景下，点对点消息已送达对端，但发送端却反馈超时。
- 某些场景下，iOS 系统在退出 App 时，可能引起 RTM SDK 崩溃的问题。
- 私有化场景下，频繁切换网络可能造成连接状态异常。

该版本于 2025 年 4 月 1 日发布。主要改动点如下：

- 进一步优化了登录服务的时长。
- 修复了回调函数中，如果业务代码存在未捕获的异常，可能引起 SDK 崩溃的问题。
- 修复了订阅 Topic 时，可能返回未加入频道的问题。

该版本于 2025 年 3 月 21 日发布。

### 升级必看

从该版本起，RTM SDK 支持通过 SPM (Swift Package Manager) 集成 SDK。你可以选择该方式进行集成，详见[安装 SDK](../user-guide/setup/application-setup#安装-sdk)。

### 改进

#### 新增连接状态改变原因

该版本在 `AgoraRtmLinkStateChangeReason` 中增加原因 `loginTooFrequent` (37)，表示当前登录操作过于频繁。

#### 新增更新 Token 超时错误码

为反馈更新 Token 操作的结果，该版本新增错误码 `channelNotJoined` (10026)。

#### Presence 事件通知优化

当频道数据无法正常同步时，SDK 会重新触发一次 `snapshot` 事件。收到该事件后，用户可以更新自己 App 的本地缓存。

#### 其它改进

- 加快了切后台或休眠后，RTM 服务恢复重连的速度。
- 优化了 SDK 在弱网情况下的表现。
- 优化了接入节点的选择，提升了服务的连接速度。

### 问题修复

- 重连时偶现订阅服务未恢复。
- 部分频道内用户查询结果时，可能包含异常离线用户的信息。

该版本于 2024 年 11 月 6 日发布。这是 RTM v2 Swift SDK 的第一个版本。

本次发布意味着声网实时通讯（RTM）产品步入 v2 时代，我们在功能覆盖、性能提升、体验优化上都将为用户带来革新。

- 功能覆盖：该版本通过引入频道（Channel）、消息（Message）、Topic、Presence、Storage 和 Lock 等功能模块，能覆盖更多业务场景，你可以把更多的精力集中在自己的业务创新上。

- 性能提升：我们在新版本中重构了后台架构，通过优化网络连接进一步提升性能，提供长时间低延迟、高可靠、大并发、易扩展的实时网络接入能力，让你无需为业务质量担忧。

- 体验优化：我们重新设计并简化了 API 接口；优化了包括用户指南、API 参考在内的所有文档，提供了更全面的示例程序，支持开发者低成本学习使用 SDK，快速完成集成，提高开发效率。

### 新特性

该版本提供的核心功能模块如下。

#### 初始配置（Setup）

初始配置（Setup）是初始化 RTM Client 时预先定义或配置的一些关键参数，影响其后续行为。同时，它还提供了登录、登出等功能。核心能力如下：

- ``：创建一个 RTM Client 实例，并进行如下初始配置：
  - `appId`：设置 App ID。相同 App ID 的 App 间可以通信，不同 App ID 的 App 相互隔离。
  - `userId`：设置用户 ID，用以区分用户或设备。
  - `areaCode`：设置区域代码，用于 Geo-fencing 功能。
  - `presenceTimeout`：设置 Presence 服务的超时时间。
  - `useStringUserId`：设置用户 ID 的数据类型，可以是 String 类型，也可以是 Uint 类型。
  - `logConfig`：配置本地日志大小、位置、输出信息等级等参数。
  - `proxyConfig`：配置 Proxy 服务参数。
  - `encryptionConfig`：配置端侧加密参数。
- 事件监听：实现 `onMessageEvent`、`onPresenceEvent`、`onTopicEvent`、`onStorageEvent`、`onLockEvent`、`connectionStateChanged`、`onTokenPrivilegeWillExpire` 等事件通知的业务逻辑。
- `login`：登录 RTM 服务。
- `logout`：登出 RTM 服务。
- `destroy`：销毁 RTM Client 实例，释放资源。

#### 频道（Channel）

频道是 RTM 实时网络中一种数据传输的管理机制，任何订阅或加入频道的用户都可以在 100 毫秒内接收到频道中传输的消息和事件，RTM 允许客户端订阅数百甚至数千个频道。大多数 RTM API 都将以频道为基础进行发送、接收、加密等行为。

基于声网的能力，RTM 的频道分成两种类型：Message Channel 和 Stream Channel。两种类型频道的核心能力如下：

- Message Channel：
    - `subscribe`：订阅指定 Message Channel 并开始接收频道中的消息和事件通知。
    - `unsubscribe`：取消订阅指定 Message Channel 并停止接收频道中的消息和事件通知。

- Stream Channel：
    - `createStreamChannel`：创建 Stream Channel 实例，随后可以调用其中的方法。
    - `join`：加入 Stream Channel，并开始接收频道中的消息和事件通知。
    - `leave`：离开 Stream Channel，并停止接收频道中的消息和事件通知。
    - `destroy`：销毁 Stream Channel 实例以释放资源。

其中：
- `subscribe`、`unsubscribe`、`join`、`leave` 方法都会触发 `onPresenceEvent` 事件通知。频道中的其他用户会收到对应的 `Join`、`Leave` 事件通知。
- 调用 `subscribe` 和 `join` 操作订阅或加入频道的时候，可以选择是否配置 `withMessage`、`withPresence`、`withMetadata`、`withLock` 等参数以开启对应事件通知的监听功能。如果开启，你同时也需要注册对应事件监听，才能顺利收到对应事件通知。

#### 消息（Message）

RTM 的基础是发送消息的能力，你可以随时随地向频道中发送消息，消息会在 100 毫秒内传递到任何地方。RTM 支持 String 类型和 Byte 类型的消息负载。

`publish` 向指定的 Message Channel 中发送消息，同时支持存储历史消息。调用 `publish` 会触发 `onMessageEvent` 事件通知，如果想要收到频道中的消息，你需要在 `subscribe` 的时候，设置 `withMessage = true`，注册并实现 `onMessageEvent` 事件。

#### Topic

Topic 是 Stream Channel 中的数据流管理机制。你可以在 Stream Channel 中利用此特性进行数据流的订阅、分发、事件通知等，灵活使用 Topic 能力，能大大降低业务复杂度，提升开发效率。Topic 的主要功能如下：

- `joinTopic`：注册成为此 Topic 的消息发布者（publisher）。注册后，该用户会具备发送消息的能力。
- `publishTopicMessage`：向 Stream Channel 中的 Topic 发送消息。
- `leaveTopic`： 取消注册为该 Topic 的消息发布者。
- `subscribeTopic`：订阅该频道中 Topic 的一名或多名消息发布者。
- `unsubscribeTopic`：取消订阅该 Topic 或取消订阅该 Topic 中指定的一名或多名消息发布者。

注册（`joinTopic`）或取消注册（`leaveTopic`）消息发布者操作，会触发 `onTopicEvent` 事件通知，频道中的其他用户将会收到此事件通知。

> **信息**
> Topic 特性只在 Stream Channel 中有效，Message Channel 中不存在此特性。

#### Presence

Presence 提供监控用户在线状态及临时状态变化的能力。通过 Presence 功能，你可以实时获取以下信息：

- 用户加入或离开频道的实时状态
- 订阅或加入同一频道的所有用户的实时状态
- 一个用户订阅或加入的所有频道的实时信息
- 自定义临时用户状态及其变更信息

在 Message Channel 和 Stream Channel 中均可使用以下 Presence 功能：

- `whoNow`：实时获取指定频道的在线用户数量、在线用户列表、在线用户的临时状态等信息。
- `whereNow`：实时获取指定用户所在频道的列表。
- `setState`：设置用户在指定频道的临时状态。
- `getState`：获取用户在指定频道的临时状态。
- `removeState`：删除用户在特定频道的临时状态。

Presence 在提供上述功能的同时，也提供了 `onPresenceEvent` 事件通知能力。频道中用户的加入、离开、掉线、用户状态设置、用户状态删除等事件都会以实时通知（Announce Mode）或定时通知（Interval Mode）的方式通知到频道中的其他用户。Presence 能力将大大简化开发者业务中关于在线用户上下线、状态变更等状态的同步逻辑实现，充分利用此特性将使得你的业务实现更稳定、实时、可靠。

#### Storage

RTM 的 Storage 功能提供了一套动态数据库机制，可以让开发者动态设置、存储、更新、删除 Channel Metadata 和 User Metadata 等数据，并监听由 Channel Metadata 或 User Metadata 变更而产生的事件通知。

##### Channel Metadata

- `setChannelMetadata`：为指定频道设置 Channel Metadata 或 Channel Metadata Item。
- `getChannelMetadata`：获取指定频道的 Channel Metadata 和 Channel Metadata Item。
- `removeChannelMetadata`：删除指定频道的 Channel Metadata 或 Channel Metadata Item。
- `updateChannelMetadata`：更新指定频道已有 Channel Metadata 或 Channel Metadata Item。

Channel Metadata 的设置、删除和更新都会触发 `onStorageEvent` 事件通知，合理使用此特性可以极大的优化业务逻辑，获得优异的用户体验。当前 `onStorageEvent` 事件通知中携带的是当前 Channel Metadata 的全量信息，我们将在后续版本中优化，提供性能更优的增量更新能力。

Channel Metadata 同时也引入了 Lock 的控制能力，当调用 API 设置、删除、更新 Channel Metadata 时，如果参数中的 `lock` 被设置，则开启 Lock 的校验，此时只有拥有此锁的用户才被允许成功调用对应的方法。

##### User Metadata

- `setUserMetadata`：设置指定用户的 User Metadata 或 User Metadata Item。
- `getUserMetadata`：获取指定用户的 User Metadata 和 User Metadata Item。
- `removeUserMetadata`：删除指定用户的 User Metadata 或 User Metadata Item。
- `updateUserMetadata`：更新指定用户已存在的 User Metadata 或 User Metadata Item。
- `subscribeUserMetadata`：订阅指定用户的 User Metadata 或 User Metadata Item 变更事件通知。
- `unsubscribeUserMetadata`：取消订阅指定用户的 User Metadata 或 User Metadata Item 事件通知。

User Metadata 的设置、删除和更新都会触发 `onStorageEvent` 事件通知，所有订阅此 User Metadata 的其他用户将会收到事件通知，合理使用此特性可以极大的优化业务逻辑，获得优异的用户体验。当前 `onStorageEvent` 事件通知中携带的是所订阅 User Metadata 的全量信息，我们将在后续的版本中优化，提供性能更优的增量更新能力。

##### CAS 控制

Channel Metadata 和 User Metadata 都引进了版本控制逻辑 CAS（Compare And Set），该方法提供两种独立的版本控制字段，你可以根据实际业务场景设置任意一种或多种：

- 通过 `AgoraRtmMetadata` 中的 `setMajorRevision` 方法设置 `majorRevision` 属性开启整组 Channel Metadata 的版本号校验。
- 通过 `AgoraRtmMetadataItem` 中的 `revision` 属性开启某个 Metadata Item 的版本号校验。

设置、删除、更新 Channel Metadata 或 User Metadata 时，配合 `revision` 参数可以控制本次调用是否开启 Revision 校验，逻辑如下：

- `majorRevision` 或  `revision` 为 `-1` 时，本次调用不开启 CAS 验证。如果 Metadata 或 Metadata Item 已存在，则该 Metadata 或 Metadata Item 会被最新值覆盖；如果 Metadata 或 Metadata Item 不存在，则会创建对应的 Metadata 或 Metadata Item。
- `majorRevision` 或  `revision` 为 Uint64 正整数时，本次调用开启 CAS 验证。如果 Metadata 或 Metadata Item 已存在，则 SDK 会在版本号验证成功后更新对应的值；如果 Metadata 或 Metadata Item 不存在，则 SDK 会返回错误码。

#### Lock

临界资源一次只能供一个进程使用，如果不同的进程之间共享了某个临界资源，则各进程需要采取互斥的方式来防止彼此干扰。RTM 提供一整套 Lock 的方案，通过控制分布式系统的不同进程，你可以解决用户在访问共享资源时的竞争问题。Lock 为你提供了以下能力：

- `setLock`：为指定频道设置锁。
- `acquireLock`：获取指定频道中指定的锁。
- `releaseLock`： 释放指定频道中指定的锁。
- `revokeLock`： 撤销指定频道中某个用户对此锁的占用权限以释放此锁。
- `getLocks`： 获取指定频道中所有锁的详情。
- `removeLock`：删除指定频道中指定的锁。

频道中锁的设置、获取、释放、撤销和删除操作都会上报对应的 `onLockEvent` 事件通知。你可以充分利用此特性优化业务的实现逻辑。
