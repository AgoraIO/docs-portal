---
title: "Common video profiles"
description: "Reference bitrates for configuring Media Gateway video transcoding."
---

Use the table below as a reference when setting `settings.transcoding.video` in a [stream configuration template](/en/api-reference/api-ref/rtmp-gateway/create-reset-template). The values apply to H.264 video transcoding in live broadcasting scenarios.

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

If you set `video.bitrate` to a supported positive value, Media Gateway does not automatically adjust it to match these recommendations. In bitrate-following mode, these reference values are used to limit the bitrate.
