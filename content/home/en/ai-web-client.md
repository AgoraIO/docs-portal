---
title: Web client
description: Focus on the transport, event, and UI layers that matter most when bringing an AI agent into a web client.
---

## What the web client usually needs to handle

- joining the Agora realtime channel
- requesting microphone permissions
- showing agent status, transcripts, and errors
- synchronizing events into product UI and business logic

## Recommended pages first

- [Realtime audio](/docs/convoai/restful/user-guides/audio-modality)
- [Transcripts and subtitles](/docs/convoai/restful/user-guides/realtime-sub)
- [Events and webhooks](/docs/convoai/restful/webhook/ncs-events)

## Design guidance

First make sure the user can join the channel and hear the agent speak. Then add transcripts, state UI, error handling, and debugging affordances.
