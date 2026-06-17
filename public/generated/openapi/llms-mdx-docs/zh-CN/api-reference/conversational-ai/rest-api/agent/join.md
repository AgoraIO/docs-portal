# 创建对话式智能体 (/zh-CN/api-reference/conversational-ai/rest-api/agent/join)

创建一个对话式智能体 (Conversational AI agent) 实例，并加入 RTC 频道。

- OpenAPI: /openapi/conversational-ai/convoai.zh-CN.yaml
- Operation ID: start-agent
- Method: POST
- Path: /v2/projects/{appid}/join

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

- `Authorization` (header, required) - 发送 HTTP 请求时，你需要从以下鉴权方式中任选其一：<ol><li>**（推荐）使用 RTC Token**：将用于声网对话式 AI 引擎项目使用的 RTC Token 填入 `Authorization` 字段。你可以选择以下方式获取 Token：<ul><li>测试环境下，你可以从[声网控制台](https://console.shengwang.cn/)为你的项目生成临时 Token（有效期为 24 小时）。</li><li>生产环境下，你可以参考[使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)部署 Token 服务器以生成 Token。</li></ul>传参示例：`Authorization: agora token="007abcxxxxxxx123"`</li><li>**使用 Basic Auth**：参考[实现 HTTP 安全认证](https://doc.shengwang.cn/doc/convoai/restful/user-guides/http-basic-auth#使用-http-基本认证)生成 Base64 编码的 `Authorization` 字段。<br/>传参示例：`Authorization: Basic NDI1OTQ3N2I4MzYy...YwZjA=`</li></ol>
- `appid` (path, required) - 你的项目使用的 [App ID](http://doc.shengwang.cn/doc/convoai/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id)。

## Request body

- `name` (string, required) - 智能体唯一标识，相同标识不可重复创建。
No schema.
- `properties` (object, required) - 智能体详细配置。
  - `properties.channel` (string, required) - 智能体加入的 RTC 频道名。
No schema.
  - `properties.token` (string) - 加入 RTC 频道使用的 Token，即用于鉴权的动态密钥。如果你的项目已启用 App 证书，则务必在该字段中传入你项目的动态密钥。详见[使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)。
No schema.
  - `properties.agent_rtc_uid` (string, required) - 智能体在 RTC 频道内的用户 ID。
No schema.
  - `properties.remote_rtc_uids` (array, required) - 智能体在 RTC 频道中订阅的用户 ID 列表，只有订阅的用户才能与智能体互动。目前只支持订阅一个用户 ID。 
    - `properties.remote_rtc_uids.items` (string)
No schema.
  - `properties.enable_string_uid` (boolean) - 是否启用 String UID：
- `true`：智能体和订阅用户 ID 均使用 String UID。
- `false`：（默认）智能体和订阅用户 ID 均使用 Int UID。
> 同一频道内，Int 型和 String 型的用户 ID 不可混用。更多使用 String UID 的相关信息请参考[如何使用 String 型用户 ID](https://doc.shengwang.cn/faq/integration-issues/string-uid)。

No schema.
  - `properties.idle_timeout` (integer) - RTC 频道的最大空闲时间 (s)。检测到 `remote_rtc_uids` 中指定的用户全部离开频道后的时间视为频道空闲时间，超过设定的最大值时，频道的智能体将自动停止并退出频道。如果填写为 `0`，则直到手动退出，智能体才会停止。
No schema.
  - `properties.advanced_features` (object) - 高级功能配置。
    - `properties.advanced_features.enable_rtm` (boolean) - 是否启用实时消息 RTM 服务。启用后智能体会自动登录 RTM 并订阅 `channel` 中指定的频道，可结合 RTM 提供的能力实现一些进阶功能，例如[传递自定义信息](https://doc.shengwang.cn/doc/convoai/restful/user-guides/custom-data)。

> 启用 RTM 服务前需要确保 Token 同时具备 RTC 和 RTM 权限。智能体加入 RTM 频道会复用 `token` 字段配置的 Token。你可以参考 [FAQ](https://doc.shengwang.cn/faq/integration-issues/generate-token) 了解如何生成同时具备 RTC 和 RTM 权限的 Token。
No schema.
    - `properties.advanced_features.enable_sal` (boolean) - 是否启用选择性注意力锁定（Selective Attention Locking, SAL）功能。启用后，在 `sal` 字段中完成相关设置，智能体即可识别用户的声纹特征，有效区分不同说话者，屏蔽 95% 的环境人声、噪声。
> 该功能目前处于 Beta 阶段。
No schema.
    - `properties.advanced_features.enable_tools` (boolean) - 是否启用工具调用功能。启用后，智能体可以调用 MCP 服务器提供的工具，实现更复杂的业务逻辑。
No schema.
  - `properties.asr` (object) - 自动语音识别 (ASR) 配置。
    - `properties.asr.language` (string) - 用户与智能体互动时使用的语言：
- `zh-CN`：中文（支持中英文混合）
- `en-US`：英语
No schema.
    - `properties.asr.vendor` (string) - ASR 服务供应商，可选以下值：
- `fengming`：（默认）声网凤鸣 ASR。
- `tencent`：腾讯 ASR。
- `microsoft`：微软 ASR。
- `xfyun`：讯飞云传统语音转写识别服务。
- `xfyun_bigmodel`：讯飞云语音识别大模型服务。
- `xfyun_dialect`：讯飞云方言自由说识别服务。
No schema.
    - `properties.asr.params` (object) - 讯飞云方言自由说识别服务，具体协议详见[讯飞官方文档](https://www.xfyun.cn/doc/spark/asr_llm/rtasr_llm.html)。以下为示例：
```json
"params": {
    "app_id": "XFYUN_ASR_DIALOG_APP_ID",
    "access_key_id": "XFYUN_ASR_DIALOG_ACCESS_KEY_ID",
    "access_key_secret":"XFYUN_ASR_DIALOG_ACCESS_KEY_SECRET",
    "language": "zh-CN"
}
```
No schema.
  - `properties.tts` (object, required) - 文本转语音 (TTS) 模块配置。
    - `properties.tts.vendor` (string, required) - TTS 供应商，支持传入以下值：
- `minimax`：Minimax TTS
- `tencent`：腾讯 TTS
- `bytedance`：火山引擎 TTS
- `microsoft`：微软 Azure TTS
- `cosyvoice`：(Beta) 阿里云 CosyVoice TTS
- `bytedance_duplex`：火山引擎双向流式 TTS
- `stepfun`：(Beta) 阶跃星辰 TTS

No schema.
    - `properties.tts.skip_patterns` (array) - 过滤模式配置，用于控制是否跳过 LLM 返回文本中括号内的内容，避免智能体播报不必要的结构性提示信息如语气、动作描述等。默认值为 `[]`，即不过滤任何内容。可选值如下，传入即启用该功能：

- `1`：跳过中文圆括号（ ）中的内容
- `2`：跳过中文方括号【 】中的内容
- `3`：跳过英文圆括号 ( ) 中的内容
- `4`：跳过英文方括号 [ ] 中的内容
- `5`：跳过英文花括号 \{ } 中的内容

> - 当输入文本中存在嵌套括号，且多种括号类型都被配置为跳过时，智能体只处理最外层括号，即系统将从文本的起始位置开始匹配，一旦找到第一个符合跳过规则的最外层括号对，该括号对及其包含的所有内容（包括任何嵌套的其他类型括号）都将被整体跳过。
> - 无论是否打开[实时字幕](https://doc.shengwang.cn/doc/convoai/restful/user-guides/realtime-sub)，智能体短期记忆都会包含被过滤的内容，即 LLM 生成的完整文本。
> - 开启[实时字幕](https://doc.shengwang.cn/doc/convoai/restful/user-guides/realtime-sub)时，实时字幕在 TTS 播报时不会包含被过滤的内容，等这句话播报完毕后，字幕会把这些内容添加回来。
> - 火山引擎双向流式 TTS 暂不支持该功能。

      - `properties.tts.skip_patterns.items` (integer)
No schema.
    - `properties.tts.params` (object, required) - 阶跃星辰 TTS，具体协议详见[阶跃星辰官方文档](https://platform.stepfun.com/docs/api-reference/audio/ws_audio)。以下为示例：
 ```json
 "params": {
   "api_key": "your_stepfun_tts_key",
   "model": "step-tts-mini",
   "voice_id": "cixingnansheng"
 }
 ```
No schema.
  - `properties.llm` (object, required) - 大语言模型 (LLM) 配置。
    - `properties.llm.url` (string, required) - LLM 回调地址，要求与 OpenAI 协议兼容。
No schema.
    - `properties.llm.api_key` (string) - LLM 鉴权 API key。默认为空，生产环境中务必启用 API key。
No schema.
    - `properties.llm.system_messages` (array) - 一组每次调用 LLM 时被附加在最前的预定义信息，用于控制 LLM 输出。可以是角色设定、提示词和回答样例等。要求与 OpenAI 协议兼容。
      - `properties.llm.system_messages.items` (object)
No schema.
    - `properties.llm.max_history` (integer) - LLM 中缓存的短期记忆条目数。取值范围为 `[1,1024]`。短期记忆包括用户和智能体对话消息、工具调用信息和时间戳。智能体和用户会单独记录短期记忆条目。
No schema.
    - `properties.llm.input_modalities` (array) - LLM 的输入模态，支持：
- `["text"]`：（默认）仅文字。
- `["text", "image"]`：文字加图片，要求所选 LLM 支持视觉模态输入。
      - `properties.llm.input_modalities.items` (string)
No schema.
    - `properties.llm.output_modalities` (array) - LLM 的输出模态，支持：
- `["text"]`：（默认）仅文字。输出的文字会经过 TTS 模块转换成语音后发布至 RTC 频道。
- `["audio"]`：仅语音。语音会直接发布至 RTC 频道。
- `["text", "audio"]`：文字加语音。你可以自行编写逻辑，按需处理 LLM 的输出。
      - `properties.llm.output_modalities.items` (string)
No schema.
    - `properties.llm.greeting_message` (string) - 智能体问候语。如果填写，则在频道内没有订阅用户列表 (`remote_rtc_uids`) 中的用户时，智能体会自动向首位加入频道的订阅用户发送问候语。
No schema.
    - `properties.llm.greeting_configs` (object) - 智能体问候语播报配置。

      - `properties.llm.greeting_configs.mode` (string) - 智能体问候语播报模式，支持以下选项：
- `"single_every"`：（默认）每次有用户加入空频道时，智能体都播报一次问候语。
- `"single_first"`：仅首位用户加入空频道时，智能体播报一次问候语。

No schema.
      - `properties.llm.greeting_configs.delay_ms` (integer) - 智能体问候语播报延迟时间 (ms)，取值范围为 [0, 5000]。配置后，智能体问候语会在用户加入频道后等待指定时间再播报。
No schema.
    - `properties.llm.template_variables` (object) - 动态参数配置，用于在智能体的 `system_messages`、`greeting_message`、`failure_message` 和 `parameters.silence_config.content` 文本中插入变量。键值对形式，键为变量名，值为变量值。

**使用方式**:在 Prompt 文本中使用 `{{variable_name}}` 格式引用变量，系统会自动将其替换为 `template_variables` 中定义的对应值。
> 注意：变量名和变量值不支持引用其他变量。例如自定义变量 `"farewell": "期待下次再见，{{name}}"`，其中的 `{{name}}` 不会被解析。
No schema.
    - `properties.llm.failure_message` (string) - 智能体处理失败提示语。如果填写，则在 LLM 调用错误时会通过 TTS 模块返回。
No schema.
    - `properties.llm.vendor` (string) - LLM 供应商，支持以下两种设置：
- 商业大模型供应商，支持以下值：
  - `aliyun`：阿里云
  - `bytedance`：字节跳动
  - `deepseek`：深度求索
  - `tencent`：腾讯

  设置后，可提高兼容性，减少因携带 LLM 不支持的信息而导致请求失败的情况。
- 自定义 LLM，即设为 `"custom"`。设置后智能体调用 custom LLM 时，除了 `role` 和 `content` 外，将额外携带以下信息：
  - `turn_id`：唯一的对话轮次标识符。`turn_id` 从 0 开始递增，用户和智能体的一轮对话对应一个 `turn_id`。
  - `timestamp`：请求时间戳，精度为毫秒。
No schema.
    - `properties.llm.mcp_servers` (array) - MCP (Model Context Protocol) 服务器配置列表。通过配置 MCP 服务器，智能体可以调用外部服务提供的工具，实现更复杂的业务逻辑。
      - `properties.llm.mcp_servers.items` (object)
        - `properties.llm.mcp_servers.items.name` (string, required) - MCP 服务器的唯一标识。长度不超过 48 字符，支持以下字符：
- 所有小写英文字母：a 到 z
- 所有大写英文字母：A 到 Z
- 所有数字字符：0 到 9
- "." 和 "-"

No schema.
        - `properties.llm.mcp_servers.items.endpoint` (string, required) - MCP 服务器的端点地址，智能体将通过该地址与 MCP 服务器通信。
No schema.
        - `properties.llm.mcp_servers.items.transport` (string) - 传输协议类型，支持传入以下值：
- `"streamable_http"`：流式 HTTP 协议

No schema.
        - `properties.llm.mcp_servers.items.headers` (object) - 请求 MCP 服务器时携带的 HTTP 头部信息，例如认证信息。
No schema.
        - `properties.llm.mcp_servers.items.allowed_tools` (array) - 允许智能体调用的工具列表。只有在此列表中的工具才能被智能体使用。
> `allowed_tools` 字段生效规则:
> - 不填写 `allowed_tools` 字段：所有工具都生效
> - 填写 `allowed_tools` 字段：
>    - 填写为 `[]`：所有工具不生效
>    - 填写为 `["*"]`：所有工具生效
>    - 填写为 `["aa", "bb", "cc"]`：`aa`、`bb`、`cc` 生效
>    - 填写为 `["aa", "bb", "*"]`：所有工具生效

          - `properties.llm.mcp_servers.items.allowed_tools.items` (string)
No schema.
        - `properties.llm.mcp_servers.items.timeout_ms` (integer) - MCP 服务器请求超时时间，单位为毫秒。请求超时后，智能体将不会等待 MCP 服务器响应，而是继续执行后续逻辑。
No schema.
    - `properties.llm.headers` (object) - 请求 LLM 时附带的自定义请求 Header。你可以通过该字段透传业务自定义字段、租户标识等业务相关信息。
> - 该参数传入的请求 Header 会与对话式 AI 引擎默认生成的请求 Header 合并；当键冲突时，以对话式 AI 引擎生成的请求 Header 为准（例如认证相关 Header）。
> - Header 键按字符串精确匹配进行合并（区分大小写），声网建议统一使用标准写法，避免同名不同大小写导致歧义。

No schema.
    - `properties.llm.params` (object) - 在消息体内传输的 LLM 附加信息，例如使用的模型、最大 Token 数限制等。不同的 LLM 供应商支持的配置不同，请参考对应文档按需填入。
No schema.
  - `properties.avatar` (object) - 数字人 (Avatar) 配置。
    - `properties.avatar.enable` (boolean) - 是否为智能体启用数字人功能：
- `true`：启用。启用后需配置 `vendor` 和 `params` 字段。
- `false`：（默认）不启用。

> 开启数字人功能将产生 RTC 视频通话费用，详见 [RTC 计费说明](https://doc.shengwang.cn/doc/rtc/android/billing/billing-strategy)。

No schema.
    - `properties.avatar.vendor` (string) - 数字人供应商，支持传入以下值：
- `sensetime`：商汤数字人

No schema.
    - `properties.avatar.params` (object) - 商汤数字人配置参数，具体协议详见[商汤官方文档](https://aigc.softsugar.com/html/help/5-%E7%9B%B4%E6%92%AD.html#%E7%9B%B4%E6%92%AD%E8%84%9A%E6%9C%ACjson%E5%AE%9A%E4%B9%89%E8%AF%B4%E6%98%8E)。以下为示例：
```json
"params": {
    "agora_token": "agora_token",
    "agora_uid": "agora_uid",
    "appId": "sensetime_app_id",
    "app_key": "sensetime_app_key",
    "sceneList": [
        {
            "digital_role": {
                "face_feature_id": "face_feature_id",
                "position": {"x": 0, "y": 0},
                "url": "https://example-digital-human-models/avatar_id.zip"
            }
        }
    ]
}
```
> - 以下商汤数字人配置字段当前不支持在 `params` 中透传：`tts_config`、`tts_query`、`audios`、`quick_response`、`quick_response_preload_list`、`opening_words`。
> - `agora_uid` 必须为大小不超过 32 位(`0` 到 `2^32-1`))的纯数字字符串，例如 `"1234"`。
No schema.
  - `properties.turn_detection` (object) - 对话轮次检测设置，用于控制语音活动检测和对话轮次判定逻辑。

> 自 v2.6 起，`turn_detection` 仅负责开始说话（SoS）和结束说话（EoS）的检测。关键词打断和关闭打断后的处理策略已迁移至顶级 `interruption` 字段。
    - `properties.turn_detection.mode` (string) - 对话轮次检测模式，当前支持以下值：
- `"default"`：（默认）默认模式，使用标准的对话轮次检测配置。
No schema.
    - `properties.turn_detection.config` (object) - 对话轮次检测详细配置。
      - `properties.turn_detection.config.speech_threshold` (number) - 语音识别灵敏度，取值范围为 (0.0, 1.0)。决定音频信号中何种程度的声音被视为"语音活动"。较低的值会使智能体更容易检测到语音，较高的值则可能忽略微弱声音。
No schema.
      - `properties.turn_detection.config.start_of_speech` (object) - 对话开始 (Start of Speech, SoS) 检测配置，用于判定用户何时开始说话。
        - `properties.turn_detection.config.start_of_speech.mode` (string) - 对话开始检测模式，支持以下值：
- `"vad"`：（默认）基于 VAD（语音活动检测）触发，使用音频信号检测。
- `"keywords"`：已废弃，请改用 `properties.interruption.mode = "keywords"` 配置关键词打断。
- `"disabled"`：已废弃，请改用 `properties.interruption.enable = false` 配合 `properties.interruption.disabled_config.strategy` 配置关闭打断后的处理策略。
No schema.
        - `properties.turn_detection.config.start_of_speech.{mode}_config` (object) - 已废弃。请改用 `interruption.enable = false` 配合 `interruption.disabled_config.strategy` 配置关闭打断后的处理策略。
          - `properties.turn_detection.config.start_of_speech.{mode}_config.interrupt_duration_ms` (integer) - 智能体空闲或倾听时的人声持续阈值 (ms)，取值范围为 [120, 1200]。持续检测到人声信号的最小时间长度，避免误打断。
No schema.
          - `properties.turn_detection.config.start_of_speech.{mode}_config.speaking_interrupt_duration_ms` (integer) - 智能体说话时的人声持续阈值 (ms)，取值范围为 [120, 1200]。持续检测到人声信号的最小时间长度，避免误打断。通常设置得比 `interrupt_duration_ms` 更长，以避免智能体说话时被较短人声误打断。
No schema.
          - `properties.turn_detection.config.start_of_speech.{mode}_config.prefix_padding_ms` (integer) - 前缀填充阈值 (ms)，取值范围为 [0, 5000]。开始新的语音片段所需的最短语音持续时间，避免非常短的声音触发语音活动检测。
No schema.
      - `properties.turn_detection.config.end_of_speech` (object) - 对话结束 (End of Speech, EoS) 检测配置，用于判定用户何时结束说话。
        - `properties.turn_detection.config.end_of_speech.mode` (string) - 对话结束检测模式，支持以下值：
- `"vad"`：（默认）基于 VAD（语音活动检测）触发，检测静音持续时间。
- `"semantic"`：基于语义触发，使用语义理解模块判定对话结束。该模式目前仅支持识别中文和英文文本。
No schema.
        - `properties.turn_detection.config.end_of_speech.{mode}_config` (object) - 基于语义的对话结束检测配置。以下为示例：
```json
"semantic_config": {
    "silence_duration_ms": 240,
    "max_wait_ms": 3000,
    "pause_state_enabled": true
}
```
          - `properties.turn_detection.config.end_of_speech.{mode}_config.silence_duration_ms` (integer) - 静音持续阈值 (ms)，取值范围为 [120, 2000]。语音结束时的最短静音持续时间，确保短暂的停顿不会过早结束语音片段。
No schema.
          - `properties.turn_detection.config.end_of_speech.{mode}_config.max_wait_ms` (integer) - 最大等待时间 (ms)，取值范围为 [500, 10000]，传入 `-1` 表示永远等待。等待语义判定的最长时间，超时后将基于当前状态判定对话是否结束。
No schema.
          - `properties.turn_detection.config.end_of_speech.{mode}_config.pause_state_enabled` (boolean) - 是否判定用户有暂停对话的意图:
- `true`：（默认）智能体会根据语义判断用户是否想要暂停对话。例如，当用户输入以“等一下”、“稍等”等词结束时，智能体可根据语义判断用户有暂停对话的意图并等待用户后续输入，而不是判断用户输入结束并直接发送给 LLM。
- `false`：智能体不判定用户是否想要暂停对话。

No schema.
  - `properties.interruption` (object) - 智能打断控制配置，用于统一管理智能体被用户打断的行为策略。
    - `properties.interruption.enable` (boolean) - 是否开启智能体打断功能：
- `true`：（默认）开启。
- `false`：关闭。关闭后，智能体不会被中途打断。
No schema.
    - `properties.interruption.mode` (string) - 打断触发方式，支持以下值：
- `"start_of_speech"`：（默认）用户开始说话时触发打断。
- `"keywords"`：用户说出指定关键词时触发打断，在 `keywords_config` 字段中配置触发关键词。
No schema.
    - `properties.interruption.keywords_config` (object) - 基于关键词触发打断的配置。仅在 `mode = "keywords"` 时生效。
      - `properties.interruption.keywords_config.trigger_keywords` (array) - 触发打断的关键词列表。最多支持设置 128 个关键词。
        - `properties.interruption.keywords_config.trigger_keywords.items` (string)
No schema.
    - `properties.interruption.disabled_config` (object) - 关闭打断功能后的处理策略。仅在 `interruption.enable` 为 `false` 时生效。
      - `properties.interruption.disabled_config.strategy` (string) - 关闭打断功能后的处理策略，支持以下值：
- `"append"`：追加模式，人声不打断智能体。智能体会在当前交互结束后处理刚才收到的人声请求。
- `"ignore"`：忽略模式，智能体忽略人声请求。如果智能体正在说话或思考中途收到人声，智能体会直接忽略并丢弃人声请求，不存入上下文。

No schema.
  - `properties.sal` (object) - 选择性注意力锁定（Selective Attention Locking, SAL）配置。
> 该功能目前处于 Beta 阶段。
    - `properties.sal.sal_mode` (string) - 选择性注意力锁定模式，支持以下选项：
- `"locking"`：（默认）主讲人锁定模式。智能体锁定主讲人，屏蔽 95% 的环境人声、噪声。该模式可通过两种方式启用：
  - 无感识别：用户在对话初期大声、清晰地说话，智能体即可自动将用户识别为主讲人。
  - 预注册：创建智能体时，通过 `sample_urls` 字段预注册一名主讲人的声纹 URL，智能体将根据预注册的声纹 URL 锁定主讲人。
- `"recognition"`：声纹识别模式。你可以通过 `sample_urls` 字段预注册声纹 URL，目前仅支持单声纹注册。智能体将识别不同的说话人并抑制其他背景人声和环境噪音。识别到的说话人身份会通过 `metadata` 字段里的 `vpids` 字段标识并发送给 LLM，你需要将 `llm.vendor` 设置为 `"custom"`，并参考[自定义大模型](/doc/convoai/restful/user-guides/custom-llm)了解如何让 LLM 处理说话人信息。
No schema.
    - `properties.sal.sample_urls` (object) - 注册声纹 URL，为键值对形式，键为注册的声纹名称，值为对应说话者的声纹 URL 下载地址。
> - 传入的声纹名称不可设置为 `"unknown"`，这是一个保留关键字，用于标识未知说话人。
> - 对于注册的声纹，需满足以下条件：
>   - 数量: 每个任务请求的注册声纹URL数量，目前仅支持单声纹，数量为 1 个。
>   - 大小: 单个声纹文件不得超过 2 MB。
>   - 时长：时长为 10 到 15 秒, 其中有效音频不小于 8 秒（不能有太多静音段）。
>   - 格式: 必须为 16k 采样率、16bit 位深、单声道的 PCM 音频文件，文件名后缀必须为 `.pcm`。
No schema.
  - `properties.labels` (object) - 自定义标签，键值对形式，键为标签名，值为标签值。用于让智能体携带自定义业务信息。

这些自定义信息会与智能体绑定，并在对话式 AI 引擎所有类型消息通知回调的 `payload` 字段中返回，可用于实现自定义业务逻辑，例如标记活动 ID、客户分组、业务场景等。
No schema.
  - `properties.rtc` (object) - RTC 媒体内容加密配置。
    - `properties.rtc.encryption_key` (string) - 字符串类型的加密密钥，长度不受限制。声网建议使用 32 字节的密钥。
> 如果未设置加密密钥或将其设置为空，则无法使用内置加密。
No schema.
    - `properties.rtc.encryption_salt` (string) - 用于加密的盐值，Base64 编码的字符串，解码后长度为 32 字节。
> 该参数仅在 `encryption_mode` 设为 `7`（AES_128_GCM2）或 `8`（AES_256_GCM2）时生效。在此情况下，请确保该参数不为空。
No schema.
    - `properties.rtc.encryption_mode` (integer) - 内置加密模式，支持以下值：
- `1`: AES_128_XTS - 128 位 AES 加密，XTS 模式。
- `2`: AES_128_ECB - 128 位 AES 加密，ECB 模式。
- `3`: AES_256_XTS - 256 位 AES 加密，XTS 模式。
- `4`: SM4_128_ECB - 128 位 SM4 加密，ECB 模式。
- `5`: AES_128_GCM - 128 位 AES 加密，GCM 模式。
- `6`: AES_256_GCM - 256 位 AES 加密，GCM 模式。
- `7`: AES_128_GCM2 - 128 位 AES 加密，GCM 模式。该模式需设置 salt（`encryption_salt`）。
- `8`: AES_256_GCM2 - 256 位 AES 加密，GCM 模式。该模式需设置 salt（`encryption_salt`）。

> 声网建议使用 `7`（AES_128_GCM2）或 `8`（AES_256_GCM2）模式，这两种模式支持使用加密盐以提升安全性。
No schema.
  - `properties.filler_words` (object) - 垫词功能 (Beta) 配置，用于在 LLM 响应等待时播报垫词，缓解用户等待焦虑，提升对话流畅度。

垫词播报遵循以下规则：
- **播报顺序**：当多个垫词或 LLM 响应等待播报时，按照文本到达的先后顺序进行播报。
- **打断控制**：继承全局配置中的打断模式设置 (`turn_detection.config`)。
    - `properties.filler_words.enable` (boolean) - 是否启用垫词功能：
- `true`：启用。
- `false`：（默认）不启用。
No schema.
    - `properties.filler_words.trigger` (object) - 垫词触发配置，定义何时触发垫词播报。
      - `properties.filler_words.trigger.mode` (string) - 垫词触发模式，支持以下值：
- `"fixed_time"`：固定时间触发。当 LLM 响应等待时间超过设定阈值时触发垫词播报。
No schema.
      - `properties.filler_words.trigger.{mode}_config` (object) - 固定时间触发配置。以下为示例：
```json
"config": {
    "response_wait_ms": 1500
}
```
        - `properties.filler_words.trigger.{mode}_config.response_wait_ms` (integer) - LLM 响应等待阈值 (ms)，取值范围为 [100, 10000]。当 LLM 处于等待状态（例如等待 RAG 检索结果、工具调用结果）的持续时间达到该阈值且未生成响应内容时，触发垫词播报。
No schema.
    - `properties.filler_words.content` (object) - 垫词内容配置，定义垫词的来源和选择规则。
      - `properties.filler_words.content.mode` (string) - 垫词内容模式，支持以下值：
- `"static"`：静态垫词。使用预定义的垫词列表。
No schema.
      - `properties.filler_words.content.{mode}_config` (object) - 静态垫词配置。以下为示例：
```json
"static_config": {
    "phrases": [
        "请稍等。",
        "好的。",
        "嗯嗯。"
    ],
    "selection_rule": "shuffle"
}
```
        - `properties.filler_words.content.{mode}_config.phrases` (array) - 垫词短语列表。
> - 最多支持 100 个垫词。
> - 每个垫词长度不超过 50 个中文字符或 50 个英文单词。
          - `properties.filler_words.content.{mode}_config.phrases.items` (string)
No schema.
        - `properties.filler_words.content.{mode}_config.selection_rule` (string) - 垫词选择规则，支持以下值：
- `"shuffle"`：随机打乱。在所有垫词都被使用完一轮前，已使用的垫词不会重复播报；只有所有垫词播报完后，才会重新随机打乱并开始新的一轮。
- `"round_robin"`：轮询。从垫词列表中顺序选取并播报，所有垫词播报完一轮后，开始新的循环播报。
No schema.
  - `properties.parameters` (object) - 智能体参数配置。
    - `properties.parameters.silence_config` (object) - 智能体静默设置。
      - `properties.parameters.silence_config.timeout_ms` (integer) - 智能体最大静默时间 (ms)，取值范围为 [0,60000]。智能体创建成功，且用户加入频道后，智能体不处于倾听、思考或说话状态的持续时间称为智能体静默时间。静默时间达到设定值后，智能体将播报静默提示消息。该功能可用于在用户不活跃时让智能体提醒用户。
- 设置为 `0`（默认值）：表示不启用该功能。
- 设置为 `(0,60000]` 时，必须同时设置 `content` 才能正常播报静默提示，否则设置无效。
No schema.
      - `properties.parameters.silence_config.action` (string) - 静默时间达到设定值后，智能体采取的行为，可设为以下值：
- `"speak"`：（默认）使用 TTS 模块播报静默提示内容 (`content`)。
- `"think"`：将静默提示内容 (`content`) 追加在上下文的最后，并传递给 LLM。
No schema.
      - `properties.parameters.silence_config.content` (string) - 静默提示消息的内容。设置的内容会根据 `action` 中的设置以不同的方式使用。
No schema.
    - `properties.parameters.farewell_config` (object) - 智能体优雅挂断设置。
      - `properties.parameters.farewell_config.graceful_enabled` (boolean) - 是否启用优雅退出（Graceful Leave）功能：
- `true`：启用。开启后，调用 [POST 停止对话式智能体](/doc/convoai/restful/convoai/operations/stop-agent)接口，让智能体退出频道时，会确保智能体处于静默状态（`IDLE`）后再离开频道。
- `false`：（默认）不启用。
No schema.
      - `properties.parameters.farewell_config.graceful_timeout_seconds` (integer) - 优雅退出超时时间 (s)，表示在退出频道前等待智能体进入静默状态（`IDLE`）的最长时间，超出该时间后，即便智能体不处于静默状态，也会立即退出频道。该字段仅在 `graceful_enabled` 为 `true` 时生效，取值范围为 [0,120]。
No schema.
    - `properties.parameters.data_channel` (string) - 智能体数据传输通道，可选以下值：
- `rtm`：使用 RTM 传输。该配置仅在 `advanced_features.enable_rtm` 为 `true` 时生效。 
- `datastream`：（默认）使用 RTC 的 [`DataStream`](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_datastream#callback_irtcengineeventhandler_onstreammessage) 传输。
No schema.
    - `properties.parameters.enable_metrics` (boolean) - 是否接收智能体性能数据：
- `true`：接收。
- `false`：（默认）不接收。

该配置仅在 `advanced_features.enable_rtm` 为 `true` 时生效。你可以参考[监听智能体事件](/doc/convoai/restful/user-guides/listen-agent-events)了解如何使用客户端组件接收智能体性能数据，或参考[接收 Webhook 事件](/doc/convoai/restful/webhook/enable-ncs)了解如何使用 Webhook 接收智能体性能数据。
No schema.
    - `properties.parameters.enable_error_message` (boolean) - 是否接收智能体错误事件：
- `true`：接收。
- `false`：（默认）不接收。

该配置仅在 `advanced_features.enable_rtm` 为 `true` 时生效。你可以参考[监听智能体事件](/doc/convoai/restful/user-guides/listen-agent-events)了解如何使用客户端组件接收智能体错误事件。
No schema.

## Responses

### 200

- 若返回的状态码为 `200` 则表示请求成功。响应包体中包含本次请求的结果。
- 若返回的状态码不为 `200` 则表示请求失败。响应包体中包含错误的类别和描述，你可以参考[响应状态码](https://doc.shengwang.cn/doc/convoai/restful/api/response-code)了解可能的原因。

- `agent_id` (string) - 智能体唯一标识。
No schema.
- `create_ts` (integer) - 智能体创建时间戳。
No schema.
- `status` (string) - 智能体运行状态：
- `IDLE` (0)：空闲状态的智能体。
- `STARTING` (1)：正在启动的智能体。
- `RUNNING` (2)：正在运行的智能体。
- `STOPPING` (3)：正在停止的智能体。
- `STOPPED` (4)：已完成退出的智能体。
- `RECOVERING` (5)：正在恢复的智能体。
- `FAILED` (6)：执行失败的智能体。
No schema.
