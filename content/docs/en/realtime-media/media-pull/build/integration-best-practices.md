---
title: "Best practice integrating Media Pull"
description: "Best practices for integrating Media Pull into your app"
---

To ensure reliability of Media Pull, follow the advice on this page when integrating Media Pull RESTful APIs.

## Prerequisites

You need the following to start using Media Pull RESTful API:

- The scene of the channel is live, profile set to `BROADCASTING`
- Media Pull is enabled

Agora also recommends enabling the Message Notification Service to monitor Media Pull events.

## Check the limits

Check that your Peak Concurrent Worker (PCW), Queries Per Second (QPS), and the number of streams do not exceed the following limits set by Agora.

#### QPS

Agora sets the following QPS limits for the Media Pull RESTful API:

| API | QPS limit |
|:--------|:---------------------|
| Create | <Slot name="create" /> |
| Delete | Deleting cloud players is limited to 100 queries per second. |
| List | <Slot name="list" /> |

<Slot for="create">

- Creating Media Pull tasks (cloud players) with names is limited to 2 queries per second.
- Creating cloud players without names is limited to 50 queries per second.

</Slot>

<Slot for="list">

- For a project with filter, the limit of the query rate is 2 times per second and 15 times per minute.
- When there is no filter, the limit of query rate is 10 times per second and 20 times per minute.

</Slot>

When the QPS limit is exceeded, the status code `429` (Too Many Requests) is returned. To extend the QPS limit, contact support@agora.io.

#### PCW

The PCW limit depends on your video stream resolution and region.

Resolutions:

- SD: Standard definition video, resolution ≤ 640 × 360
- HD: High definition video, resolution ≤ 1280 × 720 and > 640 × 360
- FHD: Full HD video, resolution ≤ 1920 × 1080 and > 1280 × 720

| Service type | Mainland China | Europe | America | Asia (excluding mainland China) |
|:-------------|:----------------------|:----------------------|:----------------------|:--------------------------------|
| Media Pull | <Slot name="media-pull-mainland-china" /> | <Slot name="media-pull-europe" /> | <Slot name="media-pull-america" /> | <Slot name="media-pull-asia-excluding-mainland-china" /> |

<Slot for="media-pull-mainland-china">

- SD 20
- HD 20
- FHD 10

</Slot>

<Slot for="media-pull-europe">

- SD 20
- HD 10
- FHD 5

</Slot>

<Slot for="media-pull-america">

- SD 20
- HD 10
- FHD 5

</Slot>

<Slot for="media-pull-asia-excluding-mainland-china">

- SD 20
- HD 20
- FHD 5

</Slot>

If you need to extend the PCW limit, contact support@agora.io.

### Number of streams

The upper limit of video attributes supported by Agora is as follows:

- Resolution 1920 × 1080
- Frame rate 30 FPS

The maximum number of supported streams is as follows:

| Service type | Mainland China | Europe | America | Asia (excluding mainland China) |
|:---------------|:----------------------|:---------------------|:----------------------|:--------------------------------|
| Media Pull | <Slot name="media-pull-mainland-china" /> | <Slot name="media-pull-europe" /> | <Slot name="media-pull-america" /> | <Slot name="media-pull-asia-excluding-mainland-china" /> |

<Slot for="media-pull-mainland-china">

- SD 20
- HD 20
- FHD 10

</Slot>

<Slot for="media-pull-europe">

- SD 20
- HD 10
- FHD 5

</Slot>

<Slot for="media-pull-america">

- SD 20
- HD 10
- FHD 5

</Slot>

<Slot for="media-pull-asia-excluding-mainland-china">

- SD 20
- HD 20
- FHD 5

</Slot>

:::caution[Important]
If you need to inject multiple streams of different resolutions at the same time, make sure you meet the following requirements:<ul><li>The number of streams per resolution cannot exceed the corresponding limit for that resolution.</li><li>The total number of streams cannot exceed the limit set for the higher resolution. For example, if you need to inject both SD and HD streams in Europe, the total number of streams cannot exceed 20. If you need to inject HD and FHD, the total number cannot exceed 10.</li></ul>
:::

## Ensure the high availability of REST services

To ensure the high availability of REST services and prevent downtime caused by regional network faults, Agora provides
failover and domain name switch.

### Failover

