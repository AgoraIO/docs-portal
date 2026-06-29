---
title: "Integrate Analytics with Datadog"
description: "Configure Agora Analytics to push data directly to your Datadog dashboard."
---

[Datadog](https://docs.datadoghq.com/) is an observability service for cloud-scale applications, that provides monitoring of servers, databases, tools, and services, through a SaaS-based data analytics platform. It enables you to visualize and monitor metrics, setup custom alerts, and create dashboards. To analyze Agora products data with your other integrations, you can push Agora Analytics usage, quality, and performance statistics directly to your Datadog account.

This page shows you how to setup DataDog integration with Agora Analytics.

## Enable and configure Datadog

To enable Agora Analytics integration with Datadog:

1. In Agora Console, subscribe to the **Premium** or **Enterprise** [pricing plan](https://console.agora.io/aa/pricing).

2. In [Agora Analytics](https://analytics-lab.agora.io/), navigate to **Integration > Datadog**.
    
    ![](/images/analytics/datadog-integration-step-1.png)

3. Press **Apply** to initiate a request to enable Datadog. The Agora support team will contact you once the feature is enabled.

    ![](/images/analytics/apply-datadog-package.png)

    :::info
    You can use Datadog with Agora Analytics only if Datadog integration is included in your Datadog package.
    :::

4. On the configuration page, select the **Metrics** you want to monitor with Datadog.

    ![](/images/analytics/datadog-integration-step-2.png)

5. Enter your Datadog API key and press **Save**. An API key is required to submit metrics and events to Datadog.
    
    ![](/images/analytics/datadog-integration-step-3.png)

6. When configuration is successful, the **Configuration Status** updates to **Online**.

    The following information is displayed on the configuration page: 

        - **Updated at**: Last data push in your local timezone.
        - **Updated by**: Last user to enable or disable the feature.
        - **Expiration date**: Effective time remaining before the package expires.

    ![](/images/analytics/datadog-integration-step-4.png)

    :::info
    It can take up to five minutes before data push is resumed or stopped after you change the status.
    :::

You are now ready to use Datadog to analyze use of your Agora products.

## Add Analytics to your Datadog dashboard

To display Agora Analytics metrics on your Datadog dashboard:

1. Log in to your Datadog account. Navigate to the **Integrations** page and search for "Agora." Agora Analytics Integration appears in your search results.
    
    ![](/images/analytics/datadog-integration-step-5.png)

2. Select **Agora Analytics** and add it to your Datadog dashboard.

    ![](/images/analytics/datadog-integration-step-6.png)

3. Open the Datadog dash board. You see statistics from Agora Analytics displayed on your Datadog dashboard.
    
    ![](/images/analytics/datadog-integration-step-7.png)

## Reference

See the Agora Analytics [Integration page on Datadog](https://docs.datadoghq.com/integrations/agora_analytics/).

### RTC metrics

Agora Analytics provides the following RTC metrics to Datadog:

| Metric name | Description|
|:--------------|:--------------|
| `agora.rtc.app_id.online_user` (count)   | Number of online users aggregated by appid, calculated every minute.   |
| `agora.rtc.app_id.online_channel` (count) | Number of online channels aggregated by appid, calculated every minute.|
| `agora.rtc.app_id.join_success_rate` (rate)  | Join success rate aggregated by appid, calculated every minute.   |
| `agora.rtc.app_id.join_success_in_5s_rate` (rate) | Join success rate within 5 seconds aggregated by appid, calculated every minute. |
| `agora.rtc.app_id.join_attempt` (count)  | Number of join attempts aggregated by appid, calculated every minute.  |
| `agora.rtc.app_id.join_success_count` (count) | Number of join success aggregated by appid, calculated every minute.   |
| `agora.rtc.app_id.audio_freeze_rate` (rate)  | Audio freeze rate aggregated by appid, calculated every minute.   |
| `agora.rtc.app_id.video_freeze_rate` (rate)  | Video freeze rate aggregated by appid, calculated every minute.   |
| `agora.rtc.app_id.network_delay_rate` (rate) | Network delay rate aggregated by appid, calculated every minute.  |

### Chat metrics

Agora Analytics provides the following Chat metrics to Datadog:

| Metric name     | Description   |
|:----------------|:--------------|
| `agora.chat.group.total` (count)  | Total chat groups. |
| `agora.chat.group.new` (count)    | Daily new chat groups.  |
| `agora.chat.group.disbanded` (count)   | Daily disbanded chat groups. |
| `agora.chat.group.active` (count) | Daily active chat groups.    |
| `agora.chat.room.total` (count)   | Total chat rooms.  |
| `agora.chat.room.new` (count)| Daily new chat rooms.   |
| `agora.chat.room.disbanded` (count)    | Daily disbanded chat rooms.  |
| `agora.chat.room.active` (count)  | Daily active chat rooms.|
| `agora.chat.room.pcu` (count)| Daily chat room peak concurrent users. |
| `agora.chat.user.total` (count)   | Total registered users. |
| `agora.chat.user.dnu` (count)| Daily new users.   |
| `agora.chat.user.dau` (count)| Daily active users.|
| `agora.chat.user.maxdau` (count)  | Monthly max daily active users.   |
