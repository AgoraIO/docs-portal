---
title: "Manage chat room attributes"
description: "Shows how to use the Agora Chat SDK to manage the attributes of a chat room in your app."
---

Chat room attributes consist of basic attributes (such as room subject, room description, and room announcement) and custom attributes. When basic attributes cannot satisfy the business requirements, users can add custom attributes that are synchronized with all chat room members.
Custom attributes can be used to store information such as chat room type, game roles, game status, and host positions. They are stored as key-value maps, and the updates of custom attributes are synchronized with all chat room members.

This page shows how to use the Agora Chat SDK to manage basic and custom attributes of a chat room in your app.

## Understand the tech

### Android

The Agora Chat SDK provides the `ChatManager` and `ChatRoom` classes for chat room management, which allow you to implement the following features:

### iOS

The Chat SDK provides the `IAgoraChatroomManager`, `AgoraChatroomManagerDelegate`, and `AgoraChatRoom` classes for chat room management, which allow you to implement the following features:

### Flutter

The Chat SDK provides the `ChatRoom`, `ChatRoomManager`, and `ChatRoomEventHandler` classes for chat room management, which allow you to implement the following features:

### React Native

The Agora Chat SDK provides the `ChatManager` and `ChatRoom` classes for chat room management, which allow you to implement the following features:

### Windows

The Agora Chat SDK provides the `Room`, `IRoomManager`, and `IRoomManagerDelegate` classes for chat room management, which allow you to implement the following features:

### Unity

The Agora Chat SDK provides the `Room`, `IRoomManager`, and `IRoomManagerDelegate` classes for chat room management, which allow you to implement the following features:

### Web

The Chat SDK allows you to implement the following features:

- Retrieve or modify basic attributes of a chat room
- Retrieve custom attributes of a chat room
- Set custom attributes of a chat room
- Remove custom attributes of a chat room

## Prerequisites

Before proceeding, ensure that you meet the following requirements:

- You have initialized the Chat SDK. For details, see [SDK quickstart](../../../get-started-sdk).
- You understand the call frequency limit of the Chat APIs supported by different pricing plans as described in [Limitations](../../limitations).
- You understand the number of chat rooms supported by different pricing plans as described in [Pricing Plan Details](../../../reference/pricing-plan-details).

## Implementation

This section introduces how to call the APIs provided by the Chat SDK to implement the features listed above.

### Android

### Manage basic chat room attributes

#### Retrieve basic chat room attributes
All the chat room members can call `fetchChatRoomFromServer` to retrieve the detailed information of the current chat room, including the subject, announcement, description, member type, and admin list.

```java
// Fetches basic attributes including ID, name, description, maximum members, owners, roles, and whether all members are muted.
ChatRoom chatRoom = ChatClient.getInstance().chatroomManager().fetchChatRoomFromServer(chatRoomId);
```

#### Change chat room name or description
Only the chat room owner and admin can set and update the chat room name and description.

```java
// Modifies the chat room name.
ChatRoom chatRoom = ChatClient.getInstance().chatroomManager().changeChatRoomSubject(chatRoomId, newSubject);

// Modifies the chat room description.
ChatRoom chatRoom = ChatClient.getInstance().chatroomManager().changeChatroomDescription(chatRoomId, newDescription);
```

#### Retrieve or change the chat room announcement
All the chat room members can retrieve the chat room announcement.

Only the chat room owner and admin can set and update the announcement. Once the announcement is updated, all the chat room members receive the `onAnnouncementChanged` callback.

```java
// Retrieves the chat room announcement.
String announcement = ChatClient.getInstance().chatroomManager().fetchChatRoomAnnouncement(chatRoomId);

// Sets or updates the chat room announcement.
ChatClient.getInstance().chatroomManager().updateChatRoomAnnouncement(chatRoomId, announcement);
```

### Manage custom chat room attributes

#### Set a custom attribute
Chat room members can call `asyncSetChatroomAttributes` to set one single custom or update an existing attribute set by themselves. After you successfully call this method, other members in the chat room receive an `onAttributesUpdate` callback.

```java
// Sets a custom attribute by specifying chat room ID, attribute key, and attribute value.
ChatClient.getInstance().chatroomManager().asyncSetChatroomAttribute(chatRoomId, attributeKey, attributeValue, false, new CallBack() {
    @Override
    public void onSuccess() {}
    @Override
    public void onError(int error, String errorMsg) {}
});
```

If you want to update a custom attribute that is set by other members, call `asyncSetChatroomAttributesForced` instead. After you successfully call this method, other members in the chat room receive an `onAttributesUpdate` callback.

```java
// Sets a custom attribute by specifying chat room ID, attribute key, and attribute value.
ChatClient.getInstance().chatroomManager().asyncSetChatroomAttributesForced(chatRoomId, attributeKey, attributeValue, false, new CallBack() {
    @Override
    public void onSuccess() {}
    @Override
    public void onError(int error, String errorMsg) {}
});
```

