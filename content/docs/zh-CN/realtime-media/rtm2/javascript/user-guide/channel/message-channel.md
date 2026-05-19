---
title: Message Channel
description: Message Channel，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

**Message** 频道是 RTM 提供的一种基于 Pub/Sub 模型的频道类型。在 Message 频道中，你需要订阅频道才能接收消息，但你在发布消息时无需额外的加入频道操作。RTM 允许你的 App 中同时存在成千上万个 Message 频道，但由于端侧性能和带宽的限制，单个客户端同时只能订阅有限数量的频道，详见 [API 使用限制](../setup/api-limits)。

> **信息**
> 如需接收并处理接收到的消息和事件通知，除了要订阅该频道外，你还需要完成<a href=>事件监听</a >程序的配置。

## 业务类型

业务类型是指频道中消息发送者和接收者之间的数据流向关系，而基于 Pub/Sub 模式的消息分发机制可以为配置不同的业务类型提供便利。利用 Message 频道你可以轻松地实现以下几种常用的业务类型：

- **一对一频道**：频道中只有两个用户之间相互通信，你可以使用该业务类型来构建私聊频道。常见的业务场景有一对一私聊、一对一客服支持等。

- **群组频道**：多对多的群组频道，频道中的用户群组可见。例如：工作群、家庭群等。你可以允许所有人加入频道，也可以只允许部分被邀请的人加入频道。常见的业务场景有群聊、社区聊天等。

- **广播频道**：一对多的群组频道，频道中的用户群组可见，但只允许一个人发送消息，其他用户都只能接收消息。常见的业务场景有群公告、群问卷调查等。

- **单播频道**：多对一的群组频道，允许多个用户发送消息，但只有一个用户可以接收消息，常见的业务场景有问卷调查的反馈、IoT 传感器数据上传等需要多端数据聚合的场景。

你可以结合实际场景的需要，在实现业务逻辑时选择其中的一种或多种类型。

## 订阅频道

监听了 `message` 事件通知后，你就可以调用 `subscribe` 方法订阅频道，从而接收频道中的消息和事件通知。

```javascript
const options = {
    withMessage: true,
    withPresence: true,
    beQuiet : false,
    withMetadata: true,
    withLock: true,
};
const channelName = "test_channel";
try {
    const subscribeResult = await rtmClient.subscribe(channelName, options);
} catch (status) {
    const  = status;
    console.log(`$ failed, the error code is $, due to: $.`);
}
```

默认情况下，你会收到你所订阅的所有频道的消息事件。如果你无需接收某些特定频道的消息，但仍需接收这些频道中其他类型的事件通知或其他频道的消息，你可以将 `SubscribeOptions` 参数中的 `withMessage` 字段设置为 `false`。

```javascript
const options = {
    withMessage: false,
    withPresence: true,
    withMetadata: true,
    withLock: true,
};
const channelName = "test_channel";
try {
    const subscribeResult = await rtmClient.subscribe(channelName, options);
} catch (status) {
    const  = status;
    console.log(`$ failed, ErrorCode: $, due to: $.`);
}
```

`subscribe` 方法只允许你一次订阅一个频道。如需订阅多个频道，你可以多次调用该方法。例如，当你想同时订阅频道 `chats.room1` 和频道 `chats.room2` 时，你可以参考如下示例代码：

```javascript
const options = {
    withMessage: true,
    withPresence: true,
    beQuiet : false,
    withMetadata: true,
    withLock: true,
};
const channelName1 = "chats.room1";
const channelName2 = "chats.room2";

try {
    const result1 = await rtmClient.subscribe(channelName1, options);
    // your code
} catch (status) {
    const  = status;
    console.log(`$ failed, the error code is $, due to: $.`);
}

try {
    const result2 = await rtmClient.subscribe(channelName2, options);
    // your code
} catch (status) {
    const  = status;
    console.log(`$ failed, the error code is $, due to: $.`);
}
```

RTM 支持单个客户端同时订阅 50 个 Message 频道，但考虑到客户端性能和带宽的限制，声网建议单个客户端同时订阅不超过 30 个 Message 频道。对于一些大型的或者活跃的频道，建议你根据实际情况进一步降低单个客户端同时订阅的频道数量。

## 取消订阅

如需停止接收某个频道中的所有消息和事件通知，你可以调用 `unsubscribe` 方法。

```javascript
const channelName = "chats.room1";
try {
    const result = await rtmClient.unsubscribe(channelName);
} catch (status) {
    const  = status;
    console.log(`$ failed, ErrorCode: $, due to: $.`);
}
```

该方法一次只能取消订阅一个频道。如需同时取消订阅多个频道，你需要多次调用该方法。
