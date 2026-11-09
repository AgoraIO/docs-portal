---
title: "Quickstart"
description: "Obtain the server domain name and streaming key required to push an RTMP stream into an Agora channel."
---


This quickstart walks you through configuring Media Gateway and obtaining the domain name and streaming key you need to publish an RTMP stream into an Agora channel. The streaming key you generate here also works for SRT and WHIP streams. For their domain and client setup, see [SRT streaming](./build/push-streams/srt-streaming.md) and [WHIP streaming](./build/push-streams/whip-streaming.md).

## Understand the tech

The following figure shows the overall architecture of Media Gateway:

![Product Architecture](https://assets-docs.agora.io/images/media-gateway/media-gateway-flow.svg)

To push online media streams as live video source streams into Agora channels using Media Gateway, you need to obtain a server domain name and streaming key. Taking the OBS streaming software as an example, you configure the server's domain name and streaming key in the following way:

![Server settings](https://assets-docs.agora.io/images/media-gateway/obs-server-setting.png)

This page explains how to obtain the server domain name and generate a streaming key.

## Prerequisites

Before you begin, you must:

- Have a project that implements an RTC product:
  Interactive Live Streaming, Broadcast Streaming, Video Calling, or Voice Calling
- [Enable Media Gateway](./build/enable-media-gateway.md) for your project
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

- To use your own domain name over RTMPS, see [RTMP and RTMPS streaming](./build/push-streams/rtmp-streaming.md).

## Get streaming key

The streaming key generation method depends on whether you use the Agora domain name or a custom domain name.

- If you use Agora's domain name, create a streaming key using the Media Gateway RESTful API.
- If you use your own domain name, you can either call the Media Gateway RESTful API or generate the key locally.

### Generate streaming key with RESTful API

Create and publish the streaming key by calling the following endpoint:

`POST https://api.agora.io/:region/v1/projects/:appId/rtls/ingress/streamkeys`

For authentication details, see [RESTful authentication](/en/api-reference/api-ref/rtmp-gateway/authentication).

:::note
To explore the RESTful API parameters, obtain sample code in various client languages, or test Media Gateway requests, refer to the [Postman API reference](https://documenter.getpostman.com/view/6319646/SVSLr9AM#6aed9690-285e-45f0-a329-c995adbd0956).
:::

### Create a global streaming key

The streaming key you create with the RESTful API endpoint is scoped to a single region. If you need a key that works across all Media Gateway regions, for example when your clients push streams from different parts of the world into the same region-agnostic setup, create a global streaming key instead. A global key carries its channel, user ID, and expiration directly in the key, so any region can validate it without a lookup.

Create a global streaming key by calling the same endpoint without a region:

```
POST https://api.agora.io/v1/projects/:appId/rtls/ingress/streamkeys
```

To revoke a global streaming key in all regions at once, call:

```
DELETE https://api.agora.io/v1/projects/:appId/rtls/ingress/streamkeys/:streamKey
```

A regional streaming key and a global streaming key use different endpoints for both creation and revocation. A regional key can't be revoked using the global endpoint, and a global key doesn't appear in a regional key list.

:::note
Revoking a global streaming key isn't atomic across regions. The response is:

- `200` if the revocation succeeds in every region.
- `207` if it succeeds in some regions and fails in others. Check the response body for the per-region results.
- `502` or another error status if it fails in every region.

Handle the `207` case explicitly instead of treating the request as all-or-nothing.
:::

### Generate streaming key locally

:::note
Before you start, make sure that you have configured your own domain name. For more information, see [Get server domain name](#get-server-domain-name).
:::

Media Gateway supports two methods for generating a streaming key locally:

- [Generate a streaming key with your App ID](#generate-a-streaming-key-with-your-app-id): The recommended method. The streaming key is bound to your app ID and can't be used in a different project.
- [Generate a streaming key without your App ID](#generate-a-streaming-key-without-your-app-id): The streaming key isn't bound to a project.

To generate a streaming key locally, you use the following information:

- The app ID of your Agora project. For details, see [Get the App ID and App Certificate](/en/introduction/account#get-the-app-id-and-app-certificate).
- The app certificate corresponding to your app ID
- `channelName`: The channel name
- `uid`: The user ID of the host in the channel
- `expiresAfter`: The effective duration of the streaming key, in seconds
- `template` (optional): The associated stream configuration template. For details, see the [Media Gateway REST API](/en/api-reference/api-ref/rtmp-gateway).

#### Generate a streaming key with your App ID

A streaming key generated using this method starts with `sk001`. For example:

```text
sk001AAECAwQFBgcICQoLoFm4Eaib-wXsTAT8eOwvg2hziXtEgd-P5zpOAAVr3ROEf8vtK3YeXUAp
```

Use the streaming key as the stream name for RTMP and SRT, or as the Bearer token in a WHIP request. The streaming key does not contain your app ID. However, Media Gateway uses the app ID to authenticate the streaming key, which prevents the key from being used in a different project.

The following samples generate a streaming key with your App ID. Before you run a sample, replace the placeholder values in angle brackets with the values for your project.

- Node.js: Use Node.js 16 or later. The sample has no additional dependencies.
- Python: Use Python 3.10 or later, and install the `cryptography` package:

  ```bash
  python3 -m venv .venv && . .venv/bin/activate && pip install cryptography
  ```

```javascript tab="Node.js" tabGroup="language"
const crypto = require("crypto");

const PREFIX = "sk001";
const AAD_LABEL = Buffer.from("MGSK001", "ascii");

// ===== Set these values for your project =====
const appId = "<your_app_id>"; // Your Agora project App ID.
const appCertificate = "<your_app_certificate>"; // App certificate for your App ID.
const channelName = "<your_channel_name>"; // Agora channel name.
const uid = "<your_host_uid>"; // Host UID in the Agora channel.
const expiresAfter = 86400; // Validity period in seconds.
// const template = "<your_template_id>"; // Optional stream configuration template.
const template = "";

// Encode a non-negative integer as a compact unsigned varint.
function encodeUvarint(value) {
  let remaining = BigInt(value);
  const bytes = [];
  do {
    let byte = Number(remaining & 0x7fn);
    remaining >>= 7n;
    if (remaining !== 0n) byte |= 0x80;
    bytes.push(byte);
  } while (remaining !== 0n);
  return Buffer.from(bytes);
}

// Encode a UTF-8 string with its byte length.
function encodeField(value) {
  const bytes = Buffer.from(value, "utf8");
  if (bytes.length > 255) throw new Error("field is too long");
  return Buffer.concat([encodeUvarint(bytes.length), bytes]);
}

function generateStreamKey({
  appId,
  appCertificate,
  channelName,
  uid,
  expiresAfter,
  template = "",
}) {
  const certificate = Buffer.from(appCertificate, "hex");
  const expiresAt = Math.floor(Date.now() / 1000) + Number(expiresAfter);

  // The plaintext contains the expiry time and stream parameters.
  const plaintext = Buffer.concat([
    encodeUvarint(expiresAt),
    encodeField(channelName),
    encodeField(uid),
    encodeField(template),
  ]);

  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-128-gcm", certificate, nonce);

  // Bind the key to this App ID without storing the App ID in the token.
  const aad = Buffer.concat([AAD_LABEL, Buffer.from(appId, "hex")]);
  cipher.setAAD(aad);

  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const payload = Buffer.concat([nonce, ciphertext, cipher.getAuthTag()]);

  // Base64url without padding keeps the token safe in URLs.
  return PREFIX + payload.toString("base64url");
}

console.log(generateStreamKey({
  appId,
  appCertificate,
  channelName,
  uid,
  expiresAfter,
  template,
}));
```

```python tab="Python" tabGroup="language"
import base64
import os
import time

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

PREFIX = "sk001"
AAD_LABEL = b"MGSK001"

# ===== Set these values for your project =====
app_id = "<your_app_id>"  # Your Agora project App ID.
app_certificate = "<your_app_certificate>"  # App certificate for your App ID.
channel_name = "<your_channel_name>"  # Agora channel name.
uid = "<your_host_uid>"  # Host UID in the Agora channel.
expires_after = 86400  # Validity period in seconds.
# template = "<your_template_id>"  # Optional stream configuration template.
template = ""


# Encode a non-negative integer as a compact unsigned varint.
def encode_uvarint(value: int) -> bytes:
    result = bytearray()
    while True:
        byte = value & 0x7F
        value >>= 7
        if value:
            byte |= 0x80
        result.append(byte)
        if not value:
            return bytes(result)


# Encode a UTF-8 string with its byte length.
def encode_field(value: str) -> bytes:
    raw = value.encode("utf-8")
    if len(raw) > 255:
        raise ValueError("field is too long")
    return encode_uvarint(len(raw)) + raw


def generate_stream_key(
    app_id: str,
    app_certificate: str,
    channel_name: str,
    uid: str,
    expires_after: int,
    template: str = "",
) -> str:
    certificate = bytes.fromhex(app_certificate)
    expires_at = int(time.time()) + int(expires_after)

    # The plaintext contains the expiry time and stream parameters.
    plaintext = (
        encode_uvarint(expires_at)
        + encode_field(channel_name)
        + encode_field(uid)
        + encode_field(template)
    )

    nonce = os.urandom(12)

    # Bind the key to this App ID without storing the App ID in the token.
    aad = AAD_LABEL + bytes.fromhex(app_id.lower())
    encrypted = AESGCM(certificate).encrypt(nonce, plaintext, aad)

    # Base64url without padding keeps the token safe in URLs.
    payload = nonce + encrypted
    return PREFIX + base64.urlsafe_b64encode(payload).rstrip(b"=").decode("ascii")


print(generate_stream_key(
    app_id=app_id,
    app_certificate=app_certificate,
    channel_name=channel_name,
    uid=uid,
    expires_after=expires_after,
    template=template,
))
```

#### Generate a streaming key without your App ID

The following Node.js sample code generates a streaming key without your app ID. The generated streaming key has no prefix and isn't bound to a project.

:::note
The following example code relies on the `msgpack-lite` module. If you haven't installed it yet, execute `npm install msgpack-lite` and run `node app.js` in the project root directory.
:::

```javascript
const crypto = require('crypto');
const msgpack = require('msgpack-lite');

appcert = "<your_app_certificate>"; // Your app certificate from Agora
channel = "<your_channel_name>"; // The RTC SDK channel name
uid = "<your_host_uid>"; // The UID of the host in the channel
expiresAfter = 86400; // Valid duration of streaming key (seconds)

const expiresAt = Math.floor(Date.now() / 1000) + expiresAfter;

const rtcInfo = {
  C: channel,
  U: uid,
  E: expiresAt,
  // If you are not sure whether to use the stream configuration template, keep the following line commented
  // T: templateId,
};

const data = msgpack.encode(rtcInfo);
const iv = crypto.randomBytes(16);
const key = Buffer.from(appcert, 'hex');
const encrypter = crypto.createCipheriv('aes-128-ctr', key, iv);
const encrypted = Buffer.concat([iv, encrypter.update(data), encrypter.final()]);
const streamkey = encrypted
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

console.log(`streamkey is ${streamkey}`);
```

## Recommended encoding settings for web client playback

Media Gateway doesn't transcode a stream by default, so if your channel includes web clients, your source stream must already use encoding parameters that web playback supports. Make sure your streaming software uses the following encoding parameters:

- Key frame interval (GOP): `2s`
- Video profile: `baseline`
- x264 options: `threads=6`
- Frame rate (FPS): At 1080 resolution, the frame rate must not exceed 30; for resolutions below that, the frame rate must not exceed 60. If not necessary, 30 is sufficient.

Taking OBS as an example, configure it as follows:

1. On the **Settings > Output > Live** page, configure the video profile, keyframe interval, and x264 options.

    ![Encoder settings](https://assets-docs.agora.io/images/media-gateway/obs-encoder-settings.png)

2. On the **Settings > Video** page, configure common frame rates.

    ![FPS settings](https://assets-docs.agora.io/images/media-gateway/obs-fps-setting.png)

## Next steps

After completing the configuration, you can push an RTMP stream to Agora channels. Media Gateway publishes the stream to the corresponding channel under the host's identity.

By default, Media Gateway doesn't transcode a pushed stream and publishes it directly to the Agora channel. To transcode streams instead, use a stream configuration template.

## Related resources

[Agora Go Backend Middleware](https://github.com/AgoraIO-Community/agora-go-backend-middleware) is an open-source microservice that exposes a RESTful API designed to simplify Media Gateway interactions with Agora. Written in Golang and powered by the Gin framework, this community project serves as middleware to bridge front-end applications using Agora's RTC SDK or Voice SDK with Agora's RESTful APIs.
