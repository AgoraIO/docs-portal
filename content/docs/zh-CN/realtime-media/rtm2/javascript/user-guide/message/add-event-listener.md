---
title: 添加事件监听
description: 添加事件监听，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

如需收到消息和事件通知，你需要先实现事件监听程序，然后订阅或者加入你想要接收消息或事件通知的频道。

## 添加事件监听

RTM 采用统一入口的方式处理消息和事件通知，每一种消息和事件通知都有对应的事件处理程序入口，你可以在其中实现自己的业务处理逻辑：

```javascript
// Handle message event
rtm.addEventListener("message", event => {
    const channelType = event.channelType;      // The channel type need to be "STREAM", "MESSAGE" or "USER".
    const channelName = event.channelName;      // The name of the channel that this message comes from.
    const topic = event.topicName;              // (Stream channel only) The name of the topic that this message comes from.
    const messageType = event.messageType;      // The message type need to be "STRING" or "BINARY".
    const customType = event.customType;        // User defined type.
    const publisher = event.publisher;          // Message publisher.
    const message = event.message;              // Message payload.
    const timestamp = event.timestamp;          // Event timestamp
});
// Handle presence event
rtm.addEventListener("presence", event => {
    const action = event.eventType;             // Which action it is ,should be one of 'SNAPSHOT'、'INTERVAL'、'JOIN'、'LEAVE'、'TIMEOUT、'STATE_CHANGED'、'OUT_OF_SERVICE'.
    const channelType = event.channelType;      // Which channel type it is, Should be "STREAM", "MESSAGE" or "USER".
    const channelName = event.channelName;      // Which channel does this event come from
    const publisher = event.publisher;          // Who trigger this event
    const states = event.stateChanged;          // User state payload, only for stateChanged event
    const interval = event.interval;            // Interval payload, only for interval event
    const snapshot = event.snapshot;            // Snapshot payload, only for snapshot event
    const timestamp = event.timestamp;          // Event timestamp
});
// Handle topic event
rtm.addEventListener("topic", event => {
    const action = event.evenType;              // Which action it is ,should be one of 'SNAPSHOT'、'JOIN'、'LEAVE'.
    const channelName = event.channelName;      // Which channel does this event come from
    const publisher = event.userId;             // Who trigger this event
    const topicInfos = event.topicInfos;        // Topic information payload
    const totalTopics = event.totalTopics;      // How many topics
    const timestamp = event.timestamp;          // Event timestamp
});
// Handle storage event
rtm.addEventListener("storage", event => {
    const channelType = event.channelType;      // Which channel type it is, Should be "STREAM", "MESSAGE" or "USER".
    const channelName = event.channelName;      // Which channel does this event come from
    const publisher = event.publisher;          // Who trigger this event
    const storageType = event.storageType;      // Which category the event is, should be 'USER'、'CHANNEL'
    const action = event.eventType;             // Which action it is ,should be one of "SNAPSHOT"、"SET"、"REMOVE"、"UPDATE" or "NONE"
    const data = event.data;                    // 'USER_METADATA' or 'CHANNEL_METADATA' payload
    const timestamp = event.timestamp;          // Event timestamp
});
// Handle lock event
rtm.addEventListener("lock", event => {
    const channelType = event.channelType;      // Which channel type it is, Should be "STREAM", "MESSAGE" or "USER".
    const channelName = event.channelName;      // Which channel does this event come from
    const publisher = event.publisher;          // Who trigger this event
    const action = event.evenType;              // Which action it is ,should be one of 'SET'、'REMOVED'、'ACQUIRED'、'RELEASED'、'EXPIRED'、'SNAPSHOT'
    const lockName = event.lockName;            // Which lock it effect
    const ttl = event.ttl;                      // The ttl of this lock
    const snapshot = event.snapshot;            // Snapshot payload
    const owner = event.owner;                  // The owner of this lock
    const timestamp = event.timestamp;          // Event timestamp
});
// Handle connection state change event
rtm.addEventListener("status", event => {
    const currentState = event.state;                // Which connection state right now
    const changeReason = event.reason;                // Why trigger this event
    const timestamp = event.timestamp;          // Event timestamp
});
// Handle link state change event
rtm.addEventListener('linkState', event => {
    const currentState = event.currentState;
    const previousState = event.previousState;
    const serviceType = event.serviceType;
    const operation = event.operation;
    const reason = event.reason;
    const affectedChannels = event.affectedChannels;
    const timestamp = event.timestamp;
    const isResumed = event.isResumed;
});
// Handle token privilege will expire event
rtm.addEventListener("tokenPrivilegeWillExpire", (channelName) => {
    const channelName = channelName;            // Which Channel Token Will Expire
});
```

