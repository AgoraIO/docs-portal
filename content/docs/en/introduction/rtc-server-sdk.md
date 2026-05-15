---
title: Server-side Realtime Media Processing
description: A capability entry point for backend media flow handling and server-side RTC control.
---

## What this capability solves

RTC Server SDKs run on the backend and communicate with client-side RTC apps over SD-RTN, enabling server-side send/receive media flows and control surfaces.

## Common scenarios

- backend media send/receive
- server-side mixing or compositing
- cloud proxy, permissions, and network controls
- architectures where the backend participates directly in RTC media handling

## What existing Shengwang docs already cover

The current RTC Server SDK docs already include:

- landing page
- runnable examples
- quickstart
- release notes
- hot capability articles

## Recommended reading order

1. Start from the landing page to confirm that the backend really needs direct media participation.
2. Then run the smallest send/receive media example.
3. After that, expand into compositing, proxy, String UID, and release notes.

## Why it belongs in the capability area

Many teams start from the backend control plane and media path instead of the client. RTC Server SDK should therefore exist as its own capability entry in the new docs site.
