---
title: "Magic Leap"
description: "integrate Video SDK for Unity to your Magic Leap app."
---

Agora Video SDK for Magic Leap allows you to integrate real-time Interactive Live Streaming features into your [Magic
Leap](https://www.magicleap.com/) app. You can enhance the overall user experience and add new possibilities for collaboration and
interaction within Magic Leap environments.

This page shows the minimum code you need to integrate high-quality, low-latency Interactive Live Streaming features into your Magic Leap project using Video SDK.

## Understand the tech

This section explains how you can integrate Interactive Live Streaming features into your Magic Leap project using Video SDK. The following figure shows the workflow you need to integrate this feature into your app.

**Magic Leap Interactive Live Streaming workflow**

![Video Calling Web UIKit](https://assets-docs.agora.io/images/interactive-live-streaming/get-started-sdk-livestreaming.png)

In an Interactive Live Streaming event, hosts stream a video feed to an audience. For example, when a CEO is giving a speech to the company employees, the CEO does not need to see all members of the audience. To represent this in your app, when you join as a host, the local feed is started and you see your own video feed. When you join as a member of the audience, you see the host's video feed.

To start a session, implement the following steps in your app:

- *Set the channel profile and role*: For hosts, set the channel profile to `LIVE_BROADCASTING` and their role to `BROADCASTER`. For audience members, set the role to `AUDIENCE`.

- *Retrieve a token*: A token is a computer-generated string that authenticates a user when your app joins a channel. In a test or production environment, your app retrieves tokens from a server in your security infrastructure.
- *Join a channel*: Call methods to create and join a channel; apps that pass the same channel name join the same channel.

- *Host publishes local video and audio to the channel*: A live streaming event has one or more hosts. Each host can publish their local video to the channel.
- *Audience subscribes to video and audio published by the hosts to the channel*: Audience members view content published by hosts to the channel.

## Prerequisites

In order to follow this procedure, you must have:

To test the code used in this page you need to have:
* An Agora [account](/en/introduction/account) and [project](/en/introduction/account).
* A computer with Internet access.
  Ensure that no firewall is blocking your network communication.

* Implemented the [SDK quickstart](../index.mdx)

- [Unity Hub](https://unity.com/download)
- [Unity Editor 2017.X LTS or higher](https://unity.com/releases/editor/archive)
- Microsoft Visual Studio 2017 or higher

* Installed [ML Hub](https://developer-docs.magicleap.cloud/docs/guides/getting-started/install-the-tools)
* Installed [Unity Hub](https://unity.com/download)
* [Install and configure the Unity Editor required to develop for Magic Leap 2](https://developer-docs.magicleap.cloud/docs/guides/unity/getting-started/install-the-tools)

## Project setup

To integrate Interactive Live Streaming into your Magic Leap project, do the following:

1. **Create a Magic Leap project for Unity**

  In Unity Editor:
  - [Create a project](https://developer-docs.magicleap.cloud/docs/guides/unity/getting-started/create-a-project)
 for your Agora Magic Leap app.
  - [Configure your app settings](https://developer-docs.magicleap.cloud/docs/guides/unity/getting-started/configure-unity-settings)

1. **Configure your project**

  In Unity Editor:
  1. Click **Edit** > **Project settings**.
  1. In **XR Plug-in Management**, enable **Magic Leap**.
  1. In **XR Plug-in Management** > **Magic Leap Settings**, enable **Use ML Audio**.
  1. In **Player settings** > **Android** > **Publishing settings**, enable **Custom Main Manifest**.
  1. In **Magic Leap** > **Permissions**, enable `android.permission.CAMERA` and `android.permission.RECORD_AUDIO`.

You are ready to add Interactive Live Streaming features to your Magic Leap project.

## Integrate the Interactive Live Streaming demo

When a user opens the app, you initialize Agora Engine. When the user taps a button, the app joins or leaves a channel. When another user joins the same channel, their video and audio is rendered in the app. This simple workflow enables you to concentrate on implementing Agora features and not UX bells and whistles.

This section shows how to integrate the Video SDK to implement the Interactive Live Streaming demo into your Magic Leap project.

1. [Download](../../../sdks.md) the latest version of Video SDK for Magic Leap to a local folder.

2. Double-click the download package.

  The Import dialog opens automatically in Unity Editor.

3. Click **Import**.

  In **Project** > **Assets** you see `Agora-RTC-Plugin` and `Agora_MagicLeap2_Plugin`.

You are ready to test the demo.

## Test your implementation

Agora recommends you run this project on a physical mobile device, as some simulators may not support the full features of this project. To ensure that you have implemented Interactive Live Streaming in your app:

1. Obtain an App ID with token enabled.

2. [Generate a temporary token](/en/introduction/account) in Agora Console.

3. In your browser, navigate to the [Agora web demo](https://webdemo.agora.io/basicVideoCall/index.html) and update `App ID`, `Channel`, and `Token` with the values for your temporary token, then click **Join**.

4. In Unity Editor, double-click **Agora_MagicLeap2_Plugin** > **AgoraEngine** > **ML2Support** > **Demo**.

  The demo scene opens.

5. In **Project**, open **Agora_MagicLeap2_Plugin** > **AgoraEngine** > **ML2Support** > **Scripts** > **Agora
 Controller**.

6. Update `APP_ID`, `TOKEN`, and `CHANNEL_NAME` with the same values you used for the web demo.

7. Connect an ML2 device, then click **Build and Run**.

  The demo app opens.

8. Click **Connect Camera**.

  Video from your ML2 is streamed to the channel and is visible in the web demo. You see the video stream from the
 web demo.

Now you have tested the demo, best practice is to customize the demo source including the custom audio and video
 handling into your Magic Leap 2 project.

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

- [Manual install](../../../sdks.md) shows you how to install Video SDK manually.

- To ensure communication security in a test or production environment, best practice is to use a token server to ensure communication security, see [Secure authentication with tokens](../build/authenticate-users/use-tokens.mdx).

### API reference

- [JoinChannel](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_joinchannel)

- [EnableVideo](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_enablevideo)

- [CreateAgoraRtcEngine](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_createagorartcengine)

- [InitEventHandler](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_addhandler)

- [SetClientRole](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_setclientrole)

- [LeaveChannel](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_leavechannel)

- [DisableVideo](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_irtcengine_disablevideo)

- [PushVideoFrame](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_imediaengine_pushvideoframe)

- [PushAudioFrame](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_imediaengine_pushaudioframe0)

- [PullAudioFrame](https://api-ref.agora.io/en/video-sdk/unity/4.x/API/class_irtcengine.html#api_imediaengine_pullaudioframe)
