---
title: "Manage chat room mute list"
description: "Shows how to perform chat room member mute management by calling the Agora Chat RESTful APIs."
---

This page shows how to perform chat room member mute management by calling the Chat RESTful APIs, including muting and unmuting members in a chat room, and retrieving the list of muted members.

Before calling the following methods, ensure that you understand the call frequency limit of the Chat RESTful APIs described in [Limitations](../limitations#call-limit-of-server-sides).

## Common parameters

The following table lists common request and response parameters of the Chat RESTful APIs:

### Request parameters 

| Parameter | Type | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Required |
| :--------- | :----- |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------- |
| `host` | String | The domain name assigned by the Chat service to access RESTful APIs. For how to get the domain name, see [Get the information of your project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                            | Yes |
| `app_id` | String | The unique identifier automatically assigned to each project by Agora | Yes |
| `username` | String | <Slot name="username" /> | Yes |
| `chatroom_id` | String | The chat room ID. The unique chat room identifier assigned to each chat room by the Chat. You can get the chat room ID from the response body in [Retrieve the basic information of all chat rooms](manage-chatrooms#retrieving-basic-information-of-all-chat-rooms).                                                                                                                                    | Yes |

<Slot for="username">

The unique login account of the user. The user ID must be 64 characters or less and cannot be empty. The following character sets are supported:

- 26 lowercase English letters (a-z)
- 10 numbers (0-9)
- "\_", "-", "."

:::info
Do not use any of the 26 uppercase English letters (A-Z). Ensure that each `username` under the same App ID is unique.
:::

</Slot>

### Response parameters 

| Parameter | Type | Description |
| :------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `action` | String | The request method. |
| `organization` | String | The unique identifier assigned to each company (organization) by the Chat service. |
| `application` | String | A unique internal ID assigned to each app by the Chat service. You can safely ignore this parameter. |
| `applicationName` | String | The unique identifier assigned to each app by the Chat service . |
| `uri` | String | The request URI. |
| `entities ` | JSON | The response entity. |
| `data` | JSON | The details of the response. |
| `timestamp` | Number | The Unix timestamp (ms) when the user is registered. |
| `duration` | Number | The time duration (ms) from sending the HTTP request to receiving the response. |

## Muting a chat room member

Mutes a chat room member. Once a chat room member is muted, this member cannot send messages in the chat room.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```html
POST https://{host}/app-id/{app_id}/chatrooms/{chatroom_id}/mute
```

#### Path parameter

For the parameters and detailed descriptions, see [Common parameters ](#param).

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Content-Type` | String | `application/json` | Yes |
| `Accept` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

#### Request body

The request body is a JSON object, which contains the following fields:

| Field | Type | Description | Required |
| :-------------- | :----- | :--------------------------------------------------------------------------------------------------------------------------------- | :------- |
| `mute_duration` | Number | The length of time to mute speech from the current time. The unit is milliseconds.`-1` indicates that the member is muted permanently. | Yes |
| `usernames` | String | The array of user IDs of chat room members that are to be muted. You can pass in a maximum of 60 user IDs. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds, and the response body contains the following fields:

| Field | Type | Description |
| :------- | :----- | :------------------------------------------------------ |
| `result` | Bool | The mute result: `true: `Success. `false`: Failure. |
| `expire` | Number | The Unix timestamp (ms) when the mute state expires. |
| `user` | Array | The username of the muted  member. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
# Replace  with the app token generated in your server.
curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer ' -d
'{
    "usernames": [
        "user1",
        "user2"
    ],
    "mute_duration": 86400000
}''http://a1.easemob.com/easemob-demo/testapp/chatrooms/1265710621211/mute'
```

#### Response example

```json
{
    "action": "post",
    "application": "22bcffa0-XXXX-XXXX-9df8-516f6df68c6d",
    "applicationName": "XXXX",
    "data": [
        {
            "result": true,
            "expire": 1642148173726,
            "user": "user1"
        },
        {
            "result": true,
            "expire": 1642148173726,
            "user": "user2"
        }
    ],
    "duration": 0,
    "entities": [],
    "organization": "XXXX",
    "timestamp": 1642060750410,
    "uri": "http://XXXX/app-id/XXXX/chatrooms/XXXX/mute"
}
```

## Unmuting members

Unmutes one or more chat room members. The unmuted members can continue to send messages in the chat room.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```html
DELETE https://{host}/app-id/{app_id}/chatrooms/{chatroom_id}/mute/{member}
```

#### Path parameter

| Parameter | Type | Description | Required |
| :------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| `member` | String | The username of the chat room member to be unmuted. You can pass in a maximum of 60 user IDs that are separated with commas (","). In the URL, use "%2C" to represent ",". | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Accept` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds. The response body contains the following fields:

| Field | Type | Description |
| :------- | :----- | :------------------------------------------------- |
| `result` | Bool | The unmute result: `true: `Success. `false`: Failure. |
| `user` | String | The username of the unmuted  member. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
# Replace  with the app token generated in your server.
curl -X DELETE -H 'Accept: application/json' -H 'Authorization: Bearer ' 'https://XXXX/app-id/XXXX/chatrooms/XXXX/mute/XXXX'
```

#### Response example

```json
{
    "action": "delete",
    "application": "527cd7e0-XXXX-XXXX-9f59-ef10ecd81ff0",
    "uri": "http://XXXX/app-id/XXXX/chatrooms/XXXX/mute/XXXX",
    "entities": [],
    "data": [
        {
            "result": true,
            "user": "XXXX"
        }
    ],
    "timestamp": 1489072695859,
    "duration": 0,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Retrieving muted members

Retrieves the list of all the muted members in the specified chat room.

For each App Key, the call frequency limit of this method is 100 per second.

```html
GET https://{host}/app-id/{app_id}/chatrooms/{chatroom_id}/mute
```

### HTTP request

#### Path parameter

For the parameters and detailed descriptions, see [Common parameters ](#param).

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Accept` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds. The response body contains the following fields:

| Field | Type | Description |
| :------- | :----- | :------------------------------- |
| `expire` | Number | The Unix timestamp (ms) when the mute expires. |
| `user` | String | The username of the muted  member. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
# Replace  with the app token generated in your server.
curl -X DELETE -H 'Accept: application/json' -H 'Authorization: Bearer ' 'https://XXXX/app-id/XXXX/chatrooms/XXXX/mute'
```

#### Response example

```json
{
    "action": "post",
    "application": "527cd7e0-XXXX-XXXX-9f59-ef10ecd81ff0",
    "uri": "http://XXXX/app-id/XXXX/chatrooms/XXXX/mute",
    "entities": [],
    "data": [
        {
            "expire": 1489158589481,
            "user": "user1"
        },
        {
            "expire": 1489158589481,
            "user": "user2"
        }
    ],
    "timestamp": 1489072802179,
    "duration": 0,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Muting all chat room members

Mutes all chat room members. Once this method call succeeds, only the members on the chat room allow list can send messages. For details, see [Manage Chat Room Allow List](./manage-chatroom-mutelist).

Muting all chat room members has no connection with the mute list. That is to say, calling this API will not add all chat room members to the chat room mute list.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```html
POST https://{host}/app-id/{app_id}/chatrooms/{chatroom_id}/ban
```

#### Path parameter

For the parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Required | Description | 
| :-------------- | :----- | :--------------------- | :------- |
| `Content-Type` | String | Yes | `application/json` |
| `Authorization` | String | Yes |  The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds. The response body contains the following fields:

| Parameter | Type | Description |
| :------- | :----- | :------------------------------------------------------ |
| `result` | Bool | Whether all members are successfully muted: `true`: Yes. `false`: No. |
| `expire` | Long | The Unix timestamp when the global mute state expires. Unit: milliseconds. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```bash
curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer YWMt4LqJIul7EeizhBO5TSO_UgAAAAAAAAAAAAAAAAAAAAGL4CTw6XgR6LaXXVmNX4QCAgMAAAFnG7GyAQBPGgDv4ENRUku7fg05Kev0a_aVC8NyA6O6PgpxIRjajSVN3g' 'http://XXXX/app-id/XXXX/chatrooms/1265710621211/ban'
```

#### Response example

```json
{
  "action": "put",
  "application": "5cf28979-XXXX-XXXX-b969-60141fb9c75d",
  "uri": "http://XXXX/app-id/XXXX/chatrooms/XXXX/ban",
  "entities": [],
  "data": {
    "mute": true
  },
  "timestamp": 1594628861058,
  "duration": 1,
  "organization": "XXXX",
  "applicationName": "XXXX"
} 
```

## Unmuting all chat room members

Unmutes all chat room members. Once unmuted, the chat room members resume the right to send messages in the chat room.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```html
DELETE https://{host}/app-id/{app_id}/chatrooms/{chatroom_id}/ban
```

#### Path parameter

For the parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Required | Description | 
| :-------------- | :----- | :--------------------- | :------- |
| `Content-Type` | String | Yes | `application/json` |
| `Authorization` | String | Yes |  The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds. The response body contains the following fields:

| Parameter     | Type    | Description                                              |
| :------- | :------ | :---------------------------------------------------- |
| `result` | Boolean | Whether all chat room members are successfully unmuted: `true`: Yes. `false`: No. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```bash
curl -X DELETE -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer YWMt4LqJIul7EeizhBO5TSO_UgAAAAAAAAAAAAAAAAAAAAGL4CTw6XgR6LaXXVmNX4QCAgMAAAFnG7GyAQBPGgDv4ENRUku7fg05Kev0a_aVC8NyA6O6PgpxIRjajSVN3g' 'http://XXXX/app-id/XXXX/chatrooms/XXXX/ban'
```

#### Response example

```json
{
  "action": "put",
  "application": "5cf28979-XXXX-XXXX-b969-60141fb9c75d",
  "uri": "http://XXXX/app-id/XXXX/chatrooms/XXXX/ban",
  "entities": [],
  "data": {
    "mute": false
  },
  "timestamp": 1594628899502,
  "duration": 1,
  "organization": "XXXX",
  "applicationName": "XXXX"
}
```

## Status codes 

For details, see [HTTP Status Codes](../http-status-codes).
