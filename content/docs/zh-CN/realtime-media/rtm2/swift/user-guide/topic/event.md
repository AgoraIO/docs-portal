---
title: 事件通知
description: 事件通知，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

当频道中的用户加入或离开 Topic 时，RTM 会触发 `didReceiveTopicEvent` 事件通知。频道中的用户会实时收到此事件通知，并通过此事件通知来跟踪频道中 Topic 状态的变化。

> **信息**
> Topic 事件通知仅对 Stream 类型频道有效。

当用户第一次加入频道时，SDK 会投递 `snapshot` 类型的 Topic 事件通知给到当前用户，你可以通过该事件通知获得当前频道中 Topic 的历史状态信息。

## Topic 事件类型

Topic 事件通知有以下三种类型：

| 事件通知                                                     | 描述                                                                                                          |
| ------ | --------- |
| `snapshot`  | 本地用户首次加入 Stream 类型频道时触发，通知用户该频道中所有 Topic 的详情。 |
| `remoteJoinTopic`  | 远端用户加入 Topic 并注册成为该 Topic 的发布者时触发。                                                        |
| `remoteLeaveTopic` | 远端用户离开 Topic 并取消注册该 Topic 的发布者时触发。                                                        |

## 添加事件监听

事件监听及处理程序的设置在[事件监听](../message/add-event-listener)中有过简单的介绍。接收 Topic 事件通知（`didReceiveTopicEvent`）的前提是你需要为其添加事件处理程序。成功添加 Topic 事件处理程序后，你会收到你加入的所有 Stream Channel 中所有 Topic 的事件通知。`didReceiveTopicEvent` 中包含以下数据：

| 属性        |     描述 |
|---| ---- |
| `type`            |   Topic 事件类型。详见 <a href=>`AgoraRtmTopicEventType`</a>。  |
| `channelName`            |   事件发生的频道名称。   |
| `publisher`              |   触发此事件的用户 ID。   |
| `topicInfos`            |  Topic 的详细信息数组，包含 Topic 名称、Topic 发布者等信息。   |
| `timestamp` |  事件发生的时间戳。                |
