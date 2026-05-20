---
title: Send picture messages
description: Send picture messages from the client side to help the agent understand the user's intention.
---
When interacting with an agent, you may need to upload images or send image messages from the client to help the agent better understand the user's intent. This page describes how to use the Conversational AI Engine toolkit to send image messages to the large language model from your app. The LLM can then automatically reference the image content in subsequent conversations and generate more relevant responses.

## Understand the tech

Agora provides a flexible, scalable, and standardized conversational AI engine toolkit. The toolkit supports **iOS**, **Android**, and **Web** platforms, and encapsulates scenario-based APIs. You can use these APIs to integrate the capabilities of the [Agora Signaling SDK](../../realtime-media/rtm/index.md) and [Agora Video SDK](../../introduction/realtime-audio-video.md) to enable the following features:

- [Interrupt agents](interrupt-agent.md)
- [Display live transcripts](transcripts.md)
- [Receive event notifications](event-notifications.md)
- [Set optimal audio parameters](../best-practices/audio-setup.md) for iOS and Android
- [Send picture messages](send-multimodal-messages.md)

Call the toolkit's `chat` API to send a picture message, and listen to `onMessageReceiptUpdated` to receive the picture message receipt.

## Prerequisites

Before you begin, ensure the following:

- You have implemented the Conversational AI Engine [REST quickstart](../get-started/quickstart.md).
- Your app integrates Agora Video SDK v4.5.1 or later and includes the [audio and video quickstart](../../introduction/realtime-audio-video.md).
- You have enabled Signaling in the Agora Console and completed the [Signaling quickstart](../../realtime-media/rtm/index.md) for basic messaging.
- You maintain active and authenticated RTC and Signaling instances that persist beyond the component lifecycle. The toolkit does not manage RTC or Signaling initialization, lifecycle, or authentication.

> **Info**
> - Picture messaging is currently in beta and free for a limited time.
> - Image processing depends on the capabilities of the integrated LLM. Make sure the LLM you connect to Conversational AI Engine supports image input.

## Implementation

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

   ```kotlin
   // Create configuration objects for the RTC and RTM instances
   val config = ConversationalAIAPIConfig(
       rtcEngine = rtcEngineInstance,
       rtmClient = rtmClientInstance,
       enableLog = true
   )

   // Create component instance
   val api = ConversationalAIAPIImpl(config)
   ```

3. **Register callback**

   ```kotlin
   api.addHandler(covEventHandler)
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

   To [start a conversational AI agent](../../api-reference/conversational-ai/rest-api/agent/join.md), configure the following parameters in your `POST` request:

   | Parameter | Description | Required |
   | --- | --- | --- |
   | `advanced_features.enable_rtm: true` | Starts the Signaling service | Yes |
   | `parameters.data_channel: "rtm"` | Enables Signaling as the data transmission channel | Yes |
   | `parameters.enable_metrics: true` | Enables agent performance data collection | Optional |
   | `parameters.enable_error_message: true` | Enables reporting of agent error events | Optional |

   After a successful response, the agent joins the specified RTC channel and is ready to interact with the user.

6. **Send an image**

   ```kotlin
   val uuid = "unique-image-id-123"
   val imageUrl = "https://example.com/image.jpg"

   api.chat("agentUserId", ImageMessage(uuid = uuid, imageUrl = imageUrl)) { error ->
       if (error != null) {
           Log.e("Chat", "Failed to send image: ${error.errorMessage}")
       } else {
           Log.d("Chat", "Image send request successful")
       }
   }
   ```

   > **Info**
   > The `chat` completion callback only indicates whether the sending request is successful, and does not reflect the actual processing status of the message.

7. **Handle image sending status**

   Image send success is confirmed by `onMessageReceiptUpdated`. If sending fails, `onAgentError` is triggered. Use the `uuid` value in the callback to identify the uploaded picture.

   Image sent successfully:

   ```kotlin
   override fun onMessageReceiptUpdated(agentUserId: String, receipt: MessageReceipt) {
       if (receipt.chatMessageType == ChatMessageType.Image) {
           try {
               val json = JSONObject(receipt.message)
               if (json.has("uuid")) {
                   val receivedUuid = json.getString("uuid")
                   if (receivedUuid == "your-sent-uuid") {
                       Log.d("ImageSend", "Image sent successfully: $receivedUuid")
                   }
               }
           } catch (e: Exception) {
               Log.e("ImageSend", "Failed to parse message receipt: ${e.message}")
           }
       }
   }
   ```

   Image sending failed:

   ```kotlin
   override fun onMessageError(agentUserId: String, error: MessageError) {
       if (error.chatMessageType == ChatMessageType.Image) {
           try {
               val json = JSONObject(error.message)
               if (json.has("uuid")) {
                   val failedUuid = json.getString("uuid")
                   if (failedUuid == "your-sent-uuid") {
                       Log.e("ImageSend", "Image send failed: $failedUuid")
                   }
               }
           } catch (e: Exception) {
               Log.e("ImageSend", "Failed to parse error message: ${e.message}")
           }
       }
   }
   ```

8. **Unsubscribe from the channel**

   ```kotlin
   api.unsubscribeMessage("channelName") { error ->
       if (error != null) {
           // Handle the error
       }
   }
   ```

9. **Release resources**

   ```kotlin
   api.destroy()
   ```

</TabsContent>

<TabsContent value="ios">

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

3. **Subscribe to the channel**

   ```swift
   convoAIAPI.subscribeMessage(channelName: channelName) { error in
       if let error = error {
           print("Subscription failed: \(error.message)")
       } else {
           print("Subscription successful")
       }
   }
   ```

4. **Register callback**

   ```swift
   convoAIAPI.addHandler(handler: self)
   ```

5. **Add a conversational AI agent to the channel**

   To [start a conversational AI agent](../../api-reference/conversational-ai/rest-api/agent/join.md), configure the following parameters in your `POST` request:

   | Parameter | Description | Required |
   | --- | --- | --- |
   | `advanced_features.enable_rtm: true` | Starts the Signaling service | Yes |
   | `parameters.data_channel: "rtm"` | Enables Signaling as the data transmission channel | Yes |
   | `parameters.enable_metrics: true` | Enables agent performance data collection | Optional |
   | `parameters.enable_error_message: true` | Enables reporting of agent error events | Optional |

6. **Send an image**

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

   > **Info**
   > The `chat` completion callback only indicates whether the sending request is successful, and does not reflect the actual processing status of the message.

7. **Receive image sending response**

   Success is confirmed by `onMessageReceiptUpdated`. If sending fails, `onAgentError` is triggered.

   Image sent successfully:

   ```swift
   struct PictureInfo: Codable {
       let uuid: String
   }

   public func onMessageReceiptUpdated(agentUserId: String, messageReceipt: MessageReceipt) {
       if messageReceipt.type == .context {
           guard let messageData = messageReceipt.message.data(using: .utf8) else {
               return
           }
           do {
               let imageInfo = try JSONDecoder().decode(PictureInfo.self, from: messageData)
               self.messageView.viewModel.updateImageMessage(uuid: imageInfo.uuid, state: .success)
           } catch {
               print("Failed to decode PictureInfo: \(error)")
           }
       }
   }
   ```

   Image sending failed:

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
                   DispatchQueue.main.async { [weak self] in
                       self?.messageView.viewModel.updateImageMessage(uuid: errorResponse.uuid, state: .failed)
                   }
               }
           } catch {
               addLog("Failed to parse error message JSON: \(error)")
           }
       }
   }
   ```

