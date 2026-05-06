---
title: Optimize End-to-End Conversation Latency
description: "In scenarios where users talk with an agent, latency is a key factor that affects user experience. This article helps you understand and optimize end-to-end conversation latency with a conversational agent so you can improve user experience."
---

# Optimize End-to-End Conversation Latency

In scenarios where users talk with an agent, latency is a key factor that affects user experience. This article helps you understand and optimize end-to-end conversation latency with a conversational agent so you can improve user experience.

## Understand Latency Composition

When using a cascaded ASR-LLM-TTS architecture, end-to-end latency consists of the following parts:

`End-to-end latency = RTC latency + algorithm preprocessing latency + ASR latency + LLM latency + TTS latency (+ digital human latency)`

### Latency Description by Module

Based on actual test data, the typical latency range of each module is as follows:

| Module | Latency Metric | Description | Typical Latency Range |
| --- | --- | --- | --- |
| **RTC** | Audio/video latency | Includes audio capture, encoding, network transmission, decoding, playback, and other stages | 150-300 ms |
| **Algorithm preprocessing** | Preprocessing latency | Includes the processing time of algorithms such as VAD (voice activity detection) and graceful interruption (AIVAD) | 560-940 ms |
| **ASR** | `asr_ttlw` | Time To Last Word, the latency from the end of user speech to the ASR output of the last word | 400-700 ms |
| **LLM** | `llm_ttfb` / `llm_ttfs` | TTFB: Time To First Byte<br/>TTFS: Time To First Sentence | 250-1000 ms |
| **TTS** | `tts_ttfb` | Time To First Byte, the latency from the start of the TTS request to receiving the first response byte | 100-350 ms |
| **Digital human** | Rendering latency | The latency from when the digital human module receives the first frame of TTS audio to when it generates and aligns the first frame of audio and video, if enabled | 50-200 ms |

### Real Latency Example

