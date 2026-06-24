---
title: Listen to agent runtime events on software clients
description: Use toolkit callbacks to update the UI and react to agent events during a live session.
---
Real-time Conversational AI applications require responsive user interfaces that react to agent events. This page explains how to implement agent event handling with the Conversational AI Engine toolkit.

For the combined entry point that compares client toolkit and webhook delivery, see [Get runtime events](get-runtime-events).

Use this page when you need in-session signals in a mobile or web client. If you need backend monitoring, alerting, or post-session analysis, use [Receive agent runtime events on your server](webhooks) instead.

## Understand the tech

Agora provides a flexible, scalable, and standardized conversational AI engine toolkit. The toolkit supports **iOS**, **Android**, and **Web** platforms, and encapsulates scenario-based APIs. You can use these APIs to integrate the capabilities of the Agora Signaling SDK and Video SDK to enable the following features:

- [Interrupt agents](interrupt-agent)
- [Display live transcripts](transcripts)
- [Monitor agent status, errors, and performance](monitor-agent-runtime)
- [Set optimal audio parameters](../../best-practices/audio-setup) for iOS and Android

The toolkit exposes callback methods that let you listen for various agent-related events and system information:

- **`onAgentStateChanged`**: listen for agent state changes such as `silent`, `listening`, `thinking`, and `speaking`.
- **`onAgentListeningChanged`**: track when the agent starts or stops listening.
- **`onAgentThinkingChanged`**: track when the agent starts or stops processing.
- **`onAgentSpeakingChanged`**: track when the agent starts or stops playing speech.
- **`onAgentInterrupted`**: handle interruption events triggered during a conversation.
- **`onAgentMetrics`**: observe performance metrics such as LLM and TTS latency.
- **`onAgentError`**: handle module-level failures such as LLM or TTS errors.

## Prerequisites

- Implemented the Conversational AI Engine [REST quickstart](../../get-started/quickstart).
- Your app integrates Agora Video SDK v4.5.1 or later and includes the [audio and video quickstart](../../../introduction/realtime-audio-video).
- Enabled Signaling in the Agora Console and completed the [Signaling quickstart](../../../realtime-media/rtm/index) for basic messaging.
- You maintain active and authenticated RTC and Signaling instances that persist beyond the component lifecycle. The toolkit does not manage RTC or Signaling initialization, lifecycle, or authentication.

## Implementation

<CodeBlockTabs defaultValue="android">
<CodeBlockTabsList>
  <CodeBlockTabsTrigger value="android">Android</CodeBlockTabsTrigger>
  <CodeBlockTabsTrigger value="ios">iOS</CodeBlockTabsTrigger>
  <CodeBlockTabsTrigger value="web">Web</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="android">

