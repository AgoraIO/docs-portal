---
title: 'Magic Leap'
description: 'Integrate Video SDK for Unity into your Magic Leap app.'
---

Agora Video SDK for Magic Leap allows you to integrate real-time Video Calling features into your [Magic Leap](https://www.magicleap.com/) app. You can enhance the overall user experience and add new possibilities for collaboration and interaction within Magic Leap environments.

This page shows the minimum code you need to integrate high-quality, low-latency Video Calling features into your Magic Leap project using Video SDK.

## Understand the tech

This section explains how you can integrate Video Calling features into your Magic Leap project using Video SDK.

To start a session, implement the following steps in your app:

- **Retrieve a token**: A token is a computer-generated string that authenticates a user when your app joins a channel. In a test or production environment, your app retrieves tokens from a server in your security infrastructure.
- **Join a channel**: Call methods to create and join a channel. Apps that pass the same channel name join the same channel.
- **Send and receive video and audio**: All users in the channel can send and receive real-time audio and video streams.

## Prerequisites

To test the code used on this page, you need:

- An Agora [account](../manage-agora-account.mdx) and [project](../manage-agora-account.mdx)
- A computer with Internet access
- A network environment where no firewall blocks required communication
- The [SDK quickstart](/en/realtime-media/video/get-started-sdk) implemented in your project
- [ML Hub](https://developer-docs.magicleap.cloud/docs/guides/getting-started/install-the-tools)
- [Unity Hub](https://unity.com/download)
- [Install and configure the Unity Editor required to develop for Magic Leap 2](https://developer-docs.magicleap.cloud/docs/guides/unity/getting-started/install-the-tools)

## Project setup

To integrate Video Calling into your Magic Leap project, do the following:

1. **Create a Magic Leap project for Unity**

- [Create a project](https://developer-docs.magicleap.cloud/docs/guides/unity/getting-started/create-a-project) for your Agora Magic Leap app
- [Configure your app settings](https://developer-docs.magicleap.cloud/docs/guides/unity/getting-started/configure-unity-settings)

2. **Configure your project**

In Unity Editor:

1. Click **Edit** > **Project settings**.
2. In **XR Plug-in Management**, enable **Magic Leap**.
3. In **XR Plug-in Management** > **Magic Leap Settings**, enable **Use ML Audio**.
4. In **Player settings** > **Android** > **Publishing settings**, enable **Custom Main Manifest**.
5. In **Magic Leap** > **Permissions**, enable `android.permission.CAMERA` and `android.permission.RECORD_AUDIO`.

You are now ready to add Video Calling features to your Magic Leap project.

## Integrate the Video Calling demo

When a user opens the app, you initialize the Agora Engine. When the user taps a button, the app joins or leaves a channel. When another user joins the same channel, their video and audio are rendered in the app. This simple workflow lets you focus on implementing Agora features instead of surrounding UI complexity.

This section shows how to integrate the Video SDK to implement the Video Calling demo in your Magic Leap project:

1. [Download](/sdks) the latest version of Video SDK for Magic Leap to a local folder.
2. Double-click the downloaded package.

The Import dialog opens automatically in Unity Editor.

3. Click **Import**.

In **Project** > **Assets**, you see `Agora-RTC-Plugin` and `Agora_MagicLeap2_Plugin`.

## Test your implementation

Agora recommends that you run this project on a physical device, because some simulators may not support the full feature set.

To verify the integration:

1. Obtain an App ID with token enabled.
2. [Generate a temporary token](../manage-agora-account.mdx#generate-a-temporary-token) in Agora Console.
3. In your browser, open the [Agora web demo](https://webdemo.agora.io/basicVideoCall/index.html) and update `App ID`, `Channel`, and `Token` with the same values used for this project, then click **Join**.
4. In Unity Editor, double-click **Agora_MagicLeap2_Plugin** > **AgoraEngine** > **ML2Support** > **Demo**.
5. In **Project**, open **Agora_MagicLeap2_Plugin** > **AgoraEngine** > **ML2Support** > **Scripts** > **Agora Controller**.
6. Update `APP_ID`, `TOKEN`, and `CHANNEL_NAME` with the same values you used for the web demo.
7. Connect an ML2 device, then click **Build and Run**.
8. Click **Connect Camera**.

Video from your ML2 is streamed to the channel and is visible in the web demo. You also see the remote video stream from the web demo.

## Reference

- [Manual install](/sdks) shows how to install Video SDK manually
- To ensure communication security in test or production environments, best practice is to use a token server. See [Use tokens](../build/authenticate-users/authentication-workflow.mdx)

### API reference

- [JoinChannel](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_joinchannel)
- [EnableVideo](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_enablevideo)
- [CreateAgoraRtcEngine](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_createagorartcengine)
- [InitEventHandler](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_addhandler)
- [LeaveChannel](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_leavechannel)
- [DisableVideo](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_disablevideo)
- [PushVideoFrame](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_imediaengine_pushvideoframe)
- [PushAudioFrame](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_imediaengine_pushaudioframe0)
- [PullAudioFrame](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_imediaengine_pullaudioframe)
