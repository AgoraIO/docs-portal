---
title: "Client configuration"
description: "Configure connection protocol, proxy, and log settings."
---

# Client configuration

Client configuration enables you to customize the behavior of your Signaling client instance according to your app's requirements. 

## Understand the tech

When initializing a Signaling client instance, configure any or all of the following features:

- **Geographical area access**  
    When a user joins a channel, Signaling SDK automatically connects them to the closest geographical region of Agora SDRTN®. However, to comply with local laws and regulations, you may want to specify or restrict connections to a specific geographical area. Agora enables you to control and customize data routing in your app by specifying the Agora SDRTN® region users connect to.

- **Private deployment**  
    Private deployment enables you to deploy and manage the Signaling environment on your own infrastructure rather than using Agora services. This feature is fully supported since version 2.2.0.

- **Logging**  
    Logging enables you to output detailed information from the SDK for locating and fixing problems during the development and testing phases. By configuring logging settings, you can control the amount and type of information logged by the SDK.

- **Data encryption**  
    Enabling encryption ensures that only authorized users are able to read messages sent through Signaling. Signaling provides built-in encryption methods that guarantee data confidentiality during transmission. For implementation details, see [Data encryption](https://docs.agora.io/en/signaling/core-functionality/data-encryption).

## Prerequisites

Ensure that you have integrated the Signaling SDK in your project and implemented the framework functionality from the [SDK quickstart](sdk-quickstart.mdx) page.

## Configure the client instance

This section explains how to set up and customize various features when you initialize a Signaling client instance.

### Geographical area configuration

To specify a geographical area for Agora SDRTN® connections, refer to the following code:

**Java**
```java
RtmConfig rtmConfig = new RtmConfig.Builder("appid", "userId")
    .areaCode(EnumSet.of(RtmConstants.RtmAreaCode.AS, RtmConstants.RtmAreaCode.CN))
    .eventListener(eventListener)
    .build();
```

**Kotlin**
```kotlin
val rtmConfig = RtmConfig.Builder("appid", "userId")
    .areaCode(EnumSet.of(RtmConstants.RtmAreaCode.AS, RtmConstants.RtmAreaCode.CN))
    .eventListener(eventListener)
    .build()
```

### Private deployment configuration

Agora is committed to offering its customers flexible, secure, and customizable solutions. Since version `2.2.0`, Signaling supports private deployments. This feature enables you to deploy and manage the Signaling environment yourself, giving you more control over your data and systems. 

Signaling provides `MESSAGE` and `STREAM` services. Choose one or both services based on your needs and budget. The following code shows you how to configure a private environment that deploys both services simultaneously:

**Java**
```java
ArrayList<String> hosts = new ArrayList<>();
hosts.add("x.x.x.x"); // your access point hosts list.
RtmPrivateConfig privateConfig = new RtmPrivateConfig();
privateConfig.serviceType = EnumSet.of(RtmServiceType.MESSAGE, RtmServiceType.STREAMING);
privateConfig.accessPointHosts = hosts;

RtmConfig rtmConfig = new RtmConfig.Builder("appid", "userId")
    .privateConfig(privateConfig)
    .build();
```

**Kotlin**
```kotlin
val hosts = arrayListOf("x.x.x.x") // your access point hosts list.
val privateConfig = RtmPrivateConfig().apply {
    serviceType = EnumSet.of(RtmServiceType.MESSAGE, RtmServiceType.STREAMING)
    accessPointHosts = hosts
}

val rtmConfig = RtmConfig.Builder("appid", "userId")
    .privateConfig(privateConfig)
    .build()
```

:::info
To deploy a private environment, you need to set up the backend service. For assistance, please contact [technical support](mailto:support@agora.io).

:::

### Connection protocol

To ensure connection stability and continuous service availability, the RTM client establishes two transmission links for each service (`MESSAGE` service and `STREAM` service) when connecting to the edge server. By default, these links use the TCP and UDP protocols, respectively. This design ensures that network issues on one link do not affect the overall transmission. Compared to other WebSocket-based message transmission solutions, RTM's redundant link design maximizes transmission stability and message delivery rate.

In some cases, users may find that their network does not support UDP port transmission, either temporarily or permanently. To ensure the dual-link design operates effectively, the SDK allows users to configure both links to use the TCP protocol. This can be done by setting the `protocolType` field in the `RtmConfig`. Below is a code example that configures both links to use the TCP protocol:

**Java**
```java
RtmConfig rtmConfig = new RtmConfig.Builder("appid", "userId")
    .protocolType(RtmProtocolType.TCP_ONLY)
    .build();
```

**Kotlin**
```kotlin
val rtmConfig = RtmConfig.Builder("appid", "userId")
    .protocolType(RtmProtocolType.TCP_ONLY)
    .build()
```

:::info
The SDK does not support configuring both links to use the UDP protocol simultaneously.

:::

### Log configuration

In the development and testing phase of your app, you may need to output more detailed information to locate and fix problems. Enable log output of the SDK and set the log information level by configuring `RtmLogLevel` when initializing the Signaling client instance. 

**Java**
```java
RtmLogConfig logConfig = new RtmLogConfig();
// Set log file path
logConfig.filePath = "./logfile/";
// Set log file size
logConfig.fileSizeInKB = 512;
// Set log report level
logConfig.level = RtmLogLevel.INFO;

RtmConfig rtmConfig = new RtmConfig();
rtmConfig.userId = "your_userId";
rtmConfig.appId = "your_appId";
rtmConfig.logConfig = logConfig; // Set log config

// Initialize the client instance
try {
    mRtmClient = RtmClient.create(rtmConfig);
} catch(Exception e) {
    log(INFO, "create rtm client failed with exception: " + e.toString());
}
```

**Kotlin**
```kotlin
val logConfig = RtmLogConfig().apply {
    filePath = "./logfile/" // Set log file path
    fileSizeInKB = 512 // Set log file size
    level = RtmLogLevel.INFO // Set log report level
}

val rtmConfig = RtmConfig().apply {
    userId = "your_userId"
    appId = "your_appId"
    logConfig = logConfig // Set log config
}

// Initialize the client instance
try {
    mRtmClient = RtmClient.create(rtmConfig)
} catch (e: Exception) {
    log(INFO, "create rtm client failed with exception: " + e.toString())
}
```

Choose the log level from the following: 

| Enumeration value | Description   |
|----------|------------------------|
| `NONE`      | `0x0000`: Do not output any logs.    |
| `INFO`      | `0x0001`: Output logs of levels `FATAL`, `ERROR`, `WARN`, and `INFO`. Best practice is to set the log level to this option. |
| `WARN`      | `0x0002`: Only output logs of levels `FATAL`, `ERROR`, and `WARN`.  |
| `ERROR`     | `0x0004`: Only output logs of levels `FATAL` and `ERROR`. |
| `FATAL`     | `0x0008`: Only output logs at the `FATAL` level.   |

:::info
When your app is released to production, set the log level to `INFO`.

:::

## Reference
This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

For firewall configuration, see [firewall requirements](../reference/firewall.md)