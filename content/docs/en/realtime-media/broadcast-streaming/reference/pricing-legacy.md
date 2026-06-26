---
title: "Legacy pricing"
description: "This page documents Agora's previous pricing model based on monthly billing. It remains available for reference during the transition to the new prepaid packages."
---

This page documents Agora's previous pricing model based on monthly billing. It remains available for reference during the transition to the new prepaid packages.
:::note
You're viewing information about Agora's previous monthly billing model. For the latest prepaid packages, see [Pricing](reference/pricing).
:::
If you have already signed a contract with Agora, the billing terms and conditions within that contract take precedence.

## Broadcast Streaming pricing

The unit prices for audio and video usage are as follows. Prices are in US$ per 1,000 participant minutes:

| Usage type  | Pricing for hosts | Pricing for audience members |
| :------------ | :------------------|:----------------------------:|
| Audio     | 0.99        | 0.59             |
| Video HD   | 3.99        | 1.99             |
| Video Full HD | 8.99        | 4.59             |
| Video 2K   | 15.99       | 7.99             |
| Video 2K+   | 35.99       | 17.99            |

| Options | Pricing | Discount guidance |
|:--------|:--------|:---------------------|
| SDK side screenshot | $0.3/10,000 images | First 10,000 images per month are free |
| Additional charge for SDK side screenshot<br/> when QPS > 500 | $1.5/QPS | First 500 QPS per month are free |

## Cost calculation

