---
title: Real-Time Subtitles
description: "When interacting with a conversational AI agent in real time, you may need real-time subtitles to display the conversation content between you and the agent. This article explains how to implement real-time subtitles in your app."
---

# Real-Time Subtitles

When interacting with a conversational AI agent in real time, you may need real-time subtitles to display the conversation content between you and the agent. This article explains how to implement real-time subtitles in your app.

## How It Works

Agora provides a flexible, extensible, and standardized set of client components for Conversational AI Engine. These components support iOS, Android, and Web, and encapsulate multiple scenario-oriented APIs. By calling these APIs, you can combine the capabilities of the Agora [RTC SDK](https://doc.shengwang.cn/doc/rtc/homepage) and [RTM SDK](https://doc.shengwang.cn/doc/rtm2/homepage) to implement the following features:

- [Interrupt an agent](./interrupt-agent.md)
- [Real-Time Subtitles](./realtime-sub.md)
- [Listen to agent-related events](./listen-agent-events.md)
- [Set optimal audio parameters](../best-practice/audio-settings.md) (Android and iOS only)
- [Send image messages](./send-multimodal-message.md)

The component receives subtitle transcription content through the `onTranscriptUpdated` callback and supports listening to different types of subtitle transcription data:

- **Agent subtitles**: The agent's speech transcription, including real-time updates and final results.
- **User subtitles**: The user's speech transcription, supporting real-time display and state management.
- **Subtitle transcription status**: Supports handling different states such as in progress, completed, and interrupted.

The following diagram shows the workflow for implementing real-time subtitles with the component:

![image](https://doc.shengwang.cn/img/convoai/realtime-sub.svg)

## Prerequisites

Before you start, make sure you have completed the following:

#### Android

- Integrated RTC SDK v4.5.1 or later and implemented basic real-time audio and video capabilities in your app, including obtaining the required device permissions. See [Build a Video Calling App](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start).
- Enabled RTM for the project in the [Console](https://console.shengwang.cn/) and implemented basic real-time messaging capabilities in your app. See [Send and Receive Messages](https://doc.shengwang.cn/doc/rtm2/javascript/get-started/quick-start).
- Followed [Build Voice Interaction with an Agent](../get-started/quick-start.md) to implement the basic logic for interacting with the agent.
- Ensured that RTC is available, RTM is logged in, and the lifecycles of the RTC and RTM instances are longer than the lifecycle of the component. The component does not manage RTC or RTM initialization, lifecycle, authentication, or login state internally.

#### iOS

- Integrated RTC SDK v4.5.1 or later and implemented basic real-time audio and video capabilities in your app, including obtaining the required device permissions. See [Build a Video Calling App](https://doc.shengwang.cn/doc/rtc/ios/get-started/quick-start).
- Enabled RTM for the project in the [Console](https://console.shengwang.cn/) and implemented basic real-time messaging capabilities in your app. See [Send and Receive Messages](https://doc.shengwang.cn/doc/rtm2/javascript/get-started/quick-start).
- Followed [Build Voice Interaction with an Agent](../get-started/quick-start.md) to implement the basic logic for interacting with the agent.
- Ensured that RTC is available, RTM is logged in, and the lifecycles of the RTC and RTM instances are longer than the lifecycle of the component. The component does not manage RTC or RTM initialization, lifecycle, authentication, or login state internally.

#### Web

- Integrated RTC Web SDK v4.24.0 or later and followed [Build a Video Calling App](https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start) to implement basic real-time audio and video capabilities in your app, including obtaining the required device permissions.
- Enabled RTM for the project in the [Console](https://console.shengwang.cn/) and implemented basic real-time messaging capabilities in your app. See [Send and Receive Messages](https://doc.shengwang.cn/doc/rtm2/javascript/get-started/quick-start).
- Followed [Build Voice Interaction with an Agent](../get-started/quick-start.md) to implement the basic logic for interacting with the agent.
- Ensured that RTC is available, RTM is logged in, and the lifecycles of the RTC and RTM instances are longer than the lifecycle of the component. The component does not manage RTC or RTM initialization, lifecycle, authentication, or login state internally.

## Implementation

### Integrate the Component

#### Android

Copy the `convoaiApi` folder into your project and import the component before calling its API. See [Component Structure](#component-structure) to learn the role of each file.

- [convoaiApi](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/Android/scenes/convoai/src/main/java/io/agora/scene/convoai/convoaiApi)

#### iOS

Copy the `ConversationalAIAPI` folder into your project and import the component before calling its API. See [Component Structure](#component-structure) to learn the role of each file.

- [ConversationalAIAPI](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/iOS/Scenes/ConvoAI/ConvoAI/ConvoAI/Classes/ConversationalAIAPI)

#### Web

Copy the `conversational-ai-api` file into your own project and import the component before calling its API. See [Component Structure](#component-structure) to learn the role of each file.

- [conversational-ai-api](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/Web/Scenes/VoiceAgent/src/conversational-ai-api)

### Initialize the Component

Create a configuration object for the RTC and RTM instances, set the subtitle render mode, and then create a component instance:

#### Android

```kotlin
// Create a configuration object for the RTC and RTM instances
val config = ConversationalAIAPIConfig(
    rtcEngine = rtcEngineInstance,
    rtmClient = rtmClientInstance,
    /**
     * Set the subtitle render mode. Supported values:
     * - `TranscriptRenderMode.Word`: Word-by-word render mode. Subtitle content received in callbacks is rendered to the UI word by word.
     * - `TranscriptRenderMode.Text`: Sentence render mode. Subtitle content received in callbacks is rendered to the UI as full text.
     */
    renderMode = TranscriptRenderMode.Word,
    enableLog = true
)
// Create the component instance
val api = ConversationalAIAPIImpl(config)
```

#### iOS

```swift
/// Create a configuration object for the RTC and RTM instances
let config = ConversationalAIAPIConfig(
    rtcEngine: rtcEngine,
    rtmEngine: rtmEngine,
    /**
     * Set the subtitle render mode. Supported values:
     * - `.words`: Word-by-word render mode. Subtitle content received in callbacks is rendered to the UI word by word.
     * - `.text`: Sentence render mode. Subtitle content received in callbacks is rendered to the UI as full text.
     */
    renderMode: .words,
    enableLog: true
)
/// Create the component instance
convoAIAPI = ConversationalAIAPIImpl(config: config)
```

#### Web

```typescript
// Initialize the component
ConversationalAIAPI.init({
    rtcEngine,
    rtmEngine,
/**
 * Set the subtitle render mode. Supported values:
 * - `ESubtitleHelperMode.WORD`: Word-by-word render mode. Subtitle content received in callbacks is rendered to the UI word by word.
 * - `ESubtitleHelperMode.TEXT`: Sentence render mode. Subtitle content received in callbacks is rendered to the UI as full text.
 *
 * If not specified, the mode is determined automatically based on the message, or you can specify it manually.
 */
    renderMode: ESubtitleHelperMode.WORD,
    })

// Get the API instance (singleton)
const conversationalAIAPI = ConversationalAIAPI.getInstance()
```

> Info
> In word-by-word render mode (`ESubtitleHelperMode.WORD`), the component must receive audio timestamp information from RTC in order to synchronize subtitles with speech output. Therefore, before creating the client object, make sure the following is configured:
> ```typescript
// Enable delivery of audio timestamp metadata
AgoraRTC.setParameter("ENABLE_AUDIO_PTS_METADATA", true);
// Create the client object and specify the channel mode and codec
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
```

### Register Subtitle Callbacks

Call `addHandler` to register and implement subtitle transcription callbacks:

#### Android

```kotlin
api.addHandler(covEventHandler)
```

#### iOS

```swift
convoAIAPI.addHandler(handler: self)
```

#### Web

```typescript
// Listen for transcription updates to display subtitles in real time
conversationalAIAPI.on(EConversationalAIAPIEvents.TRANSCRIPT_UPDATED, onTextChanged)
```

### Implement the Subtitle Data Callback Interface

You need to implement the subtitle handling logic yourself and update the UI based on the transcription content.

#### Android

Make your subtitle UI module inherit from the `IConversationalAIAPIEventHandler` interface and implement `onTranscriptUpdated` to render subtitles to the UI:

```kotlin
 private val covEventHandler = object : IConversationalAIAPIEventHandler {
   override fun onTranscriptUpdated(agentUserId: String, transcript: Transcript) {
        // Receive subtitle updates and update the UI here
    }
}
```

#### iOS

Make your subtitle UI module conform to the `ConversationalAIAPIEventHandler` protocol and implement `onTranscriptUpdated` to render subtitles to the UI:

```swift
extension ChatViewController: ConversationalAIAPIEventHandler {
    public func onTranscriptUpdated(agentUserId: String, transcript: Transcript) {
        // Receive subtitle updates and update the UI here
    }
}
```

#### Web

Make your subtitle UI module receive subtitle callbacks from the client component and implement a simple React component to display the messages:

> Info
> - All `TRANSCRIPT_UPDATED` callbacks return the complete chat history list. The most recent several subtitle items may be updated each time. Render the UI based on the full list.
> - It is recommended to use a state-management library such as `zustand` or `redux` instead of `React.useState` when you need to share state across components.

```tsx
import * as React from "react"
import {
  type IUserTranscript,
  type IAgentTranscript,
  type ISubtitleHelperItem,
  EConversationalAIAPIEvents,
} from "@/conversational-ai-api/type"
import { ConversationalAIAPI } from "@/conversational-ai-api"

// Listen for transcription updates to display subtitles in real time
export const ChatHistory = () => {
  const [chatHistory, setChatHistory] = React.useState<
    ISubtitleHelperItem<Partial<IUserTranscript | IAgentTranscript>>[]
  >([])

  const conversationalAIAPI = ConversationalAIAPI.getInstance()
  conversationalAIAPI.on(
    EConversationalAIAPIEvents.TRANSCRIPT_UPDATED,
    setChatHistory
  )

  return (
    <>
      {chatHistory.map((message) => (
        <div key={`${message.uid}-${message.turn_id}`}>
          {message.uid}: {message.text}
        </div>
      ))}
    </>
  )
}
```

### Subscribe to Channel Messages

Subtitle transcription content is delivered through RTM channel messages. Before starting an agent session, subscribe to channel messages so you can receive subtitle data.

#### Android

Call `subscribeMessage` before starting the agent session:

```kotlin
api.subscribeMessage("channelName") { error ->
    if (error != null) {
        // Handle the error
    }
}
```

#### iOS

Call `subscribeMessage` before starting the agent session:

```swift
convoAIAPI.subscribeMessage(channelName: channelName) { error in
    if let error = error {
        print("Subscription failed: \(error.message)")
    } else {
        print("Subscription succeeded")
    }
}
```

#### Web

```typescript
conversationalAIAPI.subscribeMessage(channel_name)
```

### Make the Agent Join the Channel

Call [POST Create a Conversational AI Agent](../operations/start-agent.md) and complete the following parameter settings:

- `advanced_features.enable_rtm: true` - required, enables RTM
- `parameters.data_channel: "rtm"` - required, enables the RTM data transport channel
- `parameters.enable_metrics: true` - optional, receive agent performance metrics
- `parameters.enable_error_message: true` - optional, receive agent error events

After the call succeeds, the agent joins the specified RTC channel and the user can start interacting with the agent.

### Unsubscribe from Channel Messages

After each agent session ends, you need to unsubscribe from channel messages to release subtitle-related resources.

#### Android

```kotlin
api.unsubscribeMessage("channelName") { error ->
    if (error != null) {
        // Handle the error
    }
}
```

#### iOS

```swift
/// Unsubscribe from channel messages
convoAIAPI.unsubscribeMessage(channelName: channelName) { error in
    if let error = error {
        print("Unsubscribe failed: \(error.message)")
    } else {
        print("Unsubscribe succeeded")
    }
}
```

#### Web

```typescript
conversationalAIAPI.unsubscribeMessage(channel_name)
```

### Destroy the Component Instance

After the AI conversation scenario ends or before closing the app, destroy the component instance to release all resources used by the component.

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

Agora provides an open-source real-time subtitle sample project for reference. You can download it or view the source code:

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
  - `utils/events.ts` - Event manager class. You can extend it to implement event listening and playback more easily.
  - `utils/sub-render.ts` - Subtitle-related modules

### API Reference

#### Android

- [`addHandler`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#addhandler)
  - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#subscribemessage)
  - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#unsubscribemessage)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#destroy)
  - [`onTranscriptUpdated`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#ontranscriptupdated)

#### iOS

- [`addHandler`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#addhandler)
  - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#subscribemessage)
  - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#unsubscribemessage)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#destroy)
  - [`onTranscriptUpdated`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#ontranscriptupdated)

#### Web

- [`IConversationalAIAPIEventHandler`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/struct#iconversationalaiapieventhandlers)
  - [`EConversationalAIAPIEvents`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#econversationalaiapievents)
  - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#subscribemessage)
  - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#unsubscribemessage)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#destroy)
