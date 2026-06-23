---
title: "User attributes"
description: "Shows how to use the Agora Chat SDK to implement managing user attributes."
---

After joining a Chat channel, a user can update information such as the nickname, avatar, age, and mobile phone number as needed. These are known as user attributes.

This page shows how to use the Chat SDK to implement managing user attributes.

:::info
User attributes are stored on the Chat server. If you have security concerns, Agora recommends that you manage user attributes yourself.To ensure information security, app users can only modify their own user attributes. Only app admins can modify the user attributes of other users.
:::

## Understand the tech

### Android

The Chat SDK uses `UserInfoManager` to retrieve, set, and modify user attributes. Followings are the core methods:
- `updateOwnInfo`: Set or update user attributes.
- `updateOwnInfoByAttributes`: Set or update the specified user attribute.
- `fetchUserInfoByUserId`: Retrieve the user attributes of the specified user.
- `fetchUserInfoByAttributes`: Retrieve the specified user attributes of the specified user.

### iOS

The Chat SDK uses `UserInfoManager` to retrieve, set, and modify user attributes. Followings are the core methods:
- `updateOwnUserInfo`: Set or update user attributes.
- `fetchUserInfoById`: Retrieve the user attributes of the specified user.

### Flutter

The Chat SDK uses `ChatUserInfoManager` to retrieve, set, and modify user attributes. Followings are the core methods:
- `updateOwnInfo`: Set and update user attributes.
- `fetchUserInfoById`: Retrieve the user attributes of the specified user.
- `fetchOwnInfo`: Retrieve the user's own user attributes.

### React Native

The Chat SDK uses `ChatUserInfoManager` to retrieve, set, and modify user attributes. Followings are the core methods:
- `updateOwnInfo`: Set and update user attributes.
- `fetchUserInfoById`: Retrieve the user attributes of the specified user.
- `fetchOwnInfo`: Retrieve the user's own user attributes.

### Windows

The Chat SDK uses `IUserInfoManager` to retrieve, set, and modify user attributes. Followings are the core methods:
- `UpdateOwnInfo`: Set and update user attributes.
- `FetchUserInfoByUserId`: Retrieve the user attributes of the specified user.

### Unity

The Chat SDK uses `IUserInfoManager` to retrieve, set, and modify user attributes. Followings are the core methods:
- `UpdateOwnInfo`: Set and update user attributes.
- `FetchUserInfoByUserId`: Retrieve the user attributes of the specified user.

### Web

The Chat SDK uses `UserInfoManager` to retrieve, set, and modify user attributes. Followings are the core methods:

- `updateUserInfo`: Set or update user attributes.
- `fetchUserInfoById`: Retrieve the user attributes of the specified user.

## Prerequisites

Before proceeding, ensure that you meet the following requirements:

- You have integrated the Chat SDK, initialized the SDK and implemented the functionality of registering accounts and login. For details, see [Chat SDK quickstart](../get-started-sdk).
- Have a thorough understanding of the API call frequency limit, the maximum size of all the attributes of a specified user, and the maximum size of all user attributes in an app. For details, see [Known limitations](./limitations).

## Implementation

This section shows how to manage user attributes and contacts with the methods provided by the Chat SDK.

### Android

### Set user attributes

Chat users can set and update their own attributes. Refer to the code example to set all the user attributes:

```java
// Call updateOwnInfo to set all the user attributes
UserInfo userInfo = new UserInfo();
userInfo.setUserId(ChatClient.getInstance().getCurrentUser());
userInfo.setNickname("agora");
userInfo.setAvatarUrl("http://www.agora.io");
userInfo.setBirth("2000.10.10");
userInfo.setSignature("hello world");
userInfo.setPhoneNumber("13333333333");
userInfo.setEmail("123456@qq.com");
userInfo.setGender(1);
ChatClient.getInstance().userInfoManager().updateOwnInfo(userInfo, new ValueCallBack() {
            @Override
            public void onSuccess(String value) {     
            }
  
            @Override
            public void onError(int error, String errorMsg) {
            }
  });
```

The following sample code uses avatar as an example to show how to set the specified user attribute:

