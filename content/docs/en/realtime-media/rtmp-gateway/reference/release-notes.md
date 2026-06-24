---
title: "Release notes"
description: "Past releases and notable updates for Media Gateway."
---

This page provides the release notes for Media Gateway.

## 2025.5.28

#### New features

- **Low-bitrate high-quality streaming**

  Video transcoding now supports low-bitrate high-quality streaming through PVC and Super Resolution features. For configuration details, see [PVC and Super Quality configuration](../build/pvc-and-super-quality-configuration.md).

- **Adaptive Bitrate (ABR)**

  Stream configuration templates now support ABR functionality. For configuration details, see [Enable adaptive bitrate](../build/enable-adaptive-bitrate.md).

- **SRT streaming protocol support**

  Gateway nodes now support the SRT protocol with the following codec formats:

  - Video: H.264, H.265
  - Audio: AAC, OPUS

  For configuration details, see [SRT streaming](srt-streaming.md).

#### Improvements

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
