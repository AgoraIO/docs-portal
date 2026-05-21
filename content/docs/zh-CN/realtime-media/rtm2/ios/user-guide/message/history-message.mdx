---
title: 历史消息 (Beta)
description: 历史消息 (Beta)，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

历史消息功能允许你在向频道发布消息的时候存储所有消息。例如，当你中途加入聊天频道时，你可以利用此特性检索加入之前频道中发布的消息。你可以为项目配置消息存储时间，从 1 天到永久存储。

当消息发布时，历史消息会使用频道名和消息的发布时间戳进行存储，你可以利用这些信息来检索历史消息。

> **注意**
> 历史消息特性仅支持 User Channel 和 Message Channel，暂时不支持 Stream Channel。

## 开通历史消息

在使用历史消息功能之前，你需要确保你已经在控制台中针对此项目开通了历史消息功能开关，步骤如下：

1. 在[控制台](https://console.shengwang.cn/)左导航的**全部产品**下，点击**实时消息 RTM**，进入产品配置页。
2. 切换到**功能配置**页签，点击**历史消息（History）配置**区域的启用按钮：

   ![控制台开通历史消息](/img/rtm2/history-message.png)

3. 根据你的业务场景需要，设置历史消息的存储时间，例如：1 天、7 天、30 天、90 天、365 天或永久存储。

> **信息**
> 消息一旦被存储，你将不能再改变其存储时间。如果你在控制台更改了历史消息存储时间，这些设置只对之后存储的消息有效。

## 存储历史消息

在确保控制台中为此项目开通历史消息存储功能的情况下，你只需要在调用 `publish()` 接口时，将 `storeInHistory`  参数设置成 `true` 即可将此消息存储到历史消息服务器。

以下向你演示如何在向 Message Channel 发送消息的同时将消息存储到历史消息服务器：

```objectivec
NSString* message = @"Hello Agora!";
NSString* channel = @"your_channel";

AgoraRtmPublishOptions* publish_option = [[AgoraRtmPublishOptions alloc] init];
publish_option.storeInHistory = true;

[rtm publish:channel message:message option:publish_option completion:^(AgoraRtmCommonResponse * _Nullable response, AgoraRtmErrorInfo * _Nullable errorInfo) {
    if (errorInfo == nil) {
        NSLog(@"publish success!!");
    } else {
        NSLog(@"publish failed, errorCode %d, reason %@", errorInfo.errorCode, errorInfo.reason);
    }
}];
```

​
你也可以向 User Channel 发送消息的同时将消息存储到历史消息服务器，从而实现收件箱的功能：

```objectivec
NSString* message = @"Hello Agora!";
NSString* user = @"Tony";

AgoraRtmPublishOptions* publish_option = [[AgoraRtmPublishOptions alloc] init];
publish_option.channelType = AgoraRtmChannelTypeUser;
publish_option.storeInHistory = true;

[rtm publish:user message:message option:publish_option completion:^(AgoraRtmCommonResponse * _Nullable response, AgoraRtmErrorInfo * _Nullable errorInfo) {
    if (errorInfo == nil) {
        NSLog(@"publish success!!");
    } else {
        NSLog(@"publish failed, errorCode %d, reason %@", errorInfo.errorCode, errorInfo.reason);
    }
}];
```

## 获取历史消息

SDK 为你提供了获取历史消息的 API，你可以使用 `getMessages()` 接口一次性查询至多 100 条消息。

你可以通过设置 `start` 和 `end` 参数来获取指定时间段内的历史消息。当然，大部分情况下你可能只想获取上次掉线时刻到当前时间之间最新的消息，这种情况下，你只需要设置 `end` 参数即可。以下代码演示如何获取到上次掉线时刻为止的最新 50 条消息：

```objectivec
AgoraRtmGetHistoryMessagesOptions *option = [[AgoraRtmGetHistoryMessagesOptions alloc] init];
option.messageCount = 50;
option.end = 1688978391800;

[rtmClient getMessages:@"channel_name"
            channelType:AgoraRtmChannelTypeMessage
                options:option
             completion:^(AgoraRtmGetHistoryMessagesResponse *response, NSError *error) {
    if (response != nil) {
        NSLog(@"total message count is: %lu\n\n", (unsigned long)response.messageList.count);
        
        for (AgoraRtmMessage *msg in response.messageList) {
            NSLog(@"publisher: %@\nmessage content: %@\ntime stamp: %lld\n", msg.publisher, msg.message.stringData, msg.timestamp);
        }
        
        NSLog(@"new start: %@", response.newStart);
    } else {
        NSLog(@"get history message failed: %@", error.localizedDescription);
    }
}];
```

​
你可以通过返回值 `result` 中的 `newStart` 字段来判断是否还存在没有被读取的历史消息：如果此字段值为 0，表示所有历史消息都已被读取；如果不为 0，你可以将此值作为新的起点配置 `getMessages()` 接口的 `start` 参数，继续查询直到读取所有历史消息。

获取历史消息的时候，你可以通过配置以下参数组合来灵活控制获取消息的范围，让你读取信息更有效率：

#### 场景一：获取从 start 时间戳开始的 n 条消息

| 配置参数 | 行为 |
| --- | --- |
| `start` | 获取此时间戳开始更早的消息，不包含此时间戳。 |

```
时间线
更早之前的频道消息----------------------- start timeStamp ----------------------- 最新的频道消息
[                 n 条消息  <----------]
```

#### 场景二：获取从当前时刻开始到 end 时间戳为止的消息

| 配置参数 | 行为 |
| --- | --- |
| `end` | 获取从当前时刻开始到此时间戳为止最近的消息，包含此时间戳。 |

```
时间线
更早之前的频道消息----------------------- end timeStamp ------------------------- 最新的频道消息
                                                   [    n 条消息   <----------]
```

#### 场景三：获取从 start 时间戳开始到 end 时间戳为止中间的消息

| 配置参数 | 行为 |
| --- | --- |
| `start` | 获取从 start 时间戳开始更早的消息，不包含此时间戳。 |
| `end` | 获取从当前时刻开始到此时间戳为止最近的消息，包含此时间戳。 |

```
时间线
更早之前的频道消息---- end timeStamp --------------------- start timeStamp ------ 最新的频道消息
                                [ n 条消息 <------------]
```
