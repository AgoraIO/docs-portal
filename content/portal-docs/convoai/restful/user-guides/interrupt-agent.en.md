---
title: Interrupt an Agent
description: "During interaction with an agent, you may need to interrupt the agent's speech to start a new round of conversation. Agora Conversational AI Engine supports interrupting the agent in the following two ways:"
---

# Interrupt an Agent

During interaction with an agent, you may need to interrupt the agent's speech to start a new round of conversation. Agora Conversational AI Engine supports interrupting the agent in the following two ways:

- **Voice interruption**: The system automatically determines whether to interrupt the agent based on the user's voice input.
- **Manual interruption**: You actively send an interruption request by calling the RESTful API or the client component API, for example when the user clicks a button or sends a specific command.

This article describes how to interrupt an agent.

## Voice Interruption

Agora Conversational AI Engine supports graceful interruption. After it is enabled, when the user interacts with the agent, the system can determine semantically whether the user has finished speaking, enabling a more natural conversation experience.

> Info
> - Graceful interruption is a value-added service and incurs additional charges when enabled. For details, see [Billing](../overview/billing.md).
> - If the semantic engine determines that the user has not finished speaking, it waits for a period of time before finally determining that the turn has ended. This increases response latency.

Graceful interruption is disabled by default. To enable it, set `turn_detection.config.end_of_speech.mode` to `semantic` when calling [POST Create a Conversational AI Agent](../operations/start-agent.md). The following curl example shows how:

#### Request Example

```bash
curl --request POST \
  --url https://api.agora.io/cn/api/conversational-ai-agent/v2/projects/:appid/join \
  --header 'Authorization: agora token="007abcxxxxxxx123"' \
  --data '
{
  "name": "unique_name",
  "properties": {
    "channel": "channel_name",
    "token": "token",
    "agent_rtc_uid": "0",
    "remote_rtc_uids": [
      "123"
    ],
    "enable_string_uid": false,
    "idle_timeout": 120,
    // highlight-start
    "turn_detection": {
      "mode": "default",
      "config": {
        "end_of_speech": {
          "mode": "semantic"
          "semantic_config": {
            "silence_duration_ms": 240,
            "max_wait_ms": 3000
          }
        }
      }
    },
    // highlight-end
    "llm": {
      "url": "https://api.minimax.chat/v2/text/chatcompletion_v2",
      "api_key": "xxx",
      "system_messages": [
        {
          "role": "system",
          "content": "You are a helpful chatbot."
        }
      ],
      "greeting_message": "Hello, how can I help you?",
      "failure_message": "Sorry, I can't answer that question.",
      "max_history": 32,
      "params": {
        "model": "abab6.5s-chat",
        "max_token": 1024,
        "userName": "Tomas"
      }
    },
    "asr": {
      "language": "zh-CN"
    },
    "tts": {
      "vendor": "minimax",
      "params": {
        "group_id": "xxxx",
        "key": "xxxx",
        "model": "speech-01-turbo",
        "voice_setting": {
          "voice_id": "female-shaonv",
          "speed": 1,
          "vol": 1,
          "pitch": 0,
          "emotion": "happy"
        },
        "audio_setting": {
          "sample_rate": 16000
        }
      },
      "skip_patterns": [
        1
      ]
    }
  }
}
'
```

#### Response Example

When the request succeeds, a 200 status code is returned, and the response body is as follows:

```json
{
  "agent_id": "1NT29X10YHxxxxxWJOXLYHNYB",
  "create_ts": 1737111452,
  "status": "RUNNING"
}
```

## Manual Interruption

Agora Conversational AI Engine supports actively sending an interruption request by calling the RESTful API or the client component API, so you can interrupt the agent by clicking a button or sending a specific command.

### Option 1: Call the RESTful API

