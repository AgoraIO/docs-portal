---
title: "Manage chat room admins"
description: "Shows how to manage super administrators of chat rooms by calling the Agora Chat RESTful APIs."
---

In an app integrated with Chat, only the super admin of s has the permission to create s on the client.

This page shows how to manage super administrators of s by calling the Chat RESTful APIs, including adding and retrieving super administrators and revoking the  creation privilege of a super administrator. Before calling the following methods, ensure that you understand the call frequency limit of the Chat RESTful APIs described in [Limitations](../../reference/limitations#call-limit-of-server-sides).

## Common parameters

The following table lists common request and response parameters of the Chat RESTful APIs:

### Request parameters 

| Parameter | Type | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Required |
| :--------- | :----- |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------- |
| `host` | String | The domain name assigned by the Chat service to access RESTful APIs. For how to get the domain name, see [Get the information of your project](../../get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                            | Yes |
| `org_name` | String | The unique identifier assigned to each company (organization) by the Chat service. For how to get the org name, see [Get the information of your project](../../get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                 | Yes |
| `app_name` | String | The unique identifier assigned to each app by the Chat service. For how to get the app name, see [Get the information of your project](../../get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                                    | Yes |
| `username` | String | The unique login account of the user. The user ID must be 64 characters or less and cannot be empty.  The following character sets are supported:26 lowercase English letters (a-z)10 numbers (0-9)"\_", "-", ".":::info
Do not use any of the 26 uppercase English letters (A-Z).Ensure that each `username` under the same app is unique.
::: | Yes |
| `chatroom_id` | String | The  ID. The unique  identifier assigned to each  by the Chat. You can get the  ID from the response body in [Retrieve the basic information of all s](manage-chatrooms#retrieving-basic-information-of-all-chat-rooms).                                                                                                                                    | Yes |

### Response parameters 

| Parameter | Type | Description |
| :------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `action` | String | The request method. |
| `organization` | String | The unique identifier assigned to each company (organization) by the Chat service. This is the same as `org_name`. |
| `application` | String | A unique internal ID assigned to each app by the Chat service. You can safely ignore this parameter. |
| `applicationName` | String | The unique identifier assigned to each app by the Chat service . This is the same as `app_name`. |
| `uri` | String | The request URI. |
| `path` | String | The request path, which is part of the request URL. You can safely ignore this parameter. |
| `entities ` | JSON | The response entity. |
| `data` | JSON | The details of the response. |
| `timestamp` | Number | The Unix timestamp (ms) when the user is registered. |
| `duration` | Number | The time duration (ms) from sending the HTTP request to receiving the response. |

## Authorization

Chat RESTful APIs require Bearer HTTP authentication. Every time an HTTP request is sent, the following `Authorization` field must be filled in the request header:

```html
Authorization: Bearer ${YourAppToken}
```

In order to improve the security of the project, Agora uses a token (dynamic key) to authenticate users before they log in to the chat system. Chat RESTful APIs only support authenticating users using app tokens. For details, see [Authentication using App Token](../../develop/authentication).

## Adding a  super admin

Adds a regular  member as the super admin of the .

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```html
POST https://{host}/{org_name}/{app_name}/chatrooms/super_admin
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
| :----------- | :----- | :--------------------------------- | :------- |
| `superadmin` | String | The username of the user to be added as the super administrator of s. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds, and the response body contains the following fields:

| Field | Type | Description |
| :--------- | :----- | :------------------------------------------------------ |
| `result` | Bool | The addition result:`true`: Success`false`: Failure |
| `resource` | String | It is a reserved parameter. You can safely ignore this parameter. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
# Replace  with the app token generated in your server.
curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer ' -d '{
   "superadmin": "user1"
 }''http://XXXX/XXXX/XXXX/chatrooms/super_admin'
```

#### Response example

```json
{
    "action": "post",
    "application": "9fa492a0-XXXX-XXXX-b1b9-a76b05da6904",
    "uri": "https://XXXX/XXXX/XXXX/chatrooms/super_admin",
    "entities": [],
    "data": {
        "result": "success",
        "resource": ""
    },
    "timestamp": 1596187658017,
    "duration": 1,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```

## Removing a  super admin

Removes the super admin privileges of the  super admin and that super admin becomes a regular  member.

For each App Key, the call frequency limit of this method is 100 per second.

```html
DELETE https://{host}/{org_name}/{app_name}/chatrooms/super_admin/{superAdmin}
```

### HTTP request

#### Path parameter

| Parameter | Type | Description | Required |
| :----------- | :----- | :----------------------------------- | :------- |
| `superAdmin` | String | The username of the super admin whose  privilege is to be revoked. | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Accept` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds and the response body contains the following fields:

| Field | Type | Description |
| :-------------- | :----- | :------------------------------- |
| `newSuperAdmin` | String | The username of the super admin whose privilege is revoked. |
| `resource` | String | It is a reserved parameter. You can safely ignore this parameter. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
curl -X DELETE -H 'Accept: application/json' -H 'Authorization: Bearer ' 'http://XXXX/XXXX/XXXX/chatrooms/super_admin/XXXX'
```

#### Response example

```json
{
    "action": "delete",
    "application": "9fa492a0-XXXX-XXXX-b1b9-a76b05da6904",
    "uri": "http://XXXX/XXXX/XXXX/chatrooms/super_admin/XXXX",
    "entities": [],
    "data": {
        "newSuperAdmin": "XXXX",
        "resource": ""
    },
    "timestamp": 1596187855832,
    "duration": 0,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```
## Retrieving super admins of specified s with pagination

Retrieves the super admins of the specified s by pagination.

For each App Key, the call frequency limit of this method is 100 per second.

### HTTP request

```html
GET https://{host} /{org_name}/{app_name}/chatrooms/super_admin?pagenum={N}&pagesize={N}
```

#### Path parameter

For parameters and detailed descriptions, see [Common parameters](#param).

#### Query parameter

| Parameter | Type | Description | Required |
| :--------- | :--- | :-------------------------------------- | :------- |
| `pagenum` | Number | The number of page on which  admins are retrieved. The default value is 1. | No |
| `pagesize` | Number | The number of super admins displayed on each page. The default value is 10. | No |

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Accept` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds, and the response body contains the following fields:

| Parameter | Type | Descriptions |
| :--------- | :--------- | :------------------------------- |
| `data` | JSONArray | The array of usernames of super admins of the specified s. |
| `count` | Number | The number of super admins that are returned. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
curl -X GET http://XXXX/XXXX/XXXX/chatrooms/super_admin?pagenum=2&pagesize=2 -H 'Authorization: Bearer '
```

#### Response example

```json
{
    "action": "get",
    "application": "2a8f5b13-XXXX-XXXX-958a-838fd47f1223",
    "applicationName": "XXXX",
    "count": 3,
    "data": [
        "yifan4",
        "yifan3",
        "yifan2"
    ],
    "duration": 0,
    "entities": [],
    "organization": "XXXX",
    "properties": {},
    "timestamp": 1681698118068,
    "uri": "http://a1-hsb.easemob.com/easemob-demo/chatdemoui/chatrooms/super_admin"
}
```
	

## Status codes

For details, see [HTTP Status Codes](../../reference/http-status-codes).
