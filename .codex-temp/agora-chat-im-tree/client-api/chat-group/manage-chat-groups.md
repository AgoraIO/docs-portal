---
title: "Manage chat groups"
description: "Introduces chat group functionalities."
---

s enable real-time messaging among multiple users.

This page shows how to use the Chat SDK to create and manage a chat group in your app.

## Understand the tech

### Android

The Chat SDK provides the `Group`, `GroupManager`, and `GroupChangeListener` classes for chat group management, which allows you to implement the following features:

- Create and destroy a chat group
- Join and leave a chat group
- Retrieve the member list of a chat group
- Block and unblock a chat group
- Listen for the chat group events

### iOS

The Chat SDK provides the `IAgoraChatGroupManager`, `AgoraChatGroupManagerDelegate`, and `AgoraChatGroup` classes for chat group management, which allows you to implement the following features:

- Create and destroy a chat group
- Join and leave a chat group
- Retrieve the member list of a chat group
- Block and unblock a chat group
- Listen for the chat group events

### Flutter

The Chat SDK provides the `ChatGroup`, `ChatGroupManager`, and `ChatGroupEventHandler` classes for chat group management, which allows you to implement the following features:

- Create and destroy a chat group
- Join and leave a chat group
- Retrieve the chat group attributes
- Retrieve the chat group member list
- Retrieve the chat group list
- Block and unblock a chat group
- Listen for chat group events

### React Native

The Chat SDK provides the `ChatGroup`, `ChatGroupManager`, and `ChatGroupEventListener` classes for chat group management, which allows you to implement the following features:

- Create and destroy a chat group
- Join and leave a chat group
- Retrieve the chat group attributes
- Retrieve the chat group member list
- Retrieve the chat group list
- Block and unblock a chat group
- Listen for chat group events

### Windows

The Chat SDK provides the `Group`, `IGroupManager`, and `IGroupManagerDelegate` classes for chat group management, which allows you to implement the following features:

- Create and destroy a chat group
- Join and leave a chat group
- Retrieve the chat group attributes
- Retrieve the chat group member list
- Retrieve the chat group list
- Block and unblock a chat group
- Listen for chat group events

### Unity

The Chat SDK provides the `Group`, `IGroupManager`, and `IGroupManagerDelegate` classes for chat group management, which allows you to implement the following features:

- Create and destroy a chat group
- Join and leave a chat group
- Retrieve the chat group attributes
- Retrieve the chat group member list
- Retrieve the chat group list
- Block and unblock a chat group
- Listen for chat group events

### Web

The Chat SDK allows you to implement the following group management features:

- Create and destroy a chat group
- Join and leave a chat group
- Retrieve the member list of a chat group
- Listen for the chat group events

## Prerequisites

Before proceeding, ensure that you meet the following requirements:

- You have initialized the Chat SDK. For details, see [SDK quickstart](../../get-started/get-started-sdk.md).
- You understand the call frequency limits of the Chat APIs supported by different pricing plans as described in [Limitations](../../reference/limitations.md).
- You understand the number of chat groups and chat group members supported by different pricing plans as described in [Pricing Plan Details](../../reference/pricing-plan-details.md).

## Implementation

This section describes how to call the APIs provided by the Chat SDK to implement  features.

### Android

### Create and destroy a chat group

Users can create a chat group and set the chat group attributes such as the name, description, group members, and reasons for creating the group. Users can also set the `GroupOptions` parameter to specify the size and type of the chat group. Once a chat group is created, the creator of the chat group automatically becomes the chat group owner.

Only chat group owners can disband s. Once a chat group is disbanded, all members of that chat group receive the `onGroupDestroyed` callback and are immediately removed from the chat group. All local data for the chat group is also removed from the database and memory.

Refer to the following sample code to create and destroy a chat group:

```java
GroupOptions option = new GroupOptions();
// Set the size of a chat group to 100 members.
option.maxUsers = 100;
// Set the type of a chat group to private. Allow chat group members to invite other users to join the chat group.
option.style = GroupStyle.GroupStylePrivateMemberCanInvite;

// Call createGroup to create a chat group.
ChatClient.getInstance().groupManager().createGroup(groupName, desc, allMembers, reason, option);

// Call destroyGroup to disband a chat group.
ChatClient.getInstance().groupManager().destroyGroup(groupId);
```

### Join and leave a chat group

Users can request to join a public chat group as follows:

1. Call `getPublicGroupsFromServer` to retrieve the list of public groups by page. Users can obtain the ID of the group that they want to join.
2. Call `joinGroup` to send a join request to the chat group:
    - If the type of the chat group is set to `GroupStylePublicJoin`, the request from the user is accepted automatically and the other chat group members receive the `onMemberJoined` callback.
    - If the type of the chat group is set to `GroupStylePublicNeedApproval`, the chat group owner and chat group admins receive the `onRequestToJoinReceived` callback and determine whether to accept the request from the user.

Users can call `leaveGroup` to leave a chat group. Once a user leaves the group, all the other group members receive the `onMemberExited` callback.

Refer to the following sample code to join and leave a chat group:

```java
// List public groups by page.
CursorResult result = ChatClient.getInstance().groupManager().getPublicGroupsFromServer(pageSize, cursor);
List groupsList = List returnGroups = result.getData();
String cursor = result.getCursor();

// Call joinGroup to send a join request to a chat group.
ChatClient.getInstance().groupManager().joinGroup(groupId);

// Call leaveGroup to leave a chat group.
ChatClient.getInstance().groupManager().leaveGroup(groupId);
```

### Retrieve the member list of a chat group

- When a group has less than 200 members, you can call the `getGroupFromServer` method to retrieve the group member list that contains the group owner, admins, and regular members.

    ```java
    // If `true` is passed to the second parameter, the SDK returns the group member list that contains up to 200 group members.
    // It is a synchronous method and may block the current thread.
    Group group = ChatClient.getInstance().groupManager().getGroupFromServer(groupId, true);
    List memberList = group.getMembers();// gets regular members.
    memberList.addAll(group.getAdminList());// gets group admins.
    memberList.add(group.getOwner());// gets the group owner.
    ```
- When a group has more than 200 members, you can first call the `getGroupFromServer` method to get the group member list that contains the group owner and admins and then call the `fetchGroupMembers` method to obtain the list of regular group members.

    ```java
    // If `true` is passed to the second parameter, the SDK returns the group member list that contains up to 200 group members.
    // It is a synchronous method and may block the current thread.
    Group group = ChatClient.getInstance().groupManager().getGroupFromServer(groupId, true);

    List memberList = new ArrayList<>();
    CursorResult result = null;
    final int pageSize = 20;
    do {
        // It is a synchronous method and may block the current thread. The asynchronous method is asyncFetchGroupMembers(String, String, int, ValueCallBack).
         result = ChatClient.getInstance().groupManager().fetchGroupMembers(groupId,
                 result != null? result.getCursor(): "", pageSize);
         memberList.addAll(result.getData());
    } while (!TextUtils.isEmpty(result.getCursor()) && result.getData().size() == pageSize);

     memberList.addAll(group.getAdminList());// gets group admins.
     memberList.add(group.getOwner());// gets the group owner.
    ```
### Retrieve the chat group list

- Users can call `getJoinedGroupsFromServer` to retrieve a list of groups they have joined and created from the server.

    ```java
    // Asynchronous method. The synchronous method is getJoinedGroupsFromServer(int, int, boolean, boolean).
    // pageIndex: Current page index, starting from 0.
    // pageSize: The number of groups expected per page. The range is [1,20].
    List grouplist = ChatClient.getInstance().groupManager().asyncGetJoinedGroupsFromServer(pageIndex, pageSize, needMemberCount, needRole, new ChatValueCallBack>() {
        @Override
        public void onSuccess(List value) {

        }

        @Override
        public void onError(int error, String errorMsg) {

        }
    });
    ```

- Users can call `getAllGroups` to load the local group list. To ensure the accuracy of results, retrieve the joined chat group list from the server first.

    ```java
    List grouplist = ChatClient.getInstance().groupManager().getAllGroups();
    ```
- Users can also retrieve the public chat group list from the server with pagination:

    ```java
    // Synchronous method, which will block the current thread. The asynchronous method is asyncGetPublicGroupsFromServer(int, String, ChatValueCallBack).
    ChatCursorResult result = ChatClient.getInstance().groupManager().getPublicGroupsFromServer(pageSize, cursor);
    List groupsList = result.getData();
    String cursor = result.getCursor();
    ```

### Retrieve the number of groups joined by the current user 

