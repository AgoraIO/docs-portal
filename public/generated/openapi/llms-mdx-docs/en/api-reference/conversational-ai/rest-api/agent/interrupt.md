# Interrupt the agent (/en/api-reference/conversational-ai/rest-api/agent/interrupt)

Interrupt the specified agent from speaking or thinking.

- OpenAPI: /openapi/conversational-ai/convoai.en.yaml
- Operation ID: agent-interrupt
- Method: POST
- Path: /v2/projects/{appid}/agents/{agentId}/interrupt

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

No parameters.

## Request body

No schema.

## Responses

### default

- If the returned status code is `200`, the request is successful. The response packet body is agent information, and the agent starts broadcasting the specified content.
- If the returned status code is not `200`, it means the request failed. The response package body contains the error category and description. You can refer to [Response Status Code](https://doc.shengwang.cn/doc/convoai/restful/api/response-code) to learn about possible causes.

- `agent_id` (string) - Conversational agent ID, which is the unique identifier of the agent.
No schema.
- `channel` (string) - The name of the RTC channel where the agent is located.
No schema.
- `start_ts` (integer) - Agent creation timestamp.
No schema.
