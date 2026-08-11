---
title: OpenAI Realtime integration
description: Use Agora RTC transport with the OpenAI Realtime API when you need a custom voice stack instead of the managed Conversational AI Engine.
---

This guide explains how to combine Agora's real-time audio transport with the OpenAI Realtime API.

Use this integration when you want Agora to handle the live audio session and network transport, while OpenAI Realtime handles the model-side conversational behavior.

This is not the same as building on Agora's managed Conversational AI Engine. If you want Agora to manage the voice-agent runtime, use the main Conversational AI build path instead.

## When to use this path

- You already know you want to build around the OpenAI Realtime API.
- You need Agora RTC SDK transport in front of that model stack.
- You are building a browser demo, device-oriented flow, or backend-mediated prototype around OpenAI Realtime.

## When not to use this path

- You want the default Agora-managed voice-agent stack.
- You are looking for the main onboarding path for Conversational AI Engine.
- You want Agent Studio or the Device Kit route instead of a custom integration.

## Core pieces

- **Agora App ID**: Identifies your Agora project.
- **App certificate and token model**: Used for secure join flows where needed.
- **Channel and user ID**: Define the live session and participants.
- **SD-RTN**: Provides Agora's low-latency transport layer.
- **OpenAI Realtime API**: Provides the model-side real-time conversation flow.

## Recommended quickstart flow

1. Prepare your Agora account and project.
2. Decide how your client joins the Agora session and how the OpenAI-side session is coordinated.
3. Configure the OpenAI Realtime model and audio flow.
4. Run the round-trip voice path locally and validate latency, auth, and media behavior.

## Security and network checks

- Keep Agora credentials and provider API keys on the server side.
- Separate local, staging, and production credentials.
- Review firewall requirements before testing in restricted networks.
- Re-test the full join and media path after changing transport or security settings.

## Related pages

- [Conversational AI quickstart](/en/ai/get-started/quickstart)
- [MCP integration](/en/ai/get-started/mcp-integrate)
- [Agora skills](/en/ai/get-started/skills-integrate)
- [Security and privacy](/en/introduction/security-privacy)
- [Firewall requirements](/en/introduction/firewall)
- [Glossary](/en/introduction/glossary)
