---
title: "Integrate Analytics with Datadog"
description: "Configure Agora Analytics to push data directly to your Datadog dashboard."
---

[Datadog](https://docs.datadoghq.com/) is an observability service for cloud-scale applications that monitors servers, databases, tools, and services through a SaaS-based data analytics platform. You can use it to visualize and monitor metrics, set up custom alerts, and create dashboards. To analyze Agora product data alongside your other integrations, you can push Agora Analytics usage, quality, and performance statistics directly to your Datadog account.

This page shows you how to set up the Datadog integration with Agora Analytics.

## Enable and configure Datadog

To enable the Agora Analytics integration with Datadog:

1. In Agora Console, subscribe to the **Premium** or **Enterprise** [pricing plan](/en/realtime-media/agora-analytics/reference/pricing).

2. In [Agora Analytics](https://analytics-lab.agora.io/), go to **Integration > Datadog**.

    ![Datadog option in the Agora Analytics Integration menu](https://assets-docs.agora.io/images/analytics/datadog-integration-step-1.png)

3. Click **Apply** to request access to the Datadog integration. The Agora support team contacts you when the feature is enabled.

    ![Apply button on the Datadog integration page](https://assets-docs.agora.io/images/analytics/apply-datadog-package.png)

    :::info
    You can use Datadog with Agora Analytics only if your Datadog package includes the Datadog integration.
    :::

4. On the configuration page, select the **Metrics** you want to monitor with Datadog.

    ![Metrics selection on the Datadog configuration page](https://assets-docs.agora.io/images/analytics/datadog-integration-step-2.png)

5. Enter your Datadog API key and click **Save**. Datadog requires an API key to receive metrics and events.

    ![Datadog API key field on the configuration page](https://assets-docs.agora.io/images/analytics/datadog-integration-step-3.png)

6. Check that the **Configuration Status** changes to **Online**.

    The configuration page also shows the following information:

    - **Updated at**: The time of the last data push, in your local time zone.
    - **Updated by**: The last user to enable or disable the feature.
    - **Expiration date**: The time remaining before your package expires.

    ![Datadog configuration page with the status set to Online](https://assets-docs.agora.io/images/analytics/datadog-integration-step-4.png)

    :::info
    After you change the status, it can take up to five minutes for the data push to start or stop.
    :::

You are now ready to use Datadog to analyze the use of your Agora products.

## Add Analytics to your Datadog dashboard

To display Agora Analytics metrics on your Datadog dashboard:

1. Log in to your Datadog account. Go to the **Integrations** page and search for "Agora". Agora Analytics appears in the search results.

    ![Agora Analytics in the Datadog Integrations search results](https://assets-docs.agora.io/images/analytics/datadog-integration-step-5.png)

2. Select **Agora Analytics** and add it to your Datadog dashboard.

    ![Adding the Agora Analytics integration in Datadog](https://assets-docs.agora.io/images/analytics/datadog-integration-step-6.png)

3. Open your Datadog dashboard to see statistics from Agora Analytics.

    ![Agora Analytics statistics on a Datadog dashboard](https://assets-docs.agora.io/images/analytics/datadog-integration-step-7.png)

## Reference

For details about the integration on the Datadog side, see the [Agora Analytics integration page on Datadog](https://docs.datadoghq.com/integrations/agora-analytics/).

### RTC metrics

Agora Analytics provides the following RTC metrics to Datadog:

| Metric name | Description |
|:------------|:------------|
| `agora.rtc.app_id.online_user` (count) | Number of online users aggregated by App ID, calculated every minute. |
| `agora.rtc.app_id.online_channel` (count) | Number of online channels aggregated by App ID, calculated every minute. |
| `agora.rtc.app_id.join_success_rate` (rate) | Join success rate aggregated by App ID, calculated every minute. |
| `agora.rtc.app_id.join_success_in_5s_rate` (rate) | Join success rate within 5 seconds aggregated by App ID, calculated every minute. |
| `agora.rtc.app_id.join_attempt` (count) | Number of join attempts aggregated by App ID, calculated every minute. |
| `agora.rtc.app_id.join_success_count` (count) | Number of successful joins aggregated by App ID, calculated every minute. |
| `agora.rtc.app_id.audio_freeze_rate` (rate) | Audio freeze rate aggregated by App ID, calculated every minute. |
| `agora.rtc.app_id.video_freeze_rate` (rate) | Video freeze rate aggregated by App ID, calculated every minute. |
| `agora.rtc.app_id.network_delay_rate` (rate) | Network delay rate aggregated by App ID, calculated every minute. |

### Chat metrics

Agora Analytics provides the following Chat metrics to Datadog:

| Metric name | Description |
|:------------|:------------|
| `agora.chat.group.total` (count) | Total chat groups. |
| `agora.chat.group.new` (count) | Daily new chat groups. |
| `agora.chat.group.disbanded` (count) | Daily disbanded chat groups. |
| `agora.chat.group.active` (count) | Daily active chat groups. |
| `agora.chat.room.total` (count) | Total chat rooms. |
| `agora.chat.room.new` (count) | Daily new chat rooms. |
| `agora.chat.room.disbanded` (count) | Daily disbanded chat rooms. |
| `agora.chat.room.active` (count) | Daily active chat rooms. |
| `agora.chat.room.pcu` (count) | Daily chat room peak concurrent users. |
| `agora.chat.user.total` (count) | Total registered users. |
| `agora.chat.user.dnu` (count) | Daily new users. |
| `agora.chat.user.dau` (count) | Daily active users. |
| `agora.chat.user.maxdau` (count) | Monthly maximum daily active users. |
