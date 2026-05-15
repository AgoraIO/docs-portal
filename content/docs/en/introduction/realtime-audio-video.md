---
title: Realtime Audio & Video
description: Use this page to find the primary entry points for realtime audio-video interaction and understand how they relate to the ConvoAI docs in this repo.
---

## What this capability covers

Realtime audio and video provide the low-latency session layer behind calling, live interaction, classrooms, voice rooms, and AI conversation experiences.

## Matching official product docs

- [Open the RTC documentation homepage](https://doc.shengwang.cn/doc/rtc/homepage)
- [Open the Android quickstart](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start)
- [Open the Web quickstart](https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start)
- [Open token authentication guidance](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)

## How this relates to the current repo

This repo is currently centered on ConvoAI RESTful docs, so many AI-focused pages assume that the underlying RTC session, device permissions, and channel access are already working.

- [Open the Conversational AI quickstart](/en/ai/quick-start)
- [Open audio modality guidance](/en/realtime-media/audio-modality)

## Typical integration sequence

### Start from the RTC base path

Get channel join, device permissions, audio capture, and auth working first. That gives AI or media features a stable transport layer.

### Add scenario-specific features next

Once the RTC path is stable, continue into AI, recording, transcription, or messaging based on the product outcome you are building.
