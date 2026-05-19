---
title: MiniMax
---
MiniMax provides text-to-speech (TTS) with multiple voice styles and low-latency streaming output.

### Use a preset

To use MiniMax TTS with an Agora managed key, specify one of the following presets in the [`preset`](../../../api-reference/conversational-ai/rest-api/agent/join.md#preset) field when starting an agent:

- `minimax_speech_2_6_turbo`
- `minimax_speech_2_8_turbo`

When using a preset, you do not need to provide the API key, group ID, model, or endpoint URL. You can still use the `tts` field to configure additional settings such as `voice_setting`. To use a model not listed above, or to provide your own API key, see [Sample configuration](#sample-configuration).

### Sample configuration

The following example shows a starting `tts` parameter configuration you can use when you [Start a conversational AI agent](../../../api-reference/conversational-ai/rest-api/agent/join.md).

### Use a preset model

```json
"preset": "minimax_speech_2_8_turbo",
"properties": {
  //...
  "tts": {
    "params": {
      "voice_setting": {
        "voice_id": "English_captivating_female1"
      }
    }
  }
}
```

### Use your own API key (BYOK)

```json
"tts": {
  "vendor": "minimax",
  "params": {
    "key": "<minimax_key>",
    "group_id": "<minimax_group_id>",
    "model": "speech-02-turbo",
    "voice_setting": {
      "voice_id": "English_captivating_female1"
    },
    "url": "wss://api-uw.minimax.io/ws/v1/t2a_v2"
  }
}
```

> **Caution**
> The parameters listed on this page are validated for use with Conversational AI Engine. Required parameters must be provided as documented. Any additional parameters are passed through directly to the underlying vendor without validation. For a full list of supported options, refer to the [MiniMax documentation](https://www.minimax.io/platform/document/t2a_http).

  
    The MiniMax API key used to authenticate requests. You must provide a valid key for the service to function.
  
  
    The MiniMax group identifier. This is required for your account’s configuration.
  
  
    The TTS model to use. For example, `speech-02-turbo`.
  
  
    The voice style identifier to use. For example, `English_captivating_female1`.
  
  
    The WebSocket endpoint for streaming TTS output. For example, `wss://api-uw.minimax.io/ws/v1/t2a_v2`.
