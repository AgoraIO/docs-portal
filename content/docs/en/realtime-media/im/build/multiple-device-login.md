---
title: "Log in from multiple devices"
description: "Log in to Agora Chat from multiple devices"
---

Agora Chat supports logging in to the same account from up to 4 devices at the same time by default. You can increase the number of
devices per platform up to 10 by going to **Agora Console > Project management > Relevant project > Agora Chat configuration > Features > Multi Device**.

In cases of multiple device login, all logged-in devices synchronize the following information and operations:

- Messages, including online messages, offline messages, push notifications (if the third-party push service is enabled, the offline device receives it), the corresponding receipts and read status, and so on;
- Friends and group-related operations;
- Message-thread-related operations;
- Conversation-related operations.

The following table summarizes the strategy of forcing other devices to log out and the automatic login security check in the single-device and multi-device login use-cases:

### Android

  
    Single/multi-device login
    Forced logout strategy
    Automatic login security check
  

  
    Single-device login
    The newly logged-in device will force the current device to log out. The logged-out device will receive the `ConnectionListener#onLogout` callback.
    For devices that log in automatically, the device will automatically reconnect to the Agora server after going offline. If the reconnection is successful, the current logged-in device will be forced to log out by default (for multiple devices, the earliest logged-in device will be logged out). If you want to keep the current device logged in, contact [support@agora.io](mailto:support@agora.io). In this use-case, the device that logs in automatically won't be able to log in and will receive error 214, indicating that the number of currently logged-in devices exceeds the limit.
  
  
    Multi-device login
    If the number of logged-in devices on one end reaches the limit, the device that logged in the latest will force the device that logged in the earliest to log out. The logged-out device will receive the `ConnectionListener#onLogout` callback. Agora Chat only supports forced logout for the devices on the same end.
  

### Platforms

  
    Single/multi-device login
    Forced logout strategy
    Automatic login security check
  

  
    Single-device login
    The newly logged-in device will force the current device to log out. The logged-out device will receive the `AgoraChatClientDelegate#userAccountDidLoginFromOtherDevice` event.
    For devices that log in automatically, the device will automatically reconnect to the Agora server after going offline. If the reconnection is successful, the current logged-in device will be forced to log out by default (for multiple devices, the earliest logged-in device will be logged out). If you want to keep the current device logged in, contact [support@agora.io](mailto:support@agora.io). In this use-case, the device that logs in automatically won't be able to log in and will receive error 214, indicating that the number of currently logged-in devices exceeds the limit.
  
  
    Multi-device login
    If the number of logged-in devices on one end reaches the limit, the device that logged in the latest will force the device that logged in the earliest to log out. The logged-out device will receive the `AgoraChatClientDelegate#userAccountDidLoginFromOtherDevice` event. Agora Chat only supports forced logout for the devices on the same end.
  

### Platforms

| Single/multi-device login | Forced logout strategy |
|:---:|:---:|
| Single-device login | The newly logged-in device will force the current device to log out. The logged-out device will receive the `onDisconnected` event.|
| Multi-device login | If the number of logged-in devices on one end reaches the limit, the device that logged in the latest will force the device that logged in the earliest to log out. Agora Chat only supports forced logout for the devices on the same end. When multiple ends are logged in, the use of a fixed device ID affects the forced logout strategy. The SDK generates an ID as the unique device identifier. Previously, the SDK used a different random string as the device identifier for each opened tab. Starting from v1.3.1, the SDK has the `ConnectionParameters#isFixedDeviceId` parameter, which you can set to use a random device ID or a fixed device ID when initializing the SDK: - (Default) `true`: Use a fixed device ID. The device ID is stored in local storage. Even when multiple devices are logged in, only one tab can be opened in the same browser. If two are opened, the new tab will force the previous one offline. - `false`: Use a random device ID. Each tab uses a different device ID. When logging in with multiple devices, a user can open multiple tabs in the same browser. If the number of devices exceeds the set number, the newly opened tab will force the first opened tab offline. |