```java
// Call updateOwnInfoByAttribute to update the specified attribute of the specified user
String url = "https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png";
ChatClient.getInstance().userInfoManager().updateOwnInfoByAttribute(UserInfoType.AVATAR_URL, url, new ValueCallBack() {
              @Override
              public void onSuccess(String value) {         
              }

              @Override
              public void onError(int error, String errorMsg) {    
              }
   });
```

Keys listed in the following table are used by default when user attributes are set on the client side, including the nickname, avatar URL, contact information, email address, gender, signature, birthday and extension fields. When you call the [RESTful API to set](/en/realtime-media/im/reference/server-api/user-attributes-management#setting-user-attributes) or [delete](/en/realtime-media/im/reference/server-api/user-attributes-management#deleting-user-attributes) these user attributes, you must pass in the following keys to make sure that the client can obtain the settings from the server:

| Field        | Type   | Description                                                         |
| :---------- | :----- | :----------------------------------------------------------- |
| `nickname`  | String | The user nickname, which can contain at most 64 characters.    |
| `avatarurl` | String | The user avatar URL, which can contain at most 256 characters.     |
| `phone`     | String | The user's phone number, which can contain at most 32 characters.  |
| `mail`      | String | The user's email address, which can contain at most 64 characters. |
| `gender`    | Number | The user gender: `1`：Male; `2`：Female;(Default) `0`: Unknown;Other values are invalid. |
| `sign`      | String | The user's signature, which can contain at most 256 characters.  |
| `birth`     | String | The user's birthday, which can contain at most 256 characters.  |
| `ext`       | String | The extension fields.                                                   |

### Retrieve user attributes

You can use `fetchUserInfoByUserId` to retrieve the user attributes of the specified users. For each method call, you can retrieve the user attributes of a maximum of 100 users.

Refer to the following code example:

```java
// Call fetchUserInfoByUserId to retrieve all the attributes of the specified user.
String[] userId = new String[1];
//username indicates the user ID.
userId[0] = username;
ChatClient.getInstance().userInfoManager().fetchUserInfoByUserId(userId, new ValueCallBack>() {});
```

```java
// Call fetchUserInfoByAttribute to retrieve the specified user attribute
String[] userId = new String[1];
userId[0] = ChatClient.getInstance().getCurrentUser();
UserInfoType[] userInfoTypes = new UserInfoType[2];
userInfoTypes[0] = UserInfoType.NICKNAME;
userInfoTypes[1] = UserInfoType.AVATAR_URL;
ChatClient.getInstance().userInfoManager().fetchUserInfoByAttribute(userId, userInfoTypes,
           new ValueCallBack>() {});
```

### iOS

### Set user attributes

Chat users can set and update their own attributes. Refer to the code example to set all the user attributes:

```objc
// Sets the user attributes.
AgoraChatUserInfo *userInfo = [[AgoraChatUserInfo alloc] init];
userInfo.userId = AgoraChatClient.sharedClient.currentUsername;
userInfo.nickName = @"agora";
userInfo.avatarUrl = @"http://www.agora.io";
userInfo.birth = @"2000.10.10";
userInfo.sign = @"hello world";
userInfo.phone = @"12333333333";
userInfo.mail = @"123456@qq.com";
userInfo.gender = 1;
[AgoraChatClient.sharedClient.userInfoManager updateOwnUserInfo:userInfo completion:^(AgoraChatUserInfo *aUserInfo, AgoraChatError *aError)      

}];        
```

The following sample code uses avatar as an example to show how to set the specified user attribute:

```objc
NSString *url = @"https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png";
 
[[AgoraChatClient sharedClient].userInfoManager updateOwnUserInfo:url withType:AgoraChatUserInfoTypeAvatarURL completion:^(AgoraChatUserInfo *aUserInfo, AgoraChatError *aError) {
        if (aUserInfo && completion) {
            completion(aUserInfo);
        }
    }];
```

Keys listed in the following table are used by default when user attributes are set on the client side, including the nickname, avatar URL, contact information, email address, gender, signature, birthday and extension fields. When you call the [RESTful API to set](/en/realtime-media/im/reference/server-api/user-attributes-management#setting-user-attributes) or [delete](/en/realtime-media/im/reference/server-api/user-attributes-management#deleting-user-attributes) these user attributes, you must pass in the following keys to make sure that the client can obtain the settings from the server:

| Field        | Type   | Description                                                         |
| :---------- | :----- | :----------------------------------------------------------- |
| `nickname`  | String | The user nickname, which can contain at most 64 characters.    |
| `avatarurl` | String | The user avatar URL, which can contain at most 256 characters.     |
| `phone`     | String | The user's phone number, which can contain at most 32 characters.  |
| `mail`      | String | The user's email address, which can contain at most 64 characters. |
| `gender`    | Number | The user gender: `1`：Male; `2`：Female;(Default) `0`: Unknown;Other values are invalid. |
| `sign`      | String | The user's signature, which can contain at most 256 characters.  |
| `birth`     | String | The user's birthday, which can contain at most 256 characters.  |
| `ext`       | String | The extension fields.                                                   |

### Retrieve user attributes

You can use `fetchUserInfoById` to retrieve the user attributes of the specified users. For each method call, you can retrieve the user attributes of a maximum of 100 users.

Refer to the following code example to retrieve all the attributes of the specified user:

```objc
[[AgoraChatClient sharedClient].userInfoManager fetchUserInfoById:@[AgoraChatClient.sharedClient.currentUsername] 		completion:^(NSDictionary *aUserDatas, AgoraChatError *aError) {               
}];
```

The following sample code shows how to retrieve the specified attributes of the user.

```objc
NSString *userIds = @[@"user1",@"user2"];
NSArray *userInfoTypes = @[@(AgoraChatUserInfoTypeAvatarURL),@(AgoraChatUserInfoTypePhone),@(AgoraChatUserInfoTypeMail)];
[[AgoraChatClient sharedClient].userInfoManager fetchUserInfoById:userIds type:userInfoTypes completion:^(NSDictionary *aUserDatas, AgoraChatError *aError) {
              
}];
```

### Flutter

### Set user attributes

Chat users can set and update their own attributes. Refer to the code example to set user attributes:

```dart
try {
  ChatClient.getInstance.userInfoManager.updateUserInfo(userInfo);
} on ChatError catch (e) {
  // Fails to update user attributes. See e.code for the error code, and e.description for the error description.
}
```

Keys listed in the following table are used by default when user attributes are set on the client side, including the nickname, avatar URL, contact information, email address, gender, signature, birthday and extension fields. When you call the [RESTful API to set](/en/realtime-media/im/reference/server-api/user-attributes-management#setting-user-attributes) or [delete](/en/realtime-media/im/reference/server-api/user-attributes-management#deleting-user-attributes) these user attributes, you must pass in the following keys to make sure that the client can obtain the settings from the server:

| Field        | Type   | Description                                                         |
| :---------- | :----- | :----------------------------------------------------------- |
| `nickname`  | String | The user nickname, which can contain at most 64 characters.    |
| `avatarurl` | String | The user avatar URL, which can contain at most 256 characters.     |
| `phone`     | String | The user's phone number, which can contain at most 32 characters.  |
| `mail`      | String | The user's email address, which can contain at most 64 characters. |
| `gender`    | Number | The user gender: `1`：Male; `2`：Female;(Default) `0`: Unknown;Other values are invalid. |
| `sign`      | String | The user's signature, which can contain at most 256 characters.  |
| `birth`     | String | The user's birthday, which can contain at most 256 characters.  |
| `ext`       | String | The extension fields.                                                   |

### Retrieve user attributes

You can use `fetchUserInfoById` to retrieve the user attributes of the specified users. For each method call, you can retrieve the user attributes of a maximum of 100 users.

Refer to the following code example:

```dart
List list = ["tom", "json"];
try {
  Map userInfos =
      await ChatClient.getInstance.userInfoManager.fetchUserInfoById(list);
} on ChatError catch (e) {
  // Fails to retrieve the user attributes. See e.code for the error code, and e.description for the error description.
}
```

### Retrieve the user's own attributes

Call `fetchOwnInfo` to fetch the user attributes of the local user:

```dart
try {
  ChatUserInfo? userInfo =
      await ChatClient.getInstance.userInfoManager.fetchOwnInfo();
} on ChatError catch (e) {
  // Fails to retrieve the user attributes of the current user. See e.code for the error code, and e.description for the error description.
}
```

### React Native

### Set user attributes

Chat users can set and update their own attributes. Refer to the code example to set user attributes:

```typescript
// Update the user attributes.
// All the user attributes except user ID can be updated.
// You can update one or more attributes with each method call.
ChatClient.getInstance()
  .userManager.updateOwnUserInfo({
    nickName,
    avatarUrl,
    mail,
    phone,
    gender,
    sign,
    birth,
    ext,
  })
  .then(() => {
    console.log("update userInfo success.");
  })
  .catch((reason) => {
    console.log("update userInfo fail.", reason);
  });
```

Keys listed in the following table are used by default when user attributes are set on the client side, including the nickname, avatar URL, contact information, email address, gender, signature, birthday and extension fields. When you call the [RESTful API to set](/en/realtime-media/im/reference/server-api/user-attributes-management#setting-user-attributes) or [delete](/en/realtime-media/im/reference/server-api/user-attributes-management#deleting-user-attributes) these user attributes, you must pass in the following keys to make sure that the client can obtain the settings from the server:

| Field        | Type   | Description                                                         |
| :---------- | :----- | :----------------------------------------------------------- |
| `nickname`  | String | The user nickname, which can contain at most 64 characters.    |
| `avatarurl` | String | The user avatar URL, which can contain at most 256 characters.     |
| `phone`     | String | The user's phone number, which can contain at most 32 characters.  |
| `mail`      | String | The user's email address, which can contain at most 64 characters. |
| `gender`    | Number | The user gender: `1`：Male; `2`：Female;(Default) `0`: Unknown;Other values are invalid. |
| `sign`      | String | The user's signature, which can contain at most 256 characters.  |
| `birth`     | String | The user's birthday, which can contain at most 256 characters.  |
| `ext`       | String | The extension fields.                                                   |

### Retrieve user attributes

You can use `fetchUserInfoById` to retrieve the user attributes of the specified users. For each method call, you can retrieve the user attributes of a maximum of 100 users.

Refer to the following code example:

```typescript
// Specify one or more user IDs.
const userIds = ["tom", "json"];
// Call fetchUserInfoById
ChatClient.getInstance()
  .userManager.fetchUserInfoById(userIds)
  .then((users) => {
    console.log("get userInfo success.", users);
  })
  .catch((reason) => {
    console.log("get userInfo fail.", reason);
  });
```

### Retrieve the user's own attributes

Call `fetchOwnInfo` to fetch the user attributes of the local user:

```typescript
ChatClient.getInstance()
  .userManager.fetchOwnInfo()
  .then((users) => {
    console.log("get userInfo success.", users);
  })
  .catch((reason) => {
    console.log("get userInfo fail.", reason);
  });
```

### Windows

### Set user attributes

Chat users can set and update their own attributes. Refer to the code example to set user attributes:

```csharp
// Set the user attributes of the specified user.
UserInfo userInfo;
userInfo.userId = currentId;
userInfo.nickName = "chatuser";
userInfo.avatarUrl = "http://www.easemob.com";
userInfo.birth = "2000.10.10";
userInfo.signature = "hello world";
userInfo.phoneNumber = "13333333333";
userInfo.email = "123456@qq.com";
userInfo.gender = 1; // 1 indicates that the gender is male. 2 means female.
SDKClient.Instance.UserInfoManager.UpdateOwnInfo(userInfo, new CallBack(
  onSuccess: () => {
  },
  onError:(code, desc) => {
  }            
));
```

Keys listed in the following table are used by default when user attributes are set on the client side, including the nickname, avatar URL, contact information, email address, gender, signature, birthday and extension fields. When you call the [RESTful API to set](/en/realtime-media/im/reference/server-api/user-attributes-management#setting-user-attributes) or [delete](/en/realtime-media/im/reference/server-api/user-attributes-management#deleting-user-attributes) these user attributes, you must pass in the following keys to make sure that the client can obtain the settings from the server:

| Field        | Type   | Description                                                         |
| :---------- | :----- | :----------------------------------------------------------- |
| `nickname`  | String | The user nickname, which can contain at most 64 characters.    |
| `avatarurl` | String | The user avatar URL, which can contain at most 256 characters.     |
| `phone`     | String | The user's phone number, which can contain at most 32 characters.  |
| `mail`      | String | The user's email address, which can contain at most 64 characters. |
| `gender`    | Number | The user gender: `1`：Male; `2`：Female;(Default) `0`: Unknown;Other values are invalid. |
| `sign`      | String | The user's signature, which can contain at most 256 characters.  |
| `birth`     | String | The user's birthday, which can contain at most 256 characters.  |
| `ext`       | String | The extension fields.                                                   |

### Retrieve user attributes

You can use `FetchUserInfoByUserId` to retrieve the user attributes of the specified users. For each method call, you can retrieve the user attributes of a maximum of 100 users.

Refer to the following code example:

```csharp
// Retrieve user attributes of one or multiple users.
List idList = new List();
idList.Add("username");
SDKClient.Instance.UserInfoManager.FetchUserInfoByUserId
SDKClient.Instance.UserInfoManager.FetchUserInfoByUserId(idList, type, startId, loadCount, new ValueCallBack>(
  // `result` is in the format of Dictionary
  onSuccess: (result) => {
	// Traverse all the user attributes in the dictionary
  },
  onError:(code, desc) => {
  }
));
```

### Unity

### Set user attributes

Chat users can set and update their own attributes. Refer to the code example to set user attributes:

```csharp
// Set the user attributes of the specified user.
UserInfo userInfo;
userInfo.userId = currentId;
userInfo.nickName = "chatuser";
userInfo.avatarUrl = "http://www.easemob.com";
userInfo.birth = "2000.10.10";
userInfo.signature = "hello world";
userInfo.phoneNumber = "13333333333";
userInfo.email = "123456@qq.com";
userInfo.gender = 1; // 1 indicates that the gender is male. 2 means female.
SDKClient.Instance.UserInfoManager.UpdateOwnInfo(userInfo, new CallBack(
  onSuccess: () => {
  },
  onError:(code, desc) => {
  }            
));
```

Keys listed in the following table are used by default when user attributes are set on the client side, including the nickname, avatar URL, contact information, email address, gender, signature, birthday and extension fields. When you call the [RESTful API to set](/en/realtime-media/im/reference/server-api/user-attributes-management#setting-user-attributes) or [delete](/en/realtime-media/im/reference/server-api/user-attributes-management#deleting-user-attributes) these user attributes, you must pass in the following keys to make sure that the client can obtain the settings from the server:

| Field        | Type   | Description                                                         |
| :---------- | :----- | :----------------------------------------------------------- |
| `nickname`  | String | The user nickname, which can contain at most 64 characters.    |
| `avatarurl` | String | The user avatar URL, which can contain at most 256 characters.     |
| `phone`     | String | The user's phone number, which can contain at most 32 characters.  |
| `mail`      | String | The user's email address, which can contain at most 64 characters. |
| `gender`    | Number | The user gender: `1`：Male; `2`：Female;(Default) `0`: Unknown;Other values are invalid. |
| `sign`      | String | The user's signature, which can contain at most 256 characters.  |
| `birth`     | String | The user's birthday, which can contain at most 256 characters.  |
| `ext`       | String | The extension fields.                                                   |

### Retrieve user attributes

You can use `FetchUserInfoByUserId` to retrieve the user attributes of the specified users. For each method call, you can retrieve the user attributes of a maximum of 100 users.

Refer to the following code example:

```csharp
// Retrieve user attributes of one or multiple users.
List idList = new List();
idList.Add("username");
SDKClient.Instance.UserInfoManager.FetchUserInfoByUserId
SDKClient.Instance.UserInfoManager.FetchUserInfoByUserId(idList, type, startId, loadCount, new ValueCallBack>(
  // `result` is in the format of Dictionary
  onSuccess: (result) => {
	// Traverse all the user attributes in the dictionary
  },
  onError:(code, desc) => {
  }
));
```

### Web

### Set user attributes

Chat users can set and update their own attributes. Refer to the code example to set all the user attributes:

```javascript
// Sets all user attributes
const options = {
  nickname: "The nickname",
  avatarurl: "https://avatarurl",
  mail: "abc@gmail.com",
  phone: "phone number",
  gender: "female",
  birth: "2000-01-01",
  sign: "a sign",
  ext: JSON.stringify({
    nationality: "China",
    merit: "Hello, world！",
  }),
};
chatClient.updateUserInfo(options).then((res) => {
  console.log(res);
});
```

The following sample code uses nickname as an example to show how to set the specified user attribute:

```javascript
chatClient.updateUserInfo("nickname", "Your nickname").then((res) => {
  console.log(res);
});
```

Keys listed in the following table are used by default when user attributes are set on the client side, including the nickname, avatar URL, contact information, email address, gender, signature, birthday and extension fields. When you call the [RESTful API to set](/en/realtime-media/im/reference/server-api/user-attributes-management#setting-user-attributes) or [delete](/en/realtime-media/im/reference/server-api/user-attributes-management#deleting-user-attributes) these user attributes, you must pass in the following keys to make sure that the client can obtain the settings from the server:

| Field       | Type   | Description                                                                                                                           |
| :---------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `nickname`  | String | The user nickname, which can contain at most 64 characters.                                                                           |
| `avatarurl` | String | The user avatar URL, which can contain at most 256 characters.                                                                        |
| `phone`     | String | The user's phone number, which can contain at most 32 characters.                                                                     |
| `mail`      | String | The user's email address, which can contain at most 64 characters.                                                                    |
| `gender`    | Number | The user gender: `1`：Male; `2`：Female;(Default) `0`: Unknown;Other values are invalid. |
| `sign`      | String | The user's signature, which can contain at most 256 characters.                                                                       |
| `birth`     | String | The user's birthday, which can contain at most 256 characters.                                                                        |
| `ext`       | String | The extension fields.                                                                                                                 |

### Retrieve user attributes

You can use `fetchUserInfoById` to retrieve the user attributes of the specified users. For each method call, you can retrieve the user attributes of a maximum of 100 users.

Refer to the following code example to retrieve all the attributes of the specified user:

```javascript
/**
 * @param {String|Array} users - The user ID. You can set it as one user ID, or multiple user IDs in the format of array.
 */
let users = "user1" || ["user1", "user2"];
chatClient.fetchUserInfoById(users).then((res) => {
  console.log(res);
});
```

The following sample code shows how to retrieve the specified attributes of the user.

```javascript
/**
 * @param {String|Array} users - The user ID. You can set it as one user ID, or multiple user IDs in the format of array.
 * @param {String|Array} properties - The specified attribute.
 */
chatClient.fetchUserInfoById("userId", "nickname").then((res) => {
  console.log(res);
});

// Retrieves the specified attributes of the specified users.
chatClient
  .fetchUserInfoById(["user1", "user2"], ["nickname", "avatarurl"])
  .then((res) => {
    console.log(res);
  });
```

## Next steps

This section introduces extra functions you can implement in your app using user attributes and contact management.

### Android

### Manage user avatar

The Chat SDK only supports storing the URL address of the avatar file rather than the file itself. To manage user avatars, you need to use a third-party file storage service.

To implement user avatar management in your app, take the following steps:

1. Upload the avatar file to the third-party file storage service. Once the file is successfully uploaded, you get a URL address of the avatar file.
2. Set the `avatarUrl` parameter in user attributes as the URL address of the avatar file.
3. To display the avatar, call `fetchUserInfoByUserId` to retrieve the URL of the avatar file, and then render the image on the local UI.

### Create and send a namecard using user attributes

Namecard messages are custom messages that include the user ID, nickname, avatar, email address, and phone number of the specified user. To create and send a namecard, take the following steps:

1. Create a custom message and set the `event` of the custom message as `USER_CARD_EVENT`.
2. Add `userId`, `getNickname`, and `getAvatarUrl` as fileds in `params`. Send the custom message.

Followings are the sample code for creating and sending a namecard message:

```java
// Creates a cutom message
ChatMessage message = ChatMessage.createSendMessage(ChatMessage.Type.CUSTOM);
                CustomMessageBody body = new CustomMessageBody(DemoConstant.USER_CARD_EVENT);
                Map params = new HashMap<>();
                params.put(DemoConstant.USER_CARD_ID,userId);
                params.put(DemoConstant.USER_CARD_NICK,user.getNickname());
                params.put(DemoConstant.USER_CARD_AVATAR,user.getAvatarUrl());
                body.setParams(params);
                message.setBody(body);
                message.setTo(toUser);
// Sends the custom message
ChatClient.getInstance().chatManager().sendMessage(message);
```

### iOS

### Manage user avatar

The Chat SDK only supports storing the URL address of the avatar file rather than the file itself. To manage user avatars, you need to use a third-party file storage service.

To implement user avatar management in your app, take the following steps:

1. Upload the avatar file to the third-party file storage service. Once the file is successfully uploaded, you get a URL address of the avatar file.
2. Set the `avatarUrl` parameter in user attributes as the URL address of the avatar file.
3. To display the avatar, call `fetchUserInfoById` to retrieve the URL of the avatar file, and then render the image on the local UI.

### Create and send a namecard using user attributes

Namecard messages are custom messages that include the user ID, nickname, avatar, email address, and phone number of the specified user. To create and send a namecard, take the following steps:

1. Create a custom message and set the `event` of the custom message as `userCard`.
2. Add `userId`, `nickname`, and `avatar` as fileds in `ext`. Send the custom message.

Followings are the sample code for creating and sending a namecard message:

```objc
AgoraChatCustomMessageBody *body = [[AgoraChatCustomMessageBody alloc] init];
    body.event = @"userCard";
    NSDictionary *messageExt = @{@"userId":AgoraChatClient.sharedClient.currentUsername,
                          @"nickname":@"nickname",
                          @"avatar":@"https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png"
                        };
    body.ext = messageExt;
    AgoraChatMessage *message = [[AgoraChatMessage alloc] initWithConversationID:@"conversationID"
                                                          from:@"sender"
                                                            to:@"receiver"
                                                          body:body
                                                           ext:nil];
    // send message
    [[AgoraChatClient sharedClient].chatManager sendMessage:message progress:nil completion:^(AgoraChatMessage *message, AgoraChatError *error) {
    }];
```

### Flutter

### Manage user avatar

The Chat SDK only supports storing the URL address of the avatar file rather than the file itself. To manage user avatars, you need to use a third-party file storage service.

To implement user avatar management in your app, take the following steps:

1. Upload the avatar file to the third-party file storage service. Once the file is successfully uploaded, you get a URL address of the avatar file.
2. Set the `avatarUrl` parameter in user attributes as the URL address of the avatar file.
3. To display the avatar, call `fetchUserInfoById` to retrieve the URL of the avatar file, and then render the image on the local UI.

### React Native

### Manage user avatar

The Chat SDK only supports storing the URL address of the avatar file rather than the file itself. To manage user avatars, you need to use a third-party file storage service.

To implement user avatar management in your app, take the following steps:

1. Upload the avatar file to the third-party file storage service. Once the file is successfully uploaded, you get a URL address of the avatar file.
2. Set the `avatarUrl` parameter in user attributes as the URL address of the avatar file.
3. To display the avatar, call `fetchUserInfoById` to retrieve the URL of the avatar file, and then render the image on the local UI.

### Create and send a namecard using user attributes

Namecard messages are custom messages that include the user ID, nickname, avatar, email address, and phone number of the specified user. To create and send a namecard, take the following steps:

1. Create a custom message and set the `event` of the custom message as `userCard`.
2. Add `userId`, `nickname`, and `avatarUrl` as fileds in `ext`. Send the custom message.

Followings are the sample code for creating and sending a namecard message:

```typescript
// Customize the message.
const event = "userCard";
// You can also add more fields in ext
const ext = { userId: "userId", nickname: "nickname", avatarUrl: "avatarUrl" };
const msg = ChatMessage.createCustomMessage(targetId, event, chatType, {
  params: JSON.parse(ext),
});
// Call sendMessage to send the customized message.
ChatClient.getInstance()
  .chatManager.sendMessage(msg!, new ChatMessageCallback())
  .then(() => {
    console.log("send message success.");
  })
  .catch((reason) => {
    console.log("send message fail.", reason);
  });
```

### Windows

### Manage user avatar

The Chat SDK only supports storing the URL address of the avatar file rather than the file itself. To manage user avatars, you need to use a third-party file storage service.

To implement user avatar management in your app, take the following steps:

1. Upload the avatar file to the third-party file storage service. Once the file is successfully uploaded, you get a URL address of the avatar file.
2. Set the `avatarUrl` parameter in user attributes as the URL address of the avatar file.
3. To display the avatar, call `FetchUserInfoByUserId` to retrieve the URL of the avatar file, and then render the image on the local UI.

### Create and send a namecard using user attributes

Namecard messages are custom messages that include the user ID, nickname, avatar, email address, and phone number of the specified user. To create and send a namecard, take the following steps:

1. Create a custom message and set the `event` of the custom message as `userCard`.
2. Add `userID`, `nickname`, and `avatarUrl` as fileds in `ext`. Send the custom message.

Followings are the sample code for creating and sending a namecard message:

```csharp
string event = "userCard";
Dictionary adict = new Dictionary();
adict.Add("userId", userInfo.userId);
adict.Add("nickname", userInfo. nickname);
adict.Add("avatarUrl", userInfo.avatarUrl);
// You can add more fields.

// Create a custom message.
Message msg = Message.CreateCustomSendMessage(toChatUsername, event, adict);

// Send the message.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
   onSuccess: () => {
      Debug.Log($"{msg.MsgId}Sending success");
   },
   onError: (code, desc) => {
      Debug.Log($"{msg.MsgId}Sending failure，errCode={code}, errDesc={desc}");
   }
));
```

### Unity

### Manage user avatar

The Chat SDK only supports storing the URL address of the avatar file rather than the file itself. To manage user avatars, you need to use a third-party file storage service.

To implement user avatar management in your app, take the following steps:

1. Upload the avatar file to the third-party file storage service. Once the file is successfully uploaded, you get a URL address of the avatar file.
2. Set the `avatarUrl` parameter in user attributes as the URL address of the avatar file.
3. To display the avatar, call `FetchUserInfoByUserId` to retrieve the URL of the avatar file, and then render the image on the local UI.

### Create and send a namecard using user attributes

Namecard messages are custom messages that include the user ID, nickname, avatar, email address, and phone number of the specified user. To create and send a namecard, take the following steps:

1. Create a custom message and set the `event` of the custom message as `userCard`.
2. Add `userID`, `nickname`, and `avatarUrl` as fileds in `ext`. Send the custom message.

Followings are the sample code for creating and sending a namecard message:

```csharp
string event = "userCard";
Dictionary adict = new Dictionary();
adict.Add("userId", userInfo.userId);
adict.Add("nickname", userInfo. nickname);
adict.Add("avatarUrl", userInfo.avatarUrl);
// You can add more fields.

// Create a custom message.
Message msg = Message.CreateCustomSendMessage(toChatUsername, event, adict);

// Send the message.
SDKClient.Instance.ChatManager.SendMessage(ref msg, new CallBack(
   onSuccess: () => {
      Debug.Log($"{msg.MsgId}Sending success");
   },
   onError: (code, desc) => {
      Debug.Log($"{msg.MsgId}Sending failure，errCode={code}, errDesc={desc}");
   }
));
```

### Web

### Manage user avatar

The Chat SDK only supports storing the URL address of the avatar file rather than the file itself. To manage user avatars, you need to use a third-party file storage service.

To implement user avatar management in your app, take the following steps:

1. Upload the avatar file to the third-party file storage service. Once the file is successfully uploaded, you get a URL address of the avatar file.
2. Set the `avatarUrl` parameter in user attributes as the URL address of the avatar file.
3. To display the avatar, call `fetchUserInfoById` to retrieve the URL of the avatar file, and then render the image on the local UI.

### Create and send a namecard using user attributes

Namecard messages are custom messages that include the user ID, nickname, avatar, email address, and phone number of the specified user. To create and send a namecard, take the following steps:

1. Set the messsage type as `custom`.
2. Set the `customEvent` of the custom message as `userCard`.
3. Retrieve the values of `nickname`, `mail`, and `avatarurl` from the user attributes, and then set them as the the extension of the custom message using `customExts`.

Followings are the sample code for creating and sending a namecard message:

```javascript
// Set custom event type as userCard
const customEvent = "userCard";
// Set these attributes as the extension of the custom message using customExts.
const customExts = {
  nickname: "The nickname",
  avatarurl: "https://avatarurl",
  mail: "abc@gmail.com",
  phone: "phone number",
  gender: "female",
  birth: "2000-01-01",
  sign: "a sign",
};
const options = {
  // Set the message type.
  type: "custom",
  // Set the message recipient.
  to: "username",
  // Set the message event.
  customEvent,
  // Set the message content
  customExts,
  chatType: "singleChat",
};
// Create a custom message.
const msg = AgoraChat.message.create(options);
chatClient
  .send(msg)
  .then((res) => {
    console.log("Success");
  })
  .catch((e) => {
    console.log("error");
  });
```
