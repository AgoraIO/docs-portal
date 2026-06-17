# 发送自定义指令 (/zh-CN/api-reference/conversational-ai/rest-api/agent/think)

向指定智能体发送一段自定义文本指令。

该接口会将传入文本作为用户输入注入当前对话链路，并由对话式 AI 引擎继续按照普通用户输入的处理逻辑进行推理和响应。你可以使用该接口实现隐式指令注入、客户端事件触发和语音与文本协同等场景。


- OpenAPI: /openapi/conversational-ai/convoai.zh-CN.yaml
- Operation ID: agent-think
- Method: POST
- Path: /v2/projects/{appid}/agents/{agentId}/think

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

No parameters.

## Request body

- `text` (string, required) - 自定义指令文本内容。系统会将其作为用户输入注入当前对话链路。
No schema.
- `on_listening_action` (string) - 智能体处于倾听状态时的处理动作，支持以下值：
- `"inject"`：（默认）自定义文本指令注入当前轮次，不打断当前轮次。
- `"ignore"`：忽略本次请求。

No schema.
- `on_thinking_action` (string) - 智能体处于思考状态时的处理动作，支持以下值：
- `"interrupt"`：（默认）打断当前状态，并发起新一轮对话。
- `"ignore"`：忽略本次请求。

No schema.
- `on_speaking_action` (string) - 智能体处于说话状态时的处理动作，支持以下值：
- `"interrupt"`：打断当前状态，并发起新一轮对话。
- `"ignore"`：（默认）忽略本次请求。

No schema.
- `interruptable` (boolean) - 是否允许用户说话打断自定义指令：
- `true`：（默认）允许。
- `false`：不允许。

No schema.
- `metadata` (object) - 自定义元数据。你可以通过该字段传入业务标识等附加信息。
No schema.

## Responses

### 200

- 若返回的状态码为 `200` 则表示请求成功。响应包体为智能体信息。
- 若返回的状态码不为 `200` 则表示请求失败。响应包体中包含错误的类别和描述，你可以参考[响应状态码](https://doc.shengwang.cn/doc/convoai/restful/api/response-code)了解可能的原因。

- `agent_id` (string) - 对话式智能体 ID，即智能体唯一标识。
No schema.
- `channel` (string) - 智能体所在 RTC 频道名。
No schema.
- `start_ts` (integer) - 智能体创建时间戳。
No schema.
