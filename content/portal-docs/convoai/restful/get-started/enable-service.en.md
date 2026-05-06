---
title: Enable the Service
description: "Before trying Agora Conversational AI Engine, you need to create a project in the Agora Console, enable the Conversational AI Engine service, and obtain the App ID, customer ID, customer secret, and other parameters required for RESTful API calls."
---

# Enable the Service

Before trying Agora Conversational AI Engine, you need to create a project in the [Agora Console](https://console.shengwang.cn/), enable the Conversational AI Engine service, and obtain the App ID, customer ID, customer secret, and other parameters required for RESTful API calls.

## Sign In to the Agora Console

If you are using Agora services for the first time, click [Sign up](https://sso.shengwang.cn/cn/v4/signup/with-sms) to go to the console and register an account. You will be signed in automatically after registration succeeds.

If you already have an Agora account, you can go directly to the [Console sign-in page](https://console.shengwang.cn//).

> Info
> If you have questions during registration or sign-in, see [Quick Start](https://doc.shengwang.cn/doc/console/general/quickstart).

## Create an Agora Project

After signing in to the console successfully, follow these steps to create an Agora project:

1. Open the drop-down list in the upper-left corner of the console and click **Create Project**.
2. In the dialog box, select the **Project Type**, enter the **Project Name**, and choose the **Scenario Label** and **Authentication Mechanism**. Agora recommends **Secure Mode** for authentication. **Testing Mode** is less secure.

> Note
> When creating a project for the Conversational AI Engine service, select **General Project** as the project type.

## Get the App ID

After the project is created successfully, Agora automatically assigns an App ID to the project as its unique identifier. On the **Overview** page, click the copy icon next to App ID in the **Project Information** section to get the App ID for the current project.

Save the copied App ID. You will need to pass it in when you later call APIs for initialization and other operations.

## Enable Conversational AI Engine

Follow these steps to enable the Conversational AI Engine service for your project in the Agora Console:

1. Sign in to the [Agora Console](https://console.shengwang.cn/) and select the project for which you want to enable the Conversational AI Engine service from the drop-down list in the upper-left corner.
2. In the left navigation pane, go to **All Products** > **Conversational AI Engine**.
3. In the **Conversational AI Engine** page that appears, choose **Feature Configuration**, then click the button on the right side of **Service Status** to enable the Conversational AI Engine service.

![image](https://doc.shengwang.cn/img/convoai/enable-1.png)

4. After enabling the service, if you see the following page under **Feature Configuration**, the Conversational AI Engine service has been enabled successfully for the project:

![image](https://doc.shengwang.cn/img/convoai/enable-2.png)

## Get the Customer ID and Customer Secret

Agora RESTful APIs use HTTP Basic Authentication. For HTTP Basic Authentication, you need to use the customer ID and customer secret provided by Agora to generate a credential encoded with Base64, and then put it into the `Authorization` field of the HTTP request header.

Follow these steps to get the customer ID and customer secret:

1. In the left-side menu of the [Agora Console](https://console.shengwang.cn/), click **Settings** > **RESTful API** to open the RESTful API page.
2. On the RESTful API page, click **Add Secret** to generate a customer ID and customer secret.
3. In the corresponding customer secret row, click **Download**. After reading the prompt carefully in the pop-up window, click **Download**. Keep the downloaded `key_and_secret.txt` file safe. In this file, `key` is the customer ID and `secret` is the customer secret.

> Info
> The customer ID and customer secret are used only to access RESTful APIs. The customer secret can be downloaded only once and is not stored in the console after download, so keep it safe.

## Get a Temporary Token

For projects that use Secure Mode as the authentication mechanism, you also need to pass in the channel name and token in subsequent API calls such as joining a channel to authenticate users.

To make evaluation and testing easier, you can get a temporary token from the console during the app debugging stage. The token is valid for 24 hours, and you do not need to deploy your own token server yet. However, before your app goes live, you must deploy your own server to generate tokens.

In the drop-down list in the upper-left corner of the console, switch to the project for which you want to get a temporary token, and then follow these steps:

1. On the **Overview** page, click **Temporary Token Generator** in the **Project Information** section.
2. On the **Generate Temporary Token** page, click **Add Product**.
3. Select the **RTC** product and enter a channel name, for example `testChannel`. Save the content you entered.
4. Click **Confirm**.
5. After the temporary token is generated successfully, click the copy icon next to the token and save the copied token.
