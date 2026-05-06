---
title: Listen to Agent Events
description: "When interacting with a conversational AI agent in real time, you may need to listen to agent-related events to implement richer features. This article explains how to listen to agent-related events in your app."
---

# Listen to Agent Events

When interacting with a conversational AI agent in real time, you may need to listen to agent-related events to implement richer features. This article explains how to listen to agent-related events in your app.

## How It Works

Agora provides a flexible, extensible, and standardized set of client components for Conversational AI Engine. These components support iOS, Android, and Web, and encapsulate multiple scenario-oriented APIs. By calling these APIs, you can combine the capabilities of the Agora [RTC SDK](https://doc.shengwang.cn/doc/rtc/homepage) and [RTM SDK](https://doc.shengwang.cn/doc/rtm2/homepage) to implement the following features:

- [Interrupt an agent](./interrupt-agent.md)
- [Real-Time Subtitles](./realtime-sub.md)
- [Listen to agent-related events](./listen-agent-events.md)
- [Set optimal audio parameters](../best-practice/audio-settings.md) (Android and iOS only)
- [Send image messages](./send-multimodal-message.md)

The components provide a series of callbacks for listening to different agent-related events and information:

- `onAgentStateChanged`: Listens to agent state changes (silent/listening/thinking/speaking) by receiving RTM `presence` events. It can be used to update the agent UI or track the conversation flow.
- `onAgentInterrupted`: Listens to agent interruption events by receiving RTM `message` events.
- `onAgentMetrics`: Listens to agent performance metrics, including LLM inference latency and TTS synthesis latency, by receiving RTM `message` events. It can be used for system performance monitoring.
- `onAgentError`: Listens to agent error events by receiving RTM `message` events, for example when an agent module such as LLM or TTS encounters an error. It can be used for error monitoring, logging, and graceful degradation.

## Prerequisites

Before you start, make sure you have completed the following:

- Integrated RTC SDK v4.5.1 or later and implemented basic real-time audio and video capabilities in your app, including obtaining the required device permissions. See [Build a Video Calling App](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start).
- Enabled RTM for the project in the [Console](https://console.shengwang.cn/) and implemented basic real-time messaging capabilities in your app. See [Send and Receive Messages](https://doc.shengwang.cn/doc/rtm2/javascript/get-started/quick-start).
- Followed [Build Voice Interaction with an Agent](../get-started/quick-start.md) to implement the basic logic for interacting with the agent.
- Ensured that RTC is available, RTM is logged in, and the lifecycles of the RTC and RTM instances are longer than the lifecycle of the component. The component does not manage RTC or RTM initialization, lifecycle, authentication, or login state internally.

## Implementation Steps

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

### Register Callbacks

#### Android

Call `addHandler` to register and implement agent-related event callbacks:

```kotlin
// Register callbacks
api.addHandler(object : IConversationalAIAPIEventHandler {
    // Listen for agent state changes
    override fun onAgentStateChanged(agentUserId: String, event: StateChangeEvent) {
        when (event.state) {
            AgentState.SILENT -> {
                updateAgentStatus("Waiting...")
            }
            AgentState.LISTENING -> {
                updateAgentStatus("Listening...")
            }
            AgentState.THINKING -> {
                updateAgentStatus("Thinking...")
            }
            AgentState.SPEAKING -> {
                updateAgentStatus("Speaking...")
            }
            AgentState.UNKNOWN -> {
                Log.w("AgentState", "Unknown agent state: $event")
            }
        }
    }
    // Listen for agent interruption events
    override fun onAgentInterrupted(agentUserId: String, event: InterruptEvent) {
        // The agent was interrupted. Update the UI or record logs.
        Log.d("AgentInterrupt", "Agent $agentUserId interrupted at turn ${event.turnId}")
        // You can update the UI here, for example by showing "Conversation interrupted"
        showInterruptNotification()
    }
    // Listen for agent performance metrics for monitoring and optimization
    override fun onAgentMetrics(agentUserId: String, metric: Metric) {
        when (metric.type) {
            ModuleType.LLM -> {
                Log.d("Metrics", "LLM latency: ${metric.value}ms")
                // You can record LLM response time for performance analysis
            }
            ModuleType.TTS -> {
                Log.d("Metrics", "TTS latency: ${metric.value}ms")
                // You can record TTS synthesis time
            }
            else -> {
                Log.d("Metrics", "${metric.type}: ${metric.name} = ${metric.value}")
            }
        }
    }
    // Listen for agent error events
    override fun onAgentError(agentUserId: String, error: ModuleError) {

        Log.e("AgentError", "Error in ${error.type}: ${error.message} (code: ${error.code})")

        when (error.type) {
            ModuleType.LLM -> {
                // LLM error, retry or degrade if needed
                showErrorMessage("AI processing failed. Please try again later.")
            }
            ModuleType.TTS -> {
                // TTS error, you may need to switch to text mode
                showErrorMessage("Speech synthesis failed")
            }
            else -> {
                // Other error types
                showErrorMessage("System error: ${error.message}")
            }
        }
    }

    override fun onDebugLog(log: String) {
        // Handle debug logs
        if (BuildConfig.DEBUG) {
            Log.d("ConvoAI", log)
        }
        // You can send logs to a remote server for diagnosis
    }
})
```

#### iOS

Call `addHandler` to register and implement agent-related event callbacks:

```swift
// Make your class conform to ConversationalAIAPIEventHandler
class ConversationViewController: UIViewController, ConversationalAIAPIEventHandler {

    // Implement protocol methods
    func onAgentStateChanged(agentUserId: String, event: StateChangeEvent) {
        // Update the UI to display the current agent state
        DispatchQueue.main.async {
            self.updateAgentStatus(event.state)
        }
    }

    func onAgentInterrupted(agentUserId: String, event: InterruptEvent) {
        // The agent was interrupted. Update the UI or record logs.
        print("Agent \(agentUserId) interrupted at turn \(event.turnId)")
        DispatchQueue.main.async {
            self.showInterruptNotification()
        }
    }

    func onAgentMetrics(agentUserId: String, metrics: Metric) {
        // Listen for agent performance metrics for monitoring and optimization
        switch metrics.type {
        case .llm:
            print("LLM latency: \(metrics.value)ms")
            // You can record LLM response time for performance analysis
        case .tts:
            print("TTS latency: \(metrics.value)ms")
            // You can record TTS synthesis time
        case .unknown:
            print("Unknown metric: \(metrics.name) = \(metrics.value)")
        }
    }

    func onAgentError(agentUserId: String, error: ModuleError) {
        // Listen for agent error events
        print("Error in \(error.type): \(error.message) (code: \(error.code))")

        DispatchQueue.main.async {
            switch error.type {
            case .llm:
                // LLM error, retry or degrade if needed
                self.showErrorMessage("AI processing failed. Please try again later.")
            case .tts:
                // TTS error, you may need to switch to text mode
                self.showErrorMessage("Speech synthesis failed")
            case .mllm:
                // MLLM error
                self.showErrorMessage("Multimodal AI processing failed")
            case .unknown:
                // Other error types
                self.showErrorMessage("System error: \(error.message)")
            }
        }
    }

    // Helper method used to update the UI with the current agent state
    private func updateAgentStatus(_ state: AgentState) {
        let (text, color): (String, UIColor) = {
            switch state {
            case .idle:
                return ("Idle", .gray)
            case .silent:
                return ("Waiting...", .gray)
            case .listening:
                return ("Listening...", .blue)
            case .thinking:
                return ("Thinking...", .orange)
            case .speaking:
                return ("Speaking...", .green)
            case .unknown:
                return ("Unknown state", .red)
            }
        }()

        statusLabel.text = text
        statusLabel.textColor = color
    }

    private func showInterruptNotification() {
        statusLabel.text = "Conversation interrupted"
        statusLabel.textColor = .red
    }

    private func showErrorMessage(_ message: String) {
        let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

// Register event callbacks
convoAIAPI.addHandler(handler: self)
```

#### Web

```typescript
// Listen for agent state changes
conversationalAIAPI.on(EConversationalAIAPIEvents.AGENT_STATE_CHANGED, onAgentStateChanged)
// Listen for agent performance metrics
conversationalAIAPI.on(EConversationalAIAPIEvents.AGENT_METRICS, onAgentMetricsChanged)
// Listen for agent error events
conversationalAIAPI.on(EConversationalAIAPIEvents.AGENT_ERROR, onAgentError)
```

### Subscribe to Channel Messages

Agent-related events are delivered through RTM channel messages. Before starting an agent session, call `subscribeMessage` to subscribe to channel messages so you can receive agent-related events.

#### Android

```kotlin
api.subscribeMessage("channelName") { error ->
    if (error != null) {
        // Handle the error
    }
}
```

#### iOS

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

After each agent session ends, you need to unsubscribe from channel messages to release resources associated with callback events.

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
  - `utils/events.ts` - Event manager class. You can extend it to implement event listening and playback more easily.
  - `utils/sub-render.ts` - Subtitle-related modules

### API Reference

#### Android

- [`addHandler`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#addhandler)
  - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#subscribemessage)
  - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#unsubscribemessage)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#destroy)
  - [`onAgentStateChanged`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagentstatechanged)
  - [`onAgentInterrupted`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagentinterrupted)
  - [`onAgentMetrics`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagentmetrics)
  - [`onAgentError`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagenterror)

#### iOS

- [`addHandler`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#addhandler)
  - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#subscribemessage)
  - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#unsubscribemessage)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#destroy)
  - [`onAgentStateChanged`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagentstatechanged)
  - [`onAgentInterrupted`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagentinterrupted)
  - [`onAgentMetrics`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagentmetrics)
  - [`onAgentError`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagenterror)

#### Web

- [`IConversationalAIAPIEventHandler`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/struct#iconversationalaiapieventhandlers)
  - [`EConversationalAIAPIEvents`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#econversationalaiapievents)
  - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#subscribemessage)
  - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#unsubscribemessage)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#destroy)
