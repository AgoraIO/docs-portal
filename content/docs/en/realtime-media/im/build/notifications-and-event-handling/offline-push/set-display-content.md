---
title: "Set display content"
description: "Set the display content of a push notification"
---

### Android

You can configure the push title and content displayed in the notification bar in the following ways, with the configuration priority from low to high:

1. Configure the display attributes of push notifications;
1. Use the default push template;
1. Use message extension fields;
1. Use a custom push template.

## Configure the display attributes of push notifications

Call `updatePushNickname` and `updatePushDisplayStyle` to configure the nickname (`nickname`) and notification display style (`DisplayStyle`), which includes the push title and content in the notification bar.

This nickname indicates the nickname of the message sender that is displayed in the push notification bar of the recipient's client when a message from the user is pushed. The nickname can be different from the nickname in user attributes. However, Agora recommends that you use the same nickname for both. Therefore, if either nickname is updated, the other should be changed at the same time. To update the nickname in user attributes, see [Set user attributes](..//en/realtime-media/im/build/build-core-messaging/user-attributes#set-user-attributes).

```java
// Asynchronous processing is required.
ChatClient.getInstance().pushManager().updatePushNickname("nickname");
```

```java
PushManager.DisplayStyle displayStyle = PushManager.DisplayStyle.SimpleBanner;
// Asynchronous processing is required.
ChatClient.getInstance().pushManager().updatePushDisplayStyle(displayStyle);
```

Call `getPushConfigsFromServer` to get the display attributes for push notifications, as shown in the following example:

```java
PushConfigs pushConfigs = ChatClient.getInstance().pushManager().getPushConfigsFromServer();
// Get the nickname displayed in the push notification.
String nickname = pushConfigs.getDisplayNickname();
// Get the display style of the push notification.
PushManager.DisplayStyle style = pushConfigs.getDisplayStyle();
```

To display the message content in the notification bar, set the notification display style (`DisplayStyle`). This parameter has the following two settings:

- (Default) `SimpleBanner`: Regardless of whether `nickname` is set, for any type of message pushed, the notification bar uses the default display setting, that is, the push title is "You have a new message" and the push content is "Please click to view".
-  `MessageSummary`: Displays the message content. The nickname you set only takes effect when `DisplayStyle` is `MessageSummary`, not `SimpleBanner`.

The following table uses a one-to-one chat text message as an example to introduce the settings of the display attributes.

For group chats, "Push nickname of message sender" and "Chat user ID of message sender" in the table below are displayed as "Group ID".

| Parameter settings       | Push display | Image     |
| :--------- | :----- |:------------- |
| `DisplayStyle`: (default) `SimpleBanner`  `nickname`: Set or not set |  Push title: "You have a new message"  Push content: "Please click to view"  | ![push_displayattribute_1](/images/im/push_displayattribute_1.png) |
|  `DisplayStyle`: `MessageSummary`  `nickname`: Set specific value  |  Push title: "You have a new message"  Push content: "Push nickname of the message sender: message content"  | ![push_displayattribute_2](/images/im/push_displayattribute_2.png)      |
|  `DisplayStyle`: `MessageSummary`  `nickname`: Not set  |  Push title: “You have a new message”  Push content: “Message sender's Chat user ID: message content” | ![push_displayattribute_3](/images/im/push_displayattribute_3.png)          |

## Use the default push template

The default push template is mainly used when the default configuration provided by the server does not meet your needs. It allows you to set the global push title and push content. For example, the default settings provided by the server are push titles and content in  English. If you need to use push titles and content in another language, you can set the push template in the corresponding language.

