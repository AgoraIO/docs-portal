---
title: "Pricing"
description: "Compare Agora Analytics pricing plans, their features, and monthly fees, and manage your subscription."
---

Agora Analytics manages analytics features and API access through pricing plans. To use a feature or an API, you
subscribe to the plan that provides access to that feature or API.

## Pricing plan features

Agora Analytics offers the Starter, Standard, Premium, and Enterprise pricing plans. The features available in each
pricing plan are listed in the following sections.

### Call Inspector

[Call Inspector](/en/realtime-media/agora-analytics/build/explore-and-analyze-data/call-search) is available on all plans. Data retention, RESTful API access, and embedding vary by plan:

| Feature                              | Starter | Standard       | Premium       | Enterprise       |
|--------------------------------------|:-------:|:--------------:|:-------------:|:----------------:|
| Access through Agora Console         | ✔       | ✔              | ✔             | ✔                |
| Data retention                       | 3 days  | 7 days         | 14 days       | 30 days          |
| Call Inspector RESTful API           | ✘       | Standard-level | Premium-level | Enterprise-level |
| Support for embedding in web portals | ✘       | ✔              | ✔             | ✔                |

For details about the Standard, Premium, and Enterprise-level Call Inspector RESTful APIs, see [RESTful API](api.md).

### Data Insights and Data Insights Plus

[Data Insights](/en/realtime-media/agora-analytics/build/explore-and-analyze-data/data-insight) and [Data Insights Plus](/en/realtime-media/agora-analytics/build/explore-and-analyze-data/data-insight-plus) start with the Standard plan. Higher plans offer longer data retention, finer granularity, lower latency, and more analysis options:

| Module | Feature | Starter | Standard | Premium | Enterprise |
| --- | --- | --- | --- | --- | --- |
| Data Insights | Access through Agora Console | ✘ | ✔ | ✔ | ✔ |
| Data Insights | Data retention | ✘ | 30 days | 60 days | 90 days |
| Data Insights | Data granularity | ✘ | **Usage Overview**: Day | **Usage Overview**: Day/Hour | **Usage Overview**: Day/Hour |
| Data Insights | Data granularity | ✘ | **Quality Overview**: Day/Hour | **Quality Overview**: Day/Hour/Minute | **Quality Overview**: Day/Hour/Minute |
| Data Insights | Data latency | N/A | **Usage Overview**: 24 hours | **Usage Overview**: 12 hours | **Usage Overview**: 6 hours |
| Data Insights | Data latency | N/A | **Quality Overview**: 12 hours | **Quality Overview**: 6 hours | **Quality Overview**: 6 hours |
| Data Insights | Support for embedding in web portals | ✘ | ✘ | ✔ | ✔ |
| Data Insights | Data Insights RESTful API | ✘ | ✘ | ✔ | ✔ |
| Data Insights Plus | Multi-dimensional cross analysis | ✘ | ✔ | ✔ | ✔ |
| Data Insights Plus | Data sampling analysis | ✘ | ✘ | ✔ | ✔ |
| Data Insights Plus | Comparative analysis | ✘ | ✘ | ✔ | ✔ |

For details about the Data Insights RESTful API, see [RESTful API](api.md).

### Real-time Monitoring

[Real-time Monitoring](/en/realtime-media/agora-analytics/build/monitor-and-get-alerts/monitor) starts with the Standard plan. RESTful API access requires the Premium or Enterprise plan:

| Feature                              | Starter | Standard | Premium       | Enterprise       |
|--------------------------------------|:-------:|:--------:|:-------------:|:----------------:|
| Access through Agora Console         | ✘       | ✔        | ✔             | ✔                |
| Real-time Monitoring RESTful API     | ✘       | ✘        | Premium-level | Enterprise-level |
| Data sampling                        | ✘       | ✔        | ✔             | ✔                |
| Support for embedding in web portals | ✘       | ✔        | ✔             | ✔                |

