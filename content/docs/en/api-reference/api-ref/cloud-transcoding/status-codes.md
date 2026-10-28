---
title: Status and error codes
description: Troubleshoot common Cloud Transcoding REST API issues.
---

This page lists the response status codes for the Cloud Transcoding REST API, along with their descriptions and recommended actions.

## Response status codes

When you call the Cloud Transcoding REST API, you receive an HTTP response status code:

- If the HTTP status code is `200`, the request is successful.
- If `Destroy` returns `206`, the server hasn't finished processing the request. Call `Query` to confirm the task status.
- Any other status code means the request failed.

The following examples show responses to failed requests:

```json
// 400 Bad Request: invalid parameter
{
  "message": "#/transcoder/outputs is invalid after minItems schema validate"
}
```

```json
// 401 Unauthorized: authentication failure
{
  "message": "Invalid authentication credentials"
}
```

```json
// 404 Not Found: task not found
{
  "message": "The task is not found"
}
```

When using Cloud Transcoding, you may receive status codes that indicate the service status. Refer to the following table to understand their meanings and take appropriate action.

| Status code | Description | Suggested action |
| --- | --- | --- |
| `200 OK` | The request was successful. | No troubleshooting is required. |
| `206 Partial Content` | The server hasn't finished processing the request. `Destroy` can return this code. | Call `Query` with a backoff strategy to confirm the task status. |
| `400 Bad Request` | The request syntax is incorrect, the parameter value does not meet the requirements, or your App ID does not have Cloud Transcoding enabled. | Investigate based on the `message` field in the response body. |
| `401 Unauthorized` | The `Authorization` field for HTTP Basic authentication is invalid. | See [RESTful authentication](authentication) or check your `Authorization` credentials. |
| `403 Forbidden` | Cloud Transcoding is not enabled for your App ID. | [Enable Cloud Transcoding](/en/realtime-media/transcoding/sdk-quickstart#enable-cloud-transcoding) in Agora Console. |
| `404 Not Found` | Transcoder not found. | Use a backoff strategy to make a query request and confirm whether the transcoder was created successfully. |
| `409 Conflict` | A transcoder task with the same `instanceId` already exists. | Delete the existing transcoder before creating a new one. |
| `429 Too Many Requests` | The request rate exceeds the upper limit. | Wait for a while and try again. |
| `500 Internal Server Error` | Internal Agora server error. | Use a backoff strategy for query requests or contact [technical support](mailto:support@agora.io). |
| `501 Not Implemented` | This method is not implemented. | No troubleshooting is required. |
| `503 Service Unavailable` | The Agora server is temporarily overloaded or undergoing maintenance. | Use a backoff strategy for query requests or contact [technical support](mailto:support@agora.io). |
| `504 Gateway Timeout` | An internal Agora server error occurred, an upstream server did not respond, or the upstream server is shut down. | Use a backoff strategy for query requests or contact [technical support](mailto:support@agora.io). |

When using the Cloud Transcoding response status code for troubleshooting, keep the following in mind:

- If the request fails, do not perform logical processing based on the `message` field in the response body. Rely primarily on the status code for troubleshooting.
- If the troubleshooting methods in the table do not resolve the issue, contact [technical support](mailto:support@agora.io) with the values of the `X-Request-ID` and `X-Resource-ID` fields in the response header.
- If you receive a `404` status code after a `Create` request has returned successfully and you have not called `Delete`, or if the transcoder remains idle beyond the `idleTimeout` value in the request, use a backoff algorithm. Retry at increasing intervals of 5, 10, and 15 seconds to call `Query` for confirmation.
- A `5XX` response status code usually indicates an issue in the server response process. Use a backoff strategy for query requests, retrying at increasing intervals of 5, 10, and 15 seconds, or contact [technical support](mailto:support@agora.io).
