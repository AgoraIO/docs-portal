---
title: Retrieve agent history
description: Get the history of the conversation between the user and the agent.
---
Call this endpoint while the agent is running to retrieve the conversation history between the user and the conversational AI agent.

## Request

### Path parameters

  The App ID of the project.

  The agent instance ID you obtained after successfully calling `join` to [Start a conversational AI agent](join.md).

## Response

- If the returned status code is `200`, the request was successful. The response body contains the result of the request.

  
    
      Unique identifier of the agent.
    
    
    
      Agent creation timestamp.
    

    
      Agent status. Only supports querying the running agent.
    

    
      Agent history.
      
        The message sender.
        - `user`: User
        - `assistant`: AI agent
      
      
        Message content.
      
    
  

- If the returned status code is not `200`, the request failed. The response body includes the error code and description. Refer to [status codes](../status-codes.md) to understand the possible reasons for failure.
      

This endpoint requires [authentication](../authentication.md).

  
    
### curl

      ```bash
      curl --request get \
        --url https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/history \
        --header 'Authorization: Basic <credentials>'
      ```
    
    
### Python

    ```python
    import requests

    url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/history"

    headers = {"Authorization": "Basic <credentials>"}

    response = requests.request("get", url, headers=headers)

    print(response.text)
    ```
    

    
### Node.js

    ```js
    const url = 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/history';
    const options = {method: 'get', headers: {Authorization: 'Basic <credentials>'}};

    fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error(err));
    ```
    
  

  ```json
  {
    "agent_id": "xxxx",
    "start_ts": 123,
    "status": "RUNNING",
    "contents": [
      {
        "role": "user",
        "content": "hello."
      },
      {
        "role": "assistant",
        "content": "hi, how can I help you?"
      }
    ]
  }
  ```
