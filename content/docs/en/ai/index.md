---
title: Introduction
description: Build voice AI agents that join Agora realtime channels, talk naturally with users, and send events back to your app and backend.
---

## What AI agents are

Agora AI agents are realtime participants inside your session. They can join a channel, listen to user audio, run ASR, call an LLM, speak through TTS, and send status, transcript, error, and lifecycle events back to your product.

Unlike a detached chatbot, the agent lives inside the same realtime context as the user, the client app, and your backend.

## Why start here

This Introduction page is not meant to replace every detailed guide. Its job is to establish the core map:

- how an agent joins an Agora channel
- how your backend starts, updates, stops, and queries it
- where models, voice, context, and events fit
- whether your next page should be Agent Studio, the quickstart, the REST API, or client integration

## How AI agents connect to Agora

### 1. Your app creates or joins a channel

Users connect through the same Agora realtime channel from web, mobile, or device surfaces.

### 2. Your backend starts an agent session

The backend owns credentials, lifecycle control, model configuration, and business rules, using REST APIs or server SDKs to start the agent.

### 3. The agent joins as a participant

Because the agent is in the same channel, it can receive audio, speak back, and synchronize state like a real participant.

### 4. Audio flows through ASR, LLM, and TTS

User speech becomes text, the model decides the next action, and the response is spoken back into the channel.

### 5. Events return to your app

Transcripts, status changes, interruptions, errors, turn data, and webhook callbacks keep your product state in sync.

## Recommended pages already available in this repo

- [Voice AI quickstart](/en/ai/quick-start)
- [Start with Agent Studio](/en/ai/start-with-agent-studio)
- [Set up project and credentials](/en/ai/enable-service)
- [How agents work](/en/ai/concepts)
- [Events and webhooks](/en/api-reference/ncs-events)

## Recommended next step

If you want the fastest path to a live conversation, open the quickstart first.

If you want to prototype the agent experience in the browser before deeper integration, start with Agent Studio.
