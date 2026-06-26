---
title: "Manage chat rooms"
description: "Shows how to manage chat rooms by calling Agora Chat RESTful APIs."
---

This page shows how to manage s by calling Chat RESTful APIs, including adding, deleting, modifying, and retrieving s.  

Before calling the following methods, ensure that you understand the frequency limit of calling Chat RESTful API calls described in [Limitations](../limitations#call-limit-of-server-sides).

## Common parameters 

The following table lists common request and response parameters of the Chat RESTful APIs:

### Request parameters 

| Parameter | Type | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Required |
| :--------- | :----- |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------- |
| `host` | String | The domain name assigned by the Chat service to access RESTful APIs. For how to get the domain name, see [Get the information of your project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                            | Yes |
| `org_name` | String | The unique identifier assigned to each company (organization) by the Chat service. For how to get the org name, see [Get the information of your project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                 | Yes |
| `app_name` | String | The unique identifier assigned to each app by the Chat service. For how to get the app name, see [Get the information of your project](/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project).                                                                                                                                                                                                                                                                    | Yes |
| `username` | String | <Slot name="username" /> | Yes |

<Slot for="username">

The unique login account of the user. The user ID must be 64 characters or less and cannot be empty. The following character sets are supported:

- 26 lowercase English letters (a-z)
- 10 numbers (0-9)
- "\_", "-", "."

:::info
Do not use any of the 26 uppercase English letters (A-Z). Ensure that each `username` under the same app is unique.
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
| `entities ` | JSON | The response entity. |
| `timestamp` | Number | The Unix timestamp (ms) of the HTTP response. |
| `duration` | Number | The duration (ms) from when the HTTP request is sent to the time the response is received. |

## Authorization

Chat RESTful APIs require Bearer HTTP authentication. Every time an HTTP request is sent, the following `Authorization` field must be filled in the request header:

```html
Authorization: Bearer ${YourAppToken}
```

In order to improve the security of the project, Agora uses a token (dynamic key) to authenticate users before they log in to the chat system. Chat RESTful APIs only support authenticating users using app tokens. For details, see [Authentication using App Token](/en/realtime-media/im/build/secure-access-and-authentication/authentication).

<a id="creating-a-chat-room"></a>
## Creating a 

Creates a .

### HTTP request

```html
POST https://{host}/{org_name}/{app_name}/chatrooms
```

#### Path parameter

For the parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Accept` | String | `application/json` | Yes |
| `Content-Type` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

#### Request body

The request body is a JSON object, which contains the following fields:

| Field | Type | Description | Required |
| :------------ | :--------- | :--------------------------------------- | :------- |
| `name` | String | The  name which can contain a maximum of 128 characters. | Yes |
| `description` | String | The  description which can contain a maximum of 512 characters. | Yes |
| `maxusers` | Int | The maximum number of members (including the  owner) that can join a . The value range is [1,10,000], with `1000` as the default. To increase the upper limit, contact [support@agora.io](mailto:support@agora.io).  | No |
| `owner` | String | The username of the  creator. | Yes |
| `members` | JSONArray | The array of user IDs of regular  members and administrators, excluding the  owner. If you specify this parameter, remember to pass in at least one user ID. The number of user IDs in the array cannot exceed the value of `maxusers`.| No |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds, and the response body contains the following fields:

| Field | Type | Description |
| :--- | :----- | :-------------------------------------------------------------- |
| `id` | String | The  ID. This is the unique identifier assigned to each  by the Chat service. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
# Replace  with the app token you generated on the server
curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer ' -d '{
   "name": "testchatroom1",
   "description": "test",
   "maxusers": 300,
   "owner": "user1",
   "members": [
     "user2"
   ]
 }' 'http://XXXX/XXXX/XXXX/chatrooms'
```

#### Response example

```json
{
    "data": {
        "id": "66213271109633"
    }
}
```

## Retrieving basic information of all s 

Retrieves the basic information of all s under the app by page.

### HTTP request

```html
GET https://{host}/{org_name}/{app_name}/chatrooms?limit={N}&cursor={cursor}
```

#### Path parameter

For the parameters and detailed descriptions, see [Common parameters ](#param).

#### Query parameters

| parameter| type   | describe             | Is it required?|
| :------- | :----- | :------------------------ | :------- |
| `limit`  | Number | The number of s expected to be fetched each time. The value range is [1,100], the default is `10`, This parameter is only required when fetching pages.  | No  |
| `cursor` | String |  The starting position for data query. This parameter is required only for paginated queries.  For the first query, you do not need to set `cursor` and the server returns s of the number specified with `limit` in the descending order of their creation time. You can get the cursor from the response body and pass it in the URL of the next query request. If there is no longer a `cursor` field in the response body, all s in the app are retrieved. | No  |
:::info
 If neither is set in the request `limit` and `cursor`, before the server returns the first page of the  list 10 .
:::

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Accept` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds. The response body contains the following fields:

| Field | Type | Description |
| :------------------- | :----- | :---------------------------------------------------- |
| `id` | String | The  ID. This is the unique identifier assigned to the  by the Chat. |
| `name` | String | The  name. |
| `owner` | String | The username of the  creator. |
| `affiliations_count` | Number | The number of members (including the  creator) in the . |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
# Replace  with the app token you generated on the server
curl --location --request GET 'http://XXXX/XXXX/XXXX/chatrooms?limit=10' \
--header 'Authorization: Bearer s that a user joins

Retrieves all the s that a user joins.

### HTTP request

```html
GET https://{host}/{org_name}/{app_name}/users/{username}/joined_chatrooms?pagenum={N}&pagesize={N}
```

#### Path parameter

For the parameters and detailed descriptions, see [Common parameters ](#param).

#### Query parameter

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `pagenum` | Number | The page number on which s are to be retrieved. | No |
| `pagesize` | Number | The number of s to be retrieved each time. The value range is [1,1000], with `1000` as the default.| No |

:::info
If neither query parameter is specified, the server returns the 500 s that the user joined most recently.
:::

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Accept` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds. The response body contains the following fields:

| Field | Type | Descriptions |
| :----- | :----- | :---------------------------------------------------------------- |
| `id` | String | The ID of the  that the user joins. This is the unique identifier assigned to each  by the Chat. |
| `name` | String | The name of the  that the user joins.  |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
# Replace  with the app token generated in your server.
curl -X GET -H 'Accept: application/json' -H 'Authorization: Bearer ' 'http://XXXX/XXXX/XXXX/users/XXXX/joined_chatrooms'
```

#### Response example

```json
{
    "data": {
        "id": "66211860774913",
        "name": "test"
    }
}
```

## Retrieving detailed information of the specified s

Retrieves the detailed information of one or more specified s.

### HTTP request

```json
GET https://{host}/{org_name}/{app_name}/chatrooms/{chatroom_id}
```

#### Path parameter

| Parameter | Type | Description | Required |
| :------------ | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| `chatroom_id` | String | The  ID. The unique identifier assigned to each  by the Chat service. You can get the  ID from the response body of [Retrieve basic information of all s](#getall).When retrieving multiple s, type multiple chatroom IDs (`chatroom_id`) separated with the comma (,). A maximum of 100 s can be retrieved at one go.In the URL, "," needs to be escaped as "%2C". | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Accept` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

### HTTP response

### Response body

If the returned HTTP status code is `200`, the request succeeds. The response body contains the following fields:

| Field | Type | Description |
| :------------------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `id` | String | The  ID. |
| `name` | String | The  name. |
| `description` | String | The  description. |
| `membersonly` | Bool | Whether a user requesting to join the  requires approval from the  administrator.`true`: Yes`false`: No |
| `allowinvites` | Bool | Whether to allow a  member to invite others to join the .`true`: A  member can invite others to join the .`false`: Only the  administrator can invite others to join the . |
| `maxusers` | Int | The maximum number of members that can join the . |
| `owner` | String | The username of the  creator. |
| `created` | Number | The Unix timestamp (ms) when the  is created. |
| `custom` | String | Custom information added during creation of the . |
| `affiliations_count` | Number  | The number of members (including the  creator) in the . |
| `affiliations` | JSONArray | The  member array, which contains the following fields:`owner`: The username of the  creator.`member`: The username of each  member. |
| `public` | Bool | It is a reserved parameter. You can safely ignore this parameter. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
# Replace  with the app token generated in your server.
curl -X GET -H 'Accept: application/json' -H 'Authorization: Bearer ' 'http://XXXX/XXXX/XXXX/chatrooms/XXXX%2CXXXX'
```

#### Response example

```json
{
    "action": "get",
    "application": "22bcffa0-XXXX-XXXX-9df8-516f6df68c6d",
    "applicationName": "XXXX",
    "count": 2
    "data": [
        {
            "id": "XXXX",
            "name": "testchatroom1",
            "description": "test",
            "membersonly": false,
            "allowinvites": false,
            "maxusers": 1000,
            "created": 1641365888209,
            "custom": "",
            "affiliations_count": 2,
            "affiliations": [
                {
                    "member": "user1"
                },
                {
                    "owner": "user2"
                }
            ],
            "public": true
        },
        {
            "id": "XXXX",
            "name": "testchatroom2",
            "description": "test",
            "membersonly": false,
            "allowinvites": false,
            "invite_need_confirm": true,
            "maxusers": 10000,
            "created": 1641289021898,
            "custom": "",
            "mute": false,
            "affiliations_count": 1,
            "affiliations": [
                {
                    "owner": "user3"
                }
            ],
            "public": true
        }
    ],
    "duration": 0,
    "entities": [],
    "organization": "XXXX",
    "timestamp": 1642064417048,
    "uri": "http://XXXX/XXXX/XXXX/chatrooms/XXXX%2CXXXX"
}
```

## Modifying  information

Modifies the information of the specified . You can only modify the `name`, `description`, and `maxusers` of a .

### HTTP request

```html
PUT https://{host}/{org_name}/{app_name}/chatrooms/{chatroom_id}
```

#### Path parameter

| Parameter | Type | Description | Required |
| :------------ | :----- | :------------------------------------------------------------------------------------------------------------ | :------- |
| `chatroom_id` | String | The  ID. The unique identifier assigned to each  by the Chat service. You can get the  ID from the response body of [Retrieve basic information of all s](#getall). | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter | Type | Description | Required |
| :-------------- | :----- | :--------------------- | :------- |
| `Content-Type` | String | `application/json` | Yes |
| `Accept` | String | `application/json` | Yes |
| `Authorization` | String | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. | Yes |

#### Request body

The request body is a JSON object which only contains the following fields:

| Field | Type | Description | Required |
| :------------ | :----- | :------------------------------------------------- | :------- |
| `name` | String | The  name. | No |
| `description` | String | The  description. | No |
| `maxusers` | Number | The maximum number of  members (including the  creator). | No |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds and the response body contains the following fields:

| Field | Type | Description |
| :------------ | :--- | :---------------------------------------------------------------------------------------------- |
| `groupname` | Bool | Whether the  name is successfully changed.`true`: Success`false`: Failure |
| `description` | Bool | Whether the  description is successfully modified.`true`: Success`false`: Failure |
| `maxusers` | Bool | Whether the maximum number of members that can join the  is successfully changed.`true`: Success`false`: Failure |

If the returned HTTP status code is not `200`, the request failed. You can refer to [Status codes](#code) for possible reasons.

> If other fields than `name`, `description`, and `maxusers` are passed in the request body, the request fails and the error code `400` is returned.

### Example

#### Request example

```json
curl -X PUT -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer ' -d '{
   "name": "testchatroom",
   "description": "test",
   "maxusers": 300,
 }' 'http://XXXX/XXXX/XXXX/chatrooms/XXXX'
```

#### Response example

```json
{
    "data": {
        "description": true,
        "maxusers": true,
        "groupname": true
    }
}
```

## Deleting the specified 

Deletes the specified .  If the specified  does not exist, an error returns.

### HTTP request

```html
DELETE https://{host}/{org_name}/{app_name}/chatrooms/{chatroom_id}
```

#### Path parameter

| Parameter | Type | Description | Required |
| :------------ | :----- | :----------------------------------------------------------------------------------------------------------- | :------- |
| `chatroom_id` | String | The  ID. The unique identifier assigned to each  by the Chat service. You can get the  ID from the response body of [Retrieve basic information of all s](#getall). | Yes |

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
| :-------- | :----- | :---------------------------------------------------------------- |
| `success` | Bool | Whether the  is successfully deleted.`true`: Success`false`: Failure |
| `id` | String | The ID of the  that is deleted. |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```json
# Replace  with the app token generated in your server.
curl -X DELETE -H 'Accept: application/json' -H 'Authorization: Bearer ' 'http://XXXX/XXXX/XXXX/chatrooms/XXXX'
```

#### Response example

```json
{
    "action": "delete",
    "application": "8be024f0-XXXX-XXXX-b697-5d598d5f8402",
    "uri": "http://XXXX/XXXX/XXXX/chatrooms/XXXX",
    "entities": [],
    "data": {
        "success": true,
        "id": "66211860774913"
    },
    "timestamp": 1542545100474,
    "duration": 0,
    "organization": "XXXX",
    "applicationName": "XXXX"
}
```
	

## Retrieving a  announcement

Retrieves the announcement text for the specified .

### HTTP request

```
GET https://{host}/{org_name}/{app_name}/chatrooms/{chatroom_id}/announcement
```

#### Path parameter

| Parameter         | Type   | Required | Description                                                       |
| :------------ | :----- | :------- | :--------------------------------------------------------- |
| `chatroom_id` | String | Yes | The  ID. The unique identifier assigned to each  by the Chat service. You can get the  ID from the response body of [Retrieve basic information of all s](#getall). |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter            | Type   | Required | Description                                                         |
| :-------------- | :----- | :------- | :----------------------------------------------------------- |
| `Content-Type`  | String | Yes     | Set to `application/json`.                                 |
| `Accept`        | String | Yes     | `application/json` |
| `Authorization` | String | Yes     | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. |

### HTTP response
The response body contains the following fields:

| Parameter      | Type    | Description                                                       |
| :-------- | :------ | :--------------------------------------------------------- |
| data.announcement | String | The announcement text of the specified . |

### Example

#### Request example

```
curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer  ' 'http://XXXX/XXXX/XXXX/chatrooms/XXXX/announcement'
```

#### Response example

```
{
  "action": "get",
  "application": "52XXXXf0",
  "uri": "http://XXXX/XXXX/XXXX/chatrooms/12XXXX11/announcement",
  "entities": [],
  "data": {
    "announcement" : " announcement text"
  },
  "timestamp": 1542363546590,
  "duration": 0,
  "organization": "XXXX",
  "applicationName": "testapp"
}
```

## Modifying the announce of a 

Modifies the announcement text of the specified . The length cannot exceed 512 characters.

### HTTP request

```
POST https://{host}/{org_name}/{app_name}/chatrooms/{chatroom_id}/announcement
```

#### Path parameter

| Parameter | Type | Description | Required |
| :------------ | :----- | :----------------------------------------------------------------------------------------------------------- | :------- |
| `chatroom_id` | String | The  ID. The unique identifier assigned to each  by the Chat service. You can get the  ID from the response body of [Retrieve basic information of all s](#getall). | Yes |

For other parameters and detailed descriptions, see [Common parameters](#param).

#### Request header

| Parameter            | Type   | Required | Description                                                         |
| :-------------- | :----- | :------- | :----------------------------------------------------------- |
| `Content-Type`  | String | Yes     | Set to `application/json`.                                 |
| `Authorization` | String | Yes     | The authentication token of the user or administrator, in the format of `Bearer ${token}`, where `Bearer` is a fixed character, followed by an English space, and then the obtained token value. |

#### Request body

| Parameter           | Type   | Required | Description                 |
| :------------- | :----- | :------- | :------------------- |
| `announcement` | String | Yes       | The modified announcement text. |

### HTTP response

#### Response body

If the returned HTTP status code is `200`, the request succeeds and the response body contains the following fields:

| Parameter      | Type    | Description                                                       |
| :-------- | :------ | :--------------------------------------------------------- |
| data.id | String | The  ID. |
| data.result | Boolean | Whether the  announcement is successfully modified:  - `true`: Success - `false`: Failure |

For other fields and detailed descriptions, see [Common parameters](#param).

If the returned HTTP status code is not `200`, the request fails. You can refer to [Status codes](#code) for possible reasons.

### Example

#### Request example

```
curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer  ' 'http://XXXX/XXXX/XXXX/chatrooms/12XXXX11/announcement' -d '{"announcement" : "chat room announcement"}'
```

#### Response example

```
{
  "action": "post",
  "application": "52XXXXf0",
  "uri": "http://XXXX/XXXX/XXXX/chatrooms/12XXXX11/announcement",
  "entities": [],
  "data": {
    "id": "12XXXX11",
    "result": true
  },
  "timestamp": 1594808604236,
  "duration": 0,
  "organization": "XXXX",
  "applicationName": "testapp"
}
```

## Status codes

For details, see [HTTP Status Codes](../http-status-codes).
