---
title: Release Notes
description: "This version was released on April 22, 2026."
---

# Release Notes

## v2.6

This version was released on April 22, 2026.

### Important Upgrade Notes

#### Refactored the architecture for turn detection and interruption capabilities

In this release, the original `turn_detection` field no longer handles **interruption decisions** and now focuses only on **turn detection**. A new peer configuration module, `interruption`, has also been added to manage global interruption policies in a unified way.

**Simplified `turn_detection` capabilities**

The original `turn_detection` field handled speech detection, semantic judgment, interruption switches, keyword-based interruption, and other logic. In v2.6, it retains only pure conversation turn detection capabilities. It focuses on VAD-based speech detection and semantic recognition for speech start (SOS) and speech end (EOS), outputs only speech event signals, and no longer carries any business-layer interruption control logic.

**New global `interruption` module**

This release adds the `properties.interruption` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to centrally configure how the agent behaves when interrupted by the user. This field extracts and migrates the interruption switch and execution capabilities that were previously embedded in `turn_detection` into a dedicated module. It supports globally enabling or disabling interruptions with one switch, provides both speech-triggered and keyword-triggered interruption modes, and lets you configure the follow-up behavior after interruptions are disabled (append input / ignore directly), making it suitable for more business scenarios that require false interruption prevention or do-not-disturb interactions.

**Configuration migration**

In v2.5, the `keyword` and `disabled` interruption modes and their related configuration fields under `turn_detection.config.start_of_speech` are deprecated. You must migrate them to the peer-level `interruption` configuration to complete the upgrade.

### New Features

#### Configure the playback delay for the agent greeting

This release adds the `llm.greeting_configs.delay_ms` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to configure the playback delay for the agent greeting. After configuration, the greeting is played after waiting for the specified time once the user joins the channel. This helps ensure that users can hear the greeting normally.

#### Customize LLM request headers

This release adds the `llm.headers` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to attach custom request headers when calling the LLM. If the LLM service you integrate requires specific information in the request headers, such as tenant identifiers or business-specific custom fields, you can pass that information through this field.

#### New agent state callbacks

The Conversational AI Engine client components add three fine-grained state callbacks to separately listen for changes in the agent's Listening, Thinking, and Speaking states. These callbacks supplement the existing agent state change callback (`onAgentStateChanged`) and let you drive UI states and business logic with finer control.

#### Send custom instructions

This release adds the [POST Send Custom Instruction](../operations/agent-think.md) interface, which injects a piece of text into the current conversation flow as user input. The Conversational AI Engine then continues reasoning and responding according to the standard user input processing logic. This capability is suitable for the following scenarios:

- Implicit instruction injection: Silently inject business prompts or preset instructions without processing voice input through the ASR module.
- Client event triggering: Convert client-side events such as button clicks and page switches into text input so the agent can respond based on the current conversation state.
- Voice and text coordination: Supplement spoken input with text while the user is speaking, so the Conversational AI Engine merges the inputs and the LLM processes them together.

This interface supports configuring how requests are handled when the agent is in different states through `on_listening_action`, `on_thinking_action`, and `on_speaking_action`:

- `inject`: Inject into the current turn without interrupting it.
- `interrupt`: Interrupt the current state and start a new round of conversation.
- `ignore`: Ignore this request.

### Improvements

This release adds a `name` field to all event callbacks in the message notification service and to the response body of the [GET Query Agent Status](../operations/query-agent-status.md) interface to return the agent name. You can use this field to locate and associate business instances.

### API Changes

#### Deprecated

- [POST Create a Conversational AI Agent](../operations/start-agent.md) deprecates:
    - the `keyword` mode and related configuration fields of `properties.turn_detection.config.start_of_speech.mode`
    - the `disabled` mode and related configuration fields of `properties.turn_detection.config.start_of_speech.mode`

#### Added

- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds
    - `properties.llm.greeting_configs.delay_ms`
    - `properties.llm.headers`
    - `properties.interruption`
