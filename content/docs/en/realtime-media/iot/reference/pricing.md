---
title: "Pricing"
description: "Billing model and pricing for IoT SDK usage."
---

Agora calculates charges monthly for all projects under your developer account. When you use IoT SDK (RTSA) to implement audio and video streaming, that usage incurs real-time audio and video charges. Agora issues a monthly bill and charges your account according to your payment settings.

If you have a license purchase agreement with Agora, contact support@agora.io. Your license may include a quota of standard minutes. Usage within that quota, during the license validity period, is covered by the license.

:::note
If you have a separate sales contract with Agora, the billing terms in your contract take precedence over this page.
:::

## Fee composition

Agora charges based on the audio and video duration your project generates. At the end of each month, Agora totals your project's audio and video duration, in seconds, by tier, then converts the total to minutes (rounding up). After applying your monthly free allowance of 10,000 standard minutes, Agora calculates the fee:

**Fee = Audio duration × Audio unit price + Video duration × Video unit price**

## Duration usage

Each connection's duration usage is the sum of all users' usage on that connection. Agora measures usage from when a user joins to when they leave a channel, accurate to the second.

- **Video duration**: Generated when a user subscribes to a video stream.
- **Audio duration**: Generated when a user doesn't subscribe to a video stream, regardless of whether they subscribe to audio.

If a user subscribes to both audio and video in the same period, Agora counts the usage as video only and charges the video rate.

If a connection has only one user, Agora counts the usage as audio only and charges the audio rate.

## Unit price

The standard-minute conversion ratio for IoT SDK is the same as that used for Realtime Communication. For details, see Realtime Communication [basic service pricing](/en/realtime-media/rtc/reference/pricing#basic-service).

Usage beyond the included standard-minute quota is billed at the applicable IoT SDK rates.

| Usage type | Aggregate resolution | Price / 1,000 standard minutes |
|---|---|---|
| Audio | — | $0.99 |
| Video HD | ≤ 921,600 (for example, 1280 × 720) | $3.99 |
| Video Full HD | 921,600 < resolution ≤ 2,073,600 (for example, 1920 × 1080) | $8.99 |
| Video 2K | 2,073,600 < resolution ≤ 3,686,400 (for example, 2560 × 1440) | $15.99 |
| Video 2K+ | > 3,686,400 | $35.99 |