1. **Integrate the toolkit**

   Copy the [`convoaiApi`](https://github.com/AgoraIO-Community/Conversational-AI-Demo/tree/main/Android/scenes/convoai/src/main/java/io/agora/scene/convoai/convoaiApi) folder to your project and import the toolkit before calling the toolkit API. Refer to [Folder structure](#folder-structure) to understand the role of each file.

2. **Create a toolkit instance**

   ```kotlin
   val config = ConversationalAIAPIConfig(
       rtcEngine = rtcEngineInstance,
       rtmClient = rtmClientInstance,
       enableLog = true
   )

   val api = ConversationalAIAPIImpl(config)
   ```

3. **Register events**

   ```kotlin
   api.addHandler(object : IConversationalAIAPIEventHandler {
       override fun onAgentStateChanged(agentUserId: String, event: StateChangeEvent) {
           when (event.state) {
               AgentState.SILENT -> updateAgentStatus("Waiting...")
               AgentState.LISTENING -> updateAgentStatus("Listening...")
               AgentState.THINKING -> updateAgentStatus("Thinking...")
               AgentState.SPEAKING -> updateAgentStatus("Speaking...")
               AgentState.UNKNOWN -> Log.w("AgentState", "Unknown agent state: $event")
           }
       }

       override fun onAgentInterrupted(agentUserId: String, event: InterruptEvent) {
           Log.d("AgentInterrupt", "Agent $agentUserId interrupted at turn ${event.turnId}")
           showInterruptNotification()
       }

       override fun onAgentMetrics(agentUserId: String, metric: Metric) {
           when (metric.type) {
               ModuleType.LLM -> Log.d("Metrics", "LLM latency: ${metric.value} ms")
               ModuleType.TTS -> Log.d("Metrics", "TTS latency: ${metric.value} ms")
               else -> Log.d("Metrics", "${metric.type}: ${metric.name} = ${metric.value}")
           }
       }

       override fun onAgentError(agentUserId: String, error: ModuleError) {
           Log.e("AgentError", "Error in ${error.type}: ${error.message} (code: ${error.code})")
       }
   })
   ```

4. **Subscribe to the channel**

   ```kotlin
   api.subscribeMessage("channelName") { error ->
       if (error != null) {
           // Handle error
       }
   }
   ```

5. **Add a conversational AI agent to the channel**

   To [start a conversational AI agent](/en/api-reference/api-ref/conversational-ai/join), configure:

   | Parameter | Description | Required |
   | --- | --- | --- |
   | `advanced_features.enable_rtm: true` | Starts the Signaling service | Yes |
   | `parameters.data_channel: "rtm"` | Enables Signaling as the data transmission channel | Yes |
   | `parameters.enable_metrics: true` | Enables agent performance data collection | Optional |
   | `parameters.enable_error_message: true` | Enables reporting of agent error events | Optional |

6. **Unsubscribe and release resources**

   ```kotlin
   api.unsubscribeMessage("channelName") { error ->
       if (error != null) {
           // Handle the error
       }
   }

   api.destroy()
   ```

</CodeBlockTab>

<CodeBlockTab value="ios">

1. **Integrate the toolkit**

   Copy the [`ConversationalAIAPI`](https://github.com/AgoraIO-Community/Conversational-AI-Demo/tree/main/iOS/Scenes/ConvoAI/ConvoAI/ConvoAI/Classes/ConversationalAIAPI) folder to your project and import the toolkit before calling the toolkit APIs. Refer to [Folder structure](#folder-structure) to understand the role of each file.

2. **Create a toolkit instance**

   ```swift
   let config = ConversationalAIAPIConfig(
       rtcEngine: rtcEngine,
       rtmEngine: rtmEngine,
       enableLog: true
   )

   convoAIAPI = ConversationalAIAPIImpl(config: config)
   ```

3. **Register events**

   ```swift
   class ConversationViewController: UIViewController, ConversationalAIAPIEventHandler {
       func onAgentStateChanged(agentUserId: String, event: StateChangeEvent) {
           DispatchQueue.main.async {
               self.updateAgentStatus(event.state)
           }
       }

       func onAgentInterrupted(agentUserId: String, event: InterruptEvent) {
           print("Agent \(agentUserId) interrupted at turn \(event.turnId)")
       }

       func onAgentMetrics(agentUserId: String, metrics: Metric) {
           switch metrics.type {
           case .llm:
               print("LLM latency: \(metrics.value)ms")
           case .tts:
               print("TTS latency: \(metrics.value)ms")
           case .unknown:
               print("Unknown metric: \(metrics.name) = \(metrics.value)")
           }
       }

       func onAgentError(agentUserId: String, error: ModuleError) {
           print("Error in \(error.type): \(error.message) (code: \(error.code))")
       }
   }

   convoAIAPI.addHandler(handler: self)
   ```

4. **Subscribe to the channel**

   ```swift
   convoAIAPI.subscribeMessage(channelName: channelName) { error in
       if let error = error {
           print("Subscription failed: \(error.message)")
       } else {
           print("Subscription successful")
       }
   }
   ```

5. **Add a conversational AI agent to the channel**

   To [start a conversational AI agent](/en/api-reference/api-ref/conversational-ai/join), configure:

   | Parameter | Description | Required |
   | --- | --- | --- |
   | `advanced_features.enable_rtm: true` | Starts the Signaling service | Yes |
   | `parameters.data_channel: "rtm"` | Enables Signaling as the data transmission channel | Yes |
   | `parameters.enable_metrics: true` | Enables collection of agent performance data | Optional |
   | `parameters.enable_error_message: true` | Enables reporting of agent error events | Optional |

6. **Unsubscribe and release resources**

   ```swift
   convoAIAPI.unsubscribeMessage(channelName: channelName) { error in
       if let error = error {
           print("Unsubscription failed: \(error.message)")
       } else {
           print("Unsubscribed successfully")
       }
   }

   convoAIAPI.destroy()
   ```

</CodeBlockTab>

<CodeBlockTab value="web">

1. **Integrate the toolkit**

   Copy the [`conversational-ai-api`](https://github.com/AgoraIO-Community/Conversational-AI-Demo/tree/main/Web/Scenes/VoiceAgent/src/conversational-ai-api) file to your project and import the toolkit before calling its API. Refer to [Folder structure](#folder-structure) to understand the role of each file.

2. **Create a toolkit instance**

   ```tsx
   ConversationalAIAPI.init({
       rtcEngine,
       rtmEngine,
   })

   const conversationalAIAPI = ConversationalAIAPI.getInstance()
   ```

3. **Register events**

   ```tsx
   conversationalAIAPI.on(EConversationalAIAPIEvents.AGENT_STATE_CHANGED, onAgentStateChanged)
   conversationalAIAPI.on(EConversationalAIAPIEvents.AGENT_METRICS, onAgentMetricsChanged)
   conversationalAIAPI.on(EConversationalAIAPIEvents.AGENT_ERROR, onAgentError)
   ```

4. **Subscribe to the channel**

   ```ts
   conversationalAIAPI.subscribeMessage(channel_name)
   ```

5. **Add a conversational AI agent to the channel**

   To [start a conversational AI agent](/en/api-reference/api-ref/conversational-ai/join), configure:

   | Parameter | Description | Required |
   | --- | --- | --- |
   | `advanced_features.enable_rtm: true` | Starts the Signaling service | Yes |
   | `parameters.data_channel: "rtm"` | Enables Signaling as the data transmission channel | Yes |
   | `parameters.enable_metrics: true` | Enables agent performance data collection | Optional |
   | `parameters.enable_error_message: true` | Enables reporting of agent error events | Optional |

6. **Unsubscribe and release resources**

   ```ts
   conversationalAIAPI.unsubscribeMessage(channel_name)
   conversationalAIAPI.destroy()
   ```

</CodeBlockTab>

</CodeBlockTabs>

## Reference

### Sample project

- [Conversational-AI-Demo](https://github.com/AgoraIO-Community/Conversational-AI-Demo/)

### Related guides

- [Monitor agent status, errors, and performance](monitor-agent-runtime)
- [Receive agent runtime events on your server](webhooks)

### Folder structure

<CodeBlockTabs defaultValue="android">
<CodeBlockTabsList>
  <CodeBlockTabsTrigger value="android">Android</CodeBlockTabsTrigger>
  <CodeBlockTabsTrigger value="ios">iOS</CodeBlockTabsTrigger>
  <CodeBlockTabsTrigger value="web">Web</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="android">

- `IConversationalAIAPI.kt`: API interface, data structures, and enumerations
- `ConversationalAIAPIImpl.kt`: main implementation logic
- `ConversationalAIUtils.kt`: utility functions and event callback management
- `v3/`
  - `TranscriptionController.kt`: transcript rendering and synchronization
  - `MessageParser.kt`: transcription and message parsing

</CodeBlockTab>

<CodeBlockTab value="ios">

- `ConversationalAIAPI.swift`: API interface, data structures, and enumerations
- `ConversationalAIAPIImpl.swift`: main implementation logic
- `Transcription/`
  - `TranscriptionController.swift`: transcript rendering and control

</CodeBlockTab>

<CodeBlockTab value="web">

- `index.ts`: main API class
- `type.ts`: API interfaces, data structures, and enumerations
- `utils/`
  - `index.ts`: general utility functions
  - `events.ts`: event management class
  - `sub-render.ts`: transcript rendering module

</CodeBlockTab>
</CodeBlockTabs>

### API reference

<CodeBlockTabs defaultValue="android">
<CodeBlockTabsList>
  <CodeBlockTabsTrigger value="android">Android</CodeBlockTabsTrigger>
  <CodeBlockTabsTrigger value="ios">iOS</CodeBlockTabsTrigger>
  <CodeBlockTabsTrigger value="web">Web</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="android">

- [`addHandler`](../../../api-reference/conversational-ai/client-toolkit/android#addhandler)
- [`subscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/android#subscribemessage)
- [`unsubscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/android#unsubscribemessage)
- [`destroy`](../../../api-reference/conversational-ai/client-toolkit/android#destroy)
- [`onAgentStateChanged`](../../../api-reference/conversational-ai/client-toolkit/android#onagentstatechanged)
- [`onAgentListeningChanged`](../../../api-reference/conversational-ai/client-toolkit/android#onagentlisteningchanged)
- [`onAgentThinkingChanged`](../../../api-reference/conversational-ai/client-toolkit/android#onagentthinkingchanged)
- [`onAgentSpeakingChanged`](../../../api-reference/conversational-ai/client-toolkit/android#onagentspeakingchanged)
- [`onAgentInterrupted`](../../../api-reference/conversational-ai/client-toolkit/android#onagentinterrupted)
- [`onAgentMetrics`](../../../api-reference/conversational-ai/client-toolkit/android#onagentmetrics)
- [`onAgentError`](../../../api-reference/conversational-ai/client-toolkit/android#onagenterror)

</CodeBlockTab>

<CodeBlockTab value="ios">

- [`addHandler`](../../../api-reference/conversational-ai/client-toolkit/ios#addhandler)
- [`subscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/ios#subscribemessage)
- [`unsubscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/ios#unsubscribemessage)
- [`destroy`](../../../api-reference/conversational-ai/client-toolkit/ios#destroy)
- [`onAgentStateChanged`](../../../api-reference/conversational-ai/client-toolkit/ios#onagentstatechanged)
- [`onAgentListeningChanged`](../../../api-reference/conversational-ai/client-toolkit/ios#onagentlisteningchanged)
- [`onAgentThinkingChanged`](../../../api-reference/conversational-ai/client-toolkit/ios#onagentthinkingchanged)
- [`onAgentSpeakingChanged`](../../../api-reference/conversational-ai/client-toolkit/ios#onagentspeakingchanged)
- [`onAgentInterrupted`](../../../api-reference/conversational-ai/client-toolkit/ios#onagentinterrupted)
- [`onAgentMetrics`](../../../api-reference/conversational-ai/client-toolkit/ios#onagentmetrics)
- [`onAgentError`](../../../api-reference/conversational-ai/client-toolkit/ios#onagenterror)

</CodeBlockTab>

<CodeBlockTab value="web">

- [`IConversationalAIAPIEventHandler`](../../../api-reference/conversational-ai/client-toolkit/web#iconversationalaiapieventhandlers-interface)
- [`EConversationalAIAPIEvents`](../../../api-reference/conversational-ai/client-toolkit/web#econversationalaiapievents)
- [`subscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/web#subscribemessage)
- [`unsubscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/web#unsubscribe)
- [`destroy`](../../../api-reference/conversational-ai/client-toolkit/web#destroy)

</CodeBlockTab>
</CodeBlockTabs>
