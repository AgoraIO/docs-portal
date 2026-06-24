---
title: Status codes and error messages
description: HTTP status codes and error reasons for Conversational AI REST API requests.
---

Use HTTP status codes together with the `reason` and `detail` fields in error responses to troubleshoot failed Conversational AI REST API requests.

## HTTP status codes

| Status code | Description | Suggested action |
| --- | --- | --- |
| `200` | OK | The request was successful. |
| `400` | Invalid request parameters | Check the `detail` field for specific information. |
| `401` | Authentication failed | Check the `Authorization` header, credentials, or token and retry. |
| `403` | Unauthorized access | Resolve account or billing issues, or contact technical support to activate the service. |
| `404` | Agent not found or has exited | Check whether the agent started successfully or has already stopped. |
| `409` | Agent conflict | Use the task information returned by the server to continue, or retry with a different agent name. |
| `422` | Access limit exceeded | Contact technical support to raise your quota. |
| `429` | Request rate limit exceeded | Retry using a backoff strategy. |
| `500` | Internal server error | If the problem persists, contact technical support. |
| `502` | Gateway error | Contact technical support. |
| `503` | Agent startup failure | Retry using a backoff strategy. |
| `504` | Request timeout | Retry using a backoff strategy. |

## Error reasons

| Reason | Description |
| --- | --- |
| `ServiceNotEnabled` | The service is not enabled for the current project. |
| `AccountSuspended` | The account has been suspended and the service is unavailable. |
| `InternalError` | Internal error on the server. |
| `InvalidPermission` | The service is not activated. |
| `InvalidRequestBody` | The request body is not valid JSON. |
| `MissingRequiredField` | A required field is missing from the request. |
| `InvalidFieldValue` | A request field contains an invalid value. |
| `ResourceQuotaLimitExceeded` | Too many concurrent requests, exceeding the quota limit. |
| `ConcurrencyLimitExceeded` | Too many concurrent requests, exceeding the quota limit. |
| `ServiceUnavailable` | The service is temporarily unavailable. |
| `ResourceAllocationFailed` | The required resources cannot be allocated at this time. |
| `TaskConflict` | An agent with the same name already exists, or a conflicting task is already running. |
| `TaskNotFound` | The task was not started successfully, was aborted after starting, or has been destroyed. |
| `TaskOperationTimeout` | Internal error on the server. |
| `NotImplemented` | Internal error on the server. |
