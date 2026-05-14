---
title: Configure ASR and TTS
description: Explain the role of speech recognition and text-to-speech in the agent pipeline, and point to the best existing pages for deeper setup work.
---

## What this part solves

ASR turns user speech into text input. TTS turns the agent response back into audio. Together they shape latency, naturalness, and interaction stability.

## Related pages already in this repo

- [Realtime audio](/en/realtime-media/audio-modality)
- [Configure LLM](/en/ai/custom-llm)
- [Handle interruption](/en/ai/interrupt-agent)

## What to confirm during configuration

- which ASR and TTS vendor to use
- sample rate, language, voice role, and style
- whether TTS should stop immediately during interruption
- whether different scenarios need different voice styles
