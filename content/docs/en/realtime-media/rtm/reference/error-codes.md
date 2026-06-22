---
title: "Error codes"
description: "Error codes returned by the Signaling RESTful APIs, with causes and suggested actions."
---

This page lists the error codes returned by the Signaling RESTful APIs. Use these codes to help debug issues when developing applications with the Agora Signaling RESTful APIs.

For SDK error codes across each platform, see [Troubleshooting](./troubleshooting).

## RESTful API error codes

When you call the Signaling RESTful API, each response includes the following fields:

- `errorCode`: The numeric status code returned by the server.
- `reason`: A description of the error associated with the code.

This section describes the meaning of each error code, provides possible causes, and offers suggested solutions.

| Error code | Reason | Details | Suggested action |
| ---------- | ------ | ------- | ---------------- |
| `200` | Success | The request was successful, and messages from history were returned. | No action required. |
| `400` | Invalid request | The request contains invalid parameters. | Verify and correct the parameters. |
| `401` | User authentication error | The request contains invalid authentication parameters. | Verify and use valid parameters. |
| `403` | Unauthorized or feature not enabled | The App ID is invalid or does not have access to the required features. | - Verify that the App ID is correct.<br/>- Confirm that the Signaling service is enabled.<br/>- Confirm that the history feature is enabled for the App ID. |
| `408` | No response from the server | The request timed out. | Try again later. |
| `415` | Unsupported media type | The request body format is not supported. Only JSON is accepted. | Ensure the request body is formatted as JSON. |
| `429` | Rate limit exceeded | The number of requests exceeds the allowed limit. | The quota for the RESTful API is 60 requests per second. Reduce the request rate. |
| `435` | Invalid payload | The message payload contains illegal or unsupported content. | Modify the payload and resend the request. |
| `500` | Internal server error | An unexpected error occurred on the server. | Retry the request. |
| `503` | Timeout | The request took too long to process. | Retry the request. |
