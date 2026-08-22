---
title: "Enable and configure Chat"
description: "Introduces how to enable and configure Agora Chat."
---

Before using Chat, you need to enable and configure it through [Agora Console](https://console.agora.io/).

## Prerequisites

To enable Chat, make sure that you have the following:

- A valid [Agora account](/en/introduction/account#sign-up-for-an-agora-account).
- An [Agora project](/en/introduction/account#your-first-agora-project) that uses  **App ID** and **Token** for authentication.
- A Chat pricing plan. For details on how to subscribe, see [Subscribe to the pricing plan](/en/realtime-media/im/reference/pricing#subscribe-to-the-pricing-plan).

## Enable Chat

1. Log in to [Agora Console](https://console.agora.io/).

1. Select **RTC Services** from the sidebar, then locate the **Chat** card and turn on its toggle. The **Chat - Basic Information** panel opens.

    ![Chat Basic Information panel](/console-tmp/chat-basic-info.png)

1. Select a **Data Center** closest to where most of your end users are located.

    :::warning
    You can't change the data center after you enable Chat.
    :::

1. Select **Enable Chat**.

Once Chat is enabled, configure the following advanced features based on your business requirements:
- [Message Callback](/en/realtime-media/im/build/notifications-and-event-handling/setup-webhooks)
- [Message Recall](/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages#recall-a-message)
- [Message Thread](/en/realtime-media/im/build/build-groups-rooms-and-threads/threading/thread-management)
- [Reaction](/en/realtime-media/im/build/build-core-messaging/reaction)
- [Offline Message Push (Advanced)](/en/realtime-media/im/build/notifications-and-event-handling/offline-push/overview)
- [Presence](/en/realtime-media/im/build/build-core-messaging/presence)
- [Translation](/en/realtime-media/im/build/build-core-messaging/messages/translate-messages)
- [Moderation](/en/realtime-media/im/build/moderate-and-manage-client-behavior/moderation-mechanism)

## Get Chat project information

Agora Console assigns the following information to each project that enables Chat:

- **Data Center**: Agora provides several data centers for the service in different regions, including Singapore, Frankfurt (Germany), and Virginia (USA). After the plan is changed, the data center remains unchanged.
- **AppKey**: The unique identifier that Chat assigns to each app. The **AppKey** is of the form `${OrgName}#{AppName}`.
    :::info
    The **AppKey** is not the same as your project App ID. You can get your **AppKey** from the Chat configuration section of Agora Console.
    :::
- **OrgName**: The unique identifier that Chat assigns to each enterprise (organization).
- **AppName**: The name that Chat assigns to each app. Each app under the same enterprise (organization) must have a unique App Name.
- **API request URL**: The domain of the WebSocket and RESTful API request that Agora assigns to each project.

Follow these steps to get the project information:

1. In [Agora Console](https://console.agora.io/), select **RTC Services** from the sidebar.
1. Locate the **Chat** card and select the settings icon to open the **Chat - Basic Information** panel.
1. Under **Chat Service Status**, get the values of **AppKey**, **OrgName**, and **AppName**.

## Manage users and generate tokens

For development purposes, Agora enables you to manage users and generate Chat user authentication tokens using Agora Console. In a production environment, you use the [RESTful API](/en/api-reference/api-ref/im/user-system-registration) to manage users and a token server to [generate user authentication tokens](/en/realtime-media/im/build/secure-access-and-authentication/authentication).

This section shows you how to register Chat users and generate temporary tokens using Agora Console.

### Register a user

To register a user, do the following:

1. On the **Chat** card, select **Open Chat Console**.
1. Select **Connect Chat Console**. The page loads automatically once the Chat Console session is ready.
1. In the sidebar, under **ACTION**, select **User Management**.

    ![Chat Console User Management page](/console-tmp/chat-user-management.png)

1. Select **Create**, enter a **Username**, and select **Save**. The new user appears in the users list.

    ![Chat Console user list after creating a user](/console-tmp/chat-user-list.png)

### Generate an app token

In the [Chat - Basic Information](#enable-chat) panel, under **Chat App Temp Token**, select **Generate** to generate a token with app privileges.

### Generate a user token

To ensure communication security, Agora recommends using tokens to authenticate users who log in to Chat.

For testing purposes, Agora Console supports generating temporary tokens for Chat. In the [Chat - Basic Information](#enable-chat) panel, under **Chat User Temp Token**, enter the [user ID](#userid) and select **Generate** to generate a token with user privileges.

## Change the Chat plan

1. Log in to [Agora Console](https://console.agora.io/).
1. Select **Subscriptions** in the sidebar.
1. Switch to the **Chat (IM)** tab.
1. Select your desired plan and select **Change plan**.

    ![Chat subscription plans](/console-tmp/chat-subscriptions.png)

:::note
- The plan change takes effect immediately.
- Agora doesn't recommend plan downgrading, as it could impact the capacity of your applications and availability of certain features.
:::

## Unsubscribe Chat

To unsubscribe, downgrade to the Free plan on the **Chat (IM)** tab of the **Subscriptions** page. See [Change the Chat plan](#change-the-chat-plan).

:::note
When you unsubscribe Chat:
- All Chat-related data is purged.
- You are still billed with a pro-rated monthly fee and the usage that occurred during that month.
:::

## Next steps

After enabling and configuring Chat, the Chat-related features in Agora Analytics are enabled by default to help you keep track of usage trends and quality details. For more information, see [Data Insights](/en/realtime-media/im/reference/console/data-insights) and [Data Metrics](/en/realtime-media/im/reference/console/data-metrics).
