---
title: Geofencing
description: "To comply with the laws and regulations of different countries and regions, Agora Conversational AI Engine supports geofencing. After geofencing is enabled, regardless of where users access your app, the Conversational AI Engine can only access Agora servers in the specified region."
---

# Geofencing

To comply with the laws and regulations of different countries and regions, Agora Conversational AI Engine supports geofencing. After geofencing is enabled, regardless of where users access your app, the Conversational AI Engine can only access Agora servers in the specified region.

For example, if you specify North America as the allowed region and two users start calls from North America and China respectively:

| Configured Region | User Region | Actual Access Region | User Experience After Connection |
| --- | --- | --- | --- |
| North America | North America | North America | Normal |
| North America | Singapore | North America | The experience may be significantly affected. Because public Internet traffic must cross regions between the specified region and the user's region, poor public Internet quality may degrade the audio and video experience.<p>If all servers in the specified region are unavailable, the service returns an error directly.</p> |

## Default Behavior

When geofencing is not enabled or when `GLOBAL` geofencing is used, the Conversational AI Engine automatically selects the nearest server based on the IP address of the LLM URL and supports failover:

1. **Intelligent deployment**: The system automatically starts the Conversational AI Engine service in the appropriate region according to the IP address corresponding to the configured LLM URL.
2. **Nearest available region**: If no server is available in the corresponding region, the system automatically selects the nearest available region.
3. **Failover**: If the service in one region becomes unavailable, the system automatically switches to another available region.

> Note
> After geofencing is enabled, the default behavior above no longer applies. The system strictly limits access to the specified region and does not perform cross-region failover.

## Implementation

### Configure Conversational AI Engine Geofencing

When calling the [Create a Conversational AI Agent API](../operations/start-agent.md), configure geofencing through the `properties.geofence` field.

#### Parameter Description

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `area` | String | Yes | Allowed region. Supported values:<br>- `GLOBAL`: Global<br>- `NORTH_AMERICA`: North America<br>- `EUROPE`: Europe<br>- `ASIA`: Asia<br>- `INDIA`: India<br>- `JAPAN`: Japan |
| `exclude_area` | String | No | Region to exclude. Available only when `area` is `GLOBAL`. Supported values:<br>- `NORTH_AMERICA`: North America<br>- `EUROPE`: Europe<br>- `ASIA`: Asia<br>- `INDIA`: India<br>- `JAPAN`: Japan |

#### Configuration Examples

**Example 1: Allow access only in North America**

```json
{
  "name": "customer_service",
  "properties": {
    "channel": "test_channel",
    "token": "your_rtc_token",
    "agent_rtc_uid": "123",
    "remote_rtc_uids": ["456"],
    "geofence": {
      "area": "NORTH_AMERICA"
    },
    "llm": {
      // ... LLM configuration
    },
    "tts": {
      // ... TTS configuration
    }
  }
}
```

**Example 2: Global access but excluding India**

```json
{
  "name": "customer_service",
  "properties": {
    "channel": "test_channel",
    "token": "your_rtc_token",
    "agent_rtc_uid": "123",
    "remote_rtc_uids": ["456"],
    "geofence": {
      "area": "GLOBAL",
      "exclude_area": "INDIA"
    },
    "llm": {
      // ... LLM configuration
    },
    "tts": {
      // ... TTS configuration
    }
  }
}
```

### Configure RTC Geofencing

Agora Conversational AI Engine geofencing and Agora RTC geofencing are **configured independently**. If you need true end-to-end geofencing so that the entire audio and video interaction path with the agent stays within a specified region, also refer to [RTC Geofencing](https://doc.shengwang.cn/doc/rtc-server-sdk/cpp/advanced-features/set-region).

## Data Residency

In addition to configuring geofencing for the Conversational AI Engine, some LLM, TTS, and ASR providers also offer data residency services in different regions. You can ensure data is not transmitted across regions by configuring the URLs used by the LLM, TTS, and ASR modules.

For example, ElevenLabs supports selecting different data processing regions through different URL endpoints. For details, see the [ElevenLabs documentation](https://elevenlabs.io/docs/overview/administration/data-residency).

The following example shows how to configure the ElevenLabs TTS service by using a European-region URL endpoint:

```json
{
  "properties": {
    "tts": {
      "vendor": {
        "name": "elevenlabs"
      },
      "url": "wss://api.eu.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input"
    }
  }
}
```

### Best Practices

To ensure that data fully resides in the specified region, Agora recommends the following:

1. **Configure Conversational AI Engine geofencing**: Use the `geofence` parameter to limit the access region of Conversational AI Engine servers.
2. **Configure RTC geofencing**: Configure the corresponding regional access restrictions in the RTC SDK.
3. **Choose region-aware AI services**: When configuring LLM, TTS, and ASR, choose vendors that support regional data residency and use URL endpoints for the corresponding region.
4. **Validate the configuration**: Fully test whether geofencing is effective before deploying to production, and ensure data is not unintentionally transmitted across regions.

## Notes

1. **Performance impact**: Geofencing may affect user experience. If the user's region is far from the specified region, network latency may increase.
2. **Service availability**: After geofencing is enabled, if the specified region has unavailable servers or insufficient resources, the service returns an error directly and does not switch automatically to another region.
3. **Configuration consistency**: Keep regional configuration consistent across the Conversational AI Engine, RTC SDK, and LLM, TTS, and ASR providers to avoid cross-region data transmission.
4. **Compliance requirements**: Before enabling geofencing, make sure you fully understand the legal and regulatory requirements of the target region and ensure the configuration complies with local data protection and privacy rules.