#### Set multiple custom attributes
Chat room members can call the `asyncSetChatroomAttributes` method to add new custom attributes or update existing attributes set by themselves. After you successfully call this method, other members in the chat room receive an `onAttributesUpdate` callback.

```java
// Sets a custom attribute by specifying chat room ID, attribute key, and attribute value.
ChatClient.getInstance().chatroomManager().asyncSetChatroomAttributesForced(chatRoomId, attributeKey, attributeValue, false, new CallBack() {
    @Override
    public void onSuccess() {}
    @Override
    public void onError(int error, String errorMsg) {}
});
```

If you want to update custom attributes that set by other members, call `asyncSetChatroomAttributesForced` instead. After you successfully call this method, other members in the chat room receive an `onAttributesUpdate` callback.

```java
// Sets a custom attribute by specifying chat room ID and the key-value maps of the attributes.
ChatClient.getInstance().chatroomManager().asyncSetChatroomAttributesForced(chatRoomId, map, false, new ResultCallBack > () {
    @Override
    public void onResult(int code, Map  failureMap) {
        // code == Error.EM_NO_ERROR indicates all the custom attributes are set successfully. In this case, failureMap is an empty map.
        // code != Error.EM_NO_ERROR indicates that the request fails. For error reasons please refer to the Error class.
        // In this case, failureMap contains the custom attributes that are not set successfully, and value represents the error code.
    }
});
```

#### Retrieve specified or all custom attributes
All chat room members can call `asyncFetchChatroomAttributesFromServer` or `asyncFetchChatRoomAllAttributesFromServer` to retrieve specified or all custom attributes of the chat room.

```java
// Retrieves certain custom attributes by specifying chat room ID and attribute keys.
ChatClient.getInstance().chatroomManager().asyncFetchChatroomAttributesFromServer(chatRoomId, keyList, new ValueCallBack > () {
    @Override
    public void onSuccess(Map  value) {}
    @Override
    public void onError(int error, String errorMsg) {}
});

// Retrieves all custom attributes by specifying chat room ID.
ChatClient.getInstance().chatroomManager().asyncFetchChatRoomAllAttributesFromServer(chatRoomId, new ValueCallBack > () {
    @Override
    public void onSuccess(Map  value) {}
    @Override
    public void onError(int error, String errorMsg) {}
});
```

#### Remove a custom attribute
Chat room members can call `asyncRemoveChatRoomAttributeFromServer` to remove one single custom attribute that is set by themselves. After you successfully call this method, other members in the chat room receive an `onAttributesRemoved` callback.

```java
// Removes a custom attribute by specifying chat room ID and attribute key.
ChatClient.getInstance().chatroomManager().asyncRemoveChatRoomAttributeFromServer(chatRoomId, attributeKey, new CallBack() {
    @Override
    public void onSuccess() {}
    @Override
    public void onError(int error, String errorMsg) {}
});
```

If you want to update a custom attribute set by another member, call `asyncRemoveChatRoomAttributeFromServerForced` instead. After you successfully call this method, other members in the chat room receive an `onAttributesRemoved` callback.

```java
// Removes a custom attribute by specifying chat room ID and attribute key.
ChatClient.getInstance().chatroomManager().asyncRemoveChatRoomAttributeFromServerForced(chatRoomId, attributeKey, new CallBack() {
    @Override
    public void onSuccess() {}
    @Override
    public void onError(int error, String errorMsg) {}
});
```

#### Remove multiple custom attributes
To remove multiple custom attributes, chat room members can call the `asyncRemoveChatRoomAttributesFromServer` method with same name to remove multiple custom attributes that are set by themselves. After you successfully call this method, other members in the chat room receive an `onAttributesRemoved` callback.

```java
// Removes multiple custom attributes by specifying chat room ID and the attribute key list.
ChatClient.getInstance().chatroomManager().asyncRemoveChatRoomAttributesFromServer(chatRoomId, keyList, new ResultCallBack > () {
    @Override
    public void onResult(int code, Map  failureMap) {
        // code == Error.EM_NO_ERROR indicates all the custom attributes are removed successfully. In this case, failureMap is an empty map.
        // code != Error.EM_NO_ERROR indicates that the request fails. For error reasons please refer to the Error class.
        // In this case, failureMap contains the custom attributes that are not removed successfully, and value represents the error code.
    }
});
```

If you want to update custom attributes that set by other members, call `asyncRemoveChatRoomAttributesFromServerForced` instead. After you successfully call this method, other members in the chat room receive an `onAttributesRemoved` callback.