Network failures and risks may be caused by cloud and network software, infrastructure, and other factors that Agora cannot control.
To provide the best possible user experience, Media Pull provides high availability automatic task migration for failure recovery.
After a failure is confirmed, the Media Pull task is migrated within 240 seconds. During this period, the task may be interrupted.

If you cannot accept the impact of high availability migration based on your own business characteristics, adopt higher quality assurance measures. For example, create multiple Media Pull tasks for critical
scenes. Alternatively, you can make periodic API calls and monitor notifications to get the latest
task status, then create a new task with a different UID once you confirm the task status is unhealthy.

### Multiple Media Pull tasks

If you need a more reliable solution than fault recovery, use multiple Media Pull tasks.

Start a master Media Pull task and multiple backup tasks at the same time, then publish their streams into the same channel.
In your app, subscribe audience members to the master stream and listen to the following callback events:

  - `onUserOffline` - The callback saying that the anchor is offline
  - `onRemoteAudioStateChanged/onRemoteVideoStateChanged` - The host audio and callback state has changed

When you receive these notification, notify the apps where users are subscribed to the channel as audience members so that they switch to a backup stream.

When you create multiple Media Pull tasks, you are charged separately for each of them. For details, see [Media Pull pricing](../reference/pricing).

### Switch the domain name

To ensure high availability of REST services, Agora enables you to switch domain names when you experience service outage due to regional network failures. Take the following steps to set up and switch your domain name:

1. Set the primary domain name based on the location of your service server:
    - If the DNS address of the service server is located in a country or region other than mainland China, set the primary domain name to `api.agora.io`.
    - If the DNS address of the service server is in mainland China, set the primary domain name to `api.sd-rtn.com`.

