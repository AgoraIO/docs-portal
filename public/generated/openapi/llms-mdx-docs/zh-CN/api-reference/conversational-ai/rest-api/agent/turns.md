# 查询对话轮次信息 (/zh-CN/api-reference/conversational-ai/rest-api/agent/turns)

在与智能体会话结束后，调用该接口查询本次会话的对话轮次信息，包含每个对话轮次的开始信息、结束信息、性能指标。
> 仅支持查询 7 天内的会话。


- OpenAPI: /openapi/conversational-ai/convoai.zh-CN.yaml
- Operation ID: get-turns
- Method: GET
- Path: /v2/projects/{appid}/agents/{agentId}/turns

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

- 若返回的状态码为 `200` 则表示请求成功。响应包体中包含本次请求的结果。
- 若返回的状态码不为 `200` 则表示请求失败。响应包体中包含错误的类别和描述，你可以参考[响应状态码](https://doc.shengwang.cn/doc/convoai/restful/api/response-code)了解可能的原因。

- `turns` (array) - 对话轮次列表。
  - `turns.items` (object)
    - `turns.items.agent_id` (string) - 智能体唯一标识。
No schema.
    - `turns.items.channel` (string) - 对话频道名称。
No schema.
    - `turns.items.turn_id` (integer) - 对话轮次 ID，从 1 开始递增。
No schema.
    - `turns.items.start` (object) - 轮次开始信息。
      - `turns.items.start.start_at` (integer) - 开始时间戳，毫秒级 UTC 时间。
No schema.
      - `turns.items.start.type` (string) - 开始类型：
- `voice_input`：因用户语音输入而开始。
- `greeting`：因智能体播报问候语而开始。
- `silence_timeout`：因智能体静音超时而开始。
- `api_speak`：因调用[播报自定义信息](/doc/convoai/restful/convoai/operations/agent-speak)接口播报信息而开始。

No schema.
      - `turns.items.start.metadata` (object) - 播报自定义信息附加元数据。
        - `turns.items.start.metadata.speech_duration_ms` (integer) - 语音持续时长(ms)。
No schema.
        - `turns.items.start.metadata.interrupt_duration_ms` (integer) - 智能体空闲或倾听时的人声持续阈值 (ms)。
No schema.
        - `turns.items.start.metadata.greeting_nth` (integer) - 问候语播放次数。
No schema.
        - `turns.items.start.metadata.action` (string) - - `speak`：播报静默提示内容。
- `think`：将静默提示内容追加在上下文的最后，并传递给 LLM。

No schema.
        - `turns.items.start.metadata.transport` (string) - 传输协议：
- `http`：HTTP 协议。
- `rtm`：通过 RTM Presence 通道传输。

No schema.
    - `turns.items.end` (object) - 轮次结束信息。
      - `turns.items.end.end_at` (integer) - 结束时间戳，毫秒级 UTC 时间。
No schema.
      - `turns.items.end.type` (string) - 轮次结束类型：
- `ok`：正常结束。
- `interrupted`：被中断。
- `ignored`：被忽略。
- `error`：执行错误。

No schema.
      - `turns.items.end.metadata` (object) - 错误附加元数据。
        - `turns.items.end.metadata.playback_duration_ms` (integer) - 语音播放时长(ms)。
No schema.
        - `turns.items.end.metadata.caused_by` (string) - 轮次忽略原因：
- `semantic`：在[创建对话式智能体](/doc/convoai/restful/convoai/operations/start-agent)时开启优雅打断功能（`turn_detection.config.end_of_speech.mode` 为 `semantic`）后，因语义规则判断无需响应而被忽略。
- `keywords`：在[创建对话式智能体](/doc/convoai/restful/convoai/operations/start-agent)时开启基于关键词的对话开始检测功能（`turn_detection.config.start_of_speech.mode` 为 `keywords`）后，因未命中轮次开始检测关键词导致该轮对话被忽略。
- `disable`：因对话轮次检测功能设置为不可打断，导致该轮对话被忽略。

No schema.
        - `turns.items.end.metadata.transport` (string) - 传输协议（`caused_by` 为 `api_speak` 或 `api_interrupt` 时返回）：
- `http`：HTTP 协议。
- `rtm`：通过 RTM Presence 通道传输。

No schema.
        - `turns.items.end.metadata.reason` (string) - 错误类型，可能包含以下值：
- `LLM_REQUEST_ERR`：LLM 请求错误。
- `INTERNAL_ERR`：内部错误。

No schema.
        - `turns.items.end.metadata.details` (string) - 错误详情。
No schema.
    - `turns.items.metrics` (object) - 对话轮次性能指标详情。
      - `turns.items.metrics.e2e_latency_ms` (integer) - 端到端总延迟 (ms)。
No schema.
      - `turns.items.metrics.segmented_latency_ms` (array) - 分段延迟指标详情列表。
        - `turns.items.metrics.segmented_latency_ms.items` (object)
          - `turns.items.metrics.segmented_latency_ms.items.name` (string) - LLM 输入模态为 `audio` 时，返回的延迟模块：
  - `algorithm_processing`：算法处理延迟。
  - `asr_ttlw`：ASR 模块的 ttlw（Time To Last Word）指标，表示从检测到用户说话结束到 ASR 输出最后一个词的延迟时间。
  - `llm_ttfa`：LLM 模块的 ttfa（Time To First Audio to First Byte）指标，表示从用户说话结束到 LLM 输出第一个音频字节到 TTS 模块收到第一个音频字节的延迟时间。
  - `transport`：网络传输延迟 (ms)。目前，当用户使用 RTC Web SDK 时，不返回该字段。

No schema.
          - `turns.items.metrics.segmented_latency_ms.items.latency` (integer) - 延迟时间 (ms)。
No schema.