## 删除事件监听

为避免内存泄漏、错误和异常（即空指针异常）引起的性能下降，声网建议你在不需要使用某个事件处理程序时对其进行注销。如需注销事件监听程序，则需在添加事件监听时避免采用匿名函数的方式，以下是添加和注销事件监听程序的示例代码。

```javascript showLineNumbers
const messageReceived = (event) => {
    const channelType = event.channelType;      // Which channel type it is, Should be "STREAM", "MESSAGE" or "USER".
    const channelName = event.channelName;      // Which channel does this message come from
    const topic = event.topicName;              // Which Topic does this message come from, it is valid when the channelType is "STREAM".
    const messageType = event.messageType;      // Which message type it is, Should be "STRING" or "BINARY" .
    const customType = event.customType;        // User defined type
    const publisher = event.publisher;          // Message publisher
    const message = event.message;              // Message payload
    const timestamp = event.timestamp;          // Event timestamp
    // Your business processing logic program
};
// Add Event Listener
rtm.addEventListener("message", messageReceived);
// Remove Event Listener
rtm.removeEventListener("message", messageReceived);
```

## 事件通知类型

RTM 一共有 7 种类型事件，对应的有 7 种事件监听程序。你可以查看 API 参考的<a href=>事件监听</a >章节，了解每个事件监听程序传入参数的详细信息。

| 事件监听程序                                                     | 描述                                                                                                                                                                                                             |
| ------- | ----------------- |
| `message`    | 接收所有订阅的 Message Channel 中的消息通知或你加入的所有 Stream Channel 中订阅的 Topic 消息通知。事件负载数据中包含频道名称、频道类型、Topic 名称、事件发送者、消息负载数据类型等信息。                         |
| `presence`   | 接收所有订阅的 Message Channel 或者你加入的所有 Stream Channel 中远端用户的在线状态事件通知。事件负载数据中包含频道名称、频道类型、事件类型、事件发送者、用户临时状态数据等信息。                                |
| `topic`      | 接收加入的所有 Stream Channel 中 Topic 变更事件通知。事件负载数据中包含频道名称、事件类型、Topic 名称、事件发送者（即 Topic 详情）等信息。                                                                       |
| `storage`    | 接收订阅的 Message Channel 及加入的 Stream Channel 中所有的 Channel Metadata 事件通知，以及所有订阅用户的 User Metadata 事件通知。事件负载数据中包含频道名称、频道类型、事件类型（即具体 Metadata 数据）等信息。 |
| `lock`       | 接收订阅的 Message Channel 及加入的 Stream Channel 中所有的 Lock 事件通知。事件负载数据中包含有频道名称、频道类型、事件类型、锁详情等信息。                                                                      |
| `linkState`  | 接收客户端网络连接状态变更的事件通知，包含变更前后的连接状态、服务类型、导致变更的操作类型、变更原因、频道列表等信息。                                                                                           |
| `tokenPrivilegeWillExpire` | 接收客户端 Token 将要过期的事件通知。                                                                                                                                                                            |

完成事件监听处理程序后，你可以通过订阅频道或 Topic 来接收指定的 Message Channel 或 Stream Channel 中的消息和事件通知了。详见[订阅 Message Channel](../channel/message-channel#订阅频道) 和[订阅 Topic](../topic/usage#订阅-topic)。
