---
title: Query agent status
description: Get the current state information of the specified agent instance.
---
Use this endpoint to get the current status of the specified conversational AI agent instance.

## Request

### Path parameters

  The App ID of the project.

  The agent instance ID you obtained after successfully calling `join` to [Start a conversational AI agent](join.md).

## Response

- If the returned status code is `200`, the request was successful. The response body contains the result of the request.

  
    
      Request message.
    
    
    
      Agent creation timestamp.
    

    
      Agent stop timestamp.
    
    
    
      The agent name provided when calling [Start a conversational AI agent](join.md). Unique within a channel.
    

    
      Current status.
        `IDLE` (0): Agent is idle.
        `STARTING` (1): The agent is being started.
        `RUNNING` (2): The agent is running.
        `STOPPING` (3): The agent is stopping.
        `STOPPED` (4): The agent has exited.
        `RECOVERING` (5): The agent is recovering.
        `FAILED` (6): The agent failed to execute.
    

    
      Unique id of the agent instance
    
  

- If the returned status code is not `200`, the request failed. The response body includes the `detail` and `reason` for failure. Refer to [status codes](../status-codes.md#response-status-codes) to understand the possible reasons for failure.
      

This endpoint requires [authentication](../authentication.md).

  
    
```bash tab="Curl"
      curl --request get \
      --url https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId \
      --header 'Authorization: Basic <credentials>'
```

```python tab="Python"
    import requests

    url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId"
    headers = {"Authorization": "Basic <credentials>"}

    response = requests.get(url, headers=headers)
    print(response.text)
```

```js tab="Node.js"
    const axios = require("axios");

    const url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId";
    const headers = { Authorization: "Basic <credentials>" };

    axios.get(url, { headers })
      .then(response => console.log(response.data))
      .catch(error => console.error(error.response ? error.response.data : error.message));
```
  ```json
  {
    "message": "agent exits with reason: xxxx",
    "start_ts": 1735035893,
    "stop_ts": 1735035900,
    "status": "FAILED",
    "name": "support_agent_001",
    "agent_id": "1NT29X11GQSxxxxxNU80BEIN56XF"
  }
  ```
