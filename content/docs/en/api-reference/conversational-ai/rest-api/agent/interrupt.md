---
title: Interrupt the agent
description: Interrupt an agent while speaking or thinking.
---
Use this endpoint to interrupt the specified agent while speaking or thinking.

## Request

### Path parameters

  The App ID of the project.

  The agent instance ID you obtained after successfully calling `join` to [Start a conversational AI agent](join.md).

### Request body

<div className="api-mime-type">APPLICATION/JSON</div>

The request body is empty.

## Response

- If the returned status code is `200`, the request was successful. The response body contains agent information and the agent stops talking and thinking immediately.

- If the returned status code is not `200`, the request failed. The response body includes the error code and description. Refer to [status codes](../status-codes.md#response-status-codes) to understand the possible reasons for failure.
   

This endpoint requires [authentication](../authentication.md).

  
    
```bash tab="Curl"
      curl --request post \
        --url https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/interrupt \
        --header 'Authorization: Basic <credentials>' \
        --data '{}'     
```

```python tab="Python"
    import requests

    url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/interrupt"

    payload = {}
    headers = {"Authorization": "Basic <credentials>"}

    response = requests.request("post", url, json=payload, headers=headers)

    print(response.text)
```

```js tab="Node.js"
    const url = 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/interrupt';
    const options = {
      method: 'post',
      headers: {Authorization: 'Basic <credentials>'},
      body: JSON.stringify({})
    };

    fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error(err)); 
```
