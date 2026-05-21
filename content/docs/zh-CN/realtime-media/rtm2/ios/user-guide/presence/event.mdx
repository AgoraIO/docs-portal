---
title: 事件通知
description: 事件通知，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

## 添加事件监听

接收 Presence 事件通知，你需要实现事件监听程序，详见[事件监听](../message/add-event-listener)。除此之外，在订阅或加入频道时还需将 `features` 参数设为 `AgoraRtmJoinChannelFeaturePresence` 或 `AgoraRtmSubscribeChannelFeaturePresence`。`AgoraRtmPresenceEvent` 数据结构包含以下属性：

 |
| `channelType` | 频道类型，可能是 Message Channel 或 Stream Channel。                                                                                        |
| `channelName` | 事件发生的频道名称。                                                                                                                        |
|  `publisher`  | 触发此事件的用户 ID。                                                                                                                       |
| `states`  | 用户临时状态信息列表，`AgoraRtmPresenceEventTypeRemoteStateChanged` 事件发生时有效。                                     |
|  `interval`   | Interval 模式下，当前频道在上一个周期内用户加入、离开、超时、状态变更等事件通知的聚合增量信息。                                             |
|  `snapshot`   | 快照详情。用户首次加入或订阅频道触发了 `AgoraRtmPresenceEventTypeSnapshot` 事件时有效。                          |

|     参数      | 描述                                                                                                                                        |
| ----------- | ----
|   `type`     | Presence 事件类型。

## 事件通知类型

Presence 事件通知有七种类型，它们分别是：

|                              枚举值                               | 描述                                                                      |
| ------- | ----------------- |
|  `AgoraRtmPresenceEventTypeSnapshot`   | `1`: 用户第一次订阅或加入频道时触发，本地用户会收到此类事件通知。         |
|   `AgoraRtmPresenceEventTypeInterval`   | `2`: 当频道内人数达到设定值后，频道内的事件通知将由实时通知转为定时通知。 |
|  `AgoraRtmPresenceEventTypeRemoteJoinChannel`   | `3`: 当用户订阅或加入频道时触发，频道中的其他人会收到此类通知。           |
|  `AgoraRtmPresenceEventTypeRemoteLeaveChannel`  | `4`: 当用户取消订阅或离开频道时触发，频道中的其他人会收到此类通知。       |
| `AgoraRtmPresenceEventTypeRemoteConnectionTimeout` | `5`: 当用户掉线超时时触发，频道中的其他人会收到此类通知。                 |
| `AgoraRtmPresenceEventTypeRemoteStateChanged`  | `6`: 当用户临时状态数据发生变更时触发，频道中的其他人会收到此类通知。     |
|   `AgoraRtmPresenceEventTypeErrorOutOfService`   | `7`: 用户加入频道时未启用 Presence，本地用户会收到此类事件通知。          |

## 事件通知模式

Presence 事件通知模式是指在频道中如何将 Presence 事件通知到订阅用户。有两种模式：**实时通知模式（Announce）** 和 **定时通知模式（Interval）**。用户可以在控制台的项目设置中通过**实时通知最大人数**大小来决定两种模式相互切换的条件。定时通知模式可防止频道内在线用户过多而导致的事件嘈杂。实时通知最大人数可以设置的范围为 [8,128]，如果你的需求超出此范围，需要联系声网 RTM 团队（rtm-support@shengwang.cn）另行调整。

### 实时通知模式

如果频道中的在线人数小于实时通知最大人数参数设定的值（默认值为 50），则 Presence 事件通知处于实时通知模式。在此模式下，`AgoraRtmPresenceEventTypeRemoteJoinChannel`、`AgoraRtmPresenceEventTypeRemoteLeaveChannel`、`AgoraRtmPresenceEventTypeRemoteConnectionTimeout`、`AgoraRtmPresenceEventTypeRemoteStateChanged` 事件在触发时会立即发送到客户端。

  
#### Join

    ```objc
    {
        type: AgoraRtmPresenceEventTypeRemoteJoinChannel;
        channelType: AgoraRtmChannelTypeMessage;
        channelName: "test_channel";
        publisher: "publisher_name";
        states: [];
        interval: [];
        snapshot: [];
        timestamp: 1710487149497;
    }
    ```
  

  
#### Leave

    ```objc
    {
        eventType: AgoraRtmPresenceEventTypeRemoteLeaveChannel;
        channelType: AgoraRtmChannelTypeMessage;
        channelName: "test_channel";
        publisher: "publisher_name";
        stateChanged: [];
        interval: [];
        snapshot: [];
        timestamp: 1710487149497;
    }
    ```
  

  
#### Timeout

    ```objc
    {
        eventType: AgoraRtmPresenceEventTypeRemoteConnectionTimeout;
        channelType: AgoraRtmChannelTypeMessage;
        channelName: "test_channel";
        publisher: "publisher_name";
        stateChanged: [];
        interval: [];
        snapshot: [];
        timestamp: 1710487149497;
    }
    ```
  

  
#### Snapshot

    ```objc
    {
        eventType: AgoraRtmPresenceEventTypeSnapshot;
        channelType: AgoraRtmChannelTypeMessage;
        channelName: "test_channel";
        publisher: "";
        stateChanged: [];
        interval: [];
        snapshot: [
            { userId: "user_a", states: {}},
            { userId: "user_b", states: },
            { userId: "yourSelf", states: {}},
        ];
        timestamp: 1710487149497;
    }
    ```
  

  
#### State Change

    ```objc
    {
        eventType: AgoraRtmPresenceEventTypeRemoteStateChanged;
        channelType: AgoraRtmChannelTypeMessage;
        channelName: "test_channel";
        publisher: "publisher_name";
        states: {
            "key_1": "value_1",
        };
        interval: [];
        snapshot: [];
        timestamp: 1710487149497;
    }
    ```
  

### 定时通知模式

当频道中的在线人数超过实时通知最大人数的值时，频道会进入定时通知模式。在这种模式下，`AgoraRtmPresenceEventTypeRemoteJoinChannel`、`AgoraRtmPresenceEventTypeRemoteLeaveChannel`、`AgoraRtmPresenceEventTypeRemoteConnectionTimeout`、`AgoraRtmPresenceEventTypeRemoteStateChanged` 事件会被 `AgoraRtmPresenceEventTypeInterval` 事件代替，并以一定的时间间隔发送给频道中所有用户。

```objc
{
    "type" : AgoraRtmPresenceEventTypeInterval,
    "channelType" : AgoraRtmChannelTypeMessages,
    "channelName" : "Chat_room",
    "publisher" : "Tony",
    "interval" : {
        "remote_join" : ["Tony","Lily"],
        "remote_leave" : ["Jason"],
        "remote_timeout" : ["Wang"],
        "remote_state_change" : [
            {
                "userId" : "Harvard",
                "states" :  [,],
            },
            {
                "userId" : "Harvard",
                "states" :  [,],
            }
            ]
    }
}
```
