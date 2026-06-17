# 更新智能体配置 (/zh-CN/api-reference/conversational-ai/rest-api/agent/update)

更新指定运行中智能体的部分参数配置。

- OpenAPI: /openapi/conversational-ai/convoai.zh-CN.yaml
- Operation ID: agent-update
- Method: POST
- Path: /v2/projects/{appid}/agents/{agentId}/update

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

- `Authorization` (header, required) - 发送 HTTP 请求时，你需要从以下鉴权方式中任选其一：<ol><li>**（推荐）使用 RTC Token**：将用于声网对话式 AI 引擎项目使用的 RTC Token 填入 `Authorization` 字段。你可以选择以下方式获取 Token：<ul><li>测试环境下，你可以从[声网控制台](https://console.shengwang.cn/)为你的项目生成临时 Token（有效期为 24 小时）。</li><li>生产环境下，你可以参考[使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)部署 Token 服务器以生成 Token。</li></ul>传参示例：`Authorization: agora token="007abcxxxxxxx123"`</li><li>**使用 Basic Auth**：参考[实现 HTTP 安全认证](https://doc.shengwang.cn/doc/convoai/restful/user-guides/http-basic-auth#使用-http-基本认证)生成 Base64 编码的 `Authorization` 字段。<br/>传参示例：`Authorization: Basic NDI1OTQ3N2I4MzYy...YwZjA=`</li></ol>
- `appid` (path, required) - 你的项目使用的 [App ID](http://doc.shengwang.cn/doc/convoai/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id)。
- `agentId` (path, required) - 智能体实例 ID，即智能体的唯一标识。调用 [POST 创建对话式智能体](https://doc.shengwang.cn/doc/convoai/restful/convoai/operations/start-agent) 成功后在响应包体中获取。

## Request body

- `properties` (object)
  - `properties.token` (string) - 用于鉴权的动态密钥。如果你的项目已启用 App 证书，则务必在该字段中传入你项目的动态密钥。详见[使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)。
No schema.
  - `properties.llm` (object) - 大语言模型 (LLM) 设置。
    - `properties.llm.system_messages` (array) - 一组每次调用 LLM 时被附加在最前的预定义信息，用于控制 LLM 输出。可以是角色设定、提示词和回答样例等。要求与 OpenAI 协议兼容。
      - `properties.llm.system_messages.items` (object)
No schema.
    - `properties.llm.params` (object) - 在消息体内传输的 LLM 附加信息，例如使用的模型、最大 Token 数限制等。不同的 LLM 供应商支持的配置不同，请参考对应文档按需填入。
> 该字段更新后将覆盖智能体创建时的配置。更新时，请确保传入完整的 `params` 字段。
No schema.

## Responses

### 200

- 若返回的状态码为 `200` 则表示请求成功。响应包体中包含本次请求的结果。
- 若返回的状态码不为 `200` 则表示请求失败。响应包体中包含错误的类别和描述，你可以参考[响应状态码](https://doc.shengwang.cn/doc/convoai/restful/api/response-code)了解可能的原因。

- `agent_id` (string) - 智能体唯一标识符。
No schema.
- `create_ts` (integer) - 智能体创建时间戳。
No schema.
- `state` (string) - 智能体运行状态：
- `IDLE` (0)：空闲状态的智能体。
- `STARTING` (1)：正在启动的智能体。
- `RUNNING` (2)：正在运行的智能体。
- `STOPPING` (3)：正在停止的智能体。
- `STOPPED` (4)：已完成退出的智能体。
- `RECOVERING` (5)：正在恢复的智能体。
- `FAILED` (6)：执行失败的智能体。
No schema.
