---
title: "Integration"
description: "Best practices for integrating Media Gateway reliably in production."
---

This document presents best practices for reliably integrating Media Gateway in your app. Before reading this document, follow the [Media Gateway quickstart](../quickstart.md) to understand the basic process of using Media Gateway.

## API call limits

The Agora server limits the call rate of the Media Gateway API and returns the `429 (Too Many Requests)` status code when the rate limit is exceeded.

| API | Calling rate limit per project |
| --- | --- |
| `Create` | 50 per second |
| `Delete` | 50 per second |
| `Query` | 100 per second |
| `Update` | 50 per second |

## Maximum number of concurrent tasks

The limitation for concurrent streams is:

- 10 for streams with video transcoding
- 50 for streams without transcoding

For higher quotas, contact [Agora technical support](mailto:support@agora.io).

If you use [dual-stream high availability](#enable-dual-stream-high-availability), each protected source counts as two streams against this limit: one for the primary push and one for the backup, even while the backup is on standby.

## Ensure high availability of streaming services

Agora provides alternate domain names to reduce outages caused by regional network failures.

| Geographical area | Primary domain name | Alternate primary domain name | Secondary domain name |
| --- | --- | --- | --- |
| North America | `rtls-ingress-prod-na.agoramdn.com` | `na.rtmpg.rtelink.com` | `na-backup.rtmpg.rtelink.com` |
| Europe | `rtls-ingress-prod-eu.agoramdn.com` | `eu.rtmpg.rtelink.com` | `eu-backup.rtmpg.rtelink.com` |
| Asia excluding Mainland China | `rtls-ingress-prod-ap.agoramdn.com` | `ap.rtmpg.rtelink.com` | `ap-backup.rtmpg.rtelink.com` |
| Mainland China | `rtls-ingress-prod-cn.agoramdn.com` | none | `rtls-ingress-prod-backup-cn.agoramdn.com` |

Best practice:

1. Use the primary domain based on the geographical location of your source stream.
2. If the request fails, retry using the same primary domain.
3. If the retry still fails, try the alternate domain name.

## Enable dual-stream high availability

The domain-retry strategy helps when a single push fails outright. For streams that need continuous protection against degraded quality or a dropped connection mid-broadcast, use dual-stream high availability instead.

With dual-stream high availability, you push the same content to two independent streaming keys bound to the same channel and user ID: one over a primary domain, one over a backup domain. Media Gateway keeps the primary stream active and the backup on standby, and can automatically promote the backup if the primary stream fails or degrades.

### Set up dual streaming

1. Create two custom domains, one with `domainType: 0` (primary) and one with `domainType: 1` (backup). See [Configure a custom RTMPS domain](../build/configure-custom-domains/configure-rtmps-domain.md).
2. Create two streaming keys bound to the same `channel` and `uid`.
3. Enable `dualStreaming` for your project using adaptive mode (`switchStrategy: 2`), so Media Gateway also promotes the backup stream when the primary degrades in quality:

```bash
curl --request PUT \
  --url https://api.agora.io/${region}/v1/projects/${appId}/rtls/ingress/appconfig \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Basic XXXXXX' \
  --data '{
    "settings": {
      "dualStreaming": {
        "enabled": true,
        "switchStrategy": 2,
        "qualityThreshold": {
          "freezeRate": {
            "high": 30,
            "low": 5
          }
        },
        "adaptiveSwitchPolicy": {
          "windowCount": 5,
          "degradeCount": 3,
          "recoverCount": 3,
          "takeoverCount": 3,
          "cooldownMs": 30000
        }
      }
    }
  }'
```

4. Push to both domains at the same time, using the matching streaming key for each:

```
rtmps://primary-live.example.com/{app}/{primaryStreamKey}
rtmps://backup-live.example.com/{app}/{backupStreamKey}
```

### Switch strategies

Set `switchStrategy` in the `dualStreaming` request body to control how Media Gateway decides when to promote the backup stream:

| `switchStrategy` | Name | Behavior |
| --- | --- | --- |
| `0` | Failover | Media Gateway promotes the backup stream only when the primary stream disconnects. |
| `1` | Manual | The backup stream never takes over automatically. Use this if you want to control failover yourself. |
| `2` | Adaptive | In addition to failover, Media Gateway monitors primary stream video quality and promotes the backup stream if the primary degrades and the backup is healthy. Configure quality thresholds with `qualityThreshold` and `adaptiveSwitchPolicy`. |

With adaptive mode, quality is judged by `freezeRate` (in per-mille, so `30` means 3.0%) against a rolling window of samples. The defaults are:

| Field | Default | Description |
| --- | --- | --- |
| `windowCount` | `5` | Number of recent samples evaluated. |
| `degradeCount` | `3` | Bad samples (above the `high` threshold) within the window before the primary is marked degraded. |
| `recoverCount` | `3` | Consecutive good samples (below the `low` threshold) before a degraded primary recovers. |
| `takeoverCount` | `3` | Consecutive good samples the backup needs before it's allowed to take over. |
| `cooldownMs` | `30000` | Minimum time between takeovers. |

:::note
Dual-stream failover isn't instantaneous — Media Gateway takes about 10 seconds to detect that the primary stream is inactive — and it only helps if the two streams are genuinely independent. If both streams come from the same encoder or network uplink, a failure on one is likely to affect the other too.
:::

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
| 2 | required | The API call rate is below the maximum limit |
| 3 | required | The number of concurrent tasks in a project is less than 50 |
| 4 | required | The `region` is set to the geographical region of your media stream source, and the code is lowercase |
| 5 | optional | If calling the RESTful API fails, use a back-off strategy and inspect the response status |
| 6 | optional | If RTMP or SRT streaming fails, ensure that the stream key has not expired and that OBS frame loss is normal |
| 7 | optional | If the streaming or REST service is unavailable due to a network failure, retry with the current primary domain first, then the backup domain |
