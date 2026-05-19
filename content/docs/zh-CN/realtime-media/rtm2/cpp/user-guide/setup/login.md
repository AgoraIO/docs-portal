---
title: 登录服务
description: 登录服务，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

你需要登录才能真正连接上 RTM 服务器、访问 RTM 的网络资源，如发送消息、订阅频道等。在登录 RTM 服务之前，你需要确保你的设备处于网络连接的状态并完成了[应用设置](./application-setup.md)。

## 登录服务

执行登录操作时，客户端会尝试与 RTM 服务器建立长连接，一旦建立成功，客户端会按照固定的时间间隔向 RTM 服务器传递心跳信息以保持客户端的活跃状态，直到客户端主动退出登录或掉线超时才会中断连接。在此期间，你可以在权限和使用限制范围内访问 RTM 的网络资源。

```cpp
uint64_t requestId;
rtmClient->login("your_token", requestId);
```

调用该方法后，SDK 会触发 `onLoginResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onLoginResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) {
        if (errorCode != RTM_ERROR_OK) {
            printf("login rtm failed error is %d reason is %s\n", errorCode, getErrorReason(errorCode));
        } else {
            printf("login rtm success\n");
        }
    }
};
```

你可以通过 `login` 的返回值或监听 `onLinkStateEvent` 事件通知来判断登录是否成功以及登录失败的错误码和错误原因。执行登录操作时，客户端的网络连接状态为 `RTM_LINK_STATE_CONNECTING`；登录成功后，其状态会更新为 `RTM_LINK_STATE_CONNECTED` 状态。为持续监测客户端的网络连接状态，声网建议你在应用的整个生命周期内持续监听 `onLinkStateEvent` 事件通知，详见<a href=>事件监听</a >。

> **信息**
> 用户成功登录 RTM 服务后，应用的 PCU 会增加，这将影响你的账单数据。

## 退出登录

当不再需要使用 RTM 服务时，你可以通过显式调用 `logout` 退出登录。退出登录意味着客户端与 RTM 服务器关闭长连接，你会自动退出或取消订阅所有频道（Stream Channel 及 Message Channel），频道中的其他用户也会收到你的离开频道的 `onPresenceEvent` 事件通知。

```cpp
uint64_t requestId;
rtmClient->logout(requestId);
```

调用该方法后，SDK 会触发 `onLogoutResult` 回调并返回 API 调用结果。

```cpp
// 异步回调
class RtmEventHandler : public IRtmEventHandler {
    void onLogoutResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) {
        if (errorCode != RTM_ERROR_OK) {
          // logout failed
        } else {
          // logout success
        }
    }

    // ...
};
```

在离开应用时显式地执行退出登录操作是一种良好的实践。退出登录后，你就无法通过 API 访问 RTM 网络资源。

## 销毁 RTM 实例

如果你不再需要使用 RTM 服务，声网建议你及时销毁 `IRtmClient` 实例，以避免内存泄漏，以及错误或异常（如空指针异常）导致性能下降。

```cpp
rtmClient->release();
```
