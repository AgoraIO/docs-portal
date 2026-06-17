# Query conversation turn information (/en/api-reference/conversational-ai/rest-api/agent/turns)

After the session with the agent ends, call this interface to query the dialogue round information of this session, including the start information, end information, and performance indicators of each dialogue round.
> Only supports querying sessions within 7 days.

- OpenAPI: /openapi/conversational-ai/convoai.en.yaml
- Operation ID: get-turns
- Method: GET
- Path: /v2/projects/{appid}/agents/{agentId}/turns

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

- `Authorization` (header, required) - When sending an HTTP request, you need to choose one of the following authentication methods: <ol><li>** (Recommended) Use RTC Token**: Fill in the `Authorization` field with the RTC Token used by the Agora conversational AI engine project. You can choose the following methods to obtain Token: <ul><li>In the test environment, you can generate a temporary Token (valid for 24 hours) for your project from [Shengwang Console](https://console.shengwang.cn/). </li><li>In a production environment, you can refer to [Using Token Authentication](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication) to deploy the Token server to generate Token. </li></ul>Example of passing parameters: `Authorization: agora token="007abcxxxxxxx123"`</li><li>**Use Basic Auth**: Refer to [Implementing HTTP security authentication](https://doc.shengwang.cn/doc/convoai/restful/user-guides/http-basic-auth#Use-http-basic authentication) to generate the Base64-encoded `Authorization` field. <br/>Parameter passing example: `Authorization: Basic NDI1OTQ3N2I4MzYy...YwZjA=`</li></ol>
- `appid` (path, required) - [App ID](http://doc.shengwang.cn/doc/convoai/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id) used by your project.
- `agentId` (path, required) - Agent instance ID, which is the unique identifier of the agent. After calling [POST to create a conversational agent](https://doc.shengwang.cn/doc/convoai/restful/convoai/operations/start-agent) successfully, it will be obtained in the response package body.

## Request body

No request body.

## Responses

### 200

- If the returned status code is `200`, the request is successful. The response body contains the results of this request.
- If the returned status code is not `200`, it means the request failed. The response package body contains the error category and description. You can refer to [Response Status Code](https://doc.shengwang.cn/doc/convoai/restful/api/response-code) to learn about possible causes.

- `turns` (array) - List of dialogue turns.
  - `turns.items` (object)
    - `turns.items.agent_id` (string) - The unique identifier of the agent.
No schema.
    - `turns.items.channel` (string) - Conversation channel name.
No schema.
    - `turns.items.turn_id` (integer) - Conversation turn ID, starting from 1 and increasing.
No schema.
    - `turns.items.start` (object) - Round start message.
      - `turns.items.start.start_at` (integer) - Start timestamp, UTC time in milliseconds.
No schema.
      - `turns.items.start.type` (string) - Start type:
- `voice_input`: Started by user voice input.
- `greeting`: starts when the agent broadcasts a greeting.
- `silence_timeout`: Started due to agent silence timeout.
- `api_speak`: Started by calling the [Report custom information](/doc/convoai/restful/convoai/operations/agent-speak) interface to broadcast information.
No schema.
      - `turns.items.start.metadata` (object) - Broadcast custom information with additional metadata.
        - `turns.items.start.metadata.speech_duration_ms` (integer) - Voice duration (ms).
No schema.
        - `turns.items.start.metadata.interrupt_duration_ms` (integer) - Vocal duration threshold (ms) when the agent is idle or listening.
No schema.
        - `turns.items.start.metadata.greeting_nth` (integer) - Number of times the greeting has been played.
No schema.
        - `turns.items.start.metadata.action` (string) - - `speak`: broadcast the silent prompt content.
- `think`: Append the silent prompt content to the end of the context and pass it to LLM.
No schema.
        - `turns.items.start.metadata.transport` (string) - Transport protocol:
- `http`: HTTP protocol.
- `rtm`: transmitted via RTM Presence channel.
No schema.
    - `turns.items.end` (object) - Round end message.
      - `turns.items.end.end_at` (integer) - End timestamp, UTC time in milliseconds.
No schema.
      - `turns.items.end.type` (string) - Round end type:
- `ok`: End normally.
- `interrupted`: interrupted.
- `ignored`: ignored.
- `error`: execution error.
No schema.
      - `turns.items.end.metadata` (object) - Error attaching metadata.
        - `turns.items.end.metadata.playback_duration_ms` (integer) - Voice playback duration (ms).
No schema.
        - `turns.items.end.metadata.caused_by` (string) - Reasons for round ignoring:
- `semantic`: After turning on the graceful interruption function (`turn_detection.config.end_of_speech.mode` is `semantic`) when [creating a conversational agent](/doc/convoai/restful/convoai/operations/start-agent), it is ignored because the semantic rules determine that no response is required.
- `keywords`: After turning on the keyword-based dialogue start detection function (`turn_detection.config.start_of_speech.mode` is `keywords`) when [Creating a conversational agent](/doc/convoai/restful/convoai/operations/start-agent), the round of dialogue is ignored due to missing keywords in the round start detection.
- `disable`: Because the dialogue round detection function is set to uninterruptible, this round of dialogue is ignored.
No schema.
        - `turns.items.end.metadata.transport` (string) - Transport protocol (returned when `caused_by` is `api_speak` or `api_interrupt`):
- `http`: HTTP protocol.
- `rtm`: transmitted via RTM Presence channel.
No schema.
        - `turns.items.end.metadata.reason` (string) - Error type, may contain the following values:
- `LLM_REQUEST_ERR`: LLM request error.
- `INTERNAL_ERR`: Internal error.
No schema.
        - `turns.items.end.metadata.details` (string) - Error details.
No schema.
    - `turns.items.metrics` (object) - Dialogue turn performance metric details.
      - `turns.items.metrics.e2e_latency_ms` (integer) - Total end-to-end latency (ms).
No schema.
      - `turns.items.metrics.segmented_latency_ms` (array) - List of segment latency metric details.
        - `turns.items.metrics.segmented_latency_ms.items` (object)
          - `turns.items.metrics.segmented_latency_ms.items.name` (string) - When the LLM input mode is `audio`, the returned delay module is:
  - `algorithm_processing`: algorithm processing delay.
  - `asr_ttlw`: The ttlw (Time To Last Word) indicator of the ASR module, which represents the delay time from detecting the end of the user's speaking to ASR outputting the last word.
  - `llm_ttfa`: The ttfa (Time To First Audio to First Byte) indicator of the LLM module, which represents the delay time from the end of the user speaking to the LLM outputting the first audio byte to the TTS module receiving the first audio byte.
  - `transport`: network transmission delay (ms). Currently, this field is not returned when the user uses the RTC Web SDK.
No schema.
          - `turns.items.metrics.segmented_latency_ms.items.latency` (integer) - Delay time (ms).
No schema.
