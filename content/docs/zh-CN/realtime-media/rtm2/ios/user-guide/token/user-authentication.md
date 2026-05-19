---
title: 客户端鉴权
description: 客户端鉴权，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

鉴权是指在用户访问你的系统前，对其进行身份校验。用户在使用声网服务，如加入音视频通话或登录信令系统时，声网使用 Token 对其鉴权。

RTM 提供 Message Channel 和 Stream Channel 两种频道类型，使用不同类型的频道，对应的 Token 类型也不同：

- 使用 Message Channel：只需在调用 `loginByToken` 方法登录 RTM 系统时，传入开通了 RTM 服务的 Token（以下简称 RTM Token）。
- 使用 Stream Channel：在使用 RTM Token 鉴权的基础上，还需要在调用 `joinWithOption` 方法加入 Stream Channel 时传入开通了 RTC 服务的 Token（以下简称 RTC Token）。

本文展示如何搭建一个使用 RTM Token 鉴权的客户端。使用 RTC Token 请参考<a href=>使用 RTC Token 鉴权</a>。

## 鉴权流程

下图展示了 RTM Token 鉴权的基本流程：

![Token 流程](/img/rtm2/token-authentication.svg)

RTM Token 在 App 服务器上生成，其最长有效期为 24 小时。当用户从你的 App 客户端登录到 RTM 系统时，声网平台会读取该 Token 中包含的信息，并进行校验。Token 包含以下信息：

- 你在声网控制台创建项目时生成的 App ID
- RTM 用户 ID
- RTM Token 过期的 Unix 时间戳

## 前提条件

开始前，请确保你的项目或使用的声网产品满足如下条件：

- 已开启 App 证书的声网项目以及项目的 App ID，可参考[开通服务](../../get-started/enable-service.md)获取。
- 已在你的项目中集成实时消息 SDK 并实现基本的收发消息功能，详见[实现收发消息](../../get-started/quick-start.md)。

## 实现用户鉴权

本节展示如何使用 RTM Token 对客户端的用户进行鉴权。

> **信息**
> - 此示例服务器仅用于演示，请勿用于生产环境中。
> - 生成 RTM Token 时填入的用户 ID 和 App ID，需要和初始化实例时填入的用户 ID 和 App ID 一致。

使用获取到的 RTM Token，通过 `loginByToken` 方法登录。

```objc
[rtm loginByToken:@"your_token" completion:^(AgoraRtmCommonResponse * _Nullable response, AgoraRtmErrorInfo * _Nullable errorInfo) {
    if (errorInfo == nil) {
        NSLog(@"login success!!");
    } else {
        NSLog(@"login failed, errorCode %d, reason %@", errorInfo.errorCode, errorInfo.reason);
    }
}];
```

## 开发注意事项

### App 证书与 RTM Token

生成 RTM Token 需要先在控制台启用对应项目的 App 证书。项目一旦开启了 App 证书，就必须使用 RTM Token 鉴权。

### RTM Token 过期<a name="expiration"></a>

你可以根据业务需求指定 RTM Token 的有效期 (最长为 24 小时)。当 RTM Token 将在 30 秒后过期时，会触发 `tokenPrivilegeWillExpire` 回调，提醒用户 Token 即将过期。收到该回调时，你可以在服务端重新生成 RTM Token，然后调用 `renewToken` 方法，将新生成的 RTM Token 传给 SDK。

如果 Token 已过期，则 SDK 会触发 `didReceiveLinkStateEvent` 回调，报告如下内容：

- 当前状态（`currentState`）：`AgoraRtmLinkStateFailed`
- 触发本次状态迁移的操作（`operation`）：`AgoraRtmLinkOperationServerReject`
- 状态迁移的原因（`reasonCode`）：`AgoraRtmLinkStateChangeReasonTokenExpired`

此时，用户需要先在端侧更新 Token，排除故障后再调用 `login` 方法重新登录。

> **信息**
> 你可以通过 `tokenPrivilegeWillExpire` 回调和 `didReceiveLinkStateEvent` 回调进行 Token 过期处理，但声网推荐你通过定时（例如每小时）更新 Token 来解决 Token 过期问题。
