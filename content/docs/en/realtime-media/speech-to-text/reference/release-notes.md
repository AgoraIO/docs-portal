---
title: "Release notes"
description: "New features, improvements and resolved issues for Real-time STT."
---

## Releases

### v7.2.3

Released on August 5, 2026

#### New features

Included in this release: 

- **New webhook event for an expiring RTC Token**

  This version adds the [`104 token will expire`](/en/api-reference/api-ref/speech-to-text/api-callback-service#event-104-token-will-expire) event. The Notifications service sends this event to your server when the RTC Token used by the Real-Time STT engine has 30 seconds remaining before it expires. Agora does not send this event if the RTC Token's validity period is 30 seconds or less. This event provides advance notification only; it does not end the task or change the task's final status.

#### Upgrade notes

- **Updated idle timeout and maximum task lifetime rules**

  This version updates the rules for the [`maxIdleTime`](/en/api-reference/api-ref/speech-to-text/join) parameter: the valid range changes to `[0,259200]` seconds, and setting `maxIdleTime` to `0` disables automatic termination due to idle time.

  Independent of `maxIdleTime`, every task also has a maximum lifetime, capped at 72 hours. When a task reaches this limit, Agora terminates it, even if `maxIdleTime` is `0`. When a task exits because it reached the maximum lifetime, the [`102 agent left`](/en/api-reference/api-ref/speech-to-text/api-callback-service#event-102-agent-left) event returns `Task exceeded maximum lifetime` in the `message` field.

- **Transcription and translation results can return stable and interim segments together**

  Transcription and translation results can now contain both a stabilized prefix segment and a segment that may still change within the same update. To support this, the `transcript` and `translation` messages add a new `results[]` field that returns one or more segments. For a single segment, `results[]` has a length of `1`; for a mixed result, `results[]` can have a length greater than `1`.

  If your client uses the JSON protocol, iterate over `results[]` to process each segment, and handle messages where `results[]` is an empty array. The Protobuf protocol fields are unchanged, but a single message can now also carry multiple segments. For field descriptions and examples, see [JSON protocol data structure](/en/realtime-media/speech-to-text/build/process-transcription-data/parse-data#json-protocol-data-structure).

### v7.2.2

Released on May 18, 2026

#### New features

Included in this release:

- **Support for additional languages**

  This version expands the supported language lists for real-time transcription and real-time translation. See [Supported languages](./supported-languages) for the full list.

#### Upgrade notes

- **Updated target language configuration rules for real-time translation**

  This version updates the rules for configuring source and target languages in real-time translation, for both single-language and mixed-language input scenarios:

  - **Single-language input**: If you set the source language to a single language, the target language must be different, otherwise an error is returned. For example, if you set the source language to English, you cannot set the target language to English.

  - **Mixed-language input**: If you set the source language to mixed-language input, you can set the target language to one of the source languages. For example, if you set the source languages to Spanish and English, setting the target language to English translates both into English.

### v7.2.1

Released on April 20, 2026

#### New Features

Included in this release:

- **Support for caption storage**

  This version adds support for writing recorded subtitles to standard S3-compatible object storage. You can configure parameters such as `endpoint`, `type`, and `provider` in the `captionConfig.extensionParams` of the transcription request to connect to S3-compatible storage services such as MinIO, as well as some self-hosted object storage. See [Record captions](../build/process-transcription-data/record-captions) for details.

- **Agent list API**

  This version adds a [List Real-time STT agents](../../../api-reference/speech-to-text/restful/list) API. Use it to retrieve real-time transcription and translation tasks that meet specified criteria by channel, time range, and task status.

### v7.2

Released on March 30, 2026

#### New Features

Included in this release:

- **Keywords functionality**

  The transcription API now supports configuring `keywords` to improve the recognition accuracy of specific words such as proper nouns and industry terms. You can configure up to 500 keywords per request. To specify keywords, pass the list in the `keywords` parameter of the request body when creating a transcription task or real-time transcription service.

- **Unique `sentence_id`**

  When parsing transcription data, each subtitle carries a unique identifier `sentence_id`. When both original and translated subtitles are enabled, use this ID to match original and translated subtitles for the same sentence, ensuring accurate subtitle alignment.

### v7.0

Released on May 1, 2025

#### Improvements

This release includes the following enhancements:

- Supports updating the configuration of the STT agent.
- Enhances the scalability of STT by supporting multiple endpoints.
- API deprecations. Refer to the API reference for details.
