---
title: 连接管理基础
description: 连接管理基础，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

客户端需要首先与 RTM 服务器建立连接，才能在后续访问 RTM 网络资源，SDK 的 API 调用以及频道中的消息和事件都通过此网络连接进行传输。虽然 RTM SDK 会帮助你建立和维护网络连接，从而极大地简化监控网络状态的业务逻辑，但充分理解 RTM 的网络连接管理机制，仍有助于你在 App 中处理可能出现的网络错误，提升用户体验。

> **信息**
> 本文仅适用于 2.2.0 及之后版本。

## 创建连接

当客户端创建一个 RTM 实例或 Stream Channel 实例时，实际上客户端还没有真正地与服务器建立网络连接。你只是拥有了一个对象，具备在此对象中调用 API 的能力。只有当你主动调用 `login` 方法或 `join` 方法时，客户端才开始尝试与服务器建立网络连接。

RTM SDK 在很大程度上屏蔽了直接处理网络连接的种种细节，提供 `linkState` 事件通知向用户透传各种连接状态的迁移，你只需监听此事件即可从各种连接错误中恢复。

## 连接类型

在进一步探索之前，你需要了解 RTM 客户端的两种服务类型：`message` 服务和 `stream` 服务。一个客户端中可能会用到一种或两种服务，这两种服务对应的连接类型有所不同。

### MESSAGE 类型

`MESSAGE` 服务为用户提供 Message Channel、User Channel、Presence、Storage、Lock、Token 等服务，这些服务的消息、数据、事件通知等共享此连接。这条连接在客户端生命周期内唯一存在，在你主动调用 `login` 方法登录服务器时建立，在你主动调用 `logout` 方法登出服务器时结束。

你可以通过以下方式建立 `MESSAGE` 连接：

```dart
try {
    var (status, response) = await rtmClient.login('your_Token');
    if (status.error == true ){
       print('$ failed, errorCode: $, due to $');
    } else {
        print('$ success!');
    }
} catch (e) {
    print('something went wrong: $e');
}
```

> **信息**
> 建立 `MESSAGE` 连接会增加峰值连接数计量。

`MESSAGE` 连接是长连接，客户端会定时向服务器发送心跳包以保持活跃状态。当你订阅多个 Message Channel 或 User Channel 时，你将通过此连接接受所有频道消息或事件通知。

### STREAM 类型

`stream` 服务为用户提供 Stream Channel 的所有能力。与 `MESSAGE` 连接不同，`STREAM` 连接并不具备全局唯一性，而是每个 Stream Channel 实例都会单独创建一个连接。例如，当你创建 3 个 Stream Channel 实例并调用 `join` 方法加入后，客户端会与服务器建立 3 条网络连接。

在建立 `STREAM` 连接前，你需要先建立 `MESSAGE` 连接，即调用 `login` 方法并成功登录服务器。`STREAM` 连接的生命周期从你主动调用 `join` 方法加入频道时开始，到你主动调用 `leave` 方法离开频道时结束。你可以通过以下方式建立 `STREAM` 连接：

```dart
try {
    var (status,response) = await stChannel.join(token:'your_token',withPresence:true);
    if (status.error == true ){
       print('$ failed, errorCode: $, due to $');
    } else {
        print('$ success!');
    }
} catch (e) {
    print('something went wrong: $e');
}
```

> **信息**
> 建立 `STREAM` 连接不会增加峰值连接数计量。

`STREAM` 连接也是长连接，客户端会定时向服务器发送心跳包以保持活跃状态，发送心跳包的时间间隔是 0.5 秒且不可更改。对于需要优化电池寿命的应用场景，不建议使用 `stream` 服务。

## 监控连接

客户端通过 `linkState` 事件通知监控和管理网络连接状态的迁移。通过监听此事件，你可以随时知道以下信息：

- 当前网络连接处于何种状态。
- 何种原因或操作导致状态迁移。
- 迁移之前的网络状态是什么。
- 网络连接状态何时发生迁移。
- 什么服务类型的连接状态发生了迁移。
- 网络状态迁移影响了哪些已加入的频道。
- 哪些之前加入的频道没有成功恢复网络连接。

以上信息对于客户端从意外断开状态恢复到连接状态后的业务处理将非常有帮助，用户能更快速地定位和排除由于网络连接变化产生的故障及恢复业务现场。

