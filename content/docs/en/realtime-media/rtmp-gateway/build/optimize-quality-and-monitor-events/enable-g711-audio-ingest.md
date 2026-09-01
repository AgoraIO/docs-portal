---
title: "Push G.711 audio"
description: "Push RTMP or RTMPS streams with G.711 audio into Agora channels."
---
Media Gateway accepts G.711 A-law and u-law audio over RTMP and RTMPS, in addition to AAC. This is useful for sources that output G.711 natively, such as security cameras and hardware encoders, since you don't need to transcode to AAC on the device.

| RTMP audio format | RTC-side encoding |
| --- | --- |
| G.711 A-law | `PCMA` |
| G.711 u-law | `PCMU` |

## Push G.711 audio without transcoding

If you don't need to change the audio format, push your RTMP or RTMPS stream as usual. No transcoding template is required. Media Gateway forwards the G.711 audio as encoded audio.

```
rtmp://{domain}/{app}/{streamKey}
rtmps://{custom-domain}/{app}/{streamKey}
```

:::note
The RTC SDK expects G.711 audio in frames of 160 samples per channel. If your device outputs a different frame length and you don't enable audio transcoding, Media Gateway re-frames the audio to match, which adds buffering and latency. This is more likely to cause a noticeable delay if the same stream also has video transcoding enabled. If you're already transcoding video, transcode audio too for the same stream, or verify your device's frame length during integration testing.
:::

## Transcode G.711 to Opus

If you want a consistent output format, or you're already transcoding video on the same stream, enable audio transcoding in the stream template:

```json
{
  "settings": {
    "transcoding": {
      "audio": {
        "enabled": true,
        "bitrate": 64,
        "sampleRate": 48000,
        "channels": 1
      }
    }
  }
}
```

When audio transcoding is enabled, Media Gateway re-encodes the output according to your template settings; it no longer passes through the original G.711 encoding.
