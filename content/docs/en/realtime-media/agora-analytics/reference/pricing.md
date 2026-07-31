---
title: "Pricing"
description: "Provides you with information on billing, fee deductions, free-of-charge policy, and any suspension to your account based on the account type."
---

Agora Analytics manages analytics features and API access through pricing plans. To use a feature or an API, you
subscribe to the plan that provides access to that feature or API.

## Price plan features

Agora Analytics offers the Starter, Standard, Premium, and Enterprise price plans. The features available in each
pricing plan are listed in the following sections.

### Call Inspector

The available features for Call Inspector are:

| Feature                              | Starter | Standard       | Premium       | Enterprise       |
|--------------------------------------|:-------:|:--------------:|:-------------:|:----------------:|
| Access through Agora Console         | ✔       | ✔              | ✔             | ✔                |
| Data retention                       | 3 days  | 7 days         | 14 days       | 30 days          |
| Call Inspector RESTful API           | ✘       | Standard-level | Premium-level | Enterprise-level |
| Support for embedding in web portals | ✘       | ✔              | ✔             | ✔                |

For details about the Standard, Premium, and Enterprise-level Call Inspector RESTful APIs, see [RESTful API](api.md).

### Data Insights and Data Insights Plus

The available features for Data Insights and Data Insights Plus are:

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

For details about the Standard, Premium, and Enterprise-level Data Insights RESTful APIs, see [RESTful API](api.md).

Data Insights Plus is only available with the Premium or Enterprise subscription plans.

### Real-time Monitoring

The available features for Real-time Monitoring are:

| Feature                              | Starter | Standard | Premium       | Enterprise       |
|--------------------------------------|:-------:|:--------:|:-------------:|:----------------:|
| Access through Agora Console         | ✘       | ✔        | ✔             | ✔                |
| Real-time Monitoring RESTful API     | ✘       | ✘        | Premium-level | Enterprise-level |
| Data sampling                        | ✘       | ✔        | ✔             | ✔                |
| Support for embedding in web portals | ✘       | ✔        | ✔             | ✔                |

For details about the Standard, Premium, and Enterprise-level Real-time Monitoring RESTful APIs, see [RESTful API](api.md).

### Alert Notifications

The available features for Alert Notifications are:

| Feature                              | Starter | Standard | Premium | Enterprise |
|--------------------------------------|:-------:|:--------:|:-------:|:----------:|
| Access through Agora Console         | ✘       | ✘        | ✔       | ✔          |
| Support for embedding in web portals | ✘       | ✘        | ✘       | ✔          |

### Datadog integration

The available features for Datadog integration are:

| Feature                      | Starter | Standard | Premium | Enterprise |
|------------------------------|:-------:|:--------:|:-------:|:----------:|
| Real-time data push to [Datadog platform](https://www.datadoghq.com/)    | ✘       | ✘       | ✔      | ✔          |

Datadog integration is only available with the Premium or Enterprise subscription plans.

## Prices

The subscription fees for the price plans are:

|                                             | Starter   | Standard  | Premium   | Enterprise |
|---------------------------------------------|:-------:|:--------:|:-------:|:----------:|
| Subscription fee per month (US$)            | 0         | 449       | 999       | 1,599      |

You can also subscribe to Agora Analytics packages through our support plans. For details, visit [Agora Support Plans](https://www.agora.io/en/pricing/support-plans/).

## Plan management

This section tells you how to subscribe and unsubscribe to an Agora Analytics price plan.

### Subscribe to a plan

To subscribe to an Agora Analytics pricing plan, do the following:

1. Log in to [Agora Console](https://console.agora.io/).

2. In [Agora Console](https://console.agora.io), select **Agora Analytics** in the left navigation to open Agora Analytics in a new tab, then select **Pricing Plan**.

3. Choose the plan you want to use, and click **Subscribe**.

    **For the Enterprise pricing plan, contact support@agora.io to discuss your subscription**

4. Follow the on-screen instructions to complete your payment.

Subscription takes effect immediately. After subscribing to a plan, you can click **My Package Subscription** on the upper right corner to view your subscription details.

By default, subscription to Agora Analytics pricing plans is automatically renewed. You can cancel it at any time. See [Unsubscribe from a plan](#unsubscribe-from-a-plan-or-switch-to-another-plan) for details.

Agora Analytics charges are billed to your account on the first of every month until you cancel your subscription. Your subscription fee for the subsequent month is listed in the once-time bill. For details, see [Billing policies and free-of-charge policy](billing-policies.md).

### Unsubscribe from a plan or switch to another plan

To unsubscribe from an Agora Analytics pricing plan, do the following:

1. In [Agora Console](https://console.agora.io), select **Agora Analytics** in the left navigation to open Agora Analytics in a new tab, then select **Pricing Plan**.

2. On the upper right corner, click **My Package Subscription**.

3. Find the plan you want to unsubscribe, and click **Cancel** in the **Action** column.

To switch to another plan, do the following:

1. In [Agora Console](https://console.agora.io), select **Agora Analytics** in the left navigation to open Agora Analytics in a new tab, then select **Pricing Plan**.

2. Choose the plan you want to switch to, and click **Subscribe**.
For the Enterprise pricing plan, contact support@agora.io to subscribe.

3. Read the pop-up window carefully, and click **Confirm to switch**.

Unsubscribing from a plan or switching to another plan takes effect on the first of the next month. For the current month, you still have access to the features and APIs provided by the plan. The subscription fee you paid for this month is not refunded, and any excess usage that occurs in this month is charged.

## See also

-   [Pricing for Video SDK](/en/realtime-media/video/reference/pricing)

-   [What are Agora’s policies on billing, fee deductions, and account suspension](billing-policies.md)