你可以通过以下方式监听 `linkState` 事件通知：

```dart
rtmClient.addListener(
    linkState: (event) {
        var currentState = event.currentState;
        var previousState = event.previousState;
        var serviceType = event.serviceType;
        var operation = event.operation;
        var reason = event.reason;
        var affectedChannels = event.affectedChannels;
        var unrestoredChannels = event.unrestoredChannels;
        var isResumed = event.isResumed;
        var timestamp = event.timestamp;
    }
);
```

其中各字段的含义如下：

| 属性        |   描述  |
|---|-------- |
| `currentState`            |  当前的连接状态。   |
| `previousState`            |  之前的连接状态。   |
| `serviceType`    |  服务类型。可能是 `message` 或 `stream`。 |
| `operation`    | 触发本次状态迁移的操作。 |
| `reasonCode`    | 触发本次状态迁移的原因。 |
| `affectedChannels`    |  本次状态迁移影响的频道。 |
| `unrestoredChannels`    |  未恢复订阅或加入的频道信息，包含频道名、频道类型和频道中的临时状态数据。一般情况下为空。 |
| `isResumed`    |  在连接断开的 2 分钟内，是否从 `disconnected` 状态恢复成 `connected` 状态。`true` 表示已恢复。 |
| `timestamp`    |  本次事件通知发送的时间戳。 |

## 心跳探测

心跳探测能帮助 RTM 客户端和服务器及时发现突然的网络断连，例如客户端网络掉线、网络切换等。

### MESSAGE 类型

默认情况下，RTM 客户端会每隔 5 秒向服务器发送一次心跳探测包（Ping 包）。如果在 10 秒内没有收到服务器的回复（Pong 包），客户端则会认为网络连接出现问题。此时，客户端的网络连接状态（`RtmLinkState`）会由 `connected` 状态切换到 `disconnected` 状态，并开始尝试重新连接。

同理，服务器如果在 15 秒内未能收到来自客户端的 Ping 包，则会认为客户端出现了网络连接问题。此时，服务器会等待一段时间（`presenceTimeout`），如果这段时间内客户端未能重新与服务器建立连接，则 RTM 服务器会向此客户端所在频道的其他用户发送 `remoteTimeout` 事件通知。

需要注意的是，以上机制只适用于客户端与服务器意外断开连接的情况，如果你是主动断开连接，例如通过调用 `logout` 方法主动登出时，则不会遵循上述机制。

RTM SDK 默认的心跳探测时间间隔为 5 秒，这是平衡了设备续航能力和意外断连识别及时性的结果。如果你的 App 需要增加电池续航或者需要更及时地识别网络断连情况，那么你可以通过 `RtmConfig` 中的 `heartbeatInterval` 参数自定义心跳探测时间间隔，支持的取值为 [5,1800] 之间的任意整数值。

设置更高的 `heartbeatInterval` 值可能会降低客户端和服务器对于意外断连识别的及时性，峰值连接数（PCU）也可能显得更高。虽然 `heartbeatInterval` 最高可以设置成 1800 秒，但是我们不建议这么做。

你可以通过以下方式自定义心跳探测时间间隔，例如修改为 30 秒：

```dart
final userId = 'your_userId';
final appId = 'your_appId';
late RtmClient rtmClient;
var privateConfig = RtmPrivateConfig(heartbeatInterval:30);
var rtmConfig = RtmConfig( privateConfig:privateConfig );

try {
    var (status,client) = await RTM(appId, userId, rtmConfig:rtmConfig);
    if (status.error == true) {
        print(status);
    } else {
        rtmClient = client;
        print('Initialize success!');
    }
} catch (e) {
    print('Failed to create RTM client: $e');
}
```

### STREAM 类型

当你创建一个 Stream Channel 实例并调用 `join` 方法成功加入频道时，客户端会按 0.5 秒的间隔向服务器发送心跳包以保持活跃状态。`STREAM` 连接的心跳时间间隔不可更改，对于需要增加电池续航的应用场景，不建议使用 `stream` 服务。

## <a name="heartbeatinterval-and-presencetimeout"></a>Heartbeat Interval 与 Presence Timeout

