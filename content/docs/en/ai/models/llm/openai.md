---
title: OpenAI
description: Integrate an OpenAI LLM into Conversational AI Engine.
---
OpenAI provides frontier models ranging from lightweight to high-capability.

### Use a preset

To use an OpenAI LLM with an Agora managed key, specify one of the following presets in the [`preset`](../../../api-reference/conversational-ai/rest-api/agent/join.md#preset) field when starting an agent:

- `openai_gpt_4o_mini`
- `openai_gpt_4_1_mini`
- `openai_gpt_5_nano`
- `openai_gpt_5_mini`

When using a preset, `url`, `api_key`, and `model` are not required. You can still use the `llm` field to configure additional settings such as `system_messages` and `greeting_message`. To use a model not listed above, or to provide your own API key, see [Sample configuration](#sample-configuration).

### Sample configuration

The following examples show a starting `llm` parameter configuration you can use when you [Start a conversational AI agent](../../../api-reference/conversational-ai/rest-api/agent/join.md). 

### Use a preset model

```json
"name": "unique_name",
"preset": "openai_gpt_4o_mini",
"properties": {
  // ...
  "llm": {
    "system_messages": [
      {
        "role": "system",
        "content": "You are a helpful chatbot."
      }
    ],
    "max_history": 32,
    "greeting_message": "Hello, how can I assist you?",
    "failure_message": "Please hold on a second."
  }
}
```

### Use your own API key (BYOK)

```json
"llm": {
    "url": "https://api.openai.com/v1/chat/completions",
    "api_key": "<your_llm_key>",
    "system_messages": [
      {
        "role": "system",
        "content": "You are a helpful chatbot."
      }
    ],
    "max_history": 32,
    "greeting_message": "Hello, how can I assist you?",
    "failure_message": "Please hold on a second.",
    "params": {
      "model": "gpt-4o-mini"
    }
  }
```

### Key parameters

The following parameters are required when using your own API key (BYOK). They are not required when using a preset.

    
  Create or manage your API key from [OpenAI organization settings](https://platform.openai.com/settings/organization/api-keys).
  
    
  Use the completions endpoint.
  
    
      
    Refer to [OpenAI models](https://platform.openai.com/docs/models) for available models.
    
  

For complete `llm` configuration options, see [LLM parameters](../../../api-reference/conversational-ai/rest-api/agent/join.md#properties-llm). For OpenAI-specific options and model capabilities, see the [OpenAI API documentation](https://platform.openai.com/docs/api-reference/chat).
