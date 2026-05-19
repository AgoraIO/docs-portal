---
title: 计量规则
description: 计量规则，用于说明 RTM 在该平台上的产品概览、版本变化或接入边界。
---

当用户在使用 RTM 服务时，系统会根据你声网账号 (CID) 下所有开通该服务的项目 (VID) 的用量情况，统计一个自然月内以下三项计量指标，并形成最终账单：
- 消息总数 (Message Counts) ：一个自然月内所有开通 RTM 服务项目的消息的总数。
- 峰值连接数 (Peak Concurrent Users) ：一个自然月内所有开通 RTM 服务项目的最高并发连接数之和。
- 存储占用 (Storage Usage) ：一个自然月内所有开通 RTM 服务的项目所占用的存储空间之和，详见<a href=>数据存储</a >。

自服务套餐用户（体验套餐、Startup 套餐、Business 套餐）的消息总数、峰值连接数和存储占用三种计量指标的用量额度有限制。这些限制可能因套餐级别而异，用户需要在这些限制内使用服务。如果超出了套餐中规定的用量限制，可能会额外产生费用或者影响服务的正常使用。

企业套餐用户的消息总数、峰值连接数和存储占用三种计量指标的用量额度没有限制，系统会基于这三种计量指标在一个自然月内的实际使用情况形成账单。这种计费方式可以让用户更好地了解他们的使用情况，并根据实际需求进行调整。你可以查看<a href=>计费说明</a >了解更多信息。

## 消息数计量

RTM 消息数定义为用户通过 RTM SDK、RESTful API、Webhook 或 Serverless 服务等方式与 RTM 服务器之间产生的所有的指令与数据交互 (Transaction) 次数。同时需要注意的是，RTM 中 1 条消息以 1 KB 作为计算单位，因此，如果你发送一条 2.5 KB 的消息或指令，将会被计算为 3 条消息数。
以下是被计为消息数的指令或数据交互的范围定义：

### 常规指令

- 1 次登录 (`loginByToken`) 请求计作 1 条消息。
- 1 次登出 (`logout`) 请求计作 1 条消息。
- 1 次更新 Token  (`renewToken`)  计作 1 条消息。
- 接收到 1 条 SDK 连接状态的变更通知计作 1 条消息。
- 接收到 1 条 Token 即将过期通知计作 1 条消息。

### 频道操作

- 1 次订阅 (`subscribeWithChannel`) Message Channel 计作 1 条消息。
- 1 次取消订阅 (`unsubscribeWithChannel`) Message Channel 计作 1 条消息。
- 1 次加入 (`joinWithOption`) Stream Channel 计作 1 条消息。
- 1 次离开 (`leave`)  Stream Channel 计作 1 条消息。

### Topic 操作

- 1 次加入 (`joinTopic`) Topic 方法调用计作 1 条消息。
- 1 次离开 (`leaveTopic`) Topic 方法调用计作 1 条消息。
- 1 次订阅 (`subscribeTopic`) Topic 方法调用计作 1 条消息。
- 1 次取消订阅 (`unsubscribeTopic`) Topic 方法调用计作 1 条消息。
- 接收到 1 条 Topic 变更通知计作 1 条消息。

### 收发消息

- 向 Message Channel 中发布 (`publish`) 任何 1 条消息计作 1 条消息。
- 在 Message Channel 中收到的任何 1 条消息计作 1 条消息。例如，一个客户端向一个 Message Channel 发送 1 条消息，而该频道被 10 人订阅，则计作 1 条发送消息和 10 条接收消息，总计 11 条消息。
- 向 Stream Channel 中的 Topic 中发布 (`publishTopicMessage`) 的任何 1 条消息计作 1 条消息。
- 在 Stream Channel 中的 Topic 中收到的任何 1 条消息计作 1 条消息。例如，一个客户端向 Stream Channel 中的某个 Topic 发送 1 条消息，而此 Topic 被 10 人订阅，则计作 1 条发送消息和 10 条接收消息，总计 11 条消息。

> **信息**
> 除上述基本规则外，你还需要注意以下规则：
> - 如果客户端订阅了频道并设置了消息过滤，客户端将不会收到消息，但由于 RTM 服务器仍然会向客户端发送消息，这些消息仍然会计作消息数。
> - 使用 RESTful API 发送的消息也计作消息数。
> - 如果客户端没有订阅频道或者 Topic，则不会收到任何消息，也将不会产生消息计数。
> - 发布消息所产生的异步回调不会计作消息数。

### Presence 操作

