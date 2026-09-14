---
title: "Dual-stream"
description: "Automatically fail over to a backup stream if the primary drops or degrades in quality."
---

Retrying a failed push against an alternate domain (see [Ensure high availability of streaming services](../../reference/integration.md#ensure-high-availability-of-streaming-services)) helps when a single push fails outright. For streams that need continuous protection against a degraded connection or a mid-broadcast drop, use dual-stream high availability instead.

With dual-stream high availability, you push the same content to two independent streaming keys bound to the same channel and user ID: one over a primary domain, one over a backup domain. Media Gateway keeps the primary stream active and the backup on standby, and can automatically promote the backup if the primary stream fails or degrades.

## Set up dual streaming

1. Create two custom domains, one with `domainType: 0` (primary) and one with `domainType: 1` (backup). See [RTMP and RTMPS streaming](./rtmp-streaming.md).
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

## Switch strategies

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
Dual-stream failover isn't instantaneous: Media Gateway takes about 10 seconds to detect that the primary stream is inactive. Failover also only helps if the two streams are genuinely independent. If both streams come from the same encoder or network uplink, a failure on one is likely to affect the other too.
:::

Each protected source also counts as two streams against your [concurrent task limit](../../reference/integration.md#maximum-number-of-concurrent-tasks): one for the primary push and one for the backup, even while the backup is on standby.
