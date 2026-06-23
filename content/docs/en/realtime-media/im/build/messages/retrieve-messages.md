---
title: "Manage server-side messages"
description: "Introduces how to use the Agora Chat SDK to retrieve messages from the server."
---

### [Android, iOS, Web]

The Chat SDK stores historical messages on the chat server. When a chat user logs in from a different device, you can retrieve the historical messages from the server, so that the user can also browse these messages on the new device. Additionally, the Chat SDK supports adding tags to conversation, with a maximum of 20 tags allowed per conversation.

This page introduces how to use the Chat SDK to retrieve, delete, and tag messages messages and conversations.

### All except [Android, Web], iOS

The Chat SDK stores historical messages on the chat server. When a chat user logs in from a different device, you can retrieve the historical messages from the server, so that the user can also browse these messages on the new device.

This page introduces how to use the Chat SDK to retrieve and delete messages from the server.

## Understand the tech

### Platforms

The Chat SDK uses `ChatManager` to retrieve historical messages from the server. The following are the core methods:

- `asyncFetchConversationsFromServer`: Retrieves a list of conversations stored on the server.
- `asyncFetchHistoryMessages`: Retrieves historical messages of a conversation from the server according to `FetchMessageOption`, the parameter configuration class for retrieving historical messages.
- `asyncPinConversation`: Pins conversations.
- `asyncFetchPinnedConversationsFromServer`: Retrieves pinned conversations.
- `asyncPinMessage`: Pins a message in a conversation.
- `asyncUnPinMessage`: Unpin a message in a conversation.
- `asyncGetPinnedMessagesFromServer`: Get a list of pinned messages in a conversation.
- `removeMessagesFromServer`: One-way deletion of historical messages on the server based on message time or message ID.
- `deleteConversationFromServer`: Deletes conversations and their historical messages from the server.
- `asyncAddConversationMark`: Tags a conversation.
- `asyncRemoveConversationMark`: Removes a conversation tag.
- `asyncGetConversationsFromServerWithCursor`: Queries conversations from the server by a conversation tag.

### iOS

The Chat SDK uses `IAgoraChatManager` to retrieve historical messages from the server. The following are the core methods:

- `getConversationsFromServer`: Retrieves a list of conversations stored on the server.
- `fetchMessagesFromServerBy`: Retrieves historical messages of a conversation from the server according to `AgoraChatFetchServerMessagesOption`, the parameter configuration class for retrieving historical messages.
- `pinConversation`: Pins a conversation.
- `getPinnedConversationsFromServerWithCursor`: Retrieves a list of pinned conversations.
- `pinMessage`: Pins a message in a conversation.
- `unpinMessage`: Unpin a message in a conversation.
- `getPinnedMessagesFromServer`: Get a list of pinned messages in a conversation.
- `removeMessagesFromServerWithTimeStamp`/`removeMessagesFromServerMessageIds`: Deletes historical messages from the server unidirectionally.
- `deleteServerConversation`: Deletes conversations and their historical messages from the server.
- `addConversationMark`: Tags a conversation.
- `removeConversationMark`: Removes a conversation tag.
- `getConversationsFromServer`: Queries conversations from the server by a conversation tag.

### Web

The Chat SDK uses `ChatManager` to retrieve historical messages from the server. The following are the core methods:

- `getServerConversations`: Retrieves a list of conversations stored on the server with pagination.
- `getHistoryMessages`: Retrieves the historical messages in the specified conversation from the server.
- `pinConversation`: Pin a conversation.
- `getServerPinnedConversations`: Retrieves a list of pinned conversations.
- `pinMessage`: Pins a message in a conversation.
- `unpinMessage`: Unpin a message in a conversation.
- `getServerPinnedMessages`: Get a list of pinned messages in a conversation.
- `removeHistoryMessages`: Deletes historical messages from the server unidirectionally.
- `deleteConversation`: Deletes conversations and their historical messages from the server.
- `addConversationMark`: Tags a conversation.
- `removeConversationMark`: Removes a conversation tag.
- `getServerConversationsByFilter`: Queries conversations from the server by a conversation tag.

### Flutter

The Chat SDK uses `ChatManager` to retrieve historical messages from the server. The following are the core methods:

- `fetchHistoryMessagesByOption`: Retrieves historical messages of a conversation from the server according to `FetchMessageOptions`, the parameter configuration class for retrieving historical messages.
- `pinConversation`: Pins a conversation.
- `deleteRemoteMessagesBefore`/`deleteRemoteMessagesWithIds`: Deletes historical messages from the server unidirectionally.
- `deleteRemoteConversation`: Deletes conversations and their historical messages from the server.
- `addRemoteAndLocalConversationsMark`: Tags a conversation.
- `deleteRemoteAndLocalConversationsMark`: Removes a conversation tag.
- `fetchConversationsByOptions`: Queries conversations from the server by parameters.

### React Native

The Chat SDK uses `ChatManager` to retrieve historical messages from the server. The following are the core methods:

- `fetchAllConversations`: Retrieves a list of conversations stored on the server.
- `fetchHistoryMessagesByOptions`: Retrieves historical messages of a conversation from the server according to `ChatFetchMessageOptions`, the parameter configuration class for retrieving historical messages.
- `pinConversation`: Pins a conversation.
- `fetchPinnedConversationsFromServerWithCursor`: Retrieves a list of pinned conversations.
- `removeMessagesFromServerWithTimestamp`/`removeMessagesFromServerWithMsgIds`: Deletes historical messages from the server unidirectionally.
- `removeConversationFromServer`: Deletes conversations and related messages from the server.

### Windows

The Chat SDK uses `IChatManager` to retrieve historical messages from the server. The following are the core methods:

- `GetConversationsFromServerWithPage`: Retrieve conversations stored on the server with pagination.
- `FetchHistoryMessagesFromServerBy`: Retrieves historical messages of a conversation from the server according to `FetchServerMessagesOption`, the parameter configuration class for retrieving historical messages.
- `PinConversation`: Pins a conversation.
- `GetConversationsFromServerWithCursor`: Retrieves a list of pinned conversations.
- `RemoveMessagesFromServer`: Deletes historical messages from the server unidirectionally.
- `DeleteConversationFromServer`: Deletes conversations and their historical messages from the server.

### Unity

The Chat SDK uses `IChatManager` to retrieve historical messages from the server. The following are the core methods:

- `GetConversationsFromServerWithPage`: Retrieve conversations stored on the server with pagination.
- `FetchHistoryMessagesFromServerBy`: Retrieves historical messages of a conversation from the server according to `FetchServerMessagesOption`, the parameter configuration class for retrieving historical messages.
- `PinConversation`: Pins a conversation.
- `GetConversationsFromServerWithCursor`: Retrieves a list of pinned conversations.
- `RemoveMessagesFromServer`: Deletes historical messages from the server unidirectionally.
- `DeleteConversationFromServer`: Deletes conversations and their historical messages from the server.

## Prerequisites

Before proceeding, ensure that you meet the following requirements:

- You have integrated the Chat SDK, initialized the SDK and implemented the functionality of registering accounts and login. For details, see [Chat SDK quickstart](../../get-started-sdk).
- You understand the API call frequency limits as described in [Limitations](../limitations).

## Implementation

This section shows how to implement retrieving conversations and messages.

### Android

### Retrieve a list of conversations from the server

Call `asyncFetchConversationsFromServer` to retrieve conversations from the server with pagination. The SDK returns the conversation list in the reverse chronological order of when conversations are active (the timestamp of the last message in the conversation). In the conversation list, each conversation object contains the conversation ID, conversation type, whether the conversation is pinned, the pinned time (the value is 0 for an unpinned conversation), and the last message in the conversation. After the conversation list is retrieved from the server, the local conversation list will be updated accordingly. We recommend calling this method when the app is first installed, or when there is no conversation on the local device. Otherwise, you can call `getAllConversations` to retrieve conversations on the local device.

For each end user, the server stores 100 conversations by default. When this limit is exceeded, new conversations will start overwriting the old ones. If the entire message history in a conversation expires, the conversation becomes empty. When pulling the conversation list from the server, these empty conversations are not included by default. To include them, set `ChatOptions#isLoadEmptyConversations` to `true` when initializing the SDK. In this case, empty conversations will occupy the conversations pull quota, regardless of whether they are needed when pulling. To change this, contact support@agoro.io.

```java
String cursor = "";
limit: The number of conversations that you expect to get on each page. The value range is [1,50].
int limit = 40;
List conversations = new ArrayList<>();
doAsyncFetchConversationsFromServer(limit,cursor,conversations);

private void doAsyncFetchConversationsFromServer(final int limit, final String cursor,List conversations){
    ChatClient.getInstance().chatManager().asyncFetchConversationsFromServer(limit, cursor, new ValueCallBack>() {
        @Override
        public void onSuccess(CursorResult value) {
            if (value != null ) {
                List list = value.getData();
                if (list != null && list.size() > 0) {
                    conversations.addAll(list);
                }
                String newCursor = value.getCursor();
                if( !TextUtils.isEmpty(newCursor)) {
                    doAsyncFetchConversationsFromServer(limit, newCursor, conversations);
                }
            }

        }

        @Override
        public void onError(int error, String errorMsg) {

        }
    });
}
```

### Retrieve message history of the specified conversation

After retrieving conversations, you can retrieve historical messages from the server.

You can set the search direction to retrieve messages in the chronological or reverse chronological order of when the server receives them, the message type, the time period, the message sender, as well as whether to save the retrieved message to the local database.

If you have integrated Chat SDK after June 8, 2023, you can retrieve historical messages even before joining the Chat Group. For earlier implementations, contact [support@agora.io](mailto:support@agora.io) to enable this.

