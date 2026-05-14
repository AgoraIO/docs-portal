---
title: Set up service and credentials
description: Before entering any specific realtime or media capability, prepare Console access, project setup, and credential strategy.
---

## Why this always comes first

No matter whether you end up building AI, RTC, RTM, recording, or transcoding, the first step is rarely "write code." It is usually confirming Console access, project state, App ID, credentials, and authentication.

## What you should prepare

- project and App ID
- customer ID and customer secret
- token generation strategy
- service enablement status
- the boundary between test and production environments

## Recommended practice

Prepare the control plane and credential flow first, then move into product-specific docs. That prevents expensive rework when permissions, quotas, or auth assumptions diverge later.
