---
title: "Real-time translation (Beta)"
description: "Translate transcription text to multiple languages."
---

In addition to transcribing the host's audio in real time, Real-Time STT also supports translation during transcription. For example, in an international conference use-case, you can transcribe the host's speech, translate the transcribed content, and then push both the original text and the translation back to the channel as subtitles.

## Understand the tech

Following are the key features of real-time translation:

- **Instant translation**
  Live speech-to-text translation to keep conversations flowing seamlessly in real-time communication or live streaming.

- **Multi-language support**
  Manage multilingual interactions with speech translation from up to 4 source languages into 10 target languages for each source.

- **High accuracy**
  Advanced Speech Recognition (ASR) captures spoken language and converts it accurately to text using sophisticated recognition technologies.

- **Translated captions**
  Live captions are continually updated during speech, providing readable, translated text. Video Text Track (VTT) files can be stored in the cloud for future reference, AI analysis, or compliance.

- **Ultra-low Latency translation**
  Seamless translation with an end-to-start latency of under 1 second and average end-to-end latency of under 3 seconds.

- **LLM integration**
  Process transcribed text using large language models (LLMs) to generate translation text, enhancing the Quality of Experience (QoE) to match that of a native speaker. Incorporate additional AI services to improve accuracy and reduce latency.

This page shows you how to set up translation of the transcribed content when starting a transcription task.

## Prerequisites

To follow this guide, first implement basic speech-to-text transcription by following the [Rest quickstart](../../get-started/quickstart).

## Implementation

When calling `start` to start a transcription task, set `translateConfig` to translate the transcribed text content.

### Sample request

The following example shows you how to set up translation when transcribing. The example includes the URL, header, and body. To record and encrypt at the same time in the transcription task, refer to [Record captions](../process-transcription-data/record-captions) and [Encrypt captions](../process-transcription-data/encrypt-captions).

```bash
curl --location --request POST 'https://api.agora.io/api/speech-to-text/v1/projects/{appid}/join' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: <credentials>' \
--data '{
    "name": "unique-agent-id",
    "languages": [
        "en-US"
    ],
    "maxIdleTime": 50,
    "rtcConfig": {
        "channelName": "<YourChannelName>",
        "subBotUid": "<YourSubscribeUid>",
        "pubBotUid": "<YourPublishUid>",
        "subscribeAudioUids": ["123", "456"]
    },
    "translateConfig": {
        "languages": [
            {
                "source": "en-US",
                "target": [
                    "ar-SA",
                    "id-ID",
                    "fr-FR",
                    "ja-JP"
                ]
            }
        ]
    }
}'
```

| Parameter      | Type         | Description                                |
|:---------------|:-------------|:-------------------------------------------|
| `source`         | string array | The source language for the translation. |
| `target`         | array        | The target languages for translation. You can configure up to 10 target languages per source language. See [Supported Languages](./translation#supported-languages) |

:::info
- A single transcription task supports translating up to 5 speakers simultaneously.

- **Single-language input**: If you set the source language to a single language, the target language must be different, otherwise an error is returned. For example, if you set the source language to English, you cannot set the target language to English.

- **Mixed-language input**: If you set the source language to mixed-language input, you can set the target language to one of the source languages. For example, if you set the source languages to Chinese and English, setting the target language to English translates both into English.
:::

### Sample response

```json
{
    "agent_id": "4xxxxx8f21486930fcb77a805af20752",
    "create_ts": 1730974708,
    "status": "RUNNING"
}
```

| Parameter Name | Type | Description |
|----------------|--------|-----------------------------------------|
| `agent_id` | String | The ID of the agent. |
| `create_ts` | Integer | The Unix timestamp (seconds) when the agent was created. |
| `status` | String | <Slot name="status" /> |

<Slot for="status">

Agent Status:

- `IDLE`: The agent is not initialized.
- `STARTING`: The agent is starting.
- `RUNNING`: The agent is running.
- `STOPPING`: The agent is exiting.
- `STOPPED`: The agent exited successfully.
- `RECOVERING`: The agent is recovering.
- `FAILED`: Agent exit failed.

</Slot>

To `query`, `update`, or `stop` the transcription task, refer to the [Rest quickstart](../../get-started/quickstart).

## Supported languages

For a full list of supported translation languages and their parameter values, see
[Supported languages](../../reference/supported-languages#real-time-translation).
