---
title: "Media Gateway features"
description: "Key capabilities and common use cases for Media Gateway."
---


Media Gateway enables users to push content to Agora SDRTN(R) using standard streaming protocols such as RTMP and SRT. The channel host automatically publishes this streamed content to the correct channel. With Media Gateway, you can employ advanced transcoding capabilities on media streams for enhanced distribution.

The following figure shows the overall architecture of Media Gateway:

![Product Architecture](https://assets-docs.agora.io/images/media-gateway/media-gateway-flow.svg)

## Product features

| Feature | Description |
| --- | --- |
| Media input | Supports generating a streaming key through a RESTful API or a local encryption algorithm, then pushing the source stream directly to Agora's gateway service. After a successful push, the media stream is automatically played in the channel for remote users. Streaming keys can be scoped to a single region or created as global keys that work across all Media Gateway regions. |
| Multiple media streaming formats and protocols | Supports H.264, H.265, and AV1 video codecs, AAC and G.711 (A-law and u-law) audio codecs, RTMP and SRT push protocols, and FLV and MPEG-TS media formats. |
| Custom transcoding parameters | Supports enabling transcoding for media streams input into the channel. If you enable transcoding, you can set parameters such as resolution, frame rate, bitrate, and whether to enable large and small streams. You can also transcode conditionally, so a stream is transcoded only when the source doesn't already meet your target specification. |
| Custom domains and TLS certificates | Supports managing your own RTMPS streaming domain and TLS certificate through the REST API, either by requesting an Agora-issued certificate or importing your own. |
| Dual-stream high availability | Supports binding two streaming keys to the same channel and user ID and pushing to a primary and backup domain simultaneously. Media Gateway can automatically fail over to the backup stream if the primary stream drops or degrades in quality. |
| Restricted access area | When activating Media Gateway, you specify the access area to ensure the transmission quality of the media stream. |
| Server event notification callback | Agora provides message notification services. After activating Media Gateway, you receive event notifications. |

## Related APIs and implementation entry points

Use the following references when you implement the core Media Gateway capabilities described in [Product features](#product-features):

- [REST API overview](/en/api-reference/rtmp-gateway): Review the base URL, authentication model, and the full API surface.
- [RESTful authentication](/en/api-reference/api-ref/rtmp-gateway/restful-authentication): Authenticate server-side requests before calling Media Gateway APIs.
- [Query notification service IP address](/en/api-reference/api-ref/rtmp-gateway/query-ip-address): Retrieve the callback IP ranges used by notification services.

The main API groups map to product features as follows:

| Feature area | APIs or guides |
| --- | --- |
| Media input and stream key management | Use the streaming key APIs in the [REST API overview](/en/api-reference/rtmp-gateway) to create, query, and delete stream keys. For a local stream key generation example or to create a global streaming key, see the [Quickstart](../quickstart). |
| Online stream control | Use the online stream APIs in the [REST API overview](/en/api-reference/rtmp-gateway) to query active streams, inspect stream details, force disconnect a stream, or mute and unmute audio or video. |
| G.711 audio ingest | Push RTMP or RTMPS streams with G.711 audio by following [Push G.711 audio](../build/optimize-quality-and-monitor-events/enable-g711-audio-ingest.md). |
| Custom transcoding parameters | Use template APIs in the [REST API overview](/en/api-reference/rtmp-gateway) to create, update, delete, or set default transcoding templates for ingress streams. To transcode to AV1, see [Enable AV1 transcoding](../build/optimize-quality-and-monitor-events/enable-av1-transcoding.md). To transcode only when needed, see [Enable adaptive transcoding](../build/optimize-quality-and-monitor-events/enable-adaptive-transcoding.md). |
| Custom domains and TLS certificates | Manage your own RTMPS domain and certificate by following [Configure a custom RTMPS domain](../build/configure-custom-domains/configure-rtmps-domain.md). |
| Dual-stream high availability | Set up automatic failover between a primary and backup stream by following [Enable dual-stream high availability](integration.md#enable-dual-stream-high-availability). |
| Server event notification callback | Configure notifications by following [Receive notifications about channel events](../build/optimize-quality-and-monitor-events/receive-notifications.md), then use the [event type reference](/en/api-reference/api-ref/rtmp-gateway/media-gateway-event-types) to interpret callback payloads. |

## Applicable use cases

| Use case | Description |
| --- | --- |
| Commentary from influencers and celebrities | Inject high-definition video streams into interactive channels. Multiple hosts can watch and interact in real time from different places. |
| Low-latency distribution | Distribute content to viewers faster and more reliably than with a CDN. |
| Recording and live broadcasting | A teacher records content in advance and injects it into a live classroom. Students and teaching assistants can watch the content and interact in real time. |
| 24-hour chat room | Background music is played continuously and is not interrupted when switching hosts. |
