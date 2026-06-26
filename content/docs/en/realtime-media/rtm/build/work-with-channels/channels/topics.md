---
title: "Topics"
description: "Implement topics in stream channels."
---

Topics are a mechanism for managing transmission and distribution of data in stream channels. After joining a stream channel, users cannot publish directly to the channel. Stream channels implement message sending and receiving through topics. All subscribers of a topic receive data sent by the publishers for the topic within 100 milliseconds.

Compared to message channels, the topic mechanism in stream Channels has a higher message transmission rate, greater message concurrency, and synchronization capability with audio and video data transmission. Topics are therefore ideally suited to Metaverse, AR/VR, interactive games, real-time collaboration, and parallel control use-cases.

## Understand the tech

In Signaling, a topic is a dynamic entity that you may use at any time without the need to explicitly create it in advance. The SDK automatically creates it when the first user joins a topic. Similarly, you don't need to explicitly destroy a topic. The SDK automatically destroys it when the last user leaves.

The basic APIs for registering as a topic publisher or subscriber are join, leave, subscribe and unsubscribe.

* **Message publisher**: When you join a topic, you register as a message publisher for the topic. This enables you to send messages to topic subscribers. When you leave a topic, you unregister as a message publisher, and lose the ability to publish messages.

* **Message subscriber**: Subscribing to a topic enables you to receive messages that are published to the topic. To stop receiving topic messages, you unsubscribe from the topic.

In topics, the publisher and subscriber roles are independent of each other. This means that a user may assume the role of a publisher, subscriber, or both. One role does not affect the behavior of the other.

## Prerequisites

Ensure that you have:

