---
title: Update agent configuration
description: Adjust Conversation AI Engine parameters at runtime.
---
Use this endpoint to adjust conversational AI agent instance parameters at runtime.

## Request

### Path parameters

  The App ID of the project.

  The agent instance ID you obtained after successfully calling `join` to [Start a conversational AI agent](join.md).

### Request body

<div className="api-mime-type">APPLICATION/JSON</div>

  
    
      The authentication token used by the agent to join the channel.
    
    
      Large Language Model (LLM) settings.
      
        A set of predefined messages appended to the beginning of each LLM request. These messages help control the LLM’s output and can include role definitions, prompts, response examples, and more. This field must be compatible with the OpenAI protocol.
      
      
        Additional LLM information included in the message body, such as the model used, the maximum number of tokens, and more. Supported configurations vary by LLM provider. Refer to the provider’s documentation for details.
        > **Info**
> Updating this field overwrites the configuration set when the agent was created. When updating, make sure to pass the complete `params` field.
      
    
    
      Multimodal Large Language Model (MLLM) configuration for real-time audio and text processing.
      
        Additional MLLM configuration parameters.
        See [MLLM Overview](../../../../ai/models/mllm/index.md) for details.
      
    
    

## Response

- If the returned status code is `200`, the request was successful. The response body contains the result of the request.

  
    
      Unique id of the agent instance
    
    
    
      Timestamp of when the agent was created
    
    
    
      Current status.
      <ul>
        <li>`IDLE` (0): Agent is idle.</li>
        <li>`STARTING` (1): The agent is being started.</li>
        <li>`RUNNING` (2): The agent is running.</li>
        <li>`STOPPING` (3): The agent is stopping.</li>
        <li>`STOPPED` (4): The agent has exited.</li>
        <li>`RECOVERING` (5): The agent is recovering.</li>
        <li>`FAILED` (6): The agent failed to execute.</li>
      </ul>
    
  

- If the returned status code is not `200`, the request failed. The response body includes the `detail` and `reason` for failure. Refer to [status codes](../status-codes.md#response-status-codes) to understand the possible reasons for failure.
      

This endpoint requires [authentication](../authentication.md).

  
    
### curl

      ```bash
      curl --request post \
        --url https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/update \
        --header 'Authorization: Basic <credentials>' \
        --data '
      {
        "properties": {
          "token": "007eJxTYxxxxxxxxxxIaHMLAAAA0ex66",
          "llm": {
            "system_messages": [
              {
                "role": "system",
                "content": "You are a helpful assistant. xxx"
              },
              {
                "role": "system",
                "content": "Previously, user has talked about their favorite hobbies with some key topics: xxx"
              }
            ],
            "params": {
              "model": "abab6.5s-chat",
              "max_token": 1024
            }
          }
        }
      }'   
      ```
    
    
### Python

    ```python
    import requests
    import json

    url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/{appid}/agents/{agentId}/update"
    headers = {
      "Authorization": "Basic <credentials>",
      "Content-Type": "application/json"
    }

    data = {
      "properties": {
          "token": "007eJxTYxxxxxxxxxxIaHMLAAAA0ex66",
          "llm": {
              "system_messages": [
                  {
                      "role": "system",
                      "content": "You are a helpful assistant. xxx"
                  },
                  {
                      "role": "system", 
                      "content": "Previously, user has talked about their favorite hobbies with some key topics: xxx"
                  }
              ],
              "params": {
                  "model": "abab6.5s-chat",
                  "max_token": 1024
              }
          }
      }
    }

    response = requests.post(url, headers=headers, json=data)
    print(response.status_code)
    print(response.json())
    ```
    

    
### Node.js

    ```js
    const fetch = require('node-fetch');

    const url = 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/update';

    const headers = {
      'Authorization': 'Basic <credentials>',
      'Content-Type': 'application/json'
    };

    const data = {
      properties: {
          token: "007eJxTYxxxxxxxxxxIaHMLAAAA0ex66",
          llm: {
              system_messages: [
                  {
                      role: "system",
                      content: "You are a helpful assistant. xxx"
                  },
                  {
                      role: "system",
                      content: "Previously, user has talked about their favorite hobbies with some key topics: xxx"
                  }
              ],
              params: {
                  model: "abab6.5s-chat",
                  max_token: 1024
              }
          }
      }
    };

    fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
    
  

  ```json
  {
    "agent_id": "1NT29X10YHxxxxxWJOXLYHNYB",
    "create_ts": 1737123456,
    "status": "RUNNING"
  }
  ```
