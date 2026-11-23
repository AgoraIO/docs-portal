---
title: "Common video profiles"
description: "Reference bitrates for configuring Media Gateway video transcoding."
---

When video transcoding is enabled, use the following reference values to configure the output resolution, frame rate, and bitrate in `settings.transcoding.video` of a stream configuration template. These recommendations apply to H.264 video in live broadcasting scenarios.

## Recommended bitrates

| Resolution (width × height) | Frame rate (fps) | Recommended bitrate (Kbps) |
| --- | --- | --- |
| 640 × 360 | 15 | 680 |
| 640 × 360 | 30 | 1030 |
| 848 × 480 | 15 | 920 |
| 848 × 480 | 30 | 1400 |
| 960 × 540 | 15 | 1100 |
| 960 × 540 | 30 | 1670 |
| 1280 × 720 | 15 | 1600 |
| 1280 × 720 | 30 | 2400 |
| 1920 × 1080 | 15 | 2500 |
| 1920 × 1080 | 30 | 3780 |
| 1920 × 1080 | 60 | 5730 |

## Bitrate considerations

- If you specify a positive `video.bitrate` value within the API's supported range, Media Gateway does not automatically adjust that setting to match the recommendations in the table. Choose an appropriate value for your resolution and frame rate.
- In bitrate-following mode, Media Gateway uses these reference values to limit the bitrate.

For parameter ranges and the behavior when `video.bitrate` is omitted or set to `0`, see [Create or reset a stream configuration template](/en/api-reference/api-ref/rtmp-gateway/create-reset-template).
