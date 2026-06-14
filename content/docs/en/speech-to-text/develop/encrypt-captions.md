---
title: "Encrypt captions"
description: "Encrypt the captions transcribed with RTT"
---

Sometimes audio and video streams are encrypted for security reasons. In this case, Real-Time STT uses a key to decrypt the audio stream for transcription and then encrypt the captions in the data stream payload. The app then uses the same key to decrypt the data stream payload and extract the captions on the client's side.

This page explains how to implement caption text encryption in your app.

## Prerequisites

To follow this procedure, you must:

- Have a valid [Agora Account](https://console.agora.io/v2).

- Have a valid Agora project with an app ID and a temporary token or a token
server. For details, see [Agora account management](https://docs.agora.io/en/voice-calling/get-started/manage-agora-account).

- Have a computer with access to the internet. If your network has a firewall, follow the steps in [Firewall requirements](../reference/firewall).

- Join a Video SDK channel as a host and start streaming. Refer to the [Voice SDK quickstart](https://docs.agora.io/en/voice-calling/get-started/get-started-sdk) guide.
- Make sure Real-Time STT is enabled for your app.

- Be using Video SDK for native platforms v4.2.6.3 or for web v4.20.1 with support for `datastreamEncryptionEnabled`.

## Implementation

To encrypt the captions, follow the API call sequence from the [REST Quickstart](../get-started/quickstart) and modify the `start` request to include encryption parameters as follows:

```shell
curl --location --request POST 'https://api.agora.io/api/speech-to-text/v1/projects/{appId}/join' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic <credentials>' \
--data '{
  "name": "unique-agent-id",
  "languages": [
    "en-US"
  ],
  "maxIdleTime": 50,
  "rtcConfig": {
    "channelName": "<YourChannelName>",
    "subBotUid": "<YourSubscribeUid>",
    "subBotToken": "<YourSubscribeToken>",
    "pubBotUid": "<YourPublishUid>",
    "pubBotToken": "<PublishToken-IfRequired>",
    "cryptionMode": 7,
    "secret": "32-byte-encryption-key",
    "salt": "base64-encoded-32-byte-salt-if-mode-7-or-8"
  }
}'
```

## Encryption mode

|Code|Encryption method|Description|
|---|---|---|
| 0 |  No Encryption |  |
| 1 | `AES_128_XTS` | 128-bit AES encryption, XTS mode. |
| 2 | `AES_128_ECB` | 128-bit AES encryption, ECB mode. |
| 3 | `AES_256_XTS` | 256-bit AES encryption, XTS mode. |
| 4 | `SM4_128_ECB` | 128-bit SM4 encryption, ECB mode. |
| 5 | `AES_128_GCM` | 128-bit AES encryption, GCM mode. |
| 6 | `AES_256_GCM` | 256-bit AES encryption, GCM mode. |
| 7 | `AES_128_GCM2` | 128-bit AES encryption, GCM mode. Requires the setting of salt. |
| 8 | `AES_256_GCM2` | 256-bit AES encryption, GCM mode. Requires the setting of salt. |
