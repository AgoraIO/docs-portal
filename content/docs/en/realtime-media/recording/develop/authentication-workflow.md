---
title: Deploy a token server
description: Use token authentication when your recorded channel requires secure RTC access.
---

If the channel you want to record uses token authentication, the Cloud Recording worker also needs a valid RTC token to join the channel. The safest approach is to generate that token on your own server and inject it into the Cloud Recording `start` request.

## What this page covers

- why Cloud Recording needs the same channel-level token model as your clients
- what information a token server must hold
- how the token flows from your backend into a Cloud Recording request

## Minimum setup

1. Keep the **App ID** and **App Certificate** on your server.
2. Generate an RTC token for the channel and recording UID.
3. Pass that token in the `clientRequest.token` field when you call [`start`](../reference/restful-api#start).
4. Refresh the token if your broader workflow keeps long-running sessions alive.

## Token server implementation paths

- Use the Agora token tools directly: see [Token generators](integrate-token-generation).
- Use the community middleware path: see [Quickstart using middleware](../get-started/middleware-quickstart).
- For general account and credential setup, see [Agora account management](../get-started/manage-agora-account).

## Practical note for Cloud Recording

The recording UID must be unique inside the channel, and the generated token must match that UID. If your clients use integer UIDs, generate the recording token with an integer recording UID as well.
