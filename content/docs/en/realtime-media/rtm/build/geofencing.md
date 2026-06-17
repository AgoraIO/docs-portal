---
title: "Restrict media zones"
description: "Control and customize Signaling data routing in your app"
---

To comply with local laws and regulations, you can restrict user connections to specific geographic zones. Agora enables you to control data routing in your app by specifying the Agora SDRTN zones that users can connect to.

## Understand the tech

When you set area codes in your client configuration, the SDK only accesses the Agora server in the specified zone or zones, irrespective of the geographical location of the user.

The following zones are available:

- `GLOB`: Global
- `NA`: North America
- `CN`: Mainland China
- `AS`: Asia excluding Mainland China
- `EU`: Europe
- `IN`: India
- `JP`: Japan

## Prerequisites

Ensure that you have implemented the [SDK quickstart](../index.mdx) in your project.

## Configure geographical zones

To configure geographical access, specify area codes in the configuration when you initialize a Signaling client instance.

```java
RtmConfig rtmConfig = new RtmConfig.Builder("<your_app_id>", "<your_user_Id>")
    .areaCode(EnumSet.of(RtmConstants.RtmAreaCode.AS, RtmConstants.RtmAreaCode.CN))
    .eventListener(eventListener)
    .build();
```

```kotlin
val rtmConfig = RtmConfig.Builder("appid", "userId")
    .areaCode(EnumSet.of(RtmConstants.RtmAreaCode.AS, RtmConstants.RtmAreaCode.CN))
    .eventListener(eventListener)
    .build()
```

## Reference

### API reference

- [API reference](https://docs.agora.io/en/signaling/reference/api)
