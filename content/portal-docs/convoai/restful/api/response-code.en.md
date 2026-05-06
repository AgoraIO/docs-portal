---
title: Response Status Codes
description: "When calling the Agora Conversational AI Engine RESTful API, you may receive the following HTTP status codes:"
---

# Response Status Codes

When calling the Agora Conversational AI Engine RESTful API, you may receive the following HTTP status codes:

- A status code of `200` indicates that the request was successful.

- Any status code other than `200` indicates that the request failed. The response body contains the `detail` or `reason` field that describes the specific cause of the failure.

For example, when a request fails, you may receive the following response:

```json
/// Status code 400: invalid request parameters
{
    "detail": "create agent failed, code: 400, msg: properties: channel not found",
    "reason": "InvalidRequest"
}
```

The following table lists all possible HTTP status codes returned when a request fails, along with their descriptions and recommended actions:

| Response Status Code | Description | Recommended Action |
| :----- | :---------------------- | :----------------------------------------------------------- |
| 400    | Invalid request parameters | Check the message in the `detail` field. |
| 403    | Unauthorized access | [Contact technical support](https://ticket.shengwang.cn/) to enable the service. |
| 404    | Agent not found or already destroyed | Confirm whether the task started successfully or has already exited. |
| 409    | Agent conflict | Use the `agent_id` of the started agent for subsequent update, query, and delete operations. |
| 422    | Quota exceeded | [Contact technical support](https://ticket.shengwang.cn/) to increase the quota. |
| 502    | Gateway error | [Contact technical support](https://ticket.shengwang.cn/). |
| 503    | Agent startup error | Retry using a backoff strategy. |
| 504    | Timeout | Retry using a backoff strategy. |

The following table lists all possible `reason` values returned when a request fails, along with their descriptions. You can use them together with the status code and the `detail` field for troubleshooting:

| `reason`                 | Description |
| :------------------------- | :----------------------------------------------------------- |
| `InternalError`              | Internal server error. |
| `InvalidPermission`          | Service not enabled. |
| `InvalidRequest`             | Invalid request parameters. |
| `ResourceQuotaLimitExceeded` | Too many concurrent requests, exceeding the quota limit. |
| `ServiceUnavailable`         | Internal server error. |
| `TaskConflict`               | An agent with the same name already exists. |
| `TaskNotFound`               | The agent did not start successfully, exited after startup, or has already been destroyed. |
| `TaskOperationTimeout`       | Internal server error. |
| `NotImplemented`             | Internal server error. |
