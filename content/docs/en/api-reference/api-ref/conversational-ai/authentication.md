---
title: RESTful authentication
description: Set up RESTful authentication for Conversational AI REST API requests.
---

Conversational AI REST API requests require REST authentication. You can use token authentication or Basic HTTP authentication.

## Token authentication

Token authentication uses an RTC token generated on your server using your App ID and App Certificate. To authenticate with a token, include the `Authorization` header in each request:

```http
Authorization: agora token=<your_token>
```

Keep your App Certificate on the server and generate a fresh token for each agent session. Tokens expire after a maximum of 86400 seconds.

## Basic HTTP authentication

Basic HTTP authentication uses your Agora customer ID and customer secret. Generate a Base64-encoded credential from the `customer_id:customer_secret` string, then include it in the `Authorization` header:

```http
Authorization: Basic <base64_credentials>
```

## Related pages

- [Overview](index)
- [Start a conversational AI agent](join)
- [Stop a conversational AI agent](leave)