The Agora Chat server stores the full message history for a certain period of time depending on your subscribed [Chat plan](./message-overview#limitations-of-message-storage-duration). After an end user logs back into Agora Chat, the servers  automatically send offline messages to them, that is, messages transmitted when that end user was offline. Offline messages are a subset of the full message history stored on Agora Chat server. Sending only a subset of messages prevents distributing too many messages to a single device, which can overwhelm it and slow down the end user login. Agora Chat server stores and manages these offline messages for every end user in the following way:

- 1:1 private chat: Store 500 offline messages by default;
- Chat Group: Store 200 offline messages by default;
- Chatroom: Doesn't store offline messages. However, by default, whenever an end user joins a chatroom, Agora Chat servers push the 10 latest messages/chatroom to them, and this number can be adjusted to 200 messages/chatroom without additional charges.

After the GA release of Agora Chat 1.3, you can log in to Agora Console and enable the chatroom message history retrieval feature. After that, Agora Chat servers will stop automatically pushing chatroom messages to new members and you can follow the guidance below to retrieve chatroom message history.

For users to receive more offline messages, use the client API or a webhook to sync with Agora Chat's server. End users can also store additional messages on their local database.

To ensure data reliability, we recommend retrieving less than 50 historical messages for each method call. To retrieve more than 50 historical messages, call this method multiple times. Once the messages are retrieved, the SDK automatically updates these messages in the local database.

We recommend that you retrieve 20 messages each time, with a maximum of 50. During paginated query, if the total number of messages that meet the query conditions is greater than the number of `pageSize`, the number of messages of `pageSize` will be returned. If it is less than the number of `pageSize`, the actual number will be returned. When the message query is completed, the number of returned messages is less than the number of `pageSize`.

Refer to the following code sample:

```java
String conversationId=" ";
Conversation.ConversationType type=Conversation.ConversationType.Chat;
FetchMessageOption option=new FetchMessageOption();
//for example
//option.setIsSave(true);
int pageSize = 40;
String cursor = "";
List messages = new ArrayList<>();
doAsyncFetchHistoryMessages(conversationId,type,pageSize,cursor,option,messages);

private void doAsyncFetchHistoryMessages(String conversationId,
                                         Conversation.ConversationType type,
                                         int pageSize,String cursor,
                                         FetchMessageOption option,
                                         List messages){
    ChatClient.getInstance().chatManager().asyncFetchHistoryMessages(conversationId, type, pageSize, cursor, option, new ValueCallBack>() {
        @Override
        public void onSuccess(CursorResult value) {
            if (value != null ) {
                List list = value.getData();
                if (list != null && list.size() > 0) {
                    messages.addAll(list);
                }
                String newCursor = value.getCursor();
                if( !TextUtils.isEmpty(newCursor)) {
                    doAsyncFetchHistoryMessages(conversationId, type, pageSize, newCursor, option, messages);
                }
            }
        }

        @Override
        public void onError(int error, String errorMsg) {

        }
    });
}
```

### Pin a conversation

To keep track of an important conversation, you can pin it to the top of your conversation list. You can pin up to 50 conversations. The pinned state is stored on the server. In a multi-device login use-case, if you pin or unpin a conversation, other login devices will receive the `CONVERSATION_PINNED` or `CONVERSATION_UNPINNED` events.

Refer to the following code example to pin a conversation:

```java
ChatClient.getInstance().chatManager().asyncPinConversation(conversationId, true, new CallBack() {
    @Override
    public void onSuccess() {
    }

    @Override
    public void onError(int code, String error) {
    }
});
```

### Pin a message

You can call `ChatManager#asyncPinMessage` to pin a message to the top of a one-to-one chat, chat group, or chat room. When the pinned status of a message changes, other members in the group or chat room conversation will receive the `MessageListener#onMessagePinChanged` event. In the case of multi-device login, the updated top status will be synchronized to other logged-in devices, and other devices will receive the `MessageListener#onMessagePinChanged` event, respectively.

In group and chat room conversations, multiple users can pin the same message to the top. The latest pinned message will overwrite the earlier information. That is, the `MessagePinInfo` user ID and pin time will correspond to the latest pinned message.

If the message is stored locally but deleted on the server due to expiration, the message will fail to be pinned to the top.

For a single conversation, 20 messages can be pinned to the top by default.

```java
ChatClient.getInstance().chatManager().asyncPinMessage(message.getMsgId(), new CallBack() {
    @Override
    public void onSuccess() {

    }

    @Override
    public void onError(int code, String error) {

    }

    @Override
    public void onProgress(int progress, String status) {

    }
});

```

### Unpin a message

You can call `ChatManager#asyncUnPinMessage` to unpin a message in a one-to-one chat, chat group, or chat room. As with pinned messages, other members of the group or chat room will receive the `MessageListener#onMessagePinChanged` event when the pinned message is unpinned. In the case of multi-device login, the updated pin status will be synchronized to other logged-in devices, and other devices will receive the `MessageListener#onMessagePinChanged` event, respectively.

Any user in a group or room can unpin a message, regardless of who pinned it. After unpinning a message, `Message#pinnedInfo` is returned empty and the message is no longer included in the pinned message list.

```java
ChatClient.getInstance().chatManager().asyncUnPinMessage(message.getMsgId(), new CallBack() {
    @Override
    public void onSuccess() {

    }

    @Override
    public void onError(int code, String error) {

    }

    @Override
    public void onProgress(int progress, String status) {

    }
});
```

### Get pinned messages in a single conversation

You can call `ChatManager#asyncGetPinnedMessagesFromServer` to get the pinned messages from a single conversation from the server. The SDK returns messages in the reverse order of pinning.

:::tip
If a message expires on the server or the user deletes it unilaterally from the server after pinning, such user will not be able to pull it when pulling roaming messages. However, this user and other users will be able to pull this message from the pinned message list.If the user withdraws a message after pinning, the message will be removed from the server; other users will not be able to pull it when they pull the pinned message list from the server.
:::

```java
ChatClient.getInstance().chatManager().asyncGetPinnedMessagesFromServer(conversationId, new ValueCallBack>() {
    @Override
    public void onSuccess(List pinedMessages) {

    }

    @Override
    public void onError(int error, String errorMsg) {

    }
});
```

### Get pinned details of a single message

You can call `MessagePinInfo` to get the pinned details of a single message.

- If the message is pinned, this class returns the time of pinning and the user ID of the user who has pinned it.
- If the message is not pinned, this class is returned empty.

```java
MessagePinInfo emPinnedInfo = message.pinnedInfo();
if(emPinnedInfo!=null) {
    long pinTime = emPinnedInfo.pinTime();
    String operatorId = emPinnedInfo.operatorId();
}else{
    //If the value is empty, the message is in the unpinned state.
}
```

### Delete historical messages from the server unidirectionally

Call `removeMessagesFromServer` to delete historical messages one way from the server. You can remove a maximum of 50 messages from the server each time. Once the messages are deleted, you can no longer retrieve them from the server. The deleted messages are automatically removed from your local device. Other chat users can still get the messages from the server.

```java
// Delete messages by time stamp
Conversation conversation = ChatClient.getInstance().chatManager().getConversation(username);
conversation.removeMessagesFromServer(time, new CallBack() {
    @Override
    public void onSuccess() {}

    @Override
    public void onError(int code, String desc) {}
});

// Delete messages by message ID
conversation.removeMessagesFromServer(msgIdList, new CallBack() {
    @Override
    public void onSuccess() { }

    @Override
    public void onError(int code, String desc) { }
}); 
```

### Delete conversations and related messages from the server unidirectionally

Call `deleteConversationFromServer` to delete conversations and their historical messages unidirectionally from the server. After the conversations and messages are deleted from the server, you can no longer get them from the server. The deleted conversations still exist on your local device, but the messages are automatically removed from the device. Other chat users can still get the conversations and their historical messages from the server.

```java
ChatClient.getInstance().chatManager().deleteConversationFromServer(conversationId, conversationType, isDeleteServerMessage, new CallBack() {
    @Override
    public void onSuccess() {

    }

    @Override
    public void onError(int code, String error) {
    }
});
```

### Tag a conversation

To tag a conversation, use the `asyncAddConversationMark` method. This method allows you to add tags to both local and server-side conversations. Each conversation can have up to 20 tags. This feature applies only to private chats and chat groups.

After adding a tag, you can retrieve the tagged conversations from the server by calling the `getConversationsFromServerWithCursor:pageSize:completion` method. The returned conversation objects will include the conversation tag, which you can obtain using the `marks` property.

If the server conversation list reaches its limit (default 100 conversations per user), inactive conversations will be deleted based on conversation activity (timestamp of the latest message). Consequently, the conversation tags of these deleted conversations will also be removed.

:::info
Adding tags to a conversation, such as stars, does not affect other logic of the conversation, such as the number of unread messages in it.
:::

```java
String conversationId = "Derry";
List ids=new ArrayList<>();
ids.add(conversationId);
ChatClient.getInstance().chatManager().asyncAddConversationMark(ids, Conversation.EMMarkType.MARK_0, new CallBack() {
    @Override
    public void onSuccess() {

    }

    @Override
    public void onError(int code, String error) {

    }
});
```

To use customized tags, use the following code:

```java
Map mapping=new HashMap<>();
mapping.put(Conversation.EMMarkType.MARK_0,"important");
mapping.put(Conversation.EMMarkType.MARK_1,"normal");
mapping.put(Conversation.EMMarkType.MARK_2,"unimportant");
mapping.put(Conversation.EMMarkType.MARK_3,"boys");
mapping.put(Conversation.EMMarkType.MARK_4,"girls");
……
```

### Remove conversation tag

You can call `asyncRemoveConversationMark` to remove tag of a conversation. Tags can be removed for up to 20 conversations at a time. Calling this method removes both the local and server-side tags.

```java
String conversationId = "Derry";
List ids=new ArrayList<>();
ids.add(conversationId);
ChatClient.getInstance().chatManager().asyncRemoveConversationMark(ids, Conversation.EMMarkType.MARK_0,new CallBack() {
    @Override
    public void onSuccess() {

    }

    @Override
    public void onError(int code, String error) {

    }
});
```

### Query conversations from the server by the conversation tag

You can use the `asyncGetConversationsFromServerWithCursor` method to retrieve a list of conversations from the server based on the tag. The SDK returns the conversation list in reverse order of the conversation tag's timestamp. Each conversation object includes the following information:

- Conversation ID
- Conversation type
- Pinned status (whether it is pinned or not)
- Pin time (For an unpinned conversation, the value is 0)
- Conversation tag
- Latest message

After fetching the conversation list from the server, the local conversation list is updated accordingly:

```java
//All the query results are put into `result`.
List result = new ArrayList<>();
//cursor: The starting position of the query. Pass in an empty string for the first call of the method and the SDK starts to get from the conversation with the latest marked operation.
String cursor = "";
// filter: Conversation query options, including conversation marks and the number of conversations obtained per page (up to 10).
// For example, query all conversations marked with Conversation.EMMarkType.MARK_0 on the server.
ConversationFilter filter = new ConversationFilter(Conversation.EMMarkType.MARK_0, 10);
doAsyncGetConversationsFromServerWithCursor(result, cursor, filter);

private void doAsyncGetConversationsFromServerWithCursor(List result, @NonNull String cursor, @NonNull ConversationFilter filter) {
    ChatClient.getInstance().chatManager().asyncGetConversationsFromServerWithCursor(cursor, filter, new ValueCallBack>() {
        @Override
        public void onSuccess(CursorResult value) {
            List datas=value.getData();
            if(!CollectionUtils.isEmpty(datas)){
                result.addAll(datas);
            }
            String cursor_ = value.getCursor();
            if(!TextUtils.isEmpty(cursor_)){
                doAsyncGetConversationsFromServerWithCursor(result,cursor_,filter);
            }
        }

        @Override
        public void onError(int error, String errorMsg) {

        }
    });
}
```

### Query local conversations by the conversation tag

For local conversations, you can call the `getAllConversations` method to obtain all local conversations and then perform conversation filtering yourself. The following is an example of querying all local conversations marked with `Conversation.EMMarkType.MARK_0`:

```java
//All the query results are put into result.
List result=new ArrayList<>();
Map localConversations = ChatClient.getInstance().chatManager().getAllConversations();
if(localConversations!=null&&!localConversations.isEmpty()){
    for(Conversation conversation:localConversations.values()){
        Set marks = conversation.marks();
        if(marks!=null&&!marks.isEmpty()){
            for(Conversation.EMMarkType mark:marks){
                if(mark==Conversation.EMMarkType.MARK_0){
                    result.add(conversation);
                }
            }
        }
    }
}
```

### Get all tags of a local conversation

You can call `Conversation#marks` to get all the tags of a local conversation. The sample code is as follows:

```java
Set conversationMarks = ChatClient.getInstance().chatManager().getConversation("conversationId").marks();
```

### iOS

### Retrieve a list of conversations from the server

Call `getConversationsFromServerWithCursor:pageSize:completion` to retrieve conversations from the server with pagination. The SDK returns the conversation list in the reverse chronological order of when conversations are active (the timestamp of the last message in the conversation). In the conversation list, each conversation object contains the conversation ID, conversation type, whether the conversation is pinned, the pinned time (the value is 0 for an unpinned conversation), and the last message in the conversation. After the conversation list is retrieved from the server, the local conversation list will be updated accordingly. We recommend calling this method when the app is first installed, or when there is no conversation on the local device. Otherwise, you can call `getAllConversations` to retrieve conversations on the local device.

For each end user, the server stores 100 conversations by default. When this limit is exceeded, new conversations will start overwriting the old ones. If the entire message history in a conversation expires, the conversation becomes empty. When pulling the conversation list from the server, these empty conversations are not included by default. To include them, set `EMOptions#loadEmptyConversations` to `YES` when initializing the SDK. In this case, empty conversations will occupy the conversations pull quota, regardless of whether they are needed when pulling. To change this, contact support@agoro.io.

```objective-c
//pageSize: The number of conversations that you expect to get on each page. The value range is [1,50].
[AgoraChatClient.sharedClient.chatManager getConversationsFromServerWithCursor:@"" pageSize:20 completion:^(AgoraChatCursorResult * _Nullable result, AgoraChatError * _Nullable error) {

}];
```

### Retrieve historical messages of the specified conversation

After retrieving conversations, you can retrieve historical messages from the server.

You can set the search direction to retrieve messages in the chronological or reverse chronological order of when the server receives them, the message type, the time period, the message sender, as well as whether to save the retrieved message to the local database.

If you have integrated Chat SDK after June 8, 2023, you can retrieve historical messages even before joining the Chat Group. For earlier implementations, contact [support@agora.io](mailto:support@agora.io) to enable this.

The Agora Chat server stores the full message history for a certain period of time depending on your subscribed [Chat plan](./message-overview#limitations-of-message-storage-duration). After an end user logs back into Agora Chat, the servers  automatically send offline messages to them, that is, messages transmitted when that end user was offline. Offline messages are a subset of the full message history stored on Agora Chat server. Sending only a subset of messages prevents distributing too many messages to a single device, which can overwhelm it and slow down the end user login. Agora Chat server stores and manages these offline messages for every end user in the following way:

- 1:1 private chat: Store 500 offline messages by default;
- Chat Group: Store 200 offline messages by default;
- Chatroom: Doesn't store offline messages. However, whenever an end user joins a chatroom, Agora Chat servers push the 10 latest messages/chatroom to them, by default. This number can be adjusted to 200 messages/chatroom without additional charges.

For users to receive more offline messages, use the client API or a webhook to sync with Agora Chat's server. End users can also store additional messages on their local database.

To ensure data reliability, we recommend retrieving less than 50 historical messages for each method call. To retrieve more than 50 historical messages, call this method multiple times. Once the messages are retrieved, the SDK automatically updates these messages in the local database.

Refer to the following code sample:

```objective-c
AgoraChatFetchServerMessagesOption* option = [[AgoraChatFetchServerMessagesOption alloc] init];
    [AgoraChatClient.sharedClient.chatManager fetchMessagesFromServerBy:@"conversationId" conversationType:AgoraChatConversationTypeGroupChat cursor:@"" pageSize:20 option:option completion:^(AgoraChatCursorResult * _Nullable result, AgoraChatError * _Nullable aError) {

    }];
```

### Pin a conversation

To keep track of an important conversation, you can pin it to the top of your conversation list. You can pin up to 50 conversations.  The pinned state is stored on the server. In a multi-device login use-case, if you pin or unpin a conversation, other login devices will receive the `CONVERSATION_PINNED` or `CONVERSATION_UNPINNED` events.

Refer to the following code example to pin a conversation:

```objc
[AgoraChatClient.sharedClient.chatManager pinConversation:@"conversationId" isPinned:YES completionBlock:^(AgoraChatError * _Nullable error) {

}];
```

### Retrieve the pinned conversations from the server with pagination

End users can pin up to 50 conversations. After you call this API, the SDK returns the pinned conversations in the reverse chronological order of when they are pinned.

Agora Chat servers store a list of conversations that remain active in the past 7 days, regardless of Agora Chat package subscription. A conversation is considered active if it is pinned or there are new messages in a conversation.

Refer to the following code example to get a list of pinned conversations from the server with pagination:

```objc
// pageSize: Number of sessions returned per page. The value range is [1,50].
// cursor: The starting position of the query. If `nil` or `@""` is passed in, the SDK will start querying from the latest pinned session.
[AgoraChatClient.sharedClient.chatManager getPinnedConversationsFromServerWithCursor:@"" pageSize:20 completion:^(AgoraChatCursorResult * _Nullable result, AgoraChatError * _Nullable error) {

}];
```

### Pin a message

You can call `ChatManager#pinMessage` to pin a message to the top of a one-to-one chat, chat group, or chat room. When the pinned status of a message changes, other members in the group or chat room conversation will receive the `ChatManagerDelegate#onMessagePinChanged` event. In the case of multi-device login, the updated top status will be synchronized to other logged-in devices, and other devices will receive the `ChatManagerDelegate#onMessagePinChanged` event, respectively.

In group and chat room conversations, multiple users can pin the same message to the top. The latest pinned message will overwrite the earlier information. That is, the `MessagePinInfo` user ID and pin time will correspond to the latest pinned message.

If the message is stored locally but deleted on the server due to expiration, the message will fail to be pinned to the top.

For a single conversation, 20 messages can be pinned to the top by default.

```swift
ChatClient.shared().chatManager?.pinMessage("messageId", completion: { message, err in
    if err == nil {
        // Pinned successfully
    }
})
```

### Delete historical messages from the server unidirectionally

Call `removeMessagesFromServerWithTimeStamp` or `removeMessagesFromServerMessageIds` to delete historical messages one way from the server. You can remove a maximum of 50 messages from the server each time. Once the messages are deleted, you can no longer retrieve them from the server. The deleted messages are automatically removed from your local device. Other chat users can still get the messages from the server.

Other devices logged in to the account will receive the `MultiDevicesDelegate` callback `multiDevicesMessageBeRemoved`, and the deleted messages will be automatically removed from the device locally.

```objective-c
// Delete messages by timestamp
AgoraChatConversation* conversation = [AgoraChatClient.sharedClient.chatManager getConversationWithConvId:@"conversationId"];
    [conversation removeMessagesFromServerWithTimeStamp:timeToRemove completion:^(AgoraChatError * _Nullable aError) {

    }];
// Delete messages by message ID
 [conversation removeMessagesFromServerMessageIds:@[@"msgId1",@"msgId2"] completion:^(AgoraChatError * _Nullable aError) {

    }];
```

### Delete conversations and related messages  from the server unidirectionally

Call `deleteServerConversation` to delete conversations and their historical messages unidirectionally from the server. After the conversations and messages are deleted from the server, you can no longer get them from the server. The deleted conversations still exist on the local device, but the messages are automatically removed from the device. Other chat users can still get the conversations and their historical messages from the server.

```objective-c
[AgoraChatClient.sharedClient.chatManager deleteServerConversation:@"conversationId1" conversationType:AgoraChatConversationTypeChat isDeleteServerMessages:YES completion:^(NSString *aConversationId, AgoraChatError *aError) {

    }];
```

### Web

### Retrieve a list of conversations from the server

Call `getServerConversations` to retrieve conversations from the server with pagination. The SDK returns the conversation list in the reverse chronological order of when conversations are active (the timestamp of the last message in the conversation). In the conversation list, each conversation object contains the conversation ID, conversation type, whether the conversation is pinned, the pinned time (the value is 0 for an unpinned conversation), and the last message in the conversation. After the conversation list is retrieved from the server, the local conversation list will be updated accordingly. We recommend calling this method when the app is first installed, or when there is no conversation on the local device.

For each end user, the server stores 100 conversations by default. When this limit is exceeded, new conversations will start overwriting the old ones. If the entire message history in a conversation expires, the conversation becomes empty. When pulling the conversation list from the server, these empty conversations are not included. However, if there are empty conversations on the server, they will occupy the conversation list quota. To change this, contact support@agoro.io.

:::info
Do not use mixed upper-case.
:::

```javascript
// pageSize: The number of conversations that you expect to get on each page. The value range is [1,50] and the default value is `20`.
// cursor: The cursor position for starting to get data. If you pass in an empty string (''), the SDK retrieves conversations from the latest active one.
chatClient.getServerConversations({ pageSize: 50, cursor: "" }).then((res) => {
  console.log(res);
});
```

### Retrieve message history of the specified conversation

After retrieving conversations, you can retrieve historical messages from the server.

You can set the search direction to retrieve messages in the chronological or reverse chronological order of when the server receives them, the message type, the time period, the message sender, as well as whether to save the retrieved message to the local database.

If you have integrated Chat SDK after June 8, 2023, you can retrieve historical messages even before joining the Chat Group. For earlier implementations, contact [support@agora.io](mailto:support@agora.io) to enable this.

The Agora Chat server stores the full message history for a certain period of time depending on your subscribed [Chat plan](./message-overview#limitations-of-message-storage-duration). After an end user logs back into Agora Chat, the servers automatically send offline messages to them, that is, messages transmitted when that end user was offline. Offline messages are a subset of the full message history stored on Agora Chat server. Sending only a subset of messages prevents distributing too many messages to a single device, which can overwhelm it and slow down the end user login. Agora Chat server stores and manages these offline messages for every end user in the following way:

- 1:1 private chat: Store 500 offline messages by default;
- Chat Group: Store 200 offline messages by default;
- Chatroom: Doesn't store offline messages. However, by default, whenever an end user joins a chatroom, Agora Chat servers push the 10 latest messages/chatroom to them, and this number can be adjusted to 200 messages/chatroom without additional charges.

After the GA release of Agora Chat 1.3, you can log in to Agora Console and enable the chatroom message history retrieval feature. After that, Agora Chat servers will stop automatically pushing chatroom messages to new members and you can follow the guidance below to retrieve chatroom message history.

For users to receive more offline messages, use the client API or a webhook to sync with Agora Chat's server. End users can also store additional messages on their local database.

To ensure data reliability, we recommend retrieving less than 50 historical messages for each method call. To retrieve more than 50 historical messages, call this method multiple times. Once the messages are retrieved, the SDK automatically updates these messages in the local database.

We recommend that you retrieve 20 messages each time, with a maximum of 50. During paginated query, if the total number of messages that meet the query conditions is greater than the number of `pageSize`, the number of messages of `pageSize` will be returned. If it is less than the number of `pageSize`, the actual number will be returned. When the message query is completed, the number of returned messages is less than the number of `pageSize`.

Refer to the following code sample:

```javascript
chatClient.getHistoryMessages({
  targetId: "targetId", // The user ID of the peer user for one-to-one chat or group ID for group chat.
  chatType: "groupChat", // The chat type: `singleChat` for one-to-one chat or `groupChat` for group chat.
  pageSize: 20, // The number of messages to retrieve per page. The value range is [1,50] and the default value is 20.
  searchDirection: "down", // The message search direction: `up` means to retrieve messages in the descending order of the message timestamp and `down` means to retrieve messages in the ascending order of the message timestamp.
  searchOptions: {
    from: "message sender userID", // The user ID of the message sender. This parameter is used only for group chat.
    msgTypes: ["txt"], // An array of message types for query. If no value is passed in, all types of message will be queried.
    startTime: new Date("2023,11,9").getTime(), // The start timestamp for query. The unit is millisecond.
    endTime: new Date("2023,11,10").getTime(), // The end timestamp for query. The unit is millisecond.
  },
});
```

### Pin a conversation

Refer to the following code example to pin a conversation:

```javascript
chatClient.pinConversation({
  conversationId: "conversationId",
  conversationType: "singleChat",
  isPinned: true,
});
```

### Retrieve the pinned conversations from the server with pagination

End users can pin up to 50 conversations. After you call this API, the SDK returns the pinned conversations in the reverse chronological order of when they are pinned.

Agora Chat servers store a list of conversations that remain active in the past 7 days, regardless of Agora Chat package subscription. A conversation is considered active if it is pinned or there are new messages in a conversation.

Refer to the following code example to get a list of pinned conversations from the server with pagination:

```javascript
// pageSize: The number of sessions returned per page. The value range is [1,50]。
// cursor：The cursor position to start getting data. If an empty string ('') is passed, the SDK will start querying from the latest pinned session.
chatClient.getServerPinnedConversations({ pageSize: 50, cursor: "" });
```

### Pin a message

You can call `pinMessage` to pin a message to the top of a one-to-one chat, chat group, or chat room. When the pinned status of a message changes, other members in the group or chat room conversation will receive the `onMessagePinEvent` event. In the case of multi-device login, the updated top status will be synchronized to other logged-in devices, and other devices will receive the `onMessagePinEvent` event, respectively.

In group and chat room conversations, multiple users can pin the same message to the top. The latest pinned message will overwrite the earlier information. That is, the `PinnedMessageInfo` user ID and pin time will correspond to the latest pinned message.

For a single conversation, 20 messages can be pinned to the top by default.

```javascript
const options = {
  // Conversation type which is `groupChat` for group chat and `chatRoom` for chat room chat.
  conversationType: "groupChat",
  // Conversation ID.
  conversationId: "conversationId",
  // Message ID.
  messageId: "messageId",
};

chatClient.pinMessage(options).then(() => {
  // Succeeded in pinning the message.
  console.log("Succeeded in pinning the message");
});
```

### Unpin a message

You can call `unpinMessage` to unpin a message in a one-to-one chat, chat group, or chat room. As with pinned messages, other members of the group or chat room will receive the `onMessagePinEvent` event when the pinned message is unpinned. In the case of multi-device login, the updated pin status will be synchronized to other logged-in devices, and other devices will receive the `onMessagePinEvent` event, respectively.

Any user in a group or room can unpin a message, regardless of who pinned it. After unpinning a message, the message is no longer included in the pinned message list.

```javascript
const options = {
  // Conversation type which is `groupChat` for group chat and `chatRoom` for chat room chat.
  conversationType: "groupChat",
  // Conversation ID.
  conversationId: "conversationId",
  // Message ID.
  messageId: "messageId",
};

chatClient.unpinMessage(options).then(() => {
  // Succeeded in unpinning the message.
  console.log("Succeeded in unpinning the message.");
});
```

### Get pinned messages in a single conversation

You can call `getServerPinnedMessages` to get the pinned messages from a single conversation from the server. The SDK returns messages in the reverse order of pinning.

:::tip

    
      If a message expires on the server or the user deletes it unilaterally
      from the server after pinning, such user will not be able to pull it when
      pulling roaming messages. However, this user and other users will be able
      to pull this message from the pinned message list.
    
    
      If the user withdraws a message after pinning, the message will be removed
      from the server; other users will not be able to pull it when they pull
      the pinned message list from the server.
    
  
:::

```javascript
const options = {
  // Conversation ID.
  conversationId: "conversationId",
  // Conversation type which is `groupChat` for group chat and `chatRoom` for chat room chat.
  conversationType: "groupChat",
  // The number of pinned messages to retrieve per page. The value range is [1,50] and the default value is `10`
  pageSize: 20,
  // The cursor position that indicates where to start getting data.
  // Pass in an empty string ('') for the first call of the API and the SDK returns the pinned messages in the descending order of the pinning time.
  cursor: "",
};

chatClient.getServerPinnedMessages(options).then((res) => {
  // Succeeded in retrieving the list of pinned messages in a conversation.
  console.log(res);
});
```

### Delete historical messages from the server unidirectionally

Call `removeHistoryMessages` to delete historical messages one way from the server. You can remove a maximum of 20 messages from the server each time. Once the messages are deleted, you can no longer retrieve them from the server. Other chat users can still get the messages from the server.

```javascript
// Delete messages by timestamp
chatClient.removeHistoryMessages({
  targetId: "userId",
  chatType: "singleChat",
  beforeTimeStamp: Date.now(),
});
// Delete messages by message ID
chatClient.removeHistoryMessages({
  targetId: "userId",
  chatType: "singleChat",
  messageIds: ["messageId"],
});
```

### Delete conversations and related messages from the server unidirectionally

You can use the `removeHistoryMessages` method to unidirectionally delete historical messages on the server based on time or message ID. Up to 20 messages can be deleted at once. After deletion, the account cannot retrieve the message from the server. Other users are not affected by this operation.

Upon successful deletion, the `deleteRoaming` callback will be triggered when logging in from multiple terminals and devices.

```javascript
// Delete messages by time stamp
chatClient.removeHistoryMessages({
  targetId: "userId",
  chatType: "singleChat",
  beforeTimeStamp: Date.now(),
});

// Delete messages by message ID
chatClient.removeHistoryMessages({
  targetId: "userId",
  chatType: "singleChat",
  messageIds: ["messageId"],
});
```

### Tag a conversation

To tag a conversation, use the `addConversationMark` method. This method allows you to add tags to both local and server-side conversations. Each conversation can have up to 20 tags. This feature applies only to private chats and chat groups.

After adding a tag, you can retrieve the tagged conversations from the server by calling the `getServerConversations` method. The returned conversation objects will include the conversation tag, which you can obtain using the `ConversationItem#marks` method.

If the server conversation list reaches its limit (default 100 conversations per user), inactive conversations will be deleted based on conversation activity (timestamp of the latest message). Consequently, the conversation tags of these deleted conversations will also be removed.

:::info
Adding tags to a conversation, such as stars, does not affect other logic of
  the conversation, such as the number of unread messages in it.
:::

```javascript
const options = {
  conversations: [
    { conversationId: "test", conversationType: "singleChat" },
    { conversationId: "groupId", conversationType: "groupChat" },
  ],
  mark: 0,
};

chatClient.addConversationMark(options).then(() => {
  console.log("addConversationMark success");
});
```

To create customized tags, you need to do the following:

```javascript
const MarkMap = new Map();
MarkMap.set(0, "IMPORTANT");
MarkMap.set(1, "NORMAL");
MarkMap.set(2, "STAR");
```

### Remove conversation tag

To remove a conversation tag, call `removeConversationMark`. Calling this method removes both the local and server-side conversation tags.

```javascript
const options = {
  conversations: [
    { conversationId: "test", conversationType: "singleChat" },
    { conversationId: "groupId", conversationType: "groupChat" },
  ],
  mark: 0,
};

chatClient.removeConversationMark(options).then(() => {
  console.log("removeConversationMark success");
});
```

### Query conversations from the server by the conversation tag

You can use the `getServerConversationsByFilter` method to retrieve a list of conversations from the server based on the tag. The SDK returns the conversation list in the reverse order of the conversation tag's timestamp. Each conversation object includes the following information:

- Conversation ID
- Conversation type
- Pinned status (whether it is pinned or not)
- Pin time (For an unpinned conversation, the value is 0)
- Conversation tag
- Latest message

After fetching the conversation list from the server, the local conversation list is updated accordingly:

```javascript
const options = {
  pageSize: 10,
  cursor: "",
  filter: {
    mark: 0,
  },
};
chatClient.getServerConversationsByFilter().then((res) => {
  console.log("getServerConversationsByFilter success", res);
});
```

### Flutter

### Retrieve a list of conversations from the server

Call `fetchConversationsByOptions` to retrieve conversations from the server with pagination. The SDK returns the conversation list in the reverse chronological order of when conversations are active (the timestamp of the last message in the conversation). In the conversation list, each conversation object contains the conversation ID, conversation type, whether the conversation is pinned, the pinned time (the value is 0 for an unpinned conversation), and the last message in the conversation. After the conversation list is retrieved from the server, the local conversation list will be updated accordingly. We recommend calling this method when the app is first installed, or when there is no conversation on the local device. Otherwise, you can call `loadAllConversations` to retrieve conversations on the local device.

For each end user, the server stores 100 conversations by default. When this limit is exceeded, new conversations will start overwriting the old ones. If the entire message history in a conversation expires, the conversation becomes empty. When pulling the conversation list from the server, these empty conversations are not included by default. To include them, set `EMOptions#enableEmptyConversation` to `true` when initializing the SDK. In this case, empty conversations will occupy the conversations pull quota, regardless of whether they are needed when pulling. To change this, contact support@agoro.io.

```dart
ChatClient.getInstance.chatManager.fetchConversationsByOptions(
      options: ConversationFetchOptions(),
    );
```

### Retrieve message history of the specified conversation

After retrieving conversations, you can retrieve historical messages from the server.

You can set the search direction to retrieve messages in the chronological or reverse chronological order of when the server receives them, the message type, the time period, the message sender, as well as whether to save the retrieved message to the local database.

If you have integrated Chat SDK after June 8, 2023, you can retrieve historical messages even before joining the Chat Group. For earlier implementations, contact [support@agora.io](mailto:support@agora.io) to enable this.

The Agora Chat server stores the full message history for a certain period of time depending on your subscribed [Chat plan](./message-overview#limitations-of-message-storage-duration). After an end user logs back into Agora Chat, the servers  automatically send offline messages to them, that is, messages transmitted when that end user was offline. Offline messages are a subset of the full message history stored on Agora Chat server. Sending only a subset of messages prevents distributing too many messages to a single device, which can overwhelm it and slow down the end user login. Agora Chat server stores and manages these offline messages for every end user in the following way:

- 1:1 private chat: Store 500 offline messages by default;
- Chat Group: Store 200 offline messages by default;
- Chatroom: Doesn't store offline messages. However, by default, whenever an end user joins a chatroom, Agora Chat servers push the 10 latest messages/chatroom to them, and this number can be adjusted to 200 messages/chatroom without additional charges.

After the GA release of Agora Chat 1.3, you can log in to Agora Console and enable the chatroom message history retrieval feature. After that, Agora Chat servers will stop automatically pushing chatroom messages to new members and you can follow the guidance below to retrieve chatroom message history.

For users to receive more offline messages, use the client API or a webhook to sync with Agora Chat's server. End users can also store additional messages on their local database.

To ensure data reliability, we recommend retrieving less than 50 historical messages for each method call. To retrieve more than 50 historical messages, call this method multiple times. Once the messages are retrieved, the SDK automatically updates these messages in the local database.

We recommend that you retrieve 20 messages each time, with a maximum of 50. During paginated query, if the total number of messages that meet the query conditions is greater than the number of `pageSize`, the number of messages of `pageSize` will be returned. If it is less than the number of `pageSize`, the actual number will be returned. When the message query is completed, the number of returned messages is less than the number of `pageSize`.

Refer to the following code sample:

```dart
ChatConversationType conversationType = ChatConversationType.Chat;
FetchMessageOptions options = FetchMessageOptions(
  from: senderId,
  direction: ChatSearchDirection.Up,
  startTs: 1695720454000,
  endTs: 1695720554000,
  needSave: false,
);

ChatCursorResult result =
    await ChatClient.getInstance.chatManager.fetchHistoryMessagesByOption(
  conversationId,
  conversationType,
  options: options,
  cursor: cursor,
  pageSize: pageSize,
);
```

### Pin a conversation

To keep track of an important conversation, you can pin it to the top of your conversation list. You can pin up to 50 conversations.  The pinned state is stored on the server. In a multi-device login use-case, if you pin or unpin a conversation, other login devices will receive the `CONVERSATION_PINNED` or `CONVERSATION_UNPINNED` events.

Refer to the following code example to pin a conversation:

```dart
ChatClient.getInstance.chatManager.pinConversation(
  conversationId: conversationId,
  isPinned: isPinned,
);
```

### Retrieve the pinned conversations from the server with pagination

End users can pin up to 50 conversations. After you call this API, the SDK returns the pinned conversations in the reverse chronological order of when they are pinned.

Agora Chat servers store a list of conversations that remain active in the past 7 days, regardless of Agora Chat package subscription. A conversation is considered active if it is pinned or there are new messages in a conversation.

Refer to the following code example to get a list of pinned conversations from the server with pagination:

```dart
ChatClient.getInstance.chatManager.fetchConversationsByOptions(
      options: ConversationFetchOptions.pinned(),
    );
```

### Pin a message

You can call `ChatManager#pinMessage` to pin a message to the top of a one-to-one chat, chat group, or chat room. When the pinned status of a message changes, other members in the group or chat room conversation will receive the `ChatEventHandler#onMessagePinChanged` event. In the case of multi-device login, the updated top status will be synchronized to other logged-in devices, and other devices will receive the `ChatEventHandler#onMessagePinChanged` event, respectively.

In group and chat room conversations, multiple users can pin the same message to the top. The latest pinned message will overwrite the earlier information. That is, the `MessagePinInfo` user ID and pin time will correspond to the latest pinned message.

If the message is stored locally but deleted on the server due to expiration, the message will fail to be pinned to the top.

For a single conversation, 20 messages can be pinned to the top by default.

```dart
try {
  await ChatClient.getInstance.chatManager.pinMessage(messageId: msgId);
} on ChatError catch (e) {
  debugPrint('pinMessage error: ${e.code} ${e.description}');
}
```

### Unpin a message

You can call `ChatManager#unpinMessage` to unpin a message in a one-to-one chat, chat group, or chat room. As with pinned messages, other members of the group or chat room will receive the `ChatEventHandler#onMessagePinChanged` event when the pinned message is unpinned. In the case of multi-device login, the updated pin status will be synchronized to other logged-in devices, and other devices will receive the `ChatEventHandler#onMessagePinChanged` event, respectively.

Any user in a group or room can unpin a message, regardless of who pinned it. After unpinning a message, `Message#pinnedInfo` is returned empty and the message is no longer included in the pinned message list.

```dart
  try {
  await ChatClient.getInstance.chatManager.unpinMessage(messageId: msgId);
} on ChatError catch (e) {
  debugPrint('unpinMessage error: ${e.code} ${e.description}');
}
```

### Get pinned messages in a single conversation

You can call `ChatManager#fetchPinnedMessages` to get the pinned messages from a single conversation from the server. The SDK returns messages in the reverse order of pinning.

:::tip
If a message expires on the server or the user deletes it unilaterally from the server after pinning, such user will not be able to pull it when pulling roaming messages. However, this user and other users will be able to pull this message from the pinned message list.If the user withdraws a message after pinning, the message will be removed from the server; other users will not be able to pull it when they pull the pinned message list from the server.
:::

```dart
try {
  List pinnedMessages = await ChatClient.getInstance.chatManager.fetchPinnedMessages(
    conversationId: conversationId,
  );
} on ChatError catch (e) {
  debugPrint('fetchPinnedMessages error: ${e.code} ${e.description}');
}
```

### Get pinned details of a single message

You can call `MessagePinInfo` to get the pinned details of a single message.

- If the message is pinned, this class returns the time of pinning and the user ID of the user who has pinned it.
- If the message is not pinned, this class is returned empty.

```dart
try {
  MessagePinInfo? pinInfo = await message.pinInfo();
} on ChatError catch (e) {
  debugPrint('pinInfo error: ${e.code} ${e.description}');
}
```

### Delete historical messages from the server unidirectionally

Call `deleteRemoteMessagesBefore` or `deleteRemoteMessagesWithIds` to delete historical messages one way from the server. You can remove a maximum of 50 messages from the server each time. Once the messages are deleted, you can no longer retrieve them from the server. The deleted messages are automatically removed from your local device. Other chat users can still get the messages from the server.

```dart
try {
  // Delete messages by timestamp
  await ChatClient.getInstance.chatManager.deleteRemoteMessagesBefore(
    conversationId: conversationId,
    type: convType,
    timestamp: timestamp,
  );
} on ChatError catch (e) {}
try {
  // Delete messages by message ID
  await ChatClient.getInstance.chatManager.deleteRemoteMessagesWithIds(
    conversationId: conversationId,
    type: convType,
    msgIds: msgIds,
  );
} on ChatError catch (e) {}
```

### Delete conversations and related messages from the server unidirectionally

Call `deleteRemoteConversation` to delete conversations and their historical messages unidirectionally from the server. After the conversations and messages are deleted from the server, you can no longer get them from the server. The deleted conversations still exist on the local device, but the messages are automatically removed from your local device. Other chat users can still get the conversations and their historical messages from the server.

```dart
try {
  await ChatClient.getInstance.chatManager.deleteRemoteConversation(
    conversationId,
  );
} on ChatError catch (e) {}
```

### Tag a conversation

To tag a conversation, use the `addRemoteAndLocalConversationsMark` method. This method allows you to add tags to both local and server-side conversations. Each conversation can have up to 20 tags. This feature applies only to private chats and chat groups.

After adding a tag, you can retrieve the tagged conversations from the server by calling the `fetchConversationsByOptions` method. The returned conversation objects will include the conversation tag, which you can obtain using the `marks` property.

If the server conversation list reaches its limit (default 100 conversations per user), inactive conversations will be deleted based on conversation activity (timestamp of the latest message). Consequently, the conversation tags of these deleted conversations will also be removed.

:::info
Adding tags to a conversation, such as stars, does not affect other logic of the conversation, such as the number of unread messages in it.
:::

```dart
try {
  await EMClient.getInstance.chatManager.addRemoteAndLocalConversationsMark(
    conversationIds: conversationsIds,
    mark: ConversationMarkType.Type0,
  );
} on EMError catch (e) {
  debugPrint("addRemoteAndLocalConversationsMark error: ${e.code}, ${e.description}");
}

```

### Remove conversation tag

You can call `deleteRemoteAndLocalConversationsMark` to remove tag of a conversation. Tags can be removed for up to 20 conversations at a time. Calling this method removes both the local and server-side tags.

```dart
try {
  await ChatClient.getInstance.chatManager.deleteRemoteAndLocalConversationsMark(
    conversationIds: conversationIds,
    mark: ConversationMarkType.Type0,
  );
} on ChatError catch (e) {
  debugPrint('deleteRemoteAndLocalConversationsMark error: ${e.code} ${e.description}');
}
```

### Query conversations from the server by the conversation tag

You can use the `fetchConversationsByOptions` method to retrieve a list of conversations from the server based on the tag. The SDK returns the conversation list in reverse order of the conversation tag's timestamp. Each conversation object includes the following information:

- Conversation ID
- Conversation type
- Pinned status (whether it is pinned or not)
- Pin time (For an unpinned conversation, the value is 0)
- Conversation tag
- Latest message

After fetching the conversation list from the server, the local conversation list is updated accordingly:

```dart
try {
  ChatCursorResult result = await ChatClient.getInstance.chatManager.fetchConversationsByOptions(
    options: ConversationFetchOptions.mark(
      ConversationMarkType.Type0,
    ),
  );
} on ChatError catch (e) {
  debugPrint('fetchConversationsByOptions error: ${e.code} ${e.description}');
}
```

### Query local conversations by the conversation tag

For local conversations, you can call the `getAllConversations` method to obtain all local conversations and then perform conversation filtering yourself. The following is an example of querying all local conversations marked with `EMConversation.EMMarkType.MARK_0`:

```dart
try {
  List markedConversations = [];
  List conversations = await ChatClient.getInstance.chatManager.loadAllConversations();
  for (var conversation in conversations) {
    if (conversation.marks?.contains(ConversationMarkType.Type0) == true) {
      markedConversations.add(conversation);
    }
  }
  debugPrint('marked conversations: $markedConversations');
} on ChatError catch (e) {
  debugPrint('get marks conversations error: ${e.code} ${e.description}');
}
```

### Get all tags of a local conversation

You can call `Conversation#marks` to get all the tags of a local conversation. The sample code is as follows:

```dart
try {
  ChatConversation? conversation = await ChatClient.getInstance.chatManager.getConversation(targetId);
  List? markType = conversation?.marks;
} on ChatError catch (e) {
  debugPrint('get marks error: ${e.code} ${e.description}');
}
```

### React Native

### Retrieve a list of conversations from the server

Call `fetchConversationsFromServerWithCursor` to retrieve conversations from the server with pagination. The SDK returns the conversation list in the reverse chronological order of when conversations are active (the timestamp of the last message in the conversation). In the conversation list, each conversation object contains the conversation ID, conversation type, whether the conversation is pinned, the pinned time (the value is 0 for an unpinned conversation), and the last message in the conversation. After the conversation list is retrieved from the server, the local conversation list will be updated accordingly. We recommend calling this method when the app is first installed, or when there is no conversation on the local device. Otherwise, you can call `getAllConversations` to retrieve conversations on the local device.

For each end user, the server stores 100 conversations by default. When this limit is exceeded, new conversations will start overwriting the old ones. If the entire message history in a conversation expires, the conversation becomes empty. When pulling the conversation list from the server, these empty conversations are not included by default. To include them, set `ChatOptions#enableEmptyConversation` to `true` when initializing the SDK. In this case, empty conversations will occupy the conversations pull quota, regardless of whether they are needed when pulling. To change this, contact support@agoro.io.

```java
// pageSize: The number of conversations that you expect to get on each page. The value range is [1,50].
// cursor: If `cursor` is an empty string, the SDK retrieves from the latest conversation.
ChatClient.getInstance()
  .chatManager.fetchConversationsFromServerWithCursor(cursor, pageSize)
  .then(() => {
    console.log("get conversions success");
  })
  .catch((reason) => {
    console.log("get conversions fail.", reason);
  });
```

If you do not support `fetchConversationsFromServerWithCursor`, call `fetchConversationsFromServerWithPage` to retrieve the conversations from the server. Altogether, the SDK can retrieve the last 100 conversations in the past seven days. To adjust the time limit or the number of conversations retrieved, contact support@agora.io.

### Retrieve historical messages of the specified conversation

After retrieving conversations, you can retrieve historical messages from the server.

You can set the search direction to retrieve messages in the chronological or reverse chronological order of when the server receives them, the message type, the time period, the message sender, as well as whether to save the retrieved message to the local database.

If you have integrated Chat SDK after June 8, 2023, you can retrieve historical messages even before joining the Chat Group. For earlier implementations, contact [support@agora.io](mailto:support@agora.io) to enable this.

The Agora Chat server stores the full message history for a certain period of time depending on your subscribed [Chat plan](./message-overview#limitations-of-message-storage-duration). After an end user logs back into Agora Chat, the servers  automatically send offline messages to them, that is, messages transmitted when that end user was offline. Offline messages are a subset of the full message history stored on Agora Chat server. Sending only a subset of messages prevents distributing too many messages to a single device, which can overwhelm it and slow down the end user login. Agora Chat server stores and manages these offline messages for every end user in the following way:

- 1:1 private chat: Store 500 offline messages by default;
- Chat Group: Store 200 offline messages by default;
- Chatroom: Doesn't store offline messages. However, whenever an end user joins a chatroom, Agora Chat servers push the 10 latest messages/chatroom to them, by default. This number can be adjusted to 200 messages/chatroom without additional charges.

For users to receive more offline messages, use the client API or a webhook to sync with Agora Chat's server. End users can also store additional messages on their local database.

To ensure data reliability, we recommend retrieving less than 50 historical messages for each method call. To retrieve more than 50 historical messages, call this method multiple times. Once the messages are retrieved, the SDK automatically updates these messages in the local database.

We recommend that you retrieve 20 messages each time, with a maximum of 50. During paginated query, if the total number of messages that meet the query conditions is greater than the number of `pageSize`, the number of messages of `pageSize` will be returned. If it is less than the number of `pageSize`, the actual number will be returned. When the message query is completed, the number of returned messages is less than the number of `pageSize`.

Refer to the following code sample:

```typescript
ChatClient.getInstance()
  .chatManager.fetchHistoryMessagesByOptions(convId, convType, {
    cursor: cursor,
    pageSize: pageSize,
    options: options as ChatFetchMessageOptions,
  })
  .then((result) => {
    console.log("get history message success", result);
  })
  .catch((reason) => {
    console.log("get history message fail.", reason);
  });
```

### Pin a conversation

To keep track of an important conversation, you can pin it to the top of your conversation list. You can pin up to 50 conversations.  The pinned state is stored on the server. In a multi-device login use-case, if you pin or unpin a conversation, other login devices will receive the `CONVERSATION_PINNED` or `CONVERSATION_UNPINNED` events.

Refer to the following code example to pin a conversation:

```typescript
// isPinned: Sets whether to pin a conversation.
ChatClient.getInstance()
  .chatManager.pinConversation(convId, isPinned)
  .then(() => {
    console.log("pin conversions success");
  })
  .catch((reason) => {
    console.log("pin conversions fail.", reason);
  });
```

### Retrieve the pinned conversations from the server with pagination

End users can pin up to 50 conversations. After you call this API, the SDK returns the pinned conversations in the reverse chronological order of when they are pinned.

Agora Chat servers store a list of conversations that remain active in the past 7 days, regardless of Agora Chat package subscription. A conversation is considered active if it is pinned or there are new messages in a conversation.

Refer to the following code example to get a list of pinned conversations from the server with pagination:

```typescript
// pageSize: The number of sessions returned per page. The value range is [1,50]。
// cursor：The cursor position to start getting data.
ChatClient.getInstance()
  .chatManager.fetchPinnedConversationsFromServerWithCursor(cursor, pageSize)
  .then(() => {
    console.log("get conversions success");
  })
  .catch((reason) => {
    console.log("get conversions fail.", reason);
  });
```

### Pin a message

You can call `ChatManager#pinMessage` to pin a message to the top of a one-to-one chat, chat group, or chat room. When the pinned status of a message changes, other members in the group or chat room conversation will receive the `MessageListener#onMessagePinChanged` event. In the case of multi-device login, the updated top status will be synchronized to other logged-in devices, and other devices will receive the `MessageListener#onMessagePinChanged` event, respectively.

In group and chat room conversations, multiple users can pin the same message to the top. The latest pinned message will overwrite the earlier information. That is, the `ChatMessagePinInfo` user ID and pin time will correspond to the latest pinned message.

For a single conversation, 20 messages can be pinned to the top by default.

```typescript
ChatClient.getInstance()
  .chatManager.pinMessage(
    messageId // message ID
  )
  .then(() => {
    // todo: operation completed
  })
  .catch((error) => {
    // todo: operation failed
  });
```

### Delete historical messages from the server unidirectionally

Call `removeMessagesFromServerWithTimestamp` or `removeMessagesFromServerWithMsgIds` to delete historical messages one way from the server. You can remove a maximum of 50 messages from the server each time. Once the messages are deleted, you can no longer retrieve them from the server. The deleted messages are automatically removed from your local device. Other chat users can still get the messages from the server.

:::info
To use this function, you need to contact [support@agora.io](mailto:support@agora.io) to enable it.
:::

```typescript
// Delete messages by message ID
ChatClient.getInstance()
  .chatManager.removeMessagesFromServerWithMsgIds(convId, convType, msgIds)
  .then((result) => {
    console.log("test:success:", result);
  })
  .catch((error) => {
    console.warn("test:error:", error);
  });
// Delete messages by timestamp
ChatClient.getInstance()
  .chatManager.removeMessagesFromServerWithTimestamp(
    convId,
    convType,
    timestamp
  )
  .then((result) => {
    console.log("test:success:", result);
  })
  .catch((error) => {
    console.warn("test:error:", error);
  });
```

### Delete conversations and related messages from the server unidirectionally

Call `removeConversationFromServer` to delete conversations and their historical messages unidirectionally from the server. After the conversations and messages are deleted from the server, you can no longer get them from the server. The deleted conversations still exist on the local device, but the messages are automatically removed from the device. Other chat users can still get the conversations and their historical messages from the server.

```typescript
// convId: conversation ID
// convType: conversation type.
// isDeleteMessage: Whether to delete historical messages from the server and local storage with the conversation.
ChatClient.getInstance()
  .chatManager.removeConversationFromServer(convId, convType, isDeleteMessage)
  .then(() => {
    console.log("remove conversions success");
  })
  .catch((reason) => {
    console.log("remove conversions fail.", reason);
  });
```

### Windows

### Retrieve a list of conversations from the server

Call `GetConversationsFromServerWithCursor` to retrieve conversations from the server with pagination. You can set the  `pinOnly` parameter in this method to determine whether to retrieve the list of pinned conversations:
- If `pinOnly` is set to `false`, you can retrieve the list of pinned and unpinned conversations. The SDK returns the conversation list in the reverse chronological order of when conversations are active (the timestamp of the last message in the conversation).
- If `pinOnly` is set to `true`, you can only retrieve the list of pinned conversations. The SDK returns the pinned conversations in the reverse chronological order of when they were pinned. Up to 50 pinned conversations can be retrieved.

In the conversation list, each conversation object contains the conversation ID, conversation type, whether the conversation is pinned, the pinned time (the value is 0 for an unpinned conversation), and the last message in the conversation. After the conversation list is retrieved from the server, the local conversation list will be updated accordingly. We recommend calling this method when the app is first installed, or when there is no conversation on the local device. Otherwise, you can call `LoadAllConversations` to retrieve conversations on the local device.

For each end user, the server stores 100 conversations by default. When this limit is exceeded, new conversations will start overwriting the old ones. If the entire message history in a conversation expires, the conversation becomes empty. When pulling the conversation list from the server, these empty conversations are not included by default. To include them, set `Options#EnableEmptyConversation` to `true` when initializing the SDK. In this case, empty conversations will occupy the conversations pull quota, regardless of whether they are needed when pulling. To change this, contact support@agoro.io.

```csharp
// limit: The number of conversations that you expect to get on each page. The value range is [1,50].
int limit = 10;
string cursor = "";
bool pinOnly = false; // `false`：Get all conversations; `true`: Get the list of pinned conversations.
SDKClient.Instance.ChatManager.GetConversationsFromServerWithCursor(pinOnly, cursor, limit, new ValueCallBack>(
   onSuccess: (result) =>
   {
       // Traverse the obtained conversation list
       foreach (var conv in result.Data)
       {

       }
       // The cursor for the next request
       string nextCursor = result.Cursor;
   },
   onError: (code, desc) =>
   {

   }
));
```

### Retrieve historical messages of the specified conversation

After retrieving conversations, you can retrieve historical messages from the server.

You can set the search direction to retrieve messages in the chronological or reverse chronological order of when the server receives them, the message type, the time period, the message sender, as well as whether to save the retrieved message to the local database.

If you have integrated Chat SDK after June 8, 2023, you can retrieve historical messages even before joining the Chat Group. For earlier implementations, contact [support@agora.io](mailto:support@agora.io) to enable this.

The Agora Chat server stores the full message history for a certain period of time depending on your subscribed [Chat plan](./message-overview#limitations-of-message-storage-duration). After an end user logs back into Agora Chat, the servers  automatically send offline messages to them, that is, messages transmitted when that end user was offline. Offline messages are a subset of the full message history stored on Agora Chat server. Sending only a subset of messages prevents distributing too many messages to a single device, which can overwhelm it and slow down the end user login. Agora Chat server stores and manages these offline messages for every end user in the following way:

- 1:1 private chat: Store 500 offline messages by default;
- Chat Group: Store 200 offline messages by default;
- Chatroom: Doesn't store offline messages. However, whenever an end user joins a chatroom, Agora Chat servers push the 10 latest messages/chatroom to them, by default. This number can be adjusted to 200 messages/chatroom without additional charges.

For users to receive more offline messages, use the client API or a webhook to sync with Agora Chat's server. End users can also store additional messages on their local database.

To ensure data reliability, we recommend retrieving less than 50 historical messages for each method call. To retrieve more than 50 historical messages, call this method multiple times. Once the messages are retrieved, the SDK automatically updates these messages in the local database.

We recommend that you retrieve 20 messages each time, with a maximum of 50. During paginated query, if the total number of messages that meet the query conditions is greater than the number of `pageSize`, the number of messages of `pageSize` will be returned. If it is less than the number of `pageSize`, the actual number will be returned. When the message query is completed, the number of returned messages is less than the number of `pageSize`.

Refer to the following code sample:

```csharp
FetchServerMessagesOption option = new FetchServerMessagesOption();
option.IsSave = false;
option.Direction = MessageSearchDirection.UP;
option.From = "user";
option.MsgTypes = new List();
option.MsgTypes.Add(MessageBodyType.TXT);
option.MsgTypes.Add(MessageBodyType.VIDEO);
option.StartTime = 1695720454000;
option.EndTime = 1695720554000;

SDKClient.Instance.ChatManager.FetchHistoryMessagesFromServerBy(conversationId, type, cursor, pageSize, option, new ValueCallBack>(
    onSuccess: (result) =>
    {

    },
    onError: (code, desc) =>
    {

    }
));
```

### Pin a conversation

To keep track of an important conversation, you can pin it to the top of your conversation list. You can pin up to 50 conversations.  The pinned state is stored on the server. In a multi-device login use-case, if you pin or unpin a conversation, other login devices will receive the `CONVERSATION_PINNED` or `CONVERSATION_UNPINNED` events.

Refer to the following code example to pin a conversation:

```csharp
SDKClient.Instance.ChatManager.PinConversation(convId, isPinned, new CallBack(
    onSuccess: () =>
    {

    },
    onError: (code, desc) =>
    {

    }
));
```

### Retrieve the pinned conversations from the server

End users can pin up to 50 conversations. After you call this API, the SDK returns the pinned conversations in the reverse chronological order of when they are pinned.

Agora Chat servers store a list of conversations that remain active in the past 7 days, regardless of Agora Chat package subscription. A conversation is considered active if it is pinned or there are new messages in a conversation.

The Limit parameter specifies the number of conversations each API call can return, from a range of 1-50. Refer to the following code example to get a list of pinned conversations from the server with pagination:

```csharp
// limit: The number of sessions returned per page. The value range is [1,50].
// cursor: The cursor position to start getting data.
int limit = 10;
string cursor = "";
bool pinOnly = true; // `false`: Get the list of all conversations; `true`: Get the list of only pinned conversations.
SDKClient.Instance.ChatManager.GetConversationsFromServerWithCursor(pinOnly, cursor, limit, new ValueCallBack>(
   onSuccess: (result) =>
   {
       // Traverse the obtained conversation list
       foreach (var conv in result.Data)
       {

       }
       // The cursor for the next query
       string nextCursor = result.Cursor;
   },
   onError: (code, desc) =>
   {

   }
));
```

### Pin a message

To pin a message to the top of a one-to-one chat, chat group, or chat room, call `ChatManager#PinMessage` and set the `isPinned` parameter to `true`. When the pinned status of a message changes, other members in the one-to-one chat, group or chat room conversation receive the `IChatManagerDelegate#OnMessagePinChanged` event. In the case of multi-device login, the updated top status is synchronized to other logged-in devices, and other devices receive the `IChatManagerDelegate#OnMessagePinChanged` event, respectively.

Multiple users can pin the same message to the top. The latest pinned message overwrites the earlier information. That is, the `PinnedInfo` user ID and pin time correspond to the last pinned message.

If the message is stored locally but deleted on the server due to expiration, the message fails to be pinned to the top.

For a single conversation, 20 messages can be pinned to the top by default.

```csharp
bool isPinned = true;
SDKClient.Instance.ChatManager.PinMessage(msgId, isPinned, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Unpin a message

To unpin a message in a one-to-one chat, chat group, or chat room, call `ChatManager#PinMessage` and set the `isPinned` parameter to `false`. As with pinned messages, other members of the one-to-one chat, chat group or chat room receive the `IChatManagerDelegate#OnMessagePinChanged` event when the pinned message is unpinned. In the case of multi-device login, the updated pin status is synchronized to other logged-in devices, and other devices receive the `IChatManagerDelegate#OnMessagePinChanged` event, respectively.

Any user in a one-to-one chat, group or room can unpin a message, regardless of who pinned it. After unpinning a message, `PinnedBy` and `PinnedAt` in `Message#PinnedInfo` are returned empty and set to `0`, respectively, and the message is no longer included in the pinned message list.

```csharp
bool isPinned = false;
SDKClient.Instance.ChatManager.PinMessage(msgId, isPinned, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Get pinned messages in a single conversation

You can call `ChatManager#GetPinnedMessagesFromServer` to get the pinned messages from a single conversation from the server. The SDK returns messages in the reverse order of pinning.

:::tip
If a message expires on the server or the user deletes it unilaterally from the server after pinning, such user will not be able to pull it when pulling roaming messages. However, this user and other users will be able to pull this message from the pinned message list.If the user withdraws a message after pinning, the message will be removed from the server; other users will not be able to pull it when they pull the pinned message list from the server.
:::

```csharp
SDKClient.Instance.ChatManager.GetPinnedMessagesFromServer(convId, new ValueCallBack>(
    onSuccess: (list) => {
        foreach (var it in list)
        {
            // Traverse the message list
        }
    },
    onError: (code, desc) => {
    }
));
```

### Get pinned details of a single message

You can call `PinnedInfo` to get the pinned details of a single message.

- If the message is pinned, this class returns the time of pinning and the user ID of the user who has pinned it.
- If the message is not pinned, then `PinnedBy` is returned empty and `PinnedAt` is set to `0`.

```csharp
// ...
const msg: ChatMessage;
const info = await msg.getPinInfo;
// todo: Get the pin information of the message
```

### Delete historical messages from the server unidirectionally

Call `RemoveMessagesFromServer` to delete historical messages one way from the server. You can remove a maximum of 50 messages from the server each time. Once the messages are deleted, you can no longer retrieve them from the server. The deleted messages are automatically removed from your local device. Other chat users can still get the messages from the server.

```csharp
SDKClient.Instance.ChatManager.RemoveMessagesFromServer(convId, ctype, time, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
SDKClient.Instance.ChatManager.RemoveMessagesFromServer(convId, ctype, msgList, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Delete conversations and related messages from the server unidirectionally

Call `DeleteConversationFromServer` to delete conversations and their historical messages unidirectionally from the server. After the conversations and messages are deleted from the server, you can no longer get them from the server. The deleted conversations still exist on your local device, but the messages are automatically removed from the device. Other chat users can still get the conversations and their historical messages from the server.

```csharp
SDKClient.Instance.ChatManager.DeleteConversationFromServer(conversationId, conversationType, isDeleteServerMessages, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Unity

### Retrieve a list of conversations from the server

Call `GetConversationsFromServerWithCursor` to retrieve conversations from the server with pagination. You can set the  `pinOnly` parameter in this method to determine whether to retrieve the list of pinned conversations:
- If `pinOnly` is set to `false`, you can retrieve the list of pinned and unpinned conversations. The SDK returns the conversation list in the reverse chronological order of when conversations are active (the timestamp of the last message in the conversation).
- If `pinOnly` is set to `true`, you can only retrieve the list of pinned conversations. The SDK returns the pinned conversations in the reverse chronological order of when they were pinned. Up to 50 pinned conversations can be retrieved.

In the conversation list, each conversation object contains the conversation ID, conversation type, whether the conversation is pinned, the pinned time (the value is 0 for an unpinned conversation), and the last message in the conversation. After the conversation list is retrieved from the server, the local conversation list will be updated accordingly. We recommend calling this method when the app is first installed, or when there is no conversation on the local device. Otherwise, you can call `LoadAllConversations` to retrieve conversations on the local device.

For each end user, the server stores 100 conversations by default. When this limit is exceeded, new conversations will start overwriting the old ones. If the entire message history in a conversation expires, the conversation becomes empty. When pulling the conversation list from the server, these empty conversations are not included by default. To include them, set `Options#EnableEmptyConversation` to `true` when initializing the SDK. In this case, empty conversations will occupy the conversations pull quota, regardless of whether they are needed when pulling. To change this, contact support@agoro.io.

```csharp
// limit: The number of conversations that you expect to get on each page. The value range is [1,50].
int limit = 10;
string cursor = "";
bool pinOnly = false; // `false`：Get the list of all conversations; `true`: Get the list of only pinned conversations.
SDKClient.Instance.ChatManager.GetConversationsFromServerWithCursor(pinOnly, cursor, limit, new ValueCallBack>(
   onSuccess: (result) =>
   {
       // Traverse the obtained conversation list
       foreach (var conv in result.Data)
       {

       }
       // The cursor for the next request
       string nextCursor = result.Cursor;
   },
   onError: (code, desc) =>
   {

   }
));
```

### Retrieve message history of the specified conversation

After retrieving conversations, you can retrieve historical messages from the server.

You can set the search direction to retrieve messages in the chronological or reverse chronological order of when the server receives them, the message type, the time period, the message sender, as well as whether to save the retrieved message to the local database.

If you have integrated Chat SDK after June 8, 2023, you can retrieve historical messages even before joining the Chat Group. For earlier implementations, contact [support@agora.io](mailto:support@agora.io) to enable this.

The Agora Chat server stores the full message history for a certain period of time depending on your subscribed [Chat plan](./message-overview#limitations-of-message-storage-duration). After an end user logs back into Agora Chat, the servers  automatically send offline messages to them, that is, messages transmitted when that end user was offline. Offline messages are a subset of the full message history stored on Agora Chat server. Sending only a subset of messages prevents distributing too many messages to a single device, which can overwhelm it and slow down the end user login. Agora Chat server stores and manages these offline messages for every end user in the following way:

- 1:1 private chat: Store 500 offline messages by default;
- Chat Group: Store 200 offline messages by default;
- Chatroom: Doesn't store offline messages. However, by default, whenever an end user joins a chatroom, Agora Chat servers push the 10 latest messages/chatroom to them, and this number can be adjusted to 200 messages/chatroom without additional charges.

After the GA release of Agora Chat 1.3, you can log in to Agora Console and enable the chatroom message history retrieval feature. After that, Agora Chat servers will stop automatically pushing chatroom messages to new members and you can follow the guidance below to retrieve chatroom message history.

For users to receive more offline messages, use the client API or a webhook to sync with Agora Chat's server. End users can also store additional messages on their local database.

To ensure data reliability, we recommend retrieving less than 50 historical messages for each method call. To retrieve more than 50 historical messages, call this method multiple times. Once the messages are retrieved, the SDK automatically updates these messages in the local database.

We recommend that you retrieve 20 messages each time, with a maximum of 50. During paginated query, if the total number of messages that meet the query conditions is greater than the number of `pageSize`, the number of messages of `pageSize` will be returned. If it is less than the number of `pageSize`, the actual number will be returned. When the message query is completed, the number of returned messages is less than the number of `pageSize`.

Refer to the following code sample:

```csharp
FetchServerMessagesOption option = new FetchServerMessagesOption();
option.IsSave = false;
option.Direction = MessageSearchDirection.UP;
option.From = "user";
option.MsgTypes = new List();
option.MsgTypes.Add(MessageBodyType.TXT);
option.MsgTypes.Add(MessageBodyType.VIDEO);
option.StartTime = 1695720454000;
option.EndTime = 1695720554000;

SDKClient.Instance.ChatManager.FetchHistoryMessagesFromServerBy(conversationId, type, cursor, pageSize, option, new ValueCallBack>(

   onSuccess: (result) =>
   {
   },
   onError: (code, desc) =>

   {
   }
 )) ;
```

### Pin a conversation

To keep track of an important conversation, you can pin it to the top of your conversation list. You can pin up to 50 conversations.  The pinned state is stored on the server. In a multi-device login use-case, if you pin or unpin a conversation, other login devices will receive the `CONVERSATION_PINNED` or `CONVERSATION_UNPINNED` events.

Refer to the following code example to pin a conversation:

```csharp
SDKClient.Instance.ChatManager.PinConversation(convId, isPinned, new CallBack(
    onSuccess: () =>
    {

    },
    onError: (code, desc) =>
    {

    }
));
```

### Retrieve the pinned conversations from the server with pagination

End users can pin up to 50 conversations. After you call this API, the SDK returns the pinned conversations in the reverse chronological order of when they are pinned.

Agora Chat servers store a list of conversations that remain active in the past 7 days, regardless of Agora Chat package subscription. A conversation is considered active if it is pinned or there are new messages in a conversation.

Refer to the following code example to get a list of pinned conversations from the server with pagination:

```csharp
// limit: The number of sessions returned per page. The value range is [1,50].
// cursor: The cursor position to start getting data.
int limit = 10;
string cursor = "";
bool pinOnly = true; // `false`: Get the list of all conversations; `true`: Get the list of only pinned conversations.
SDKClient.Instance.ChatManager.GetConversationsFromServerWithCursor(pinOnly, cursor, limit, new ValueCallBack>(
   onSuccess: (result) =>
   {
       // Traverse the obtained conversation list
       foreach (var conv in result.Data)
       {

       }
       // The cursor for the next query
       string nextCursor = result.Cursor;
   },
   onError: (code, desc) =>
   {

   }
));
```

### Pin a message

To pin a message to the top of a one-to-one chat, chat group, or chat room, call `ChatManager#PinMessage` and set the `isPinned` parameter to `true`. When the pinned status of a message changes, other members in the one-to-one chat, group or chat room conversation receive the `IChatManagerDelegate#OnMessagePinChanged` event. In the case of multi-device login, the updated top status is synchronized to other logged-in devices, and other devices receive the `IChatManagerDelegate#OnMessagePinChanged` event, respectively.

Multiple users can pin the same message to the top. The latest pinned message overwrites the earlier information. That is, the `PinnedInfo` user ID and pin time correspond to the last pinned message.

If the message is stored locally but deleted on the server due to expiration, the message fails to be pinned to the top.

For a single conversation, 20 messages can be pinned to the top by default.

```csharp
bool isPinned = true;
SDKClient.Instance.ChatManager.PinMessage(msgId, isPinned, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Unpin a message

To unpin a message in a one-to-one chat, chat group, or chat room, call `ChatManager#PinMessage` and set the `isPinned` parameter to `false`. As with pinned messages, other members of the one-to-one chat, chat group or chat room receive the `IChatManagerDelegate#OnMessagePinChanged` event when the pinned message is unpinned. In the case of multi-device login, the updated pin status is synchronized to other logged-in devices, and other devices receive the `IChatManagerDelegate#OnMessagePinChanged` event, respectively.

Any user in a one-to-one chat, group or room can unpin a message, regardless of who pinned it. After unpinning a message, `PinnedBy` and `PinnedAt` in `Message#PinnedInfo` are returned empty and set to `0`, respectively, and the message is no longer included in the pinned message list.

```csharp
bool isPinned = false;
SDKClient.Instance.ChatManager.PinMessage(msgId, isPinned, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Get pinned messages in a single conversation

You can call `ChatManager#GetPinnedMessagesFromServer` to get the pinned messages from a single conversation from the server. The SDK returns messages in the reverse order of pinning.

:::tip
If a message expires on the server or the user deletes it unilaterally from the server after pinning, such user will not be able to pull it when pulling roaming messages. However, this user and other users will be able to pull this message from the pinned message list.If the user withdraws a message after pinning, the message will be removed from the server; other users will not be able to pull it when they pull the pinned message list from the server.
:::

```csharp
SDKClient.Instance.ChatManager.GetPinnedMessagesFromServer(convId, new ValueCallBack>(
    onSuccess: (list) => {
        foreach (var it in list)
        {
            // Traverse the message list
        }
    },
    onError: (code, desc) => {
    }
));
```

### Get pinned details of a single message

You can call `PinnedInfo` to get the pinned details of a single message.

- If the message is pinned, this class returns the time of pinning and the user ID of the user who has pinned it.
- If the message is not pinned, then `PinnedBy` is returned empty and `PinnedAt` is set to `0`.

```csharp
// ...
const msg: ChatMessage;
const info = await msg.getPinInfo;
// todo: Get the pin information of the message
```

### Delete historical messages from the server unidirectionally

Call `RemoveMessagesFromServer` to delete historical messages one way from the server. You can remove a maximum of 50 messages from the server each time. Once the messages are deleted, you can no longer retrieve them from the server. The deleted messages are automatically removed from your local device. Other chat users can still get the messages from the server.

:::info
To use this function, you need to contact [support@agora.io](mailto:support@agora.io) to enable it.
:::

```csharp
SDKClient.Instance.ChatManager.RemoveMessagesFromServer(convId, ctype, time, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
SDKClient.Instance.ChatManager.RemoveMessagesFromServer(convId, ctype, msgList, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Delete conversations and related messages from the server unidirectionally

Call `DeleteConversationFromServer` to delete conversations and their historical messages unidirectionally from the server. After the conversations and messages are deleted from the server, you can no longer get them from the server. The deleted conversations still exist on your local device, but the messages are automatically removed from the device. Other chat users can still get the conversations and their historical messages from the server.

```csharp
SDKClient.Instance.ChatManager.DeleteConversationFromServer(conversationId, conversationType, isDeleteServerMessages, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Tag a conversation

To tag a conversation, use the `MarkConversations` method. This method allows you to add tags to both local and server-side conversations, that is, set the `isMark` parameter to 'true'. Each conversation can have up to 20 tags. This feature applies only to private chats and chat groups.

After adding a tag, you can retrieve the tagged conversations from the server by calling the `GetConversationsFromServerWithCursor` method. The returned conversation objects will include the conversation tag, which you can obtain using the `marks` property.

If the server conversation list reaches its limit (default 100 conversations per user), inactive conversations will be deleted based on conversation activity (timestamp of the latest message). Consequently, the conversation tags of these deleted conversations will also be removed.

:::info
Adding tags to a conversation, such as stars, does not affect other logic of the conversation, such as the number of unread messages in it.
:::

```csharp
List list = new List();
list.Add("huanhuan");
bool isMarked = true;
SDKClient.Instance.ChatManager.MarkConversations(list, isMarked, (MarkType)mark, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Remove conversation tag

You can call `MarkConversations` and set the `isMark` parameter to 'false' to untag a conversation. Tags can be removed for up to 20 conversations at a time. Calling this method removes both the local and server-side tags.

```csharp
List list = new List();
list.Add("huanhuan");
bool isMarked = false;
SDKClient.Instance.ChatManager.MarkConversations(list, isMarked, (MarkType)mark, new CallBack(
    onSuccess: () =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Query conversations from the server by the conversation tag

You can use the `GetConversationsFromServerWithCursor` method to retrieve a list of conversations from the server based on the tag. The SDK returns the conversation list in reverse order of the conversation tag's timestamp. Each conversation object includes the following information:

- Conversation ID
- Conversation type
- Pinned status (whether it is pinned or not)
- Pin time (For an unpinned conversation, the value is 0)
- Conversation tag
- Latest message

After fetching the conversation list from the server, the local conversation list is updated accordingly:

```csharp
SDKClient.Instance.ChatManager.GetConversationsFromServerWithCursor((MarkType)mark, cursor, limit, new ValueCallBack>(
   onSuccess: (result) =>
   {
       foreach (var conv in result.Data)
       {
       	//Iterate over the sessions in result.Data
       }
   },
   onError: (code, desc) =>
   {
   }
  ));
```

### Query local conversations by the conversation tag

For local conversations, you can call the `LoadAllConversations` method to obtain all local conversations and then perform conversation filtering yourself. The following is an example of querying all local conversations marked with `EMConversation.EMMarkType.MARK_0`:

```csharp
// All final query results are put into result.
List result = new List();
List localConversations = SDKClient.Instance.ChatManager.LoadAllConversations();
foreach(var conv in localConversations)
{
    List Marks = conv.Marks();
    foreach(var mark in Marks)
    {
        if (MarkType.MarkType0 == mark)
        {
            result.Add(conv);
        }
    }
}
```

### Get all tags of a local conversation

You can call `Conversation#Marks` to get all the tags of a local conversation. The sample code is as follows:

```csharp
Conversation conv = SDKClient.Instance.ChatManager.GetConversation("conversationId", conversationType);
List Marks = conv.Marks();
```

## Next steps

After implementing retrieving messages, you can refer to the following documents to add more messaging functionalities to your app:

- [Message receipts](./message-receipts)
