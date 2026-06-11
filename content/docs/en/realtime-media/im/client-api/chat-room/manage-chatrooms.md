---
title: "Manage chat rooms"
description: "Shows how to use the Agora Chat SDK to create and manage a chat room in your app."
---

s enable real-time messaging among multiple users.

 does not have a strict membership, and members do not retain any permanent relationship with each other. Once going offline, chat room members cannot receive any messages from the chat room and automatically leave the chat room after 2 minutes (members on the chat room allow list remain in the chat room even if they stay offline for 2 minutes or more).  is widely applied in live broadcast use cases such as stream chat in Twitch.

This page shows how to use the Chat SDK to create and manage a  in your app.

## Understand the tech

### Android

The Chat SDK provides the `ChatManager` and `ChatRoom` classes for chat room management, which allows you to implement the following features:

### iOS

The Chat SDK provides the `IAgoraChatroomManager`, `AgoraChatroomManagerDelegate`, and `AgoraChatRoom` classes for chat room management, which allows you to implement the following features:

### Flutter

The Chat SDK provides the `ChatRoom`, `ChatRoomManager`, and `ChatRoomEventHandler` classes for chat room management, which allows you to implement the following features:

### React Native

The Chat SDK provides the `ChatRoom`, `ChatRoomManager`, and `ChatRoomEventListener` classes for chat room management, which allows you to implement the following features:

### Windows

The Chat SDK provides the`Room`, `IRoomManager`, and `IRoomManagerDelegate` classes for chat room management, which allow you to implement the following features:

### Unity

The Chat SDK provides the`Room`, `IRoomManager`, and `IRoomManagerDelegate` classes for chat room management, which allow you to implement the following features:

### Web

The Chat SDK allows you to implement the following features:

- Create and destroy a chat room
- Join and leave a chat room
- Retrieve the chat room list from the server
- Retrieve the attributes of a chat room
- Listen for chat room events

## Prerequisites

Before proceeding, ensure that you meet the following requirements:

- You have initialized the Chat SDK. For details, see [SDK quickstart](../../get-started/get-started-sdk.mdx).
- You understand the call frequency limit of the Chat APIs supported by different pricing plans as described in [Limitations](../../reference/limitations.md).
- You understand the number of chat rooms supported by different pricing plans as described in [Pricing Plan Details](../../reference/pricing-plan-details.md).
- Only the app super admin has the privilege of creating a chat room. Ensure that you have added an app super admin by calling the [super-admin RESTful API](../../restful-api/chatroom-management/manage-chatroom-admins.md#adding-a-chat-room-super-admin).

## Implementation

This section introduces how to call the APIs provided by the Chat SDK to implement the features listed above.

### Android

### Create and destroy a chat room

[The app super admin](../../restful-api/chatroom-management/manage-chatroom-admins.md#adding-a-chat-room-super-admin) can call `createChatRoom` to create a chat room and set the chat room attributes such as the chat room subject, description, and the maximum number of members.

:::info
You are advised to call the [RESTful API](../../restful-api/chatroom-management/manage-chatrooms.md#creating-a-chat-room) to create a chat room from the server.
:::

```java
// The app super admin calls createChatRoom to create a chat room.
// Once the chat room is created, the super admin becomes the chat room owner.
ChatRoom  chatRoom = ChatClient.getInstance().chatroomManager().createChatRoom(subject, description, welcomMessage, maxUserCount, members);

// Only the chat room owner can call destroyChatRoom to disband the chat room.
// Once the chat room is disbanded, all the chat room members receive the onChatRoomDestroyed callback and are immediately removed from the chat room.
ChatClient.getInstance().chatroomManager().destroyChatRoom(chatRoomId);
```

### Join and leave a chat room

All the chat users can all `joinChatRoom` to join the specified chat room.

```java
// Once the chat user successfully joins the chat room, all the other chat room members receive the onMemberJoined callback.
ChatClient.getInstance().chatroomManager().joinChatRoom(chatRoomId, new ValueCallBack() {
    @Override
    public void onSuccess(ChatRoom value) {

    }

    @Override
    public void onError(int error, String errorMsg) {

    }
});

// All the chat room members can call leaveChatRoom to leave the specified chat room. Once a member leaves the chat room, all the other members receive the onMemberExited callback.
ChatClient.getInstance().chatroomManager().leaveChatRoom(chatRoomId);
```

By default, when you leave a chat room, the SDK removes all the chat room messages on the local device. If you do not want these messages removed, set `setDeleteMessagesAdExitChatRoom` in `ChatOptions` as `false`.

### Retrieve the chat room list and attributes

All chat users can get the chat room list from the server and retrieve the basic information of the specified chat room using the chat room ID.

```java
// Chat room members can call fetchPublicChatRoomsFromServer to get the specified number of chat rooms from the server. The maximum value of pageSize is 100.
PageResult chatRooms = ChatClient.getInstance().chatroomManager().
                            fetchPublicChatRoomsFromServer(pageNumber, pageSize);

// Chat room members can call fetchChatRoomFromServer to get the basic information of the specified chat room by passing the chat room ID.
ChatRoom chatRoom = ChatClient.getInstance().chatroomManager().fetchChatRoomFromServer(chatRoomId);
```

### Listen for chat room events

To monitor the chat room events, you can listen for the callbacks in the `ChatRoomManager` class and add app logics accordingly. If you want to stop listening for the callback, make sure that you remove the listener to prevent memory leakage.

```java
public interface ChatRoomChangeListener {
    /**
     * Occurs when the chat room instance is destroyed.
     * 
     * @param roomId        The chat room ID
     * @param roomName      The chat room name
     */
    void onChatRoomDestroyed(final String roomId, final String roomName);

    /**
     * Occurs when a new member joins the chat room.
     * 
     * @param roomId        The chat room ID
     * @param participant   The username of the new chat room member
     */
    void onMemberJoined(final String roomId, final String participant);

    /**
     * Occurs when a member leaves the chat room.
     * 
     * @param roomId        The chat room ID
     * @param roomName      The chat room name
     * @param participant   The username of the member that leaves the chat room
      */
    void onMemberExited(final String roomId, final String roomName, final String participant);

    /**
     * Occurs when a chat room member is removed.
     *
     * @param reason        The reason why this member is removed, either being kicked by the chat room admin, or being offline due to network conditions
     * @param roomId        The chat room ID
     * @param roomName      The chat room name
     * @param participant   The username of the member that is removed from the chat room
     */
    void onRemovedFromChatRoom(final int reason, final String roomId, final String roomName, final String participant);

    /**
     * Occurs when a member is added to the chat room mute list.
     *
     * @param chatRoomId    The chat room ID
     * @param mutes         The usernames of the members added to the chat room mute list
     * @param expireTime    The Unix timestamp when the mute expires, in miliseconds
     */
    void onMuteListAdded(final String chatRoomId, final List mutes, final long expireTime);

    /**
     * Occurs when a member is removed from the chat room mute list.
     *
     * @param chatRoomId    The chat room ID
     * @param mutes         The usernames of the members removed from the chat room mute list
     */
    void onMuteListRemoved(final String chatRoomId, final List mutes);

    /**
     * Occurs when a member is added to the chat room allow list.
     *
     * @param chatRoomId    The chat room ID
     * @param whitelist     The usernmaes of the members added to the chat room allow list
     */
    void onWhiteListAdded(final String chatRoomId, final List whitelist);

    /**
     * Occurs when a member is removed from the chat room allow list.
     *
     * @param chatRoomId    The chat room ID
     * @param whitelist     The usernames of the members removed from the chat room allow list
     */
    void onWhiteListRemoved(final String chatRoomId, final List whitelist);

    /**
     * Occurs when the state of muting all the chat room members changes.
     *
     * @param chatRoomId    The chat room ID
     * @param isMuted       Whether all the chat room members are muted
     */
    void onAllMemberMuteStateChanged(final String chatRoomId, final boolean isMuted);

    /**
     * Occurs when a member is added to the chat room admin list.
     *
     * @param chatRoomId    The chat room ID
     * @param admin         The username of the chat room member added to the admin list
     */
    void onAdminAdded(final String chatRoomId, final String admin);

    /**
     * Occurs when a member is removed from the chat room admin list.
     *
     * @param  chatRoomId   The chat room ID
     * @param  admin        The username of the chat name member removed from the admin list
     */
    void onAdminRemoved(final String chatRoomId, final String admin);

    /**
     * Occurs when the chat room ownership is transferred.
     *
     * @param chatRoomId    The chat room ID
     * @param newOwner      The username of the new chat room owner
     * @param oldOwner      The username of the original chat room owner
     */
    void onOwnerChanged(final String chatRoomId, final String newOwner, final String oldOwner);

    /**
     * Occurs when the chat room announcement is changed.
     * @param chatRoomId    The chat room ID
     * @param announcement  The new chat room announcements
     */
    void onAnnouncementChanged(String chatRoomId, String announcement);
}

// Occurs when custom chat room attributes are changed.
default void onChatroomAttributesDidChanged(String chatRoomId, Map attributeMap , String from){}

// Occurs when custom chat room attributes are removed.
default void onChatroomAttributesDidRemoved(String chatRoomId, List keyList , String from){}

// Adds a chat room listener to monitor chat room callback events.
ChatClient.getInstance().chatroomManager().addChatRoomChangeListener(chatRoomChangeListener);

// Removes the chat room listener.
ChatClient.getInstance().chatroomManager().removeChatRoomListener(chatRoomChangeListener);
```

### Update the chat room member count in real time

If many members join or leave a chat room in a very short time, you can update the chat room member count in real time:

1. When a user joins a chat room, other members in the chat room receive the `onMemberJoined` event. When a member leaves or is removed from a chat room, other members in the chat room receive the `onMemberExited` or `onRemovedFromChatRoom` event.

1. After the event is received, you can call the `getChatRoom` method to get local details of the chat room and call the `ChatRoom#getMemberCount` method to get the current number of members in the chat room.

```java
ChatClient.getInstance().chatroomManager().addChatRoomChangeListener(new ChatRoomChangeListener() {

        @Override
        public void onMemberJoined(String roomId, String participant) {
            //Get the current number of members in the chat room.
            ChatClient.getInstance().chatroomManager().getChatRoom(roomId).getMemberCount();
        }

        @Override
        public void onMemberExited(String roomId, String roomName, String participant) {
            //ChatClient.getInstance().chatroomManager().getChatRoom(roomId).getMemberCount();
        }

    });
```

### iOS

### Create and destroy a chat room

The [app super admin](../../restful-api/chatroom-management/manage-chatroom-admins.md) can create a chat room and set the chat room attributes such as the chat room subject, description, and the maximum number of members. Once a chat room is created, the super admin automatically becomes the chat room owner.

:::info
You are advised to call the [RESTful API](../../restful-api/chatroom-management/manage-chatrooms.md#creating-a-chat-room) to create a chat room from the server.
:::

Only the chat room owner can disband a chat room. Once a chat room is disbanded, all the chat room members receive the `didDismissFromChatroom` callback and are immediately removed from the chat room.

```objc
// The super admin can call createChatroomWithSubject to create a chat room.
AgoraChatError *error = nil;
AgoraChatroom *retChatroom = [[AgoraChatClient sharedClient].roomManager createChatroomWithSubject:@"aSubject" description:@"aDescription" invitees:@[@"user1",@"user2"]message:@"aMessage" maxMembersCount:aMaxMembersCount error:&error];
// The chat room owner can call destroyChatroom to disband a chat room.
AgoraChatError *error = nil;
[[AgoraChatClient sharedClient].roomManager destroyChatroom:self.chatroom.chatroomId error:&error];
```

### Join and leave a chat room

All chat users can call `joinChatroom` to join the specified chat room. Once a chat user joins a chat room, all the other chat room members receive the `userDidJoinChatroom` callback.

All chat room members can call `leaveChatroom` to leave the specified chat room. Once a chat room member leaves a chat room, all the other members receive the `userDidLeaveChatroom` callback and all the local data is deleted by default. To retain data on the local device, set the `isDeleteMessagesWhenExitChatRoom` parameter of `AgoraChatOptions` to `NO`.

```objc
// All chat users can call joinChatroom to join the specified chat room.
AgoraChatError *error = nil;
[[AgoraChatClient sharedClient].roomManager joinChatroom:@"aChatroomId" error:&error]; 

// All chat room members can call leaveChatroom to leave the specified chat room.
AgoraChatError *error = nil;
[[AgoraChatClient sharedClient].roomManager leaveChatroom:@"aChatroomId" error:&error];
```

### Retrieve the chat room list and attributes

All chat users can get the chat room list from the server and retrieve the basic information of the specified chat room using the chat room ID.

```objc
// Chat room members can call getChatroomsFromServerWithPage to retrieve the specified number of chat rooms from the server by page. The maximum value of pageSize is 1,000.
AgoraChatError *error = nil;
[[AgoraChatClient sharedClient].roomManager getChatroomsFromServerWithPage:1 pageSize:50 error:&error];
														
// Chat room members can call chatroomWithId to get the basic information of the specified chat room by passing the chat room ID.
AgoraChatroom *chatRoom = [AgoraChatroom chatroomWithId:@"chatroomId"];
```

### Listen for chat room events

To monitor the chat room events, you can listen for the callbacks in the `ChatRoomManager` class and add app logics accordingly. If you want to stop listening for the callback, make sure that you remove the listener to prevent memory leakage.

```objc
// Listen for the callback.
[[AgoraChatClient sharedClient].roomManager addDelegate:self delegateQueue:nil];

// Stop listening for the callback.
[[AgoraChatClient sharedClient].roomManager removeDelegate:self];
```

```objc
/**
 *  Occurs when a user joins a chat room.
 *  @param aChatroom    The chat room ID
 *  @param aUsername    The username of the new chat room member
 */
- (void)userDidJoinChatroom:(AgoraChatroom *)aChatroom
                   user:(NSString *)aUsername{

}

/**
 *  Occurs when a member leaves a chat room.
 *  @param aChatroom    The chat room ID
 *  @param aUsername    The username of the member that leaves the chat room
 */
- (void)userDidLeaveChatroom:(AgoraChatroom *)aChatroom
                        user:(NSString *)aUsername {
}

/**
 *  Occurs when a member is removed from a chat room.
 *  @param aChatroom    The chat room ID
 *  @param aReason      The reason why this member is removed
 */
- (void)didDismissFromChatroom:(AgoraChatroom *)aChatroom
                        reason:(AgoraChatroomBeKickedReason)aReason {
                        
  }

/**
 *  Occurs when a member is added to the chat room mute list.
 *  @param aChatroom        The chat room ID
 *  @param aMutedMembers    The username of the member added to the must list
 *  @param aMuteExpire      The Unix timestamp when the mute expires. Not currently available.
 */
- (void)chatroomMuteListDidUpdate:(AgoraChatroom *)aChatroom
                addedMutedMembers:(NSArray *)aMutes
                       muteExpire:(NSInteger)aMuteExpire {
                        f
  }

/**
 *  Occurs when a member is removed from the chat room mute list.
 *  @param aChatroom        The chat room ID
 *  @param aMutedMembers    The username of the member removed from the mute list
 */
- (void)chatroomMuteListDidUpdate:(AgoraChatroom *)aChatroom
              removedMutedMembers:(NSArray *)aMutes {
                        
  }
  
/**
 *  Occurs when a member is added to the chat room admin list.
 *  @param aChatroom    The chat room ID
 *  @param aAdmin       The username of the member added to the admin list
 */
- (void)chatroomAdminListDidUpdate:(AgoraChatroom *)aChatroom
                        addedAdmin:(NSString *)aAdmin {
                        
  }

/**
 *  Occurs when a member is removed from the chat room admin list.
 *  @param aChatroom    The chat room ID
 *  @param aAdmin       The username of the admin removed from the admin list
 */
- (void)chatroomAdminListDidUpdate:(AgoraChatroom *)aChatroom
                      removedAdmin:(NSString *)aAdmin {
                        
  }

/**
 *  Occurs when the chat room owner is changed.
 *  @param aChatroom    The chat room ID.
 *  @param aNewOwner    The username of the new chat room owner.
 *  @param aOldOwner    The username of the original chat room owner.
 */
- (void)chatroomOwnerDidUpdate:(AgoraChatroom *)aChatroom
                      newOwner:(NSString *)aNewOwner
                      oldOwner:(NSString *)aOldOwner {
                      
}

// Occurs when basic information of the chat room is changed.
- (void)chatroomSpecificationDidUpdate:(EMChatroom *)aChatroom {

}

/**
* When custom chat room attributes are set or changed, all room members receives this callback.
* @param roomId The chat room ID.
* @param attributeMap The newly set or changed custom attributes.
*/

- (void)chatroomAttributesDidUpdated:(NSString *_Nonnull)roomId 
                        attributeMap:(NSDictionary *_Nullable)attributeMap 
                                from:(NSString *_Nonnull)fromId;
    }

/**
* When custom chat room attributes are removed, all room members receives this callback.
* @param roomId The chat room ID.
* @param attributes The removed custom attributes.
*/

- (void)chatroomAttributesDidRemoved:(NSString *Nonnull)roomId 
                          attributes:(NSArray *_Nullable)attributes 
                                from:(NSString *_Nonnull)fromId;
  
// Occurs when basic information of the chat room is changed.
- (void)chatroomSpecificationDidUpdate:(EMChatroom *)aChatroom {
  
  } 
  
/**
 *  When custom chat room attributes are set or changed, all room members receives this callback.
 *  @param roomId          The chat room ID.
 *  @param attributeMap    The newly set or changed custom attributes.
 */
- (void)chatroomAttributesDidUpdated:(NSString *_Nonnull)roomId attributeMap:(NSDictionary *_Nullable)attributeMap from:(NSString *_Nonnull)fromId {

  }

/**
 *  When custom chat room attributes are removed, all room members receives this callback.
 *  @param roomId        The chat room ID.
 *  @param attributes    The removed custom attributes.
 */
- (void)chatroomAttributesDidRemoved:(NSString *_Nonnull)roomId attributes:(NSArray *_Nullable)attributes from:(NSString *_Nonnull)fromId {

  }
```

### Update the chat room member count in real time

If many members join or leave a chat room in a very short time, you can update the chat room member count in real time:

1. When a user joins a chat room, other members in the chat room receive the `userDidJoinChatroom:user:` event. When a member leaves or is removed from a chat room, other members in the chat room receive the `userDidLeaveChatroom:user:` event.

2. After the event is received, you can call the `occupantsCount` method to get the current number of members in the chat room.

```objc
extension ViewController: AgoraChatroomManagerDelegate {
  func userDidJoin(_ aChatroom: AgoraChatroom, user aUsername: String) {
    let memberCount = aChatroom.occupantsCount
  }
  func userDidLeave(_ aChatroom: AgoraChatroom, user aUsername: String) {
    let memberCount = aChatroom.occupantsCount
  }
}

AgoraChatClient.shared().roomManager?.add(self, delegateQueue: nil)
```

### Flutter

### Create a chat room

Only the [app super admin](../../restful-api/chatroom-management/manage-chatroom-admins.md#adding-a-chat-room-super-admin) can call `createChatRoom` to create a chat room and set the chat room attributes such as the chat room name, description, and maximum number of members. Once a chat room is created, the super admin automatically becomes the chat room owner.

:::info
You are advised to call the [RESTful API](../../restful-api/chatroom-management/manage-chatrooms.md#creating-a-chat-room) to create a chat room from the server.
:::

The following code sample shows how to create a chat room:

```dart
try {
  ChatRoom room = await ChatClient.getInstance.chatRoomManager.createChatRoom(name);
} on ChatError catch (e) {
}
```

### Destroy a chat room

Only the chat room owner can call `destroyChatRoom` to disband a chat room. Once a chat room is disbanded, all chat room members receive the `ChatRoomEventHandler#onChatRoomDestroyed` callback and are immediately removed from the chat room.

The following code sample shows how to destroy a chat room:

```dart
try {
  await ChatClient.getInstance.chatRoomManager.destroyChatRoom(roomId);
} on ChatError catch (e) {
}
```

### Join a chat room

Refer to the following steps to join a chat room:

1. Call [`fetchPublicChatRoomsFromServer`](#retrieve-the-chat-room-list-from-the-server) to retrieve the list of chat rooms from the server and locate the ID of the chat room that you want to join.

2. Call `joinChatRoom` to pass in the chat room ID and join the specified chat room. Once a user joins a chat room, all the other chat room members receive the `ChatRoomEventHandler#onMemberJoinedFromChatRoom` callback.

#### Basic chat room joining

The following code sample shows how to join a chat room:

```dart
try {
   await ChatClient.getInstance.chatRoomManager.joinChatRoom(roomId);
} on ChatError catch (e) {
}
```

#### Advanced chat room joining with extended information

Call the `ChatRoomManager#joinChatRoom(String, bool, String)` method to set extended information when joining a chat room and specify whether to exit all other chat rooms. Other members in the chat room receive the `ChatRoomEventHandler.onMemberJoinedFromChatRoom(String roomId, String participant, String? ext)` callback with the extended information.

```dart
ChatClient.getInstance.chatRoomManager.joinChatRoom(
 "roomId",
 leaveOtherRooms: false,
 ext: 'ext',
);

// Add chat room event listener
ChatClient.getInstance.chatRoomManager.addEventHandler(
 "identifier",
 ChatRoomEventHandler(
   onMemberJoinedFromChatRoom: (roomId, participant, ext) {
     // Handle member joined event with extended information
   },
 ),
);

// Remove chat room event listener
ChatClient.getInstance.chatRoomManager.removeEventHandler("identifier");
```

When a user joins a chat room with extended information, other members in the chat room can access this extended information through the `ext` parameter in the `onMemberJoinedFromChatRoom` callback.

### Leave a chat room

All chat room members can call `leaveChatRoom` to leave the specified chat room. Once a member leaves the chat room, all the other chat room members receive the `ChatRoomEventHandler#onMemberExitedFromChatRoom` callback.

:::info
Unlike chat group owners (who cannot leave their groups), a chat room owner can leave a chat room. After re-entering the chat room, this user remains the chat room owner.
:::

The following code sample shows how to leave a chat room:

```dart
try {
   await ChatClient.getInstance.chatRoomManager.leaveChatRoom(roomId);
} on ChatError catch (e) {
}
```

By default, after a user leaves a chat room, the Chat SDK removes all chat room messages on the local device. If you do not want these messages removed, set `ChatOptions#deleteMessagesAsExitChatRoom` to `false` when initializing the SDK.

The following code sample shows how to retain the chat room messages after leaving a chat room:

```dart
ChatOptions options = ChatOptions(
      appKey: "",
      deleteMessagesAsExitChatRoom: false,
    );
```

### Retrieve the chat room attributes

All chat room members can call `fetchChatRoomInfoFromServer` to retrieve the attributes of the a chat room, including the chat room ID, name, description, announcements, owner, admin list, maximum number of members, and whether all members are muted.

The following code sample shows how to retrieve the chat room attributes:

```dart
try {
  ChatRoom room = await ChatClient.getInstance.chatRoomManager.fetchChatRoomInfoFromServer(roomId);
} on ChatError catch (e) {
}
```

### Retrieve the chat room list from the server

Users can call `fetchPublicChatRoomsFromServer` to retrieve the chat room list from the server.

```dart
try {
  ChatPageResult result = await ChatClient
      .getInstance.chatRoomManager
      .fetchPublicChatRoomsFromServer(
    // The page number from which to start retrieving chat rooms.
    pageNum: pageNum,
    // The maximum number of chat rooms to retrieve with pagination.
    pageSize: pageSize,
  );
} on ChatError catch (e) {
}
```

### Listen for chat room events

To monitor the chat room events, you can listen for the callbacks in the `ChatRoomEventHandler` class and add app logics accordingly. If you want to stop listening for the callback, make sure that you remove the listener to prevent memory leakage.

The following code sample shows how to add and remove the chat room listener:

```dart
    /// Add a chat room event listener.
    ChatClient.getInstance.chatRoomManager.addEventHandler(
       'UNIQUE_HANDLER_ID',,
       ChatRoomEventHandler(),
        /// Occurs when a member is added to the chat room admin list.
        onAdminAddedFromChatRoom: (roomId, admin) {},

        /// Occurs when a member is removed from the chat room admin list.
        onAdminRemovedFromChatRoom: (roomId, admin) {},

        /// Occurs when the state of muting all the chat room members changes.
        onAllChatRoomMemberMuteStateChanged: (roomId, isAllMuted) {},

        /// Occurs when a member is added to the chat room allow list.
        onAllowListAddedFromChatRoom: (roomId, members) {},

        /// Occurs when a member is removed from the chat room allow list.
        onAllowListRemovedFromChatRoom: (roomId, members) {},

        /// Occurs when the chat room announcement is changed.
        onAnnouncementChangedFromChatRoom: (roomId, announcement) {},

        /// Occurs when custom chat room attributes are removed.
        onAttributesRemoved: (roomId, removedKeys, from) {},

        /// Occurs when custom chat room attributes are changed.
        onAttributesUpdated: (roomId, attributes, from) {},

        /// Occurs when the chat room instance is destroyed.
        onChatRoomDestroyed: (roomId, roomName) {},

        /// Occurs when a member leaves the chat room.
        onMemberExitedFromChatRoom: (roomId, roomName, participant) {},

        /// Occurs when a new member joins the chat room.
        onMemberJoinedFromChatRoom: (roomId, participant) {},

        /// Occurs when a member is added to the chat room mute list.
        onMuteListAddedFromChatRoom: (roomId, mutes, expireTime) {},

        /// Occurs when a member is removed from the chat room mute list.
        onMuteListRemovedFromChatRoom: (roomId, mutes) {},

        /// Occurs when the chat room ownership is transferred.
        onOwnerChangedFromChatRoom: (roomId, newOwner, oldOwner) {},

        ///Occurs when a chat room member is removed.
        onRemovedFromChatRoom: (roomId, roomName, participant, reason) {},

        /// Occurs when the specifications of a chat room is changed.
        onSpecificationChanged: (room) {},
      ),
    );
// ...
/// Remove a chat room event listener.
ChatClient.getInstance.chatRoomManager.removeEventHandler('UNIQUE_HANDLER_ID');
```

### Update the chat room member count in real time

If many members join or leave a chat room in a very short time, you can update the chat room member count in real time:

1. When a user joins a chat room, other members in the chat room receive the `onMemberJoinedFromChatRoom` event. When a member leaves or is removed from a chat room, other members in the chat room receive the `onMemberExitedFromChatRoom` event.

1. After the event is received, you can call the `getChatRoomWithId` method to get local details of the chat room, including the current number of members in the chat room.

```dart
ChatClient.getInstance.chatRoomManager.addEventHandler(
    'UNIQUE_HANDLER_ID',
    ChatRoomEventHandler(
      onMemberJoinedFromChatRoom: (roomId, participant) async {
        ChatRoom? room = await ChatClient.getInstance.chatRoomManager.getChatRoomWithId(roomId);
        debugPrint("current room member count ${room?.memberCount}");
      },
      onMemberExitedFromChatRoom: (roomId, roomName, participant) async {
        ChatRoom? room = await ChatClient.getInstance.chatRoomManager.getChatRoomWithId(roomId);
        debugPrint("current room member count ${room?.memberCount}");
      },
    ));

// ...
ChatClient.getInstance.chatRoomManager.removeEventHandler('UNIQUE_HANDLER_ID');
```

### React Native

### Create a chat room

Only the [app super admin](../../restful-api/chatroom-management/manage-chatroom-admins.md) can call `createChatRoom` to create a chat room and set the chat room attributes such as the chat room name, description, and maximum number of members. Once a chat room is created, the super admin automatically becomes the chat room owner.

:::info
You are advised to call the [RESTful API](../../restful-api/chatroom-management/manage-chatrooms.md#creating-a-chat-room) to create a chat room from the server.
:::

The following code sample shows how to create a chat room:

```typescript
// The chat room name can be a maximum of 128 characters.
const subject = "";
// The chat room description can be a maximum of 512 characters.
const desc = "this is room description.";
// The welcome message.
const welcomeMsg = "welcome to you.";
// The members to add.
const members = ["Tom", "Json"];
// The maximum number of members.
const maxCount = 10000;
ChatClient.getInstance()
  .roomManager.createChatRoom(subject, desc, welcomeMsg, members, maxCount)
  .then(() => {
    console.log("get room success.");
  })
  .catch((reason) => {
    console.log("get room fail.", reason);
  });
```

### Destroy a chat room

Only the chat room owner can call `destroyChatRoom` to disband a chat room. Once a chat room is disbanded, all chat room members receive the `onChatRoomDestroyed` callback and are immediately removed from the chat room.

The following code sample shows how to destroy a chat room:

```typescript
ChatClient.getInstance()
  .roomManager.destroyChatRoom(roomId)
  .then(() => {
    console.log("destroy room success.");
  })
  .catch((reason) => {
    console.log("destroy room fail.", reason);
  });
```

### Join a chat room

Refer to the following steps to join a chat room:

1. Call [`FetchPublicRoomsFromServer`](#retrieve) to retrieve the list of chat rooms from the server and locate the ID of the chat room that you want to join.

2. Call `joinChatRoom` to pass in the chat room ID and join the specified chat room. Once a user joins a chat room, all the other chat room members receive the `onMemberJoined` callback.

The following code sample shows how to join a chat room:

```typescript
ChatClient.getInstance()
  .roomManager.joinChatRoom(roomId)
  .then(() => {
    console.log("join room success.");
  })
  .catch((reason) => {
    console.log("join room fail.", reason);
  });
```

### Leave a chat room

All chat room members can call `leaveChatRoom` to leave the specified chat room. Once a member leaves the chat room, all the other chat room members receive the `onMemberExited` callback.

**Note**: Unlike chat group owners (who cannot leave their groups), a chat room owner can leave a chat room. After re-entering the chat room, this user remains the chat room owner.

The following code sample shows how to leave a chat room:

```typescript
ChatClient.getInstance()
  .roomManager.leaveChatRoom(roomId)
  .then(() => {
    console.log("join room success.");
  })
  .catch((reason) => {
    console.log("join room fail.", reason);
  });
```

By default, after a user leaves a chat room, the Chat SDK removes all chat room messages on the local device. If you do not want these messages removed, set `ChatOptions#deleteMessagesAsExitChatRoom` to `false` when initializing the SDK.

The following code sample shows how to retain the chat room messages after leaving a chat room:

```typescript
ChatOptions options = new ChatOptions();
options.deleteMessagesAsExitChatRoom = false;
```

### Retrieve the chat room attributes

All chat room members can call `fetchChatRoomInfoFromServer` to retrieve the attributes of the a chat room, including the chat room ID, name, description, announcements, owner, admin list, maximum number of members, and whether all members are muted.

The following code sample shows how to retrieve the chat room attributes:

```typescript
ChatClient.getInstance()
  .roomManager.fetchChatRoomInfoFromServer(roomId)
  .then((info) => {
    console.log("get room info success.", info);
  })
  .catch((reason) => {
    console.log("get room info fail.", reason);
  });
```

### Retrieve the chat room list from the server

Users can call `FetchPublicRoomsFromServer` to retrieve the chat room list from the server. You can retrieve a maximum of `1,000` chat rooms at each call.

```typescript
// You can set the value of `pageSize` to a maximum of 1000.
ChatClient.getInstance()
  .roomManager.fetchPublicChatRoomsFromServer(pageNum, pageSize)
  .then((rooms) => {
    console.log("get room success.", rooms);
  })
  .catch((reason) => {
    console.log("get room fail.", reason);
  });
```

### Listen for chat room events

To monitor the chat room events, you can listen for the callbacks in the `ChatRoomEventListener` class and add app logics accordingly. If you want to stop listening for the callback, make sure that you remove the listener to prevent memory leakage.

The following code sample shows how to add and remove the chat room listener:

```typescript
// Inherits and implements the ChatRoomEventListener class.
const roomListener: ChatRoomEventListener = new (class
  implements ChatRoomEventListener
{
  that: QuickTestScreenBase;
  constructor(parent: QuickTestScreenBase) {
    this.that = parent;
  }
  // Occurs when a chat room instance is destroyed.
  onChatRoomDestroyed(params: {
    roomId: string;
    roomName?: string | undefined;
  }): void {
    console.log(`onChatRoomDestroyed:`, params.roomId, params.roomName);
  }
  // Occurs when a user joins a chat room.
  onMemberJoined(params: { roomId: string; participant: string }): void {
    console.log(`onMemberJoined:`, params.roomId, params.participant);
  }
  // Occurs when a member leaves a chat room.
  onMemberExited(params: {
    roomId: string;
    participant: string;
    roomName?: string | undefined;
  }): void {
    console.log(
      `onMemberJoined:`,
      params.roomId,
      params.participant,
      params.roomName
    );
  }
  // Occurs when a member is removed from a chat room.
  onRemoved(params: {
    roomId: string;
    participant?: string | undefined;
    roomName?: string | undefined;
  }): void {
    console.log(
      `onRemoved:`,
      params.roomId,
      params.participant,
      params.roomName
    );
  }
  // Occurs when a member is added to the chat room mute list.
  onMuteListAdded(params: {
    roomId: string;
    mutes: string[];
    expireTime?: string | undefined;
  }): void {
    console.log(
      `onMuteListAdded:`,
      params.roomId,
      params.mutes,
      params.expireTime
    );
  }
  // Occurs when a member is removed from the chat room mute list.
  onMuteListRemoved(params: { roomId: string; mutes: string[] }): void {
    console.log(`onMuteListRemoved:`, params.roomId, params.mutes);
  }
  // Occurs when a member is promoted to a chat room admin.
  onAdminAdded(params: { roomId: string; admin: string }): void {
    console.log(`onAdminAdded:`, params.roomId, params.admin);
  }
  // Occurs when an admin is demoted to a chat room member.
  onAdminRemoved(params: { roomId: string; admin: string }): void {
    console.log(`onAdminRemoved:`, params.roomId, params.admin);
  }
  // Occurs when the chat room ownership is transferred.
  onOwnerChanged(params: {
    roomId: string;
    newOwner: string;
    oldOwner: string;
  }): void {
    console.log(
      `onOwnerChanged:`,
      params.roomId,
      params.newOwner,
      params.oldOwner
    );
  }
  // Occurs when the chat room announcements are updated.
  onAnnouncementChanged(params: {
    roomId: string;
    announcement: string;
  }): void {
    console.log(`onAnnouncementChanged:`, params.roomId, params.announcement);
  }
  // Occurs when one or more chat room members are added to the allow list.
  onAllowListAdded(params: { roomId: string; members: string[] }): void {
    console.log(`onAllowListAdded:`, params.roomId, params.members);
  }
  // Occurs when one or more chat room members are removed from the allow list.
  onAllowListRemoved(params: { roomId: string; members: string[] }): void {
    console.log(`onAllowListRemoved:`, params.roomId, params.members);
  }
  // Occurs when all members in the chat room are muted or unmuted.
  onAllChatRoomMemberMuteStateChanged(params: {
    roomId: string;
    isAllMuted: boolean;
  }): void {
    console.log(
      `onAllChatRoomMemberMuteStateChanged:`,
      params.roomId,
      params.isAllMuted ? "true" : "false"
    );
  }
  // Occurs when the chat room specifications change. All chat room members receive this event.
  onSpecificationChanged(room: ChatRoom): void {
    console.log(`onSpecificationChanged:`, room);
  }
  // Occurs when the custom chat room attributes (key-value) are updated.
  onAttributesUpdated(params: {
    roomId: string;
    attributes: Map;
    from: string;
  }): void {
    console.log(
      `onAttributesUpdated:`,
      params.roomId,
      params.attributes,
      params.from
    );
  }
  // Occurs when the custom chat room attributes (key-value) are removed.
  onAttributesRemoved(params: {
    roomId: string;
    removedKeys: Array;
    from: string;
  }): void {
    console.log(
      `onAttributesRemoved:`,
      params.roomId,
      params.removedKeys,
      params.from
    );
  }
})(this);

// Removes the chat room listener.
ChatClient.getInstance().roomManager.removeAllRoomListener();
// Adds the chat room listener.
ChatClient.getInstance().roomManager.addRoomListener(roomListener);
```

### Update the chat room member count in real time

If many members join or leave a chat room in a very short time, you can update the chat room member count in real time:

1. When a user joins a chat room, other members in the chat room receive the `ChatRoomEventListener#onMemberJoined` event. When a member leaves or is removed from a chat room, other members in the chat room receive the `ChatRoomEventListener#onMemberExited` event.

1. After the event is received, you can call the `fetchChatRoomInfoFromServer` method to get local details of the chat room, including the current number of members in the chat room.

```typescript
ChatClient.getInstance()
  .chatManager.fetchChatRoomInfoFromServer(
    roomId // Room ID
  )
  .then((res) => {
    // Operation successful, room information obtained
  })
  .catch((error) => {
    // An error occurred
  });

```

### Windows

### Create a chat room

Only the [app super admin](../../restful-api/chatroom-management/manage-chatroom-admins.md) can call `CreateRoom` to create a chat room and set the chat room attributes such as the chat room name, description, and maximum number of members. Once a chat room is created, the super admin automatically becomes the chat room owner.

:::info
You are advised to call the [RESTful API](../../restful-api/chatroom-management/manage-chatrooms.md#creating-a-chat-room) to create a chat room from the server.
:::

The following code sample shows how to create a chat room:

```csharp
SDKClient.Instance.RoomManager.CreateRoom(subject, description, welcomeMsg, maxUserCount, members,callback: new ValueCallBack(
  onSuccess: (room) => {
  },
  onError:(code, desc) => {
  }
));
```

### Destroy a chat room

Only the chat room owner can call `DestroyRoom` to disband a chat room. Once a chat room is disbanded, all chat room members receive the `OnDestroyedFromRoom` callback and are immediately removed from the chat room.

The following code sample shows how to destroy a chat room:

```csharp
SDKClient.Instance.RoomManager.DestroyRoom(roomId, new CallBack(
  onSuccess: () => {
  },
  onError: (code, desc) => {
  }
));
```

### Join a chat room

Refer to the following steps to join a chat room:

1. Call `FetchPublicRoomsFromServer` to retrieve the list of chat rooms from the server and locate the ID of the chat room that you want to join.

2. Call `JoinRoom` to pass in the chat room ID and join the specified chat room. Once a user joins a chat room, all the other chat room members receive the `OnMemberJoinedFromRoom` callback.

The following code sample shows how to join a chat room:

```csharp
// Retrieve the list of chat rooms from the server
SDKClient.Instance.RoomManager.FetchPublicRoomsFromServer(callback: new ValueCallBack>(
            // `result` is of PageResult type
            onSuccess: (result) => {
            },
            onError:(code, desc) => {
            }
        ));

// Join a chat room
SDKClient.Instance.RoomManager.JoinRoom(roomId, new ValueCallBack(
  onSuccess: (room) => {
  },
  onError: (code, desc) => {
  }
));
```

### Leave a chat room

All chat room members can call `LeaveRoom` to leave the specified chat room. Once a member leaves the chat room, all the other chat room members receive the `OnMemberExitedFromRoom` callback.

**Note**: Unlike chat group owners (who cannot leave their groups), a chat room owner can leave a chat room. After re-entering the chat room, this user remains the chat room owner.

The following code sample shows how to leave a chat room:

```csharp
SDKClient.Instance.RoomManager.LeaveRoom(roomId, new CallBack(
  onSuccess: () => {
  },
  onError: (code, desc) => {
  }
));
```

By default, after a user leaves a chat room, the Chat SDK removes all chat room messages on the local device. If you do not want these messages removed, set `Options#DeleteMessagesAsExitRoom` to `false` when initializing the SDK.

The following code sample shows how to retain the chat room messages after leaving a chat room:

```csharp
Options options = new Options();
options. DeleteMessagesAsExitRoom = false;
```

### Update the chat room member count in real time

If many members join or leave a chat room within a short period, you can update the member count in real time:

1. When a user joins a chat room, other members receive the `OnMemberJoinedFromRoom` event. Similarly, when a member leaves or is removed, other members receive the `OnMemberExitedFromRoom` or `OnRemovedFromRoom` event.

2. After receiving an event, call `RoomManager#GetChatRoom` to retrieve local chat room details, and refer to `RoomManager#MemberCount` for the current number of members.

```csharp
class RoomManagerDelegate : IRoomManagerDelegate
{
    public void OnMemberJoinedFromRoom(string roomId, string participant, string ext)
    {
        int memberCount = SDKClient.Instance.RoomManager.GetChatRoom(roomId).MemberCount;
    }

    public void OnMemberExitedFromRoom(string roomId, string roomName, string participant)
    {
    }
    // Implement other functions of IRoomManagerDelegate
}

// Register the delegate
RoomManagerDelegate roomManagerDelegate = new RoomManagerDelegate();
SDKClient.Instance.RoomManager.AddRoomManagerDelegate(roomManagerDelegate);
```

### Retrieve the chat room attributes

All chat room members can call `FetchRoomInfoFromServer` to retrieve the attributes of the chat room, including the chat room ID, name, description, announcement, owner, admin list, member list, block list, mute list, maximum number of members, and whether all members are muted.

The following code sample shows how to retrieve the chat room attributes:

```csharp
SDKClient.Instance.RoomManager.FetchRoomInfoFromServer(roomId, new ValueCallBack(
  onSuccess: (room) => {
  },
  onError: (code, desc) => {
  }
));
```

### Retrieve the chat room list from the server

Users can call `FetchPublicRoomsFromServer` to get the chat room list from the server. You can get a maximum of 1,000 chat rooms at each call.

```csharp
// You can set the value of `pageSize` to a maximum of 1000.
SDKClient.Instance.RoomManager.FetchPublicRoomsFromServer(pageNum, pageSize, callback: new ValueCallBack>(
  // `rooms` is of PageResult type.
  onSuccess: (rooms) => {
  },
  onError:(code, desc) => {
  }
));
```

### Listen for chat room events

To monitor the chat room events, you can listen for the callbacks in the `IRoomManagerDelegate` class and add app logics accordingly. If you want to stop listening for the callback, make sure that you remove the listener to prevent memory leakage.

The following code sample shows how to add and remove the chat room listener:

```csharp
// Inherits and implements the IRoomManagerDelegate class.
public class RoomManagerDelegate : IRoomManagerDelegate {
    ......
    public void OnDestroyedFromRoom(string roomId, string roomName)
    {
    }
    ......
}
// Adds the chat room listener.
RoomManagerDelegate adelegate = new RoomManagerDelegate();
SDKClient.Instance.RoomManager.AddRoomManagerDelegate(adelegate);

// Removes the chat room listener.
SDKClient.Instance.RoomManager.AddRoomManagerDelegate(adelegate);
```

Refer to the following code sample to listen for chat room events:

```csharp
public interface IRoomManagerDelegate
    {
        /**
        * Occurs when a chat room instance is destroyed.
        * 
        * @param roomId        The chat room ID
        * @param roomName      The chat room name
        *
        */
        void OnDestroyedFromRoom(string roomId, string roomName);
        /**
        * Occurs when a user joins a chat room.
        * 
        * @param roomId        The chat room ID
        * @param participant   The user ID of the new chat room member
        *
        */
        void OnMemberJoinedFromRoom(string roomId, string participant);
        /**
        * Occurs when a member leaves a chat room.
        * 
        * @param roomId        The chat room ID
        * @param roomName      The chat room name
        * @param participant   The user ID of the member who leaves the chat room
        *
        */
        void OnMemberExitedFromRoom(string roomId, string roomName, string participant);
        /**
        * Occurs when a member is removed from a chat room.
        *
        * @param roomId        The chat room ID
        * @param roomName      The chat room name
        * @param participant   The user ID of the member who is removed from the chat room
        *
        */
        void OnRemovedFromRoom(string roomId, string roomName, string participant);
        /**
        * Occurs when a member is added to the chat room mute list.
        *
        * @param roomId        The chat room ID
        * @param mutes         The user IDs of the members added to the chat room mute list
        * @param expireTime    The Unix timestamp when the mute duration expires, in milliseconds
        *
        */
        void OnMuteListAddedFromRoom(string roomId, List mutes, long expireTime);
        /**
        * Occurs when a member is removed from the chat room mute list.
        *
        * @param roomId        The chat room ID
        * @param mutes         The user IDs of the members removed from the chat room mute list
        *
        */
        void OnMuteListRemovedFromRoom(string roomId, List mutes);
        /**
        * Occurs when a member is promoted to a chat room admin.
        *
        * @param roomId        The chat room ID
        * @param admin         The user ID of the member promoted to an admin
        *
        */
        void OnAdminAddedFromRoom(string roomId, string admin);
        /**
        * Occurs when an admin is demoted to a chat room member.
        *
        * @param  roomId       The chat room ID
        * @param  admin        The user ID of the admin demoted to a member
        *
        */
        void OnAdminRemovedFromRoom(string roomId, string admin);
        /**
        * Occurs when the chat room ownership is transferred.
        *
        * @param roomId        The chat room ID
        * @param newOwner      The user ID of the new chat room owner
        * @param oldOwner      The user ID of the former chat room owner
        *
        */
        void OnOwnerChangedFromRoom(string roomId, string newOwner, string oldOwner);
        /**
        * Occurs when the chat room announcement is updated.
        * @param roomId        The chat room ID
        * @param announcement  The updated chat room announcement
        *
        */
        void OnAnnouncementChangedFromRoom(string roomId, string announcement);
        /**
         * Occurs when the custom chat room attributes (key-value maps) are updated.
         *
         * @param roomId        The chat room ID
         * @param kv            The updated attributes
         * @param from          The user ID of the operator
         */
        void OnChatroomAttributesChanged(string roomId, Dictionary kv, string from);
         /**
         * Occurs when the custom chat room attributes (key-value maps) are removed.
         *
         * @param roomId        The chat room ID.
         * @param keys          The keys of removed attributes
         * @param from          The user ID of the operator
         */
        void OnChatroomAttributesRemoved(string roomId, List keys, string from);
        /**
        * Occurs when the chat room member(s) is/are added to the allow list.
        *
        * @param roomId The chat room ID.
        * @param members  The member(s) added to the allow list.
        */
        void OnAddAllowListMembersFromChatroom(string roomId, List members);
        /**
        * Occurs when the chat room member(s) is/are removed from the allow list.
        *
        * @param roomId The chat room ID.
        * @param members  The member(s) removed from the allow list.
        */
        void OnRemoveAllowListMembersFromChatroom(string roomId, List members);
        /**
        * Occurs when all members in the chat room are muted or unmuted.
        *
        * @param roomId The chat room ID.
        * @param isAllMuted    Whether all chat room members are muted.
        */
        void OnAllMemberMuteChangedFromChatroom(string roomId, bool isAllMuted);
        /**
        * Occurs when the chat room specifications are changed.
        *
        * @param room The chat room instance.
        */
        void OnSpecificationChangedFromRoom(Room room);
    }

```

### Unity

### Create a chat room

Only the [app super admin](../../restful-api/chatroom-management/manage-chatroom-admins.md) can call `CreateRoom` to create a chat room and set the chat room attributes such as the chat room name, description, and maximum number of members. Once a chat room is created, the super admin automatically becomes the chat room owner.

:::info
You are advised to call the [RESTful API](../../restful-api/chatroom-management/manage-chatrooms.md#creating-a-chat-room) to create a chat room from the server.
:::

The following code sample shows how to create a chat room:

```csharp
SDKClient.Instance.RoomManager.CreateRoom(subject, description, welcomeMsg, maxUserCount, members, callback: new ValueCallBack(
  onSuccess: (room) => {
  },
  onError:(code, desc) => {
  }
));
```

### Destroy a chat room

Only the chat room owner can call `DestroyRoom` to disband a chat room. Once a chat room is disbanded, all chat room members receive the `OnDestroyedFromRoom` callback and are immediately removed from the chat room.

The following code sample shows how to destroy a chat room:

```csharp
SDKClient.Instance.RoomManager.DestroyRoom(roomId, new CallBack(
  onSuccess: () => {
  },
  onError: (code, desc) => {
  }
));
```

### Join a chat room

Refer to the following steps to join a chat room:

1. Call `FetchPublicRoomsFromServer` to retrieve the list of chat rooms from the server and locate the ID of the chat room that you want to join.

2. Call `JoinRoom` to pass in the chat room ID and join the specified chat room. Once a user joins a chat room, all the other chat room members receive the `OnMemberJoinedFromRoom` callback.

The following code sample shows how to join a chat room:

```csharp
// Retrieve the list of chat rooms from the server
SDKClient.Instance.RoomManager.FetchPublicRoomsFromServer(callback: new ValueCallBack>(
            // `result` is of PageResult type
            onSuccess: (result) => {
            },
            onError:(code, desc) => {
            }
        ));

// Join a chat room
SDKClient.Instance.RoomManager.JoinRoom(roomId, new ValueCallBack(
  onSuccess: (room) => {
  },
  onError: (code, desc) => {
  }
));
```

### Leave a chat room

All chat room members can call `LeaveRoom` to leave the specified chat room. Once a member leaves the chat room, all the other chat room members receive the `OnMemberExitedFromRoom` callback.

**Note**: Unlike chat group owners (who cannot leave their groups), a chat room owner can leave a chat room. After re-entering the chat room, this user remains the chat room owner.

The following code sample shows how to leave a chat room:

```csharp
SDKClient.Instance.RoomManager.LeaveRoom(roomId, new CallBack(
  onSuccess: () => {
  },
  onError: (code, desc) => {
  }
));
```

By default, after a user leaves a chat room, the Chat SDK removes all chat room messages on the local device. If you do not want these messages removed, set `Options#DeleteMessagesAsExitRoom` to `false` when initializing the SDK.

The following code sample shows how to retain the chat room messages after leaving a chat room:

```csharp
Options options = new Options();
options. DeleteMessagesAsExitRoom = false;
```

### Update the chat room member count in real time

If many members join or leave a chat room within a short period, you can update the member count in real time:

1. When a user joins a chat room, other members receive the `OnMemberJoinedFromRoom` event. Similarly, when a member leaves or is removed, other members receive the `OnMemberExitedFromRoom` or `OnRemovedFromRoom` event.

2. After receiving an event, call `RoomManager#GetChatRoom` to retrieve local chat room details, and refer to `RoomManager#MemberCount` for the current number of members.

```csharp
class RoomManagerDelegate : IRoomManagerDelegate
{
    public void OnMemberJoinedFromRoom(string roomId, string participant, string ext)
    {
        int memberCount = SDKClient.Instance.RoomManager.GetChatRoom(roomId).MemberCount;
    }

    public void OnMemberExitedFromRoom(string roomId, string roomName, string participant)
    {
    }
    // Implement other functions of IRoomManagerDelegate
}

// Register the delegate
RoomManagerDelegate roomManagerDelegate = new RoomManagerDelegate();
SDKClient.Instance.RoomManager.AddRoomManagerDelegate(roomManagerDelegate);
```

### Retrieve the chat room attributes

All chat room members can call `FetchRoomInfoFromServer` to retrieve the attributes of the chat room, including the chat room ID, name, description, announcement, owner, admin list, member list, block list, mute list, maximum number of members, and whether all members are muted.

The following code sample shows how to retrieve the chat room attributes:

```csharp
SDKClient.Instance.RoomManager.FetchRoomInfoFromServer(roomId, new ValueCallBack(
  onSuccess: (room) => {
  },
  onError: (code, desc) => {
  }
));
```

### Retrieve the chat room list from the server

Users can call `FetchPublicRoomsFromServer` to get the chat room list from the server. You can get a maximum of 1,000 chat rooms at each call.

```csharp
// You can set the value of `pageSize` to a maximum of 1000.
SDKClient.Instance.RoomManager.FetchPublicRoomsFromServer(pageNum, pageSize, callback: new ValueCallBack>(
  // `rooms` is of PageResult type.
  onSuccess: (rooms) => {
  },
  onError:(code, desc) => {
  }
));
```

### Listen for chat room events

To monitor the chat room events, you can listen for the callbacks in the `IRoomManagerDelegate` class and add app logics accordingly. If you want to stop listening for the callback, make sure that you remove the listener to prevent memory leakage.

The following code sample shows how to add and remove the chat room listener:

```csharp
// Inherits and implements the IRoomManagerDelegate class.
public class RoomManagerDelegate : IRoomManagerDelegate {
    ......
    public void OnDestroyedFromRoom(string roomId, string roomName)
    {
    }
    ......
}
// Adds the chat room listener.
RoomManagerDelegate adelegate = new RoomManagerDelegate();
SDKClient.Instance.RoomManager.AddRoomManagerDelegate(adelegate);

// Removes the chat room listener.
SDKClient.Instance.RoomManager.AddRoomManagerDelegate(adelegate);
```

Refer to the following code sample to listen for chat room events:

```csharp
public interface IRoomManagerDelegate
    {
        /**
        * Occurs when a chat room instance is destroyed.
        * 
        * @param roomId        The chat room ID
        * @param roomName      The chat room name
        *
        */
        void OnDestroyedFromRoom(string roomId, string roomName);
        /**
        * Occurs when a user joins a chat room.
        * 
        * @param roomId        The chat room ID
        * @param participant   The user ID of the new chat room member
        *
        */
        void OnMemberJoinedFromRoom(string roomId, string participant);
        /**
        * Occurs when a member leaves a chat room.
        * 
        * @param roomId        The chat room ID
        * @param roomName      The chat room name
        * @param participant   The user ID of the member who leaves the chat room
        *
        */
        void OnMemberExitedFromRoom(string roomId, string roomName, string participant);
        /**
        * Occurs when a member is removed from a chat room.
        *
        * @param roomId        The chat room ID
        * @param roomName      The chat room name
        * @param participant   The user ID of the member who is removed from the chat room
        *
        */
        void OnRemovedFromRoom(string roomId, string roomName, string participant);
        /**
        * Occurs when a member is added to the chat room mute list.
        *
        * @param roomId        The chat room ID
        * @param mutes         The user IDs of the members added to the chat room mute list
        * @param expireTime    The Unix timestamp when the mute duration expires, in milliseconds
        *
        */
        void OnMuteListAddedFromRoom(string roomId, List mutes, long expireTime);
        /**
        * Occurs when a member is removed from the chat room mute list.
        *
        * @param roomId        The chat room ID
        * @param mutes         The user IDs of the members removed from the chat room mute list
        *
        */
        void OnMuteListRemovedFromRoom(string roomId, List mutes);
        /**
        * Occurs when a member is promoted to a chat room admin.
        *
        * @param roomId        The chat room ID
        * @param admin         The user ID of the member promoted to an admin
        *
        */
        void OnAdminAddedFromRoom(string roomId, string admin);
        /**
        * Occurs when an admin is demoted to a chat room member.
        *
        * @param  roomId       The chat room ID
        * @param  admin        The user ID of the admin demoted to a member
        *
        */
        void OnAdminRemovedFromRoom(string roomId, string admin);
        /**
        * Occurs when the chat room ownership is transferred.
        *
        * @param roomId        The chat room ID
        * @param newOwner      The user ID of the new chat room owner
        * @param oldOwner      The user ID of the former chat room owner
        *
        */
        void OnOwnerChangedFromRoom(string roomId, string newOwner, string oldOwner);
        /**
        * Occurs when the chat room announcement is updated.
        * @param roomId        The chat room ID
        * @param announcement  The updated chat room announcement.
        *
        */
        void OnAnnouncementChangedFromRoom(string roomId, string announcement);
        /**
         * Occurs when the custom chat room attributes (key-value maps) are updated.
         *
         * @param roomId        The chat room ID
         * @param kv            The updated attributes
         * @param from          The user ID of the operator
         */
        void OnChatroomAttributesChanged(string roomId, Dictionary kv, string from);
         /**
         * Occurs when the custom chat room attributes (key-value maps) are removed.
         *
         * @param roomId        The chat room ID.
         * @param keys          The keys of removed attributes
         * @param from          The user ID of the operator
         */
        void OnChatroomAttributesRemoved(string roomId, List keys, string from);
        /**
              * Occurs when the chat room member(s) is/are added to the allow list.
        *
        * @param roomId The chat room ID.
        * @param members  The member(s) added to the allow list.
        */
        void OnAddAllowListMembersFromChatroom(string roomId, List members);
              /**
        * Occurs when the chat room member(s) is/are removed from the allow list.
        *
        * @param roomId The chat room ID.
        * @param members  The member(s) removed from the allow list.
        */
        void OnRemoveAllowListMembersFromChatroom(string roomId, List members);
              /**
        * Occurs when all members in the chat room are muted or unmuted.
        *
        * @param roomId The chat room ID.
        * @param isAllMuted    Whether all chat room members are muted.
        */
        void OnAllMemberMuteChangedFromChatroom(string roomId, bool isAllMuted);
              /**
        * Occurs when the chat room specifications are changed.
        *
        * @param room The chat room instance.
        */
              void OnSpecificationChangedFromRoom(Room room);
    }
```

### Web

### Create and destroy a chat room

The [app super admin](../../restful-api/chatroom-management/manage-chatroom-admins.md) can create a chat room and set the chat room attributes such as the chat room name, description, and the maximum number of members. Once a chat room is created, the super admin automatically becomes the chat room owner.

:::info
You are advised to call the [RESTful
  API](../../restful-api/chatroom-management/manage-chatrooms.md#creating-a-chat-room)
  to create a chat room from the server.
:::

Only the chat room owner can disband a chat room. Once a chat room is disbanded, all members of that chat room are immediately removed from the chat room.

```javascript
// The super admin can call createChatRoom to create a chat room.
const options = {
  name: "chatRoomName", // The name of the chat room
  description: "description", // The description of the chat room
  maxusers: 200, // The maximum number of members. Default value: 200. Maximum value: 5,000.
  members: ["user1", "user2"], // (Optional) The chat room members. Specify at least one user.
};
chatClient.createChatRoom(options).then((res) => console.log(res));

// The chat room owner can call destroyChatRoom to disband a chat room.
const options = {
  chatRoomId: "chatRoomId",
};
chatClient.destroyChatRoom(options).then((res) => console.log(res));
```

### Join and leave a chat room

All chat users can call `joinChatRoom` to join the specified chat room. Once a chat user joins a chat room, all the other chat room members receive the `memberPresence` callback.

All chat room members can call `leaveChatRoom` to leave the specified chat room. Once a chat room member leaves a chat room, all the other members receive the `memberAbsence` callback.

```javascript
// All chat users can call joinChatRoom to join the specified chat room.
const options = {
  roomId: "roomId",
  message: "reason",
};
chatClient.joinChatRoom(options).then((res) => console.log(res));

// All chat room members can call leaveChatRoom to leave the specified chat room.
const options = {
  roomId: "roomId",
};
chatClient.leaveChatRoom(options).then((res) => console.log(res));
```

### Retrieve the chat room list and attributes

All chat users can get the chat room list from the server and retrieve the basic information of the specified chat room using the chat room ID.

```javascript
// Chat room members can call getChatRooms to retrieve the specified number of chat rooms from the server by page. The maximum value of pageSize is 1,000.
const options = {
  pagenum: 1,
  pagesize: 20,
};
chatClient.getChatRooms(options).then((res) => console.log(res));

// Chat room members can call getChatRoomDetails to get the basic information of the specified chat room by passing the chat room ID.
const options = {
  chatRoomId: "chatRoomId",
};
chatClient.getChatRoomDetails(options).then((res) => console.log(res));
```

### Listen for chat room events

To monitor the chat room events, you can call `addEventHandler` to listen for the callbacks and add app logics accordingly.

```javascript
chatClient.addEventHandler("handlerId", {
  onChatroomEvent: function (msg) {
    switch (msg.operation) {
      // Occurs when all the chat room members are unmuted.
      case "unmuteAllMembers":
        break;
      // Occurs when all the chat room members are muted.
      case "muteAllMembers":
        break;
      // Occurs when a member is removed from the chat room allow list.
      case "removeAllowlistMember":
        break;
      // Occurs when a member is added to the chat room allow list.
      case "addUserToAllowlist":
        break;
      // Occurs when a member deletes a chat room announcement.
      case "deleteAnnouncement":
        break;
      // Occurs when a member updates a chat room announcement.
      case "updateAnnouncement":
        break;
      // Occurs when a member is removed from the chat room mute list.
      case "unmuteMember":
        break;
      // Occurs when a member is added to the chat room mute list.
      case "muteMember":
        break;
      // Occurs when a chat room admin is removed from the admin list.
      case "removeAdmin":
        break;
      // Occurs when a chat room member is added to the admin list.
      case "setAdmin":
        break;
      // Occurs when the chat room owner is changed.
      case "changeOwner":
        break;
      // Occurs when a chat room member leaves a chat room.
      case "memberAbsence":
        break;
      // Occurs when a user joins a chat room.
      case "memberPresence":
        break;
      // Occurs when custom chat room attributes are set or changed.
      case "updateChatRoomAttributes":
        break;
      // Occurs when custom chat room attributes are removed.
      case "removeChatRoomAttributes":
        break;
      default:
        break;
    }
  },
});
```

### Update the chat room member count in real time

If many members join or leave a chat room in a very short time, you can update the chat room member count in real time:

1. When a user joins a chat room, other members in the chat room receive the `memberPresence` event. When a member leaves or is removed from a chat room, other members in the chat room receive the `memberAbsence` event.

1. After the event is received, you can get the current member count of the chat room by checking the value of the `memberCount` parameter in the event.

```javascript
chatClient.addEventHandler("handlerId", {
  onChatroomEvent: (e) => {
    switch (e.operation) {
      case "memberPresence":
        // The current number of members in the chat room.
        console.log(e?.memberCount);
        break;
      case "memberAbsence":
        // The current number of members in the chat room.
        console.log(e?.memberCount);
        break;
      default:
        break;
    }
  },
});
```