8. **Unsubscribe from the channel**

   ```swift
   convoAIAPI.unsubscribeMessage(channelName: channelName) { error in
       if let error = error {
           print("Unsubscription failed: \(error.message)")
       } else {
           print("Unsubscribed successfully")
       }
   }
   ```

9. **Release resources**

   ```swift
   convoAIAPI.destroy()
   ```

</TabsContent>

<TabsContent value="web">

1. **Integrate the toolkit**

   Copy the [`conversational-ai-api`](https://github.com/AgoraIO-Community/Conversational-AI-Demo/tree/main/Web/Scenes/VoiceAgent/src/conversational-ai-api) file to your project and import the toolkit before calling its API. Refer to [Folder structure](#folder-structure) to understand the role of each file.

2. **Create a toolkit instance**

   ```ts
   ConversationalAIAPI.init({
       rtcEngine,
       rtmEngine,
   })

   const conversationalAIAPI = ConversationalAIAPI.getInstance()
   ```

3. **Subscribe to the channel**

   ```ts
   conversationalAIAPI.subscribeMessage(channel_name)
   ```

4. **Register callbacks**

   ```ts
   conversationalAIAPI.on(EConversationalAIAPIEvents.MESSAGE_RECEIPT_UPDATED, handleMessageReceiptUpdated)
   conversationalAIAPI.on(EConversationalAIAPIEvents.MESSAGE_ERROR, onAgentError)
   ```

5. **Add a conversational AI agent to the channel**

   To [start a conversational AI agent](../../api-reference/conversational-ai/rest-api/agent/join.md), configure the following parameters in your `POST` request:

   | Parameter | Description | Required |
   | --- | --- | --- |
   | `advanced_features.enable_rtm: true` | Starts the Signaling service | Yes |
   | `parameters.data_channel: "rtm"` | Enables Signaling as the data transmission channel | Yes |
   | `parameters.enable_metrics: true` | Enables agent performance data collection | Optional |
   | `parameters.enable_error_message: true` | Enables reporting of agent error events | Optional |

6. **Send an image**

   ```ts
   import { EChatMessageType } from '@/conversational-ai-api/type'

   await conversationalAIAPI.chat(`${agent_rtc_uid}`, {
       messageType: EChatMessageType.IMAGE,
       url: "https://example.com/image.jpg",
       uuid: genUUID()
   })
   ```

   > **Info**
   > The `chat` completion callback only indicates whether the sending request is successful, and does not reflect the actual processing status of the message.

7. **Receive image sending response**

   Image sent successfully:

   ```ts
   conversationalAIAPI.on(EConversationalAIAPIEvents.MESSAGE_RECEIPT_UPDATED, (agentUserId: string, messageReceipt: TMessageReceipt) => {
       if (messageReceipt.moduleType !== EModuleType.CONTEXT) {
           return
       }
       try {
           const receiptMessage = JSON.parse(messageReceipt.message)
           const uuid = receiptMessage.uuid
           if (!uuid) return
           console.log(`Message sent successfully, UUID: ${uuid}`)
       } catch (error) {
           console.error('Failed to parse message:', error)
       }
   })
   ```

   Image sending failed:

   ```ts
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

8. **Unsubscribe from the channel**

   ```ts
   conversationalAIAPI.unsubscribeMessage(channel_name)
   ```

9. **Release resources**

   ```ts
   conversationalAIAPI.destroy()
   ```

## Reference

</TabsContent>
</Tabs>
### Folder structure

<Tabs>
<TabsList>
  <TabsTrigger value="android">Android</TabsTrigger>
  <TabsTrigger value="ios">iOS</TabsTrigger>
  <TabsTrigger value="web">Web</TabsTrigger>
</TabsList>

<TabsContent value="android">

- `IConversationalAIAPI.kt`: API interface, related data structures, and enumerations
- `ConversationalAIAPIImpl.kt`: main implementation logic
- `ConversationalAIUtils.kt`: utility functions and callback management
- `v3/`
  - `TranscriptionController.kt`: transcript rendering and synchronization
  - `MessageParser.kt`: transcription and message parsing

</TabsContent>

<TabsContent value="ios">

- `ConversationalAIAPI.swift`: API interface, data structures, and enumerations
- `ConversationalAIAPIImpl.swift`: main implementation logic
- `Transcription/`
  - `TranscriptionController.swift`: transcript rendering and transcription control

</TabsContent>

<TabsContent value="web">

- `index.ts`: main API class
- `type.ts`: API interfaces, data structures, and enumerations
- `utils/`
  - `index.ts`: general utility functions
  - `events.ts`: event management
  - `sub-render.ts`: transcript rendering module

</TabsContent>
</Tabs>
### API reference

<Tabs>
<TabsList>
  <TabsTrigger value="android">Android</TabsTrigger>
  <TabsTrigger value="ios">iOS</TabsTrigger>
  <TabsTrigger value="web">Web</TabsTrigger>
</TabsList>

<TabsContent value="android">

- [`addHandler`](../../api-reference/conversational-ai/client-toolkit/android.md#addhandler)
- [`subscribeMessage`](../../api-reference/conversational-ai/client-toolkit/android.md#subscribemessage)
- [`unsubscribeMessage`](../../api-reference/conversational-ai/client-toolkit/android.md#unsubscribemessage)
- [`destroy`](../../api-reference/conversational-ai/client-toolkit/android.md#destroy)
- [`onMessageReceiptUpdated`](../../api-reference/conversational-ai/client-toolkit/android.md#onmessagereceiptupdated)
- [`onMessageError`](../../api-reference/conversational-ai/client-toolkit/android.md#onmessageerror)
- [`chat`](../../api-reference/conversational-ai/client-toolkit/android.md#chat)

</TabsContent>

<TabsContent value="ios">

- [`addHandler`](../../api-reference/conversational-ai/client-toolkit/ios.md#addhandler)
- [`subscribeMessage`](../../api-reference/conversational-ai/client-toolkit/ios.md#subscribemessage)
- [`unsubscribeMessage`](../../api-reference/conversational-ai/client-toolkit/ios.md#unsubscribemessage)
- [`destroy`](../../api-reference/conversational-ai/client-toolkit/ios.md#destroy)
- [`onMessageReceiptUpdated`](../../api-reference/conversational-ai/client-toolkit/ios.md#onmessagereceiptupdated)
- [`onMessageError`](../../api-reference/conversational-ai/client-toolkit/ios.md#onmessageerror)
- [`chat`](../../api-reference/conversational-ai/client-toolkit/ios.md#chat)

</TabsContent>

<TabsContent value="web">

- [`IConversationalAIAPIEventHandler`](../../api-reference/conversational-ai/client-toolkit/web.md#iconversationalaiapieventhandlers-interface)
- [`EConversationalAIAPIEvents`](../../api-reference/conversational-ai/client-toolkit/web.md#econversationalaiapievents)
- [`subscribeMessage`](../../api-reference/conversational-ai/client-toolkit/web.md#subscribemessage)
- [`unsubscribeMessage`](../../api-reference/conversational-ai/client-toolkit/web.md#unsubscribe)
- [`destroy`](../../api-reference/conversational-ai/client-toolkit/web.md#destroy)
- [`chat`](../../api-reference/conversational-ai/client-toolkit/web.md#chat)

</TabsContent>
</Tabs>
