---
title: "API usage restrictions"
description: "Understand Signaling SDK quotas, API rate limits, capacity limits, and planning guidance."
---

This page applies to Signaling SDK 2.x and its RESTful APIs. It describes limits at each level, what happens when a limit is exceeded, and how to estimate capacity for your application.

## Quick navigation

| Use case | See |
| --- | --- |
| An API call returns a rate-limit error | [Rate limits](#41-rate-limits) |
| A send operation fails because the message or parameters are too large | [Message specifications](#43-message-specifications) |
| Latency increases or users reconnect repeatedly as a channel grows | [Channel message rate recommendations](#32-channel-message-rate-recommendations), [Examples](#6-examples-for-planning-with-channel-message-rates) |
| Estimate capacity before launch | [Estimating PCU](#21-estimating-pcu), [Channel message rate recommendations](#32-channel-message-rate-recommendations), [Examples](#6-examples-for-planning-with-channel-message-rates) |
| Request a higher limit | [Requesting higher limits](#9-requesting-higher-limits) |

### Limit levels

Signaling limits have four levels. Higher levels limit the total volume, while lower levels limit individual objects. A single call can be subject to more than one level.

| Level | Applies to | How you detect an excess | See |
| --- | --- | --- | --- |
| Account | Your Agora account | The RESTful API returns a quota error | [Section 1](#1-account-level-limits) |
| Project (App ID) | One project | Most limits are recommendations; contact support before exceeding them | [Section 2](#2-project-level-limits-app-id) |
| Channel | One channel | Capacity limits return errors; rate limits are recommendations | [Section 3](#3-channel-level-limits) |
| Client | One Signaling client instance | The SDK reports an error through its callback | [Section 4](#4-client-level-limits) |

### Limit types

| Type | Meaning | When exceeded | Can it be changed? |
| --- | --- | --- | --- |
| Fixed limit | A hard system constraint | The call fails and returns an error | No |
| Default limit | The default quota | The call fails and returns an error | You can request an increase. See [Section 9](#9-requesting-higher-limits). |
| Recommended value | The range that provides the best performance | Usually no error is returned | Contact support before exceeding it |
| Unlimited count | No count limit for the resource | N/A | The resource is still constrained by rate and throughput limits |

## 1. Account-level limits

| Limit | Value | Type | Description |
| --- | --- | --- | --- |
| Total RESTful API request rate per account | 1,000 requests/sec | Default limit | The total across all projects and RESTful APIs in the account. Requests above this rate return HTTP 429. |

## 2. Project-level limits (App ID)

| Limit | Value | Type | Description |
| --- | --- | --- | --- |
| Peak concurrent users (PCU) | 200,000 | Recommended value | Contact support before you expect to exceed this value. See [Estimating PCU](#21-estimating-pcu). |
| Total upstream message rate | 100,000 messages/sec | Recommended value | The total sent by all clients and RESTful APIs in the project. |
| Number of Message Channels | Unlimited | Unlimited count | Channels are created as needed. You do not need to create them in advance. |
| Number of Stream Channels | Unlimited | Unlimited count | Channels are created as needed. You do not need to create them in advance. |
| Total Channel Metadata items | 1 million | Recommended value | Contact support before you expect to exceed this value. |
| Total User Metadata items | 1 million | Recommended value | Contact support before you expect to exceed this value. |
| Total locks | 1 million | Recommended value | Contact support before you expect to exceed this value. |
| Message History retention | 1, 7, 30, 90, or 365 days, or unlimited | Default limit | Configure this per project in Agora Console. The retention period for messages already written is not changed by later configuration updates. |

### 2.1 Estimating PCU

Signaling limits and billing use PCU, while application metrics are often expressed as DAU, room count, or class count. Choose the formula that matches your application:

| Application type | Available data | PCU estimate |
| --- | --- | --- |
| IM or social | DAU and average daily hours online | PCU ≈ DAU × average daily hours online ÷ 24 × peak factor |
| Live streaming or show rooms | Simultaneous rooms and average viewers per room | PCU ≈ simultaneous rooms × average viewers per room × peak factor |
| Education or meetings | Classes in the same time period and attendees per class | PCU ≈ classes in the same time period × attendees per class |
| Games | Concurrent players (CCU) | PCU ≈ CCU |

Use the peak factor to scale daily averages to peak periods. A value of 2 to 3 is a common starting point. For a known event peak, such as a sale, tournament, or new school term, use the event peak instead of a daily average.

Common estimation errors include:

- Count each connection when a user signs in from multiple devices. A user signed in on a phone and in a browser counts as two PCU.
- `heartbeatInterval` affects PCU. A longer interval delays offline detection and can make the reported PCU higher. The default is 5 seconds, with a range of 5 to 1,800 seconds.

## 3. Channel-level limits

### 3.1 Capacity

The Stream Channel rows apply to platforms that support Stream Channel. For mini-programs, use the Message Channel and lock rows; Stream Channel rows do not apply.

| Limit | Value | Type | Description |
| --- | --- | --- | --- |
| Message Channel subscribers without Presence | Unlimited | Unlimited count | The channel is still subject to the [channel message rate recommendations](#32-channel-message-rate-recommendations). |
| Message Channel subscribers with Presence | 5,000 | Recommended value | Contact support before you expect to exceed this value. Top N Console can configure subscriber priority. |
| Message Channel publishers | Unlimited | Unlimited count | N/A |
| Stream Channel online users | 128 | Fixed limit | The 129th `join` fails with an error code. For larger groups, use multiple Stream Channels or a Message Channel. |
| Topics in a Stream Channel | Unlimited | Unlimited count | A Topic is created when its first publisher joins and is deleted when its last publisher leaves. |
| Locks in a channel | 32 | Recommended value | Contact support before you expect to exceed this value. |

### 3.2 Channel message rate recommendations

The channel message rate is the total number of messages sent to one channel per second by all publishers, including clients and RESTful APIs. This channel-level limit is calculated separately from the client rate limits in [Section 4](#4-client-level-limits). Even when every client stays within its own limit, the channel total can exceed the recommendation.

The recommended rate depends on the number of concurrent users in the channel. More users increase the fan-out cost of each message, so the channel can handle fewer messages per second.

| Concurrent users in one channel | Recommended channel message rate |
| --- | --- |
| &lt; 1,000 | 200 messages/sec |
| 1,000 to 10,000 | 100 messages/sec |
| &gt;= 10,000 | 30 messages/sec |

When the recommendation is exceeded, the SDK usually does not return an error. Latency can increase, messages can be lost, and users may be unable to send or receive messages or may reconnect repeatedly.

When you approach the recommendation:

- Split users across multiple channels and evaluate each channel against the table above.
- Use Stream Channel and Topic for frequent, small messages. Keep each Stream Channel under 128 users.
- Aggregate messages in your application server and send the result through the RESTful API to reduce the upstream message count.
- Contact support before you need a higher rate. Agora can review a custom increase while considering latency and stability.

## 4. Client-level limits

The following limits are measured per Signaling client instance. Each client is counted separately.

### 4.1 Rate limits

Signaling groups client APIs into operation categories. Each category has its own per-second quota. Methods in one category share a quota, while different categories do not affect each other. For example, 15 calls to `whoNow` and 15 calls to `getChannelMetadata` in the same second do not trigger a rate limit because they belong to different categories. Twenty-five calls to `whoNow` do trigger a rate limit.

Calls above a quota are not executed or queued. The SDK reports a rate-limit error through its error callback. Throttle or retry the call in your application as described in [Section 8](#8-what-to-do-when-a-limit-is-exceeded).

#### Operations with special quotas

| Operation | Methods | Quota per client | Type | Description |
| --- | --- | --- | --- | --- |
| Send messages | `publish` | 60 calls/sec | Default limit | Message Channel and User Channel calls share this quota. |
| Send Topic messages | `publishTopicMessage` | 200 calls/sec per Stream Channel | Default limit | The quota is separate for each Stream Channel joined by the client and does not use the quota of another category. |
| Modify channel attributes | `setChannelMetadata`, `updateChannelMetadata`, `removeChannelMetadata` | 20 calls/sec | Default limit | N/A |
| Read channel attributes | `getChannelMetadata` | 20 calls/sec | Default limit | N/A |
| Modify user attributes | `setUserMetadata`, `updateUserMetadata`, `removeUserMetadata` | 20 calls/sec | Default limit | N/A |
| Read user attributes | `getUserMetadata` | 20 calls/sec | Default limit | N/A |
| Acquire a lock | `acquireLock` | 10 calls/sec | Default limit | N/A |

#### All other operations: 20 calls/sec per category

Each row below is an independent category. Methods in the same row share that category's quota of 20 calls/sec.

| Category | Methods |
| --- | --- |
| Login | `login` |
| Renew token | `renewToken` |
| Subscribe to a Message Channel | `subscribe` |
| Join or leave a Stream Channel | `join`, `leave` |
| Join or leave a Topic | `joinTopic`, `leaveTopic` |
| Subscribe to a Topic | `subscribeTopic` |
| Subscribe to user metadata | `subscribeUserMetadata` |
| Query online users in a channel | `whoNow` |
| Query the channels a user has joined | `whereNow` |
| Modify temporary state | `setState` |
| Read temporary state | `getState` |
| Set a lock | `setLock` |
| Delete a lock | `removeLock` |
| Release a lock | `releaseLock` |
| Revoke a lock | `revokeLock` |
| Query locks | `getLocks` |
| Retrieve historical messages | `getMessages` |

### 4.2 Connections and instances

| Limit | Value | Type | When exceeded |
| --- | --- | --- | --- |
| Signaling instances per client | 1 | Fixed limit | Creating a second instance fails. |
| `userId` length | 64 ASCII characters | Fixed limit | Initialization or login fails. |
| Message Channels subscribed to at the same time | 50 | Default limit | The 51st `subscribe` call fails with an error code. |
| Stream Channels joined at the same time | 10 | Default limit | The 11th `join` call fails with an error code. |
| Topics joined in one channel at the same time | 8 | Fixed limit | The 9th `joinTopic` call fails. |
| Topics subscribed to in one channel at the same time | 50 | Fixed limit | The 51st `subscribeTopic` call fails. |
| Publishers subscribed to in one Topic | 64 | Fixed limit | Without a `users` list, the SDK subscribes to up to 64 publishers at random. Messages from other publishers are not received. |

### 4.3 Message specifications

| Limit | Value | Type | When exceeded |
| --- | --- | --- | --- |
| Message size in a Message or User Channel | 32 KB | Default limit | Sending fails with error code `-11010`. The size includes the message payload and `customType`. |
| Topic message size | 1 KB | Default limit | Sending fails with error code `-11010`. The calculation is the same as for Message and User Channel messages. |
| `customType` length | 32 ASCII characters | Fixed limit | Sending fails. |
| Channel name length | 64 ASCII characters | Fixed limit | The call fails. The name must also use the allowed character set described in the [channel naming guide](./channel-naming). |
| Topic name length | 16 ASCII characters | Fixed limit | The call fails. |
| Messages returned by one `getMessages` call | 100 | Fixed limit | Retrieve additional messages on another page. |
| `getMessages` query window | No more than 24 hours between `start` and `end` | Fixed limit | The call fails with an error code. |

### 4.4 Presence specifications

| Limit | Value | Type | When exceeded |
| --- | --- | --- | --- |
| `presenceTimeout` | 300 seconds by default, with a range of 5 to 300 seconds | Fixed range | No error is returned. The SDK uses the nearest boundary. For example, 400 seconds takes effect as 300 seconds. |
| Temporary state key/value pairs per user per channel | 32 pairs | Fixed limit | `setState` fails. |
| Size of one temporary state value | 16 KB | Fixed limit | `setState` fails. |
| Temporary state key length | 32 ASCII characters | Fixed limit | `setState` fails. |
| Temporary states cached before joining a channel | 100 | Fixed limit | The states take effect and notifications are sent after the client joins or subscribes. |
| Users per `whoNow` page | 100 | Fixed limit | Use `nextPage` to retrieve additional pages. |
| Maximum users for real-time notifications before switching to interval notifications | 50 by default; configurable from 8 to 128 in Agora Console | Default limit | When the number of online users reaches the threshold, the SDK changes from real-time notifications to periodic aggregated notifications. |

### 4.5 Storage specifications

| Limit | Value | Type | When exceeded |
| --- | --- | --- | --- |
| Metadata item `key` length | 32 ASCII characters | Fixed limit | The call fails. |
| Metadata sets per channel or user | 1 set | Fixed limit | N/A |
| Metadata items per set | Unlimited | Unlimited count | The set is still limited to 16 KB. |
| Size of one Metadata set | 16 KB | Default limit | The write fails. |
| Size of one Metadata item | 16 KB | Default limit | The write fails. The 16 KB limit for the item and the set apply at the same time. |

Metadata remains stored after it is written. Destroying a channel or logging out a user does not delete it. Delete metadata explicitly when you no longer need it.

### 4.6 Lock specifications

| Limit | Value | Type | When exceeded |
| --- | --- | --- | --- |
| Locks held by one client at the same time | Unlimited | Unlimited count | N/A |
| Lock TTL | 10 seconds by default, with a range of 10 to 300 seconds | Fixed range | No error is returned. The SDK uses the nearest boundary. The TTL starts when the holder disconnects. The holder keeps the lock if it reconnects before the TTL expires. The SDK releases the lock and sends an event after the TTL expires. |
| Lock name length | 64 ASCII characters | Fixed limit | The call fails. |

## 5. RESTful API limits

| Limit | Value | Type | Description |
| --- | --- | --- | --- |
| Total request rate per account | 1,000 requests/sec | Default limit | The API returns HTTP 429. See [Section 1](#1-account-level-limits). |
| `publish` rate per channel | No separate limit | N/A | RESTful API and client messages are counted together in the [channel message rate](#32-channel-message-rate-recommendations). |
| `publish` message size | 32 KB | Fixed limit | The request fails when the size is exceeded. |
| `publish` request body | A serializable string | Fixed limit | Binary request bodies are not supported. Encode binary content with Base64 first. |
| History query rate | 60 calls/sec | Recommended value | Requests above the recommendation return a quota error. |
| History messages per call | 100 | Fixed limit | Retrieve additional messages on another page. |

## 6. Examples for planning with channel message rates

Estimate the channel message rate as follows:

`channel message rate ≈ active publishers in the channel × messages sent per publisher per second`

Compare the result with the [Section 3.2 table](#32-channel-message-rate-recommendations). The first column of that table describes concurrent users, which determines fan-out cost. The second column describes message rate. Estimate the two values separately.

The numbers below are examples. Replace them with measurements from your application:

| Scenario | Example scale | Estimated rate | Compared with Section 3.2 | Recommended approach |
| --- | --- | --- | --- | --- |
| IM group chat | 500 users; during active periods, 5% send one message every 10 seconds | 500 × 5% ÷ 10 ≈ 2.5 messages/sec | Under 1,000 users, below the 200 messages/sec recommendation | Use a Message Channel. If Presence is enabled, account for the 5,000-user recommendation. |
| Live stream comments | 50,000 viewers; 1% send one message every 5 seconds | 50,000 × 1% ÷ 5 = 100 messages/sec | At least 10,000 users, above the 30 messages/sec recommendation by more than three times | Aggregate comments on your application server and send no more than 30 messages/sec through the RESTful API, or split viewers across channels. Use a separate channel for lower frequency, higher value events such as gifts. |
| Live stream gifts or system notifications | 50,000 viewers; no more than 5 messages/sec | 5 messages/sec | At least 10,000 users, within the 30 messages/sec recommendation | Use a separate channel from comments so comments cannot consume the available rate. |
| Multiplayer game state synchronization | 100 players; each sends position updates 10 times/sec | 1,000 messages/sec | Above the Message Channel recommendation at every scale | Use Stream Channel and Topic. Keep each channel under 128 users, each publisher under 200 messages/sec, and subscribe only to the publishers each receiver needs, up to 64 publishers. |
| IoT device reports | 2,000 devices; each reports once every 5 seconds | 400 messages/sec | 1,000 to 10,000 users, four times the 100 messages/sec recommendation | Group devices across at least five channels, with no more than 400 devices and 80 messages/sec per channel. |
| Collaborative editing or whiteboard | 20 users; each sends 20 drawing events/sec | 400 messages/sec | Under 1,000 users, twice the 200 messages/sec recommendation | Use Stream Channel and Topic. Keep Topic messages under 1 KB and combine drawing events from each 50 ms window before sending. |

Two points affect the estimate most:

- Replace the example activity ratio and per-user frequency with measurements from your application.
- The table describes one channel. Each sharded channel is evaluated separately, while the project total upstream rate of 100,000 messages/sec in Section 2 still includes every channel.

## 7. Frequently asked questions

<Accordions type="multiple">

<Accordion title="Can all APIs combined be called only 20 times per second?">

No. Rate limits are calculated per operation category. The 20 calls/sec value is the default quota for one category. The 60 calls/sec message quota does not use the quota of another category, and the reverse is also true.

</Accordion>

<Accordion title="Do group messages and direct messages each have a quota of 60 calls/sec?">

No. `publish` calls for Message Channels and User Channels share one quota of 60 calls/sec.

</Accordion>

<Accordion title="Why did message latency increase when I stayed below 60 calls/sec?">

The client rate limit is only one layer. The channel also has the message rate recommendations in Section 3.2, and the project has a total upstream rate of 100,000 messages/sec. When multiple clients send frequently to one channel, the channel total can exceed its recommendation even when each client stays within its own limit.

</Accordion>

<Accordion title="Is 200 Topic messages per second the limit for the whole client?">

No. The 200 messages/sec quota applies to one Stream Channel. A client that joins several Stream Channels has a separate quota for each channel.

</Accordion>

<Accordion title="Are calls above a rate limit queued and sent later?">

No. Calls above a quota are not executed. The SDK returns an error, and your application must retry if appropriate.

</Accordion>

<Accordion title="Does an unlimited subscriber count mean that a channel has unlimited capacity?">

An unlimited count means that no subscriber count is specified. The channel is still subject to the message rate recommendations in Section 3.2. If Presence is enabled, contact support before exceeding 5,000 subscribers.

</Accordion>

<Accordion title="Can the 128-user Stream Channel limit be increased?">

No. 128 users is a fixed limit. For larger groups, use multiple Stream Channels or a Message Channel.

</Accordion>

<Accordion title="Does an unlimited Metadata item count mean that I can store unlimited data?">

The item count is unlimited, but the Metadata set and each individual item are limited to 16 KB. Both limits apply.

</Accordion>

<Accordion title="Can the RESTful API send up to 60 messages/sec to each channel?">

There is no separate 60 messages/sec limit for RESTful API messages. RESTful API and client messages are counted together in the channel message rate in Section 3.2. The RESTful API is also subject to the account-level limit of 1,000 requests/sec.

</Accordion>

<Accordion title="Does a lock disappear when its holder disconnects before the TTL expires?">

No. The holder keeps the lock when it reconnects before the TTL expires. The SDK releases the lock and sends an event after the TTL expires.

</Accordion>

</Accordions>

## 8. What to do when a limit is exceeded

| Excess type | How to detect it | Retry? | Recommended action |
| --- | --- | --- | --- |
| Client category quota in Section 4.1 | The SDK reports a rate-limit error through its callback | Yes | Throttle calls in an application queue, then retry with exponential backoff. Do not resend immediately from the callback. |
| Fixed capacity limit, such as size, length, or count | The SDK reports an error, such as `-11010` for an oversized message | No | Correct the parameter before calling again. Validate message size locally before sending. |
| Parameter range, such as `presenceTimeout` or lock TTL | No error; the SDK uses the nearest boundary | N/A | Pass a value within the documented range. Do not rely on clamping. |
| Channel message rate recommendation in Section 3.2 | No error; latency increases sharply, users cannot send or receive messages, or users reconnect repeatedly | N/A | Shard channels or use Stream Channel as described in Section 3.2. Contact support when you need a higher rate. |
| Project recommendation, such as PCU or total upstream rate | No error | N/A | Contact support before you expect to exceed the recommendation. |
| RESTful API quota | The HTTP response contains a quota error | Yes | Throttle requests on the server and retry with backoff. |

The following pseudocode shows one retry pattern for a rate-limit error. See the API reference for the callback form used by each platform SDK:

```text
send(msg):
  result = rtm.publish(channel, msg)
  if result.error == RATE_LIMITED:
    delay = min(baseDelay * 2^attempt, maxDelay)  // 100 ms to 2 s
    wait(delay)
    attempt += 1
    if attempt < maxAttempts:
      send(msg)
    else:
      report("publish dropped after retries")
  else:
    attempt = 0
```

A token bucket per operation category is more reliable than relying on retries alone. For example, use a 60 calls/sec bucket for message sends and a 20 calls/sec bucket for other categories.

## 9. Requesting higher limits

You can request an increase or discuss capacity planning for the items below. Contact [support@agora.io](mailto:support@agora.io) or your technical support contact with the App ID, expected scale, and launch date.

| Item | Default value | Type |
| --- | --- | --- |
| Total RESTful API request rate per account | 1,000 requests/sec | Request an increase |
| PCU per project | 200,000 | Discuss before exceeding |
| Total upstream message rate per project | 100,000 messages/sec | Discuss before exceeding |
| Message Channel subscribers with Presence | 5,000 | Discuss before exceeding |
| Channel message rate | See the Section 3.2 table | Custom increase may be available |
| Stream Channels joined per client | 10 | Request an increase |
| Message Channels subscribed to per client | 50 | Request an increase |
| `publish` rate per client | 60 calls/sec | Request an increase |
| `publishTopicMessage` rate per client per Stream Channel | 200 calls/sec | Request an increase |
| Message size | 32 KB for Message/User Channel, 1 KB for Topic | Request an increase |
| Metadata set size | 16 KB | Request an increase |
| Locks in a channel | 32 | Request an increase |
| Total locks per project | 1 million | Request an increase |
