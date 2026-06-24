---
title: "Enable adaptive bitrate"
description: "Configure ABR layers for Media Gateway video transcoding."
---
Adaptive Bitrate (ABR) streaming delivers multiple video quality levels from a single source, allowing viewers to automatically switch between different bitrates based on their network conditions and device capabilities. This ensures optimal viewing experience by reducing buffering and maintaining the highest possible quality for each viewer's situation.

This guide explains how to configure Adaptive Bitrate (ABR) encoding for video transcoding in Media Gateway.

## Understand the tech

ABR works by encoding the same video content at multiple resolutions and bitrates, called layers. Viewers can then select or automatically switch between different layers based on their available bandwidth and device performance. Media Gateway supports ABR through the `simulcastStreamLayers` configuration in stream templates. When enabled, the system creates multiple encoding layers from your source stream.

Following are the key ABR concepts:

- **Source stream**: The original stream pushed by the client without transcoding.
- **Main stream**: The primary transcoded stream output by Media Gateway when video transcoding is enabled. Resolution does not exceed the source stream resolution.
- **Layer**: Additional streams with lower bitrates that Media Gateway outputs based on your configuration.
- **Layer ID**: A unique identifier for each layer stream, ranging from 1 to 7.
- **Low stream**: A lower-quality stream option that was available before full ABR support. It is now implemented as Layer ID 7 to maintain compatibility with existing applications that expect this stream type.

:::note
ABR layers are independent. Enabling ABR does not automatically create a low stream.
:::

## ABR configuration

Configure ABR encoding in stream configuration templates using the `settings.transcoding.video.simulcastStreamLayers` parameter.

### Request example

```bash
curl --request PUT \
  --url http://${host}/${region}/v1/projects/${appid}/rtls/ingress/stream-templates/${templateId} \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Basic XXXXXX' \
  --data '{
    "settings": {
      "transcoding": {
        "video": {
          "enabled": true,
          "width": 1920,
          "height": 1080,
          "fps": 30,
          "bitrate": 3800,
          "simulcastStreamLayers": [
            { "id": 1, "width": 1280, "height": 720, "fps": 30, "bitrate": 2400 },
            { "id": 2, "width": 960, "height": 540, "fps": 30, "bitrate": 1500 },
            { "id": 3, "width": 854, "height": 480, "fps": 30, "bitrate": 800 },
            { "id": 7, "width": 640, "height": 360, "fps": 30, "bitrate": 500 }
          ]
        },
        "audio": {
          "enabled": true,
          "profile": 3
        }
      }
    }
  }'
```

### Configuration requirements

- Maximum 5 simultaneous layers per stream
- Specify at least one dimension for the main stream when ABR is enabled
- Specify at least one dimension for each ABR layer
- Specify bitrates in decreasing order by Layer ID
- Clients must specify the Layer ID when subscribing to receive the corresponding quality layer

### Layer ID selection

Recommended mapping:

| Layer ID | Resolution |
| --- | --- |
| 1 | 3840x2160 (4K) |
| 2 | 2560x1440 (2K) |
| 3 | 1920x1080 (1080p) |
| 4 | 1280x720 (720p) |
| 5 | 960x540 (540p) |
| 6 | 854x480 (480p) |
| 7 | 640x360 (360p) |

## Webhook notifications

To help you monitor the ABR configuration for each stream, Media Gateway provides this information through webhooks. When video transcoding is enabled, the `live_stream_connected` event includes the transcoding configuration details for your stream. See [Receive notifications about channel events](receive-notifications.md).
