---
title: Enable Cloud Transcoding
description: Enable Cloud Transcoding for your Agora project.
---

This page shows you how to sign up for an Agora account, create a new project, and get the app ID and app certificate to generate a temporary token. 

## Get started with Agora

To join a Cloud Transcoding session, you need an Agora App ID. This section shows you how to set up an Agora account, create an Agora project and get the required information from [Agora Console](https://console.agora.io/v2).


### Sign up for an Agora account

To use Agora products and services, create an Agora account with your email, phone number, or a third-party account.

**Sign up with email**
1. Go to the [signup page](https://sso.agora.io/en/signup).

1. Fill in the required fields.

1. Carefully read the **Terms of Service**, **Privacy Policy**, and **Acceptable Use Policy**, and tick the checkbox.

1. Click **Continue**.

1. Enter your **verification code** and click **Confirm**.

1. Follow the on-screen instructions to provide your name, company name, and phone number, set a password, and click **Continue**.

**Sign up with a third-party account**
1. On the [Agora Console](https://console.agora.io/v2) login page, select the third-party account you want to use.

1. Follow the on-screen instructions to complete verification.

1. Click **Create a new account**.

1. Carefully read the **Terms of Service**, **Privacy Policy**, and **Acceptable Use Policy**, and select the checkbox.

1. Click **Continue**.


Once you sign up successfully, your account is automatically logged in. Follow the on-screen instructions to create your first project and test out real-time communications.

For later visits, log in to [Agora Console](https://console.agora.io/v2) with your phone number, email address, or linked third-party account.

### Create an Agora project

To create an Agora project, do the following:

1.  In [Agora Console](https://console.agora.io/v2), open the [Projects](https://console.agora.io/v2/project-management) page.

1.  Click **Create New**.

1.  Follow the on-screen instructions to enter a project name and use case, and check **Secured mode: APP ID + Token (Recommended)** as the authentication mechanism.

    ![configure_project](/images/signaling/create_new_project.png)

1.  Click **Submit**. You see the new project on the **Projects** page.

### Get the App ID

Agora automatically assigns a unique identifier to each project, called an App ID.

To copy this App ID, find your project on the [Projects](https://console.agora.io/v2/project-management) page in  Agora Console, and click the copy icon in the **App ID** column.

![configure_project](/images/signaling/app-id.png)

## Security and authentication

Use the following features from your Agora account to implement security and authentication features in your apps.

### Get the App Certificate

When generating an authentication token on your app server, you need an App Certificate, in addition to the App ID. 

To get an App Certificate, do the following:

1.  On the [Projects](https://console.agora.io/v2/project-management) page, click the pencil icon to edit the project you want to use.

    ![Console project management page](/images/common/console-project-management-page.png)

1.  Click the copy icon under **Primary Certificate**.

    ![Console primary certificate](/images/common/console-primary-certificate.png)

### Generate temporary tokens

To ensure communication security, best practice is to use tokens to authenticate the users who log in from your app.

To generate a temporary RTC token for use in your Video SDK projects:

1. On the [Projects](https://console.agora.io/v2/project-management) page, click the pencil icon next to your project.

1. On the **Security** panel, click **Generate Temp Token**, enter a channel name in the pop-up box and click **Generate**. Copy the generated RTC token for use in your Cloud Transcoding projects.

To generate a token for other Agora products:

1. In your browser, navigate to the [Agora token builder](https://agora-token-generator-demo.vercel.app/).

1. Choose the Agora product your user wants to log in to. Fill in **App ID** and **App Certificate** with the
details of your project in Agora Console.

1. Customize the token for each user. The required fields are visible in the Agora token builder.

1. Click **Generate Token**.

    The token appears in Token Builder.

1. Copy the token and use it in your app.

For more information on managing other aspects of your Agora account, see [Agora console overview](../../broadcast-streaming/reference/console-overview).

## Enable Cloud Transcoding

Contact [Agora technical support](mailto:support@agora.io) to activate Cloud Transcoding for your project. After activation, you can call the RESTful APIs.

## Enable multi-bitrate 
To use the multi-bitrate service on the viewer side, contact [Agora technical support](mailto:support@agora.io) for activation.
