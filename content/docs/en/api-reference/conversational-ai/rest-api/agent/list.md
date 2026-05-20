---
title: Retrieve a list of agents
description: Retrieve a list of agents that meet the specified conditions.
---
Get a list of conversational AI agents that meet the specified conditions.

## Request

### Path parameters

  The App ID of the project.

### Query parameters

  The channel to query for a list of agents.

  The start timestamp (in seconds) for the query.

  
  The end timestamp (in seconds) for the query. 

  The agent state to filter by. Only one state can be specified per query:
  <ul>
    <li>`IDLE` (0): Agent is idle.</li>
    <li>`STARTING` (1): The agent is being started.</li>
    <li>`RUNNING` (2): The agent is running.</li>
    <li>`STOPPING` (3): The agent is stopping.</li>
    <li>`STOPPED` (4): The agent has exited.</li>
    <li>`RECOVERING` (5): The agent is recovering.</li>
    <li>`FAILED` (6): The agent failed to execute.</li>
  </ul>

  The maximum number of entries returned per page.

  The paging cursor, indicating the starting position (`agent_id`) of the next page of results.

## Response

- If the returned status code is `200`, the request was successful. The response body contains the result of the request.

  
    
      Agent data.

      
      	The number of agents returned.
      
      
      	A list of agents that meets the criteria.

        
      		Agent creation timestamp.
        
        
      		The current state of the agent.
        
        
      			The agent ID.
                        
      
    
    
    
      Returns meta information about the list.

      
        	Paging cursor.
      
      
          The total number of agents that meet the query conditions.
             
    
    
    
    Request status.
     
  

- If the returned status code is not `200`, the request failed. The response body includes the `detail` and `reason` for failure. Refer to [status codes](../status-codes.md#response-status-codes) to understand the possible reasons for failure.
      

This endpoint requires [authentication](../authentication.md).

  
    
### curl

      ```bash
      curl --request get \
        --url 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents?state=2&limit=20' \
        --header 'Authorization: Basic <credentials>'
      ```
    
    
### Python

    ```python
    import requests

    url = 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents'
    params = {
        'state': '2',
        'limit': '20'
    }
    headers = {
        'Authorization': 'Basic <credentials>'
    }

    response = requests.get(url, headers=headers, params=params)

    print(response.status_code)
    print(response.json())  # Or response.text if it's not JSON
    ```
    

    
### Node.js

    ```js
    const url = 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents?state=2&limit=20';

    const options = {
      method: 'GET',
      headers: {
        'Authorization': 'Basic <your_base64_encoded_credentials>'
      }
    };

    fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error(err));
    ```
    
  

  ```json
  {
    "data": {
      "count": 1,
      "list": [
        {
          "start_ts": 1735035893,
          "status": "RUNNING",
          "agent_id": "1234567890ABCDE1CVGZNU80BEIN56XF"
        }
      ]
    },
    "meta": {
      "cursor": "",
      "total": 1
    },
    "status": "ok"
  }
  ```
