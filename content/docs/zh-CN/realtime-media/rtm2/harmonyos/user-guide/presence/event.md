---
title: 事件通知
description: 事件通知，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

## 添加事件监听

接收 Presence 事件通知，你需要实现事件监听程序，详见[事件监听](../message/add-event-listener)。除此之外，。`PresenceEvent` 数据结构包含以下属性：

 |
| `channelType` | 频道类型，可能是 Message Channel 或 Stream Channel。                                                                                        |
| `channelName` | 事件发生的频道名称。                                                                                                                        |
|  `publisher`  | 触发此事件的用户 ID。                                                                                                                       |
| `states`  | 用户临时状态信息列表，`REMOTE_STATE_CHANGED` 事件发生时有效。                                     |
|  `interval`   | Interval 模式下，当前频道在上一个周期内用户加入、离开、超时、状态变更等事件通知的聚合增量信息。                                             |
|  `snapshot`   | 快照详情。用户首次加入或订阅频道触发了 `SNAPSHOT` 事件时有效。                          |

 |
| `channelType` | 频道类型，可能是 Message Channel 或 Stream Channel。                                                                                        |
| `channelName` | 事件发生的频道名称。                                                                                                                        |
|  `publisher`  | 触发此事件的用户 ID。                                                                                                                       |
| `states`  | 用户临时状态信息列表，`REMOTE_STATE_CHANGED` 事件发生时有效。                                     |
|  `interval`   | Interval 模式下，当前频道在上一个周期内用户加入、离开、超时、状态变更等事件通知的聚合增量信息。                                             |
|  `snapshot`   | 快照详情。用户首次加入或订阅频道触发了 `SNAPSHOT` 事件时有效。                          |
|  `timestamp`   | 事件触发时间戳。                          |

## 事件通知类型

Presence 事件通知有七种类型，它们分别是：

## 事件通知模式

Presence 事件通知模式是指在频道中如何将 Presence 事件通知到订阅用户。有两种模式：**实时通知模式（Announce）** 和 **定时通知模式（Interval）**。用户可以在控制台的项目设置中通过**实时通知最大人数**大小来决定两种模式相互切换的条件。定时通知模式可防止频道内在线用户过多而导致的事件嘈杂。实时通知最大人数可以设置的范围为 [8,128]，如果你的需求超出此范围，需要联系声网 RTM 团队（rtm-support@shengwang.cn）另行调整。

### 实时通知模式

如果频道中的在线人数小于实时通知最大人数参数设定的值（默认值为 50），则 Presence 事件通知处于实时通知模式。在此模式下，`REMOTE_JOIN_CHANNEL`、`REMOTE_LEAVE_CHANNEL`、`REMOTE_TIMEOUT`、`REMOTE_STATE_CHANGED` 事件在触发时会立即发送到客户端。

  
#### Join

    ```typescript
    {
        eventType: RtmPresenceEventType.REMOTE_JOIN_CHANNEL,
        channelType: RtmChannelType.MESSAGE,
        channelName: "chat_room",
        publisher: "Tony",
        stateChanged: [],
        interval: null,
        snapshot: null,
        timestamp: 1710487149497
    }
    ```
  

  
#### Leave

    ```typescript
    {
        eventType: RtmPresenceEventType.REMOTE_LEAVE_CHANNEL,
        channelType: RtmChannelType.MESSAGE,
        channelName: "chat_room",
        publisher: "Tony",
        stateChanged: [],
        interval: null,
        snapshot: null,
        timestamp: 1710487149497
    }
    ```
  

  
#### Timeout

    ```typescript
    {
        eventType: RtmPresenceEventType.REMOTE_TIMEOUT,
        channelType: RtmChannelType.MESSAGE,
        channelName: "chat_room",
        publisher: "Tony",
        stateChanged: [],
        interval: null,
        snapshot: null,
        timestamp: 1710487149497
    }
    ```
  

  
#### Snapshot

    ```typescript
    {
        eventType: RtmPresenceEventType.SNAPSHOT,
        channelType: RtmChannelType.MESSAGE,
        channelName: "chat_room",
        publisher: "",
        stateChanged: [],
        interval: null,
        snapshot: [
            ,
            { userId: "user_b", states: [] },
            
        ],
        timestamp: 1710487149497
    }
    ```
  

  
#### State Change

    ```typescript
    {
        eventType: RtmPresenceEventType.REMOTE_STATE_CHANGED,
        channelType: RtmChannelType.MESSAGE,
        channelName: "chat_room",
        publisher: "Tony",
        stateChanged: [
            
        ],
        interval: null,
        snapshot: null,
        timestamp: 1710487149497
    }
    ```
  

### 定时通知模式

当频道中的在线人数超过实时通知最大人数的值时，频道会进入定时通知模式。在这种模式下，`REMOTE_JOIN_CHANNEL`、`REMOTE_LEAVE_CHANNEL`、`REMOTE_TIMEOUT`、`REMOTE_STATE_CHANGED` 事件会被 `INTERVAL` 事件代替，并以一定的时间间隔发送给频道中所有用户。

```typescript
{
    eventType: RtmPresenceEventType.INTERVAL,
    channelType: RtmChannelType.MESSAGE,
    channelName: "chat_room",
    publisher: "",
    stateChanged: [],
    interval: {
        join: ["Tony", "Lily"],
        leave: ["Jason"],
        timeout: ["Wang"],
        userStateList: [
            {
                userId: "Harvard",
                states: [
                    ,
                    
                ]
            },
            {
                userId: "Alice",
                states: [
                    ,
                    
                ]
            }
        ]
    },
    snapshot: null,
    timestamp: 1710487149497
}
```
