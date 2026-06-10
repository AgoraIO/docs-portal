---
title: Firewall requirements
description: Allow the network paths Cloud Recording depends on when you operate in restricted environments.
---

If your backend, storage provider, or webhook endpoint operates behind a firewall, allow the network paths required for Cloud Recording REST calls, callback delivery, and third-party storage access.

## What to allow

- outbound HTTPS access from your backend to Agora REST endpoints
- inbound HTTPS access to your webhook endpoint if you use callbacks
- access between the recording service and your configured cloud storage provider

## Operational advice

- Keep firewall rules narrow and environment-specific.
- Validate webhook reachability before production rollout.
- Recheck storage-side allowlists whenever you change vendors or regions.
- If you rely on webhook callbacks in a restricted network, build a fallback path with periodic status queries.

## Related resources

- [RESTful API](restful-api)
- [Cloud Recording callback overview](rest-api-overview)
- [Support and status](/en/introduction/support)
