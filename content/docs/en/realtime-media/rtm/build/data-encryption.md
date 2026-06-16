---
title: "Data encryption"
description: "Add Agora built-in encryption method to your app."
---

# Data encryption

Agora places great emphasis on the security of user data and privacy. Signaling provides TLS encryption at the transport layer and 256-bit AES encryption on the client side to effectively protect user data.

## Understand the tech

Signaling provides the following security features:

- **Transport layer encryption**: Data transmission between the client, server, and Signaling server is encrypted using TLS.
- **Message encryption**: Each message is protected with end-to-end encryption after you configure the encryption parameters.
- **Token authorization**: The SDK incorporates time-based access control strategies to ensure that only authorized users can access Signaling resources. For details, see [Secure authentication with tokens](authentication-workflow.md).

If your application requires enhanced data security, implement message-level encryption. Best practice is to use a combination of TLS encryption for data transmission and end-to-end AES encryption for messages.

## Prerequisites

Ensure that you have integrated the Signaling SDK in your project and implemented the framework functionality from [SDK quickstart](sdk-quickstart.mdx).

## Implement end-to-end message encryption

The Signaling SDK includes a built-in AES 256 GCM encryption algorithm. To enable end-to-end encryption and decryption, configure the encryption mode, encryption key, and salt parameters when initializing the Signaling client instance.

```java
RtmEncryptionConfig config = new RtmEncryptionConfig();
config.encryptionMode = RTM_ENCRYPTION_MODE.AES_256_GCM;
config.encryptionKey = "your_encryptionKey";
byte[] salt = your_salt;
config.encryptionSalt = salt;

RtmConfig rtmConfig = new RtmConfig();
rtmConfig.encryptionConfig = config;
rtmConfig.appId = "your_appId";
rtmConfig.userId = "your_userId";
mRtmClient = RtmClient.create(rtmConfig);
```

```kotlin
val config = RtmEncryptionConfig().apply {
    encryptionMode = RTM_ENCRYPTION_MODE.AES_256_GCM
    encryptionKey = "your_encryptionKey"
    encryptionSalt = your_salt
}

val rtmConfig = RtmConfig().apply {
    encryptionConfig = config
    appId = "your_appId"
    userId = "your_userId"
}

val mRtmClient = RtmClient.create(rtmConfig)
```

:::warning
Automatic encryption and decryption may impact some use-cases. For example, if you use mobile push notifications, Signaling cannot read the mobile push keys and values in the encrypted payload.
:::

## Reference

### API reference

- [API reference](https://docs.agora.io/en/signaling/reference/api)
