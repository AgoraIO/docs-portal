# Stop a conversational AI agent (/en/api-reference/conversational-ai/rest-api/agent/leave)

Stops the specified conversational agent instance and causes the agent to exit the RTC channel.

- OpenAPI: /openapi/conversational-ai/convoai.en.yaml
- Operation ID: stop-agent
- Method: POST
- Path: /v2/projects/{appid}/agents/{agentId}/leave

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

- If the returned status code is `200`, the request is successful. The response body is empty.
- If the returned status code is not `200`, it means the request failed. The response package body contains the error category and description. You can refer to [Response Status Code](https://doc.shengwang.cn/doc/convoai/restful/api/response-code) to learn about possible causes.

No schema.
