---
title: Deepgram
---
Deepgram provides fast, accurate automatic speech recognition with advanced AI models optimized for real-time streaming and conversational applications across multiple languages.

### Use a preset

To use Deepgram ASR with an Agora managed key, specify one of the following presets in the [`preset`](../../../api-reference/conversational-ai/rest-api/agent/join.md#preset) field when starting an agent:

- `deepgram_nova_2`
- `deepgram_nova_3`

When using a preset, you do not need to provide the API key, endpoint URL, or model. You can still use the `asr` field to configure additional settings such as `language` and `keyterm`. To provide your own API key, see [Sample configuration](#sample-configuration).

### Sample configuration

The following example shows a starting `asr` parameter configuration you can use when you [Start a conversational AI agent](../../../api-reference/conversational-ai/rest-api/agent/join.md).

### Use a preset model

```json
"name": "unique_name",
"preset": "deepgram_nova_3",
"properties": {
  // ...
  "asr": {
    "language": "en-US",
    "keyterm": "term1%20term2"
  }
}
```

### Use your own API key (BYOK)

```json
"asr": {
  "vendor": "deepgram",
  "params": {
    "url": "wss://api.deepgram.com/v1/listen",
    "key": "<deepgram_key>",
    "model": "nova-3",
    "language": "en",
    "keyterm": "term1%20term2"
  }
}
```

### Key parameters

   
 The WebSocket URL for Deepgram's streaming API. 
 
 
 The API key used for authentication. Get your API key from the [Deepgram Console](https://console.deepgram.com/).
 
 
 The speech recognition model to use. 
 
   
 The language code for speech recognition (For example, `en`, `es`, `fr`). See [supported languages](https://developers.deepgram.com/docs/models-languages-overview) for language codes.
 
   
 Boost specialized terms and brands. Only compatible with the `nova-3` model.
 

The parameters listed on this page are validated for use with Conversational AI Engine. Required parameters must be provided as documented. Any additional parameters are passed through directly to the underlying vendor without validation. For advanced configuration options, model selection, and detailed parameter descriptions, see the [Deepgram API documentation](https://developers.deepgram.com/docs/getting-started-with-live-streaming-audio).

> **Caution**
> The following parameters are not passed through and instead use default values set by Agora:
> - `callback`
> - `callback_method`
> - `channels`
> - `encoding`
> - `multichannel`
> - `sample_rate`
