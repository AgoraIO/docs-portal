---
title: "Release notes"
description: "Past releases and notable updates for Media Gateway."
---

This page provides the release notes for Media Gateway.

## 2026.9.10

### New features

- **WHIP streaming protocol support**

  Media Gateway now accepts the WHIP protocol for pushing streams, in addition to RTMP and SRT. WHIP is more resilient to weak network conditions than RTMP and has built-in load balancing. Supported codecs are H.264, H.265, and AV1 for video, and OPUS for audio. For configuration details, see [WHIP streaming](../build/push-streams/whip-streaming.md).

## 2026.8.12

### New features

- **AV1 video transcoding**

  Stream templates support AV1 as a transcoding output codec, in addition to H.264 and H.265. Use AV1 to reduce bitrate at the same visual quality, or to serve players that require AV1 playback. For configuration details, see [AV1 transcoding](../build/process-media/enable-av1-transcoding.md).

- **G.711 audio ingest**

  RTMP and RTMPS ingest now accepts G.711 A-law and u-law audio, commonly used by security cameras and hardware encoders. Media Gateway maps G.711 audio to PCMA or PCMU without requiring a transcoding template. For details, see [Push G.711 audio](../build/push-streams/enable-g711-audio-ingest.md).

- **Adaptive transcoding**

  Stream templates support conditional transcoding. You define an expression based on source stream properties, such as bitrate, frame rate, and B-frames, and Media Gateway transcodes a stream only when it doesn't already meet your target specification. For configuration details, see [Adaptive transcoding](../build/process-media/enable-adaptive-transcoding.md).

- **Custom domains and TLS certificates**

  Configure custom RTMPS streaming domains and manage TLS certificates through the REST API, including requesting an Agora-issued certificate or importing your own. For configuration details, see [RTMP and RTMPS streaming](../build/push-streams/rtmp-streaming.md).

- **Global streaming keys**

  Create a streaming key that works across all Media Gateway regions, instead of being scoped to a single region. You can also revoke a global streaming key across all regions in a single request. For details, see [Create a global streaming key](../quickstart.md#create-a-global-streaming-key).

- **Dual-stream high availability**

  Bind two streaming keys to the same channel and user ID, then stream to a primary and a backup domain at the same time. Media Gateway can automatically fail over to the backup stream if the primary stream drops or degrades in quality. For details, see [Dual-stream](../build/push-streams/enable-dual-stream-ha.md).

## 2025.5.28

### New features

- **Low-bitrate high-quality streaming**

  Video transcoding now supports low-bitrate high-quality streaming through PVC and Super Resolution features. For configuration details, see [PVC and Super Quality](../build/process-media/pvc-and-super-quality-configuration.md).

- **Adaptive Bitrate (ABR)**

  Stream configuration templates now support ABR functionality. For configuration details, see [Adaptive bitrate (beta)](../build/process-media/enable-adaptive-bitrate.md).

- **SRT streaming protocol support**

  Gateway nodes now support the SRT protocol with the following codec formats:

  - Video: H.264, H.265
  - Audio: AAC, OPUS

  For configuration details, see [SRT streaming](../build/push-streams/srt-streaming.md).

### Improvements

- **NCS callback configuration by VID**

  Configure NCS callback logic by VID. For the `live_profile_updated` event, you can configure which `profile` fields are required.

- **NCS callback event updates**

  This version updates the format of NCS callback events, including:

  - `live_stream_connected`: Now includes transcoding parameter configuration information for the current stream
  - `live_stream_disconnected`: Now includes total input and output bytes for the stream, enabling average bitrate calculation when combined with stream start and end times

## 2024.8.21

This release includes the following updates:

- Adds support for a backup primary domain name and a secondary domain name to ensure service availability.
- Adds the `mode` field for setting the transcoding mode, and updates `width`, `height`, and `fps` fields to support more transcoding options.

## 2024.6.21

Agora Media Gateway reaches General Availability status with the following core functions:

- Pushing media streams into Agora SDRTN(R)
- Supporting RTMP and SRT streaming protocols, H.264 and H.265 video codecs, and AAC audio codec
- Customizing transcoding options, including video resolution, frame rate, and bitrate
