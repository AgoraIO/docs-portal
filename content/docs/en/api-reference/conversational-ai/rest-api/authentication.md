---
title: RESTful authentication
description: Set up authentication for RESTful communication between your app and Agora.
---
Use your Agora customer credentials when calling Conversational AI REST APIs. In practice, teams normally keep this flow on the server side and avoid exposing secrets in clients.

## Recommended pattern

- Store customer credentials on the server.
- Use server-side API calls for agent lifecycle operations.
- Use project-level enablement and token issuance before starting sessions.

## Related pages

- [Enable Conversational AI](../../../ai/reference/enable-conversational-ai.md)
- [REST API operations](agent/join.md)
- [Status codes and error messages](status-codes.md)

<!-- Shared MDX authentication partial from the source repo was omitted during Markdown conversion. -->
