---
title: "Restrict media zones"
description: "Restrict access to Agora servers in the specified region"
---

# Restrict media zones

To meet the laws and regulations of different countries or regions, the Agora Video SDK supports geofencing. After enabling geofencing, the SDK only connects to Agora servers within the specified region, regardless of where your app users are located.

For example, if you specify North America as the region for connection, when two users attempt to connect to Agora servers from different locations, the result is as follows:

| Specified region for connection | App user location | Actual region for connection | User experience after connection |
| --- | --- | --- | --- |
| North America | North America | North America | Normal |
| North America | China | North America | There may be a significant impact on user experience. Due to the cross-region public Internet between the designated area and the area where the app user is located, poor quality of the public Internet network affects the audio and video experience. If the servers in the specified area are not available, the SDK reports an error directly. |

:::info
Restricted media zones is an advanced feature of the SDK. Use it only when required for use-cases with access security restrictions.
:::

## Implementation

When you specify an access area, audio, video and message data is not accessed from servers outside the specified area.

To specify the region for connection, when initializing an `IAgoraService` instance by calling `initialize`, set the `areaCode` parameter in `AgoraServiceConfiguration`. The following area codes are available:

- `AREA_CODE_GLOB`: Global (Default)
- `AREA_CODE_CN`: Mainland China
- `AREA_CODE_NA`: North America
- `AREA_CODE_EU`: Europe
- `AREA_CODE_AS`: Asia, excluding Mainland China
- `AREA_CODE_JP`: Japan
- `AREA_CODE_IN`: India

:::info
Area codes support bitwise operations.
:::

Refer to the following sample code to specify an access area:

```cpp
// Create an IAgoraService object
auto service = createAgoraService();

agora::base::AgoraServiceConfiguration scfg;
scfg.enableAudioProcessor = true;
scfg.enableAudioDevice = false;
scfg.enableVideo = true;
scfg.useStringUid = false;

// Specify North America as the region for connection
scfg.areaCode = agora::rtc::AREA_CODE_NA;

// Initialize the IAgoraService instance
service->initialize(scfg);
```
