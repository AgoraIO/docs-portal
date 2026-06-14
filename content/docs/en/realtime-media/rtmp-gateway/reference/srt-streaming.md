---
title: "SRT streaming"
description: "Use the SRT protocol to push streams into Media Gateway."
---

# SRT streaming

This guide explains how to push streams to Media Gateway using the SRT protocol.

## Understand the tech

SRT (Secure Reliable Transport) is an open-source protocol developed by Haivision and promoted by the SRT Alliance. It provides secure, high-quality, low-latency video streaming. Compared to RTMP, SRT performs better for live streaming over unstable network connections.

When using the SRT protocol to push streams to Media Gateway, the following codecs are supported:

- **Video**: H.264, H.265
- **Audio**: AAC, OPUS

## Configure with OBS

Set up SRT streaming in OBS Studio by configuring the server and stream key settings.

1. In the **Server** field, enter your streaming domain name in the following format:

```text
srt://{streaming_domain_name}:6001
```

![Server settings](/images/media-gateway/srt-server-setting.png)

You can use the Agora unified domain name or bind your own domain name.

- To use the unified domain name, use `srtlive-rtcpush-prod-{region}.agoramdn.com`.
- To use your own domain name, contact Agora [technical support](mailto:support@agora.io) before use.

2. In the **Stream Key** field, enter the streaming key. To obtain a key, see [Media Gateway quickstart](../build/quickstart-best-practices.md).

> ℹ️ **Info**
> When using a custom domain name, you must add domain parameters to your stream key using the format `{streaming_code}?h={streaming_domain_name}` because the SRT protocol does not transmit domain name information to the server by default.

## Configure with FFmpeg

Use [`ffmpeg`](https://ffmpeg.org/) to push SRT streams directly from the command line.

- Use the Agora unified domain name:

```text
ffmpeg -re -i input.mp4 -c copy -f mpegts 'srt://srtlive-rtcpush-prod-{region}.agoramdn.com:6001?streamid={streamkey}'
```

- Use a custom domain name:

```text
ffmpeg -re -i input.mp4 -c copy -f mpegts 'srt://example.com:6001?streamid=#!::r={streamkey},h=example.com'
```
