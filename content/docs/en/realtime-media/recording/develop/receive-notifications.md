---
title: Webhooks
description: Receive Cloud Recording webhook notifications on your backend for status, file, and failure events.
---

A webhook is an HTTPS callback that lets your backend receive Cloud Recording events in real time. Agora sends POST requests to your endpoint when subscribed recording events occur, so you can monitor progress, reconcile files, and react to failures.

## Typical use cases

- track recording lifecycle state changes
- detect file upload completion and callback events
- reconcile callback data with your own job records
- alert on recording failures or abnormal stop reasons

## Recommended setup flow

1. Expose a public HTTPS webhook endpoint.
2. Enable the callback events you need in Cloud Recording.
3. Verify incoming requests and return `200 OK` quickly.
4. Make processing idempotent because retries can happen.

## Practical integration notes

- Do not rely on webhook delivery alone for mission-critical state. Pair it with [`query`](../reference/restful-api#query) when necessary.
- If your network is restricted by a firewall, review [Firewall requirements](../reference/firewall).
- For callback payloads and event semantics, keep [Cloud Recording callback overview](../reference/rest-api-overview) open during implementation.

## Related resources

- [Cloud Recording callback overview](../reference/rest-api-overview)
- [Integration best practices](../best-practices/integration-best-practices)
- [Product and service status](../reference/status-page)
