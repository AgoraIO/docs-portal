---
title: 数据安全
description: 数据安全，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

RTM 对用户的数据及隐私安全极为重视，传输层 TLS 加密和客户端 256 位 AES 加密可以为用户数据提供有效保护。此外，RTM 还通过了 GDPR，SOC2 Type II 等安全合规认证。

RTM 在以下几个方面为用户应用提供安全保护：

- **传输层加密**：用户客户端和服务器端与 RTM 服务器之间数据传输采用 TLS 加密。
- **消息加密**：用户每一条消息都提供了端到端的 `RTM_ENCRYPTION_MODE_AES_256_GCM` 加密保护。
- **Token 权限控制**：提供基于时间限制的访问权限控制策略，确保客户端在可控状态下访问 RTM 资源。

## 传输层加密

RTM 提供了基于 TLS 加密的传输层安全保护，此功能默认开启且不可关闭。

## 端侧消息加密

如果你的应用对数据安全具有高敏感度，或者你的应用需要符合 HIPAA 或 SOC2 Type II 等安全合规要求，就需要消息级别的加密。为了达到更高级别的信息安全性，我们推荐你将 TLS 加密和端到端 AES 加密结合使用。

SDK 内置 `RTM_ENCRYPTION_MODE_AES_256_GCM` 加密算法，你只需要在初始化 RTM 实例的时候配置加密模式、加密密钥和盐，即可自动开通端到端加密和解密功能。此功能一旦开启，同一个 App ID 下，你在所有频道发送的消息都会被 SDK 自动加密和解密。示例代码如下：

```cpp
RtmConfig config;
config.appId = "your_appid";
config.userId = "your_name";
config.eventHandler = new RtmEventHandler();

uint8_t salt[32] = ;
cfg.encryptionConfig.encryptionKey = "your_key";
cfg.encryptionConfig.encryptionMode = RTM_ENCRYPTION_MODE_AES_256_GCM;
memcpy(cfg.encryptionConfig.encryptionSalt, salt, 32);

int errorCode = 0;
IRtmClient* rtmClient = createAgoraRtmClient(config, errorCode);
```

一旦开启消息加密，你的消息会在传输的每一个环节中都受到保护。SDK 会在消息传输之前对其进行加密，并在被订阅的客户端接收时，以相同的加密模式、加密密钥和盐对其进行解密。此外，即使消息在 RTM 服务器中被暂时存储，它也会受到加密保护，任何人在没有密钥和盐的情况下都无法破解。

需要注意的是，一旦通过配置 `encryptionMode` 参数开启了自动加解密的功能，同一个 App ID 下所有的应用都需要开启该功能，并且使用相同的加解密参数，否则会出现订阅者收到消息无法解密的问题。

> **信息**
> 有些情况下自动加解密可能会影响你的功能。例如，如果你使用移动推送通知，RTM 将无法读取消息负载中提供的移动推送密钥和值，因为它已被加密。在这种情况下，你只需要加密消息负载中的敏感数据，而将其他数据片段保留为明文。我们将会在后续版本中提供这样部分加密的功能。
