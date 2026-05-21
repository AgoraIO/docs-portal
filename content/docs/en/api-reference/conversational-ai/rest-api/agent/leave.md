---
title: Stop a conversational AI agent
description: Stop the specified conversational agent instance.
---
Use this endpoint to stop the specified conversational AI agent instance.

## Request

### Path parameters

  The App ID of the project.

  The agent instance ID you obtained after successfully calling `join` to [Start a conversational AI agent](join.md).

## Response

- If the returned status code is `200`, the request was successful. The response body is empty.

- If the returned status code is not `200`, the request failed. The response body includes the error code and description. Refer to [status codes](../status-codes.md#response-status-codes) to understand the possible reasons for failure.

This endpoint requires [authentication](../authentication.md).

  
    
```bash tab="Curl"
      curl --request post \
        --url https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentid/leave \
        --header 'Authorization: Basic <your_base64_encoded_credentials>'
```

```python tab="Python"
    import requests

    url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/leave"

    headers = {
        "Authorization": "Basic <your_base64_encoded_credentials>",
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers)
    print(response.text)
```

```js tab="Node.js"
    const url = 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/leave';

    const options = {
      method: 'POST',
      headers: {
        'Authorization': 'Basic <your_base64_encoded_credentials>',
        'Content-Type': 'application/json'
      }
    };

    fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error(err));
```
