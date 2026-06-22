---
title: "Configure push notifications"
description: "Configure push translations"
---

### Android

You can use extension fields to implement customized push settings. This page uses force push and sending silent messages as examples to explain how to implement push extensions. For more information, see [Offline push notification extension](../../restful-api/offline-push/offline-push-extension).

## Set custom push fields

When creating a push message, you can add custom fields to the message to meet personalized business needs:

```java
// This example takes text messages as an example. The setting methods for message types such as pictures and files are the same.
ChatMessage message = ChatMessage.createSendMessage(ChatMessage.Type.TXT);
// Set custom push extension.
JSONObject emPushExt = new JSONObject() {
   {
        put("custom", new JSONObject() {
            {
                put("key1", "value1");
                put("key2", "value2");
            }
        });
    }
};
// Set the push extension to the message.
message.setAttribute("em_push_ext", emPushExt);
```

The data structure of the custom field is as follows:

```json
{
    "em_push_ext": {
        "custom": {
            "key1": "value1",
            "key2": "value2"
        }
    }
}
```

| Parameters              | Description                |
| :--------------- | :----------------- |
|  `em_push_ext`   | The extension fixed value, cannot be modified.     |
|  `custom`          | The message extension. Use the extension method to add custom fields to the push, the value is fixed. |
|  `key1`/`key2`     | Customize the specific content of the message push extension. |

## Force push

The user can set force push to ignore the recipient's DND setting when sending messages:

```java
// This example takes text messages as an example. The setting methods for message types such as pictures and files are the same.
ChatMessage message = ChatMessage.createSendMessage(ChatMessage.Type.TXT);
// Set whether to force push. This field is a built-in extension field with the following values: `true`: force push; (default) `false`: non-force push.
message.setAttribute("em_force_notification", true);
```

## Send a silent message

Sending silent messages means that the sender sets the message not to be pushed when sending it. That is, when the user is offline, Chat will not push message notifications to the user's device through the FCM push service. When the user is online again, they will receive all the messages received during the offline period.

Both silent message sending and do not disturb mode pause push messages. The difference is that silent message sending is set by the sender when sending the message, while the DND mode is set by the receiver.

```java
// This example takes text messages as an example. The setting methods for message types such as pictures and files are the same.
ChatMessage message = ChatMessage.createSendMessage(ChatMessage.Type.TXT);
// Set whether to send silent messages. This field is a built-in extension field with the following values: `true`: send silent messages; (default) `false`: push the message.
message.setAttribute("em_ignore_notification", true);
```

### iOS

You can use extension fields to implement customized push settings. This page uses force push, sending silent messages, and rich text push as examples to explain how to implement push extensions. For more information, see [Offline push notification extension](../../restful-api/offline-push/offline-push-extension).

## Set custom push fields

When creating a push message, you can add custom fields to the message to meet personalized business needs:

```objective-c
AgoraChatTextMessageBody *body = [[AgoraChatTextMessageBody alloc] initWithText:@"test"];
    NSString* currentUsername = AgoraChatClient.sharedClient.currentUsername;
    NSString* conversationId = @"remoteId";
    AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:conversationId from:currentUsername to:conversationId body:body ext:nil];
    message.ext = @{@"em_apns_ext":@{@"extern":@{@"test":123}}};
    message.chatType = AgoraChatTypeChat;
    [AgoraChatClient.sharedClient.chatManager sendMessage:message progress:nil completion:nil];
```
The data structure of the custom field is as follows:

```json
{
    "em_apns_ext": {
      "extern": {"test": 123}
    }
}
```

| Parameters              | Description                 |
| :--------------- | :------------------ |
|  `em_apns_ext`   |     The built-in message extension fields.       |
|  `extern`        | The user-added custom key; multiple keys can be added. |

## Custom ringtones

When creating a push message, you can customize the notification tone when the recipient receives the message. Add the audio file to the app and configure its name used in the push. For details, see [Apple documentation](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification?language=objc).

```objective-c
AgoraChatTextMessageBody *body = [[AgoraChatTextMessageBody alloc] initWithText:@"test"];
    AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:conversationId from:AgoraChatClient.sharedClient.currentUsername to:conversationId body:body ext:nil];
    message.ext = @{@"em_apns_ext":@{@"em_push_sound":@"custom.caf"}};
    message.chatType = AgoraChatTypeChat;
    [AgoraChatClient.sharedClient.chatManager sendMessage:message progress:nil completion:nil];
```
The data structure of the custom ringtone field is as follows:

```json
{
  "ext": {
    "em_apns_ext": {
      "em_push_sound":"custom.caf"
    }
  }
}
```

| Parameters              | Description                  |
| :--------------- | :------------------- |
|  `em_apns_ext` |    The built-in message extension fields.        |
|  `em_push_sound` | The key of the custom reminder ringtone field. This field is a built-in field and cannot be modified. |
|  `custom.caf`      | The name of the audio file for the ringtone. |

## Force push

