---
title: "PVC and Super Quality configuration"
description: "Enable PVC and Super Quality options for Media Gateway video transcoding."
---
This guide explains how to enable low-bitrate high-definition features (PVC) for video transcoding on Media Gateway.

## Understand the tech

Media Gateway supports enabling PVC (Perceptual Video Coding) or Super Quality functions during video transcoding to achieve low-bitrate high-definition streaming. These features optimize video quality while reducing bandwidth requirements.

## Implementation

Enable PVC or Super Quality when creating a stream configuration template.

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
          },
          "pvc": {
            "enabled": true,
            "saveBitrateRatio": 20
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

### Advanced options

- `pvc.enabled`: Set to `true` to enable PVC
- `pvc.saveBitrateRatio`: Percentage of bitrate to save
- `superResolution.enabled`: Set to `true` to enable Super Quality
- `superResolution.alphaBlending`: Super Quality intensity from `1` to `256`

### Relationship between PVC and bitrate

- When `video.bitrate` is missing, output bitrate follows the source stream bitrate
- When `video.bitrate` is `0`, output bitrate is calculated automatically based on resolution and frame rate
- When `video.bitrate` is explicitly set, output bitrate matches the specified value and `saveBitrateRatio` has no effect

:::note
Test different saving ratios with your actual content to determine optimal settings before deployment.
:::

## When to use PVC

PVC is useful when:

- You have fixed encoding bitrate requirements
- Available bitrate is insufficient for acceptable quality without PVC
- Bandwidth is severely constrained
