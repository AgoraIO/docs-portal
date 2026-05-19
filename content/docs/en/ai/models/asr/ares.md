---
title: ARES
---
Adaptive Recognition Engine for Speech (ARES) provides built-in real-time speech-to-text, offering seamless integration with low latency and reliable performance for conversational AI applications.

> **Info**
> Using Ares ASR incurs charges under the "ARES ASR Task" pricing category. See the [pricing](../../overview/pricing.md) page for details.

### Sample configuration

The following example shows a starting `asr` parameter configuration you can use when you [Start a conversational AI agent](../../../api-reference/conversational-ai/rest-api/agent/join.md).

```json
"asr": {
  "vendor": "ares",
  "language": "en-US"
}
```

### Key parameters

 
 ASR provider. Set to `ares` to use Adaptive Recognition Engine for Speech.
 
   
 The BCP-47 language tag identifying the primary language used for agent interaction.
