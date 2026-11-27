---
title: Media Gateway event types
description: Event types returned by Media Gateway channel event callbacks.
---

After you enable the Agora message notification service, Agora sends channel event notifications to your server through HTTPS `POST` callbacks. When the callback request body contains `productId: 10`, the event belongs to Media Gateway.

This page describes the Media Gateway event types returned in channel event callbacks.

## `live_stream_connected`

The gateway has received the RTMP or SRT stream and successfully entered the channel.

```json
{
  "sid": "55df7402-8778-11ee-92ed-07ec2e86c928",
  "region": "na",
  "domain": "rtls-ingress-prod-na.agoramdn.com",
  "streamKey": "7B***Qbs",
  "rtcInfo": {
    "channel": "123",
    "uid": "1234"
  },
  "transcoding": {
    "audio": {
      "enabled": true,
      "profile": 5
    },
    "video": {
      "enabled": true,
      "bitrate": 3800,
      "fps": 30,
      "height": 1080,
      "width": 1920
    }
  },
  "beginAt": "2023-11-21T02:27:31Z"
}
```

| Field | Type | Description |
| :---- | :--- | :---------- |
| `sid` | String | The unique ID of each streaming session. |
| `region` | String | The server area that has received the pushed stream. |
| `streamKey` | String | The streaming key used by the stream. |
| `rtcInfo` | Object | RTC information, including `channel` and `uid`. When `channel` or `uid` is empty or `0` in the streaming key, this field stores the generated value used for this stream. |
| `transcoding` | Object | Transcoding configuration information used for streaming. |
| `beginAt` | String | The streaming start time in RFC 3339 format. |

This event is followed by a corresponding `live_stream_disconnected` event.

## `live_stream_disconnected`

The gateway has actively or passively disconnected and left the channel.

```json
{
  "sid": "55df7402-8778-11ee-92ed-07ec2e86c928",
  "region": "na",
  "streamKey": "7B***Qbs",
  "domain": "rtls-ingress-prod-na.agoramdn.com:1935",
  "rtcInfo": {
    "channel": "123",
    "uid": "1234"
  },
  "streamStats": {
    "inputAudioBytes": 281799,
    "inputVideoBytes": 9244544,
    "outputAudioBytes": 130000,
    "outputVideoBytes": 6656704
  },
  "beginAt": "2023-11-21T02:27:31Z",
  "endAt": "2023-11-21T03:27:31Z"
}
```

| Field | Type | Description |
| :---- | :--- | :---------- |
| `sid` | String | The unique ID of each streaming session. |
| `region` | String | The server area that has received the pushed stream. |
| `streamKey` | String | The streaming key used by the stream. |
| `rtcInfo` | Object | RTC information, including `channel` and `uid`. |
| `streamStats` | Object | Stream statistics, including `inputAudioBytes`, `inputVideoBytes`, `outputAudioBytes`, and `outputVideoBytes`. |
| `beginAt` | String | The streaming start time in RFC 3339 format. |
| `endAt` | String | The streaming end time in RFC 3339 format. |

## `live_stream_aborted`

The gateway has received an RTMP or SRT stream but terminated it for some reason. This event may be sent individually or between `live_stream_connected` and `live_stream_disconnected`.

```json
{
  "sid": "55df7402-8778-11ee-92ed-07ec2e86c928",
  "region": "na",
  "domain": "rtls-ingress-prod-na.agoramdn.com",
  "streamKey": "7B***Qbs",
  "rtcInfo": {
    "channel": "123",
    "uid": "1234"
  },
  "beginAt": "2023-11-21T02:27:31Z",
  "errorCode": 11,
  "reason": "close by command"
}
```

