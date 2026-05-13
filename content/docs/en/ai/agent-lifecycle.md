---
title: Agent lifecycle
description: Track the most important lifecycle controls for AI agents.
---

## Why lifecycle control matters

In production AI systems, reliable control over start, update, interruption, and stop usually becomes critical before model quality is the main bottleneck.

## Key lifecycle actions

- create and start an agent
- query the current status
- update configuration
- interrupt intentionally
- stop the agent and leave the channel

## Matching docs already in this repo

- [Create and start an agent](/en/api-reference/start-agent)
- [Monitor status](/en/api-reference/query-agent-status)
- [Handle interruption](/en/ai/interrupt-agent)
- [Stop an agent](/en/api-reference/stop-agent)
- [Get agent list](/en/api-reference/get-agent-list)

## Recommended principles

### Keep lifecycle control on the backend

Creation, updates, stop logic, and permissions are usually best centralized on your backend instead of spread across clients.

### Confirm state through events, not only request success

A successful request does not always mean the runtime is already stable. In production, verify with callbacks and events.
