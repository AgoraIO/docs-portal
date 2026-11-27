---
title: Response status codes
description: Troubleshoot Media Gateway RESTful API responses by status code.
---

After sending an HTTP request, the server returns a status code. Use the status code to determine whether the request succeeded and why a request might have failed.

- `200 OK` indicates success. `207 Multi-Status` indicates partial success across regions, so a `2XX` response does not always mean every region succeeded.
- For non-`2XX` responses, troubleshoot using the `message` field. For a timeout, query the affected resource to check the outcome before retrying.

Global streaming key revocation, global template operations, and global configuration operations can return `207` with `status: "partial success"`. Inspect each regional result in `data`, including `status`, `code`, and `message`. Keep track of unsuccessful regions and retry or investigate those regions; do not treat the overall HTTP status as confirmation that every region completed.

## Streaming key

| Status code | Message example | Reason | Solution |
| :---------- | :-------------- | :----- | :------- |
| `200 OK` | `/` | Request successful. | `/` |
| `400 Bad Request` | `Invalid settings.`<br />`Invalid 'channel' format.`<br />`Streaming key exists in region:na.` | Request parameter error. | Troubleshoot based on the specific content of the `message` field. |
| `401 Unauthorized` | `Invalid authentication credentials.` | RESTful API authentication failed. | Retry [HTTP Basic or HMAC authentication](authentication). |
| `403 Forbidden` | `Media Gateway is not enabled for this project. Contact us to enable.`<br />`Stream does not belong to this app ID.` | The Media Gateway service has not been activated, or the queried streaming key does not belong to the corresponding app ID. | Contact technical support to activate the service, or check whether the streaming key and app ID match. |
| `404 Not Found` | `Resource not found and destroyed.` | The requested resource does not exist. | Check whether the streaming key is correct. |
| `409 Conflict` | `Resource with the same name already exists.` | Too many concurrent requests. | Use a backoff strategy and try again. |
| `429 Too Many Requests` | `Request rate limit exceeded.`<br />`Resources quota limit exceeded.`<br />`No available resources.` | Request rate or resource quota exceeded. | Use a backoff strategy and try again. |
| `500 Internal Server Error` | `Internal error. Contact us to help fix it.` | Internal server error. | Use a backoff strategy and try again. |
| `503 Service Unavailable` | `Service overload. Retry with the back-off strategy and contact us to fix it.`<br />`Service unavailable temporarily. Retry with the back-off strategy.` | Internal server error. | Use a backoff strategy and try again. |
| `504 Gateway Timeout` | `Gateway timeout.` | The upstream request timed out. | Query the streaming key, template, or session affected by the operation to confirm its state before retrying. |

## Flow configuration template

| Status code | Message example | Reason | Solution |
| :---------- | :-------------- | :----- | :------- |
| `200 OK` | `/` | Request successful. | `/` |
| `400 Bad Request` | `Invalid settings.`<br />`Invalid template ID.`<br />`Missing field: "transcoding.video.enabled"` | Request parameter error. | Troubleshoot based on the `message` field in the response body. |
| `401 Unauthorized` | `Invalid authentication credentials.` | RESTful API authentication failed. | Retry [HTTP Basic or HMAC authentication](authentication). |
| `403 Forbidden` | `Media Gateway is not enabled for this project. Contact us to enable.`<br />`Too many templates have been created.` | The service has not been activated, or too many flow configuration templates have been created. | Contact technical support to activate Media Gateway, or delete unused templates. |
| `404 Not Found` | `Stream template not found.` | The requested resource does not exist. | Check whether `templateId` is correct. |
| `429 Too Many Requests` | `Request rate limit exceeded.`<br />`Resources quota limit exceeded.`<br />`No available resources.` | Too many concurrent requests. | Use a backoff strategy and try again. |
| `500 Internal Server Error` | `Internal error. Contact us to fix it.` | Internal server error. | Use a backoff strategy and try again. |
| `502 Bad Gateway` | `Internal errors. Contact us to troubleshoot.` | Internal server error. | Use a backoff strategy and try again. |
| `503 Service Unavailable` | `Service overload. Retry with the back-off strategy and contact us to fix it.`<br />`Service unavailable temporarily. Retry with the back-off strategy.` | Internal server error. | Use a backoff strategy and try again. |
| `504 Gateway Timeout` | `Gateway timeout.` | The upstream request timed out. | Query the streaming key, template, or session affected by the operation to confirm its state before retrying. |

## Information query

| Status code | Message example | Reason | Solution |
| :---------- | :-------------- | :----- | :------- |
| `200 OK` | `/` | Request successful. | `/` |
| `400 Bad Request` | `Invalid body.`<br />`Invalid app ID.`<br />`SID is missing.` | Request parameter error. | Troubleshoot based on the `message` field in the response body. |
| `401 Unauthorized` | `Invalid authentication credentials.` | RESTful API authentication failed. | Retry [HTTP Basic or HMAC authentication](authentication). |
| `403 Forbidden` | `Media Gateway is not enabled for this project. Contact us to enable.` | The service has not been activated. | Contact technical support to activate Media Gateway. |
| `404 Not Found` | `/` | The requested resource does not exist. | Check whether the SID is correct. |
| `429 Too Many Requests` | `Request rate limit exceeded.`<br />`Resources quota limit exceeded.`<br />`No available resources.` | Too many concurrent requests. | Use a backoff strategy and try again. |
| `500 Internal Server Error` | `Some internal error happened. Contact us to help fix it.` | Internal server error. | Use a backoff strategy and try again. |
| `502 Bad Gateway` | `Internal errors. Contact us for troubleshooting.` | Internal server error. | Use a backoff strategy and try again. |
| `503 Service Unavailable` | `Service overload. Retry with a back-off strategy, and contact us to help fix it.`<br />`Service unavailable temporarily. Retry with back off strategy.` | Internal server error. | Use a backoff strategy and try again. |
| `504 Gateway Timeout` | `Gateway timeout.` | The upstream request timed out. | Query the streaming key, template, or session affected by the operation to confirm its state before retrying. |

## Online stream control

For force-disconnect and mute/unmute operations, `422 Unprocessable Entity` means that the session has no valid gateway node routing information. Query the session to confirm its current state before retrying; if the problem persists, contact technical support.
