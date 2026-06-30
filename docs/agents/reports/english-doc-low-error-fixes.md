# English Doc Low-Error Fixes

- Scope: `content/docs/en/**`
- Base: latest `origin/main@115c385a`
- Branch: `codex/doc-lint-continuous-en-20260630`
- Fixed issues: 111

## HIGH content/docs/en/introduction/glossary.md:283

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/introduction/security-privacy.mdx:433

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/realtime-media/broadcast-streaming/build/apply-effects-and-enhancements/face-capture.mdx:8

- Problem type: number agreement
- Original: This guide is intended for use-cases where the facial capture extensions is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.
- Why suspicious: The page describes a single facial capture extension, so the plural noun is inconsistent with the singular verb and surrounding title/description.
- Suggested change: This guide is intended for use-cases where the facial capture extension is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.

## HIGH content/docs/en/realtime-media/broadcast-streaming/build/control-audio-and-devices/configure-audio-encoding.mdx:6

- Problem type: punctuation error and missing comma
- Original: Audio quality requirements vary with application use-case. For example. in professional use-cases such as radio stations and singing competitions users are particularly sensitive to audio quality. In such cases, support for dual-channel and high-quality sound is required. High-quality sound means setting a high sampling rate and a high bitrate to achieve realistic audio. Video SDK enables you to configure audio encoding properties to meet such requirements.
- Why suspicious: `For example` should be followed by a comma, and the introductory phrase before `users` needs a comma.
- Suggested change: Audio quality requirements vary with application use-case. For example, in professional use-cases such as radio stations and singing competitions, users are particularly sensitive to audio quality. In such cases, support for dual-channel and high-quality sound is required. High-quality sound means setting a high sampling rate and a high bitrate to achieve realistic audio. Video SDK enables you to configure audio encoding properties to meet such requirements.

## HIGH content/docs/en/realtime-media/broadcast-streaming/reference/glossary.md:284

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/realtime-media/broadcast-streaming/reference/security.md:373

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/realtime-media/cloud-recording/reference/release-notes.mdx:320

- Problem type: duplicated preposition
- Original: This release raises the maximum resolution of video sources for [web page recording](/en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode). The recorded web page can now contain video that has a resolution of up to of 1920 × 1080.
- Why suspicious: `Up to of` combines two incompatible prepositions.
- Suggested change: This release raises the maximum resolution of video sources for [web page recording](/en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode). The recorded web page can now contain video that has a resolution of up to 1920 × 1080.

## HIGH content/docs/en/realtime-media/cloud-recording/reference/security.mdx:423

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.mdx:349

- Problem type: wrong verb form
- Original: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.
- Why suspicious: The coordinated verbs should agree with the subject `you`: `extract` and `display`.
- Suggested change: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and display the location on the third-party map.

## HIGH content/docs/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.mdx:923

- Problem type: wrong verb form
- Original: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.
- Why suspicious: The coordinated verbs should agree with the subject `you`: `extract` and `display`.
- Suggested change: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and display the location on the third-party map.

## HIGH content/docs/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.mdx:1637

- Problem type: wrong verb form
- Original: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.
- Why suspicious: The coordinated verbs should agree with the subject `you`: `extract` and `display`.
- Suggested change: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and display the location on the third-party map.

## HIGH content/docs/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.mdx:3158

- Problem type: wrong verb form
- Original: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.
- Why suspicious: The coordinated verbs should agree with the subject `you`: `extract` and `display`.
- Suggested change: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and display the location on the third-party map.

## HIGH content/docs/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.mdx:3786

- Problem type: wrong verb form
- Original: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.
- Why suspicious: The coordinated verbs should agree with the subject `you`: `extract` and `display`.
- Suggested change: To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and display the location on the third-party map.

## HIGH content/docs/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/group-overview.md:39

