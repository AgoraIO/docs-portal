---
title: "Manage chat group mute list"
description: "Shows how to manage the mute list by calling Agora Chat RESTful APIs."
---

Muting means to prevent group users from sending messages in the group. Chat provides multiple mute management APIs, including those for getting the mute list, adding a user to the mute list, and removing a user from the mute list.

This page shows how to manage the mute list by calling Chat RESTful APIs. Before calling the following methods, ensure that you understand the call frequency limit described in [Limitations](../limitations#call-limit-of-server-sides).

## Common parameters

The following table lists common request and response parameters of the Chat RESTful APIs:

### Request parameters 

| Parameter | Type | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Required |
| :--------- | :----- |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------- |
| `host` | String | The domain name assigned by the Chat service to access RESTful APIs. For how to get the domain name, see [Get the information of your project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                            | Yes |
| `org_name` | String | The unique identifier assigned to each company (organization) by the Chat service. For how to get the org name, see [Get the information of your project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                 | Yes |
| `app_name` | String | The unique identifier assigned to each app by the Chat service. For how to get the app name, see [Get the information of your project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                                    | Yes |
| `username` | String | The unique login account of the user. The user ID must be 64 characters or less and cannot be empty.  The following character sets are supported:26 lowercase English letters (a-z)"\_", "-", ".":::info
Do not use any of the 26 uppercase English letters (A-Z).Ensure that each `username` under the same app is unique.
::: | Yes |

### Response parameters 

| Parameter | Type | Description |
| :---------------- | :----- | :---------------------------------------------------------------- |
| `action` | String | The request method. |
| `organization` | String | The unique identifier assigned to each company (organization) by the Chat service. This is the same as `org_name`. |
| `application` | String | A unique internal ID assigned to each app by the Chat service. You can safely ignore this parameter. |
| `applicationName` | String | The unique identifier assigned to each app by the Chat service. This is the same as `app_name`. |
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

In order to improve the security of the project, Agora uses a token (dynamic key) to authenticate users before they log in to the chat system. Chat RESTful APIs only support authenticating users using app tokens. For details, see [Authentication using App Token](/en/realtime-media/im/build/authentication).

## Muting a  member

Adds a  member to the group mute list. Once muted, members cannot send messages in the  or in any threads within the .

### HTTP request

```json
POST https://{host}/{org_name}/{app_name}/chatgroups/{group_id}/mute
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
| :------------ | :---- | :------------------------ | :------- |
| `mute_duration` | Long | The duration in which the specified member is muted, in milliseconds. | Yes |
| `usernames` | Array | The user IDs to be added to the  mute list. You can pass in a maximum of 60 user IDs. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is 200, the request succeeds, and the `data` field in the response body contains the following parameters.

| Parameter | Type | Description |
| :----- | :------ | :------------------------------------------ |
| `result` | Boolean | Whether the  member is successfully added to the mute list.`true`: Success`false`: Failure |
| `expire` | Long | The Unix timestamp when the mute state expires, in milliseconds. |
| `user` | String | The user ID of the muted  member.|

For other fields and descriptions, see [Common parameter](#param).

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code](../http-status-codes) for possible causes.

### Example

#### Request example

```shell
curl -X POST -H 'Content-type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer ' -d '{"usernames":["user1"], "mute_duration":86400000}' 'http://XXXX/XXXX/XXXX/chatgroups/10130212061185/mute'
```

#### Response example

```json
{
    "action": "post",
    "application": "527cd7e0-XXXX-XXXX-9f59-ef10ecd81ff0",
    "uri": "http://XXXX/XXXX/XXXX/chatgroups/10130212061185/mute",
    "entities": [],
    "data": [{
        "result": true,
        "expire": 1489158589481,
        "user": "user1"
    }],
    "timestamp": 1489072189508,
    "duration": 0,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Unmuting a  member

Removes the specified user from the  mute list. Once removed from the mute list, a member can once again send messages in the  and in the threads within the .

### HTTP request

```shell
DELETE https://{host}/{org_name}/{app_name}/chatgroups/{group_id}/mute/{member_id}
```

#### Path parameter

| Parameter | Type | Description | Required |
| :-------- | :----- | :----------------------------------------------------------- | :------- |
| `group_id` | String | The group ID. | Yes |
| `member_id` | String | The user ID of a group member to be removed from the  mute list. You can pass in a maximum of 60 user IDs that are separated by comma (,). For example, `{member1}, {member2}`. | Yes |

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
| :----- | :------ | :-------------------------------------- |
| `result` | Boolean | Whether the user is successfully removed from the mute list.`true`: Yes.`false`: No. |
| `user` | String | The usernames removed from the mute list. |

For other fields and descriptions, see [Common parameter](#param).

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code](../http-status-codes) for possible causes.

### Example

#### Request example

```shell
curl -X DELETE -H 'Accept: application/json' -H 'Authorization: Bearer ' 'http://XXXX/XXXX/XXXX/chatgroups/10130212061185/mute/user1'
```

#### Response example

```json
{
    "action": "delete",
    "application": "527cd7e0-XXXX-XXXX-9f59-ef10ecd81ff0",
    "uri": "http://XXXX/XXXX/XXXX/chatgroups/10130212061185/mute/user1",
    "entities": [],
    "data": [{
        "result": true,
        "user": "user1"
    }],
    "timestamp": 1489072695859,
    "duration": 0,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Retrieving the mute list

Retrieves the mute list of the .

### HTTP request

```shell
GET https://{host}/{org_name}/{app_name}/chatgroups/{group_id}/mute
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

If the returned HTTP status code is 200, the request succeeds, and the `data` field in the response body contains the following parameters.

| Parameter | Type | Description |
| :----- | :----- | :---------------------------- |
| `expire` | Long | The Unix timestamp when the mute state expires, in milliseconds. |
| `user` | String | The usernames of the muted members. |

For other fields and descriptions, see [Common parameter](#param).

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code](../http-status-codes) for possible causes.

### Example

#### Request example

```shell
curl -X GET -H 'Accept: application/json' 'http://XXXX/XXXX/XXXX/chatgroups/10130212061185/mute' -H 'Authorization: Bearer '
```

#### Response example

```json
{
    "action": "post",
    "application": "527cd7e0-XXXX-XXXX-9f59-ef10ecd81ff0",
    "uri": "http://XXXX/XXXX/XXXX/chatgroups/10130212061185/mute",
    "entities": [],
    "data": [{
        "expire": 1489158589481,
        "user": "user1"
    }],
    "timestamp": 1489072802179,
    "duration": 0,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Muting all  members

This method mutes all the  members. If this method call succeeds, none of the  members can send messages in the  or in any threads within the , except those in the group [allow list](./manage-group-allowlist). As the mute does not expire in a certain period, you need to call the API of unmuting all  members to stop muting them.

### HTTP request

```shell
POST https://{host}/{org_name}/{app_name}/chatgroups/{group_id}/ban
```

#### Path parameter

| Parameter | Type | Description | Required |
| --- | --- | --- | --- |
| `group_id` | String | The  ID. | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :------------ | :----- | :----------------------------------------------------------- | :------- |
| `Content-Type` | String | The parameter type. Set it as `application/json`. | Yes |
| `Authorization` | String | The authentication token of the user or admin, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is 200, the request succeeds, and the `data` field in the response body contains the following parameters:

| Parameter | Type | Description |
| :----- | :----- | :---------------------------- |
| `data.mute`| Boolean | Whether all the  members are muted.`true`: Yes.`false`: No. |

For other fields and descriptions, see [Common parameter](#param).

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code](../http-status-codes) for possible causes.

### Example

#### Request example

```shell
curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer {Your app token}' 'http://XXXX/XXXX/XXXX/chatgroups/{The group ID}/ban'
```

#### Response example

```json
{
    "action": "put",
    "application": "5cf28979-XXXX-XXXX-b969-60141fb9c75d",
    "uri": "http://XXXX/XXXX/XXXX/chatgroups/1208XXXX5169153/ban",
    "entities": [],
    "data": {
        "mute": true
    },
    "timestamp": org_name94628861058,
    "duration": 1,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Unmuting all  members

This method unmutes all the  members. Once unmuted, the  members can once again send messages in the  and in the threads within the .

### HTTP request

```shell
DELETE https://{host}/{org_name}/{app_name}/chatgroups/{group_id}/ban
```

#### Path parameter

| Parameter | Type | Description | Required |
| --- | --- | --- | --- |
| `group_id` | String | The  ID. | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :------------ | :----- | :----------------------------------------------------------- | :------- |
| `Content-Type` | String | The parameter type. Set it as `application/json`. | Yes |
| `Authorization` | String | The authentication token of the user or admin, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is 200, the request succeeds, and the `data` field in the response body contains the following parameters:

| Parameter | Type | Description |
| :----- | :----- | :---------------------------- |
| `result`| Boolean | Whether all the  members are unmuted.`true`: Yes.`false`: No. |

For other fields and descriptions, see [Common parameter](#param).

If the returned HTTP status code is not 200, the request fails. You can refer to [Status code](../http-status-codes) for possible causes.

### Example

#### Request example

```shell
curl -X DELETE -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer {Your app token}' 'http://XXXX/XXXX/XXXX/chatgroups/1208XXXX5169153/ban'
```

#### Response example

```json
{
    "action": "put",
    "application": "527cd7e0-XXXX-XXXX-9f59-ef10ecd81ff0",
    "uri": "http://XXXX/XXXX/XXXX/chatgroups/120824965169153/ban",
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
