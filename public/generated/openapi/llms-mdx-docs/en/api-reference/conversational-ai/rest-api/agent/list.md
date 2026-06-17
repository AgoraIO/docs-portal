# Retrieve a list of agents (/en/api-reference/conversational-ai/rest-api/agent/list)

Retrieve a list of agents that match specified criteria.
> This interface only supports querying the list of agents created within the last 7 days.

- OpenAPI: /openapi/conversational-ai/convoai.en.yaml
- Operation ID: get-agent-list
- Method: GET
- Path: /v2/projects/{appid}/agents

## Servers

- https://api.agora.io/cn/api/conversational-ai-agent

## Parameters

- `Authorization` (header, required) - When sending an HTTP request, you need to choose one of the following authentication methods: <ol><li>** (Recommended) Use RTC Token**: Fill in the `Authorization` field with the RTC Token used by the Agora conversational AI engine project. You can choose the following methods to obtain Token: <ul><li>In the test environment, you can generate a temporary Token (valid for 24 hours) for your project from [Shengwang Console](https://console.shengwang.cn/). </li><li>In a production environment, you can refer to [Using Token Authentication](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication) to deploy the Token server to generate Token. </li></ul>Example of passing parameters: `Authorization: agora token="007abcxxxxxxx123"`</li><li>**Use Basic Auth**: Refer to [Implementing HTTP security authentication](https://doc.shengwang.cn/doc/convoai/restful/user-guides/http-basic-auth#Use-http-basic authentication) to generate the Base64-encoded `Authorization` field. <br/>Parameter passing example: `Authorization: Basic NDI1OTQ3N2I4MzYy...YwZjA=`</li></ol>
- `appid` (path, required) - [App ID](http://doc.shengwang.cn/doc/convoai/restful/get-started/enable-service#%E8%8E%B7%E5%8F%96-app-id) used by your project.
- `channel` (query, optional) - Query the list of agents under the specified channel name.
- `from_time` (query, optional) - Query list start timestamp (s), default is 1 day ago.
- `to_time` (query, optional) - Query list end timestamp (s), default is the current time.
- `state` (query, optional) - Specify the status of the agent to be queried. A single query does not support specifying multiple states: <li>`IDLE` (0): Agent in idle state. </li><li>`STARTING` (1): The agent being started. </li><li>`RUNNING` (2): Running agent. </li><li>`STOPPING` (3): Stopping agent. </li><li>`STOPPED` (4): Agent that has completed exit. </li><li>`RECOVERING` (5): The recovering agent. </li><li>`FAILED` (6): Agent that failed to execute. </li>
- `limit` (query, optional) - Paginate to obtain the maximum number of items returned at a time.
- `cursor` (query, optional) - The paging cursor is the `agent_id` of the starting position of paging.

## Request body

No request body.

## Responses

### 200

- If the returned status code is `200`, the request is successful. The response body contains the results of this request.
- If the returned status code is not `200`, it means the request failed. The response package body contains the error category and description. You can refer to [Response Status Code](https://doc.shengwang.cn/doc/convoai/restful/api/response-code) to learn about possible causes.

- `data` (object)
  - `data.count` (integer) - The number of agents returned this time.
No schema.
  - `data.list` (array) - List of agents that meet the conditions.
    - `data.list.items` (object)
      - `data.list.items.start_ts` (integer) - Agent creation timestamp.
No schema.
      - `data.list.items.status` (string) - Agent running status:
- `IDLE` (0): Agent in idle state.
- `STARTING` (1): The agent being started.
- `RUNNING` (2): The running agent.
- `STOPPING` (3): Stopping agent.
- `STOPPED` (4): Agent that has finished exiting.
- `RECOVERING` (5): The recovering agent.
- `FAILED` (6): Agent that failed to execute.
No schema.
      - `data.list.items.agent_id` (string) - The unique identifier of the agent.
No schema.
- `meta` (object) - Returns the meta information of the list.
  - `meta.cursor` (string) - Pagination cursor.
No schema.
  - `meta.total` (integer) - The total number of agents that meet the query conditions.
No schema.
- `status` (string) - Request status.
No schema.