The Agora server provides a RESTful interface to force a specified account to [log out from a single device](/en/realtime-media/im/reference/server-api/user-system-registration#forcing-a-user-offline).

### Platforms

  
    Single/multi-device login
    Forced logout strategy
    Automatic login security check
  

  
    Single-device login
    The newly logged-in device will force the current device to log out. The logged-out device will receive the `ConnectionEventHandler#onUserDidLoginTooManyDevice` event.
    For devices that log in automatically, the device will automatically reconnect to the Agora server after going offline. If the reconnection is successful, the current logged-in device will be forced to log out by default (for multiple devices, the earliest logged-in device will be logged out). If you want to keep the current device logged in, contact [support@agora.io](mailto:support@agora.io). In this use-case, the device that logs in automatically won't be able to log in and will receive error 214, indicating that the number of currently logged-in devices exceeds the limit.
  
  
    Multi-device login
    If the number of logged-in devices on one end reaches the limit, the device that logged in the latest will force the device that logged in the earliest to log out. The logged-out device will receive the `ConnectionEventHandler#onUserDidLoginTooManyDevice` event. Agora Chat only supports forced logout for the devices on the same end.
  

### Platforms

  
    Single/multi-device login
    Forced logout strategy
    Automatic login security check
  

  
    Single-device login
    The newly logged-in device will force the current device to log out. The logged-out device will receive the `ChatConnectEventListener#onUserDidLoginFromOtherDevice` event.
    For devices that log in automatically, the device will automatically reconnect to the Agora server after going offline. If the reconnection is successful, the current logged-in device will be forced to log out by default (for multiple devices, the earliest logged-in device will be logged out). If you want to keep the current device logged in, contact [support@agora.io](mailto:support@agora.io). In this use-case, the device that logs in automatically won't be able to log in and will receive error 214, indicating that the number of currently logged-in devices exceeds the limit.
  
  
    Multi-device login
    If the number of logged-in devices on one end reaches the limit, the device that logged in the latest will force the device that logged in the earliest to log out. The logged-out device will receive the `ChatConnectEventListener#onUserDidLoginFromOtherDevice` event. Agora Chat only supports forced logout for the devices on the same end.
  

### Unity

### Windows

## Understand the tech

### Platforms

During initialization, the SDK generates a login ID to identify the device when multiple devices log in and push messages, and sends this ID to the server. The server automatically sends new messages to the user's logged-in device, monitors operations on other devices, and synchronizes multiple devices. The SDK provides the following multi-device use-case functions:

- Get the login ID list of the other logged-in devices of the current user;

- Get the list of online logged-in devices of the specified account;

- Force the specified account to log out from a single device;

- Force the specified account to log out from all devices;

### All except Windows, React Native, Unity, iOS

- Get friend or group operations on other devices.

### iOS, Unity, Windows

- Get operations on other devices.

### Platforms

- Set the name of the login device;

- Set the platform of the login device;

- Get notified about multi-device synchronization.

### Platforms

Chat SDK generates a new unique login ID every time a user logs in and sends the ID to the server. The server automatically sends new messages to the device where the user logs in, and can automatically monitor friend or group operations on other devices.

### Platforms

## Prerequisites

Before starting this procedure, initialize and connect the SDK to the server. See [SDK quickstart](../get-started-sdk) for details.

## Implement multi-device login

### Android

### Get the login ID list of other logged-in devices of the current user

Call `getSelfIdsOnOtherPlatform` to get the login ID list of other logged-in devices, and then select the target login ID as the message recipient to send a message to the specified device.

```java
// A synchronous method that will block the current thread. The asynchronous method is asyncGetSelfIdsOnOtherPlatform(ValueCallBack).
List ids = ChatClient.getInstance().contactManager().getSelfIdsOnOtherPlatform();
// Select a login ID as the message recipient.
String toChatUserId = ids.get(0);
// Create a text message, content is the message text, toChatUserId passes in the login ID as the message recipient.
ChatMessage message = ChatMessage.createTextSendMessage(content, toChatUserId);
// Send a message.
ChatClient.getInstance().chatManager().sendMessage(message);
```

### Get the list of online logged-in devices for the specified account

Call `getLoggedInDevicesFromServerWithToken` to get the list of online logged-in devices for the specified account from the server by passing in the user ID and user token.

```java
    try {
        List deviceInfos = ChatClient.getInstance().getLoggedInDevicesFromServerWithToken(userId, token);
    } catch (HyphenateException e) {
        e.printStackTrace();
    }
```

### Force the specified account to log out from a single device

Call `kickDeviceWithToken` and pass in the user ID and user token to force the specified account to log out from a single logged-in device. Before calling this method, obtain the device ID through the `ChatClient#getLoggedInDevicesFromServerWithToken` and `DeviceInfo#getResource` methods. The logged-out device will receive the `ConnectionListener#onLogout` event.

:::info
You can also use this interface without logging in.
:::

```java
// userId: User ID, token: User token. Need to be executed in an asynchronous thread.
List deviceInfos = ChatClient.getInstance().getLoggedInDevicesFromServerWithToken(userId, token);
// userId: User ID, token: User token, resource: Device ID. Need to be executed in an asynchronous thread.
ChatClient.getInstance().kickDeviceWithToken(userId, token, deviceInfos.get(selectedIndex).getResource());
```

### Force the specified account to log out from all devices

Call `kickAllDevicesWithToken` and pass in the user ID and user token to force the specified account to log out from from all logged-in devices. The logged-out device will receive the `ConnectionListener#onLogout` event.

:::info
You can also use this interface without logging in.
:::

```java
    try {
        ChatClient.getInstance().kickAllDevicesWithToken(userId,token);
    } catch (HyphenateException e) {
        e.printStackTrace();
    }
```

### Get operations on other devices

Let's say that account A logs in on devices A and B at the same time and performs operations on device A. Device B will receive notifications corresponding to these operations.

You need to implement the `MultiDeviceListener` class to listen to operations on other devices, and then call the `addMultiDeviceListener` method to add multi-device listening.

```java
//Implement `MultiDeviceListener` to listen to operations on other devices.
private class ChatMultiDeviceListener implements MultiDeviceListener {
//@param event event.
    @Override
    //@param target friend's user ID; @param ext event extended information.
    public void onContactEvent(int event, String target, String ext) {
        EMLog.i(TAG, "onContactEvent event"+event);
        String message = null;
        switch (event) {
            //The current user deletes friends on other devices.
            case CONTACT_REMOVE:
            break;
            //The current user accepts friend requests on other devices.
            case CONTACT_ACCEPT:
            break;
            //The current user rejects friend requests on other devices.
            case CONTACT_DECLINE:
            break;
            //The current user adds a user to the blocklist on other devices.
            case CONTACT_BAN:
            break;
            //The current user removes a user from the blocklist on other devices.
            case CONTACT_ALLOW:
            break;
            default:
            break;
        }
    }

    @Override
    public void onGroupEvent(int event, String groupId, List userIds) {
        EMLog.i(TAG, "onGroupEvent event"+event);
        switch (event) {
            //The current user created a group on another device.
            case GROUP_CREATE:
            break;
            //The current user destroyed a group on another device.
            case GROUP_DESTROY:
            break;
            //The current user joined a group on another device.
            case GROUP_JOIN:
            break;
            //The current user left a group on another device.
            case GROUP_LEAVE:
            break;
            //The current user initiated a group application on another device.
            case GROUP_APPLY:
            break;
            //The current user approved the group application on another device.
            case GROUP_APPLY_ACCEPT:
            break;
            //The current user rejected the group application on another device.
            case GROUP_APPLY_DECLINE:
            break;
            //The current user invited group members on other devices.
            case GROUP_INVITE:
            break;
            //The current user accepted the invitation to join the group on other devices.
            case GROUP_INVITE_ACCEPT:
            break;
            //The current user rejected the invitation to join the group on other devices.
            case GROUP_INVITE_DECLINE:
            break;
            //The current user kicked members out of the group on other devices.
            case GROUP_KICK:
            break;
            //The current user added members to the group blocklist on other devices.
            case GROUP_BAN:
            break;
            //The current user removed members from the group blocklist on other devices.
            case GROUP_ALLOW:
            break;
            //The current user blocked the group on other devices.
            case GROUP_BLOCK:
            break;
            //The current user unblocked the group on other devices.
            case GROUP_UNBLOCK:
            break;
            //The current user transferred group ownership on other devices.
            case GROUP_ASSIGN_OWNER:
            break;
            //The current user adds an administrator on other devices.
            case GROUP_ADD_ADMIN:
            break;
            //The current user removes the administrator on other devices.
            case GROUP_REMOVE_ADMIN:
            break;
            //The current user mutes users on other devices.
            case GROUP_ADD_MUTE:
            break;
            //The current user removes the muting on other devices.
            case GROUP_REMOVE_MUTE:
            break;
            //The current user sets custom attributes for group members on other devices.
            case GROUP_METADATA_CHANGED:
            break;
            default:
            break;
        }
    }

    @Override
    public void onChatThreadEvent(int event, String target, List userIds) {
        EMLog.i(TAG, "onChatThreadEvent event"+event);
        switch (event) {
            case THREAD_CREATE:
            //The current user creates a message thread on other devices.
            break;
            case THREAD_DESTROY:
            //The current user destroys the message thread on other devices.
            break;
            case THREAD_JOIN:
            //The current user joins the message thread on other devices.
            break;
            case THREAD_LEAVE:
            //The current user leaves the message thread on other devices.
            break;
            case THREAD_UPDATE:
            //The current user updates the message thread on other devices.
            break;
            case THREAD_KICK:
            //The current user kicks a member out of the message thread on other devices.
            break;
            default:
            break;

        }
    }

    @Override
    public void onConversationEvent(int event, String conversationId, Conversation.ConversationType type) {
        EMLog.i(TAG, "onConversationEvent event"+event);
        switch (event) {
            case CONVERSATION_PINNED:
            //The current user pins a conversation on other devices.
            break;
            case CONVERSATION_UNPINNED:
            //The current user unpins a conversation on other devices.
            break;
            case CONVERSATION_DELETED:
            //The current user deletes a conversation on other devices.
            break;
            case CONVERSATION_MARK_UPDATE:
            //The current user updates the conversation tag on other devices, including adding and removing conversation tags.
            break;
            default:
            break;
        }
    }

    @Override
    public void onMessageRemoved(String conversationId, String deviceId) {
        EMLog.i(TAG, "onMessageRemoved conversationId "+conversationId);
        //The current user unidirectionally deletes message history of a conversation on other devices from the server.
    }
}

ChatMultiDeviceListener chatMultiDeviceListener = new ChatMultiDeviceListener();

//Add a multi-device listener.
ChatClient.getInstance().addMultiDeviceListener(chatMultiDeviceListener);

//Remove a multi-device listener.
ChatClient.getInstance().removeMultiDeviceListener(chatMultiDeviceListener);
```

### iOS

### Get the login ID list of other logged-in devices of the current user

Call `getSelfIdsOnOtherPlatform` to get the login ID list of other logged-in devices, and then select the target login ID as the message recipient to send a message to the specified device.

```swift
AgoraChatClient.shared().contactManager?.getSelfIdsOnOtherPlatform(completion: { ids, err in
        if err == nil,
            let userId = ids?.first {
            // Select a login ID as the message recipient. Create a text message, content is the message text, conversationId passes the login ID as the message recipient.
            let textMessage = AgoraChatMessage(conversationId: userId, body: .text(content: "hello"), ext: nil)
            AgoraChatClient.shared().chatManager?.send(textMessage, progress: nil, completion: { msg, e in

            })
        }
    })
```

### Get the list of online logged-in devices for the specified account

Call `getLoggedInDevicesFromServerWithToken` to get the list of online logged-in devices for the specified account from the server by passing in the user ID and user token.

```swift
    AgoraChatClient.shared().getLoggedInDevicesFromServer(withUserId: "userId", token: "token") { deviceConfigs, err in
        if err == nil {

        }
    }
```

### Force the specified account to log out from a single device

Call `kickDeviceWithUserId` and pass in the user ID and user token to force the specified account to log out from a single logged-in device. Before calling this method, obtain the device ID through the `AgoraChatClient#getLoggedInDevicesFromServer` and `AgoraChatDeviceInfo#resource` methods. The logged-out device will receive the `AgoraChatClientDelegate#userAccountDidLoginFromOtherDevice` event.

:::info
You can also use this interface without logging in.
:::

```swift
AgoraChatClient.shared().getLoggedInDevicesFromServer(withUserId: "userId", token: "token") { deviceConfigs, err in
        if err == nil,
            let resource = deviceConfigs?.first?.resource {
            AgoraChatClient.shared().kickDevice(withUserId: "userId", token: "token", resource: resource) { e in

            }
        }
    }
```

### Force the specified account to log out from all devices

Call `kickAllDevicesWithUserId` and pass in the user ID and user token to force the specified account to log out from all logged-in devices. The logged-out device will receive the `AgoraChatClientDelegate#userAccountDidLoginFromOtherDevice` event.

:::info
You can also use this interface without logging in.
:::

```swift
   AgoraChatClient.shared().kickAllDevices(withUserId: "userId", token: "token") { err in

        }
```

### Get operations on other devices

Let's say that account A logs in on devices A and B at the same time and performs operations on device A. Device B will receive notifications corresponding to these operations.

You need to implement the `AgoraChatMultiDevicesDelegate` class to listen to operations on other devices, and then call the `addMultiDevicesDelegate` method to add multi-device listening.

```swift
extension AppDelegate: AgoraChatMultiDevicesDelegate {
    func multiDevicesContactEventDidReceive(_ aEvent: AgoraChatMultiDevicesEvent, username aUsername: String, ext aExt: String?) {
        switch aEvent {
            //The current user deletes friends on other devices.
        case .contactRemove:
            break
            //The current user accepts friend requests on other devices.
        case .contactAccept:
            break
            //The current user rejects friend requests on other devices.
        case .contactDecline:
            break
            //The current user adds a user to the blocklist on other devices.
        case .contactBan:
            break
            //The current user removes a user from the blocklist on other devices.
        case .contactAllow:
            break
        default:
            break
        }
    }

    func multiDevicesGroupEventDidReceive(_ aEvent: AgoraChatMultiDevicesEvent, groupId aGroupId: String, ext aExt: Any?) {
        switch aEvent {
            //The current user created a group on another device
        case .groupCreate:
            break
        //The current user destroyed a group on another device
        case .groupDestroy:
            break
        //The current user joined a group on another device
        case .groupJoin:
            break
        //The current user left a group on another device
        case .groupLeave:
            break
        //The current user initiated a group application on another device
        case .groupApply:
            break
        //The current user accepted a group application on another device
        case .groupApplyAccept:
            break
        //The current user rejected a group application on another device
        case .groupApplyDecline:
            break
        //The current user invited group members on another device
        case .groupInvite:
            break
        //The current user has accepted the invitation to join the group on other devices
        case .groupInviteAccept:
            break
        //The current user has rejected the invitation to join the group on other devices
        case .groupInviteDecline:
            break
        //The current user has kicked members out of the group on other devices
        case .groupKick:
            break
        //The current user has added members to the group blocklist on other devices
        case .groupBan:
            break
        //The current user has removed members from the group blocklist on other devices
        case .groupAllow:
            break
        //The current user has blocked the group on other devices
        case .groupBlock:
            break
        //The current user has unblocked the group on other devices
        case .groupUnBlock:
            break
        //The current user has transferred group ownership on other devices
        case .groupAssignOwner:
            break
        //The current user has added an administrator on other devices
        case .groupAddAdmin:
            break
        //The current user has removed an administrator on other devices
        case .groupRemoveAdmin:
            break
        //The current user has muted users on other devices
        case .groupAddMute:
            break
        //The current user removes the mute on other devices
        case .groupRemoveMute:
            break
        //The current user sets the group member custom attributes on other devices
        case .groupMemberAttributesChanged:
            break
        default:
            break
        }
    }

    func multiDevicesChatThreadEventDidReceive(_ aEvent: AgoraChatMultiDevicesEvent, threadId aThreadId: String, ext aExt: Any?) {
        switch aEvent {
        case .chatThreadCreate:
            //The current user creates a message thread on other devices.
            break
        case .chatThreadDestroy:
            //The current user destroys the message thread on other devices.
            break
        case .chatThreadJoin:
            //The current user joins the message thread on other devices.
            break
        case .chatThreadLeave:
            //The current user leaves the message thread on other devices.
            break
        case .chatThreadUpdate:
            //The current user updates the message thread on other devices.
            break
        case .chatThreadKick:
            //The current user kicks a member out of the message thread on other devices.
            break
        default:
            break
        }
    }

    func multiDevicesConversationEvent(_ event: AgoraChatMultiDevicesEvent, conversationId: String, conversationType: AgoraChatConversationType) {
        switch event {
        case .conversationPinned:
            //The current user pins a conversation on other devices.
            break
        case .conversationUnpinned:
            //The current user unpins a conversation on other devices.
            break
        case .conversationDelete:
            //The current user deletes a conversation on other devices.
            break
            //The current user updates the conversation mark on other devices, including adding and removing conversation marks.
        case .conversationUpdateMark:
        default:
            break
        }
    }

    func multiDevicesMessageBeRemoved(_ conversationId: String, deviceId: String) {
        //The current user unidirectionally deletes message history of a conversation on other devices from the server.
    }
}

//Add a multi-device listener.
AgoraChatClient.shared().addMultiDevices(delegate: self, queue: nil)
```

### Web

### Get the login ID list of other login devices of the current user

Call `getSelfIdsOnOtherPlatform` to get the login ID list of other logged-in devices, and then select the target login ID as the message recipient to send messages to the specified device.

```javascript
chatClient.getSelfIdsOnOtherPlatform().then((res) => {
  console.log(
    res,
    "Successfully obtained the login ID list of other login devices of the current user"
  );
  // Select a login ID as the message recipient.
  const toUserId = res.data[0];
  // toUserId as the message recipient.
  const options = {
    type: "txt",
    msg: "message content",
    to: toUserId,
    chatType: "singleChat",
  };
  // Create a message.
  const msg = AgoraChat.message.create(options);
  // Send a message.
  chatClient.send(msg);
});
```

### Get operations on other devices

Call `addEventHandler` to register listener events and listen to operations on other devices. After the server synchronizes information, the SDK will call back these events, and both the web end and other ends will receive notifications of friend and group-related operations.

For these operations, multi-device events have the same name as the single-device events. The only difference is the `from` field in the event: It is the current user ID in multi-end multi-device events, and the operator ID in single-device events. See [Listen for chat group events​](/en/realtime-media/im/build/chat-group/manage-chat-groups#listen-for-chat-group-events) and [Listen for contact events](/en/realtime-media/im/build/contacts#listen-for-contact-events) for details.

In addition to friend and group events, the following events will trigger the `onMultiDeviceEvent` event:

```javascript
conn.addEventHandler("handlerId", {
  onContactAgreed: (event) => {},
  onGroupEvent: (event) => {},
  onMultiDeviceEvent: (event) => {
    switch (event.operation) {
      case "chatThreadCreate":
        //The current user creates a message thread on other devices.
        break;
      case "chatThreadDestroy":
        //The current user destroys the message thread on other devices.
        break;
      case "chatThreadJoin":
        //The current user joins the message thread on other devices.
        break;
      case "chatThreadLeave":
        //The current user leaves the message thread on other devices.
        break;
      case "chatThreadNameUpdate":
        //The current user updates the message thread on other devices.
        break;
      case "deleteRoaming":
        //The current user deletes the server conversation on other devices.
        break;
      case "memberAttributesUpdate":
        //The current user has updated the group member attributes on other devices.
        break;
      case "deleteRoaming":
        //The current user unidirectionally deletes message history of a conversation on other devices from the server.
        break;
      case "deleteConversation":
        //The current user has deleted a conversation on other devices.
        break;
      case "pinnedConversation":
        //The current user has pinned a conversation on other devices.
        break;
      case "unpinnedConversation":
        //The current user has unpinned a conversation on other devices.
        break;
      case "markConversation":
        //The current user has marked a conversation on other devices.
        break;
      case "unMarkConversation":
        //The current user has unmarked a conversation on other devices.
        break;
      default:
        break;
    }
  },
});
```

### Flutter

### Get the login ID list of other logged-in devices of the current user

Call `getSelfIdsOnOtherPlatform` to get the login ID list of other logged-in devices, and then select the target login ID as the message recipient to send a message to the specified device.

```dart
List ids =
    await ChatClient.getInstance.contactManager.getSelfIdsOnOtherPlatform();

// Select a login ID as the message sender.
String toChatUserId = ids.first;

// Create a text message, content is the message text, toChatUserId passes in the login ID as the message sender.
final msg = ChatMessage.createTxtSendMessage(
    targetId: toChatUserId, content: 'content');
// Send a message.
ChatClient.getInstance.chatManager.sendMessage(msg);
```

### Get the list of online logged-in devices for the specified account

Call `fetchLoggedInDevices` to get the list of online logged-in devices for the specified account from the server by passing in the user ID and user token.

```dart
List deviceInfos =
        await ChatClient.getInstance.fetchLoggedInDevices(
    userId: 'userId',
    pwdOrToken: 'token',
    isPwd: false,
);
```

### Force the specified account to log out from a single device

Call `kickDevice` and pass in the user ID and user token to force the specified account to log out from a single logged-in device. Before calling this method, obtain the device ID through the `ChatClient#fetchLoggedInDevices` and `DeviceInfo#getResource` methods.
The logged-out device will receive the `ConnectionEventHandler#onUserDidLoginTooManyDevice` event.

:::info
You can also use this interface without logging in.
:::

```dart
// userId: user ID, pwdOrToken: user token.
List deviceInfos =
        await ChatClient.getInstance.fetchLoggedInDevices(
    userId: 'userId',
    pwdOrToken: 'token',
    isPwd: false,
);
// userId: user ID, pwdOrToken: user token.
await ChatClient.getInstance.kickDevice(
    userId: 'userId',
    pwdOrToken: 'token',
    resource: deviceInfos[selectedIndex].resource!,
    isPwd: false,
);
```

### Force the specified account to log out from all devices

Call `kickAllDevices` and pass in the user ID and user token to force the specified account to log out from all logged-in devices.

The logged-out device will receive the `ConnectionEventHandler#onUserDidLoginTooManyDevice` event.

:::info
You can also use this interface without logging in.
:::

```dart
// userId: user ID, pwdOrToken: user token.
await ChatClient.getInstance.kickAllDevices(
    userId: 'userId',
    pwdOrToken: 'pwdOrToken',
    isPwd: false,
);
```

### Get operations on other devices

Let's say that account A logs in on devices A and B at the same time and performs operations on device A. Device B will receive notifications corresponding to these operations.

You need to implement the `ChatMultiDeviceEventHandler` class to listen to operations on other devices, and then call the `addMultiDeviceEventHandler` method to add multi-device listening.

```dart
//Implement `ChatMultiDeviceEventHandler` to monitor operations on other devices.
private class ChatMultiDeviceListener implements MultiDeviceListener {
final eventHandler = ChatMultiDeviceEventHandler(
    onContactEvent: (event, userId, ext) {
        switch (event) {
            //The current user deletes friends on other devices.
            case ChatMultiDevicesEvent.CONTACT_REMOVE:
            break;
            //The current user accepts friend requests on other devices.
            case ChatMultiDevicesEvent.CONTACT_ACCEPT:
            break;
            //The current user rejects friend requests on other devices.
            case ChatMultiDevicesEvent.CONTACT_DECLINE:
            break;
            //The current user adds a user to the blocklist on other devices.
            case ChatMultiDevicesEvent.CONTACT_BAN:
            break;
            //The current user removes a user from the blocklist on other devices.
            case ChatMultiDevicesEvent.CONTACT_ALLOW:
            break;
            default:
        }
    },
    onGroupEvent: (event, groupId, userIds) {
        switch (event) {
            //The current user created a group on another device.
            case ChatMultiDevicesEvent.GROUP_CREATE:
            break;
            //The current user destroyed the group on another device.
            case ChatMultiDevicesEvent.GROUP_DESTROY:
            break;
            //The current user joined the group on another device.
            case ChatMultiDevicesEvent.GROUP_JOIN:
            break;
            //The current user left the group on another device.
            case ChatMultiDevicesEvent.GROUP_LEAVE:
            break;
            //The current user initiated a group application on another device.
            case ChatMultiDevicesEvent.GROUP_APPLY:
            break;
            //The current user agreed to the group application on another device.
            case ChatMultiDevicesEvent.GROUP_APPLY_ACCEPT:
            break;
            //The current user rejected the group application on another device.
            case ChatMultiDevicesEvent.GROUP_APPLY_DECLINE:
            break;
            //The current user invited group members on another device.
            case ChatMultiDevicesEvent.GROUP_INVITE:
            break;
            //The current user has accepted the invitation to join the group on other devices.
            case ChatMultiDevicesEvent.GROUP_INVITE_ACCEPT:
            break;
            //The current user has rejected the invitation to join the group on other devices.
            case ChatMultiDevicesEvent.GROUP_INVITE_DECLINE:
            break;
            //The current user has kicked members out of the group on other devices.
            case ChatMultiDevicesEvent.GROUP_KICK:
            break;
            //The current user has added members to the group blocklist on other devices.
            case ChatMultiDevicesEvent.GROUP_BAN:
            break;
            //The current user has removed members from the group blocklist on other devices.
            case ChatMultiDevicesEvent.GROUP_ALLOW:
            break;
            //The current user has blocked the group on other devices.
            case ChatMultiDevicesEvent.GROUP_BLOCK:
            break;
            //The current user has unblocked the group on other devices.
            case ChatMultiDevicesEvent.GROUP_UNBLOCK:
            break;
            //The current user transfers group ownership on other devices.
            case ChatMultiDevicesEvent.GROUP_ASSIGN_OWNER:
            break;
            //The current user adds an administrator on other devices.
            case ChatMultiDevicesEvent.GROUP_ADD_ADMIN:
            break;
            //The current user removes the administrator on other devices.
            case ChatMultiDevicesEvent.GROUP_REMOVE_ADMIN:
            break;
            //The current user mutes users on other devices.
            case ChatMultiDevicesEvent.GROUP_ADD_MUTE:
            break;
            //The current user removes the muting on other devices.
            case ChatMultiDevicesEvent.GROUP_REMOVE_MUTE:
            break;
            //The current user sets custom attributes for group members on other devices.
            case ChatMultiDevicesEvent.GROUP_MEMBER_ATTRIBUTES_CHANGED:
            break;
            default:
        }
    },
    onChatThreadEvent: (event, chatThreadId, userIds) {
        switch (event) {
            case ChatMultiDevicesEvent.CHAT_THREAD_CREATE:
            //The current user creates a message thread on other devices.
            break;
            case ChatMultiDevicesEvent.CHAT_THREAD_DESTROY:
            //The current user destroys the message thread on other devices.
            break;
            case ChatMultiDevicesEvent.CHAT_THREAD_JOIN:
            //The current user joins the message thread on other devices.
            break;
            case ChatMultiDevicesEvent.CHAT_THREAD_LEAVE:
            //The current user leaves the message thread on other devices.
            break;
            case ChatMultiDevicesEvent.CHAT_THREAD_UPDATE:
            //The current user updates the message thread on other devices.
            break;
            case ChatMultiDevicesEvent.CHAT_THREAD_KICK:
            //The current user kicks a member out of the message thread on other devices.
            break;
            default:
        }
    },
    onConversationEvent: (event, conversationId, type) {
        switch (event) {
            case ChatMultiDevicesEvent.CONVERSATION_PINNED:
            //The current user pins a conversation on other devices
            break;
            case ChatMultiDevicesEvent.CONVERSATION_UNPINNED:
            //The current user unpins a conversation on other devices
            break;
            case ChatMultiDevicesEvent.CONVERSATION_DELETE:
            //The current user deletes a conversation on other devices
            break;
            default:
        }
    },
    onRemoteMessagesRemoved: (conversationId, deviceId) {
        //The current user unidirectionally deletes message history of a conversation on other devices from the server.
    },
);

//Add a multi-device listener.
ChatClient.getInstance.addMultiDeviceEventHandler(
    "UNIQUE_HANDLER_ID",
    eventHandler,
);
//Remove a multi-device listener.
ChatClient.getInstance.removeMultiDeviceEventHandler('UNIQUE_HANDLER_ID');
}
```

### React Native

### Get the login ID list of other logged-in devices of the current user

Call `getSelfIdsOnOtherPlatform` to get the login ID list of other logged-in devices, and then select the target login ID as the message recipient to send a message to the specified device.

```typescript
ChatClient.getInstance()
    .contactManager.getSelfIdsOnOtherPlatform()
    .then((ids) => {
        console.log("get ids success.", ids);
        // content: set text content
// targetId: asynchronous result from `getSelfIdsOnOtherPlatform` method
// chatType: conversation type
const targetId = ids[0];
const msg = ChatMessage.createTextMessage(targetId, content, chatType);
// execute message sending
ChatClient.getInstance()
    .chatManager.sendMessage(msg！, new ChatMessageCallback())
    .then(() => {
        // message sending action completed, log will be printed here.
        // message sending result is returned through callback
        console.log("send message operation success.");
    })
    .catch((reason) => {
        // If the message sending operation fails, the log will be printed here.
        console.log("send message operation fail.", reason);
    });
    })
    .catch((reason) => {
        console.log("get ids fail.", reason);
    });
```

### Get the list of online logged-in devices for the specified account

Call `getLoggedInDevicesFromServer` to get the list of online logged-in devices for the specified account from the server by passing in the user ID and user token.

```typescript
// userId: user ID.
// pwdOrToken: user token
ChatClient.getInstance()
    .getLoggedInDevicesFromServer(userId, pwdOrToken, isPassword)
    .then((result) => {
        console.log("devices list:", result);
    })
    .catch((error) => {
        console.warn(error);
    });
```

### Force the specified account to log out from a single device

Call `kickDevice` and pass in the user ID and user token to force the specified account to log out from a single logged-in device. Before calling this method, obtain the device ID through the `ChatClient#getLoggedInDevicesFromServer` method. The logged-out device will receive the `ChatConnectEventListener#onUserDidLoginFromOtherDevice` event.

:::info
You can also use this interface without logging in.
:::

```typescript
// The device ID can be obtained through `getLoggedInDevicesFromServer`.
const deviceInfo = await ChatClient.getInstance().getLoggedInDevicesFromServer(
    userId,
    pwdOrToken,
    isPassword
);
ChatClient.getInstance()
    .kickDevice(userId, pwdOrToken, deviceInfo.resource, isPassword)
    .then(() => {
        console.log("success");
    })
    .catch((error) => {
        console.warn(error);
    });
```

### Force the specified account to log out from all devices

Call `kickAllDevices` and pass in the user ID and user token to force the specified account to log out from all logged-in devices.  The logged-out device will receive the `ChatConnectEventListener#onUserDidLoginFromOtherDevice` event.

:::info
You can also use this interface without logging in.
:::

```typescript
ChatClient.getInstance()
    .kickAllDevices(userId, pwdOrToken, isPassword)
    .then(() => {
        console.log("success");
    })
    .catch((error) => {
        console.warn(error);
    });
```

### Get operations on other devices

Let's say that account A logs in on devices A and B at the same time and performs operations on device A. Device B will receive notifications corresponding to these operations.

You need to implement the `ChatMultiDeviceEventListener` class to listen to operations on other devices, and then set up multi-device listeners.

```typescript
let listener: ChatMultiDeviceEventListener = new (class
    implements ChatMultiDeviceEventListener
{
    onContactEvent?(
        event?: ChatMultiDeviceEvent,
        target?: string,
        ext?: string
    ): void {
        // Friend-related multi-device notification.
        switch (event) {
            // The current user deletes friends on other devices.
            case CONTACT_REMOVE:
                break;
            // The current user accepts friend requests on other devices.
            case CONTACT_ACCEPT:
                break;
            // The current user rejects friend requests on other devices.
            case CONTACT_DECLINE:
                break;
            // The current user adds friends to the blocklist on other devices.
            case CONTACT_BAN:
                break;
            // The current user removes friends from the blocklist on other devices.
            case CONTACT_ALLOW:
                break;
        }
    }

    onGroupEvent?(
        event?: ChatMultiDeviceEvent,
        target?: string,
        usernames?: Array
    ): void {
        // Group-related multi-device notifications.
        switch (event) {
            //The current user created a group on another device.
            case GROUP_CREATE:
                break;
            //The current user destroyed the group on another device.
            case GROUP_DESTROY:
                break;
            //The current user joined the group on another device.
            case GROUP_JOIN:
                break;
            //The current user left the group on another device.
            case GROUP_LEAVE:
                break;
            //The current user initiated a group application on another device.
            case GROUP_APPLY:
                break;
            //The current user agreed to the group application on another device.
            case GROUP_APPLY_ACCEPT:
                break;
            //The current user rejected the group application on another device.
            case GROUP_APPLY_DECLINE:
                break;
            //The current user invited group members on another device.
            case GROUP_INVITE:
                break;
            //The current user agreed to the group invitation on another device.
            case GROUP_INVITE_ACCEPT:
                break;
            //The current user rejected the invitation to join the group on other devices.
            case GROUP_INVITE_DECLINE:
                break;
            //The current user kicked members out of the group on other devices.
            case GROUP_KICK:
                break;
            //The current user added members to the group blocklist on other devices.
            case GROUP_BAN:
                break;
            //The current user removed members from the group blocklist on other devices.
            case GROUP_ALLOW:
                break;
            //The current user blocked the group on other devices.
            case GROUP_BLOCK:
                break;
            //The current user unblocked the group on other devices.
            case GROUP_UNBLOCK:
                break;
            //The current user transferred group ownership on other devices.
            case GROUP_ASSIGN_OWNER:
                break;
            //The current user added an administrator on other devices.
            case GROUP_ADD_ADMIN:
                break;
            //The current user removed the administrator on other devices.
            case GROUP_REMOVE_ADMIN:
                break;
            //The current user mutes users on other devices.
            case GROUP_ADD_MUTE:
                break;
            //The current user removes muting on other devices.
            case GROUP_REMOVE_MUTE:
                break;
            //The current user sets custom attributes for group members on other devices.
            case GROUP_METADATA_CHANGED:
                break;
                default:
                break;
            }
        }

    onThreadEvent?(
        event?: ChatMultiDeviceEvent,
        target?: string,
        usernames?: Array
    ): void {
        //Multi-device notification of message thread messages.
        switch (event) {
            case THREAD_CREATE:
                //The current user creates a message thread on other devices.
                break;
            case THREAD_DESTROY:
                //The current user destroys a message thread on other devices.
                break;
            case THREAD_JOIN:
                //The current user joins a message thread on other devices.
                break;
            case THREAD_LEAVE:
                //The current user leaves the message thread on other devices.
                break;
            case THREAD_UPDATE:
                //The current user updates the message thread on other devices.
                break;
            case THREAD_KICK:
                //The current user kicks members out of the message thread on other devices.
                break;
        }
    }

    onMessageRemoved?(convId?: string, deviceId?: string): void {
        //Roaming message deletion notification.
    }

    onConversationEvent?(
        event?: ChatMultiDeviceEvent,
        convId?: string,
        convType?: ChatConversationType
    ): void {
        //Conversation change notification.
        switch (event) {
            case CONVERSATION_PINNED:
                //The current user pins a conversation on other devices.
                break;
            case CONVERSATION_UNPINNED:
                //The current user unpins a conversation on other devices.
                break;
            case CONVERSATION_DELETED:
                //The current user deletes a conversation on other devices.
                break;
                default:
                break;
        }
    }
})();

//Remove a multi-device listener.
ChatClient.getInstance().removeAllMultiDeviceListener();

//Add a multi-device listener.
ChatClient.getInstance().addMultiDeviceListener(listener);
```

### Unity

### Windows
