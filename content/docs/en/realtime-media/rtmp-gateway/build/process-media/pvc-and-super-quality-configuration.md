---
title: "Super Quality"
description: "Configure Super Quality for Media Gateway video transcoding."
---

Enable Super Quality when creating or updating a [stream configuration template](/en/api-reference/api-ref/rtmp-gateway/create-reset-template).

## Configure Super Quality

```json
{
  "settings": {
    "transcoding": {
      "video": {
        "enabled": true,
        "width": 1920,
        "height": 1080,
        "fps": 30,
        "bitrate": 0,
        "advancedOptions": {
          "superResolution": {
            "enabled": true,
            "alphaBlending": 256
          }
        }
      },
      "audio": {
        "enabled": true,
        "profile": 3
      }
    }
  }
}
```

- `superResolution.enabled`: Set to `true` to enable Super Quality.
- `superResolution.alphaBlending`: Set the intensity from `1` to `256`. Larger values indicate higher intensity.