The user can set force push to ignore the recipient's DND setting when sending messages:

```objective-c
AgoraChatTextMessageBody *body = [[AgoraChatTextMessageBody alloc] initWithText:@"test"];
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:conversationId from:AgoraChatClient.sharedClient.currentUsername to:conversationId body:body ext:nil];
// Set whether to force push. This extension field is a built-in field with the following values: ` YES ` : force push; (default) ` NO ` : non-force push.
message.ext = @{@"em_force_notification":@YES};
message.chatType = AgoraChatTypeChat;
[AgoraChatClient.sharedClient.chatManager sendMessage:message progress:nil completion:nil];
```

## Send a silent message

Sending silent messages means that the sender sets the message not to be pushed when sending it. That is, when the user is offline, Chat will not push message notifications to the user's device through the third-party push service. When the user is online again, they will receive all the messages received during the offline period.

Both silent message sending and do not disturb mode pause push messages. The difference is that silent message sending is set by the sender when sending the message, while the DND mode is set by the receiver.

```objective-c
AgoraChatTextMessageBody *body = [[AgoraChatTextMessageBody alloc] initWithText:@"test"];
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:conversationId from:AgoraChatClient.sharedClient.currentUsername to:conversationId body:body ext:nil];
// Set whether to send silent messages. This field is a built-in extension field with the following values: `YES`: send silent messages; (default) `NO`: push the message.
message.ext = @{@"em_ignore_notification":@YES};
message.chatType = AgoraChatTypeChat;
[AgoraChatClient.sharedClient.chatManager sendMessage:message progress:nil completion:nil];
```

## Implement rich text push

