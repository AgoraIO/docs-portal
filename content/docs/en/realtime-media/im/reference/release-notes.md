---
title: "Release notes"
description: "Provides release notes of Agora Chat."
---

This page provides release notes for Chat SDK for Web.

- [Client API](#client-api)
- [RESTful API](#restful-api)

## Client API
### Android

## v1.3.2

v1.3.2 was released on April 7, 2025.

#### Improvements

- Enhanced security by adding access checks for message attachments. For example, if you receive an image message in a group and forward it to others outside the group, they cannot download the image.
- Streamlined APIs by sunsetting those deprecated before Agora Chat v1.1.0.
- Included the `libaosl.so` library in the SDK. If you have integrated both Agora Chat SDK 1.3.2 and Signaling SDK 2.2.0 and above or Video SDK 4.3.0 and above, a compilation error may occur. For details, see [Integration issues](../get-started-sdk#integration-issues).

#### Issues fixed

- Crash in rare occasions upon network changes

## v1.3.1

v1.3.1 was released on December 20, 2024.

#### Improvements

- Added  support for pinning messages in one-to-one conversations. Users can call `ChatManager#asyncPinMessage` or `ChatManager#asyncUnPinMessage` to pin or unpin a one-to-one chat message.
- Adapted to the 16 KB page size of Android 15.

#### Issues fixed

- A crash occurs when `to` is empty during message sending.
- An incorrect `nextkey` is returned when pulling roaming messages.
- A crash occurs when `CustomMessageBody#setParams` is called repeatedly in multi-thread use-cases.
- The number of unread messages is inconsistent among multiple devices in certain use-cases.
- The specified image thumbnail size does not take effect during message sending.

## v1.3.0

v1.3.0 was released on December 11, 2024.

#### New features

- Added the `ChatManager#asyncDeleteAllMsgsAndConversations` method to uni-directionally clear all conversations and messages in them. You can also choose whether to clear the chat history on the server.
- Added the function of searching for messages by search scope in `Conversation.ChatMessageSearchScope` during keyword-based search.
  - `Conversation.ChatMessageSearchScope`: Includes three message search scopes: the message content, message extension information, and both.
  - `ChatManager#searchMsgFromDB(String, long, int, String, Conversation.SearchDirection, Conversation.EMMessageSearchScope)`: Searches for messages in all conversations by search scope.
  - `Conversation#searchMsgFromDB(String, long, int, String, Conversation.SearchDirection, Conversation.EMMessageSearchScope)`: Searches for messages in a conversation by search scope.
- Added the function of tagging a conversation:
  - `ChatManager#asyncAddConversationMark`: Tags a conversation.
  - `ChatManager#asyncRemoveConversationMark`: Untags a conversation.
  - `ChatManager#asyncGetConversationsFromServerWithCursor`: Gets conversations from the server by conversation tag.
  - `Conversation#marks`: Gets all tags of a local conversation.
  - `MultiDeviceListener#CONVERSATION_MARK_UPDATE`: Conversation tag update event in a multi-device login use-case. If a user adds or removes a conversation tag on one device, this event is received on other devices of the user.
- Added the `ChatMessage#isBroadcast` property to indicate whether the message is a broadcast message sent via a RESTful API to all chat rooms under an app.
- Added `ChatMessage#deliverOnlineOnly` and `ChatMessage#isDeliverOnlineOnly` methods to set whether the message is delivered only when the recipient(s) is/are online. If this field is set to `true`, the message is discarded when the recipient is offline.
- Added the `GroupManager#asyncGetJoinedGroupsCountFromServer` method to allow the current user to retrieve the total number of joined groups.
- Added the error code 706 `CHATROOM_OWNER_NOT_ALLOW_LEAVE` that occurs when chat room owner leaves the chat room. If `ChatOptions#allowChatroomOwnerLeave` is set to `false` during SDK initialization, the chat room owner is not allowed to leave the chat room. In this case, error 706 is reported if the chat room owner calls the `leaveChatRoom` method.
- Added the support for retrieval of historical messages of chat rooms from the server.
- Added the `ChatOptions#setUseReplacedMessageContents` method to determine whether the server returns the adjusted text message to the sender if the message content is replaced during text moderation.
- Added the function of pinning a message:
  - `ChatManager#asyncPinMessage`: Pins a message.
  - `ChatManager#asyncUnPinMessage`: Unpins a message.
  - `ChatManager#asyncGetPinnedMessagesFromServer`: Gets the list of pinned messages in a conversation from the server.
  - `Conversation#pinnedMessages`: Gets the list of pinned messages in a local conversation.
  - `MessagePinInfo`: Includes the operator that pins or unpins the message and the operation time.
  - `ChatMessage#pinnedInfo`: Includes the message pinning information.
  - `MessageListener#onMessagePinChanged`: Occurs when the message pinning status changes. When a message is pinned or unpinned in a group or chat room, all members in the group or chat room receive this event.
- Added the `ChatOptions#setLoadEmptyConversations` method to set whether to include empty conversations in the retrieved list of local conversations. This method is called during SDK initialization.
- Added the `applicant` and `decliner` parameters to the `GroupChangeListener#onRequestToJoinDeclined` event to respectively indicate the user that applies to join the group and the user that declines the join request.
- Added the `ChatOptions#setIncludeSendMessageInMessageListener` method to set whether to return the successfully sent message in the `MessageListener#onMessageReceived` event.
- Added the support for returning the modified custom message via the `MessageListener#onMessageContentChanged` event if the message is modified via the RESTful API.
- Added the support for the dynamic loading of `.so` library files.

#### Improvements

- Added support for forwarding of single attachment messages by passing in the message body, without re-uploading the attachment.
- Reduced the number of times group specifications are retrieved when a large number of group member events are received during certain use-cases.
- Delivered a more accurate chat room member count by optimizing the way to update the member count when members join or leave the chat room.
- Shortened the time used to call the `ChatManager#markAllConversationsAsRead` method by marking all conversations read more efficiently.
- Optimized the way the SDK randomly gets server addresses to increase the success rate of requests.
- Adjusted the timeout period for joining or leaving chat rooms.
- Optimized the way the connection is re-established upon a connection failure in certain use-cases.
- Added support for uploading the attachment in fragments when sending an attachment message.
- Adapted to Android 14 Beta: Adapted to the rule that `RECEIVER_EXPORTED` or `RECEIVER_NOT_EXPORTED` must be set to `true` when a broadcast receiver is dynamically registered in an app that targets Android 14.
- Marked the `ChatClient#loginWithAgoraToken` method deprecated. Use the `ChatClient#loginWithToken` method instead.
- Fine tuned the error message for token-based login for accuracy.
- Optimized the way messages are resent.
- Removed the internal `NetworkOnMainThreadException` exception catching during a network request.
- Optimized the database upgrade logic.
- Removed the FPA function and recompiled the boringssl, cipherdb, and libevent libraries to diminish the size of the SDK.
- Increased the maximum allowed size of a log file from 2 MB to 5 MB.
- Allowed users to get the general mute status of groups (the value of `isAllMemberMuted`) locally upon login by storing the status in the local database.

#### Issues fixed

- For a modified message, the `from` property is missing from the body of the message pulled from the server by an offline user that gets online.
- In special use-cases, chat room events are missing when users exit the SDK before login to it.
- The SDK reconnects to the server twice after the network is back to normal.
- An incorrect error message is returned for a logged-out user that calls the `leaveChatRoom` method.
- The members in a group are double counted in certain use-cases.
- The data reporting module crashes occasionally.
- The SDK is instantiated repeatedly when the `ChatClient#init` method is called frequently for SDK initialization in multi-thread use-cases.

## v1.2.1

v1.2.1 was released on December 8, 2023.

#### Improvements

- Added support for dynamic registration broadcasts in Android 14, which requires setting the `RECEIVER_EXPORTED` or `RECEIVER_NOT_EXPORTED` flag.

#### Issues fixed

- Fixed the problem of losing chat room listener in some use-cases after logging out and logging in again.
- Fixed the problem of occasionally failing to save the token when logging in manually.

## v1.2.0

v1.2.0 was released on December 6, 2023.

#### New features

- Added the function of forwarding multiple messages:
  - `ChatMessage#createCombinedSendMessage`: Creates a combined message.
  - `ChatManager#downloadAndParseCombineMessage`: Downloads and parses a combined message.
- Added the function of modifying sent messages:
  - `ChatManager#asyncModifyMessage`: Modifies a sent text message.
  - `MessageListener#onMessageContentChanged`: Occurs when a sent message is modified. The message recipient receives this callback.
- Added the `ChatRoomManager#leaveChatRoom(String, CallBack)` method to leave a chat room and allow the user to know whether they successfully left the chat room.
- Added the function of pinning a conversation:
  - `ChatManager#asyncPinConversation`: Pins a conversation.
  - `ChatManager#asyncFetchPinnedConversationsFromServer`: Retrieves the list of pinned conversations from the server with pagination.
- Added the `ChatManager#asyncFetchConversationsFromServer` method to retrieve the conversation list from the server. Marked the `ChatManager#asyncFetchConversationsFromServer(int, int, EMValueCallBack)` method and the `ChatManager#asyncFetchConversationsFromServer(EMValueCallBack)` method deprecated.
- Added the `ChatManager#getAllConversationsBySort` method to retrieve local conversations in the reverse chronological order of when conversations are active.
- Added multi-device operations:
  - `MultiDeviceListener#CONVERSATION_PINNED`: A conversation is pinned on one device. This event is received by other devices.
  - `MultiDeviceListener#CONVERSATION_UNPINNED`: A conversation is unpinned on one device. This event is received by other devices.
  - `MultiDeviceListener#CONVERSATION_DELETED`: A conversation is deleted from one device. This event is received by other devices.
- Added the `ChatManager#asyncFetchHistoryMessages` method to retrieve historical messages of a conversation from the server according to `FetchMessageOption`, the parameter configuration class for retrieving historical messages.
- Added `FetchMessageOption` as the parameter configuration class for retrieving historical messages from the server.
- Added the `Conversation#removeMessages` method to delete messages sent or received in a certain period from the local database.
- Added the `List` attribute in `MessageReactionChange`:
  - `MessageReactionOperation#getUserId`: The user ID of the operator.
  - `MessageReactionOperation#getReaction`: The changed Reaction.
  - `MessageReactionOperation#getOperation`: The operation.
- Added the function of managing custom attributes of group members:
  - `GroupManager#asyncSetGroupMemberAttributes`: Sets custom attributes of a group member.
  - `GroupManager#asyncFetchGroupMemberAllAttributes`: Retrieves all custom attributes of a group member.
  - `GroupManager#asyncFetchGroupMembersAttributes`: Retrieves custom attributes of multiple group members by attribute key.
  - `GroupChangeListener#onGroupMemberAttributeChanged`: Occurs when a custom attribute is changed for a group member.
  - `MultiDeviceListener#GROUP_METADATA_CHANGED`: Custom attributes are set for a group member on one device. This event is received by other devices.
- Added error codes:
  - `Error#APP_ACTIVE_NUMBER_REACH_LIMITATION`: The number of daily active users (DAU) or monthly active users (MAU) for the app has reached the upper limit.
  - `Error#MESSAGE_SIZE_LIMIT`: You have exceeded the maximum allowed size of a message body.
  - `Error#GROUP_MEMBER_ATTRIBUTES_REACH_LIMIT`: The total length of custom attributes of the group member has exceeded the upper limit (4 KB).
  - `Error#GROUP_MEMBER_ATTRIBUTES_UPDATE_FAILED`: Fails to set the custom attribute(s) of the group member.
  - `Error#GROUP_MEMBER_ATTRIBUTES_KEY_REACH_LIMIT`: The key of a custom attribute(s) of the group member has exceeded the maximum allowed length of 16 bytes.
  - `Error#GROUP_MEMBER_ATTRIBUTES_VALUE_REACH_LIMIT`: The value of a custom attribute(s) of the group member has exceeded the maximum allowed length of 512 bytes.

#### Improvements

- Optimized the callback logic of `ChatClient#addConnectionListener`. After a connection listener is added, `ConnectionListener#onDisconnected` is triggered only after login.
- Optimized the `searchMsgFromDB` method to include custom messages in the search scope.
- Optimized the logic of binding and unbinding a push token.

#### Issues fixed

- The message read status is not updated in certain use-cases.
- In some use-cases, when the user calls `ChatManager#downloadAttachment` to download message attachments, the attachments are not downloaded to the private directory.
- When `ChatManager#deleteMessagesBeforeTimestamp` is called, messages in the local database are deleted, but those in the cache remain.
- The app crashes when you send a video message and set the first frame to be empty.

## v1.1.0

v1.1.0 was released on April 28, 2023.

#### New features

- Adds the function of managing custom chat room attributes to implement functions like seat control and synchronization in voice chat rooms. See [Manage chat room attributes](/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes).
- Adds the `ChatMessage#setPriority(ChatRoomMessagePriority)` method to implement the chat room message priority function to ensure that high-priority messages are dealt with first. See [Set message priority](/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages#set-message-priority).
- Adds the pagination parameters `pageNum` and `pageSize` to the `ChatManager#asyncFetchConversationsFromServer` method to allow users to get the conversation list from the server with pagination. See [Retrieve a list of conversations from the server](/en/realtime-media/im/build/build-core-messaging/messages/retrieve-messages#retrieve-a-list-of-conversations-from-the-server).
- Adds the support for push notifications on the server side to allow you to send push notifications to all users, individual users specified by IDs, or groups of users by  labels. For how to configure and send push notifications, see [Push notification management](/en/api-reference/api-ref/im/push-notification-management).
- Adds an additional option to delete messages on the server side. See [Delete conversations and historical messages](/en/realtime-media/im/build/build-core-messaging/messages/manage-messages#delete-conversations-and-historical-messages).

#### Improvements

Improved code security.

## v1.0.9

v1.0.9 was released on December 19, 2022.

#### Issues fixed

- Some alerts on Android 12.
- The inconsistency of messages in the memory and the database due to a call to the `updateMessage` method in rare use-cases.
- Crashes in rare use-cases.

## v1.0.8

v1.0.8 was released on November 22, 2022.

#### Issues fixed

- Failures in getting a large number of messages from the server in a few use-cases.
- An issue with incorrect data statistics.
- Crashes caused by log printing in rare use-cases.

## v1.0.7

v1.0.7 was released on September 7, 2022.

#### New features

- Adds the `isDisabled()` attribute to `Group` to indicate whether a group is disabled. This attribute needs to be set by developers at the server side. This attribute is returned when you call the `getGroupFromServer()` method in `GroupManager` to get group details.
- Adds custom error information to the error information returned to the message sender when the pre-sending callback service declines to send the message.
- Adds the error code 1101 (`PRESENCE_CANNOT_SUBSCRIBE_YOURSELF`) in `Error` to indicate users cannot subscribe to their own presence.
- Adds `ChatLogListener` to implement SDK running log callbacks.

####  Improvements

 - Optimized the login process for quicker login.
 - Optimized the access point update policy that is used in the case of a connection failure, in order to improve the availability.
 - Upgraded the message encryption algorithm from CBC to GCM.
 - Supported TLS 1.3 for SDK-related HTTP requests.
 - Upgraded OpenSSL, a dependency of libcipherdb, to 1.1.1q.
 - Optimized the display of parameters in the methods in the SDK.

#### Issues fixed

- Data deduplication was not implemented for the `getAllMessage` method in `Conversation`.
- Occasional crashes during login with user IDs and passwords.
- Once the `fetchHistoryMessages()` method in `ChatManager` was called, the method was repeatedly called to get messages from the server.

## v1.0.6

v1.0.6 was released on Jul 22, 2022.

#### New features

- Supports marking whether a message is an online message by using the `isOnlineState` member in `ChatMessage`.
- Adds an error code 509 `MESSAGE_CURRENT_LIMITING` in `Error`, which means that the chat group message has exceeded the concurrent limit.
- Adds an `onSpecificationChanged` callback in `GroupChangeListener`, which occurs when the state specification updates.
- Adds a `bindDeviceToken` method in `PushManager`, which binds the device token.

#### Improvements

- Improved thread-related methods and classes. Compared with 1.0.4, this release used `ChatThread` to replace `ChatThreadInfo`.
- Assigned a value to `groupName` in the `onInvitationReceived` callback.
- Removed the CBC and EBC encryption algorithm in the Android layer.
- Upgraded the network link library.
- Supported sending messages with a remote address as the attachment.

#### Issues fixed

- The retrieved reaction object was empty.
- Devices running earlier Android versions failed to load the database.

## v1.0.4

v1.0.4 was released on May 17, 2022.

#### New features

- Supports reaction, which enables users to add reaction emojis to the specified message.
- Supports content moderation with the reportMessage method.
- Supports message push configuration, which enables users to configure various push settings.

#### Improvements

- Enhanced DNS configuration for retrieving the server access point.
- Improved data reports.
- Changed the file name of libsqlcipher to avoid conflict when using the official AAR.
- Added support for double and float data types for the ext attribute in ChatMessage.
- Changed openssl to boringssl.
- Changed the minimum API level to 21 (Android 5.0).

#### Issues fixed

- Issues reported when uploading the app to Google Play caused by encryption algorithm.
- The translation API did not take effect.

## v1.0.3.1

v1.0.3.1 was released on April 27, 2022. This release fixed the occasional issue of not being to display the retrieved historical messages.

## v1.0.3

v1.0.3 was released on April 19, 2022.

#### New features

Supports the presence feature, which indicates the online status of the user.

#### Improvements

- Shortened the time out for sending messages.
- Enhanced the request success rate.
- Supported the upgraded OPPO push (from 2.1.0 to 3.0.0) and VIVO push (from 2.3.1 to 3.is 0.0.4_484).

#### Issues fixed

Fixed PendingIntent, which caused warnings when uploading apps to Google Play.

## v1.0.2

v1.0.2 was released on Feb 22, 2022.

#### New features

- Supports deleting conversations on the server by calling deleteConversationFromServer.
- Supports customizing messages using extension fields, badges, CMD messages for message push.
- Adds an error code 221 `USER_NOT_ON_ROSTER` which is reported when the user sends a message to another user that is not a contact.
- Supports recalling messages using the RESTful API.

#### Improvements

Reduced the time for preparing to send messages under poor network conditions.

#### Issues fixed

- The message re-sending was interrupted by the connection success event.
- Memory leak.
- Crashes caused by incorrect time calculation.

## v1.0.1.1

v1.0.1.1 was released on December 30, 2021.

This release fixed an issue where the database failed to load under extreme conditions.

## v1.0.1

v1.0.1 was released on December 27, 2021.

#### New features

v1.0.1 adds the following features:

- Supports setting the building name when creating a location message.
- Supports deleting local messages before a specific time.
- Supports getting the count of messages in one conversation.

#### Fixed issues

This release fixed the following issues:

- Some crash issues occurred.
- An issue occurred in the database encryption.

#### API changes

v1.0.1 adds the following APIs:

- `createLocationSendMessage` [1/2]
- `deleteMessagesBeforeTimestamp`
- `getAllMsgCount`

## v1.0.0

v1.0.0 was released on December 6, 2021.

:::warning
This release has an issue that the database occasionally fails to load. Agora recommends you upgrade to the latest version as soon as possible.
:::

#### New features

This release supports getting the users' login status through the `isLoggedIn` and `isLoggedInBefore` methods.

#### Improvements

This release makes the following improvements:

- Optimizes the logic of renewing push tokens, reducing server request times.
- Improves the login speed.
- Uses only HTTPS for REST operations by default.
- Optimizes the logic of token expiration.

#### Fixed issues

This release fixed the following issues:

- The fetched history messages were incomplete.
- Crashes occurred in certain use-cases.
- An issue occurred in displaying the unread status of messages.

### iOS

## v1.3.1

v1.3.1 was released on December 20, 2024.

#### Improvements

- Added support for pinning messages in one-to-one conversations. Users can call `AgoraChatManager#pinMessage` or `AgoraChatManager#unpinMessage` to pin or unpin a one-to-one chat message.

#### Issues fixed

- A crash occurs when `conversationId` is empty during message sending.
- An incorrect `nextkey` is returned when pulling roaming messages.
- The number of unread messages is inconsistent among multiple devices in certain use-cases.
- The specified image thumbnail size does not take effect during message sending.

## v1.3.0

v1.3.0 was released on December 11, 2024.

#### New features

- Added the privacy protocol `PrivacyInfo.xcprivacy`.
- Added the `AgoraChatManager#deleteAllMessagesAndConversations:completion:` method to uni-directionally clear all conversations and messages in them. You can also choose whether to clear the chat history on the server.
- Added the function of searching for messages by search scope in `AgoraChatMessageSearchScope` during keyword-based search:
  - `AgoraChatMessageSearchScope`: Includes three message search scopes: the message content, message extension information, and both.
  - `AgoraChatManager#loadMessagesWithKeyword:timestamp:count:fromUser:searchDirection:scope:completion:`: Searches for messages in all conversations by search scope.
  - `AgoraChatConversation#loadMessagesWithKeyword:timestamp:count:fromUser:searchDirection:scope:completion:`: Searches for messages in a conversation by search scope.
- Added the function of tagging a conversation:
  - `AgoraChatManager#addConversationMark:completion`: Tags a conversation.
  - `AgoraChatManager#removeConversationMark:completion`: Untags a conversation.
  - `AgoraChatManager#getConversationsFromServerWithCursor:filter:completion`: Gets the list of conversations from the server by conversation tag.
  - `AgoraChatConversation#marks`: Gets all tags of a local conversation.
  - `multiDevicesConversationEvent#AgoraChatMultiDevicesEventConversationUpdateMark`: Conversation tag update event in a multi-device login use-case. If a user adds or removes a conversation tag on one device, this event is received on other devices of the user.
- Added the `AgoraChatMessage#broadcast` property to indicate whether the message is a broadcast message sent via a RESTful API to all chat rooms under an app.
- Added the `AgoraChatMessage#deliverOnlineOnly` property to determine whether the message is delivered only when the recipient(s) is/are online. If this property is set to `YES`, the message is discarded when the recipient is offline.
- Added the `AgoraChatGroupManager#getJoinedGroupsCountFromServerWithCompletion` method to allow the current user to retrieve the total number of joined groups.
- Added the error code 706 `AgoraChatErrorChatroomOwnerNotAllowLeave` that occurs when chat room owner leaves the chat room. If `AgoraChatOptions#canChatroomOwnerLeave` is set to `NO` during SDK initialization, the chat room owner is not allowed to leave the chat room. In this case, error 706 is reported if the chat room owner calls the `leaveChatroom` method.
- Added the support for retrieval of historical messages of chat rooms from the server.
- Added the `AgoraChatOptions#useReplacedMessageContents` method to determine whether the server returns the adjusted text message to the sender if the message content is replaced during text moderation.
- Added the function of pinning a message:
  - `AgoraChatManager#pinMessage:completion:`: Pins a message.
  - `AgoraChatManager#unpinMessage:completion:`: Unpins a message.
  - `AgoraChatManager#getPinnedMessagesFromServer:completion:`: Gets the list of pinned messages in a conversation from the server.
  - `AgoraChatConversation#pinnedMessages`: Gets the list of pinned messages in a local conversation.
  - `AgoraChatMessagePinInfo`: Includes the operator that pins or unpins the message and the operation time.
  - `AgoraChatMessage#pinnedInfo`: Includes the message pinning information.
  - `AgoraChatMessageListener#onMessagePinChanged`: Occurs when the message pinning status changes. When a message is pinned or unpinned in a group or chat room, all members in the group or chat room receive this event.
- Added the `AgoraChatManager#markAllConversationsAsRead` method to mark all conversations as read. Upon a call of this method, the number of unread messages of all conversations is reset to zero.
- Added the `AgoraChatOptions#includeSendMessageInMessageListener` property to set whether to return the successfully sent message in the `messagesDidReceive` event.
- Added the `AgoraChatOptions#loadEmptyConversations` property to set whether to include empty conversations in the retrieved list of local conversations.
- Added the `applicant` and `decliner` parameters to the  `AgoraChatGroupManagerDelegate#joinGroupRequestDidDecline:reason:decliner:applicant:` event to respectively indicate the user that applies to join the group and the user that declines the join request.
- Added the support for returning the modified custom message via the  `AgoraChatChatManagerDelegate#onMessageContentChanged:operatorId:operationTime` event if the message is modified via a RESTful API.

#### Improvements

- Added support for forwarding of single attachment messages by passing in the message body, without reuploading the attachment.
- Reduced the number of times group specifications are retrieved when a large number of group member events are received during certain use-cases.
- Delivered a more accurate chat room member count by optimizing the way to update the member count when members join or leave the chat room.
- Fine tuned the error message for token-based login for the sake of accuracy.
- Optimized the way the SDK randomly gets server addresses to increase the success rate of requests.
- Adjusted the timeout period for joining or leaving chat rooms.
- Allowed users to get the general mute status of groups (the value of `AgoraChatGroup#isMuteAllMembers`) locally upon login by storing the status in the local database.
- Increased the maximum allowed size of a log file from 2 MB to 5 MB.
- Added support for uploading the attachment in fragments when sending an attachment message.
- Marked the `AgoraChatClient#loginWithUsername:agoraToken:` and `AgoraChatClient#loginWithUsername:password:` methods deprecated. Use the `AgoraChatClient#loginWithUsername:token` method instead.
- Optimized the way messages are resent.
- Optimized the database upgrade logic.

#### Issues fixed

- The members in a group are double counted in certain use-cases.
- A SQL statement error is reported when a single quotation mark `'` is included in a message search keyword.
- The SDK reconnects to the server twice after the network is back to normal.
- For a modified message, the `from` property is missing from the body of the message pulled from the server by an offline user that gets online.

## v1.2.0

v1.2.0 was released on December 6, 2023.

#### New features

- Added the function of forwarding multiple messages:
  - `AgoraChatManager#downloadAndParseCombineMessage`: Downloads and parses a combined message.
  - `AgoraChatMessageBodyTypeCombine`: The combined message type.
  - `AgoraChatCombineMessageBody`: The combined message body class.
- Added the function of modifying sent messages:
  - `AgoraChatManager#modifyMessage`: Modifies a sent text message.
  - `AgoraChatManagerDelegate#onMessageContentChanged`: Occurs when a sent message is modified. The message recipient receives this callback.
- Added the function of pinning a conversation:
  - `AgoraChatManager#pinConversation`: Pins a conversation.
  - `AgoraChatManager#getPinnedConversationsFromServerWithCursor`: Retrieves the pinned conversations from the server.
- Added the `AgoraChatManager#getConversationsFromServerWithCursor` method to retrieve the conversation list from the server. Marked `getConversationsFromServer` and `getConversationsFromServerByPage:pageSize:completion:` deprecated.
- Added the `AgoraChatManager#getAllConversations:` method to retrieve local conversations in the reverse chronological order of when conversations are active.
- Added `AgoraChatFetchServerMessagesOption` as the parameter configuration class for retrieving historical messages from the server.
- Added the `AgoraChatManager#fetchMessagesFromServerBy` method to retrieve historical messages of a conversation from the server according to `AgoraChatFetchServerMessagesOption`, the parameter configuration class for retrieving historical messages.
- Added the `AgoraChatConversation#removeMessagesStart` method to delete messages sent or received in a certain period from the local database.
- Added the function of managing custom attributes of group members:
  - `AgoraChatGroupManager#setMemberAttribute`: Sets custom attributes of a group member.
  - `AgoraChatGroupManager#fetchMemberAttributes`: Retrieves custom attributes of group members.
  - `AgoraChatGroupManagerDelegate#onAttributesChangedOfGroupMember`: Occurs when a custom attribute is changed for a group member.
- Added error codes:
  - `AgoraChatErrorAppActiveNumbersReachLimitation`: The number of daily active users (DAU) or monthly active users (MAU) for the app has reached the upper limit.
  - `AgoraChatErrorMessageSizeLimit`: You have exceeded the maximum allowed size of a message body.
  - `AgoraChatErrorGroupMemberAttributesReachLimit`: The total length of custom attributes of the group member has exceeded the upper limit (4 KB).
  - `AgoraChatErrorGroupMemberAttributesUpdateFailed`: Fails to set the custom attribute(s) of the group member.
  - `AgoraChatErrorGroupMemberAttributesKeyReachLimit`: The key of a custom attribute(s) of the group member has exceeded the maximum allowed length of 16 bytes.
  - `AgoraChatErrorGroupMemberAttributesValueReachLimit`: The value of a custom attribute(s) of the group member has exceeded the maximum allowed length of 512 bytes.
- Added multi-device operations:
  - `AgoraChatMultiDevicesEvent#AgoraChatMultiDevicesEventGroupMemberAttributesChanged`: Custom attributes are changed for a group member on one device. This event is received by other devices.
  - `AgoraChatMultiDevicesEvent#AgoraChatMultiDevicesEventConversationPinned`: A conversation is pinned on one device. This event is received by other devices.
  - `AgoraChatMultiDevicesEvent#AgoraChatMultiDevicesEventConversationUnpinned`: A conversation is unpinned on one device. This event is received by other devices.
  - `AgoraChatMultiDevicesEvent#AgoraChatMultiDevicesEventConversationDelete`: A conversation is deleted from one device. This event is received by other devices.
- Added the `NSArray *operations` attribute in `AgoraChatMessageReactionChange`:
  - `AgoraChatMessageReactionOperation#userId`: The user ID of the operator.
  - `AgoraChatMessageReactionOperation#reaction`：The changed Reaction.
  - `AgoraChatMessageReactionOperation#operate`：The Reaction operation.

#### Improvements

- Supported the ARM64 simulator on macOS.
- Optimized the `loadMessagesWithKeyword` method to include custom messages in the search scope.

## v1.1.0

v1.1.0 was released on April 28, 2023.

#### New features

- Adds the function of managing custom chat room attributes to implement functions like seat control and synchronization in voice chat rooms. See [Manage chat room attributes](/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes).
- Adds the `AgoraChatMessage#priority` attribute to implement the chat room message priority function to ensure that high-priority messages are dealt with first. [Set message priority](/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages#set-message-priority).
- Adds the pagination parameters `pageNum` and `pageSize` to the `IAgoraChatManager#getConversationsFromServer` method to allow users to get the conversation list from the server with pagination. See [Retrieve a list of conversations from the server](/en/realtime-media/im/build/build-core-messaging/messages/retrieve-messages#retrieve-a-list-of-conversations-from-the-server).
- Adds the support for push notifications on the server side to allow you to send push notifications to all users, individual users specified by IDs, or groups of users by labels. For how to configure and send push notifications, see [Push notification management](/en/api-reference/api-ref/im/push-notification-management).
- Adds an additional option to delete messages on the server side. See [Delete conversations and historical messages](/en/realtime-media/im/build/build-core-messaging/messages/manage-messages#delete-conversations-and-historical-messages).

#### Improvements

Improved code security.

## v1.0.9

v1.0.9 was released on December 19, 2022.

#### Issues fixed

- The inconsistency of messages in the memory and the database due to a call to the `updateMessage`
method in rare use-cases.
- Crashes in rare use-cases.

## v1.0.8

v1.0.8 was released on November 22, 2022.

#### Issues fixed

- Failures in getting a large number of messages from the server in a few use-cases.
- An issue with incorrect data statistics.
- Crashes caused by log printing in rare use-cases.

##  v1.0.7

v1.0.7 was released on September 7, 2022.

#### New features

- Adds the `isDisabled` attribute to `AgoraChatGroup` to indicate whether a group is disabled. This attribute needs to be set by developers at the server side. This attribute is returned when you call the `getGroupSpecificationFromServerWithId` method to get group details.
- Adds custom error information to the error information returned to the message sender when the pre-sending callback service declines to send the message.
- Adds the error code 1101 (`AgoraChatErrorPresenceCannotSubscribeSelf`) to indicate that users cannot subscribe to their own presence.
- Adds `AgoraChatLogDelegate` to implement SDK running log callbacks.

#### Improvements

- Changed the `chatManager/contactManager/groupManager/threadManager/roomManager/pushManager` attribute in `AgoraChatClient` from `_Nonnull` to `_Nullable`. The value of this attribute is `Nil` prior to the SDK initialization.
- Optimized the login process for quicker login.
- Upgraded the message encryption algorithm from CBC to GCM.

#### Issues fixed

- When users logged out and the push certificate was unbinded from the device, crashes occurred if the push certificate was not set during SDK initialization.
- Typos in some methods.

## v1.0.6

v1.0.6 was released on Jul 22, 2022.

#### New features

- Supports marking whether a message is an online message by using the `onlineState` member in `AgoraChatMessage`.
- Adds an error code 509 `AGORAMESSAGECURRENTLIMITING` in `AgoraChatError`, which means that the chat group message has exceeded the concurrent limit.
- Adds an `groupSpecificationDidUpdate` callback in `AgoraChatGroupManagerDelegate`, which occurs when the state specification updates.
- Adds a `bindDeviceToken` method in `AgoraChatPushManager`, which binds the device token.

#### Improvements

- Improved thread-related methods and classes. Compared with earlier releases, this release used `AgoraChatThread` to replace `AgoraChatThreadInfo`.
- Assigned a value to `aGroupName` in the `groupInvitationDidReceive` callback.
- Upgraded the network link library.
- Supported sending messages with a remote address as the attachment.

#### Issues fixed

- The retrieved reaction object was empty.

## v1.0.4

v1.0.4 was released on May 15, 2022.

#### New features

- Supports reaction, which enables users to add reaction emojis to the specified message.
- Supports content moderation with the reportMessage method.
- Supports message push configuration, which enables users to configure various push settings.

#### Improvements

- Enhanced DNS configuration for retrieving the server access point.
- Improved data reports.
- Changed openssl to boringssl.

## v1.0.3.1

v1.0.3.1 was released on April 27, 2022. This release fixed the occasional issue of not being to display the retrieved historical messages.

## v1.0.3

v1.0.3 was released on April 19th, 2022.

#### New features

- Supports the presence feature, which indicates the online status of the user.
- Supports translation. You can implement translation on the recipient's client, or auto-translation on the sender's client.

#### Improvements

- Shortened the time out for sending messages.
- Enhanced the request success rate.

## v1.0.2

v1.0.2 was released on Feb 23, 2022.

#### New features

- Supports deleting conversations on the server.
- Supports synchronization of do-not-disturb events when the user ID is logged in to multiple devices.
- Supports customizing messages using extension fields, badges, CMD messages for message push.
- Supports sending and receiving image files in PNG.
- Adds an error code 221 `EMErrorUserNotOnRoster` which is reported when the user sends a message to another user that is not a contact.

#### Improvements

- Reduced the time for preparing to send messages under poor network conditions.
- Supports calling Objective-C methods in Swift projects.

#### Issues fixed

- The message re-sending was interrupted by the connection success event.
- Memory leak.
- Crashes caused by incorrect time calculation.

## v1.0.1.1

v1.0.1.1 was released on December 30, 2021.

This release fixed an issue where the database failed to load under extreme conditions.

## v1.0.1

v1.0.1 was released on December 27, 2021.

#### New features

v1.0.1 adds the following features:

- Supports setting the building name when creating a location message.
- Supports deleting local messages before a specific time.
- Supports getting the count of messages in one conversation.

#### Fixed issues

This release fixed the following issues:

- Some crash issues occurred.
- An issue occurred in the database encryption.
- After a user deleted and reinstalled the chat app, the automatic login was still enabled.

#### API changes

v1.0.1 adds the following APIs:

- `createLocationSendMessage` [1/2]
- `deleteMessagesBeforeTimestamp`
- `getAllMsgCount`

## v1.0.0

v1.0.0 was released on December 6, 2021.

:::warning
This release has an issue that the database occasionally fails to load. Agora recommends you upgrade to the latest version as soon as possible.
:::

#### New features

This release supports getting the users' login status through the `isLoggedIn` and `isLoggedInBefore` methods.

#### Improvements

This release makes the following improvements:

- Optimizes the logic of renewing push tokens, reducing server request times.
- Improves the login speed.
- Uses only HTTPS for REST operations by default.
- Optimizes the logic of token expiration.
- No longer checks whether the user is a member of the group upon receiving a group message.

#### Fixed issues

This release fixed the following issues:

- Crashes occurred in certain use-cases.
- The callbacks for token expirations were not triggered accurately.

### Web

## v1.3.1

v1.3.1 was released on December 20, 2024.

#### Improvements

- Added support for pinning messages in one-to-one conversations. Users can call `pinMessage` or `unpinMessage` to pin or unpin a one-to-one chat message.
- Added the `ConnectionParameters#isFixedDeviceId` parameter (`true` by default) to specify whether to use a fixed device ID. Specifically, the SDK generates a device ID for a browser and saves it to the local storage. Then in the browser, all SDK instances use the same device. The setting of this parameter affects the strategy of forced logout in multi-device login use-cases. For details, see [Log in from multiple devices](/en/realtime-media/im/build/moderate-and-manage-client-behavior/multiple-device-login). In previous versions, a random device ID was used for connections of each SDK instance. In this case, each SDK instance uses a different device for connections.
- Added the callback for DNS request failures.
- Added the reason for requesting to join the group to the `requestToJoin` event that is received by the group owner and administrators that approved the join request.

## v1.3.0

v1.3.0 was released on December 11, 2024.

#### New features

- Added the `deleteAllMessagesAndConversations` method to uni-directionally clear all conversations and messages in them on the server.
- Added the function of tagging a conversation:
  - `addConversationMark`: Tags a conversation.
  - `removeConversationMark`: Untags a conversation.
  - `getServerConversationsByFilter`: Gets the conversations from the server by conversation tag.
  - `onMultiDeviceEvent#markConversation/unMarkConversation`: Conversation tag update event in a multi-device login use-case. If a user adds or removes a conversation tag on one device, this event is received on other devices of the user.
- Added the `broadcast` field to the message object to indicate whether the message is a broadcast message sent via a RESTful API to all chat rooms under an app.
- Added the `deliverOnlineOnly` field during message creation to set whether the message is delivered only when the recipient(s) is/are online. If this field is set to `true`, the message is discarded when the recipient is offline.
- Added support for retrieval of historical messages of chat rooms from the server.
- Added the `useReplacedMessageContents` parameter to determine whether the server returns the adjusted text message to the sender if the message content is replaced during text moderation.
- Added the function of pinning a message:
  - `pinMessage`: Pins a message.
  - `unpinMessage`: Unpins a message.
  - `getServerPinnedMessages`: Gets the list of pinned messages in a conversation from the server.
  - `onMessagePinEvent`: Occurs when the message pinning status changes. When a message is pinned or unpinned in a group or chat room, all members in the group or chat room receive this event.
- Added the `LocalCache` module for local conversation data management:
  - `getLocalConversations`: Gets the local conversation list.
  - `getLocalConversation`: Gets a local conversation.
  - `setLocalConversationCustomField`: Sets a custom field for a local conversation.
  - `clearConversationUnreadCount`：Resets the number of unread messages in a conversation to zero.
  - `removeLocalConversation`: Deletes a local conversation.
  - `getServerConversations`: Synchronizes the conversation list from the server to the local database.
- Added the `applicant` parameter to the `joinPublicGroupDeclined` event to indicate the user that applies to join the group.
- Added the `message` field to the parameter type `SendMsgResult` in the message sending success callback to return the message object that is successfully sent.
- Added the `onMessage` event which returns the following types of received messages to the recipient in bulk: text, image, video, voice, location, and file messages and combined messages.
- Added the thumbnail for a video message by using the first video frame as the video thumbnail whose URL can be accessed via the `videoMessage.thumb` field.
- Added the `memberCount` field to the events that occur when a member joins or exits a group or chat room.
- Added the `getSelfIdsOnOtherPlatform` method to get the list of login IDs of other login devices of the current user so that the user can send messages to a specific device.
- Added the support for returning the modified custom message via the `onModifiedMessage` event if the message is modified via a RESTful API.
- Added two login token expiration events:
  - `onTokenExpired`: Occurs when the token expires.
  - `onTokenWillExpire`: Occurs half of the token validity period is passed.

#### Improvements

- Fine tuned the error message for token-based login for the sake of accuracy.
- Formatted the `customExts` field in the latest custom message of conversations in the conversation list.
- Added support for uploading the attachment in fragments when sending an attachment message.
- Marked the `agoraToken` parameter in the `open` login method deprecated. Use the `accessToken` parameter instead.

#### Issues fixed

- Some types in the SDK are incorrect.

## v1.2.0

v1.2.0 was released on December 6, 2023.

#### New features

- Added the function of forwarding multiple messages:
  - `downloadAndParseCombineMessage`: Downloads and parses a combined message.
  - `CreateCombineMsgParameters`: The properties of creating a combined message.
  - `CombineMsgBody`: The combined message body type.
- Added the function of modifying sent messages:
  - `modifyMessage`: Modifies a sent text message.
  - `onModifiedMessage`: Occurs when a sent message is modified. The message recipient receives this event.
- Added the function of pinning a conversation:
  - `pinConversation`: Pins a conversation.
  - `getServerPinnedConversations`: Retrieves the pinned conversations from the server.
- Added the `getServerConversations` method to retrieve the conversation list from the server. Marked `getConversationlist` deprecated.
- Added the `searchOptions` parameter object to the `getHistoryMessages` method for pulling historical messages from the server.
- Added the function of managing custom attributes of group members:
  - `setGroupMemberAttributes`: Sets custom attributes of a group member.
  - `getGroupMemberAttributes`: Retrieves custom attributes of group members.
  - `GroupEvent#memberAttributesUpdate`: Occurs when a custom attribute is changed for a group member.
- Added the `MultiDeviceEvent#RoamingDeleteMultiDeviceInfo` event that occurs when historical messages in a conversation are deleted from the server on one device. This event is received by other devices.
- Added the `thumbnailHeight` and `thumbnailWidth` parameters to the `CreateImgMsgParameters` interface to allow you to send the image thumbnail size when sending an image message.
- Added the `isLast` field to the returned content of the `getHistoryMessages` method to indicates whether the returned data is on the last page.

#### Improvements

- The `addContact`, `acceptInvitation`, `declineInvitation`, `addToBlackList`, and `removeFromBlackList` methods support the Promise syntax.

#### Issues fixed

- A user, when pulling historical messages, sends a reception receipt to the server.

## v1.1.0

v1.1.0 was released on April 28, 2023.

#### New features

- Adds the function of managing custom chat room attributes to implement functions like seat control and synchronization in voice chat rooms. See [Manage chat room attributes](/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes).
- Adds the `priority` attribute to the message creation method `create` to implement the chat room message priority function. This ensures that high-priority messages are dealt with first. See [Set message priority](/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages#set-message-priority).
- Adds the pagination parameters `pageNum` and `pageSize` in the `getConversationlist` method to allow users to get the conversation list from the server with pagination. See [Retrieve a list of conversations from the server](/en/realtime-media/im/build/build-core-messaging/messages/retrieve-messages#retrieve-a-list-of-conversations-from-the-server).
- Adds the group creation event `create`, which occurs on other devices of the group owner after group creation.
- Adds an additional option to delete messages on the server side. See [Delete conversations and historical messages](/en/realtime-media/im/build/build-core-messaging/messages/manage-messages#delete-conversations-and-historical-messages).

#### Improvements

Reduces the size of MiniCore.

#### Issues fixed

Type-related issues in TypeScript code.

## v1.0.8

v1.0.8 was released on December 19, 2022.

#### Improvements

Optimized the callback for a message sending failure, to make sure that it is triggered
immediately when the network is disconnected.

#### Issues fixed

The `file_length` parameter in the `create` method did not work when this method was called
to create an attachment message.

## v1.0.7

v1.0.7 was released on November 22, 2022.

#### Improvements

- Split the SDK into several modules.
- Added in-line comments.
- Optimized the reconnection logic.

#### Issues fixed

- A compatibility issue with Internet Explorer.
- A lack of the longest validity period of a token.

## v1.0.6

v1.0.6 was released on August 26, 2022.

#### New Features

- Adds disaster recovery policies.
- Adds `resourceId` to the group and chat room APIs to deliver event notifications to multiple devices of one user.
- Adds the `needAffiliations` and `needRole` parameters to the `getJoinedGroups` method to return the number of group members and their roles.

#### Improvements

- Optimized communication protocols to reduce the data volume.
- Added inline documents.

#### Issues fixed

Some type definition errors.

## v1.0.5

v1.0.5 was released on Jul 22, 2022.

#### New features

- Adds the `onGroupEvent` and `onChatroomEvent` callback events.
- Adds the error code `MESSAGE_CURRENT_LIMITING`, which means that the chat group message has exceeded the concurrent limit.

#### Improvements

- Supported retrieving the information of multiple chat groups using `getGroupInfo`.

## v1.0.3

v1.0.3 was released on May 16, 2022.

#### New Features

- Supports reaction, which enables users to add reaction emojis to the specified message.
- Supports content moderation with the reportMessage method.
- Supports message push configuration, which enables users to configure various push settings.
- Supports data report.

#### Improvements

- Supports retrieving chat groups by pagination.
- Supports setting the number of chat group members when creating a chat group.
- Adds thumbnail URL to the received image messages.

#### Issues fixed

When the user switched the user ID, cache remains in the group message.

## v1.0.2

v1.0.2 was released on April 19, 2022.

#### New features

- Supports the presence feature, which indicates the online status of the user.
- Supports translation. You can implement translation on the recipient's client, or auto-translation on the sender's client.

#### Improvements

- The Uni_SDK cannot run on the browser.
- The user cannot modify the group description when creating a chat group.
- The compatibility of SSR.

## v1.0.1.1

v1.0.1.1 was released on January 19, 2022.

#### New features

This release adds the following features:

- Supports downloading group shared files using the `downloadGroupSharedFile` method.
- Supports retrieving group shared files by pagination using the `fecthGroupSharedFileList` method.

## v1.0.1

v1.0.1 was released on January 14, 2022.

#### New features

This release supports deleting the conversation thread using the `deleteSession` method.

#### Improvements

The release made the following improvements:

- Added a `buildingNumber` parameter in the location message.
- Added `error: type 221` for sending a message to a user that is not a contact.
- Added `error: type 219` for failing to send a message because all the users are muted.

#### Issues fixed

This release fixe the issue that the `onChanelMessage` callback was not triggered and other known issues.

## v1.0.0

v1.0.0 was released on December 10, 2021.

#### Improvements

This release made the following improvements:

- Added some error codes.
- Renamed some functions and updated the API annotations.

#### Fixed issues

This release fixed the following issues:
- The delivery acknowledgement was not received.
- The group announcement could not be set as null.
- An error was reported when muting a specified user during chat.

### Flutter

## v1.3.3

Released on July 10, 2025.

#### New features

- Added the `ChatRoomManager#joinChatRoom(String, bool, String)` method to allow a user to pass extension information and specify whether to quit all other chat rooms when the user joins a chat room.

#### Issues fixed

- Incorrect return result format of `GroupManager.fetchMemberAttributes` on the Android platform.

## v1.3.2

Released on May 2, 2025.

#### New features

- Added the `ChatGroupManager.isMemberInGroupMuteList` method to check whether the current user is in the group mute list.

    ```dart
    bool inMuteList = await ChatClient.getInstance.chatRoomManager.isMemberInChatRoomMuteList(roomId);
    ```

- Added the `ChatRoomManager.isMemberInChatRoomMuteList` method to check whether the current user is in the chat room mute list.

    ```dart
    bool inMuteList = await ChatClient.getInstance.groupManager.isMemberInGroupMuteList(groupId);
    ```

#### Issues fixed

- Build issue for Android platform on Flutter 3.29.0.

## v1.3.1

Released on December 20, 2024.

#### Improvements

- Added support for pinning messages in one-to-one conversations. Users can call `ChatManager#pinMessage` or `ChatManager#unpinMessage` to pin or unpin a one-to-one chat message.
- Optimized the connections to the server under weak network conditions for native platforms.

#### Issues fixed

The following issues are fixed on native platforms:

- An attachment message can still be sent successfully in spite of failure to send the attachment under special circumstances.
- An incorrect `nextkey` is returned when pulling roaming messages.
- The cache is not updated upon the addition of contacts to the block list.
- The official push feature may not work after users log out and log in again.

## v1.3.0

Released on December 11, 2024.

#### New features

- Added the `ChatManager#deleteAllMessageAndConversation` method to uni-directionally clear all conversations and messages in them. You can also choose whether to clear the chat history on the server.
- Added the function of searching for messages by search scope in `MessageSearchScope` during keyword-based search.
  - `MessageSearchScope`: Includes three message search scopes: message content, message extension information, and both.
  - `ChatManager#loadMessagesWithKeyword`: Searches for messages in all conversations by search scope.
  - `conversation#loadMessagesWithKeyword`: Searches for messages in a single conversation by search scope.
- Added the function of tagging a conversation:
  - `ConversationFetchOptions`: Includes options for filtering conversations retrieved from the server. You can only retrieve pinned conversations or tagged conversations by setting the options.
  - `ChatManager#addRemoteAndLocalConversationsMark`: Tags a conversation.
  - `ChatManager#deleteRemoteAndLocalConversationsMark`: Untags a conversation.
  - `ChatManager#fetchConversationsByOptions`: Gets conversations from the server by setting `ConversationFetchOptions`.
  - `Conversation#marks`: Gets all tags of a local conversation.
  - `ChatMultiDevicesEvent#CONVERSATION_UPDATE_MARK`: Conversation tag update event in a multi-device login use-case. If a user adds or removes a conversation tag on one device, this event is received on other devices of the user.
- Added the `ChatMessage#isBroadcast` property to indicate whether the message is a broadcast message sent via a RESTful API to all chat rooms under an app.
- Added the `ChatMessage#deliverOnlineOnly` property to set whether the message is delivered only when the recipient(s) is/are online. If this property is set to `true`, the message is discarded when the recipient is offline.
- Added the `GroupManager#fetchJoinedGroupCount` method to allow the current user to retrieve the total number of groups they joined.
- Added a 706 `CHATROOM_OWNER_NOT_ALLOW_LEAVE` error code returned when the chat room owner leaves the chat room. If `ChatOptions#isChatRoomOwnerLeaveAllowed` is set to `false` during SDK initialization, the chat room owner is not allowed to leave the chat room. In this case, error 706 is reported if the chat room owner calls the `leaveChatRoom`.
- Added support for retrieval of historical messages of chat rooms from the server.
- Added the `ChatOptions#useReplacedMessageContents` property to determine whether the server returns the adjusted text message to the sender if the message content is replaced during text moderation.
- Added the function of pinning a message:
  - `ChatManager#pinMessage`: Pins a message.
  - `ChatManager#unpinMessage`: Unpins a message.
  - `ChatManager#fetchPinnedMessages`: Gets the list of pinned messages in a conversation from the server.
  - `Conversation#loadPinnedMessages`: Gets the list of pinned messages in a local conversation.
  - `MessagePinInfo`: Includes the operator that pins or unpins the message and the operation time.
  - `ChatMessage#pinInfo`: Includes the message pinning information.
  - `ChatEventHandler#onMessagePinChanged`: Occurs when the message pinning status changes. When a message is pinned or unpinned in a group or chat room, all members in the group or chat room receive this event.
- Added the `ChatOptions#enableEmptyConversation` property to set whether to include empty conversations in the retrieved list of local conversations. This property is set during SDK initialization.
- Added the `applicant` and `decliner` parameters to the `ChatGroupEventHandler#onRequestToJoinDeclinedFromGroup` event to respectively indicate the user that applies to join the group and the user that declines the join request.
- Added the `ChatOptions#messagesReceiveCallbackIncludeSend` property to set whether to return the successfully sent message in the `ChatEventHandler#onMessagesReceived` event.
- Added the support for returning the modified custom message via the `ChatEventHandler#onMessageContentChanged` event if the message is modified via the RESTful API.

#### Improvements

- Marked `ChatManager#fetchConversation` and `ChatManager#fetchPinnedConversations` deprecated. Use `ChatManager#fetchConversationsByOptions` instead.
- Added support for forwarding single attachment messages by passing in the message body and extension fields, without reuploading the attachment.
- Reduced the number of times group specifications are retrieved when a large number of group member events are received during certain use-cases.
- Delivered a more accurate chat room member count by optimizing the way to update the member count when members join or leave the chat room.
- Shortened the time used to call the `ChatManager#markAllConversationsAsRead` method by marking all conversations read more efficiently.
- Optimized the way the SDK randomly gets server addresses to increase the success rate of requests.
- Adjusted the timeout period for joining or leaving chat rooms.
- Optimized the way the connection is re-established upon a connection failure in certain use-cases.
- Added support for uploading an attachment in fragments when sending an attachment message.
- Marked the `ChatClient#loginWithAgoraToken` method deprecated. Use the `ChatClient#loginWithToken` method instead.
- Fine tuned the error message for token-based login for accuracy.
- Optimized the way messages are re-sent.
- Removed the internal `NetworkOnMainThreadException` exception catching during a network request.
- Optimized the database upgrade logic.
- Increased the maximum allowed size of a log file from 2 MB to 5 MB.
- Added the iOS privacy protocol `PrivacyInfo.xcprivacy`.

#### Issues fixed

- For a modified message, the `from` property is missing from the body of the message pulled from the server by an offline user that gets online.
- In special use-cases, chat room events are missing when users exit the SDK before logging into it.
- The SDK reconnects to the server twice after the network is back to normal.
- An incorrect error message is returned for an logged-out user that calls `leaveChatRoom`.
- Members in a group are counted twice in certain use-cases.
- The data reporting module crashes occasionally.
- The SDK is instantiated repeatedly when the `ChatManager#updateMessage` method is called frequently for SDK initialization in multi-thread use-cases.

## v1.2.0

Released on December 6, 2023.

#### New features

- Added the function of forwarding multiple messages:
  - `ChatManager#fetchCombineMessageDetail`：Retrieves the list of original messages included in a combined message from the server.
  - `MessageType.COMBINE`: The combined message type.
  - `CombineMessageBody`: The combined message body class.
- Added the function of modifying sent messages:
  - `ChatManager#modifyMessage`: Modifies a sent text message.
  - `ChatEventHandler#onMessageContentChanged`: Occurs when a sent message is modified. The message recipient receives this callback.
- Added the function of pinning a conversation:
  - `ChatManager#pinConversation`: Pins or unpins a conversation.
  - `ChatManager#fetchPinnedConversations`: Retrieves the list of pinned conversations from the server.
- Added the `fetchConversation` method to retrieve the conversation list from the server. Marked the `ChatManager#getConversationsFromServer` method deprecated.
- Added `FetchMessageOptions` as the parameter configuration class for retrieving historical messages from the server.
- Added the `ChatManager#fetchHistoryMessagesByOption` method to retrieve historical messages of a conversation from the server according to `FetchMessageOptions`, the parameter configuration class for retrieving historical messages.
- Added the `direction` parameter to `ChatManager#fetchHistoryMessages` to allow you to retrieve historical messages from the server according to the message search direction.
- Added the `ChatConversation#deleteMessagesWithTs` method to delete messages sent or received in a certain period from the local database.
- Added the function of managing custom attributes of group members:
  - `ChatGroupManager#setMemberAttributes`: Sets custom attributes of a group member.
  - `ChatGroupManager#fetchMemberAttributes` and `GroupManager#fetchMembersAttributes`: Retrieves custom attributes of group members.
  - `ChatGroupEventHandler#onAttributesChangedOfGroupMember`: Occurs when a custom attribute is changed for a group member.
- Added the `reason` parameter to `ChatRoomEventHandler#onRemovedFromChatRoom` so that the member removed from the chat room knows the removal reason.
- Added the `ChatConnectionEventHandler#onAppActiveNumberReachLimit` callback that occurs when the number of daily active users (DAU) or monthly active users (MAU) for the app has reached the upper limit.
- Added the `IMultiDeviceDelegate#OnRoamDeleteMultiDevicesEvent` callback that occurs when historical messages in a conversation are deleted from the server on one device. This event is received by other devices.
- Added the support for user tokens in the following methods:
  - `ChatClient#fetchLoggedInDevices`: Retrieves the list of online login devices of a user.
  - `ChatClient#kickDevice`: Kicks a user out of the app on a device.
  - `ChatClient#kickAllDevices`: Kicks a user out of the app on all devices.
- Added the `ChatMultiDeviceEventHandler#onRemoteMessagesRemoved` callback that occurs when historical messages in a conversation are deleted from the server on one device. This event is received by other devices.
- Added the  `List reactions` attribute in `ChatMessageReactionEvent`:
  - `ReactionOperation#userId`: The user ID of the operator.
  - `ReactionOperation#reaction`: The changed Reaction.
  - `ReactionOperation#operate`: The operation.
- Added the `ChatRoomEventHandler#onSpecificationChanged` callback that occurs when details of a chat room are changed.

#### Improvements

- Optimized the `ChatManager#searchMsgFromDB` method to include custom messages in the message retrieval result.
- Adapted to the Android 14 system.

#### Issues fixed

- `ConnectionEventHandler#onConnected` and `ConnectionEventHandler#onDisconnected` cannot be received on the iOS system.
- Message extension attributes of the string type in the Android system turn into the Int type.
- Upon a hot reload on Android, the callback is triggered repeatedly.
- When you retrieve custom chat room attributes, passing `null` to the key of an attribute causes the app to crash.
- Chat room events cannot be received by a user that logs in to the Agora Chat server again after logout on the Android platform.
- `ChatManager#getThreadConversation` JSON error.
- `ChatMessage#chatThread` error.
- The `ChatRoomEventHandler#onSpecificationChanged` is not triggered when the chat room announcement changes.
- The Android platform crashes when a user is removed from a thread.
- An error occurs when `ChatThreadManager#fetchChatThreadMembers` is called.

## v1.1.1

Released on June 21, 2023.

#### Issues fixed

Unexpected execution of callback methods due to multiple initializations of an Android environment.

## v1.1.0

Released on April 28, 2023.

#### New features

- Upgrades the iOS and Android native platforms that the Flutter platform depends on to v1.1.0.
- Adds the function of managing custom chat room attributes to implement functions like seat control and synchronization in voice chat rooms. See [Manage chat room attributes](/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes).
- Adds the `ChatManager#fetchConversationListFromServer` method to allow users to get the conversation list from the server with pagination. See [Retrieve a list of conversations from the server](/en/realtime-media/im/build/build-core-messaging/messages/retrieve-messages#retrieve-a-list-of-conversations-from-the-server).
- Adds the `ChatMessage#chatroomMessagePriority` attribute to implement the chat room message priority function to ensure that high-priority messages are dealt with first. See [Set message priority](/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages#set-message-priority).
- Adds the support for push notifications on the server side to allow you to send push notifications to all users, individual users specified by IDs, or groups of users by labels. For how to configure and send push notifications, see [Push notification management](/en/api-reference/api-ref/im/push-notification-management).
- Adds an additional option to delete messages on the server side. See [Delete conversations and historical messages](/en/realtime-media/im/build/build-core-messaging/messages/manage-messages#delete-conversations-and-historical-messages).

#### Improvements

Changes the message sending result callback from `ChatMessage#setMessageStatusCallBack` to `ChatManager#addMessageEvent`.

#### Issues fixed

`ChatManager#deleteMessagesBeforeTimestamp` execution failures.

## v1.0.9

Released on December 19, 2022.

#### Issues fixed

- Some alerts on Android 12.
- The inconsistency of messages in the memory and the database due to a call to the
`updateMessage` method in rare use-cases.
- The `EMGroupEventHandler#onDestroyedFromGroup` callback that occurs when a group is
destroyed did not work on the Android platform.
- The `EMGroupEventHandler#onAutoAcceptInvitationFromGroup` callback that occurs when a
user's group invitation is accepted automatically did not work on the Android platform.
- Crashes in rare use-cases.

## v1.0.8

Released on November 22, 2022.

#### Improvements

Removed redundant SDK logs.

#### Issues fixed

- Failures in getting a large number of messages from the server in a few use-cases.
- The issue with incorrect data statistics.
- Crashes caused by log printing in rare use-cases.

## v1.0.7

Released on September 7, 2022.

#### New features

- Adds the `customEventHandler` attribute in `ChatClient` to allow you to set custom listeners to receive the data sent from the Android or iOS device to Flutter.
- Adds event listener classes for event listening.
- Adds the `PushTemplate` method in `PushManager` to support custom push templates.
- Adds the `isDisabled`  attribute in `Group` to indicate whether a group is disabled. This attribute needs to be set by developers at the server side. This attribute is returned when you call the `fetchGroupInfoFromServer` method to get group details.
- Adds the `displayName` attribute in `PushConfigs` to allow you to check the nickname displayed in your push notifications.

#### Improvements
- Marked `AddXXXManagerListener` methods (such as `addChatManagerListener`  and `addContactManagerListener`) as deprecated.
- Enhanced API reference documentation.

## v1.0.6

Released on July 21.

#### Issues fixed

- The callbacks for messaging thread were not triggered on iOS.
- The callbacks for reaction were not triggered in iOS.
- Occasional crashes occurred on Android when retrieving conversations from the server.

## v1.0.5

Released on June 17.

This is the first release for the Chat Flutter SDK, which enables you to add real-time chatting functionalities to an Android or iOS app. Major features include the following:

- Sending and receiving messages in one-to-one chats, chat groups, and chat rooms.
- Retrieving and managing conversations and messages.
- Managing chat groups and chat rooms.
- Managing contact and blocklists.

For the complete feature list, see [Product Overview](../index).

Chat is charged on a MAU (Monthly Active Users) basis. For details, see [Pricing for Chat](./pricing) and [Pricing Plan Details](./pricing-plan-details).

Refer to the following documentations to enable Chat and use the Chat SDK to implement real-time chatting functionalities in your app:

- [Enable and Configure Chat](../get-started/enable)
- [Chat SDK quickstart](../get-started-sdk)
- [Messages](/en/realtime-media/im/build/build-core-messaging/messages/message-overview)
- [Chat Group](/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/group-overview)
- [Chat Room](/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/chatroom-overview)
- [RESTful API overview](/en/api-reference/api-ref/im)

### React Native

## v1.3.6

Released on May 7, 2026.

#### Improvements

This release includes the following enhancements:

- Enhanced security by adding access checks for message attachments. For example, if you receive an image message in a group and forward it to others outside the group, they cannot download the image.

## v1.3.5

Released on November 24, 2025.

#### New features

- Added a function to enable chat room members to check if they are on the mute list of a chat room.
- Added support for 16 KB page size for compatibility with Android 15 or higher.

#### Issues fixed

- Fixed bugs related to the chatroom mute list.

## v1.3.4

Released on June 05, 2025.

#### Issues fixed

- The app occasionally crashed when handling recall notifications on the iOS platform.

## v1.3.2

Released on February 11, 2025.

#### Issues fixed

- Compilation error on the Android platform when using React Native 0.76.

## v1.3.1

Released on December 20, 2024.

#### Improvements

- Added support for pinning messages in one-to-one conversations. Users can call `ChatManager#pinMessage` or `ChatManager#unpinMessage` to pin or unpin a one-to-one chat message.
- Optimized the connections to the server under weak network conditions for native platforms.

#### Issues fixed

1. The following issues are fixed on native platforms:

- An attachment message can still be sent successfully in spite of failure to send the attachment under special circumstances.
- An incorrect `nextkey` is returned when pulling roaming messages.
- The cache is not updated upon the addition of contacts to the block list.
- The official push feature may not work after users log out and log in again.

1. The following issues are fixed for the React Native Chat SDK：

- The error that `CMakeLists.txt` could not be found is reported during compilation on the Android platform.
- The data conversion issue on the Android platform.

## v1.3.0

Released on December 11, 2024.

#### New features

- Added the `ChatManager#deleteAllMessageAndConversation` method to uni-directionally clear all conversations and messages in them. You can also choose whether to clear the chat history on the server.
- Added the function of searching for messages by search scope in `ChatMessageSearchScope` during keyword-based search.
  - `ChatMessageSearchScope`: Includes three message search scopes: message content, message extension information, and both.
  - `ChatManager#getMsgsWithKeyword`: Searches for messages in all conversations by search scope.
  - `ChatManager#getConvMsgsWithKeyword`: Searches for messages in a conversation by search scope.
- Added the function of tagging a conversation:
  - `ChatConversationFetchOptions`: Includes options for filtering conversations retrieved from the server. You can only retrieve pinned conversations or tagged conversations by setting the options.
  - `ChatManager#addRemoteAndLocalConversationsMark`: Tags a conversation.
  - `ChatManager#deleteRemoteAndLocalConversationsMark`: Untags a conversation.
  - `ChatManager#fetchConversationsByOptions`: Gets conversations from the server by conversation tag by setting `ChatConversationFetchOptions`.
  - `ChatConversation#marks`: Gets all tags of a local conversation.
  - `ChatMultiDevicesEvent#CONVERSATION_UPDATE_MARK`: Conversation tag update event in a multi-device login use-case. If a user adds or removes a conversation tag on one device, this event is received on other devices of the user.
- Added the `ChatMessage#isBroadcast` property to indicate whether the message is a broadcast message sent via a RESTful API to all chat rooms under an app.
- Added `ChatMessage#deliverOnlineOnly` property to set whether the message is delivered only when the recipient(s) is/are online. If this property is set to `true`, the message is discarded when the recipient is offline.
- Added the `ChatGroupManager#fetchJoinedGroupCount` method to allow the current user to retrieve the total number of joined groups.
- Added a 706 error code that occurs when the chat room owner leaves the chat room. `ChatOptions#isChatRoomOwnerLeaveAllowed` is set to `false` during SDK initialization, the chat room owner is not allowed to leave the chat room. In this case, error 706 is reported if the chat room owner calls `leaveChatRoom`.
- Added the support for retrieval of historical messages of chat rooms from the server.
- Added the `ChatOptions#useReplacedMessageContents` property to determine whether the server returns the adjusted text message to the sender if the message content is replaced during text moderation.
- Added the function of pinning a message:
  - `ChatManager#pinMessage`: Pins a message.
  - `ChatManager#unpinMessage`: Unpins a message.
  - `ChatManager#fetchPinnedMessages`: Gets the list of pinned messages in a conversation from the server.
  - `ChatConversation#getPinnedMessages`: Gets the list of pinned messages in a local conversation.
  - `ChatMessagePinInfo`: Includes the operator that pins or unpins the message and the operation time.
  - `ChatMessage#pinInfo`: Includes the message pinning information.
  - `ChatMessageEventListener#onMessagePinChanged`: Occurs when the message pinning status changes. When a message is pinned or unpinned in a group or chat room, all members in the group or chat room receive this event.
- Added the `ChatOptions#enableEmptyConversation` property to set whether to include empty conversations in the retrieved list of local conversations. This property is set during SDK initialization.
- Added the `applicant` and `decliner` parameters to the `ChatGroupEventListener#onRequestToJoinDeclined` event to respectively indicate the user that applies to join the group and the user that declines the join request.
- Added the `ChatOptions#messagesReceiveCallbackIncludeSend` property to set whether to return the successfully sent message in the `ChatMessageEventListener#onMessagesReceived` event.
- Added the support for returning the modified custom message via the `ChatMessageEventListener#onMessageContentChanged` event if the message is modified via the RESTful API.

#### Improvements

- Added support for forwarding single attachment messages by passing in the message body and extension fields, without reuploading the attachment.
- Reduced the number of times group specifications are retrieved when a large number of group member events are received during certain use-cases.
- Delivered a more accurate chat room member count by optimizing the way to update it when members join or leave the chat room.
- Shortened the time used to call the `ChatManager#markAllConversationsAsRead` method by marking all conversations read more efficiently.
- Optimized the way the SDK randomly gets server addresses to increase the success rate of requests.
- Adjusted the timeout period for joining or leaving chat rooms.
- Optimized the way the connection is re-established upon a connection failure in certain use-cases.
- Added support for uploading an attachment in fragments when sending an attachment message.
- Marked the `ChatClient#loginWithAgoraToken` and  `ChatClient#login` methods deprecated. Use the `loginWithToken` method instead.
- Fine tuned the error message for token-based login for accuracy.
- Optimized the way messages are re-sent.
- Removed the internal `NetworkOnMainThreadException` exception catching during a network request.
- Optimized the database upgrade logic.
- Increased the maximum allowed size of a log file from 2 MB to 5 MB.
- Added the iOS privacy protocol `PrivacyInfo.xcprivacy`.
- Removed the `secret` parameter from the object of the created message. This parameter is generated by the server and can be obtained after the message is successfully sent.
- Marked the following methods deprecated:
  - `getMessagesWithKeyword`: Replaced by `getMsgsWithKeyword`.
  - `getMessages`: Replaced by `getMsgs`.
  - `getMessageWithTimestamp`: Replaced by `getMsgWithTimestamp`.
  - `getMessagesWithMsgType`: Replaced by `getConvMsgsWithMsgType`.
  - `searchMsgFromDB`: Replaced by `getMsgsWithMsgType`.

#### Issues fixed

- For a modified message, the `from` property is missing from the body of the message pulled from the server by an offline user that gets online.
- In special use-cases, chat room events are missing when users exit the SDK before logging into it.
- The SDK reconnects to the server twice after the network is back to normal.
- An incorrect error message is returned for a logged-out user that calls the `leaveChatRoom` method.
- Members in a group are counted twice in certain use-cases.
- The data reporting module crashes occasionally.
- The app crashes when the `ChatManager#updateMessage` method is called in certain use-cases.

## v1.2.1

Released on February 2, 2024.

#### Improvements

- Updated native Android dependencies to support Android 14 (API34).

## v1.2.0

Released on December 6, 2023.

#### New features

- Upgraded React-Native from 0.66.5 to 0.71.11.
- Added the function of forwarding multiple messages:
  - `ChatMessage.createCombineMessage`: Creates a combined message.
  - `ChatManager.fetchCombineMessageDetail`: Retrieves the original messages included in the combined message.
- Added the function of modifying sent messages.
  - `ChatManager.modifyMessageBody`: Modifies a sent text message.
  - `ChatEvents.ChatMessageEventListener.onMessageContentChanged`: Occurs when a sent message is modified. The message recipient receives this callback.
- Added the `ChatManager.fetchConversationsFromServerWithCursor` method to retrieve the conversation list from the server with pagination.
- Added the function of pinning a conversation:
  - `ChatManager.pinConversation`: Pins a conversation.
  - `ChatManager.fetchPinnedConversationsFromServerWithCursor`: Retrieves a list of pinned conversations from the server.
- Marked the `ChatManager.fetchAllConversations` method deprecated.
- Added the `ChatManager.fetchHistoryMessagesByOptions` method to retrieve historical messages of a conversation from the server according to `ChatFetchMessageOptions`, the parameter configuration class for pulling historical messages.
- Added `ChatFetchMessageOptions` as the parameter configuration class for pulling historical messages from the server.
- Added the function of managing custom attributes of group members:
  - `ChatGroupManager.setMemberAttribute`: Sets custom attributes of a group member.
  - `ChatGroupManager.fetchMemberAttributes`: Retrieves custom attributes of a group member from the server.
  - `ChatGroupEventListener.onMemberAttributesChanged`: Occurs when a custom attribute is changed for a group member.
- Added the `ChatManager.deleteMessagesWithTimestamp` method to delete messages sent or received in a certain period from the local database.
- Added the `ChatOptions#enableEmptyConversation` option to determine whether to include empty conversations while loading conversations from the database.
- Added the `reason` parameter to `ChatRoomEventListener.onRemoved` so that the member removed from the chat room knows the removal reason.
- Added the `ChatPushManager.selectPushTemplate` method to allow the message recipient to receive offline message notifications according to the custom push template.
- Added the `ChatPushManager.fetchSelectedPushTemplate` method to retrieve the push template used for offline push notifications.
- Added the support for user tokens in the following methods:
  - `ChatClient#getLoggedInDevicesFromServer`: Retrieves the list of online login devices of a user.
  - `ChatClient#kickDevice`: Kicks a user out of the app on a device.
  - `ChatClient.kickAllDevices`: Kicks a user out of the app on all devices.
- Added the log callback API `ChatLog.handler`.
- Added the `List` attribute in `onMessageReactionDidChange`:
  - `MessageReactionOperation#getUserId`: The user ID of the operator.
  - `MessageReactionOperation#getReaction`: The changed Reaction.
  - `MessageReactionOperation#getOperation`: The operation.
- Added the following events:
  - `ChatEvents.ChatConnectEventListener.onAppActiveNumberReachLimit`: Occurs when the number of daily active users (DAU) or monthly active users (MAU) for the app has reached the upper limit.
  - `ChatEvents.ChatConnectEventListener.onUserDidRemoveFromServer`: Occurs when the user is removed.
  - `ChatEvents.ChatConnectEventListener.onUserDidForbidByServer`: Occurs when the user is blocked by the server.
  - `ChatEvents.ChatConnectEventListener.onUserDidLoginTooManyDevice`: Occurs when the user's number of login devices exceeds the maximum allowed.
  - `ChatEvents.ChatConnectEventListener.onUserKickedByOtherDevice`: Occurs when the user is kicked out of the app on the current device because the user has logged in to another device.
  - `ChatEvents.ChatConnectEventListener.onUserAuthenticationFailed`: Occurs when the authentication fails.
  - `ChatEvents.ChatMultiDeviceEventListener.onMessageRemoved`：Occurs when historical messages in a conversation are deleted from the server on one device. This event is received by other devices.
  - `ChatEvents.ChatMultiDeviceEvent.CONVERSATION_PINNED`: Occurs when a conversation is pinned on one device. This event is received by other devices.
  - `ChatEvents.ChatMultiDeviceEvent.CONVERSATION_UNPINNED`: Occurs when a conversation is unpinned on one device. This event is received by other devices.
  - `ChatEvents.ChatMultiDeviceEvent.CONVERSATION_DELETED`: Occurs when a conversation is deleted on one device. This event is received by other devices.

#### Improvements

- Optimized disconnection notifications by showing an independent notification when the server breaks the connection to the app. In this case, the users can check the disconnection reason.
- Optimized git commit specifications with commitlint to make sure that the committed code follows the specifications.
- Optimized git commit with Lefthook by using Gitleaks to detect sensitive information.
- Renamed `ChatManager.deleteAllMessages` to `deleteConversationAllMessages`.
- Renamed `ChatEvents.ChatRoomEventListener.onRemoved` to `onMemberRemoved`.
- Renamed `ChatEvents.ChatGroupEventListener.onUserRemoved` to `onMemberRemoved`.
- Renamed `ChatEvents.ChatRoomEventListener.onChatRoomDestroyed` to `onDestroyed`.
- Renamed `ChatEvents.ChatGroupEventListener.onGroupDestroyed` to `onDestroyed`.
- Deleted the `errorCode` parameter from `ChatEvents.ChatConnectEventListener.onDisconnected`.

#### Issues fixed

The app crashes when a Reaction is added for a message on Android.

## v1.1.3

Released on July 21, 2023.

#### Issues fixed

- On the Android platform, calling the `addReaction` method caused a crash.
- Updated the value of `homepage` in the `package.json` file to `https://www.npmjs.com/package/react-native-agora-chat`.
- Updated the value of `author` in the `package.json` file to `Asterisk  (https://github.com/asteriskzuo)`.

## v1.1.2

Released on June 30, 2023.

#### Issues fixed

- Optimized the video messaging function on the iOS platform. Messages using the `file://` local path protocol can now
  be sent successfully.
- Updated the definition of the `fetchHistoryMessages` method.
- No new token is returned when you call the `renewAgoraToken` method.
- Issues with sending video messages on the Android platform.

## v1.1.1

Released on April 28, 2023.

#### Issues fixed

Upon a call to the `ChatGroupManager#fetchJoinedGroupsFromServer` method, the returned extension field was empty for the joined public groups.

## v1.1.0

Released on April 28, 2023.

#### New features

- Upgrades the iOS and Android native platforms that the React Native platform depends on to v1.1.0.
- Adds the function of managing custom chat room attributes. See [Manage chat room attributes](/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes).
- Adds the `ChatManager#fetchConversationsFromServerWithPage` method to allow users to get the conversation list from the server with pagination. See [Retrieve a list of conversations from the server](/en/realtime-media/im/build/build-core-messaging/messages/retrieve-messages#retrieve-a-list-of-conversations-from-the-server).
- Adds the `ChatMessage#messagePriority` method to implement the chat room message priority function. See [Set message priority](/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages#set-message-priority).
- Adds the support for push notifications on the server side to allow you to send push notifications to all users, individual users specified by IDs, or groups of users by labels. For how to configure and send push notifications, see [Push notification management](/en/api-reference/api-ref/im/push-notification-management).
- Adds an additional option to delete messages on the server side. See [Delete conversations and historical messages](/en/realtime-media/im/build/build-core-messaging/messages/manage-messages#delete-conversations-and-historical-messages).

#### Improvements

- Removes the sensitive information from the test data.
- Renames the `inviterUser` method in the `ChatGroupManager` class to `inviteUser`.
- Renames `GROUP_ADD_USER_WHITE_LIST` in the enumeration type `ChatMultiDeviceEvent` to `GROUP_ADD_USER_ALLOW_LIST`.
- Renames `GROUP_REMOVE_USER_WHITE_LIST` in the enumeration type `ChatMultiDeviceEvent`  to `GROUP_REMOVE_USER_ALLOW_LIST`.

#### Issues fixed

- Some insecure code of native platforms.
- The issue of failing to retrieve conversations.
- The potential deadlock issue caused by a callback method that repeatedly enters the main thread for execution. This issue occurs only on the iOS platform.

## v1.0.11

Released on December 19, 2022.

#### Issues fixed

- Some alerts on Android 12.
- The inconsistency of messages in the memory and the database due to a call to the
`updateMessage` method in rare use-cases.
- Crashes in rare use-cases.

## v1.0.10

Released on November 22, 2022.

#### New features

Added two events to the `ChatGroupEventListener` class:

- `onDetailChanged`: When group details change.
- `onStateChanged`: When a group is enabled or disabled.

#### Issues fixed

- The overlimit issue during JSON conversion on the Android platform.
- Failures in getting a large number of messages from the server in few use-cases.
- The issue with incorrect data statistics.
- Crashes caused by log printing in rare use-cases.

## v1.0.7

Released on September 7, 2022.

#### Compatibility changes

The `unSubscribe` method is renamed `unsubscribe`.

#### New features

- Adds the `setConversationExtension` method to set the conversation extension information.
- Adds the `insertMessage` method to insert a message.
- Adds the `deleteMessagesBeforeTimestamp` method to delete messages before a specified timestamp.
- Adds the `getThreadConversation` method to get a specified thread conversation or create the thread conversation if the conversation does not exist.
- Adds the `isChatThread` attribute to `ChatConversation` to check whether a conversation is a thread conversation.
- Adds `ChatPushManager` for the push notification configuration.
- Adds `ChatPushConfig` for the Firebase Cloud Messaging (FCM) configuration.
- Adds the `pushConfig` method in `ChatOptions` for the push initialization configuration.
- Adds the `updatePushConfig` method in `ChatClient` for the push configuration update.

#### Improvements

- Upgraded the underlying native SDKs (for Android and iOS) to v1.0.7.
- Made the listener methods optional.
- Updated the release script.
- Updated the demo.

#### Issues fixed

JSON parsing error of the `type` field in several methods.

## v1.0.6

Released on July 22, 2022.

#### Compatibility changes

The following APIs are renamed:

- `deleteRemoteConversation` is renamed `removeConversationFromServer`.
- `loadAllConversations` is renamed `getAllConversations`.
- `getConversationsFromServer` is renamed `fetchAllConversations`.
- `getUnreadMessageCount` is renamed `getUnreadCount`.
- `fetchLatestMessage` is renamed `getLatestMessage`.
- `fetchLastReceivedMessage` is renamed `getLatestReceivedMessage`.
- `unreadCount` is renamed `getConversationUnreadCount`.
- `getMessagesFromTime` is renamed `getMessageWithTimestamp`.
- `WhiteList` is renamed `AllowList`.
- `BlackList` is renamed `BlockList`.

The following API are removed:

- `getMessageById`
- `insertMessage`
- `appendMessage`

#### New features

- Adds a `isOnline` field in chat messages.

#### Improvements

- Updated the API example.
- The dependent native SDK (iOS and Android) was upgraded to v3.9.4.
- React-Native was upgraded to 0.66.4 LTS version.
- The Android platform no longer needed to perform additional operations.
- `agora-react-native-chat` was changed to `react-native-agora-chat`.

#### Issues fixed

- Type declaration entry point was incorrect.

## v1.0.5

Released on June 17.

This is the first release for the Chat C# SDK, which enables you to add real-time chatting functionalities to a Unity or Windows app. Major features include the following:

- Sending and receiving messages in one-to-one chats, chat groups, and chatrooms.
- Retrieving and managing conversations and messages.
- Managing chat groups and chatrooms.
- Managing contact and blocklists.

For the complete feature list, see [Product Overview](../index).

Chat is charged on a MAU (Monthly Active Users) basis. For details, see [Pricing for Chat](./pricing) and [Pricing Plan Details](./pricing-plan-details).

Refer to the following documentations to enable Chat and use the Chat SDK to implement real-time chatting functionalities in your app:

- [Enable and Configure Chat](../get-started/enable)
- [Chat SDK quickstart](../get-started-sdk)
- [Messages](/en/realtime-media/im/build/build-core-messaging/messages/message-overview)
- [Chat Group](/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/group-overview)
- [Chat Room](/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/chatroom-overview)
- [RESTful API overview](/en/api-reference/api-ref/im)

### Windows

## v1.3.1

v1.3.1 was released on March 10, 2025.

#### Improvements

- Adds support for pinning or unpinning messages in one-to-one conversations. To pin or unpin a one-to-one chat message, call `ChatManager#PinMessage`. To get pinned messages from a one-to-one conversation from the server, call `ChatManager#GetPinnedMessagesFromServer`.

- Provides new users of a chat room with more chat room information. When users join a chat room, they can obtain the following information about the chat room using the `Room` Object:
    - `RoomId`
    - `MemberCount`
    - `CreateTimeStamp`
    - `IsAllMemberMuted`
    - `IsInAllowList`
    - `MuteUntilTimeStamp`

    This feature is available only for Windows, Unity Mac, and Unity Windows platforms.

- Delivers a more accurate chat room member count by optimizing the way to update the member count when members join or leave a chat room.

- Adds the `info` parameter to `OnLoggedOtherDevice` to provide device extension information. If a newly logged-in device forces an existing device offline due to exceeding the login limit, the offline device can identify the responsible device through the logout callback containing the device extension information.

## v1.3.0

v1.3.0 was released on December 11, 2024.

#### New features

- Added the `ChatManager#DeleteAllMessagesAndConversations` method to uni-directionally clear all conversations and messages in them.
- Added the function of searching for messages by search scope in `MessageSearchScope` during keyword-based search.
  - `MessageSearchScope`: Includes three message search scopes: the message content, message extension information, and both.
  - `ChatManager#SearchMsgFromDB(string, long, in, string, MessageSearchDirection, MessageSearchScope, ValueCallBack>)`: Searches for messages in all conversations by search scope.
  - `Conversation#LoadMessagesWithScope(string, MessageSearchScope, long, int, string, MessageSearchDirection, ValueCallBack>)`: Searches for messages in a conversation by search scope.
- Added the function of marking a conversation:
  - `ChatManager#MarkConversations`: Marks or unmarks a conversation.
  - `ChatManager#GetConversationsFromServerWithCursor`: Gets the conversations from the server by conversation mark.
  - `Conversation#Marks`: Gets all marks of a local conversation.
  - `MultiDevicesOperation#CONVERSATION_MARK`: Occurs on other devices when a conversation is marked or unmarked on one device.
- Added the `Message#Broadcast` property to indicate whether the message is a broadcast message sent via a RESTful API to all chat rooms under an app.
- Added the `Message#DeliverOnlineOnly` field to set whether the message is delivered only when the recipient(s) is/are online.  If this field is set to `true`,  the message is discarded when the recipient is offline.
- Added the `GroupManager#FetchMyGroupsCount` method to allow the current user to retrieve the total number of joined groups.
- Added the error code 706 `CHATROOM_OWNER_NOT_ALLOW_LEAVE` that occurs when chat room owner leaves the chat room. If `Options#IsRoomOwnerLeaveAllowed` is set to `false` during SDK initialization, the chat room is not allowed to leave the chat room. In this case, error 706 is reported if the chat room owner calls the `LeaveRoom` method to leave the chat room.
- Added the support for retrieval of historical messages of chat rooms from the server.
-  Added the `Options#UseReplacedMessageContents` property to determine whether the server returns the adjusted text message to the sender if the message content is replaced during text moderation.
- Added the `Message#IsContentReplaced` property to indicate whether the content of the text message is replaced during text moderation.
- Added the function of pinning a message:
  - `ChatManager#PinMessage`: Pins or unpins a message.
  - `ChatManager#GetPinnedMessagesFromServer`: Gets the list of pinned messages in a conversation from the server.
  - `Conversation#PinnedMessages`: Gets the list of pinned messages in a local conversation.
  - `Message#PinnedInfo`: Gets the pinning information of the message.
  - `PinnedInfo`: Includes the operator that pins or unpins the message and the operation time.
  - `IChatManagerDelegate#OnMessagePinChanged`: Occurs when the message pinning status changed. When a message is pinned or unpinned in a group or chat room, all members in the group or chat room receive this event.
- Added the `Options#EnableEmptyConversation` property to set whether to include empty conversations in the retrieved list of local conversations. This property is set during SDK initialization.
- Added the `applicant` and `decliner` parameters to the `IGroupManagerDelegate#OnRequestToJoinDeclinedFromGroup` event to respectively indicate the user that applies to join the group and the user that declines the join request.
- Added the `Options#IncludeSendMessageInMessageListener` property to set whether to return the successfully sent message in the `MessageListener#onMessageReceived` event.
- Added the `SDKClient#LoginWithToken` method for login with the user ID and user token.
- Added the `SDKClient#RenewToken` method for users to renew a token.
- Added the support for returning the modified custom message via the `IChatManagerDelegate#OnMessageContentChanged` event if the message is modified via the RESTful API.

#### Improvements

- Marked the `SDKClient#LoginWithAgoraToken` and `SDKClient#Login` methods deprecated. Use the `LoginWithToken` method instead.
- Marked the `SDKClient#RenewAgoraToken` method deprecated. Use the `RenewToken` method instead.
- Added the `Facility` library to improve the DNS acquisition logic and support data reporting.
- Switched `ChatManager#SearchMsgFromDB(string, long, int, string, MessageSearchDirection, ValueCallBack>)` from a synchronous method to an asynchronous one.
- Switched the TCP sockets from the blocking mode to the non-blocking mode.
- Supported the forwarding of single attachment messages by passing in the message body and extension fields, without reuploading the attachment.
- Reduced the number of times group specifications are retrieved when a large number of group member events are received during certain use-cases.
- Delivered a more accurate chat room member count by optimizing the way to update the member count when members join or leave the chat room.
- Shortened the time used to call the `ChatManager#MarkAllConversationsAsRead` method by marking all conversations read more efficiently.
- Fine tuned the error message for token-based login for the sake of accuracy.
- Optimized the way the SDK randomly gets server addresses to increase the success rate of requests.
- Adjusted the timeout period for joining or leaving chat rooms.
- Optimized the way the connection is re-established upon a connection failure in certain use-cases.
- Supported for uploading the attachment by fragment when sending an attachment message.
- Optimized the way messages are resent.
- Removed the internal `NetworkOnMainThreadException` exception catching during a network request.
- Optimized the database upgrade logic.
- Increased the maximum allowed size of a log file from 2 MB to 5 MB.
- Added the privacy protocol `PrivacyInfo.xcprivacy`.

#### Issues fixed

- The database name is encrypted, but contents in the database are still in plain text.
- For a modified message, the `from` property is missing from the body of the message pulled from the server by an offline user that gets online.
- In special use-cases, chat room events are missing when users exit the SDK before login to it.
- The SDK reconnects to the server twice after the network is back to normal.
- An incorrect error message is returned for an unlogged-in user that calls the `LeaveRoom` method.
- The members in a group are double counted in certain use-cases.
- The data reporting module crashes occasionally.
- The SDK is instantiated repeatedly when the `ChatManager#UpdateMessage` method is called frequently for SDK initialization in multi-thread use-cases.

## v1.2.0

v1.2.0 was released on December 6, 2023.

#### New features

- Added the function of forwarding multiple messages:
  - `ChatMessage.createCombineMessage`: Creates a combined message.
  - `ChatManager#FetchCombineMessageDetail`: Downloads and parses combined messages.
  - `ChatManager.fetchCombineMessageDetail`: Retrieves the original messages included in the combined message.:
  - `Message#CreateCombineSendMessage`: Creates a combined message.
- Added the function of modifying sent messages:
  - `ChatManager#ModifyMessage`: Modifies a sent text message.
  - `IChatManagerDelegate#OnMessageContentChanged`: Occurs when a sent message is modified. The message recipient receives this callback.
- Added the function of pinning a conversation:
  - `ChatManager#PinConversation`: Pins a conversation.
- Added the `ChatManager#GetConversationsFromServerWithCursor` method to retrieve the conversation list from the server or retrieve the list of pinned conversations from the server.
   Marked the `ChatManager#GetConversationsFromServer` method deprecated.
- Added `FetchServerMessagesOption` as the parameter configuration class for pulling historical messages from the server.
- Added the `ChatManager#FetchHistoryMessagesFromServerBy` method to retrieve historical messages of a conversation from the server according to `FetchServerMessagesOption`, the parameter configuration class for pulling historical messages.
- Added the `Conversation#DeleteMessages` method to delete messages sent or received in a certain period from the local database.
- Added the function of managing custom attributes of group members:
  - `GroupManager#SetMemberAttributes`: Sets custom attributes of a group member.
  - `GroupManager#FetchMemberAttributes`: Retrieves custom attributes of group members.
  - `IGroupManagerDelegate#OnUpdateMemberAttributesFromGroup`: Occurs when a custom attribute is changed for a group member.
- Added the following options to the `Options` class:
  - `Options#SDKDataPath`: Specifies the underlying storage path for SDK data.
  - `Options#MyUUID`: Specifies a custom UUID for the current device.
  - `Options#EnableEmptyConversation`: Determines whether to include empty conversations while loading conversations from the database.
- Added the `IConnectionDelegate#OnAppActiveNumberReachLimitation` callback that occurs when the number of daily active users (DAU) or monthly active users (MAU) for the app has reached the upper limit.
- Added the `IMultiDeviceDelegate#OnRoamDeleteMultiDevicesEvent` callback that occurs when historical messages in a conversation are deleted from the server on one device. This event is received by other devices.
- Added the support for user tokens in the following methods:
  - `SDKClient#GetLoggedInDevicesFromServerWithToken`: Retrieves the list of online login devices of a user.
  - `SDKClient#KickDeviceWithToken`: Kicks a user out of the app on a device.
  - `SDKClient#KickAllDevicesWithToken`: Kicks a user out of the app on all devices.
- Added multi-device operations:
  - `MultiDevicesOperation#SET_METADATA`: Custom attributes of are set for a group member on one device. This event is received by other devices.
  - `MultiDevicesOperation#DELETE_METADATA`: Custom attributes are deleted for a group member on one device. This event is received by other devices.
  - `MultiDevicesOperation#GROUP_MEMBER_METADATA_CHANGED`: Custom attributes are changed for a group member on one device. This event is received by other devices.
  - `MultiDevicesOperation#CONVERSATION_PINNED`: A conversation is pinned on one device. This event is received by other devices.
  - `MultiDevicesOperation#CONVERSATION_UNPINNED`: A conversation is unpinned on one device. This event is received by other devices.
  - `MultiDevicesOperation#CONVERSATION_DELETED`: A conversation is deleted from one device. This event is received by other devices.
- Added the `List` attribute in `MessageReactionDidChange`:
  - `MessageReactionChange#ReactionList`: The changed Reaction list.
  - `MessageReactionChange#OperationList`: The changed Reaction operation list.
- Added the error code `MESSAGE_SIZE_LIMIT` that is returned when the body of the message to be sent exceeds the upper limit.

#### Improvements

- Renamed `kickAllDevice` to `KickAllDevice`.
- Corrected misspellings in `MessageReaction`.
- Changed `Rection` to `Reaction`.
- Corrected misspellings in `MessageBody`:
- Changed `ThumbnaiRemotePath` to `ThumbnailRemotePath`.
- Changed `ThumbnaiSecret` to `ThumbnailSecret`.
- Changed `ThumbnaiDownStatus` to `ThumbnailDownStatus`.

#### Issues fixed

- The callback handler cannot be found when an SDK callback is triggered.
- The transcoding issue of character sets handled by the SDK.

## v1.1.0

v1.1.0 was released on April 28, 2023.

#### New features

- Adds the function of managing custom chat room attributes to implement functions like seat control and synchronization in voice chat rooms. See [Manage chat room attributes](/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes).
- Adds the `ChatManager#GetConversationsFromServerWithPage` method to allow users to get the conversation list from the server with pagination. See [Retrieve a list of conversations from the server](/en/realtime-media/im/build/build-core-messaging/messages/retrieve-messages#retrieve-a-list-of-conversations-from-the-server).
- Adds the `Message#Priority` attribute to implement the chat room message priority function to ensure that high-priority messages are dealt with first. See [Set message priority](/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages#set-message-priority).
- Adds the support for push notifications on the server side to allow you to send push notifications to all users, individual users specified by IDs, or groups of users by labels. For how to configure and send push notifications, see [Push notification management](/en/api-reference/api-ref/im/push-notification-management).
- Adds an additional option to delete messages on the server side. See [Delete conversations and historical messages](/en/realtime-media/im/build/build-core-messaging/messages/manage-messages#delete-conversations-and-historical-messages).

#### Improvements

Modifies the `SDKClient#InitWithOptionsInitWithOptions` method by adding the return result for the App Key format check.

#### Issues fixed

- Some login bugs.
- The issue with the read flag for the sent messages being set to `false`. After this issue is fixed, the SDK sets the read flag of a sent message to `true`.
- The names of encrypted database files are not properly generated. If you need historical messages upon upgrade to v1.1.0, first pull data from the server.

## v1.0.9

v1.0.9 was released on February 1, 2023.

#### New features

1. Adds the following methods to the `SDKClient` class:
   - `GetLoggedInDevicesFromServer`: Gets the list of online devices on which you have logged in with a specified account.
   - `KickDevice`: Logs out from a specified account on a device.
   - `kickAllDevices`: Logs out from a specified account on all devices.
2. Adds the following methods to the `RoomManager` class:
   - `FetchAllowListFromServer`: Gets the allow list of a chat room from the server.
   - `CheckIfInRoomAllowList`: Checks whether the current member is on the chat room blocklist.
   - `GetChatRoom`: Gets the details of a chat room from the memory.
   - `UnMuteAllRoomMembers`: Unmutes all members of a chat room.
3. Adds the following callbacks to the `IRoomManagerDelegate` class:
   - `OnSpecificationChangedFromRoom`: Occurs when specifications of a chat room are changed.
   - `OnAddAllowListMembersFromChatroom`: Occurs when a chat room member(s) is/are added to the allow list of a chat room.
   - `OnRemoveAllowListMembersFromChatroom`: Occurs when a chat room member(s) is/are removed from the allow list of a chat room.
   - `OnRemoveFromRoomByOffline`: Occurs when a member is removed from a chat room because he or she gets offline.
4. Adds the following callbacks to the `IConnectionDelegate` class:
   - `OnLoggedOtherDevice`: Occurs when the user logs in to another device with the current account.
   - `OnRemovedFromServer`：Occurs when the current user account is removed from the server.
   - `OnForbidByServer`: Occurs when the current user account is banned by the server.
   - `OnChangedIMPwd`：Occurs when the user is forced to log out of the current account because the login password is changed.
   - `OnLoginTooManyDevice`: Occurs when the user is forced to log out of the current account because she or he has exceeded the maximum number of devices allowed for this account.
   - `OnKickedByOtherDevice`：Occurs when the user is forced to log out of the current account from the current device due to the login to another device.
   - `OnAuthFailed`: Occurs when the user is forced to log out of the current account due to an authentication failure.
5. Adds the following attributes to the `Group` class:
   - `IsMemberOnly`: Whether users can join a group only via a join request or a group invitation, but cannot join freely.
   - `IsMemberAllowToInvite`: Whether all the group members, other than the group owner and admins, can invite users to join the group.
   - `MaxUserCount`：The maximum number of users that can join the group.
   - `Ext`: The custom group extension information.
   - `IsDisabled`: Whether the group is disabled.

#### Improvements

1. Changed the name space from ChatSDK to AgoraChat.
2. Renamed the `handle` parameter in the methods as `callback`.
3. Removed the `pushmanager` class.
4. Capitalized the name of each field in the `UserInfo` class.
5. Removed the `UINT32` and `JSONSTRING` types from the `AttributeValue` subclass in the `Message` class.
6. Removed the `i` parameter of the integer type from the `OnDisconnected` method.
7. Adjusted the returned result of the following methods:
   - `importmessage`: When this method is called, the asynchronous callback is triggered instead of the result returned directly.
   - `GetGroupMuteListFromServer`: The data type of the returned result is changed from `List` to `Dictionary`.
   - `FetchRoomMuteList`: The data type of the returned result is changed from `List` to `Dictionary`.
8. Renamed the following methods in the `GroupManager` class:
   - `AddGroupWhiteList` was renamed `AddGroupAllowList`.
   - `CheckIfInGroupWhiteList` was renamed `CheckIfInGroupAllowList`.
   - `GetGroupWhiteListFromServer` was renamed `GetGroupAllowListFromServer`.
   - `RemoveGroupWhiteList` was renamed `RemoveGroupAllowList`.
9. Renamed the following methods in the `RoomManager` class:
   - `AddWhiteListMembers` was renamed `AddAllowListMembers`.
   - `RemoveWhiteListMembers` was renamed `RemoveAllowListMembers`.
10. Changed the `ReactionList` attribute in the `Message` class to be a method.
11. Changed the visibility of options in `Options` in the `Group` class from public to internal.
12. Made the following adjustments in the `IGroupManagerDelegate` class:
    - `OnAddWhiteListMembersFromGroup` was renamed `OnAddAllowListMembersFromGroup`.
    - `OnRemoveWhiteListMembersFromGroup` was renamed `OnRemoveAllowListMembersFromGroup`.
    - The `reason` parameter was removed from the `OnInvitationAcceptedFromGroup` method.
    - The `groupName` and `decliner` parameters were removed from the `OnRequestToJoinDeclinedFromGroup` method.

## v1.0.8

v1.0.8 was released on November 22, 2022.

#### Improvements

- Removed redundant SDK logs.
- Changed the namespace from `ChatSDK` to `AgoraChat`.

#### Issues fixed

- Failures in getting a large number of messages from the server in rare use-cases.
- The issue with incorrect data statistics.
- Crashes caused by log printing in rare use-cases.
- The issue with the connection listener occasionally failing to receive connection callbacks.

## v1.0.5

v1.0.5 was released on August 12, 2022.

#### New features

- Supports presence subscription, which allows users to subscribe to the presence of other users.
- Supports reaction, which enables users to add reaction emojis to a specified message.
- Supports message threading, which allows users to have in-depth discussions on a specific message, without disrupting the conversation flow.
- Supports message translation, which allows users to translate messages.
- Supports message reporting, which allows users to report illegal messages.

#### Improvements

- Modified the way SDK handlers are managed.
- Added SDK initialization detection points.
- Allowed certain message attributes to be obtained in real time.

#### Issues fixed

- Certain data structure conversion issues.
- The JSON data was not properly converted into HTTP parameters.
- Crashes caused by incompatible characters passed to parameters in HTTP requests.

## v1.0.2

v1.0.2 was released on June 17.

This is the first release for the Chat C# SDK, which enables you to add real-time chatting functionalities to a Unity or Windows app. Major features include the following:

- Sending and receiving messages in one-to-one chats, chat groups, and chatrooms.
- Retrieving and managing conversations and messages.
- Managing chat groups and chatrooms.
- Managing contact and blocklists.

For the complete feature list, see [Product Overview](../index).

Chat is charged on a MAU (Monthly Active Users) basis. For details, see [Pricing for Chat](./pricing) and [Pricing Plan Details](./pricing-plan-details).

Refer to the following documentations to enable Chat and use the Chat SDK to implement real-time chatting functionalities in your app:

- [Enable and Configure Chat](../get-started/enable)
- [Chat SDK quickstart](../get-started-sdk)
- [Messages](/en/realtime-media/im/build/build-core-messaging/messages/message-overview)
- [Chat Group](/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/group-overview)
- [Chat Room](/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/chatroom-overview)
- API Reference

### Unity

## v1.3.1

v1.3.1 was released on March 10, 2025.

#### Improvements

- Adds support for pinning or unpinning messages in one-to-one conversations. To pin or unpin a one-to-one chat message, call `ChatManager#PinMessage`. To get pinned messages from a one-to-one conversation from the server, call `ChatManager#GetPinnedMessagesFromServer`.

- Provides new users of a chat room with more chat room information. When users join a chat room, they can obtain the following information about the chat room using the `Room` Object:
    - `RoomId`
    - `MemberCount`
    - `CreateTimeStamp`
    - `IsAllMemberMuted`
    - `IsInAllowList`
    - `MuteUntilTimeStamp`

    This feature is available only for Windows, Unity Mac, and Unity Windows platforms.

- Delivers a more accurate chat room member count by optimizing the way to update the member count when members join or leave a chat room.

- Adds the `info` parameter to `OnLoggedOtherDevice` to provide device extension information. If a newly logged-in device forces an existing device offline due to exceeding the login limit, the offline device can identify the responsible device through the logout callback containing the device extension information.

## v1.3.0

v1.3.0 was released on December 11, 2024.

#### New features

- Added the `ChatManager#DeleteAllMessagesAndConversations` method to uni-directionally clear all conversations and messages in them.
- Added the function of searching for messages by search scope in `MessageSearchScope` during keyword-based search.
  - `MessageSearchScope`: Includes three message search scopes: message content, message extension information, and both.
  - `ChatManager#SearchMsgFromDB(string, long, in, string, MessageSearchDirection, MessageSearchScope, ValueCallBack>)`: Searches for messages in all conversations by search scope.
  - `Conversation#LoadMessagesWithScope(string, MessageSearchScope, long, int, string, MessageSearchDirection, ValueCallBack>)`: Searches for messages in a single conversation by search scope.
- Added the function of tagging a conversation:
  - `ChatManager#MarkConversations`: Tags or untags a conversation.
  - `ChatManager#GetConversationsFromServerWithCursor`: Gets the conversations from the server by conversation tag.
  - `Conversation#Marks`: Gets all tags of a local conversation.
  - `MultiDevicesOperation#CONVERSATION_MARK`: Occurs on other devices when a conversation is tagged or untagged on one device.
- Added the `Message#Broadcast` property to indicate whether the message is a broadcast message sent via a RESTful API to all chat rooms under an app.
- Added the `Message#DeliverOnlineOnly` field to set whether the message is delivered only when the recipient(s) is/are online. If this field is set to `true`, the message is discarded when the recipient is offline.
- Added the `GroupManager#FetchMyGroupsCount` method to allow the current user to retrieve the total number of groups they joined.
- Added a 706 `CHATROOM_OWNER_NOT_ALLOW_LEAVE` error code that occurs when the chat room owner leaves the chat room. If `Options#IsRoomOwnerLeaveAllowed` is set to `false` during SDK initialization, the chat room owner is not allowed to leave. In this case, error 706 is reported if the chat room owner calls `LeaveRoom`.
- Added the support for retrieval of historical messages of chat rooms from the server.
- Added the `Options#UseReplacedMessageContents` property to determine whether the server returns the adjusted text message to the sender if the message content is replaced during text moderation.
- Added the `Message#IsContentReplaced` property to indicate whether the content of the text message is replaced during text moderation.
- Added the function of pinning a message:
  - `ChatManager#PinMessage`: Pins or unpins a message.
  - `ChatManager#GetPinnedMessagesFromServer`: Gets the list of pinned messages in a conversation from the server.
  - `Conversation#PinnedMessages`: Gets the list of pinned messages in a local conversation.
  - `Message#PinnedInfo`: Gets the pinning information of the message.
  - `PinnedInfo`: Includes the operator that pins or unpins the message and the operation time.
  - `IChatManagerDelegate#OnMessagePinChanged`: Occurs when the message pinning status changes. When a message is pinned or unpinned in a group or chat room, all members in the group or chat room receive this event.
- Added the `Options#EnableEmptyConversation` property to set whether to include empty conversations in the retrieved list of local conversations. This property is set during SDK initialization.
- Added the `applicant` and `decliner` parameters to the `IGroupManagerDelegate#OnRequestToJoinDeclinedFromGroup` event to respectively indicate the user that applies to join the group and the user that declines the join request.
- Added the `Options#IncludeSendMessageInMessageListener` property to set whether to return the successfully sent message in the `MessageListener#onMessageReceived` event.
- Added the `SDKClient#LoginWithToken` method for login with the user ID and user token.
- Added the `SDKClient#RenewToken` method for users to renew a token.
- Added the support for returning the modified custom message via the `IChatManagerDelegate#OnMessageContentChanged` event if the message is modified via the RESTful API.

#### Improvements

- Marked the `SDKClient#LoginWithAgoraToken` and `SDKClient#Login` methods deprecated. Use the `LoginWithToken` method instead.
- Marked the `SDKClient#RenewAgoraToken` method deprecated. Use the `RenewToken` method instead.
- Added the `Facility` library to improve the DNS acquisition logic and support data reporting.
- Switched `ChatManager#SearchMsgFromDB(string, long, int, string, MessageSearchDirection, ValueCallBack>)` from a synchronous method to an asynchronous one.
- Switched the TCP sockets from the blocking mode to the non-blocking mode. This issue is specific to the Unity SDK on Windows.
- Added support for forwarding single attachment messages by passing in the message body and extension fields, without reuploading the attachment.
- Reduced the number of times group specifications are retrieved when a large number of group member events are received during certain use-cases.
- Delivered a more accurate chat room member count by optimizing the way to update it when members join or leave the chat room.
- Shortened the time used to call the `ChatManager#MarkAllConversationsAsRead` method by marking all conversations read more efficiently.
- Fine tuned the error message for token-based login for accuracy.
- Optimized the way the SDK randomly gets server addresses to increase the success rate of requests.
- Adjusted the timeout period for joining or leaving chat rooms.
- Optimized the way the connection is re-established upon a connection failure in certain use-cases.
- Added support for uploading an attachment in fragments when sending an attachment message.
- Optimized the way messages are re-sent.
- Removed the internal `NetworkOnMainThreadException` exception catching during a network request.
- Optimized the database upgrade logic.
- Increased the maximum allowed size of a log file from 2 MB to 5 MB.
- Added the privacy protocol `PrivacyInfo.xcprivacy`.

#### Issues fixed

- The database name is encrypted, but contents in the database are still in plain text. This issue is specific to the Unity SDK on Windows.
- For a modified message, the `from` property is missing from the body of the message pulled from the server by an offline user that gets online.
- In special use-cases, chat room events are missing when users exit the SDK before logging into it.
- The SDK reconnects to the server twice after the network is back to normal.
- An incorrect error message is returned for a logged-out user that calls `LeaveRoom`.
- Members in a group are counted twice in certain use-cases.
- The data reporting module crashes occasionally.
- The SDK is instantiated repeatedly when the `ChatManager#UpdateMessage` method is called frequently for SDK initialization in multi-thread use-cases.

## v1.2.2

v1.2.2 was released on November 12, 2024.

#### Fixed issues

- The SDK could sometimes execute `Clear_Resource` twice when the app closed, occasionally leading to crashes.
- Log retrieval issues for Windows and MacOS.
- In iOS, `FetchHistoryMessagesFromServerBy` failed to retrieve message history if the option was empty.
- An issue with unreasonable server time values for Windows and MacOS when calling `FetchHistoryMessagesFromServerBy`.

#### Improvements

- Modified the error code for fetching chatroom info from the server: Changed `SERVER_NOT_REACHABLE` to `EXCEED_SERVICE_LIMIT` when meeting the QPS limit for Windows and Mac.

## v1.2.1

v1.2.1 was released on February 8, 2024.

#### Improvements

- Marked `DeInit` function as obsolete.
- Added support for the iOS platform setting in the `UNITY_EDITOR` mode.

## v1.2.0

v1.2.0 was released on December 6, 2023.

#### New features

- Added the function of forwarding multiple messages:
  - `ChatMessage.createCombineMessage`: Creates a combined message.
  - `ChatManager#FetchCombineMessageDetail`: Downloads and parses combined messages.
  - `ChatManager.fetchCombineMessageDetail`: Retrieves the original messages included in the combined message.:
  - `Message#CreateCombineSendMessage`: Creates a combined message.
- Added the function of modifying sent messages:
  - `ChatManager#ModifyMessage`: Modifies a sent text message.
  - `IChatManagerDelegate#OnMessageContentChanged`: Occurs when a sent message is modified. The message recipient receives this callback.
- Added the function of pinning a conversation:
  - `ChatManager#PinConversation`: Pins a conversation.
- Added the `ChatManager#GetConversationsFromServerWithCursor` method to retrieve the conversation list from the server or retrieve the list of pinned conversations from the server.
   Marked the `ChatManager#GetConversationsFromServer` method deprecated.
- Added `FetchServerMessagesOption` as the parameter configuration class for pulling historical messages from the server.
- Added the `ChatManager#FetchHistoryMessagesFromServerBy` method to retrieve historical messages of a conversation from the server according to `FetchServerMessagesOption`, the parameter configuration class for pulling historical messages.
- Added the `Conversation#DeleteMessages` method to delete messages sent or received in a certain period from the local database.
- Added the function of managing custom attributes of group members:
  - `GroupManager#SetMemberAttributes`: Sets custom attributes of a group member.
  - `GroupManager#FetchMemberAttributes`: Retrieves custom attributes of group members.
  - `IGroupManagerDelegate#OnUpdateMemberAttributesFromGroup`: Occurs when a custom attribute is changed for a group member.
- Added the following options to the `Options` class:
  - `Options#SDKDataPath`: Specifies the underlying storage path for SDK data.
  - `Options#MyUUID`: Specifies a custom UUID for the current device.
  - `Options#EnableEmptyConversation`: Determines whether to include empty conversations while loading conversations from the database.
- Added the `IConnectionDelegate#OnAppActiveNumberReachLimitation` callback that occurs when the number of daily active users (DAU) or monthly active users (MAU) for the app has reached the upper limit.
- Added the `IMultiDeviceDelegate#OnRoamDeleteMultiDevicesEvent` callback that occurs when historical messages in a conversation are deleted from the server on one device. This event is received by other devices.
- Added the support for user tokens in the following methods:
  - `SDKClient#GetLoggedInDevicesFromServerWithToken`: Retrieves the list of online login devices of a user.
  - `SDKClient#KickDeviceWithToken`: Kicks a user out of the app on a device.
  - `SDKClient#KickAllDevicesWithToken`: Kicks a user out of the app on all devices.
- Added multi-device operations:
  - `MultiDevicesOperation#SET_METADATA`: Custom attributes of are set for a group member on one device. This event is received by other devices.
  - `MultiDevicesOperation#DELETE_METADATA`: Custom attributes are deleted for a group member on one device. This event is received by other devices.
  - `MultiDevicesOperation#GROUP_MEMBER_METADATA_CHANGED`: Custom attributes are changed for a group member on one device. This event is received by other devices.
  - `MultiDevicesOperation#CONVERSATION_PINNED`: A conversation is pinned on one device. This event is received by other devices.
  - `MultiDevicesOperation#CONVERSATION_UNPINNED`: A conversation is unpinned on one device. This event is received by other devices.
  - `MultiDevicesOperation#CONVERSATION_DELETED`: A conversation is deleted from one device. This event is received by other devices.
- Added the `List` attribute in `MessageReactionDidChange`:
  - `MessageReactionChange#ReactionList`: The changed Reaction list.
  - `MessageReactionChange#OperationList`: The changed Reaction operation list.
- Added the error code `MESSAGE_SIZE_LIMIT` that is returned when the body of the message to be sent exceeds the upper limit.

#### Improvements

- Supported the ARM64 mode on macOS.
- Renamed `kickAllDevice` to `KickAllDevice`.
- Corrected misspellings in `MessageReaction`.
- Changed `Rection` to `Reaction`.
- Corrected misspellings in `MessageBody`:
- Changed `ThumbnaiRemotePath` to `ThumbnailRemotePath`.
- Changed `ThumbnaiSecret` to `ThumbnailSecret`.
- Changed `ThumbnaiDownStatus` to `ThumbnailDownStatus`.

#### Issues fixed

- The callback handler cannot be found when an SDK callback is triggered.
- The underlying resources are not released when the SDK is not initialized.
- The issues in user attribute updates on Android and iOS systems.

## v1.1.4

v1.1.4 was released on February 8, 2024.

#### Improvements

- Marked `DeInit` function as obsolete.
- Added support for the iOS platform setting in the `UNITY_EDITOR` mode.

## v1.1.3

v1.1.3 was released on October 2, 2023.

#### Improvements

- Supports disabling domain reload in **Enter Play Mode Options**
- Supports setting the **Managed Code Stripping Level** property to **High**
- Supports changing the AppKey without restarting the IDE

## v1.1.2

v1.1.2 was released on August 24, 2023.

#### Issues fixed

- Fixed the issue that the `messageReactionDidChange` callback leads to Unity suspend.
- Fixed the issue that the `startMessageId` parameter does not work in the `LoadMessages` API.
- Fixed a rare crash where Chat SDK cannot find the callback handler.

#### New features

- You can now set `SDKDatapath` in Chat SDK options. The default value is `Application.persistentDataPath`; to
    enable the app user to retrieve their history locally, set `SDKDatapath` to ".".
- The new `IsInit` API helps you to check if you need to clear a resource in Chat SDK.

## v1.1.1

v1.1.1 was released on June 8, 2023.

#### Issues fixed

- Using the `SDKClient.Instance.ChatManager.FetchHistoryMessagesFromServer` method on Android devices returned a `No value for type` error message.
- Callback-related bugs when sending video files on Android devices.

## v1.1.0

v1.1.0 was released on April 28, 2023.

#### New features

- Upgrades the native platforms `iOS` and `Android` that the Unity platform depends on to v1.1.0.
- Adds the function of managing custom chat room attributes to implement functions like seat control and synchronization in voice chat rooms. See [Manage chat room attributes](/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes).
- Adds the `ChatManager#GetConversationsFromServerWithPage` method to allow users to get the conversation list from the server with pagination. See [Retrieve a list of conversations from the server](/en/realtime-media/im/build/build-core-messaging/messages/retrieve-messages#retrieve-a-list-of-conversations-from-the-server).
- Adds the `Message#Priority` attribute to implement the chat room message priority function to ensure that high-priority messages are dealt with first. See [Set message priority](/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages#set-message-priority).
- Adds the support for push notifications on the server side to allow you to send push notifications to all users, individual users specified by IDs, or groups of users by labels. For how to configure and send push notifications, see [Push notification management](/en/api-reference/api-ref/im/push-notification-management).
- Adds an additional option to delete messages on the server side. See [Delete conversations and historical messages](/en/realtime-media/im/build/build-core-messaging/messages/manage-messages#delete-conversations-and-historical-messages).

#### Improvements

Modified the `SDKClient#InitWithOptionsInitWithOptions` method by adding the return result for the App Key format check.

#### Issues fixed

- Some login bugs.
- The issue that the read flag for the sent messages is set to `false`. After this issue is fixed, the SDK sets the read flag of a sent message to `true`.
- The names of encrypted database files are not properly generated. This issue is specific only to the Mac and Windows platforms for the Unity framework. If you need historical messages upon upgrade to v1.1.0, you are advised to first pull data from the server.

## v1.0.9

v1.0.9 was released on February 1, 2023.

#### New features

1. Adds the following methods to the `SDKClient` class:
   - `GetLoggedInDevicesFromServer`: Gets the list of online devices on which you have logged in with a specified account.
   - `KickDevice`: Logs out from a specified account on a device.
   - `kickAllDevices`: Logs out from a specified account on all devices.
2. Adds the following methods to the `RoomManager` class:
   - `FetchAllowListFromServer`: Gets the allow list of a chat room from the server.
   - `CheckIfInRoomAllowList`: Checks whether the current member is on the chat room block list.
   - `GetChatRoom`: Gets the details of a chat room from the memory.
   - `UnMuteAllRoomMembers`: Unmutes all members of a chat room.
3. Adds the following callbacks to the `IRoomManagerDelegate` class:
   - `OnSpecificationChangedFromRoom`: Occurs when specifications of a chat room are changed.
   - `OnAddAllowListMembersFromChatroom`: Occurs when a chat room member(s) is/are added to the allow list of a chat room.
   - `OnRemoveAllowListMembersFromChatroom`: Occurs when a chat room member(s) is/are removed from the allow list of a chat room.
   - `OnRemoveFromRoomByOffline`: Occurs when a member is removed from a chat room because he or she gets offline.
4. Adds the following callbacks to the `IConnectionDelegate` class:
   - `OnLoggedOtherDevice`: Occurs when the user logs in to another device with the current account.
   - `OnRemovedFromServer`：Occurs when the current user account is removed from the server.
   - `OnForbidByServer`: Occurs when the current user account is banned by the server.
   - `OnChangedIMPwd`：Occurs when the user is forced to log out of the current account because the login password is changed.
   - `OnLoginTooManyDevice`: Occurs when the user is forced to log out of the current account because she or he has exceeded the maximum number of devices allowed for this account.
   - `OnKickedByOtherDevice`：Occurs when the user is forced to log out of the current account from the current device due to the login to another device.
   - `OnAuthFailed`: Occurs when the user is forced to log out of the current account due to an authentication failure.
5. Adds the following attributes to the `Group` class:
   - `IsMemberOnly`: Whether users can join a group only via a join request or a group invitation, but cannot join freely.
   - `IsMemberAllowToInvite`: Whether all the group members, other than the group owner and admins, can invite users to join the group.
   - `MaxUserCount`：The maximum number of users that can join the group.
   - `Ext`: The custom group extension information.
   - `IsDisabled`: Whether the group is disabled.

#### Improvements

1. Changed the name space from ChatSDK to AgoraChat.
2. Renamed the `handle` parameter in the methods as `callback`.
3. Removed the `pushmanager` class.
4. Capitalized the name of each field in the `UserInfo` class.
5. Removed the `UINT32` and `JSONSTRING` types from the `AttributeValue` subclass in the `Message` class.
6. Removed the `i` parameter of the integer type from the `OnDisconnected` method.
7. Adjusted the returned result of the following methods:
   - `importmessage`: When this method is called, the asynchronous callback is triggered instead of the result returned directly.
   - `GetGroupMuteListFromServer`: The data type of the returned result is changed from `List` to `Dictionary`.
   - `FetchRoomMuteList`: The data type of the returned result is changed from `List` to `Dictionary`.
8. Renamed the following methods in the `GroupManager` class:
   - `AddGroupWhiteList` was renamed `AddGroupAllowList`.
   - `CheckIfInGroupWhiteList` was renamed `CheckIfInGroupAllowList`.
   - `GetGroupWhiteListFromServer` was renamed `GetGroupAllowListFromServer`.
   - `RemoveGroupWhiteList` was renamed `RemoveGroupAllowList`.
9. Renamed the following methods in the `RoomManager` class:
   - `AddWhiteListMembers` was renamed `AddAllowListMembers`.
   - `RemoveWhiteListMembers` was renamed `RemoveAllowListMembers`.
10. Changed the `ReactionList` attribute in the `Message` class to be a method.
11. Changed the visibility of options in `Options` in the `Group` class from public to internal.
12. Made the following adjustments in the `IGroupManagerDelegate` class:
    - `OnAddWhiteListMembersFromGroup` was renamed `OnAddAllowListMembersFromGroup`.
    - `OnRemoveWhiteListMembersFromGroup` was renamed `OnRemoveAllowListMembersFromGroup`.
    - The `reason` parameter was removed from the `OnInvitationAcceptedFromGroup` method.
    - The `groupName` and `decliner` parameters were removed from the `OnRequestToJoinDeclinedFromGroup` method.

## v1.0.8

v1.0.8 was released on November 22, 2022.

#### Improvements

- Removed redundant SDK logs.
- Changed the namespace from `ChatSDK` to `AgoraChat`.

#### Issues fixed

- Failures in getting a large number of messages from the server in rare use-cases.
- The issue with incorrect data statistics.
- Crashes caused by log printing in rare use-cases.
- The issue with the connection listener occasionally failing to receive connection callbacks.

## v1.0.5

v1.0.5 was released on August 12, 2022.

#### New features

- Supports presence subscription, which allows users to subscribe to the presence of other users.
- Supports reaction, which enables users to add reaction emojis to a specified message.
- Supports message threading, which allows users to have in-depth discussions on a specific message, without disrupting the conversation flow.
- Supports message translation, which allows users to translate messages.
- Supports message reporting, which allows users to report illegal messages.

#### Improvements

- Modified the way SDK handlers are managed.
- Added SDK initialization detection points.
- Allowed certain message attributes to be obtained in real time.

#### Issues fixed

- Certain data structure conversion issues.
- The JSON data was not properly converted into HTTP parameters.
- Crashes caused by incompatible characters passed to parameters in HTTP requests.

## v1.0.2

v1.0.2 was released on June 17.

This is the first release for the Chat C# SDK, which enables you to add real-time chatting functionalities to a Unity or Windows app. Major features include the following:

- Sending and receiving messages in one-to-one chats, chat groups, and chatrooms.
- Retrieving and managing conversations and messages.
- Managing chat groups and chatrooms.
- Managing contact and block lists.

For the complete feature list, see [Product Overview](../index).

Chat is charged on a MAU (Monthly Active Users) basis. For details, see [Pricing for Chat](./pricing) and [Pricing Plan Details](./pricing-plan-details).

Refer to the following documentations to enable Chat and use the Chat SDK to implement real-time chatting functionalities in your app:

- [Enable and Configure Chat](../get-started/enable)
- [Chat SDK quickstart](../get-started-sdk)
- [Messages](/en/realtime-media/im/build/build-core-messaging/messages/message-overview)
- [Chat Group](/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/group-overview)
- [Chat Room](/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/chatroom-overview)
- [RESTful API overview](/en/api-reference/api-ref/im)

## RESTful API
## v1.3.0

Added the following RESTful APIs:

- Modifying a text or custom message
- Sending a broadcast message to all chat rooms under an app
- Retrieving the contact list with pagination
- Binding or unbinding push information
- Retrieving the push information bound to devices of a user
- Querying the callback data stored on the Chat server
- Resending the callback data stored on the Chat server

## v1.2.0

1. Added new REST APIs for management of custom attributes of group members:

    * Setting custom attributes of a group member
    * Retrieving all custom attributes of a group member
    * Retrieving custom attributes of multiple group members by attribute key

1. Removed the `nickname` parameter from the RESTful APIs for adding one user or multiple users
