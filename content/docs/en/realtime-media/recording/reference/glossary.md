---
title: Glossary
description: Common Cloud Recording terms used across the integration and operations flow.
---

## Core terms

- **Cloud Recording**: Agora's managed recording service for realtime audio, video, and interactive streaming sessions.
- **App ID**: The project identifier used across Agora integrations.
- **App Certificate**: The server-side credential used in token-related flows.
- **Customer ID / Customer Secret**: Credentials used for Cloud Recording REST authentication.
- **Resource ID**: A short-lived identifier returned by `acquire` before a recording starts.
- **SID**: The recording session identifier returned after a successful `start`.
- **Recording UID**: The UID used by the recording worker when it joins the channel.
- **Individual recording**: Per-user recording outputs rather than one mixed output.
- **Composite recording**: A mixed layout recording for multiple users in one output stream.
- **Web page recording**: Recording that captures web page content and audio as a video output.
- **M3U8**: The index playlist file used to organize HLS recording slices.
- **TS / WebM / MP4**: Common Cloud Recording output file formats.

## Related resources

- [Core concepts](../overview/core-concepts)
- [Manage recorded files](../develop/manage-files)
- [RESTful API](restful-api)
