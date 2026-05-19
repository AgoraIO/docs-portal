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

成功加入频道后，SDK 会触发 `REMOTE_JOIN` 类型的 `OnTopicEvent` 事件，频道中所有开启 Topic 事件监听的用户都会收到此事件通知。

示例代码如下：

```csharp
string topic = "Chat";
var options = new JoinTopicOptions();
options.qos = RTM_MESSAGE_QOS.ORDERED;

var (status,response) = await streamChannel.JoinTopicAsync(topic, options);
if (status.Error)
{
    Debug.Log(string.Format(" failed. ErrorCode: , due to ", status.Operation, status.ErrorCode, status.Reason));
}
else
{
    Debug.Log(string.Format("User  joined topic  successfully at channel ", response.UserId, response.Topic, response.ChannelName));
}
```

## 离开 Topic

当你不再需要向某个 Topic 发送消息，或者同时加入的 Topic 超出数量限制时，你可以离开某个 Topic 以释放资源。成功离开 Topic 后，SDK 会触发 `REMOTE_LEAVE` 类型的 `OnTopicEvent` 事件，频道中所有开启 Topic 事件监听的用户都会收到此事件通知。

示例代码如下：

```csharp
var (status,response) = await streamChannel.LeaveTopicAsync("Motion");
if (status.Error)
{
    Debug.Log(string.Format(" failed. ErrorCode: , due to ", status.Operation, status.ErrorCode, status.Reason));
}
else
{
    Debug.Log(string.Format("User: Leave Topic: success! at Channel:", response.UserId, response.Topic, response.ChannelName));
}
```

## 订阅 Topic

加入 Topic 并不代表你能接收到该 Topic 中传输的消息，你需要订阅此 Topic 并指定消息发布者才能实现消息的接收。在单个频道中，你可以同时订阅不超过 50 个 Topic，每个 Topic 中你可以同时订阅不超过 64 个消息发布者。该限制主要是为了平衡端侧带宽和性能。

订阅 Topic 中消息发布者需要填写消息发布者列表（`users`）参数。假设第一次订阅消息发布者列表为 `[UserA,UserB]`，第二次订阅消息发布者列表为 `[UserB,UserC]`，则最后成功订阅的结果是 `[UserA,UserB,UserC]`。

如果你在订阅 Topic 时，不填写消息发布者列表，则默认随机订阅不超过 64 个用户：

- 如果 Topic 中的用户不超过 64 人则全部订阅。
- 如果 Topic 中的用户超过 64 人则随机订阅 64 人。

示例代码如下：
```csharp
List<string> userList = new List<string>();
userList.Add("Tony");
userList.Add("Marry");

var options = new TopicOptions();
options.users = userList.ToArray();

var topicName = "Motion";

var (status,response) = await streamChannel.SubscribeTopicAsync(topicName, options);
if (result.Status.Error)
{
    Debug.Log(string.Format(" failed. ErrorCode: , due to ", status.Operation, status.ErrorCode, status.Reason));
}
else
{
    Debug.Log(string.Format("The user  successfully subscribes topic  at channel ", response.UserId, response.Topic, response.ChannelName));
}
```

## 取消订阅

当你对 Topic 中某个消息发布者不再感兴趣，或者对整个 Topic 不再关注，你可以通过取消订阅停止接收相关消息。如果你在取消订阅 Topic 时不填写消息发布者列表，则默认取消对整个 Topic 的订阅。

示例代码如下：

```csharp
List<string> userList = new List<string>();
userList.Add("Tony");
userList.Add("Marry");

var options = new TopicOptions();
topicOptions.users = userList.ToArray();

var topicName = "Motion";

var (status,response) = await streamChannel.UnsubscribeTopicAsync(topicName, options);
if (result.Status.Error)
{
    Debug.Log(string.Format(" failed. ErrorCode:, due to ", status.Operation, status.ErrorCode, status.Reason));
}
```

## 同步传输

RTC 音视频数据与 RTM 消息/指令数据同步传输功能是 RTM 重要特性之一，被广泛应用在元宇宙虚拟人音画数据同步播放、平行操控数据回传等场景。当用户在加入频道时，设置 `options` 参数中 `syncWithMedia` 字段为 `true` 后，SDK 将自动为该用户的的数据通道（Stream Channel 中的 Topic ）与同名共频道的音视频媒体流（RTC）实现数据的同步传输和端侧的同步播放能力，大大简化业务逻辑。

> **信息**
> 只有融合版 SDK 才支持同步传输特性，且该特性仅对 Stream 类型频道有效。

示例代码如下：

```csharp
string topic = "facialExpression";
var options = new JoinTopicOptions();
options.qos = RTM_MESSAGE_QOS.ORDERED;
options.syncWithMedia = true;

var (status,response) = await streamChannel.JoinTopicAsync(topic, options);
if (status.Error)
{
    Debug.Log(string.Format(" failed. ErrorCode: , due to ", status.Operation,status.ErrorCode, status.Reason));
}
else
{
    Debug.Log(string.Format("User  joined topic  successfully at channel ", response.UserId, response.Topic, response.ChannelName));
}
```