To use the default template, create a default push template in [Agora Console](https://console.agora.io/v2) or [call RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration). The template name is `default`. After setting, the default template is automatically used when pushing messages, and there is no need to enter the template name when creating messages.

Follow the steps below to create a default push template in [Agora Console](https://console.agora.io/v2):

1. Log in to [Agora Console](https://console.agora.io/v2) and click **Project Management** in the left navigation bar.
1. On the **Project Management** page, click **Config** in the **Action** column for the project that has Chat enabled.
1. On the **Edit Project** page, in the **Features** area, click **Enable / Config** for Chat.
1. On the project configuration page, select **Features** > **Push Template**, click **Add Push Template**, and configure the fields in the pop-up dialog box, as shown in the following figure:

    ![push_add_template](/images/im/push_add_template.png)

1. Set the **Template Name** to **default**, then set the **Title** and **Content** parameters, and click **OK**.

    | Parameter       | Type | Description | Required |
    | :--------- | :----- | :----- | :----- |
    |  **Template Name**    | String   | The push template name. The default template is **default**.        | Yes |
    |  **Title**      | Array | The push title. Can be set in the following ways: Enter a fixed push title. Use built-in variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not need to pass in this parameter when creating a message. The server automatically obtains it. The third setting method needs to be passed in through the extension field.   | Yes |
    |  **Content**    | Array | The push content. Can be set in the following ways: Enter fixed push content. Use variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not require parameters to be passed in when creating a message. The server automatically obtains them. The third setting method needs to be passed in through the extension field. | Yes |

## Use message extension fields

When creating a push message, you can set the `em_push_title` and `em_push_content` message extension fields to customize the push title and content, respectively.

```java
// This takes text messages as an example. The setting methods for message types such as images and files are the same.
ChatMessage message = ChatMessage.createSendMessage(ChatMessage.Type.TXT);
// Set custom push display.
JSONObject extObject = new JSONObject();
try {
    extObject . put( " em_push_title " , " custom push title " ); // Custom push message title. This field is a built-in field and the field name cannot be modified.
    extObject . put( " em_push_content " , " custom push content " ); // Custom push message content. This field is a built-in field and the field name cannot be modified.
} catch (JSONException e) {
    e.printStackTrace();
}
// Set the push extension to the message. This field is a built-in push extension field.
message.setAttribute("em_apns_ext", extObject);
```

The data structure of the custom display field is as follows:

```java
{
    "em_apns_ext": {
        "em_push_title": "custom push title",
        "em_push_content": "custom push content"
    }
}
```

## Use a custom push template

The steps to use a custom push template are as follows:

1. If you use a custom push template, create it in [Agora Console](https://console.agora.io/v2) or call [RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration#create-a-push-template). For a description of the parameters in the **Add Push Template** dialog box, see the section about using the default template. When using a custom template, regardless of how the **Title** and **Content** parameters are set, they must be passed in through the extension fields when creating a message.

1. When creating a message, pass in the template name, push title, and push content by using the extension fields. The push title and content in the notification bar use the formats in the template, respectively.

    ```java
    // The following takes text messages as an example. The setting methods for other types of messages are the same.
    ChatMessage message = ChatMessage.createSendMessage(ChatMessage.Type.TXT);
    TextMessageBody txtBody = new TextMessageBody("message content");
    // Set the push notification recipient. For one-to-one chats, it is the recipient's user ID; for group chats, it is the group ID.
    message.setTo("receiver");
    // Use the push template.
    JSONObject pushObject = new JSONObject();
    JSONArray titleArgs = new JSONArray();
    JSONArray contentArgs = new JSONArray();
    try {
            // Set the push template name.
            pushObject.put("name", "test6");
            // Set the value array of the push title in the template. If the push title specified in the template is a placeholder, you can customize the title here; if the specified title is a fixed value, the title will be a fixed value when using this template.
            titleArgs.put("test1");
            //...
            pushObject.put("title_args", titleArgs);
            // Set the value array of the pushed content in the template. If the template content specified in the template is a placeholder, you can customize the content here; if the specified content is a fixed value, the content will be a fixed value when using the template.
            contentArgs.put("$fromNickname");
            contentArgs.put("$msg");
            //...
            pushObject.put("content_args", contentArgs);
    } catch (JSONException e) {
            e.printStackTrace();
    }
    // Add the push template to the message.
    message.setAttribute("em_push_template", pushObject);
    // Set the message status callback.
    message.setMessageStatusCallback(new CallBack() {...});
    // Send the message.
    ChatClient.getInstance().chatManager().sendMessage(message);
    ```

The JSON structure of the push template is as follows:

```json
    "em_push_template":{
            "name":"test6",
            "title_args":[
                "test1"
            ],
            "content_args":[
                "{$fromNickname}",
                "{$msg}"
            ]
    }
    ```

The message receiver can call the `setPushTemplate` method to pass in the push template name and select the template to use.

If the sender uses a push template when sending a message, the content displayed in the push notification bar is based on the sender's push template.

    ```java
    ChatClient.getInstance().pushManager().setPushTemplate("Template Name", new CallBack() {
        @Override
        public void onSuccess() {

        }

        @Override
        public void onError(int code, String error) {

        }
    });
    ```

### iOS

You can configure the push title and content displayed in the notification bar in the following ways, with the configuration priority from low to high:

1. Configure the display attributes of push notifications;
1. Use the default push template;
1. Use message extension fields;
1. Use a custom push template.

## Configure the display attributes of push notifications

Call `updatePushDisplayName` and `updatePushDisplayStyle` methods to set the nickname (`displayName`) and notification display style (`pushDisplayStyle`), which includes the push title and content in the notification bar.

This nickname indicates the nickname of the message sender that is displayed in the push notification bar of the recipient's client when a message from the user is pushed. The nickname can be different from the nickname in user attributes. However, Agora recommends that you use the same nickname for both. Therefore, if either nickname is updated, the other should be changed at the same time. To update the nickname in user attributes, see [Set user attributes](..//en/realtime-media/im/build/build-core-messaging/user-attributes#set-user-attributes).

```objective-c
[AgoraChatClient.sharedClient.pushManager updatePushDisplayName:@"displayName" completion:^(NSString * aDisplayName, AgoraChatError * aError) {
    if (aError)
    {
        NSLog(@"update push display name error: %@", aError.errorDescription);
    }
}];
```

```objective-c
[AgoraChatClient.sharedClient.pushManager updatePushDisplayStyle:AgoraChatPushDisplayStyleSimpleBanner completion:^(AgoraChatError * aError)
{
    if(aError)
    {
        NSLog(@"update display style error --- %@", aError.errorDescription);
    }
}];
```

Call `getPushNotificationOptionsFromServerWithCompletion` to get the display attributes for a push notification, as shown in the following code example:

```objective-c
[AgoraChatClient.sharedClient.pushManager getPushNotificationOptionsFromServerWithCompletion:^(AgoraChatPushOptions *aOptions, AgoraChatError *aError) {
        if (!aError) {
            // Get the nickname displayed in the push notification.
            NSString *displayName = aOptions.displayName;
            // Get the display style of the push notification.
            AgoraChatPushDisplayStyle displayStyle = aOptions.displayStyle;
        }
    }];
```
To display the message content in the notification bar, set the notification display style (`pushDisplayStyle`). This parameter has the following two settings:
- (Default) `AgoraChatPushDisplayStyleSimpleBanner`: Regardless of whether `displayName` is set, for any type of message push, the notification bar uses the default display settings, that is, the push title is "You have a new message" and the push content is "Please click to view".
- `AgoraPushDisplayStyleMessageSummary`: Displays the message content. The nickname you set is only effective when `pushDisplayStyle` is `AgoraPushDisplayStyleMessageSummary`, not `AgoraChatPushDisplayStyleSimpleBanner`.

The following table uses a one-to-one chat text message as an example to introduce the settings of the display attributes. For group chats, the "Push nickname of the message sender" and "Chat user ID of the message sender" in the table below are displayed as "Group ID".

| Parameter settings | Push display | Image |
| :--------- | :----- |:------------- |
| `pushDisplayStyle`: (default) `AgoraChatPushDisplayStyleSimpleBanner`<br />`displayName`: Set or not. | Push title: "You have a new message"<br />Push content: "Please click to view" | ![push_displayattribute_1](/images/im/push_displayattribute_1.png) |
| `pushDisplayStyle`: `AgoraPushDisplayStyleMessageSummary`<br />`displayName`: Set a specific value. | Push title: "You have a new message"<br />Push content: "Push nickname of the message sender: message content" | ![push_displayattribute_2](/images/im/push_displayattribute_2.png) |
| `pushDisplayStyle`: `AgoraPushDisplayStyleMessageSummary`<br />`displayName`: Not set. | Push title: "You have a new message"<br />Push content: "Message sender's Chat user ID: Message content" | ![push_displayattribute_3](/images/im/push_displayattribute_3.png) |

## Use the default push template

The default push template is mainly used when the default configuration provided by the server does not meet your needs. It allows you to set the global push title and push content. For example, the default settings provided by the server are push titles and content in English. If you need to display push titles and content in another language, you can set the push template in the corresponding language.

To use the default template, create a default push template in [Agora Console](https://console.agora.io/v2) or [call RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration). The template name is `default`. After setting, the default template is automatically used when pushing messages, and there is no need to enter the template name when creating messages.

Follow the steps below to create a default push template in [Agora Console](https://console.agora.io/v2):

1. Log in to [Agora Console](https://console.agora.io/v2) and click **Project Management** in the left navigation bar.
1. On the **Project Management** page, click **Config** in the **Action** column for the project that has Chat enabled.
1. On the **Edit Project** page, in the **Features** area, click **Enable / Config** for Chat.
1. On the project configuration page, select **Features** > **Push Template**, click **Add Push Template**, and configure the fields in the pop-up dialog box, as shown in the following figure.

   ![push_add_template](/images/im/push_add_template.png)

1. Set **Template Name** to **default**, then set the **Title** and **Content** parameters, and click **OK**.

    | Parameter       | Type | Description | Required |
    | :--------- | :----- | :----- | :----- |
    |  **Template Name**    | String   | The push template name. The default template is **default**.        | Yes |
    |  **Title**      | Array | The push title. Can be set in the following ways: Enter a fixed push title. Use built-in variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not need to pass in this parameter when creating a message. The server automatically obtains it. The third setting method needs to be passed in through the extension field.   | Yes |
    |  **Content**    | Array | The push content. Can be set in the following ways: Enter fixed push content. Use variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not require parameters to be passed in when creating a message. The server automatically obtains them. The third setting method needs to be passed in through the extension field. | Yes |

## Use message extension fields

When creating a push message, you can set the message extension fields to customize the push content to be displayed.
For the display attributes of push notifications, that is, the display attributes and display style of push notifications, in addition to calling specific methods to set them, you can also set them through custom fields. If you use both methods at the same time, the custom fields have a higher priority.

```objective-c
AgoraChatTextMessageBody *body = [[AgoraChatTextMessageBody alloc] initWithText:@"test"];
    AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:conversationId from:AgoraChatClient.sharedClient.currentUsername to:conversationId body:body ext:nil];
    message.ext = @{@"em_apns_ext":@{@"em_push_content":@"custom push content",@"em_push_title":@"custom push title"}};
    message.chatType = AgoraChatTypeChat;
    [AgoraChatClient.sharedClient.chatManager sendMessage:message progress:nil completion:nil];
```

The structure of a custom display field is as follows:

```json
{
    "em_apns_ext": {
       "em_push_title": "custom push title",
       "em_push_content": "custom push content"
    }
}
```

| Parameters               | Description                |
| :---------------- | :----------------- |
|  `em_apns_ext` |      The message extension fields. |
|  `em_push_title` |  Customize the push message title. This field name is fixed and cannot be modified. |
|  `em_push_content` |  Customize the push message content. This field name is fixed and cannot be modified. |

## Use a custom push template

The steps to use a custom push template are as follows:

1. If you use a custom push template, create it in [Agora Console](https://console.agora.io/v2) or call [RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration#create-a-push-template). For a description of the parameters in the **Add Push Template** dialog box, see the section about using the default template. When using a custom template, regardless of how the **Title** and **Content** parameters are set, they must be passed in through the extension fields when creating a message.

1. When creating a message, pass in the template name, push title, and push content by using the extension fields. The push title and content in the notification bar use the formats in the template, respectively.

    ```objective-c
    // The following takes text messages as an example. The setting methods for other types of messages are the same.
    AgoraChatTextMessageBody *body = [[AgoraChatTextMessageBody alloc]initWithText:@"test"];
    AgoraChatMessage *message = [[AgoraChatMessage alloc]initWithConversationID:@"conversationId" from:@"currentUsername" to:@"conversationId" body:body ext:nil];
           // Set the push template created on the Agora console as the default push template.
           NSDictionary *pushObject = @{
               @"name":@"templateName", // Set the push template name.
               @"title_args":@ [ @"titleValue1" ] , // Set the push title variable. If the push title specified in the template is a placeholder, you can customize the title here; if the specified title is a fixed value, the title will be a fixed value when using this template.
               @"content_args":@ [ @"contentValue1" ] // Set the push content variable. If the push content specified in the template is placeholder data, you can customize the push content here; if the specified push content is a fixed value, the push content will be a fixed value when using this template.
           };
           message.ext = @{
               @"em_push_template":pushObject,
           };
           message.chatType = AgoraChatTypeChat;
    [[AgoraChatClient sharedClient].chatManager sendMessage:message progress:nil completion:nil];
    ```

The JSON structure of the push template is as follows:

```json
"em_push_template":{
        "name":"test6",
        "title_args":[
            "test1"
        ],
        "content_args":[
            "{$fromNickname}",
            "{$msg}"
        ]
}
```

The message receiver can call `setPushTemplate` to pass in the push template name and select the template to use.

If the sender uses a push template when sending a message, the content displayed in the push notification bar is based on the sender's push template.

```objective-c
[AgoraChatClient.sharedClient.pushManager setPushTemplate:@"templateName" completion:^(AgoraChatError * _Nullable aError) {

}];
```

### Web

You can configure the push title and content displayed in the notification bar by using push templates.

### Set the push template

The default push template is mainly used when the default configuration provided by the server does not meet your needs. It allows you to set the global push title and push content. For example, the default settings provided by the server are push titles and content in English. If you need to use push titles and content in another language, you can set the push template in the corresponding language.

#### Use the default push template

To use the default template, create a default push template in [Agora Console](https://console.agora.io/v2) or [call RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration). The template name is `default`. After setting, the default template is automatically used when pushing messages. You do not need to enter the template name when creating messages.

Follow the steps below to create a default push template in [Agora Console](https://console.agora.io/v2):

1. Log in to [Agora Console](https://console.agora.io/v2) and click **Project Management** in the left navigation bar.
1. On the **Project Management** page, click **Config** in the **Action** column for the project that has Chat enabled.
1. On the **Edit Project** page, in the **Features** area, click **Enable / Config** for Chat.
1. On the project configuration page, select **Features** > **Push Template** , click **Add Push Template** , and configure the fields in the pop-up dialog box, as shown in the following figure:

   ![push_add_template](/images/im/push_add_template.png)

1. Set **Template Name** to **default**, then set the **Title** and **Content** parameters, and click **OK**.

   | Parameter         | Type   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Required |
   | :---------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
   | **Template Name** | String | Push template name. The default template is **default**.                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Yes      |
   | **Title**         | Array  | Push title. Can be set in the following ways: Enter a fixed push title. Use built-in variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not need to pass in this parameter when creating a message; the server automatically obtains it. The third setting method needs to be passed in through the extension field. | Yes      |
   | **Content**       | Array  | Push content. Can be set in the following ways: Enter fixed push content. Use variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not require parameters to be passed in when creating a message; the server automatically obtains them. The third setting method needs to be passed in through the extension field.   | Yes      |

#### Use a custom push template

The steps to use a custom push template are as follows:

1. If you use a custom push template, create a custom push template in [Agora Console](https://console.agora.io/v2) or [Call RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration#create-a-push-template). For a description of the parameters in the **Add Push Template** dialog box, see [Use the default push template](#use-the-default-push-template). When using a custom template, regardless of how the **Title** and **Content** parameters are set, they must be passed in through the extension fields when creating a message.

1. When creating a message, pass in the template name, push title, and push content by using the extension fields. The push title and content in the notification bar use the formats in the template, respectively:

   ```javascript
   // The following takes text messages as an example. The setting methods for other types of messages are the same.

   const sendTextMsg = () => {
     const options: AgoraChat.CreateTextMsgParameters = {
       chatType: chatType,
       type: "txt",
       to: targetUserId,
       msg: msgContent,
       ext: {
         em_push_template: {
           name: " templateName ", // Set the push template name.
           title_args: [" titleValue1 "], // Set the value array of the push title in the template. If the push title specified in the template is placeholder data, you can customize the title here; if the specified title is a fixed value, the title will be a fixed value when using this template.
           content_args: [" contentValue1 "], // Set the value array of the pushed content in the template. If the template content specified in the template is placeholder data, you can customize the content here; if the specified content is a fixed value, the content will be a fixed value when the template is used.
         },
       },
     };
     const msg = AgoraChat.message.create(options);
     chatClient.send(msg);
   };
   ```

   The JSON structure of the push template is as follows:

   ```json
   "em_push_template":{
           "name":"test6",
           "title_args":[
               "test1"
           ],
           "content_args":[
               `${fromNickname}`,
               `${msg}`
           ]
   }
   ```

### Flutter

You can configure the push title and content displayed in the notification bar in the following ways, with the configuration priority from low to high:

1. Configure the display attributes of push notifications;
1. Use the default push template;
1. Use message extension fields;
1. Use a custom push template.

## Configure the display attributes of push notifications

Call `updatePushNickname` and `updatePushDisplayStyle` methods to set the nickname (`nickname`) and notification display style (`DisplayStyle`), which includes the push title and content in the notification bar.

This nickname indicates the nickname of the message sender that is displayed in the push notification bar of the recipient's client when a message from the user is pushed. The nickname can be different from the nickname in user attributes. However, Agora recommends that you use the same nickname for both. Therefore, if either nickname is updated, the other should be changed at the same time. To update the nickname in user attributes, see [Set user attributes](..//en/realtime-media/im/build/build-core-messaging/user-attributes#set-user-attributes).

```dart
try {
  ChatClient.getInstance.pushManager.updatePushNickname('nickname');
} on ChatError catch (e) {}
```

```dart
try {
  ChatClient.getInstance.pushManager.updatePushDisplayStyle(DisplayStyle.Simple);
} on ChatError catch (e) {}
```

Call `getPushConfigsFromServer` to get the display attributes for push notifications, as shown in the following example:

```dart
try {
  ChatPushConfigs configs = await ChatClient.getInstance.pushManager.fetchPushConfigsFromServer();
  // Get the nickname displayed in push notifications.
  String? pushNickname = configs.displayName;
  // Get the display style of the push notification.
  DisplayStyle pushDisplayStyle = configs.displayStyle;
} on ChatError catch (e) {}
```

To display the message content in the notification bar, set the notification display style (`DisplayStyle`). This parameter has the following two settings:

- (Default) `Simple`: Regardless of whether `nickname` is set, for any type of message pushed, the notification bar uses the default display setting, that is, the push title is "You have a new message" and the push content is "Please click to view".
-  `Summary`: Displays the message content. The nickname you set only takes effect when `DisplayStyle` is set `Summary`, not `Simple`.

The following table uses a one-to-one chat message as an example to introduce the settings of the display attributes.

For group chats, "Push nickname of message sender" and "Chat user ID of message sender" in the table below are displayed as "Group ID".

| Parameter settings       | Push display | Image     |
| :--------- | :----- |:------------- |
| `DisplayStyle`: (default) `Simple`  `nickname`: Set or not set |  Push title: "You have a new message"  Push content: "Please click to view"  | ![push_displayattribute_1](/images/im/push_displayattribute_1.png) |
|  `DisplayStyle`: `Summary`  `nickname`: Set specific value  |  Push title: "You have a new message"  Push content: "Push nickname of the message sender: message content"  | ![push_displayattribute_2](/images/im/push_displayattribute_2.png)      |
|  `DisplayStyle`: `Summary`  `nickname`: Not set  |  Push title: “You have a new message”  Push content: “Message sender's Chat user ID: message content” | ![push_displayattribute_3](/images/im/push_displayattribute_3.png)          |

## Use the default push template

The default push template is mainly used when the default configuration provided by the server does not meet your needs. It allows you to set the global push title and push content. For example, the default settings provided by the server are push titles and content in English. If you need to use push titles and content in another language, you can set the push template in the corresponding language.

To use the default template, create a default push template in [Agora Console](https://console.agora.io/v2) or [call RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration). The template name is `default`. After setting, the default template is automatically used when pushing messages, and there is no need to enter the template name when creating messages.

Follow the steps below to create a default push template in [Agora Console](https://console.agora.io/v2):

1. Log in to [Agora Console](https://console.agora.io/v2) and click **Project Management** in the left navigation bar.
1. On the **Project Management** page, click **Config** in the **Action** column for the project that has Chat enabled.
1. On the **Edit Project** page, in the **Features** area, click **Enable / Config** for Chat.
1. On the project configuration page, select **Features** > **Push Template**, click **Add Push Template**, and configure the fields in the pop-up dialog box, as shown in the following figure:

    ![push_add_template](/images/im/push_add_template.png)

1. Set the **Template Name** to **default**, then set the **Title** and **Content** parameters and click **OK**.

| Parameter       | Type | Description | Required |
| :--------- | :----- | :----- | :----- |
|  **Template Name**    | String   | The push template name. The default template is **default**.        | Yes |
|  **Title**      | Array | The push title. Can be set in the following ways: Enter a fixed push title. Use built-in variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not need to pass in this parameter when creating a message. The server automatically obtains it. The third setting method needs to be passed in through the extension field.   | Yes |
|  **Content**    | Array | The push content. Can be set in the following ways: Enter fixed push content. Use variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not require parameters to be passed in when creating a message. The server automatically obtains them. The third setting method needs to be passed in through the extension field. | Yes |

## Use message extension fields

When creating a push message, you can set the `em_push_title` and `em_push_content` message extension fields to customize the push title and content, respectively.

```dart
ChatMessage msg = ChatMessage.createTxtSendMessage(
  targetId: 'receiveId',
  content: 'content',
);
msg.attributes = {
  // Set the push extension to the message. This field is a built-in push extension field.
  'em_push_ext': {
    // Customize the push message title. This field is a built-in field and the field name cannot be modified.
    'em_push_title': 'custom push title',
    // Customize push message content. This field is a built-in field and the field name cannot be modified.
    'em_push_content': 'custom push content'
  }
};
try {
  await ChatClient.getInstance.chatManager.sendMessage(msg);
} on ChatError catch (e) {}
```

The data structure of the custom display field is as follows:

```dart
{
    "em_apns_ext": {
        "em_push_title": "custom push title",
        "em_push_content": "custom push content"
    }
}
```

## Use a custom push template

The steps to use a custom push template are as follows:

1. If you use a custom push template, create it in [Agora Console](https://console.agora.io/v2) or call [RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration#create-a-push-template). For a description of the parameters in the **Add Push Template** dialog box, see the section about using the default template. When using a custom template, regardless of how the **Title** and **Content** parameters are set, they must be passed in through the extension fields when creating a message.

1. When creating a message, pass in the template name, push title, and push content by using the extension fields. The push title and content in the notification bar use the formats in the template, respectively.

    ```dart
    ChatMessage msg = ChatMessage.createTxtSendMessage(
      targetId: 'receiveId',
      content: 'content',
    );
    msg.attributes = {
      // Add the push template to the message.
      'em_push_template': {
        // Set the push template name.
        'name': 'templateName',
        // Set the push title variable. If the push title specified in the template is a placeholder, you can customize the title here; if the specified title is a fixed value, the title will be a fixed value when using this template.
        'title_args': ['titleValue1'],
        // Set the push content variable. If the push content specified in the template is a placeholder, you can customize the push content here; if the specified push content is a fixed value, the push content will be a fixed value when using this template.
        'content_args': ['contentValue1'],
      }
    };
    try {
      await ChatClient.getInstance.chatManager.sendMessage(msg);
    } on ChatError catch (e) {}
    ```

The JSON structure of the push template is as follows:

```json
"em_push_template":{
        "name":"templateName",
        "title_args":[
            "titleValue1"
        ],
        "content_args":[
            "{$contentValue1}",
        ]
}
```

The message receiver can call the `setPushTemplate` method to pass in the push template name and select the template to use.

If the sender uses a push template when sending a message, the content displayed in the push notification bar is based on the sender's push template.

```dart
try {
  await ChatClient.getInstance.pushManager.setPushTemplate('Template Name');
} on ChatError catch (e) {}
```

### React Native

You can configure the push title and content displayed in the notification bar in the following ways, with the configuration priority from low to high:

1. Configure the display attributes of push notifications;
2. Use the default push template;
3. Use message extension fields;
4. Use a custom push template.

## Configure the display attributes of push notifications

Call `updatePushNickname` and `updatePushDisplayStyle` to set the nickname (`nickname`) and notification display style (`displayStyle`), which includes the push title and content in the notification bar.

This nickname indicates the nickname of the message sender that is displayed in the push notification bar of the recipient's client when a message from the user is pushed. The nickname can be different from the nickname in user attributes. However, Agora recommends that you use the same nickname for both. Therefore, if either nickname is updated, the other should be changed at the same time. To update the nickname in user attributes, see [Set user attributes](..//en/realtime-media/im/build/build-core-messaging/user-attributes#set-user-attributes).

```typescript
ChatClient.getInstance()
  .pushManager.updatePushNickname(nickname)
  .then(() => {
    console.log("Succeeded in updating the nickname.");
  })
  .catch((reason) => {
    console.log("Failed to update the nickname.", reason);
  });
```

```typescript
ChatClient.getInstance()
  .pushManager.updatePushDisplayStyle(displayStyle)
  .then(() => {
    console.log("Succeeded in updating the display style.");
  })
  .catch((reason) => {
    console.log("Failed to update the display style.", reason);
  });
```

You can call `fetchPushOptionFromServer` to retrieve the display attributes in a push notification, as shown in the following example:

```typescript
ChatClient.getInstance()
  .pushManager.fetchPushOptionFromServer()
  .then(() => {
    console.log("Succeeded in getting the push configurations.");
  })
  .catch((reason) => {
    console.log("Failed to get the push configuration.", reason);
  });
```

To display the message content in the notification bar, set the notification display style (`displayStyle`). This parameter has the following two settings:

- (Default) `Simple`: Regardless of whether `nickname` is set, for any type of message pushed, the notification bar uses the default display settings, that is, the push title is "You have a new message" and the push content is "Please click to view".
-  `Summary`: Displays the message content. The nickname you set only takes effect when `displayStyle` is `Summary`, not `Simple`.

The following table uses a one-to-one chat text message as an example to introduce the settings of the display attributes.
For group chats, "Push nickname of message sender" and "Chat user ID of message sender" in the table below are displayed as "Group ID".

| Parameter settings       | Push display | Image     |
| :--------- | :----- |:------------- |
| `displayStyle`: (default) `Simple` `nickname`: Set or not set. |  Push title: "You have a new message"  Push content: "Please click to view" | ![push_displayattribute_1](/images/im/push_displayattribute_1.png)       |
| `displayStyle`: `Summary`  `nickname`: Set a specific value  |  Push title: "You have a new message"  Push content: "Push nickname of the message sender: message content"   | ![push_displayattribute_2](/images/im/push_displayattribute_2.png)     |
|  `displayStyle`: `Summary`  `nickname`: Not set      |  Push title: “You have a new message”  Push content: “Chat user ID of the message sender: message content”  | ![push_displayattribute_3](/images/im/push_displayattribute_3.png) |

## Use the default push template

The default push template is mainly used when the default configuration provided by the server does not meet your needs. It allows you to set the global push title and push content. For example, the default settings provided by the server are push titles and content in English. If you need to use push titles and content in another language, you can set the push template in the corresponding language.

To use the default template, create a default push template in [Agora Console](https://console.agora.io/v2) or [call RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration). The template name is `default`. After setting, the default template is automatically used when pushing messages, and there is no need to enter the template name when creating messages.

Follow the steps below to create a default push template in [Agora Console](https://console.agora.io/v2):

1. Log in to [Agora Console](https://console.agora.io/v2) and click **Project Management** in the left navigation bar.
1. On the **Project Management** page, click **Config** in the **Action** column for the project that has Chat enabled.
1. On the **Edit Project** page, in the **Features** area, click **Enable / Config** for Chat.
1. On the project configuration page, select **Features** > **Push Template**, click **Add Push Template**, and configure the fields in the pop-up dialog box, as shown in the following figure:

    ![push_add_template](/images/im/push_add_template.png)

1. Set the **Template Name** to **default**, then set the **Title** and **Content** parameters, and click **OK**.

    | Parameter       | Type | Description | Required |
    | :--------- | :----- | :----- | :----- |
    |  **Template Name**    | String   | The push template name. The default template is **default**.        | Yes |
    |  **Title**      | Array | The push title. Can be set in the following ways: Enter a fixed push title. Use built-in variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not need to pass in this parameter when creating a message. The server automatically obtains it. The third setting method needs to be passed in through the extension field.   | Yes |
    |  **Content**    | Array | The push content. Can be set in the following ways: Enter fixed push content. Use variables and enter `{$fromNickname}, {$msg}`. Set custom variables through the value array. The field format is `{0} {1} {2} ... {n}`. If the default template is used, the first two settings do not require parameters to be passed in when creating a message. The server automatically obtains them. The third setting method needs to be passed in through the extension field. | Yes |

## Use message extension fields

When creating a push message, you can set the `em_push_title` and `em_push_content` message extension fields to customize the push title and content, respectively.

```typescript
msg.attributes = {
  // Message extension field. This field is a built-in field and the field name cannot be modified.
  em_apns_ext: {
    em_push_title: " custom push title " , // Custom push message title. This field is a built-in field and the field name cannot be modified.
    em_push_content: " custom push content " , // Custom push message content. This field is a built-in field and the field name cannot be modified.
  },
};
```

The data structure of the custom display field is as follows:

```java
{
    "em_apns_ext": {
        "em_push_title": "custom push title",
        "em_push_content": "custom push content"
    }
}
```

## Use a custom push template

The steps to use a custom push template are as follows:

1. If you use a custom push template, create it in [Agora Console](https://console.agora.io/v2) or call [RESTful API](/en/api-reference/api-ref/im/offline-push/offline-push-configuration#create-a-push-template). For a description of the parameters in the **Add Push Template** dialog box, see the section about using the default template. When using a custom template, regardless of how the **Title** and **Content** parameters are set, they must be passed in through the extension fields when creating a message.

1. When creating a message, pass in the template name, push title, and push content by using the extension fields. The push title and content in the notification bar use the formats in the template, respectively.

    ```typescript
    // The following takes text messages as an example. The setting methods for other types of messages are the same.
    const msg = ChatMessage.createTextMessage(targetId, content, targetType);
    msg.attributes = {
      em_push_template: {
        name: "foo",
        // Set the value array of the push title in the template. If the push title specified in the template is placeholder data, you can customize the title here; if the specified title is a fixed value, the title will be a fixed value when using this template.
        title_args: "title",
        // Set the value array of the pushed content in the template. If the template content specified in the template is placeholder data, you can customize the content here; if the specified content is a fixed value, the content will be a fixed value when using the template.
        content_args: "test",
      },
    };
    ChatClient.getInstance()
      .chatManager.sendMessage(msg, {
        onError: (error) => {},
        onSuccess: (msg) => {},
      } as  any )
      .then(() => {
        console.log("send message success");
      })
      .catch((reason) => {
        console.log("set message fail.", reason);
      });
    ```

The JSON structure of the push template is as follows:

```json
"em_push_template":{
        "name":"test6",
        "title_args":[
            "test1"
        ],
        "content_args":[
            "{$fromNickname}",
            "{$msg}"
        ]
}
```

The message receiver can call `selectPushTemplate` to pass in the push template name and select the template to use.

If the sender uses a push template when sending a message, the content displayed in the push notification bar is based on the sender's push template.

```typescript
ChatClient.getInstance()
  .pushManager.selectPushTemplate(templateName)
  .then(() => {
    console.log("Succeeded in updating the nickname.");
  })
  .catch((reason) => {
    console.log("Failed to update the nickname.", reason);
  });
```

### Windows, Unity

**This feature is not supported for this platform.**
