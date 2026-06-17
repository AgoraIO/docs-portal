# Retrieve agent history (/en/api-reference/conversational-ai/rest-api/agent/history)

Capture the short-term memory of the conversation between the user and the agent.
You can call this API during the running of the agent (`RUNNING`) to obtain the short-term memory information stored until the creation of the agent, including:
- timestamps when the agent was created and stopped
- User and agent conversation messages

- OpenAPI: /openapi/conversational-ai/convoai.en.yaml
- Operation ID: get-history
- Method: GET
- Path: /v2/projects/{appid}/agents/{agentId}/history

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

No parameters.

## Request body

No request body.

## Responses

### default

- If the returned status code is `200`, the request is successful. The response body contains the results of this request.
- If the returned status code is not `200`, it means the request failed. The response package body contains the error category and description. You can refer to [Response Status Code](https://doc.shengwang.cn/doc/convoai/restful/api/response-code) to learn about possible causes.

- `agent_id` (string) - The unique identifier of the agent.
No schema.
- `start_ts` (integer) - Agent creation timestamp.
No schema.
- `status` (string) - The running status of the agent. Only the query status of `RUNNING` (2), that is, the running agent, is supported.
No schema.
- `contents` (array) - Agent short-term memory.
  - `contents.items` (object)
    - `contents.items.role` (string) - Message sender. Possible values are:
- `user`: user.
- `assistant`: agent.
No schema.
    - `contents.items.content` (string) - Message content.
No schema.
