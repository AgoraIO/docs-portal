---
title: 应用配置
description: 应用配置，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

在开始配置你的应用之前，你需要先了解用户 ID、服务类型等概念，然后下载并安装 SDK，再初始化一个 RTM 对象实例，最后实现事件监听函数以捕获 RTM 实时网络中的所有事件通知。

## 用户 ID（`userId`）

用户 ID 是一个用于标识用户和设备的 ASCII 码字符串，长度最多为 64 个字符。在初始化 RTM 客户端实例时，你需要自行定义用户 ID 并将其传递给 `userId` 参数。RTM 规定在同一个 App ID（`appId`）下，每个用户或设备都必须具有唯一的全局用户 ID。

为了正确使用 RTM，你需要了解用户、设备和客户端的概念：
- **用户**: 是指应用的实际使用者。
- **设备**: 是指实际接入 RTM 网络的终端，包括但不限于手机、电脑、智能手表等 IoT 设备。
- **客户端**: 是指运行在设备上的 RTM 对象实例。

一个用户可能拥有多台设备，而一台设备也有可能被多人拥有。为更好地区分不同的设备和用户，RTM 规定同一个用户 ID 不能在多台设备上同时登录 RTM 服务、一台设备上不能同时存在多个 RTM 客户端。如果一个用户拥有多台设备，则需要为每台设备都分配唯一的用户 ID。如果两台拥有相同用户 ID 的设备同时登录 RTM 服务，那么先登录上的设备会被后登录的设备挤下线，而被强制下线的设备会收到相应的事件通知。

在实际场景中，业务层的用户名和 RTM 的用户 ID 可能不同，你需要自行实现二者的映射与绑定逻辑。例如，用户先通过用户名登录你的业务服务器，服务器再生成对应的用户 ID，然后使用该用户 ID 初始化并登录 RTM 服务。

此外，用户 ID 也会影响计费和在线状态通知等功能的使用，所以声网建议你为用户和设备分配全局唯一的用户 ID 并在整个生命周期内保持不变。

## 服务类型 [#servicetype]
基于不同的传输连接，RTM SDK 提供的功能可以被划分为两种服务类型： `MESSAGE` 服务和 `STREAM` 服务。

- `MESSAGE` 服务涵盖了 `Message Channel`、`User Channel`、`Presence`、`Storage`、`Lock`、`Token` 鉴权等功能特性，通过 `RtmClient` 实例调用 API。
- `STREAM` 服务则提供了 `Stream Channel`、`Topic` 等功能，通过 `StreamChannel` 实例调用 API。

在 `MESSAGE` 服务中，所有功能特性将共享一条传输连接，该连接在 `login` 时建立，在 `logout` 时关闭。而在 `STREAM` 服务中，传输连接的数量取决于加入的 `STREAM CHANNEL` 数量，即每个加入的 `STREAM CHANNEL` 实例都拥有独立的连接，连接在 `join` 时建立，在 `leave` 时关闭。

所有传输连接都由 SDK 统一管理，并通过 `linkState` 事件通知给用户，详见[连接管理](../link/link-basic)。深入理解 RTM 服务类型的区别，有助于你更准确地选择和使用相关能力。

此外，服务类型还涉及私有化配置的选择。用户可以选择私有化一个服务，或者同时私有化两种服务，具体取决于应用场景和预算。详见[私有化配置](./private-setup.md)。

## 连接协议配置 [#protocol]
为保证连接的稳定性和服务的持续可用性，RTM 客户端与边缘服务器建立连接时会为每种服务（`MESSAGE` 服务和 `STREAM` 服务）分别建立两条传输链路。默认情况下，这两条链路分别基于 TCP 协议和 UDP 协议，这种设计使得任何一条链路出现网络问题都不会影响传输效果。相较于其他基于 WebSocket 的消息传输方案，RTM 的冗余链路设计能够最大程度地提升传输稳定性和消息到达率。

在某些情况下，用户可能会发现他们的网络不支持 UDP 端口的传输，这可能是暂时的，也可能是永久性的。在这种情况下，为了确保双链路设计能够最大程度地发挥作用，SDK 允许用户将两条链路都配置成 TCP 协议，只需在 `RtmConfig` 中设置 `protocolType` 字段即可。以下是一个将双链路都配置为 TCP 协议的代码示例：

## 安装 SDK [#install]
你可以通过以下方式获取最新的 RTM HarmonyOS SDK。