Billing occurs monthly. At the end of each month, Agora calculates the total duration of the audio and video usage (in minutes) for that month in all projects under your [Agora account](https://console.agora.io/v2).

Video usage is divided into four different types based on aggregate resolution and priced individually. After deducting the monthly [10,000 free-of-charge minutes](billing-policies) that Agora grants to every account, Agora multiplies any remaining usage by its corresponding unit price and adds up the costs to get the total cost for that month.

The basic formula is shown here:

**Monthly cost** = **audio minutes** × **audio unit price** + **video minutes of each type** × **video unit price of each type**

#### Usage

In each Broadcast Streaming session, users communicate with each other in a Broadcast Streaming [channel](glossary). Agora measures the usage for each user from the moment they join a channel to the moment they leave it. If a user subscribes to video from other users in the channel, the usage is counted as video usage (of the applicable type); otherwise, the usage is counted as audio usage.

Agora calculates usage based solely on a user’s subscriptions in the channels they join. Whether they publish streams does not matter.

##### Audio usage

Audio usage is the default rate at which users are billed for joining a channel. Any time a user spends in a channel where they do not subscribe to video is counted as audio usage, regardless of whether they actually subscribe to audio from another user.

Note that in channels with only one user, this usage is counted as audio usage, because the user does not subscribe to any video.

##### Video usage

Video usage is the amount of time that a user in a channel subscribes to video (of any type) from other users. When a user subscribes to both audio and video at the same time, Agora only counts this as video usage.

Agora calculates video usage for each user based on aggregate resolution. Aggregate resolution is the sum of the resolutions of all the video streams a user subscribes to at the same time, that is, the total number of pixels in the video streams the user receives. This calculation applies when a user subscribes to one video stream or multiple video streams.

Based on the aggregate resolution of all the video streams received, Agora divides video into the following types and calculates the usage duration of each type separately:

| Video type      | Aggregate resolution, px           |
|----------------------|----------------------------------------------|
| High-definition (HD) | Less than or equal to 921,600 (1280 × 720)  |
| Full High-definition (Full HD) | From greater than 921,600 (1280 × 720) to 2,073,600 (1920 × 1080)  |
| 2K | From greater than 2,073,600 (1920 × 1080) to 3,686,400 (2560 × 1440) |
| 2K+ | From greater than 3,686,400 (2560 × 1440) to 8,847,360 (4096 × 2160) |

For example, if a user subscribes to two video streams with resolutions of 1280 × 720 and 1920 × 1080 at the same time, the aggregated resolution of the user is (1280 × 720) + (1920 × 1080) = 2,995,200. Because 2,995,200 is greater than 2,073,600 but less than 3,686,400, Agora counts this video usage as 2K type and bills it at the 2K unit price.

#### Usage-based volume discounts

Agora automatically offers the following tiered discounts for total monthly usage that exceeds 100,000 minutes:

| Minutes used      | Discount level |
|------------------------|:--------------:|
| 100,000 to 499,999   | 5%       |
| 500,000 to 999,999   | 7%       |
| 1,000,000 to 3,000,000 | 10%      |

These discounts apply to the usage within each tier. For example, if Agora bills an account for 600,000 minutes, the usage from 1 to 99,999 minutes receives no discount, the usage from 100,000 to 499,999 minutes receives a 5% discount, and the usage from 500,000 to 600,000 minutes receives a 7% discount.

If you expect your total monthly usage to exceed 3,000,000 minutes, contact sales-us@agora.io for additional discounts.

## Pricing for associated features

If your use-case involves an Agora product other than Broadcast Streaming, such as Cloud proxy, Interactive Whiteboard,
or Cloud Recording, expect additional charges. See below for Cloud proxy pricing and dedicated pricing pages for
other products.

### Cloud proxy pricing

Typically, about 5% to 10% of the audio and video traffic may require [Cloud proxy](../build/optimize-quality-and-connection/cloud-proxy). For Cloud proxy, automatic mode is free of charge. Agora offers Force UDP and Force TCP cloud proxy modes with tiered capacity.

The minimum monthly base fee for each tier is:

| Capacity tier | PCU     | Minimum monthly base fee, US$ |
|---------------|-------------|------------------------------ |
| Tier 1 - Default | 200 or fewer        | 500  |
| Tier 2      | From 201 to 1,000  | 1,000 |
| Tier 3      | From 1,001 to 2,000 | 2,000 |
| Tier 4      | 2,001 or more  | [Contact Sales](https://www.agora.io/en/talk-to-us/) or request support through the [Agora Console](https://console.agora.io/v2) |

Force UDP or Force TCP cloud proxy usage is measured in minutes and calculated separately according to the media type. The unit prices are as follows:

| Force UDP or Force TCP usage    | Pricing, US$/1,000 minutes |
| --------------------------------------- |:------------------------------:|
| Audio                  | 0.99              |
| Video HD (720P or below)        | 3.99              |
| Video Full HD (above 720p, up to 1080p) | 8.99              |
| Video 2K (above 1080p, up to 2K)    | 15.99             |
| Video 2K+ (above 2K)          | 35.99             |

When Force UDP or Force TCP is enabled at a specified capacity, Agora charges according to the following rules:

- **Minimum monthly fee** - monthly usage-based fee including volume discounts is lower than the minimum monthly base fee.
- **Usage monthly fee** - monthly usage-based fee including volume discounts exceeds the minimum monthly base fee.

You activate Cloud proxy for Tier 1 directly in [Agora Console](https://console.agora.io/v2). Once Force UDP or Force TCP Cloud proxy is activated, you are billed according to the minimum monthly base fee or based upon minutes of usage, whichever is greater. You can deactivate the Cloud Proxy Force UDP or Force TCP modes at any time in the [Agora Console](https://console.agora.io/v2). Deactivation takes effect immediately.

Agora offers a 10% overage allowance for all tiers of PCU at no additional charge. Agora notifies you when your PCU exceeds the 10% overage allowance. Upon receiving this notice, contact [Agora Customer Support](mailto:support@agora.io) to upgrade to the next tier to ensure you have sufficient capacity in the future. Before your upgrade, Agora does try to provide the required capacity beyond the 10% overage allowance; however, the quality of service for an overage of greater than 10% is not guaranteed.

Billing occurs at the end of each calendar month. For other tiers, contact [Agora Customer Support](mailto:support@agora.io).

### AI Noise Suppression pricing

[AI Noise Suppression](../build/apply-effects-and-enhancements/ai-noise-suppression) helps reduce noise and voice distortion in virtual communication. Agora charges for voice sent to the channel by a host while AI Noise Suppression is enabled.

AI Noise Suppression is free for up to 10,000 minutes each month. Additional usage is billed at the standard rate.

| Usage      | Pricing, US$/1,000 minutes|
|-----------------|:-------------------------:|
| 0 to 10,000   | Free       |
| Above 10,000  | 0.59       |

### 3D Spatial Audio pricing

[3D Spatial Audio](../build/control-audio-and-devices/spatial-audio) brings theater-like effects to virtual communication, making it seem as if the sound originates from all around the user.

The unit prices for this extension are as follows:

|Usage, minutes per month |Pricing, US$/1,000 minutes|
|-------------------------|:------------------------:|
| 0 to 10,000       | Free	         |
| Above 10,000      | 0.99           |

Agora charges for the time each user spends in a channel with 3D Spatial Audio activated. For example, imagine there are 3 users in a channel, each one of them subscribing to remote audio. User A enables 3D Spatial Audio for 10 minutes. User B enables 3D Spatial Audio and has it on until leaving the channel. User C does not enable it at all. In this case, Agora charges for the combined time that users A and B had 3D Spatial Audio enabled, even if the remote audio was on mute at the time.

## Examples

This section illustrates how Agora calculates aggregate video resolution, total usage per service type, and the associated costs.

Suppose that five users join a channel at the same time and have interactive live video streaming for 60 minutes. In the video streaming, there are three hosts (Host A, B, and C), each with a video resolution set to 960 × 720. Two audience members subscribe to the video streams from the hosts. Additionally, Host A shares their screen with all other users in the channel. The video resolution of the screen-sharing stream is set to and received at 1920 × 1080.

### Calculate aggregate video resolution

The following table shows the calculations for the aggregate resolution for each user’s video stream subscriptions. These determine the unit prices for their video usage:

| User | Video streams subscribed | Aggregate video resolution | Total | Video type |
|-------------|------------------------------|------|-----------|----------------|
| Host A + screen sharing | 2 hosts              | 960 × 720 × 2          | 1,382,400 | Full HD    |
| Host B         | 2 hosts + Host A’s screen sharing | (960 × 720 × 2) + (1920 x 1080) | 3,456,000 | 2K       |
| Host C         | 2 hosts + Host A’s screen sharing | (960 × 720 × 2) + (1920 x 1080) | 3,456,000 | 2K       |
| Audience Member 1    | 3 hosts + Host A’s screen sharing | (960 × 720 × 3) + (1920 x 1080) | 4,147,200 | 2K+      |
| Audience Member 2    | 3 hosts + Host A’s screen sharing | (960 × 720 × 3) + (1920 x 1080) | 4,147,200 | 2K+      |

### Calculate cost

The following table shows the calculation of the total cost of the live video streaming session:

<table>
<thead>
<tr>
 <th>Billed service (video type)</th>
     <th>Total usage (minutes) = Sum of all individual usage</th>
 <th>Unit price (US$<span>/1,000 minutes)</span></th>
 <th colSpan="1">Cost of each service (US$)</th>
   <th colSpan="1">Total cost (US$)(rounded to two decimal places)</th>
 </tr>
</thead>
<tbody>
 <tr>
 <td>Full HD</td>
 <td>60</td>
 <td><span>4.59<br/></span></td>
 <td>(60/1000) x 4.59 = 0.2754</td>
 <td rowSpan="3" ><p>3.393</p><p><strong>≈ 3.39</strong></p></td>
 </tr>
 <tr>
 <td className="confluenceTd">2K</td>
 <td className="confluenceTd">60 x 2 = 120</td>
 <td className="confluenceTd"><span>7.99<br/></span></td>
 <td>(120/1000) x 7.99 = 0.9588</td>
 </tr>
 <tr>
 <td>2K+</td>
 <td>60 x 2 = 120</td>
 <td><span>17.99<br/></span></td>
 <td>(120/1000) x 17.99 = 2.1588</td>
 </tr>
</tbody>
</table>

## Reference

This section provides additional information for your reference.

### Accuracy of usage duration

Agora bills usage by the minute but records usage by the second. Monthly usage for billing is actually calculated by totaling each type of usage (in seconds) and then dividing by 60, rounding up to the nearest integer. For example, if the audio usage for a month is 59 seconds, then this is billed as 1 minute; if the HD video usage for a month is 61 seconds, then this is billed as 2 minutes. Therefore, the margin of error for usage of each type per month is less than 1 minute.

### Aggregate video resolution in dual-stream use-cases

In dual-stream mode, the aggregate video resolution for each user is calculated as follows:

-  If the user subscribes to the high-quality video stream, their aggregate resolution is calculated based on the resolution of the high-quality video sent by the host,
regardless of the resulting video resolution on the user's end.

-  If the user subscribes to the low-quality video stream, their aggregate resolution is calculated based on the resolution of the video received by the user.

### Video resolution during screen sharing

  In use-cases involving screen sharing, the unit price of the screen-sharing stream is calculated on the basis of the video dimension that you set in [ScreenCaptureParameters](https://api-ref.agora.io/en/video-sdk/android/4.x/API/rtc_api_data_type.html#class_screencaptureparameters2).

### Resolution calibration

When calculating aggregate resolution, Agora counts the 640 × 352 (225,280) resolution as if it is 640 × 360 (230,400).

## See also

[Billing policies and free-of-charge policy](billing-policies)
