---
title: "Generate tokens using REST API"
description: "Use the Whiteboard REST API to generate SDK tokens, room tokens, and task tokens."
---

Interactive Whiteboard uses different types of tokens for user authentication. For details, see [Interactive Whiteboard Token overview](authentication-workflow.md).

This article introduces how to call the Interactive Whiteboard RESTful API to generate tokens.

## Generate an SDK Token (POST)

Call this API to generate an SDK Token.

### Prototype

- Method: `POST`
- Access point: `https://api.netless.link/v5/tokens/teams`

### Request header

Pass in the following parameters in the request header:

| Parameter | Data type | Required/Optional | Description                                                  |
| :-------- | :-------- | :---------------- | :----------------------------------------------------------- |
| `region`  | string    | Required          | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `sg`: Singapore, which provides services to Singapore, East Asia, and Southeast Asia.<br />- `in-mum`: Mumbai, India, which provides services to India.<br />- `eu`: Frankfurt, Europe, which provides services to Europe.<br />- `cn-hz`: Hangzhou, China, which provides services to the areas not covered by other data centers.<br /> |

### Request body

| Parameter         | Data type | Required/Optional | Description                                                                                                                                                                                                      |
| :---------------- | :-------- | :---------------- |:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `accessKey`       | string    | Required          | The Access Key (AK), which can be obtained in Agora Console. See [Get security credentials for your whiteboard project](enable-whiteboard.md#get-security-credentials-for-your-whiteboard-project). |
| `secretAccessKey` | string    | Required          | The Secret Key (SK), which can be obtained in Agora Console. See [Get security credentials for your whiteboard project](enable-whiteboard.md#get-security-credentials-for-your-whiteboard-project). |
| `lifespan`        | integer   | Required          | The token validity period (milliseconds). If you set it to `0`, the token is permanently valid.                                                                                                                  |
| `role`            | string    | Required          | The token role:- `admin`<br />- `writer`<br />- `reader`<br />See [Token Overview](authentication-workflow.md).                                                                                       |

### Request example

```
POST /v5/tokens/teams
Host: api.netless.link
region: us-sv
Content-Type: application/json

{
    "accessKey": "BUxxxxxxrc",
    "secretAccessKey": "CxxxxxxxauY3",
    "lifespan": 3600000,
    "role": "admin"
}
```

### HTTP response

For details about all possible response status codes, see the [status code table](../../reference/rest-api/overview.md#status-codes).

If the status code is `201`, the request is successful. The response returns the generated `sdk token`.

The following is a response example for a successful request:

```
"status": 201,
"body":
{ "NETLESSSDK_YWs9xxxxxxY2E2OQ"
}
```

If the status code is not `201`, the request fails. The response body includes a `message` field that describes the reason for the failure.

## Generate a Room Token (POST)

Call this API to generate a Room Token.

### Prototype

- Method: `POST`
- Access point: `https://api.netless.link/v5/tokens/rooms/{uuid}`

### Request header

Pass in the following parameters in the request header:

| Parameter | Data type | Required/Optional | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| :-------- | :-------- | :---------------- |:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `token`   | string    | Required          | The SDK Token, which can be obtained through one of the following methods:- Get a test-purpose SDK token from Agora Console. See [Get security credentials for your whiteboard project](../set-up-and-build-your-first-app/enable-whiteboard.md#get-security-credentials-for-your-whiteboard-project).<br />- Call the RESTful API. See [Generate an SDK token](#generate-an-sdk-token-post).<br />- Write code on your app server. See [Generate a token from your app server](generate-token-app-server.mdx).<br /> |
| `region`  | string    | Required         | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `sg`: Singapore, which provides services to Singapore, East Asia, and Southeast Asia.<br />- `in-mum`: Mumbai, India, which provides services to India.<br />- `eu`: Frankfurt, Europe, which provides services to Europe.<br />- `cn-hz`: Hangzhou, China, which provides services to the areas not covered by other data centers.<br />   |

### Request path

The following parameters are required in the URL:

| Parameter | Data type | Required/Optional | Description                                                  |
| :-------- | :-------- | :---------------- | :----------------------------------------------------------- |
| `uuid`    | string    | Required          | The Room UUID, which is the unique identifier of a room. You can get it by calling the [RESTful API to create a room](../../reference/rest-api/room-management.md#create-a-room-post) or the [RESTful API to get room information](../../reference/rest-api/room-management.md#get-room-information-get). |

### Request body

| Parameter  | Data type | Required/Optional | Description                                                                                                                                                                                                 |
| :--------- | :-------- | :---------------- |:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `lifespan` | integer   | Required          | The token validity period (milliseconds). If you set it to `0`, the token is permanently valid.                                                                                                             |
| `role`     | string    | Required          | The token role:- `admin`<br />- `writer`<br />- `reader`<br />See [Token Overview](authentication-workflow.md).                                                                                  |

### Request example

```
POST /v5/tokens/rooms/a7exxxxxca69
Host: api.netless.link
token: NETLESSSDK_YWs9Qxxxxxx2MjRi
region: us-sv
Content-Type: application/json

{
    "lifespan": 3600000,
    "role": "admin"
}
```

### HTTP response

For details about all possible response status codes, see the [status code table](../../reference/rest-api/overview.md#status-codes).

If the status code is `201`, the request is successful. The response returns the generated `room token`.

**The following is a response example for a successful request:**

```
"status": 201,
"body":
{ "NETLESSROOM_YWs9xxxxxxY2E2OQ"
}
```

If the status code is not `201`, the request fails. The response body includes a `message` field that describes the reason for the failure.

## Generate a Task Token (POST)

Call this API to generate a Task Token.

### Prototype

- Method: `POST`
- Access point: `https://api.netless.link/v5/tokens/tasks/{uuid}`

### Request header

Pass in the following parameters in the request header:

| Parameter | Data type | Required/Optional | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| :-------- | :-------- | :---------------- |:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `token`   | string    | Required          | The SDK Token, which can be obtained through one of the following methods:- Get a test-purpose SDK Token from Agora Console. See [Get security credentials for your whiteboard project](../set-up-and-build-your-first-app/enable-whiteboard.md#get-security-credentials-for-your-whiteboard-project).<br />- Call the RESTful API. See [Generate an SDK token](#generate-an-sdk-token-post).<br />- Write code on your app server. See [Generate a token from your app server](generate-token-app-server.mdx).<br /> |
| `region`  | string    | Required         | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `sg`: Singapore, which provides services to Singapore, East Asia, and Southeast Asia.<br />- `in-mum`: Mumbai, India, which provides services to India.<br />- `eu`: Frankfurt, Europe, which provides services to Europe.<br />- `cn-hz`: Hangzhou, China, which provides services to the areas not covered by other data centers.<br />   |

### Request path

The following parameters are required in the URL:

| Parameter | Data type | Required/Optional | Description                                                  |
| :-------- | :-------- | :---------------- | :----------------------------------------------------------- |
| `uuid`    | string    | Required          | The task UUID, which is the unique identifier of a file-conversion task. You can get it by calling the [RESTful API to start a file-conversion task](../../reference/rest-api/file-conversion.md#start-file-conversion) or the [RESTful API to query the task progress](../../reference/rest-api/file-conversion.md#query-the-progress-of-a-file-conversion-task). |

### Request body

| Parameter  | Data type | Required/Optional | Description                                                                                                                                                                                                      |
| :--------- | :-------- | :---------------- |:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ak`       | string    | Optional          | The Access Key (AK), which can be obtained in Agora Console. See [Get security credentials for your whiteboard project](enable-whiteboard.md#get-security-credentials-for-your-whiteboard-project). |
| `lifespan` | integer   | Required          | The token validity period (milliseconds). If you set it to `0`, the token is permanently valid.                                                                                                                  |
| `role`     | string    | Required          | The token role:- `admin`<br />- `writer`<br />- `reader`<br />See [Token Overview](authentication-workflow.md).                                                                                       |

### Request example

```
POST /v5/tokens/tasks/a7e0xxxxxxxca69
Host: api.netless.link
token: NETLESSSDK_YWs9QlxxxxxxM2MjRi
region: us-sv
Content-Type: application/json

{
    "lifespan": 600,
    "role": "admin"
}
```

### HTTP response

For details about all possible response status codes, see the [status code table.](../../reference/rest-api/overview.md#status-codes)

If the status code is `201`, the request is successful. The response returns the generated `task token`.

**The following is a response example for a successful request:**

```
"status": 201,
"body":
{ "NETLESSTASK_YWxxxxxxM2ViMQ"
}
```

If the status code is not `201`, the request fails. The response body includes a `message` field that describes the reason for the failure.