You can call [POST Interrupt an Agent](https://doc.shengwang.cn/doc/convoai/restful/convoai/operations/interrupt-agent) to actively send an interruption request.

#### Request Example

Use curl as an example:

```bash
curl --request POST \
  --url https://api.agora.io/cn/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/interrupt \
  --header 'Authorization: agora token="007abcxxxxxxx123"' \
  --data '{}'
```

#### Response Example

When the request succeeds, a 200 status code is returned, and the response body is as follows:

```json
{
  "agent_id": "1NT29XxxxxxxxxELWEHC8OS",
  "channel": "test_channel",
  "start_ts": 1744877089
}
```

### Option 2: Call the Client Component API

Agora provides a flexible, extensible, and standardized set of client components for Conversational AI Engine. These components support iOS, Android, and Web, and encapsulate multiple scenario-oriented APIs. By calling these APIs, you can combine the capabilities of the Agora [RTC SDK](https://doc.shengwang.cn/doc/rtc/homepage) and [RTM SDK](https://doc.shengwang.cn/doc/rtm2/homepage) to implement the following features:

- [Interrupt an agent](./interrupt-agent.md)
- [Real-Time Subtitles](./realtime-sub.md)
- [Listen to agent-related events](./listen-agent-events.md)
- [Set optimal audio parameters](../best-practice/audio-settings.md) (Android and iOS only)
- [Send image messages](./send-multimodal-message.md)

#### Prerequisites

Before you start, make sure you have completed the following:

- Integrated RTC SDK v4.5.1 or later and implemented basic real-time audio and video capabilities in your app, including obtaining the required device permissions. See [Build a Video Calling App](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start).
- Enabled RTM for the project in the [Console](https://console.shengwang.cn/) and implemented basic real-time messaging capabilities in your app. See [Send and Receive Messages](https://doc.shengwang.cn/doc/rtm2/javascript/get-started/quick-start).
- Followed [Build Voice Interaction with an Agent](../get-started/quick-start.md) to implement the basic logic for interacting with the agent.
- Ensured that RTC is available, RTM is logged in, and the lifecycles of the RTC and RTM instances are longer than the lifecycle of the component. The component does not manage RTC or RTM initialization, lifecycle, authentication, or login state internally.

#### Integrate the Component

#### Android

Copy the `convoaiApi` folder into your project and import the component before calling its API. See [Component Structure](#component-structure) to learn the role of each file.

- [convoaiApi](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/Android/scenes/convoai/src/main/java/io/agora/scene/convoai/convoaiApi)

#### iOS

Copy the `ConversationalAIAPI` folder into your project and import the component before calling its API. See [Component Structure](#component-structure) to learn the role of each file.

- [ConversationalAIAPI](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/iOS/Scenes/ConvoAI/ConvoAI/ConvoAI/Classes/ConversationalAIAPI)

#### Web

Copy the `conversational-ai-api` file into your own project and import the component before calling its API. See [Component Structure](#component-structure) to learn the role of each file.

- [conversational-ai-api](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/Web/Scenes/VoiceAgent/src/conversational-ai-api)

#### Initialize the Component

Create a configuration object for the RTC and RTM instances, and then create a component instance:

#### Android

```java
// Create a configuration object for the RTC and RTM instances
val config = ConversationalAIAPIConfig(
    rtcEngine = rtcEngineInstance,
    rtmClient = rtmClientInstance,
    enableLog = true
)
// Create the component instance
val api = ConversationalAIAPIImpl(config)
```

#### iOS

```swift
// Create a configuration object for the RTC and RTM instances
let config = ConversationalAIAPIConfig(
    rtcEngine: rtcEngine,
    rtmEngine: rtmEngine,
    enableLog: true
)
/// Create the component instance
convoAIAPI = ConversationalAIAPIImpl(config: config)
```

#### Web

```typescript
// Create a configuration object for the RTC and RTM instances
ConversationalAIAPI.init({
    rtcEngine,
    rtmEngine,
    })

// Get the API instance (singleton)
const conversationalAIAPI = ConversationalAIAPI.getInstance()
```

#### Make the Agent Join the Channel

Call [POST Create a Conversational AI Agent](../operations/start-agent.md) and complete the following parameter settings:

- `advanced_features.enable_rtm: true` - required, enables RTM
- `parameters.data_channel: "rtm"` - required, enables the RTM data transport channel
- `parameters.enable_metrics: true` - optional, receive agent performance metrics
- `parameters.enable_error_message: true` - optional, receive agent error events

After the call succeeds, the agent joins the specified RTC channel and the user can start interacting with the agent.

#### Interrupt the Agent

Call the `interrupt` method to interrupt the agent.

#### Android

```kotlin
api.interrupt("agentId") { error -> /* ... */ }
```

#### iOS

```swift
convoAIAPI.interrupt(agentUserId: "\(agentUid)") { error in
    if let error = error {
        print("Interrupt failed: \(error.message)")
    } else {
        print("Interrupt succeeded")
    }
}
```

#### Web

```typescript
await conversationalAIAPI.interrupt(`${agent_rtc_uid}`)
```

#### Destroy the Component Instance

After the AI conversation scenario ends or before the app is closed, destroy the component instance to release all resources used by the component.

#### Android

```kotlin
api.destroy()
```

#### iOS

```swift
convoAIAPI.destroy()
```

#### Web

```typescript
conversationalAIAPI.destroy()
```

## Reference

### Sample Project

Agora provides an open-source sample project for reference. You can download it or view the source code:

- [Conversational-AI-Demo](https://github.com/Shengwang-Community/Conversational-AI-Demo/)

### Component Structure

The structure of the client component folder and the role of each file are as follows:

> Info
> The following files and folders are the complete set of content required to integrate the client components. No other files need to be copied.

#### Android

- `IConversationalAIAPI.kt` - API interfaces, related data structures, and enums
  - `ConversationalAIAPIImpl.kt` - Main implementation logic of the ConversationalAI API
  - `ConversationalAIUtils.kt` - Utility functions and event callback management
  - `subRender/`
    - `v3/` - Subtitle-related modules
      - `TranscriptionController.kt` - Subtitle controller
      - `MessageParser.kt` - Message parser

#### iOS

- `ConversationalAIAPI.swift` - API interfaces, related data structures, and enums
  - `ConversationalAIAPIImpl.swift` - Main implementation logic of the ConversationalAI API
  - `Transcription/`
    - `TranscriptionController.swift` - Subtitle controller

#### Web

- `index.ts` - API class
  - `type.ts` - API interfaces, related data structures, and enums
  - `utils/index.ts` - API utility functions
  - `utils/events.ts` - Event manager that can be extended to implement event listening and playback easily
  - `utils/sub-render.ts` - Subtitle-related modules

### API Reference

#### RESTful API

- [POST Create a Conversational AI Agent](../operations/start-agent.md)
- [POST Interrupt an Agent](../operations/agent-interrupt.md)

#### Client Component API

#### Android

- [`interrupt`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#interrupt)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#destroy)

#### iOS

- [`interrupt`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#interrupt)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#destroy)

#### Web

- [`interrupt`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#interrupt)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#destroy)
