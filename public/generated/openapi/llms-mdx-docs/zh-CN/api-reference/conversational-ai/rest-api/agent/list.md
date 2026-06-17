# 获取智能体列表 (/zh-CN/api-reference/conversational-ai/rest-api/agent/list)

检索符合指定条件的智能体列表。
> 该接口仅支持查询最近 7 天内创建的智能体列表。


- OpenAPI: /openapi/conversational-ai/convoai.zh-CN.yaml
- Operation ID: get-agent-list
- Method: GET
- Path: /v2/projects/{appid}/agents

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

- `Authorization` (header, required) - 发送 HTTP 请求时，你需要从以下鉴权方式中任选其一：<ol><li>**（推荐）使用 RTC Token**：将用于声网对话式 AI 引擎项目使用的 RTC Token 填入 `Authorization` 字段。你可以选择以下方式获取 Token：<ul><li>测试环境下，你可以从[声网控制台](https://console.shengwang.cn/)为你的项目生成临时 Token（有效期为 24 小时）。</li><li>生产环境下，你可以参考[使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)部署 Token 服务器以生成 Token。</li></ul>传参示例：`Authorization: agora token="007abcxxxxxxx123"`</li><li>**使用 Basic Auth**：参考[实现 HTTP 安全认证](https://doc.shengwang.cn/doc/convoai/restful/user-guides/http-basic-auth#使用-http-基本认证)生成 Base64 编码的 `Authorization` 字段。<br/>传参示例：`Authorization: Basic NDI1OTQ3N2I4MzYy...YwZjA=`</li></ol>
- `appid` (path, required) - 你的项目使用的 [App ID](http://doc.shengwang.cn/doc/convoai/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id)。
- `channel` (query, optional) - 查询指定频道名下的智能体列表。
- `from_time` (query, optional) - 查询列表开始时间戳 (s)，默认为 1 天前。
- `to_time` (query, optional) - 查询列表结束时间戳 (s)，默认为当前时刻。
- `state` (query, optional) - 指定需要查询智能体的状态，单次查询不支持指定多种状态：<li>`IDLE` (0)：空闲状态的智能体。</li><li>`STARTING` (1)：正在启动的智能体。</li><li>`RUNNING` (2)：正在运行的智能体。</li><li>`STOPPING` (3)：正在停止的智能体。</li><li>`STOPPED` (4)：已完成退出的智能体。</li><li>`RECOVERING` (5)：正在恢复的智能体。</li><li>`FAILED` (6)：执行失败的智能体。</li>
- `limit` (query, optional) - 分页获取单次返回的最大条数。
- `cursor` (query, optional) - 分页游标，即分页起始位置的 `agent_id`。

## Request body

No request body.

## Responses

### 200

- 若返回的状态码为 `200` 则表示请求成功。响应包体中包含本次请求的结果。
- 若返回的状态码不为 `200` 则表示请求失败。响应包体中包含错误的类别和描述，你可以参考[响应状态码](https://doc.shengwang.cn/doc/convoai/restful/api/response-code)了解可能的原因。

- `data` (object)
  - `data.count` (integer) - 本次返回的智能体数量。
No schema.
  - `data.list` (array) - 满足条件的智能体列表。
    - `data.list.items` (object)
      - `data.list.items.start_ts` (integer) - 智能体创建时间戳。
No schema.
      - `data.list.items.status` (string) - 智能体运行状态：
- `IDLE` (0)：空闲状态的智能体。
- `STARTING` (1)：正在启动的智能体。
- `RUNNING` (2)：正在运行的智能体。
- `STOPPING` (3)：正在停止的智能体。
- `STOPPED` (4)：已完成退出的智能体。
- `RECOVERING` (5)：正在恢复的智能体。
- `FAILED` (6)：执行失败的智能体。
No schema.
      - `data.list.items.agent_id` (string) - 智能体唯一标识。
No schema.
- `meta` (object) - 返回列表的元信息。
  - `meta.cursor` (string) - 分页游标。
No schema.
  - `meta.total` (integer) - 满足本次查询条件的智能体总数量。
No schema.
- `status` (string) - 请求状态。
No schema.
