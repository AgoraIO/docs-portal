---
title: "Integration"
description: "Best practices for integrating Media Gateway reliably in production."
---

This document presents best practices for reliably integrating Media Gateway in your app. Before reading this document, follow the [Media Gateway quickstart](../build/quickstart-best-practices.md) to understand the basic process of using Media Gateway.

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
