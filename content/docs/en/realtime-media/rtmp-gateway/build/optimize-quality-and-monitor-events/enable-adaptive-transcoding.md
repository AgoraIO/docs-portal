---
title: "Enable adaptive transcoding"
description: "Skip transcoding for source streams that already meet your target specification."
---
By default, a stream template transcodes every stream bound to it, even if the source already matches your target codec, resolution, frame rate, and bitrate. Adaptive transcoding lets Media Gateway skip transcoding for streams that already meet your requirements, and transcode only the streams that don't. This reduces unnecessary transcoding cost and latency.

This guide explains how to configure a stream template to transcode conditionally.

## Understand the tech

Adaptive transcoding evaluates an expression against the properties of the incoming source stream. If the expression evaluates to true, Media Gateway transcodes the stream using the template's configured output settings. If it evaluates to false, Media Gateway passes the source stream through without transcoding.

You can reference the following source stream properties in an expression:

| Variable | Description |
| --- | --- |
| `codec` | Source stream codec, as a numeric `VIDEO_CODEC_TYPE` value: `2` (H.264), `3` (H.265), or `12` (AV1). |
| `width` | Source stream width, in pixels. |
| `height` | Source stream height, in pixels. |
| `fps` | Source stream frame rate. |
| `bitrate` | Source stream bitrate, in Kbps. |
| `gop` | Source stream GOP size. |
| `bframes` | Number of B-frames in the source stream. |

For example, the expression `bitrate > 4000 or bframes > 0` transcodes a stream only if its bitrate exceeds 4000 Kbps or it contains B-frames.

:::note
`codec` is numeric, not a string like `"H.264"`. For example, `codec == 12` matches an AV1 source stream.
:::

You can also apply an expression to individual ABR layers, so each layer transcodes only when needed. See [Enable adaptive bitrate](./enable-adaptive-bitrate.md).

## Implementation

Configure adaptive transcoding when you create or update a stream template.

### API endpoint

Use the **Create or reset template** API:

- Method: `PUT`
- Endpoint: `https://api.agora.io/{region}/v1/projects/{appId}/rtls/ingress/stream-templates/{templateId}`
- Authentication: HTTP Basic authentication or HMAC authentication

Relevant request fields:

| Field | Required | Description |
| --- | --- | --- |
| `settings.transcoding.video.enabled` | Yes | Enables video transcoding. Set this field to `true` to use adaptive transcoding. |
| `settings.transcoding.video.mode` | Yes | Transcoding mode. Set to `adaptive` to transcode only when the source stream matches `adaptFilters`. |
| `settings.transcoding.video.adaptFilters` | Yes | Expression evaluated against the source stream. Media Gateway transcodes the stream only when this expression is true. |
| `settings.transcoding.video.codec`, `width`, `height`, `fps`, `bitrate` | No | Output settings applied when the expression matches. |

### Request example

This example transcodes to 720p H.264 only if the source bitrate exceeds 4000 Kbps or the source has B-frames; otherwise, it passes the source stream through unchanged.

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
          "mode": "adaptive",
          "adaptFilters": "bitrate > 4000 or bframes > 0",
          "codec": "H.264",
          "width": 1280,
          "height": 720,
          "fps": 30,
          "bitrate": 1500
        }
      }
    }
  }'
```

:::note
Media Gateway doesn't validate `adaptFilters` when you save the template. It only parses the expression when a stream is evaluated against it. A typo doesn't return an error; it just means the condition silently never matches, and your stream never transcodes. Test your expression against real source streams in a staging environment before using it in production.
:::
