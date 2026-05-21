---
title: Broadcast a message using TTS
description: Broadcast a custom message using the TTS module.
---
Use this endpoint to broadcast a custom message using the TTS module.

During a conversation with a conversational AI agent, call this endpoint to immediately broadcast a custom message using the TTS module. Upon receiving the request, Conversational AI Engine interrupts the agent’s speech and thought process to deliver the message. This broadcast can be interrupted by human voice.

> **Info**
> The speak API is not supported when using `mllm` configuration.

## Request

### Path parameters

  The App ID of the project.

  The agent instance ID you obtained after successfully calling `join` to [Start a conversational AI agent](join.md).

### Request body

<div className="api-mime-type">APPLICATION/JSON</div>

  
    The broadcast message text. The maximum length of the text content is 512 bytes.
  
  
    Sets the priority of the message broadcast.

    - `INTERRUPT`: High priority. The agent immediately interrupts the current interaction to announce the message.
    - `APPEND`: Medium priority. The agent announces the message after the current interaction ends.
    - `IGNORE`: Low priority. If the agent is busy interacting, it ignores and discards the broadcast; the message is only announced if the agent is not interacting.
  
  
    Whether to allow users to interrupt the agent's broadcast by speaking:
    - `true`: Allow
    - `false`: Don't allow
    

## Response

- If the returned status code is `200`, the request was successful. The response body is empty, and the agent starts to broadcast the specified message.

  
    
      Unique id of the agent instance.
    
    
    
      The name of the channel.
    

    
      Agent creation timestamp.
    
      

- If the returned status code is not `200`, the request failed. The response body includes the error code and description. Refer to [status codes](../status-codes.md#response-status-codes) to understand the possible reasons for failure.
    

This endpoint requires [authentication](../authentication.md).

  
    
```bash tab="Curl"
      curl --request post \
        --url https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/speak \
        --header 'Authorization: Basic <credentials>' \
        --data '
      {
        "text": "Sorry, the conversation content is not compliant.",
        "priority": "INTERRUPT",
        "interruptable": false
      }'
```

```python tab="Python"
    import requests

    url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/speak"

    payload = {
        "text": "Sorry, the conversation content is not compliant.",
        "priority": "INTERRUPT",
        "interruptable": False
    }
    headers = {"Authorization": "Basic <credentials>"}

    response = requests.request("post", url, json=payload, headers=headers)

    print(response.text)
```

```js tab="Node.js"
    const url = 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/speak';
    const options = {
      method: 'post',
      headers: { Authorization: 'Basic <credentials>' },
      body: JSON.stringify({
        text: 'Sorry, the conversation content is not compliant.',
        priority: 'INTERRUPT',
        interruptable: false
      })
    };

    fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error(err));
```
  ```json
  {
    "agent_id": "1NT29XxxxxxxxxELWEHC8OS",
    "channel": "test_channel",
    "start_ts": 1744877089
  }
  ```
