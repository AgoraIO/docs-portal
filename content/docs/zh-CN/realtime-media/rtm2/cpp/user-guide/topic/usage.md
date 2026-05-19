---
title: 使用 Topic
description: 使用 Topic，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

Topic 的相关操作主要有加入、离开、订阅和取消订阅，可以归纳为以下两种行为：

- **消息发布者行为**：加入 Topic 的目的在于注册成为该 Topic 的消息发布者，从而让用户具备发送消息的能力。同理，离开 Topic 是为了取消对该 Topic 消息发布者的注册，从而让用户失去发送消息的能力。
- **消息订阅者行为**：订阅 Topic 的目的在于订阅 Topic 中的消息，从而让用户具备接收消息的能力。同理，取消订阅 Topic 是为了取消订阅 Topic 中的消息，从而让用户失去接收消息的能力。

上述两类行为之间相互独立，即你对某个 Topic 中消息发布者的行为并不会影响你对该 Topic 中消息订阅者的行为。

## 加入 Topic

在 Topic 中发送消息的前提条件是加入 Topic。当前 RTM 支持单个客户端在同一个频道内同时加入不超过 8 个 Topic。加入 Topic 时，你可以设置一些预定义的属性，这将影响到后续通过此 Topic 发送消息的行为，包括消息是否保序、消息优先级、是否与共频道传输的音视频数据保持同步传输等。详细设置可以参考 <a href=>API 文档</a>及[发送消息](../message/send-message)。

成功加入频道后，SDK 会触发 `RTM_TOPIC_EVENT_TYPE_REMOTE_JOIN_TOPIC` 类型的 `onTopicEvent` 事件，频道中所有开启 Topic 事件监听的用户都会收到此事件通知。

示例代码如下：

```cpp
JoinTopicOptions options;
uint64_t requestId;
streamChannel->joinTopic("topicName", options, requestId);
```

调用该方法后，SDK 会触发 `onJoinTopicResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onJoinTopicResult(const uint64_t requestId, const char *channelName, const char *userId, const char *topic, const char *meta, RTM_ERROR_CODE errorCode) override {
        if (errorCode != RTM_ERROR_OK) {
            printf("JoinTopic failed error is %d reason is %s\n", errorCode, getErrorReason(errorCode));
        } else {
            printf("JoinTopic success\n");
        }
    }
};
```

## 离开 Topic

当你不再需要向某个 Topic 发送消息，或者同时加入的 Topic 超出数量限制时，你可以离开某个 Topic 以释放资源。成功离开 Topic 后，SDK 会触发 `RTM_TOPIC_EVENT_TYPE_REMOTE_LEAVE_TOPIC` 类型的 `onTopicEvent` 事件，频道中所有开启 Topic 事件监听的用户都会收到此事件通知。

示例代码如下：

```cpp
uint64_t requestId;
streamChannel->leaveTopic("topicName", requestId);
```

调用该方法后，SDK 会触发 `onLeaveTopicResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onLeaveTopicResult(const uint64_t requestId, const char *channelName, const char *userId, const char *topic, const char *meta, RTM_ERROR_CODE errorCode) override
    {
        if (errorCode != RTM_ERROR_OK) {
            printf("LeaveTopic failed error is %d reason is %s\n", errorCode, getErrorReason(errorCode));
        } else {
            printf("LeaveTopic success\n");
        }
    }
};
```

## 订阅 Topic

加入 Topic 并不代表你能接收到该 Topic 中传输的消息，你需要订阅此 Topic 并指定消息发布者才能实现消息的接收。在单个频道中，你可以同时订阅不超过 50 个 Topic，每个 Topic 中你可以同时订阅不超过 64 个消息发布者。该限制主要是为了平衡端侧带宽和性能。

订阅 Topic 中消息发布者需要填写消息发布者列表（`users`）参数。假设第一次订阅消息发布者列表为 `[UserA,UserB]`，第二次订阅消息发布者列表为 `[UserB,UserC]`，则最后成功订阅的结果是 `[UserA,UserB,UserC]`。

如果你在订阅 Topic 时，不填写消息发布者列表，则默认随机订阅不超过 64 个用户：

- 如果 Topic 中的用户不超过 64 人则全部订阅。
- 如果 Topic 中的用户超过 64 人则随机订阅 64 人。

示例代码如下：

```cpp
std::vector<const char*> users;
users.push_back("UserA");
users.push_back("UserB");

TopicOptions options;
options.users = users.data();
options.userCount = users.size();

uint64_t requestId;
streamChannel->subscribeTopic("topicName", options, requestId);
```

调用该方法后，SDK 会触发 `onSubscribeTopicResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onSubscribeTopicResult(const uint64_t requestId, const char *channelName, const char *userId, const char *topic, UserList succeedUsers, UserList failedUsers, RTM_ERROR_CODE errorCode) override {
        if (errorCode != RTM_ERROR_OK) {
            printf("SubscribeTopic failed error is %d reason is %s\n", errorCode, getErrorReason(errorCode));
        } else {
            printf("SubscribeTopic success\n");
        }
    }
};
```

## 取消订阅

当你对 Topic 中某个消息发布者不再感兴趣，或者对整个 Topic 不再关注，你可以通过取消订阅停止接收相关消息。如果你在取消订阅 Topic 时不填写消息发布者列表，则默认取消对整个 Topic 的订阅。

示例代码如下：

```cpp
std::vector<const char*> users;
users.push_back("UserA");
users.push_back("UserB");
TopicOptions options;
options.users = users.data();
options.userCount = users.size();

uint64_t requestId;
streamChannel->unsubscribeTopic("topicName", options, requestId);
```

调用该方法后，SDK 会触发 `onUnsubscribeTopicResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onUnsubscribeTopicResult(const uint64_t requestId, const char* channelName, const char* topic, RTM_ERROR_CODE errorCode) override {
        if (errorCode != RTM_ERROR_OK) {
            printf("UnsubscribeTopic failed error is %d reason is %s\n", errorCode, getErrorReason(errorCode));
        } else {
            printf("UnsubscribeTopic success\n");
        }
    }
};
```

```cpp
JoinTopicOptions options;
options.qos = RTM_MESSAGE_QOS_ORDERED;
options.syncWithMedia = true;

uint64_t requestId;
streamChannel->joinTopic("topicName", options, requestId);
```

根据本地用户是否发送音频视频数据，及订阅该 Topic 的远端用户是否订阅本地用户的音视频流，远端用户的同步播放会有以下几种情况：

当开启 `syncWithMedia` 后，Topic 中传输的数据因需要等待音视频流数据实现同步对齐，因而在接收端会引入一定程度的延迟。如果在接收数据的过程中，接收方突然取消音视频数据流的订阅，此时 Topic 中数据的延迟逐渐降低直到恢复实时。