详细流程参考[快速开始](../../get-started/quick-start)。

## 初始化 RTM 实例

在使用 RTM 功能前，你需要使用 `appId` 和 `userId` 来初始化一个 RTM 实例。在后续的示例代码中，你需要将 `your_appId` 和 `your_userId` 字段都替换为你自己的 `appId` 和 `userId`。

> **信息**
> 初始化 RTM 对象时的 `appId` 和 `userId` 为必填参数，如果缺失，则初始化会失败。

在一个客户端中，你只需要初始化一次 RTM 对象实例，即可在后续实现中通过该对象实例调用 RTM 的其他 API。

```typescript

const rtmConfig: RtmConfig = {
  appId: "your_appId",
  userId: "your_userId"
};

try {
  const rtmClient = new RtmClient(rtmConfig);
  console.log("RTM Client Initialize Successful");
} catch (error) {
  if (error instanceof RtmError) {
    console.error(`Initialize failed: $ (code: $)`);
  } else {
    console.error("Failed to initialize RTM client:", error);
  }
}
```

现在，你就可以使用 `RtmClient` 对象调用 RTM 的其他 API 接口了。

## 日志设置

当你的应用处于开发、测试阶段时，你可能需要 SDK 输出更详细的信息来定位并修复问题。你可以在初始化 RTM 实例的时候通过设置 `RtmConfig` 中的 `RtmLogLevel` 来开启日志输出并设置日志信息等级，之后即可在相应平台的日志输出位置查看日志信息。

```typescript

const logConfig: RtmLogConfig = {
  filePath: "./logfile/",
  fileSizeInKB: 512,
  level: RtmLogLevel.INFO
};

const rtmConfig: RtmConfig = {
  appId: "your_appId",
  userId: "your_userId",
  logConfig: logConfig
};

try {
  const rtmClient = new RtmClient(rtmConfig);
  console.log("RTM Client Initialize Successful");
} catch (error) {
  if (error instanceof RtmError) {
    console.error(`Initialize failed: $ (code: $)`);
  } else {
    console.error("Failed to initialize RTM client:", error);
  }
}
```

日志有以下五种等级：

> **信息**
> 在你的应用上线时，你需要将日志等级参数设置为 `INFO`。

|                           枚举值                            | 描述                                                                                         |
| --- | ------ |
| `NONE`  | `0x0000`: 不输出任何日志。                                                                   |
| `INFO`  | `0x0001`: 输出 `FATAL`、`ERROR`、`WARN`、`INFO` 级别的日志。我们推荐你将日志级别设为该等级。 |
| `WARN`  | `0x0002`: 仅输出 `FATAL`、`ERROR`、`WARN` 级别的日志。                                       |
| `ERROR` | `0x0004`: 仅输出 `FATAL`、`ERROR` 级别的日志。                                               |
| `FATAL` | `0x0008`: 仅输出 `FATAL` 级别的日志。                                                        |

## Proxy 设置

在一些网络服务受限的环境下，你可能需要设置代理服务才能访问外部资源。RTM 支持设置 Proxy 代理服务，你只需要在初始化 RTM 实例的时候开启这项功能即可。

## 防火墙白名单设置

大型企业、医院、高校、银行等安全需求较高的机构会部署防火墙将办公环境与外网隔离开来，保护内部信息安全。为避免这些企业用户因防火墙无法使用声网的服务，你需要设置防火墙白名单。

> **信息**
> 本节展示的目标端口可能会根据实际情况调整。如果遇到问题，联系 rtm-support@agora.io。

### Message Channel

Message Channel 是 RTM 的基础服务，只要你使用了 RTM，就需要将以下内容添加到防火墙白名单：

#### 域名

```shell
.agora.io
```

#### 端口

| 目标端口 | 协议 | 操作 |
| --------------- | ------------ | ------------ |
| 443; 7384; 8443; 9130; 9131; 9136; 9137; 9140, 9141 | TCP | 允许 |
| 1080; 3000; 8000; 8130; 8443; 9120; 9121; 9700; 25000 | UDP | 允许 |

### Stream Channel

如果你还使用了 Stream Channel，你还需要将以下内容添加到防火墙白名单：

#### 端口

| 目标端口 | 协议 | 操作 |
| --------------- | ------------ | ------------ |
| 4001 - 4150 | UDP | 允许 |
