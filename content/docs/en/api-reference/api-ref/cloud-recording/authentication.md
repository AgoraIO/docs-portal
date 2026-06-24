---
title: RESTful authentication
description: Authenticate Cloud Recording REST API calls.
---

Cloud Recording REST APIs use Basic HTTP authentication. Each request must include an `Authorization` header built from your Agora customer ID and customer secret.

## Recommended pattern

- Store customer credentials on the server.
- Generate the Basic Auth credential by Base64-encoding the `customer_id:customer_secret` string.
- Send the encoded value in the `Authorization: Basic <credential>` request header.
- Keep all REST calls on the server side and avoid exposing secrets in clients.

## Related pages

- [Overview](index)
- [Acquire a cloud recording resource](acquire)
- [Start cloud recording](start)
