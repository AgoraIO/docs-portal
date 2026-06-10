---
title: Cloud Recording
description: Record realtime voice, video, and interactive streaming sessions into cloud storage for replay, archive, review, and downstream processing.
---

Cloud Recording is Agora's managed recording path for teams that want to capture live sessions without operating their own recording servers. You drive the workflow from your backend through REST APIs, and Agora handles the recording workers that join the channel, capture streams, and upload output files to your cloud storage.

## What this product is good for

- Archive live sessions for replay, audit, or compliance
- Save group calls and interactive live streams into files for later distribution
- Produce per-user or mixed outputs depending on your playback and processing needs
- Trigger screenshots, web page recording, callbacks, and post-processing workflows from the same backend-controlled path

## Core strengths

- **Managed operation**: You do not need to run your own recording fleet.
- **Flexible output modes**: Use individual, composite, or web page recording depending on what you need to preserve.
- **Cloud storage integration**: Upload recording files directly to supported third-party storage providers.
- **Backend orchestration**: Start, update, query, and stop recording with REST APIs from your own service layer.

## Recommended reading path

1. Start with [REST quickstart](../get-started/getstarted).
2. Review [Core concepts](core-concepts) to choose the correct recording mode.
3. Decide between [Individual recording](../develop/individual-mode), [Composite recording](../develop/composite-mode), or [Web page recording](../develop/webpage-mode).
4. Keep [RESTful API](../reference/restful-api) and [Webhook callbacks](../reference/rest-api-overview) open while implementing.

## Related capability paths

- [Recording overview](/en/realtime-media/recording)
- [Cloud Recording REST API reference](/en/api-reference/cloud-recording/restful)
- [Media processing and distribution](/en/realtime-media/media-processing-and-distribution)
