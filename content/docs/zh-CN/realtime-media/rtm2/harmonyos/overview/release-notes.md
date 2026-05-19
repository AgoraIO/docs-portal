---
title: 发版说明
description: 发版说明，用于说明 RTM 在该平台上的产品概览、版本变化或接入边界。
---

本文提供 RTM v2 SDK 的发版说明。

### 已知问题和局限性

自 2.2.0 起，RTM SDK 和 RTC SDK（4.3.0 及以上版本）都包含 `libaosl.so` 库。如果你同时使用了 RTM 和 RTC SDK，为避免冲突，需进行如下操作：
- 如果你通过 CDN 手动集成 SDK，请手动删除更低版本的 `libaosl.so` 库；
- 如果你使用依赖管理工具（如 Maven 或 CocoaPods） 集成 SDK，请确保在项目中引入更高版本的 `libaosl.so` 库。

具体的集成指南可以参考[如何处理同时集成 RTM SDK 和 RTC SDK 遇到的问题？](/faq/integration-issues/rtm2-rtc-integration-issue)

- 2.2.8 RTM SDK `libaosl.so` 库版本为 1.3.0。

该版本于 2026 年 2 月 12 日发布。这是 RTM v2 HarmonyOS SDK 的 Beta 版本。

本次发布意味着声网实时通讯（RTM）产品正式支持 HarmonyOS 平台，我们在功能覆盖、性能提升、体验优化上都将为用户带来革新。

- 功能覆盖：该版本通过引入频道（Channel）、消息（Message）、Topic、Presence、Storage 和 Lock 等功能模块，能覆盖更多业务场景，你可以把更多的精力集中在自己的业务创新上。

- 性能提升：我们在新版本中重构了后台架构，通过优化网络连接进一步提升性能，提供长时间低延迟、高可靠、大并发、易扩展的实时网络接入能力，让你无需为业务质量担忧。

- 体验优化：我们重新设计并简化了 API 接口，支持 Promise/Async-Await 异步编程模式；优化了包括用户指南、API 参考在内的所有文档，提供了更全面的示例程序，支持开发者低成本学习使用 SDK，快速完成集成，提高开发效率。

### 新特性

该版本提供的核心功能模块如下。

#### 初始配置（Setup）

初始配置（Setup）是初始化生产 RTM Client 时预先定义或配置一些关键参数，影响其后续的行为。同时它还提供了登录、登出等功能。核心能力如下：

- `new RtmClient(...)`：创建一个 RTM Client 实例，并进行如下初始配置：
  - `appId`：设置 App ID。相同 App ID 的 App 间可以通信，不同 App ID 的 App 相互隔离。
  - `userId`：设置用户 ID，用以区分用户或设备。
  - `areaCode`：设置区域代码，用于 Geo-fencing 功能。
  - `protocolType`：设置消息传输协议类型。
  - `presenceTimeout`：设置 Presence 服务的超时时间。
  - `heartbeatInterval`：设置 SDK 心跳间隔时间。
  - `useStringUserId`：设置用户 ID 的数据类型，可以是 String 类型，也可以是 number 类型。
  - `logConfig`：配置本地日志大小、位置、输出信息等级等参数。
  - `proxyConfig`：配置 Proxy 服务参数。
  - `encryptionConfig`：配置端侧加密参数。
  - `privateConfig`：配置私有化部署参数。
  - `reconnectTimeout`：配置连接超时时间，超时后将返回连接失败。
- 事件监听：实现 `message`、`presence`、`topic`、`storage`、`lock`、`linkState`、`token` 等事件通知的业务逻辑。
- `login()`：登录 RTM 服务。
- `logout()`：登出 RTM 服务。
- `release()`：销毁 RTM Client 实例，释放资源。

#### 频道（Channel）

频道是 RTM 实时网络中一种数据传输的管理机制，任何订阅或加入频道的用户都可以在 100 毫秒内接收到频道中传输的消息和事件，RTM 允许客户端订阅数百甚至数千个频道。大多数 RTM API 都将以频道为基础进行发送、接收、加密等行为。

基于声网的能力，RTM 的频道分成三种类型：Message Channel、User Channel 和 Stream Channel。三种类型频道的核心能力如下：

