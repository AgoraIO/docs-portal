---
title: "Enable AV1 transcoding"
description: "Configure AV1 as the video transcoding output codec for Media Gateway."
---
Media Gateway supports AV1 as a video transcoding output codec, in addition to H.264 and H.265. AV1 typically delivers the same visual quality at a lower bitrate than H.264, and lets you serve players that require AV1 playback.

This guide explains how to configure a stream template to transcode video to AV1.

## Understand the tech

When a streaming key is bound to a stream template with video transcoding enabled, Media Gateway transcodes the incoming stream to the codec, resolution, frame rate, and bitrate specified in the template. Set `settings.transcoding.video.codec` to `AV1` to output AV1 instead of the default H.264.

Media Gateway also recognizes and decodes AV1 video carried in RTMP enhanced FLV, so you can push an AV1 source stream directly.

:::note
AV1 encoding uses more compute than H.264 at the same resolution and frame rate. Evaluate your expected concurrency, resolution, and bitrate before enabling AV1 for a template used at scale.
:::

## Implementation

Set the codec when you create or update a stream template.

### API endpoint

Use the **Create or reset template** API:

- Method: `PUT`
- Endpoint: `https://api.agora.io/{region}/v1/projects/{appId}/rtls/ingress/stream-templates/{templateId}`
- Authentication: HTTP Basic authentication or HMAC authentication

Relevant request fields:

| Field | Required | Description |
| --- | --- | --- |
| `settings.transcoding.video.enabled` | Yes | Enables video transcoding. Set this field to `true` to transcode to AV1. |
| `settings.transcoding.video.codec` | Yes | Output video codec. Set to `AV1`. Defaults to `H.264` if omitted. |
| `settings.transcoding.video.width` | No | Encoding width in pixels. |
| `settings.transcoding.video.height` | No | Encoding height in pixels. |
| `settings.transcoding.video.fps` | No | Encoding frame rate in fps. If omitted, the source stream frame rate is used. |
| `settings.transcoding.video.bitrate` | No | Encoding bitrate in Kbps. If omitted, the source stream bitrate is used. |

Video transcoding output is capped at 3840 in `width`/`height`, 60 in `fps`, and 20000 in `bitrate` (Kbps).

### Request example

The following example transcodes the source stream to 720p AV1.

```bash
curl --request PUT \
  --url https://api.agora.io/${region}/v1/projects/${appId}/rtls/ingress/stream-templates/${templateId} \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Basic XXXXXX' \
  --data '{
    "settings": {
      "transcoding": {
        "video": {
          "enabled": true,
          "codec": "AV1",
          "width": 1280,
          "height": 720,
          "fps": 30,
          "bitrate": 1500
        }
      }
    }
  }'
```

Bind a streaming key to this template, then push a stream to that key. Media Gateway transcodes the video to AV1 before publishing it to the channel.

:::note
Make sure your playback clients or downstream services can decode AV1 before you route production traffic through an AV1 template. If some clients can't decode AV1, keep using H.264 for those streams, or route by client capability.
:::