| Field | Type | Description |
| :---- | :--- | :---------- |
| `sid` | String | The unique ID of each streaming session. |
| `region` | String | The server area that has received the pushed stream. |
| `domain` | String | The domain used for streaming. |
| `streamKey` | String | The streaming key used by the stream. |
| `rtcInfo` | Object | RTC information, including `channel` and `uid`. |
| `beginAt` | String | The streaming start time in RFC 3339 format. |
| `errorCode` | Number | The stream termination error code. |
| `reason` | String | The error message. |

| `errorCode` | Description | Recommended action |
| :---------- | :---------- | :----------------- |
| `1` | Illegal `streamKey`, for example an empty `channelName` or unsupported characters. | Check the `streamKey` format, especially for locally generated keys. |
| `2` | The key has expired or been deleted, or the acquire request could not be processed. | Check `reason` to determine whether the key is invalid or the acquire request failed on the service side. Create a new `streamKey` only if the key expired or was deleted. |
| `3` | No permission to use this `streamKey`, for example when the custom domain and app ID do not match. | Check whether the `streamKey` matches the domain name used for the push. |
| `4` | Number of concurrent streams exceeds the limit. | Wait and retry. |
| `5` | Conflict detected, for example pushing to the same channel at the same time. | If the streams are not being pushed at the same time, try again after 5 to 10 seconds. |
| `6` | Stream attribute exceeds the limit. Currently, this applies to bitrate only. | Check the streaming software configuration and lower the target bitrate. |
| `7` | No audio or video data arrived before the configured publisher idle timeout. The default is 10 seconds; a project override takes precedence. | Check the source and network, and use the actual configured timeout when diagnosing the stream. |
| `8` | Failed to join the channel. | The `reason` field provides the specific error reason, for example `connect to rtc failed, reason:$N`. |
| `9` | Disconnected from the main network. | Try again several times. If the problem persists, contact technical support to confirm whether the app certificate provided during activation is valid. |
| `10` | Unknown internal service error. | Try again several times. If the problem persists, contact technical support. |
| `11` | The stream was closed by a control command. | Check whether your application requested the disconnection. |
| `12` | The source is not a valid media stream. | Check the source media and the streaming software configuration. |
| `14` | The service is overloaded. | Retry with backoff. If the problem persists, contact technical support. |

Always check `errorCode` together with `reason`. Don't reject callbacks that contain unknown error codes, and log the `reason` for troubleshooting.

## `live_profile_updated`

The input source stream properties have been updated, for example when the first audio or video frame is received or an input profile changes. These are source properties, not the transcoded output profile.

`videoProfile` is omitted until a valid video width is available, and `audioProfile` is omitted until a valid sample rate is available. Individual unavailable fields, such as `height` or `gop`, can also be omitted. Do not require the complete example payload in every callback.

`rtcInfo.uid` is serialized as a JSON string even when it represents a numeric UID.

```json
{
  "sid": "55df7402-8778-11ee-92ed-07ec2e86c928",
  "region": "na",
  "domain": "rtls-ingress-prod-na.agoramdn.com",
  "streamKey": "7B***Qbs",
  "rtcInfo": {
    "channel": "123",
    "uid": "1234"
  },
  "videoProfile": {
    "codec": "H.264",
    "width": 1920,
    "height": 1080,
    "gop": 2000
  },
  "audioProfile": {
    "sampleRate": 48000,
    "channels": 2
  },
  "beginAt": "2023-11-21T02:27:31Z"
}
```

| Field | Type | Description |
| :---- | :--- | :---------- |
| `sid` | String | The unique ID of each streaming session. |
| `region` | String | The server area that has received the pushed stream. |
| `streamKey` | String | The streaming key used by the stream. |
| `rtcInfo` | Object | RTC information, including `channel` and `uid`. |
| `videoProfile` | Object | Optional input video properties. May include `codec`, `width`, `height`, and `gop`; unavailable fields are omitted. |
| `audioProfile` | Object | Optional input audio properties. May include `sampleRate` and `channels`. |
| `beginAt` | String | The streaming start time in RFC 3339 format. |
