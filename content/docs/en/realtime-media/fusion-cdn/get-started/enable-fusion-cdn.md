---
title: Enable Fusion CDN
description: Enable the Fusion CDN service in Agora Console and choose your first delivery mode.
---

This page shows how to enable Fusion CDN in Agora Console.

## Prerequisites

Before you enable the service, make sure you have:

- an Agora account
- an active Agora project

If you still need to set those up, see [Agora account management](./manage-agora-account).

## Procedure

1. Open [Agora Console](https://console.agora.io/v2/project-management).
2. Find the project you want to use and click **Config**.

   ![](https://web-cdn.agora.io/docs-files/1641971710869)

3. Under **Real-time engagement core**, find **Fusion CDN** and click **Enable**.

   ![](https://web-cdn.agora.io/docs-files/1642736194620)

If the service is enabled successfully, the **Enable** button changes to **Config**.

## Choose a startup path

After enabling Fusion CDN, choose one of the following ways to start:

| Path | Best for | Time to first stream | Authentication | Feature coverage |
| --- | --- | --- | --- | --- |
| [Start with an Agora domain](./agora-domain) | Fast testing and basic live delivery | Minutes | Basic HTTP authentication | Core live stream creation and playback |
| [Start with a custom domain](./custom-domain) | Production rollout and full domain control | Hours | Timestamp authentication or origin authentication | Full service surface |

## What to do next

- Use [Start with an Agora domain](./agora-domain) if you want the fastest possible path to a live stream.
- Use [Start with a custom domain](./custom-domain) if you need your own domains, CNAME management, or advanced distribution controls.
