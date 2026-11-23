---
title: "Common video profiles"
description: "Recommended video bitrates and bitrate selection behavior for Media Gateway transcoding."
---

Use the following reference values when configuring the output resolution, frame rate, and bitrate in `settings.transcoding.video` of a stream configuration template. These recommendations apply to H.264 video in live broadcasting scenarios.

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

## How the output bitrate is selected

The `settings.transcoding.video.bitrate` value controls bitrate selection:

- **Omitted (follow the source bitrate)**: Media Gateway follows the source stream bitrate and limits the output bitrate to the corresponding reference bitrate above.
- **Set to `0` (automatic selection)**: Media Gateway chooses a bitrate based on the configured width and height.
- **Set to a positive value (explicit bitrate)**: Media Gateway uses the specified bitrate in Kbps. It does not automatically reduce this value to the recommended bitrate, even if the specified value exceeds the recommendation. Use the table to choose an appropriate value for your resolution and frame rate.

For example, the recommended bitrate for 1280 × 720 at 30 fps is `2400` Kbps. If you explicitly set `video.bitrate` to `5000`, Media Gateway does not reduce that configured value to `2400`.

For the full configuration schema, see [Create or reset a stream configuration template](/en/api-reference/api-ref/rtmp-gateway/create-reset-template).
