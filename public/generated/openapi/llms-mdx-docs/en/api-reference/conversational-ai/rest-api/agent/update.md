# Update agent configuration (/en/api-reference/conversational-ai/rest-api/agent/update)

Update some parameter configurations of the specified running agent.

- OpenAPI: /openapi/conversational-ai/convoai.en.yaml
- Operation ID: agent-update
- Method: POST
- Path: /v2/projects/{appid}/agents/{agentId}/update

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

- `Authorization` (header, required) - When sending an HTTP request, you need to choose one of the following authentication methods: <ol><li>** (Recommended) Use RTC Token**: Fill in the `Authorization` field with the RTC Token used by the Agora conversational AI engine project. You can choose the following methods to obtain Token: <ul><li>In the test environment, you can generate a temporary Token (valid for 24 hours) for your project from [Shengwang Console](https://console.shengwang.cn/). </li><li>In a production environment, you can refer to [Using Token Authentication](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication) to deploy the Token server to generate Token. </li></ul>Example of passing parameters: `Authorization: agora token="007abcxxxxxxx123"`</li><li>**Use Basic Auth**: Refer to [Implementing HTTP security authentication](https://doc.shengwang.cn/doc/convoai/restful/user-guides/http-basic-auth#Use-http-basic authentication) to generate the Base64-encoded `Authorization` field. <br/>Parameter passing example: `Authorization: Basic NDI1OTQ3N2I4MzYy...YwZjA=`</li></ol>
- `appid` (path, required) - [App ID](http://doc.shengwang.cn/doc/convoai/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id) used by your project.
- `agentId` (path, required) - Agent instance ID, which is the unique identifier of the agent. After calling [POST to create a conversational agent](https://doc.shengwang.cn/doc/convoai/restful/convoai/operations/start-agent) successfully, it will be obtained in the response package body.

## Request body

- `properties` (object)
  - `properties.token` (string) - Dynamic key used for authentication. If your project has App Certificates enabled, be sure to pass your project's dynamic key in this field. For details, see [Using Token Authentication](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication).
No schema.
  - `properties.llm` (object) - Large language model (LLM) setup.
    - `properties.llm.system_messages` (array) - A set of predefined messages that are prepended every time LLM is called to control the LLM output. It can be role settings, prompt words, answer samples, etc. Requires compatibility with OpenAI protocol.
      - `properties.llm.system_messages.items` (object)
No schema.
    - `properties.llm.params` (object) - LLM additional information transmitted in the message body, such as the model used, the maximum number of Tokens, etc. Different LLM vendors support different configurations. Please refer to the corresponding documents to fill in the configuration as needed.
> After this field is updated, it will overwrite the configuration when the agent was created. When updating, make sure to pass in the complete `params` field.
No schema.

## Responses

### 200

- If the returned status code is `200`, the request is successful. The response body contains the results of this request.
- If the returned status code is not `200`, it means the request failed. The response package body contains the error category and description. You can refer to [Response Status Code](https://doc.shengwang.cn/doc/convoai/restful/api/response-code) to learn about possible causes.

- `agent_id` (string) - Agent unique identifier.
No schema.
- `create_ts` (integer) - Agent creation timestamp.
No schema.
- `state` (string) - Agent running status:
- `IDLE` (0): Agent in idle state.
- `STARTING` (1): The agent being started.
- `RUNNING` (2): The running agent.
- `STOPPING` (3): Stopping agent.
- `STOPPED` (4): Agent that has finished exiting.
- `RECOVERING` (5): The recovering agent.
- `FAILED` (6): Agent that failed to execute.
No schema.
