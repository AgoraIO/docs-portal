---
title: 添加事件监听
description: 添加事件监听，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

如需收到消息和事件通知，你需要先实现事件监听程序，然后订阅或者加入你想要接收消息或事件通知的频道。

## 添加事件监听

RTM 采用统一入口的方式处理消息和事件通知，每一种消息和事件通知都有对应的事件处理程序入口，你可以在其中实现自己的业务处理逻辑：

```typescript

  MessageEvent,
  PresenceEvent,
  TopicEvent,
  StorageEvent,
  LockEvent,
  LinkStateEvent,
  TokenEvent
} from '@shengwang/rtm-full';

// Handle message event
rtmClient.addEventListener('message', (event: object) => {
  const msgEvent = event as MessageEvent;
  const channelType = msgEvent.channelType;      // The channel type: MESSAGE or STREAM
  const channelName = msgEvent.channelName;      // The name of the channel
  const topic = msgEvent.channelTopic;           // (Stream channel only) The topic name
  const messageType = msgEvent.messageType;      // The message type: STRING or BINARY
  const customType = msgEvent.customType;        // User defined type
  const publisher = msgEvent.publisher;          // Message publisher
  const message = msgEvent.message;              // Message payload (string or Uint8Array)
  const timestamp = msgEvent.timestamp;          // Event timestamp
  // Your business logic
});

// Handle presence event
rtmClient.addEventListener('presence', (event: object) => {
  const presenceEvent = event as PresenceEvent;
  const eventType = presenceEvent.eventType;          // Event type: SNAPSHOT, INTERVAL, JOIN, LEAVE, etc.
  const channelType = presenceEvent.channelType;      // Channel type: MESSAGE or STREAM
  const channelName = presenceEvent.channelName;      // Channel name
  const publisher = presenceEvent.publisher;          // Who triggered this event
  const stateChanged = presenceEvent.stateChanged;    // Changed state items
  const interval = presenceEvent.interval;            // Interval info (only for INTERVAL type)
  const snapshot = presenceEvent.snapshot;            // Snapshot info (only for SNAPSHOT type)
  const timestamp = presenceEvent.timestamp;          // Event timestamp
  // Your business logic
});

// Handle topic event
rtmClient.addEventListener('topic', (event: object) => {
  const topicEvent = event as TopicEvent;
  const eventType = topicEvent.eventType;          // Event type: SNAPSHOT, REMOTE_JOIN, REMOTE_LEAVE
  const channelName = topicEvent.channelName;      // Channel name
  const publisher = topicEvent.publisher;          // Who triggered this event
  const topicInfos = topicEvent.topicInfos;        // Topic information array
  const timestamp = topicEvent.timestamp;          // Event timestamp
  // Your business logic
});

// Handle storage event
rtmClient.addEventListener('storage', (event: object) => {
  const storageEvent = event as StorageEvent;
  const eventType = storageEvent.eventType;          // Event type: SNAPSHOT, SET, UPDATE, REMOVE
  const storageType = storageEvent.storageType;      // Storage type: USER or CHANNEL
  const channelType = storageEvent.channelType;      // Channel type (for channel metadata)
  const target = storageEvent.target;                // Channel name or user ID
  const data = storageEvent.data;                    // Metadata
  const timestamp = storageEvent.timestamp;          // Event timestamp
  // Your business logic
});

// Handle lock event
rtmClient.addEventListener('lock', (event: object) => {
  const lockEvent = event as LockEvent;
  const eventType = lockEvent.eventType;          // Event type: SNAPSHOT, LOCK_SET, LOCK_ACQUIRED, etc.
  const channelName = lockEvent.channelName;      // Channel name
  const channelType = lockEvent.channelType;      // Channel type
  const lockDetails = lockEvent.lockDetails;      // Lock details array
  const timestamp = lockEvent.timestamp;          // Event timestamp
  // Your business logic
});

// Handle link state event
rtmClient.addEventListener('linkState', (event: object) => {
  const linkEvent = event as LinkStateEvent;
  const currentState = linkEvent.currentState;    // Current link state
  const previousState = linkEvent.previousState;  // Previous link state
  const serviceType = linkEvent.serviceType;      // Service type: MESSAGE or STREAM
  const operation = linkEvent.operation;          // Operation that triggered this event
  const reason = linkEvent.reason;                // Reason description
  const affectedChannels = linkEvent.affectedChannels;      // Affected channels
  const unrestoredChannels = linkEvent.unrestoredChannels;  // Unrestored channels
  const isResumed = linkEvent.isResumed;          // Whether connection is resumed
  const timestamp = linkEvent.timestamp;          // Event timestamp
  // Your business logic
});

// Handle token event
rtmClient.addEventListener('token', (event: object) => {
  const tokenEvent = event as TokenEvent;
  const eventType = tokenEvent.eventType;          // Token event type
  const reason = tokenEvent.reason;                // Event reason
  const affectedResources = tokenEvent.affectedResources;  // Affected resources
  const timestamp = tokenEvent.timestamp;          // Event timestamp
  // Your business logic
});
```

## 删除事件监听

为避免内存泄漏、错误和异常（即空指针异常）引起的性能下降，声网建议你在不需要使用某个事件处理程序时对其进行注销。如需注销事件监听程序，则需在添加事件监听时避免采用匿名函数的方式，以下是添加和注销事件监听程序的示例代码。

```typescript

// Define message event handler function
const onMessageReceived = (event: object) => {
  const msgEvent = event as MessageEvent;
  console.log('Received message event:', msgEvent);
  // Your business logic
};

// Add event listener
rtmClient.addEventListener('message', onMessageReceived);

// Remove event listener
rtmClient.removeEventListener('message', onMessageReceived);
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
| `token` | 接收客户端 Token 将要过期的事件通知。                                                                                                                                                                            |

完成事件监听处理程序后，你可以通过订阅频道或 Topic 来接收指定的 Message Channel 或 Stream Channel 中的消息和事件通知了。详见[订阅 Message Channel](../channel/message-channel#订阅频道) 和[订阅 Topic](../topic/usage#订阅-topic)。
