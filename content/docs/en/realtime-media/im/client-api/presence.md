---
title: "Presence"
description: "Shows how to use the Agora Chat SDK to implement presence in your project."
---

The presence feature enables users to publicly display their online presence status and quickly determine the status of other users. Users can also customize their presence status, which adds fun and diversity to real-time chatting.

The following illustration shows the implementation of creating a custom presence status and how various presence statues look in a contact list:

### All except Windows, Unity, Web

![1655302046418](https://web-cdn.agora.io/docs-files/1655302046418)

### All except Android, Flutter, React Native, iOS

![1655302111155](https://web-cdn.agora.io/docs-files/1655302111155)

This page shows how to use the Chat SDK to implement presence in your project.

## Understand the tech

### Android

The Chat SDK provides the `Presence`, `PresenceManager`, and `PresenceListener` classes for presence management, which allows you to implement the following features:

### iOS

The Chat SDK provides the `IAgoraChatPresenceManager`, `AgoraChatPresence`, and `AgoraChatPresenceManagerDelegate` classes for presence management, which allows you to implement the following features:

### Web

The Chat SDK allows you to implement the following features:

### Flutter

The Chat SDK provides the `ChatPresence`, `ChatPresenceManager`, and `ChatPresenceEventHandler` classes for presence management, which allows you to implement the following features:

### React Native

The Chat SDK provides the `ChatPresence`, `ChatPresenceManager`, and `ChatPresenceEventListener` classes for presence management, which allows you to implement the following features:

### Unity

The Agora Chat SDK provides the `Presence`, `PresenceManager`, and `IPresenceManagerDelegate` classes for presence management, which allows you to implement the following features:

### Windows

The Agora Chat SDK provides the `Presence`, `PresenceManager`, and `IPresenceManagerDelegate` classes for presence management, which allows you to implement the following features:

- Subscribe to the presence status of one or more users
- Unsubscribe from the presence status of one or more users
- Listen for presence status updates
- Publish a custom presence status
- Retrieve the list of subscriptions
- Retrieve the presence status of one or more users

### All except Windows, React Native

The following figure shows the workflow of how clients subscribe to and publish presence statuses:

Presence workflow

### Android

![1655306619037](https://web-cdn.agora.io/docs-files/1655306619037)

### iOS

![1655307187099](https://web-cdn.agora.io/docs-files/1655307187099)

### Web

![1655308138447](https://web-cdn.agora.io/docs-files/1655308138447)

### Unity

![1662013983679](https://web-cdn.agora.io/docs-files/1662013983679)

### Flutter

![1655718659347](https://web-cdn.agora.io/docs-files/1655718659347)

1. User A subscribes to the presence status of User B.
2. User B publishes a presence status.
3. The Chat server triggers an event to notify User A about the presence update of User B.

## Prerequisites

Before proceeding, ensure that your environment meets the following requirements:

- You have initialized the Chat SDK. For details, see [SDK quickstart](../get-started/get-started-sdk.mdx).
- You understand the API call frequency limit as described in [Limitations](../reference/limitations.md).
- You have activated the presence feature in [Agora Console](https://console.agora.io/v2).

## Implementation

This section introduces how to implement presence functionalities in your project.

### Android

### Subscribe to the presence status of one or more users

By default, you do not subscribe to any users. To subscribe to the presence statuses of the specified users, you can call `subscribePresences`.

Once the subscription succeeds, the `onSuccess` callback is triggered, notifying you about the current statuses of the specified users synchronously. Whenever the specified users update their presence statuses, the `onPresenceUpdated` callback is triggered, notifying you about the updated statuses asynchronously.

The following code sample shows how to subscribe to the presence status of one or more users:

```java
ChatClient.getInstance().presenceManager().subscribePresences(contactsFromServer, 1 * 24 * 3600, new ValueCallBack>() {
                    @Override
                    public void onSuccess(List presences) {
                        
                    }
                    @Override
                    public void onError(int errorCode, String errorMsg) {
                       
                    }
                });             
```

:::info
You can subscribe to a maximum of 100 users at each call. The total subscriptions of each user cannot exceed 3,000. Once the number of subscriptions exceed the limit, the subsequent subscriptions with longer durations succeed and replace the existing subscriptions with shorter durations.The subscription duration can be a maximum of 30 days. When the subscription to a user expires, you need to subscribe to this user once again. If you subscribe to a user again before the current subscription expires, the duration is reset.
:::

### Publish a custom presence status

You can call `publishPresence` to publish a custom status. Whenever your presence status updates, the users who subscribe to you receive the `onPresenceUpdated` callback.

The following code sample shows how to publish a custom status:

```java
ChatClient.getInstance().presenceManager().publishPresence("custom status", new CallBack() {
                    @Override
                    public void onSuccess() {
                    }
                    @Override
                    public void onError(int code, String error) {
                    }
                });
```

### Listen for presence status updates

Refer to the following code sample to listen for presence status updates:

```java
// Adds the presence status listener.
ChatClient.getInstance().presenceManager().addListener(new MyPresenceListener());

// Occurs when the presence statuses of the subscriptions update.
public interface PresenceListener {
    void onPresenceUpdated(List presences);
}
```

### Unsubscribe from the presence status of one or more users

You can call `unsubscribePresences` to unsubscribe from the presence statuses of the specified users, as shown in the following code sample:

```java
ChatClient.getInstance().presenceManager().unsubscribePresences(contactsFromServer, new CallBack() {
                    @Override
                    public void onSuccess() {
                       
                    }
                    @Override
                    public void onError(int errorCode, String errorMsg) {
                       
                    }
                });
```

### Retrieve the list of subscriptions

You can call `fetchSubscribedMembers` to retrieve the list of your subscriptions in a paginated list, as shown in the following code sample:

```java
ChatClient.getInstance().presenceManager().fetchSubscribedMembers(1, 50, new ValueCallBack>() {
                    @Override
                    public void onSuccess(List subscribedMembers) {
                        
                    }
                    @Override
                    public void onError(int errorCode, String errorMsg) {
                       
                    }
                });
```

### Retrieve the presence status of one or more users

You can call `fetchPresenceStatus` to retrieve the current presence statuses of the specified users without the need to subscribe to them, as shown in the following code sample:

```java
// contactsFromServer: The ID list of users whose presence status you retrieve.
// You can pass in up to 100 user IDs.
ChatClient.getInstance().presenceManager().fetchPresenceStatus(contactsFromServer, new ValueCallBack>() {
                    @Override
                    public void onSuccess(List presences) {
                        
                    }
                    @Override
                    public void onError(int errorCode, String errorMsg) {
                       
                    }
                });
```

### iOS

### Subscribe to the presence status of one or more users

By default, you do not subscribe to any users. To subscribe to the presence statuses of the specified users, you can call `subscribe`.

Once the subscription succeeds, the `completion` callback is triggered, notifying you about the current statuses of the specified users synchronously. Whenever the specified users update their presence statuses, the `presenceStatusDidChanged` callback is triggered, notifying you about the updated statuses asynchronously.

The following code sample shows how to subscribe to the presence status of one or more users:

```objc
[[[AgoraChatClient sharedClient] presenceManager] subscribe:@[@"Alice",@"Bob"] expiry:7*24*3600 completion:^(NSArray *presences, AgoraChatError *error) {
}];
```

:::info
You can subscribe to a maximum of 100 users at each call. The total subscriptions of each user cannot exceed 3,000. Once the number of subscriptions exceed the limit, the subsequent subscriptions with longer durations succeed and replace the existing subscriptions with shorter durations.The subscription duration can be a maximum of 30 days. When the subscription to a user expires, you need to subscribe to this user once again. If you subscribe to a user again before the current subscription expires, the duration is reset.
:::

### Publish a custom presence status

You can call `publishPresenceWithDescription` to publish a custom status. Whenever your presence status updates, the users who subscribe to you receive the `presenceStatusDidChanged` callback.

The following code sample shows how to publish a custom status:

```objc
[[[AgoraChatClient sharedClient] presenceManager] publishPresenceWithDescription:@"custom presence" completion:^(AgoraChatError *error) {
}];
```

### Listen for presence status updates

Refer to the following code sample to listen for presence status updates:

```objc
// Adds the presence status listener.
[[[AgoraChatClient sharedClient] presenceManager] addDelegate:self delegateQueue:nil];

// Occurs when the presence statuses of the subscriptions update.
- (void) presenceStatusDidChanged:(NSArray*)presences
{
    NSLog(@"presenceStatusDidChanged:%@",presences);
}
```

### Unsubscribe from the presence status of one or more users

You can call `unsubscribe` to unsubscribe from the presence statuses of the specified users, as shown in the following code sample:

```objc
[[[AgoraChatClient sharedClient] presenceManager] unsubscribe:@[@"Alice"] completion:^(AgoraChatError *error) {
        
}];
```

### Retrieve the list of subscriptions

You can call `fetchSubscribedMembersWithPageNum` to retrieve the list of your subscriptions in a paginated list, as shown in the following code sample:

```objc
[[[AgoraChatClient sharedClient] presenceManager] fetchSubscribedMembersWithPageNum:0 pageSize:50 Completion:^(NSArray* members,AgoraChatError*error){
}]; 
```

### Retrieve the presence status of one or more users

You can call `fetchPresenceStatus` to retrieve the current presence statuses of the specified users without the need to subscribe to them, as shown in the following code sample:

```objc
// You can pass in up to 100 user IDs whose presence status you retrieve.
[[[AgoraChatClient sharedClient] presenceManager] fetchPresenceStatus:@[@"Alice",@"Tom"] completion:^(NSArray* presences,AgoraChatError*error){
}];
```

### Web

### Subscribe to the presence status of one or more users

By default, you do not subscribe to any users. To subscribe to the presence statuses of the specified users, you can call `subscribePresence`. Whenever the specified users update their presence statuses, the `onPresenceStatusChange` callback is triggered, notifying you about the updated statuses asynchronously.

The following code sample shows how to subscribe to the presence status of one or more users:

```javascript
const options = {
  usernames: ["Alice", "Bob"],
  expiry: 7 * 24 * 3600,
};
chatClient.subscribePresence(options).then((res) => {
  console.log(res);
});
```

:::info

  
    
      You can subscribe to a maximum of 100 users at each call. The total
      subscriptions of each user cannot exceed 3,000. Once the number of
      subscriptions exceed the limit, the subsequent subscriptions with longer
      durations succeed and replace the existing subscriptions with shorter
      durations.
    
    
      The subscription duration can be a maximum of 30 days. When the
      subscription to a user expires, you need to subscribe to this user once
      again. If you subscribe to a user again before the current subscription
      expires, the duration is reset.
    
  

:::

### Publish a custom presence status

You can call `publishPresence` to to publish a custom status. Whenever your presence status updates, the users who subscribe to you receive the `onPresenceStatusChange` callback.

The following code sample shows how to publish a custom status:

```javascript
const options = {
  description: "custom presence",
};
chatClient.publishPresence(options).then((res) => {
  console.log(res);
});
```

### Listen for presence status updates

Refer to the following code sample to listen for presence status updates:

```javascript
// Adds the presence status listener.
chatClient.addEventHandler('handlerId',{
  // Occurs when the presence statuses of the subscriptions update.
   onPresenceStatusChange: (msg) => {
       // You can implement subsequent settings in this callback.
   	   console.log('status updates'，msg)
   },
})
```

### Unsubscribe from the presence status of one or more users

You can call `unsubscribePresence` to unsubscribe from the presence statuses of the specified users, as shown in the following code sample:

```javascript
const options = {
  usernames: ["Alice", "Bob"],
};
chatClient.unsubscribePresence(options).then((res) => {
  console.log(res);
});
```

### Retrieve the list of subscriptions

You can call `getSubscribedPresencelist` to retrieve the list of your subscriptions in a paginated list, as shown in the following code sample:

```javascript
const options = {
  pageNum: 0,
  pageSize: 50,
};
chatClient.getSubscribedPresenceList(options).then((res) => {
  console.log(res);
});
```

### Retrieve the presence status of one or more users

You can call `getPresenceStatus` to retrieve the current presence statuses of the specified users without the need to subscribe to them, as shown in the following code sample:

```javascript
const options = {
  // usernames: The ID list of users whose presence status you retrieve.
  // You can pass in up to 100 user IDs.
  usernames: ["Alice", "Bob"],
};
chatClient.getPresenceStatus(options).then((res) => {
  console.log(res);
});
```

### Flutter

### Subscribe to the presence status of one or more users

By default, you do not subscribe to any users. To subscribe to the presence statuses of the specified users, you can call `subscribe`. Whenever the specified users update their presence statuses, the `onPresenceStatusChanged` callback is triggered, notifying you about the updated statuses asynchronously.

The following code sample shows how to subscribe to the presence status of one or more users:

```dart
// members: The ID list of users to whom you subscribe.
List members = [];
// expiry: The subscription duration in seconds.
int expiry = 100;
try {
  List list =
      await ChatClient.getInstance.presenceManager.subscribe(
    members: members,
    expiry: expiry,
  );
} on ChatError catch (e) {
}
```

:::info
You can subscribe to a maximum of 100 users at each call. The total subscriptions of each user cannot exceed 3,000. Once the number of subscriptions exceed the limit, the subsequent subscriptions with longer durations succeed and replace the existing subscriptions with shorter durations.The subscription duration can be a maximum of 30 days. When the subscription to a user expires, you need to subscribe to this user once again. If you subscribe to a user again before the current subscription expires, the duration is reset.
:::

### Publish a custom presence status

You can call `publishPresence` to to publish a custom status. Whenever your presence status updates, the users who subscribe to you receive the `ChatPresenceEventHandler#onPresenceStatusChanged` callback.

The following code sample shows how to publish a custom status:

```dart
try {
  // description: The custom presence status.
  await ChatClient.getInstance.presenceManager.publishPresence(description);
} on ChatError catch (e) {
}
```

### Listen for presence status updates

Refer to the following code sample to listen for presence status updates:

```dart
    // Adds the presence event handler.
    ChatClient.getInstance.presenceManager.addEventHandler(
      "UNIQUE_HANDLER_ID",
      ChatPresenceEventHandler(
        onPresenceStatusChanged: (list) {},
      ),
    );

    ...

    // Removes the presence event handler.
    ChatClient.getInstance.presenceManager.removeEventHandler("UNIQUE_HANDLER_ID");
```

### Unsubscribe from the presence status of one or more users

You can call `unSubscribe` to unsubscribe from the presence statuses of the specified users, as shown in the following code sample:

```dart
// memberIds: The ID list of users from whom you unsubscribe.
try {
  await ChatClient.getInstance.presenceManager.unSubscribe(
    members: members,
  );
} on ChatError catch (e) {
}
```

### Retrieve the list of subscriptions

You can call `fetchSubscribedMembers` to retrieve the list of your subscriptions in a paginated list, as shown in the following code sample:

```dart
try {
  List subMembers =
      await ChatClient.getInstance.presenceManager.fetchSubscribedMembers();
} on ChatError catch (e) {
}
```

### Retrieve the presence status of one or more users

You can call `fetchPresenceStatus` to retrieve the current presence statuses of the specified users without the need to subscribe to them, as shown in the following code sample:

```dart
// memberIds: The ID list of users whose presence status you retrieve.
// You can pass in up to 100 user IDs.
try {
  List list = await ChatClient.getInstance.presenceManager
      .fetchPresenceStatus(members: memberIds);
} on ChatError catch (e) {
}
```

### React Native

### Subscribe to the presence status of one or more users

By default, you do not subscribe to any users. To subscribe to the presence statuses of the specified users, you can call `subscribe`. Whenever the specified users update their presence statuses, the `onPresenceStatusChanged` callback is triggered, notifying you about the updated statuses asynchronously.

The following code sample shows how to subscribe to the presence status of one or more users:

```typescript
// memberIds: The ID list of users to whom you subscribe.
// expiry: The subscription duration in seconds.
ChatClient.getInstance()
  .presenceManager.subscribe(memberIds, expiry)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

:::info
You can subscribe to a maximum of 100 users at each call. The total subscriptions of each user cannot exceed 3,000. Once the number of subscriptions exceed the limit, the subsequent subscriptions with longer durations succeed and replace the existing subscriptions with shorter durations.The subscription duration can be a maximum of 30 days. When the subscription to a user expires, you need to subscribe to this user once again. If you subscribe to a user again before the current subscription expires, the duration is reset.
:::

### Publish a custom presence status

You can call `publishPresence` to publish a custom status. Whenever your presence status updates, the users who subscribe to you receive the `onPresenceStatusChanged` callback.

The following code sample shows how to publish a custom status:

```typescript
// description: The custom presence status.
ChatClient.getInstance()
  .presenceManager.publishPresence(description)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Listen for presence status updates

Refer to the following code sample to listen for presence status updates:

```typescript
// Inherits and implements the ChatPresenceEventListener class.
class ChatPresenceEvent implements ChatPresenceEventListener {
  // Occurs when the presence statuses of the subscriptions update.
  onPresenceStatusChanged(list: ChatPresence[]): void {
    console.log(`onPresenceStatusChanged:`, list.length, list);
  }
}
// Removes the presence status listener.
ChatClient.getInstance().presenceManager.removeAllPresenceListener();
// Adds the presence status listener.
ChatClient.getInstance().presenceManager.addPresenceListener(
  new ChatPresenceEvent()
);
```

### Unsubscribe from the presence status of one or more users

You can call `unSubscribe` to unsubscribe from the presence statuses of the specified users, as shown in the following code sample:

```typescript
// memberIds: The ID list of users from whom you unsubscribe.
ChatClient.getInstance()
  .presenceManager.unSubscribe(memberIds)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Retrieve the list of subscriptions

You can call `fetchSubscribedMembers` to retrieve the list of your subscriptions in a paginated list, as shown in the following code sample:

```typescript
// pageNum: The page from which to start retrieving subscriptions.
// pageSize: The maximum number of subscriptions to retrieve per page. The range is [1, 50].
ChatClient.getInstance()
  .presenceManager.fetchSubscribedMembers(pageNum, pageSize)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Retrieve the presence status of one or more users

You can call `fetchPresenceStatus` to retrieve the current presence statuses of the specified users without the need to subscribe to them, as shown in the following code sample:

```typescript
// memberIds: The ID list of users whose presence status you retrieve.
// You can pass in up to 100 user IDs.
ChatClient.getInstance()
  .presenceManager.fetchPresenceStatus(memberIds)
  .then((result) => {
    console.log("success: ", result);
  })
  .catch((error) => {
    console.log("fail: ", error);
  });
```

### Unity

### Subscribe to the presence status of one or more users

By default, you do not subscribe to any users. To subscribe to the presence statuses of the specified users, you can call `PresenceManager#SubscribePresences`.

Once the subscription succeeds, the `onSuccess` callback is triggered, notifying you about the current statuses of the specified users synchronously. Whenever the specified users update their presence statuses, the `IPresenceManagerDelegate#OnPresenceUpdated` callback is triggered, notifying you about the updated statuses asynchronously.

The following code sample shows how to subscribe to the presence status of one or more users:

```csharp
SDKClient.Instance.PresenceManager.SubscribePresences(members, expiry, new ValueCallBack>(
    onSuccess: (list) =>
    {
        foreach (var it in list)
        {
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"SubscribePresences failed, code:{code}, desc:{desc}");
    }
));
```

:::info
You can subscribe to a maximum of 100 users at each call. The total subscriptions of each user cannot exceed 3,000. Once the number of subscriptions exceed the limit, the subsequent subscriptions with longer durations succeed and replace the existing subscriptions with shorter durations.The subscription duration can be a maximum of 30 days. When the subscription to a user expires, you need to subscribe to this user once again. If you subscribe to a user again before the current subscription expires, the duration is reset.
:::

### Publish a custom presence status

You can call `PresenceManager#PublishPresence` to publish a custom status. Whenever your presence status updates, the users who subscribe to you receive the `IPresenceManagerDelegate#OnPresenceUpdated` callback.

The following code sample shows how to publish a custom status:

```csharp
SDKClient.Instance.PresenceManager.PublishPresence(ext, new CallBack(
    onSuccess: () => {
        Debug.Log($"PublishPresence success.");
    },
    onError: (code, desc) => {
        Debug.Log($"PublishPresence failed, code:{code}, desc:{desc}");
    }
));
```

### Listen for presence status updates

Refer to the following code sample to listen for presence status updates:

```csharp
// Occurs when the presence statuses of the subscriptions update.
public interface IPresenceManagerDelegate
{
    void OnPresenceUpdated(List presences);
}

// Adds the presence status listener.
public class PresenceManagerDelegate: IPresenceManagerDelegate
{
                public void OnPresenceUpdated(List presences)
    {
        
    }
}
PresenceManagerDelegate presenceManagerDelegate = new PresenceManagerDelegate();
SDKClient.Instance.PresenceManager.AddPresenceManagerDelegate(presenceManagerDelegate);
```

### Unsubscribe from the presence status of one or more users

You can call `PresenceManager#UnsubscribePresences` to unsubscribe from the presence statuses of the specified users, as shown in the following code sample:

```csharp
SDKClient.Instance.PresenceManager.UnsubscribePresences(mem_list, new CallBack(
    onSuccess: () => {
        Debug.Log($"UnsubscribePresences success.");
    },
    onError: (code, desc) => {
        Debug.Log($"UnsubscribePresences failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve the list of subscriptions

You can call `PresenceManager#FetchSubscribedMembers` to retrieve the list of your subscriptions in a paginated list, as shown in the following code sample:

```csharp
SDKClient.Instance.PresenceManager.FetchSubscribedMembers(pageNum, pageSize, new ValueCallBack>(
    onSuccess: (list) =>
    {

    },
    onError: (code, desc) =>
    {
        Debug.Log($"SubscribePresences failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve the presence status of one or more users

You can call `PresenceManager#FetchPresenceStatus` to retrieve the current presence statuses of the specified users without the need to subscribe to them, as shown in the following code sample:

```csharp
// members: The ID list of users whose presence status you retrieve.
// You can pass in up to 100 user IDs.
SDKClient.Instance.PresenceManager.FetchPresenceStatus(members, new ValueCallBack>(
    onSuccess: (list) =>
    {
        foreach (var it in list)
        {
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"FetchPresenceStatus failed, code:{code}, desc:{desc}");
    }
));
```

### Windows

### Subscribe to the presence status of one or more users

By default, you do not subscribe to any users. To subscribe to the presence statuses of the specified users, you can call `PresenceManager#SubscribePresences`.

Once the subscription succeeds, the `onSuccess` callback is triggered, notifying you about the current statuses of the specified users synchronously. Whenever the specified users update their presence statuses, the `IPresenceManagerDelegate#OnPresenceUpdated` callback is triggered, notifying you about the updated statuses asynchronously.

The following code sample shows how to subscribe to the presence status of one or more users:

```csharp
SDKClient.Instance.PresenceManager.SubscribePresences(members, expiry, new ValueCallBack>(
    onSuccess: (list) =>
    {
        foreach (var it in list)
        {
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"SubscribePresences failed, code:{code}, desc:{desc}");
    }
));
```

:::info
You can subscribe to a maximum of 100 users at each call. The total subscriptions of each user cannot exceed 3,000. Once the number of subscriptions exceed the limit, the subsequent subscriptions with longer durations succeed and replace the existing subscriptions with shorter durations.The subscription duration can be a maximum of 30 days. When the subscription to a user expires, you need to subscribe to this user once again. If you subscribe to a user again before the current subscription expires, the duration is reset.
:::

### Publish a custom presence status

You can call `PresenceManager#PublishPresence` to publish a custom status. Whenever your presence status updates, the users who subscribe to you receive the `IPresenceManagerDelegate#OnPresenceUpdated` callback.

The following code sample shows how to publish a custom status:

```csharp
SDKClient.Instance.PresenceManager.PublishPresence(ext, new CallBack(
    onSuccess: () => {
        Debug.Log($"PublishPresence success.");
    },
    onError: (code, desc) => {
        Debug.Log($"PublishPresence failed, code:{code}, desc:{desc}");
    }
));
```

### Listen for presence status updates

Refer to the following code sample to listen for presence status updates:

```csharp
// Occurs when the presence statuses of the subscriptions update.
public interface IPresenceManagerDelegate
{
    void OnPresenceUpdated(List presences);
}

// Adds the presence status listener.
public class PresenceManagerDelegate: IPresenceManagerDelegate
{
                public void OnPresenceUpdated(List presences)
    {
        
    }
}
PresenceManagerDelegate presenceManagerDelegate = new PresenceManagerDelegate();
SDKClient.Instance.PresenceManager.AddPresenceManagerDelegate(presenceManagerDelegate);
```

### Unsubscribe from the presence status of one or more users

You can call `PresenceManager#UnsubscribePresences` to unsubscribe from the presence statuses of the specified users, as shown in the following code sample:

```csharp
SDKClient.Instance.PresenceManager.UnsubscribePresences(mem_list, new CallBack(
    onSuccess: () => {
        Debug.Log($"UnsubscribePresences success.");
    },
    onError: (code, desc) => {
        Debug.Log($"UnsubscribePresences failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve the list of subscriptions

You can call `PresenceManager#FetchSubscribedMembers` to retrieve the list of your subscriptions in a paginated list, as shown in the following code sample:

```csharp
SDKClient.Instance.PresenceManager.FetchSubscribedMembers(pageNum, pageSize, new ValueCallBack>(
    onSuccess: (list) =>
    {

    },
    onError: (code, desc) =>
    {
        Debug.Log($"SubscribePresences failed, code:{code}, desc:{desc}");
    }
));
```

### Retrieve the presence status of one or more users

You can call `PresenceManager#FetchPresenceStatus` to retrieve the current presence statuses of the specified users without the need to subscribe to them, as shown in the following code sample:

```csharp
// members: The ID list of users whose presence status you retrieve.
// You can pass in up to 100 user IDs.
SDKClient.Instance.PresenceManager.FetchPresenceStatus(members, new ValueCallBack>(
    onSuccess: (list) =>
    {
        foreach (var it in list)
        {
        }
    },
    onError: (code, desc) =>
    {
        Debug.Log($"FetchPresenceStatus failed, code:{code}, desc:{desc}");
    }
));
```
