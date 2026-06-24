---
title: Display live transcripts
description: Add real-time transcripts to your conversations with the Conversational AI agent.
---
When interacting with conversational AI in real time, you can enable live transcripts to display the conversation content. This page explains how to implement live transcripts in your app.

## Understand the tech

Agora provides a flexible, scalable, and standardized conversational AI engine toolkit. The toolkit supports **iOS**, **Android**, and **Web** platforms, and encapsulates scenario-based APIs. You can use these APIs to integrate the capabilities of the [Agora Signaling SDK](/en/realtime-media/rtm) and [Agora Video SDK](/en/introduction/realtime-audio-video) to enable the following features:

- [Interrupt agents](interrupt-agent)
- [Display live transcripts](transcripts)
- [Receive event notifications](event-notifications)
- [Set optimal audio parameters](/en/ai/apps/build/harden-and-optimize/audio-setup) for iOS and Android
- [Send picture messages](send-multimodal-messages)

The toolkit receives transcript content through the `onTranscriptUpdated` callback and supports monitoring the following transcript data types:

- **Agent transcript**: The agent's speech, including streaming updates and final results.
- **User transcript**: The user's speech, including real-time display and status management.
- **Transcript status**: State changes such as in progress, completed, or interrupted.

The following diagram outlines the step-by-step process to integrate live transcript functionality into your application:

<details>
<summary>Transcript rendering workflow</summary>

![](/images/conversational-ai/transcript-workflow.svg)

</details>

## Prerequisites

Before you begin, ensure the following:

- You have implemented the Conversational AI Engine [REST quickstart](/en/ai/apps/get-started/quickstart).
- Your app integrates Agora Video SDK v4.5.1 or later and includes the [audio and video quickstart](/en/introduction/realtime-audio-video).
- You have enabled Signaling in the Agora Console and completed the [Signaling quickstart](/en/realtime-media/rtm) for basic messaging.
- You maintain active and authenticated RTC and Signaling instances that persist beyond the component lifecycle. The toolkit does not manage RTC or Signaling initialization, lifecycle, or authentication.

## Implementation

This section describes how to receive transcript content from the transcript processing module and display it in your app UI.

<Tabs>
<TabsList>
  <TabsTrigger value="android">Android</TabsTrigger>
  <TabsTrigger value="ios">iOS</TabsTrigger>
  <TabsTrigger value="web">Web</TabsTrigger>
</TabsList>

<TabsContent value="android">