* Activated stream channel capability in [Agora Console](https://console.agora.io/v2). To do so, go to **Projects** > Edit project > **All features** > **Signaling** > **Stream channel configuration** and toggle to enable.

* Integrated the Signaling SDK in your project, and implemented the framework functionality from the [SDK quickstart](../../../index.mdx) page.

* Implemented the functionality to create and join a stream channel. See [Stream channels](stream-channel.mdx)

## Implement topics in stream channels

This section shows you how to join, leave, subscribe, and unsubscribe from topics.

### Join a topic

Joining a topic is a prerequisite for sending messages in a topic. Signaling allows a single client to join up to 8 topics in a channel concurrently. 

When joining a topic, set sending attributes using `options`. These parameters affect the sending behavior, such as whether the message order is preserved, the message priority, and synchronization of audio and video data transmitted on the same channel. For details, refer to the [API reference](https://docs.agora.io/en/signaling/reference/api).

Use the following code to join a topic:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
var options = new JoinTopicOptions();
options.messageQos = RtmMessageQos.ORDERED;
mStreamChannel.joinTopic("topic_name", options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "join topic success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
val options = JoinTopicOptions()
options.messageQos = RtmMessageQos.ORDERED
mStreamChannel.joinTopic("topic_name", options, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "join topic success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

After a user successfully joins a topic, the SDK triggers an `onTopicEvent` of type `REMOTE_JOIN`. All users in the channel, who have enabled listening to topic events, receive this event notification.

### Leave a topic

When you no longer need to send messages to a topic, or the number of topics currently joined exceeds the limit, leave a topic to release resources. 

Refer to the following code to leave a topic:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
mStreamChannel.leaveTopic("Motion", new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "leave topic success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
mStreamChannel.leaveTopic("Motion", object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "leave topic success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

After a user successfully leaves a topic, the SDK triggers an `onTopicEvent` of type `REMOTE_LEAVE`. All users in the channel, who have enabled listening to topic events, receive this event notification.

### Subscribe to a topic
Joining a topic does not mean that you automatically start receiving messages sent to the topic. To receive messages, you subscribe to the topic and specify the message publishers to receive the messages from. In a single channel, you can subscribe to up to 50 topics concurrently, and in each topic, you can subscribe to up to 64 message publishers at the same time. The purpose of this limit is to balance end-side bandwidth and performance.

To subscribe to message publishers in a topic, specify the message publishers list in the `users` parameter of the `subscribeTopic` method. 

Refer to the following code to subscribe to a topic:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
TopicOptions options = new TopicOptions();
options.users = new ArrayList<>(Arrays.asList("user_name"));

mStreamChannel.subscribeTopic("Motion", options, new ResultCallback<SubscribeTopicResult>() {
    @Override
    public void onSuccess(SubscribeTopicResult responseInfo) {
        log(CALLBACK, "subscribe topic success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
val options = TopicOptions()
options.users = ArrayList(listOf("user_name"))

mStreamChannel.subscribeTopic("Motion", options, object : ResultCallback<SubscribeTopicResult> {
    override fun onSuccess(responseInfo: SubscribeTopicResult?) {
        log(CALLBACK, "subscribe topic success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

:::info
* If you do not fill in the message publishers list when subscribing to a topic, up to 64 users are randomly subscribed by default. If there are less than 64 users in the topic, all users are subscribed.
* If you make multiple topic subscription calls, where the first subscription message publisher list is `[UserA, UserB]` and the second publisher list is `[UserB, UserC]`, then the final subscription list is `[UserA, UserB, UserC]`.

:::

### Unsubscribe from a topic

To stop receiving messages from a particular message publisher in a topic, or to unfollow the entire topic, call `unsubscribeTopic`. If you do not fill in the message publishers list when unsubscribing from a topic, you are unsubscribed from the entire topic.

Refer to the following code to unsubscribe:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
var topicName = "Motion";
var options = new TopicOptions();
options.users = new ArrayList<>(Arrays.asList("Tony"));

mStreamChannel.unsubscribeTopic(topicName.toString(), options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "unsubscribe topic success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
val topicName = "Motion"
val options = TopicOptions()
options.users = ArrayList(listOf("Tony"))

mStreamChannel.unsubscribeTopic(topicName.toString(), options, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "unsubscribe topic success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

### Add a topic event listener

To set up an event listener for topic events, refer to [Add event listener](../../send-and-receive-messages/messaging/add-event-listener.md). After successfully adding a topic event handler, you receive `onTopicEvent` notifications for all topics in all stream channels you join or subscribe to. The event returns the following data:

| Attribute     | Description           |
|---------------|-----------------------|
| `type`        | Topic [event type](#topic-event-types) |
| `channelName` | The name of the channel where the event occurred.  |
| `publisher`   | The user ID that triggered this event.  |
| `topicInfos`  | Topic detailed information array, including topic name, topic publisher, and other information. |
| `timestamp`   | The timestamp when the event occurred. |

### Topic event types

When a user in the channel joins or leaves a topic, Signaling triggers the `onTopicEvent` event notification. Users in the channel receive the event notification in real-time and use it to track changes to the status of the topic.

When a user joins a channel for the first time, the SDK delivers a topic event notification of type `SNAPSHOT` to the joining user. The notification contains historical status information of the topic in the current channel. The following table explains the different topic event types:

| Attribute     | Description           |
|---------------|-----------------------|
| `SNAPSHOT` | Triggered when a local user joins a stream channel for the first time. It notifies the user of details for all topics in the channel. This event notification is only triggered once when joining the channel. |
| `REMOTE_JOIN` | Triggered when a remote user joins a topic and registers as a publisher for the topic. |
| `REMOTE_LEAVE` | Triggered when a remote user leaves the topic and unregisters as a topic publisher. |

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### Topic restrictions

A single client can have an unlimited number of topics at the same time, and there is no limit on the number of subscribers and publishers in each topic. However, to optimize the client-side bandwidth and performance, there are certain limits on the following:

- The number of topics that a single user can join concurrently.
- The number of topics that a user can subscribe to concurrently.
- The number of message publishers that can be concurrently subscribed to in a topic.

For details, see [API usage restrictions](../../../../reference/limitations.md).

### Topic naming

A topic name is a string of up to 16 letters or numbers in the ASCII character set. All topics under the same stream channel must have unique names. The same topic name in one stream channel is considered a single topic, but the same name in different stream channels is considered as two separate topics.

The following characters in topic names are supported:

- 26 lowercase English letters a-z
- 26 uppercase English letters A-Z
- 10 numbers 0-9
- Space
- `!`, `#`, `$`, `%`, `&`, `(`, `)`, `+`, `,`, `-`, `:`, `;`, `<`, `=`, `>`, `?`, `@`, `[`, `]`, `^`, `_`, `{`, `|`, `}`, `~`, `` ` ``

:::warning
Topic names cannot begin with an underscore.

:::

The following characters are not supported:

- `.`, `*`, `/`, `\`, `\0`
- Non-printable ASCII characters

Although the Signaling SDK does not require it, best practice when naming a topic is to use meaningful prefix characters to indicate the purpose of the topic or the type of messages published in it. Topic naming recommendations are similar to [Channel naming recommendations](../../../../reference/channel-naming.md).

### API reference

- [`joinTopic`](https://docs.agora.io/en/signaling/reference/api)
- [`leaveTopic`](https://docs.agora.io/en/signaling/reference/api)
- [`subscribeTopic`](https://docs.agora.io/en/signaling/reference/api)
- [`unsubscribeTopic`](https://docs.agora.io/en/signaling/reference/api)
- [Event Listeners](https://docs.agora.io/en/signaling/reference/api)
