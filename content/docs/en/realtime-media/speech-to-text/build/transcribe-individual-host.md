---
title: "Transcribe specified hosts"
description: "Transcribe the speech of specific channel hosts only"
---

Real-Time STT supports 2 transcription modes:

- Channel-based transcription for all active hosts in a channel. To enable it, see [REST Quickstart](/en/ai/apps/get-started/quickstart).
- Transcription of the specified hosts audio only and ignoring all other hosts.

This page explains how to implement transcription of specified hosts only.

## Prerequisites

To follow this procedure, you must:

- Have a valid [Agora Account](https://console.agora.io/v2).

- Have a valid Agora project with an app ID and a temporary token or a token
server. For details, see [Agora account management](https://docs.agora.io/en/voice-calling/get-started/manage-agora-account).

- Have a computer with access to the internet. If your network has a firewall, follow the steps in [Firewall requirements](../reference/firewall).

- Join a Video SDK channel as a host and start streaming. Refer to the [Voice SDK quickstart](https://docs.agora.io/en/voice-calling/get-started/get-started-sdk) guide.
- Make sure Real-Time STT is enabled for your app.

## Implementation

To transcribe a specific host, follow the API call sequence from the [REST Quickstart](/en/ai/apps/get-started/quickstart) and modify the `start` request to add the `subscribeAudioUids` parameter as follows:

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
        "pubBotToken": "<YourPublishToken>",
        "subscribeAudioUids": ["123", "456"]
    }
}'
```

Alternatively, you can specify the user IDs for the audio streams you do not want to subscribe in the `unSubscribeAudioUids` parameter. You can set either `subscribeAudioUids` or `unSubscribeAudioUids`.
