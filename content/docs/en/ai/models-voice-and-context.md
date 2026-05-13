---
title: Models, voice, and context
description: Explain how LLMs, ASR, TTS, memory, and business context divide responsibility inside the agent pipeline, and which existing docs to read first.
---

## What this layer solves

Once the first agent loop works, the next step is usually not “more endpoints” but making the agent sound natural, understand better, retain context, and fit the business flow.

## This layer usually splits into four parts

### Models

The model layer controls reasoning, prompting, tool-calling behavior, and contextual understanding.

### Voice

ASR turns user speech into text, while TTS speaks the model response back into the channel.

### Memory

Short-term memory determines whether the agent can carry context across multiple turns.

### Business context

Custom data and room state help the agent respond to the current product situation instead of only answering generic prompts.

## Recommended pages first

- [Configure LLM](/en/ai/custom-llm)
- [Configure ASR and TTS](/en/ai/configure-asr-and-tts)
- [Manage memory and context](/en/ai/short-term-memory)
- [Business data](/en/ai/custom-data)