```java
// Removes multiple custom attributes by specifying chat room ID and the attribute key list.
ChatClient.getInstance().chatroomManager().asyncRemoveChatRoomAttributesFromServerForced(chatRoomId, keyList, new ResultCallBack > () {
    @Override
    public void onResult(int code, Map  failureMap) {
        // code == Error.EM_NO_ERROR indicates all the custom attributes are removed successfully. In this case, failureMap is an empty map.
        // code != Error.EM_NO_ERROR indicates that the request fails. For error reasons please refer to the Error class.
        // In this case, failureMap contains the custom attributes that are not removed successfully, and value represents the error code.
    }
});
```

### iOS

### Manage basic chat room attributes

#### Retrieve basic chat room attributes

All chat room members can call `getChatroomSpecificationFromServerWithId` to retrieve the detailed information of the current chat room, including the subject, announcements, description, member type, and admin list.

```objc
// Chat room members can call getChatroomSpecificationFromServerWithId to get the information of the specified chat room.
AgoraChatError *error = nil;
AgoraChatroom *chatroom = [[AgoraChatClient sharedClient].roomManager getChatroomSpecificationFromServerWithId:@“chatroomId” error:&error];
```

#### Change chat room name or description
Only the chat room owner and admin can set and update the chat room name and description.

```objc
// The chat room owner and admins can call updateSubject to update the chat room name.
AgoraChatError *error = nil;
[[AgoraChatClient sharedClient].roomManager updateSubject:textString forChatroom:self.chatroom.chatroomId error:&error];

// The chat room owner and admins can call updateDescription to update the chat room description.
AgoraChatError *error = nil;
[[AgoraChatClient sharedClient].roomManager updateDescription:textString forChatroom:self.chatroom.chatroomId error:&error];
```

#### Retrieve or change chat room announcements

All chat room members can retrieve the chat room announcements.

Only the chat room owner and admins can set and update the chat room announcements. Once the announcements are updated, all the chat room members receive the `chatroomAnnouncementDidUpdate` callback.

```objc
// Chat room members can call getChatroomAnnouncementWithId to retrieve the chat room announcements.
[AgoraChatClient.sharedClient.roomManager getChatroomAnnouncementWithId:@"chatRoomId" error:&error];

// The chat room owner and admins can call updateChatroomAnnouncementWithId to set or update the chat room announcements.
AgoraChatError *error =  nil;
[[AgoraChatClient sharedClient].roomManager updateChatroomAnnouncementWithId:_chatroomId announcement:textString error:&error];
```

### Manage custom chat room attributes

#### Set a custom attribute
Chat room members can call `setChatroomAttributes` to set one single custom attribute. Use this method to add new custom attributes or update existing attributes that are set by yourself. After you successfully call this method, other members in the chat room receive a `chatroomAttributesDidUpdated` callback.

```objc
// Sets a custom attribute by specifying chat room ID, attribute key, and attribute value.
[AgoraChatClient.sharedClient.roomManager setChatroomAttributes:self.currentConversation.conversationId key:@"234" value:@"123" autoDelete:YES completionBlock:^(EMError * _Nullable aError, NSDictionary * _Nullable failureKeys) {
                }];
```

If you want to update a custom attribute that is set by other members, call `setChatroomAttributesForced` instead. After you successfully call this method, other members in the chat room receive a `chatroomAttributesDidUpdated` callback.

```objc
// Sets a custom attribute by specifying chat room ID, attribute key, and attribute value.
[AgoraChatClient.sharedClient.roomManager setChatroomAttributesForced:self.currentConversation.conversationId key:@"234" value:@"123" autoDelete:YES completionBlock:^(EMError * _Nullable aError, NSDictionary * _Nullable failureKeys) {
                }];
```

#### Set multiple custom attributes
To set multiple custom attributes, call the `setChatroomAttributes` method with same name. Use this method to add new custom attributes or update existing attributes that are set by yourself. After you successfully call this method, other members in the chat room receive a `chatroomAttributesDidUpdated` callback.

```objc
// Sets multiple custom attributes by specifying chat room ID and the key-value maps of the attributes.
[AgoraChatClient.sharedClient.roomManager setChatroomAttributes:self.currentConversation.conversationId attributes:@{@"testKey":@"123"} autoDelete:YES completionBlock:^(EMError * _Nullable aError, NSDictionary * _Nullable failureKeys) {
                }];
```

If you want to update custom attributes that are set by other members, call `setChatroomAttributesForced` instead. After you successfully call this method, other members in the chat room receive a `chatroomAttributesDidUpdated` callback.

```objc
// Sets a custom attribute by specifying chat room ID and the key-value map of the attribute.
[AgoraChatClient.sharedClient.roomManager setChatroomAttributesForced:self.currentConversation.conversationId attributes:@{@"testKey":@"123"} autoDelete:YES completionBlock:^(EMError * _Nullable aError, NSDictionary * _Nullable failureKeys) {
                }];
```