`RtmConfig` 中包含两个与时间间隔相关的参数，分别为 `heartbeatInterval` 和 `presenceTimeout`。这两个参数常常会让人感到困惑，本节主要介绍它们的含义，以便你更有效地配置 App。

- `heartbeatInterval`：客户端会定期向服务器发送证明自身处于活跃状态的 Ping-Pong 数据包，以确保服务器能够及时清除超时计数并维持连接状态。该设置会影响 PCU 计数，是 SDK 全局连接管理功能中的一个重要特性。
- `presenceTimeout`：如果在设置的 `heartbeatInterval` 时间加 10 秒冗余时间内未收到客户端的 Ping 包，服务器则会认为该客户端可能遇到了网络连接故障。考虑到此时客户端可能在尝试修复问题，为避免重复通知事件，服务器会延迟一段时间（即 `presenceTimeout` 时间）再向频道中的其他用户广播事件通知。
  - 如果客户端在 `presenceTimeout` 设置的时间内与服务器重新建立连接，则服务器不会向频道中的其他用户发送事件通知，并且用户设置的 Presence 临时状态也会被保留。
  - 如果客户端在 `presenceTimeout` 设置的时间内未能重新连接，则服务器会向频道中的其他用户广播 `remoteTimeout` 类型的 `presence` 事件通知，该客户端的临时用户状态也会被清除。当客户端重新建立连接并恢复对频道的订阅关系时，服务器也会向频道中的其他用户广播 `remoteJoinChannel` 事件通知。如果你之前设置过临时用户状态，则客户端会重新应用本地会话缓存的临时用户状态，在频道中的其他用户也会收到对应的 `remoteStateChanged` 事件通知。

对于本地用户而言，由 Presence Timeout 触发的离开与调用 `unsubscribe` 方法造成的离开都被视为频道离开行为，不同之处在于 Presence Timeout 的离开通常是由网络连接故障引起的。本地用户可能处于 `disconnected` 或 `suspended` 状态，并尝试重新连接。如果重新连接成功，频道订阅关系和临时用户状态都会被自动恢复，对于频道中的其他用户来说，该用户为重新加入的用户。调用 `unsubscribe` 被视为用户主动离开频道，客户端会清除此频道的订阅关系和临时用户状态。

例如，客户端 A 在初始化实例时设置 `heartbeatInterval` 为 10 秒、`presenceTimeout` 为 5 秒。如果 A 发出了 Ping 包，但因为网络等原因在 10 秒内没有收到 Pong 包，则 A 的连接状态会变为 `disconnected` 类型。同时，A 会尝试重新连接，服务器最多等待 25 秒。25 秒后，如果 A 未能重新连接，那么服务器会代替 A 向频道中其他用户广播 `remoteTimeout` 类型的 `presence` 事件通知；如果 A 在 25 秒内成功恢复连接，那么服务器不会广播事件通知，频道中其他用户会认为 A 一直都在频道中未曾离开。在这个例子中，从 A 掉线到其他用户被通知先后经历了 10 秒的 `heartbeatInterval`、10 秒的误差范围（以允许网络延迟）、5 秒的 `presenceTimeout`，即最长的时间间隔为 25 秒。

设定 `presenceTimeout` 时间的一个重要理由是，客户端经常遇到断开网络连接又快速恢复的情况，例如网络切换、行驶经过隧道等。如果不允许客户端尝试重新连接就立即在频道内广播用户离开或加入的情况，则会造成过多的 Presence 事件通知，极大地降低用户体验。

## 关闭连接

当客户端和服务器之间不再需要连接时，你可以主动调用方法关闭连接。

### MESSAGE 类型

对于 `message` 类型服务，连接状态会影响峰值连接数的计量，推荐你调用 `logout` 方法显式地登出服务器，从而主动断开连接。

```dart
try {
    var (status, response) = await rtmClient.logout();
    if (status.error == true ){
       print('$ failed, errorCode: $, due to $');
    } else {
        print('$ success!');
    }
} catch (e) {
    print('something went wrong: $e');
}
```

> **信息**
> 一旦你主动调用 `logout` 方法断开 `MESSAGE` 连接，`STREAM` 连接也会同时断开，你将离开所有频道，客户端中所有缓存数据都会被清除。

### STREAM 类型

当你不再需要 `stream` 类型服务时，可以调用 `leave` 方法退出频道，从而断开 `STREAM` 连接。

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
