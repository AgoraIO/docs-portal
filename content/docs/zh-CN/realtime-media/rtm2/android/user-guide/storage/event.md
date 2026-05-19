---
title: 事件通知
description: 事件通知，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

## 添加事件监听

如果想要接收 Storage 事件通知，你需要实现事件监听程序，详见<a href=>事件监听</a>。除此之外，如果你想要接收 Channel Metadata 的事件通知，你需要在订阅或加入频道时将 `withMetadata` 参数设置成 `true`。如果你想要接收 User Metadata 的事件通知，你需要调用 `subscribeUserMetadata` 订阅指定用户的 User Metadata。

## 事件通知模式

当前 RTM 仅支持全量数据更新模式，即当 User Metadata 或 Channl Metadata 发生变更后，返回的事件通知中的 `data` 字段包含用户或频道的全部属性数据。

## 事件通知类型

RTM 的 Storage 事件通知有以下四种类型：

Storage 事件的数据结构参数含义如下：

| 属性         |  类型  |   描述                                                                                                                         |
|---|----| ------ |
| `channelType`            | `RtmChannelType`    |  频道类型。详见 [`RtmChannelType`](https://doc.shengwang.cn/api-ref/rtm2/android/enumv#channeltype)。   |
| `storageType`            | `RtmStorageType`    |  Storage 类型。详见 [`RtmStorageType`](https://doc.shengwang.cn/api-ref/rtm2/android/enumv#storagetype)。  |
| `eventType`            | `RtmStorageEventType`    |  Storage 事件类型。详见 [`RtmStorageEventType`](https://doc.shengwang.cn/api-ref/rtm2/android/enumv#storageeventtype)。  |
| `target`              | String                |  用户 ID 或频道名称。   |
| `data`            | `Metadata`               |   Metadata Item。详见 [`Metadata`](https://doc.shengwang.cn/api-ref/rtm2/android/toc-storage/storage#Metadata)。   |
| `timestamp` | long | 事件发生的时间戳。                |
