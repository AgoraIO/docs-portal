---
title: 发版说明
description: 发版说明，用于说明 RTM 在该平台上的产品概览、版本变化或接入边界。
---

本文提供 RTM v2 SDK 的发版说明。

该版本于 2025 年 11 月 18 日发布。

### 改进

#### 新增重连超时配置

该版本在 [`RtmConfig`](https://doc.shengwang.cn/api-ref/rtm2/flutter/toc-configuration/configuration#rtmconfig) 中增加 `reconnectTimeout` 字段。你可以通过该字段配置 SDK 在登录或断线重连时，返回超时错误的时间，单位为秒。当登录或重连超过设置的时间，SDK 会通过回调报告当前的连接状态和原因。

该版本于 2025 年 9 月 16 日发布。

### 升级必看

#### Snapshot 状态触发时机变更

该版本修订了 Presence 事件中 `Snapshot` 事件的触发时机。现在，只要用户在频道内，就可能会再次收到 `Snapshot` 事件；收到后，用户可以更新自己的全量信息，来避免因异常导致的状态不同步问题。

#### 锁过期时间计算规则变更

该版本修改了锁（Lock）过期时间的计算规则。该版本起，锁的过期时间将从服务端判定用户离线开始计算。

### 新特性

#### 支持历史消息

该版本在 `PublishOptions` 中新增了 `storeInHistory` 属性，支持在频道中发送消息的同时，将消息存储到云端，后续用户可以通过历史消息接口 [`getMessages`](https://doc.shengwang.cn/api-ref/rtm2/flutter/toc-message/message#getmessages) 获取。详细的使用指南可以参考[历史消息](../user-guide/message/history-message)。

> **信息**
> 该功能目前处于 Public Beta 阶段。如需使用，需要前往[控制台](https://console.shengwang.cn/product/RTM2?tab=config)开启。

#### SDK 连接状态变化原因

该版本在 SDK 连接状态 `LinkStateEvent` 中添加 [`RtmLinkStateChangeReason`](https://doc.shengwang.cn/api-ref/rtm2/flutter/enumv#linkstatechangereason) 枚举类，报告连接状态变更的原因。

#### 支持 IoT 设备域名白名单

在 IoT 场景下，设备可能受限于互联网服务提供商 (ISP)。为解决这一限制，该版本在 [`RtmConfig`](https://doc.shengwang.cn/api-ref/rtm2/flutter/toc-configuration/configuration#rtmconfig) 中增加 `ispPolicyEnabled` 字段。通过将该字段设为 `true`，SDK 会仅连接到已向运营商报备的域名或 IP 白名单中的服务器。

#### 支持 16 KB 内存页大小（Android）

自 Android 15 起，系统新增了对 16 KB 内存页大小的支持，详见[支持 16 KB 的页面大小](https://developer.android.com/guide/practices/page-sizes?hl=zh-cn)。为了保证 App 的稳定性和性能表现，自该版本起，SDK 支持 16 KB 内存页大小，确保可以在使用 4 KB 和 16 KB 内存页大小的设备上无缝运行，提升兼容性并避免崩溃。

### 改进

#### 新增更新 Token 超时错误码

为反馈更新 Token 操作的结果，该版本新增错误码 `channelNotJoined` (-10026)。

#### Presence 事件通知优化

当频道数据无法正常同步时，SDK 会重新触发一次 `Snapshot` 事件。收到该事件后，用户可以更新自己 App 的本地缓存。

#### 其它改进

- 进一步优化了登录服务的时长。
- 加快了切后台或休眠后，RTM 服务恢复重连的速度。
- 优化了 SDK 在弱网情况下的表现。
- 优化了接入节点的选择，提升了服务的连接速度。
- 提升了基础消息服务在服务异常时的业务表现，避免因部分服务出现异常，导致的消息服务不可用的问题。

### 问题修复

- 某些场景下，Token 过期的通知可能被多次触发。
- 某些场景下，点对点消息已送达对端，但发送端却反馈超时。
- 某些场景下，iOS 系统在退出 App 时，可能引起 RTM SDK 崩溃的问题。
- 私有化场景下，频繁切换网络可能造成连接状态异常。
- 回调函数中，如果业务代码存在未捕获的异常，可能引起 SDK 崩溃的问题。
- 订阅 Topic 时，可能返回未加入频道的问题。
- 重连时偶现订阅服务未恢复。
- 部分频道内用户查询结果时，可能包含异常离线用户的信息。
- 某些场景下，Token 类型不正确导致异常错误。
- 某些场景下，用户可能多次收到相同离线用户的离线通知。
- 相同用户 ID 在不同端登录后，可能出现连接状态异常。
- 频繁设置 Presence 状态时，可能导致数据异常。
- 未开通指定服务时，加入频道时未返回错误。
- 某些场景下，异常属性值可能导致崩溃问题。

该版本于 2024 年 10 月 30 日发布。

### 问题修复

该版本修复了如下问题：

- 发送消息时，消息缺失了部分字节。
- 在同时使用 RTC SDK 和 RTM SDK 时，销毁 RTC 实例后，RTM 的事件监听失效。

该版本于 2024 年 9 月 13 日发布。这是 RTM v2 Flutter SDK 的第一个版本。

本次发布意味着声网实时通讯（RTM）产品步入 v2 时代，我们在功能覆盖、性能提升、体验优化上都将为用户带来革新。

- 功能覆盖：该版本通过引入频道（Channel）、消息（Message）、Topic、Presence、Storage 和 Lock 等功能模块，能覆盖更多业务场景，你可以把更多的精力集中在自己的业务创新上。

- 性能提升：我们在新版本中重构了后台架构，通过优化网络连接进一步提升性能，提供长时间低延迟、高可靠、大并发、易扩展的实时网络接入能力，让你无需为业务质量担忧。

- 体验优化：我们重新设计并简化了 API 接口；优化了包括用户指南、API 参考在内的所有文档，提供了更全面的示例程序，支持开发者低成本学习使用 SDK，快速完成集成，提高开发效率。

### 新特性

该版本提供的核心功能模块如下。

#### 初始配置（Setup）

初始配置（Setup）是初始化生产 RTM Client 时预先定义或配置一些关键参数，影响其后续的行为。同时它还提供了登录、登出等功能。核心能力如下：

- `Future<(RtmStatus, RtmClient)> RTM(...)`：创建一个 RTM Client 实例，并进行如下初始配置：
  - `appId`：设置 App ID。相同 App ID 的 App 间可以通信，不同 App ID 的 App 相互隔离。
  - `userId`：设置用户 ID，用以区分用户或设备。
  - `areaCode`：设置区域代码，用于 Geo-fencing 功能。
  - `protocolType`：设置消息传输协议类型。
  - `presenceTimeout`：设置 Presence 服务的超时时间。
  - `heartbeatInterval`：设置 SDK 心跳间隔时间。
  - `useStringUserId`：设置用户 ID 的数据类型，可以是 String 类型，也可以是 Int 类型。
  - `logConfig`：配置本地日志大小、位置、输出信息等级等参数。
  - `proxyConfig`：配置 Proxy 服务参数。
  - `encryptionConfig`：配置端侧加密参数。
  - `privateConfig`：配置私有化部署参数。
- 事件监听：实现 `message`、`presence`、`topic`、`storage`、`lock`、`linkState`、`token` 等事件通知的业务逻辑。
- `login`：登录 RTM 服务。
- `logout`：登出 RTM 服务。
- `release`：销毁 RTM Client 实例，释放资源。

#### 频道（Channel）

频道是 RTM 实时网络中一种数据传输的管理机制，任何订阅或加入频道的用户都可以在 100 毫秒内接收到频道中传输的消息和事件，RTM 允许客户端订阅数百甚至数千个频道。大多数 RTM API 都将以频道为基础进行发送、接收、加密等行为。

基于声网的能力，RTM 的频道分成三种类型：Message Channel、User Channel 和 Stream Channel。三种类型频道的核心能力如下：

- Message Channel：
    - `subscribe`：订阅指定 Message Channel 并开始接收频道中的消息和事件通知。
    - `unsubscribe`：取消订阅指定 Message Channel 并停止接收频道中的消息和事件通知。

- User Channel：用户无需订阅频道操作，可以直接指定用户 ID 发送消息，接收消息也只需监听 `message` 事件。

- Stream Channel：
    - `createStreamChannel`：创建 Stream Channel 实例，随后可以调用其中的方法。
    - `join`：加入 Stream Channel，并开始接收频道中的消息和事件通知。
    - `leave`：离开 Stream Channel，并停止接收频道中的消息和事件通知。
    - `release`：销毁 Stream Channel 实例以释放资源。

其中：
- `subscribe`、`unsubscribe`、`join`、`leave` 方法都会触发 `presence` 事件通知。频道中的其他用户会收到对应的 `Join`、`Leave` 事件通知。
- 调用 `subscribe` 和 `join` 操作订阅或加入频道的时候，可以选择是否配置 `withMessage`、`withPresence`、`withMetadata`、`withLock` 等参数以开启对应事件通知的监听功能。如果开启，你同时也需要注册对应事件监听，才能顺利收到对应事件通知。

#### 消息（Message）

RTM 的基础是发送消息的能力，你可以随时随地向频道中发送消息，消息会在 100 毫秒内传递到任何地方。RTM 支持 String 类型和 Binary 类型的消息负载。

`publish` 向指定的 Message Channel 或 User Channel 中发送消息。调用 `publish` 会触发 `message` 事件通知，如果想要收到频道中的消息，你需要在 `subscribe` 的时候，设置 `withMessage = true`，注册并实现 `message` 事件。

#### Topic

Topic 是 Stream Channel 中的数据流管理机制。你可以在 Stream Channel 中利用此特性进行数据流的订阅、分发、事件通知等，灵活使用 Topic 能力，能大大降低业务复杂度，提升开发效率。Topic 的主要功能如下：

- `joinTopic`：注册成为此 Topic 的消息发布者（publisher）。注册后，该用户会具备发送消息的能力。
- `publishTextMessage`：向 Stream Channel 中的 Topic 发送消息。
- `leaveTopic`： 取消注册为该 Topic 的消息发布者。
- `subscribeTopic`：订阅该频道中 Topic 的一名或多名消息发布者。
- `unsubscribeTopic`：取消订阅该 Topic 或取消订阅该 Topic 中指定的一名或多名消息发布者。

注册（`joinTopic`）或取消注册（`leaveTopic`）消息发布者操作，会触发 `topic` 事件通知，频道中的其他用户将会收到此事件通知。

> **信息**
> Topic 特性只在 Stream Channel 中有效，Message Channel 或 User Channel 中不存在此特性。

#### Presence

Presence 提供监控用户在线状态及临时状态变化的能力。通过 Presence 功能，你可以实时获取以下信息：

- 用户加入或离开频道的实时状态
- 订阅或加入同一频道的所有用户的实时状态
- 一个用户订阅或加入的所有频道的实时信息
- 自定义临时用户状态及其变更信息

在所有频道类型中均可使用以下 Presence 功能：

- `whoNow`：实时获取指定频道的在线用户数量、在线用户列表、在线用户的临时状态等信息。
- `whereNow`：实时获取指定用户所在频道的列表。
- `setState`：设置用户在指定频道的临时状态。
- `getState`：获取用户在指定频道的临时状态。
- `removeState`：删除用户在特定频道的临时状态。

Presence 在提供上述功能的同时，也提供了 `presence` 事件通知能力。频道中用户的加入、离开、掉线、用户状态设置、用户状态删除等事件都会以实时通知（Announce Mode）或定时通知（Interval Mode）的方式通知到频道中的其他用户。Presence 能力将大大简化开发者业务中关于在线用户上下线、状态变更等状态的同步逻辑实现，充分利用此特性将使得你的业务实现更稳定、实时、可靠。

#### Storage

RTM 的 Storage 功能提供了一套动态数据库机制，可以让开发者动态设置、存储、更新、删除 Channel Metadata 和 User Metadata 等数据，并监听由 Channel Metadata 或 User Metadata 变更而产生的事件通知。

##### Channel Metadata

- `setChannelMetadata`：为指定频道设置 Channel Metadata 或 Channel Metadata Item。
- `getChannelMetadata`：获取指定频道的 Channel Metadata 和 Channel Metadata Item。
- `removeChannelMetadata`：删除指定频道的 Channel Metadata 或 Channel Metadata Item。
- `updateChannelMetadata`：更新指定频道已有 Channel Metadata 或 Channel Metadata Item。

Channel Metadata 的设置、删除和更新都会触发 `storage` 事件通知，合理使用此特性可以极大的优化业务逻辑，获得优异的用户体验。当前 `storage` 事件通知中携带的是当前 Channel Metadata 的全量信息，我们将在后续版本中优化，提供性能更优的增量更新能力。

Channel Metadata 同时也引入了 Lock 的控制能力，当调用 API 设置、删除、更新 Channel Metadata 时，如果参数中的 `lockName` 被设置，则开启 Lock 的校验，此时只有拥有此锁的用户才被允许成功调用对应的方法。

##### User Metadata

- `setUserMetadata`：设置指定用户的 User Metadata 或 User Metadata Item。
- `getUserMetadata`：获取指定用户的 User Metadata 和 User Metadata Item。
- `removeUserMetadata`：删除指定用户的 User Metadata 或 User Metadata Item。
- `updateUserMetadata`：更新指定用户已存在的 User Metadata 或 User Metadata Item。
- `subscribeUserMetadata`：订阅指定用户的 User Metadata 或 User Metadata Item 变更事件通知。
- `unsubscribeUserMetadata`：取消订阅指定用户的 User Metadata 或 User Metadata Item 事件通知。

User Metadata 的设置、删除和更新都会触发 `storage` 事件通知，所有订阅此 User Metadata 的其他用户将会收到事件通知，合理使用此特性可以极大的优化业务逻辑，获得优异的用户体验。当前 `storage` 事件通知中携带的是所订阅 User Metadata 的全量信息，我们将在后续的版本中优化，提供性能更优的增量更新能力。

##### CAS 控制

Channel Metadata 和 User Metadata 都引进了版本控制逻辑 CAS（Compare And Set），该方法提供两种独立的版本控制字段，你可以根据实际业务场景设置任意一种或多种：

- 通过 `majorRevision` 参数开启整组 Metadata 的版本号校验。
- 通过 `` 中 `MetadataItem` 类的 `revision` 参数开启每个 Metadata Item 数组的版本号校验。

设置、删除、更新 Channel Metadata 或 User Metadata 时，配合 `revision` 参数可以控制本次调用是否开启 Revision 校验，逻辑如下：

- `majorRevision` 或  `revision` 为 `-1` 时，本次调用不开启 CAS 验证。如果 Metadata 或 Metadata Item 已存在，则该 Metadata 或 Metadata Item 会被最新值覆盖；如果 Metadata 或 Metadata Item 不存在，则会创建对应的 Metadata 或 Metadata Item。
- `majorRevision` 或  `revision` 为 int 正整数时，本次调用开启 CAS 验证。如果 Metadata 或 Metadata Item 已存在，则 SDK 会在版本号验证成功后更新对应的值；如果 Metadata 或 Metadata Item 不存在，则 SDK 会返回错误码。

#### Lock

临界资源一次只能供一个进程使用，如果不同的进程之间共享了某个临界资源，则各进程需要采取互斥的方式来防止彼此干扰。RTM 提供一整套 Lock 的方案，通过控制分布式系统的不同进程，你可以解决用户在访问共享资源时的竞争问题。Lock 为你提供了以下能力：

- `setLock`：为指定频道设置锁。
- `acquireLock`：获取指定频道中指定的锁。
- `releaseLock`： 释放指定频道中指定的锁。
- `revokeLock`： 撤销指定频道中某个用户对此锁的占用权限以释放此锁。
- `getLocks`： 获取指定频道中所有锁的详情。
- `removeLock`：删除指定频道中指定的锁。

频道中锁的设置、获取、释放、撤销和删除操作都会上报对应的 `lock` 事件通知。你可以充分利用此特性优化业务的实现逻辑。
