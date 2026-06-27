---
title: "Product and service status"
description: "Track status information for Agora services, including Interactive Whiteboard."
---

Use the [Agora Status Page](https://status.agora.io/) to monitor service health, historical incidents, and quality signals across Agora products, including Interactive Whiteboard.

## What you can check

- Current service health
- Incident history
- Product and service filters
- Quality-of-experience trends

## Status indicators

The status dashboard uses color-coded columns to represent operating state:

| Color | Meaning |
| --- | --- |
| Green | Normal operation |
| Yellow | Degraded performance |
| Red | Abnormal |

The dashboard currently covers the following product groups:

| Product or service | What the dashboard highlights |
| --- | --- |
| Real-Time Communication | 24-hour QoE and 90-day service availability |
| Cloud Recording | Service health and task-creation success trends |
| Agora Chat | Messaging success rate and service availability |
| Interactive Whiteboard | Service health and room-join success rate |

## Product-specific status

| Product or service | Status basis |
| --- | --- |
| Real-Time Communication | Comprehensive QoE based on Agora backend login, SDK stability, end-to-end responsiveness, audio fluency, and video fluency |
| Cloud Recording | Service operating status and recording-task creation success rate |
| Agora Chat | Message sending success rate and service availability |
| Interactive Whiteboard | Service operating status and whiteboard room join success rate |

## Quality metrics

For Real-Time Communication, the status page computes QoE using the following metrics:

| Metric | Description | Calculation method |
| --- | --- | --- |
| Agora backend login | Measures accessibility of realtime audio and video services | Ratio of successful logins to total login attempts |
| SDK stability | Measures realtime service stability | Ratio of service crashes to total services |
| End-to-end responsiveness | Measures responsiveness and smoothness | Ratio of network delay to total audio and video duration |
| Audio fluency | Measures audio playback continuity | Ratio of audio freeze duration to total audio duration |
| Video fluency | Measures video playback smoothness | Ratio of video freeze duration to total video duration |

## When to use it

Check the status page when you need to:

- verify whether a whiteboard issue may be service-related
- review ongoing incidents or maintenance events
- confirm whether quality degradation is broader than your own deployment

## Related resources

- [Security](security.md)
- [Firewall requirements](firewall.md)
- [Agora Support Center](https://agoraio.zendesk.com/hc/en-us)
