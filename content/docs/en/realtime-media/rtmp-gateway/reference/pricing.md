---
title: "Pricing"
description: "Unit pricing and billing model for Media Gateway streaming and transcoding."
---

This page explains how Agora calculates your monthly bill for use of Media Gateway. If you have signed a contract with Agora, the billing terms and conditions within that contract take precedence.

## Cost structure

Agora Media Gateway usage incurs fees when transcoding and streaming media streams to RTC SDK channels. Those fees are not included in the 10,000 free minutes per month policy.

### Streaming without transcoding

If the video stream is not transcoded before streaming, only the audio and video streaming fee is charged.

*Video streaming fee without transcoding = video streaming unit price without transcoding x video streaming duration*

### Streaming with transcoding

- **Pure audio transcoding and streaming**:
  *Audio transcoding and streaming fees = audio unit price x duration*
- **Video transcoding and streaming**:
  *Video transcoding and streaming fees = video transcoding and streaming unit price x duration*

:::note
The audio stream in the channel is transcoded and pushed by default. If a channel has both audio and video streams, the fee is calculated based on the video stream.
:::

### Unit price

| Usage | Unit price (US$) |
| --- | ---: |
| Pure audio transcoding and streaming | 0.99/1000 min |
| Video streaming with transcoding | 5.99/1000 min |
| Video streaming without transcoding | 2.99/1000 min |

### Streaming duration

For each streaming process, Agora monitors when you start and stop streaming. It calculates the duration in seconds from the moment streaming begins to when it ends and charges a streaming fee based on that time.

:::note
The duration is displayed in seconds in Agora Console and in minutes on the billing invoice. If the duration is less than one second or one minute, it is rounded up to one second or one minute, respectively.
:::

Depending on whether the video stream is pushed, the push duration is divided into:

- **Video streaming duration**: The duration during which the streaming server handles video
- **Audio streaming duration**: The time during which only the audio stream is transmitted by the streaming server

## Billing examples

### Video streaming

Suppose that you use Media Gateway to push a video stream that does not require transcoding in a channel, and the push duration is 3000 minutes.

The cost of video streaming without transcoding is `2.99 x 3000 / 1000 = 8.97 USD`.

### Pure audio transcoding and streaming

Suppose that you use Media Gateway to push a pure audio stream in a channel, and the push duration is 2000 minutes.

The pure audio transcoding and streaming cost is `0.99 x 2000 / 1000 = 1.98 USD`.

### Video transcoding and streaming

Suppose that you use Media Gateway to push a video stream with transcoding in a channel. The transcoded stream duration is 2000 minutes and the video resolution is 1920 x 1080.

The cost of video transcoding and streaming is `5.99 x 2000 / 1000 = 11.98 USD`.
