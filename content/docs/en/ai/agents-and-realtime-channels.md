---
title: Agents and realtime channels
description: Understand how agents join Agora channels as realtime participants and share one live session context with users, clients, and your backend.
---

## Why the channel model matters most

An AI agent is not an isolated backend bot. It is a participant inside a realtime channel. User speech, agent responses, client UI state, and backend lifecycle control all revolve around that shared Agora session.

## Roles inside the channel

- User: sends voice input from the app or device.
- Agent: joins as a participant, receives audio, and speaks back.
- Client: joins the channel, handles device permissions, plays audio, and shows transcript or status.
- Backend: creates agents, passes configuration, and updates or stops sessions.

## What to confirm during design

### Whether the user and agent share the same channel

This is the recommended default because it keeps audio flow, state sync, and event correlation simple.

### How channels map to sessions

Decide whether one business session equals one channel, or whether multiple users and agents share the same room context.

### How state is synchronized inside the channel

If your UI needs transcripts, turn data, interruption state, or business status, you will usually design RTM, webhooks, or custom data together with the channel model.

## Recommended next pages

- [How agents work](/en/ai/concepts)
- [Realtime audio](/en/realtime-media/speech-to-text/audio-modality)
- [Business data](/en/ai/custom-data)
