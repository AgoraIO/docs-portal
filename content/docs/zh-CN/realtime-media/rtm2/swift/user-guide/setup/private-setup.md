---
title: 私有化配置
description: 私有化配置，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

自 2.2.0 版本起，RTM 全面支持私有化部署能力。这意味着用户可以自行部署和管理他们的 RTM 环境，从而更好地控制他们的数据和系统。我们致力于为用户提供更灵活、安全和可定制化的解决方案，希望通过这一功能的推出，能够满足更多用户的需求。

RTM 提供两种不同的服务类型，即 `MESSAGE` 服务和 `STREAM` 服务，详见[服务类型](./application-setup.md)。具体的服务类型选择取决于你的实际需求和预算，你可以选择部署其中一种或同时部署两种。以下代码展示同时部署了两种服务的私有化环境配置：

```swift
let rtmConfig = AgoraRtmClientConfig(appId: "your_appid", userId: "your_userid")

let privateConfig = AgoraRtmPrivateConfig()
privateConfig.accessPointHosts = ["your_private_server"]
privateConfig.serviceType = [.stream, .message]

rtmConfig.privateConfig = privateConfig
```

> **注意**
> 如需进行私有化环境部署，你需要先确保后端服务的支持。如果你有此项需求，请联系声网 RTM 团队（rtm-support@agora.io），我们将协助你完成环境配置工作。