- Message Channel：
    - `subscribe()`：订阅指定 Message Channel 并开始接收频道中的消息和事件通知。
    - `unsubscribe()`：取消订阅指定 Message Channel 并停止接收频道中的消息和事件通知。

- User Channel：用户无需订阅频道操作，可以直接指定用户 ID 发送消息，接收消息也只需监听 `message` 事件。

- Stream Channel：
    - `createStreamChannel()`：创建 Stream Channel 实例，随后可以调用其中的方法。
    - `join()`：加入 Stream Channel，并开始接收频道中的消息和事件通知。
    - `leave()`：离开 Stream Channel，并停止接收频道中的消息和事件通知。
    - `release()`：销毁 Stream Channel 实例以释放资源。

其中：
- `subscribe()`、`unsubscribe()`、`join()`、`leave()` 方法都会触发 `presence` 事件通知。频道中的其他用户会收到对应的 `Join`、`Leave` 事件通知。
- 调用 `subscribe()` 和 `join()` 操作订阅或加入频道的时候，可以选择是否配置 `withMessage`、`withPresence`、`withMetadata`、`withLock` 等参数以开启对应事件通知的监听功能。如果开启，你同时也需要注册对应事件监听，才能顺利收到对应事件通知。

#### 消息（Message）

RTM 的基础是发送消息的能力，你可以随时随地向频道中发送消息，消息会在 100 毫秒内传递到任何地方。RTM 支持 String 类型和 Binary 类型的消息负载。

`publish()` 向指定的 Message Channel 或 User Channel 中发送消息。调用 `publish()` 会触发 `message` 事件通知，如果想要收到频道中的消息，你需要在 `subscribe()` 的时候，设置 `withMessage = true`，注册并实现 `message` 事件。

#### Topic

Topic 是 Stream Channel 中的数据流管理机制。你可以在 Stream Channel 中利用此特性进行数据流的订阅、分发、事件通知等，灵活使用 Topic 能力，能大大降低业务复杂度，提升开发效率。Topic 的主要功能如下：

- `joinTopic()`：注册成为此 Topic 的消息发布者（publisher）。注册后，该用户会具备发送消息的能力。
- `publishTopicMessage()`：向 Stream Channel 中的 Topic 发送消息。
- `leaveTopic()`： 取消注册为该 Topic 的消息发布者。
- `subscribeTopic()`：订阅该频道中 Topic 的一名或多名消息发布者。
- `unsubscribeTopic()`：取消订阅该 Topic 或取消订阅该 Topic 中指定的一名或多名消息发布者。

注册（`joinTopic()`）或取消注册（`leaveTopic()`）消息发布者操作，会触发 `topic` 事件通知，频道中的其他用户将会收到此事件通知。

> **信息**
> Topic 特性只在 Stream Channel 中有效，Message Channel 或 User Channel 中不存在此特性。

#### Presence

Presence 提供监控用户在线状态及临时状态变化的能力。通过 Presence 功能，你可以实时获取以下信息：

- 用户加入或离开频道的实时状态
- 订阅或加入同一频道的所有用户的实时状态
- 一个用户订阅或加入的所有频道的实时信息
- 自定义临时用户状态及其变更信息

在所有频道类型中均可使用以下 Presence 功能：

- `whoNow()`：实时获取指定频道的在线用户数量、在线用户列表、在线用户的临时状态等信息。
- `whereNow()`：实时获取指定用户所在频道的列表。
- `setState()`：设置用户在指定频道的临时状态。
- `getState()`：获取用户在指定频道的临时状态。
- `removeState()`：删除用户在特定频道的临时状态。

Presence 在提供上述功能的同时，也提供了 `presence` 事件通知能力。频道中用户的加入、离开、掉线、用户状态设置、用户状态删除等事件都会以实时通知（Announce Mode）或定时通知（Interval Mode）的方式通知到频道中的其他用户。Presence 能力将大大简化开发者业务中关于在线用户上下线、状态变更等状态的同步逻辑实现，充分利用此特性将使得你的业务实现更稳定、实时、可靠。

#### Storage

RTM 的 Storage 功能提供了一套动态数据库机制，可以让开发者动态设置、存储、更新、删除 Channel Metadata 和 User Metadata 等数据，并监听由 Channel Metadata 或 User Metadata 变更而产生的事件通知。

