---
title: "Pricing"
description: "Provides information on billing, fee deductions, free-of-charge policy, and account suspension for Interactive Whiteboard."
---

This page explains how Agora calculates your monthly bill for Interactive Whiteboard.

If you have already signed a contract with Agora, the billing terms and conditions within that contract take precedence.

## Interactive Whiteboard pricing

The unit prices for whiteboard features are as follows:

| Whiteboard feature | Volume | Pricing per volume/month | Pricing per PCW/month |
| --- | --- | --- | --- |
| Online whiteboard | Under 10,000 minutes | Free | - |
| Online whiteboard | 10,000 - 60,000 minutes | $1.40 USD/1,000 minutes | - |
| Online whiteboard | 60,000 - 120,000 minutes | $1.30 USD/1,000 minutes | - |
| Online whiteboard | 120,000 - 1,000,000 minutes | $1.10 USD/1,000 minutes | - |
| Online whiteboard | Over 1,000,000 minutes | Contact Agora Sales | - |
| File conversion | 0 - 1,000 images/web pages | Free | $499/PCW |
| File conversion | Static file conversion (to image) | $0.50 USD/1,000 images | $499/PCW |
| File conversion | Dynamic file conversion (to web page) | $2.50 USD/1,000 web pages | $499/PCW |

If your use-case involves other Agora products or services, such as the Video Calling, Signaling, or Cloud Recording, expect additional charges for these products or services. For details, see the pricing policy for each Agora product or service.

## Cost calculation

Billing for Interactive Whiteboard begins once you enable and implement the service in your project and occurs monthly.

Agora calculates your monthly pricing by adding up the usage of each whiteboard feature in all
projects under your [Agora Account](https://console.agora.io/v2), subtracting your monthly free usage allowances,
multiplying each resulting usage number by the corresponding price, and adding up the cost of each feature.

The basic formulas are shown here:

**Monthly cost** = **monthly online whiteboard cost** + **monthly file conversion cost**

**Monthly feature cost** = **(monthly total usage - free-of-charge usage) × unit price**

### Online whiteboard usage

The usage duration of each whiteboard room equals **the total sum of usage duration of all users** in the room.
Billing **does not start** when the room is created, but rather when users join.

For each user, Agora calculates the usage duration from when they join to when they leave the room.

Note that usage calculation will continue if live streaming has ended but users are still in the room.

To avoid additional costs, Agora recommends that you:

    - Call `disconnect()` to cut off a user's connection when the user leaves the room, and ensure that you receive the `onPhaseChanged(disconnected)` callback.
    - Call the [Interactive Whiteboard RESTful API](../reference/rest-api/room-management##disable-a-room-patch)  on your app server to move all users out of the room when live streaming ends.

The usage calculation and unit price are the same whether the user joins a room in interactive mode or subscription mode.

The usage duration is calculated in minutes.

### File conversion usage

Agora bills for this feature based on the model you select in [Agora Console](https://console.agora.io/v2): Per volume or per PCW.

#### Per volume

Agora calculates the number of files converted to images/web pages per month and applies the unit prices specified in the table below. This model has a hard cap of one Peak Concurrent Worker (PCW) (running conversion task) for each conversion mode running in a server region under a single project. In other words, if you have 1 project with 1 server region, you can run 2 conversion tasks simultaneously - 1 static and 1 dynamic - while the rest are queued. If you have 3 projects, each with servers in 2 regions, you can run 6 (3 x 2) dynamic and 6 (3 x 2) static conversions simultaneously.

Agora does not charge for a failed file conversion task.
You can call the [Query file conversion progress](../reference/rest-api/file-conversion.md#query-the-progress-of-a-file-conversion-task)
API to get the result of a file conversion task.

#### Per Peak Concurrent Workers

**Peak Concurrent Workers (PCW)** are the maximum number of file conversion tasks that Interactive Whiteboard servers can process simultaneously per project per server region per file conversation mode (dynamic or static). The unit pricing is per PCW per month, with an unlimited number of files that can be converted to images or web pages. If you set PCW to 2 or 3, this means you will be able to run up to 2 or 3 conversion tasks at the same time, respectively. The hard cap on the PCW used in this model is set to 5 per project, with the ability to adjust it in the [Agora Console](https://console.agora.io/v2).

At that, if you use less PCW during the month, Agora will bill only for the actual PCW usage. Your PCW usage depends on the frequency of requests submitted to our servers and the file size. It increases when the service is processing existing file conversion tasks and a new task is submitted.

## Examples

This section illustrates how Agora calculates the cost for Interactive Whiteboard.

### Online whiteboard + file conversion billed per volume

Suppose user A joins a whiteboard room to give an online lecture and successfully converts a
50-page PPTX file to web pages using the file conversion feature. Another 200 users join the room to
watch the lecture. The lecture lasts 60 minutes. When the lecture ends, all users leave the room at the
same time.

The usage calculation is as follows:

| Feature                       | Usage                                                                   |
|:------------------------------|:------------------------------------------------------------------------|
| Online whiteboard             | - User A: 60 minutes<br />- Another 200 users: 60 × 200 minutes<br /> |
| File conversion to web page   | 50 web pages                                                            |

The following table shows the calculation of the total cost of the lecture:

| Billed service | Unit price, US$/1,000 minutes | Cost of each service, US$ | Total cost, US$ |
| --- | --- | --- | --- |
| Online whiteboard | $1.40/1,000 minutes | (12,060 - 10,000)/1000 × 1.40 = 2.884 | 2.89 |
| File conversion to web page | $2.50/1,000 web pages | 0 (The first 1,000 converted web pages are free of charge) | 2.89 |

Agora rounds up the total cost to two decimal places.

### File conversion billed per PCW

Suppose a customer has a project that needs file conversion and decides to adopt PCW-based pricing.

The hard cap is set to 5 PCW/project/region/conversion mode (dynamic or static). The customer ends up consuming the total of 3 PCW across this project. The calculation will be as follows:

**$499 x 3 = $1497 for this project per month**

## Reference

### Check your current usage

You can check your usage of Interactive Whiteboard in Agora Console. Perform the following steps:

1. Log in to [Agora Console](https://console.agora.io/v2) and click the **Usage** button on the left navigation panel.

2. Click the arrowhead in the top left corner, and select the project you want to check in the drop-down box.

3. Click **Duration** under **Whiteboard**, select a time frame, and check the usage duration.

 ![](https://web-cdn.agora.io/docs-files/1620288770652)

- The time frame cannot exceed 12 months.
- Only Agora accounts that are assigned with the role of Admin or Finance have access to the usage statistics.
- The usage duration provided by Agora Console is for reference only. Your actual billing may differ.

## See also

- [Billing policies and free-of-charge policy](https://docs.agora.io/en/realtime-media/im/reference/billing-policies)
