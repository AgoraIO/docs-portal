# 打断智能体 (/zh-CN/api-reference/conversational-ai/rest-api/agent/interrupt)

打断指定智能体说话或思考。

- OpenAPI: /openapi/conversational-ai/convoai.zh-CN.yaml
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

- 若返回的状态码为 `200` 则表示请求成功。响应包体为智能体信息，智能体开始播报指定内容。
- 若返回的状态码不为 `200` 则表示请求失败。响应包体中包含错误的类别和描述，你可以参考[响应状态码](https://doc.shengwang.cn/doc/convoai/restful/api/response-code)了解可能的原因。

- `agent_id` (string) - 对话式智能体 ID，即智能体唯一标识。
No schema.
- `channel` (string) - 智能体所在 RTC 频道名。
No schema.
- `start_ts` (integer) - 智能体创建时间戳。
No schema.
