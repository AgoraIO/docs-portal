---
title: Account
description: Sign up for an Agora account, create a project, and get the App ID and App Certificate.
---

## Get started with Agora

To join an Agora session, you need an Agora App ID. Create an Agora account, sign in to Console, create a project, and collect the required information from Console before you start integrating a product.

To create a project and get the App ID and App Certificate, see [Projects](/en/introduction/projects).

## Security and authentication

Use your Agora account to implement token-based authentication and other security features in your apps.

For App Certificate management, see [Projects](/en/introduction/projects#manage-app-certificates).

### Generate temporary tokens

To ensure communication security, best practice is to use tokens to authenticate users who log in from your client.

For temporary RTC tokens:

1. Open your project in Console.
2. In the **Security** panel, click **Generate Temp Token**.
3. Enter a channel name and click **Generate**.
4. Copy the generated token.

For other Agora products, use the Agora token builder with your App ID and App Certificate, generate the token for the target product, and then use that token in the client.
