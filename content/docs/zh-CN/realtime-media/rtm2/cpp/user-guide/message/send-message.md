---
title: 发送消息
description: 发送消息，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

发送消息是 RTM 的基本能力之一，本文主要介绍如何在不同类型的频道中发送消息。同时，你也可以查看[实现收发消息](../../get-started/quick-start)快速构建一个示例程序并体验如何收发消息。

RTM 目前只支持字符串和二进制类型的消息数据格式。如果你的业务中使用了 JSON、Object 等其他数据类型，或者 protobuf 等第三方数据构建工具，那么你需要在发送消息之前对消息数据进行序列化。关于如何有效构建负载数据结构及推荐的序列化方式可以参考[消息负载结构化](./constructed.md)。

## Message Channel 中发送消息

在 Message Channel 中，你只需调用 `publish` 方法即可发送消息，无需提前订阅频道。该方法一次只能向一个频道发送消息，如需向多个频道发送消息，你需要多次调用该方法。RTM 并不限制你向多少个频道发送消息，也不限制有多少用户向一个频道发送消息，但是对你同时向一个频道发送消息的频率有一定的限制，详见 [API 使用限制](../setup/api-limits)。

> **信息**
> `publish` 方法仅适用于 Message Channel 和 User Channel，你无法使用该方法向 Stream Channel 发送消息。

发送字符串消息和二进制消息的示例代码如下：

```cpp showLineNumbers
// 发送字符串消息
PublishOptions options;
options.messageType = RTM_MESSAGE_TYPE_STRING;
options.customType = "PlainText";

std::string message =  "hello world";
uint64_t requestId;
rtm_client->publish("channelName", message.c_str(), message.size(), options, requestId);
```

```cpp
// 发送二进制消息
PublishOptions options;
options.messageType = RTM_MESSAGE_TYPE_BINARY;
options.customType = "ByteArray";
char message[5] = ;

uint64_t requestId;
rtm_client->publish("channelName", message, 5, options, requestId);
```

调用该方法后，SDK 会触发 `onPublishResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onPublishResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) override {
        if (errorCode != RTM_ERROR_OK) {
            // publish message failed
        } else {
            // publish message success
        }
    }
};
```

方法调用成功后，RTM 会在 100 毫秒内将你的消息发送给订阅该频道的所有在线用户。

## <a name="userchannel"></a>User Channel 中发送消息

在 User Channel 中，你只需调用 `publish` 方法，将 `channelType` 参数设为 `RTM_CHANNEL_TYPE_USER`，并将 `channelName` 参数设为指定用户的 `userId`，即可向指定用户发送点对点消息。该方法一次只能向一位用户发送消息，如需向多位用户发送消息，你需要多次调用该方法。RTM 并不限制你向多少用户发送消息，也不限制有多少用户向你发送消息，但是对你向用户发送消息的频率有一定的限制。

> **信息**
> `publish` 方法仅适用于 Message Channel 和 User Channel，你无法使用该方法向 Stream Channel 发送消息。

发送字符串消息和二进制消息的示例代码如下：

## Stream Channel 中发送消息

与 Message Channel 不同，在 Stream Channel 中发送消息，你首先需要具备三个前提条件：

1. 你需要创建一个 `IStreamChannel` 实例。

2. 你需要调用 `join` 方法加入该频道。

3. 你需要调用 `joinTopic` 方法注册成为指定 Topic 的消息发布者。

满足上述条件后，你就可以调用 `publishTopicMessage` 方法向指定的 Topic 发送消息了。该方法一次只能向一个 Topic 发送消息，如需向多个 Topic 发送消息，你可以多次调用该方法。

RTM 规定一位用户同时只能注册成为不超过 8 个 Topic 的消息发布者，即同时只能加入不超过 8 个 Topic，但并不限制一个 Topic 可容纳的用户数量。你向一个 Topic 发送消息的频率可以达到 120 QPS，此特性在需要数据高频大并发的场景中十分有效，例如：元宇宙中的位置状态同步、协同办公中的画板应用、 平行操控中的操作指令传输等。

发送字符串消息和二进制消息的示例代码如下：

```cpp
// 发送字符串消息
std::string message = "Hello Agora!";
TopicMessageOptions options;
options.messageType = RTM_MESSAGE_TYPE_STRING;
options.customType = "PainTxt";
uint64_t requestId;
streamChannel.publishTopicMessage("topicName", message.c_str(), message.size(), options, requestId);
```

```cpp
// 发送二进制消息
char message[5] = ;

TopicMessageOptions options;
options.messageType = RTM_MESSAGE_TYPE_BINARY;
options.customType = "ByteArray";
uint64_t requestId;
streamChannel.publishTopicMessage("topicName", message, 5, options, requestId);
```

调用该方法后，SDK 会触发 `onPublishTopicMessageResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onPublishTopicMessageResult(const uint64_t requestId, const char* channelName, const char* topic, RTM_ERROR_CODE errorCode) override {
        if (errorCode != RTM_ERROR_OK) {
            // publish topic message failed
        } else {
            // publish topic message success
        }
    }
};
```

成功向 Topic 发送消息后，RTM 会在 100 毫秒内将你的消息发送给订阅该 Topic 的所有在线用户。该消息和在 Message Channel 中发送的消息具备同样的延迟特性和 SLA 保障。

## 消息负载包体积限制

RTM 对在 Message 类型频道和 Stream 类型频道中发送的消息负载包体积有限制：Message 类型频道中的限制为 32 KB，Stream 类型频道中的限制为 1 KB。消息负载包体积包含消息负载自身加上 `customType` 字段大小。当消息负载包体积超出限制时，你会收到以下返回值：

为避免因为消息负载包体积超限而导致发送失败，你可以在消息发送之前对消息负载包体积进行检查。
