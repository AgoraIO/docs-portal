---
title: Overview
description: Start here when you need to build, process, connect, or deliver real-time media experiences.
---

Realtime & Media is the capability domain for products that need something to happen live. Use this section when you are deciding how people, devices, backend services, and media streams should connect, stay in sync, and keep working while a session is in progress.

Instead of organizing docs around a single product story, this tab is organized around the functional layers most teams assemble when building a real-time experience: live interaction, session intelligence, media routing, large-scale delivery, and device or server participation.

## What you can build from this section

### Create live interaction surfaces

Use these docs when you are defining how users join a session, exchange media, coordinate actions, or collaborate in the same live space.

- [Voice & Video](/en/realtime-media/rtc): calls, meetings, co-hosting, interactive live rooms, and media quality control
- [Signaling](/en/realtime-media/rtm): channel messaging, presence, state sync, and real-time coordination
- [Chat](/en/realtime-media/im): persistent and full-featured messaging systems beyond lightweight room coordination
- [Whiteboard](/en/realtime-media/whiteboard): shared visual collaboration inside live sessions

### Understand, capture, and transform session content

Use these docs when media inside the session needs to become text, records, composites, or downstream assets.

- [Transcription & Translation](/en/realtime-media/speech-to-text): captions, speech understanding, and multilingual live experiences
- [Cloud Recording](/en/realtime-media/cloud-recording): archive, replay, compliance, QA, and post-session review workflows
- [Transcoding](/en/realtime-media/transcoding): mixing, layout composition, and output transformation

### Bridge real-time sessions with external media systems

Use these docs when your product must ingest outside streams, publish session media to other systems, or interoperate with existing streaming infrastructure.

- [Media Push](/en/realtime-media/media-push): send RTC channel media to CDN pipelines or downstream media systems
- [Media Pull](/en/realtime-media/media-pull): bring online media streams into an interactive real-time session
- [Media Gateway](/en/realtime-media/rtmp-gateway): connect RTMP-based devices and systems to Agora

### Deliver playback to larger audiences

Use these docs when interactive participation and large-scale viewing are separate concerns in your architecture.

- [Fusion CDN](/en/realtime-media/fusion-cdn): multi-CDN distribution for live playback at audience scale

### Extend the session to devices and backend services

Use these docs when participants are not just mobile or web clients, but also embedded devices, operator consoles, or server-side workers.

- [IoT & Edge](/en/realtime-media/rtsa): device and edge connectivity for cameras, terminals, and embedded endpoints
- [Server Gateway](/en/realtime-media/rtc-server-sdk): backend participation in media send, receive, subscribe, and control flows

## How to navigate this tab

- Start with [Voice & Video](/en/realtime-media/rtc), [Signaling](/en/realtime-media/rtm), [Chat](/en/realtime-media/im), or [Whiteboard](/en/realtime-media/whiteboard) when your main question is how users interact inside a live session.
- Start with [Transcription & Translation](/en/realtime-media/speech-to-text), [Cloud Recording](/en/realtime-media/cloud-recording), or [Transcoding](/en/realtime-media/transcoding) when your main question is what should happen to the media during or after the session.
- Start with [Media Push](/en/realtime-media/media-push), [Media Pull](/en/realtime-media/media-pull), [Media Gateway](/en/realtime-media/rtmp-gateway), or [Fusion CDN](/en/realtime-media/fusion-cdn) when your main question is how to move media across systems or out to larger audiences.
- Start with [IoT & Edge](/en/realtime-media/rtsa) or [Server Gateway](/en/realtime-media/rtc-server-sdk) when your main question is how devices or backend services participate in the real-time workflow.

## Common reading paths

- Interactive live streaming with large audience playback: [Voice & Video](/en/realtime-media/rtc) -> [Media Push](/en/realtime-media/media-push) -> [Fusion CDN](/en/realtime-media/fusion-cdn)
- Meeting archive and searchable records: [Voice & Video](/en/realtime-media/rtc) -> [Cloud Recording](/en/realtime-media/cloud-recording) -> [Transcription & Translation](/en/realtime-media/speech-to-text)
- External stream into an interactive session: [Media Pull](/en/realtime-media/media-pull) or [Media Gateway](/en/realtime-media/rtmp-gateway) -> [Voice & Video](/en/realtime-media/rtc)
- Smart device connectivity with backend media control: [IoT & Edge](/en/realtime-media/rtsa) -> [Server Gateway](/en/realtime-media/rtc-server-sdk)
