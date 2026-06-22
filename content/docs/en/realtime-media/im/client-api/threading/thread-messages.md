---
title: "Thread messages"
description: "Show how to use the Agora Chat SDK to send, receive, recall, and retrieve thread messages in your app."
---

Threads enable users to create a separate conversation from a specific message within a chat group to keep the main chat uncluttered.

This page shows how to use the Chat SDK to send, receive, recall, and retrieve thread messages in your app.

## Understand the tech

### Android

The Chat SDK provides the `ChatManager`, `ChatMessage`, and `ChatThread` classes for thread messages, which allows you to implement the following features:

### iOS

The Chat SDK provides the `AgoraChatManager`, `AgoraChatMessage`, and `AgoraChatThread` classes for thread messages, which allows you to implement the following features:

### Web

The Chat SDK allows you to implement the following features:

### Flutter

The Chat SDK provides the `ChatThreadManager`, `ChatMessage`, and `ChatThread` classes for thread messages, which allows you to implement the following features:

### React Native

The Chat SDK provides the `ChatManager`, `ChatMessage`, and `ChatMessageThread` classes for thread messages, which allows you to implement the following features:

### Unity

The Agora Chat SDK allows you to implement the following features:

### Windows

The Agora Chat SDK allows you to implement the following features:

- Send a thread message
- Receive a thread message
- Recall a thread message
- Retrieve thread messages

The following figure shows the workflow of how clients send and receive peer-to-peer messages.

Thread messages workflow

![Thread Messages](/images/im/thread-messages.png)

As shown in the figure, the workflow of peer-to-peer messaging is as follows:

1. Clients retrieve a token from your app server.
2. Client A and Client B log in to Chat.
3. Client A sends a message to Client B. The message is sent to the Chat server and the server delivers the message to Client B. When Client B receives the message, the SDK triggers an event. Client B listens for the event and gets the message.

## Prerequisites

Before proceeding, ensure that you meet the following requirements:

- You have initialized the Chat SDK. For details, see [SDK quickstart](../../get-started/get-started-sdk).
- You understand the call frequency limit of the Chat APIs supported by different pricing plans as described in [Limitations](../../reference/limitations).