Users can call the `asyncGetJoinedGroupsCountFromServer` to retrieve the number of groups they have joined directly from the server. The limit on the number of groups a user can join is determined by the pricing package. For more details, please refer to the [product pricing](../../reference/pricing-plan-details.md#group).

```java
ChatClient.getInstance().groupManager().asyncGetJoinedGroupsCountFromServer(new ValueCallBack() {
    @Override
    public void onSuccess(Integer integer) {
        showToast("success: " + integer);
    }

    @Override
    public void onError(int code, String error) {
        showToast("error: " + error);
    }
});
```

### Block and unblock a chat group

All chat group members can block and unblock a chat group. Once a member block a chat group, they no longer receive messages from this chat group.

Refer to the following sample code to block and unblock a chat group:

```java
// Call blockGroupMessage to block a chat group.
ChatClient.getInstance().groupManager().blockGroupMessage(groupId);

// Call unblockGroupMessage to unblock a chat group.
ChatClient.getInstance().groupManager().unblockGroupMessage(groupId);
```

### Listen for chat group events

To monitor the chat group events, users can listen for the callbacks in the `GroupManager` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following sample code to listen for chat group events:

```java
GroupChangeListener groupListener = new GroupChangeListener() { 
    // Occurs when an invitee receives a group invitation.
    @Override
    public void onInvitationReceived(String groupId, String groupName, String inviter, String reason) {
        
    }

    // Occurs when a user sends a join request to a chat group.
    @Override
    public void onRequestToJoinReceived(String groupId, String groupName, String applyer, String reason) {
        
    }

    // Occurs when the chat group owner or admin approves a join request.
    @Override
    public void onRequestToJoinAccepted(String groupId, String groupName, String accepter) {
        
    }

    // Occurs when the chat group owner or admin rejects a join request.
    @Override
    public void onRequestToJoinDeclined(String groupId, String groupName, String decliner, String reason, String applicant) {
        
    }

    // Occurs when an invitee accepts a group invitation.
    @Override
    public void onInvitationAccepted(String groupId, String inviter, String reason) {
        
    }

    // Occurs when an invitee declines a group invitation.
    @Override
    public void onInvitationDeclined(String groupId, String invitee, String reason) {
        
    }

    // Occurs when a member is removed from a chat group.
    @Override
    public void onUserRemoved(String groupId, String groupName) {
        
    }

    // Occurs when the chat group owner disbands a chat group.
    @Override
    public void onGroupDestroyed(String groupId, String groupName) {

    }

    // Occurs when an invitee accepts a group invitation automatically.   
    @Override
    public void onAutoAcceptInvitationFromGroup(String groupId, String inviter, String inviteMessage) {
        
    }

    // Occurs when a member is added to the chat group mute list.
    @Override
    public void onMuteListAdded(String groupId, final List mutes, final long muteExpire) {
        
    }

    // Occurs when a member is removed from the chat group mute list.
    @Override
    public void onMuteListRemoved(String groupId, final List mutes) {
        
    }

    // Occurs when a member is added to the chat group allow list.
    @Override
    public void onWhiteListAdded(String groupId, List whitelist) {
          
    }

    // Occurs when a member is removed from the chat group allow list.
    @Override
    public void onWhiteListRemoved(String groupId, List whitelist) {
         
    }

    // Occurs when all chat group members are muted or unmuted.
    @Override
    public void onAllMemberMuteStateChanged(String groupId, boolean isMuted) {
          
    }

    // Occurs when a member is added to the chat group admin list.
    @Override
    public void onAdminAdded(String groupId, String administrator) {
        
    }

    // Occurs when an admin is removed from the chat group admin list.
    @Override
    public void onAdminRemoved(String groupId, String administrator) {
        
    }

    // Occurs when the chat group owner is changed.
    @Override
    public void onOwnerChanged(String groupId, String newOwner, String oldOwner) {
        
    }

    // Occurs when a user joins a chat group.
    @Override
    public void onMemberJoined(final String groupId, final String member){
        
    }

    // Occurs when a member leaves a chat group.
    @Override
    public void onMemberExited(final String groupId, final String member) {
        
    }

    // Occurs when a member updates the chat group announcement.
    @Override
    public void onAnnouncementChanged(String groupId, String announcement) {
        
    }

    // Occurs when a member uploads a chat group shared file.
    @Override
    public void onSharedFileAdded(String groupId, MucSharedFile sharedFile) {
        
    }

    // Occurs when a member deletes a chat group shared file.
    @Override
    public void onSharedFileDeleted(String groupId, String fileId) {
        
    }
};

// Add the group listener.
ChatClient.getInstance().groupManager().addGroupChangeListener(groupListener);

// Remove the group listener if not use.
ChatClient.getInstance().groupManager().removeGroupChangeListener(groupListener);
```

### iOS

### Create and destroy a chat group

Users can create a chat group and set the chat group attributes such as the name, description, group members, and reasons for creating the group. Users can also specify the size and type of a chat group. Once a chat group is created, the creator of the chat group automatically becomes the chat group owner.

Only chat group owners can disband s. Once a chat group is disbanded, all members of that chat group are immediately removed from the chat group. All local data for the chat group is also removed from the database and memory.

Refer to the following sample code to create and destroy a chat group:

```objc
AgoraChatGroupOptions *options = [[AgoraChatGroupOptions alloc] init];
// Set the size of a chat group.
options.maxUsersCount = self.maxMemNum;
// Set IsInviteNeedConfirm to YES to send a group invitation to invitees. If IsInviteNeedConfrim is set to NO, invitees are added to the chat group automatically without their confirmations.
options.IsInviteNeedConfirm = YES;
// Set the type of a chat group to private. Allow chat group members to invite other users to join the group.
options.style = AgoraChatGroupStylePrivateMemberCanInvite;
NSArray *members = @{@"memeber1",@"member2"};
// Call createGroupWithSubject to create a chat group.
[[AgoraChatClient sharedClient].groupManager createGroupWithSubject:@"subject"
     description:@"description"
     invitees:members
     message:@"message"
     setting:options
     error:nil];

// Call destroyGroup to disband a chat group. Once a chat group is disbanded, all chat group members receive the `userDidLeaveGroup` callback.
[[AgoraChatClient sharedClient].groupManager destroyGroup:@"groupID"];
```

### Join and leave a chat group

Users can request to join a public chat group as follows:

1. Call `getPublicGroupsFromServerWithCursor` to retrieve the list of public groups by page. Users can obtain the ID of the group that they want to join.
2. Call `joinPublicGroup` to send a join request to the chat group:
    - If the type of the chat group is set to `AgoraChatGroupStylePublicOpenJoin`, the request from the user is accepted automatically and the chat group members receive the `userDidJoinGroup` callback.
    - If the type of the chat group is set to `AgoraChatGroupStylePublicJoinNeedApproval`, the chat group owner and chat group admins receive the `joinGroupRequestDidReceive` callback and determine whether to accept the request from the user. Once the join request is approved, the user receives the `joinGroupRequestDidApprove` callback. Otherwise, the user receives the `joinGroupRequestDidDecline` callback.

Users can call `leaveGroup` to leave a chat group. Once a user leaves the chat group, all the other group members receive the `userDidLeaveGroup` callback.

Refer to the following sample code to join and leave a chat group:

```objc
// Call getPublicGroupsFromServerWithCursor to retrieve the list of public groups by page.
NSMutableArray *memberList = [[NSMutableArray alloc]init];
NSInteger pageSize = 50;
NSString *cursor = nil;
AgoraChatCursorResult *result = [[AgoraChatCursorResult alloc]init];
do {
  result = [[AgoraChatClient sharedClient].groupManager
                getPublicGroupsFromServerWithCursor:cursor
                pageSize:50 
                error:nil];  
  [memberList addObjectsFromArray:result.list];
  cursor = result.cursor;
} while (result && result.list  * _Nullable aList, EMError * _Nullable aError) {
            // got group list
        }];
    ```

- Users can call `getAllGroups` method to load the local group list. To ensure the accuracy of results, retrieve the joined chat group list from the server first.

    ```objc
    // Synchronous method, loading from local cache
    NSArray *chatGroupList = [[ChatClient sharedClient].groupManager getJoinedGroups];
    ```
- Users can also call `getPublicGroupsFromServerWithCursor` method to paginate the public group list:

    ```objc
    NSMutableArray *memberList = [[NSMutableArray alloc]init];
    NSInteger pageSize = 50;
    NSString *cursor = nil;
    EMCursorResult *result = [[EMCursorResult alloc]init];
    do {
      // Synchronous method, see [ChatGroupManager getPublicGroupsFromServerWithCursor:pageSize:completion:] for the asynchronous method
        result = [[ChatClient sharedClient].groupManager
                                          getPublicGroupsFromServerWithCursor:cursor
                                          pageSize:50
                                          error:nil];
        [memberList addObjectsFromArray:result.list];
        cursor = result.cursor;
    } while (result && result.list  result =
      await ChatClient.getInstance.groupManager.fetchPublicGroupsFromServer();
} on ChatError catch (e) {
}
// Request to join the specified chat group.
try {
  await ChatClient.getInstance.groupManager.joinPublicGroup(groupId);
} on ChatError catch (e) {
}
```

### Leave a chat group

Chat group members can call `leaveGroup` to leave the specified chat group, whereas the chat group owner cannot perform this operation. Once a member leaves a chat group, all the other chat group members receive the `ChatGroupEventHandler#onMemberExitedFromGroup` callback.

The following code sample shows how to leave a chat group:

```dart
try {
  await ChatClient.getInstance.groupManager.leaveGroup(groupId);
} on ChatError catch (e) {
}
```

### Retrieve the attributes of a chat group

All chat group members can call `getGroupWithId` to retrieve the chat group attributes from memory. The attributes contain the chat group ID, name, description, owner, announcements, number of members, admin list, and whether to mute all members.

All chat group members can also call `fetchGroupInfoFromServer` to retrieve the chat group attributes from the server. The attributes contain the chat group ID, name, description, owner, announcements, number of members, admin list, and whether to mute all members.

The following code sample shows how to retrieve the chat group attributes:

```dart
// Retrieve the chat group attributes from memory.
try {
  ChatGroup? group = await ChatClient.getInstance.groupManager.getGroupWithId(groupId);
} on ChatError catch (e) {
}
// Retrieve the chat group attributes from the server.
try {
  ChatGroup group = await ChatClient.getInstance.groupManager.fetchGroupInfoFromServer(groupId);
} on ChatError catch (e) {
}
```

### Retrieve the chat group member list

All chat group members can call `fetchMemberListFromServer` to retrieve the chat group member list from the server with pagination.

The following code sample shows how to retrieve the chat group member list:

```dart
// The ID of the chat group.
try {
  ChatCursorResult result =
      await ChatClient.getInstance.groupManager.fetchMemberListFromServer(
    groupId,
  );
} on ChatError catch (e) {
}
```

### Retrieve the chat group list

- Users can call `fetchJoinedGroupsFromServer` to retrieve the  groups they have joined and created from the server.

    ```dart
    try {
      List list =
          await ChatClient.getInstance.groupManager.fetchJoinedGroupsFromServer();
    } on ChatError catch (e) {
    }
    ```

- Users can call `getJoinedGroups` to retrieve the joined chat group list from the local database. To ensure the accuracy of results, retrieve the joined chat group list from the server first.

    ```dart
    try {
      List list =
          await ChatClient.getInstance.groupManager.getJoinedGroups();
    } on ChatError catch (e) {
    }
    ```

- Users can also call `fetchPublicGroupsFromServer` to retrieve public chat group list from the server with pagination:

    ```dart
    try {
      ChatCursorResult result =
          await ChatClient.getInstance.groupManager.fetchPublicGroupsFromServer(
        // The maximum number of chat groups to retrieve with pagination.
        pageSize: pageSize,
        // The page number from which to start getting data.
        cursor: cursor,
      );
    } on ChatError catch (e) {
    }
    ```
### Retrieve the number of groups joined by the current user 

Users can call `fetchJoinedGroupCount` to retrieve the number of groups they have joined directly from the server. The limit on the number of groups a user can join is determined by the pricing package. For more details, please refer to the [product pricing](../../reference/pricing-plan-details.md#group).

```dart
try {
  int count = await ChatClient.getInstance.groupManager.fetchJoinedGroupCount();
} on ChatError catch (e) {
  debugPrint('fetchJoinedGroupCount error: ${e.code} ${e.description}');
}
```
### Block and unblock a chat group

#### Block a chat group

All chat group members can call `blockGroup` to block a chat group. Once a member blocks a chat group, this member can no longer receive messages from the chat group.

The following code sample shows how to block a chat group:

```dart
try {
  await ChatClient.getInstance.groupManager.blockGroup(groupId);
} on ChatError catch (e) {
}
```

#### Unblock a chat group

All chat group members can call `unblockGroup` to unblock a chat group.

The following code sample shows how to unblock a chat group:

```dart
try {
  await ChatClient.getInstance.groupManager.unblockGroup(groupId);
} on ChatError catch (e) {
}
```

#### Check whether a user blocks a chat group

All chat group members can call `fetchGroupInfoFromServer` to check whether they block a chat group according to the `ChatGroup#messageBlocked` field.

The following code sample shows how to check whether a user blocks a chat group:

```dart
try {
  ChatGroup group = await ChatClient.getInstance.groupManager
      .fetchGroupInfoFromServer(groupId);
  // Check whether a user blocks a chat group.
  if (group.messageBlocked == true) {
  }
} on ChatError catch (e) {
}
```

### Listen for chat group events

To monitor the chat group events, users can listen for the callbacks in the `ChatGroupEventHandler` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following code sample to listen for chat group events:

```dart
    /// Add a group event listener.
    ChatClient.getInstance.groupManager.addEventHandler(
      'UNIQUE_HANDLER_ID',
      ChatGroupEventHandler(
        /// Occurs when a member is added to the chat group admin list.
        onAdminAddedFromGroup: (groupId, admin) {},

        /// Occurs when an admin is removed from the chat group admin list.
        onAdminRemovedFromGroup: (groupId, admin) {},

        /// Occurs when all chat group members are muted or unmuted.
        onAllGroupMemberMuteStateChanged: (groupId, isAllMuted) {},

        /// Occurs when a member is added to the chat group allow list.
        onAllowListAddedFromGroup: (groupId, members) {},

        /// Occurs when a member is removed from the chat group allow list.
        onAllowListRemovedFromGroup: (groupId, members) {},

        /// Occurs when a member updates the chat group announcement.
        onAnnouncementChangedFromGroup: (groupId, announcement) {},

        /// Occurs when custom attributes of a group member are updated.
        onAttributesChangedOfGroupMember: (groupId, userId, attributes, operatorId) {},

        /// Occurs when an invitee accepts a group invitation automatically.
        onAutoAcceptInvitationFromGroup: (groupId, inviter, inviteMessage) {},

        /// Occurs when the group function is disabled or enabled.
        onDisableChanged: (groupId, isDisable) {},

        /// Occurs when the chat group owner disbands a chat group.
        onGroupDestroyed: (groupId, groupName) {},

        /// Occurs when an invitee accepts a group invitation.
        onInvitationAcceptedFromGroup: (groupId, invitee, reason) {},

        /// Occurs when an invitee declines a group invitation.
        onInvitationDeclinedFromGroup: (groupId, invitee, reason) {},

        /// Occurs when an invitee receives a group invitation.
        onInvitationReceivedFromGroup: (groupId, groupName, inviter, reason) {},

        /// Occurs when a member leaves a chat group.
        onMemberExitedFromGroup: (groupId, member) {},

        /// Occurs when a user joins a chat group.
        onMemberJoinedFromGroup: (groupId, member) {},

        /// Occurs when a member is added to the chat group mute list.
        onMuteListAddedFromGroup: (groupId, mutes, muteExpire) {},

        /// Occurs when a member is removed from the chat group mute list.
        onMuteListRemovedFromGroup: (groupId, mutes) {},

        /// Occurs when the chat group owner is changed.
        onOwnerChangedFromGroup: (groupId, newOwner, oldOwner) {},

        /// Occurs when a join request is accepted.
        onRequestToJoinAcceptedFromGroup: (groupId, groupName, accepter) {},

        /// Occurs when a join request is declined.
        onRequestToJoinDeclinedFromGroup: (groupId, groupName, decliner, reason, applicant) {},

        /// Occurs when a join request is received.
        onRequestToJoinReceivedFromGroup: (groupId, groupName, applicant, reason) {},

        /// Occurs when a member uploads a chat group shared file.
        onSharedFileAddedFromGroup: (groupId, sharedFile) {},

        /// Occurs when a member deletes a chat group shared file.
        onSharedFileDeletedFromGroup: (groupId, fileId) {},

        /// Occurs when the specifications of a chat group is changed.
        onSpecificationDidUpdate: (group) {},

        /// Occurs when a member is removed from a chat group.
        onUserRemovedFromGroup: (groupId, groupName) {},
      ),
    );
    //...
    /// Removes a group event listener.
    ChatClient.getInstance.groupManager.removeEventHandler('UNIQUE_HANDLER_ID');
```

### React Native

### Create a chat group

Set `GroupStyle` and `inviteNeedConfirm` before creating a chat group.

1. Is the group public or private, and who can invite members (`GroupStyle`):
- `PrivateOnlyOwnerInvite`: A private group. Only the chat group owner and admins can add users to the chat group.
- `PrivateMemberCanInvite`: A private group. All chat group members can add users to the chat group.
- `PublicJoinNeedApproval`: A public group. The chat group owner and admins can add users, and users can send join requests to the chat group.
- `PublicOpenJoin`: A public group. All users can join the chat group automatically without any need for approval from the chat group owner and admins.

2. Does a group invitation require consent from an invitee to add them to the group (`inviteNeedConfirm`):

- Yes (`ChatGroupOptions#inviteNeedConfirm` is set to `true`). After creating a group and sending group invitations, the subsequent logic varies based on whether an invitee automatically consents to the group invitation (`autoAcceptGroupInvitation`):
    - Yes (`autoAcceptGroupInvitation` is set to `true`). The invitee automatically joins the chat group and receives the `ChatGroupEventListener#onAutoAcceptInvitation` callback, the chat group owner receives the `ChatGroupEventListener#onInvitationAccepted` and `ChatGroupEventListener#onMemberJoined` callbacks, and the other chat group members receives the `ChatGroupEventListener#onMemberJoined` callback.
    - No (`autoAcceptGroupInvitation` is set to `false`). The invitee receives the `ChatGroupEventListener#onInvitationReceived` callback and chooses whether to join the chat group:
        - If the invitee accepts the group invitation, the chat group owner receives the `ChatGroupEventListener#onInvitationAccepted` and `ChatGroupEventListener#onMemberJoined` callbacks, and the other chat group members receive the `ChatGroupEventListener#onMemberJoined` callback;
        - If the invitee declines the group invitation, the chat group owner receives the `ChatGroupEventListener#onInvitationDeclined` callback.

![1653385689954](https://web-cdn.agora.io/docs-files/1653385689954)

- No (`ChatGroupOptions#inviteNeedConfirm` is set to `false`). After creating a chat group and sending group invitations, an invitee is added to the chat group regardless of their `autoAcceptGroupInvitation` setting. The invitee receives the `ChatGroupEventListener#onAutoAcceptInvitation` callback, the chat group owner receives the `ChatGroupEventListener#onInvitationAccepted` and `ChatGroupEventListener#onMemberJoined` callbacks, and the other chat group members receive the `ChatGroupEventListener#onMemberJoined` callback.

Users can call `createGroup` to create a chat group and set the chat group attributes such as the chat group name, description, maximum number of members, and reason for creating the group, by specifying `ChatGroupOptions`.

The following code sample shows how to create a chat group:

```typescript
// The permission style of the chat group.
option.style = PrivateOnlyOwnerInvite;
// The name of the chat group can be a maximum of 128 characters.
const groupName = "study";
// The description of the chat group can be a maximum of 512 characters.
const desc = "this is study group";
// The members to add.
const allMembers = ["Tom", "Jason"];
ChatClient.getInstance()
  .groupManager.createGroup(option, groupName, desc, allMembers, reason)
  .then(() => {
    console.log("create group success.");
  })
  .catch((reason) => {
    console.log("create group fail.", reason);
  });
```

### Destroy a chat group

Only the chat group owner can call `destroyGroup` to disband a chat group. Once a chat group is disbanded, all chat group members receive the `onGroupDestroyed` callback and are immediately removed from the chat group.

:::info
Once a chat group is destroyed, all chat group data is deleted from the local database and memory.
:::

The following code sample shows how to destroy a chat group:

```typescript
const groupId = "100";
ChatClient.getInstance()
  .groupManager.destroyGroup(groupId)
  .then(() => {
    console.log("destroy group success.");
  })
  .catch((reason) => {
    console.log("destroy group fail.", reason);
  });
```

### Join a chat group

The logic of joining a chat group varies according to the `GroupStyle` setting you choose when [creating the chat group](./manage-chat-groups.md#create-a-chat-group):

- If the `GroupStyle` is set to `PublicOpenJoin`, all users can join the chat group without the consent from the chat group owner and admins. Once a user joins a chat group, all chat group members receive the `ChatGroupEventListener#onMemberJoined` callback.
- If the `GroupStyle` is set to `PublicJoinNeedApproval`, users can send join requests to the chat group. The chat group owner and chat group admins receive the `ChatGroupEventListener#onRequestToJoinReceived` callback and choose whether to accept the join request:
    - If the request is accepted, the user joins the chat group and receives the `ChatGroupEventListener#onRequestToJoinAccepted` callback, while all the other chat group members receive the `ChatGroupEventListener#onMemberJoined` callback.
    - If the request is declined, the user receives the `ChatGroupEventListener#onRequestToJoinDeclined` callback.

:::info
Users can only request to join public groups; private groups do not allow join requests.
:::

Users can refer to the following steps to join a chat group:

1. Call `fetchPublicGroupsFromServer` to retrieve the list of public groups from the server, and locate the ID of the chat group that you want to join.

2. Call `requestToJoinPublicGroup` to pass in the chat group ID and request to join the specified chat group.

The following code sample shows how to join a chat group:

```typescript
// Retrieve the list of public groups with pagination.
// The maximum number of public groups to retrieve with pagination.
const pageSize = 10;
// The position from which to start getting data.
const cursor = "";
ChatClient.getInstance()
  .groupManager.fetchPublicGroupsFromServer(pageSize, cursor)
  .then(() => {
    console.log("get group list success.");
  })
  .catch((reason) => {
    console.log("get group list fail.", reason);
  });

// Request to join the specified chat group.
const groupId = "100";
const reason = "study typescript";
ChatClient.getInstance()
  .groupManager.requestToJoinPublicGroup(groupId, reason)
  .then(() => {
    console.log("request send success.");
  })
  .catch((reason) => {
    console.log("request send fail.", reason);
  });
```

### Leave a chat group

Chat group members can call `leaveGroup` to leave the specified chat group, whereas the chat group owner cannot perform this operation. Once a member leaves a chat group, all the other chat group members receive the `ChatGroupEventListener#onMemberExited` callback.

The following code sample shows how to leave a chat group:

```typescript
ChatClient.getInstance()
  .groupManager.leaveGroup(groupId)
  .then(() => {
    console.log("leave group success.");
  })
  .catch((reason) => {
    console.log("leave group fail.", reason);
  });
```

### Retrieve the attributes of a chat group

All chat group members can call `getGroupWithId` to retrieve the chat group attributes from memory. The attributes contain the chat group ID, name, description, owner, announcements, number of members, admin list, and whether to mute all members.

All chat group members can also call `fetchGroupInfoFromServer` to retrieve the chat group attributes from the server. The attributes contain the chat group ID, name, description, owner, announcements, number of members, admin list, and whether to mute all members.

The following code sample shows how to retrieve the chat group attributes:

```typescript
// Retrieve the chat group attributes from memory.
ChatClient.getInstance()
  .groupManager.getGroupWithId(groupId)
  .then((groupInfo) => {
    console.log("get group info success: ", groupInfo);
  })
  .catch((reason) => {
    console.log("get group info fail.", reason);
  });

// Retrieve the chat group attributes from the server.
ChatClient.getInstance()
  .groupManager.fetchGroupInfoFromServer(groupId)
  .then((groupInfo) => {
    console.log("get group info success: ", groupInfo);
  })
  .catch((reason) => {
    console.log("get group info fail.", reason);
  });
```

### Retrieve the chat group member list

All chat group members can call `fetchMemberListFromServer` to retrieve the chat group member list from the server with pagination.

The following code sample shows how to retrieve the chat group member list:

```typescript
// The ID of the chat group.
// The maximum number of members to retrieve with pagination.
// The position from which to start getting data. `cursor` is set to `null` or an empty string by default at the first call.
ChatClient.getInstance()
  .groupManager.fetchMemberListFromServer(groupId, pageSize, cursor)
  .then((members) => {
    console.log("get group info success: ", members);
  })
  .catch((reason) => {
    console.log("get group info fail.", reason);
  });
```
### Retrieve the chat group list

- Users can call `fetchJoinedGroupsFromServer` to retrieve the joined chat group list from the server with pagination.

    ```typescript
    // The maximum number of chat groups to retrieve with pagination.
    const pageSize = 10;
    // The page number from which to start getting data.
    const pageNum = 1;
    ChatClient.getInstance()
      .groupManager.fetchJoinedGroupsFromServer(pageSize, pageNum)
      .then((groups) => {
        console.log("get group list success: ", groups);
      })
      .catch((reason) => {
        console.log("get group list fail.", groups);
      });
    ```

- Users can call `getJoinedGroups` to retrieve the joined chat group list from the local database. To ensure the accuracy of results, retrieve the joined chat group list from the server first.

    ```typescript
    ChatClient.getInstance()
      .groupManager.getJoinedGroups()
      .then((groups) => {
        console.log("get group list success: ", groups);
      })
      .catch((reason) => {
        console.log("get group list fail.", groups);
      });
    ```

- Users can also call `fetchPublicGroupsFromServer` to retrieve public chat group list from the server with pagination.

```typescript
ChatClient.getInstance()
  .groupManager.fetchPublicGroupsFromServer(pageSize, cursor)
  .then((groups) => {
    console.log("get group list success: ", groups);
  })
  .catch((reason) => {
    console.log("get group list fail.", groups);
  });
```
### Retrieve the number of groups joined by the current user

Users can call `fetchJoinedGroupCount` to retrieve the number of groups they have joined directly from the server. The limit on the number of groups a user can join is determined by the pricing package. For more details, please refer to the [product pricing](../../reference/pricing-plan-details.md#group).

```typescript
ChatClient.getInstance()
  .groupManager.fetchJoinedGroupCount()
  .then((count: number) => {
    // TODO: Retrieve the number of joined groups.
  })
  .catch();
```
### Block and unblock a chat group

#### Block a chat group

All chat group members can call `blockGroup` to block a chat group. Once a member blocks a chat group, this member can no longer receive messages from the chat group.

The following code sample shows how to block a chat group:

```typescript
ChatClient.getInstance()
  .groupManager.blockGroup(groupId)
  .then(() => {
    console.log("block group success. ");
  })
  .catch((reason) => {
    console.log("block group fail.", groups);
  });
```

#### Unblock a chat group

All chat group members can call `unblockGroup` to unblock a chat group.

The following code sample shows how to unblock a chat group:

```typescript
ChatClient.getInstance()
  .groupManager.unblockGroup(groupId)
  .then(() => {
    console.log("unblock group success. ");
  })
  .catch((reason) => {
    console.log("unblock group fail.", groups);
  });
```

### Listen for chat group events

To monitor the chat group events, users can listen for the callbacks in the `ChatGroupEventListener` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following code sample to listen for chat group events:

```typescript
// Inherit and implement the ChatGroupEventListener class.
const groupListener: ChatGroupEventListener = new (class
  implements ChatGroupEventListener
{
  // Occurs when a user receives a group invitation.
  onInvitationReceived(params: {
    groupId: string;
    inviter: string;
    groupName?: string | undefined;
    reason?: string | undefined;
  }): void {
    console.log(
      `onInvitationReceived:`,
      params.groupId,
      params.inviter,
      params.groupName,
      params.reason
    );
  }
  // Occurs when the chat group owner and chat group admins receive a join request.
  onRequestToJoinReceived(params: {
    groupId: string;
    applicant: string;
    groupName?: string | undefined;
    reason?: string | undefined;
  }): void {
    console.log(
      `onRequestToJoinReceived:`,
      params.groupId,
      params.applicant,
      params.groupName,
      params.reason
    );
  }
  // Occurs when the chat group owner and chat group admins approve a join request.
  onRequestToJoinAccepted(params: {
    groupId: string;
    accepter: string;
    groupName?: string | undefined;
  }): void {
    console.log(
      `onRequestToJoinAccepted:`,
      params.groupId,
      params.accepter,
      params.groupName
    );
  }
  // Occurs when the chat group owner and chat group admins decline a join request.
 onRequestToJoinDeclined(params: {
    groupId: string;
    decliner: string;
    groupName?: string | undefined;
    applicant?: string;
    reason?: string | undefined;
  }): void {
    console.log(
      `onRequestToJoinDeclined:`,
      params.groupId,
      params.decliner,
      params.groupName,
      params.applicant
      params.reason
    );
  }
  // Occurs when a user accepts a group invitation.
  onInvitationAccepted(params: {
    groupId: string;
    invitee: string;
    reason?: string | undefined;
  }): void {
    console.log(
      `onInvitationAccepted:`,
      params.groupId,
      params.invitee,
      params.reason
    );
  }
  // Occurs when a user declines a group invitation.
  onInvitationDeclined(params: {
    groupId: string;
    invitee: string;
    reason?: string | undefined;
  }): void {
    console.log(
      `onInvitationDeclined:`,
      params.groupId,
      params.invitee,
      params.reason
    );
  }
  // Occurs when a member is removed from a chat group.
  onUserRemoved(params: {
    groupId: string;
    groupName?: string | undefined;
  }): void {
    console.log(`onUserRemoved:`, params.groupId, params.groupName);
  }
  // Occurs when a chat group is destroyed.
  onGroupDestroyed(params: {
    groupId: string;
    groupName?: string | undefined;
  }): void {
    console.log(`onGroupDestroyed:`, params.groupId, params.groupName);
  }
  // Occurs when a user automatically accepts a chat group invitation.
  onAutoAcceptInvitation(params: {
    groupId: string;
    inviter: string;
    inviteMessage?: string | undefined;
  }): void {
    console.log(
      `onGroupDestroyed:`,
      params.groupId,
      params.inviter,
      params.inviteMessage
    );
  }
  // Occurs when a member is added to the chat group mute list.
  onMuteListAdded(params: {
    groupId: string;
    mutes: string[];
    muteExpire?: number | undefined;
  }): void {
    console.log(
      `onMuteListAdded:`,
      params.groupId,
      params.mutes,
      params.muteExpire?.toString
    );
  }
  // Occurs when a member is removed from the chat group mute list.
  onMuteListRemoved(params: { groupId: string; mutes: string[] }): void {
    console.log(`onMuteListRemoved:`, params.groupId, params.mutes);
  }
  // Occurs when a chat group member is promoted to an admin.
  onAdminAdded(params: { groupId: string; admin: string }): void {
    console.log(`onAdminAdded:`, params.groupId, params.admin);
  }
  // Occurs when a chat group admin is demoted to a regular member.
  onAdminRemoved(params: { groupId: string; admin: string }): void {
    console.log(`onAdminRemoved:`, params.groupId, params.admin);
    this.that.setState({
      group_listener: `onAdminRemoved: ` + params.groupId + params.admin,
    });
  }
  // Occurs when the chat group owner is changed.
  onOwnerChanged(params: {
    groupId: string;
    newOwner: string;
    oldOwner: string;
  }): void {
    console.log(
      `onOwnerChanged:`,
      params.groupId,
      params.newOwner,
      params.oldOwner
    );
  }
  // Occurs when a user joins a chat group.
  onMemberJoined(params: { groupId: string; member: string }): void {
    console.log(`onMemberJoined:`, params.groupId, params.member);
  }
  // Occurs when a member leaves a chat group.
  onMemberExited(params: { groupId: string; member: string }): void {
    console.log(`onMemberExited:`, params.groupId, params.member);
  }
  // Occurs when the chat group announcements are updated.
  onAnnouncementChanged(params: {
    groupId: string;
    announcement: string;
  }): void {
    console.log(`onAnnouncementChanged:`, params.groupId, params.announcement);
  }
  // Occurs when a shared file is uploaded to a chat group.
  onSharedFileAdded(params: { groupId: string; sharedFile: string }): void {
    console.log(`onSharedFileAdded:`, params.groupId, params.sharedFile);
  }
  // Occurs when a shared file is deleted in a chat group.
  onSharedFileDeleted(params: { groupId: string; fileId: string }): void {
    console.log(`onSharedFileDeleted:`, params.groupId, params.fileId);
  }
  // Occurs when a member is added to the chat group allow list.
  onAllowListAdded(params: { groupId: string; members: string[] }): void {
    console.log(`onAllowListAdded:`, params.groupId, params.members);
  }
  // Occurs when a member is removed from the chat group allow list.
  onAllowListRemoved(params: { groupId: string; members: string[] }): void {
    console.log(`onAllowListRemoved:`, params.groupId, params.members);
  }
  // Occurs when all chat group members are muted or unmuted.
  onAllGroupMemberMuteStateChanged(params: {
    groupId: string;
    isAllMuted: boolean;
  }): void {
    console.log(
      `onAllGroupMemberMuteStateChanged:`,
      params.groupId,
      params.isAllMuted
    );
  }
  // Occurs when the chat group detail change. All chat group members receive this event.
  onDetailChanged(group: ChatGroup): void {
    console.log(`onDetailChanged:`, group);
  }
  // Occurs when the disabled state of group changes.
  onStateChanged(group: ChatGroup): void {
    console.log(`onStateChanged:`, group);
  }
})();

// Remove the chat group listener.
ChatClient.getInstance().groupManager.removeAllGroupListener();
// Add the chat group listener.
ChatClient.getInstance().groupManager.addGroupListener(groupListener);
```

### Windows

### Create a chat group

Set `GroupStyle` and `inviteNeedConfirm` before creating a chat group.

1. Is the group public or private, and who can invite members (`GroupStyle`):

- `PrivateOnlyOwnerInvite`: A private group. Only the inviter and admins can add users to the chat group.
- `PrivateMemberCanInvite`: A private group. All chat group members can add users to the chat group.
- `PublicJoinNeedApproval`: A public group. The inviter and admins can add users, and users can send join requests to the chat group.
- `PublicOpenJoin`: A public group. All users can join the chat group automatically without any need for approval from the inviter and admins.

2. Does a group invitation require consent from an invitee to add them to the group (`inviteNeedConfirm`):

- Yes (`option.InviteNeedConfirm` is set to `true`). After creating a group and sending group invitations, the subsequent logic varies based on whether an invitee automatically consents to the group invitation (`AutoAcceptGroupInvitation`):
  - Yes (`AutoAcceptGroupInvitation` is set to `true`). The invitee automatically joins the chat group and receives the `IGroupManagerDelegate#OnAutoAcceptInvitationFromGroup` callback, the inviter receives the `IGroupManagerDelegate#OnInvitationAcceptedFromGroup` and `IGroupManagerDelegate#OnMemberJoinedFromGroup` callbacks, and all chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback.
  - No (`AutoAcceptGroupInvitation` is set to `false`). The invitee receives the `IGroupManagerDelegate#OnInvitationReceivedFromGroup` callback and chooses whether to join the chat group:
    - If the invitee accepts the group invitation, the inviter receives the `IGroupManagerDelegate#OnInvitationAcceptedFromGroup` and `IGroupManagerDelegate#OnMemberJoinedFromGroup` callbacks and all chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback;
    - If the invitee declines the group invitation, the inviter receives the`IGroupManagerDelegate#OnInvitationDeclinedFromGroup` callback.

![](/images/im/create_group_unity_windows.png)

- No (`option.InviteNeedConfirm` is set to `false`). After creating a chat group and sending group invitations, an invitee is added to the chat group regardless of their `IsAutoAcceptGroupInvitation` setting. The invitee receives the `IGroupManagerDelegate#OnAutoAcceptInvitationFromGroup` callback, the inviter receives the `IGroupManagerDelegate#OnInvitationAcceptedFromGroup` and `IGroupManagerDelegate#OnMemberJoinedFromGroup` callbacks, and all chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback.

Users can call `CreateGroup` to create a chat group and set the chat group attributes such as the chat group name, description, maximum number of members, and reason for creating the group, by specifying `GroupOptions`.

The following code sample shows how to create a chat group:

```csharp
GroupOptions option = new GroupOptions(GroupStyle.PrivateMemberCanInvite);
option.MaxCount = 100;
SDKClient.Instance.GroupManager.CreateGroup(groupname, option, desc, members, callback:new ValueCallBack(
  onSuccess: (group) => {
  },
  onError:(code, error) => {
  }
));
```

### Destroy a chat group

Only the inviter can call `DestroyGroup` to disband a chat group. Once a chat group is disbanded, all chat group members receive the `OnDestroyedFromGroup` callback and are immediately removed from the chat group.

:::info
Once a chat group is destroyed, all chat group data is deleted from the local database and memory.
:::

The following code sample shows how to destroy a chat group:

```csharp
SDKClient.Instance.GroupManager.DestroyGroup(groupId, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Join a chat group

The logic of joining a chat group varies according to the `GroupStyle` setting you choose when [creating the chat group](../../reference/group-overview.md#ceate-a-chat-group):

- If the `GroupStyle` is set to `PublicOpenJoin`, all users can join the chat group without the consent from the inviter and admins. Once a user joins a chat group, all chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback;
- If the `GroupStyle` is set to `PublicJoinNeedApproval`, users can send join requests to the chat group. The inviter and chat group admins receive the `IGroupManagerDelegate#OnRequestToJoinReceivedFromGroup` callback and choose whether to approve the join request:
  - If the request is accepted, the user joins the chat group and receives the `IGroupManagerDelegate#OnRequestToJoinAcceptedFromGroup` callback, while all all chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback.
  - If the request is declined, the user receives the `IGroupManagerDelegate#OnRequestToJoinDeclinedFromGroup` callback.

:::info
Users can only request to join public groups; private groups do not allow join requests.
:::

Users can refer to the following steps to join a chat group:

1. Call `FetchPublicGroupsFromServer` to retrieve the list of public groups from the server, and locate the ID of the chat group that you want to join.

2. Call `JoinPublicGroup` to pass in the chat group ID and request to join the specified chat group.

The following code sample shows how to join a chat group:

```csharp
// Retrieve the list of public groups from the server
SDKClient.Instance.GroupManager.FetchPublicGroupsFromServer(callback: new ValueCallBack>(
            // `result` is of CursorResult type
            onSuccess: (result) => {
            },
            onError: (code, desc) =>
            {
            }
        ));

// Request to join the specified chat group
SDKClient.Instance.GroupManager.JoinPublicGroup(groupId, new CallBack(
  onSuccess: () => 
  { 
  },
  onError:(code, desc) => 
  {
  }
));
```

### Leave a chat group

Chat group members can call `LeaveGroup` to leave the specified chat group, whereas the inviter cannot perform this operation. Once a member leaves a chat group, all all chat group members receive the `IGroupManagerDelegate#OnMemberExitedFromGroup` callback. 

The following code sample shows how to leave a chat group:

```csharp
SDKClient.Instance.GroupManager.LeaveGroup(groupId, new CallBack(
  onSuccess: () => 
  { 
  },
  onError:(code, desc) => 
  {
  }
));
```

### Retrieve the attributes of a chat group

All chat group members can call `GetGroupWithId` to retrieve the chat group attributes from memory, including the chat group ID, name, description, owner, and admin list.

All chat group members can also call `GetGroupSpecificationFromServer` to retrieve the chat group attributes from the server, including the chat group ID, name, description, owner, admin list, and member list.

The following code sample shows how to retrieve the chat group attributes:

```csharp
// Retrieve the chat group attributes from memory
Group group = SDKClient.Instance.GroupManager.GetGroupWithId(groupId); 

// Retrieve the chat group attributes from the server
SDKClient.Instance.GroupManager.GetGroupSpecificationFromServer(groupId, new ValueCallBack(
            onSuccess: (group) => {
            },
            onError: (code, desc) =>
            {
            }
        ));
```

### Retrieve the chat group member list

All chat group members can call `GetGroupMemberListFromServer` to retrieve the chat group member list from the server.

The following code sample shows how to retrieve the chat group member list:

```csharp
SDKClient.Instance.GroupManager.GetGroupMemberListFromServer(groupId, pageSize, cursor, callback: new ValueCallBack>(
  onSuccess: (result) => 
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Retrieve the chat group list

Users can call `FetchJoinedGroupsFromServer` to retrieve the joined chat group list from the server, as shown in the following code sample:

```csharp
SDKClient.Instance.GroupManager.FetchJoinedGroupsFromServer(callback: new ValueCallBack>(
  onSuccess: (groupList) => {
  },
  onError: (code, desc) =>
  {
  }
));
```

Users can call `GetJoinedGroups` to retrieve the joined chat group list from the local database. To ensure the accuracy of results, retrieve the joined chat group list from the server first. The code sample is as follows:

```csharp
List groupList = SDKClient.Instance.GroupManager.GetJoinedGroups();
```

Users can also call `FetchPublicGroupsFromServer` to retrieve public chat group list from the server with pagination, as shown in the following code sample:

```csharp
SDKClient.Instance.GroupManager.FetchPublicGroupsFromServer(pageSize, cursor, callback: new ValueCallBack>(
  onSuccess: (result) => 
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Retrieve the number of groups joined by the current user

Users can call the `FetchMyGroupsCount` to retrieve the number of groups they have joined directly from the server. The limit on the number of groups a user can join is determined by the pricing package. For more details, please refer to the [product pricing](../../reference/pricing-plan-details.md#group).

```csharp
SDKClient.Instance.GroupManager.FetchMyGroupsCount(new ValueCallBack(
    onSuccess: (count) =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Block and unblock a chat group

#### Block a chat group

All chat group members can call `BlockGroup` to block a chat group. Once a member blocks a chat group, this member can no longer receive messages from the chat group.

The following code sample shows how to block a chat group:

```csharp
SDKClient.Instance.GroupManager.BlockGroup(groupId, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Unblock a chat group

All chat group members can call `UnBlockGroup` to unblock a chat group.

The following code sample shows how to unblock a chat group:

```csharp
SDKClient.Instance.GroupManager.UnBlockGroup(groupId, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Check whether a user blocks a chat group

All chat group members can call `GetGroupSpecificationFromServer` to check whether they block a chat group according to the `Group#MessageBlocked` field.

The following code sample shows how to check whether a user blocks a chat group:

```csharp
SDKClient.Instance.GroupManager.GetGroupSpecificationFromServer(currentGroupId, new ValueCallBack(
            onSuccess: (group) => {
                // Check whether a user blocks a chat group
                if(group.MessageBlocked == true) {
                  
                }
            },
            onError: (code, desc) =>
            {
                
            }
        ));
```

### Listen for chat group events

To monitor the chat group events, users can listen for the callbacks in the `IGroupManagerDelegate` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following code sample to listen for chat group events:

```csharp
// Inherit and implement the IGroupManagerDelegate class.
public class GroupManagerDelegate : IGroupManagerDelegate {
    // Occurs when a user receives a group invitation.
    public void OnInvitationReceivedFromGroup(string groupId, string groupName, string inviter, string reason)
    {
    }
    // Occurs when the inviter and chat group admins receive a join request.
    public void OnRequestToJoinReceivedFromGroup(string groupId, string groupName, string applicant, string reason)
    {
    }
    // Occurs when the inviter and chat group admins approve a join request.
    public void OnRequestToJoinAcceptedFromGroup(string groupId, string groupName, string accepter)
    {
    }
    // Occurs when the inviter and chat group admins decline a join request.
    public void OnRequestToJoinDeclinedFromGroup(string groupId, string reason, string decliner, string applicant)
    {
    }
    // Occurs when a user accepts a group invitation.
    public void OnInvitationAcceptedFromGroup(string groupId, string invitee, string reason)
    {
    }
    // Occurs when a user declines a group invitation.
    public void OnInvitationDeclinedFromGroup(string groupId, string invitee, string reason)
    {
    }
    // Occurs when a member is removed from a chat group.
    public void OnUserRemovedFromGroup(string groupId, string groupName)
    {
    }
    // Occurs when a chat group is destroyed.
    public void OnDestroyedFromGroup(string groupId, string groupName)
    {
    }
    // Occurs when a user automatically accepts a chat group invitation.
    public void OnAutoAcceptInvitationFromGroup(string groupId, string inviter, string inviteMessage)
    {
    }
    // Occurs when a member is added to the chat group mute list.
    public void OnMuteListAddedFromGroup(string groupId, List mutes, int muteExpire)
    {
    }
    // Occurs when a member is removed from the chat group mute list.
    public void OnMuteListRemovedFromGroup(string groupId, List mutes)
    {
    }
    // Occurs when a chat group member is promoted to an admin.
    public void OnAdminAddedFromGroup(string groupId, string administrator)
    {
    }
    // Occurs when a chat group admin is demoted to a regular member.
    public void OnAdminRemovedFromGroup(string groupId, string administrator)
    {
    }
    // Occurs when the inviter is changed.
    public void OnOwnerChangedFromGroup(string groupId, string newOwner, string oldOwner)
    {
    }
    // Occurs when a user joins a chat group.
    public void OnMemberJoinedFromGroup(string groupId, string member)
    {
    }
    // Occurs when a member leaves a chat group.
    public void OnMemberExitedFromGroup(string groupId, string member)
    {
    }
    // Occurs when the chat group announcements are updated.
    public void OnAnnouncementChangedFromGroup(string groupId, string announcement)
    {
    }
    // Occurs when a shared file is uploaded to a chat group.
    public void OnSharedFileAddedFromGroup(string groupId, GroupSharedFile sharedFile)
    {
    }
    // Occurs when a shared file is deleted in a chat group.
    public void OnSharedFileDeletedFromGroup(string groupId, string fileId)
    {
    }
    // Occurs when a member is added to the chat group allow list.
    public void OnAddWhiteListMembersFromGroup(string groupId, List whiteList)
    {
    }
    // Occurs when a member is removed from the chat group allow list.
    public void OnRemoveWhiteListMembersFromGroup(string groupId, List whiteList)
    {
    }
    // Occurs when all chat group members are muted or unmuted.
    public void OnAllMemberMuteChangedFromGroup(string groupId, bool isAllMuted)
    {
    }
}

// Add the chat group listener.
GroupManagerDelegate adelegate = new GroupManagerDelegate();
SDKClient.Instance.GroupManager.AddGroupManagerDelegate(adelegate);

// Remove the chat group listener.
SDKClient.Instance.GroupManager.RemoveGroupManagerDelegate(adelegate);
```

### Unity

### Create a chat group

Set `GroupStyle` and `inviteNeedConfirm` before creating a chat group.

1. Is the group public or private, and who can invite members (`GroupStyle`):

- `PrivateOnlyOwnerInvite`: A private group. Only the group owner and admins can add users to the chat group.
- `PrivateMemberCanInvite`: A private group. All chat group members can add users to the chat group.
- `PublicJoinNeedApproval`: A public group. The group owner and admins can add users, and users can send join requests to the chat group.
- `PublicOpenJoin`: A public group. All users can join the chat group automatically without any need for approval from the group owner and admins.

2. Does a group invitation require consent from an invitee to add them to the group (`inviteNeedConfirm`):

- Yes (`option.InviteNeedConfirm` is set to `true`). After creating a group and sending group invitations, the subsequent logic varies based on whether an invitee automatically consents to the group invitation (`AutoAcceptGroupInvitation`):
  - Yes (`AutoAcceptGroupInvitation` is set to `true`). The invitee automatically joins the chat group and receives the `IGroupManagerDelegate#OnAutoAcceptInvitationFromGroup` callback, the chat group owner receives the `IGroupManagerDelegate#OnInvitationAcceptedFromGroup` and `IGroupManagerDelegate#OnMemberJoinedFromGroup` callbacks, and all chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback.
  - No (`AutoAcceptGroupInvitation` is set to `false`). The invitee receives the `IGroupManagerDelegate#OnInvitationReceivedFromGroup` callback and chooses whether to join the chat group:
    - If the invitee accepts the group invitation, the inviter receives the `IGroupManagerDelegate#OnInvitationAcceptedFromGroup` and `IGroupManagerDelegate#OnMemberJoinedFromGroup` callbacks and the other chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback;
    - If the invitee declines the group invitation, the inviter receives the`IGroupManagerDelegate#OnInvitationDeclinedFromGroup` callback.

![](/images/im/create_group_unity_windows.png)

- No (`option.InviteNeedConfirm` is set to `false`). After creating a chat group and sending group invitations, an invitee is added to the chat group regardless of their `IsAutoAcceptGroupInvitation` setting. The invitee receives the `IGroupManagerDelegate#OnAutoAcceptInvitationFromGroup` callback, the inviter receives the `IGroupManagerDelegate#OnInvitationAcceptedFromGroup` and `IGroupManagerDelegate#OnMemberJoinedFromGroup` callbacks, and the other chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback.

Users can call `CreateGroup` to create a chat group and set the chat group attributes such as the chat group name, description, maximum number of members, and reason for creating the group, by specifying `GroupOptions`.

The following code sample shows how to create a chat group:

```csharp
GroupOptions option = new GroupOptions(GroupStyle.PrivateMemberCanInvite);
option.MaxCount = 100;
SDKClient.Instance.GroupManager.CreateGroup(groupname, option, desc, members, callback:new ValueCallBack(
  onSuccess: (group) => {
  },
  onError:(code, error) => {
  }
));
```

### Destroy a chat group

Only the inviter can call `DestroyGroup` to disband a chat group. Once a chat group is disbanded, all chat group members receive the `OnDestroyedFromGroup` callback and are immediately removed from the chat group.

:::info
Once a chat group is destroyed, all chat group data is deleted from the local database and memory.
:::

The following code sample shows how to destroy a chat group:

```csharp
SDKClient.Instance.GroupManager.DestroyGroup(groupId, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Join a chat group

The logic of joining a chat group varies according to the `GroupStyle` setting you choose when [creating the chat group](../../reference/group-overview.md#create-a-chat-group):

- If the `GroupStyle` is set to `PublicOpenJoin`, all users can join the chat group without the consent from the inviter and admins. Once a user joins a chat group, all chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback;
- If the `GroupStyle` is set to `PublicJoinNeedApproval`, users can send join requests to the chat group. The inviter and chat group admins receive the `IGroupManagerDelegate#OnRequestToJoinReceivedFromGroup` callback and choose whether to approve the join request:
  - If the request is accepted, the user joins the chat group and receives the `IGroupManagerDelegate#OnRequestToJoinAcceptedFromGroup` callback, while all the other chat group members receive the `IGroupManagerDelegate#OnMemberJoinedFromGroup` callback.
  - If the request is declined, the user receives the `IGroupManagerDelegate#OnRequestToJoinDeclinedFromGroup` callback.

:::info
Users can only request to join public groups; private groups do not allow join requests.
:::

Users can refer to the following steps to join a chat group:

1. Call `FetchPublicGroupsFromServer` to retrieve the list of public groups from the server, and locate the ID of the chat group that you want to join.

2. Call `JoinPublicGroup` to pass in the chat group ID and request to join the specified chat group.

The following code sample shows how to join a chat group:

```csharp
// Retrieve the list of public groups from the server
SDKClient.Instance.GroupManager.FetchPublicGroupsFromServer(callback: new ValueCallBack>(
            // `result` is of CursorResult type
            onSuccess: (result) => {
            },
            onError: (code, desc) =>
            {
            }
        ));

// Request to join the specified chat group
SDKClient.Instance.GroupManager.JoinPublicGroup(groupId, new CallBack(
  onSuccess: () => 
  { 
  },
  onError:(code, desc) => 
  {
  }
));
```

### Leave a chat group

Chat group members can call `LeaveGroup` to leave the specified chat group, whereas the inviter cannot perform this operation. Once a member leaves a chat group, all the other chat group members receive the `IGroupManagerDelegate#OnMemberExitedFromGroup` callback. 

The following code sample shows how to leave a chat group:

```csharp
SDKClient.Instance.GroupManager.LeaveGroup(groupId, new CallBack(
  onSuccess: () => 
  { 
  },
  onError:(code, desc) => 
  {
  }
));
```

### Retrieve the attributes of a chat group

All chat group members can call `GetGroupWithId` to retrieve the chat group attributes from memory, including the chat group ID, name, description, owner, and admin list.

All chat group members can also call `GetGroupSpecificationFromServer` to retrieve the chat group attributes from the server, including the chat group ID, name, description, owner, admin list, and member list.

The following code sample shows how to retrieve the chat group attributes:

```csharp
// Retrieve the chat group attributes from memory
Group group = SDKClient.Instance.GroupManager.GetGroupWithId(groupId); 

// Retrieve the chat group attributes from the server
SDKClient.Instance.GroupManager.GetGroupSpecificationFromServer(groupId, new ValueCallBack(
            onSuccess: (group) => {
            },
            onError: (code, desc) =>
            {
            }
        ));
```

### Retrieve the chat group member list

All chat group members can call `GetGroupMemberListFromServer` to retrieve the chat group member list from the server.

The following code sample shows how to retrieve the chat group member list:

```csharp
SDKClient.Instance.GroupManager.GetGroupMemberListFromServer(groupId, pageSize, cursor, callback: new ValueCallBack>(
  onSuccess: (result) => 
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Retrieve the chat group list

Users can call `FetchJoinedGroupsFromServer` to retrieve the joined chat group list from the server, as shown in the following code sample:

```csharp
SDKClient.Instance.GroupManager.FetchJoinedGroupsFromServer(callback: new ValueCallBack>(
  onSuccess: (groupList) => {
  },
  onError: (code, desc) =>
  {
  }
));
```

Users can call `GetJoinedGroups` to retrieve the joined chat group list from the local database. To ensure the accuracy of results, retrieve the joined chat group list from the server first. The code sample is as follows:

```csharp
List groupList = SDKClient.Instance.GroupManager.GetJoinedGroups();
```

Users can also call `FetchPublicGroupsFromServer` to retrieve public chat group list from the server with pagination, as shown in the following code sample:

```csharp
SDKClient.Instance.GroupManager.FetchPublicGroupsFromServer(pageSize, cursor, callback: new ValueCallBack>(
  onSuccess: (result) => 
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

### Retrieve the number of groups joined by the current user

Users can call the `FetchMyGroupsCount` to retrieve the number of groups they have joined directly from the server. The limit on the number of groups a user can join is determined by the pricing package. For more details, please refer to the [product pricing](../../reference/pricing-plan-details.md#group).

```csharp
SDKClient.Instance.GroupManager.FetchMyGroupsCount(new ValueCallBack(
    onSuccess: (count) =>
    {
    },
    onError: (code, desc) =>
    {
    }
));
```

### Block and unblock a chat group

#### Block a chat group

All chat group members can call `BlockGroup` to block a chat group. Once a member blocks a chat group, this member can no longer receive messages from the chat group.

The following code sample shows how to block a chat group:

```csharp
SDKClient.Instance.GroupManager.BlockGroup(groupId, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Unblock a chat group

All chat group members can call `UnBlockGroup` to unblock a chat group.

The following code sample shows how to unblock a chat group:

```csharp
SDKClient.Instance.GroupManager.UnBlockGroup(groupId, new CallBack(
  onSuccess: () =>
  {
  },
  onError: (code, desc) =>
  {
  }
));
```

#### Check whether a user blocks a chat group

All chat group members can call `GetGroupSpecificationFromServer` to check whether they block a chat group according to the `Group#MessageBlocked` field.

The following code sample shows how to check whether a user blocks a chat group:

```csharp
SDKClient.Instance.GroupManager.GetGroupSpecificationFromServer(currentGroupId, new ValueCallBack(
            onSuccess: (group) => {
                // Check whether a user blocks a chat group
                if(group.MessageBlocked == true) {
                  
                }
            },
            onError: (code, desc) =>
            {
                
            }
        ));
```

### Listen for chat group events

To monitor the chat group events, users can listen for the callbacks in the `IGroupManagerDelegate` class and add app logics accordingly. If a user wants to stop listening for the callbacks, make sure that the user removes the listener to prevent memory leakage.

Refer to the following code sample to listen for chat group events:

```csharp
// Inherit and implement the IGroupManagerDelegate class.
public class GroupManagerDelegate : IGroupManagerDelegate {
    // Occurs when a user receives a group invitation.
    public void OnInvitationReceivedFromGroup(string groupId, string groupName, string inviter, string reason)
    {
    }
    // Occurs when the inviter and chat group admins receive a join request.
    public void OnRequestToJoinReceivedFromGroup(string groupId, string groupName, string applicant, string reason)
    {
    }
    // Occurs when the inviter and chat group admins approve a join request.
    public void OnRequestToJoinAcceptedFromGroup(string groupId, string groupName, string accepter)
    {
    }
    // Occurs when the inviter and chat group admins decline a join request.
    public void OnRequestToJoinDeclinedFromGroup(string groupId, string reason, string decliner, string applicant)
    {
    }
    // Occurs when a user accepts a group invitation.
    public void OnInvitationAcceptedFromGroup(string groupId, string invitee, string reason)
    {
    }
    // Occurs when a user declines a group invitation.
    public void OnInvitationDeclinedFromGroup(string groupId, string invitee, string reason)
    {
    }
    // Occurs when a member is removed from a chat group.
    public void OnUserRemovedFromGroup(string groupId, string groupName)
    {
    }
    // Occurs when a chat group is destroyed.
    public void OnDestroyedFromGroup(string groupId, string groupName)
    {
    }
    // Occurs when a user automatically accepts a chat group invitation.
    public void OnAutoAcceptInvitationFromGroup(string groupId, string inviter, string inviteMessage)
    {
    }
    // Occurs when a member is added to the chat group mute list.
    public void OnMuteListAddedFromGroup(string groupId, List mutes, int muteExpire)
    {
    }
    // Occurs when a member is removed from the chat group mute list.
    public void OnMuteListRemovedFromGroup(string groupId, List mutes)
    {
    }
    // Occurs when a chat group member is promoted to an admin.
    public void OnAdminAddedFromGroup(string groupId, string administrator)
    {
    }
    // Occurs when a chat group admin is demoted to a regular member.
    public void OnAdminRemovedFromGroup(string groupId, string administrator)
    {
    }
    // Occurs when the inviter is changed.
    public void OnOwnerChangedFromGroup(string groupId, string newOwner, string oldOwner)
    {
    }
    // Occurs when a user joins a chat group.
    public void OnMemberJoinedFromGroup(string groupId, string member)
    {
    }
    // Occurs when a member leaves a chat group.
    public void OnMemberExitedFromGroup(string groupId, string member)
    {
    }
    // Occurs when the chat group announcements are updated.
    public void OnAnnouncementChangedFromGroup(string groupId, string announcement)
    {
    }
    // Occurs when a shared file is uploaded to a chat group.
    public void OnSharedFileAddedFromGroup(string groupId, GroupSharedFile sharedFile)
    {
    }
    // Occurs when a shared file is deleted in a chat group.
    public void OnSharedFileDeletedFromGroup(string groupId, string fileId)
    {
    }
    // Occurs when a member is added to the chat group allow list.
    public void OnAddWhiteListMembersFromGroup(string groupId, List whiteList)
    {
    }
    // Occurs when a member is removed from the chat group allow list.
    public void OnRemoveWhiteListMembersFromGroup(string groupId, List whiteList)
    {
    }
    // Occurs when all chat group members are muted or unmuted.
    public void OnAllMemberMuteChangedFromGroup(string groupId, bool isAllMuted)
    {
    }
}

// Add the chat group listener.
GroupManagerDelegate adelegate = new GroupManagerDelegate();
SDKClient.Instance.GroupManager.AddGroupManagerDelegate(adelegate);

// Remove the chat group listener.
SDKClient.Instance.GroupManager.RemoveGroupManagerDelegate(adelegate);
```

### Web

### Create and destroy a chat group

Users can create a chat group and set the chat group attributes such as the name, description, group members, and reasons for creating the group. Users can also set the `GroupOptions` parameter to specify the size and type of the chat group. Once a chat group is created, the creator of the chat group automatically becomes the chat group owner.

Only chat group owners can disband s. Once a chat group is disbanded, all members of that chat group receive the `destroy` callback and are immediately removed from the chat group. All local data for the chat group is also removed from the database and memory.

Refer to the following sample code to create and destroy a chat group:

```javascript
const options = {
  data: {
    groupname: "groupName",
    desc: "A description of a group",
    members: ["user1", "user2"],
    // Set the type of a chat group to public. Public chat groups can be searched, and users can send join requests.
    public: true,
    // Join requests must be approved by the chat group owner or chat group admins.
    approval: true,
    // Allow chat group members to invite other users to join the chat group.
    allowinvites: true,
    // Group invitations must be confirmed by invitees.
    inviteNeedConfirm: true,
    // Set the maximum number of users that can be added to the group.
    maxusers: 500,
  },
};
// Call createGroup to create a chat group.
chatClient.createGroup({ data: options });

// Call destroyGroup to disband a chat group.
const options = {
  groupId: "groupId",
};
chatClient.destroyGroup(options).then((res) => console.log(res));
```

### Join and leave a chat group

Users can request to join a public chat group as follows:

1. Call `getPublicGroups` to retrieve the list of public groups by page. Users can obtain the ID of the group that they want to join.
2. Call `joinGroup` to send a join request to the chat group:
   - If the `approval` parameter of the group type is set to `false`, the request from the user is accepted automatically and the chat group members receive the `memberPresence` callback.
   - If the `approval` parameter is set to `true`, the chat group owner and chat group admins receive the `requestToJoin` callback and determine whether to accept the request from the user.

Users can call `joinGroup` to leave a chat group. Once a user leaves the group, all the other group members receive the `memberAbsence` callback.

Refer to the following sample code to join and leave a chat group:

```javascript
// Call getPublicGroups to list public groups by page.
let limit = 20,
  cursor = globalCursor;
let options = {
  limit: limit,
  cursor: cursor,
};
chatClient.getPublicGroups(options).then((res) => console.log(res));

// Call joinGroup to send a join request to a chat group.
const options = {
  groupId: "groupId",
  message: "I am Tom",
};
chatClient.joinGroup(options).then((res) => console.log(res));

// Call leaveGroup to leave a chat group.
const options = {
  groupId: "groupId",
};
chatClient.leaveGroup(options).then((res) => console.log(res));
```

### Retrieve the member list of a chat group

Users can call `listGroupMembers` to retrieve the member list of a chat group by page.

Refer to the following sample code to retrieve the member list of a chat group:

```javascript
let pageNum = 1,
  pageSize = 1000;
let options = {
  pageNum: pageNum,
  pageSize: pageSize,
  groupId: "groupId",
};
chatClient.listGroupMembers(options).then((res) => console.log(res));
```

### Listen for chat group events

Users can call `addEventHandler` to listen for chat group events.

Refer to the following sample code to listen for chat group events:

```javascript
chatClient.addEventHandler("handlerId", {
  onGroupEvent: function (msg) {
    switch (msg.operation) {
      // Occurs on the other devices of the group owner when a group is created.
      case "create":
        break;
      // Occurs when all chat group members are unmuted.
      case "unmuteAllMembers":
        break;
      // Occurs when all chat group members are muted.
      case "muteAllMembers":
        break;
      // Occurs when a member is removed from the chat group allow list.
      case "removeAllowlistMember":
        break;
      // Occurs when a member is added to the chat group allow list.
      case "addUserToAllowlist":
        break;
      // Occurs when a member deletes a chat group shared file.
      case "deleteFile":
        break;
      // Occurs when a member uploads a chat group shared file.
      case "uploadFile":
        break;
      // Occurs when a member deletes a chat group announcement.
      case "deleteAnnouncement":
        break;
      // Occurs when a member updates a chat group announcement.
      case "updateAnnouncement":
        break;
      // Occurs when a member is removed from the chat group mute list.
      case "unmuteMember":
        break;
      // Occurs when a member is add to the chat group mute list.
      case "muteMember":
        break;
      // Occurs when a chat group admin is removed from the admin list.
      case "removeAdmin":
        break;
      // Occurs when a chat group member is added to the admin list.
      case "setAdmin":
        break;
      // Occurs when the chat group owner is changed.
      case "changeOwner":
        break;
      // Occurs when an invitee accepts the group invitation automatically.
      case "directJoined":
        break;
      // Occurs when a group member leaves a chat group.
      case "memberAbsence":
        break;
      // Occurs when a user joins a chat group.
      case "memberPresence":
        break;
      // Occurs when a user is removed from a chat group.
      case "removeMember":
        break;
      // Occurs when an invitee declines a group invitation.
      case "rejectInvite":
        break;
      // Occurs when an invitee accepts a group invitation.
      case "acceptInvite":
        break;
      // Occurs when a user receives a group invitation.
      case "inviteToJoin":
        break;
      // Occurs when the chat group owner or admin rejects the join request.
      case "joinPublicGroupDeclined":
        break;
      // Occurs when the chat group owner or admin approves the join request.
      case "acceptRequest":
        break;
      // Occurs when the chat group owner and admins receive a join request.
      case "requestToJoin":
        break;
      // Occurs when the chat group owner disbands the chat group.
      case "destroy":
        break;
      default:
        break;
    }
  },
});
```
