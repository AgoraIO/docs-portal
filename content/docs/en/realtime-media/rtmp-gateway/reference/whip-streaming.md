---
title: "WHIP streaming"
description: "Use the WHIP protocol to push streams into Media Gateway."
---

This guide explains how to push streams to Media Gateway using the WHIP protocol.

## Understand the tech

WHIP (WebRTC-HTTP Ingestion Protocol) is an open standard for secure, high-bandwidth, low-latency WebRTC streaming ingestion. Compared to RTMP, WHIP is significantly more resilient to weak network conditions and has built-in load balancing.

When using the WHIP protocol to push streams to Media Gateway, the following codecs are supported:

- **Video**: H.264, H.265, AV1
- **Audio**: OPUS

## Configure with OBS

Set up WHIP streaming in OBS Studio by configuring the server and Bearer token settings.

1. In the **Server** field, enter your streaming domain name in the following format:

   ```text
   https://{streaming_domain_name}/whip
   ```

   You can use the Agora unified domain name or bind your own domain name.

   - To use the unified domain name, use `whip-rtcpush-prod-{region}.agoramdn.com`. Replace `{region}` with your actual region. Supported regions are:
     - `na`: North America
     - `eu`: Europe
     - `ap`: Asia, except Mainland China
     - `cn`: Mainland China
   - To use your own domain name, contact Agora [technical support](mailto:support@agora.io) for configuration before use.

2. In the **Bearer token** field, enter the streaming key. To obtain a key, see [Get streaming key](../quickstart#get-streaming-key).

:::note
OBS lets you enable Simulcast for a WHIP stream, sending multiple resolution/frame rate layers in addition to the main stream. Media Gateway only receives the main stream and ignores the other layers, so enabling Simulcast in OBS has no effect on what the gateway does with the stream.
:::

If video transcoding isn't enabled on the stream's template, Media Gateway forwards the stream directly into the channel. If video transcoding is enabled, Media Gateway decodes the incoming stream first, then re-encodes it according to the template (single stream, large stream, or ABR).

## Configure with FFmpeg

WHIP support landed in the FFmpeg trunk in June 2025 and first shipped in the official FFmpeg 8.0 release. As of FFmpeg 9.0.1, it's still marked experimental and isn't recommended for production use.

Before using it, confirm your FFmpeg build has WHIP support enabled:

```bash
ffmpeg -version
```

Check that the `configuration` line includes `--enable-muxer=whip`.

### Use the Agora unified domain name

If your source video is H.264, H.265, or AV1 without B-frames, and your audio is already OPUS, push the stream without transcoding:

```bash
ffmpeg -re -i input.mp4 -c copy \
    -f whip -ts_buffer_size 2097152 -authorization "{streamkey}" \
    https://whip-rtcpush-prod-{region}.agoramdn.com/whip
```

If your audio isn't OPUS, transcode only the audio. Video still passes through untouched if it's already H.264, H.265, or AV1 without B-frames:

```bash
ffmpeg -re -i input.mp4 -c:v copy -c:a libopus -b:a 128k -ar 48000 -ac 2 \
    -f whip -ts_buffer_size 2097152 -authorization "{streamkey}" \
    https://whip-rtcpush-prod-{region}.agoramdn.com/whip
```

If neither your video nor your audio meets those conditions, transcode both. Adjust resolution, frame rate, and bitrate as needed, and keep the other parameters as shown:

```bash
ffmpeg -re -i input.mp4 -c:v libx264 -preset veryfast -tune zerolatency \
    -profile:v high -bf 0 \
    -s:v 1920x1080 -fps_mode:v cfr -b:v 3000k -r:v 30 -g:v 60 \
    -c:a libopus -b:a 128k -ar 48000 -ac 2 \
    -f whip -ts_buffer_size 2097152 -authorization "{streamkey}" \
    https://whip-rtcpush-prod-{region}.agoramdn.com/whip
```

### Use a custom domain name

Replace the Agora unified domain with your own domain; the same transcoding conditions apply.

```bash
ffmpeg -re -i input.mp4 -c copy -f whip -authorization "{streamkey}" https://push.example.com/whip
```