- Problem type: wrong noun form
- Original: | Message history  | Agora Chat servers store message history, subject to the [data retention period of your package selection](../../../reference/pricing-plan-details#message). The history can be retrieved by your app server via [this RESTful API](..//en/api-reference/api-ref/im/message-management#retrieve-historical-messages), in the format of JSON files. You can call [this Client API](../../build-core-messaging/messages/retrieve-messages#retrieve-historical-messages-of-the-specified-conversation) to allow the SDK to retrieve message history of a chat group. This allows end users to synchronize messages history across multiple end devices.  | Agora Chat servers store message history, subject to the [data retention period of your package selection](../../../reference/pricing-plan-details#message). The history can be retrieved by your app server via [this RESTful API](..//en/api-reference/api-ref/im/message-management#retrieve-historical-messages), in the format of JSON files. Agora Chat currently does not support SDK retrieving message history of a chat room via client APIs. However, when a user joins a chat room, Agora Chat servers can send 10 most recent messages to the client side via the message receiving callback. To enable this function, you need to contact [support@agora.io](mailto:support@agora.io). The number of historical messages sent to the new chat room member can be increased up to 200, without additional charges.|
- Why suspicious: `Message history` is the expected compound noun.
- Suggested change: | Message history  | Agora Chat servers store message history, subject to the [data retention period of your package selection](../../../reference/pricing-plan-details#message). The history can be retrieved by your app server via [this RESTful API](..//en/api-reference/api-ref/im/message-management#retrieve-historical-messages), in the format of JSON files. You can call [this Client API](../../build-core-messaging/messages/retrieve-messages#retrieve-historical-messages-of-the-specified-conversation) to allow the SDK to retrieve message history of a chat group. This allows end users to synchronize message history across multiple end devices.  | Agora Chat servers store message history, subject to the [data retention period of your package selection](../../../reference/pricing-plan-details#message). The history can be retrieved by your app server via [this RESTful API](..//en/api-reference/api-ref/im/message-management#retrieve-historical-messages), in the format of JSON files. Agora Chat currently does not support SDK retrieving message history of a chat room via client APIs. However, when a user joins a chat room, Agora Chat servers can send 10 most recent messages to the client side via the message receiving callback. To enable this function, you need to contact [support@agora.io](mailto:support@agora.io). The number of historical messages sent to the new chat room member can be increased up to 200, without additional charges.|

## HIGH content/docs/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/group-overview.md:106

- Problem type: misspelling and missing article
- Original: Chat group owner or admin can add specifed group members to the group mute list. They can also remove them from list. Members on the mute list can no longer send chat group messages. Muted members still receive group messages.
- Why suspicious: `Specifed` is misspelled, and `remove them from list` is missing the article `the`.
- Suggested change: Chat group owner or admin can add specified group members to the group mute list. They can also remove them from the list. Members on the mute list can no longer send chat group messages. Muted members still receive group messages.

## HIGH content/docs/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/chatroom-overview.md:28

- Problem type: wrong noun form
- Original: | Message history  | Agora Chat servers store message history, subject to the [data retention period of your package selection](../../../reference/pricing-plan-details#message). The history can be retrieved by your app server via [this RESTful API](..//en/api-reference/api-ref/im/message-management#retrieve-historical-messages), in the format of JSON files. You can call [this Client API](../../build-core-messaging/messages/retrieve-messages#retrieve-historical-messages-of-the-specified-conversation) to allow the SDK to retrieve message history of a chat group. This allows end users to synchronize messages history across multiple end devices.  | Agora Chat servers store message history, subject to the [data retention period of your package selection](../../../reference/pricing-plan-details#message). The history can be retrieved by your app server via [this RESTful API](..//en/api-reference/api-ref/im/message-management#retrieve-historical-messages), in the format of JSON files. Agora Chat currently does not support SDK retrieving message history of a chatroom via client APIs. However, when a user joins a chat room, Agora Chat servers send 10 most recent messages to the client side via the message receiving callback. The number of historical messages sent to the new chat room member can be increased up to 200, without additional charges.|
- Why suspicious: `Message history` is the expected compound noun.
- Suggested change: | Message history  | Agora Chat servers store message history, subject to the [data retention period of your package selection](../../../reference/pricing-plan-details#message). The history can be retrieved by your app server via [this RESTful API](..//en/api-reference/api-ref/im/message-management#retrieve-historical-messages), in the format of JSON files. You can call [this Client API](../../build-core-messaging/messages/retrieve-messages#retrieve-historical-messages-of-the-specified-conversation) to allow the SDK to retrieve message history of a chat group. This allows end users to synchronize message history across multiple end devices.  | Agora Chat servers store message history, subject to the [data retention period of your package selection](../../../reference/pricing-plan-details#message). The history can be retrieved by your app server via [this RESTful API](..//en/api-reference/api-ref/im/message-management#retrieve-historical-messages), in the format of JSON files. Agora Chat currently does not support SDK retrieving message history of a chatroom via client APIs. However, when a user joins a chat room, Agora Chat servers send 10 most recent messages to the client side via the message receiving callback. The number of historical messages sent to the new chat room member can be increased up to 200, without additional charges.|

## HIGH content/docs/en/realtime-media/im/build/moderate-and-manage-client-behavior/callkit.mdx:218

- Problem type: wrong word
- Original: When a remote user joins the call, all the other users in the call receive the `onRemoteUserJoinChannel` callback. You need to look up the Chat user ID corresponding to the Agora UID in you app server.
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: When a remote user joins the call, all the other users in the call receive the `onRemoteUserJoinChannel` callback. You need to look up the Chat user ID corresponding to the Agora UID in your app server.

## HIGH content/docs/en/realtime-media/im/build/moderate-and-manage-client-behavior/callkit.mdx:703

- Problem type: wrong word
- Original: When receiving the `callDidJoinChannel:uid` or `remoteUserDidJoinChannel:uid:username:` callback, the user needs to look up the Chat user ID corresponding to the Agora UID in you app server. If the Chat user ID is found, construct a dictionary with Agora UID and Chat user ID and then set it to the app using `setUsers:channelName:`.
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: When receiving the `callDidJoinChannel:uid` or `remoteUserDidJoinChannel:uid:username:` callback, the user needs to look up the Chat user ID corresponding to the Agora UID in your app server. If the Chat user ID is found, construct a dictionary with Agora UID and Chat user ID and then set it to the app using `setUsers:channelName:`.

## HIGH content/docs/en/realtime-media/im/reference/console/data-metrics.md:108

- Problem type: misspelling
- Original: - Ths user cannot perform the operation without an admin permission.
- Why suspicious: `Ths` is a misspelling of `The`.
- Suggested change: - The user cannot perform the operation without an admin permission.

## HIGH content/docs/en/realtime-media/marketplace/reference/glossary.md:284

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/realtime-media/marketplace/reference/security.mdx:423

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/realtime-media/media-pull/reference/glossary.md:284

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/realtime-media/media-push/reference/glossary.md:284

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/realtime-media/media-push/reference/pricing.md:46

- Problem type: wrong word
- Original: The Agora streaming server charges you when transcoding the subscribed streams. **The transcoding fee is accumulative, depending on the category and type of the output media stream.**
- Why suspicious: `Cumulative` is the expected adjective for totals that add up over time.
- Suggested change: The Agora streaming server charges you when transcoding the subscribed streams. **The transcoding fee is cumulative, depending on the category and type of the output media stream.**

## HIGH content/docs/en/realtime-media/media-push/reference/security.md:433

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/realtime-media/on-premise-recording/manage-agora-account.mdx:9

- Problem type: article error
- Original: To join a On-Premise Recording session, you need an Agora App ID. This section shows you how to set up an Agora account, create an Agora project and get the required information from [Agora Console](https://console.agora.io/v2).
- Why suspicious: `On-Premise` starts with a vowel sound, so the article should be `an`.
- Suggested change: To join an On-Premise Recording session, you need an Agora App ID. This section shows you how to set up an Agora account, create an Agora project and get the required information from [Agora Console](https://console.agora.io/v2).

## HIGH content/docs/en/realtime-media/rtc-server-sdk/reference/glossary.md:284

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/realtime-media/rtc-server-sdk/reference/security.md:373

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/realtime-media/rtm/build/send-and-receive-messages/message-history.mdx:3

- Problem type: wrong noun form
- Original: description: "Retrieve Signaling messages history."
- Why suspicious: `Message history` is the expected compound noun.
- Suggested change: description: "Retrieve Signaling message history."

## HIGH content/docs/en/realtime-media/speech-to-text/reference/glossary.md:284

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/realtime-media/speech-to-text/reference/security.md:433

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/realtime-media/video/build/add-advanced-video-features/face-capture.mdx:10

- Problem type: number agreement
- Original: This guide is intended for use-cases where the facial capture extensions is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.
- Why suspicious: The page describes a single facial capture extension, so the plural noun is inconsistent with the singular verb and surrounding title/description.
- Suggested change: This guide is intended for use-cases where the facial capture extension is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.

## HIGH content/docs/en/realtime-media/video/build/add-advanced-video-features/face-capture.mdx:206

- Problem type: number agreement
- Original: This guide is intended for use-cases where the facial capture extensions is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.
- Why suspicious: The page describes a single facial capture extension, so the plural noun is inconsistent with the singular verb and surrounding title/description.
- Suggested change: This guide is intended for use-cases where the facial capture extension is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.

## HIGH content/docs/en/realtime-media/video/build/add-advanced-video-features/face-capture.mdx:363

- Problem type: number agreement
- Original: This guide is intended for use-cases where the facial capture extensions is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.
- Why suspicious: The page describes a single facial capture extension, so the plural noun is inconsistent with the singular verb and surrounding title/description.
- Suggested change: This guide is intended for use-cases where the facial capture extension is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.

## HIGH content/docs/en/realtime-media/video/build/add-advanced-video-features/face-capture.mdx:525

- Problem type: number agreement
- Original: This guide is intended for use-cases where the facial capture extensions is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.
- Why suspicious: The page describes a single facial capture extension, so the plural noun is inconsistent with the singular verb and surrounding title/description.
- Suggested change: This guide is intended for use-cases where the facial capture extension is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.

## HIGH content/docs/en/realtime-media/video/reference/glossary.mdx:283

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/realtime-media/video/reference/release-notes.mdx:2446

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/video/reference/release-notes.mdx:4183

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/video/reference/release-notes.mdx:6232

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/video/reference/release-notes.mdx:7871

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/video/reference/release-notes.mdx:9545

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/video/reference/release-notes.mdx:11241

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `earMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `earMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/video/reference/release-notes.mdx:13088

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/video/reference/release-notes.mdx:14821

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/video/reference/release-notes.mdx:15849

- Problem type: missing space
- Original: To simplify integration, as of this release, you can use the SDK to enable Android users to use Bluetooth normally without adding the `BLUETOOTH_CONNECT`permission.
- Why suspicious: The permission noun is joined directly to the inline code span.
- Suggested change: To simplify integration, as of this release, you can use the SDK to enable Android users to use Bluetooth normally without adding the `BLUETOOTH_CONNECT` permission.

## HIGH content/docs/en/realtime-media/video/reference/security.mdx:423

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/realtime-media/voice/build/control-audio-and-devices/configure-audio-encoding.mdx:6

- Problem type: punctuation error and missing comma
- Original: Audio quality requirements vary with application use-case. For example. in professional use-cases such as radio stations and singing competitions users are particularly sensitive to audio quality. In such cases, support for dual-channel and high-quality sound is required. High-quality sound means setting a high sampling rate and a high bitrate to achieve realistic audio. Voice SDK enables you to configure audio encoding properties to meet such requirements.
- Why suspicious: `For example` should be followed by a comma, and the introductory phrase before `users` needs a comma.
- Suggested change: Audio quality requirements vary with application use-case. For example, in professional use-cases such as radio stations and singing competitions, users are particularly sensitive to audio quality. In such cases, support for dual-channel and high-quality sound is required. High-quality sound means setting a high sampling rate and a high bitrate to achieve realistic audio. Voice SDK enables you to configure audio encoding properties to meet such requirements.

## HIGH content/docs/en/realtime-media/voice/reference/glossary.md:284

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/realtime-media/voice/reference/release-notes.mdx:404

- Problem type: wrong compound phrase
- Original:     This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:     This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/voice/reference/release-notes.mdx:1520

- Problem type: wrong compound phrase
- Original:     This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:     This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/voice/reference/release-notes.mdx:2577

- Problem type: wrong compound phrase
- Original:     This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:     This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/voice/reference/release-notes.mdx:5954

- Problem type: wrong compound phrase
- Original:     This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:     This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/voice/reference/release-notes.mdx:7055

- Problem type: wrong compound phrase
- Original:     This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:     This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/voice/reference/release-notes.mdx:8194

- Problem type: wrong compound phrase
- Original:     This release adds an enumerator `earMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:     This release adds an enumerator `earMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/voice/reference/release-notes.mdx:9350

- Problem type: wrong compound phrase
- Original:     This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:     This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/voice/reference/release-notes.mdx:10547

- Problem type: wrong compound phrase
- Original:     This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:     This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/realtime-media/voice/reference/release-notes.mdx:11190

- Problem type: missing space
- Original: To simplify integration, as of this release, you can use the SDK to enable Android users to use Bluetooth normally without adding the `BLUETOOTH_CONNECT`permission.
- Why suspicious: The permission noun is joined directly to the inline code span.
- Suggested change: To simplify integration, as of this release, you can use the SDK to enable Android users to use Bluetooth normally without adding the `BLUETOOTH_CONNECT` permission.

## HIGH content/docs/en/realtime-media/voice/reference/security.md:373

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:26

- Problem type: generated placeholder residue
- Original: ### Total CHAT_GROUP.toLowerCase()s
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: ### Total group chats

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:28

- Problem type: generated placeholder residue
- Original: The number of created CHAT_GROUP.toLowerCase()s under this project as of the current time (disbanded CHAT_GROUP.toLowerCase()s are excluded).
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The number of created group chats under this project as of the current time (disbanded group chats are excluded).

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:30

- Problem type: generated placeholder residue
- Original: ### Daily new CHAT_GROUP.toLowerCase()s
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: ### Daily new group chats

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:32

- Problem type: generated placeholder residue
- Original: The number of newly created CHAT_GROUP.toLowerCase()s under this project today (00:00 – current time).
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The number of newly created group chats under this project today (00:00 – current time).

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:34

- Problem type: generated placeholder residue
- Original: ### Daily disbanded CHAT_GROUP.toLowerCase()s
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: ### Daily disbanded group chats

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:36

- Problem type: generated placeholder residue
- Original: The number of disbanded CHAT_GROUP.toLowerCase()s under this project today (00:00 – current time).
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The number of disbanded group chats under this project today (00:00 – current time).

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:38

- Problem type: generated placeholder residue
- Original: ### Daily active CHAT_GROUP.toLowerCase()s
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: ### Daily active group chats

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:40

- Problem type: generated placeholder residue
- Original: The number of CHAT_GROUP.toLowerCase()s that send uplink messages or receive downlink messages today (00:00 – current time).
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The number of group chats that send uplink messages or receive downlink messages today (00:00 – current time).

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:42

- Problem type: generated placeholder residue
- Original: ### Total CHAT_ROOM.toLowerCase()s
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: ### Total chat rooms

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:44

- Problem type: generated placeholder residue
- Original: The number of created CHAT_ROOM.toLowerCase()s under this project as of the current time (disbanded CHAT_ROOM.toLowerCase()s are excluded).
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The number of created chat rooms under this project as of the current time (disbanded chat rooms are excluded).

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:46

- Problem type: generated placeholder residue
- Original: ### Daily new CHAT_ROOM.toLowerCase()s
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: ### Daily new chat rooms

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:48

- Problem type: generated placeholder residue
- Original: The number of newly created CHAT_ROOM.toLowerCase()s under this project today (00:00 – current time).
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The number of newly created chat rooms under this project today (00:00 – current time).

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:50

- Problem type: generated placeholder residue
- Original: ### Daily disbanded CHAT_ROOM.toLowerCase()s
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: ### Daily disbanded chat rooms

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:52

- Problem type: generated placeholder residue
- Original: The number of disbanded CHAT_ROOM.toLowerCase()s under this project today (00:00 – current time).
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The number of disbanded chat rooms under this project today (00:00 – current time).

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:54

- Problem type: generated placeholder residue
- Original: ### Daily active CHAT_ROOM.toLowerCase()s
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: ### Daily active chat rooms

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:56

- Problem type: generated placeholder residue
- Original: The number of CHAT_ROOM.toLowerCase()s that send uplink messages or receive downlink messages today (00:00 – current time).
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The number of chat rooms that send uplink messages or receive downlink messages today (00:00 – current time).

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:58

- Problem type: generated placeholder residue
- Original: ### Daily CHAT_ROOM.toLowerCase() PCU
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: ### Daily chat room PCU

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:60

- Problem type: generated placeholder residue
- Original: The highest number of users connected to servers at the same time in CHAT_ROOM.toLowerCase()s under this project today (00:00 - current time). Note that the displayed data has a 10-minute delay.
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The highest number of users connected to servers at the same time in chat rooms under this project today (00:00 - current time). Note that the displayed data has a 10-minute delay.

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:64

- Problem type: generated placeholder residue
- Original: The following metrics apply to CHAT_ONE.toLowerCase()s, CHAT_GROUP.toLowerCase()s, and CHAT_ROOM.toLowerCase()s, as well as all message types.
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: The following metrics apply to one-to-one chats, group chats, and chat rooms, as well as all message types.

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:89

- Problem type: placeholder residue
- Original: | Automatic login | Users log in automatically (TODO). |
- Why suspicious: `TODO` is unresolved in published prose; the parallel IM console metrics page describes automatic login as using a persistent token.
- Suggested change: | Automatic login | Users log in automatically through a persistent token. |

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:93

- Problem type: generated placeholder residue
- Original: | Group chat management | User operations such as creating and deleting CHAT_GROUP.toLowerCase()s. |
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: | Group chat management | User operations such as creating and deleting group chats. |

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:94

- Problem type: generated placeholder residue
- Original: | Chat room management | User operations such as creating and deleting CHAT_ROOM.toLowerCase()s. |
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: | Chat room management | User operations such as creating and deleting chat rooms. |

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:108

- Problem type: misspelling
- Original: - Ths user cannot perform the operation without an admin permission.
- Why suspicious: `Ths` is a misspelling of `The`.
- Suggested change: - The user cannot perform the operation without an admin permission.

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:110

- Problem type: generated placeholder residue
- Original: - The CHAT_GROUP.toLowerCase() does not exist.
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: - The group chat does not exist.

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:111

- Problem type: generated placeholder residue
- Original: - The user is not found in the CHAT_GROUP.toLowerCase().
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: - The user is not found in the group chat.

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:123

- Problem type: generated placeholder residue
- Original: | Group chat management | Functions such as creating and deleting CHAT_GROUP.toLowerCase()s through the RESTful API. |
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: | Group chat management | Functions such as creating and deleting group chats through the RESTful API. |

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/chat-data-metrics.md:124

- Problem type: generated placeholder residue
- Original: | Chat room management | Functions such as creating and deleting CHAT_ROOM.toLowerCase()s through the RESTful API. |
- Why suspicious: A source expression leaked into rendered prose.
- Suggested change: | Chat room management | Functions such as creating and deleting chat rooms through the RESTful API. |

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/data-insight-plus.md:201

- Problem type: wrong word
- Original: | Call time | The accumulative duration of calls made by all users using the RTC SDK, in minutes. When audio and video exist at the same time, only the video duration is counted. |
- Why suspicious: `Cumulative` is the expected adjective for totals that add up over time.
- Suggested change: | Call time | The cumulative duration of calls made by all users using the RTC SDK, in minutes. When audio and video exist at the same time, only the video duration is counted. |

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/data-insight-plus.md:202

- Problem type: wrong word
- Original: | Video call duration | The accumulative duration of video calls made by all users using the RTC SDK, in minutes. |
- Why suspicious: `Cumulative` is the expected adjective for totals that add up over time.
- Suggested change: | Video call duration | The cumulative duration of video calls made by all users using the RTC SDK, in minutes. |

## HIGH content/docs/en/solutions/agora-analytics/build/explore-and-analyze-data/data-insight-plus.md:203

- Problem type: wrong word
- Original: | Audio call duration | The accumulative duration of audio calls made by all users using the RTC SDK, in minutes. |
- Why suspicious: `Cumulative` is the expected adjective for totals that add up over time.
- Suggested change: | Audio call duration | The cumulative duration of audio calls made by all users using the RTC SDK, in minutes. |

## HIGH content/docs/en/solutions/agora-analytics/reference/glossary.md:284

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/solutions/agora-analytics/reference/security.md:373

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/solutions/flexible-classroom/reference/core-concepts.mdx:78

- Problem type: wrong verb form
- Original: Developers can call `addCoHost` to create a stream for a user and gives the user permission to send the audio or video stream. The Flexible Classroom cloud service automatically generates a stream ID. Developers can call `removeCoHost` to permanently destroy a stream and remove permission.
- Why suspicious: The coordinated verbs should agree: `create` and `give`.
- Suggested change: Developers can call `addCoHost` to create a stream for a user and give the user permission to send the audio or video stream. The Flexible Classroom cloud service automatically generates a stream ID. Developers can call `removeCoHost` to permanently destroy a stream and remove permission.

## HIGH content/docs/en/solutions/flexible-classroom/reference/glossary.mdx:283

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/solutions/interactive-live-streaming/build/apply-effects-and-enhancements/face-capture.mdx:8

- Problem type: number agreement
- Original: This guide is intended for use-cases where the facial capture extensions is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.
- Why suspicious: The page describes a single facial capture extension, so the plural noun is inconsistent with the singular verb and surrounding title/description.
- Suggested change: This guide is intended for use-cases where the facial capture extension is used independently to capture facial data, while a third-party rendering engine is used to animate a virtual human.

## HIGH content/docs/en/solutions/interactive-live-streaming/build/control-audio-and-devices/configure-audio-encoding.mdx:6

- Problem type: punctuation error and missing comma
- Original: Audio quality requirements vary with application use-case. For example. in professional use-cases such as radio stations and singing competitions users are particularly sensitive to audio quality. In such cases, support for dual-channel and high-quality sound is required. High-quality sound means setting a high sampling rate and a high bitrate to achieve realistic audio. Video SDK enables you to configure audio encoding properties to meet such requirements.
- Why suspicious: `For example` should be followed by a comma, and the introductory phrase before `users` needs a comma.
- Suggested change: Audio quality requirements vary with application use-case. For example, in professional use-cases such as radio stations and singing competitions, users are particularly sensitive to audio quality. In such cases, support for dual-channel and high-quality sound is required. High-quality sound means setting a high sampling rate and a high bitrate to achieve realistic audio. Video SDK enables you to configure audio encoding properties to meet such requirements.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/glossary.md:284

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/release-notes.mdx:2435

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/release-notes.mdx:4162

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/release-notes.mdx:6201

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `AgoraEarMonitoringFilterReusePostProcessingFilter` in `AgoraEarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/release-notes.mdx:7810

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/release-notes.mdx:9475

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/release-notes.mdx:11174

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `earMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `earMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/release-notes.mdx:13011

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EarMonitoringFilterReusePostProcessingFilter` in `EarMonitoringFilterType`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/release-notes.mdx:14737

- Problem type: wrong compound phrase
- Original:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter post sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.
- Why suspicious: `Post sender-side processing` is an awkward compound; the intended meaning is after sender-side processing.
- Suggested change:    This release adds an enumerator `EAR_MONITORING_FILTER_REUSE_POST_PROCESSING_FILTER` in `EAR_MONITORING_FILTER_TYPE`. For complex audio processing use-cases, you can specify this option to reuse the audio filter after sender-side processing in in-ear monitoring, thereby reducing CPU consumption. Note that this option may increase the latency of in-ear monitoring, which is suitable for latency-tolerant use-cases requiring low CPU consumption.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/release-notes.mdx:15752

- Problem type: missing space
- Original: To simplify integration, as of this release, you can use the SDK to enable Android users to use Bluetooth normally without adding the `BLUETOOTH_CONNECT`permission.
- Why suspicious: The permission noun is joined directly to the inline code span.
- Suggested change: To simplify integration, as of this release, you can use the SDK to enable Android users to use Bluetooth normally without adding the `BLUETOOTH_CONNECT` permission.

## HIGH content/docs/en/solutions/interactive-live-streaming/reference/security.md:373

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## HIGH content/docs/en/solutions/iot/reference/glossary.md:283

- Problem type: wrong verb form
- Original: In the Agora Signaling SDK, a user ID identifiers a user in Signaling.
- Why suspicious: `Identifiers` is a noun, but the sentence needs the verb `identifies`.
- Suggested change: In the Agora Signaling SDK, a user ID identifies a user in Signaling.

## HIGH content/docs/en/solutions/iot/reference/security.md:372

- Problem type: wrong word
- Original: Use this list to quickly check what measures you have or have not taken to best protect the security of you app and users:
- Why suspicious: The possessive determiner should be `your` before `app`.
- Suggested change: Use this list to quickly check what measures you have or have not taken to best protect the security of your app and users:

## MEDIUM content/docs/en/realtime-media/broadcast-streaming/build/apply-effects-and-enhancements/metakit.mdx:2705

- Problem type: unfinished sentence residue
- Original:     Use `setExtensionPropertyWithVendor` to set lighting effects, with `key` set to `setEffectVideo` and `value` containing a series of lighting materials and their corresponding parameter configurations. MetaKit offers lighting effects such as 3D lighting, ad lights, screen ripples, aurora effects, portrait edge flames, and ambient light groups, and allows fine-tuning of parameters like color, intensity, and range. S
- Why suspicious: The trailing isolated `S` is a visible leftover after an otherwise complete sentence.
- Suggested change:     Use `setExtensionPropertyWithVendor` to set lighting effects, with `key` set to `setEffectVideo` and `value` containing a series of lighting materials and their corresponding parameter configurations. MetaKit offers lighting effects such as 3D lighting, ad lights, screen ripples, aurora effects, portrait edge flames, and ambient light groups, and allows fine-tuning of parameters like color, intensity, and range.

## MEDIUM content/docs/en/realtime-media/marketplace/build/add-video-and-ar-effects/metakit.mdx:2705

- Problem type: unfinished sentence residue
- Original:     Use `setExtensionPropertyWithVendor` to set lighting effects, with `key` set to `setEffectVideo` and `value` containing a series of lighting materials and their corresponding parameter configurations. MetaKit offers lighting effects such as 3D lighting, ad lights, screen ripples, aurora effects, portrait edge flames, and ambient light groups, and allows fine-tuning of parameters like color, intensity, and range. S
- Why suspicious: The trailing isolated `S` is a visible leftover after an otherwise complete sentence.
- Suggested change:     Use `setExtensionPropertyWithVendor` to set lighting effects, with `key` set to `setEffectVideo` and `value` containing a series of lighting materials and their corresponding parameter configurations. MetaKit offers lighting effects such as 3D lighting, ad lights, screen ripples, aurora effects, portrait edge flames, and ambient light groups, and allows fine-tuning of parameters like color, intensity, and range.

## MEDIUM content/docs/en/realtime-media/video/build/add-advanced-video-features/metakit.mdx:2726

- Problem type: unfinished sentence residue
- Original:         Use `setExtensionPropertyWithVendor` to set lighting effects, with `key` set to `setEffectVideo` and `value` containing a series of lighting materials and their corresponding parameter configurations. MetaKit offers lighting effects such as 3D lighting, ad lights, screen ripples, aurora effects, portrait edge flames, and ambient light groups, and allows fine-tuning of parameters like color, intensity, and range. S
- Why suspicious: The trailing isolated `S` is a visible leftover after an otherwise complete sentence.
- Suggested change:         Use `setExtensionPropertyWithVendor` to set lighting effects, with `key` set to `setEffectVideo` and `value` containing a series of lighting materials and their corresponding parameter configurations. MetaKit offers lighting effects such as 3D lighting, ad lights, screen ripples, aurora effects, portrait edge flames, and ambient light groups, and allows fine-tuning of parameters like color, intensity, and range.

## MEDIUM content/docs/en/solutions/interactive-live-streaming/build/apply-effects-and-enhancements/metakit.mdx:2713

- Problem type: unfinished sentence residue
- Original:     Use `setExtensionPropertyWithVendor` to set lighting effects, with `key` set to `setEffectVideo` and `value` containing a series of lighting materials and their corresponding parameter configurations. MetaKit offers lighting effects such as 3D lighting, ad lights, screen ripples, aurora effects, portrait edge flames, and ambient light groups, and allows fine-tuning of parameters like color, intensity, and range. S
- Why suspicious: The trailing isolated `S` is a visible leftover after an otherwise complete sentence.
- Suggested change:     Use `setExtensionPropertyWithVendor` to set lighting effects, with `key` set to `setEffectVideo` and `value` containing a series of lighting materials and their corresponding parameter configurations. MetaKit offers lighting effects such as 3D lighting, ad lights, screen ripples, aurora effects, portrait edge flames, and ambient light groups, and allows fine-tuning of parameters like color, intensity, and range.