- 1 次 `whoNow` 查询计作 1 条消息。
- 1 次 `whereNow` 查询计作 1 条消息。
- 1 次设置 (`setState`)、查询 (`getState`)、删除 (`removeState`) 任何 1 条临时用户状态，计作 1 条消息。
- 触发的每 1 条 Presence 事件通知都计作 1 条消息，例如客户端的进入频道、离开频道、超时通知、状态变更通知。
- 收到的每 1 条 Presence 事件通知都计作 1 条消息。例如，一个客户端进入频道，其余 10 个客户端订阅了该频道且监听了该频道中的 Presence 事件通知，那么这个客户端进入频道时，发送 1 条 Presence 事件通知，其余 10 个客户端共接收 10 条 Presence 事件通知，总计 11 条消息。

> **信息**
> 除上述基本规则外，你还需要注意以下规则：
> - 如果客户端加入或订阅了频道并设置了 Presence 事件通知过滤，客户端将不会收到 Presence 事件通知，但由于 RTM 服务器仍然会向客户端发送 Presence 事件通知，这些事件通知仍然会计作消息数。
> - 如果客户端不加入或不订阅频道，则不会收到该频道的 Presence 事件通知，也将不会产生消息计数。

### Storage 操作

- 设置 (`setChannelMetadata`) 任何 1 条 Channel Metadata，计作 1 条消息。
- 查询 (`getChannelMetadata`) 任何 1 条 Channel Metadata，计作 1 条消息。
- 更新 (`updateChannelMetadata`) 任何 1 条 Channel Metadata，计作 1 条消息。
- 删除 (`removeChannelMetadata`) 任何 1 条 Channel Metadata，计作 1 条消息。
- 收到任何 1 条 Channel Metadata 变更事件通知，计作 1 条消息。例如，客户端在某个频道设置 1 条 Channel Metadata，该频道被 10 人订阅，且这些用户监听了 Channel Metadata 变更通知，则视为发布了 1 条消息，并接收了 10 条消息，总计 11 条消息。
- 设置 (`setUserMetadata`) 任何 1 条 User Metadata，计作 1 条消息。
- 查询 (`getUserMetadata`) 任何 1 条 User Metadata，计作 1 条消息。
- 更新 (`updateUserMetadata`) 任何 1 条 User Metadata，计作 1 条消息。
- 删除 (`removeUserMetadata`) 任何 1 条 User Metadata，计作 1 条消息。
- 接收到 1 条 User Metadata 的变更通知计作 1 条消息。例如，客户端为某个用户设置 1 条 User Metadata，该 User Metadata 被 10 人订阅，则视为发布了 1 条消息，并接收了 10 条消息，总计 11 条消息。

> **信息**
> 除上述基本规则外，你还需要注意以下规则：
> - 如果客户端加入或订阅了频道并设置了 Storage 事件通知过滤，客户端将不会收到 Storage 事件通知，但由于 RTM 服务器仍然会向客户端发送 Storage 事件通知，这些事件通知仍然会计作消息数。
> - 如果客户端不加入或不订阅频道，则不会收到该频道的 Channel Metadata 变更通知，也不会产生消息计数。
> - 如果客户端不订阅其他用户的 User Metadata，则不会收到其他用户的 User Metadata 变更通知，也不会产生消息计数。
> - 如果用户在声网控制台中关闭了 Storage 功能模块，则不会产生 Storage 消息计数或 Storage 存储占用。

### Lock 操作

- 任意 1 次对锁的设置 (`setLock`) 操作计作 1 条消息。
- 任意 1 次对锁的获取 (`acquireLock`) 操作计作 1 条消息。
- 任意 1 次对锁的查询 (`getLocks`) 操作计作 1 条消息。
- 任意 1 次对锁的释放 (`releaseLock`) 操作计作 1 条消息。
- 任意 1 次对锁的剥夺 (`revokeLock`) 操作计作 1 条消息。
- 任意 1 次对锁的删除 (`removeLock`) 操作计作 1 条消息。
- 收到任何 1 条锁变更事件通知，计作一条消息。例如，客户端在某个频道设置 1 把锁，该频道被 10 人订阅且这些用户监听了锁变更通知，则视为发布了 1 条消息，并接收了 10 条消息，总计 11 条消息。

## 存储占用计量

RTM 的 Storage 功能模块会占用云端存储空间。RTM 以自然月为周期，每隔 1 小时采样 1 次用户实际的云端存储占用，并将其累加以计算当月的总存储占用量和账单数额。计算公式如下：

![RTM 存储占用量计算公式](/img/rtm2/rtm2billingformula.png)

## 峰值连接数计量

峰值连接数是一个自然月内任意时间点同时连接到 RTM 服务器的实时客户端的最大数量。例如，如果你有 10,000 名客户，并且在某个月最多有 500 个客户端同时连接 RTM 服务，则 PCU 的数值为 500，即你只需为 500 个峰值连接付费。一个月内连接到 RTM 的客户端或设备总数不会影响计费。
