---
title: "Send and receive messages"
description: "Shows how to implement sending and receiving these messages using the Agora Chat SDK."
---

After logging in to Chat, users can send the following types of messages to a peer user, a chat group, or a chat room:

- Text messages, including hyperlinks and emojis.
- Attachment messages, including image, voice, video, and file messages.
- Location messages.
- CMD messages.
### Platforms

- Extended messages.

- Custom messages.

The Chat message feature is language agnostic. End users can send messages in any language, as long as their devices support input in that language.

In addition to sending messages, users can also forward one or more messages. When forwarding multiple messages, users have the following options:

* Forward messages one-by-one
* Forward combined messages as message history

This page shows how to implement sending, receiving, forwarding multiple messages, and modifying sent messages using the Chat SDK.

## Understand the tech

### Android

The Chat SDK uses the `ChatManager` class to send, receive, and withdraw messages.

The process of sending and receiving a message is as follows:

1. The message sender creates a text, file, or attachment message using the corresponding `create` method.
2. The message sender calls `sendMessage` to send the message.
3. The message recipient calls `addMessageListener` to listens for message events and receive the message in the `OnMessageReceived` callback.

### iOS

The Chat SDK uses the `IAgoraChatManager` and `Message` classes to send, receive, and withdraw messages.

The process of sending and receiving a message is as follows:

1. The message sender creates a text, file, or attachment message using the corresponding `init` method.
2. The message sender calls `sendMessage` to send the message.
3. The message recipient calls `addDelegate` to listen for message events and receive the message in the `messagesDidReceive` callback.

### Web

The process of sending and receiving a message is as follows:

1. The message sender creates a text, file, or attachment message using the corresponding `create` method.
2. The message sender calls `send` to send the message.
3. The message recipient calls `addEventHandler` to listen for message events and receive the message in the corresponding callback.

### Flutter

The Chat SDK for Flutter uses the `ChatMessage` and `ChatMessage` classes to send, receive, and withdraw messages.

The process of sending and receiving a message is as follows:

1. The message sender creates a text, file, or attachment message using the corresponding `Create` method.
2. The message sender calls `sendMessage` to send the message.
3. The message recipient listens for `ChatEventHandler` and receives the message in the `onMessagesReceived` callback.

### React Native

The Chat SDK uses the `ChatManager` and `ChatMessage` classes to send, receive, and withdraw messages.

The process of sending and receiving a message is as follows:

1. The message sender creates a text, file, or attachment message using the corresponding `Create` method.
2. The message sender calls `sendMessage` to send the message.
3. The message recipient listens for `ChatMessageEventListener` and receives the message in the `onMessagesReceived` callback.

### Windows

The Chat SDK uses the `IChatMessage` and `Message` classes to send, receive, and withdraw messages.

The process of sending and receiving a message is as follows:

1. The message sender creates a text, file, or attachment message using the corresponding `Create` method.
2. The message sender calls `SendMessage` to send the message.
3. The message recipient calls `AddChatManagerDelegate` to listen for message events and receive the message in the `OnMessageReceived` callback.

### Unity

The Chat SDK uses the `IChatMessage` and `Message` classes to send, receive, and withdraw messages.

The process of sending and receiving a message is as follows:

1. The message sender creates a text, file, or attachment message using the corresponding `Create` method.
2. The message sender calls `SendMessage` to send the message.
3. The message recipient calls `AddChatManagerDelegate` to listen for message events and receive the message in the `OnMessageReceived` callback.

## Prerequisites

Before proceeding, ensure that you meet the following requirements:
- You have integrated the Chat SDK, initialized the SDK, and implemented the functionality of registering accounts and login. For details, see [Chat SDK quickstart](../../../../get-started-sdk).

    Use Chat SDK 1.2 or higher if you intend to enable users to forward multiple messages, or to modify sent messages.

- You understand the API call frequency limits as described in [Limitations](../../limitations).

## Implementation

This section shows how to implement sending and receiving the various types of messages.

### Android

### Send a text message

Use the `ChatMessage` class to create a text message, and send the message.

```java
// Call createTextSendMessage to create a text message.
// Set `content` as the content of the text message.
// Set `conversationId` to the user ID of the peer user in one-to-one chat, group ID in group chat, and chat room ID in room chat.
ChatMessage message = ChatMessage.createTextSendMessage(content, conversationId);
// Set `ChatType` as `Chat`, `GroupChat`, or `ChatRoom` for one-to-one chat, group chat, or room chat.
message.setChatType(ChatMessage.GroupChat);
 // Send the message.
 ChatClient.getInstance().chatManager().sendMessage(message);
```

```java
// Call setMessageStatusCallback to set the callback instance to get the status of messaging sending.
// You can update the status of messages in this callback, for example, adding a tip when the message sending fails.
 message.setMessageStatusCallback(new CallBack() {
     @Override
     public void onSuccess() {
         showToast("Message sending succeeds");
     }
     @Override
     public void onError(int code, String error) {
         showToast("Message sending fails");
     }
 });
 ChatClient.getInstance().chatManager().sendMessage(message);
```

### Send a message to online users only

Agora Chat supports delivering messages only to users that are currently online. An example of using this function is displaying the votes in a group voting: Only users that are online need to see the changes in real time, while the others only need the final result.

All types of messages in one-to-one chats and chat groups support this function. Compared to an ordinary message, a message that is delivered only to online users has the following differences:

- Does not support offline storage: If the recipient is offline when sending a message, the message cannot be received, even after logging in again. For ordinary messages, when the recipient is online, the message reminder is received in real time; when the recipient is offline, the offline push message is sent in real time. When the recipient is online again, the Chat server actively pushes the offline message to the client.
- Support local storage: After a message is successfully sent, it is added to the database.
- Roaming storage is not supported by default: Sent messages are not stored on the Chat message server by default, so users cannot obtain the messages on other devices. If you need to activate roaming storage of online messages, contact support@agora.io.

To deliver messages to online users only, you need to set `ChatMessage#deliverOnlineOnly` to `true` when sending the message. The following is an example of sending a text message to only online users:

```java
// Create a text message, `content` is the text content of the message.
// `conversationId` is the message receiver. It is the peer user ID in single chat and the group ID in group chat.
ChatMessage message = ChatMessage.createTextSendMessage(content, conversationId);
// Whether the message is only delivered to online users. (Default) `false`: Delivered regardless of whether the user is online or not; `true`: Only delivered to online users. If the user is offline, the message will not be delivered.
message.deliverOnlineOnly(true);
// Conversation type: Single chat is ChatMessage.ChatType.Chat, group chat is ChatMessage.ChatType.GroupChat, the default is single chat.
message.setChatType(ChatMessage.ChatType.Chat);
// Send a message.
ChatClient.getInstance().chatManager().sendMessage(message);
```

### Set message priority

In high-concurrency use-cases, you can set a certain message type or messages from a chat room member as high, normal, or low priority.
In this case, low-priority messages are dropped first to reserve resources for the high-priority ones, for example, gifts and announcements, when the server is overloaded.
This ensures that the high-priority messages can be dealt with first when loads of messages are being sent in high concurrency or high frequency.
Note that this feature can increase the delivery reliability of high-priority messages, but cannot guarantee the deliveries.
Even high-priorities messages can be dropped when the server load goes too high.

You can set the priority for all types of messages in the chat room.

```java
// Set `content` as the content of the text message.
// Set `conversationId` to chat room ID in room chat.
ChatMessage message = ChatMessage.createTextSendMessage(content, conversationId);
message.setChatType(ChatMessage.ChatType.ChatRoom);
// Set the message priority. The default value is `PriorityNormal`, indicating the normal priority.
message.setPriority(ChatMessage.ChatRoomMessagePriority.PriorityHigh);
ChatClient.getInstance().chatManager().sendMessage(message);
```

### Receive a message

You can use `MessageListener` to listen for message events. You can add multiple `MessageListener`s to listen for multiple events. When you no longer listen for an event, ensure that you remove the listener.

When a message arrives, the recipient receives an `onMessagesReceived` callback. Each callback contains one or more messages. You can traverse the message list, and parse and render these messages in this callback.

```java
MessageListener msgListener = new MessageListener() {
    // Traverse the message list, and parse and render the messages.
    @Override
    public void onMessageReceived(List messages) {
    }
};
// Add a message listener
ChatClient.getInstance().chatManager().addMessageListener(msgListener);
// Remove a message listener
ChatClient.getInstance().chatManager().removeMessageListener(msgListener);
ChatClient.getInstance().chatManager().removeMessageListener(msgListener);
```

### Recall a message

After a message is sent, you can recall it. The `recallMessage` method recalls a message that is saved both locally and on the server, whether it is a historical message, offline message or a roaming message on the server, or a message in the memory or local database of the message sender or recipient.

