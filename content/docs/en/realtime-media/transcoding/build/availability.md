---
title: Ensure high availability
description: Guidelines to ensure high availability of transcoding service.
---

To ensure the high availability of cloud transcoding services and reduce the impact of network failures, Agora offers solutions such as failover migration, multi-task redundancy, and domain name fallback.

### Failover migration

To minimize the impact of failures due to network issues, third-party infrastructure, or force majeure events, Agora provides automatic high-availability task migration. Once a failure is detected, the service attempts to migrate the task within 90 seconds. During this process, there is a risk of transcoding interruptions.

For scenarios with a large number of viewers or where ultra-high availability is required, consider whether the temporary impact of a failover is acceptable for your use case. To improve reliability:

* Start multiple transcoding tasks using different `uid`s in the output channel.
* Periodically [check the transcoding task status](/en/api-reference/cloud-transcoding/restful) and use a backup `uid` to immediately initiate a new task if a failure is detected. This ensures uninterrupted delivery of critical streams.

:::warning
The RESTful APIs support only HTTP 1.1 and HTTP 2.0. When using HTTPS, ensure that the connection is encrypted using TLS 1.0, 1.1, or 1.2. Other protocol versions may cause connection failures.
:::

### Multi-task redundancy

For a higher level of reliability than failover alone, implement a multi-task redundancy strategy. 

:::note
Each cloud transcoding task is billed independently. For billing information, contact [technical support](mailto:support@agora.io).
:::

To implement multi-task redundancy:
 
1. Start a primary and a backup transcoding task simultaneously. Both tasks transcode the same source stream and push the output to the same or separate channels. Audience members subscribe to the `uid` used by the primary task.

2. On the client side, monitor the following callback events to detect interruptions and switch to the backup task if needed:

   * The [`onUserOffline`](https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengineeventhandler.html#callback_irtcengineeventhandler_onuseroffline) callback when the transcoder (host) goes offline.
   * Stream state change callbacks: [`onRemoteAudioStateChanged`](https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengineeventhandler.html#callback_irtcengineeventhandler_onremoteaudiostatechanged) and [`onRemoteVideoStateChanged`](https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengineeventhandler.html#callback_irtcengineeventhandler_onremotevideostatechanged).

### Switch the domain name

To ensure high availability of REST services, Agora enables you to switch domain names when you experience service outage due to regional network failures. Take the following steps to set up and switch your domain name:

1. Set the primary domain name based on the location of your service server:
    - If the DNS address of the service server is located in a country or region other than mainland China, set the primary domain name to `api.agora.io`.
    - If the DNS address of the service server is in mainland China, set the primary domain name to `api.sd-rtn.com`.

2. If your attempt to initiate a RESTful API request using the primary domain fails, set up your retry strategy as follows:
    
    1. **Primary domain retry**: Retry using the same primary domain name.
    
    2. **Alternate domain retry**:
        - If the current primary domain name is `api.sd-rtn.com`, use `api.agora.io` as the alternate domain name.
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
