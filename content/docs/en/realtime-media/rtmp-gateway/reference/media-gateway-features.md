---
title: "Media Gateway features"
description: "Key capabilities and common use cases for Media Gateway."
---

# Media Gateway features

Media Gateway enables users to push content to Agora SDRTN(R) using standard streaming protocols such as RTMP and SRT. The channel host automatically publishes this streamed content to the correct channel. With Media Gateway, you can employ advanced transcoding capabilities on media streams for enhanced distribution.

The following figure shows the overall architecture of Media Gateway:

![Product Architecture](/images/media-gateway/media-gateway-flow.svg)

## Product features

| Feature | Description |
| --- | --- |
| Media input | Supports generating a streaming key through a RESTful API or a local encryption algorithm, then pushing the source stream directly to Agora's gateway service. After a successful push, the media stream is automatically played in the channel for remote users. |
| Multiple media streaming formats and protocols | Supports H.264 and H.265 video codecs, AAC audio codec, RTMP and SRT push protocols, and FLV and MPEG-TS media formats. |
| Custom transcoding parameters | Supports enabling transcoding for media streams input into the channel. If you enable transcoding, you can set parameters such as resolution, frame rate, bitrate, and whether to enable large and small streams. |
| Restricted access area | When activating Media Gateway, you specify the access area to ensure the transmission quality of the media stream. |
| Server event notification callback | Agora provides message notification services. After activating Media Gateway, you receive event notifications. |

## Applicable use cases

| Use case | Description |
| --- | --- |
| Commentary from influencers and celebrities | Inject high-definition video streams into interactive channels. Multiple hosts can watch and interact in real time from different places. |
| Low-latency distribution | Distribute content to viewers faster and more reliably than with a CDN. |
| Recording and live broadcasting | A teacher records content in advance and injects it into a live classroom. Students and teaching assistants can watch the content and interact in real time. |
| 24-hour chat room | Background music is played continuously and is not interrupted when switching hosts. |
