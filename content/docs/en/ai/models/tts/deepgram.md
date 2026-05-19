---
title: Deepgram (Beta)
description: Integrate Deepgram TTS into Conversational AI Engine.
---
Deepgram provides low-latency text-to-speech with a wide range of voices, optimized for real-time conversational AI applications.

### Sample configuration

The following example shows a starting `tts` parameter configuration you can use when you [Start a conversational AI agent](../../../api-reference/conversational-ai/rest-api/agent/join.md).

```json
"tts": {
  "vendor": "deepgram",
  "params": {
    "api_key": "<your_deepgram_key>",
    "base_url": "wss://api.deepgram.com/v1/speak",
    "model": "aura-2-thalia-en",
    "sample_rate": 24000
  }
}
```

> **Caution**
> The parameters listed on this page are validated for use with Conversational AI Engine. Required parameters must be provided as documented. Any additional parameters are passed through directly to the underlying vendor without validation. For a full list of supported options, refer to the [Deepgram TTS documentation](https://developers.deepgram.com/docs/text-to-speech).

### Key parameters

  
    The Deepgram API key used to authenticate requests. Get your API key from the [Deepgram Console](https://console.deepgram.com/).
  
  
    The identifier of the TTS model to use. See [Deepgram voices and languages](https://developers.deepgram.com/docs/tts-models).
  
  
    The WebSocket URL for the Deepgram streaming API. Defaults to `wss://api.deepgram.com/v1/speak`.
  
  
    The audio sampling rate in Hz.
