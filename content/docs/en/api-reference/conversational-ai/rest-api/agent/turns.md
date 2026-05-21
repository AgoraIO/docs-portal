---
title: Query conversation turn information
description: Query conversation turn information for a conversational AI agent session.
---
After a conversation with the agent ends, use this endpoint to query the conversation turn information, including the start information, end information, and performance metrics of each conversation turn.

> **Info**
> You can query sessions within the last 7 days.

## Request

### Path parameters

  The App ID of the project.

  The agent instance ID you obtained after successfully calling `join` to [Start a conversational AI agent](join.md).

## Response

- If the returned status code is `200`, the request was successful. 

  
    
      A list of conversation turns for the agent session.

      
        The unique identifier of the agent.
      
      
        The name of the RTC channel the agent joined.
      
      
        The sequential index of the turn within the session. Starts at `1`.
      
      
        Details about the start of the turn.

        
          The Unix timestamp in milliseconds (UTC time) when the turn started.
        
        
          The type of event that initiated the turn.

          - `voice_input`: The turn was initiated by user voice input.
          - `greeting`: The turn was initiated by an agent greeting.
          - `silence_timeout`: The turn was initiated due to a silence timeout.
          - `api_speak`: The turn was initiated by a call to the speak API.
        
        
          Additional context about the turn start event. Included fields depend on the value of the `type` field.

          
            The duration of the user's voice input in milliseconds. Included only when `type` is `voice_input`.
          

          
            The minimum voice duration in milliseconds required to trigger an interruption. Included only when `type` is `voice_input`.
          

          
            The index of the current greeting occurrence. Included only when `type` is `greeting`.
          

          
            The action taken in response to the silence timeout. Included only when `type` is `silence_timeout`.

            - `speak`: Plays the silence prompt message to the user.
            - `think`: Appends the silence message to the conversation context and passes it to the LLM.
          

          
            The transport protocol used to deliver the speak request. Included only when `type` is `api_speak`.

            - `http`: Delivered over HTTP.
            - `rtm`: Delivered through the RTM Presence channel.
          
        
      
      
        Details about the end of the turn.

        
          The Unix timestamp in milliseconds (UTC time) when the turn ended.
        
        
          The type of event that ended the turn. 

          - `ok`: The turn ended normally.
          - `interrupted`: The turn was interrupted.
          - `ignored`: The turn was ignored.
          - `error`: The turn ended due to an error.
        
        
          Additional context about the turn end event. Included fields depend on the value of the `type` field.

          
            The audio playback duration in milliseconds. Included only when `type` is `ok`.
          
          
            The cause of the turn ending.

            When `type` is `interrupted`, possible values are:
            - `start_of_speech`: A new voice input interrupted the turn.
            - `api_speak`: The turn was interrupted by a call to the speak API.
            - `api_interrupt`: The turn was interrupted by a call to the interrupt API.
            - `api_leave`: The turn was interrupted because the agent left the channel.

            When `type` is `ignored`, possible values are:
            - `semantic`: The turn was ignored because semantic end-of-speech detection determined no response was required. Applies when [`turn_detection.config.end_of_speech.mode`](join.md#properties-turn-detection-config-end-of-speech-mode) is set to `semantic`.
            - `keywords`: The turn was ignored because the start keyword was not detected. Applies when [`turn_detection.config.start_of_speech.mode`](join.md#properties-turn-detection-config-start-of-speech-mode) is set to `keywords`.
            - `disable`: The turn was ignored because interruption is disabled for this turn.
          
          
            The transport protocol used to deliver the request. Included only when `caused_by` is `api_speak` or `api_interrupt`.

            - `http`: Delivered over HTTP.
            - `rtm`: Delivered through the RTM Presence channel.
          
          
            The error type. Included only when `type` is `error`.

            - `LLM_REQUEST_ERR`: LLM request error.
            - `INTERNAL_ERR`: Internal error.
          
          
            Additional error details. Included only when `type` is `error`.
          
        
      
      
        Latency metrics for the turn.

        
          The end-to-end latency in milliseconds for the turn.
        
        
          A breakdown of latency by segment.

          
            The name of the latency segment.

            When the LLM input modality is `text`, the returned segments are:

            - `algorithm_processing`: Algorithm processing delay.
            - `asr_ttlw`: The ASR Time To Last Word (TTLW) in milliseconds. Represents the delay from when the user finishes speaking to when the ASR module outputs the last word.
            - `llm_ttft`: The LLM Time To First Token (TTFT) in milliseconds. Represents the delay from when the user finishes speaking to when the LLM outputs the first token.
            - `llm_ftfs`: The LLM First Token To First Sentence (FTFS) in milliseconds. Represents the delay from when the LLM outputs the first token to when it outputs the first complete sentence.
            - `tts_ttfb`: The TTS Time To First Byte (TTFB) in milliseconds. Represents the delay from when the TTS module receives a text request to when it outputs the first audio byte.
            - `transport`: Network transmission delay in milliseconds. Not returned when the user is connected using the RTC Web SDK.

            When the LLM input modality is `audio`, the returned segments are:

            - `algorithm_processing`: Algorithm processing delay.
            - `asr_ttlw`: The ASR Time To Last Word (TTLW) in milliseconds. Represents the delay from when the user finishes speaking to when the ASR module outputs the last word.
            - `llm_ttfa`: The LLM Time To First Audio Byte (TTFA) in milliseconds. Represents the delay from when the user finishes speaking to when the LLM outputs the first audio byte.
            - `transport`: Network transmission delay in milliseconds. Not returned when the user is connected using the RTC Web SDK.
          
          
            The latency in milliseconds for the segment.
          
        
      
    
  

- If the returned status code is not `200`, the request failed. The response body includes the error code and description. Refer to [status codes](../status-codes.md#response-status-codes) to understand the possible reasons for failure.

This endpoint requires [authentication](../authentication.md).

  
    
```bash tab="Curl"
      curl --request GET \
        --url https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/turns \
        --header 'Authorization: Basic <your_base64_encoded_credentials>'
```

```python tab="Python"
    import requests

    url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/turns"

    headers = {
        "Authorization": "Basic <your_base64_encoded_credentials>",
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers)
    print(response.text)
```

```js tab="Node.js"
    const url = 'https://api.agora.io/api/conversational-ai-agent/v2/projects/:appid/agents/:agentId/turns';

    const options = {
      method: 'GET',
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
  ```json
  {
    "turns": [
      {
        "agent_id": "A42Axxxxxxxxx37MT56J",
        "channel": "test_channel",
        "turn_id": 1,
        "start": {
          "start_at": 1774579820147,
          "type": "greeting",
          "metadata": {
            "greeting_nth": 1,
          }
        },
        "end": {
          "end_at": 1774579822412,
          "type": "interrupted",
          "metadata": {
            "caused_by": "api_interrupt",
            "transport": "rtm"
          }
        },
        "metrics": {
          "e2e_latency_ms": 337,
          "segmented_latency_ms": [
            {
              "name": "tts_ttfb",
              "latency": 337
            }
          ]
        }
      }
    ]
  }
  ```
