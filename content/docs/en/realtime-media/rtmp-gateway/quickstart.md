---
title: "Quickstart"
description: "Obtain the server domain name and streaming key required to push RTMP or SRT streams into Agora channels."
---


To push online media streams as live video source streams into Agora channels using Media Gateway, you need to obtain a server domain name and streaming key. Taking the OBS streaming software as an example, you configure the server's domain name and streaming key in the following way:

![Server settings](https://assets-docs.agora.io/images/media-gateway/obs-server-setting.png)

This page explains how to obtain the server domain name and generate a streaming key.

## Prerequisites

In order to follow this procedure you must:

- Have a project that implements an RTC product:
  Interactive Live Streaming, Broadcast Streaming, Video Calling, or Voice Calling
- Generate app ID, app certificate, customer ID, and customer secret
- Pass basic HTTP or HMAC authentication

## Get server domain name

You can use Agora's unified domain name or your own one. The server appends the `/live` suffix to the domain name.

- The Agora unified domain name is `rtls-ingress-prod-<region>.agoramdn.com`. Replace `<region>` with the code for your geographical region.

  The supported regions and their codes are:

  - `na`: North America
  - `eu`: Europe
  - `ap`: Asia, except Mainland China
  - `cn`: Mainland China

- To use your own domain name, [contact technical support](mailto:support@agora.io) for configuration.

## Get streaming key

The stream key generation method depends on whether you use the Agora domain name or a custom domain name.

- If you use Agora's domain name, create a stream key using the Media Gateway RESTful API.
- If you use your own domain name, you can either call the Media Gateway RESTful API or generate the key locally.

### Generate streaming key with RESTful API

Create and publish the streaming key by calling the following endpoint:

`PUT https://api.agora.io/:region/v1/projects/:appId/rtls/ingress/streamkeys`

For authentication details, see [RESTful authentication](./reference/restful-authentication.mdx).

:::note
To explore the RESTful API parameters, obtain sample code in various client languages, or test Media Gateway requests, refer to the [Postman API reference](https://documenter.getpostman.com/view/6319646/SVSLr9AM#6aed9690-285e-45f0-a329-c995adbd0956).
:::

### Generate streaming key locally

:::note
Before starting, make sure you have configured your domain name by contacting [technical support](mailto:support@agora.io).
:::

To generate a stream key locally, you use the following information:

- The app ID of the Agora project from [Agora Console](https://console.agora.io/v2)
- The app certificate corresponding to your app ID
- `channelName`: The channel name
- `uid`: The user ID of the host in the channel
- `expiresAfter`: The effective duration of the stream key, in seconds
- `template` (optional): The associated flow configuration template

The following Node.js sample code demonstrates how to generate a stream key locally.

:::note
The following example code relies on the `msgpack-lite` module. If you haven't installed it yet, execute `npm install msgpack-lite` and run `node app.js` in the project root directory.
:::

```javascript
const crypto = require('crypto');
const msgpack = require('msgpack-lite');

appcert = ""; // Your app certificate from Agora
channel = ""; // The RTC SDK channel name
uid = ""; // The UID of the host in the channel
expiresAfter = 86400; // Valid duration of stream key (seconds)

const expiresAt = Math.floor(Date.now() / 1000) + expiresAfter;

const rtcInfo = {
  C: channel,
  U: uid,
  E: expiresAt,
  // If you are not sure whether to use the flow configuration template, keep the following line commented
  // T: templateId,
};

const data = msgpack.encode(rtcInfo);
const iv = crypto.randomBytes(16);
const key = Buffer.from(appcert, 'hex');
const encrypter = crypto.createCipheriv('aes-128-ctr', key, iv);
const encrypted = Buffer.concat([iv, encrypter.update(data), encrypter.final()]);
const streamkey = encrypted
  .toString('base64')
  .replace(/\\+/g, '-')
  .replace(/\\//g, '_')
  .replace(/\\=+$/, '');

console.log(`streamkey is ${streamkey}`);
```

## Recommended config for web client communication

In case of intercommunication with the web client, transcoding is not enabled by default. To ensure the best experience for web viewers, make sure that the streaming software uses the following encoding parameters:

- Key frame interval (GOP): `2s`
- Video profile: `baseline`
- x264 options: `threads=6`
- Frame rate (FPS): At 1080 resolution, the frame rate must not exceed 30; for resolutions below that, the frame rate must not exceed 60. If not necessary, 30 is sufficient.

Taking OBS as an example, configure it as shown below:

1. On the **Settings > Output > Live** page, configure the video profile, keyframe interval, and x264 options.

    ![Encoder settings](https://assets-docs.agora.io/images/media-gateway/obs-encoder-settings.png)

2. On the **Settings > Video** page, configure common frame rates.

    ![FPS settings](https://assets-docs.agora.io/images/media-gateway/obs-fps-setting.png)

## Next steps

After completing the configuration, you can push RTMP or SRT streams to Agora channels, and these streams will be published to the corresponding channels by the host.

By default, after Media Gateway receives the pushed stream, it will not transcode it and will directly publish it to the Agora channel. If you want to transcode the streams, use stream configuration templates to implement related functions.

### REST API middleware

[Agora Go Backend Middleware](https://github.com/AgoraIO-Community/agora-go-backend-middleware) is an open-source microservice that exposes a RESTful API designed to simplify Media Gateway interactions with Agora. Written in Golang and powered by the Gin framework, this community project serves as middleware to bridge front-end applications using Agora's RTC SDK or Voice SDK with Agora's RESTful APIs.
