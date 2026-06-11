---
title: "Agora Analytics data insights"
description: "Introduces Agora Analytics for Agora Chat."
---

## Introduction

[Agora Analytics](/en/api-reference/analytics/overview/product-overview) provides periodic analysis of usage and quality data for [Chat](../index.md), helping you keep track of the usage trends and quality details.

### Feature overview

Agora Analytics offers the following features for Chat:

- Automatic collection, processing, and storage of usage and quality metrics data. This data has a delay of one minute.
- Display of current and historical data at the user, , and  levels, as well as historical trends in message count and message type.
- Display of the number of request attempts, request success rate, and request delay of API calls at the client side and server side.

### Enable Chat-related features

After [enabling and configuring Chat Service](../get-started/enable.md), the Chat-related features in Agora Analytics are enabled by default and are free to use. No additional operation is required. 

## Usage Insights

Follow these steps to view the Chat Usage Insights page:

1. Log in to [Agora Console](https://console.agora.io/v2), and click **Agora Analytics** > **Chat Usage Insights** in the left menu bar.
2. In the upper left corner, select the project you want to view from the drop-down menu.
3. Click the **Scale Statistics** or **Message Statistics** tab at the top of the page.

### Scale Statistics

The Scale Statistics page shows the scale of users, s, and s on the current day and within a past period. This page includes the following sections:

|| Description | Notes |
| :----------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Today's Overview | Values of key usage metrics as of today. For a detailed description of each metric, see [Scale Metrics](../agora-analytics/data-metrics).
 [Scale Metrics](../chat-sdk/data-metrics).
  | N/A |
| Historical Data | Line charts and bar charts showing how the metric values change in a certain time range. | The maximum time range to query is the past 30 days.Each metric in this section is calculated at an interval of a day, and the data has a one-minute delay (except for Daily  PCU, which has a delay of 10 minutes). |

![](https://web-cdn.agora.io/docs-files/1656493263570)

![](https://web-cdn.agora.io/docs-files/1656491897724)

Taking the historical data for s as an example, the bar chart contains the following information:

- The red bar chart represents the number of new s.
- The cyan bar chart represents the number of disbanded s.
- Line charts are used for total s, peak concurrent users, and daily active s.

To hide the bar chart or line chart for a metric, click the corresponding legend.

### Message Statistics

The Message Statistics page shows the historical numbers of messages and distribution of message types. This page includes the following sections:

|| Description | Notes |
| :----------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Message Count Trends | Line charts showing how the total numbers of messages change within a certain time range. For a detailed description of each metric, see [Message metrics](../agora-analytics/data-metrics).
 [Message metrics](../chat-sdk/data-metrics).
 | The maximum time range to query is the past 6 months.Each metric in this section is calculated at an interval of a day, and the data has a one minute delay. |
| Message Type Trends | Line charts showing the number of messages by type in a certain time range, and pie charts showing the message type breakdown (the percentage of each type of messages). For a detailed description of each metric, see [Message metrics](../agora-analytics/data-metrics).
 [Message metrics](../chat-sdk/data-metrics).
 | See Message Count Trends |

![](https://web-cdn.agora.io/docs-files/1656491965158)

![](https://web-cdn.agora.io/docs-files/1656492249498)

Taking the uplink message trends of s as an example, the pie chart contains the following information:

- By default, it shows the message type breakdown within the selected time range.
- If you click a data point in the line chart on the left, the pie chart is updated to show the message type breakdown on that specific day. Click the blue **Back** button to restore the default pie chart.

## Quality Insights

Follow these steps to view the Chat quality insights page:

1. Log in to [Agora Console](https://console.agora.io/v2), and click **Agora Analytics** > **Chat Quality Insights** in the left menu bar.

2. In the upper left corner, select the project you want to view from the drop-down menu.

3. (Optional) In the upper right corner, select a unit and duration to view the end-user and server-side API data. The default is to view the last 30 minutes of data by minute.

 :::info
You can query any data within the last 7 days. If you view the data by hour, the time range of a single query cannot exceed 24 hours; if you view the data by minute, the time range of a single query cannot exceed 30 minutes.
:::

4. Click the **End-user Data** or **Server API Data** tab at the top of the page.

### End-user Data

The End-user Data section shows the number of request attempts, request success rate, and average request delay of client-side APIs. For details on the metric types and definitions, see [End-user API metrics](../agora-analytics/data-metrics).
 [End-user API metrics](../chat-sdk/data-metrics).

To present the data more intuitively, different metrics use different charts:

| Metric                        | Map (on the left)                                            | Chart (on the right)                                         |
| :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Request attempts              | The higher the number of request attempts, the darker the color of the area. | Line chart.                                                  |
| 1s/3s/5s request success rate | The higher the number of request attempts, the darker the color of the area. The larger the bubble, the lower the request success rate in that area. | Line chart.                                                  |
| Request delay                 | The higher the number of request attempts, the darker the color of the area. The larger the bubble, the higher the average request delay in that region. | Heat map chart, where the horizontal axis is time and the vertical axis is the predefined value buckets of average request delay. The darker the color of the cell, the higher the number of request attempts in the corresponding time range. |

:::info
When entering the page for the first time, the chart shows the aggregated metric value of all areas on the map. After clicking an area on the map, the chart is updated to show the metric value of that area alone.
:::

![](https://web-cdn.agora.io/docs-files/1656492270872)

### Server API Data

The Server API Data section shows the number of request attempts, request success rate, and average request delay of server-side RESTful APIs. For details on the metric types and definitions, see [Server API metrics](../agora-analytics/data-metrics).
 [Server API metrics](../chat-sdk/data-metrics).

:::info
Server API data includes the RESTful API calls made by client SDKs. For example,  operations on the client SDK is implemented by calling the RESTful API, so it is counted in the Server API data.
:::

To present the data more intuitively, different metrics use different charts:

| Metric | Chart |
| :------------------ | :----------------------------------------------------------- |
| Request attempts | Line chart. |
| 1s/3s/5s request success rate | Line chart. |
| Average request delay | Heat map chart, where the horizontal axis is time and the vertical axis is the predefined value buckets of average request delay. The darker the color of the cell, the higher the number of request attempts in the corresponding time range. |

![](https://web-cdn.agora.io/docs-files/1656493809585)