:::info
The thread feature is supported by all types of [Pricing Plans](../../reference/pricing-plan-details) and is enabled by default once you have enabled Chat in [Agora Console](https://console.agora.io/v2).
:::

## Implementation

This section describes how to call the APIs provided by the Chat SDK to implement thread features.

### Android

### Send a thread message

Sending a thread message is similar to sending a message in a chat group. The difference lies in the `isChatThreadMessage` field, as shown in the following code sample:

```java
// Calls `createTxtSendMessage` to create a text message. 
// Sets `content` to the content of the text message.
// Sets `chatThreadId` to the thread ID.
ChatMessage message = ChatMessage.createTxtSendMessage(content, chatThreadId); 
// Sets `ChatType` to `GroupChat` as a thread belongs to a chat group.
message.setChatType(ChatType.GroupChat); 
// Sets `isChatThreadMessage` to `true` to mark this message as a thread message.
message.setIsChatThreadMessage(true);
// Calls `setMessageStatusCallback` to listen for the message sending status. You can implement subsequent settings in this callback, for example, displaying a pop-up if the message sending fails.
message.setMessageStatusCallback(new CallBack() {
     @Override
     public void onSuccess() {
        showToast("The message is successfully sent");
     }
     @Override
     public void onError(int code, String error) {
         showToast("Failed to send the message");
     }
     @Override
     public void onProgress(int progress, String status) {
     }
});
// Calls `sendMessage` to send the text message.
ChatClient.getInstance().chatManager().sendMessage(message);
```

For more information about sending a message, see [Send Messages](../messages/send-receive-messages#send-a-text-message).

### Receive a thread message

Once a thread has a new message, all chat group members receive the `ChatThreadChangeListener#onChatThreadUpdated` callback. Thread members can also listen for the `MessageListener#onMessageReceived` callback to receive thread messages, as shown in the following code sample:

```java
MessageListener msgListener = new MessageListener() {
   // The SDK triggers the `onMessageReceived` callback when it receives a message.
   // After receiving this callback, the SDK parses the message and displays it.
   @Override
   public void onMessageReceived(List messages) {
       for (ChatMessage message : messages) {
           if(message.isChatThreadMessage()) {
               // You can implement subsequent settings in this callback.
           }
       }
   }
   ...
};
// Calls `addMessageListener` to add a message listener.
ChatClient.getInstance().chatManager().addMessageListener(msgListener);
// Calls `removeMessageListener` to remove the message listener.
ChatClient.getInstance().chatManager().removeMessageListener(msgListener);
```

For more information about receiving a message, see [Receive Messages](../messages/send-receive-messages#receive-a-message).

### Recall a thread message

For details about how to recall a message, refer to [Recall Messages](../messages/send-receive-messages#recall-a-message).

Once a message is recalled in a thread, all chat group members receive the `ChatThreadChangeListener#onChatThreadUpdated` callback. Thread members can also listen for the `MessageListener#onMessageRecalled` callback, as shown in the following code sample:

```java
MessageListener msgListener = new MessageListener() {
   // The SDK triggers the `onMessageRecalled` callback when it recalls a message.
   // After receiving this callback, the SDK parses the message and updates its display.
   @Override
   public void onMessageRecalled(List messages) {
       for (ChatMessage message : messages) {
           if(message.isChatThreadMessage()) {
               // You can implement subsequent settings in this callback.
           }
       }
   }
   ...
};
```

### Retrieve thread messages

You can retrieve thread messages locally or from the server, depending on your production environment.

You can check `ChatConversation#isChatThread()` to determine whether the current conversation is a thread conversation.

#### Retrieve messages of a thread from the server

You can call `asyncFetchHistoryMessage` to retrieve messages of a thread from the server. The only difference between retrieving messages of a thread from the server and retrieving group messages is that a thread ID needs to be passed in for the former and a group ID is required for the latter.

```java
String chatThreadId = "{your chatThreadId}";
Conversation.ConversationType type = Conversation.ConversationType.GroupChat;
int pageSize = 10;
String startMsgId = "";// Starting message ID for retrieving. If you pass in an empty string, the SDK will retrieve messages according to the search direction while ignoring this parameter.
Conversation.SearchDirection direction = Conversation.SearchDirection.DOWN;

ChatClient.getInstance().chatManager().asyncFetchHistoryMessage(chatThreadId, type,
        pageSize, startMsgId, direction, new ValueCallBack>() {
    @Override
    public void onSuccess(CursorResult value) {

    }

    @Override
    public void onError(int error, String errorMsg) {

    }
});
```

#### Retrieve messages of a thread locally

By calling [`loadAllConversations`](../messages/manage-messages#retrieve-conversations), you can only retrieve local one-to-one chat conversations and group conversations. To retrieve messages of a thread locally, refer to the following code sample:

```java
// Sets the conversation type to group chat as a thread belongs to a chat group.
// Sets `isChatThread` to `true` to mark the conversation as a thread.
ChatConversation conversation = ChatClient.getInstance().chatManager().getConversation(chatThreadId, ChatConversationType.GroupChat, createIfNotExists, isChatThread);
// Retrieves messages in the specified thread from the local database. The SDK automatically loads and stores the retrieved messages to the memory.
List messages = conversation.loadMoreMsgFromDB(startMsgId, pagesize, searchDirection);
```

### iOS

### Send a thread message

Sending a thread message is similar to sending a message in a chat group. The difference lies in the `isChatThread` field, as shown in the following code sample:

```objc
// Calls `initWithConversationID` to create a text message. 
// Sets `*message` to the content of the text message.
// Sets `chatThreadId` to the thread ID.
NSString *from = [[AgoraChatClient sharedClient] currentUsername];
NSString *chatThreadId = self.currentConversation.conversationId;
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:chatThreadId from:from to:chatThreadId body:aBody ext:aExt];
// Specifies whether a read receipt is required for this text message.
if([aExt objectForKey:MSG_EXT_READ_RECEIPT]) {
    message.isNeedGroupAck = YES;
}
// Sets `chatType` to `AgoraChatTypeGroupChat` as a thread belongs to a chat group.
message.chatType = (AgoraChatType)self.conversationType;
// Sets `isChatThread` to `YES` to mark this message as a thread message.
message.isChatThreadMessage = self.isChatThread;
// Calls `sendMessage` to send the text message.
[[AgoraChatClient sharedClient].chatManager sendMessage:message progress:nil completion:^(AgoraChatMessage *message, AgoraChatError *error) {

}];
```

For more information about sending a message, see [Send Messages](../messages/send-receive-messages#send-a-text-message).

### Receive a thread message

Once a thread has a new message, all chat group members receive the `AgoraChatThreadManagerDelegate#onChatThreadUpdated` callback. Thread members can also listen for the `AgoraChatManagerDelegate#messagesDidReceive` callback to receive thread messages, as shown in the following code sample:

```objc
// The SDK triggers the `messagesDidReceive` callback when it receives a message.
// After receiving this callback, the SDK parses the message and displays it.
- (void)messagesDidReceive:(NSArray *)aMessages
{
    // You can implement subsequent settings in this callback.
}
// Calls `addDelegate` to add a message listener.
[[AgoraChatClient sharedClient].chatManager addDelegate:self delegateQueue:nil];
// Calls `removeDelegate` to remove the message listener.
[[AgoraChatClient sharedClient].chatManager removeDelegate:self];
```

For more information about receiving a message, see [Receive Messages](../messages/send-receive-messages#receive-a-message).

### Recall a thread message

For details about how to recall a message, refer to [Recall Messages](../messages/send-receive-messages#recall-a-message).

Once a message is recalled in a thread, all chat group members receive the `AgoraChatThreadManagerDelegate#onChatThreadUpdated` callback. Thread members can also listen for the `AgoraChatManagerDelegate#messagesInfoDidRecall` callback, as shown in the following code sample:

```objc
// The SDK triggers the `messagesInfoDidRecall` callback when it recalls a message.
// After receiving this callback, the SDK parses the message and updates its display.
- (void)messagesInfoDidRecall:(NSArray *)aRecallMessagesInfo
{}
```

### Retrieve thread messages

You can retrieve thread messages locally or from the server, depending on your production environment.

You can check `AgoraChatConversation#isChatThread()` to determine whether the current conversation is a thread conversation.

#### Retrieve messages of a thread from the server

You can call `asyncFetchHistoryMessagesFromServer` to retrieve messages of a thread from the server. The only difference between retrieving messages of a thread from the server and retrieving group messages is that a thread ID needs to be passed in for the former and a group ID is required for the latter.

```objc
[AgoraChatClient.sharedClient.chatManager asyncFetchHistoryMessagesFromServer:@"threadId" conversationType:AgoraChatConversationTypeGroupChat startMessageId:@"" fetchDirection:AgoraChatMessageFetchHistoryDirectionUp pageSize:20 completion:^(AgoraChatCursorResult * _Nullable aResult, AgoraChatError * _Nullable aError) {

    }];
```
#### Retrieve messages of a thread locally

By calling [`getAllConversations`](../messages/manage-messages#retrieve-conversations), you can only retrieve local one-to-one chat conversations and group conversations. To retrieve messages of a thread locally, refer to the following code sample:
```objc
AgoraChatConversation *conversation = [AgoraChatClient.sharedClient.chatManager getConversation:@"threadId" type:AgoraChatConversationTypeGroupChat createIfNotExist:NO isThread:YES];
[conversation loadMessagesStartFromId:msgId count:50 searchDirection:AgoraChatMessageSearchDirectionUp completion:^(NSArray *aMessages, AgoraChatError *aError) {
}];
```

### Web

### Send a thread message

Send a thread message is similar to send a message in a chat group. The difference lies in the `isChatThread` field, as shown in the following code sample:

```javascript
function sendTextMessage() {
    let option = {
        chatType: 'groupChat',     // Sets `chatType` to `groupChat` as a thread belongs to a chat group.
        type: 'txt',               // Sets `type` to `txt` to create and send a text message.
        to: chatThreadId,          // Sets `to` to the thread ID.
        msg: 'message content',    // Sets `msg` to the content of the text message.
        isChatThread:true,         // Sets `isChatThread` to `true` to mark this message as a thread message.
    }
    // Calls `create` to create a text message.
    let msg = WebIM.message.create(option); 
    // Calls `send` to send the text message.
    conn.send(msg).then(() => {
        console.log('send private text Success');  
    }).catch((e) => {
        console.log("Send private text error");  
    })
};
```

For more information about sending a message, see [Send Messages](../messages/send-receive-messages#send-a-text-message).

### Receive a thread message

Once a thread has a new message, all chat group members receive the `onChatThreadChange` callback triggered by the `update` event. Thread members can also listen for the `onTextMessage` callback to receive thread messages, as shown in the following code sample:

```javascript
// The SDK triggers the `onTextMessage` callback when it receives a message.
// After receiving this callback, the SDK parses the message and displays it.
connection.addEventHandler('THREADMESSAGE',{
  onTextMessage:(message) =>{
			if(message.chatThread && JSON.stringify(message.chatThread)!=='{}'){
        console.log(message)
        // You can implement subsequent settings in this callback.
      }
	},
});
```

For more information about receiving a message, see [Receive Messages](../messages/send-receive-messages#receive-a-message).

### Recall a thread message

Once a message is recalled in a thread, all chat group members receive the `onChatThreadChange` callback triggered by the `update` event. Thread members can also listen for the `onRecallMessage` callback, as shown in the following code sample:
```javascript
let option = {
  mid: 'msgId',           // The ID of the message to be recalled.
  to: 'chatThreadId',           // The username of the message receiver.
  chatType: 'groupChat'   // Sets `chatType` to `groupChat` as a thread belongs to a chat group.
  isChatThread: true      // Sets `isChatThread` to `true` to mark this message as a thread message.
};
// Calls `recallMessage` to recall a message.
connection.recallMessage(option).then((res) => {
  console.log('success', res)
}).catch((error) => {
  // Occurs when the message fails to be recalled within the default time limit of two minutes.
  console.log('fail', error)
})
// The SDK triggers the `onRecallMessage` callback when it recalls a message.
// After receiving this callback, the SDK parses the message and updates its display.
conn.addEventHandler('MESSAGES',{
   onRecallMessage: (msg) => {
       // You can implement subsequent settings in this callback.
   	   console.log('Message recall succeeds.'，msg) 
   }, 
})
```

For more information about recalling a message, see [Recall Messages](../messages/send-receive-messages#recall-a-message).

### Retrieve messages of a thread from the server

You can call `ChatManager#FetchHistoryMessagesFromServer` to retrieve messages of a thread from the server. The only difference between retrieving messages of a thread from the server and retrieving group messages is that a thread ID needs to be passed in for the former and a group ID is required for the latter.

```javascript
let options = {
  // The thread ID.
  targetId: "threadId",
  // The number of thread messages that you expect to get on each page. The value range is [1,50], with `20` as the default.
  pageSize: 20,
  // The starting message ID for retrieving. If you set this parameter to `-1`, `null`, or an empty string, the SDK retrieves messages from the latest one.
  cursor: -1,
  // The chat type is set to `groupChat` as a thread belongs to a group chat.
  chatType: "groupChat",
  // The message search direction: (Default): `up`: The SDK retrieves messages in the descending order of the time when the server receives the messages. `down`: The SDK retrieves messages in the ascending order of the time when the server receives the messages.
  searchDirection: "up",
};
conn
  .getHistoryMessages(options)
  .then((res) => {
    // Succeed in getting historical messages.
    console.log(res);
  })
  .catch((e) => {
    // Fail to get historical messages.
  });
  ```

### Flutter

### Send a thread message

Sending a thread message is similar to sending a message in a chat group. The difference lies in the `isChatThreadMessage` field, as shown in the following code sample:

```dart
// Sets `targetId` to thread ID.
// Sets `content` to the message content.
ChatMessage msg = ChatMessage.createTxtSendMessage(
  targetId: threadId,
  content: content,
  chatType: ChatType.GroupChat,
);
// Sets `isChatThreadMessage` to `true` to mark this message as a thread message.
msg.isChatThreadMessage = true;
//  Sends the message.
ChatClient.getInstance.chatManager.sendMessage(msg);
```

For more information about sending a message, see [Send Messages](../messages/send-receive-messages#send-a-text-message).

### Receive a thread message

Once a thread has a new message, all chat group members receive the `ChatThreadEventHandler#onChatThreadUpdated` callback. Thread members can also listen for the `ChatEventHandler#onMessagesReceived` callback to receive thread messages, as shown in the following code sample:

```dart
  // Adds the chat event handler.
  ChatClient.getInstance.chatManager.addEventHandler(
    "UNIQUE_HANDLER_ID",
    ChatEventHandler(
      onMessagesReceived: (messages) {},
    ),
  );
  // Adds the thread event handler.
  ChatClient.getInstance.chatThreadManager.addEventHandler(
    "UNIQUE_HANDLER_ID",
    ChatThreadEventHandler(
      onChatThreadUpdate: (event) {},
    ),
  );
  ...
  // Removes the chat event handler.
  ChatClient.getInstance.chatManager.removeEventHandler("UNIQUE_HANDLER_ID");
  // Removes the chat thread event handler.
  ChatClient.getInstance.chatThreadManager.removeEventHandler("UNIQUE_HANDLER_ID");
```

For more information about receiving a message, see [Receive Messages](../messages/send-receive-messages#receive-a-message).

### Recall a thread message

For details about how to recall a message, refer to [Recall Messages](../messages/send-receive-messages#recall-a-message).

Once a message is recalled in a thread, all chat group members receive the `ChatThreadEventHandler#onChatThreadUpdated` callback. Thread members can also listen for the `ChatEventHandler#onMessagesRecalled` callback, as shown in the following code sample:

```dart
  // Adds the chat event handler.
  ChatClient.getInstance.chatManager.addEventHandler(
    "UNIQUE_HANDLER_ID",
    ChatEventHandler(
      onMessagesRecalled: (messages) {},
    ),
  );
  // Adds the thread event handler.
  ChatClient.getInstance.chatThreadManager.addEventHandler(
    "UNIQUE_HANDLER_ID",
    ChatThreadEventHandler(
      onChatThreadUpdate: (event) {},
    ),
  );
  ...
  // Removes the chat event handler.
  ChatClient.getInstance.chatManager.removeEventHandler("UNIQUE_HANDLER_ID");
  // Removes the chat thread event handler.
  ChatClient.getInstance.chatThreadManager.removeEventHandler("UNIQUE_HANDLER_ID");
```

### Retrieve thread messages

You can retrieve thread messages locally or from the server, depending on your production environment.
You can check `ChatConversation#isChatThread()` to determine whether the current conversation is a thread conversation.

#### Retrieve messages of a thread from the server

You can call `fetchHistoryMessages` to retrieve messages of a thread from the server. The only difference between retrieving messages of a thread from the server and retrieving group messages is that a thread ID needs to be passed in for the former and a group ID is required for the latter.

```dart
try {
  // The thread ID.
  String threadId = "threadId";
  // The conversation type is set to `GroupChat` as a thread belongs to a group conversation.
  ChatConversationType convType = ChatConversationType.GroupChat;
  // The number of thread messages that you expect to get on each page.
  int pageSize = 10;
  // The starting message ID for retrieving.
  String startMsgId = "";
  ChatCursorResult cursor =
      await ChatClient.getInstance.chatManager.fetchHistoryMessages(
    conversationId: convId,
    type: convType,
    pageSize: pageSize,
    startMsgId: startMsgId,
  );
} on ChatError catch (e) {
}
```

### Retrieve messages of a thread locally

By calling [`loadAllConversations`](../messages/manage-messages#retrieve-conversations), you can only retrieve local one-to-one chat conversations and group conversations. To retrieve messages of a thread locally, refer to the following code sample:

```dart
try {
  // The thread ID.
  String threadId = "threadId";
  // The conversation type is set to `GroupChat` as a thread belongs a group conversation.
  ChatConversationType convType = ChatConversationType.GroupChat;
  ChatConversation? conversation = await ChatClient.getInstance.chatManager
        .getThreadConversation(threadId);
  // The starting message for retrieving.
  String startMsgId = "startMsgId";
  // The number of messages that you expect to retrieve on each page.
  int pageSize = 10;
  List? list = await conversation?.loadMessages(
      startMsgId: startMsgId, loadCount: pageSize);
} on ChatError catch (e) {}
```

### React Native

### Send a thread message

Sending a thread message is similar to sending a message in a chat group. The difference lies in the `isChatThread` field, as shown in the following code sample:

```typescript
// Sets `chatThreadId` to the thread ID.
// Sets `content` to the message content.
// Sets `chatType` to `GroupChat` as a thread belongs to a chat group.
// Sets `isChatThread` to `true` to mark this message as a thread message.
const message = ChatMessage.createTextMessage(chatThreadId, content, chatType, {
  isChatThread: true,
});
// Implements `ChatMessageCallback` to listen for the message sending event.
const callback = new ChatMessageCallback();
// Sends the message.
ChatClient.getInstance()
  .chatManager.sendMessage(message, callback)
  .then(() => {
    // Prints the log here if the method call succeeds.
    console.log("send message operation success.");
  })
  .catch((reason) => {
    // Prints the log here if the method call fails.
    console.log("send message operation fail.", reason);
  });
```

For more information about sending a message, see [Send Messages](../messages/send-receive-messages#send-a-text-message).

### Receive a thread message

Once a thread has a new message, all chat group members receive the `ChatMessageEventListener#onChatMessageThreadUpdated` callback. Thread members can also listen for the `ChatMessageEventListener#onMessagesReceived` callback to receive thread messages, as shown in the following code sample:

```typescript
// Inherits and implements `ChatMessageEventListener`.
class ChatMessageEvent implements ChatMessageEventListener {
  // Occurs when a message is received.
  onMessagesReceived(messages: ChatMessage[]): void {
    console.log(`onMessagesReceived: `, messages);
  }
  // Occurs when the thread has a new message.
  onChatMessageThreadUpdated(msgThread: ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadUpdated: `, msgThread);
  }
}
// Adds the message listener.
const listener = new ChatMessageEvent();
ChatClient.getInstance().chatManager.addMessageListener(listener);
// Removes the message listener.
ChatClient.getInstance().chatManager.removeMessageListener(listener);
// Removes all the message listeners.
ChatClient.getInstance().chatManager.removeAllMessageListener();
```

For more information about receiving a message, see [Receive Messages](../messages/send-receive-messages#receive-a-message).

### Recall a thread message

For details about how to recall a message, refer to [Recall Messages](../messages/send-receive-messages#recall-a-message).

Once a message is recalled in a thread, all chat group members receive the `ChatMessageEventListener#onChatMessageThreadUpdated` callback. Thread members can also listen for the `ChatMessageEventListener#onMessagesRecalled` callback, as shown in the following code sample:

```typescript
// Inherits and implements `ChatMessageEventListener`.
class ChatMessageEvent implements ChatMessageEventListener {
  // Occurs when a message is recalled.
  onMessagesRecalled(messages: ChatMessage[]): void {
    console.log(`onMessagesRecalled: `, messages);
  }
  // Occurs when a thread message is recalled.
  onChatMessageThreadUpdated(msgThread: ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadUpdated: `, msgThread);
  }
}
```

### Retrieve thread messages

You can retrieve thread messages locally or from the server, depending on your production environment.

You can check `ChatConversation#isChatThread()` to determine whether the current conversation is a thread conversation.

#### Retrieve messages of a thread from the server

You can call `asyncFetchHistoryMessage` to retrieve messages of a thread from the server. The only difference between retrieving messages of a thread from the server and retrieving group messages is that a thread ID needs to be passed in for the former and a group ID is required for the latter.

```typescript
// chatThreadID: The thread ID.
const chatThreadID = "chatThreadID";
// The chat type is set to ChatConversationType.GroupChat as a thread belongs to a group.
const convType = ChatConversationType.GroupChat;
// The number of thread messages that you expect to get on each page.
const pageSize = 10;
// The starting message ID for retrieving.
const startMsgId = "";
// The message search direction.
const direction = ChatSearchDirection.UP;
ChatClient.getInstance()
  .chatManager.fetchHistoryMessages(chatThreadID, chatType, {
    pageSize,
    startMsgId,
    direction,
  })
  .then((messages) => {
    console.log("get message success: ", messages);
  })
  .catch((reason) => {
    console.log("load conversions fail.", reason);
  });
```

#### Retrieve messages of a thread locally

By calling [`getAllConversations`](../messages/manage-messages#retrieve-conversations), you can only retrieve local one-to-one chat conversations and group conversations. To retrieve messages of a thread locally, refer to the following code sample:

```typescript
// Gets a thread conversation.
ChatClient.getInstance()
  .chatManager.getThreadConversation(chatThreadID, createIfNeed)
  .then((conv) => {
    // Gets messages of the thread from the local database. The SDK automatically loads and stores the retrieved messages to the memory.
    conv
      .getMessages(
        chatThreadID,
        ChatConversationType.GroupChat,
        startMsgId,
        direction,
        loadCount
      )
      .then((messages) => {
        console.log("success.", messages);
      })
      .catch((reason) => {
        console.log("fail.", reason);
      });
  })
  .catch((reason) => {
    console.log("fail.", reason);
  });
```

### Unity

### Send a thread message

Send a thread message is similar to send a message in a chat group. The difference lies in the `IsThread` field, as shown in the following code sample:

```csharp
// Creates a text message. Sets `chatThreadId` to the thread ID and `content` to the message content.
Message msg = Message.CreateTextSendMessage(chatThreadId, content);
// Sets the message type. For thread messages, set `ChatType` as `GroupChat`.
msg.MessageType = MessageType.Group
// Set the `IsThread` flag as `true`.
mmsg.IsThread = true;
// You can create an `CallBack` instance to get the status of message sending. You can update the message status in the callback, such as the information to display when users failed to send a message.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
    onSuccess: () => {
        Debug.Log($"SendTxtMessage success. msgid:{msg.MsgId}");
    },
    onProgress: (progress) => {
        Debug.Log($"SendTxtMessage progress :{progress.ToString()}");
    },
    onError: (code, desc) => {
        Debug.Log($"SendTxtMessage failed, code:{code}, desc:{desc}");
    }
));
```

For more information about sending a message, see [Send Messages](../messages/send-receive-messages#send-a-text-message).

### Receive a thread message

Once a thread has a new message, all chat group members receive the `IChatThreadManagerDelegate#OnUpdateMyThread` callback. Thread members can also listen for the `IChatManagerDelegate#OnMessagesReceived` callback to receive thread messages, as shown in the following code sample:

```csharp
// Inherits and implements `IChatManagerDelegate`.
public class ChatManagerDelegate : IChatManagerDelegate {
    // Implements the `MessagesReceived` callback.
    public void OnMessagesReceived(List messages)
    {
      // When receiving messages, iterates through the message list and parses and displays the message.
    }
}
// Registers an listener.
ChatManagerDelegate adelegate = new ChatManagerDelegate();
SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);
// Removes the listener.
SDKClient.Instance.ChatManager.RemoveChatManagerDelegate(adelegate);
```

For more information about receiving a message, see [Receive Messages](../messages/send-receive-messages#receive-a-message).

### Recall a thread message

Send a thread message is similar to send a message in a chat group. The difference lies in the `isChatThread` field.

Once a message is recalled in a thread, all chat group members receive the `IChatThreadManagerDelegate#OnUpdateMyThread` callback. Thread members can also listen for the `IChatManagerDelegate#OnMessagesRecalled` callback, as shown in the following code sample:

```csharp
// Inherits and implements IChatManagerDelegate.
public class ChatManagerDelegate : IChatManagerDelegate {
    // Implements the `OnMessagesRecalled` callback.
    public void OnMessagesRecalled(List messages)
    {
      // When receiving messages, iterates through the message list and parses and displays the message.
    }
}
// Registers an listener.
ChatManagerDelegate adelegate = new ChatManagerDelegate();
SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);
// Removes the listener.
SDKClient.Instance.ChatManager.RemoveChatManagerDelegate(adelegate);
```

For more information about recalling a message, see [Recall Messages](../messages/send-receive-messages#recall-a-message).

### Retrieve thread messages

You can retrieve thread messages locally or from the server, depending on your production environment.

You can check `Conversation#IsThread()` to determine whether the current conversation is a thread conversation.

#### Retrieve messages of a thread from the server

You can call `ChatManager#FetchHistoryMessagesFromServer` to retrieve messages of a thread from the server. The only difference between retrieving messages of a thread from the server and retrieving group messages is that a thread ID needs to be passed in for the former and a group ID is required for the latter.

```c#
SDKClient.Instance.ChatManager.FetchHistoryMessagesFromServer(threadId, ConversationType.Group, startMsgId, pageSize, MessageSearchDirection.DOWN, new ValueCallBack>(
          onSuccess: (result) =>
          {
              foreach (var msg in result.Data)
              {
                  //process every msg
              }
          },
          onError: (code, desc) =>
          {
          }
      ));
```

#### Retrieve messages of a thread locally

By calling `ChatManager#LoadAllConversations`, you can only retrieve local one-to-one chat conversations and group conversations. To retrieve messages of a thread locally, refer to the following code sample:

```csharp
// Specifies the conversation type by setting `ConversationType.Group` and setting `isChatThread` as `true`.
Conversation conversation = SDKClient.Instance.ChatManager.GetConversation(chatThreadId, EMConversationType.GroupChat, createIfNotExists, isChatThread);
// If you want to handle thread messages from your local database, use the following methods to retrieve the messages. The SDK automatically loads and stores the retrieved messages to the memory.
conversation.LoadMessages(startMsgId, count, direct, new ValueCallBack>(
    onSuccess: (list) => {
        Console.WriteLine($"LoadMessages found {list.Count} messages");
        foreach (var it in list)
        {
            Debug.Log($"message id: {it.MsgId}");
        }
    },
    onError: (code, desc) => {
        Debug.Log($"LoadMessages failed, code:{code}, desc:{desc}");
    }
));
```

### Windows

### Send a thread message

Send a thread message is similar to send a message in a chat group. The difference lies in the `IsThread` field, as shown in the following code sample:

```csharp
// Creates a text message. Sets `chatThreadId` to the thread ID and `content` to the message content.
Message msg = Message.CreateTextSendMessage(chatThreadId, content);
// Sets the message type. For thread messages, set `ChatType` as `GroupChat`.
msg.MessageType = MessageType.Group
// Set the `IsThread` flag as `true`.
mmsg.IsThread = true;
// You can create an `CallBack` instance to get the status of message sending. You can update the message status in the callback, such as the information to display when users failed to send a message.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
    onSuccess: () => {
        Debug.Log($"SendTxtMessage success. msgid:{msg.MsgId}");
    },
    onProgress: (progress) => {
        Debug.Log($"SendTxtMessage progress :{progress.ToString()}");
    },
    onError: (code, desc) => {
        Debug.Log($"SendTxtMessage failed, code:{code}, desc:{desc}");
    }
));
```

For more information about sending a message, see [Send Messages](../messages/send-receive-messages#send-a-text-message).

### Receive a thread message

Once a thread has a new message, all chat group members receive the `IChatThreadManagerDelegate#OnUpdateMyThread` callback. Thread members can also listen for the `IChatManagerDelegate#OnMessagesReceived` callback to receive thread messages, as shown in the following code sample:

```csharp
// Inherits and implements `IChatManagerDelegate`.
public class ChatManagerDelegate : IChatManagerDelegate {
    // Implements the `MessagesReceived` callback.
    public void OnMessagesReceived(List messages)
    {
      // When receiving messages, iterates through the message list and parses and displays the message.
    }
}
// Registers an listener.
ChatManagerDelegate adelegate = new ChatManagerDelegate();
SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);
// Removes the listener.
SDKClient.Instance.ChatManager.RemoveChatManagerDelegate(adelegate);
```

For more information about receiving a message, see [Receive Messages](../messages/send-receive-messages#receive-a-message).

### Recall a thread message

Send a thread message is similar to send a message in a chat group. The difference lies in the `isChatThread` field.

Once a message is recalled in a thread, all chat group members receive the `IChatThreadManagerDelegate#OnUpdateMyThread` callback. Thread members can also listen for the `IChatManagerDelegate#OnMessagesRecalled` callback, as shown in the following code sample:

```csharp
// Inherits and implements IChatManagerDelegate.
public class ChatManagerDelegate : IChatManagerDelegate {
    // Implements the `OnMessagesRecalled` callback.
    public void OnMessagesRecalled(List messages)
    {
      // When receiving messages, iterates through the message list and parses and displays the message.
    }
}
// Registers an listener.
ChatManagerDelegate adelegate = new ChatManagerDelegate();
SDKClient.Instance.ChatManager.AddChatManagerDelegate(adelegate);
// Removes the listener.
SDKClient.Instance.ChatManager.RemoveChatManagerDelegate(adelegate);
```

For more information about recalling a message, see [Recall Messages](../messages/send-receive-messages#recall-a-message).

### Retrieve thread messages

You can retrieve thread messages locally or from the server, depending on your production environment.

You can check `Conversation#IsThread()` to determine whether the current conversation is a thread conversation.

#### Retrieve messages of a thread from the server

You can call `ChatManager#FetchHistoryMessagesFromServer` to retrieve messages of a thread from the server. The only difference between retrieving messages of a thread from the server and retrieving group messages is that a thread ID needs to be passed in for the former and a group ID is required for the latter.

```c#
SDKClient.Instance.ChatManager.FetchHistoryMessagesFromServer(threadId, ConversationType.Group, startMsgId, pageSize, MessageSearchDirection.DOWN, new ValueCallBack>(
          onSuccess: (result) =>
          {
              foreach (var msg in result.Data)
              {
                  //process every message
              }
          },
          onError: (code, desc) =>
          {
          }
      ));
```

#### Retrieve messages of a thread locally

By calling `ChatManager#LoadAllConversations`, you can only retrieve local one-to-one chat conversations and group conversations. To retrieve messages of a thread locally, refer to the following code sample:

```csharp
// Specifies the conversation type by setting `ConversationType.Group` and setting `isChatThread` as `true`.
Conversation conversation = SDKClient.Instance.ChatManager.GetConversation(chatThreadId, EMConversationType.GroupChat, createIfNotExists, isChatThread);
// If you want to handle thread messages from your local database, use the following methods to retrieve the messages. The SDK automatically loads and stores the retrieved messages to the memory.
conversation.LoadMessages(startMsgId, count, direct, new ValueCallBack>(
    onSuccess: (list) => {
        Console.WriteLine($"LoadMessages found {list.Count} messages");
        foreach (var it in list)
        {
            Debug.Log($"message id: {it.MsgId}");
        }
    },
    onError: (code, desc) => {
        Debug.Log($"LoadMessages failed, code:{code}, desc:{desc}");
    }
));
```
