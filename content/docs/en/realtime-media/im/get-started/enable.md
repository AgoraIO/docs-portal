---
title: "Enable Chat"
description: "Enable Agora Chat for your project, get your Chat connection details, and create test users and tokens."
---

Before using Chat, enable it for your project in [Agora Console](https://console.agora.io/). This page shows you how to enable Chat, get the connection details that your app needs, and create users and tokens for testing.

## Prerequisites

To enable Chat, make sure that you have the following:

- A valid [Agora account](/en/introduction/account#sign-up-for-an-agora-account).
- An [Agora project](/en/introduction/account#your-first-agora-project) that uses **App ID** and **Token** for authentication.

## Enable Chat

To enable Chat for your project:

1. In [Agora Console](https://console.agora.io/), select your project from the **Project** list at the top of the page.

1. In the sidebar, click **RTC Services**.

1. Under **Messaging & Signaling**, turn on the **Chat** toggle. The Chat **Basic Information** panel opens.

1. Select the **Data Center** closest to where most of your end users are located, then click **Enable Chat**.

   ![Select a data center and enable Chat](/temp/chat-console/chat-data-center.png)

   :::caution
   You can't change the data center after you enable Chat.
   :::

When Chat is enabled, the **Chat** card shows your plan and data center, and an **Open Chat Console** button. New Chat projects use the Free plan. To turn on Chat features or change your plan, see [Manage Chat in Agora Console](/en/realtime-media/im/reference/console/manage-chat).

![Chat card after Chat is enabled](/temp/chat-console/chat-card-enabled.png)

## Get your Chat connection details

Your app uses the following details to connect to Chat:

- **App ID**: The unique identifier of your Agora project. Chat SDK initialization and RESTful API requests use the App ID. To find it, see [Get the App ID and App Certificate](/en/introduction/account#get-the-app-id-and-app-certificate).
- **Data Center**: The region where Chat stores your project's data. Agora provides several data centers for the service in different regions, including Singapore, Frankfurt (Germany), and Virginia (USA).
- **API Request URL**: The domains of the WebSocket and RESTful API requests that Agora assigns to each project.

:::info
As of v1.4.0, the Chat SDK uses the App ID instead of the App Key. Apps that integrated an earlier SDK version using the App Key continue to work without changes. If your app uses the App Key, get the **AppKey**, **OrgName**, and **AppName** from **Legacy Integration Details** in the Chat **Basic Information** panel.
:::

To get these details:

1. On the **RTC Services** page, click the settings icon on the **Chat** card to open the Chat **Basic Information** panel.

1. Get the following values:

   - **Data Center**: Shown in the **Data Center** section.
   - **WebSocket Address** and **REST API**: Shown in the **API Request URL** section.
   - **AppKey**, **OrgName**, and **AppName** (legacy apps only): Click **Expand details** next to **Legacy Integration Details**.

   ![Chat Basic Information panel](/temp/chat-console/chat-basic-information.png)

<!-- TODO(chat-console): Confirm that the settings icon on the Chat card opens the Chat Basic Information panel. -->

## Manage users and generate tokens

For development purposes, you can manage users and generate temporary Chat tokens in Agora Console. In a production environment, use the [RESTful API](/en/api-reference/api-ref/im/user-system-registration) to manage users and a token server to [generate user authentication tokens](/en/realtime-media/im/build/secure-access-and-authentication/authentication).

### Register a user

To register a user:

1. On the **RTC Services** page, click **Open Chat Console** on the **Chat** card.

1. In the Chat Console sidebar, click **User Management**, then click **Create User**.

1. Enter a **User ID** and click **Save**. For supported characters, see [User registration](/en/api-reference/api-ref/im/user-system-registration).

   ![Chat Console User Management page](/temp/chat-console/chat-user-management.png)

<!-- TODO(chat-console): Document the UID auto-creation toggle on User Management once its behavior is confirmed. -->

### Generate an app token

In the Chat **Basic Information** panel, under **Chat App Temp Token**, click **Generate**.

### Generate a user token

To ensure communication security, Agora recommends using tokens to authenticate users who log in to Chat.

To generate a temporary user token for testing, in the Chat **Basic Information** panel, under **Chat User Temp Token**, enter a registered user ID, then click **Generate**.

## Next steps

To build your first Chat app, see the [SDK quickstart](/en/realtime-media/im/get-started-sdk) or the [UI Kit quickstart](/en/realtime-media/im/get-started-uikit).