2. If your attempt to initiate a RESTful API request using the primary domain fails, set up your retry strategy as follows:

    1. **Primary domain retry**: Retry using the same primary domain name.

    2. **Alternate domain retry**:
        - If the current primary domain name is `api.sd-rtn.com`, use `api.agora.io` as the  alternate domain name.
        - If the current primary domain name is `api.agora.io`, use `api.sd-rtn.com` as the alternate domain name.

    3. **Adjacent domain retry**: If alternate domain retry fails, retry using the domain name adjacent to the current region.

        For example, suppose your business server is located in Europe. You set the primary domain name to `api.agora.io`, and the business server resolves the primary domain name to Germany. Germany is located in central Europe (`api-eu-central-1.agora.io`). The [domain name table](#domain-name-table) shows that the adjacent area is West Europe. Use the `api-eu-west-1.agora.io` or `api-eu-west-1.sd-rtn.com` domain name to retry.

#### Precautions

Take the following precautions when setting up your retry strategy:

* To avoid exceeding the QPS limit with retry requests, best practice is to use a back-off strategy. For example, wait 1 second before you retry for the first time, wait 3 seconds before retrying the second time, and wait 6 seconds before retry a third time.

* If the request fails because of a network problem rather than a DNS domain name resolution problem, skip alternate domain retry and proceed to adjacent domain retry.

* Before switching to the region domain name, ensure that the REST services you wish to use, for example, cloud recording or channel management, are deployed in that region.

### Domain name table

The following table shows the primary and region domain names for various regions.

|Primary domain name  |Region domain name	|Region|
|:--------------------|:--------------------|:-----|
|`api.sd-rtn.com`      |`api-us-west-1.sd-rtn.com` |Western United States|
|                      |`api-us-east-1.sd-rtn.com` |Eastern United States|
|                      |`api-ap-southeast-1.sd-rtn.com`|Southeast Asia Pacific|
|                      |`api-ap-northeast-1.sd-rtn.com`| Northeast Asia Pacific|
|                      |`api-eu-west-1.sd-rtn.com` |Western Europe|
|                      |`api-eu-central-1.sd-rtn.com` |Central Europe|
|                      |`api-cn-east-1.sd-rtn.com`|East China|
|                      |`api-cn-north-1.sd-rtn.com`|North China|
|`api.agora.io`        |`api-us-west-1.agora.io`|Western United States|
|                      |`api-us-east-1.agora.io`|Eastern United States|
|                      |`api-ap-southeast-1.agora.io`|Southeast Asia Pacific|
|                      |`api-ap-northeast-1.agora.io`|Northeast Asia Pacific|
|                	    |`api-eu-west-1.agora.io`|Western Europe|
|                      |`api-eu-central-1.agora.io`|Central Europe|
|                      |`api-cn-east-1.agora.io`|East China|
|                      |`api-cn-north-1.agora.io`|North China|

## Troubleshooting and recommended measures

### Retry with retreat strategy

If you receive `404`, `429`, or `5xx` error codes, take an escape strategy. For example, wait 5-6 seconds, 10-11 seconds,
or 15-16 seconds and try again.
If you get three consecutive `404` or `5xx` error codes, or if the `state` field in the response to checking the status of a media push task says `failed`, it means that the Media Pull task has failed. To fix this problem, follow these steps:

1. Check whether the media stream address is correct and whether the media stream can be played.
2. If the media stream address is correct and can be played, destroy the current cloud player and create a new one.

### Troubleshooting by error code

- If the status code is `200`, the request is successful.
- If the status code is not `200`, the request has failed. See the error message in the response body for clarification.

|Status code               |Possible error message |Possible reason of failure | Measures to take                                                     |
|:-------------------------|:------------|:--------------|:---------------------------------------------------------------------|
|`400` Bad Request	       |The 'streamUrl' parameter is incorrectly formatted. The `channelName` parameter is invalid. Fix it in your request and retry.|Wrong parameters| Check by referring to the `reason` field in the HTTP response body. |
|`401` Unauthorized	       |Invalid authentication credentials.	|RESTful API authentication failed. | See [RESTful Authentication](../reference/restful-authentication).   |
|`403` Forbidden	       |Cloud player is not enabled for this project. Contact us to enable it. This project's permission to use cloud player was revoked. Contact us for details.|The service is not enabled. | Enable the service.                                                  |
|`404` Not Found	       |Resource is not found or destroyed.	|The task was not started or is in the process of failover or deletion. | Retry following the retreat strategy.                                |
|`409` Conflict	           |Resource with the same name already exists.	|Resource with the same name already exists.| Delete the existing cloud player and create it again.                |
|`429` Too Many Requests   |Request rate limit exceeded. Resource quota exceeded. No available resources.| Too many requests.	| Retry following the retreat strategy.                                |
|`500` Unknown	           |Some internal error happened. Contact us to help fix it.	| Internal error.	| Retry following the retreat strategy.                                |
|`502` Bad gateway	       |Internal errors. Contact us for troubleshooting. |	Internal error. | 	Retry with retreat strategy.                                        |
|`503` Service Unavailable |Service overload. Retry with the retreat strategy and contact us to help fix it. Service unavailable temporarily. Retry with the retreat strategy.	|Internal error	| Retry following the retreat strategy.                                |
|`504` Gateway Timeout	   |Gateway timeout. Query to check whether the player has been created or to create one instead.	|Internal error.	| Retry following the retreat strategy.                                |

### Contact Agora technical support

If the error persists, print the `X-Request-ID` and `X-Resource-ID` fields in the response header in the log and contact technical support.

## Integration checklist
Refer to the following table to quickly check whether each check item meets the integration requirements to ensure the
reliability of Media Pull.

| Required or optional | Item | Check |
|:--------------------|:----------|:----------------|
| Required | Channel mode | Ensure that the scene of the channel is live. |
| Required | Availability | Enable Media Pull. |
| Required | QPS limit | Ensure that the rate of API calls in a project is below the maximum limit. |
| Required | Maximum number of concurrent Tasks | Ensure that the number of concurrent tasks in a project is below 50. |
| Optional | Cloud player user name | <Slot name="optional" /> |
| Required | Region | <Slot name="required" /> |
| Required | Idle timeout | Set an appropriate `idleTimeout` value. 300 seconds is recommended. |
| Optional | Troubleshooting | <Slot name="optional-2" /> |
| Optional | Message notifications | Enable message notification service for Media Pull and listen to Media Pull events. |

<Slot for="optional">

- Set UID or account as the user name for cloud player. Do not set both fields at the same time.
- Use the name field to manage the cloud player under the specified project.

</Slot>

<Slot for="required">

- Set the region in the same area as your media streaming.
- Pass region value in lowercase.

</Slot>

<Slot for="optional-2">

Rectify the errors as follows:

- Use the retreat strategy.
- Check the error code.

If the preceding troubleshooting methods do not resolve the problem, print the values of the `X-Request-ID` and `X-Resource-ID` fields in the response header and contact Agora technical support.

</Slot>