##### Channel Metadata

- `setChannelMetadata()`：为指定频道设置 Channel Metadata 或 Channel Metadata Item。
- `getChannelMetadata()`：获取指定频道的 Channel Metadata 和 Channel Metadata Item。
- `removeChannelMetadata()`：删除指定频道的 Channel Metadata 或 Channel Metadata Item。
- `updateChannelMetadata()`：更新指定频道已有 Channel Metadata 或 Channel Metadata Item。

Channel Metadata 的设置、删除和更新都会触发 `storage` 事件通知，合理使用此特性可以极大的优化业务逻辑，获得优异的用户体验。当前 `storage` 事件通知中携带的是当前 Channel Metadata 的全量信息，我们将在后续版本中优化，提供性能更优的增量更新能力。

Channel Metadata 同时也引入了 Lock 的控制能力，当调用 API 设置、删除、更新 Channel Metadata 时，如果参数中的 `lockName` 被设置，则开启 Lock 的校验，此时只有拥有此锁的用户才被允许成功调用对应的方法。

##### User Metadata

- `setUserMetadata()`：设置指定用户的 User Metadata 或 User Metadata Item。
- `getUserMetadata()`：获取指定用户的 User Metadata 和 User Metadata Item。
- `removeUserMetadata()`：删除指定用户的 User Metadata 或 User Metadata Item。
- `updateUserMetadata()`：更新指定用户已存在的 User Metadata 或 User Metadata Item。
- `subscribeUserMetadata()`：订阅指定用户的 User Metadata 或 User Metadata Item 变更事件通知。
- `unsubscribeUserMetadata()`：取消订阅指定用户的 User Metadata 或 User Metadata Item 事件通知。

User Metadata 的设置、删除和更新都会触发 `storage` 事件通知，所有订阅此 User Metadata 的其他用户将会收到事件通知，合理使用此特性可以极大的优化业务逻辑，获得优异的用户体验。当前 `storage` 事件通知中携带的是所订阅 User Metadata 的全量信息，我们将在后续的版本中优化，提供性能更优的增量更新能力。

##### CAS 控制

Channel Metadata 和 User Metadata 都引进了版本控制逻辑 CAS（Compare And Set），该方法提供两种独立的版本控制字段，你可以根据实际业务场景设置任意一种或多种：

- 通过 `majorRevision` 参数开启整组 Metadata 的版本号校验。
- 通过 `MetadataItem` 类的 `revision` 参数开启每个 Metadata Item 数组的版本号校验。

设置、删除、更新 Channel Metadata 或 User Metadata 时，配合 `revision` 参数可以控制本次调用是否开启 Revision 校验，逻辑如下：

- `majorRevision` 或  `revision` 为 `-1` 时，本次调用不开启 CAS 验证。如果 Metadata 或 Metadata Item 已存在，则该 Metadata 或 Metadata Item 会被最新值覆盖；如果 Metadata 或 Metadata Item 不存在，则会创建对应的 Metadata 或 Metadata Item。
- `majorRevision` 或  `revision` 为正整数时，本次调用开启 CAS 验证。如果 Metadata 或 Metadata Item 已存在，则 SDK 会在版本号验证成功后更新对应的值；如果 Metadata 或 Metadata Item 不存在，则 SDK 会返回错误码。

#### Lock

临界资源一次只能供一个进程使用，如果不同的进程之间共享了某个临界资源，则各进程需要采取互斥的方式来防止彼此干扰。RTM 提供一整套 Lock 的方案，通过控制分布式系统的不同进程，你可以解决用户在访问共享资源时的竞争问题。Lock 为你提供了以下能力：

- `setLock()`：为指定频道设置锁。
- `acquireLock()`：获取指定频道中指定的锁。
- `releaseLock()`： 释放指定频道中指定的锁。
- `revokeLock()`： 撤销指定频道中某个用户对此锁的占用权限以释放此锁。
- `getLock()`： 获取指定频道中所有锁的详情。
- `removeLock()`：删除指定频道中指定的锁。

频道中锁的设置、获取、释放、撤销和删除操作都会上报对应的 `lock` 事件通知。你可以充分利用此特性优化业务的实现逻辑。
