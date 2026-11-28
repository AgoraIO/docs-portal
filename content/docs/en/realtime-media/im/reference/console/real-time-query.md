---
title: "Monitor Chat usage and quality"
description: "Monitor Chat activity, message delivery, user connections, and device logs in Agora Console."
---

Chat provides real-time data in Agora Console to help you monitor usage and troubleshoot issues. To view it, open Chat Console and use the pages under **Monitor** in the sidebar:

- **Overview**: Active users, groups, and chat rooms, device operating systems, and message volume.
- **Hot Data**: The most active users, chat groups, and chat rooms within a time range.
- **Message Deliver Quality**: The delivery details of specific messages.
- **User Connect Status**: The connection history of a user.
- **User Logs**: Client logs uploaded from a user's device.

To open Chat Console, in [Agora Console](https://console.agora.io/), select your project from the **Project** list at the top of the page. In the sidebar, click **RTC Services**, then click **Open Chat Console** on the **Chat** card.

## Overview

The **Overview** page summarizes your project's activity:

- **Active users**, **Active groups**, and **Active chatrooms**: Activity within the previous 30 minutes, updated every minute.
- **Device OS**: The operating systems of devices logged in on the day of viewing, updated every minute.
- **Message volume**: The message volume for one-to-one chats, group chats, and chat rooms today, yesterday, or the day before yesterday, updated every 10 minutes.

![Chat Console Monitor Overview page](/temp/chat-console/chat-monitor-overview.png)

## Hot Data

To query the top 50 active users, chat groups, or chat rooms, select the **Hotspot type**, set the **Start time** and **End time**, then click **Search**. To download the results, click **Export**.

## Message Deliver Quality

To check how specific messages were delivered, select the **Query ID** type and enter the ID, such as a sender ID. Optionally, filter by **Conversation type**, **Message type**, **Message source**, and **Query time**, then click **Search**. The results show message metadata, delivery events, and the sender's recent history.

## User Connect Status

To query a user's connection history across platforms, enter the **User ID**, set the **Start time** and **End time** within the previous three days, then click **Search**.

## User Logs

To get the client logs from a user's device:

1. Enter the **User ID** and click **Request upload** to send an upload command to the user's device.

   - If the user is online, the upload normally completes within 5 seconds.
   - If the user is offline, the logs upload when the user next comes online. The upload command is valid for 7 days. If the user doesn't log in within that time, the command expires without uploading logs.

1. Click **Search** to retrieve the uploaded logs. Uploaded logs are kept for 7 days.

On the device, the SDK writes logs to the following files:

- Android: `/sdcard/Android/data/{package name}/{appkey}/core_log/easemob.log`
- iOS: `{app sandbox path}/Library/Application Support/HyphenateSDK/easemobLog/easemob.log`
