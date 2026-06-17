# 停止对话式智能体 (/zh-CN/api-reference/conversational-ai/rest-api/agent/leave)

停止指定的对话式智能体实例，并让智能体退出 RTC 频道。

- OpenAPI: /openapi/conversational-ai/convoai.zh-CN.yaml
- Operation ID: stop-agent
- Method: POST
- Path: /v2/projects/{appid}/agents/{agentId}/leave

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

- `Authorization` (header, required) - 发送 HTTP 请求时，你需要从以下鉴权方式中任选其一：<ol><li>**（推荐）使用 RTC Token**：将用于声网对话式 AI 引擎项目使用的 RTC Token 填入 `Authorization` 字段。你可以选择以下方式获取 Token：<ul><li>测试环境下，你可以从[声网控制台](https://console.shengwang.cn/)为你的项目生成临时 Token（有效期为 24 小时）。</li><li>生产环境下，你可以参考[使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)部署 Token 服务器以生成 Token。</li></ul>传参示例：`Authorization: agora token="007abcxxxxxxx123"`</li><li>**使用 Basic Auth**：参考[实现 HTTP 安全认证](https://doc.shengwang.cn/doc/convoai/restful/user-guides/http-basic-auth#使用-http-基本认证)生成 Base64 编码的 `Authorization` 字段。<br/>传参示例：`Authorization: Basic NDI1OTQ3N2I4MzYy...YwZjA=`</li></ol>
- `appid` (path, required) - 你的项目使用的 [App ID](http://doc.shengwang.cn/doc/convoai/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id)。
- `agentId` (path, required) - 智能体实例 ID，即智能体的唯一标识。调用 [POST 创建对话式智能体](https://doc.shengwang.cn/doc/convoai/restful/convoai/operations/start-agent) 成功后在响应包体中获取。

## Request body

No request body.

## Responses

### 200

- 若返回的状态码为 `200` 则表示请求成功。响应包体为空。
- 若返回的状态码不为 `200` 则表示请求失败。响应包体中包含错误的类别和描述，你可以参考[响应状态码](https://doc.shengwang.cn/doc/convoai/restful/api/response-code)了解可能的原因。

No schema.
