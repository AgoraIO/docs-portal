---
title: "API usage restrictions"
description: "A brief overview of the restrictions of the Signaling SDK, including API call limit, string size, encoding, and more."
---

This page provides a brief overview of the restrictions of the Agora Signaling SDK, including API call limit, string size, encoding, and more.

## API call limit

Unless otherwise specified below, limit the API call frequency by a single client to 20 calls per second. If the number of calls per second exceeds 20, some calls are ignored by the SDK. If you need to call more APIs per second, contact [support@agora.io](mailto:support@agora.io).

## General

| Item | Soft limit | Hard limit | Comments |
|:---|:---:|:---:|:---|
| Number of projects in an account | 1000 | - | To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Number of client instances | 1 | 1 | Attempts to create multiple instances fail. |
| Number of message channels per app ID | Unlimited | - | Channel resources are public, users can take them as needed. |
| Number of stream channels per app ID | Unlimited | - | Channel resources are public, users can take them as needed. |
| User ID length | 64 ASCII characters | 64 ASCII characters | Exceeding the soft limit produces an error. |

## Message channel

| Item | Soft limit | Hard limit | Comments |
|:---|:---:|:---:|:---|
| Message sending rate/client | 60 messages/sec | 60 messages/sec | Exceeding the soft limit produces an error. To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Number of subscribers per channel  | Unlimited | - |  |
| Number of publishers per channel   | Unlimited | - |  |
| Number of subscribed channels per client | 50 | - | Exceeding the soft limit produces an error. |
| Message packet size | 32 KB | 32 KB | Exceeding the soft limit produces an error. To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Channel name length | 64 ASCII characters | 64 ASCII characters | Exceeding the soft limit produces an error. |
| Custom message type length | 32 ASCII characters | 32 ASCII characters | Exceeding the soft limit produces an error. |

## Stream channel

| Item | Soft limit | Hard limit | Comments |
|:---|:---:|:---:|:---|
| Number of channels a client can create | Unlimited | - |  |
| Number of channels a client can join | 10 | - | A single client can join a maximum of 10 channels simultaneously; exceeding this soft limit results in an error message.  To increase the limit, contact [support@agora.io](mailto:support@agora.io). |
| Number of users per channel | 128 | 128 |  A single channel can accommodate a maximum of 128 users simultaneously; exceeding this soft limit results in an error message. To increase the limit, contact [support@agora.io](mailto:support@agora.io). |
| Number of topics per channel | Unlimited | - |  |
| Channel name length | 64 ASCII characters | 64 ASCII characters | Exceeding the soft limit produces an error. |

## Topic

| Item | Soft limit | Hard limit | Comments |
|:---|:---:|:---:|:---|
| Number of topics joined by a client in a channel | 8 | 8 | Exceeding the soft limit produces an error. |
| Number of messages published by a client in a topic per second | 200 messages/sec | 200 messages/sec | Exceeding the soft limit produces an error. To change the limit, contact [support@agora.io](mailto:support@agora.io).|
| Number of topics subscribed to by a client in a channel | 50 | 50 | Exceeding the soft limit produces an error. |
| Number of users subscribed to a topic by a client | 64 | 64 | A single client can subscribe up to 64 user IDs to a single topic. Exceeding the soft limit produces an error. |
| Number of publishers in a topic | Unlimited | - |  |
| Topic name length | 16 ASCII characters | 16 ASCII characters | The topic name length will be extended to 64 ASCII characters in future releases. |
| Message packet size | 1 KB | 1 KB | Exceeding the soft limit produces an error. To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Custom message type length | 32 ASCII characters | 32 ASCII characters | Exceeding the soft limit produces an error. |

## Presence

| Item | Soft limit | Hard limit | Comments |
|:---|:---:|:---:|:---|
| Presence timeout | Adjustable range: 5 - 300 seconds<br/> Default: 300 seconds | - | When the set timeout value is exceeded, the SDK matches the closest boundary value. For example, if you set presence timeout to 400 seconds, the actual application time is 300 seconds. To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Number of temporary user state key/value pairs | 32 pairs | 32 pairs | Exceeding the soft limit produces an error. |
| Number of temporary user states cached before joining the channel | 100 | 100 | Exceeding the soft limit produces an error. |

## Storage

| Item | Soft limit | Hard limit | Comments |
|:---|:---:|:---:|:---|
| Metadata item key length | 32 ASCII characters | - |  |
| Number of metadata sets per user or channel | 1 | 1 | Each channel and each user can only have one set of channel or user metadata, respectively. |
| Number of items per channel metadata or user metadata set | Unlimited | - |  |
| Storage space per channel or user metadata set | 16 KB | - | To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Storage space per metadata item | 16 KB | - | To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Channel metadata API call frequency by a single client | 10 times/sec | 20 times/sec | To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| User metadata API call frequency by a single client | 10 times/sec | 20 times/sec | To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Number of channel metadata sets per app ID | 1 million | - |  |
| Number of user metadata sets per app ID | 1 million | - | To change the limit, contact [support@agora.io](mailto:support@agora.io). |

## Lock

| Item | Soft limit | Hard limit | Comments |
|:---|:---:|:---:|:---|
| Number of locks per channel | 32 | - | To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Number of locked locks per client | Unlimited | - |  |
| Lock TTL (Time to live) | 10 seconds - 300 seconds | 10 seconds - 300 seconds | When a user leaves a channel or disconnects, the lock held by that user is automatically released after the set time. When the set value is exceeded, the SDK matches the closest boundary value. For example, if you set lock TTL to 400 seconds, the actual application time is 300 seconds. |
| Lock length | 64 ASCII characters | 64 ASCII characters | Exceeding the soft limit produces an error. |
| Number of locks per app ID | 1 million | - | Exceeding the soft limit produces an error. To change the limit, contact [support@agora.io](mailto:support@agora.io). |
| Lock acquisition API call frequency | 10 times/sec | - |  |

## Miscellaneous

- The number of RESTful API requests per second per app ID are limited to 500. To extend the limit, contact support@agora.io.
- The max number of concurrent users is 50,000. To extend the limit, contact support@agora.io.
- The max number of daily active users is 500,000. To extend the limit, contact support@agora.io.
- The max number of users in a single channel is 50,000. To extend the limit, contact support@agora.io.