The following latency data from three conversation turns in a real conversation comes from event [111 agent metrics](../webhook/ncs-events.md#111-agent-metrics) in Agora Message Notification Service:

```json
{
  "metrics": [
    {
        "turn_id": 1,
        "tts_ttfb": 61
    },
    {
        "turn_id": 2,
        "asr_ttlw": 141,
        "llm_ttfb": 270,
        "llm_ttfs": 482,
        "tts_ttfb": 90,
    },
    {
        "turn_id": 3,
        "asr_ttlw": 103,
        "llm_ttfb": 306,
        "llm_ttfs": 948,
        "tts_ttfb": 106,
    }
  ]
}
```

## View Latency Metrics

Conversational AI Engine provides two ways to view latency metrics for each conversation turn:

### Method 1: Listen Through Client Components

If you use client components (Android/iOS/Web), you can register the `onAgentMetrics` callback to listen to agent performance metrics in real time.

#### Android

```kotlin
api.addHandler(object : IConversationalAIAPIEventHandler {
    override fun onAgentMetrics(agentUserId: String, metric: Metric) {
        when (metric.type) {
            ModuleType.ASR -> {
                Log.d("Metrics", "ASR TTLW: ${metric.value}ms")
            }
            ModuleType.LLM -> {
                // metric.name may be "ttfb" or "ttfs"
                Log.d("Metrics", "LLM ${metric.name}: ${metric.value}ms")
            }
            ModuleType.TTS -> {
                Log.d("Metrics", "TTS TTFB: ${metric.value}ms")
            }
            ModuleType.TOTAL -> {
                Log.d("Metrics", "Total Delay: ${metric.value}ms")
            }
            else -> {
                Log.d("Metrics", "${metric.type}: ${metric.name} = ${metric.value}ms")
            }
        }
    }
})
```

#### iOS

```swift
func onAgentMetrics(agentUserId: String, metrics: Metric) {
    switch metrics.type {
    case .asr:
        print("ASR TTLW: \(metrics.value)ms")
    case .llm:
        print("LLM \(metrics.name): \(metrics.value)ms")
    case .tts:
        print("TTS TTFB: \(metrics.value)ms")
    case .total:
        print("Total Delay: \(metrics.value)ms")
    case .unknown:
        print("Unknown metric: \(metrics.name) = \(metrics.value)ms")
    }
}
```

#### Web

```typescript
conversationalAIAPI.on(
  EConversationalAIAPIEvents.AGENT_METRICS,
  (agentUserId: string, metrics: Metric) => {
    console.log(`[${metrics.type}] ${metrics.name}: ${metrics.value}ms`);

    if (metrics.type === 'TOTAL') {
      console.log(`Total delay for turn: ${metrics.value}ms`);
    }
  }
);
```

For detailed integration steps and API reference, see [Listen to Agent Events](../user-guides/listen-agent-events.md).

### Method 2: Through Message Notification Service (NCS)

If you have enabled [Agora Message Notification Service](../webhook/enable-ncs.md), you can obtain agent performance metrics by receiving `agent metrics` events whose `eventType` is `111`.

#### Event Callback Example

```json
{
  "noticeId": "2000001428:4330:107",
  "productId": 17,
  "eventType": 111,
  "notifyMs": 1611566412672,
  "payload": {
    "agent_id": "A42AC47Hxxxxxxxx4PK27ND25E",
    "start_ts": 1000,
    "stop_ts": 1672531200,
    "channel": "test-channel",
    "metrics": [
      {
          "turn_id": 1,
          "tts_ttfb": 61
      },
      {
        "turn_id": 2,
        "asr_ttlw": 141,
        "llm_ttfb": 270,
        "llm_ttfs": 482,
        "tts_ttfb": 90,
      }
    ]
  }
}
```

For detailed field descriptions of the event, see [Event Type - 111 agent metrics](../webhook/ncs-events.md#111-agent-metrics).

## Optimize Latency in a Cascaded Architecture

### 1. Optimize LLM, ASR, and TTS Modules

The LLM is usually the module that contributes the most latency. Optimizing the LLM can significantly reduce overall latency.

#### Choose Low-Latency Vendors

Different LLM, ASR, and TTS vendors and models vary significantly in response speed. You can refer to [Real-time performance benchmarks of mainstream models supported by Conversational AI Engine](https://www.shengwang.cn/duihua/benchmark/overview) to compare performance across ASR, LLM, and TTS vendors.

#### Tune Parameter Configuration

When creating an agent, read the ASR, LLM, and TTS vendor documentation to understand the parameters provided by each vendor, and tune them for your actual scenario. The following are some general optimization ideas:

- LLM
  - **Choose a smaller model**: Models such as `gpt-4o-mini` and `claude-3-haiku` usually respond faster than larger models.
  - **Limit `max_tokens`**: Reducing the maximum number of generated tokens can reduce TTFS.
- ASR
  - **Use the vendor-recommended sample rate**: Use the sample rate recommended by the vendor, such as 16 kHz, to avoid unnecessary resampling.
  - **Constrain the language model**: Use parameters such as `phrases` or `context` to provide domain-specific vocabulary and improve recognition speed.
  - **Disable unnecessary features**: Some vendors provide advanced options such as punctuation or tone output. Disable them when possible to improve response speed.
- TTS
  - **Choose a faster mode**: Some TTS services provide `turbo` or `low-latency` modes that usually respond faster than the default mode.
  - **Choose a faster voice**: Some TTS services provide voices with different complexity levels. Selecting a less complex voice can reduce generation time.
  - **Disable unnecessary features**: Some vendors provide advanced options such as tone or emotion. Disable them when appropriate to improve response speed.

The following example shows how to optimize LLM parameters:

```json
{
  "properties": {
    "llm": {
      "url": "https://api.openai.com/v1/chat/completions",
      "api_key": "your_api_key",
      "params": {
        "model": "gpt-4o-mini",  // Choose a faster-responding model
        "temperature": 0.7,
        "max_tokens": 150,  // Limit generation length to reduce latency
        "stream": true  // Enable streaming responses
      }
    }
  }
}
```

### 2. Optimize RTC Module Latency

RTC latency includes audio capture, encoding, network transmission, decoding, playback, and other stages. Optimizing RTC latency requires tuning audio settings on the client side.

#### Use the AI Conversation Scenario

Agora RTC SDK v4.5.1 and later supports the AI conversation scenario (`AUDIO_SCENARIO_AI_CLIENT`), which is specifically optimized for AI conversations and includes:

- Optimized audio 3A algorithms (echo cancellation, noise suppression, gain control)
- Lower audio capture and playback latency
- Audio processing optimized for AI speech characteristics

#### Android

```kotlin
// Method 1: Use the client component API (recommended)
val config = ConversationalAIAPIConfig(
    rtcEngine = rtcEngineInstance,
    rtmClient = rtmClientInstance,
    enableLog = true
)
val api = ConversationalAIAPIImpl(config)

// Load the optimal audio settings
api.loadAudioSettings()
```

```kotlin
// Method 2: Configure RTC SDK directly
val config = RtcEngineConfig()
config.mAudioScenario = Constants.AUDIO_SCENARIO_AI_CLIENT
rtcEngine = RtcEngine.create(config)
```

#### iOS

```swift
// Method 1: Use the client component API (recommended)
let config = ConversationalAIAPIConfig(
    rtcEngine: rtcEngine,
    rtmEngine: rtmEngine,
    enableLog: true
)
convoAIAPI = ConversationalAIAPIImpl(config: config)

// Load the optimal audio settings
convoAIAPI.loadAudioSettings()
```

```swift
// Method 2: Configure RTC SDK directly
let config = AgoraRtcEngineConfig()
config.audioScenario = .aiClient
rtcEngine = AgoraRtcEngineKit.sharedEngine(with: config, delegate: delegate)
```

For details on audio optimization, see [Optimize Audio Settings](./audio-settings.md).

## Latency Optimization Checklist

Use the following checklist to systematically optimize latency for your conversational AI agent:

### Server-side Optimization

- [ ] **Choose a low-latency LLM model**: Refer to [Real-time performance benchmarks of mainstream models supported by Conversational AI Engine](https://www.shengwang.cn/duihua/benchmark/overview) and choose a model with strong latency performance.
- [ ] **Enable streaming responses**: Make sure `stream: true` is enabled.
- [ ] **Choose low-latency ASR and TTS vendors**: Use `turbo`, `low-latency`, or similar modes.
- [ ] **Optimize geographic deployment**: Deploy ASR, LLM, and TTS in the same region.
- [ ] **Configure geofencing**: Use the `geofence` parameter to lock traffic to the best region.

### Client-side Optimization

- [ ] **Use the AI conversation scenario**: Set `AUDIO_SCENARIO_AI_CLIENT` (RTC SDK 4.5.1+).
- [ ] **Load the optimal audio settings**: Call `loadAudioSettings()` in the client component.
- [ ] **Integrate the required audio plugins**: Make sure AI noise suppression and AI echo cancellation plugins are integrated.
- [ ] **Optimize network conditions**: Make sure users have a stable network connection and consider using SD-RTN™ to optimize network transmission.

### Monitoring and Analysis

- [ ] **Listen to latency metrics in real time**: Obtain per-turn latency data through client components or NCS.
- [ ] **Identify latency bottlenecks**: Analyze which module contributes the most latency.
- [ ] **Continuously optimize**: Adjust configuration based on real data and conduct A/B testing.

## Trade-off Between Latency and Quality

When optimizing latency, you need to strike a balance between response speed and conversation quality:

| Optimization Strategy | Latency Impact | Quality Impact | Recommended Scenarios |
| --- | --- | --- | --- |
| Use a smaller LLM model | ✅ Significantly reduced | ⚠️ May decrease | Scenarios that are latency-sensitive and involve relatively simple conversations |
| Limit `max_tokens` | ✅ Moderately reduced | ⚠️ May affect completeness | Scenarios that require short responses |
| Geofencing | ✅ Moderately reduced | ➖ No impact | Users are concentrated in a specific region |
| Optimize RTC settings | ✅ Moderately reduced | ➖ No impact | All scenarios |

> Tip
> It is recommended that you first identify the bottleneck by listening to latency metrics, and then optimize the module that contributes the most latency, instead of blindly pursuing the lowest possible latency.

## References

- [Listen to Agent Events](../user-guides/listen-agent-events.md)
- [Optimize Audio Settings](./audio-settings.md)
- [Message Notification Service - `agent metrics` event](../webhook/ncs-events.md#111-agent-metrics)
- [Real-time performance benchmarks of mainstream models supported by Conversational AI Engine](https://www.shengwang.cn/duihua/benchmark/overview)
