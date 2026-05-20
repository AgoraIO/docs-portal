---
title: LiveAvatar (Beta)
---
LiveAvatar by HeyGen provides AI-powered avatars with high-quality video rendering and customizable video quality settings, enabling professional video conversations with your AI agents. 

> **Info**
> LiveAvatar only support audio with a sample rate of 24,000 Hz. Using a TTS model configured with a different sample rate will result in an error. Ensure your TTS configuration matches this requirement.

### Sample configuration

The following example shows a starting `avatar` parameter configuration you can use when you [Start a conversational AI agent](../../../api-reference/conversational-ai/rest-api/agent/join.md).

```json
"avatar": {
    "vendor": "liveavatar",
    "enable": true,
    "params": {
        "agora_token": "<avatar_rtc_token>",
        "agora_uid": "<avatar_rtc_uid>",
        "quality": "high",
        "avatar_id": "65f9e3c9-d48b-4118-b73a-4ae2e3cbb8f0",
        "api_key": "<liveavatar_key>",
    }
}
```

### Key parameters

   
 The API key used for authentication with LiveAvatar's services. Get your API key from the LiveAvatar console.
 
 
 The video quality for the avatar rendering. 
 
 - `"high"` (720p)
 - `"medium"` (480p)
 - `"low"` (360p). 
 
 Higher quality provides better visual experience but requires more bandwidth.
 
 
 The unique identifier for the avatar's RTC connection. This must be different from other participants in the channel.
 
   
 The RTC token that authorizes the avatar to join the video channel. Generate this token using your Agora project credentials.
 
 
 The unique identifier for the avatar you want to use. 
 
 
 Whether to disable the idle timeout feature. 
 
 
 The number of seconds of inactivity before the avatar session times out. Only applies when `disable_idle_timeout` is `false`.
 

For advanced configuration options, refer to the [LiveAvatar official documentation](https://docs.liveavatar.com/reference/create_session_token_v1_sessions_token_post).