For details about the Premium and Enterprise-level Real-time Monitoring RESTful APIs, see [RESTful API](api.md).

### Alert Notifications

[Alert Notifications](/en/realtime-media/agora-analytics/build/monitor-and-get-alerts/alarm) start with the Premium plan. Embedding in web portals requires the Enterprise plan:

| Feature                              | Starter | Standard | Premium | Enterprise |
|--------------------------------------|:-------:|:--------:|:-------:|:----------:|
| Access through Agora Console         | ✘       | ✘        | ✔       | ✔          |
| Support for embedding in web portals | ✘       | ✘        | ✘       | ✔          |

### Third-party integrations

Agora Analytics can push real-time data to the following third-party observability platforms:

| Platform | Starter | Standard | Premium | Enterprise |
|----------|:-------:|:--------:|:-------:|:----------:|
| [Datadog](/en/realtime-media/agora-analytics/build/integrate-and-embed/datadog-integration) | ✘ | ✘ | ✔ | ✔ |
| [New Relic](/en/realtime-media/agora-analytics/build/integrate-and-embed/new-relic-integration) | ✘ | ✘ | ✔ | ✔ |

## Prices

Each plan is billed as a monthly subscription:

|                                             | Starter   | Standard  | Premium   | Enterprise |
|---------------------------------------------|:-------:|:--------:|:-------:|:----------:|
| Subscription fee per month (US$)            | 0         | 449       | 999       | 1,599      |

You can also subscribe to Agora Analytics packages through Agora support plans. For details, visit [Agora Support Plans](https://www.agora.io/en/pricing/support-plans/).

## Plan management

This section shows you how to subscribe to, unsubscribe from, or switch Agora Analytics pricing plans.

### Subscribe to a plan

To subscribe to an Agora Analytics pricing plan, do the following:

1. In [Agora Console](https://console.agora.io/), select **Agora Analytics** in the sidebar to open Agora Analytics in a new tab, then select **Pricing Plan**.

2. Choose the plan you want to use, and click **Subscribe**.

    :::note
    For the Enterprise pricing plan, contact [support@agora.io](mailto:support@agora.io).
    :::

3. Follow the on-screen instructions to complete your payment.

Subscription takes effect immediately. After subscribing to a plan, you can click **My Package Subscription** in the upper-right corner to view your subscription details.

By default, subscription to Agora Analytics pricing plans is automatically renewed. You can cancel it at any time. See [Unsubscribe from a plan](#unsubscribe-from-a-plan-or-switch-to-another-plan) for details.

Agora Analytics charges are billed to your account on the first of every month until you cancel your subscription. Your subscription fee for the subsequent month is listed in your monthly bill. For details, see [Billing policies and free-of-charge policy](billing-policies.md).

### Unsubscribe from a plan or switch to another plan

To unsubscribe from an Agora Analytics pricing plan, do the following:

1. In [Agora Console](https://console.agora.io/), select **Agora Analytics** in the sidebar to open Agora Analytics in a new tab, then select **Pricing Plan**.

2. In the upper-right corner, click **My Package Subscription**.

3. Find the plan you want to unsubscribe from, and click **Cancel** in the **Action** column.

To switch to another plan, do the following:

1. In [Agora Console](https://console.agora.io/), select **Agora Analytics** in the sidebar to open Agora Analytics in a new tab, then select **Pricing Plan**.

2. Choose the plan you want to switch to, and click **Subscribe**.

    :::note
    For the Enterprise pricing plan, contact [support@agora.io](mailto:support@agora.io).
    :::

3. In the confirmation dialog, click **Confirm to switch**.

Unsubscribing from a plan or switching to another plan takes effect on the first of the next month. For the current month, you still have access to the features and APIs provided by the plan. The subscription fee you paid for this month is not refunded, and any excess usage that occurs in this month is charged.

## See also

- [RTC pricing](/en/realtime-media/rtc/reference/pricing)
- [Billing policies and free-of-charge policy](billing-policies.md)
