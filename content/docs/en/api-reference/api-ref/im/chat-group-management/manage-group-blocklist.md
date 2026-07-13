---
title: "Manage chat group block list"
description: "Shows how to manage a chat group block list by calling the Agora Chat RESTful APIs."
---

A chat group blocklist refers to a list of users that can neither see nor receive group messages. Chat provides a complete set of blocklist management methods, including adding and removing chat group members from the chat group blocklist, and retrieving the blocklist.

This page shows how to manage a chat group blocklist by calling the Chat RESTful APIs. Before calling the following methods, ensure that you understand the call frequency limit described in [Limitations](../limitations#call-limit-of-server-sides).

## Common parameters

The following table lists common request and response parameters of the Chat RESTful APIs:

### Request parameters 

| Parameter | Type | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Required |
| :--------- | :----- |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------- |
| `host` | String | The domain name assigned by the Chat service to access RESTful APIs. For how to get the domain name, see [Get the information of your project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                                      | Yes |
| `app_id` | String | The unique identifier automatically assigned to each project by Agora | Yes |
| `username` | String | <Slot name="username" /> | Yes |

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
| :---------------- | :----- | :---------------------------------------------------------------- |
| `action` | String | The request method. |
| `organization` | String | The unique identifier assigned to each company (organization) by the Chat service. |
| `application` | String | A unique internal ID assigned to each app by the Chat service. You can safely ignore this parameter. |
| `applicationName` | String | The unique identifier assigned to each app by the Chat service. |
| `uri` | String | The request URI. |
| `path` | String | The request path, which is part of the request URI. You can safely ignore this parameter. |
| `entities ` | JSON | The response entity. |
| `data` | JSON | The details of the response. |
| `timestamp` | Number | The Unix timestamp (ms) of the HTTP response. |
| `duration` | Number | The duration (ms) from when the HTTP request is sent to the time the response is received. |

## Authorization

Chat RESTful APIs require Bearer HTTP authentication. Every time an HTTP request is sent, the following `Authorization` field must be filled in the request header:

```html
Authorization: Bearer ${YourAppToken}
```

In order to improve the security of the project, Agora uses a token (dynamic key) to authenticate users before they log in to the chat system. Chat RESTful APIs only support authenticating users using app tokens. For details, see [Authentication using App Token](/en/realtime-media/im/build/secure-access-and-authentication/authentication).

## Retrieving the chat group blocklist

Retrieves the blocklist of the specified chat group. Users added to the blocklist can neither see nor receive messages in the chat group.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```bash
GET https://{host}/app-id/{app_id}/chatgroups/{group_id}/blocks/users?pageSize={N}&cursor={cursor}
```

#### Path parameter

| Parameter | Type | Description | Required |
| :------- | :----- | :-------- | :------- |
| `group_id` | String | The group ID. | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Query parameter

| Parameter | Type | Description | Required |
| :------- | :----- | :-------- | :------- |
| `pageSize` | Number | The number of users on the blocklist to retrieve per page. | Yes |
| `cursor` | String | The position from which to start getting data. | Yes |

:::info
If you pass in neither `pageSize` nor `cursor`, the server returns the top 500 users in the descending order of time when they are added to the blocklist. If you pass in only  `pageSize`, but not `cursor`, the server returns a maximum of 50 users in the descending order of time when they are added to the blocklist.
:::

#### Request header

| Parameter | Type | Description | Required |
| :------------ | :----- | :----------------------------------------------------------- | :------- |
| `Content-Type` | String | The parameter type. Set it as `application/json`. | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is 200, the request succeeds, and the `data` field in the response body contains the usernames in the group blocklist.

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code ](#code) for possible causes.

### Example

#### Request example

```bash
curl -X GET -H 'Accept: application/json' -H 'Authorization: Bearer ' 'https://XXXX/app-id/XXXX/chatgroups/66XXXX85/blocks/users?pageSize=2'
```

#### Response example

```json
{
    "uri": " https://XXXX/app-id/XXXX/chatgroups/66XXXX85/users/blocks/users",
    "timestamp": 1682064422108,
    "entities": [],
    "cursor": "MTA5OTAwMzMwNDUzNTA2ODY1NA==",
    "count": 2,
    "action": "get",
    "data": [
        "tst05",
        "tst04"
    ],
    "duration": 52
}
```

## Adding a user to the chat group blocklist

Adds the specified user to the chat group blocklist. Once added to the chat group blocklist, users can neither send nor receive messages in the chat group.

You cannot add the chat group owner to the group blocklist.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```bash
POST https://{host}/app-id/{app_id}/chatgroups/{group_id}/blocks/users/{username}
```

#### Path parameter

| Parameter | Type | Description | Required |
| :------- | :----- | :-------- | :------- |
| `group_id` | String | The group ID. | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :------------ | :----- | :----------------------------------------------------------- | :------- |
| `Content-Type` | String | The parameter type. Set it as `application/json`. | Yes |
| `Accept` | String | The parameter type. Set it as `application/json`. | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is 200, the request succeeds, and the data field in the response body contains the following parameters.

| Parameter | Type | Description |
| :------ | :------ | :------------------------------------------------ |
| `result` | Boolean | Whether the users are successfully added to the group blocklist. `true`: Yes. `false`: No. |
| `groupid` | String | The group ID. |
| `action` | String | The request method. |
| `user` | String | The usernames added to the group blocklist. |

For other fields and descriptions, see [Common parameters](#param).

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code ](#code) for possible causes.

### Example

#### Request example

```bash
curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer ' 'http://XXXX/app-id/XXXX/chatgroups/66016455491585/blocks/users/user1'
```

#### Response example

```json
{
    "action": "post",
    "application": "8be024f0-XXXX-XXXX-b697-5d598d5f8402",
    "uri": "http://XXXX/app-id/XXXX/chatgroups/66016455491585/blocks/users/user1",
    "entities": [],
    "data": {
      "result": true,
      "action": "add_blocks",
      "user": "user1"
      "groupid": "66016455491585"
    },
    "timestamp": 1542539577124,
    "duration": 27,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Adding multiple users to the chat group blocklist

Adding multiple users to the group blocklist. Once added to the chat group blocklist, users can neither send nor receive messages in the chat group.

You can add a maximim of 60 users to the group blocklist each time. You cannot add the group owner to the group blocklist.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```bash
POST https://{host}/app-id/{app_id}/chatgroups/{group_id}/blocks/users
```

#### Path parameter

| Parameter | Type | Description | Required |
| :------- | :----- | :-------- | :------- |
| `group_id` | String | The group ID. | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :------------ | :----- | :----------------------------------------------------------- | :------- |
| `Content-Type` | String | The parameter type. Set it as `application/json`. | Yes |
| `Accept` | String | The parameter type. Set it as `application/json`. | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

#### Request body

| Parameter | Type | Description | Required |
| :-------- | :---- | :------------------------------ | :------- |
| `usernames` | Array | The array of usernames to be added to the group blocklist. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is 200, the request succeeds, and the data field in the response body contains the following parameters.

| Parameter | Type | Description |
| :------ | :------ | :------------------------------------------------ |
| `result` | Boolean | Whether the users are successfully added to the group blocklist. `true`: Yes. `false`: No. |
| `reason` | String | The reason why the users fail to be added to the group blocklist. |
| `groupid` | String | The group ID. |
| `action` | String | The request method. |
| `user` | String | The usernames added to the group blocklist. |

For other fields and descriptions, see [Common parameters](#param).

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code ](#code) for possible causes.

### Example

#### Request example

```bash
curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer ' -d '{
    "usernames": [
      "user3","user4"
    ]
}' 'http://XXXX/app-id/XXXX/chatgroups/66016455491585/blocks/users'
```

#### Response example

```json
{
    "action": "post",
    "application": "8be024f0-XXXX-XXXX-b697-5d598d5f8402",
    "uri": "http://XXXX/app-id/XXXX/chatgroups/66016455491585/blocks/users",
    "entities": [],
    "data": [
      {
        "result": false,
        "action": "add_blocks",
        "reason": "user: user3 doesn't exist in group: 66016455491585",
        "user": "user3",
        "groupid": "66016455491585"
      },
      {
        "result": true,
        "action": "add_blocks",
        "user": "user4",
        "groupid": "66016455491585"
      }
    ],
    "timestamp": 1542540095540,
    "duration": 16,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Removing a user from the chat group blocklist

Removes the specified user from the chat group blocklist. To add a user that is in the blocklist back to the chat group, you need to remove that user from the blocklist first.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```bash
DELETE https://{host}/app-id/{app_id}/chatgroups/{group_id}/blocks/users/{username}
```

#### Path parameter

| Parameter | Type | Description | Required |
| :------- | :----- | :-------- | :------- |
| `group_id` | String | The group ID. | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :------------ | :----- | :----------------------------------------------------------- | :------- |
| `Accept` | String | The parameter type. Set it as `application/json`. | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is 200, the request succeeds, and the data field in the response body contains the following parameters.

| Parameter | Type | Description |
| :------ | :------ | :------------------------------------------------ |
| `result` | Boolean | Whether the user is successfully removed from the group blocklist. true: Yes.false: No. |
| `groupid` | String | The group ID. |
| `action` | String | The request method. |
| `user` | String | The usernames removed from the group blocklist. |

For other fields and descriptions, see [Common parameters](#param).

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code ](#code) for possible causes.

### Example

#### Request example

```bash
curl -X DELETE -H 'Accept: application/json' -H 'Authorization: Bearer ' 'http://XXXX/app-id/XXXX/chatgroups/66016455491585/blocks/users/user1'
```

#### Response example

```json
{
    "action": "delete",
    "application": "8be024f0-XXXX-XXXX-b697-5d598d5f8402",
    "uri": "http://XXXX/app-id/XXXX/chatgroups/66016455491585/blocks/users/user1",
    "entities": [],
    "data": {
      "result": true,
      "action": "remove_blocks",
      "user": "user1"
      "groupid": "66016455491585"
    },
    "timestamp": 1542540470679,
    "duration": 45,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Removing multiple users from the chat group blocklist

Removes the specified users from the group blocklist. To add users that are in the blocklist back to the chat group, you need to remove these users from the blocklist first. You can remove up to 60 users from the blocklist each time.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```bash
DELETE https://{host}/app-id/{app_id}/chatgroups/{group_id}/blocks/users/{usernames}
```

#### Path parameter

| Parameter | Type | Description | Required |
| :-------- | :----- | :---------------------------------------- | :------- |
| `group_id` | String | The group ID. | Yes |
| `usernames` | String | The usernames to be removed from the group blocklist, separated by the comma (,). | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :------------ | :----- | :----------------------------------------------------------- | :------- |
| `Accept` | String | The parameter type. Set it as `application/json`. | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is 200, the request succeeds, and the `data` field in the response body contains the following parameters.

| Parameter | Type | Description |
| :------ | :------ | :------------------------------------------------ |
| Parameter | Type | Description |
| `result` | Boolean | Whether the user is successfully removed from the group. true: Yes.false: No. |
| `groupid` | String | The group ID. |
| `action` | String | The request method. |
| `user` | String | The usernames removed from the group blocklist. |

For other fields and descriptions, see [Common parameters](#param).

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code ](#code) for possible causes.

### Example

#### Request example

```bash
curl -X DELETE -H 'Accept: application/json' -H 'Authorization: Bearer ' 'http://XXXX/app-id/XXXX/chatgroups/66016455491585/blocks/users/user1%2Cuser2'
```

#### Response example

```json
{
    "action": "delete",
    "application": "8be024f0-XXXX-XXXX-b697-5d598d5f8402",
    "uri": "http://XXXX/app-id/XXXX/chatgroups/66016455491585/blocks/users/user1%2Cuser2",
    "entities": [],
    "data": [
      {
        "result": true,
        "action": "remove_blocks",
        "user": "user1"
        "groupid": "66016455491585"
      },
      {
        "result": true,
        "action": "remove_blocks",
        "user": "user2",
        "groupid": "66016455491585"
      }
    ],
    "timestamp": 1542541014655,
    "duration": 29,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Status codes

For details, see [HTTP Status Code](../http-status-codes).
