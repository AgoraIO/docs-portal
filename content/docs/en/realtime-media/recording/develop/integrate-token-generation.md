---
title: Token generators
description: Generate RTC tokens on your server and inject them into Cloud Recording workflows.
---

To secure user and recorder access, generate RTC tokens on your server instead of in the client or in ad hoc scripts. Cloud Recording uses the same App ID and App Certificate trust model as your client-side RTC integration.

## What a generated token includes

- App ID
- App Certificate-derived signature
- channel name
- UID
- expiration time
- role and privilege data

## Reference implementations

Agora provides token generation libraries and samples in the following languages:

- [Golang](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/go)
- [Node.js](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/nodejs)
- [PHP](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/php)
- [Python](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/python3)
- [Java](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/java)
- [C++](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/cpp)

## Recommended Cloud Recording flow

1. Generate the token on your server for the target channel and recording UID.
2. Send the token to the backend service that orchestrates Cloud Recording.
3. Include the token in the `start` request body under `clientRequest.token`.
4. Keep token expiry longer than the expected recording window, or design a renewal path around your recording lifecycle.

## Related resources

- [Deploy a token server](authentication-workflow)
- [REST quickstart](../get-started/getstarted)
- [RESTful API](../reference/restful-api)
