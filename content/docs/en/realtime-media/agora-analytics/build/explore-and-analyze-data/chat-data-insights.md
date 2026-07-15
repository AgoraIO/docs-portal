---
title: "Data Insights"
description: "Introduces Agora Analytics for Agora Chat."
---

## Introduction

[Agora Analytics](/en/realtime-media/agora-analytics/product-overview) provides periodic analysis of usage and quality data for [Chat](/en/realtime-media/im), helping you keep track of usage trends and quality details.

### Feature overview

Agora Analytics offers the following features for Chat:

- Automatic collection, processing, and storage of usage and quality metrics data. This data has a delay of one minute.
- Display of current and historical data at the user, group chat, and chat room levels, as well as historical trends in message count and message type.
- Display of the number of request attempts, request success rate, and request delay of API calls at the client side and server side.

### Enable Chat-related features

After [enabling and configuring Chat Service](/en/realtime-media/im/get-started/enable), the Chat-related features in Agora Analytics are enabled by default and are free to use. No additional operation is required.

## Usage Insights

Follow these steps to view the Chat Usage Insights page:

1. In [Agora Console](https://console.agora.io/v2), select **Analytics** in the left navigation to open Agora Analytics in a new tab, then select **Chat Usage Insights**.
2. In the upper left corner, select the project you want to view from the drop-down menu.
3. Click the **Scale Statistics** or **Message Statistics** tab at the top of the page.

### Scale Statistics

The Scale Statistics page shows the scale of users, group chats, and chat rooms on the current day and within a past period. This page includes the following sections:

|  | Description | Notes |
| --- | --- | --- |
| Today's Overview | Values of key usage metrics as of today. For a detailed description of each metric, see [Chat glossary](./chat-data-metrics.md). | N/A |
| Historical Data | Line charts and bar charts showing how the metric values change in a certain time range. | <Slot name="historical-data" /> |

<Slot for="historical-data">

- The maximum time range to query is the past 30 days.
- Each metric in this section is calculated at an interval of a day, and the data has a one-minute delay, except for daily chat room PCU, which has a 10-minute delay.

</Slot>

![](https://web-cdn.agora.io/docs-files/1656493263570)

![](https://web-cdn.agora.io/docs-files/1656491897724)

Taking the historical data for chat rooms as an example:

- The red bar chart represents the number of new chat rooms.
- The cyan bar chart represents the number of disbanded chat rooms.
- Line charts are used for total chat rooms, peak concurrent users, and daily active chat rooms.

To hide the bar chart or line chart for a metric, click the corresponding legend.

### Message Statistics

The Message Statistics page shows the historical numbers of messages and the distribution of message types. This page includes the following sections:

|  | Description | Notes |
| --- | --- | --- |
| Message Count Trends | Line charts showing how the total numbers of messages change within a certain time range. For a detailed description of each metric, see [Chat glossary](./chat-data-metrics.md). | <Slot name="message-count-trends" /> |
| Message Type Trends | Line charts showing the number of messages by type in a certain time range, and pie charts showing the message type breakdown. For a detailed description of each metric, see [Chat glossary](./chat-data-metrics.md). | Same as Message Count Trends |

<Slot for="message-count-trends">

- The maximum time range to query is the past 6 months.
- Each metric in this section is calculated at an interval of a day, and the data has a one-minute delay.

</Slot>

![](https://web-cdn.agora.io/docs-files/1656491965158)

![](https://web-cdn.agora.io/docs-files/1656492249498)

Taking uplink message trends of chat rooms as an example:

- By default, the pie chart shows the message type breakdown within the selected time range.
- If you click a data point in the line chart on the left, the pie chart updates to show the message type breakdown on that specific day.

## Quality Insights

Follow these steps to view Chat quality insights:

1. In [Agora Console](https://console.agora.io/v2), select **Analytics** in the left navigation to open Agora Analytics in a new tab, then select **Chat Quality Insights**.
2. In the upper left corner, select the project you want to view from the drop-down menu.
3. In the upper right corner, select a unit and duration to view end-user and server-side API data. The default is the last 30 minutes by minute.
4. Click the **End-user Data** or **Server API Data** tab at the top of the page.

    :::info
    You can query any data within the last 7 days. If you view the data by hour, the time range of a single query cannot exceed 24 hours. If you view the data by minute, the time range of a single query cannot exceed 30 minutes.
    :::

### End-user Data

The End-user Data section shows the number of request attempts, request success rate, and average request delay of client-side APIs. For details on metric types and definitions, see [Chat glossary](./chat-data-metrics.md).

To present the data more intuitively, different metrics use different charts:

| Metric | Map (on the left) | Chart (on the right) |
| --- | --- | --- |
| Request attempts | The higher the number of request attempts, the darker the color of the area. | Line chart |
| 1s/3s/5s request success rate | The higher the number of request attempts, the darker the color of the area. The larger the bubble, the lower the request success rate in that area. | Line chart |
| Request delay | The higher the number of request attempts, the darker the color of the area. The larger the bubble, the higher the average request delay in that region. | Heat map |

![](https://web-cdn.agora.io/docs-files/1656492270872)

### Server API Data

The Server API Data section shows the number of request attempts, request success rate, and average request delay of server-side RESTful APIs. For details on metric types and definitions, see [Chat glossary](./chat-data-metrics.md).

:::info
Server API data includes the RESTful API calls made by client SDKs. For example, group chat operations in the client SDK are implemented by calling RESTful APIs, so they are counted in Server API Data.
:::

To present the data more intuitively, different metrics use different charts:

| Metric | Chart |
| --- | --- |
| Request attempts | Line chart |
| 1s/3s/5s request success rate | Line chart |
| Average request delay | Heat map |

![](https://web-cdn.agora.io/docs-files/1656493809585)
