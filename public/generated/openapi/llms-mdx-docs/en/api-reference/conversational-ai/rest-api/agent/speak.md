# Broadcast a message using TTS (/en/api-reference/conversational-ai/rest-api/agent/speak)

Let the specified agent broadcast a custom message.

During the conversation with the agent, calling this interface allows the agent to use the TTS module to immediately broadcast a custom message. After the agent receives the request, the broadcast behavior will interrupt the current speaking and thinking process.

- OpenAPI: /openapi/conversational-ai/convoai.en.yaml
- Operation ID: agent-speak
- Method: POST
- Path: /v2/projects/{appid}/agents/{agentId}/speak

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

No parameters.

## Request body

- `text` (string, required) - The text content to be broadcast must not exceed 512 bytes.
No schema.
- `priority` (string) - The priority of the reporting behavior can be set to the following values:
- `"INTERRUPT"`: (Default) High priority, interrupt and broadcast. The agent will terminate the current interaction and directly broadcast the message.
- `"APPEND"`: Medium priority, additional broadcast. The agent will announce the message after the current interaction ends.
- `"IGNORE"`: low priority, broadcast when idle. If the agent is interacting at this time, the agent will directly ignore and discard the message to be broadcast; the message will be broadcast only when the agent is not interacting.
No schema.
- `interruptable` (boolean) - Whether to allow the user to interrupt the agent's broadcast by speaking:
- `true`: (default) allowed.
- `false`: not allowed.
No schema.

## Responses

### 200

- If the returned status code is `200`, the request is successful. The response packet body is agent information, and the agent starts broadcasting the specified content.
- If the returned status code is not `200`, it means the request failed. The response package body contains the error category and description. You can refer to [Response Status Code](https://doc.shengwang.cn/doc/convoai/restful/api/response-code) to learn about possible causes.

- `agent_id` (string) - Conversational agent ID, which is the unique identifier of the agent.
No schema.
- `channel` (string) - The name of the RTC channel where the agent is located.
No schema.
- `start_ts` (integer) - Agent creation timestamp.
No schema.
