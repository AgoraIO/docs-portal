---
title: Production checklist
description: Review authentication, observability, error handling, and support paths before promoting AI agents into production.
---

## Confirm these before launch

- auth and token generation are stable
- lifecycle control is centralized on the backend
- status, transcript, error, and turn data are observable
- webhook and logging flows support troubleshooting
- response-code handling and retry strategies are defined

## Recommended pages

- [Authentication and tokens](/en/best-practices/http-basic-auth)
- [Monitor status](/en/api-reference/query-agent-status)
- [Webhook events](/en/api-reference/ncs-events)
- [Status codes](/en/api-reference/response-code)
