---
title: About Agora
description: Build a working mental model of Agora by understanding what it is, why teams use it, what they can build, how it works, and where to go next.
---

## What is

Agora is a developer platform for realtime interaction across conversational AI, voice calling, video calling, live engagement, realtime messaging, and media services.

If a traditional web app is mostly request-response, Agora is built for a different kind of problem: users, devices, services, and agents need to stay connected, exchange media and state continuously, and operate inside the same live session context.

In this model, projects, channels, users, agents, messages, events, and media services are not separate product islands. They are parts of one broader realtime system.

## Why

Teams usually adopt Agora not because they need one isolated SDK, but because they need to assemble a complete realtime experience faster.

That usually means:

- Bringing voice, video, messaging, and AI agents into the same live session context.
- Using one relatively consistent model across frontend interaction, backend control, callbacks, and production operations.
- Expanding later into recording, transcription, analytics, auth, security, and operational governance without rebuilding the architecture from scratch.

So the value of Agora is not just that it can place a call or send a message. The real value is that it gives teams a composable foundation for realtime products that can grow in complexity over time.

## What can I build

From that foundation, teams usually end up building a few broad categories of products:

- Conversational AI products such as voice assistants, companions, tutors, support agents, and AI-powered service flows.
- Realtime audio and video products such as calls, voice rooms, meetings, classrooms, and live interactive experiences.
- Messaging and coordination layers such as room chat, shared state, event-driven interaction, and workflow synchronization.
- Media services such as recording, transcription, processing, delivery, and production-grade media pipelines.

If you start from a business outcome, ask what kind of product you want to ship. If you start from a technical problem, ask which capability you need first. Both paths eventually lead back to the same Agora realtime model.

## How it works

The easiest way to understand Agora is not to memorize product names first, but to understand how a few core objects connect:

- Projects and credentials define the integration boundary, App ID, keys, and service activation state.
- Channels and sessions define the live context shared by users, devices, and agents.
- Media and messaging handle audio, video, text, state sync, and event delivery.
- Agents and backend operations handle creation, updates, interruption, stopping, callbacks, and workflow orchestration.
- Production services extend the system with auth, security, billing, recording, transcription, analytics, and operational control.

A common workflow looks like this:

1. Create a project and prepare credentials.
2. Choose an entry capability such as conversational AI or realtime media.
3. Connect users, clients, or agents into the same live session.
4. Add backend control, callbacks, and security.
5. Add billing, analytics, release discipline, and support paths before scale.

You do not need to master every layer on day one, but you should know how the layers stack so later expansion does not feel like a jump into unrelated documentation.

## How to learn more

Once the overall picture is clear, the best next reading path is:

1. Start with the [product overview](/en/ai/product-overview) to understand the current Conversational AI Engine surface.
2. Move to [browse by capability](/en/introduction/browse-by-capability) to decide which domain best matches your current task.
3. If you are ready to build, continue into the [quickstart](/en/ai/quick-start).
4. If you are moving into backend integration, go deeper into [API reference](/en/api-reference) and [create agent](/en/api-reference/start-agent).
5. If you are preparing for production, continue into [billing](/en/ai/billing), [HTTP basic auth](/en/best-practices/http-basic-auth), and [release notes](/en/best-practices/release-notes).

This page is not meant to replace the product docs. Its job is to give you the map first, so the deeper guides make more sense when you enter them.
