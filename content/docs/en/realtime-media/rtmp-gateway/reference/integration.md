---
title: "Integration best practices"
description: "Recommended video profiles, high-availability domain strategy, and troubleshooting guidance for Media Gateway in production."
---

This document presents best practices for reliably integrating Media Gateway in your app. Before reading this document, follow the [Media Gateway quickstart](../quickstart.md) to understand the basic process of using Media Gateway.

For API call limits and concurrent stream quotas, see [Limitations](/en/api-reference/api-ref/rtmp-gateway/limitations).

## Common video profiles

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

If you set `video.bitrate` to a supported positive value, Media Gateway does not automatically adjust it to match these recommendations. In bitrate-following mode, these reference values are used to limit the bitrate. If `video.bitrate` is `0`, Media Gateway calculates the encoding target from the output resolution and frame rate. An encoding target is not a guarantee of the measured sending bitrate.

## Ensure high availability of streaming services

Use the primary and backup domains for the same region and ingest protocol:

| Region | Protocol | Primary domain | Backup domain |
| --- | --- | --- | --- |
| `cn` | RTMP | `rtls-ingress-prod-cn.agoramdn.com` | `cn.mediagw.realtimemesh.com` |
| `cn` | SRT | `srtlive-rtcpush-prod-cn.agoramdn.com` | `srtlive-cn.mediagw.realtimemesh.com` |
| `cn` | WHIP | `whip-rtcpush-prod-cn.agoramdn.com` | `whip-cn.mediagw.realtimemesh.com` |
| `ap` | RTMP | `rtls-ingress-prod-ap.agoramdn.com` | `ap.rtmpg.rtelink.com` |
| `ap` | SRT | `srtlive-rtcpush-prod-ap.agoramdn.com` | `srtlive-ap.rtmpg.rtelink.com` |
| `ap` | WHIP | `whip-rtcpush-prod-ap.agoramdn.com` | `whip-ap.rtmpg.rtelink.com` |
| `eu` | RTMP | `rtls-ingress-prod-eu.agoramdn.com` | `eu.rtmpg.rtelink.com` |
| `eu` | SRT | `srtlive-rtcpush-prod-eu.agoramdn.com` | `srtlive-eu.rtmpg.rtelink.com` |
| `eu` | WHIP | `whip-rtcpush-prod-eu.agoramdn.com` | `whip-eu.rtmpg.rtelink.com` |
| `na` | RTMP | `rtls-ingress-prod-na.agoramdn.com` | `na.rtmpg.rtelink.com` |
| `na` | SRT | `srtlive-rtcpush-prod-na.agoramdn.com` | `srtlive-na.rtmpg.rtelink.com` |
| `na` | WHIP | `whip-rtcpush-prod-na.agoramdn.com` | `whip-na.rtmpg.rtelink.com` |

Use `rtmp://{domain}/live` as the RTMP server address, `srt://{domain}:6001` with the SRT `streamid`, or `https://{domain}/whip` with the streaming key as the Bearer token for WHIP.

1. Choose the primary domain for the source region and protocol.
2. If the connection fails, retry the primary domain with backoff.
3. If it still fails, retry the backup domain for that same region and protocol.

These steps change the entry domain for one source connection. Continuous primary/standby streaming is a separate mechanism.

For continuous protection against a degraded connection or a mid-broadcast drop, rather than just a failed push, see [Dual-stream](../build/push-streams/enable-dual-stream-ha.md).

## Ensure high availability of REST services

To ensure high availability of REST services, Agora enables you to switch domain names when you experience service outages due to regional network failures.

- If your service server is outside Mainland China, set the primary domain name to `api.agora.io`.
- If your service server is in Mainland China, set the primary domain name to `api.sd-rtn.com`.

If your primary-domain request fails, use a retry strategy with:

1. Primary domain retry
2. Alternate domain retry
3. Adjacent region domain retry

### Precautions

- Use a back-off strategy to avoid exceeding QPS limits with retry requests
- If the request fails because of a network problem rather than DNS resolution, skip alternate-domain retry and proceed to adjacent-domain retry
- Ensure that the REST services you use are deployed in the region you switch to

## Troubleshooting checklist

| # | Importance | Check |
| --- | --- | --- |
| 1 | required | The Media Gateway service has been enabled for your App ID |
| 2 | required | The API call rate is within the [documented limits](/en/api-reference/api-ref/rtmp-gateway/limitations#api-call-limits) |
| 3 | required | The number of concurrent streams is within the [applicable quota](/en/api-reference/api-ref/rtmp-gateway/limitations#maximum-number-of-concurrent-tasks) |
| 4 | required | The `region` is set to the geographical region of your media stream source, and the code is lowercase |
| 5 | optional | If calling the RESTful API fails, use a back-off strategy and inspect the response status |
| 6 | optional | If RTMP, SRT, or WHIP streaming fails, ensure that the streaming key has not expired and that OBS frame loss is normal |
| 7 | optional | If the streaming or REST service is unavailable due to a network failure, retry with the current primary domain first, then the backup domain |
