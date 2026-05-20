---
title: Account
description: Sign up for an Agora account, create a project, and get the App ID and App Certificate.
---

## Get started with Agora

To join an Agora session, you need an Agora App ID. Create an Agora account, sign in to Console, create a project, and collect the required information from Console before you start integrating a product.

### Create an Agora project

1. In Agora Console, open the **Projects** page.
2. Click **Create New**.
3. Enter a project name and use case.
4. Select **Secured mode: App ID + Token (Recommended)** as the authentication mechanism.
5. Click **Submit**.

### Get the App ID

Agora automatically assigns a unique App ID to each project.

To copy the App ID:

1. Open the **Projects** page in Console.
2. Find your project.
3. Copy the value in the **App ID** column.

## Security and authentication

Use your Agora account to implement token-based authentication and other security features in your apps.

### Get the App Certificate

When generating an authentication token on your app server, you need an App Certificate in addition to the App ID.

1. On the **Projects** page, open the project you want to use.
2. Copy the **Primary Certificate**.

### Generate temporary tokens

To ensure communication security, best practice is to use tokens to authenticate users who log in from your client.

For temporary RTC tokens:

1. Open your project in Console.
2. In the **Security** panel, click **Generate Temp Token**.
3. Enter a channel name and click **Generate**.
4. Copy the generated token.

For other Agora products, use the Agora token builder with your App ID and App Certificate, generate the token for the target product, and then use that token in the client.
