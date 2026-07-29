---
title: "Enable whiteboard"
description: "Enable and configure Interactive Whiteboard and its server-side features in Agora Console."
---

To use Interactive Whiteboard, enable and configure it for your project in [Agora Console](https://console.agora.io).

## Prerequisites

Before you enable Interactive Whiteboard, ensure that you have:

- A valid Agora account. If you have a Netless account, you must complete the account migration first. See [Migrate from Netless to Agora](../migrate-and-accelerate-development/migration-guide.md).
- An active Agora project. If you have not created a project, see [Agora account management](/en/introduction/account#your-first-agora-project).

## Enable Interactive Whiteboard

To enable Interactive Whiteboard:

1. Log in to [Agora Console](https://console.agora.io). 
1. Select **RTC services** from the sidebar. 
1. Find **Whiteboard**, and turn on the **Active** toggle.
1. Click the settings icon to open the configuration panel. The Interactive Whiteboard panel provides security credentials and services configuration.

![Interactive Whiteboard settings on the Services page](/console-tmp/whiteboard-config.png)

## Get security credentials for your whiteboard project

Under **Basic Information**, the panel provides the following credentials:

- **App Identifier**: The unique App Identifier required for initializing the Whiteboard SDK.
- **Access Key** and **Secret Key**: A pair of keys you use to generate whiteboard tokens. See [Generate token using an app server](../authenticate-users/generate-token-app-server.mdx).
- **SDK Token**: An SDK token is a dynamic key. You can generate an [SDK Token](../authenticate-users/authentication-workflow.md) here for development and testing purposes. In a production environment, you generate an SDK Token at your app server either by using the [code samples](../authenticate-users/generate-token-app-server.mdx) or calling the [RESTful API](../authenticate-users/generate-token-rest.md).

To get the security credentials:

1. **Copy** ⧉ the **App Identifier**, **Access Key**, and **Secret Key**, and save them to a secure location.

2. To generate an SDK token, click **Generate Token**, then copy the token immediately and save it to a secure location. You cannot view the token again after you leave the page.

    :::warning
    Exposing security credentials can lead to serious risks. To improve security, Agora recommends the following best practices:

    - Avoid sending the Access Key and Secret Key to app clients or hard-coding them in the application. Ensure only the app server can read the keys from a secure configuration file.

    - Since SDK tokens generated through the Agora Console have high level permissions, do not send these tokens to app clients to prevent potential security risks.
    :::

## Enable whiteboard server-side features

Interactive Whiteboard sets up five [data centers](../../reference/security#network-geofencing). Each data center provides the following server-side features:

- File conversion features:
    - **Docs to Picture**
    - **Docs to Web**

    After enabling the file conversion features, you can call the [RESTful APIs](../../reference/rest-api/file-conversion.md) to launch a file conversion task or query the conversion progress.

    Agora charges for the file-conversion feature. See [Pricing](../../reference/pricing).

- **Screenshot**. After enabling, you can call the [RESTful APIs](../../reference/rest-api/screenshots.md) to take screenshots.

To enable one or more features and configure the storage settings:

1. Under **Services Configuration**, select a data center and click **Configure**. The data center must be the same as the one you fill in the `region` field when calling the [Create a room](../../reference/rest-api/room-management.md#create-a-room-post) API; otherwise, the service configuration does not take effect.

2. Enable one or more of **Docs to Picture**, **Docs to Web**, or **Screenshot**.

3. Set up the storage space:
    - Click the **Storage** dropdown and select a previously configured storage space, or click **Create** to add a new storage space.

    To add a new storage space, fill in the following information:
    - **Name**: (Required) The name of your storage space.
    - **Vendor**: (Required) The third-party cloud storage vendor. Choose from the following options:
        - `AWS`
        - `Alibaba Cloud`
        - `Google Cloud Platform`
        - `Huawei Cloud`

    - **Region**: (Required) The location of the data center you specified when creating a bucket.
    - **Access Key**: (Required) The access key provided by the third-party cloud storage vendor, which is used by the vendor to identify visitors.    
    - **Secret Key**: (Required) The secret key provided by the third-party cloud storage vendor, which is used to authenticate signatures.
    - **Bucket**: (Required) The name of the bucket.
    - **Storage Path**: The path used to save the resources in the storage space. The default is the root directory.
    - **Domain**: The domain name used to access the third-party cloud storage service.

    To get the above information for a third-party storage service, see the documentation provided by the vendor.

    You should enable public access or higher permission for third-party storage spaces so that your app clients can access files saved in the space.

    Click **Create** to save the storage space parameters.

4. Click **Save** to save the service configuration. Read the prompt carefully, and click **Confirm**.

## Reference
After enabling the Interactive Whiteboard, you can refer to the following documents to use its functions:
- [Join a whiteboard room](get-started-sdk/)
- [File conversion overview](../../reference/rest-api/file-conversion.md)