The default time limit for recalling a message is two minutes. You can extend this time frame to up to 7 days in [Agora Console](https://console.agora.io/v2). To do so, select a project that enables Agora Chat, then click **Configure** > **Features** > **Message recall**.

![message-recall](/images/im/message-recall.png)

:::info
1. Except CMD messages, you can recall all types of message. 2. If an attachment message, like an image, voice, video, or file message, is recalled, the attachment of the message is also deleted.
:::

```java
try {
    ChatClient.getInstance().chatManager().recallMessage(message);
    EMLog.d("TAG", "Recalling message succeeds");
} catch (ChatException e) {
    e.printStackTrace();
    EMLog.e("TAG", "Recalling message fails: "+e.getDescription());
}
```

You can also use `onMessageRecalled` to listen for the message recall state:

```java
/**
 * Occurs when a received message is recalled.
 */
void onMessageRecalled(List messages);
```

### Send and receive an attachment message

Voice, image, video, and file messages are essentially attachment messages. This section introduces how to send these types of messages.

#### Send and receive a voice message

Before sending a voice message, you should implement audio recording on the app level, which provides the URI and duration of the recorded audio file.

Refer to the following code example to create and send a voice message:

```java
// Set voiceUri as the local URI of the audio file, and duration as the length of the file in seconds.
ChatMessage message = ChatMessage.createVoiceSendMessage(voiceUri, duration, conversationId);
// Sets the chat type as one-to-one chat, group chat, or chatroom.
if (chatType == CHATTYPE_GROUP) {
    message.setChatType(ChatType.GroupChat);
}
ChatClient.getInstance().chatManager().sendMessage(message);
```

When the recipient receives the message, refer to the following code example to get the audio file:

```java
VoiceMessageBody voiceBody = (VoiceMessageBody) msg.getBody();
// Retrieves the URL of the audio file on the server.
String voiceRemoteUrl = voiceBody.getRemoteUrl();
// Retrieves the URI if the audio file on the local device.
//If 'ChatClient.getInstance().getOptions().setAutodownloadThumbnail' is set as `false` or the attachment has not been downloaded yet,
//the file may not exist in 'voiceLocalUri' and you can manually call 'ChatClient.getInstance().chatManager().downloadAttachment(message)' to download the attachment,
//and call the 'message. SetMessageStatusCallback (the callback)' to see if the download succeeds.
Uri voiceLocalUri = voiceBody.getLocalUri();
```

#### Send and receive an image message

By default, the SDK compresses the image file before sending it. To send the original file, you can set `original` as `true`.

Refer to the following code example to create and send an image message:

```java
// Set imageUri as the URI of the image file on the local device. false means not to send the original image. The SDK compresses image files that exceeds 100K before sending them.
ChatMessage.createImageSendMessage(imageUri, false, conversationId);
// Sets the chat type as one-to-one chat, group chat, or chatroom.
if (chatType == CHATTYPE_GROUP)
    message.setChatType(ChatType.GroupChat);
ChatClient.getInstance().chatManager().sendMessage(message);
```

When the recipient receives the message, refer to the following code example to get the thumbnail and attachment file of the image message:

```java
// Retrieves the thumbnail and attachment of the image file.
ImageMessageBody imgBody = (ImageMessageBody) message.getBody();
// Retrieves the image file the server.
String imgRemoteUrl = imgBody.getRemoteUrl();
// Retrieves the image thumbnail from the server.
String thumbnailUrl = imgBody.getThumbnailUrl();
// Retrives the URI of the image file on the local device.
Uri imgLocalUri = imgBody.getLocalUri();
// Retrieves the URI of the image thumbnail on the local device.
Uri thumbnailLocalUri = imgBody.thumbnailLocalUri();
```

:::info
If `ChatClient.getInstance().getOptions().getAutodownloadThumbnail()` is set as `true` on the recipient's client, the SDK automatically downloads the thumbnail after receiving the message. If not, you need to call `ChatClient.getInstance().chatManager().downloadThumbnail(message)` to download the thumbnail and get the path from the `thumbnailLocalUri` member in `messageBody`.
If the file does not exist in `imgLocalUri`, you can manually call `ChatClient.getInstance().chatManager().downloadAttachment(message)` to download the attachment, and call the `message. SetMessageStatusCallback (the callback)`to see if the download succeeds.
:::

#### Send and receive a video message

Before sending a video message, you should implement video capturing on the app level, which provides the duration of the captured video file.

Refer to the following code example to create and send a video message:

```java
String thumbPath = getThumbPath(videoUri);
ChatMessage message = ChatMessage.createVideoSendMessage(videoUri, thumbPath, videoLength, conversationId);
// Sets the chat type as one-to-one chat, group chat, or chatroom.
if (chatType == CHATTYPE_GROUP) {
    message.setChatType(ChatType.GroupChat);
}
ChatClient.getInstance().chatManager().sendMessage(message);
```

By default, when the recipient receives the message, the SDK downloads the thumbnail of the video message.

If you do not want the SDK to automatically download the video thumbnail, set `ChatClient.getInstance().getOptions().setAutodownloadThumbnail` as `false`, and to download the thumbnail, you need to call `ChatClient.getInstance().chatManager().downloadThumbnail(message)`, and get the path of the thumbnail from the `thumbnailLocalUri` member in `messageBody`.

To download the actual video file, call `ChatClient.getInstance().chatManager().downloadAttachment(message)`, and get the path of the video file from the `getLocalUri` member in `messageBody`.

```java
// If you received a message with video attachment, you need download the attachment before you open it.
if (message.getType() == ChatMessage.Type.VIDEO) {
  VideoMessageBody messageBody = (VideoMessageBody)message.getBody();

  // Set Callback to know whether the download is finished.
  final CallBack callback = new CallBack() {
        public void onSuccess() {
            EMLog.e(TAG, "onSuccess" );
            // After the download finishes onSuccess, get the URI of the local file.
            Uri videoLocalUri = messageBody.getLocalUri();

        }

        public void onError(final int error, String message) {
            EMLog.e(TAG, "offline file transfer error:" + message);
        }

        public void onProgress(final int progress, String status) {
            EMLog.d(TAG, "Progress: " + progress);
        }
   };

      message.setMessageStatusCallback(callback);

        ChatClient.getInstance().chatManager().downloadAttachment(message);
}
```

#### Send and receive a file message

Refer to the following code example to create, send, and receive a file message:

```java
// Set fileLocalUri as the URI of the file message on the local device.
ChatMessage message = ChatMessage.createFileSendMessage(fileLocalUri, conversationId);
// Sets the chat type as one-to-one chat, group chat, or chatroom.
if (chatType == CHATTYPE_GROUP){
    message.setChatType(ChatType.GroupChat);
}
ChatClient.getInstance().chatManager().sendMessage(message);
```

While sending a file message, refer to the following sample code to get the progress for uploading the attachment file:

```java
// Calls setMessageStatusCallback to set the callback instance to listen for the state of messaging sending. You can update the message states in this callback.
message.setMessageStatusCallback(new CallBack() {
    @Override
    public void onSuccess() {
        showToast("Message sending succeeds");
    }
    @Override
    public void onError(int code, String error) {
        showToast("Message sending fails");
    }

    // The status of sending the message. This only applies to sending attachment files.
    @Override
    public void onProgress(int progress, String status) {

    }
});
ChatClient.getInstance().chatManager().sendMessage(message);
```

When the recipient receives the message, refer to the following code example to get the attachment file:

```java
NormalFileMessageBody fileMessageBody = (NormalFileMessageBody) message.getBody();
// Retrieves the file from the server.
String fileRemoteUrl = fileMessageBody.getRemoteUrl();
// Retrieves the file from the local device.
Uri fileLocalUri = fileMessageBody.getLocalUri();
```

:::info
If the file does not exist in fileLocalUri, you can manually call `ChatClient.getInstance().chatManager().downloadAttachment(message)` to download the attachment, and call the `message. SetMessageStatusCallback (the callback)`to see if the download succeeds.
:::

### Send a location message

To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.

```java
// Sets the latitude and longitude information of the address.
ChatMessage message = ChatMessage.createLocationSendMessage(latitude, longitude, locationAddress, conversationId);
// Sets the chat type as one-to-one chat, group chat, or chatroom.
if (chatType == CHATTYPE_GROUP) {
    message.setChatType(ChatType.GroupChat);
}
ChatClient.getInstance().chatManager().sendMessage(message);
```

### Send and receive a CMD message

CMD messages are command messages that instruct a specified user to take a certain action. The recipient deals with the command messages themselves.

:::info
CMD messages are not stored in the local database.Actions beginning with `em_` and `easemob::` are internal fields. Do not use them.
:::

```java
ChatMessage cmdMsg = ChatMessage.createSendMessage(ChatMessage.Type.CMD);
// Sets the chat type as one-to-one chat, group chat, or chat room.
if (chatType == CHATTYPE_GROUP){
    cmdMsg.setChatType(ChatType.GroupChat);
}
String action="action1";
// You can customize the action.
CmdMessageBody cmdBody = new CmdMessageBody(action);
// Sets the message recipient: user ID of the recipient for one-to-one chat, group ID for group chat, or chat room ID for a chat room.
cmdMsg.setTo(conversationId);
cmdMsg.addBody(cmdBody);
ChatClient.getInstance().chatManager().sendMessage(cmdMsg);
```

To notify the recipient that a CMD message is received, use a separate listener so that users can deal with the message differently.

```java
MessageListener msgListener = new MessageListener()
{
  // Occurs when the normal message is received
  @Override
  public void onMessageReceived(List messages) {
  }
  // Occurs when a CMD message is received
  @Override
  public void onCmdMessageReceived(List messages) {
  }
}
```

### Send a customized message

The following code example shows how to create and send a customized message:

```java
ChatMessage customMessage = ChatMessage.createSendMessage(ChatMessage.Type.CUSTOM);
// Set event as the customized message type, for example, gift.
event = "gift"CustomMessageBody;
customBody = new CustomMessageBody(event);
// The data type of params is Map.
customBody.setParams(params);
customMessage.addBody(customBody);
// Sets the message recipient: user ID of the recipient for one-to-one chat, group ID for group chat, or chat room ID for a chat room.
customMessage.setTo(to);
// Sets the chat type as one-to-one chat, group chat, or chat room
customMessage.setChatType(chatType);ChatClient.getInstance().chatManager().sendMessage(customMessage);
```

### Use message extensions

If the message types listed above do not meet your requirements, you can use message extensions to add attributes to the message. This can be applied in more complicated messaging use-cases.

```java
ChatMessage message = ChatMessage.createTextSendMessage(content, conversationId);
// Adds message attributes.
message.setAttribute("attribute1", "value");message.setAttribute("attribute2", true);
// Sends the message
ChatClient.getInstance().chatManager().sendMessage(message);
// Retrieves the message attributes when receiving the message.
message.getStringAttribute("attribute1",null);message.getBooleanAttribute("attribute2", false)
```

### Forward a single message

You can use the `Message#addBody` and `Message#setAttribute` methods to create a new message identical to the original one, including its body and extended fields. After creating the message, you can forward it using the `ChatManager#sendMessage` method.

You can forward all types of messages in individual chats, chat groups, and chat rooms. For messages with attachments, there's no need to re-upload the attachments during forwarding.

However, if the original message expires (for example, deleted from the server due to storage limitations), the recipient can view the attachment address after forwarding but won't be able to download the attachment.

To forward a single message, refer to the following code:

```java
// messageId: ID of the message for forwarding.
String messageId = "";
ChatMessage targetMessage = ChatClient.getInstance().chatManager().getMessage(messageId);
// to: The peer user ID for one-to-one chat, group ID for a group chat, and chat room ID for a room chat.
String to = "the conversationId you want to send to";
ChatMessage newMessage = ChatMessage.createSendMessage(targetMessage.getType());
newMessage.setTo(to);
// chatType: ChatMessage.ChatType.Chat for one-to-one chat, ChatMessage.ChatType.GroupChat for group chat, or ChatMessage.ChatType.ChatRoom.
// The default value is `ChatMessage.ChatType.Chat`. For a group chat, add the following line.
//newMessage.setChatType(ChatMessage.ChatType.GroupChat);

// Create a new message with the body and extension fields of the original message.
MessageBody targetMessageBody = targetMessage.getBody();
newMessage.addBody(targetMessageBody);
Map ext = targetMessage.ext();
//Traverse extension fields.
if (ext != null) {
    for (Map.Entry entry : ext.entrySet()) {
        Object value = entry.getValue();
        if (value instanceof Long) {
            newMessage.setAttribute(entry.getKey(), (long) value);
        } else if (value instanceof Integer) {
            newMessage.setAttribute(entry.getKey(), (int) value);
        } else if (value instanceof String) {
            newMessage.setAttribute(entry.getKey(), (String) value);
        } else if (value instanceof Boolean) {
            newMessage.setAttribute(entry.getKey(), (boolean) value);
        } else if (value instanceof Double) {
            newMessage.setAttribute(entry.getKey(), (double) value);
        } else if (value instanceof Float) {
            newMessage.setAttribute(entry.getKey(), (float) value);
        } else if (value instanceof JSONArray) {
            newMessage.setAttribute(entry.getKey(), (JSONArray) value);
        } else if (value instanceof JSONObject) {
            newMessage.setAttribute(entry.getKey(), (JSONObject) value);
        }
    }
}
ChatClient.getInstance().chatManager().sendMessage(newMessage);
```

### Forward multiple messages

Supported types for forwarded messages include text, images, audio & video files, attachment, and custom messages. A user can create a combined message with a list of original messages and send it. When receiving a combined message, the recipient can select it and other messages to create a new layered combined message. A combined message can contain up to 10 layers of messages, with at most 300 messages at each layer.

To forward and receive combined messages, refer to the following code:

1. Create a combined message using multiple message IDs:

    ```java
    ChatMessage message = ChatMessage.createCombinedSendMessage(title, summary, compatibleText, msgIds, toChatUsername);
    // Set the chat type:
    // One-to-one chat: ChatMessage.ChatType.Chat
    // Group chat: ChatMessage.GroupChat
    // Room chat: ChatMessage.ChatRoom
    message.setChatType(ChatMessage.ChatType.Chat);
    // Send the message
    ChatClient.getInstance().chatManager().sendMessage(message);
    ```
1. Download and parse combined messages:

   ```java
   ChatClient.getInstance().chatManager().downloadAndParseCombineMessage(combinedMessage, new ValueCallBack>() {
               @Override
               public void onSuccess(List value) {

               }

               @Override
               public void onError(int error, String errorMsg) {

               }
           });
    ```

### Modify sent messages

Every end user or chat group member may edit messages that they have sent. The client API below, when called, will allow the SDK to modify a message.

There is no time limit for modifying a message, that is, it can be modified as long as the message is still stored on the server. After the message is modified, the message life cycle, that is, its storage time on the server, is recalculated. For example, a message can be stored on the server for 180 days, and the user modifies it on the 30th day after the message was sent. Instead of remaining 150 days, the message can be now stored on the server for 180 days after successful modification.

In the modified message, the message ID remains unchanged. Only the message content is edited and the following items are added:

* The operator ID of the user performing the action.
* The operation time that indicates when the message was edited.
* The number of times a message is edited (up to 10 times).

For the edited message, except the message body, other information included in the message like the message sender, recipient, and message extension attributes remain unchanged.

To modify a sent message, refer to the following code:

1. Call `asyncModifyMessage` with the message ID and the new message body:

    ```java
    String newContent="new content";
    TextMessageBody newTextMessageBody = new TextMessageBody(newContent);
    ChatClient.getInstance().chatManager().asyncModifyMessage(targetMessage.getMsgId(), newTextMessageBody, new ValueCallBack() {
        @Override
        public void onSuccess(ChatMessage value) {

        }

        @Override
        public void onError(int error, String errorMsg) {

        }
    });
    ```

1. Receive notification of messages modified by other users:

    ```java
    // Create a MessageListener object
    MessageListener messageListener = new MessageListener() {
                //……
                @Override
                public void onMessageContentChanged(ChatMessage messageModified, String operatorId, long operationTime) {
                    // int operationCount = messageModified.getBody().operationCount();
                    // operatorId and operationTime can also be obtained as follows:
                    // String id = messageModified.getBody().operatorId();
                    // long time = messageModified.getBody().operationTime();
                }
            };
    // Register the messageListener
    ChatClient.getInstance().chatManager().addMessageListener(messageListener);
    // Remove the messageListener
    ChatClient.getInstance().chatManager().removeMessageListener(messageListener);
    ```

For further details see [Sent message modification limitations](../../limitations#sent-message-modification-limitations).

### iOS

### Send a text message

Use the `AgoraChatTextMessageBody` class to create a text message, and then send the message.

```objc
// Call initWithText to create a text message. Set `content` to the text content.
    AgoraChatTextMessageBody *textMessageBody = [[AgoraChatTextMessageBody alloc] initWithText:content];
    // Set `conversationId` to the user ID of the peer user in one-to-one chat, group ID in group chat, and chat room ID in room chat.
    NSString* conversationId = @"remoteUserId";
    AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:conversationId
                                                          body:textMessageBody
                                                           ext:messageExt];
    // Set `message.chatType` to `AgoraChatTypeChat` for one-to-one chat, `AgoraChatTypeGroupChat` for group chat, and `AgoraChatTypeChatRoom` for room chat.
    // The default value is `AgoraChatTypeChat`.
    message.chatType = AgoraChatTypeChat;
    // Send the message.
    [[AgoraChatClient sharedClient].chatManager sendMessage:message
                                                   progress:nil
                                                 completion:nil];
```

You can set the priority of chat room messages.

### Send a message to online users only

Agora Chat supports delivering messages only to users that are currently online. An example of using this function is displaying the votes in a group voting: Only users that are online need to see the changes in real time, while the others only need the final result.

All types of messages in one-to-one chats and chat groups support this function. Compared to an ordinary message, a message that is delivered only to online users has the following differences:

- Does not support offline storage: If the recipient is offline when sending a message, the message cannot be received, even after logging in again. For ordinary messages, when the recipient is online, the message reminder is received in real time; when the recipient is offline, the offline push message is sent in real time. When the recipient is online again, the Chat server actively pushes the offline message to the client.
- Support local storage: After a message is successfully sent, it is added to the database.
- Roaming storage is not supported by default: Sent messages are not stored on the Chat message server by default, so users cannot obtain the messages on other devices. If you need to activate roaming storage of online messages, contact support@agora.io.

To deliver messages only to online users, set `ChatMessage#deliverOnlineOnly` to `true` when sending the message. The following is an example of sending a text message to only online users:

```objc
// Call initWithText to create a text message. `content` is the content of the text message.
AgoraTextMessageBody *textMessageBody = [[AgoraTextMessageBody alloc] initWithText:content];
// Message receiver: Single chat is the ID of the peer user, group chat is the group ID.
NSString* conversationId = @"remoteUserId";
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:conversationId
                                                      body:textMessageBody
                                                               ext:messageExt];
// Conversation type: Single chat is `AgoraChatTypeChat`, group chat is `AgoraChatTypeGroupChat`.
message.chatType = AgoraChatTypeChat;
// Whether the message is only delivered to online users. (Default) `NO`: Delivered regardless of whether the user is online or not; `YES`: Only delivered to online users. If the user is offline, the message will not be delivered.
message.deliverOnlineOnly = YES；
// Send a message.
[[AgoraClient sharedClient].chatManager sendMessage:message
                                        progress:nil
                                      completion:nil];
```

### Set message priority

In high-concurrency use-cases, you can set a certain message type or messages from a chat room member as high, normal, or low priority.
In this case, low-priority messages are dropped first to reserve resources for the high-priority ones, for example, gifts and announcements, when the server is overloaded.
This ensures that the high-priority messages can be dealt with first when loads of messages are being sent in high concurrency or high frequency.
Note that this feature can increase the delivery reliability of high-priority messages, but cannot guarantee the deliveries.
Even high-priorities messages can be dropped when the server load goes too high.

You can set the priority for all types of messages in the chat room.

```objc
AgoraChatTextMessageBody* textBody = [[AgoraChatTextMessageBody alloc] initWithText:@"Hi"];
    AgoraChatMessage* message = [[AgoraChatMessage alloc] initWithConversationID:@"roomId" body:textBody ext:nil];
    message.chatType = AgoraChatTypeChatRoom;
    // Set the message priority. The default value is `Normal`, indicating the normal priority.
    message.priority = AgoraChatRoomMessagePriorityHigh;
[AgoraChatClient.sharedClient.chatManager sendMessage:message progress:nil completion:nil];
```

### Receive a message

You can use `AgoraChatManagerDelegate` to listen for message events. You can add multiple delegates to listen for multiple events. When you no longer listen for an event, ensure that you remove the listener.

When a message arrives, the recipient receives an `messagesDidReceive` callback. Each callback contains one or more messages. You can traverse the message list, and parse and render these messages in this callback and render these messages.

```objc
// Adds the delegate.
[[AgoraChatClient sharedClient].chatManager addDelegate:self delegateQueue:nil];
// Occurs when the message is received.
- (void)messagesDidReceive:(NSArray *)aMessages
{
  // Traverse the message list
  for (AgoraChatMessage *message in aMessages) {
    // Parse the message and display it on the UI
  }
}
// Removes the delegate.
- (void)dealloc
{
  [[AgoraChatClient sharedClient].chatManager removeDelegate:self];
}
```

### Recall a message

After a message is sent, you can recall it. The `recallMessageWithMessageId` method recalls a message that is saved both locally and on the server, whether it is a historical message, offline message or a roaming message on the server, or a message in the memory or local database of the message sender or recipient.

The default time limit for recalling a message is two minutes. You can extend this time frame to up to 7 days in [Agora Console](https://console.agora.io/v2). To do so, select a project that enables Agora Chat, then click **Configure** > **Features** > **Message recall**.

![message-recall](/images/im/message-recall.png)

:::info
1. Except CMD messages, you can recall all types of message. 2. If an attachment message, like an image, voice, video, or file message, is recalled, the attachment of the message is also deleted.
:::

```objc
[[AgoraChatClient sharedClient].chatManager recallMessageWithMessageId:@"messageId" completion:^(AgoraChatError *aError) {
        if (!aError) {
               NSLog(@"Recalling message succeeds");
           } else {
               NSLog(@"Recalling message fails — %@", aError.errorDescription);
           }
    }];
```

You can also use `messagesDidRecall` to listen for the message recall state:

```objc
/**
 * Occurs when a received message is recalled.
 */
- (void)messagesInfoDidRecall:(NSArray * _Nonnull)aRecallMessagesInfo;
```

### Send and receive an attachment message

Voice, image, video, and file messages are essentially attachment messages. This section introduces how to send these types of messages.

#### Send and receive a voice message

Before sending a voice message, you should implement audio recording on the app level, which provides the URI and duration of the recorded audio file.

Refer to the following code example to create and send a voice message:

```objc
// Set localPath as the local path of the voice file and displayName the display name of the attachment.
AgoraChatVoiceMessageBody *body = [[AgoraChatVoiceMessageBody alloc] initWithLocalPath:localPath
                                             displayName:displayName];
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:toChatUsername
                                                      from:fromChatUsername
                                                         to:toChatUsername
                                                       body:body
                                                       ext:nil];
message.chatType = AgoraChatTypeChat;
// Set the chat type as Group chat. You can also set it as chat (one-to-one chat) or chat room.
// message.chatType = AgoraChatTypeGroupChat;
// Sends the message
[[AgoraChatClient sharedClient].chatManager sendMessage:message
                                               progress:nil
                                             completion:nil];
```

When the recipient receives the message, refer to the following code example to get the audio file:

```objc
AgoraChatVoiceMessageBody *voiceBody = (AgoraChatVoiceMessageBody *)message.body;
// Retrieves the path of the audio file on the server.
NSString *voiceRemotePath = voiceBody.remotePath;
// Retrieves the path of the audio file on the local device.
NSString *voiceLocalPath = voiceBody.localPath;
```

#### Send and receive an image message

By default, the SDK compresses the image file before sending it. To send the originial file, you can set `original` as `true`.

Refer to the following code example to create and send an image message:

```objc
// Set imageData as the path of the image file on the local device, and displayName as the display name of the file.
AgoraChatImageMessageBody *body = [[AgoraChatImageMessageBody alloc] initWithData:imageData
                                                    displayName:displayName];
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:toChatUsername
                                                      from:fromChatUsername
                                                         to:toChatUsername
                                                       body:body
                                                       ext:messageExt];
message.chatType = AgoraChatTypeChat;
// Set the chat type as Group chat. You can also set it as chat (one-to-one chat) or chat room.
// message.chatType = AgoraChatTypeGroupChat;
// Sends the message
[[AgoraChatClient sharedClient].chatManager sendMessage:message
                                               progress:nil
                                             completion:nil];
```

When the recipient receives the message, refer to the following code example to get the thumbnail and attachment file of the image message:

```objc
AgoraChatImageMessageBody *body = (AgoraChatImageMessageBody *)message.body;
// Retrieves the path of the image file on the server.
NSString *remotePath = body.remotePath;
// Retrieves the path of the image thumbnail from the server.
NSString *thumbnailPath = body.thumbnailRemotePath;
// Retrieves the path of the image file on the local device.
NSString *localPath = body.localPath;
// Retrieves the path of the image thumbnail on the local device.
NSString *thumbnailLocalPath = body.thumbnailLocalPath;
```

:::info
If `[AgoraChatClient sharedClient].options.isAutoDownloadThumbnail` is set as `YES` on the recipient's client, the SDK automatically downloads the thumbnail after receiving the message. If not, you need to call `[[AgoraChatClient sharedClient].chatManager downloadMessageThumbnail:message progress:nil completion:nil];` to download the thumbnail and get the path from the `thumbnailLocalPath` member in `messageBody`.
:::

#### Send and receive a video message

Before sending a video message, you should implement video capturing on the app level, which provides the duration of the captured video file.

Refer to the following code example to create and send a video message:

```objc
// Set localPath as the path of the video file on the local device and displayName the display name of the video file.
AgoraChatVideoMessageBody *body = [[AgoraChatVideoMessageBody alloc] initWithLocalPath:localPath displayName:@"displayName"];
// The duration of the video file
body.duration = duration;
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:toChatUsername
                                                      from:fromChatUsername
                                                         to:toChatUsername
                                                       body:body
                                                       ext:messageExt];
message.chatType = AgoraChatTypeChat;
// Set the chat type as Group chat. You can also set it as chat (one-to-one chat) or chat room.
// message.chatType = AgoraChatTypeGroupChat;
// Sends the message
[[AgoraChatClient sharedClient].chatManager sendMessage:message
                                               progress:nil
                                             completion:nil];
```

By default, when the recipient receives the message, the SDK downloads the thumbnail of the video message.

If you do not want the SDK to automatically download the video thumbnail, set `[AgoraChatClient sharedClient].options.isAutoDownloadThumbnail` as `NO`, and to download the thumbnail, you need to call `[[AgoraChatClient sharedClient].chatManager downloadMessageThumbnail:message progress:nil completion:nil]`, and get the path of the thumbnail from the `thumbnailLocalPath` member in `messageBody`.

To download the actual video file, call `[[AgoraChatClient sharedClient].chatManager downloadMessageAttachment:progress:completion:]`, and get the path of the video file from the `getLocalUri` member in `messageBody`.

```objc
AgoraChatVideoMessageBody *body = (AgoraChatVideoMessageBody *)message.body;
// Retrieves the path of the video file from the server.
NSString *remotePath = body.remotePath;
// Retrieves the thumbnail of the video file from the server.
NSString *thumbnailPath = body.thumbnailRemotePath;
// Retrieves the path of the video file on the local device.
NSString *localPath = body.localPath;
// Retrieves the thumbnail of the video file on the local device.
NSString *thumbnailLocalPath = body.thumbnailLocalPath;
```

#### Send and receive a file message

Refer to the following code example to create, send, and receive a file message:

```objc
// Set fileData as the path of the file on the local device, and fileName the display name of the attachment file.
AgoraChatFileMessageBody *body = [AgoraChatFileMessageBody  initWithData:fileData
                                                     displayName:fileName];
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:toChatUsername
                                                      from:fromChatUsername
                                                         to:toChatUsername
                                                       body:body
                                                       ext:messageExt];
message.chatType = AgoraChatTypeChat;
// Set the chat type as Group chat. You can also set it as chat (one-to-one chat) or chat room.
// message.chatType = AgoraChatTypeGroupChat;
// Sends the message
[[AgoraChatClient sharedClient].chatManager sendMessage:message
                                               progress:nil
                                             completion:nil];
```

While sending a file message, refer to the following sample code to get the progress for uploading the attachment file:

```objc
[[AgoraChatClient sharedClient].chatManager sendMessage:message progress:^(int progress) {
    //progress indicates the progress of uploading the attachment
} completion:^(AgoraChatMessage *message, AgoraChatError *error) {
    //error indicates the result of sending the message, and message indicates the sent message
}];
```

When the recipient receives the message, refer to the following code example to get the attachment file:

```objc
AgoraChatFileMessageBody *body = (AgoraChatFileMessageBody *)message.body;
// Retrieves the path of the attachment file from the server.
NSString *remotePath = body.remotePath;
// Retrieves the path of the attachment file on the local device.
NSString *localPath = body.localPath;
```
### Send a location message

To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.

```objc
// Sets the latitude and longitude information of the location.
AgoraChatLocationMessageBody *body = [[AgoraChatLocationMessageBody alloc] initWithLatitude:latitude longitude:longitude address:aAddress];
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:toChatUsername
                                                      from:fromChatUsername
                                                         to:toChatUsername
                                                       body:body
                                                       ext:messageExt];
message.chatType = AgoraChatTypeChat;
// Set the chat type as Group chat. You can also set it as chat (one-to-one chat) or chat room.
// message.chatType = AgoraChatTypeGroupChat;
// Sends the message
[[AgoraChatClient sharedClient].chatManager sendMessage:message
                                               progress:nil
                                             completion:nil];
```
### Send and receive a CMD message

CMD messages are command messages that instruct a specified user to take a certain action. The recipient deals with the command messages themselves.
:::info
CMD messages are not stored in the local database.Actions beginning with `em_` and `easemob::` are internal fields. Do not use them.
:::

```objc
// Use action to customize the CMD message
AgoraChatCmdMessageBody *body = [[AgoraChatCmdMessageBody alloc] initWithAction:action];
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:toChatUsername
                                                      from:fromChatUsername
                                                         to:toChatUsername
                                                       body:body
                                                       ext:messageExt];
message.chatType = AgoraChatTypeChat;
// Set the chat type as Group chat. You can also set it as chat (one-to-one chat) or chat room.
// message.chatType = AgoraChatTypeGroupChat;
// Sends the message
[[AgoraChatClient sharedClient].chatManager sendMessage:message
                                               progress:nil
                                             completion:nil];
```

To notify the recipient that a CMD message is received, use a separate delegate so that users can deal with the message differently.

```objc
// Occurs when the CMD message is received.
- (void)cmdMessagesDidReceive:(NSArray *)aCmdMessages{
  for (AgoraChatMessage *message in aCmdMessages) {
        AgoraChatCmdMessageBody *body = (AgoraChatCmdMessageBody *)message.body;
        // Parse the message body
    }
}
```
### Send a customized message

The following code example shows how to create and send a customized message:

```objc
// Set event as the custom message event, for example "userCard".
// Set ext as the extension field of the event, for example as uid, nickname, and avatar.
AgoraChatCustomMessageBody* body = [[AgoraChatCustomMessageBody alloc] initWithEvent:@"userCard" ext:@{@"uid":aUid ,@"nickname":aNickName,@"avatar":aUrl}];
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:toChatUsername
                                                      from:fromChatUsername
                                                         to:toChatUsername
                                                       body:body
                                                       ext:messageExt];
message.chatType = AgoraChatTypeChat;
// Set the chat type as Group chat. You can also set it as chat (one-to-one chat) or chat room.
// message.chatType = AgoraChatTypeGroupChat;
// Sends the message.
[[AgoraChatClient sharedClient].chatManager sendMessage:message
                           progress:nil
                         completion:nil];

```
### Use message extensions

If the message types listed above do not meet your requirements, you can use message extensions to add attributes to the message. This can be applied in more complicated messaging use-cases.

```objc
AgoraChatTextMessageBody *textMessageBody = [[AgoraChatTextMessageBody alloc] initWithText:content];
// Adds the message extension.
NSDictionary *messageExt = @{@"attribute":@"value"};
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:toChatUsername
                                                       from:fromChatUsername
                                                          to:toChatUsername
                                                        body:textMessageBody
                                                        ext:messageExt];
message.chatType = AgoraChatTypeChat;
// Sends the message
[[AgoraChatClient sharedClient].chatManager sendMessage:message
                                               progress:nil
                                             completion:nil];
// Retrieves the extension when receiving the message
- (void)messagesDidReceive:(NSArray *)aMessages
{
  // Traverse the message list
  for (AgoraChatMessage *message in aMessages) {
     //value indicates the value of the attribute field in the message extension
     NSString *value = [message.ext objectForKey:@"attribute"];
  }
}
```

### Forward a single message

You can call the `AgoraChatMessage` constructor method to create a message that is exactly the same as the original message by passing in the message body and extended fields of the original message (if any), and then call the `ChatManager#sendMessage` method to forward the message.

You can forward all types of messages in individual chats, chat groups, and chat rooms. For messages with attachments, there's no need to re-upload the attachments during forwarding.

However, if the original message expires (for example, deleted from the server due to storage limitations), the recipient can view the attachment address after forwarding but won't be able to download the attachment.

To forward a single message, refer to the following code:

```objc
// messageId: The ID of the message to be forwarded.
if let message = AgoraChatClient.shared().chatManager?.getMessageWithMessageId("messageId") {
    // Create a new message with the body and extension fields of the original message.
    let newMessage = AgoraChatMessage(conversationID: "conversationId", body: message.body, ext: message.ext)
    AgoraChatClient.shared().chatManager?.send(newMessage, progress: nil, completion: { messageResult, err in
        if err == nil {
            // Succeeded in forwarding the message.
        }
    })
}
```

### Forward multiple messages

Supported types for forwarded messages include text, images, audio & video files, attachment, and custom messages. A user can create a combined message with a list of original messages and send it. When receiving a combined message, the recipient can select it and other messages to create a new layered combined message. A combined message can contain up to 10 layers of messages, with at most 300 messages at each layer.

To forward and receive combined messages, refer to the following code:

1. Create a combined message using multiple message IDs:

    ```objc
    AgoraChatCombineMessageBody *body = [[AgoraChatCombineMessageBody alloc] initWithTitle:@"Chat History" summary:@"summary" compatibleText:@"The version is low and unable to display the content." messageIdList:@[@"messageId1",@"messageId2"]];
        AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:@"conversationId" body:body ext:nil];
        [AgoraChatClient.sharedClient.chatManager sendMessage:message progress:nil completion:^(AgoraChatMessage *aMessage, AgoraChatError *aError) {
    }];
    ````

1. Download and parse combined messages:

    ```objc
    - (void)messagesDidReceive:(NSArray *)aMessages
    {
        for(AgoraChatMessage* msg in aMessages) {
            if (msg.body.type == AgoraChatMessageBodyTypeCombine) {
                [AgoraChatClient.sharedClient.chatManager downloadAndParseCombineMessage:msg completion:^(NSArray * _Nullable messages, AgoraChatError * _Nullable error) {

                }];
            }
        }
    }
    ```

### Modify sent messages

Every end user or chat group member may edit messages that they have sent. The client API below, when called, will allow the SDK to modify a message.

There is no time limit for modifying a message, that is, it can be modified as long as the message is still stored on the server. After the message is modified, the message life cycle, that is, its storage time on the server, is recalculated. For example, a message can be stored on the server for 180 days, and the user modifies it on the 30th day after the message was sent. Instead of remaining 150 days, the message can be now stored on the server for 180 days after successful modification.

In the modified message, the message ID remains unchanged. Only the message content is edited and the following items are added:

* The operator ID of the user performing the action.
* The operation time that indicates when the message was edited.
* The number of times a message is edited (up to 10 times).

For the edited message, except the message body, other information included in the message like the message sender, recipient, and message extension attributes remain unchanged.

To modify a sent message, refer to the following code:
1. Call `modifyMessage` with the message ID and the new message body:
    ```objc
    AgoraChatTextMessageBody* newBody = [[AgoraChatTextMessageBody alloc] initWithText:@"new content"];
        [AgoraChatClient.sharedClient.chatManager modifyMessage:msgId body:newBody completion:^(AgoraChatError * _Nullable error, AgoraChatMessage * _Nullable message) {

        }];
    ```
1. Receive notification of messages modified by other users:
    ```objc
    - (void)onMessageContentChanged:(AgoraChatMessage *)message operatorId:(NSString *)operatorId operationTime:(NSUInteger)operationTime {

    }
    ```

For further details see [Sent message modification limitations](../../limitations#sent-message-modification-limitations).

### Web

### Send a text message

Use the `Message` class to create a text message, and send the message.

```javascript
// Send a text message.
function sendTextMessage() {
  const options = {
    // Set the message type.
    type: "txt",
    // Set the message content.
    msg: "message content",
    // Set the user ID of the recipient for one-to-one chat, group ID for group chat, or chat room ID for room chat.
    to: "username",
    // Set `chatType` as `singleChat` for one-to-one chat, `groupChat` for group chat, or `chatRoom` for room chat.
    // The default value is `singleChat`.
    chatType: "singleChat",
  };
  // Create a text message.
  const msg = AgoraChat.message.create(options);
  // Call `send` to send the message.
  chatClient
    .send(msg)
    .then((res) => {
      console.log("Send message success", res);
    })
    .catch((e) => {
      console.log("Send message fail", e);
    });
}
```

### Send a message to online users only

Agora Chat supports delivering messages only to users that are currently online. An example of using this function is displaying the votes in a group voting: Only users that are online need to see the changes in real time, while the others only need the final result.

All types of messages in one-to-one chats and chat groups support this function. Compared to an ordinary message, a message that is delivered only to online users has the following differences:

- Does not support offline storage: If the recipient is offline when sending a message, the message cannot be received, even after logging in again. For ordinary messages, when the recipient is online, the message reminder is received in real time; when the recipient is offline, the offline push message is sent in real time. When the recipient is online again, the Chat server actively pushes the offline message to the client.
- Support local storage: After a message is successfully sent, it is added to the database.
- Roaming storage is not supported by default: Sent messages are not stored on the Chat message server by default, so users cannot obtain the messages on other devices. If you need to activate roaming storage of online messages, contact support@agora.io.

To deliver messages only to online users, set `Message#deliverOnlineOnly` to `true` when sending the message. The following is an example of sending a text message to only online users:

```javascript
// Send text message.
function sendTextMessage() {
  const options = {
    // Message type.
    type: "txt",
    // Message content.
    msg: "message content",
    // Message recipient: Single chat is the other party's user ID, group chat is the group ID.
    to: "username",
    // Conversation type: single chat and group chat are `singleChat` and `groupChat` respectively, the default is single chat.
    chatType: "singleChat",
    // Whether the message is only delivered to online users. (Default) `false`: Delivered regardless of whether the user is online or not; `true`: Only delivered to online users. If the user is offline, message delivery fails.
    deliverOnlineOnly: true,
  };
  // Create text message.
  const msg = AgoraChat.message.create(options);
  // Call the `send` method to send the text message.
  chatClient
    .send(msg)
    .then((res) => {
      console.log("Send message success", res);
    })
    .catch((e) => {
      console.log("Send message fail", e);
    });
}
```

### Set message priority

In high-concurrency use-cases, you can set a certain message type or messages from a chat room member as high, normal, or low priority.
In this case, low-priority messages are dropped first to reserve resources for the high-priority ones, for example, gifts and announcements, when the server is overloaded.
This ensures that the high-priority messages can be dealt with first when loads of messages are being sent in high concurrency or high frequency.
Note that this feature can increase the delivery reliability of high-priority messages, but cannot guarantee the deliveries.
Even high-priorities messages can be dropped when the server load goes too high.

You can set the priority for all types of messages in the chat room.

```javascript
// Send a text message.
function sendTextMessage() {
  const options = {
    type: "txt",
    msg: "message content",
    // Set the message priority. The default value is `normal`, indicating the normal priority.
    priority: "high",
    to: "chat room ID",
    chatType: "chatRoom",
  };
  const msg = AgoraChat.message.create(options);
  chatClient
    .send(msg)
    .then(() => {
      console.log("Send message success");
    })
    .catch((e) => {
      console.log("Send message fail");
    });
}
```

### Receive a message

You can use `addEventHandler` to listen for message events. You can add multiple events. When you no longer listen for an event, ensure that you remove the handler.

When a message arrives, the recipient receives an `onXXXMessage` callback. Each callback contains one or more messages. You can traverse the message list, and parse and render these messages in this callback and render these messages.

```javascript
// Use `addEventHandler` to listen for callback events.
chatClient.addEventHandler("handlerId", {
  // Occurs when the app is connected.
  onConnected: function (message) {},
  // Occurs when the connection is lost.
  onDisconnected: function (message) {},
  // Occurs when the text message is received.
  onTextMessage: function (message) {},
  // Occurs when the image message is received.
  onImageMessage: function (message) {},
  // Occurs when the CMD message is received.
  onCmdMessage: function (message) {},
  // Occurs when the audio message is received.
  onAudioMessage: function (message) {},
  // Occurs when the location message is received.
  onLocationMessage: function (message) {},
  // Occurs when the file message is received.
  onFileMessage: function (message) {},
  // Occurs when the custom message is received.
  onCustomMessage: function (message) {},
  // Occurs when the video message is received.
  onVideoMessage: function (message) {},
  // Occurs when the local network is connected.
  onOnline: function () {},
  // Occurs when the local network is disconnected.
  onOffline: function () {},
  // Occurs when an error occurs.
  onError: function (message) {},
  // Occurs when the message is recalled.
  onRecallMessage: function (message) {},
  // Occurs when the message is received.
  onReceivedMessage: function (message) {},
  // Occurs when the message delivery receipt is received.
  onDeliveredMessage: function (message) {},
  // Occurs when the message read receipt is received.
  onReadMessage: function (message) {},
  // Occurs when the conversation read receipt is received.
  onChannelMessage: function (message) {},
});
```

### Recall a message

After a message is sent, you can recall it. The `recallMessage` method recalls a message saved on the server, whether it is a historical message, offline message or a roaming message.

The default time limit for recalling a message is two minutes. You can extend this time frame to up to 7 days in [Agora Console](https://console.agora.io/v2). To do so, select a project that enables Agora Chat, then click **Configure** > **Features** > **Message recall**.

![message-recall](/images/im/message-recall.png)

:::info

  1. Except CMD messages, you can recall all types of message. 2. If an
  attachment message, like an image, voice, video, or file message, is recalled,
  the attachment of the message is also deleted.

:::

```javascript
const options = {
  // The ID of the message to recall.
  mid: "msgId",
  // The message recipient.
  to: "userID",
  // The chat type: singleChat, groupChat, and chatRoom respectively indicate one-to-one chat, group chat, and room chat.
  chatType: "singleChat",
};
chatClient
  .recallMessage(options)
  .then((res) => {
    console.log("success", res);
  })
  .catch((error) => {
    // Recalling the message fails, probably because the time limit for recalling the message is exceeded.
    console.log("fail", error);
  });
```

You can also use `onRecallMessage` to listen for the message recall state:

```javascript
chatClient.addEventHandler('handlerId',{
   onRecallMessage: (msg) =>  {
       // You can insert a message here, for example, XXX has recalled a message.
        console.log('Recalling the message succeeds'，msg)
   },
})
```

### Send an attachment message

Voice, image, video, and file messages are essentially attachment messages.
When sending an attachment message, the SDK takes the following steps:

1. Uploads the attachment to the server and gets the information of the attachment file on the server.
2. Sends the attachment message, which contains the basic information of the message, and the path to the attachment file on the server.

For the attachment messages, you can upload the attachment to your server, instead of the Agora server, before sending an attachment message. In this case, you need to set the `useOwnUploadFun` parameter in the `connection` class to `true` during SDK initialization. For example, to send an image message, you can call `sendPrivateUrlImg` to pass in the image URL after uploading the image attachment.

```javascript
function sendPrivateUrlImg() {
  const options = {
    chatType: "singleChat",
    // Message type.
    type: "img",
    // Image URL
    url: "img url",
    // Message sender: the user ID of the peer user for one-to-one chat; group ID for group chat; chat room ID for room chat.
    to: "username",
  };
  // Create an image message.
  const msg = AgoraChat.message.create(options);
  // Call the `send` method to send the image message.
  chatClient.send(msg);
}
```

For image and video messages, the SDK also automatically generates a thumbnail.
When receiving an attachment message, the SDK takes the following steps:

- For voice messages, the SDK automatically downloads the audio file.
- For image and video messages, the SDK automatically downloads the thumbnail of the image or video. To download the files, you need to call the `download` method.
- For file messages, you need to call the `download` method to download the file.

#### Send a voice message

Before sending a voice message, you should implement audio recording on the app level, which provides the URI and duration of the recorded audio file.
Refer to the following code example to create and send a voice message:

```javascript
function sendAudioMessage() {
  // Select the local audio file.
  const input = document.getElementById("audio");
  // Turn the audio file to a binary file.
  const file = AgoraChat.utils.getFileUrl(input);
  const allowType = {
    mp3: true,
    amr: true,
    wmv: true,
  };
  if (file.filetype.toLowerCase() in allowType) {
    const options = {
      // Set the message type
      type: "audio",
      file: file,
      // Set the length of the audio file in seconds.
      length: "3",
      // Set the username of the message receiver.
      to: "username",
      // Set the chat type.
      chatType: "singleChat",
      // Occurs when the audio file fails to be uploaded.
      onFileUploadError: function () {
        console.log("onFileUploadError");
      },
      // Reports the progress of uploading the audio file.
      onFileUploadProgress: function (e) {
        console.log(e);
      },
      // Occurs when the audio file is successfully uploaded.
      onFileUploadComplete: function () {
        console.log("onFileUploadComplete");
      },
      ext: { file_length: file.data.size },
    };
    // Create a voice message.
    const msg = AgoraChat.message.create(options);
    // Call send to send the voice message.
    chatClient
      .send(msg)
      .then((res) => {
        // Occurs when the audio file is successfully sent.
        console.log("Success");
      })
      .catch((e) => {
        // Occurs when the audio file fails to be sent
        console.log("Fail");
      });
  }
}
```

#### Send an image message

Refer to the following code example to create and send an image message:

```javascript
function sendImgMessage() {
  // Select the local image file.
  const input = document.getElementById("image");
  // Turn the image to a binary file.
  const file = AgoraChat.utils.getFileUrl(input);
  const allowType = {
    jpg: true,
    gif: true,
    png: true,
    bmp: true,
  };
  if (file.filetype.toLowerCase() in allowType) {
    const options = {
      // Set the message type.
      type: "img",
      file: file,
      ext: {
        // Set the image file length.
        file_length: file.data.size,
      },
      // Set the username of the message receiver.
      to: "username",
      // Set the chat type.
      chatType: "singleChat",
      // Occurs when the image file fails to be uploaded.
      onFileUploadError: function () {
        console.log("onFileUploadError");
      },
      // Reports the progress of uploading the image file.
      onFileUploadProgress: function (e) {
        console.log(e);
      },
      // Occurs when the image file is successfully uploaded.
      onFileUploadComplete: function () {
        console.log("onFileUploadComplete");
      },
    };
    // Create a voice message.
    const msg = AgoraChat.message.create(options);
    // Call send to send the voice message.
    chatClient
      .send(msg)
      .then((res) => {
        // Occurs when the audio file is successfully sent.
        console.log("Success");
      })
      .catch((e) => {
        // Occurs when the audio file fails to be sent
        console.log("Fail");
      });
  }
}
```

#### Send a video message

Before sending a video message, you should implement video capturing on the app level, which provides the duration of the captured video file.
Refer to the following code example to create and send a video message:

```javascript
function sendVideoMessage() {
  // Select the local video file.
  const input = document.getElementById("video");
  // Turn the video to a binary file.
  const file = AC.utils.getFileUrl(input);
  const allowType = {
    mp4: true,
    wmv: true,
    avi: true,
    rmvb: true,
    mkv: true,
  };
  if (file.filetype.toLowerCase() in allowType) {
    const options = {
      // Set the message type
      type: "video",
      file: file,
      // The username of the message receiver
      to: "username",
      // Set the chat type
      chatType: "singleChat",
      onFileUploadError: function () {
        // Occurs when the file fails to be uploaded.
        console.log("onFileUploadError");
      },
      onFileUploadProgress: function (e) {
        // Reports the progress of uploading the file.
        console.log(e);
      },
      onFileUploadComplete: function () {
        // Occurs when the file is uploaded.
        console.log("onFileUploadComplete");
      },
      ext: { file_length: file.data.size },
    };
    // Create a video message.
    const msg = AgoraChat.message.create(options);
    // Call send to send the video message.
    chatClient
      .send(msg)
      .then((res) => {
        // Occurs when the message is sent.
        console.log("success");
      })
      .catch((e) => {
        // Occurs when the message fails to be sent, for example, because the local user is muted or blocked.
        console.log("Fail");
      });
  }
}
```

#### Send a file message

Refer to the following code example to create, send, and receive a file message:

```javascript
function sendFileMessage() {
  // Select the local file.
  const input = document.getElementById("file");
  // Turn the file message to a binary file.
  const file = AgoraChat.utils.getFileUrl(input);
  const allowType = {
    jpg: true,
    gif: true,
    png: true,
    bmp: true,
    zip: true,
    txt: true,
    doc: true,
    pdf: true,
  };
  if (file.filetype.toLowerCase() in allowType) {
    const options = {
      // Set the message type.
      type: "file",
      file: file,
      // Set the username of the message receiver.
      to: "username",
      // Set the chat type.
      chatType: "singleChat",
      // Occurs when the file fails to be uploaded.
      onFileUploadError: function () {
        console.log("onFileUploadError");
      },
      // Reports the progress of uploading the file.
      onFileUploadProgress: function (e) {
        console.log(e);
      },
      // Occurs when the file is uploaded.
      onFileUploadComplete: function () {
        console.log("onFileUploadComplete");
      },
      ext: { file_length: file.data.size },
    };
    // Create a file message.
    const msg = AgoraChat.message.create(options);
    // Call send to send the file message.
    chatClient
      .send(msg)
      .then((res) => {
        // Occurs when the file message is sent.
        console.log("Success");
      })
      .catch((e) => {
        // Occurs when the file message fails to be sent.
        console.log("Fail");
      });
  }
}
```

### Send a location message

To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.

```javascript
const sendLocMessage = () => {
  let coords;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      coords = position.coords;
      const options = {
        chatType: "singleChat",
        type: "loc",
        to: "username",
        addr: "London",
        buildingName: "Digital Building",
        lat: Math.round(coords.latitude),
        lng: Math.round(coords.longitude),
      };
      const msg = AgoraChat.message.create(options);
      chatClient
        .send(msg)
        .then((res) => {
          console.log("Send message success", res);
        })
        .catch((e) => {
          console.log("Send message fail", e);
        });
    });
  }
};
```

### Send a CMD message

CMD messages are command messages that instruct a specified user to take a certain action. The recipient deals with the command messages themselves.
The following code sample shows how to send and receive a CMD message:

```javascript
const options = {
  // Set the message type.
  type: "cmd",
  // Set the chat type.
  chatType: "singleChat",
  // The username of the message receiver.
  to: "username",
  // Set the custom action.
  action: "action",
  // Set the extended message.
  ext: { extmsg: "extends messages" },
};
// Create a CMD message.
const msg = AgoraChat.message.create(options);
// Call send to send the CMD message.
chatClient
  .send(msg)
  .then((res) => {
    // Occurs when the message is sent.
    console.log("Success");
  })
  .catch((e) => {
    // Occurs when the message fails to be sent.
    console.log("Fail");
  });
```

### Send a customized message

Custom messages are self-defined key-value pairs that include the message type and the message content.
The following code example shows how to create and send a customized message:

```javascript
function sendCustomMessage() {
  // Set the custom event.
  const customEvent = "customEvent";
  // Set the custom message content with key-value pairs.
  const customExts = {};
  const options = {
    // Set the message type.
    type: "custom",
    // Set the username of the message receiver.
    to: "username",
    // Set the chat type.
    chatType: "singleChat",
    customEvent,
    customExts,
    // The extended field. Do not set it as null.
    ext: {},
  };
  // Create a custom message.
  const msg = AgoraChat.message.create(options);
  // Call send to send the custom message.
  chatClient
    .send(msg)
    .then((res) => {
      // Occurs when the message is sent.
      console.log("Success");
    })
    .catch((e) => {
      // Occurs when the message fails to be sent.
      console.log("Fail");
    });
}
```

### Use message extensions

If the message types listed above do not meet your requirements, you can use message extensions to add attributes to the message. This can be applied in more complicated messaging use-cases.

```javascript
function sendTextWithExt() {
  const options = {
    type: "txt",
    msg: "message content",
    to: "username",
    chatType: "singleChat",
    // Set the message extension.
    ext: {
      key1: "Self-defined value1",
      key2: {
        key3: "Self-defined value3",
      },
    },
  };
  const msg = AgoraChat.message.create(options);
  // Call send to send the extended message.
  chatClient
    .send(msg)
    .then((res) => {
      console.log("send private text Success");
    })
    .catch((e) => {
      console.log("Send private text error");
    });
}
```

### Forward multiple messages

Supported types for forwarded messages include text, images, audio & video files, attachment, and custom messages. A user can create a combined message with a list of original messages and send it. When receiving a combined message, the recipient can select it and other messages to create a new layered combined message. A combined message can contain up to 10 layers of messages, with at most 300 messages at each layer.

To forward and receive combined messages, refer to the following code:

1. Create a combined message using multiple message IDs:

   ```javascript
   const options = {
     chatType: "singleChat",
     type: "combine",
     to: "userId",
     compatibleText:
       "Your SDK does not support combined messages. Please upgrade.",
     title: "Chat history",
     summary: "hi",
     messageList: [
       // message body
       {
         type: "txt",
         chatType: "singleChat",
         // ...
       },
     ],
     onFileUploadComplete: (data) => {
       options.url = data.url;
     },
   };
   const msg = AgoraChat.message.create(options);
   chatClient
     .send(msg)
     .then((res) => {
       console.log("Succeeded in sending the message", res);
     })
     .catch((err) => {
       console.log("Failed to send the message", err);
     });
   ```

2. Download and parse combined messages:
   ```javascript
   chatClient
     .downloadAndParseCombineMessage({
       url: msg.url,
       secret: msg.secret,
     })
     .then((res) => {
       console.log("The list of original messages obtained after parsing", res);
     });
   ```

For further details see [Multiple messages forwarding limitations](../../limitations#multiple-messages-forwarding-limitations).

### Modify sent messages

Every end user or chat group member may edit messages that they have sent. The client API below, when called, will allow the SDK to modify a message.

There is no time limit for modifying a message, that is, it can be modified as long as the message is still stored on the server. After the message is modified, the message life cycle, that is, its storage time on the server, is recalculated. For example, a message can be stored on the server for 180 days, and the user modifies it on the 30th day after the message was sent. Instead of remaining 150 days, the message can be now stored on the server for 180 days after successful modification.

In the modified message, the message ID remains unchanged. Only the message content is edited and the following items are added:

- The operator ID of the user performing the action.
- The operation time that indicates when the message was edited.
- The number of times a message is edited (up to 10 times).

For the edited message, except the message body, other information included in the message like the message sender, recipient, and message extension attributes remain unchanged.

1. Call `modifyMessage` with the message ID and the new message body:

   ```javascript
   const textMessage = AgoraChat.message.create({
     type: "txt",
     msg: "message content",
     to: "username",
     chatType: "singleChat",
   });

   chatClient
     .modifyMessage({ messageId: "messageId", modifiedMessage: textMessage })
     .then((res) => {
       console.log(res.message);
     })
     .catch((e) => {
       console.log(e);
     });
   ```

1. Receive notification of messages modified by other users:
   ```javascript
   // Adds the message modification event
   chatClient.addEventHandler("modifiedMessage", {
     onModifiedMessage: (message) => {
       console.log("onModifiedMessage", message);
     },
   });
   ```

For further details see [Sent message modification limitations](../../limitations#sent-message-modification-limitations).

### Flutter

### Send a message

Follow the steps to create and send a message, and listen for the result of sending the message.

1. Use the `ChatMessage` class to create a message.

   ```dart
   // Sets the message type. Agora Chat supports 8 message types.
   MessageType messageType = MessageType.TXT;
   // Sets `targetId` to the user ID of the peer user in one-to-one chat, group ID in group chat, and chat room ID in room chat.
   String targetId = "tom";
   // Sets `chatType` as `Chat`, `GroupChat`, or `ChatRoom` for one-to-one chat, group chat, or room chat.
   ChatType chatType = ChatType.Chat;
   // Creates a message. Parameters vary with message types.
   // Creates a text message.
   ChatMessage msg = ChatMessage.createTxtSendMessage(
       targetId: targetId,
       content: "This is text message",
   );
   // Creates an image message. You need to set the local path, length, and width of the image file, and the image name displayed on the UI.
   String imgPath = "/data/.../image.jpg";
   double imgWidth = 100;
   double imgHeight = 100;
   String imgName = "image.jpg";
   int imgSize = 3000;
   ChatMessage msg = ChatMessage.createImageSendMessage(
       targetId: targetId,
       filePath: imgPath,
       width: imgWidth,
       height: imgHeight,
       displayName: imgName,
       fileSize: imgSize,
   );
   // Creates a CMD message. A CMD message contains a command for the recipient to take action. You can customize the command.
   String action = "writing";
   ChatMessage msg = ChatMessage.createCmdSendMessage(
       targetId: targetId,
       action: action,
   );
   // Creates a custom message. A custom message contains the message event type and the extension field.
   // You can customize the extension field according to your use case.
   String event = "gift";
   Map params = {"key": "value"};
   ChatMessage msg = ChatMessage.createCustomSendMessage(
       targetId: targetId,
       event: event,
       params: params,
   );
   // Creates a file message. A file message contains the local file path and the name displayed on the UI.
   String filePath = "data/.../foo.zip";
   String fileName = "foo.zip";
   int fileSize = 6000;
   ChatMessage fileMsg = ChatMessage.createFileSendMessage(
       targetId: targetId,
       filePath: filePath,
       displayName: fileName,
       fileSize: fileSize,
   );
   // Creates a location message. You need to set the longitude and latitude information of the location, as well as the name of the location.
   // To send a location message, you need to integrate a third-party map service to get the longitude and latitude information of the location. When the recipient receives the location information, the service renders the location on the map according to the longitude and latitude information.
   double latitude = 114.78;
   double longitude = 39.89;
   String address = "darwin";
   ChatMessage msg = ChatMessage.createLocationSendMessage(
       targetId: targetId,
       latitude: latitude,
       longitude: longitude,
       address: address,
   );
   // Creates a video message. A video message includes two attachment files, including the video file and the thumbnail of the video. The SDK uses the first frame of the video as the thumbnail. You also need to set the local path, length, width, display name, and duration of the video file.
   String videoPath = "data/.../foo.mp4";
   double videoWidth = 100;
   double videoHeight = 100;
   String videoName = "foo.mp4";
   int videoDuration = 5;
   int videoSize = 4000;
   ChatMessage msg = ChatMessage.createVideoSendMessage(
       targetId: targetId,
       filePath: videoPath,
       width: videoWidth,
       height: videoHeight,
       duration: videoDuration,
       fileSize: videoSize,
       displayName: videoName,
   );
   // Creates a voice message. A voice message contains the local path, display name, and duration of the audio file.
   String voicePath = "data/.../foo.wav";
   String voiceName = "foo.wav";
   int voiceDuration = 5;
   int voiceSize = 1000;
   ChatMessage.createVoiceSendMessage(
       targetId: targetId,
       filePath: voicePath,
       duration: voiceDuration,
       fileSize: voiceSize,
       displayName: voiceName,
   );
   ```

2. Send the message using `sendMessage` in `ChatManager`.

   ```dart
   ChatClient.getInstance.chatManager.sendMessage(message).then((value) {
   });
   ```

To get the progress and result of the message sending, you need to implement `ChatManager#addMessageEvent`. For CMD messages which do not necessarily need a result, you do not need to set the callback.

```dart
// Adds a message status listener.
ChatClient.getInstance.chatManager.addMessageEvent(
    "UNIQUE_HANDLER_ID",
    ChatMessageEvent(
        // Occurs when the message sending succeeds. You can update the message and add other operations in this callback.
        onSuccess: (msgId, msg) {
        // msgId: The pre-sending message ID.
        // msg: The message that is sent successfully.
        },
        // Occurs when the message sending fails. You can update the message status and add other operations in this callback.
        onError: (msgId, msg, error) {
        // msgId: The pre-sending message ID.
        // msg: The message that fails to be sent.
        // error: The error description.
        },
        // For attachment messages such as image, voice, file, and video, you can get a progress value for uploading or downloading them in this callback.
        onProgress: (msgId, progress) {
        // msgId: The pre-sending message ID.
        // progress: The sending progress.
        },
    ),
);
void dispose() {
    // Removes the message status listener.
    ChatClient.getInstance.chatManager.removeMessageEvent("UNIQUE_HANDLER_ID");
    super.dispose();
}
// The result of the messaging sending is returned in the callback. The return value of the method only indicates the result of the message call.
ChatClient.getInstance.chatManager.sendMessage(message).then((value) {
   // Finishes sending the message.
});
```

### Send a message to online users only

Agora Chat supports delivering messages only to users that are currently online. An example of using this function is displaying the votes in a group voting: Only users that are online need to see the changes in real time, while the others only need the final result.

All types of messages in one-to-one chats and chat groups support this function. Compared to an ordinary message, a message that is delivered only to online users has the following differences:

- Does not support offline storage: If the recipient is offline when sending a message, the message cannot be received, even after logging in again. For ordinary messages, when the recipient is online, the message reminder is received in real time; when the recipient is offline, the offline push message is sent in real time. When the recipient is online again, the Chat server actively pushes the offline message to the client.
- Support local storage: After a message is successfully sent, it is added to the database.
- Roaming storage is not supported by default: Sent messages are not stored on the Chat message server by default, so users cannot obtain the messages on other devices. If you need to activate roaming storage of online messages, contact support@agora.io.

To deliver messages only to online users, set `Message#deliverOnlineOnly` to `true` when sending the message. The following is an example of sending a text message to only online users:

```dart
// Create a text message.
final msg = ChatMessage.createTxtSendMessage(
  // `targetId`: The message recipient, which is the user ID of the peer user for one-to-one chat and group ID for group chat.
  targetId: conversationId,
  // `content`: The text content of the message.
  content: 'hello',
  // The chat type, which is `Chat` for one-to-one chat and `GroupChat` for group chat. The default value is `Chat`.
  chatType: ChatType.Chat,
);

msg.deliverOnlineOnly = true;

// Send a message.
ChatClient.getInstance.chatManager.sendMessage(msg);
```

### Set message priority

In high-concurrency use-cases, you can set a certain message type or messages from a chat room member as high, normal, or low priority.
In this case, low-priority messages are dropped first to reserve resources for the high-priority ones, for example, gifts and announcements, when the server is overloaded.
This ensures that the high-priority messages can be dealt with first when loads of messages are being sent in high concurrency or high frequency.
Note that this feature can increase the delivery reliability of high-priority messages, but cannot guarantee the deliveries.
Even high-priorities messages can be dropped when the server load goes too high.

You can set the priority for all types of messages in the chat room.

```dart
// Set the priority of the chat room message. The default priority is `Normal`, indicating the normal priority.
if (msg.chatType == ChatType.ChatRoom) {
    msg.chatroomMessagePriority = ChatRoomMessagePriority.High;
}
```

### Receive the message

You can use `ChatEventHandler` to listen for message events. You can add multiple `ChatEventHandler` objects to listen for multiple events. When you no longer listen for an event, for example, when you call `dispose`, ensure that you remove the object.

When a message arrives, the recipient receives an `onMessagesReceived` callback. Each callback contains one or more messages. You can traverse the message list, and parse and render these messages in this callback.

```dart
// Adds a chat event handler.
ChatClient.getInstance.chatManager.addEventHandler(
    "UNIQUE_HANDLER_ID",
    ChatEventHandler(
        onMessagesReceived: (messages) {},
    ),
);
...
// Removes the chat event handler.
ChatClient.getInstance.chatManager.removeEventHandler("UNIQUE_HANDLER_ID");
```

When a voice message is received, the SDK automatically downloads the audio file.

For image and video messages, the SDK automatically generates a thumbnail when you create the message. When an image or video message is received, the SDK automatically downloads the thumbnail. To manually download the attachment files, follow the steps:

1. Set `isAutoDownloadThumbnail` as `false` when initializing the SDK.

   ```dart
   ChatOptions options = ChatOptions(
       appKey: "",
       isAutoDownloadThumbnail: false,
   );
   ```

2. Set the status callback for the download.

   ```dart
   // Adds a message status listener.
   ChatClient.getInstance.chatManager.addMessageEvent(
       "UNIQUE_HANDLER_ID",
       ChatMessageEvent(
           // Occurs when the message is downloaded successfully.
           onSuccess: (msgId, msg) {
           // msgId: The message ID.
           // msg: The message that is downloaded successfully.
           },
           // Occurs when the message fails to be downloaded.
           onError: (msgId, msg, error) {
           // msgId: The message ID.
           // msg: The message that fails to be downloaded.
           // error: The reason for the download failure.
           },
           // For attachment messages such as image, voice, file, and video, you can get a progress value for uploading or downloading them in this callback.
           onProgress: (msgId, progress) {
           // msgId: The message ID.
           // progress: The upload or download progress.
           },
       ),
   );
   void dispose() {
       // Removes the message status listener.
       ChatClient.getInstance.chatManager.removeMessageEvent("UNIQUE_HANDLER_ID");
       super.dispose();
   }
   ```

3. Download the thumbnail and get the path to it.

   ```dart
   ChatClient.getInstance.chatManager.downloadThumbnail(message);
   ```

  Get the path to the thumbnail from the `thumbnailLocalPath` member in the message body.

```dart
// Get the message body of the image file.
ChatImageMessageBody imgBody = message.body as ChatImageMessageBody;
// Get the local path to the thumbnail.
String? thumbnailLocalPath = imgBody.thumbnailLocalPath;
```

4. Call `downloadAttachment` to download the file.

   ```dart
   ChatClient.getInstance.chatManager.downloadAttachment(message);
   ```

  Get the path to the attachment from the `localPath` member in the message body.

  ```dart
  // Get the message body.
  ChatFileMessageBody fileBody = message.body as ChatFileMessageBody;
  // Get the local path of the file.
  String? localPath = fileBody.localPath;
  ```

### Recall a message

After a message is sent, you can recall it. The `recallMessage` method recalls a message that is saved both locally and on the server, whether it is a historical message, offline message or a roaming message on the server, or a message in the memory or local database of the message sender or recipient.

The default time limit for recalling a message is two minutes. You can extend this time frame to up to 7 days in [Agora Console](https://console.agora.io/v2). To do so, select a project that enables Agora Chat, then click **Configure** > **Features** > **Message recall**.

![message-recall](/images/im/message-recall.png)

:::info
1. Except CMD messages, you can recall all types of message. 2. If an attachment message, like an image, voice, video, or file message, is recalled, the attachment of the message is also deleted.
:::

```dart
try {
  await ChatClient.getInstance.chatManager.recallMessage(msgId);
} on ChatError catch (e) {
```

You can also use `ChatEventHandler` to listen for the state of recalling the message:

```dart
ChatClient.getInstance.chatManager.addEventHandler(
    "UNIQUE_HANDLER_ID",
    ChatEventHandler(
    onMessagesRecalled: (messages) {},
    ),
);
```

### Use message extensions

If the message types listed above do not meet your requirements, you can use message extensions to add attributes to the message. This can be applied in more complicated messaging use-cases.

```typescript
try {
  final msg = ChatMessage.createTxtSendMessage(
    targetId: targetId,
    content: 'content',
  );

  msg.attributes = {'k': 'v'};
  ChatClient.getInstance.chatManager.sendMessage(msg);
} on ChatError catch (e) {}

```

### Forward a single message

You can use the `Message#createSendMessage` method and the `Message#attribute` property to create a new message identical to the original one, including its body and extended fields. After creating the message, you can forward it using the `ChatManager#sendMessage` method.

You can forward all types of messages in individual chats, chat groups, and chat rooms. For messages with attachments, there's no need to re-upload the attachments during forwarding.

However, if the original message expires (for example, deleted from the server due to storage limitations), the recipient can view the attachment address after forwarding but won't be able to download the attachment.

To forward a single message, refer to the following code:

```dart
void forwardMessage(ChatMessage message) async {
  var msg = ChatMessage.createSendMessage(
    to: message.to,
    body: message.body,
    chatType: message.chatType,
  );
  ChatClient.getInstance.chatManager.sendMessage(msg);
}
```

### Forward multiple messages

Supported types for forwarded messages include text, images, audio & video files, attachment, and custom messages. A user can create a combined message with a list of original messages and send it. When receiving a combined message, the recipient can select it and other messages to create a new layered combined message. A combined message can contain up to 10 layers of messages, with at most 300 messages at each layer.

To forward and receive combined messages, refer to the following code:

1. Create a combined message using multiple message IDs:

    ```dart
    String title = "Historical messages for one-to-one chats between A and B";
    String summary =
        "A: These are historical messages from A. \nB: These are historical messages from B.";
    String compatibleText =
        "Your current version does not support this type of message. Please upgrade to the latest version.";
    final msg = ChatMessage.createCombineSendMessage(
        targetId: targetId,
        msgIds: msgIds,
        title: title,
        summary: summary,
        compatibleText: compatibleText,
    );
    await ChatClient.getInstance.chatManager.sendMessage(msg);
    ```

2. Download and parse combined messages:

    ```dart
    List list =
        await ChatClient.getInstance.chatManager.fetchCombineMessageDetail(
    message: combineMessage,
    );
    ```

For further details see [Multiple messages forwarding limitations](../../limitations#multiple-messages-forwarding-limitations).

### Modify sent messages

Every end user or chat group member may edit messages that they have sent. The client API below, when called, will allow the SDK to modify a message.

There is no time limit for modifying a message, that is, it can be modified as long as the message is still stored on the server. After the message is modified, the message life cycle, that is, its storage time on the server, is recalculated. For example, a message can be stored on the server for 180 days, and the user modifies it on the 30th day after the message was sent. Instead of remaining 150 days, the message can be now stored on the server for 180 days after successful modification.

In the modified message, the message ID remains unchanged. Only the message content is edited and the following items are added:

* The operator ID of the user performing the action.
* The operation time that indicates when the message was edited.
* The number of times a message is edited (up to 10 times).

For the edited message, except the message body, other information included in the message like the message sender, recipient, and message extension attributes remain unchanged.

To modify a sent message, refer to the following code:

1. Call `modifyMessage` with the message ID and the new message body:

    ```dart
    ChatTextMessageBody body = ChatTextMessageBody(content: "new content");
    await ChatClient.getInstance.chatManager.modifyMessage(
        messageId: msgId,
        msgBody: body,
    );
    ```

1. Receive notification of messages modified by other users:

    ```dart
    ChatEventHandler(
            onMessageContentChanged: (message, operatorId, operationTime) {},
    )
    ```

For further details see [Sent message modification limitations](../../limitations#sent-message-modification-limitations).

### React Native

### Send a message

Implement the `ChatMessageStatusCallback` class to listen for the progress and result of the message sending.

```typescript
// Implement ChatMessageStatusCallback
class ChatMessageCallback implements ChatMessageStatusCallback {
  onProgress(localMsgId: string, progress: number): void {
    console.log(`sendMessage: onProgress: `, localMsgId, progress);
    // For attachment messages such as voice and video, you can use the percentage value to represent the uploading or downloading progress.
  }
  onError(localMsgId: string, error: ChatError): void {
    console.log(`sendMessage: onError: `, localMsgId, error);
    // Update the message state or add subsequent handling logics after receiving the callback.
  }
  onSuccess(message: ChatMessage): void {
    console.log(`sendMessage: onSuccess: `, message);
    // Update the message state or add subsequent handling logics after receiving the callback.
  }
  // You can set the priority of chat room messages. The default priority is `PriorityNormal`, indicating the normal priority.
  if (ret.chatType === ChatMessageChatType.ChatRoom) {
    ret.messagePriority = priority;
  }
  ChatClient.getInstance()
  .chatManager.sendMessage(msg!, new ChatMessageCallback())
  .then(() => {
  // The sending operation is complete and the log is printed here.
  // The sending operation is returned via callback.
  console.log("send message operation success.");
  })
  .catch((reason) => {
  // The sending operation fails and the log is printed here.
  console.log("send message operation fail.", reason);
  })
  };
```
Use the `ChatMessage` class to create a message, and `ChannelManager` to send the message.

```typescript
// Set the message type. The SDK supports 8 message types.
const messageType = ChatMessageType.TXT;
// Set `targetId` to the user ID of the peer user in one-to-one chat, group ID in group chat, and chat room ID in room chat.
const targetId = "tom";
// Set `chatType` as `PeerChat`, `GroupChat`, or `ChatRoom` for one-to-one chat, group chat, or room chat.
const chatType = ChatMessageChatType.PeerChat;
// Construct the message. Parameters vary with message types.
let msg: ChatMessage;
if (messageType === ChatMessageType.TXT) {
  // For a text message, set the message content.
  const content = "This is text message";
  msg = ChatMessage.createTextMessage(targetId, content, chatType);
} else if (messageType === ChatMessageType.IMAGE) {
  // For an image message, set the file path, width, height, and display name of the image file.
  // For the image file path, `file://` is unnecessary.
  const filePath = "/data/.../image.jpg";
  const width = 100;
  const height = 100;
  const displayName = "test.jpg";
  msg = ChatMessage.createImageMessage(targetId, filePath, chatType, {
    displayName,
    width,
    height,
  });
} else if (messageType === ChatMessageType.CMD) {
  // Construct a command message. You can customize the command.
  const action = "writing";
  msg = ChatMessage.createCmdMessage(targetId, action, chatType);
} else if (messageType === ChatMessageType.CUSTOM) {
  // Customize the message. The message content comprises of the event type and the extension field.
  // Allow the chat users to set the event and the extension field.
  const event = "gift";
  const ext = { key: "value" };
  msg = ChatMessage.createCustomMessage(targetId, event, chatType, {
    params: JSON.stringify(ext),
  });
} else if (messageType === ChatMessageType.FILE) {
  // Construct a file message. You need to set the file path and display name of the file.
  // For the file path, `file://` is unnecessary.
  const filePath = "data/.../foo.zip";
  const displayName = "study_data.zip";
  msg = ChatMessage.createFileMessage(targetId, filePath, chatType, {
    displayName,
  });
} else if (messageType === ChatMessageType.LOCATION) {
  // Construct a location message. You need to set the latitude and longitude information of the location, as well as the address of the location.
  const latitude = "114.78";
  const longitude = "39,89";
  const address = "darwin";
  msg = ChatMessage.createLocationMessage(
    targetId,
    latitude,
    longitude,
    chatType,
    { address }
  );
} else if (messageType === ChatMessageType.VIDEO) {
  // Construct a video message, which includes the video file and thumbnail of the video. You need to set the file path, width, height, display name, and duration of the video file.
  // You also need to set the path of the thumbnail on the local device.
  // A video message contains two attachment files.
  // For the video file path and thumbnail path, `file://` is unnecessary.
  const filePath = "data/.../foo.mp4";
  const width = 100;
  const height = 100;
  const displayName = "bar.mp4";
  const thumbnailLocalPath = "data/.../zoo.jpg";
  const duration = 5;
  msg = ChatMessage.createVideoMessage(targetId, filePath, chatType, {
    displayName,
    thumbnailLocalPath,
    duration,
    width,
    height,
  });
} else if (messageType === ChatMessageType.VOICE) {
  // Construct a voice message. You need to set the filepath, display name, and duration of the audio file.
  // For the voice file path, `file://` is unnecessary.
  const filePath = "data/.../foo.wav";
  const displayName = "bar.mp4";
  const duration = 5;
  msg = ChatMessage.createVoiceMessage(targetId, filePath, chatType, {
    displayName,
    duration,
  });
} else {
  // Exceptions occur if the message type you set is not supported.
  throw new Error("Not implemented.");
}
// Implement ChatMessageCallback to listen for the message sending event. The result only indicates the result of this method call, not whether the message sending succeeds or fails.
ChatClient.getInstance()
  .chatManager.sendMessage(msg!, new ChatMessageCallback())
  .then(() => {
    // Print the log here if the method call succeeds.
    console.log("send message success.");
  })
  .catch((reason) => {
    // Print the log here if the method call fails.
    console.log("send message fail.", reason);
  });
```

### Send a message to online users only

Agora Chat supports delivering messages only to users that are currently online. An example of using this function is displaying the votes in a group voting: Only users that are online need to see the changes in real time, while the others only need the final result.

All types of messages in one-to-one chats and chat groups support this function. Compared to an ordinary message, a message that is delivered only to online users has the following differences:

- Does not support offline storage: If the recipient is offline when sending a message, the message cannot be received, even after logging in again. For ordinary messages, when the recipient is online, the message reminder is received in real time; when the recipient is offline, the offline push message is sent in real time. When the recipient is online again, the Chat server actively pushes the offline message to the client.
- Support local storage: After a message is successfully sent, it is added to the database.
- Roaming storage is not supported by default: Sent messages are not stored on the Chat message server by default, so users cannot obtain the messages on other devices. If you need to activate roaming storage of online messages, contact support@agora.io.

To deliver messages only to online users, set `ChatMessage#deliverOnlineOnly` to `true` when sending the message. The following is an example of sending a text message to only online users:

```typescript
// Create a text message, `content` is the text content of the message.
// `conversationId` is the message receiver. It is the peer user ID in a single chat and the group ID in a group chat.
// `conversationIdType` Conversation type: Single chat is ChatMessageChatType.PeerChat, group chat is ChatMessageChatType.GroupChat
// Whether the message is only delivered to online users. (Default) `false`: Delivered regardless of whether the user is online or not; `true`: Only delivered to online users. If the user is offline, the message will not be delivered.
const message = createTextMessage(conversationId, content, conversationIdType, {
   deliverOnlineOnly: true,
});
// Send a message.
ChatClient.getInstance().chatManager.sendMessage(msg, {
   onError: (localMsgId: string, error: ChatError) => {
     // Failed to send message
   },
   onSuccess: (message: ChatMessage) => {
     // Message sent successfully,
   },
});
```

### Set message priority

In high-concurrency use-cases, you can set a certain message type or messages from a chat room member as high, normal, or low priority.
In this case, low-priority messages are dropped first to reserve resources for the high-priority ones, for example, gifts and announcements, when the server is overloaded.
This ensures that the high-priority messages can be dealt with first when loads of messages are being sent in high concurrency or high frequency.
Note that this feature can increase the delivery reliability of high-priority messages, but cannot guarantee the deliveries.
Even high-priorities messages can be dropped when the server load goes too high.

You can set the priority for all types of messages in the chat room. See code example above.

### Receive the message

You can use `ChatMessageEventListener` to listen for message events. You can add multiple `ChatMessageEventListener` objects to listen for multiple events. When you no longer listen for an event, ensure that you remove the object.
When a message arrives, the recipient receives an `onMessgesReceived` callback. Each callback contains one or more messages. You can traverse the message list, and parse and render these messages in this callback.
```typescript
// Inherit and implement ChatMessageEventListener
class ChatMessageEvent implements ChatMessageEventListener {
  onMessagesReceived(messages: ChatMessage[]): void {
    console.log(`onMessagesReceived: `, messages);
  }
  onCmdMessagesReceived(messages: ChatMessage[]): void {
    console.log(`onCmdMessagesReceived: `, messages);
  }
  onMessagesRead(messages: ChatMessage[]): void {
    console.log(`onMessagesRead: `, messages);
  }
  onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
    console.log(`onGroupMessageRead: `, groupMessageAcks);
  }
  onMessagesDelivered(messages: ChatMessage[]): void {
    console.log(`onMessagesDelivered: ${messages.length}: `, messages);
  }
  onMessagesRecalled(messages: ChatMessage[]): void {
    console.log(`onMessagesRecalled: `, messages);
  }
  onConversationsUpdate(): void {
    console.log(`onConversationsUpdate: `);
  }
  onConversationRead(from: string, to?: string): void {
    console.log(`onConversationRead: `, from, to);
  }
}
// Listen for the message event.
const listener = new ChatMessageEvent();
ChatClient.getInstance().chatManager.addMessageListener(listener);
// Remove the specified message listener.
ChatClient.getInstance().chatManager.removeMessageListener(listener);
// Remove all the message listeners.
ChatClient.getInstance().chatManager.removeAllMessageListener();
```
### Recall a message

After a message is sent, you can recall it. The `recallMessage` method recalls a message that is saved both locally and on the server, whether it is a historical message, offline message or a roaming message on the server, or a message in the memory or local database of the message sender or recipient.

The default time limit for recalling a message is two minutes. You can extend this time frame to up to 7 days in [Agora Console](https://console.agora.io/v2). To do so, select a project that enables Agora Chat, then click **Configure** > **Features** > **Message recall**.

![message-recall](/images/im/message-recall.png)

:::info
1. Except CMD messages, you can recall all types of message. 2. If an attachment message, like an image, voice, video, or file message, is recalled, the attachment of the message is also deleted.
:::

```typescript
ChatClient.getInstance()
  .chatManager.recallMessage(this.state.lastMessage.msgId)
  .then(() => {
    console.log("recall message success");
  })
  .catch((reason) => {
    console.log("recall message fail.", reason);
  });
```
You can also use `ChatMessageEventListener` to listen for the state of recalling the message:
```typescript
// Occurs when the message is recalled.
onMessagesRecalled(messages: ChatMessage[]): void;
```

### Use message extensions

If the message types listed above do not meet your requirements, you can use message extensions to add attributes to the message. This can be applied in more complicated messaging use-cases.

```typescript
const msg = ChatMessage.createTextMessage(targetId, 'textmessage', chatType);
msg.attributes = {
  key: "value",
  {
    key2: 100
  }
};
EMClient.getInstance().chatManager().sendMessage(msg, callback).then().catch();

```

### Forward a single message

You can use the `ChatMessage#body` and `ChatMessage#attributes` property to create a message that is exactly the same as the original message by passing in the message body and extended fields of the original message (if any), and then call the `ChatManager#sendMessage` method to forward the message.

You can forward all types of messages in individual chats, chat groups, chat rooms, and sub-areas. For messages with attachments, there's no need to re-upload the attachments during forwarding.

However, if the original message expires (for example, deleted from the server due to storage limitations), the recipient can view the attachment address after forwarding but won't be able to download the attachment.

To forward a single message, refer to the following code:

```typescript
const msg: ChatMessage = ChatMessage.createTextMessage("A", "hello", 0); // Original message
const newMsg: ChatMessage = ChatMessage.createSendMessage({
   ...msg,
   targetId: "B",
   chatType: 0,
   isChatThread: false,
}); // New message
newMsg.body = msg.body;
newMsg.attributes = msg.attributes;
ChatClient.getInstance()
   .chatManager.sendMessage(newMsg, {
     onSuccess(message) {
       // Sent successfully
     },
     onError(localMsgId, error) {
       // Failed to send
     },
   } as ChatMessageStatusCallback)
   .catch();
```

### Forward multiple messages

Supported types for forwarded messages include text, images, audio & video files, attachment, and custom messages. A user can create a combined message with a list of original messages and send it. When receiving a combined message, the recipient can select it and other messages to create a new layered combined message. A combined message can contain up to 10 layers of messages, with at most 300 messages at each layer.

To forward and receive combined messages, refer to the following code:

1. Create a combined message using multiple message IDs:

    ```typescript
    // Construct a combined message.
    const msg = ChatMessage.createCombineMessage(targetId, msgIdList, chatType, {
      title,
      summary,
      compatibleText,
    });
    EMClient.getInstance().chatManager().sendMessage(msg, callback).then().catch();
    ```
2. Download and parse combined messages:

    ```typescript
    // message: The combined message object.
    // Asynchronously return the list of original messages.
    ChatClient.getInstance()
      .chatManager.fetchCombineMessageDetail(message)
      .then((messages: ChatMessage[]) => {
        console.log("success: ", messages);
      })
      .catch((error) => {
        console.log("fail: ", error);
      });
    ```

For further details see [Multiple messages forwarding limitations](../../limitations#multiple-messages-forwarding-limitations).

### Modify sent messages

Every end user or chat group member may edit messages that they have sent. The client API below, when called, will allow the SDK to modify a message.

There is no time limit for modifying a message, that is, it can be modified as long as the message is still stored on the server. After the message is modified, the message life cycle, that is, its storage time on the server, is recalculated. For example, a message can be stored on the server for 180 days, and the user modifies it on the 30th day after the message was sent. Instead of remaining 150 days, the message can be now stored on the server for 180 days after successful modification.

In the modified message, the message ID remains unchanged. Only the message content is edited and the following items are added:

* The operator ID of the user performing the action.
* The operation time that indicates when the message was edited.
* The number of times a message is edited (up to 10 times).

For the edited message, except the message body, other information included in the message like the message sender, recipient, and message extension attributes remain unchanged.

To modify a sent message, refer to the following code:
1. Call `modifyMessageBody` with the message ID and the new message body:
    ```typescript
    ChatClient.getInstance()
      .chatManager.modifyMessageBody(msgId, body)
      .then((message) => {
        console.log("modify success:", message);
      })
      .catch((error) => {
        console.warn(error);
      });
    ```
1. Receive notification of messages modified by other users:
    ```typescript
    ChatClient.getInstance().chatManager.addMessageListener({
      onMessageContentChanged: (
        message: ChatMessage,
        lastModifyOperatorId: string,
        lastModifyTime: number
      ): void => {
        console.log(
          `${QuickTestScreenChat.TAG}: onMessageContentChanged: `,
          JSON.stringify(message),
          lastModifyOperatorId,
          lastModifyTime
        );
      },
    } as ChatMessageEventListener);
    ```

For further details see [Sent message modification limitations](../../limitations#sent-message-modification-limitations).

### Windows

### Send a text message

Use the `Message` class to create a text message, and `IChannelManager` to send the message.

```csharp
// Call CreateTextSendMessage to create a text message.
// Set `content` as the content of the text message.
// Set `conversationId` to the user ID of the peer user in one-to-one chat, group ID in group chat, and chat room ID in room chat.
Message msg = Message.CreateTextSendMessage(conversationId, content);
// Set `MessageType` in `Message` as `Chat`, `Group`, or `Room` for one-to-one chat, group chat, or room chat.
msg.MessageType = MessageType.Group;
// Set the priority of chat room messages. The default priority is `RoomMessagePriority.Normal`, indicating the normal priority.
// msg.MessageType = MessageType.Room;
// msg.SetRoomMessagePriority(RoomMessagePriority.High);
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending.
// You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sending succeeds.");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

### Send a message to online users only

Agora Chat supports delivering messages only to users that are currently online. An example of using this function is displaying the votes in a group voting: Only users that are online need to see the changes in real time, while the others only need the final result.

All types of messages in one-to-one chats and chat groups support this function. Compared to an ordinary message, a message that is delivered only to online users has the following differences:

- Does not support offline storage: If the recipient is offline when sending a message, the message cannot be received, even after logging in again. For ordinary messages, when the recipient is online, the message reminder is received in real time; when the recipient is offline, the offline push message is sent in real time. When the recipient is online again, the Chat server actively pushes the offline message to the client.
- Support local storage: After a message is successfully sent, it is added to the database.
- Roaming storage is not supported by default: Sent messages are not stored on the Chat message server by default, so users cannot obtain the messages on other devices. If you need to activate roaming storage of online messages, contact support@agora.io.

To deliver messages only to online users, set `Message#deliverOnlineOnly` to `true` when sending the message. The following is an example of sending a text message to only online users:

```csharp
// Create a text message, `content` is the text content of the message.
// `conversationId` is the message receiver. It is the peer user ID in single chat and the group ID in group chat.
Message message = Message.CreateTextSendMessage(conversationId, content);
// Whether the message is only delivered to online users. (Default) `false`: Delivered regardless of whether the user is online or not; `true`: Only delivered to online users. If the user is offline, the message will not be delivered.
message.DeliverOnlineOnly = true;
// Conversation type: Single chat is MessageType.Chat, group chat is MessageType.Group, the default is single chat.
message.MessageType = MessageType.Chat;
// Send a message.
SDKClient.Instance.ChatManager.SendMessage(ref message, new CallBack(
    onSuccess: () => {
    },
    onError: (code, desc) => {
    }
));
```

### Set message priority

In high-concurrency use-cases, you can set a certain message type or messages from a chat room member as high, normal, or low priority.
In this case, low-priority messages are dropped first to reserve resources for the high-priority ones, for example, gifts and announcements, when the server is overloaded.
This ensures that the high-priority messages can be dealt with first when loads of messages are being sent in high concurrency or high frequency.
Note that this feature can increase the delivery reliability of high-priority messages, but cannot guarantee the deliveries.
Even high-priorities messages can be dropped when the server load goes too high.

You can set the priority for all types of messages in the chat room. See code example above.

### Receive a message

You can use `IChatManagerDelegate` to listen for message events. You can add multiple `IChatManagerDelegates` to listen for multiple events. When you no longer listen for an event, ensure that you remove the delegate.

When a message arrives, the recipient receives an `OnMessagesReceived` callback. Each callback contains one or more messages. You can traverse the message list, and parse and render these messages in this callback and render these messages.

```csharp
// Inherit and instantiate IChatManagerDelegate.
public class ChatManagerDelegate : IChatManagerDelegate {
    // Listen for OnMessagesReceived.
    public void OnMessagesReceived(List messages)
    {
      // Traverse the message list, and parse and render the messages.
    }
}
// Add the delegate to listen for message callback.
ChatManagerDelegate adelegate = new ChatManagerDelegate();
SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);
// Remove the delegate.
SDKClient.Instance.ChatManager.RemoveChatManagerDelegate(adelegate);
```

### Recall a message

After a message is sent, you can recall it. The `RecallMessage` method recalls a message that is saved both locally and on the server, whether it is a historical message, offline message or a roaming message on the server, or a message in the memory or local database of the message sender or recipient.

The default time limit for recalling a message is two minutes. You can extend this time frame to up to 7 days in [Agora Console](https://console.agora.io/v2). To do so, select a project that enables Agora Chat, then click **Configure** > **Features** > **Message recall**.

![message-recall](/images/im/message-recall.png)

:::info
1. Except CMD messages, you can recall all types of message. 2. If an attachment message, like an image, voice, video, or file message, is recalled, the attachment of the message is also deleted.
:::

```csharp
// Call `RecallMessage` to recall the message.
SDKClient.Instance.ChatManager.RecallMessage("Message ID", new CallBack(
  onSuccess: () => {
    Debug.Log("Message recall succeeds.");
  },
  onProgress: (progress) => {
    Debug.Log($"Message recall progress {progress}");
  },
  onError: (code, desc) => {
    Debug.Log($"Message recall fails, errCode={code}, errDesc={desc}");
  }
 ));
```

You can also use `IChatManagerDelegate` to listen for the message withdraw state:

```csharp
// The SDK triggers OnMessageRecalled when the message is withdrawn.
void OnMessagesRecalled(List messages);
```

### Send and receive an attachment message

Voice, image, video, and file messages are essentially attachment messages. This section introduces how to send these types of messages.

#### Send and receive a voice message

Before sending a voice message, you should implement audio recording on the app level, which provides the URI and duration of the recorded audio file.

Refer to the following code example to create and send a voice message:

```csharp
// Call CreateVoiceSendMessage to create a voice message.
// Set `localPath` as the path of the audio file on the local device, `displayName` as the display name of the message, `fileSize` as the size of the audio file, and `duration` as the duration (in seconds) of the audio file. For audio files, you can set `displayName` as "".
Message msg = Message.CreateVoiceSendMessage(toChatUsername, localPath, displayName, fileSize, duration);
// Set the message type using the `MessageType` attribute in `Message`.
// You can set `MessageType` as `Chat`, `Group`, or `Room`, which indicates whether to send the message to a peer user, a chat group, or a chat room.
msg.MessageType = MessageType.Group;
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending. You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sending succeeds.");
  },
  onProgress: (progress) => {
    Debug.Log($"Message sending progress {progress}");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId}Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

When the recipient receives the message, refer to the following code example to get the audio file:

```csharp
// "Message ID" is the ID of the message returned in the onSuccess callback after the SDK successfully sends the message.
Message msg = SDKClient.Instance.ChatManager.LoadMessage("Message ID");
if (msg != null)
{
  ChatSDK.MessageBody.VoiceBody vb = (ChatSDK.MessageBody.VoiceBody)msg.Body;
  // RemotePath indicates the path of the audio file on the server.
  string voiceRemoteUrl = vb.RemotePath;
  // LocalPath indicates the path of the audio file on the local device.
  string voiceLocalUri = vb.LocalPath;
}
else {
  Debug.Log($"Fails to find the message");
}
```

#### Send and receive an image message

By default, the SDK compresses the image file before sending it. To send the original file, you can set `original` as `true`.

Refer to the following code example to create and send an image message:

```csharp
// Create SendMessage to send the image message.
// Set `localPath` as the path of the image file on the local device, `displayName` as the display name of the message, `fileSize` as the size of the image file, `width` as the width (in pixels) of the thumbnail, and `height` as the height (in pixels) of the thumbnail.
// `original` indicates whether to send the original image file. The default value is `false`. By default, the SDK compresses image files the exceeds 100 KB and sends the thumbnail. To send the original image, set this parameter as `true`.
Message msg = Message.CreateImageSendMessage(toChatUsername,localPath, displayName, fileSize, original, width , height);
// Set the message type using the `MessageType` attribute in `Message`.
// You can set `MessageType` as `Chat`, `Group`, or `Room`, which indicates whether to send the message to a peer user, a chat group, or a chat room.
msg.MessageType = MessageType.Group;
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending. You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sends succeeds.");
  },
  onProgress: (progress) => {
    Debug.Log($"Message sending progress {progress}");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

When the recipient receives the message, refer to the following code example to get the thumbnail and attachment file of the image message:

```csharp
// "Message ID" is the ID of the message returned in the onSuccess callback after the SDK successfully sends the message.
Message msg = SDKClient.Instance.ChatManager.LoadMessage("Message ID");
if (msg != null)
{
  ChatSDK.MessageBody.ImageBody ib = (ChatSDK.MessageBody.ImageBody)msg.Body;
  // RemotePath indicates the path of the image file on the server.
  string imgRemoteUrl = ib.RemotePath;
  // ThumbnaiRemotePath indicates the path of the thumbnail on the server.
  string thumbnailUrl = ib.ThumbnaiRemotePath;
  // LocalPath indicates the path of the image file on the local device.
  string imgLocalUri = ib.LocalPath;
  // ThumbnailLocalPath indicates the path of the thumbnail on the local device.
  Uri thumbnailLocalUri = ib.ThumbnailLocalPath;
}
else {
  Debug.Log($"Fails to find the message.");
}
```

:::info
If `Options.IsAutoDownload` is set as `true` on the recipient's client, the SDK automatically downloads the thumbnail after receiving the message. If not, you need to call `SDKClient.Instance.ChatManager.DownloadThumbnail` to download the thumbnail and get the path from the `ThumbnailLocalPath` member in `msg.Body`.
:::

#### Send and receive a video message

Before sending a video message, you should implement video capturing on the app level, which provides the duration of the captured video file.

Refer to the following code example to create and send a video message:

```csharp
Message msg = Message.CreateVideoSendMessage(toChatUsername, localPath, displayName, thumbnailLocalPath, fileSize, duration, width, height);
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending. You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Messag sending succeeds");
  },
  onProgress: (progress) => {
    Debug.Log($"Message sending progress {progress}");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

By default, when the recipient receives the message, the SDK downloads the thumbnail of the video message.

If you do not want the SDK to automatically download the video thumbnail, set `Options.IsAutoDownload` as `false`, and to download the thumbnail, you need to call `SDKClient.Instance.ChatManager.DownloadThumbnail`, and get the path of the thumbnail from the `ThumbnailLocalPath` member in `msg.Body`.

To download the actual video file, call `SDKClient.Instance.ChatManager.DownloadAttachment`, and get the path of the video file from the `LocalPath` member in `msg.Body`.

```csharp
// When the recipient receives a video message, the SDK downloads and then open the video file.
SDKClient.Instance.ChatManager.DownloadAttachment("Message ID", new CallBack(
  onSuccess: () => {
    Debug.Log($"Attachment download succeeds.");
    Message msg = SDKClient.Instance.ChatManager.LoadMessage("Message ID");
    if (msg != null)
    {
      if (msg.Body.Type == ChatSDK.MessageBodyType.VIDEO) {
        ChatSDK.MessageBody.VideoBody vb = (ChatSDK.MessageBody.VideoBody)msg.Body;
        // LocalPath indicates the path of the video file on the local device.
        string videoLocalUri = vb.LocalPath;
        // You add open the video file after getting the path.
      }
    }
    else {
      Debug.Log($"Fails to find the message.");
    }
  },
  onProgress: (progress) => {
    Debug.Log($"Attachment download progress {progress}");
  },
  onError: (code, desc) => {
    Debug.Log($"Attachment download fails, errCode={code}, errDesc={desc}");
  }
));
```

#### Send and receive a file message

Refer to the following code example to create, send, and receive a file message:

```csharp
// Call CreateFileSendMessage to create a file message.
// Set `localPath` as the path of the file on the local device, `displayName` as the display name of the file message, and `fileSize` as the size of the file.
Message msg = Message.CreateFileSendMessage(toChatUsername,localPath, displayName, fileSize);
// Set the message type using the `MessageType` attribute in `Message`.
// You can set `MessageType` as `Chat`, `Group`, or `Room`, which indicates whether to send the message to a peer user, a chat group, or a chat room.
msg.MessageType = MessageType.Group;
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending. You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sending succeeds.");
  },
  onProgress: (progress) => {
    Debug.Log($"Message sending progress {progress}");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
// When the recipient receives the message, call `LoadMessage` to get the attachment file.
// "Message ID" is the ID of the message returned in the onSuccess callback after the SDK successfully sends the message.
Message msg = SDKClient.Instance.ChatManager.LoadMessage("Message ID");
if (msg != null)
{
  ChatSDK.MessageBody.FileBody fb = (ChatSDK.MessageBody.FileBody)msg.Body;
  // RemotePath indicates the path of the file on the server.
  string fileRemoteUrl = fb.RemotePath;
  // LocalPath indicates the path of the file on the local device.
  string fileLocalUri = fb.LocalPath;
}
else {
  Debug.Log($"Fails to find the message.");
}
```

### Send a location message

To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.

```csharp
// Call CreateLocationSendMessage to create a location message.
// Set `locationAddress` as the address of the location and `buildingName` as the the name of the building.
Message msg = Message.CreateLocationSendMessage(toChatUsername, latitude, longitude, locationAddress, buildingName);
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sending succeeds.");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

### Send and receive a CMD message

CMD messages are command messages that instruct a specified user to take a certain action. The recipient deals with the command messages themselves.

:::info
CMD messages are not stored in the local database.Actions beginning with `em_` and `easemob::` are internal fields. Do not use them.
:::

```csharp
// Use `action` to customize the message
string action = "actionXXX";
Message msg = Message.CreateCmdSendMessage(toChatUsername, action);
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
   onSuccess: () => {
      Debug.Log($"{msg.MsgId} Message sending succeeds.");
   },
   onError: (code, desc) => {
      Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
   }
));
```

To notify the recipient that a CMD message is received, use a separate delegate so that users can deal with the message differently.

```csharp
// Inherit and instantiate `IChatManagerDelegate`.
public class ChatManagerDelegate : IChatManagerDelegate {
    // Occurs when the message is received.
    public void OnMessagesReceived(List messages)
    {
      // Traverse, parse, and display the message.
    }
    // Occurs when a CMD message is received.
    void OnCmdMessagesReceived(List messages)
    {
      // Traverse, parse, and display the message.
    }
}
// Call AddChatManagerDelegate to add a message delegate.
ChatManagerDelegate adelegate = new ChatManagerDelegate()
SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);
```

### Send a customized message

The following code example shows how to create and send a customized message:

```csharp
// Set `event` as the customized message type, for example, gift.
string event = "gift";
Dictionary adict = new Dictionary();
adict.Add("key", "value");
// Call CreateCustomSendMessage to create a customized message.
Message msg = Message.CreateCustomSendMessage(toChatUsername, event, adict);
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
   onSuccess: () => {
      Debug.Log($"{msg.MsgId} Message sending succeeds.");
   },
   onError: (code, desc) => {
      Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
   }
));
```

### Use message extensions

If the message types listed above do not meet your requirements, you can use message extensions to add attributes to the message. This can be applied in more complicated messaging use-cases.

```csharp
Message msg = Message.CreateTextSendMessage(toChatUsername, content);
// Add message attributes.
AttributeValue attr1 = AttributeValue.Of("value", AttributeValueType.STRING);
AttributeValue attr2 = AttributeValue.Of(true, AttributeValueType.BOOL);
msg.Attributes.Add("attribute1", attr1);
msg.Attributes.Add("attribute2", attr2);
// Send the message.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId}发送成功");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId}发送失败，errCode={code}, errDesc={desc}");
  }
));
// When the recipient receives the message, get the extension attributes.
bool found = false;
string str = msg.GetAttributeValue(msg.Attributes, "attribute1", found);
if (found) {
  // Use variable str.
}
found = false；
bool b = msg.GetAttributeValue(msg.Attributes, "attribute2", found);
if (found) {
  // Use variable b.
}
```

### Forward a single message

You can use the `Message#CreateSendMessage` method and `Message#Attributes` property to create a message that is exactly the same as the original message by passing in the message body and extended fields of the original message (if any), and then call the `ChatManager#sendMessage` method to forward the message.

You can forward all types of messages in individual chats, chat groups, chat rooms, and sub-areas. For messages with attachments, there's no need to re-upload the attachments during forwarding.

However, if the original message expires (for example, deleted from the server due to storage limitations), the recipient can view the attachment address after forwarding but won't be able to download the attachment.

To forward a single message, refer to the following code:

```csharp
// messageId is the message ID to be forwarded.
// string messageId = "xxx";

// When a message is obtained based on the message ID, it will automatically contain the body content and extended attributes of the original message.
Message targetMessage = SDKClient.Instance.ChatManager.LoadMessage(messageId);

if (targetMessage != null)
{
     // to: Single chat is the peer user ID, group chat is the group ID, and chat room chat is the chat room ID.
     string to = "the conversationId you want to send to";

     // Create a new message based on the to and message body.
     Message newMessage = Message.CreateSendMessage(to, targetMessage.Body);
     newMessage.Attributes = targetMessage.Attributes;

     // The chat type defaults to single chat MessageType.Chat. For group chats or chat rooms, the MessageType needs to be set to MessageType.Group or MessageType.Room.
     // newMessage.MessageType = MessageType.Group;

     SDKClient.Instance.ChatManager.SendMessage(ref newMessage, new CallBack(
         onSuccess: () => {
         },
         onError: (code, desc) => {
         }
     ));
}
```

### Forward multiple messages

Supported types for forwarded messages include text, images, audio & video files, attachment, and custom messages. A user can create a combined message with a list of original messages and send it. When receiving a combined message, the recipient can select it and other messages to create a new layered combined message. A combined message can contain up to 10 layers of messages, with at most 300 messages at each layer.

To forward and receive combined messages, refer to the following code:

1. Create a combined message using multiple message IDs:

    ```csharp
    String title = "Historical messages for one-to-one chats between A and B";
    String summary = "A: These are historical messages from A. \nB: These are historical messages from B.";
    String compatibleText = "Your current version does not support this type of message. Please upgrade to the latest version.";
    Message msg = Message.CreateCombineSendMessage(to, title, summary, compatibleText, msgIdList);

    SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
        onSuccess: () => {
            // Handling logic upon sending success
        },
        onError: (code, desc) => {
            // Handling logic if sendMessage fails
        }
    ));
    ```

2. Download and parse combined messages:

    ```csharp
    SDKClient.Instance.ChatManager.FetchCombineMessageDetail(msg, new ValueCallBack>(
        onSuccess: (list) => {
            // Add the handling logic and show the message list
        },
        onError: (code, desc) => {
            // Handle an error
        }
    ));
    ```

For further details see [Multiple messages forwarding limitations](../../limitations#multiple-messages-forwarding-limitations).

### Modify sent messages

Every end user or chat group member may edit messages that they have sent. The client API below, when called, will allow the SDK to modify a message.

There is no time limit for modifying a message, that is, it can be modified as long as the message is still stored on the server. After the message is modified, the message life cycle, that is, its storage time on the server, is recalculated. For example, a message can be stored on the server for 180 days, and the user modifies it on the 30th day after the message was sent. Instead of remaining 150 days, the message can be now stored on the server for 180 days after successful modification.

In the modified message, the message ID remains unchanged. Only the message content is edited and the following items are added:

* The operator ID of the user performing the action.
* The operation time that indicates when the message was edited.
* The number of times a message is edited (up to 10 times).

For the edited message, except the message body, other information included in the message like the message sender, recipient, and message extension attributes remain unchanged.

To modify a sent message, refer to the following code:

1. Call `ModifyMessage` with the message ID and the new message body:

    ```csharp
    TextBody tb = new TextBody("new content");
    SDKClient.Instance.ChatManager.ModifyMessage(msgId, tb, new ValueCallBack(
         onSuccess: (dmsg) =>
         {

         },
         onError: (code, desc) =>
         {

         }
    ));
    ```

1. Receive notification of messages modified by other users:

    ```csharp
    // Inherit and implement `IChatManagerDelegate`.
    public class ChatManagerDelegate : IChatManagerDelegate {

        public void OnMessageContentChanged(Message msg, string operatorId, long operationTime)
        {
            // You can obtain operatorId and operationTime as follows:
            // string id = msg.Body.OperatorId;
            // long time = msg.Body.OperationTime;
        }
      }

    // Add a delegate.
    ChatManagerDelegate adelegate = new ChatManagerDelegate();
    SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);

    // Remove the delegate when it is no longer required.
    SDKClient.Instance.ChatManager.RemoveChatManagerDelegate(adelegate);
    ```

For further details see [Sent message modification limitations](../../limitations#sent-message-modification-limitations).

### Unity

### Send a text message

Use the `Message` class to create a text message, and `IChannelManager` to send the message.

```csharp
// Call CreateTextSendMessage to create a text message.
// Set `content` as the content of the text message.
// Set `conversationId` to the user ID of the peer user in one-to-one chat, group ID in group chat, and chat room ID in room chat.
Message msg = Message.CreateTextSendMessage(conversationId, content);
// Set `MessageType` in `Message` as `Chat`, `Group`, or `Room` for one-to-one chat, group chat, or room chat.
msg.MessageType = MessageType.Group;
// Set the priority of chat room messages. The default priority is `RoomMessagePriority.Normal`, indicating the normal priority.
// msg.MessageType = MessageType.Room;
// msg.SetRoomMessagePriority(RoomMessagePriority.High);
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending.
// You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sending succeeds.");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

### Send a message to online users only

Agora Chat supports delivering messages only to users that are currently online. An example of using this function is displaying the votes in a group voting: Only users that are online need to see the changes in real time, while the others only need the final result.

All types of messages in one-to-one chats and chat groups support this function. Compared to an ordinary message, a message that is delivered only to online users has the following differences:

- Does not support offline storage: If the recipient is offline when sending a message, the message cannot be received, even after logging in again. For ordinary messages, when the recipient is online, the message reminder is received in real time; when the recipient is offline, the offline push message is sent in real time. When the recipient is online again, the Chat server actively pushes the offline message to the client.
- Support local storage: After a message is successfully sent, it is added to the database.
- Roaming storage is not supported by default: Sent messages are not stored on the Chat message server by default, so users cannot obtain the messages on other devices. If you need to activate roaming storage of online messages, contact support@agora.io.

To deliver messages only to online users, set `Message#deliverOnlineOnly` to `true` when sending the message. The following is an example of sending a text message to only online users:

```csharp
// Create a text message, `content` is the text content of the message.
// `conversationId` is the message receiver. It is the peer user ID in single chat and the group ID in group chat.
Message message = Message.CreateTextSendMessage(conversationId, content);
// Whether the message is only delivered to online users. (Default) `false`: Delivered regardless of whether the user is online or not; `true`: Only delivered to online users. If the user is offline, the message will not be delivered.
message.DeliverOnlineOnly = true;
// Conversation type: Single chat is MessageType.Chat, group chat is MessageType.Group, the default is single chat.
message.MessageType = MessageType.Chat;
// Send a message.
SDKClient.Instance.ChatManager.SendMessage(ref message, new CallBack(
    onSuccess: () => {
    },
    onError: (code, desc) => {
    }
));
```

### Set message priority

In high-concurrency use-cases, you can set a certain message type or messages from a chat room member as high, normal, or low priority.
In this case, low-priority messages are dropped first to reserve resources for the high-priority ones, for example, gifts and announcements, when the server is overloaded.
This ensures that the high-priority messages can be dealt with first when loads of messages are being sent in high concurrency or high frequency.
Note that this feature can increase the delivery reliability of high-priority messages, but cannot guarantee the deliveries.
Even high-priorities messages can be dropped when the server load goes too high.

You can set the priority for all types of messages in the chat room. See code example above.

### Receive a message

You can use `IChatManagerDelegate` to listen for message events. You can add multiple `IChatManagerDelegates` to listen for multiple events. When you no longer listen for an event, ensure that you remove the delegate.

When a message arrives, the recipient receives an `OnMessagesReceived` callback. Each callback contains one or more messages. You can traverse the message list, and parse and render these messages in this callback and render these messages.

```csharp
// Inherit and instantiate IChatManagerDelegate.
public class ChatManagerDelegate : IChatManagerDelegate {
    // Listen for OnMessagesReceived.
    public void OnMessagesReceived(List messages)
    {
      // Traverse the message list, and parse and render the messages.
    }
}
// Add the delegate to listen for message callback.
ChatManagerDelegate adelegate = new ChatManagerDelegate();
SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);
// Remove the delegate.
SDKClient.Instance.ChatManager.RemoveChatManagerDelegate(adelegate);
```

### Recall a message

After a message is sent, you can recall it. The `RecallMessage` method recalls a message that is saved both locally and on the server, whether it is a historical message, offline message or a roaming message on the server, or a message in the memory or local database of the message sender or recipient.

The default time limit for recalling a message is two minutes. You can extend this time frame to up to 7 days in Agora Console. To do so, select a project that enables Agora Chat, then click **Configure** > **Features** > **Message recall**.

![message-recall](/images/im/message-recall.png)

:::info
1. Except CMD messages, you can recall all types of message. 2. If an attachment message, like an image, voice, video, or file message, is recalled, the attachment of the message is also deleted.
:::

```csharp
// Call `RecallMessage` to recall the message.
SDKClient.Instance.ChatManager.RecallMessage("Message ID", new CallBack(
  onSuccess: () => {
    Debug.Log("Message recall succeeds.");
  },
  onProgress: (progress) => {
    Debug.Log($"Message recall progress {progress}");
  },
  onError: (code, desc) => {
    Debug.Log($"Message recall fails, errCode={code}, errDesc={desc}");
  }
 ));
```

You can also use `IChatManagerDelegate` to listen for the message withdraw state:

```csharp
// The SDK triggers OnMessageRecalled when the message is withdrawn.
void OnMessagesRecalled(List messages);
```

### Send and receive an attachment message

Voice, image, video, and file messages are essentially attachment messages. This section introduces how to send these types of messages.

#### Send and receive a voice message

Before sending a voice message, you should implement audio recording on the app level, which provides the URI and duration of the recorded audio file.

Refer to the following code example to create and send a voice message:

```csharp
// Call CreateVoiceSendMessage to create a voice message.
// Set `localPath` as the path of the audio file on the local device, `displayName` as the display name of the message, `fileSize` as the size of the audio file, and `duration` as the duration (in seconds) of the audio file. For audio files, you can set `displayName` as "".
Message msg = Message.CreateVoiceSendMessage(toChatUsername, localPath, displayName, fileSize, duration);
// Set the message type using the `MessageType` attribute in `Message`.
// You can set `MessageType` as `Chat`, `Group`, or `Room`, which indicates whether to send the message to a peer user, a chat group, or a chat room.
msg.MessageType = MessageType.Group;
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending. You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sending succeeds.");
  },
  onProgress: (progress) => {
    Debug.Log($"Message sending progress {progress}");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId}Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

When the recipient receives the message, refer to the following code example to get the audio file:

```csharp
// "Message ID" is the ID of the message returned in the onSuccess callback after the SDK successfully sends the message.
Message msg = SDKClient.Instance.ChatManager.LoadMessage("Message ID");
if (msg != null)
{
  ChatSDK.MessageBody.VoiceBody vb = (ChatSDK.MessageBody.VoiceBody)msg.Body;
  // RemotePath indicates the path of the audio file on the server.
  string voiceRemoteUrl = vb.RemotePath;
  // LocalPath indicates the path of the audio file on the local device.
  string voiceLocalUri = vb.LocalPath;
}
else {
  Debug.Log($"Fails to find the message");
}
```

#### Send and receive an image message

By default, the SDK compresses the image file before sending it. To send the original file, you can set `original` as `true`.

Refer to the following code example to create and send an image message:

```csharp
// Create SendMessage to send the image message.
// Set `localPath` as the path of the image file on the local device, `displayName` as the display name of the message, `fileSize` as the size of the image file, `width` as the width (in pixels) of the thumbnail, and `height` as the height (in pixels) of the thumbnail.
// `original` indicates whether to send the original image file. The default value is `false`. By default, the SDK compresses image files the exceeds 100 KB and sends the thumbnail. To send the original image, set this parameter as `true`.
Message msg = Message.CreateImageSendMessage(toChatUsername,localPath, displayName, fileSize, original, width , height);
// Set the message type using the `MessageType` attribute in `Message`.
// You can set `MessageType` as `Chat`, `Group`, or `Room`, which indicates whether to send the message to a peer user, a chat group, or a chat room.
msg.MessageType = MessageType.Group;
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending. You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sends succeeds.");
  },
  onProgress: (progress) => {
    Debug.Log($"Message sending progress {progress}");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

When the recipient receives the message, refer to the following code example to get the thumbnail and attachment file of the image message:

```csharp
// "Message ID" is the ID of the message returned in the onSuccess callback after the SDK successfully sends the message.
Message msg = SDKClient.Instance.ChatManager.LoadMessage("Message ID");
if (msg != null)
{
  ChatSDK.MessageBody.ImageBody ib = (ChatSDK.MessageBody.ImageBody)msg.Body;
  // RemotePath indicates the path of the image file on the server.
  string imgRemoteUrl = ib.RemotePath;
  // ThumbnaiRemotePath indicates the path of the thumbnail on the server.
  string thumbnailUrl = ib.ThumbnaiRemotePath;
  // LocalPath indicates the path of the image file on the local device.
  string imgLocalUri = ib.LocalPath;
  // ThumbnailLocalPath indicates the path of the thumbnail on the local device.
  Uri thumbnailLocalUri = ib.ThumbnailLocalPath;
}
else {
  Debug.Log($"Fails to find the message.");
}
```

:::info
If `Options.IsAutoDownload` is set as `true` on the recipient's client, the SDK automatically downloads the thumbnail after receiving the message. If not, you need to call `SDKClient.Instance.ChatManager.DownloadThumbnail` to download the thumbnail and get the path from the `ThumbnailLocalPath` member in `msg.Body`.
:::

#### Send and receive a video message

Before sending a video message, you should implement video capturing on the app level, which provides the duration of the captured video file.

Refer to the following code example to create and send a video message:

```csharp
Message msg = Message.CreateVideoSendMessage(toChatUsername, localPath, displayName, thumbnailLocalPath, fileSize, duration, width, height);
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending. You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Messag sending succeeds");
  },
  onProgress: (progress) => {
    Debug.Log($"Message sending progress {progress}");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

By default, when the recipient receives the message, the SDK downloads the thumbnail of the video message.

If you do not want the SDK to automatically download the video thumbnail, set `Options.IsAutoDownload` as `false`, and to download the thumbnail, you need to call `SDKClient.Instance.ChatManager.DownloadThumbnail`, and get the path of the thumbnail from the `ThumbnailLocalPath` member in `msg.Body`.

To download the actual video file, call `SDKClient.Instance.ChatManager.DownloadAttachment`, and get the path of the video file from the `LocalPath` member in `msg.Body`.

```csharp
// When the recipient receives a video message, the SDK downloads and then open the video file.
SDKClient.Instance.ChatManager.DownloadAttachment("Message ID", new CallBack(
  onSuccess: () => {
    Debug.Log($"Attachment download succeeds.");
    Message msg = SDKClient.Instance.ChatManager.LoadMessage("Message ID");
    if (msg != null)
    {
      if (msg.Body.Type == ChatSDK.MessageBodyType.VIDEO) {
        ChatSDK.MessageBody.VideoBody vb = (ChatSDK.MessageBody.VideoBody)msg.Body;
        // LocalPath indicates the path of the video file on the local device.
        string videoLocalUri = vb.LocalPath;
        // You add open the video file after getting the path.
      }
    }
    else {
      Debug.Log($"Fails to find the message.");
    }
  },
  onProgress: (progress) => {
    Debug.Log($"Attachment download progress {progress}");
  },
  onError: (code, desc) => {
    Debug.Log($"Attachment download fails, errCode={code}, errDesc={desc}");
  }
));
```

#### Send and receive a file message

Refer to the following code example to create, send, and receive a file message:

```csharp
// Call CreateFileSendMessage to create a file message.
// Set `localPath` as the path of the file on the local device, `displayName` as the display name of the file message, and `fileSize` as the size of the file.
Message msg = Message.CreateFileSendMessage(toChatUsername,localPath, displayName, fileSize);
// Set the message type using the `MessageType` attribute in `Message`.
// You can set `MessageType` as `Chat`, `Group`, or `Room`, which indicates whether to send the message to a peer user, a chat group, or a chat room.
msg.MessageType = MessageType.Group;
// Call SendMessage to send the message.
// When sending the message, you can instantiate a `Callback` object to listen for the result of the message sending. You can also update the message state in this callback, for example, by adding a pop-up box that reminds the message sending fails.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sending succeeds.");
  },
  onProgress: (progress) => {
    Debug.Log($"Message sending progress {progress}");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
// When the recipient receives the message, call `LoadMessage` to get the attachment file.
// "Message ID" is the ID of the message returned in the onSuccess callback after the SDK successfully sends the message.
Message msg = SDKClient.Instance.ChatManager.LoadMessage("Message ID");
if (msg != null)
{
  ChatSDK.MessageBody.FileBody fb = (ChatSDK.MessageBody.FileBody)msg.Body;
  // RemotePath indicates the path of the file on the server.
  string fileRemoteUrl = fb.RemotePath;
  // LocalPath indicates the path of the file on the local device.
  string fileLocalUri = fb.LocalPath;
}
else {
  Debug.Log($"Fails to find the message.");
}
```

### Send a location message

To send and receive a location message, you need to integrate a third-party map service provider. When sending a location message, you get the longitude and latitude information of the location from the map service provider; when receiving a location message, you extract the received longitude and latitude information and displays the location on the third-party map.

```csharp
// Call CreateLocationSendMessage to create a location message.
// Set `locationAddress` as the address of the location and `buildingName` as the the name of the building.
Message msg = Message.CreateLocationSendMessage(toChatUsername, latitude, longitude, locationAddress, buildingName);
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId} Message sending succeeds.");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
  }
));
```

### Send and receive a CMD message

CMD messages are command messages that instruct a specified user to take a certain action. The recipient deals with the command messages themselves.

:::info
CMD messages are not stored in the local database.Actions beginning with `em_` and `easemob::` are internal fields. Do not use them.
:::

```csharp
// Use `action` to customize the message
string action = "actionXXX";
Message msg = Message.CreateCmdSendMessage(toChatUsername, action);
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
   onSuccess: () => {
      Debug.Log($"{msg.MsgId} Message sending succeeds.");
   },
   onError: (code, desc) => {
      Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
   }
));
```

To notify the recipient that a CMD message is received, use a separate delegate so that users can deal with the message differently.

```csharp
// Inherit and instantiate `IChatManagerDelegate`.
public class ChatManagerDelegate : IChatManagerDelegate {
    // Occurs when the message is received.
    public void OnMessagesReceived(List messages)
    {
      // Traverse, parse, and display the message.
    }
    // Occurs when a CMD message is received.
    void OnCmdMessagesReceived(List messages)
    {
      // Traverse, parse, and display the message.
    }
}
// Call AddChatManagerDelegate to add a message delegate.
ChatManagerDelegate adelegate = new ChatManagerDelegate()
SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);
```

### Send a customized message

The following code example shows how to create and send a customized message:

```csharp
// Set `event` as the customized message type, for example, gift.
string event = "gift";
Dictionary adict = new Dictionary();
adict.Add("key", "value");
// Call CreateCustomSendMessage to create a customized message.
Message msg = Message.CreateCustomSendMessage(toChatUsername, event, adict);
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
   onSuccess: () => {
      Debug.Log($"{msg.MsgId} Message sending succeeds.");
   },
   onError: (code, desc) => {
      Debug.Log($"{msg.MsgId} Message sending fails, errCode={code}, errDesc={desc}");
   }
));
```

### Use message extensions

If the message types listed above do not meet your requirements, you can use message extensions to add attributes to the message. This can be applied in more complicated messaging use-cases.

```csharp
Message msg = Message.CreateTextSendMessage(toChatUsername, content);
// Add message attributes.
AttributeValue attr1 = AttributeValue.Of("value", AttributeValueType.STRING);
AttributeValue attr2 = AttributeValue.Of(true, AttributeValueType.BOOL);
msg.Attributes.Add("attribute1", attr1);
msg.Attributes.Add("attribute2", attr2);
// Send the message.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
  onSuccess: () => {
    Debug.Log($"{msg.MsgId}发送成功");
  },
  onError:(code, desc) => {
    Debug.Log($"{msg.MsgId}发送失败，errCode={code}, errDesc={desc}");
  }
));
// When the recipient receives the message, get the extension attributes.
bool found = false;
string str = Message.GetAttributeValue(msg.Attributes, "attribute1", out found);
if (found) {
  // Use variable str.
}
found = false；
bool b = Message.GetAttributeValue(msg.Attributes, "attribute2", out found);
if (found) {
  // Use variable b.
}
```

### Forward a single message

You can use the `Message#CreateSendMessage` method and `Message#Attributes` property to create a message that is exactly the same as the original message by passing in the message body and extended fields of the original message (if any), and then call the `ChatManager#sendMessage` method to forward the message.

You can forward all types of messages in individual chats, chat groups, chat rooms, and sub-areas. For messages with attachments, there's no need to re-upload the attachments during forwarding.

However, if the original message expires (for example, deleted from the server due to storage limitations), the recipient can view the attachment address after forwarding but won't be able to download the attachment.

To forward a single message, refer to the following code:

```csharp
// messageId is the message ID to be forwarded.
// string messageId = "xxx";

// When a message is obtained based on the message ID, it will automatically contain the body content and extended attributes of the original message.
Message targetMessage = SDKClient.Instance.ChatManager.LoadMessage(messageId);

if (targetMessage != null)
{
     // to: Single chat is the peer user ID, group chat is the group ID, and chat room chat is the chat room ID.
     string to = "the conversationId you want to send to";

     // Create a new message based on the to and message body.
     Message newMessage = Message.CreateSendMessage(to, targetMessage.Body);
     newMessage.Attributes = targetMessage.Attributes;

     // The chat type defaults to single chat MessageType.Chat. For group chats or chat rooms, the MessageType needs to be set to MessageType.Group or MessageType.Room.
     // newMessage.MessageType = MessageType.Group;

     SDKClient.Instance.ChatManager.SendMessage(ref newMessage, new CallBack(
         onSuccess: () => {
         },
         onError: (code, desc) => {
         }
     ));
}
```

### Forward multiple messages

Supported types for forwarded messages include text, images, audio & video files, attachment, and custom messages. A user can create a combined message with a list of original messages and send it. When receiving a combined message, the recipient can select it and other messages to create a new layered combined message. A combined message can contain up to 10 layers of messages, with at most 300 messages at each layer.

To forward and receive combined messages, refer to the following code:

1. Create a combined message using multiple message IDs:

    ```csharp
    String title = "Historical messages for one-to-one chats between A and B";
    String summary = "A: These are historical messages from A. \nB: These are historical messages from B.";
    String compatibleText = "Your current version does not support this type of message. Please upgrade to the latest version.";
    Message msg = Message.CreateCombineSendMessage(to, title, summary, compatibleText, msgIdList);

    SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
        onSuccess: () => {
            // Handling logic upon sending success
        },
        onError: (code, desc) => {
            // Handling logic if sendMessage fails
        }
    ));
    ```

2. Download and parse combined messages:

    ```csharp
    SDKClient.Instance.ChatManager.FetchCombineMessageDetail(msg, new ValueCallBack>(
        onSuccess: (list) => {
            // Add the handling logic and show the message list
        },
        onError: (code, desc) => {
            // Handle an error
        }
    ));
    ```

For further details see [Multiple messages forwarding limitations](../../limitations#multiple-messages-forwarding-limitations).

### Modify sent messages

Every end user or chat group member may edit messages that they have sent. The client API below, when called, will allow the SDK to modify a message.

There is no time limit for modifying a message, that is, it can be modified as long as the message is still stored on the server. After the message is modified, the message life cycle, that is, its storage time on the server, is recalculated. For example, a message can be stored on the server for 180 days, and the user modifies it on the 30th day after the message was sent. Instead of remaining 150 days, the message can be now stored on the server for 180 days after successful modification.

In the modified message, the message ID remains unchanged. Only the message content is edited and the following items are added:

* The operator ID of the user performing the action.
* The operation time that indicates when the message was edited.
* The number of times a message is edited (up to 10 times).

For the edited message, except the message body, other information included in the message like the message sender, recipient, and message extension attributes remain unchanged.

To modify a sent message, refer to the following code:

1. Call `ModifyMessage` with the message ID and the new message body:

    ```csharp
    TextBody tb = new TextBody("new content");
    SDKClient.Instance.ChatManager.ModifyMessage(msgId, tb, new ValueCallBack(
        onSuccess: (dmsg) =>
        {

        },
        onError: (code, desc) =>
        {

        }
    ));
    ```

1. Receive notification of messages modified by other users:

    ```csharp
    // Inherit and implement `IChatManagerDelegate`.
    public class ChatManagerDelegate : IChatManagerDelegate {

        public void OnMessageContentChanged(Message msg, string operatorId, long operationTime)
        {
            // You can obtain operatorId and operationTime as follows:
            // string id = msg.Body.OperatorId;
            // long time = msg.Body.OperationTime;
        }
      }

    // Add a delegate.
    ChatManagerDelegate adelegate = new ChatManagerDelegate();
    SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);

    // Remove the delegate when it is no longer required
    SDKClient.Instance.ChatManager.RemoveChatManagerDelegate(adelegate);
    ```

For further details see [Sent message modification limitations](../../limitations#sent-message-modification-limitations).

## Next steps

After implementing sending and receiving messages, you can refer to the following documents to add more messaging functionalities to your app:

### All except Web

- [Manage local messages](./manage-messages)

- [Retrieve conversations and messages from the server](./retrieve-messages)
- [Message receipts](./message-receipts)
