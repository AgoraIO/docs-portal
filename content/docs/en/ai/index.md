---
title: Voice Agent
description: Understand the Voice Agent product space and choose the right implementation path for your deployment target.
---

A Voice Agent is a realtime conversational system that listens, reasons, and responds through voice. On Agora, that system is built from a small set of core parts: realtime transport, agent runtime, model orchestration, and the client or device where the experience is delivered.

This section is the starting point for developer teams who need a clear implementation model before choosing how to ship the experience. Use it to understand what a voice agent can do, then choose the path that matches where you want it to run.

## Capabilities

- Build low-latency voice interactions that feel responsive enough for natural conversation.
- Combine ASR, LLM, TTS, memory, tools, and multimodal inputs into one agent workflow.
- Deliver the same core voice-agent experience on software clients or dedicated devices.
- Move from prototype to production with guided build paths, optimization advice, and reference docs.

## How the sidebar is organized

The sidebar is organized around implementation paths, not around a feature catalog. Its purpose is to help you move from orientation to execution without having to re-decide where to go at each step.

- **Overview** explains the shared Voice Agent model and helps you decide which path fits your endpoint.
- **Voice agent on software clients** is for web, mobile, desktop, and backend-driven client experiences.
- **Quickstart** gives you the fastest working starting point for that path.
- **Build** covers the implementation work needed to create, shape, and operate the voice-agent experience.
- Inside each **Build** subsection, guides are ordered from foundational setup to more advanced customization and polish, so you can follow them top to bottom without re-planning the sequence.
- **Models** helps software-client teams choose and integrate ASR, LLM, TTS, and multimodal providers.
- **Reference topics** such as event types, pricing, and release notes help you operate and maintain the experience after the initial build.
- **Voice agent on dedicated devices** is for embedded or hardware-first endpoints such as toys, wearables, kiosks, and companions.
- Its **Build** section focuses on device bring-up, networking, firmware, server setup, and hardware behavior.

## Voice agent experiences you can create

### On software clients

Choose this path when you are building for web, mobile, desktop, or backend-driven client experiences. It is the right fit when your team wants to embed voice interaction into a general-purpose software product.

A software-client voice agent usually has two parts:

- **Backend**: owns secrets, generates tokens, and starts or stops the agent session.
- **Client**: captures audio, joins the channel, and renders conversation state to the user.

The typical runtime flow is: the client requests tokens, joins the Agora channel, asks the backend to start the agent session, and then renders transcripts, state changes, and controls while the user and agent interact in the same channel.

- Start with the [quickstart](get-started/quickstart.md)
- Continue through build, optimization, models, and reference topics in the sidebar
- Built with [Conversational AI](conversational-ai/index.md)

### On dedicated devices

Choose this path when you are building for toys, companions, wearables, kiosks, or other embedded hardware. It is the right fit when your team needs a hardware-first workflow for bringing a voice agent to a dedicated device.
- Start with the [device quickstart](device-kit/start-here/quickstart.md)
- Continue through build and reference topics in the sidebar
- Built with [Convo AI Device Kit](device-kit/index.md)
