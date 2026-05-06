---
title: Send Image Messages
description: "During interactions with an agent, you may need to upload images on the client side or send image messages to help the agent understand user intent. This article describes how to use the Conversational AI Engine client component to send image messages from your app to the LLM and automatically reference image content in subsequent..."
---

# Send Image Messages

During interactions with an agent, you may need to upload images on the client side or send image messages to help the agent understand user intent. This article describes how to use the Conversational AI Engine client component to send image messages from your app to the LLM and automatically reference image content in subsequent conversations with the agent, so the LLM can generate responses that better match user needs based on the image content.

## Technical Principles

Agora provides a flexible, extensible, and standardized Conversational AI Engine client component (hereinafter referred to as the component). The component supports iOS, Android, and Web, and encapsulates multiple scenario-based APIs. You only need to call these APIs to integrate the capabilities of Agora [Real-Time Engagement (RTC) SDK](https://doc.shengwang.cn/doc/rtc/homepage) and [Real-Time Messaging (RTM) SDK](https://doc.shengwang.cn/doc/rtm2/homepage) to implement the following features:
- [Interrupt an Agent](./interrupt-agent.md)
- [Real-Time Subtitles](./realtime-sub.md)
- [Listen for Agent Events](./listen-agent-events.md)
- [Configure Optimal Audio Parameters](../best-practice/audio-settings.md) (Android and iOS only)
- [Send Image Messages](./send-multimodal-message.md)

Call the component's `chat` API to send image messages, and listen for the `onMessageReceiptUpdated` callback to receive image message receipts.

## Prerequisites

Before you begin, make sure the following prerequisites are met:

- You have integrated RTC SDK v4.5.1 or later, implemented basic real-time audio and video features in your app, and obtained the required device permissions. See [Implement Audio and Video Interaction](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start).
- You have enabled the RTM service for your project in the [Console](https://console.shengwang.cn/) and implemented basic real-time messaging features in your app. See [Implement Message Sending and Receiving](https://doc.shengwang.cn/doc/rtm2/javascript/get-started/quick-start).
- You have implemented the basic logic for conversations with an agent by following [Implement a Conversational Agent](../get-started/quick-start.md).
- Make sure RTC is available, RTM is logged in, and the lifecycles of the RTC and RTM instances are longer than the lifecycle of the component. The component does not maintain the initialization, lifecycle, authentication, or login state of RTC or RTM internally.

> Note
> - The image messaging feature is currently in Beta and is free for a limited time.
> - Image processing depends on the capabilities provided by your LLM vendor. Make sure the LLM vendor connected to Conversational AI Engine supports image processing.

## Implementation

### Integrate the Component

#### Android

Copy the `convoaiApi` folder into your project and import the component before calling its APIs. For details about each file, see [Component Structure](#component-structure).

- [convoaiApi](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/Android/scenes/convoai/src/main/java/io/agora/scene/convoai/convoaiApi)

#### iOS

Copy the `ConversationalAIAPI` folder into your project and import the component before calling its APIs. For details about each file, see [Component Structure](#component-structure).

- [ConversationalAIAPI](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/iOS/Scenes/ConvoAI/ConvoAI/ConvoAI/Classes/ConversationalAIAPI)

#### Web

Copy the `conversational-ai-api` file into your own project and import the component before calling its APIs. For details about each file, see [Component Structure](#component-structure).

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

Call `addHandler` to register callbacks:

```kotlin
api.addHandler(covEventHandler)
```

#### iOS

Call `addHandler` to register callbacks:

```swift
convoAIAPI.addHandler(handler: self)
```

#### Web

```typescript
// Listen for message receipt updates
conversationalAIAPI.on(EConversationalAIAPIEvents.MESSAGE_RECEIPT_UPDATED, handleMessageReceiptUpdated)
// Listen for agent error events
conversationalAIAPI.on(EConversationalAIAPIEvents.MESSAGE_ERROR, onMessageError)
```

### Subscribe to Channel Messages

Agent-related events are delivered through RTM channel messages. Before you start an agent session, call `subscribeMessage` to subscribe to channel messages so you can receive agent-related events.

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

### Have the Agent Join the Channel

Call the [POST Create a Conversational Agent](../operations/start-agent.md) API and configure the following parameters:
- `advanced_features.enable_rtm: true` -- (required) Start the RTM service
- `parameters.data_channel: "rtm"` -- (required) Enable the RTM data transport channel
- `parameters.enable_metrics: true` -- (optional) Receive agent performance data
- `parameters.enable_error_message: true` -- (optional) Receive agent error events

After the call succeeds, the agent joins the specified RTC channel, and the user can start interacting with the agent.

### Send an Image Message

Call `chat` to send an image message. The following example sends an image by URL:

> Note
> The `completion` callback of the `chat` API only indicates whether the send request succeeded. It does not represent the actual processing result of the message.

#### Android

```kotlin
val uuid = "unique-image-id-123" // Generate a unique identifier for the image
val imageUrl = "https://example.com/image.jpg" // The HTTP/HTTPS URL of the image

api.chat("agentUserId", ImageMessage(uuid = uuid, imageUrl = imageUrl)) { error ->
    if (error != null) {
        Log.e("Chat", "Failed to send image: ${error.errorMessage}")
    } else {
        Log.d("Chat", "Image send request successful")
    }
}
```

#### iOS

```swift
let uuid = UUID().uuidString
let imageUrl = "https://example.com/image.jpg"
let message = ImageMessage(uuid: uuid, url: imageUrl)
self.convoAIAPI.chat(agentUserId: "\(agentUid)", message: message) { [weak self] error in
    if let error = error {
        print("send image failed, error: \(error.message)")
    } else {
        print("send image success")
    }
}
```

#### Web

```typescript
import { EChatMessageType } from '@/conversational-ai-api/type'

// Send an image message
await conversationalAIAPI.chat(`${agent_rtc_uid}`, {
          messageType: EChatMessageType.IMAGE,
          url: "https://example.com/image.jpg",
          uuid: genUUID()
        })
```

### Handle Image Sending Status

Successful and failed image sends are confirmed through the image message receipt callback `onMessageReceiptUpdated` and the image message error callback `onMessageError`, respectively. Use the image `uuid` to distinguish different image messages.

#### Image Send Succeeded

When the `onMessageReceiptUpdated` callback is triggered, parse the JSON message in the callback and obtain the image `uuid` to confirm that the image was sent successfully:

#### Android

```kotlin
override fun onMessageReceiptUpdated(agentUserId: String, receipt: MessageReceipt) {
    if (receipt.chatMessageType == ChatMessageType.Image) {
        try {
            val json = JSONObject(receipt.message)
            // Check whether the uuid field exists
            if (json.has("uuid")) {
                val receivedUuid = json.getString("uuid")

                // If the uuid matches, this image was sent successfully
                if (receivedUuid == "your-sent-uuid") {
                    Log.d("ImageSend", "Image sent successfully: $receivedUuid")
                    // Update the UI to show the successful send state
                }
            }
        } catch (e: Exception) {
            Log.e("ImageSend", "Failed to parse message receipt: ${e.message}")
        }
    }
}
```

#### iOS

```swift
struct PictureInfo: Codable {
    let uuid: String
}

public func onMessageReceiptUpdated(agentUserId: String, messageReceipt: MessageReceipt) {
      // Step 1: Check whether the message type is Context
      if messageReceipt.type == .context {
          guard let messageData = messageReceipt.message.data(using: .utf8) else {
              return
          }
          // Step 2: Parse receipt.message as a JSON object
          do {
              let imageInfo = try JSONDecoder().decode(PictureInfo.self, from: messageData)
              // Step 3: Check whether the uuid field exists
              let uuid = imageInfo.uuid
              // Update the UI to show the successful send state
              self.messageView.viewModel.updateImageMessage(uuid: uuid, state: .success)
          } catch {
              print("Failed to decode PictureInfo: \(error)")
          }

        print("Failed to parse message string from image info message")
        return
    }

  }
```

#### Web

```typescript
import { TMessageReceipt, EModuleType, EConversationalAIAPIEvents } from '@/conversational-ai-api/type'

// Handle the sending status of image messages
conversationalAIAPI.on(EConversationalAIAPIEvents.MESSAGE_RECEIPT_UPDATED, (agentUserId: string,  messageReceipt: TMessageReceipt) => {
    // Step 1: Check whether the message type is Context
    if (messageReceipt.moduleType !== EModuleType.CONTEXT) {
        return
    }
    // Step 2: Parse receipt.message as a JSON object
    try {
        const receiptMessage = JSON.parse(messageReceipt.message)
        // Step 3: Check whether the uuid field exists
        const uuid = receiptMessage.uuid
        if (!uuid) {
            return
        }
        // Step 4: Report the successful send status
        console.log(`Message sent successfully, UUID: ${uuid}`) // Replace this with your actual reporting logic
    } catch (error) {
        console.error('Failed to parse message:', error)
    }
})
```

#### Image Send Failed

When the `onMessageError` callback is triggered, parse the JSON message in the callback and obtain the image `uuid` to confirm that the image send failed:

#### Android

```kotlin
override fun onMessageError(agentUserId: String, error: MessageError) {
    if (error.chatMessageType == ChatMessageType.Image) {
        try {
            val json = JSONObject(error.message)
            // Check whether the uuid field exists
            if (json.has("uuid")) {
                val failedUuid = json.getString("uuid")

                // If the uuid matches, this image failed to send
                if (failedUuid == "your-sent-uuid") {
                    Log.e("ImageSend", "Image send failed: $failedUuid")
                    // Update the UI to show the failed send state
                }
            }
        } catch (e: Exception) {
            Log.e("ImageSend", "Failed to parse error message: ${e.message}")
        }
    }
}
```

#### iOS

```swift
struct ImageUploadError: Codable {
    let code: Int
    let message: String
}

struct ImageUploadErrorResponse: Codable {
    let uuid: String
    let success: Bool
    let error: ImageUploadError?
}

public func onMessageError(agentUserId: String, error: MessageError) {
    if let messageData = error.message.data(using: .utf8) {
        do {
            let errorResponse = try JSONDecoder().decode(ImageUploadErrorResponse.self, from: messageData)
            if !errorResponse.success {
                let errorMessage = errorResponse.error?.message ?? "Unknown error"
                let errorCode = errorResponse.error?.code ?? 0

                addLog("<<< [ImageUploadError] Image upload failed: \(errorMessage) (code: \(errorCode))")

                // Update the UI to show the failed send state
                DispatchQueue.main.async { [weak self] in
                    self?.messageView.viewModel.updateImageMessage(uuid: errorResponse.uuid, state: .failed)
                }
            }
        } catch {
            addLog("<<< [onMessageError] Failed to parse error message JSON: \(error)")
        }
    }
}
```

#### Web

```typescript
import { EConversationalAIAPIEvents, EChatMessageType } from '@/conversational-ai-api/type';

conversationalAIAPI.on(EConversationalAIAPIEvents.MESSAGE_ERROR, (agentUserId, error) => {
  console.error(`Message error for agent ${agentUserId}:`, error);
  if (error.type === EChatMessageType.IMAGE) {
    try {
        const errorData = JSON.parse(error.message);
        if (errorData?.uuid) {
            console.warn(`Image error for agent ${agentUserId} with UUID: ${errorData.uuid}`);
        }
    } catch (e) {
        console.error(`Failed to handle image error for agent ${agentUserId}:`, e);
    }
  }
 })
```

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
        print("Failed to unsubscribe: \(error.message)")
    } else {
        print("Unsubscribed successfully")
    }
}
```

#### Web

```typescript
conversationalAIAPI.unsubscribeMessage(channel_name)
```

### Destroy the Component Instance

After the AI conversation scenario ends or before the app is closed, you need to destroy the component instance to release all component resources.

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

Agora provides an open-source sample project for your reference. You can download it or view its source code.

- [Conversational-AI-Demo](https://github.com/Shengwang-Community/Conversational-AI-Demo/)

### Component Structure

The structure of the client component folder and the purpose of each file are as follows:

> Info
> The following files and folders are all you need to integrate the client component. You do not need to copy any other files.

#### Android

- `IConversationalAIAPI.kt` — API interface, related data structures, and enums
    - `ConversationalAIAPIImpl.kt` — Main implementation logic of the ConversationalAI API
    - `ConversationalAIUtils.kt` — Utility functions and event callback management
    - `subRender/`
        - `v3/` — Subtitle module
            - `TranscriptionController.kt` — Subtitle controller
            - `MessageParser.kt` — Message parser

#### iOS

- `ConversationalAIAPI.swift` — API interface, related data structures, and enums
    - `ConversationalAIAPIImpl.swift` — Main implementation logic of the ConversationalAI API
    - `Transcription/`
        - `TranscriptionController.swift` — Subtitle controller

#### Web

- `index.ts` — API class
    - `type.ts` — API interface, related data structures, and enums
    - `utils/index.ts` — API utility functions
    - `utils/events.ts` — Event management class. You can extend this class to easily implement event listening and status reporting.
    - `utils/sub-render.ts` — Subtitle module

### API Reference

#### Android

- [`addHandler`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#addhandler)
    - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#subscribemessage)
    - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#unsubscribemessage)
    - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#destroy)
    - [`onMessageReceiptUpdated`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onmessagereceiptupdated)
    - [`onMessageError`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onmessageerror)
    - [`chat`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#chat)

#### iOS

- [`addHandler`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#addhandler)
    - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#subscribemessage)
    - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#unsubscribemessage)
    - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#destroy)
    - [`onMessageReceiptUpdated`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onmessagereceiptupdated)
    - [`onMessageError`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onmessageerror)
    - [`chat`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#chat)

#### Web

- [`IConversationalAIAPIEventHandler`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/struct#iconversationalaiapieventhandlers)
    - [`EConversationalAIAPIEvents`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#econversationalaiapievents)
    - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#subscribemessage)
    - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#unsubscribemessage)
    - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#destroy)
    - [`chat`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#chat)
