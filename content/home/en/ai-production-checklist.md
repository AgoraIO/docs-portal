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

- [Authentication and tokens](/docs/convoai/restful/user-guides/http-basic-auth)
- [Monitor status](/docs/convoai/restful/operations/query-agent-status)
- [Webhook events](/docs/convoai/restful/webhook/ncs-events)
- [Status codes](/docs/convoai/restful/api/response-code)