#### Retrieve specified or all custom attributes
All chat room members can call `fetchChatroomAttributes` or `fetchChatroomAllAttributes` to retrieve specified or all custom attributes of the chat room.

```objc
// Retrieves certain custom attributes by specifying chat room ID and attribute keys.
[AgoraChatClient.sharedClient.roomManager fetchChatroomAttributes:self.currentConversation.conversationId keys:@[@"123"] completion:^(NSDictionary * _Nullable map, EMError * _Nullable error) {
            }];

// Retrieves all custom attributes by specifying chat room ID.
[AgoraChatClient.sharedClient.roomManager fetchChatroomAllAttributes:self.currentConversation.conversationId completion:^(NSDictionary * _Nullable map, EMError * _Nullable error) {
            }];
```

#### Remove a custom attribute
Chat room members can call `removeChatroomAttributes` to remove one single custom attribute that is set by themselves. After you successfully call this method, other members in the chat room receive a `chatroomAttributesDidRemoved` callback.

```objc
// Removes a custom attribute by specifying chat room ID and attribute key.
[AgoraChatClient.sharedClient.roomManager removeChatroomAttributes:self.currentConversation.conversationId key:@"234" autoDelete:YES completionBlock:^(EMError * _Nullable aError, NSDictionary * _Nullable failureKeys) {
                }];
```

If you want to update custom attributes that are set by other members, call `removeChatroomAttributesForced` instead. After you successfully call this method, other members in the chat room receive a `chatroomAttributesDidRemoved` callback.

```objc
// Removes a custom attribute by specifying chat room ID and attribute key.
[AgoraChatClient.sharedClient.roomManager removeChatroomAttributesForced:self.currentConversation.conversationId key:@"234" autoDelete:YES completionBlock:^(EMError * _Nullable aError, NSDictionary * _Nullable failureKeys) {
                }];
```

#### Remove multiple custom attributes
To remove multiple custom attributes, chat room members can call the `removeChatroomAttributes` method with same name to remove multiple custom attributes that are set by themselves. After you successfully call this method, other members in the chat room receive a  `chatroomAttributesDidRemoved` callback.

```objc
// Removes multiple custom attributes by specifying chat room ID and the attribute key list.
[AgoraChatClient.sharedClient.roomManager removeChatroomAttributes:self.currentConversation.conversationId attributes:@[@"testKey"] completionBlock:^(EMError * _Nullable aError, NSDictionary * _Nullable failureKeys) {
                }];
```

If you want to update custom attributes that are set by other members, call `removeChatroomAttributesForced` instead. After you successfully call this method, other members in the chat room receive a `chatroomAttributesDidRemoved` callback.

```objc
// Removes multiple custom attributes by specifying chat room ID and the attribute key list.
[AgoraChatClient.sharedClient.roomManager removeChatroomAttributesForced:self.currentConversation.conversationId attributes:@[@"testKey"] completionBlock:^(EMError * _Nullable aError, NSDictionary * _Nullable failureKeys) {
                }];
```

### Flutter

### Manage basic chat room attributes

#### Retrieve basic chat room attributes

 All chat room members can call `fetchChatRoomInfoFromServer` to retrieve the basic attributes of a chat room, including the chat room ID, name, description, announcement, owner, admin list, maximum number of members, and whether all members are muted.

The following code sample shows how to retrieve basic chat room attributes:

```dart
// Chat room members can call fetchChatRoomInfoFromServer to retrieve the basic attributes of a chat room.
try {
  ChatRoom room = await ChatClient.getInstance.chatRoomManager.fetchChatRoomInfoFromServer(roomId);
} on ChatError catch (e) {
}
```

#### Change the chat room name or description

Only the chat room owner and admin can set and update the chat room name and description.

```dart
// The chat room owner and admin can call changeChatRoomName to change the chat room name.
try {
  await ChatClient.getInstance.chatRoomManager.changeChatRoomName(
    roomId,
    newName,
  );
} on ChatError catch (e) {
}

// The chat room owner and admin call changeChatRoomDescription to modify the chat room description.
try {
  await ChatClient.getInstance.chatRoomManager.changeChatRoomDescription(
    roomId,
    newDesc,
  );
} on ChatError catch (e) {
}
```

#### Retrieve or change chat room announcement

All chat room members can retrieve the chat room announcement.

Only the chat room owner and admin can set and update the announcement. Once the announcement is updated, all the other chat room members receive the `ChatRoomEventHandler#onAnnouncementChangedFromChatRoom` callback.

```dart
// Chat room members can call fetchChatRoomAnnouncement to retrieve the chat room announcement.
try {
  String? announcement =
      await ChatClient.getInstance.chatRoomManager.fetchChatRoomAnnouncement(
    roomId,
  );
} on ChatError catch (e) {
}
// The chat room owner and admin can call updateChatRoomAnnouncement to set or update the chat room announcement.
try {
  await ChatClient.getInstance.chatRoomManager.updateChatRoomAnnouncement(
    roomId,
    newAnnouncement,
  );
} on ChatError catch (e) {
}
```

