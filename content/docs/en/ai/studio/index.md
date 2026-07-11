---
title: Overview
description: Build, deploy, and monitor conversational AI voice agents in Agora Console without managing infrastructure.
---
The no-code agent builder is a visual workspace in Agora Console for building and operating conversational AI voice agents. You configure agent behavior, connect telephony, and monitor production calls from a single interface, without writing integration code.

It abstracts the underlying AI stack. You configure your ASR, LLM, and TTS providers, or a single realtime MLLM; the console handles the orchestration between them. Instead of managing API integrations across multiple services, you focus on what your agent should say and do.

## How it's organized

The no-code agent builder is structured around four areas:

**Concierge:** Explore, configure, and troubleshoot your agents using natural language, instead of navigating each page individually. See [Concierge](build/concierge).

**Build:** Create and configure agents. Define the system prompt, greeting, models, and behavior. Connect credentials, knowledge bases, MCP servers, Custom Tools, and connectors through **Integrations**. These resources are stored centrally so they can be reused across multiple agents. See [Customize your agent](build/customize-agent), [Manage integrations](build/integrations), [Custom Tools](build/custom-tools), and [HubSpot Connector](build/hubspot-connector).

**Deploy:** Connect agents to telephony. Import phone numbers using Elastic SIP Trunk and configure inbound routing or outbound campaigns. See [Set up SIP trunk](deploy/sip-trunk), [Import a phone number](deploy/import), [Handle inbound calls](deploy/inbound), [Publish your agent](deploy/deploy-agent), and [Set up a campaign](deploy/campaign).

**Insights:** Monitor production usage. Review call history, transcripts, and analytics to understand agent performance and debug issues. See [Agent analytics](observe/analytics) and [Call History](observe/call-history).

## How it works

The no-code agent builder sits between your telephony provider and the AI models that power your agent. For inbound calls, it receives the call from your carrier via Elastic SIP Trunk, processes the conversation through your configured ASR, LLM, and TTS providers (or a realtime MLLM), and delivers the agent's response back to the caller. For outbound calls, it initiates the call through the same SIP trunk, connects to the recipient, and handles the conversation in the same way.

In both cases, it manages the full call lifecycle. No SIP servers to manage, no voice recognition to train, no telephony protocols to debug.

## Key concepts

### Agents

Agents are the primary objects you configure. Create an agent, then configure it across four tabs in the agent editor:

- **Prompt**: The system prompt, greeting message, and failure message that define your agent's identity and behavior.
- **Models**: Your ASR, LLM, and TTS providers, or a single realtime MLLM.
- **Advanced**: Turn detection, speech detection, selective attention locking, filler words, voice format, and conversation history.
- **Actions**: Knowledge bases, Custom Tools, connectors, and MCP servers attached to the agent.

After configuring, test the agent using the **Test** tab, then publish it when ready. See [Customize your agent](build/customize-agent) and [Test your agent](build/test-agent).

### Integrations

**Integrations** is a centralized resource library. Store credentials, knowledge bases, MCP servers, Custom Tools, and connectors here once, then attach them to any agent. This eliminates repeated setup when you create new agents or update provider settings. See [Manage integrations](build/integrations).

### Phone numbers

Import phone numbers from your SIP trunk provider and assign them to agents for inbound calls, or use them as caller IDs for outbound campaigns. See [Import a phone number](deploy/import).

### Campaigns

For outbound use cases, create campaigns with contact lists, scheduling, and call transfer settings. See [Set up a campaign](deploy/campaign).

## Who should use this

The no-code agent builder is designed for developers and technical users who want to build and operate voice agents without managing the underlying AI infrastructure. If you need capabilities beyond what it exposes, such as advanced API parameters or custom orchestration logic, you can use the [Conversational AI REST API](/en/api-reference/api-ref/conversational-ai) for full programmatic control.

## Get started

To get started, follow the [Quickstart](quickstart), which walks you through creating and testing your first agent in about 10 minutes using a pre-built template.