---
title: "Enable Real-Time STT from the client side"
description: "Enable the Real-Time STT service"
---

Real-Time STT is designed to provide service for channels. The recommended solution is to call RESTful APIs on the server side. But in a real-world use-case, the service is always enabled on the end user's side. This requires the user's app to notify the app's server, and the server to call RESTful APIs.

If the end user's app calls RESTful APIs, the app needs to store the customer ID and customer secret to generate a Base64-encoded credential and fill it in the HTTP header, as explained in [RESTful authentication](../../reference/restful-authentication). Since it is not safe to store the customer ID and secret in the app, Agora provides a new method for HTTP authentication without storing customer ID and secret.

This page explains how to enable Real-Time STT on the client's side. For more information, see [RESTful authentication](../../reference/restful-authentication).

## Prerequisites

To follow this procedure, you must:

- Have a valid [Agora Account](https://console.agora.io/v2).

- Have a valid Agora project with an app ID and a temporary token or a token
server. For details, see [Agora account management](https://docs.agora.io/en/voice-calling/get-started/manage-agora-account).

- Have a computer with access to the internet. If your network has a firewall, follow the steps in [Firewall requirements](../../reference/firewall).

- Join a Video SDK channel as a host and start streaming. Refer to the [Voice SDK quickstart](https://docs.agora.io/en/voice-calling/get-started/get-started-sdk) guide.

- Make sure Real-Time STT is enabled for your app.

## Authenticate REST calls by RTC Token

To let an end user's app call RESTful API with lower security risks, substitute the original Base64-encoded credential (generated from the customer ID and secret) with an RTC token (AccessToken2).

Take the following steps:

1. Refer to [Deploy a token server](https://docs.agora.io/en/video-calling/token-authentication/deploy-token-server) to generate RTC tokens.
You will need to use AccessToken2. For example, `"007eJxTYLj64d/9y/N6FnXGZ4nWvZ9TcL7O2u7XrrCdnPe4p1QIbZ2pwGCaZGppkmxsZGaWZmRibmlkmWRiZmBikGpsZGBkaJyY9KCqIFWAj4FBI/gaMyMDEwMjEIL4PAwlqcUl8aXFqUXxxxxxxxxxxx=="`

1. Use this token to replace the value of `"Authorization"` in HTTP headers: `"Authorization: agora token="007eJxTYLj64d/9y/N6FnXGZ4nWvZ9TcL7O2u7XrrCdnPe4p1QIbZ2pwGCaZGppkmxsZGaWZmRibmlkmWRiZmBikGpsZGBkaJyY9KCqIFWAj4FBI/gaMyMDEwMjEIL4PAwlqcUl8aXFqUXxxxxxxxxxxx=="`.

1. Use this header to call RESTful APIs.

**Examples**

- curl

    ```shell
    curl --location --request POST 'https://api.agora.io/api/speech-to-text/v1/projects/{appId}/join' \
    --header 'Content-Type: Application/json' \
    --header 'Authorization: agora token="007eJxTYLj64d/9y/N6FnXGZ4nWvZ9TcL7O2u7XrrCdnPe4p1QIbZ2pwGCaZGppkmxsZGaWZmRibmlkmWRiZmBikGpsZGBkaJyY9KCqIFWAj4FBI/gaMyMDEwMjEIL4PAwlqcUl8aXFqUXxxxxxxxxxxx=="' \
    --data '{
        "name": "unique-agent-id",
        "languages": ["en-US"],
        "rtcConfig": {
            "channelName": "test-channel",
            "subBotUid": "47091",
            "pubBotUid": "88222"
        }
    }'
    ```

- Valid token:

    - Response status: 200 OK
    - Response body:

        ```json
        {
          "agent_id": "Agent ID.",
          "create_ts": 12345678,
          "status": "RUNNING"
        }
        ```

- Expired token:

    - Response status: 401 Unauthorized
    - Response body:

        - Token was valid but expired at the time of request:

            ```json
            {"message": "Token is expired"}
            ```

         - Token was not properly generated:

            ```json
            {"message": "Invalid token"}
            ```

## Notice

Multiple clients may enable Real-Time STT simultaneously (within 1s), creating 2 or more transcription tasks. This will generate twice or more usage. To avoid this, take the following precautions:

- Add a lock in the apps.
- Prevent calling RESTful API from the same app more frequently than every second.