1. **Integrate the toolkit**

   Copy the [`convoaiApi`](https://github.com/AgoraIO-Community/Conversational-AI-Demo/tree/main/Android/scenes/convoai/src/main/java/io/agora/scene/convoai/convoaiApi) folder to your project and import the toolkit before calling the toolkit API. Refer to [Folder structure](#folder-structure) to understand the role of each file.

2. **Create a toolkit instance**

   Create a configuration object with the Video SDK and Signaling engine instances. Set the transcript rendering mode, then use the configuration to create a toolkit instance.

   ```kotlin
   // Create configuration objects for the RTC and RTM instances
   val config = ConversationalAIAPIConfig(
       rtcEngine = rtcEngineInstance,
       rtmClient = rtmClientInstance,

       // Set the transcript rendering mode. Options:
       // - TranscriptRenderMode.Word: render transcript word by word.
       // - TranscriptRenderMode.Text: render the full sentence at once.
       renderMode = TranscriptRenderMode.Word,
       enableLog = true
   )

   // Create component instance
   val api = ConversationalAIAPIImpl(config)
   ```

3. **Subscribe to the channel**

   Transcript data is delivered through Signaling channel messages. To receive transcript data, call `subscribeMessage` before starting the agent session.

   ```kotlin
   api.subscribeMessage("channelName") { error ->
       if (error != null) {
           // Handle error
       }
   }
   ```

4. **Receive transcript**

   Call the `addHandler` method to register your implementation of the transcription callback.

   ```kotlin
   api.addHandler(covEventHandler)
   ```

5. **Implement UI rendering logic**

   Inherit your UI module from the `IConversationalAIAPIEventHandler` interface. Implement the `onTranscriptUpdated` method to handle transcript rendering to the UI.

   ```kotlin
   private val covEventHandler = object : IConversationalAIAPIEventHandler {
       override fun onTranscriptUpdated(agentUserId: String, transcript: Transcript) {
           // Handle transcript data and update the UI here
       }
   }
   ```

6. **Add a conversational AI agent to the channel**

   To [start a conversational AI agent](/en/api-reference/api-ref/conversational-ai/join), configure the following parameters in your `POST` request:

   | Parameter | Description | Required |
   | --- | --- | --- |
   | `advanced_features.enable_rtm: true` | Starts the Signaling service | Yes |
   | `parameters.data_channel: "rtm"` | Enables Signaling as the data transmission channel | Yes |
   | `parameters.enable_metrics: true` | Enables agent performance data collection | Optional |
   | `parameters.enable_error_message: true` | Enables reporting of agent error events | Optional |

   After a successful response, the agent joins the specified RTC channel and is ready to interact with the user.

7. **Unsubscribe from the channel**

   After an agent session ends, unsubscribe from channel messages to release transcription resources.

   ```kotlin
   api.unsubscribeMessage("channelName") { error ->
       if (error != null) {
           // Handle the error
       }
   }
   ```

8. **Release resources**

   At the end of each call, use the `destroy` method to clean up the cache.

   ```kotlin
   api.destroy()
   ```

</TabsContent>

<TabsContent value="ios">

1. **Integrate the toolkit**

   Copy the [`ConversationalAIAPI`](https://github.com/AgoraIO-Community/Conversational-AI-Demo/tree/main/iOS/Scenes/ConvoAI/ConvoAI/ConvoAI/Classes/ConversationalAIAPI) folder to your project and import the toolkit before calling the toolkit APIs. Refer to [Folder structure](#folder-structure) to understand the role of each file.

2. **Create a toolkit instance**

   Create a configuration object with the Video SDK and Signaling engine instances. Set the transcript rendering mode, then use the configuration to create a toolkit instance.

   ```swift
   // Create a configuration object for the RTC and RTM instances
   let config = ConversationalAIAPIConfig(
       rtcEngine: rtcEngine,
       rtmEngine: rtmEngine,
       /**
        * Set the transcript rendering mode. Available options:
        * - .words: Word-by-word rendering mode.
        * - .text: Sentence-by-sentence rendering mode.
        */
       renderMode: .words,
       enableLog: true
   )

   // Create the component instance
   convoAIAPI = ConversationalAIAPIImpl(config: config)
   ```

3. **Subscribe to the channel**

   Transcript data is delivered through Signaling channel messages. To receive transcript data, call `subscribeMessage` before starting the agent session.

   ```swift
   convoAIAPI.subscribeMessage(channelName: channelName) { error in
       if let error = error {
           print("Subscription failed: \(error.message)")
       } else {
           print("Subscription successful")
       }
   }
   ```

4. **Receive transcript**

   Call the `addHandler` method to register and implement the transcript callback.

   ```swift
   convoAIAPI.addHandler(handler: self)
   ```

5. **Implement UI rendering logic**

   Implement the `ConversationalAIAPIEventHandler` protocol in your UI module, and use `onTranscriptUpdated` to handle and render transcript updates.

   ```swift
   extension ChatViewController: ConversationalAIAPIEventHandler {
       public func onTranscriptUpdated(agentUserId: String, transcript: Transcript) {
           // Handle transcript data and update the UI here
       }
   }
   ```

6. **Add a conversational AI agent to the channel**

   To [start a conversational AI agent](/en/api-reference/api-ref/conversational-ai/join), configure the following parameters in your `POST` request:

   | Parameter | Description | Required |
   | --- | --- | --- |
   | `advanced_features.enable_rtm: true` | Starts the Signaling service | Yes |
   | `parameters.data_channel: "rtm"` | Enables Signaling as the data transmission channel | Yes |
   | `parameters.enable_metrics: true` | Enables agent performance data collection | Optional |
   | `parameters.enable_error_message: true` | Enables reporting of agent error events | Optional |

   After a successful response, the agent joins the specified RTC channel and is ready to interact with the user.

7. **Unsubscribe from the channel**

   After each agent session ends, unsubscribe from channel messages to release transcript-related resources.

   ```swift
   convoAIAPI.unsubscribeMessage(channelName: channelName) { error in
       if let error = error {
           print("Unsubscription failed: \(error.message)")
       } else {
           print("Unsubscribed successfully")
       }
   }
   ```

8. **Release resources**

   At the end of each call, use the `destroy` method to clean up the cache.

   ```swift
   convoAIAPI.destroy()
   ```

</TabsContent>

<TabsContent value="web">

1. **Integrate the toolkit**

   Copy the [`conversational-ai-api`](https://github.com/AgoraIO-Community/Conversational-AI-Demo/tree/main/Web/Scenes/VoiceAgent/src/conversational-ai-api) file to your project and import the toolkit before calling its APIs. Refer to [Folder structure](#folder-structure) to understand the role of each file.

2. **Create a toolkit instance**

   Before joining an RTC channel, create Video SDK and Signaling engine instances and pass them into the toolkit instance.

   ```ts
   // Initialize the component
   ConversationalAIAPI.init({
     rtcEngine,
     rtmEngine,

     /**
      * Set the rendering mode for transcript. Available options:
      * - ESubtitleHelperMode.WORD: render transcript word by word.
      * - ESubtitleHelperMode.TEXT: render the full transcript at once.
      */
     renderMode: ESubtitleHelperMode.WORD,
   })

   // Get the API instance (singleton)
   const conversationalAIAPI = ConversationalAIAPI.getInstance()
   ```

3. **Set audio parameters**

   In word-by-word rendering mode, you must receive audio timestamp metadata from RTC to synchronize subtitles with speech. Before creating the client object, configure the following parameter:

   ```ts
   AgoraRTC.setParameter("ENABLE_AUDIO_PTS_METADATA", true);
   const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
   ```

4. **Subscribe to the channel**

   Agent-related events are delivered through Signaling messages. Before starting an agent session, call `subscribeMessage` to receive these events:

   ```ts
   conversationalAIAPI.subscribeMessage(channel_name)
   ```

5. **Receive transcript**

   Register an event listener to receive transcript updates:

   ```tsx
   import * as React from "react"
   import {
     type IUserTranscription,
     type IAgentTranscription,
     type ISubtitleHelperItem,
     EConversationalAIAPIEvents,
   } from "@/conversational-ai-api/type"
   import { ConversationalAIAPI } from "@/conversational-ai-api"

   export const ChatHistory = () => {
     const [chatHistory, setChatHistory] = React.useState<
       ISubtitleHelperItem<Partial<IUserTranscription | IAgentTranscription>>[]
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

6. **Add a conversational AI agent to the channel**

   To [start a conversational AI agent](/en/api-reference/api-ref/conversational-ai/join), configure the following parameters in your `POST` request:

   | Parameter | Description | Required |
   | --- | --- | --- |
   | `advanced_features.enable_rtm: true` | Starts the Signaling service | Yes |
   | `parameters.data_channel: "rtm"` | Enables Signaling as the data transmission channel | Yes |
   | `parameters.enable_metrics: true` | Enables agent performance data collection | Optional |
   | `parameters.enable_error_message: true` | Enables reporting of agent error events | Optional |

   After a successful response, the agent joins the specified RTC channel and is ready to interact with the user.

7. **Unsubscribe from the channel**

   After each agent session ends, unsubscribe from channel messages to release resources associated with callback events:

   ```ts
   conversationalAIAPI.unsubscribeMessage(channel_name)
   ```

8. **Release resources**

   At the end of each call, use the `destroy` method to clean up the cache.

   ```ts
   conversationalAIAPI.destroy()
   ```

## Reference

This section contains supporting information that completes the guidance on this page.

</TabsContent>
</Tabs>
### Folder structure

<!-- Source content used a shared FolderStructure MDX component. The structure is inlined below. -->

<Tabs>
<TabsList>
  <TabsTrigger value="android">Android</TabsTrigger>
  <TabsTrigger value="ios">iOS</TabsTrigger>
  <TabsTrigger value="web">Web</TabsTrigger>
</TabsList>

<TabsContent value="android">

- `IConversationalAIAPI.kt`: API interface and related data structures and enumerations
- `ConversationalAIAPIImpl.kt`: ConversationalAI API main implementation logic
- `ConversationalAIUtils.kt`: tool functions and event callback management
- `subRender/`
  - `v3/`: transcription module
  - `TranscriptionController.kt`: transcription controller
  - `MessageParser.kt`: message parser

</TabsContent>

<TabsContent value="ios">

- `ConversationalAIAPI.swift`: API interface and related data structures and enumerations
- `ConversationalAIAPIImpl.swift`: ConversationalAI API main implementation logic
- `Transcription/`
  - `TranscriptionController.swift`: transcription controller

</TabsContent>

<TabsContent value="web">

- `index.ts`: API class
- `type.ts`: API interface and related data structures and enumerations
- `utils/`
  - `index.ts`: API utility functions
  - `events.ts`: event management class
  - `sub-render.ts`: transcription module

</TabsContent>
</Tabs>
### API reference

This section provides API reference entry points for the transcript module.

<Tabs>
<TabsList>
  <TabsTrigger value="android">Android</TabsTrigger>
  <TabsTrigger value="ios">iOS</TabsTrigger>
  <TabsTrigger value="web">Web</TabsTrigger>
</TabsList>

<TabsContent value="android">

- [`addHandler`](../../../api-reference/conversational-ai/client-toolkit/android#addhandler)
- [`subscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/android#subscribemessage)
- [`unsubscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/android#unsubscribemessage)
- [`destroy`](../../../api-reference/conversational-ai/client-toolkit/android#destroy)
- [`onTranscriptUpdated`](../../../api-reference/conversational-ai/client-toolkit/android#ontranscriptupdated)

</TabsContent>

<TabsContent value="ios">

- [`addHandler`](../../../api-reference/conversational-ai/client-toolkit/ios#addhandler)
- [`subscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/ios#subscribemessage)
- [`unsubscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/ios#unsubscribemessage)
- [`destroy`](../../../api-reference/conversational-ai/client-toolkit/ios#destroy)
- [`onTranscriptUpdated`](../../../api-reference/conversational-ai/client-toolkit/ios#ontranscriptupdated)

</TabsContent>

<TabsContent value="web">

- [`IConversationalAIAPIEventHandlers interface`](../../../api-reference/conversational-ai/client-toolkit/web#iconversationalaiapieventhandlers-interface)
- [`EConversationalAIAPIEvents`](../../../api-reference/conversational-ai/client-toolkit/web#econversationalaiapievents)
- [`subscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/web#subscribemessage)
- [`unsubscribeMessage`](../../../api-reference/conversational-ai/client-toolkit/web#unsubscribe)
- [`destroy`](../../../api-reference/conversational-ai/client-toolkit/web#destroy)

</TabsContent>
</Tabs>
