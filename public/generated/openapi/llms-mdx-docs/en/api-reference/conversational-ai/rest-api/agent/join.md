# Start a conversational AI agent (/en/api-reference/conversational-ai/rest-api/agent/join)

Create a Conversational AI agent instance and join the RTC channel.

- OpenAPI: /openapi/conversational-ai/convoai.en.yaml
- Operation ID: start-agent
- Method: POST
- Path: /v2/projects/{appid}/join

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

- `Authorization` (header, required) - When sending an HTTP request, you need to choose one of the following authentication methods: <ol><li>** (Recommended) Use RTC Token**: Fill in the `Authorization` field with the RTC Token used by the Agora conversational AI engine project. You can choose the following methods to obtain Token: <ul><li>In the test environment, you can generate a temporary Token (valid for 24 hours) for your project from [Shengwang Console](https://console.shengwang.cn/). </li><li>In a production environment, you can refer to [Using Token Authentication](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication) to deploy the Token server to generate Token. </li></ul>Example of passing parameters: `Authorization: agora token="007abcxxxxxxx123"`</li><li>**Use Basic Auth**: Refer to [Implementing HTTP security authentication](https://doc.shengwang.cn/doc/convoai/restful/user-guides/http-basic-auth#Use-http-basic authentication) to generate the Base64-encoded `Authorization` field. <br/>Parameter passing example: `Authorization: Basic NDI1OTQ3N2I4MzYy...YwZjA=`</li></ol>
- `appid` (path, required) - [App ID](http://doc.shengwang.cn/doc/convoai/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id) used by your project.

## Request body

- `name` (string, required) - The unique identifier of the agent, and the same identifier cannot be created repeatedly.
No schema.
- `properties` (object, required) - Detailed configuration of the agent.
  - `properties.channel` (string, required) - The name of the RTC channel that the agent joins.
No schema.
  - `properties.token` (string) - The Token used to join the RTC channel is the dynamic key used for authentication. If your project has App Certificates enabled, be sure to pass your project's dynamic key in this field. For details, see [Using Token Authentication](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication).
No schema.
  - `properties.agent_rtc_uid` (string, required) - The user ID of the agent in the RTC channel.
No schema.
  - `properties.remote_rtc_uids` (array, required) - A list of user IDs subscribed by the agent in the RTC channel. Only subscribed users can interact with the agent. Currently, only subscribing to one user ID is supported.
    - `properties.remote_rtc_uids.items` (string)
No schema.
  - `properties.enable_string_uid` (boolean) - Whether to enable String UID:
- `true`: Both agent and subscriber IDs use String UIDs.
- `false`: (Default) Both agent and subscriber IDs use Int UID.
> In the same channel, user IDs of type Int and String cannot be mixed. For more information about using String UID, please refer to [How to use String user ID](https://doc.shengwang.cn/faq/integration-issues/string-uid).
No schema.
  - `properties.idle_timeout` (integer) - Maximum idle time of RTC channel (s). The time after it is detected that all users specified in `remote_rtc_uids` have left the channel is regarded as the channel idle time. When it exceeds the set maximum value, the channel's agent will automatically stop and exit the channel. If filled with `0`, the agent will not stop until manually exited.
No schema.
  - `properties.advanced_features` (object) - Advanced feature configuration.
    - `properties.advanced_features.enable_rtm` (boolean) - Whether to enable the real-time messaging RTM service. After being enabled, the agent will automatically log in to RTM and subscribe to the channel specified in `channel`. It can combine the capabilities provided by RTM to implement some advanced functions, such as [delivering custom information](https://doc.shengwang.cn/doc/convoai/restful/user-guides/custom-data).

> Before enabling the RTM service, you need to ensure that the Token has both RTC and RTM permissions. When an agent joins the RTM channel, it will reuse the Token configured in the `token` field. You can refer to [FAQ](https://doc.shengwang.cn/faq/integration-issues/generate-token) to learn how to generate a Token with both RTC and RTM permissions.
No schema.
    - `properties.advanced_features.enable_sal` (boolean) - Whether to enable the Selective Attention Locking (SAL) function. After enabling it, complete the relevant settings in the `sal` field, and the agent can identify the user's voiceprint characteristics, effectively distinguish between different speakers, and block 95% of ambient human voices and noise.
> This feature is currently in beta.
No schema.
    - `properties.advanced_features.enable_tools` (boolean) - Whether to enable the tool calling function. Once enabled, the agent can call the tools provided by the MCP server to implement more complex business logic.
No schema.
  - `properties.asr` (object) - Automatic speech recognition (ASR) configuration.
    - `properties.asr.language` (string) - Language used when the user interacts with the agent:
- `zh-CN`: Chinese (supports mixed Chinese and English)
- `en-US`: English
No schema.
    - `properties.asr.vendor` (string) - ASR service provider, optional values:
- `fengming`: (Default) SoundNet Fengming ASR.
- `tencent`: Tencent ASR.
- `microsoft`: Microsoft ASR.
- `xfyun`: iFlytek traditional speech transcription recognition service.
- `xfyun_bigmodel`: iFlytek speech recognition large model service.
- `xfyun_dialect`: iFlytek dialect free speaking recognition service.
No schema.
    - `properties.asr.params` (object) - iFlytek Cloud Dialect Free Speech Recognition Service, for details of the agreement, please see [iFlytek official document](https://www.xfyun.cn/doc/spark/asr_llm/rtasr_llm.html). The following are examples:
```json
"params": {
    "app_id": "XFYUN_ASR_DIALOG_APP_ID",
    "access_key_id": "XFYUN_ASR_DIALOG_ACCESS_KEY_ID",
    "access_key_secret":"XFYUN_ASR_DIALOG_ACCESS_KEY_SECRET",
    "language": "zh-CN"
}
```
No schema.
  - `properties.tts` (object, required) - Text-to-speech (TTS) module configuration.
    - `properties.tts.vendor` (string, required) - TTS provider, supports passing in the following values:
- `minimax`: Minimax TTS
- `tencent`: Tencent TTS
- `bytedance`: Volcano engine TTS
- `microsoft`: Microsoft Azure TTS
- `cosyvoice`: (Beta) Alibaba Cloud CosyVoice TTS
- `bytedance_duplex`: Volcano engine bidirectional streaming TTS
- `stepfun`: (Beta) Step Star TTS
No schema.
    - `properties.tts.skip_patterns` (array) - Filter mode configuration is used to control whether to skip the content in brackets in the LLM return text to avoid the agent from broadcasting unnecessary structural prompt information such as tone, action description, etc. The default value is `[]`, which does not filter anything. The optional values are as follows. Passing in will enable this function:

- `1`: Skip the content in Chinese parentheses ( )
- `2`: Skip the content in Chinese square brackets [ ]
- `3`: Skip the content in English parentheses ( )
- `4`: Skip the content in English square brackets [ ]
- `5`: Skip the content in English curly braces \{ }

> - When there are nested brackets in the input text and multiple bracket types are configured to skip, the agent only processes the outermost brackets, that is, the system will start matching from the starting position of the text. Once the first outermost bracket pair that meets the skip rules is found, the bracket pair and all the content it contains (including any nested brackets of other types) will be skipped as a whole.
> - Regardless of whether [real-time subtitles](https://doc.shengwang.cn/doc/convoai/restful/user-guides/realtime-sub) is turned on or not, the agent short-term memory will contain the filtered content, that is, the complete text generated by LLM.
> - When [Real-time Subtitles](https://doc.shengwang.cn/doc/convoai/restful/user-guides/realtime-sub) is turned on, the real-time subtitles will not include filtered content when TTS is broadcast. After the sentence is broadcast, the subtitles will add these contents back.
> - Volcano engine bidirectional streaming TTS does not currently support this feature.
      - `properties.tts.skip_patterns.items` (integer)
No schema.
    - `properties.tts.params` (object, required) - Step Star TTS, for details on the protocol, see [Step Star Official Document](https://platform.stepfun.com/docs/api-reference/audio/ws_audio). The following are examples:
 ```json
 "params": {
   "api_key": "your_stepfun_tts_key",
   "model": "step-tts-mini",
   "voice_id": "cixingnansheng"
 }
 ```
No schema.
  - `properties.llm` (object, required) - Large language model (LLM) configuration.
    - `properties.llm.url` (string, required) - LLM callback address, required to be compatible with the OpenAI protocol.
No schema.
    - `properties.llm.api_key` (string) - LLM authentication API key. The default is empty. The API key must be enabled in the production environment.
No schema.
    - `properties.llm.system_messages` (array) - A set of predefined messages that are prepended every time LLM is called to control the LLM output. It can be role settings, prompt words, answer samples, etc. Requires compatibility with OpenAI protocol.
      - `properties.llm.system_messages.items` (object)
No schema.
    - `properties.llm.max_history` (integer) - Number of short-term memory entries cached in LLM. The value range is `[1,1024]`. Short-term memory includes user and agent conversation messages, tool call information, and timestamps. The agent and user record short-term memory entries separately.
No schema.
    - `properties.llm.input_modalities` (array) - The input mode of LLM supports:
- `["text"]`: (default) text only.
- `["text", "image"]`: text plus image, requires the selected LLM to support visual modal input.
      - `properties.llm.input_modalities.items` (string)
No schema.
    - `properties.llm.output_modalities` (array) - The output mode of LLM supports:
- `["text"]`: (default) text only. The output text will be converted into speech by the TTS module and then published to the RTC channel.
- `["audio"]`: Speech only. Voice is posted directly to the RTC channel.
- `["text", "audio"]`: text plus voice. You can write your own logic to process the LLM output as needed.
      - `properties.llm.output_modalities.items` (string)
No schema.
    - `properties.llm.greeting_message` (string) - Agent greeting. If filled in, when there is no user in the subscriber list (`remote_rtc_uids`) in the channel, the agent will automatically send a greeting to the first subscriber who joins the channel.
No schema.
    - `properties.llm.greeting_configs` (object) - Agent greeting broadcast configuration.
      - `properties.llm.greeting_configs.mode` (string) - Agent greeting broadcast mode supports the following options:
- `"single_every"`: (Default) The agent broadcasts a greeting every time a user joins the empty channel.
- `"single_first"`: When only the first user joins the empty channel, the agent broadcasts the greeting once.
No schema.
      - `properties.llm.greeting_configs.delay_ms` (integer) - Agent greeting broadcast delay time (ms), the value range is [0, 5000]. After configuration, the agent greeting will wait for the specified time before broadcasting after the user joins the channel.
No schema.
    - `properties.llm.template_variables` (object) - Dynamic parameter configuration for inserting variables in the agent's `system_messages`, `greeting_message`, `failure_message` and `parameters.silence_config.content` text. In the form of key-value pairs, the key is the variable name and the value is the variable value.

**Usage**: Use the `{{variable_name}}` format to reference variables in the Prompt text, and the system will automatically replace them with the corresponding values ​​defined in `template_variables`.
> Note: Variable names and variable values ​​do not support referencing other variables. For example, in the custom variable `"farewell": "Looking forward to seeing you next time, {{name}}"`, the `{{name}}` in it will not be parsed.
No schema.
    - `properties.llm.failure_message` (string) - Agent processing failure prompt. If filled in, this will be returned via the TTS module on an error in the LLM call.
No schema.
    - `properties.llm.vendor` (string) - LLM provider, supports the following two settings:
- Commercial large model provider, supports the following values:
  - `aliyun`: Alibaba Cloud
  - `bytedance`: Bytedance
  - `deepseek`: deep search
  - `tencent`：Tencent

  Once set, it can improve compatibility and reduce request failures caused by carrying information not supported by LLM.
- Customize LLM, i.e. set to `"custom"`. After setting, when the agent calls custom LLM, in addition to `role` and `content`, it will carry the following additional information:
  - `turn_id`: unique conversation turn identifier. `turn_id` starts from 0 and increments, and a round of dialogue between the user and the agent corresponds to one `turn_id`.
  - `timestamp`: request timestamp, precision is milliseconds.
No schema.
    - `properties.llm.mcp_servers` (array) - MCP (Model Context Protocol) server configuration list. By configuring the MCP server, the agent can call tools provided by external services to implement more complex business logic.
      - `properties.llm.mcp_servers.items` (object)
        - `properties.llm.mcp_servers.items.name` (string, required) - The unique identifier of the MCP server. The length must not exceed 48 characters, and the following characters are supported:
- All lowercase English letters: a to z
- All uppercase English letters: A to Z
- All numeric characters: 0 to 9
- "." and "-"
No schema.
        - `properties.llm.mcp_servers.items.endpoint` (string, required) - The endpoint address of the MCP server through which the agent will communicate with the MCP server.
No schema.
        - `properties.llm.mcp_servers.items.transport` (string) - Transport protocol type, supports the following values:
- `"streamable_http"`: streaming HTTP protocol
No schema.
        - `properties.llm.mcp_servers.items.headers` (object) - HTTP header information carried when requesting the MCP server, such as authentication information.
No schema.
        - `properties.llm.mcp_servers.items.allowed_tools` (array) - A list of tools that the agent is allowed to call. Only tools in this list can be used by the agent.
> `allowed_tools` field validation rules:
> - Leave `allowed_tools` field unfilled: all tools take effect
> - Fill in the `allowed_tools` field:
> - Fill in as `[]`: all tools will not take effect
> - Fill in as `["*"]`: all tools will take effect
> - Fill in as `["aa", "bb", "cc"]`: `aa`, `bb`, `cc` are valid
> - Fill in as `["aa", "bb", "*"]`: all tools will take effect
          - `properties.llm.mcp_servers.items.allowed_tools.items` (string)
No schema.
        - `properties.llm.mcp_servers.items.timeout_ms` (integer) - MCP server request timeout, in milliseconds. After the request times out, the agent will not wait for the MCP server to respond, but will continue to execute subsequent logic.
No schema.
    - `properties.llm.headers` (object) - Custom request header included when requesting LLM. You can use this field to transparently transmit business-related information such as business custom fields and tenant IDs.
> - The request header passed in by this parameter will be merged with the request header generated by the conversational AI engine by default; when there is a key conflict, the request header generated by the conversational AI engine will prevail (such as authentication-related headers).
> - Header keys are merged according to exact string matching (case-sensitive). Shengwang recommends using standard writing to avoid ambiguity caused by different case names with the same name.
No schema.
    - `properties.llm.params` (object) - LLM additional information transmitted in the message body, such as the model used, the maximum number of Tokens, etc. Different LLM vendors support different configurations. Please refer to the corresponding documents to fill in the configuration as needed.
No schema.
  - `properties.avatar` (object) - Digital Man (Avatar) configuration.
    - `properties.avatar.enable` (boolean) - Whether to enable digital human functionality for the agent:
- `true`: enabled. After enabling, the `vendor` and `params` fields need to be configured.
- `false`: (Default) Not enabled.

> Enabling the digital human function will incur RTC video call charges. For details, please see [RTC Billing Instructions](https://doc.shengwang.cn/doc/rtc/android/billing/billing-strategy).
No schema.
    - `properties.avatar.vendor` (string) - Digital human supplier, supports passing in the following values:
- `sensetime`: Sensetime digital person
No schema.
    - `properties.avatar.params` (object) - SenseTime digital human configuration parameters, the specific protocol details can be found in [SenseTime official document](https://aigc.softsugar.com/html/help/5-%E7%9B%B4%E6%92%AD. html#%E7%9B%B4%E6%92%AD%E8%84%9A%E6%9C%ACjson%E5%AE%9A%E4%B9%89%E8%AF%B4%E6%98%8E). The following are examples:
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
> - The following SenseTime digital human configuration fields currently do not support transparent transmission in `params`: `tts_config`, `tts_query`, `audios`, `quick_response`, `quick_response_preload_list`, `opening_words`.
> - `agora_uid` must be a purely numeric string of no more than 32 bits (`0` to `2^32-1`)), for example `"1234"`.
No schema.
  - `properties.turn_detection` (object) - Conversation turn detection settings, used to control voice activity detection and conversation turn determination logic.

> Since v2.6, `turn_detection` is only responsible for start of speech (SoS) and end of speech (EoS) detection. The processing strategies for keyword interruption and closing interruptions have been moved to the top-level `interruption` field.
    - `properties.turn_detection.mode` (string) - Dialog turn detection mode, currently supports the following values:
- `"default"`: (Default) Default mode, using standard conversation turn detection configuration.
No schema.
    - `properties.turn_detection.config` (object) - Conversation turn detection detailed configuration.
      - `properties.turn_detection.config.speech_threshold` (number) - Speech recognition sensitivity, the value range is (0.0, 1.0). Determines what level of sound in the audio signal is considered "speech activity". Lower values ​​will make it easier for the agent to detect speech, higher values ​​may ignore faint sounds.
No schema.
      - `properties.turn_detection.config.start_of_speech` (object) - Start of Speech (SoS) detection configuration to determine when a user starts speaking.
        - `properties.turn_detection.config.start_of_speech.mode` (string) - Conversation start detection mode, supports the following values:
- `"vad"`: (Default) Trigger based on VAD (Voice Activity Detection), using audio signal detection.
- `"keywords"`: Deprecated, please use `properties.interruption.mode = "keywords"` to configure keyword interruption instead.
- `"disabled"`: Deprecated, please use `properties.interruption.enable = false` instead with `properties.interruption.disabled_config.strategy` to configure the processing strategy after turning off interruption.
No schema.
        - `properties.turn_detection.config.start_of_speech.{mode}_config` (object) - Deprecated. Please use `interruption.enable = false` instead and `interruption.disabled_config.strategy` to configure the processing strategy after turning off interruption.
          - `properties.turn_detection.config.start_of_speech.{mode}_config.interrupt_duration_ms` (integer) - The vocal duration threshold (ms) when the agent is idle or listening, ranging from [120, 1200]. The minimum length of time for continuous detection of human voice signals to avoid false interruptions.
No schema.
          - `properties.turn_detection.config.start_of_speech.{mode}_config.speaking_interrupt_duration_ms` (integer) - The vocal duration threshold (ms) when the agent is speaking, the value range is [120, 1200]. The minimum length of time for continuous detection of human voice signals to avoid false interruptions. Usually set longer than `interrupt_duration_ms` to avoid being accidentally interrupted by shorter human voices when the agent is speaking.
No schema.
          - `properties.turn_detection.config.start_of_speech.{mode}_config.prefix_padding_ms` (integer) - Prefix padding threshold (ms), range [0, 5000]. Minimum speech duration required to start a new speech segment, to avoid very short sounds triggering speech activity detection.
No schema.
      - `properties.turn_detection.config.end_of_speech` (object) - End of Speech (EoS) detection configuration, used to determine when the user has finished speaking.
        - `properties.turn_detection.config.end_of_speech.mode` (string) - Conversation end detection mode, supports the following values:
- `"vad"`: (Default) Trigger based on VAD (Voice Activity Detection), detecting silence duration.
- `"semantic"`: Based on semantic triggering, the semantic understanding module is used to determine the end of the conversation. This mode currently only supports recognition of Chinese and English text.
No schema.
        - `properties.turn_detection.config.end_of_speech.{mode}_config` (object) - Semantics-based conversation end detection configuration. The following are examples:
```json
"semantic_config": {
    "silence_duration_ms": 240,
    "max_wait_ms": 3000,
    "pause_state_enabled": true
}
```
          - `properties.turn_detection.config.end_of_speech.{mode}_config.silence_duration_ms` (integer) - Silence duration threshold (ms), value range is [120, 2000]. The minimum duration of silence at the end of speech, ensuring that brief pauses don't end the speech segment prematurely.
No schema.
          - `properties.turn_detection.config.end_of_speech.{mode}_config.max_wait_ms` (integer) - Maximum waiting time (ms), the value range is [500, 10000], passing `-1` means waiting forever. The maximum time to wait for semantic determination. After timeout, it will be determined whether the conversation ends based on the current status.
No schema.
          - `properties.turn_detection.config.end_of_speech.{mode}_config.pause_state_enabled` (boolean) - Whether to determine that the user intends to pause the conversation:
- `true`: (Default) The agent will determine whether the user wants to pause the conversation based on semantics. For example, when the user input ends with words such as "wait a moment" or "wait a moment", the agent can determine based on semantics that the user intends to pause the conversation and wait for the user's subsequent input, instead of determining that the user input is completed and directly sending it to the LLM.
- `false`: The agent does not determine whether the user wants to pause the conversation.
No schema.
  - `properties.interruption` (object) - Intelligent interruption control configuration is used to uniformly manage the behavior strategy of agents interrupted by users.
    - `properties.interruption.enable` (boolean) - Whether to enable the agent interruption function:
- `true`: (default) enabled.
- `false`: off. After closing, the agent will not be interrupted midway.
No schema.
    - `properties.interruption.mode` (string) - Interrupt triggering mode, supports the following values:
- `"start_of_speech"`: (Default) Trigger interrupt when user starts speaking.
- `"keywords"`: Trigger interruption when the user speaks the specified keyword. Configure the trigger keyword in the `keywords_config` field.
No schema.
    - `properties.interruption.keywords_config` (object) - Configuration of triggering interrupts based on keywords. Only takes effect when `mode = "keywords"`.
      - `properties.interruption.keywords_config.trigger_keywords` (array) - List of keywords that trigger interruption. Supports setting up to 128 keywords.
        - `properties.interruption.keywords_config.trigger_keywords.items` (string)
No schema.
    - `properties.interruption.disabled_config` (object) - The processing strategy after turning off the interruption function. Only takes effect when `interruption.enable` is `false`.
      - `properties.interruption.disabled_config.strategy` (string) - The processing strategy after turning off the interrupt function supports the following values:
- `"append"`: Append mode, the human voice does not interrupt the agent. The agent will process the vocal request just received after the current interaction ends.
- `"ignore"`: ignore mode, the agent ignores vocal requests. If the agent receives a human voice while speaking or thinking, the agent will directly ignore and discard the human voice request without storing the context.
No schema.
  - `properties.sal` (object) - Selective Attention Locking (SAL) configuration.
> This feature is currently in beta.
    - `properties.sal.sal_mode` (string) - Selective attention lock mode, supports the following options:
- `"locking"`: (Default) presenter locking mode. The intelligent body locks on the speaker and blocks 95% of ambient human voices and noise. This mode can be enabled in two ways:
  - Senseless recognition: If the user speaks loudly and clearly at the beginning of the conversation, the agent can automatically identify the user as the speaker.
  - Pre-registration: When creating an agent, pre-register the voiceprint URL of a speaker through the `sample_urls` field, and the agent will lock the speaker based on the pre-registered voiceprint URL.
- `"recognition"`: Voiceprint recognition mode. You can pre-register the voiceprint URL through the `sample_urls` field. Currently, only single voiceprint registration is supported. The agent will recognize different speakers and suppress other background vocals and environmental noise. The recognized speaker identity will be identified and sent to LLM through the `vpids` field in the `metadata` field. You need to set `llm.vendor` to `"custom"` and refer to [Customized Large Model](/doc/convoai/restful/user-guides/custom-llm) to learn how to let LLM process speaker information.
No schema.
    - `properties.sal.sample_urls` (object) - The registered voiceprint URL is in the form of a key-value pair. The key is the registered voiceprint name, and the value is the voiceprint URL download address of the corresponding speaker.
> - The incoming voiceprint name cannot be set to `"unknown"`, which is a reserved keyword used to identify unknown speakers.
> - For registered voiceprints, the following conditions must be met:
> - Quantity: The number of registered voiceprint URLs requested by each task. Currently, only single voiceprint is supported, and the quantity is 1.
> - Size: A single voiceprint file must not exceed 2 MB.
> - Duration: The duration is 10 to 15 seconds, of which the effective audio is not less than 8 seconds (cannot have too many silent segments).
> - Format: Must be a 16k sampling rate, 16bit bit depth, mono PCM audio file, the file name suffix must be `.pcm`.
No schema.
  - `properties.labels` (object) - Custom tags, in the form of key-value pairs, where the key is the tag name and the value is the tag value. Used to allow intelligent agents to carry customized business information.

These custom information will be bound to the agent and returned in the `payload` field of all types of message notification callbacks in the conversational AI engine. It can be used to implement custom business logic, such as marking activity IDs, customer groupings, business scenarios, etc.
No schema.
  - `properties.rtc` (object) - RTC media content encryption configuration.
    - `properties.rtc.encryption_key` (string) - Encryption key of type string with no limit on length. Agora recommends using a 32-byte key.
> If the encryption key is not set or is set to empty, built-in encryption cannot be used.
No schema.
    - `properties.rtc.encryption_salt` (string) - Salt value used for encryption, Base64 encoded string, decoded to 32 bytes in length.
> This parameter only takes effect when `encryption_mode` is set to `7` (AES_128_GCM2) or `8` (AES_256_GCM2). In this case, make sure the parameter is not empty.
No schema.
    - `properties.rtc.encryption_mode` (integer) - Built-in encryption mode, supports the following values:
- `1`: AES_128_XTS - 128-bit AES encryption, XTS mode.
- `2`: AES_128_ECB - 128-bit AES encryption, ECB mode.
- `3`: AES_256_XTS - 256-bit AES encryption, XTS mode.
- `4`: SM4_128_ECB - 128-bit SM4 encryption, ECB mode.
- `5`: AES_128_GCM - 128-bit AES encryption, GCM mode.
- `6`: AES_256_GCM - 256-bit AES encryption, GCM mode.
- `7`: AES_128_GCM2 - 128-bit AES encryption, GCM mode. This mode requires salt (`encryption_salt`) to be set.
- `8`: AES_256_GCM2 - 256-bit AES encryption, GCM mode. This mode requires salt (`encryption_salt`) to be set.

> Agora recommends using `7` (AES_128_GCM2) or `8` (AES_256_GCM2) mode. These two modes support the use of encryption salts to improve security.
No schema.
  - `properties.filler_words` (object) - The padding function (Beta) configuration is used to broadcast padding when LLM is waiting for a response, so as to relieve the user's waiting anxiety and improve the smoothness of the conversation.

Pre-word broadcasting follows the following rules:
- **Broadcast Order**: When multiple pad words or LLM responses are waiting to be broadcast, they will be broadcast in the order in which the texts arrive.
- **Interruption Control**: Inherit the interruption mode setting in the global configuration (`turn_detection.config`).
    - `properties.filler_words.enable` (boolean) - Whether to enable the padding function:
- `true`: enabled.
- `false`: (Default) Not enabled.
No schema.
    - `properties.filler_words.trigger` (object) - The pre-word trigger configuration defines when to trigger the pre-word broadcast.
      - `properties.filler_words.trigger.mode` (string) - Pad word trigger mode supports the following values:
- `"fixed_time"`: Fixed time trigger. When the LLM response waiting time exceeds the set threshold, a pad word broadcast is triggered.
No schema.
      - `properties.filler_words.trigger.{mode}_config` (object) - Fixed time trigger configuration. The following are examples:
```json
"config": {
    "response_wait_ms": 1500
}
```
        - `properties.filler_words.trigger.{mode}_config.response_wait_ms` (integer) - LLM response waiting threshold (ms), the value range is [100, 10000]. When the duration of LLM in the waiting state (such as waiting for RAG retrieval results, tool call results) reaches this threshold and no response content is generated, the pad word broadcast is triggered.
No schema.
    - `properties.filler_words.content` (object) - Configure the content of the pad words, and define the source and selection rules of the pad words.
      - `properties.filler_words.content.mode` (string) - Pad content mode, supports the following values:
- `"static"`: static prefix. Use a predefined list of padding words.
No schema.
      - `properties.filler_words.content.{mode}_config` (object) - Static word configuration. The following are examples:
```json
"static_config": {
    "phrases": [
        "Please wait.",
        "Okay.",
        "Hmm."
    ],
    "selection_rule": "shuffle"
}
```
        - `properties.filler_words.content.{mode}_config.phrases` (array) - List of padding phrases.
> - Supports up to 100 pad words.
> - The length of each pad word shall not exceed 50 Chinese characters or 50 English words.
          - `properties.filler_words.content.{mode}_config.phrases.items` (string)
No schema.
        - `properties.filler_words.content.{mode}_config.selection_rule` (string) - Pad word selection rules support the following values:
- `"shuffle"`: randomly shuffle. Before all the pad words have been used in a round, the used pad words will not be broadcast again; only after all the pad words have been broadcast, they will be randomly shuffled again and a new round will start.
- `"round_robin"`: Polling. Select and broadcast sequentially from the list of pad words. After all the pad words have been broadcast for one round, a new cycle of broadcasting begins.
No schema.
  - `properties.parameters` (object) - Agent parameter configuration.
    - `properties.parameters.silence_config` (object) - Agent silent settings.
      - `properties.parameters.silence_config.timeout_ms` (integer) - The maximum silent time of the agent (ms), the value range is [0,60000]. After the agent is successfully created and the user joins the channel, the duration during which the agent is not listening, thinking or speaking is called the agent silent time. After the silent time reaches the set value, the agent will broadcast a silent prompt message. This feature can be used to have the agent remind the user when they are inactive.
- Set to `0` (default): disables this feature.
- When set to `(0,60000]`, `content` must be set at the same time to properly broadcast the silent prompt, otherwise the setting is invalid.
No schema.
      - `properties.parameters.silence_config.action` (string) - After the silent time reaches the set value, the behavior taken by the agent can be set to the following values:
- `"speak"`: (default) uses the TTS module to speak the silent prompt content (`content`).
- `"think"`: Append the silent prompt content (`content`) to the end of the context and pass it to LLM.
No schema.
      - `properties.parameters.silence_config.content` (string) - The content of the silent prompt message. The content of the settings will be used in different ways depending on the settings in `action`.
No schema.
    - `properties.parameters.farewell_config` (object) - The agent gracefully hangs up settings.
      - `properties.parameters.farewell_config.graceful_enabled` (boolean) - Whether to enable graceful exit (Graceful Leave) function:
- `true`: enabled. After enabling it, call the [POST Stop Conversational Agent](/doc/convoai/restful/convoai/operations/stop-agent) interface. When the agent exits the channel, it will ensure that the agent is in a silent state (`IDLE`) before leaving the channel.
- `false`: (Default) Not enabled.
No schema.
      - `properties.parameters.farewell_config.graceful_timeout_seconds` (integer) - The graceful exit timeout (s) represents the maximum time to wait for the agent to enter the silent state (`IDLE`) before exiting the channel. After this time is exceeded, the agent will exit the channel immediately even if it is not in the silent state. This field only takes effect when `graceful_enabled` is `true`, and the value range is [0,120].
No schema.
    - `properties.parameters.data_channel` (string) - Agent data transmission channel, optional following values:
- `rtm`: Use RTM transport. This configuration only takes effect when `advanced_features.enable_rtm` is `true`. 
- `datastream`: (Default) Use RTC's [`DataStream`](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_datastream#callback_irtcengineeventhandler_onstreammessage) transmission.
No schema.
    - `properties.parameters.enable_metrics` (boolean) - Whether to receive agent performance data:
- `true`: receive.
- `false`: (Default) Do not receive.

This configuration only takes effect when `advanced_features.enable_rtm` is `true`. You can refer to [Listening to Agent Events](/doc/convoai/restful/user-guides/listen-agent-events) to learn how to use client components to receive agent performance data, or refer to [Receiving Webhook Events](/doc/convoai/restful/webhook/enable-ncs) to learn how to use Webhook to receive agent performance data.
No schema.
    - `properties.parameters.enable_error_message` (boolean) - Whether to receive agent error events:
- `true`: receive.
- `false`: (Default) Do not receive.

This configuration only takes effect when `advanced_features.enable_rtm` is `true`. You can refer to [Listening to Agent Events](/doc/convoai/restful/user-guides/listen-agent-events) to learn how to use client components to receive agent error events.
No schema.

## Responses

### 200

- If the returned status code is `200`, the request is successful. The response body contains the results of this request.
- If the returned status code is not `200`, it means the request failed. The response package body contains the error category and description. You can refer to [Response Status Code](https://doc.shengwang.cn/doc/convoai/restful/api/response-code) to learn about possible causes.

- `agent_id` (string) - The unique identifier of the agent.
No schema.
- `create_ts` (integer) - Agent creation timestamp.
No schema.
- `status` (string) - Agent running status:
- `IDLE` (0): Agent in idle state.
- `STARTING` (1): The agent being started.
- `RUNNING` (2): The running agent.
- `STOPPING` (3): Stopping agent.
- `STOPPED` (4): Agent that has finished exiting.
- `RECOVERING` (5): The recovering agent.
- `FAILED` (6): Agent that failed to execute.
No schema.