- Added [POST Send Custom Instruction](../operations/agent-think.md)
- [GET Query Agent Status](../operations/query-agent-status.md) response adds `name`
- Client component APIs:

#### Android

- [`onAgentListeningChanged`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagentlisteningchanged)
        - [`onAgentThinkingChanged`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagentthinkingchanged)
        - [`onAgentSpeakingChanged`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagentspeakingchanged)

#### iOS

- [`onAgentListeningChanged`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagentlisteningchanged)
        - [`onAgentThinkingChanged`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagentthinkingchanged)
        - [`onAgentSpeakingChanged`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagentspeakingchanged)

#### Web

[`EConversationalAIAPIEvents`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#econversationalaiapievents) adds
        - `AGENT_LISTENING_CHANGED`
        - `AGENT_THINKING_CHANGED`
        - `AGENT_SPEAKING_CHANGED`

## v2.5

This version was released on March 30, 2026.

### New Features

#### Graceful interruption now supports pause intent detection

This release adds the `pause_state_enabled` field under `turn_detection.config.end_of_speech.semantic_config` in the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to configure whether the agent recognizes the user's pause intent. When enabled (enabled by default), if the user says pause words such as "wait a second" or "hold on", the agent interprets them as a pause intent and waits for follow-up input instead of responding immediately.

#### Real-Time TTS Parameter Updates

When integrating a [custom LLM](../user-guides/custom-llm.md), this release adds support for updating TTS parameters in real time during interaction between the user and the agent, delivering a more immersive conversational experience. This feature can be applied in the following scenarios:

- The custom LLM recognizes that the user is asking the agent to switch to a different voice.
- The custom LLM recognizes that the user is happy and increases TTS volume, pitch, and speaking rate in real time so the agent's response better matches the user's mood.

For implementation details, see [Real-Time TTS Parameter Updates](../user-guides/custom-llm.md).

#### Query conversation turn information

This release adds the [GET Query Conversation Turns](../operations/get-turns.md) interface, which lets you query turn information for the session after a conversation with the agent ends, including the start information, end information, and performance metrics for each turn.

> Note
> Currently, only sessions from the last 7 days are supported.

### API Changes

#### Added

- The [POST Create a Conversational AI Agent](../operations/start-agent.md) interface adds the `pause_state_enabled` field under `properties.turn_detection.config.end_of_speech.semantic_config`
- [GET Query Conversation Turns](../operations/get-turns.md)

## v2.4

This version was released on February 2, 2026.

### New Features

#### Integrate MCP servers

This release adds the `llm.mcp_servers` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to integrate MCP (Model Context Protocol) servers. You can configure MCP servers when creating an agent and enable tool calls (set `advanced_features.enable_tools` to `true`) so the agent can call tools provided by external services and implement more complex business logic.

#### Filler Words (Beta)

This release adds the `filler_words` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to configure filler words. This feature can play filler words while the LLM response is pending, reducing perceived waiting time and improving conversational smoothness.

### Improvements

#### Optimized `turn_detection` hierarchy

This release optimizes the `turn_detection` field in the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface by adopting a dual-field configuration model of `mode` + `config`, providing more flexible conversation turn detection capabilities.

The new configuration structure includes:

**Basic configuration**
- `mode`: Conversation turn detection mode (currently supports `default`)
- `config.speech_threshold`: Speech recognition sensitivity

**Start of Speech (SoS) detection**

`config.start_of_speech` supports three detection modes:
- **VAD mode** (`vad`): Triggered by voice activity detection and supports configuring the interruption threshold, prefix padding, and an ignore-word list
- **Keyword mode (Beta)** (`keywords`): Triggered by keywords; the agent starts the conversation after hearing the specified keyword
- **Disabled mode** (`disabled`): Disables interruption and supports append or ignore strategies

**End of Speech (EoS) detection**

`config.end_of_speech` supports two detection modes:
- **VAD mode** (`vad`): Determines the end of a conversation based on silence duration
- **Semantic mode** (`semantic`): Determines the end of a conversation based on semantic understanding and supports configuring the maximum wait time

### API Changes

#### Deprecated

- [POST Create a Conversational AI Agent](../operations/start-agent.md) deprecates the following fields:
    - `turn_detection.interrupt_mode`
    - `turn_detection.interrupt_keywords`
    - `turn_detection.interrupt_duration_ms`
    - `turn_detection.prefix_padding_ms`
    - `turn_detection.silence_duration_ms`
    - `turn_detection.threshold`
    - `advanced_features.enable_aivad`

#### Added

- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds:
    - `advanced_features.enable_tools`
    - `llm.mcp_servers`
    - `filler_words`
    - `turn_detection.mode`
    - `turn_detection.config`

## v2.3

This version was released on January 7, 2026.

### New Features

#### Configure whether LLM responses are interruptible

When integrating a custom LLM with streaming responses (SSE), a single response from the LLM is transmitted in multiple chunks. Starting with this release, the Conversational AI Engine supports processing the **first chunk** response whose `object` is `chat.completion.custom_metadata`. The `metadata.interruptable` field in that chunk is used to configure whether TTS playback of the current LLM response can be interrupted by user speech. This capability can help ensure that the agent is not interrupted by user speech when broadcasting important information such as regulations, policies, or product pricing. For more information, see [Configure whether LLM responses are interruptible](../user-guides/custom-llm.md).

#### RTC media encryption

This release adds the `properties.rtc` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to configure RTC media encryption. You can use this configuration to encrypt audio and video media transmitted over RTC, thereby protecting data security during conversations with the agent.

### Improvements

This release changes the [POST Stop a Conversational AI Agent](../operations/stop-agent.md) interface to return asynchronously. The Conversational AI Engine returns a response immediately after validating the request parameters, without waiting for the agent to fully leave the channel.

### API Changes

#### Added

- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds the `properties.rtc` field

#### Changed

- [POST Stop a Conversational AI Agent](../operations/stop-agent.md) now returns asynchronously

## v2.2

This version was released on December 11, 2025.

### New Features

#### Agent greeting mode

This release adds the `llm.greeting_configs.mode` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to set the playback mode for the agent greeting. The following options are currently supported:

- `"single_every"`: (default) The agent plays the greeting each time a user joins an empty channel.
- `"single_first"`: The agent plays the greeting only when the first user joins an empty channel.

### API Changes

#### Added

- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds the `llm.greeting_configs.mode` field

## v2.1

This version was released on December 1, 2025.

### New Features

#### Dynamic variables

This release adds the `llm.template_variables` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface, which lets you insert variables into the text of the agent's `system_messages`, `greeting_message`, `failure_message`, and `parameters.silence_config.content`. After you configure the variables, the Conversational AI Engine automatically replaces them with the corresponding values defined in `llm.template_variables`.

#### Custom labels

This release adds the `labels` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface so the agent can carry custom business information. These custom labels are bound to the agent and returned in the `payload` field of all types of message notification callbacks in the Conversational AI Engine, enabling custom business logic such as marking campaign IDs, customer groups, or business scenarios.

### API Changes

#### Added

- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds
    - `llm.template_variables`
    - `labels`

## v2.0

This version was released on November 6, 2025.

### Important Upgrade Notes

#### Changes to voice activity detection configuration

This release deprecates the `vad` field in the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface. All of its configuration items have been migrated to the `turn_detection` field.

#### Subtitle APIs in client components were renamed

In this release, all APIs, parameters, and other items in the subtitle APIs of the client components that used the name `transcription` were renamed to `transcript`, as follows:

#### Android

- `onTranscriptionUpdated` was renamed to `onTranscriptUpdated`
    - `TranscriptionRenderMode` was renamed to `TranscriptRenderMode`
    - `TranscriptionType` was renamed to `TranscriptType`
    - `TranscriptionStatus` was renamed to `TranscriptStatus`
    - `Transcription` was renamed to `Transcript`

#### iOS

- `onTranscriptionUpdated` was renamed to `onTranscriptUpdated`
    - `TranscriptionRenderMode` was renamed to `TranscriptRenderMode`
    - `TranscriptionType` was renamed to `TranscriptType`
    - `TranscriptionStatus` was renamed to `TranscriptStatus`
    - `Transcription` was renamed to `Transcript`

#### Web

- `TRANSCRIPTION_UPDATED` was renamed to `TRANSCRIPT_UPDATED`

### New Features

#### Graceful exit

This release adds the `parameters.farewell_config` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to configure graceful exit for the agent. After it is enabled, when you call the [POST Stop a Conversational AI Agent](../operations/stop-agent.md) interface to make the agent leave the channel, the agent will leave only after entering a silent state.

#### Enrollment-based voiceprint recognition (Beta)

This release adds an enrollment-based voiceprint recognition mode to the Selective Attention Lock feature. Before interacting with the agent, you can register and upload up to one voiceprint. During subsequent interactions, the agent identifies the user through voiceprint recognition and suppresses other background speech and environmental noise to keep the conversation focused. To try this feature, [contact technical support](https://ticket.shengwang.cn).

#### Keyword interruption mode

This release adds the `"keyword"` option to the `turn_detection.interrupt_mode` field of the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface, allowing you to set the agent interruption mode to keyword-based interruption. You can configure interruption keywords in the `turn_detection.interrupt_keywords` field. After it is enabled, the agent interrupts its current behavior when it hears a keyword in the list.

#### Adaptive interruption mode

This release adds the `"adaptive"` option to the `turn_detection.interrupt_mode` field of the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface, allowing you to set the agent interruption mode to adaptive interruption. After it is enabled, interruption-related parameters are adjusted automatically while the agent is speaking to avoid false interruptions caused by brief speech.

### Improvements

#### MiniMax TTS now supports timestamps

Starting with this release, MiniMax TTS includes timestamp information together with text-to-speech output. This improvement helps accurately locate when the user interrupts the agent while it is speaking, improving the accuracy of interruption-related context information.

#### Additional TTS/ASR options

This release adds support for the following vendors or models. For details, see [POST Create a Conversational AI Agent](../operations/start-agent.md):
- New TTS options:
    - Alibaba Cloud CosyVoice TTS
    - Volcano Engine Bidirectional Streaming TTS
    - StepFun TTS
- New ASR options:
    - iFlytek Cloud traditional speech transcription service
    - iFlytek Cloud speech recognition LLM service
    - iFlytek Cloud dialect speech recognition service

### API Changes

#### Deprecated

- [POST Create a Conversational AI Agent](../operations/start-agent.md) deprecates the `vad` field

#### Added

- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds:
    - `parameters.farewell_config`
    - `turn_detection.interrupt_mode.adaptive`
    - `turn_detection.interrupt_mode.keyword`
    - `turn_detection.interrupt_keywords`
    - `turn_detection.interrupt_duration_ms` (migrated from `vad.interrupt_duration_ms`)
    - `turn_detection.prefix_padding_ms` (migrated from `vad.prefix_padding_ms`)
    - `turn_detection.silence_duration_ms` (migrated from `vad.silence_duration_ms`)
    - `turn_detection.threshold` (migrated from `vad.threshold`)

## v1.7

This version was released on July 29, 2025.

### New Features

#### Digital human avatars

This release adds support for digital human avatars. After it is enabled, the agent can use capabilities provided by third-party digital human vendors to generate a lifelike digital human avatar with accurate lip sync, improving the immersion of AI conversations. You can enable this feature by setting `avatar.enable` to `true` and configuring `avatar.vendor` and `avatar.params` when calling the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface.

> Note
> Enabling the digital human avatar feature incurs RTC video call charges. For details, see [RTC Billing](https://doc.shengwang.cn/doc/rtc/android/billing/billing-strategy).

#### Passive voiceprint recognition

Selective Attention Lock now supports passive voiceprint recognition. This feature enables AI to accurately identify the user's voiceprint characteristics and effectively distinguish between different speakers. Users only need to speak loudly and clearly at the beginning of the conversation to improve how well the AI locks onto their voice. Passive voiceprint recognition can intelligently suppress 95% of ambient speech and noise, making AI conversations more accurate and efficient. It is also suitable for scenarios where multiple people talk with AI, enabling more diverse Conversational AI responses and services. To try Selective Attention Lock, [contact technical support](https://ticket.shengwang.cn).

#### Send image messages (Beta)

The Conversational AI Engine client components add an interface for sending image messages. It supports sending image URLs to the LLM and automatically referencing the image content in subsequent conversations with the agent, allowing the LLM to generate responses that better match user needs based on the image content. In addition, this release adds an image message receipt callback to confirm whether image messages are sent successfully. For usage details, see [Send multimodal messages](../user-guides/send-multimodal-message.md).

> Note
> - The send image messages feature is currently in Beta and is temporarily free.
> - Image processing depends on capabilities provided by the LLM vendor. Make sure the LLM vendor integrated with the Conversational AI Engine supports image processing.

### API Changes

#### Added

- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds
    - `avatar.enable`
    - `avatar.vendor`
    - `avatar.params`
- Client component APIs:

#### Android

- [`chat`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#chat)
        - [`onMessageReceiptUpdated`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onmessagereceiptupdated)
        - [`onMessageError`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onmessageerror)
        - [`ChatMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/struct#chatmessage)
        - [`ChatMessageType`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/struct#chatmessagetype)
        - [`ImageMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/struct#imagemessage)
        - [`MessageReceipt`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/struct#messagereceipt)
        - [`MessageError`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/struct#messageerror)

#### iOS

- [`chat`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#chat)
        - [`onMessageReceiptUpdated`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onmessagereceiptupdated)
        - [`onMessageError`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onmessageerror)
        - [`ChatMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/struct#chatmessage)
        - [`ChatMessageType`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/enum#chatmessagetype)
        - [`ImageMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/struct#imagemessage)
        - [`MessageReceipt`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/struct#messagereceipt)
        - [`MessageError`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/struct#messageerror)

#### Web

- [`chat`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#chat)
        - [`TMessageReceipt`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/struct#tmessagereceipt)
        - [`EChatMessagePriority`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#echatmessagepriority)
        - [`EChatMessageType`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#echatmessagetype)
        - [`IChatMessageBase`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/struct#ichatmessagebase)
        - [`IChatMessageImage`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/struct#ichatmessageimage)
        - [`EConversationalAIAPIEvents`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#econversationalaiapievents) adds `MESSAGE_RECEIPT_UPDATED` and `MESSAGE_ERROR` events
        - [`EModuleType`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#emoduletype) adds the `CONTEXT` enum value
        - [`EAgentState`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#eagentstate) adds the `SILENT` enum value

## v1.6

This version was released on July 1, 2025.

### Important Upgrade Notes

#### ASR vendor selection is now configurable

To improve the flexibility of conversational agent configuration, starting with this release, speech recognition (ASR) vendors can be selected manually. The [POST Create a Conversational AI Agent](../operations/start-agent.md) interface adds the `asr.vendor` and `asr.params` fields for setting the ASR vendor and configuring parameters. The following options are currently supported:
- (default) Fengming ASR
- Tencent Cloud ASR
- Microsoft ASR

At the same time, the **legacy Conversational AI Engine service fee** is now split to separately list the **Fengming ASR processing fee**. When the ASR service uses the default Fengming ASR, the total price remains the same as in previous versions, that is, **legacy Conversational AI Engine service fee** = **new Conversational AI Engine service fee** + **Fengming ASR processing fee**. When another ASR vendor is used, only the **new Conversational AI Engine service fee** is charged. For details, see [Billing](./billing.md).

### New Features

#### Client components

To improve development efficiency for conversational agents, a flexible, extensible, and standardized set of Conversational AI Engine client components is now provided. These components support iOS, Android, and Web, and package multiple use-case APIs. By calling these APIs, you can combine the capabilities of the [Real-Time Communication (RTC) SDK](https://doc.shengwang.cn/doc/rtc/homepage) and the [Real-Time Messaging (RTM) SDK](https://doc.shengwang.cn/doc/rtm2/homepage) to implement the following features:
- [Real-Time Subtitles](../user-guides/realtime-sub.md): Output and display conversation content between users and agents in text form in real time. In this release, the subtitle component is comprehensively upgraded to provide more complete feature support, stronger extensibility, better error handling, more complete session management, and a more powerful communication mechanism.
- [Interrupt the agent](../user-guides/interrupt-agent.md): Interrupt the agent while it is speaking or thinking to make it stop talking.
- [Listen for agent events](../user-guides/listen-agent-events.md): Listen for agent conversation state changes, performance metrics, and error events.
- [Set optimal audio parameters](../best-practice/audio-settings.md): Quickly apply audio parameter best practices to improve the conversational experience of the agent.

### API Changes

#### Added

- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds
    - `asr.vendor`
    - `asr.params`
    - `parameters.enable_metrics`
    - `parameters.data_channel`
    - `parameters.enable_error_message`
- Client component APIs:
    - [Android](https://doc.shengwang.cn/api-ref/convoai/android/android-component/overview)
    - [iOS](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/overview)
    - [Web](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/overview)

## v1.5

This version was released on June 6, 2025.

### New Features

#### TTS filtering

The [POST Create a Conversational AI Agent](../operations/start-agent.md) interface adds the `tts.skip_patterns` field to control whether the TTS module skips content inside specified brackets when reading text returned by the LLM. This helps prevent the agent from reading unnecessary structural prompt information such as tone markers, action descriptions, and system prompts, improving naturalness and immersion.

### API Changes

#### Added

The [POST Create a Conversational AI Agent](../operations/start-agent.md) interface adds the `tts.skip_patterns` field.

## v1.4

This version was released on May 26, 2025.

### Important Upgrade Notes

v1.4 introduces the following changes to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface. Update related code after upgrading to this version.

#### RTM authentication management

This release deprecates the `agent_rtm_uid` field. After RTM is enabled, the token and user ID used by the agent to join the RTM channel no longer need to be configured separately. Instead, the token and user ID configured in the `token` and `agent_rtc_uid` fields are reused. For details on generating a token with both RTC and RTM permissions, see the [FAQ](https://doc.shengwang.cn/faq/integration-issues/generate-token).

#### Silence configuration

This release deprecates the `silence_timeout` and `llm.silence_message` fields in the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface. Use the new `parameters.silence_config` field instead to configure the maximum silence timeout, silence prompt mode, and silence prompt text for the agent.

### New Features

#### Microsoft TTS support

Starting with this release, the Conversational AI Engine supports Microsoft TTS. You can integrate Microsoft TTS by setting `tts.vendor` to `microsoft` when calling the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface.

#### Speech interruption mode

This release adds the `turn_detection.interrupt_mode` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface to set how user speech interrupts the agent's behavior. The following three modes are currently supported:
- `"interrupt"`: (default) Interruption mode. User speech immediately interrupts the agent interaction. The agent terminates the current interaction and directly processes the speech input.
- `"append"`: Append mode. User speech does not interrupt the agent. The agent processes the received speech request after the current interaction ends.
- `"ignore"`: Ignore mode. The agent ignores user speech requests. If user speech is received while the agent is speaking or thinking, the request is ignored and discarded and is not stored in the context.

#### Pass short-term memory to the LLM

This release adds the `llm.vendor` field to the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface. After it is set to `"custom"`, the agent includes information such as the conversation turn (`turn_id`) and request timestamp (`timestamp`) when calling the LLM. For details, see [Pass memory content to the LLM](../user-guides/short-term-memory.md).

### Improvements

This release includes the following improvements:

- When integrating MiniMax TTS, passthrough for fields such as `emotion`, `latex_read`, and `pronunciation_dict` is now supported. For details, see the [sample code](../operations/start-agent.md).
- During conversations with the agent, the agent's real-time status can now be sent back to the RTC SDK through data stream callbacks.
- The [POST Update Agent Configuration](../operations/agent-update.md) interface adds the `llm.system_messages` and `llm.params` fields to update the system prompts and configuration parameters sent when the agent calls the LLM.

### API Changes

#### Added

- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds:
    - `llm.vendor`
    - `turn_detection.interrupt_mode`
    - `parameters.silence_config`
- [POST Update Agent Configuration](../operations/agent-update.md) adds:
    - `llm.system_messages`
    - `llm.params`

#### Deprecated

[POST Create a Conversational AI Agent](../operations/start-agent.md) deprecates:
- `agent_rtm_uid`
- `silence_timeout`
- `llm.silence_message`

## v1.3

This version was released on April 16, 2025.

### Important Integration Notes

#### Top-up packages

Starting with this release, you can purchase top-up packages in the Console to offset actual usage of the Conversational AI Engine service while receiving a discount. For details, see [Billing](./billing.md).

### New Features

#### Get the agent's short-term memory

Conversation messages between the user and the agent, as well as timestamps for agent creation and stopping, are stored in the agent's short-term memory. This release adds the following two ways to retrieve the agent's short-term memory:

- Call the [GET Get Agent Short-Term Memory](../operations/get-history.md) interface to retrieve the short-term memory of a specified running agent.
- Subscribe to the [agent short-term memory event](../webhook/ncs-events.md#103-agent-history) through the [message notification service](../webhook/enable-ncs.md). When the agent stops, the agent's short-term memory is automatically sent to your business server through a Webhook callback.

#### Support for Zhipu AI LLMs

Starting with this release, the Conversational AI Engine supports Zhipu AI LLMs. You can integrate a Zhipu AI LLM by setting `llm.url` to the API address of the Zhipu AI LLM when calling the [POST Create a Conversational AI Agent](../operations/start-agent.md) interface.

### Improvements

#### Priority for custom playback messages

This release upgrades the [POST Broadcast Custom Message](../operations/agent-speak.md) interface and adds two configurations related to playback interruption logic:
- `priority`: Configures the priority of the playback action. It supports three priorities: interrupt and play (high), append and play (medium), and play when idle (low).
- `interruptable`: Configures whether user speech is allowed to interrupt agent playback.

#### Send silence prompt messages

The [POST Create a Conversational AI Agent](../operations/start-agent.md) interface adds the `silence_timeout` and `llm.silence_message` parameters to set the maximum silence duration and the silence prompt message for the agent. After the agent is created successfully and the user joins the channel, the time during which the agent is not listening, thinking, or speaking is considered the agent's silence duration. When that duration reaches the configured threshold, the agent plays the configured silence prompt message.

### API Changes

#### Added

- [GET Get Agent Short-Term Memory](../operations/get-history.md)
- [POST Create a Conversational AI Agent](../operations/start-agent.md) adds the `silence_timeout` and `llm.silence_message` parameters
- [POST Broadcast Custom Message](../operations/agent-speak.md) adds the `priority` and `interruptable` parameters

## v1.2

This version was released on March 27, 2025.

### New Features

#### Broadcast custom messages

This release adds the [POST Broadcast Custom Message](../operations/agent-speak.md) interface, which lets a specified agent play a custom message. During conversations with the agent, calling this interface can interrupt the agent while it is speaking or thinking and immediately play the custom message through the TTS module.

#### Interrupt the agent

This release adds the [POST Interrupt Agent](../operations/agent-interrupt.md) interface to interrupt the speaking and thinking process of a specified agent and make it stop talking.

### API Changes

#### Added

- [POST Broadcast Custom Message](../operations/agent-speak.md)
- [POST Interrupt Agent](../operations/agent-interrupt.md)

## v1.1

This version was released on March 19, 2025.

### New Features

#### Pass custom information

The [POST Create a Conversational AI Agent](../operations/start-agent.md) interface adds the `enable_rtm` and `agent_rtm_uid` fields to enable RTM for the conversational agent. After RTM is enabled, the agent can use capabilities provided by the RTM SDK to obtain custom context information such as the user's speaking status, selected text, signature, and scores, and pass that information to the agent so it can generate content that better matches user needs. For details, see [Pass custom information](../user-guides/custom-data.md).

### Improvements

To help you quickly integrate a custom LLM, this release introduces the [Custom LLM](../user-guides/custom-llm.md) documentation. You can refer to the sample code in that document to integrate a custom LLM into the Conversational AI Engine and implement advanced capabilities such as retrieval-augmented generation (RAG), multimodality, and tool calling.

### API Changes

#### Added

The [POST Create a Conversational AI Agent](../operations/start-agent.md) interface adds the `enable_rtm` and `agent_rtm_uid` fields

## v1.0 GA

This version was released on March 5, 2025.

### Important Integration Notes

#### Billing

The Conversational AI Engine officially reached GA on March 5, 2025, and product pricing was announced. For the billing rules, see [Billing](./billing.md).

#### SDK version requirements

To get the best conversational experience, the new version of the Conversational AI Engine is recommended to be used with the following SDK versions:
- RTC Native SDK v4.5.1 or later
- RTC Web SDK 4.23.2 or later
- RTSA C SDK 1.9.x or later

### New Features

#### Real-Time Subtitles

Starting with this release, an open-source subtitle processing module is provided. You only need to integrate the module into your project and call its APIs to quickly implement real-time subtitles, outputting and displaying conversation content between the user and the agent as text in real time. For details, see [Real-Time Subtitles](../user-guides/realtime-sub.md).

#### Message notification service

This release adds the message notification service for the Conversational AI Engine. You can configure the service address in the Console and subscribe to agent creation, stop, or error events. When a subscribed event occurs, the configured callback address is called and the event details are sent to your business server. For details, see [Message notification service](../webhook/enable-ncs.md).

#### Hotwords Beta

This release adds hotwords. Adding hotwords can significantly improve recognition accuracy for domain-specific vocabulary in the Conversational AI Engine. This feature is currently in Beta. To enable it, [contact technical support](https://ticket.shengwang.cn).

## v1.0 Public Beta

This version was released on February 18, 2025. This release focuses on delivering natural, smooth, low-latency, and highly reliable real-time voice conversation capabilities, helping developers quickly build intelligent and immersive interactive experiences.

### Important Integration Notes

1. To get the best conversational experience, [contact technical support](https://ticket.shengwang.cn/) to obtain the designated version of the real-time interaction SDK.
2. Currently, only Chinese and English are supported for interaction with AI. For other languages, [contact technical support](https://ticket.shengwang.cn).
3. Currently, the Peak Concurrent Users limit for a single App ID is 20. To increase the quota, [contact technical support](https://ticket.shengwang.cn).

### Core Features

#### Real-time voice conversation

Supports natural and smooth real-time voice conversations with AI, similar to talking with a real person, and provides a low-latency, fast-response interactive experience.

#### On-device noise reduction

The SDK intelligently identifies and removes background noise, ensuring clear voice transmission even in noisy public places and delivering a high-quality conversational experience.

#### Background speech suppression

Intelligently suppresses background speech while precisely preserving the speaker's clear voice, ensuring a clear and focused interactive experience even in multi-speaker environments.

#### Graceful interruption

Supports users interrupting AI at any time with fast responses, enabling natural transitions and smooth conversations instead of mechanical interactions.

#### Intelligent transport

The transport algorithm is optimized for conversations with AI agents and can still transmit voice data stably under weak network conditions, such as 80% packet loss, ensuring conversational continuity and reliability across diverse complex network environments.

#### Flexible orchestration

Supports integration with mainstream global LLMs and TTS services, enabling flexible orchestration to meet different scenarios and business needs and providing highly customizable AI agent conversation solutions.

#### Real-Time Subtitles

Supports outputting and displaying conversation content between users and AI agents as text in real time on the client interface.

#### Multi-platform support

Supports iOS, Android, Web, mini apps, and various types of embedded hardware clients, providing cross-platform consistency and seamless integration to meet the needs of different application scenarios.
