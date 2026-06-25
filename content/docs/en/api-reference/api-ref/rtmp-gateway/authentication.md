---
title: RESTful authentication
description: Set up authentication for Media Gateway RESTful API calls.
---

Media Gateway RESTful APIs require server-side authentication. Use the same
authentication scheme described in the product reference and pass the generated
`Authorization` header with each request.

## HTTP Basic authentication

Every time you send an HTTP request, pass a credential in the `Authorization`
request header.

Basic authentication is an HTTP authentication scheme. To use it, send requests
with an `Authorization` header that contains `Basic`, followed by a space and a
base64-encoded `username:password` string.

```text
Authorization: Basic ZGVtbzpwQDU1dzByZA==
```

## HTTP HMAC authentication

Every time you send an HTTP request, pass an API key in the `Authorization`
request header.

```text
Authorization: 123
```

## Related pages

- [Overview](index.mdx)
- [Create streaming key](create-streaming-key)
- [Query streaming list](query-streaming-list)
- [Create or reset template](create-reset-template)