If your target platform is iOS 10.0 or above, you can refer to the following code to implement the rich text push function of [`UNNotificationServiceExtension`](https://developer.apple.com/documentation/usernotifications/unnotificationserviceextension?language=objc).

```objective-c
AgoraChatTextMessageBody *body = [[AgoraChatTextMessageBody alloc] initWithText:@"test"];
AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:conversationId from:AgoraChatClient.sharedClient.currentUsername to:conversationId body:body ext:nil];
// em_apns_ext: message extension field
message.ext = @{@"em_apns_ext":@{@"em_push_mutable_content":@YES}};
message.chatType = AgoraChatTypeChat;
[AgoraChatClient.sharedClient.chatManager sendMessage:message progress:nil completion:nil];
```

| Parameters | Description |
| :------------------------ | :----------------------------- |
| `body` | The push message content. |
| `conversationId` | The conversation ID to which the message belongs. |
| `from` | The user ID of the sender of the message. |
| `to` | The user ID of the message recipient. |
| `em_apns_ext` | The built-in message extension fields. |
| `em_push_mutable_content` | Whether to use rich text push notification (`em_apns_ext`): `YES`: Rich text push notification; (Default)`NO`: Regular push notification. This field is a built-in field and its name cannot be modified. |

When the receiver gets a rich text push, the `didReceiveNotificationRequest:withContentHandler:` callback is triggered. The sample code is as follows:

```objective-c
- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    // Push extension fields
    NSDictionary *userInfo = request.content.userInfo;
    // Notification content
    UNNotificationContent *content = [request.content mutableCopy];
    contentHandler(content);
}
```

| Parameters               | Description                                                |
| :---------------- | :------------------------------------------------- |
|  `body` |            The push message content.                                     . |
|  `badge`            | The square badge number.                                            |
|  `sound`            | The recipient will hear a ringtone when receiving the message.                            |
|  `mutable-content`  | Set to `1` to activate `UNNotificationServiceExtension` . |
|  `f`                | The user ID of the message sender.                                  |
|  `t`                | The user ID of the message recipient.                                  |
|  `m` |                The message ID.                                           |

### Web

You can use extension fields to implement force push and send silent messages. For more information, see [Offline push notification extension](../../restful-api/offline-push/offline-push-extension).

### Force push

The user can set force push to ignore the recipient's DND setting when sending messages:

```javascript
// The following takes text messages as an example. The setting methods for other types of messages are the same.
const sendTextMsg = () => {
  const options: AgoraChat.CreateTextMsgParameters = {
    chatType: chatType,
    type: "txt",
    to: targetUserId,
    msg: msgContent,
    ext: {
      // Set whether to force push. This field is a built-in field with the following values: `YES`: force push; (default) `NO`: non-force push.
      em_force_notification: "YES",
    },
  };
  const msg = AgoraChat.message.create(options);
  chatClient.send(msg);
};
```

### Send a silent message

A silent message means that when a user is offline, Chat will not push notifications to the user's device through the push service. Therefore, the user will not receive message push notifications. When the user is online again, they will receive all the messages received during the offline period.

Both silent message sending and do not disturb mode pause push messages. The difference is that silent message sending is set by the sender when sending the message, while do not disturb mode is set by the receiver.

```javascript
// The following takes text messages as an example. The setting methods for other types of messages are the same.
const sendTextMsg = () => {
  const options: AgoraChat.CreateTextMsgParameters = {
    chatType: chatType,
    type: "txt",
    to: targetUserId,
    msg: msgContent,
    ext: {
      // Set whether to send silent messages. This field is a built-in field with the following values: `YES`: send silent messages; (default) `NO`: push the message.
      em_ignore_notification: "NO",
    },
  };
  const msg = AgoraChat.message.create(options);
  chatClient.send(msg);
};
```

### Flutter

You can use extension fields to implement customized push settings. This page uses force push and sending silent messages as examples to explain how to implement push extensions. For more information, see [Offline push notification extension](../../restful-api/offline-push/offline-push-extension).

## Set custom push fields

When creating a push message, you can add custom fields to the message to meet personalized business needs:

```dart
// This example takes text messages as an example. The setting methods for message types such as pictures and files are the same.
ChatMessage msg = ChatMessage.createTxtSendMessage(
  targetId: 'receiveId',
  content: 'content',
);
msg.attributes = {
  // Set the push extension to the message.
  "em_push_ext": {
        "custom": {
            "key1": "value1",
            "key2": "value2"
        }
    }
};
try {
  await ChatClient.getInstance.chatManager.sendMessage(msg);
} on ChatError catch (e) {}
```

The data structure of the custom field is as follows:

```json
{
    "em_push_ext": {
        "custom": {
            "key1": "value1",
            "key2": "value2"
        }
    }
}
```

| Parameters              | Description                |
| :--------------- | :----------------- |
|  `em_push_ext`   | The extension fixed value, cannot be modified.     |
|  `custom`          | The message extension. Use the extension method to add custom fields to the push, the value is fixed. |
|  `key1`/`key2`     | Customize the specific content of the message push extension. |

## Force push

The user can set force push to ignore the recipient's DND setting when sending messages:

```dart
// This example takes text messages as an example. The setting methods for message types such as pictures and files are the same.
ChatMessage msg = ChatMessage.createTxtSendMessage(
  targetId: 'receiveId',
  content: 'content',
);
msg.attributes = {
  'em_force_notification': true,
};
try {
  await ChatClient.getInstance.chatManager.sendMessage(msg);
} on ChatError catch (e) {}
```

## Send a silent message

Sending silent messages means that the sender sets the message not to be pushed when sending it. That is, when the user is offline, Chat will not push message notifications to the user's device through the FCM push service. When the user is online again, they will receive all the messages received during the offline period.

Both silent message sending and do not disturb mode pause push messages. The difference is that silent message sending is set by the sender when sending the message, while the DND mode is set by the receiver.

```dart
// This example takes text messages as an example. The setting methods for message types such as pictures and files are the same.
ChatMessage msg = ChatMessage.createTxtSendMessage(
  targetId: 'receiveId',
  content: 'content',
);
msg.attributes = {
  'em_ignore_notification': true,
};
try {
  await ChatClient.getInstance.chatManager.sendMessage(msg);
} on ChatError catch (e) {}
```

### React Native

You can use extension fields to implement customized push settings. This page uses force push and sending silent messages as examples to explain how to implement push extensions. For more information, see [Offline push notification extension](../../restful-api/offline-push/offline-push-extension).

## Set custom push fields

When creating a push message, you can add custom fields to the message to meet personalized business needs:

```typescript
msg.attributes = {
  // Message extension fields.
   "em_push_ext": {
        "custom": {
            "key1": "value1",
            "key2": "value2"
        }
    },
};
```

The data structure of the custom field is as follows:

```json
{
    "em_push_ext": {
        "custom": {
            "key1": "value1",
            "key2": "value2"
        }
    }
}
```

| Parameters              | Description                |
| :--------------- | :----------------- |
|  `em_push_ext` | The fixed extension value, cannot be modified.     |
|  `custom`          | The message extension. Use the extension method to add custom fields to the push. The value is fixed. |
|  `key1`/`key2`     | Customize the specific content of the message push extension. |

## Force push

The user can set force push to ignore the recipient's DND setting when sending messages:

```typescript
// The following takes text messages as an example. The setting methods for other types of messages are the same.
msg.attributes = {
  // Whether to force push. This field is a built-in field, and the values are as follows: `true`: force push; (default) `false`: non-force push.
  em_force_notification: true,
};
```

## Send a silent message

Sending silent messages means that the sender sets the message not to be pushed when sending it. That is, when the user is offline, Chat will not push message notifications to the user's device through the FCM push service. When the user is online again, they will receive all the messages received during the offline period.

Both silent message sending and do not disturb mode pause push messages. The difference is that silent message sending is set by the sender when sending the message, while the DND mode is set by the receiver.

```typescript
// The following takes text messages as an example. The setting methods for other types of messages are the same.
msg.attributes = {
  // Whether to send a silent message. This field is a built-in field, and the values are as follows: `true`: send a silent message; (default) `false`: push the message.
  em_ignore_notification: true,
};
```

### Windows, Unity

**This feature is not supported for this platform.**
