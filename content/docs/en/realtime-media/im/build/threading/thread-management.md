---
title: "Thread management"
description: "Shows how to use the Agora Chat SDK to create and manage threads in your app."
---

### All except Web

Threads enable users to create a separate conversation from a specific message within a chat group to keep the main chat uncluttered.

The following illustration shows the implementation of creating a thread, a conversation in a thread, and the operations you can perform in a thread.

### All except Web

### All except Windows

### All except Unity

![1655176216910](https://web-cdn.agora.io/docs-files/1655176216910)

### Web

Threads enable users to create a separate conversation from a specific message within a chat group to keep the main chat uncluttered, as shown in the following illustration:

### All except iOS

### All except Android

### All except React Native

### All except Flutter

![1655176932917](https://web-cdn.agora.io/docs-files/1655176932917)

This page shows how to use the Chat SDK to create and manage threads in your app.

## Understand the tech

### Android

The Chat SDK provides the `ChatThreadManager`, `ChatThread`, `ChatThreadChangeListener`, and `ChatThreadEvent` classes for thread management, which allow you to implement the following features:

### iOS

The Chat SDK provides the `AgoraChatThreadManager`, `AgoraChatThread`, `AgoraChatThreadManagerDelegate`, and `AgoraChatThreadEvent` classes for thread management, which allow you to implement the following features:

### Web

The Chat SDK allow you to implement the following features:

### Flutter

The Chat SDK provides the `ChatThreadManager`, `ChatThread`, `ChatThreadEventHandler`, and `ChatThreadEvent` classes for thread management, which allow you to implement the following features:

### React Native

The Chat SDK provides the `ChatManager`, `ChatMessageThread`, `ChatMessageEventListener`, and `ChatMessageThreadEvent` classes for thread management, which allow you to implement the following features:

### Windows

The Chat SDK for Windows provides the `IChatThreadManager`, `ChatThread`, `ChatThreadEvent`, and `IChatThreadManagerDelegate` classes for thread management, which allow you to implement the following features:

### Unity

The Chat SDK for Unity provides the `IChatThreadManager`, `ChatThread`, `ChatThreadEvent`, and `IChatThreadManagerDelegate` classes for thread management, which allow you to implement the following features:

- Create and destroy a thread
- Join and leave a thread
- Remove a member from a thread
- Update the name of a thread
- Retrieve the attributes of a thread
- Retrieve the member list of a thread
- Retrieve a thread list
- Retrieve the latest message from multiple threads
- Listen for thread events

## Prerequisites

Before proceeding, ensure that you meet the following requirements:

- You have initialized the Chat SDK. For details, see [SDK quickstart](../../get-started-sdk).
- You understand the call frequency limit of the Chat APIs supported by different pricing plans as described in [Limitations](../limitations).

:::info
The thread feature is supported by all types of [Pricing Plans](../pricing-plan-details) and is enabled by default once you have enabled Chat in [Agora Console](https://console.agora.io/v2).
:::

## Implementation

This section describes how to call the APIs provided by the Chat SDK to implement thread features.

### Android

### Create a thread

All chat group members can call `createChatThread` to create a thread from a specific message in a chat group.

Once a thread is created in a chat group, all chat group members receive the `ChatThreadChangeListener#onChatThreadCreated` callback. In a multi-device use-case, all the other devices receive the `MultiDeviceListener#onThreadEvent` callback triggered by the `THREAD_CREATE` event.

The following sample code shows how to create a thread in a chat group:

```java
// parentId: The ID of a chat group where a thread resides.
// messageId: The ID of a message, from which a thread is created.
// threadName: The name of a thread. The maximum length of a thread name is 64 characters.
ChatClient.getInstance().chatThreadManager().createChatThread(parentId, messageId, threadName, new ValueCallBack() {
    @Override
    public void onSuccess(ChatThread value) {
        
    }
    @Override
    public void onError(int error, String errorMsg) {
        
    }
});
```

### Destroy a thread

Only the chat group owner and admins can call `destroyChatThread` to disband a thread in a chat group.

Once a thread is disbanded, all chat group members receive the `ChatThreadChangeListener#onChatThreadDestroyed` callback. In a multi-device use-case, all the other devices receive the `MultiDeviceListener#onThreadEvent` callback triggered by the `THREAD_DESTROY` event.

:::info
Once a thread is destroyed or the chat group where a thread resides is destroyed, all data of the thread is deleted from the local database and memory.
:::

The following sample code shows how to destroy a thread:

```java
ChatClient.getInstance().chatThreadManager().destroyChatThread(chatThreadId, new CallBack() {
    @Override
    public void onSuccess() {
        
    }
    @Override
    public void onError(int code, String error) {
    }
});
```

### Join a thread

All chat group members can refer to the following steps to join a thread:

1. Use either of the following two approaches to retrieve the thread ID:
- Retrieve the thread list in a chat group by calling [`getChatThreadsFromServer`](#fetch), and locate the ID of the thread that you want to join.
- Retrieve the thread ID within the `ChatThreadChangeListener#onChatThreadCreated` and `ChatThreadChangeListener#onChatThreadUpdated` callbacks that you receive.

2. Call `joinChatThread` to pass in the thread ID and join the specified thread.

In a multi-device use-case, all the other devices receive the `MultiDeviceListener#onThreadEvent` callback triggered by the `THREAD_JOIN` event.

The following sample code shows how to join a thread:

```java
ChatClient.getInstance().chatThreadManager().joinChatThread(chatThreadId, new ValueCallBack() {
    @Override
    public void onSuccess(ChatThread value) {
        
    }
    @Override
    public void onError(int error, String errorMsg) {
    }
});
```

### Leave a thread

All thread members can call `leaveChatThread` to leave a thread. Once a member leaves a thread, they can no longer receive the thread messages.

In a multi-device use-case, all the other devices receive the `MultiDeviceListener#onThreadEvent` callback triggered by the `THREAD_LEAVE` event.

The following sample code shows how to leave a thread:

```java
ChatClient.getInstance().chatThreadManager().leaveChatThread(chatThreadId, new CallBack() {
    @Override
    public void onSuccess() {
        
    }
    @Override
    public void onError(int code, String error) {
    }
});
```

### Remove a member from a thread

Only the chat group owner and admins can call `removeMemberFromChatThread` to remove the specified member from a thread.

Once a member is removed from a thread, they receive the `ChatThreadChangeListener#onChatThreadUserRemoved` callback and can no longer receive the thread messages. In a multi-device use-case, all the other devices receive the `MultiDeviceListener#onChatThreadEvent` callback triggered by the `THREAD_KICK` event.

The following sample code shows how to remove a member from a thread:

```java
// chatThreadId: : The ID of a thread.
// member: The ID of the user to be removed from a thread.
ChatClient.getInstance().chatThreadManager().removeMemberFromChatThread(chatThreadId, member, 
        new CallBack() {
    @Override
    public void onSuccess() {
        
    }
    @Override
    public void onError(int code, String error) {
    }
});
```

### Update the name of a thread

Only the chat group owner, chat group admins, and thread creator can call `updateChatThreadName` to update a thread name.

Once a thread name is updated, all chat group members receive the `ChatThreadChangeListener#onChatThreadUpdated` callback. In a multi-device use-case, all the other devices receive the `MultiDeviceListener#onThreadEvent` callback triggered by the `THREAD_UPDATE` event.

The following sample code shows how to update a thread name:

```java
// chatThreadId: The ID of a thread.
// newChatThreadName: The updated thread name. The maximum length of a thread name is 64 characters.
ChatClient.getInstance().chatThreadManager().updateChatThreadName(chatThreadId, newChatThreadName, 
        new CallBack() {
    @Override
    public void onSuccess() {
        
    }
    @Override
    public void onError(int code, String error) {
    }
});
```

### Retrieve the attributes of a thread

All chat group members can call `getChatThreadFromServer` to retrieve the thread attributes from the server.

The following sample code shows how to retrieve the thread attributes:

```java
// chatThreadID: The thread ID.
ChatClient.getInstance().chatThreadManager().getChatThreadFromServer(chatThreadId, new ValueCallBack() {
    @Override
    public void onSuccess(ChatThread value) {
        
    }
    @Override
    public void onError(int error, String errorMsg) {
    }
});
```

### Retrieve the member list of a thread

All chat group members can call `getChatThreadMembers` to retrieve the paginated member list of a thread from the server, as shown in the following sample code:

```java
// chatThreadId: The thread ID.
// limit: The maximum number of members to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
ChatClient.getInstance().chatThreadManager().getChatThreadMembers(chatThreadId, limit, cursor, 
        new ValueCallBack>() {
    @Override
    public void onSuccess(CursorResult value) {
        
    }
    @Override
    public void onError(int error, String errorMsg) {
    }
});
```

### Retrieve a thread list

Users can call `getJoinedChatThreadsFromServer` to retrieve a paginated list of all the threads they have joined from the server, as shown in the following sample code:

```java
// limit: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
ChatClient.getInstance().chatThreadManager().getJoinedChatThreadsFromServer(limit, cursor, 
        new ValueCallBack>() {
    @Override
    public void onSuccess(CursorResult value) {
        
    }
    @Override
    public void onError(int error, String errorMsg) {
    }
});
```

Users can call `getJoinedChatThreadsFromServer` to retrieve a paginated list of all the threads they have joined in a specified chat group from the server, as shown in the following sample code:

```java
// parentId: The chat group ID.
// limit: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call. 
ChatClient.getInstance().chatThreadManager().getJoinedChatThreadsFromServer(parentId, limit, cursor, 
        new ValueCallBack>() {
    @Override
    public void onSuccess(CursorResult value) {
        
    }
    @Override
    public void onError(int error, String errorMsg) {
    }
});
```

Users can also call `getChatThreadsFromServer` to retrieve a paginated list of all the threads in a specified chat group from the server, as shown in the following sample code:

```java
// parentId: The chat group ID.
// limit: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call. 
ChatClient.getInstance().chatThreadManager().getChatThreadsFromServer(parentId, limit, cursor, 
        new ValueCallBack>() {
    @Override
    public void onSuccess(CursorResult value) {
        
    }
    @Override
    public void onError(int error, String errorMsg) {
    }
});
```

### Retrieve the latest message from multiple threads

Users can call `getChatThreadLatestMessage` to retrieve the latest message from multiple threads.

The following sample code shows how to retrieve the latest message from multiple threads:

```java
// chatThreadIdList: The thread IDs. You can pass in a maximum of 20 thread IDs.
ChatClient.getInstance().chatThreadManager().getChatThreadLatestMessage(chatThreadIdList, 
        new ValueCallBack>() {
    @Override
    public void onSuccess(Map value) {
        
    }
    @Override
    public void onError(int error, String errorMsg) {
    }
});
```

### Listen for thread events

To monitor thread events, users can listen for the callbacks in the `ChatThreadManager` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following sample code to listen for thread events:

```java
ChatThreadChangeListener chatThreadChangeListener = new ChatThreadChangeListener() {
    @Override
    // Occurs when a thread is created.
    public void onChatThreadCreated(ChatThreadEvent event) {}
    @Override
    // Occurs when a thread has a new message, a thread name is updated, or a thread message is recalled.
    public void onChatThreadUpdated(ChatThreadEvent event) {}
    // Occurs when a thread is destroyed.
    @Override
    public void onChatThreadDestroyed(ChatThreadEvent event) {}
    // Occurs when a member is removed from a thread.
    @Override
    public void onChatThreadUserRemoved(ChatThreadEvent event) {}
};
// Adds the thread listener.
ChatClient.getInstance().chatThreadManager().addChatThreadChangeListener(chatThreadChangeListener);
// Removes the thread listener.
ChatClient.getInstance().chatThreadManager().removeChatThreadChangeListener(chatThreadChangeListener);
```

### iOS

### Create a thread

All chat group members can call `createChatThread` to create a thread from a specific message in a chat group.

Once a thread is created in a chat group, all chat group members receive the `AgoraChatThreadManagerDelegate#onChatThreadCreated` callback. In a multi-device use-case, all the other devices receive the `AgoraChatMultiDevicesDelegate#multiDevicesThreadEventDidReceive` callback triggered by the `AgoraChatMultiDevicesEventThreadCreate` event. 

The following sample code shows how to create a thread in a chat group:

```objc
// threadName: The name of a thread. The maximum length of a thread name is 64 characters.
// messageId: The ID of a message, from which a thread is created.
// parentId: The ID of a chat group where a thread resides.
[[AgoraChatClient sharedClient].threadManager createChatThread:self.threadName messageId:self.message.messageId parentId:self.message.to completion:^(AgoraChatThread *thread, AgoraChatError *aError) {
    if (!aError) {

    } else {

    }
}];
```

### Destroy a thread

Only the chat group owner and admins can call `destroyChatThread` to disband a thread in a chat group.

Once a thread is disbanded, all chat group members receive the `AgoraChatThreadManagerDelegate#onChatThreadDestroyed` callback. In a multi-device use-case, all the other devices receive the `AgoraChatMultiDevicesDelegate#multiDevicesThreadEventDidReceive` callback triggered by the `AgoraChatMultiDevicesEventThreadDestroy` event. 

:::info
Once a thread is destroyed or the chat group where a thread resides is destroyed, all data of the thread is deleted from the local database and memory.
:::

The following sample code shows how to destroy a thread:

```objc
[AgoraChatClient.sharedClient.threadManager destroyChatThread:self.conversationId completion:^(AgoraChatError *aError) {
    if (!aError) {

    } else {

    }
}];
```

### Join a thread

All chat group members can refer to the following steps to join a thread:

1. Use either of the following two approaches to retrieve the thread ID:
- Retrieve the thread list in a chat group by calling [`getChatThreadsFromServer`](#fetch), and locate the ID of the thread that you want to join.
- Retrieve the thread ID within the `AgoraChatThreadManagerDelegate#onChatThreadCreated` and `AgoraChatThreadManagerDelegate#onChatThreadUpdated` callbacks that you receive.

2. Call `joinChatThread` to pass in the thread ID and join the specified thread.

In a multi-device use-case, all the other devices receive the `AgoraChatMultiDevicesDelegate#multiDevicesThreadEventDidReceive` callback triggered by the `AgoraChatMultiDevicesEventThreadJoin` event. 

The following sample code shows how to join a thread:

```objc
[AgoraChatClient.sharedClient.threadManager joinChatThread:model.message.threadOverView.threadId completion:^(AgoraChatThread *thread,AgoraChatError *aError) {
    if (!aError || aError.code == AgoraChatErrorUserAlreadyExist) {
  
    }
}];
```

### Leave a thread

All thread members can call `leaveChatThread` to leave a thread. Once a member leaves a thread, they can no longer receive the thread messages.

In a multi-device use-case, all the other devices receive the `AgoraChatMultiDevicesDelegate#multiDevicesThreadEventDidReceive` callback triggered by the `AgoraChatMultiDevicesEventThreadLeave` event. 

The following sample code shows how to leave a thread:

```objc
[AgoraChatClient.sharedClient.threadManager leaveChatThread:self.conversationId completion:^(AgoraChatError *aError) {
    if (!aError) {

    } else {

    }
}];
```

### Remove a member from a thread

Only the chat group owner and admins can call `removeMemberFromChatThread` to remove the specified member from a thread.

Once a member is removed from a thread, they receive the `AgoraChatThreadManagerDelegate#onUserKickOutOfChatThread` callback and can no longer receive the thread messages. In a multi-device use-case, all the other devices receive the `AgoraChatMultiDevicesDelegate#multiDevicesThreadEventDidReceive` callback triggered by the `AgoraChatMultiDevicesEventChatThreadKick` event.

The following sample code shows how to remove a member from a thread:

```objc
// chatThreadId: The ID of a thread.
// member: The ID of the user to be removed from a thread.
[AgoraChatClient.sharedClient.threadManager removeMemberFromChatThread:member threadId:self.threadId completion:^(AgoraChatError *aError) {
    if (!aError) {

    } else {

    }
}];
```

### Update the name of a thread

Only the chat group owner, chat group admins, and thread creator can call `updateChatThreadName` to update a thread name.

Once a thread name is updated, all chat group members receive the `AgoraChatThreadManagerDelegate#onChatThreadUpdated` callback. In a multi-device use-case, all the other devices receive the `AgoraChatMultiDevicesDelegate#multiDevicesThreadEventDidReceive` callback triggered by the `AgoraChatMultiDevicesEventThreadUpdate` event.

The following sample code shows how to update a thread name:

```objc
// threadId: The ID of a thread.
// ThreadName: The updated thread name. The maximum length of a thread name is 64 characters.
[AgoraChatClient.sharedClient.threadManager updateChatThreadThreadName:self.threadNameField.text threadId:self.threadId completion:^(AgoraChatError *aError) {
    if (!aError) {

    } else {

    }
}];
```

### Retrieve the attributes of a thread

All chat group members can call `getChatThreadDetail` to retrieve the thread attributes from the server.

The following sample code shows how to retrieve the thread attributes:

```objc
// threadId: The thread ID.
[AgoraChatClient.sharedClient.threadManager getChatThreadDetail:self.currentConversation.conversationId completion:^(AgoraChatThread *thread, AgoraChatError *aError) {
    if (!aError) {

    } else {

    }
}];
```

### Retrieve the member list of a thread

All chat group members can call `getChatThreadMemberListFromServerWithId` to retrieve a paginated member list of a thread from the server, as shown in the following sample code:

```objc
// threadId: The thread ID.
// pageSize: The maximum number of members to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `nil` or an empty string at the first call.
[[AgoraChatClient sharedClient].threadManager getChatThreadMemberListFromServerWithId:self.threadId cursor:aCursor pageSize:pageSize completion:^(AgoraChatCursorResult *aResult, AgoraChatError *aError) {
    if !aError { self.cursor = aResult; }
}];
```

### Retrieve a thread list

Users can call `getJoinedChatThreadsFromServer` to retrieve a paginated list from the server of all the threads they have joined, as shown in the following sample code:

```objc
// limit: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `nil` or an empty string at the first call.        
[AgoraChatClient.sharedClient.threadManager getJoinedChatThreadsFromServerWithCursor:@"" pageSize:20 completion:^(AgoraChatCursorResult * _Nonnull result, AgoraChatError * _Nonnull aError) {
        
}];
```

Users can call `getJoinedChatThreadsFromServer` to retrieve a paginated list from the server of all the threads they have joined in a specified chat group, as shown in the following sample code:

```objc
// parentId: The chat group ID.
// pageSize: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `nil` or an empty string at the first call. 
[AgoraChatClient.sharedClient.threadManager getJoinedChatThreadsFromServerWithParentId:self.group.groupId cursor:self.cursor ? self.cursor.cursor:@"" pageSize:20 completion:^(AgoraChatCursorResult * _Nonnull result, AgoraChatError * _Nonnull aError) {
    if (!aError) {

    }
}];
```

Users can also call `getChatThreadsFromServer` to retrieve a paginated list from the server of all the threads in a specified chat group, as shown in the following sample code:

```objc
// parentId: The chat group ID.
// pageSize: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `nil` or an empty string at the first call. 
[[AgoraChatClient sharedClient].threadManager getChatThreadsFromServerWithParentId:self.group.groupId cursor:self.cursor ? self.cursor.cursor:@"" pageSize:20 completion:^(AgoraChatCursorResult *result, AgoraChatError *aError) {
    if (!aError) {

    }
}];
```

### Retrieve the latest message from multiple threads

Users can call `getLastMessageFromSeverWithChatThreads` to retrieve the latest message from multiple threads.

The following sample code shows how to retrieve the latest message from multiple threads:

```objc
// threadIds: The thread IDs. You can pass in a maximum of 20 thread IDs.
[[AgoraChatClient sharedClient].threadManager getLastMessageFromSeverWithChatThreads:ids completion:^(NSDictionary * _Nonnull messageMap, AgoraChatError * _Nonnull aError) {
    if (!aError) {

    }
}];
```

### Listen for thread events

To monitor thread events, users can listen for the callbacks in the `AgoraChatThreadManager` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following sample code to listen for thread events:

```objc
AgoraChatThreadManagerDelegate 
// Occurs when a thread is created.
- (void)onChatThreadCreate:(AgoraChatThreadEvent *)event;

// Occurs when a thread has a new message, a thread name is updated, or a thread message is recalled.
- (void)onChatThreadUpdate:(AgoraChatThreadEvent *)event;

// Occurs when a thread is destroyed.
- (void)onChatThreadDestroy:(AgoraChatThreadEvent *)event;

// Occurs when a member is removed from a thread.
- (void)onUserKickOutOfChatThread:(AgoraChatThreadEvent *)event;

// Adds the thread listener.
[[AgoraChatClient sharedClient].threadManager addDelegate:self delegateQueue:nil];
// Removes the thread listener.
[[AgoraChatClient sharedClient].threadManager removeDelegate:self];
```

### Web

### Create a thread

All chat group members can call `createChatThread` to create a thread from a specific message in a chat group.

Once a thread is created in a chat group, all chat group members receive the `onChatThreadChange` callback triggered by the `create` event. In a multi-device use-case, all the other devices receive the `onMultiDeviceEvent` callback triggered by the `chatThreadCreate` event.

The following sample code shows how to create a thread in a chat group:

```javascript
// parentId: The ID of a chat group where a thread resides.
// threadName: The name of a thread. The maximum length of a thread name is 64 characters.
// messageId: The ID of a message, from which a thread is created.
chatClient.createChatThread({
  parentId: "parentId",
  name: "threadName",
  messageId: "messageId",
});
// Listen for the creating thread callback.
chatClient.addEventHandler("handlerId", {
  onChatThreadChange: (threadMsg) => {
    console.log(threadMsg);
  },
});
```

### Destroy a thread

Only the chat group owner and admins can call `destroyChatThread` to disband a thread in a chat group.

Once a thread is disbanded, all chat group members receive the `onChatThreadChange` callback triggered by the `destroy` event. In a multi-device use-case, all the other devices receive the `onMultiDeviceEvent` callback triggered by the `chatThreadDestroy` event.

:::info
Once a thread is destroyed or the chat group where a thread resides is
  destroyed, all data of the thread is deleted from the local database and
  memory.
:::

The following sample code shows how to destroy a thread:

```javascript
// chatThreadId: The ID of a thread that you want to destroy.
chatClient.destroyChatThread({ chatThreadId: "chatThreadId" });
// Listen for the destroying thread callback.
chatClient.addEventHandler("handlerId", {
  onChatThreadChange: (threadMsg) => {
    console.log(threadMsg);
  },
});
```

### Join a thread

All chat group members can refer to the following steps to join a thread:

1. Use either of the following two approaches to retrieve the thread ID:

- Retrieve the thread list in a chat group by calling [`getChatThreads`](#fetch), and locate the ID of the thread that you want to join.
- Retrieve the thread ID within the `onChatThreadChange` callback that you receive.

2. Call `joinChatThread` to pass in the thread ID and join the specified thread.

In a multi-device use-case, all the other devices receive the `onMultiDeviceEvent` callback triggered by the `chatThreadJoin` event.

The following sample code shows how to join a thread:

```javascript
// chatThreadId: The ID of a thread that you want to join.
chatClient.joinChatThread({ chatThreadId: "chatThreadId" });
```

### Leave a thread

All thread members can call `leaveChatThread` to leave a thread. Once a member leaves a thread, they can no longer receive the thread messages.

In a multi-device use-case, all the other devices receive the `onMultiDeviceEvent` callback triggered by the `chatThreadLeave` event.

The following sample code shows how to leave a thread:

```javascript
// chatThreadId: The ID of a thread that you want to leave.
chatClient.leaveChatThread({ chatThreadId: "chatThreadId" });
```

### Remove a member from a thread

Only the chat group owner and admins can call `removeChatThreadMember` to remove the specified member from a thread.

Once a member is removed from a thread, they receive the `onChatThreadChange` callback triggered by the `userRemove` event and can no longer receive the thread messages.

The following sample code shows how to remove a member from a thread:

```javascript
// chatThreadId: The ID of a thread.
// username: The ID of the user to be removed from a thread.
chatClient.removeChatThreadMember({
  chatThreadId: "chatThreadId",
  username: "username",
});
```

### Update the name of a thread

Only the chat group owner, chat group admins, and thread creator can call `changeChatThreadName` to update a thread name.

Once a thread name is updated, all chat group members receive the `onChatThreadChange` callback triggered by the `update` event. In a multi-device use-case, all the other devices receive the `onMultiDeviceEvent` callback triggered by the `chatThreadNameUpdate` event.

The following sample code shows how to update a thread name:

```javascript
// chatThreadId: The ID of a thread.
// name: The updated thread name. The maximum length of a thread name is 64 characters.
chatClient.changeChatThreadName({ chatThreadId: "chatThreadId", name: "name" });
// Listen for the updating thread name callback.
chatClient.addEventHandler("handlerId", {
  onChatThreadChange: (threadMsg) => {
    console.log(threadMsg);
  },
});
```

### Retrieve the attributes of a thread

All chat group members can call `getChatThreadDetail` to retrieve the thread attributes from the server.

The following sample code shows how to retrieve the thread attributes:

```javascript
// chatThreadID: The thread ID.
chatClient.getChatThreadDetail({ chatThreadId: "chatThreadId" }).then((res) => {
  console.log(res);
});
```

### Retrieve the member list of a thread

All chat group members can call `getChatThreadMembers` to retrieve a paginated member list of a thread from the server, as shown in the following sample code:

```javascript
// chatThreadId: The thread ID.
// pageSize: The maximum number of members to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
chatClient
  .getChatThreadMembers({
    chatThreadId: "chatThreadId ",
    pageSize: 20,
    cursor: null,
  })
  .then((res) => {
    console.log(res);
  });
```

### Retrieve a thread list

Users can call `getJoinedChatThreads` to retrieve a paginated list from the server of all the threads they have joined, as shown in the following sample code:

```javascript
// pageSize: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
chatClient
  .getJoinedChatThreads({ cursor: "cursor", pageSize: 20 })
  .then((res) => {
    console.log(res);
  });
```

Users can call `getJoinedChatThreads` to retrieve a paginated list from the server of all the threads they have joined in a specified chat group, as shown in the following sample code:

```javascript
// parentId: The chat group ID.
// pageSize: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
chatClient
  .getJoinedChatThreads({
    parentId: "parentId",
    pageSize: 20,
    cursor: null,
  })
  .then((res) => {
    console.log(res);
  });
```

Users can also call `getChatThreads` to retrieve a paginated list from the server of all the threads in a specified chat group, as shown in the following sample code:

```javascript
// parentId: The chat group ID.
// pageSize: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
chatClient
  .getChatThreads({ parentId: "parentId", pageSize: 20, cursor: null })
  .then((res) => {
    console.log(res);
  });
```

### Retrieve the latest message from multiple threads

Users can call `getChatThreadLastMessage` to retrieve the latest message from multiple threads.

The following sample code shows how to retrieve the latest message from multiple threads:

```javascript
// chatThreadIds: The thread IDs. You can pass in a maximum of 20 thread IDs.
chatClient
  .getChatThreadLastMessage({
    chatThreadIds: ["chatThreadId1", "chatThreadId2"],
  })
  .then((res) => {
    console.log(res);
  });
```

### Flutter

### Create a thread

All chat group members can call `createChatThread` to create a thread from a specific message in a chat group.

Once a thread is created in a chat group, all chat group members receive the `ChatThreadEventHandler#onChatThreadCreate` callback. In a multi-device use-case, all the other devices receive the `ChatMultiDeviceListener#onChatThreadEvent` callback triggered by the `ChatMultiDevicesEvent#CHAT_THREAD_CREATE` event.

The following sample code shows how to create a thread in a chat group:

```dart
// name: The name of a thread. The maximum length of a thread name is 64 characters.
// messageId: The ID of a message, from which a thread is created.
// parentId: The ID of a chat group where a thread resides.
try {
  ChatThread chatThread =
      await ChatClient.getInstance.chatThreadManager.createChatThread(
    name: name,
    messageId: messageId,
    parentId: parentId,
  );
} on ChatError catch (e) {
}
```

### Destroy a thread

Only the chat group owner and admins can call `destroyChatThread` to disband a thread in a chat group.

Once a thread is disbanded, all chat group members receive the `ChatThreadEventHandler#onChatThreadDestroy` callback. In a multi-device use-case, all the other devices receive the `ChatMultiDeviceListener#onChatThreadEvent` callback triggered by the `ChatMultiDevicesEvent#CHAT_THREAD_DESTROY` event.

:::info
Once a thread is destroyed or the chat group where a thread resides is destroyed, all data of the thread is deleted from the local database and memory.
:::

The following sample code shows how to destroy a thread:

```dart
// chatThreadID: The ID of a thread.
try {
  await ChatClient.getInstance.chatThreadManager.destroyChatThread(
    chatThreadId: chatThreadId,
  );
} on ChatError catch (e) {
}
```

### Join a thread

All chat group members can refer to the following steps to join a thread:

1. Use either of the following two approaches to retrieve the thread ID:
- Retrieve the thread list in a chat group by calling [`fetchChatThreadsWithParentId`](#fetch), and locate the ID of the thread that you want to join.
- Retrieve the thread ID within the `ChatThreadEventHandler#onChatThreadCreate` and `ChatThreadEventHandler#onChatThreadUpdate` callbacks that you receive.

2. Call `joinChatThread` to pass in the thread ID and join the specified thread.

In a multi-device use-case, all the other devices receive the `ChatMultiDeviceListener#onChatThreadEvent` callback triggered by the `ChatMultiDevicesEvent#CHAT_THREAD_JOIN` event.

The following sample code shows how to join a thread:

```dart
// chatThreadId: The ID of a thread.
try {
  ChatThread chatThead =
      await ChatClient.getInstance.chatThreadManager.joinChatThread(
    chatThreadId: chatThreadId,
  );
} on ChatError catch (e) {
}
```

### Leave a thread

All thread members can call `leaveChatThread` to leave a thread. Once a member leaves a thread, they can no longer receive the thread messages.

In a multi-device use-case, all the other devices receive the `ChatMultiDeviceListener#onThreadEvent` callback triggered by the `ChatMultiDevicesEvent#CHAT_THREAD_LEAVE` event.

The following sample code shows how to leave a thread:

```dart
// chatThreadId: The ID of a thread.
try {
  await ChatClient.getInstance.chatThreadManager.leaveChatThread(
    chatThreadId: chatThreadId,
  );
} on ChatError catch (e) {
}
```

### Remove a member from a thread

Only the chat group owner and admins can call `removeMemberFromChatThread` to remove the specified member from a thread.

Once a member is removed from a thread, they receive the `ChatThreadEventHandler#onUserKickOutOfChatThread` callback and can no longer receive the thread messages. In a multi-device use-case, all the other devices receive the `ChatMultiDeviceListener#onChatThreadEvent` callback triggered by the `ChatMultiDevicesEvent#CHAT_THREAD_KICK` event.

The following sample code shows how to remove a member from a thread:

```dart
// chatThreadId: The ID of a thread.
// memberId: The ID of the user to be removed from a thread.
try {
  await ChatClient.getInstance.chatThreadManager.removeMemberFromChatThread(
    memberId: memberId,
    chatThreadId: chatThreadId,
  );
} on ChatError catch (e) {
}
```

### Update the name of a thread

Only the chat group owner, chat group admins, and thread creator can call `updateChatThreadName` to update a thread name.

Once a thread name is updated, all chat group members receive the `ChatThreadEventHandler#onChatThreadUpdate` callback. In a multi-device use-case, all the other devices receive the `ChatMultiDeviceListener#onThreadEvent` callback triggered by the `ChatMultiDevicesEvent#CHAT_THREAD_UPDATE` event.

The following sample code shows how to update a thread name:

```dart
// chatThreadId: The ID of a thread.
// name: The updated thread name. The maximum length of a thread name is 64 characters.
try {
  await ChatClient.getInstance.chatThreadManager.updateChatThreadName(
    newName: name,
    chatThreadId: chatThreadId,
  );
} on ChatError catch (e) {
}
```

### Retrieve the attributes of a thread

All chat group members can call `fetchChatThread` to retrieve the thread attributes from the server.

The following sample code shows how to retrieve the thread attributes:

```dart
// chatThreadId: The ID of a thread.
try {
  ChatThread? chatThread =
      await ChatClient.getInstance.chatThreadManager.fetchChatThread(
    chatThreadId: chatThreadId,
  );
} on ChatError catch (e) {
}
```

### Retrieve the member list of a thread

All chat group members can call `fetchChatThreadMember` to retrieve a paginated member list of a thread from the server, as shown in the following sample code:

```dart
// chatThreadId: The thread ID.
// limit: The maximum number of members to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
try {
  List members =
      await ChatClient.getInstance.chatThreadManager.fetchChatThreadMember(
    chatThreadId: chatThreadId,
    limit: limit,
    cursor: cursor,
  );
} on ChatError catch (e) {
}
```

### Retrieve a thread list

Users can call `fetchJoinedChatThreads` to retrieve a paginated list from the server of all the threads they have joined, as shown in the following sample code:

```dart
// limit: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
try {
  ChatCursorResult chatThreads =
      await ChatClient.getInstance.chatThreadManager.fetchJoinedChatThreads(
    limit: limit,
    cursor: cursor,
  );
} on ChatError catch (e) {
}
```

Users can call `fetchJoinedChatThreadsWithParentId` to retrieve a paginated list from the server of all the threads they have joined in a specified chat group, as shown in the following sample code:

```dart
// parentId: The chat group ID.
// limit: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
try {
  ChatCursorResult chatThreads = await ChatClient
      .getInstance.chatThreadManager
      .fetchJoinedChatThreadsWithParentId(
    parentId: parentId,
    limit: limit,
    cursor: cursor,
  );
} on ChatError catch (e) {
}
```

Users can also call `fetchChatThreadsWithParentId` to retrieve a paginated list from the server of all the threads in a specified chat group, as shown in the following sample code:

```dart
// parentId: The chat group ID.
// limit: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
try {
  ChatCursorResult chatThreads = await ChatClient
      .getInstance.chatThreadManager
      .fetchChatThreadsWithParentId(
    parentId: parentId,
    limit: limit,
    cursor: cursor,
  );
} on ChatError catch (e) {
}
```

### Retrieve the latest message from multiple threads

Users can call `fetchLatestMessageWithChatThreads` to retrieve the latest message from multiple threads.

The following sample code shows how to retrieve the latest message from multiple threads:

```dart
// chatThreadIds: The thread IDs. You can pass in a maximum of 20 thread IDs at each call.
try {
  Map map = await ChatClient.getInstance.chatThreadManager
      .fetchLatestMessageWithChatThreads(
    chatThreadIds: chatThreadIds,
  );
} on ChatError catch (e) {
}
```

### Listen for thread events

To monitor thread events, users can listen for the callbacks in the `ChatThreadManager` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following sample code to listen for thread events:

```dart
// Inherits and implements ChatThreadEventHandler.
class _ChatPageState extends State
    implements ChatThreadEventHandler {
  // Adds the thread listener.
  @override
  void initState() {
    super.initState();
    ChatClient.getInstance.chatThreadManager.addChatThreadEventHandler(this);
  }
  // Removes the thread listener.
  @override
  void dispose() {
    ChatClient.getInstance.chatThreadManager
        .removeChatThreadEventHandler(this);
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    return Container();
  }
  // Occurs when a thread is created.
  @override
  void onChatThreadCreate(ChatThreadEvent event) {}
  // Occurs when a thread is destroyed.
  @override
  void onChatThreadDestroy(ChatThreadEvent event) {}
  // Occurs when a thread has a new message, a thread name is updated, or a thread message is recalled.
  @override
  void onChatThreadUpdate(ChatThreadEvent event) {}
  // Occurs when a member is removed from a thread.
  @override
  void onUserKickOutOfChatThread(ChatThreadEvent event) {}
}
```

### React Native

### Create a thread

All chat group members can call `createChatThread` to create a thread from a specific message in a chat group.

Once a thread is created in a chat group, all chat group members receive the `ChatMessageEventListener#onChatMessageThreadCreated` callback. In a multi-device use-case, all the other devices receive the `ChatMultiDeviceEventListener#onThreadEvent` callback triggered by the `THREAD_CREATE` event.

The following sample code shows how to create a thread in a chat group:

```typescript
// name: The name of a thread. The maximum length of a thread name is 64 characters.
// msgId: The ID of a message, from which a thread is created.
// parentId: The ID of a chat group where a thread resides.
ChatClient.getInstance()
  .chatManager.createChatThread(name, msgId, parentId)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Destroy a thread

Only the chat group owner and admins can call `destroyChatThread` to disband a thread in a chat group.

Once a thread is disbanded, all chat group members receive the `ChatMessageEventListener#onChatMessageThreadDestroyed` callback. In a multi-device use-case, all the other devices receive the `ChatMultiDeviceEventListener#onThreadEvent` callback triggered by the `THREAD_DESTROY` event.

:::info
Once a thread is destroyed or the chat group where a thread resides is destroyed, all data of the thread is deleted from the local database and memory.
:::

The following sample code shows how to destroy a thread:

```typescript
// chatThreadID: The ID of a thread.
ChatClient.getInstance()
  .chatManager.destroyChatThread(chatThreadID)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Join a thread

All chat group members can refer to the following steps to join a thread:

1. Use either of the following two approaches to retrieve the thread ID:
- Retrieve the thread list in a chat group by calling [`fetchChatThreadWithParentFromServer`](#fetch), and locate the ID of the thread that you want to join.
- Retrieve the thread ID within the `ChatMessageEventListener#onChatMessageThreadCreated` and `ChatMessageEventListener#onChatMessageThreadUpdated` callbacks that you receive.

2. Call `joinChatThread` to pass in the thread ID and join the specified thread.

In a multi-device use-case, all the other devices receive the `ChatMultiDeviceEventListener#onThreadEvent` callback triggered by the `THREAD_JOIN` event.

The following sample code shows how to join a thread:

```typescript
// chatThreadID: The ID of a thread.
ChatClient.getInstance()
  .chatManager.joinChatThread(chatThreadID)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Leave a thread

All thread members can call `leaveChatThread` to leave a thread. Once a member leaves a thread, they can no longer receive the thread messages.

In a multi-device use-case, all the other devices receive the `ChatMultiDeviceEventListener#onThreadEvent` callback triggered by the `THREAD_LEAVE` event.

The following sample code shows how to leave a thread:

```typescript
// chatThreadID: The ID of a thread.
ChatClient.getInstance()
  .chatManager.leaveChatThread(chatThreadID)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Remove a member from a thread

Only the chat group owner and admins can call `removeMemberWithChatThread` to remove the specified member from a thread.

Once a member is removed from a thread, they receive the `ChatMessageEventListener#onUserRemoved` callback and can no longer receive the thread messages. In a multi-device use-case, all the other devices receive the `ChatMultiDeviceEventListener#onThreadEvent` callback triggered by the `THREAD_KICK` event.

The following sample code shows how to remove a member from a thread:

```typescript
// chatThreadID: The ID of a thread.
// member: The ID of the user to be removed from a thread.
ChatClient.getInstance()
  .chatManager.removeMemberWithChatThread(chatThreadID, memberId)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Update the name of a thread

Only the chat group owner, chat group admins, and thread creator can call `updateChatThreadName` to update a thread name.

Once a thread name is updated, all chat group members receive the `ChatMessageEventListener#onChatMessageThreadUpdated` callback. In a multi-device use-case, all the other devices receive the `ChatMultiDeviceEventListener#onThreadEvent` callback triggered by the `THREAD_UPDATE` event.

The following sample code shows how to update a thread name:

```typescript
// chatThreadID: The ID of a thread.
// newChatThreadName: The updated thread name. The maximum length of a thread name is 64 characters.
ChatClient.getInstance()
  .chatManager.updateChatThreadName(chatThreadID, newName)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Retrieve the attributes of a thread

All chat group members can call `fetchChatThreadFromServer` to retrieve the thread attributes from the server.

The following sample code shows how to retrieve the thread attributes:

```typescript
// chatThreadID: The ID of a thread.
ChatClient.getInstance()
  .chatManager.fetchChatThreadFromServer(chatThreadID)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Retrieve the member list of a thread

All chat group members can call `fetchMembersWithChatThreadFromServer` to retrieve a paginated member list of a thread from the server, as shown in the following sample code:

```typescript
// chatThreadId: The ID of a thread.
// pageSize: The maximum number of members to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
ChatClient.getInstance()
  .chatManager.fetchMembersWithChatThreadFromServer(
    chatThreadID,
    cursor,
    pageSize
  )
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Retrieve a thread list

Users can call `fetchJoinedChatThreadFromServer` to retrieve a paginated list from the server of all the threads they have joined, as shown in the following sample code:

```typescript
// pageSize: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
ChatClient.getInstance()
  .chatManager.fetchJoinedChatThreadFromServer(cursor, pageSize)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

Users can call `fetchJoinedChatThreadWithParentFromServer` to retrieve a paginated list from the server of all the threads they have joined in a specified chat group, as shown in the following sample code:

```typescript
// parentId: The chat group ID.
// pageSize: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
ChatClient.getInstance()
  .chatManager.fetchJoinedChatThreadWithParentFromServer(
    parentId,
    cursor,
    pageSize
  )
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

Users can also call `fetchChatThreadWithParentFromServer` to retrieve a paginated list from the server of all the threads in a specified chat group, as shown in the following sample code:

```typescript
// parentId: The chat group ID.
// pageSize: The maximum number of threads to retrieve per page. The range is [1, 50].
// cursor: The position from which to start getting data. Pass in `null` or an empty string at the first call.
ChatClient.getInstance()
  .chatManager.fetchChatThreadWithParentFromServer(parentId, cursor, pageSize)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Retrieve the latest message from multiple threads

Users can call `fetchLastMessageWithChatThread` to retrieve the latest message from multiple threads.

The following sample code shows how to retrieve the latest message from multiple threads:

```typescript
// chatThreadIDs: The thread IDs. You can pass in a maximum of 20 thread IDs at each call.
ChatClient.getInstance()
  .chatManager.fetchLastMessageWithChatThread(chatThreadIDs)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Listen for thread events

To monitor thread events, users can listen for the callbacks in the `ChatManager` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following sample code to listen for thread events:

```typescript
// Inherits and implements ChatMessageEventListener.
class ChatMessageEvent implements ChatMessageEventListener {
  // Occurs when a thread is created.
  onChatMessageThreadCreated(msgThread: 
  ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadCreated: `, msgThread);
  }
  // Occurs when a thread has a new message, a thread name is updated, or a thread message is recalled.
  onChatMessageThreadUpdated(msgThread: ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadUpdated: `, msgThread);
  }
  // Occurs when a thread is destroyed.
  onChatMessageThreadDestroyed(msgThread: ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadDestroyed: `, msgThread);
  }
  // Occurs when a member is removed from a thread.
  onChatMessageThreadUserRemoved(msgThread: ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadUserRemoved: `, msgThread);
  }
}
const listener = new ChatMessageEvent();
// Adds the message listener.
ChatClient.getInstance().chatManager.addMessageListener(listener);
// Removes the message listener.
ChatClient.getInstance().chatManager.removeMessageListener(listener);
// Removes all the message listeners.
ChatClient.getInstance().chatManager.removeAllMessageListener();
```

### Windows

### Create a thread

All chat group members can call `CreateThread` to create a thread from a specific message in a chat group.

Once a thread is created in a chat group, all chat group members receive the `IChatThreadManagerDelegate#OnCreateThread` callback. In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_CREATE` event.

The following sample code shows how to create a thread in a chat group:

```csharp
SDKClient.Instance.ThreadManager.CreateThread(threadName, msgId, groupid, new ValueCallBack(
    onSuccess: (thread) =>
    {
        DebugLog($"CreateThread success");
        if (null != thread)
        {
            // Handles the returned thread object
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"CreateThread failed, code:{code}, desc:{desc}");
    }
));
```

### Destroy a thread
Only the chat group owner and admins can call `DestroyThread` to disband a thread in a chat group.

Once a thread is disbanded, all chat group members receive the `IChatThreadManagerDelegate#onThreadNotifyChange` callback. In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_DESTROY` event.

:::info
Once a thread is destroyed or the chat group where a thread resides is destroyed, all data of the thread is deleted from the local database and memory.
:::

The following sample code shows how to destroy a thread:

```csharp
SDKClient.Instance.ThreadManager.DestroyThread(tid, new CallBack(
    onSuccess: () =>
    {
        Debug.Log($"DestroyThread success");
    },
    onError: (code, desc) =>
    {
        Debug.Log($"DestroyThread failed, code:{code}, desc:{desc}");
    }
));
```

### Join a thread
All chat group members can call `JoinThread` to join a thread as follows:

1. Retrieve the thread ID from the `IChatThreadManagerDelegate#OnCreateThread` or `IChatThreadManagerDelegate#onThreadNotifyChange` callback. Or retrieve the thread list in a chat group by calling `FetchThreadListOfGroup`, and locate the ID of the thread that you want to join.
2. Call `JoinThread` to pass in the thread ID and join the specified thread.

In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_JOIN` event.

The following sample code shows how to join a thread:

```csharp
SDKClient.Instance.ThreadManager.JoinThread(tid, new ValueCallBack(
    onSuccess: (thread) =>
    {
        Debug.Log($"JoinThread success");
        if (null != thread)
        {
           // Handles the returned thread object
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"JoinThread failed, code:{code}, desc:{desc}");
    }
));
```

### Leave a thread

All thread members can call `LeaveThread` to leave a thread. Once a member leaves a thread, they can no longer receive the thread messages.

In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_LEAVE` event.

The following sample code shows how to leave a thread:

```csharp
SDKClient.Instance.ThreadManager.LeaveThread(tid, new CallBack(
    onSuccess: () =>
    {
        Debug.Log($"LeaveThread success");
    },
    onError: (code, desc) =>
    {
        Debug.Log($"LeaveThread failed, code:{code}, desc:{desc}");
    }
));
```

### Remove a member from a thread
Only the chat group owner and admins can call `RemoveThreadMember` to remove the specified member from a thread.

Once a member is removed from a thread, they receive the `IChatThreadManagerDelegate#OnUserKickOutOfChatThread` callback and can no longer receive the thread messages. In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_KICK` event.

The following sample code shows how to remove a member from a thread:

```csharp
SDKClient.Instance.ThreadManager.RemoveThreadMember(tid, uname, new CallBack(
    onSuccess: () =>
    {
        Debug.Log($"RemoveThreadMember success");
    },
    onError: (code, desc) =>
    {
        Debug.Log($"RemoveThreadMember failed, code:{code}, desc:{desc}");
    }
));
```

### Update the name of a thread
Only the chat group owner, chat group admins, and thread creator can call `ChangeThreadSubject` to update a thread name.

Once a thread name is updated, all chat group members receive the `IChatThreadManagerDelegate#OnChatThreadUpdate` callback. In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_UPDATE` event.

The following sample code shows how to update a thread name:

```csharp
SDKClient.Instance.ThreadManager.ChangeThreadSubject(tid, subject, new CallBack(
    onSuccess: () =>
    {
        Debug.Log($"ChangeThreadSubject success");
    },
    onError: (code, desc) =>
    {
        Debug.Log($"ChangeThreadSubject failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve the attributes of a thread

All chat group members can call `GetThreadDetail` to retrieve the thread attributes from the server.

The following sample code shows how to retrieve the thread attributes:

```csharp
SDKClient.Instance.ThreadManager.GetThreadDetail(tid, new ValueCallBack(
        onSuccess: (thread) =>
        {
            Debug.Log($"GetThreadDetail success");
            if (null != thread)
            {
                //Add thread handling here
            }
        },
        onError: (code, desc) =>
        {
            Debug.Log($"GetThreadDetail failed, code:{code}, desc:{desc}");
        }
    ));
```

### Retrieve the member list of a thread

All chat group members can call `FetchThreadMembers` to retrieve a paginated member list of a thread from the server, as shown in the following sample code:

```csharp
SDKClient.Instance.ThreadManager.FetchThreadMembers(tid, cursor, page_size, new ValueCallBack>(
    onSuccess: (cursor_result) =>
    {
        Debug.Log($"FetchThreadMembers success");
        if(null != cursor_result)
        {
            // Handles the returned results
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"FetchThreadMembers failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve a thread list

Users can call `FetchMineJoinedThreadList` to retrieve a paginated list from the server of all the threads they have created and joined, as shown in the following sample code:

```csharp
 SDKClient.Instance.ThreadManager.FetchMineJoinedThreadList(cursor, page_size, new ValueCallBack>(
    onSuccess: (cursor_result) =>
    {
        Debug.Log($"FetchMineJoinedThreadList success");
        if (null != cursor_result)
        {
            // Handles the returned thread list in cursor_result.Data
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"FetchMineJoinedThreadList failed, code:{code}, desc:{desc}");
    }
));
```

Besides, users can call `FetchThreadListOfGroup` to retrieve a paginated list from the server of all the threads in a specified chat group, as shown in the following sample code:

```csharp
SDKClient.Instance.ThreadManager.FetchThreadListOfGroup(tid, joined, cursor, page_size, new ValueCallBack>(
    onSuccess: (cursor_result) =>
    {
        Debug.Log($"FetchThreadListOfGroup success");
        if (null != cursor_result)
        {
            // Handles the returned thread list in cursor_result.Data
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"FetchThreadListOfGroup failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve the latest message from multiple threads

Users can call `GetLastMessageAccordingThreads` to retrieve the latest message from multiple threads.

The following sample code shows how to retrieve the latest message from multiple threads:

```csharp
SDKClient.Instance.ThreadManager.GetLastMessageAccordingThreads(threadIds, new ValueCallBack>(
    onSuccess: (dict) =>
    {
        Debug.Log($"GetLastMessageAccordingThreads success");
        foreach (var it in dict)
        {
            // Iterates through the threads to handle the newest message in each thread
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"GetLastMessageAccordingThreads failed, code:{code}, desc:{desc}");
    }
));
```

### Listen for thread events

To monitor thread events, users can listen for the callbacks in the `IChatThreadManagerDelegate` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following sample code to listen for thread events:

```csharp
class ThreadManagerDelegate : IChatThreadManagerDelegate
{
    public void OnChatThreadCreate(ChatThreadEvent threadEvent)
    {
    }
    public void OnChatThreadUpdate(ChatThreadEvent threadEvent)
    {
    }
    public void OnChatThreadDestroy(ChatThreadEvent threadEvent)
    {
    }
    public void OnUserKickOutOfChatThread(ChatThreadEvent threadEvent)
    {
    }
}
// Registers the event listener
IChatThreadManagerDelegate threadManagerDelegate = new ThreadManagerDelegate();
SDKClient.Instance.ThreadManager.AddThreadManagerDelegate(threadManagerDelegate);
// Removes the event listener
SDKClient.Instance.ThreadManager.RemoveThreadManagerDelegate(threadManagerDelegate);
```

### Unity

### Create a thread

All chat group members can call `CreateThread` to create a thread from a specific message in a chat group.

Once a thread is created in a chat group, all chat group members receive the `IChatThreadManagerDelegate#OnCreateThread` callback. In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_CREATE` event.

The following sample code shows how to create a thread in a chat group:

```csharp
SDKClient.Instance.ThreadManager.CreateThread(threadName, msgId, groupid, new ValueCallBack(
    onSuccess: (thread) =>
    {
        DebugLog($"CreateThread success");
        if (null != thread)
        {
            // Handles the returned thread object
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"CreateThread failed, code:{code}, desc:{desc}");
    }
));
```

### Destroy a thread
Only the chat group owner and admins can call `DestroyThread` to disband a thread in a chat group.

Once a thread is disbanded, all chat group members receive the `IChatThreadManagerDelegate#onThreadNotifyChange` callback. In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_DESTROY` event.

:::info
Once a thread is destroyed or the chat group where a thread resides is destroyed, all data of the thread is deleted from the local database and memory.
:::

The following sample code shows how to destroy a thread:

```csharp
SDKClient.Instance.ThreadManager.DestroyThread(tid, new CallBack(
    onSuccess: () =>
    {
        Debug.Log($"DestroyThread success");
    },
    onError: (code, desc) =>
    {
        Debug.Log($"DestroyThread failed, code:{code}, desc:{desc}");
    }
));
```

### Join a thread
All chat group members can call `JoinThread` to join a thread as follows:

1. Retrieve the thread ID from the `IChatThreadManagerDelegate#OnCreateThread` or `IChatThreadManagerDelegate#onThreadNotifyChange` callback. Or retrieve the thread list in a chat group by calling `FetchThreadListOfGroup`, and locate the ID of the thread that you want to join.
2. Call `JoinThread` to pass in the thread ID and join the specified thread.

In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_JOIN` event.

The following sample code shows how to join a thread:

```csharp
SDKClient.Instance.ThreadManager.JoinThread(tid, new ValueCallBack(
    onSuccess: (thread) =>
    {
        Debug.Log($"JoinThread success");
        if (null != thread)
        {
           // Handles the returned thread object
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"JoinThread failed, code:{code}, desc:{desc}");
    }
));
```

### Leave a thread

All thread members can call `LeaveThread` to leave a thread. Once a member leaves a thread, they can no longer receive the thread messages.

In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_LEAVE` event.

The following sample code shows how to leave a thread:

```csharp
SDKClient.Instance.ThreadManager.LeaveThread(tid, new CallBack(
    onSuccess: () =>
    {
        Debug.Log($"LeaveThread success");
    },
    onError: (code, desc) =>
    {
        Debug.Log($"LeaveThread failed, code:{code}, desc:{desc}");
    }
));
```

### Remove a member from a thread
Only the chat group owner and admins can call `RemoveThreadMember` to remove the specified member from a thread.

Once a member is removed from a thread, they receive the `IChatThreadManagerDelegate#OnUserKickOutOfChatThread` callback and can no longer receive the thread messages. In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_KICK` event.

The following sample code shows how to remove a member from a thread:

```csharp
SDKClient.Instance.ThreadManager.RemoveThreadMember(tid, uname, new CallBack(
    onSuccess: () =>
    {
        Debug.Log($"RemoveThreadMember success");
    },
    onError: (code, desc) =>
    {
        Debug.Log($"RemoveThreadMember failed, code:{code}, desc:{desc}");
    }
));
```

### Update the name of a thread
Only the chat group owner, chat group admins, and thread creator can call `ChangeThreadSubject` to update a thread name.

Once a thread name is updated, all chat group members receive the `IChatThreadManagerDelegate#OnChatThreadUpdate` callback. In a multi-device use-case, all the other devices receive the `IMultiDeviceDelegate#onThreadMultiDevicesEvent` callback triggered by the `THREAD_UPDATE` event.

The following sample code shows how to update a thread name:

```csharp
SDKClient.Instance.ThreadManager.ChangeThreadSubject(tid, subject, new CallBack(
    onSuccess: () =>
    {
        Debug.Log($"ChangeThreadSubject success");
    },
    onError: (code, desc) =>
    {
        Debug.Log($"ChangeThreadSubject failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve the attributes of a thread

All chat group members can call `GetThreadDetail` to retrieve the thread attributes from the server.

The following sample code shows how to retrieve the thread attributes:

```csharp
SDKClient.Instance.ThreadManager.GetThreadDetail(tid, new ValueCallBack(
        onSuccess: (thread) =>
        {
            Debug.Log($"GetThreadDetail success");
            if (null != thread)
            {
                //Add thread handling here
            }
        },
        onError: (code, desc) =>
        {
            Debug.Log($"GetThreadDetail failed, code:{code}, desc:{desc}");
        }
    ));
```

### Retrieve the member list of a thread

All chat group members can call `FetchThreadMembers` to retrieve a paginated member list of a thread from the server, as shown in the following sample code:

```csharp
SDKClient.Instance.ThreadManager.FetchThreadMembers(tid, cursor, page_size, new ValueCallBack>(
    onSuccess: (cursor_result) =>
    {
        Debug.Log($"FetchThreadMembers success");
        if(null != cursor_result)
        {
            // Handles the returned results
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"FetchThreadMembers failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve a thread list

Users can call `FetchMineJoinedThreadList` to retrieve a paginated list from the server of all the threads they have created and joined, as shown in the following sample code:

```csharp
 SDKClient.Instance.ThreadManager.FetchMineJoinedThreadList(cursor, page_size, new ValueCallBack>(
    onSuccess: (cursor_result) =>
    {
        Debug.Log($"FetchMineJoinedThreadList success");
        if (null != cursor_result)
        {
            // Handles the returned thread list in cursor_result.Data
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"FetchMineJoinedThreadList failed, code:{code}, desc:{desc}");
    }
));
```

Besides, users can call `FetchThreadListOfGroup` to retrieve a paginated list from the server of all the threads in a specified chat group, as shown in the following sample code:

```csharp
SDKClient.Instance.ThreadManager.FetchThreadListOfGroup(tid, joined, cursor, page_size, new ValueCallBack>(
    onSuccess: (cursor_result) =>
    {
        Debug.Log($"FetchThreadListOfGroup success");
        if (null != cursor_result)
        {
            // Handles the returned thread list in cursor_result.Data
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"FetchThreadListOfGroup failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve the latest message from multiple threads

Users can call `GetLastMessageAccordingThreads` to retrieve the latest message from multiple threads.

The following sample code shows how to retrieve the latest message from multiple threads:

```csharp
SDKClient.Instance.ThreadManager.GetLastMessageAccordingThreads(threadIds, new ValueCallBack>(
    onSuccess: (dict) =>
    {
        Debug.Log($"GetLastMessageAccordingThreads success");
        foreach (var it in dict)
        {
            // Iterates through the threads to handle the newest message in each thread
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"GetLastMessageAccordingThreads failed, code:{code}, desc:{desc}");
    }
));
```

### Listen for thread events

To monitor thread events, users can listen for the callbacks in the `IChatThreadManagerDelegate` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following sample code to listen for thread events:

```csharp
class ThreadManagerDelegate : IChatThreadManagerDelegate
{
    public void OnChatThreadCreate(ChatThreadEvent threadEvent)
    {
    }
    public void OnChatThreadUpdate(ChatThreadEvent threadEvent)
    {
    }
    public void OnChatThreadDestroy(ChatThreadEvent threadEvent)
    {
    }
    public void OnUserKickOutOfChatThread(ChatThreadEvent threadEvent)
    {
    }
}
// Registers the event listener
IChatThreadManagerDelegate threadManagerDelegate = new ThreadManagerDelegate();
SDKClient.Instance.ThreadManager.AddThreadManagerDelegate(threadManagerDelegate);
// Removes the event listener
SDKClient.Instance.ThreadManager.RemoveThreadManagerDelegate(threadManagerDelegate);
```