### Manage custom chat room attributes

#### Set one ore more custom attributes

Chat room members can call `addAttributes` to set one or more custom attributes. Use this method to add new custom attributes or update existing attributes that are set by yourself and others. After you successfully call this method, other members in the chat room receive an `EMChatRoomEventHandler#onAttributesUpdated` callback.

```dart
// Sets custom attributes by specifying the chat room ID and key-value maps of the attributes.
try {
  Map? failInfo =
      await ChatClient.getInstance.chatRoomManager.addAttributes(
    "room",
    attributes: kv,
    deleteWhenLeft: true,
    overwrite: true,
  );
} on ChatError catch (e) {}
```

#### Retrieve specified or all custom attributes

All chat room members can call `fetchChatRoomAttributes` to retrieve the specified or all custom attributes of the chat room.

```dart
// Retrieves certain or all custom attributes by specifying chat room ID and attribute keys.
try {
    Map? attributes =
        await ChatClient.getInstance.chatRoomManager.fetchChatRoomAttributes(
        roomId,
        keys,
    );
} on ChatError catch (e) {}
```

#### Remove one or more custom attributes

Chat room members can call `removeAttributes` to remove one or more custom attributes that are set by themselves and others. After you successfully call this method, other members in the chat room receive an `EMChatRoomEventHandler#onAttributesRemoved` callback.

```dart
// Removes custom attributes by specifying the chat room ID and the attribute key list.
try {
  Map? failInfo =
      await ChatClient.getInstance.chatRoomManager.removeAttributes(
    roomId,
    keys: keys,
    force: true,
  );
} on ChatError catch (e) {}
```

### Listen for chat room events

