# Send a custom instruction (/en/api-reference/conversational-ai/rest-api/agent/think)

Send a custom text command to the specified agent.

The interface will inject incoming text as user input into the current conversation link, and the conversational AI engine will continue to reason and respond according to the processing logic of ordinary user input. You can use this interface to implement scenarios such as implicit command injection, client-side event triggering, and voice and text collaboration.

- OpenAPI: /openapi/conversational-ai/convoai.en.yaml
- Operation ID: agent-think
- Method: POST
- Path: /v2/projects/{appid}/agents/{agentId}/think

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

No parameters.

## Request body

- `text` (string, required) - Customize the text content of the command. This will be injected into the current conversation link as user input.
No schema.
- `on_listening_action` (string) - The processing action when the agent is in the listening state, supports the following values:
- `"inject"`: (Default) Custom text command is injected into the current round without interrupting the current round.
- `"ignore"`: Ignore this request.
No schema.
- `on_thinking_action` (string) - The processing action when the agent is in the thinking state supports the following values:
- `"interrupt"`: (Default) Interrupt the current state and initiate a new round of dialogue.
- `"ignore"`: Ignore this request.
No schema.
- `on_speaking_action` (string) - The processing action when the agent is in the speaking state, supports the following values:
- `"interrupt"`: Interrupt the current state and initiate a new round of dialogue.
- `"ignore"`: (Default) Ignore this request.
No schema.
- `interruptable` (boolean) - Whether to allow users to interrupt custom instructions by speaking:
- `true`: (default) allowed.
- `false`: not allowed.
No schema.
- `metadata` (object) - Custom metadata. You can pass in additional information such as business ID through this field.
No schema.

## Responses

### 200

- If the returned status code is `200`, the request is successful. The response package body is agent information.
- If the returned status code is not `200`, it means the request failed. The response package body contains the error category and description. You can refer to [Response Status Code](https://doc.shengwang.cn/doc/convoai/restful/api/response-code) to learn about possible causes.

- `agent_id` (string) - Conversational agent ID, which is the unique identifier of the agent.
No schema.
- `channel` (string) - The name of the RTC channel where the agent is located.
No schema.
- `start_ts` (integer) - Agent creation timestamp.
No schema.
