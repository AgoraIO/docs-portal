---
title: "Event listeners"
description: "Receive event notifications."
---

To receive message and event notifications when you subscribe to or join channels, you add an event listener. An event listener is triggered by the SDK to inform the client about Signaling events and state changes. The listener enables you to respond to events like successful connection to Signaling, token expiration, received messages, and other presence, storage, and lock events.

## Prerequisites

Ensure that you have integrated the Signaling SDK in your project and implemented the framework functionality from the [SDK quickstart](../../index.mdx) page.
    
## Implement event listeners

This section shows how to use the Signaling SDK to implement event listeners.

### Add an event listener

Signaling uses an `RtmEventListener` instance to process messages and event notifications. Each message and event notification has a corresponding event handler, where you implement your own processing logic. Refer to the following code to create and use an instance of `RtmEventListener`:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
// Create an RtmEventListener instance
RtmEventListener eventListener = new RtmEventListener() {
    @Override
    public void onMessageEvent(MessageEvent event) {
        // Triggered when messages are received from remote users
    }

    @Override
    public void onPresenceEvent(PresenceEvent event) {
        // Triggered when the presence info changes
    }

    @Override
    public void onTopicEvent(TopicEvent event) {
    }

    @Override
    public void onLockEvent(LockEvent event) {
        // Triggered when the channel lock info changes
    }

    @Override
    public void onStorageEvent(StorageEvent event) {
        // Triggered when the subscribed storage info changes
    }

    @Override
    public void onConnectionStateChange(String channelName, RtmConstants.RtmConnectionState state,
            RtmConstants.RtmConnectionChangeReason reason) {
        // Triggered when the connection state changes
    }

    @Override
    public void onLinkStateEvent(LinkStateEvent event) {
        // Triggered when the link state changes
    }

    @Override
    public void onTokenPrivilegeWillExpire(String channelName) {
        // Triggered when the token is about to expire
    }
};

// Configure RtmClient
RtmConfig rtmConfig = new RtmConfig();
// Specify the event listener in the client configuration
rtmConfig.eventListener = eventListener;

// Create an RtmClient instance
RtmClient mRtmClient = RtmClient.create(rtmConfig);
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
// Create an RtmEventListener instance
val eventListener = object : RtmEventListener {
    override fun onMessageEvent(event: MessageEvent) {
        // Triggered when messages are received from remote users
    }

    override fun onPresenceEvent(event: PresenceEvent) {
        // Triggered when the presence info changes
    }

    override fun onTopicEvent(event: TopicEvent) {
    }

    override fun onLockEvent(event: LockEvent) {
        // Triggered when the channel lock info changes
    }

    override fun onStorageEvent(event: StorageEvent) {
        // Triggered when the subscribed storage info changes
    }

    override fun onConnectionStateChange(
        channelName: String,
        state: RtmConstants.RtmConnectionState,
        reason: RtmConstants.RtmConnectionChangeReason
    ) {
        // Triggered when the connection state changes
    }

    override fun onLinkStateEvent(event: LinkStateEvent) {
        // Triggered when the link state changes
    }

    override fun onTokenPrivilegeWillExpire(channelName: String) {
        // Triggered when the token is about to expire
    }
}

// Configure RtmClient
val rtmConfig = RtmConfig().apply {
    eventListener = this@eventListener
}

// Create an RtmClient instance
val mRtmClient = RtmClient.create(rtmConfig)
```
</CodeBlockTab>

</CodeBlockTabs>

### Remove event listeners

To avoid performance degradation caused by memory leaks, errors, and exceptions, best practice is to unregister an event handler when you no longer need to use it. 

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
mRtmClient.removeEventListener(eventListener);
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
mRtmClient.removeEventListener(eventListener)
```
</CodeBlockTab>

</CodeBlockTabs>

The `RtmClient` automatically destroys event listeners when you call `release`.

### Signaling events

Signaling SDK offers the following events:  

| Event Listener            | Description             |
|---------------------------|-------------------------|
| `onMessageEvent`          | Receive message notifications from all the message channels you have subscribed to, or topic message notifications subscribed to from all the stream channels you have joined. The event payload data includes channel name, channel type, topic name, event sender, message payload data type, and other information. |
| `onPresenceEvent`         | Receive online status event notifications from remote users in all message channels you have subscribed to and stream channels you have joined. The event payload data includes channel name, channel type, event type, event sender, user temporary status data, and other information.  |
| `onTopicEvent`            | Receive notifications of topic change events in all the stream channels you have joined. The event payload data includes information such as channel name, event type, topic name, and event sender. |
| `onStorageEvent`          | Receive all channel metadata event notifications in all message channels you have subscribed to and stream channels you have joined, as well as user metadata event notifications from all subscribed users. The event payload data includes information such as channel name, channel type, event type, and specific metadata. |
| `onLockEvent`             | Receive all lock event notifications in the message channel you have subscribed to and stream channel you have joined. The event payload data contains information such as channel name, channel type, event type, and lock details. |
| `onLinkStateEvent`          | Receive event notifications for client network connection status changes, including the connection status before and after the change, service type, operation type that caused the change, reason for the change, channel list, and other information. |
| `onTokenPrivilegeWillExpire`| Receive event notifications that the client token is about to expire.  |
| `onConnectionStateChanged` | (Deprecated) Receive event notifications of client network connection status changes, including channel name, connection status, and reason for change.  |

For details on the parameters passed in by each event, refer to [Event listeners](https://docs.agora.io/en/signaling/reference/api) in the API reference.
