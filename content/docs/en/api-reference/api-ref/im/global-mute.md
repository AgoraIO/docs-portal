---
title: "Global mute"
description: "Introduces the global-mute feature."
---

With increasingly strict rules and regulations on app compliance, content supervision has become a crucial part of the app lifecycle. To meet this need, Chat provides the global-mute feature, which enables you to mute any user ID in one-to-one chats, s, or s, preventing these users from sending messages to other chat users, s, or s. When global-mute expires, the chat server automatically unmutes the user ID, and this user resumes the privilege of sending messages.

This feature can be widely applied in apps that power real-time engagements. For example, if a user frequently sends illegitimate advertisements to multiple s, you can use global-mute to prevent this user from sending  messages for 15 days; if a user makes improper statements concerning politics, global-mute can permanently prevent this user from sending any messages in one-to-one chats, s, or s.

Before calling the following methods, make sure you understand the call frequency limit of the Chat RESTful APIs as described in [Limitations](./limitations#call-limit-of-server-sides).

## Common parameters

The following table lists common request and response parameters of the Chat RESTful APIs:

### Request parameters 

| Parameter | Type | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Required |
| :--------- | :----- |:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------- |
| `host` | String | The domain name assigned by the Chat service to access RESTful APIs. For how to get the domain name, see [Get the information of your project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                                                                                                                                      | Yes |
| `org_name` | String | The unique identifier assigned to each company (organization) by the Chat service. For how to get the org name, see [Get the information of the Chat project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                                                                                                             | Yes |
| `app_name` | String | The unique identifier assigned to each app by the Chat service. For how to get the app name, see [Get the information of the Chat project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                                                                                                                                | Yes |
| `username` | String | <Slot name="username" /> | Yes |

<Slot for="username">

The unique login account of the user. The user ID must be 64 characters or less and cannot be empty. The following character sets are supported:

- 26 lowercase English letters (a-z)
- 10 numbers (0-9)
- "\_", "-", "."

:::info
Do not use any of the 26 uppercase English letters (A-Z). Ensure that each `username` under the same app is unique. Do not set this parameter as a UUID, email address, phone number, or other sensitive information.
:::

</Slot>

### Response parameters 

| Parameter | Type | Description |
| :------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `action` | String | The request method. |
| `organization` | String | The unique identifier assigned to each company (organization) by the Chat service. This is the same as `org_name`. |
| `application` | String | A unique internal ID assigned to each app by the Chat service. You can safely ignore this parameter. |
| `applicationName` | String | The unique identifier assigned to each app by the Chat service . This is the same as `app_name`. |
| `uri` | String | The request URI. |
| `path` | String | The request path, which is part of the request URL. You can safely ignore this parameter. |
| `data`  | JSON | The response details.  |
| `timestamp` | Number | The Unix timestamp (ms) of the HTTP response. |
| `duration` | Number | The duration (ms) from when the HTTP request is sent to the time the response is received. |

## Authorization

Chat RESTful APIs require Bearer HTTP authentication. Every time an HTTP request is sent, the following `Authorization` field must be filled in the request header:

```html
Authorization: Bearer ${YourAppToken}
```

In order to improve the security of the project, Agora uses a token (dynamic key) to authenticate users before they log in to the chat system. Chat RESTful APIs only support authenticating users using app tokens. For details, see [Authentication using App Token](/en/realtime-media/im/build/secure-access-and-authentication/authentication).

## Globally mute a specified user

This method mutes a specified user in one-to-one chats, s, or s. After a successful method call, this user can no longer send messages in one-to-one chats, s, or s, depending on your settings in the request parameter.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```html
POST https://{host}/{orgName}/{appName}/mutes
```

#### Path parameter

For parameters and the detailed descriptions, see [Common parameters](#param).

#### Request parameter

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `username` | String | Yes | The user ID that you want to globally mute. |
| `chat` | Number | No | The amount of time to mute this user ID in one-to-one chats, in seconds. The maximum value is 2,147,483,647.&gt; 0: The amount of time to mute the user in one-to-one chats.0: Unmutes the user in one-to-one chats.-1: Permanently mutes the user in one-to-one chats.If you set this parameter as any other negative values, the setting does not take effect. |
| `groupchat` | Number | No | The amount of time to mute this user in s, in seconds. The maximum value is 2,147,483,647.&gt; 0: The amount of time to mute the user in s.0: Unmutes the user in s.-1: Permanently mutes the user in s.If you set this parameter as any other negative values, the setting does not take effect. |
| `chatroom` | Number | No | The amount of time to mute this user in s, in seconds. The maximum value is 2,147,483,647.&gt; 0: The amount of time to mute the user in s.0: Unmutes the user in s.-1: Permanently mutes the user in s.If you set this parameter as any other negative values, the setting does not take effect. |

#### Request header

| Parameter | Type | Description |
| --- | --- | --- |
| `Content-Type` | String | The content type. Set is as `application/json`. |
| `Authorization` | String | The authentication token of the user or admin, in the format of `Bearer ${YourAppToken}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. |

### HTTP response

If the returned HTTP status code is `200`, the request succeeds, and the response body contains the following fields:

| Parameter | Type | Description |
| --- | --- | --- |
| `result` | String | The result of this method call. `ok` means that global-mute is successfully enabled. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](./http-status-codes) for possible reasons.

### Example

#### Request example

```shell
curl -L -X POST 'https://XXXX/XXXX/XXXX/mutes' \
-H 'Authorization: Bearer {YourAppToken}' \
-H 'Content-Type: application/json' \
--data-raw '{
    "username": "XXXX",
    "chat": 100,
    "groupchat": 100,
    "chatroom": 100
}'
```

#### Reponse example

```json
{
    "path": "/mutes",
    "uri": "https://XXXX/XXXX/XXXX/mutes",
    "timestamp": 1631609754727,
    "organization": "XXXX",
    "application": "XXXX",
    "action": "post",
    "data": {
        "result": "ok"
    },
    "duration": 74,
    "applicationName": "XXXX"
}
```

## Query the detailed information of global-mute

This method queries the detailed information of the global-mute settings of the specified user in one-to-one chats, s, or chatrooms.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```html
GET https://{host}/{orgName}/{appName}/mutes/{username}
```

#### Path parameter

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `username` | String | Yes | The user ID whose global-mute settings you want to query. |

For other parameters and the detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description |
| --- | --- | --- |
| `Content-Type` | String | The content type. Set is as `application/json`. |
| `Authorization` | String | The authentication token of the user or admin, in the format of `Bearer ${YourAppToken}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. |

### HTTP response

If the returned HTTP status code is `200`, the request succeeds, and the response body contains the following fields:

| Parameter | Type | Description |
| --- | --- | --- |
| `userid` | String | The user ID whose global-mute settings you want to query. |
| `chat` | Number | The remaining time that this user is muted in one-to-one chats, in seconds. The maximum value is 2,147,483,647.&gt; 0: The remaining time that this user is muted in one-to-one chats.0: This user is unmuted in one-to-one chats.-1: This user is permanently muted in one-to-one chats. |
| `groupchat` | Number | The remaining time that this user is muted in s, in seconds. The maximum value is 2,147,483,647.&gt; 0: The remaining time that this user is muted in s.0: This user is unmuted in s.-1: This user is permanently muted in s. |
| `chatroom` | Number | The remaining time that this user is muted in group rooms, in seconds. The maximum value is 2,147,483,647.&gt; 0: The remaining time that this user is muted in s.0: This user is unmuted in s.-1: This user is permanently muted in s. |
| `unixtime` | Number | The Unix timestamp of the current operation. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](./http-status-codes) for possible reasons.

### Example

#### Request example

```shell
curl -L -X GET 'https://XXXX/XXXX/XXXX/mutes/{username}' \
-H 'Authorization: Bearer {YourAppToken}' \
-H 'Content-Type: application/json'
```

#### Response example

```json
{
    "path": "/mutes",
    "uri": "https://XXXX/XXXX/XXXX/mutes",
    "timestamp": 1631609831800,
    "organization": "XXXX",
    "application": "XXXX",
    "action": "get",
    "data": {
        "userid": "XXXX",
        "chat": 96,
        "groupchat": 96,
        "chatroom": 96,
        "unixtime": 1631609831
    },
    "duration": 13,
    "applicationName": "XXXX"
}
```

## Retrieve all globally muted users

This method retrieves all the users that have been globally muted in the app, and returns the remaining time that each user is muted for each type of chat.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```html
GET https://{host}/{orgName}/{appName}/mutes
```

#### Path parameter

For parameters and the detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description |
| --- | --- | --- |
| `Content-Type` | String | The content type. Set is as `application/json`. |
| `Authorization` | String | The authentication token of the user or admin, in the format of `Bearer ${YourAppToken}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. |

#### Query parameter

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `pageNum` | Number | No | The number of pages for querying the globally muted users in the app. |
| `pageSize` | Number | No | The number of data entries on each page. The value range is [1,50]. |

### HTTP response

If the returned HTTP status code is `200`, the request succeeds, and the response body contains the following fields:

| Parameter | Type | Description |
| --- | --- | --- |
| `username` | String | The user ID whose global-mute settings you want to query. |
| `chat` | Number | The remaining time that this user is muted in one-to-one chats, in seconds. The maximum value is 2,147,483,647.&gt; 0: The remaining time that this user is muted in one-to-one chats.0: This user is unmuted in one-to-one chats.-1: This user is permanently muted in one-to-one chats. |
| `groupchat` | Number | The remaining time that this user is muted in s, in seconds. The maximum value is 2,147,483,647.&gt; 0: The remaining that this user in s.0: This user is unmuted in s.-1: This user is permanently muted in s. |
| `chatroom` | Number | The remaining time that this user is muted in group rooms, in seconds. The maximum value is 2,147,483,647.&gt; 0: The remaining duration for muting this user in s.0: This user is unmuted in s.-1: This user is permanently muted in s. |
| `unixtime` | Number | The Unix timestamp of the current operation. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](./http-status-codes) for possible reasons.

### Example

#### Request example

```shell
curl -L -X GET 'https://XXXX/XXXX/XXXX/mutes?pageNum=1&pageSize=10' \
-H 'Authorization: Bearer {YourAppToken}' \
-H 'Content-Type: application/json'
```

#### Response example

```json
{
    "path": "/mutes",
    "uri": "https://XXXX/XXXX/XXXX/mutes",
    "timestamp": 1631609858771,
    "organization": "XXXX",
    "application": "XXXX",
    "action": "get",
    "data": {
        "data": [
            {
                "username": "XXXX",
                "chatroom": 0
            },
            {
                "username": "XXXX",
                "groupchat": 69
            },
            {
                "username": "XXXX",
                "chat": 69
            },
            {
                "username": "XXXX",
                "chatroom": 69
            },
            {
                "username": "XXXX",
                "chatroom": 0
            },
            {
                "username": "XXXX",
                "groupchat": 0
            },
            {
                "username": "XXXX",
                "chat": 0
            }
        ],
        "unixtime": 1631609858
    },
    "duration": 17,
    "applicationName": "XXXX"
}
```

## Status codes

For details, see [HTTP Status Codes](./http-status-codes).
