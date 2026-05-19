---
title: Stream Channel
description: Stream Channel，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

**Stream** 频道是 RTM 提供的一种基于 Room 模型的频道类型。与 Message 频道不同的是，使用 Stream 频道的相关方法前你需要先创建 `StreamChannel` 对象实例。加入 Stream 频道后，你就可以监听频道中的事件通知了，但如需收发消息，你还需要通过 Topic 特性来实现，详见 [Topic](../topic/topic-basic)。RTM 允许你的 App 中同时存在成千上万个 Stream 频道，但由于端侧性能和带宽的限制，单个客户端同时只能加入有限数量的频道，详见 [API 使用限制](../setup/api-limits)。

> **信息**
> 如需接收并处理接收到的消息和事件通知，除了要加入该频道外，你还需要完成<a href=>事件监听</a >程序的配置。

## 创建频道

在使用 Stream 频道之前，你需要先调用 `createStreamChannel` 方法创建 Stream Channel 实例。成功创建 Stream Channel 实例后，你可以调用 Stream Channel 相关方法，例如：加入频道、离开频道、销毁频道、发送 Topic 消息、订阅 Topic 消息等。

你可以通过以下方式创建 `StreamChannel` 对象实例：

```dart
final channel = 'stream_room';
late StreamChannel stChannel;
try {
    var (status, channel) = await rtmClient.createStreamChannel(channel);
    if (status.error == true ){
       print('$ failed, errorCode: $, due to $');
    } else {
        stChannel = channel ;
        print('$ success!');
    }
} catch (e) {
    print('something went wrong: $e');
}
```

该方法一次只能创建一个 `StreamChannel` 对象实例，如需同时创建多个 `StreamChannel` 对象实例，你需要多次调用该方法。

RTM 支持你在单个客户端创建无限个 `StreamChannel` 对象实例，但声网建议你结合实际需求和端侧性能情况合理创建。例如，如果你同时持有多个暂时用不到的 `StreamChannel` 实例，为避免浪费资源，声网建议你及时销毁该实例，并在需要使用的时候再创建。

## 加入频道

创建 `StreamChannel` 对象实例后，调用 `join` 方法加入 Stream Channel，以便监听其中的事件通知。

```dart
var (status, response) = await stChannel.join(
    token: 'your_streamChannel_token',
    withMetadata: true,
    withPresence: true,
    withLock: true,
    beQuite: false);
if (status.error == true ){
    print('$ failed, errorCode: $, due to $');
} else {
    print('$ success!');
    print(response);
}
```

加入频道时，你需要在 `join` 中设置 `token` 参数。为方便体验和测试 App，你可以在创建项目时选择**鉴权机制**为**调试模式：APP ID**，并在加入频道时将 App ID 填写至 `token` 参数中。

```dart
var (status, response) = await stChannel.join(
    token: 'your_appId',
    withMetadata: true,
    withPresence: true,
    withLock: true,
    beQuite: false);
if (status.error == true ){
    print('$ failed, errorCode: $, due to $');
} else {
    print('$ success!');
    print(response);
}
```

Stream Channel 通过 Topic 来实现消息流机制。即使你设置了全局的消息监听程序，你也需要加入 Topic 才能发送消息，需要订阅 Topic 才能接收消息。详见 [Topic](../topic/topic-basic)。

## 离开频道

如果你不再需要接收某个频道中所有消息和事件通知，你可以调用 `leave` 方法离开该频道。

```dart
try {
    var (status, response) = await stChannel.leave();
    if (status.error == true ){
       print('$ failed, errorCode: $, due to $');
    } else {
        print('$ success!');
    }
} catch (e) {
    print('something went wrong: $e');
}
```

离开频道后，只要当前的 `StreamChannel` 对象实例没有被销毁，你还可以调用 `join` 方法再次加入该频道。

## 销毁频道

对于不再需要的 `StreamChannel` 对象实例，你可以调用 `release` 方法销毁它以释放资源。

## 共频道传输

声网会同时发行和维护两套 RTM SDK 版本：

- **独立版**（Standalone Version）：保持 RTM 功能独立，体积精简。版本号以 RTM 前缀开始，例如 RTM 2.3.0。适用于只需消息实时传输或与其他厂商 RTC 产品配合使用但不需要同步传输或优先级控制的场景。

- **融合版**（Merge Version）：与声网 RTC 产品深度融合，版本号以 RTC 加 RTM 版本号的形式展示。适用于需要实时消息传输和实时音视频传输的场景。基于 SDK 的深度融合，融合版在独立版的基础上增加了共频道传输数据、[消息与音视频同步传输](../topic/usage#同步传输)、消息数据与音视频数据全局优先级控制等特性。

无论是哪套版本，SDK 都具备同样的优异性能和 SLA 保证。你只需根据自己的业务场景进行选择。

共频道传输是指声网 RTM 的频道和 RTC 的频道可以通过合理的接口调用共用一个网络连接，且同名的 RTM Stream Channel 和 RTC Channel 会作为同一个频道，即你可以用同一个频道传输消息数据和音视频数据。共频道传输特性是实现消息与音视频数据同步传输和数据全局优先级控制等特性的基础。

> **信息**
> 只有融合版 SDK 支持共频道传输特性，且该特性仅对 Stream 类型频道有效。
