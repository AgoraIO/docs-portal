---
title: Account
description: Sign up for an Agora account, create a project, and get the App ID and App Certificate.
---

This page shows you how to sign up for an Agora account, create a new project, and get the App ID and App Certificate to generate a temporary token.

## Get started with Agora

To join an Agora session, you need an Agora App ID. This section shows you how to set up an Agora account, create an Agora project and get the required information from [Agora Console](https://console.agora.io/).

### Sign up for an Agora account

To use Agora products and services, create an Agora account with your email, phone number, or a third-party account.

Once you sign up successfully, your account is automatically logged in. Follow the on-screen instructions to create your first project and test out real-time communications.

For later visits, log in to [Agora Console](https://console.agora.io/) with your phone number, email address, or linked third-party account.

### Create an Agora project

To create an Agora project, do the following:

1. In [Agora Console](https://console.agora.io/), open the [Projects](https://console.agora.io/legacy/project-management) page.
2. Click **Create New**.
3. Follow the on-screen instructions to enter a project name and use case, and check **Secured mode: APP ID + Token (Recommended)** as the authentication mechanism.

    ![configure_project](https://assets-docs.agora.io/images/signaling/create_new_project.png)

4. Click **Submit**. You see the new project on the **Projects** page.

### Get the App ID

Agora automatically assigns a unique identifier to each project, called an App ID.

To copy this App ID, find your project on the [Projects](https://console.agora.io/legacy/project-management) page in Agora Console, and click the copy icon in the **App ID** column.

![configure_project](https://assets-docs.agora.io/images/signaling/app-id.png)

## Security and authentication

Use the following features from your Agora account to implement security and authentication features in your apps.

### Get the App Certificate

When generating an authentication token on your app server, you need an App Certificate, in addition to the App ID.

To get an App Certificate, do the following:

1. On the [Projects](https://console.agora.io/legacy/project-management) page, click the pencil icon to edit the project you want to use.

    ![Console project management page](https://assets-docs.agora.io/images/common/console-project-management-page.png)

2. Click the copy icon under **Primary Certificate**.

    ![Console primary certificate](https://assets-docs.agora.io/images/common/console-primary-certificate.png)

For full App Certificate management details, see [Projects](/en/introduction/projects#manage-app-certificates).

### Generate temporary tokens

To ensure communication security, best practice is to use tokens to authenticate the users who log in from your app.

To generate a temporary RTC token for use in your project:

1. On the [Projects](https://console.agora.io/legacy/project-management) page, click the pencil icon next to your project.
2. On the **Security** panel, click **Generate Temp Token**, enter a channel name in the pop-up box and click **Generate**.
3. Copy the generated RTC token.

To generate a token for other Agora products:

1. In your browser, navigate to the [Agora token builder](https://agora-token-generator-demo.vercel.app/).
2. Choose the Agora product your user wants to log in to. Fill in **App ID** and **App Certificate** with the details of your project in Agora Console.
3. Customize the token for each user. The required fields are visible in the Agora token builder.
4. In token-based authentication, each token is specific to a user ID in your app. Generate a token for each user, and make sure the user ID in your SDK login or join call matches the user ID used to create the token.
5. Click **Generate Token**.

   The token appears in Token Builder.

6. Copy the token and use it in your app.

For more information on managing other aspects of your Agora account, see [Console setup](/en/introduction/console-setup).
