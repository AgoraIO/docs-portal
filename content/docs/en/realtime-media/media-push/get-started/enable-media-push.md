---
title: "Enable Media Push"
description: "Shows how to enable Media Push."
---

Media Push enables you to stream audio and video from Agora channels to CDNs and other RTMP-based platforms. To enable Media Push in Agora Console:

1. Log in to [Agora Console](https://console.agora.io/), and click **Projects** in the left navigation panel.

2. Under **My Projects**, find the project for which you want to enable the Media Push service, and click the edit icon.

    ![](https://assets-docs.agora.io/images/media-push/project-list.png)

3. Under **All Features**, find Media Push, and click **Enable Server Side RESTful API**.

    ![](https://assets-docs.agora.io/images/media-push/enable-media-push.png)

4. Read the pop-up prompt carefully, and then click **Confirm**.



    :::info
    You cannot disable the service once you enable it.
    :::

The Media Push panel shows an **Active** label. You have now enabled Media Push.

To process a media stream and push it to a CDN, you create a converter in the Agora channel. To create and manage converters, see [Use RESTful API](../build/restful-api).