For details, see [Chat Room Events](manage-chatrooms#listen-for-chat-room-events).

### React Native

### Manage basic chat room attributes

#### Retrieve basic chat room attributes

All the chat room members can call `fetchChatRoomInfoFromServer` to retrieve the detailed information of the current chat room, including the subject, announcement, description, member type, and admin list.

```typescript
// Chat room members can call fetchChatRoomInfoFromServer to retrieve the basic attributes of the chat room.
ChatClient.getInstance()
  .roomManager.fetchChatRoomInfoFromServer(roomId)
  .then((response) => {
    rollLog(`success: ${response}`);
  })
  .catch((error) => {
    rollLog(`fail: ${error}`);
  });
```

#### Change the chat room name or description

Only the chat room owner and admin can set and update the chat room name and description.

```typescript
// The chat room owner and admin call changeChatRoomSubject to change the chat room name.
ChatClient.getInstance()
  .roomManager.changeChatRoomSubject(roomId, subject)
  .then((response) => {
    rollLog(`success: ${response}`);
  })
  .catch((error) => {
    rollLog(`fail: ${error}`);
  });

// The chat room owner and admin call changeChatroomDescription to modify the chat room description.
ChatClient.getInstance()
  .roomManager.changeChatRoomDescription(roomId, desc)
  .then((response) => {
    rollLog(`success: ${response}`);
  })
  .catch((error) => {
    rollLog(`fail: ${error}`);
  });
```

#### Retrieve or change the chat room announcement

All chat room members can retrieve the chat room announcement.

Only the chat room owner and admin can set and update the announcement. Once the announcement is updated, all the other chat room members receive the `onAnnouncementChanged` callback.

```typescript
// Chat room members can call fetchChatRoomAnnouncement to retrieve the chat room announcement.
ChatClient.getInstance()
  .roomManager.fetchChatRoomAnnouncement(roomId)
  .then((response) => {
    rollLog(`success: ${response}`);
  })
  .catch((error) => {
    rollLog(`fail: ${error}`);
  });

// The chat room owner and admin can call updateChatRoomAnnouncement to set or update the chat room announcement.
ChatClient.getInstance()
  .roomManager.updateChatRoomAnnouncement(roomId, announcement)
  .then((response) => {
    rollLog(`success: ${response}`);
  })
  .catch((error) => {
    rollLog(`fail: ${error}`);
  });
```

### Manage custom chat room attributes

#### Set one or more custom attributes

All chat room members can call `addAttributes` to set one or more custom attribute. Use this method to add new custom attributes or update existing attributes that are set by yourself and others. After you successfully call this method, other members in the chat room receive an `onAttributesUpdated` callback.

```typescript
// Sets custom attribute by specifying the chat room ID and the key-value maps of the attributes.
ChatClient.getInstance()
  .roomManager.addAttributes({
    roomId,
    attributes,
    deleteWhenLeft,
    overwrite,
  })
  .then((response) => {
    rollLog(`success: ${response}`);
  })
  .catch((error) => {
    rollLog(`fail: ${error}`);
  });
```

#### Retrieve specified or all custom attributes

All chat room members can call `fetchChatRoomAttributes` to retrieve the specified or all custom attributes of the chat room.

```typescript
// Retrieves certain custom attributes by specifying chat room ID and attribute keys.
// Retrieves all custom attributes if you pass an empty key.
ChatClient.getInstance()
  .roomManager.fetchChatRoomAttributes(roomId, keys)
  .then((response) => {
    rollLog(`success: ${response}`);
  })
  .catch((error) => {
    rollLog(`fail: ${error}`);
  });
```

#### Remove one or more custom attributes

All chat room members can call `removeAttributes` to remove one or more custom attributes that are set by themselves and others. After you successfully call this method, other members in the chat room receive an `onAttributesRemoved` callback.

```typescript
// Removes custom attributes by specifying the chat room ID and the attribute key list.
ChatClient.getInstance()
  .roomManager.removeAttributes({
    roomId,
    keys,
    forced,
  })
  .then((response) => {
    rollLog(`success: ${response}`);
  })
  .catch((error) => {
    rollLog(`fail: ${error}`);
  });
```

### Listen for chat room events

For details, see [Chat Room Events](manage-chatrooms#listen-for-chat-room-events).

### Windows

### Manage basic chat room attributes

#### Retrieve basic chat room attributes

All chat room members can call `FetchRoomInfoFromServer` to retrieve the detailed information of the current chat room, including the subject, announcement, description, member type, and admin list.

```csharp
// The chat room members can call FetchRoomInfoFromServer to get the information of the specified chat room.
SDKClient.Instance.RoomManager.FetchRoomInfoFromServer(roomId, new ValueCallBack(
    onSuccess: (room) => {
    },
    onError: (code, desc) => {
    }
));
```

#### Change chat room name or description
Only the chat room owner and admin can set and update the chat room name and description.

```csharp
// The chat room owner and admin can call ChangeRoomName to change the chat room name.
SDKClient.Instance.RoomManager.ChangeRoomName(roomId, name, new CallBack(
    onSuccess: () => {
    },
    onError: (code, desc) => {
    }
));

// The chat room owner and admin can call ChangeRoomDescription to modify the chat room description.
SDKClient.Instance.RoomManager.ChangeRoomDescription(roomId, newDesc, new CallBack(
    onSuccess: () => {
    },
    onError: (code, desc) => {
    }
));
```

#### Retrieve or change chat room announcements

All chat room members can retrieve the chat room announcement.

Only the chat room owner and admin can set and update the announcement. Once the announcement is updated, all the other chat room members receive the `OnAnnouncementChangedFromRoom` callback.

```csharp
// Chat room members can call FetchRoomAnnouncement to retrieve the chat room announcement.
SDKClient.Instance.RoomManager.FetchRoomAnnouncement(roomId, new ValueCallBack(
    onSuccess: (announcement) => {
    },
    onError: (code, desc) => {
    }
));

// The chat room owner and admin can call UpdateRoomAnnouncement to set or update the chat room announcement.
SDKClient.Instance.RoomManager.UpdateRoomAnnouncement(roomId, announcement, new CallBack(
    onSuccess: () => {
    },
    onError: (code, desc) => {
    }
));
```

### Manage custom chat room attributes

#### Set one or more custom attributes

All chat room members can call `AddAttributes` to set one or more custom attributes. Use this method to add new custom attributes or update existing attributes that are set by yourself and others. After you successfully call this method, other members in the chat room receive an `OnChatroomAttributesChanged` callback.

```csharp
// Sets custom attributes by specifying the chat room ID and key-value maps of the attributes.
SDKClient.Instance.RoomManager.AddAttributes(roomId, kv, deleteWhenExit, forced, new CallBackResult(
    onSuccessResult: (Dictionary failInfo) => {
        if(failInfo.Count == 0)
        {
            //All custom attributes are successfully set.
        }
        else
        {
            //Failed to set certain custom attributes.
        }
    },
    onError: (code, desc) => {
    }
));
```

#### Retrieve specified or all custom attributes

All chat room members can call `FetchAttributes` to retrieve the specified or all custom attributes of the chat room.

```csharp
// Retrieves certain or all custom attributes by specifying chat room ID and attribute keys.
SDKClient.Instance.RoomManager.FetchAttributes(roomId, keys, new ValueCallBack>(
    onSuccess: (Dictionary dict) => {
    },
    onError: (code, desc) => {
    }
));
```

#### Remove one or more custom attributes

Chat room members can call `RemoveAttributes` to remove one or more custom attributes that are set by themselves and others. After you successfully call this method, other members in the chat room receive an `OnChatroomAttributesRemoved` callback.

```csharp
// Removes custom attributes by specifying the chat room ID and the attribute key list.
SDKClient.Instance.RoomManager.RemoveAttributes(roomId, keys, forced, new CallBackResult(
    onSuccessResult: (Dictionary failInfo) => {
        if (failInfo.Count == 0)
        {
            // All the custom attributes are removed successfully.
        }
        else
        {
            // Certain custom attributes are not removed successfully.
        }
    },
    onError: (code, desc) => {
    }
));
```

For details, see [Chat Room Events](manage-chatrooms#listen-for-chat-room-events).

### Unity

### Manage basic chat room attributes

#### Retrieve basic chat room attributes

All chat room members can call `FetchRoomInfoFromServer` to retrieve the detailed information of the current chat room, including the subject, announcement, description, member type, and admin list.

```csharp
// The chat room members can call FetchRoomInfoFromServer to get the information of the specified chat room.
SDKClient.Instance.RoomManager.FetchRoomInfoFromServer(roomId, new ValueCallBack(
    onSuccess: (room) => {
    },
    onError: (code, desc) => {
    }
));
```

#### Change chat room name or description
Only the chat room owner and admin can set and update the chat room name and description.

```csharp
// The chat room owner and admin can call ChangeRoomName to change the chat room name.
SDKClient.Instance.RoomManager.ChangeRoomName(roomId, name, new CallBack(
    onSuccess: () => {
    },
    onError: (code, desc) => {
    }
));

// The chat room owner and admin can call ChangeRoomDescription to modify the chat room description.
SDKClient.Instance.RoomManager.ChangeRoomDescription(roomId, newDesc, new CallBack(
    onSuccess: () => {
    },
    onError: (code, desc) => {
    }
));
```

#### Retrieve or change chat room announcements

All chat room members can retrieve the chat room announcement.

Only the chat room owner and admin can set and update the announcement. Once the announcement is updated, all the other chat room members receive the `OnAnnouncementChangedFromRoom` callback.

```csharp
// Chat room members can call FetchRoomAnnouncement to retrieve the chat room announcement.
SDKClient.Instance.RoomManager.FetchRoomAnnouncement(roomId, new ValueCallBack(
    onSuccess: (announcement) => {
    },
    onError: (code, desc) => {
    }
));

// The chat room owner and admin can call UpdateRoomAnnouncement to set or update the chat room announcement.
SDKClient.Instance.RoomManager.UpdateRoomAnnouncement(roomId, announcement, new CallBack(
    onSuccess: () => {
    },
    onError: (code, desc) => {
    }
));
```

### Manage custom chat room attributes

#### Set one or more custom attributes

All chat room members can call `AddAttributes` to set one or more custom attributes. Use this method to add new custom attributes or update existing attributes that are set by yourself and others. After you successfully call this method, other members in the chat room receive an `OnChatroomAttributesChanged` callback.

```csharp
// Sets custom attributes by specifying the chat room ID and key-value maps of the attributes.
SDKClient.Instance.RoomManager.AddAttributes(roomId, kv, deleteWhenExit, forced, new CallBackResult(
    onSuccessResult: (Dictionary failInfo) => {
        if(failInfo.Count == 0)
        {
            //All custom attributes are successfully set.
        }
        else
        {
            //Failed to set certain custom attributes.
        }
    },
    onError: (code, desc) => {
    }
));
```

#### Retrieve specified or all custom attributes

All chat room members can call `FetchAttributes` to retrieve the specified or all custom attributes of the chat room.

```csharp
// Retrieves certain or all custom attributes by specifying chat room ID and attribute keys.
SDKClient.Instance.RoomManager.FetchAttributes(roomId, keys, new ValueCallBack>(
    onSuccess: (Dictionary dict) => {
    },
    onError: (code, desc) => {
    }
));
```

#### Remove one or more custom attributes

Chat room members can call `RemoveAttributes` to remove one or more custom attributes that are set by themselves and others. After you successfully call this method, other members in the chat room receive an `OnChatroomAttributesRemoved` callback.

```csharp
// Removes custom attributes by specifying the chat room ID and the attribute key list.
SDKClient.Instance.RoomManager.RemoveAttributes(roomId, keys, forced, new CallBackResult(
    onSuccessResult: (Dictionary failInfo) => {
        if (failInfo.Count == 0)
        {
            // All the custom attributes are removed successfully.
        }
        else
        {
            // Certain custom attributes are not removed successfully.
        }
    },
    onError: (code, desc) => {
    }
));
```

For details, see [Chat Room Events](manage-chatrooms#listen-for-chat-room-events).

### Web

### Manage basic chat room attributes

#### Retrieve basic chat room attributes

All chat room members can retrieve the detailed information of the current chat room, including the subject, announcements, description, member type, and admin list.

```javascript
// Chat room members can call getChatRoomDetails to get the information of the specified chat room.

const options = {
  chatRoomId: "chatRoomId",
};
chatClient.getChatRoomDetails(options).then((res) => console.log(res));
```

#### Change basic chat room attributes

Only the chat room owner and admin can set and update the basic chat room attributes, including subject, description, and maximum room members.

```javascript
// The chat room owner and admins can call modifyChatRoom to update the chat room attributes.
const options = {
  chatRoomId: "chatRoomId",
  chatRoomName: "chatRoomName", // The name of the chat room
  description: "description", // The description of the chat room
  maxusers: 200, // The maximum number of chat room members
};
chatClient.modifyChatRoom(options).then((res) => console.log(res));
```

#### Retrieve or change chat room announcements

All chat room members can retrieve the chat room announcements.

The chat room owner and admins can set and update the chat room announcements. Once the announcements are updated, all the chat room members receive the `updateAnnouncement` callback.

```javascript
// Chat room members can call fetchChatRoomAnnouncement to retrieve the chat room announcements.
const options = {
  roomId: "roomId",
};
chatClient.fetchChatRoomAnnouncement(options).then((res) => console.log(res));

// The chat room owner and admins can call updateChatRoomAnnouncement to set or update the chat room announcements.
const options = {
  roomId: "roomId",
  announcement: "hello everyone",
};
chatClient.updateChatRoomAnnouncement(options).then((res) => console.log(res));
```

### Manage custom chat room attributes

#### Set a custom attribute

Chat room members can call `setChatRoomAttribute` to set one single custom attribute. After you successfully call this method, other members in the chat room receive an `updateChatRoomAttributes` callback.

```javascript
// Sets a custom attribute by specifying chat room ID, attribute key, and attribute value.
const options = {
    chatRoomId: "chatRoomId",// The chat room ID.
    attributeKey: "attributeKey";// The attribute key.
    attributeValue: "attributeValue"; // The attribute value.
    autoDelete: true; // (Optional) Whether to automatically delete the custom attributes set by a member when the member leaves the chat room.
    isForced: false  // (Optional) If the attribute is already set by another room member, whether to overwrite other members' setting.
}
chatClient.setChatRoomAttribute(options).then(res => console.log(res))
```

#### Set multiple custom attributes

To set multiple custom attributes, call the `setChatroomAttributes` method. After you successfully call this method, other members in the chat room receive an `updateChatRoomAttributes` callback.

```javascript
// Sets multiple custom attributes by specifying chat room ID and the key-value maps of the attributes.
   const options = {
       chatRoomId: "chatRoomId",  // The chat room ID.
       attributes:{  // The key-value maps of the attributes in the format of {"key":"value"}.
            "attributeKey1":"attributeValue1",
        	"attributeKey2":"attributeValue2",
         	"..."
       },
       autoDelete: true; // (Optional) Whether to automatically delete the custom attributes set by a member when the member leaves the chat room.
   	   isForced: false  // (Optional) If the attribute is already set by another room member, whether to overwrite other members' setting.
   }
   chatClient.setChatRoomAttributes(options).then(res => console.log(res))
```

#### Retrieve specified or all custom attributes

All chat room members can call `getChatRoomAttributes` to retrieve specified or all custom attributes of the chat room.

```javascript
// Retrieves certain custom attributes by specifying chat room ID and attribute keys.
const options = {
  chatRoomId: "chatRoomId", // The chat room ID.
  attributeKeys: ["attributeKey1", "attributeKey2", "..."], // The attribute key. If you leave it empty, all custom attributes are returned.
};
chatClient.getChatRoomAttributes(options).then((res) => console.log(res));
```

#### Remove a custom attribute

Chat room members can call `removeChatroomAttribute` to remove one single custom attribute. After you successfully call this method, other members in the chat room receive a `removeChatRoomAttributes` callback.

```javascript
// Removes a custom attribute by specifying chat room ID and attribute key.
const options = {
  chatRoomId: "chatRoomId", // The chat room ID.
  attributeKey: "attributeKey", // The attribute key.
  isForced: false, // (Optional) If the attribute is already set by another room member, whether to overwrite other members' setting.
};
chatClient.removeChatRoomAttribute(options).then((res) => console.log(res));
```

#### Remove multiple custom attributes

To remove multiple custom attributes, chat room members can call the `removeChatroomAttributes` method. After you successfully call this method, other members in the chat room receive a `removeChatRoomAttributes` callback.

```javascript
// Removes multiple custom attributes by specifying chat room ID and the attribute key list.
const options = {
  chatRoomId: "chatRoomId", // The chat room ID.
  attributeKeys: ["attributeKey1", "attributeKey2", "..."], // The attribute keys.
  isForced: false, // (Optional) If the attribute is already set by another room member, whether to overwrite other members' setting.
};
chatClient.removeChatRoomAttributes(options).then((res) => console.log(res));
```
