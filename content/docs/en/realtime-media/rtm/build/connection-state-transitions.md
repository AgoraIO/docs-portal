---
title: "Connection state transitions and recovery"
description: "Understand Signaling network connection management mechanism."
---

# Connection state transitions and recovery

During communication between the Signaling SDK and the server, the connection goes through multiple states. You observe and respond to these state transitions by listening to state change event notifications.

:::info
The information on this page is applicable to Signaling SDK versions 2.2.0 or later.
:::

## Understand the tech

In real-world use-cases, disruptions affect a user's network connection. These disruptions cause corresponding changes in the Signaling SDK connection state. To maintain a seamless user experience despite these changes, the SDK ensures continuity of channel subscriptions and temporary user status. Upon reconnecting from a disconnected state, the SDK automatically restores the previous subscriptions and temporary user status, eliminating the need for user intervention.

This continuity assurance does not apply if you actively disconnect by logging out from Signaling. Logging out clears the channel subscriptions and temporary user status, and resets the connection state to idle.

The Signaling SDK handles the following connection management tasks:

- Intelligently selects the nearest edge server for access and enables quick switchover to an alternate server in case of access failure.
- Selects the appropriate connection protocol and establishes connections with the server based on user configuration.
- Manages and preserves channel subscriptions and ensures continuity of temporary user status upon recovery from a temporary disconnection.
- Notifies users of connection state changes so you can respond at the business level.

## Connection states

### Message channel connection states

To use a message channel, you initialize the SDK and log in to initiate a connection with the server. In case of an unexpected interruption, the SDK automatically attempts to restore the connection.

| State | Description |
| --- | --- |
| `IDLE` | The SDK enters this state when you create a client instance or after you explicitly call `logout`. |
| `CONNECTING` | The SDK enters this state when you call `login`, and also during each reconnection attempt after accidental disconnection. |
| `CONNECTED` | The client and server are connected normally. |
| `DISCONNECTED` | The connection is temporarily disconnected. The SDK retries reconnection and restores subscriptions and user status after recovery. |
| `SUSPENDED` | A long-term disconnection state. The SDK periodically retries reconnection every 30 seconds. |
| `FAILED` | An unrecoverable failure state, such as invalid App ID or expired token. |

![Message connection states](/images/signaling/message-channel-transitions.svg)

### Stream channel connection states

In a stream channel, you join a channel to initiate a connection with the server. In case of unexpected interruptions, the client automatically attempts reconnection for up to 20 minutes.

| State | Description |
| --- | --- |
| `IDLE` | The SDK enters this state after you create a stream channel instance or after you explicitly call `leave`. |
| `CONNECTING` | The stream channel enters this state when you call `join`, and also during reconnection attempts. |
| `CONNECTED` | The client and the server are connected normally. |
| `FAILED` | An unrecoverable failure state. |

![Stream connection states](/images/signaling/stream-connection-state-transitions.svg)

## Listen for connection state events

The `onLinkStateEvent` callback provides the information you need to understand network state transitions.

```java
RtmEventListener listener = new RtmEventListener() {
    @Override
    public void onLinkStateEvent(LinkStateEvent event) {
    }
};

rtmClient.addEventListener(listener);
```

```kotlin
val listener = object : RtmEventListener {
    override fun onLinkStateEvent(event: LinkStateEvent) {
    }
}

rtmClient.addEventListener(listener)
```

The event provides the following parameters:

- `previousState`
- `currentState`
- `serviceType`
- `operation`
- `reason`

## Connection restoration mechanism

After each `login` operation, the SDK attempts to establish a connection with the server and generates a local session cache. This cache records information regarding subscribed or joined channels, and temporary user status data.

When the client experiences temporary disconnection due to a network issue, it automatically attempts to reconnect. Upon successful reconnection, the SDK utilizes the session cache to restore the user's channel subscription and temporary user status data.

## Handling connection errors

The Signaling client automatically recovers from non-fatal error states, and notifies you of transition details through `onLinkStateEvent`.

### Fatal errors

Some errors are fatal. In these cases, the SDK enters the `FAILED` state and does not attempt automatic reconnection. Troubleshoot the error and explicitly call `login` or `join` again.
