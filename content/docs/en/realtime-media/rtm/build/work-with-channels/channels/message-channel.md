---
title: "Message channels"
description: "Communicate using message channels."
---

Signaling provides message channels for implementing publish-subscribe (pub/sub) messaging in your app. In a message channel, you subscribe to a channel to receive messages. However, you do not need to join the channel to publish messages. This page shows you how to use Signaling SDK pub/sub messaging to implement various communication model into your app. 

## Understand the tech

Pub/sub is the simplest form of messaging. Signaling creates a channel when a user subscribes to it. Your app listens for events which contain messages users publish to a channel.

Signaling allows thousands of message channels to exist in your app at the same time. However, due to client-side performance and bandwidth limitations, a single client may only subscribe to a limited number of channels concurrently. For details, see [API usage restrictions](../../../reference/limitations.md).

### Communication models in message channels

Signaling SDK enables you to implement a variety of communication models using message channels. A communication model refers to the data flow relationship between the message sender and receiver within a channel. Using the pub/sub message distribution mechanism, you can seamlessly implement the following communication models:

- **1-to-1 channel**: This model facilitates communication between two users. It is ideal for creating private chat channels, one-on-one customer service support, and personal interactions.

- **Group channel**: A group channel facilitates many-to-many communication, making user groups within the channel visible to each other. This model is suitable for workgroups, family discussions, and community interactions. Access control options in Signaling SDK enable you to implement open or invitation-based participation.

- **Broadcast channel**: A broadcast channel enables one-to-many communication, where a single sender broadcasts messages to multiple recipients. This model is useful for group announcements, surveys, and disseminating information to a large audience.

- **Unicast channel**: This model allows many users to send messages to a single recipient. This model is beneficial for use-cases such as questionnaire feedback collection, IoT sensor data aggregation, and centralized data collection.

## Prerequisites

Ensure that you have integrated the Signaling SDK in your project and implemented the framework functionality from the [SDK quickstart](../../../index.mdx) page.

## Implement message channels

This section shows you how to subscribe, unsubscribe, and send messages to a message channel.

### Subscribe to a channel

Use the `subscribe` method to subscribe to a message channel. After you subscribe, you receive `onMessageEvent` and other event notifications for the channel.

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
// Subscribe to a channel with options
String channelName = "test_channel";
SubscribeOptions options = new SubscribeOptions();
options.setWithMessage(true);
options.setWithPresence(true);
options.setWithMetadata(true);
options.setWithLock(true);

mRtmClient.subscribe(channelName, options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "subscribe channel " + channelName + " success");
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
// Subscribe to a channel with options
val channelName = "test_channel"
val options = SubscribeOptions().apply {
    withMessage = true
    withPresence = true
    withMetadata = true
    withLock = true
}

mRtmClient.subscribe(channelName, options, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "subscribe channel $channelName success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

To subscribe to multiple channels, call `subscribe` multiple times:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
// Subscribe to multiple channels with options
String channelName1 = "chats.room1";
String channelName2 = "chats.room2";
SubscribeOptions options = new SubscribeOptions();
options.setWithMessage(true);
options.setWithPresence(true);
options.setWithMetadata(true);
options.setWithLock(true);

mRtmClient.subscribe(channelName1, options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "subscribe channel " + channelName1 + " success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});

mRtmClient.subscribe(channelName2, options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "subscribe channel " + channelName2 + " success");
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
// Subscribe to multiple channels with options
val channelName1 = "chats.room1"
val channelName2 = "chats.room2"
val options = SubscribeOptions().apply {
    withMessage = true
    withPresence = true
    withMetadata = true
    withLock = true
}

mRtmClient.subscribe(channelName1, options, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "subscribe channel $channelName1 success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})

mRtmClient.subscribe(channelName2, options, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "subscribe channel $channelName2 success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

:::info
Signaling allows a single client to subscribe to up to 50 message channels simultaneously. However, to optimize client performance and bandwidth usage, best practice is to limit subscriptions to 30 channels. If you have very large or highly active channels, consider further reducing the number of simultaneous subscriptions.

:::

### Send a message

To send messages in a message channel, simply call the `publish` method without subscribing to the channel. This method sends messages to one channel at a time. To send messages to multiple channels, call this method multiple times. Signaling SDK does not limit the number of channels to which you can send messages, or the number of users who can send messages to a channel. However, there are certain restrictions on the frequency at which you can send messages to a channel simultaneously. See [API usage restrictions](../../../reference/limitations.md) for details.

:::info
The `publish` method can only be used with a message channel and a user channel; it does not apply to a stream channel.

:::

Refer to the following sample code for sending messages:

* String message

    <CodeBlockTabs defaultValue="java">
    <CodeBlockTabsList>
      <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
      <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
    </CodeBlockTabsList>

    <CodeBlockTab value="java">
    ```java
    // Send a string message
        String message = "Hello World"; // Declaring a string variable for the message content
        String channelName = "my_channel"; // Specifying the name of the channel to which the message will be sent
        var options = new PublishOptions(); // Creating options for publishing the message
        options.customType = "PlainTxt"; // Setting the custom message type to "PlainTxt"
    
        mRtmClient.publish(channelName, message, options, new ResultCallback<Void>() { // Publishing the message to the channel
            @Override
            public void onSuccess(Void responseInfo) {
                log(CALLBACK, "send message success"); // Logging a success message upon successful message transmission
            }
    
            @Override
            public void onFailure(ErrorInfo errorInfo) {
                log(ERROR, errorInfo.toString()); // Logging an error message in case of transmission failure
            }
        });
    ```
    </CodeBlockTab>

    <CodeBlockTab value="kotlin">
    ```kotlin
    // Send a string message
        val message = "Hello World" // Declaring a string variable for the message content
        val channelName = "my_channel" // Specifying the name of the channel to which the message will be sent
        val options = PublishOptions().apply {
            customType = "PlainTxt" // Setting the custom message type to "PlainTxt"
        }
    
        mRtmClient.publish(channelName, message, options, object : ResultCallback<Void> { // Publishing the message to the channel
            override fun onSuccess(responseInfo: Void?) {
                log(CALLBACK, "send message success") // Logging a success message upon successful message transmission
            }
    
            override fun onFailure(errorInfo: ErrorInfo) {
                log(ERROR, errorInfo.toString()) // Logging an error message in case of transmission failure
            }
        })
    ```
    </CodeBlockTab>
    </CodeBlockTabs>
* Binary message

    <CodeBlockTabs defaultValue="java">
    <CodeBlockTabsList>
      <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
      <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
    </CodeBlockTabsList>

    <CodeBlockTab value="java">
    ```java
    // Send a binary message
        byte[] message = new byte[] { 00, 01, 35, (byte) 196 }; // Defining a byte array for the binary message
        String channelName = "my_channel"; // Specifying the name of the channel to which the message will be sent
        var options = new PublishOptions(); // Creating options for publishing the message
        options.customType = "ByteArray"; // Setting the custom message type to "ByteArray"
    
        mRtmClient.publish(channelName, message, options, new ResultCallback<Void>() { // Publishing the message to the channel
            @Override
            public void onSuccess(Void responseInfo) {
                log(CALLBACK, "send message success"); // Logging a success message upon successful message transmission
            }
    
            @Override
            public void onFailure(ErrorInfo errorInfo) {
                log(ERROR, errorInfo.toString()); // Logging an error message in case of transmission failure
            }
        });
    ```
    </CodeBlockTab>

    <CodeBlockTab value="kotlin">
    ```kotlin
    // Send a binary message
        val message = byteArrayOf(0, 1, 35, 196.toByte()) // Defining a byte array for the binary message
        val channelName = "my_channel" // Specifying the name of the channel to which the message will be sent
        val options = PublishOptions().apply {
            customType = "ByteArray" // Setting the custom message type to "ByteArray"
        }
    
        mRtmClient.publish(channelName, message, options, object : ResultCallback<Void> { // Publishing the message to the channel
            override fun onSuccess(responseInfo: Void?) {
                log(CALLBACK, "send message success") // Logging a success message upon successful message transmission
            }
    
            override fun onFailure(errorInfo: ErrorInfo) {
                log(ERROR, errorInfo.toString()) // Logging an error message in case of transmission failure
            }
        })
    ```
    </CodeBlockTab>
    </CodeBlockTabs>
:::info
Signaling currently supports only string and binary message formats. To send other types of data such as a JSON objects, or data from third-party data construction tools such as protobuf, serialize the data before sending the message. For information on how to effectively construct the payload data structure and recommended serialization methods, refer to [Message payload structuring](../../send-and-receive-messages/messaging/message-payload-structuring.md).

:::

### Customize channel subscription

By default, you receive message events for all channels you subscribe to. If you don't wish to receive messages from specific channels, while still receiving other types of event notifications from these channels, adjust the subscription settings accordingly. Refer to the following code snippet:

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
// Subscribe to a channel with customized options
String channelName = "test_channel";
SubscribeOptions options = new SubscribeOptions();
options.setWithMessage(false); // Disable message reception
options.setWithPresence(true); // Enable presence notifications
options.setWithMetadata(true); // Enable metadata retrieval
options.setWithLock(true); // Enable lock status updates

mRtmClient.subscribe(channelName, options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "Successfully subscribed to channel: " + channelName);
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, "Failed to subscribe to channel: " + channelName + ", Error: " + errorInfo.toString());
    }
});
```
</CodeBlockTab>

<CodeBlockTab value="kotlin">

```kotlin
// Subscribe to a channel with customized options
val channelName = "test_channel"
val options = SubscribeOptions().apply {
    withMessage = false // Disable message reception
    withPresence = true // Enable presence notifications
    withMetadata = true // Enable metadata retrieval
    withLock = true // Enable lock status updates
}

mRtmClient.subscribe(channelName, options, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "Successfully subscribed to channel: $channelName")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, "Failed to subscribe to channel: $channelName, Error: \${errorInfo.toString()\}")
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

In this example, setting `withMessage` to `false` ensures that messages from `test_channel` do not trigger event notifications. However, you continue to receive notifications for other events, such as presence updates, metadata changes, and lock status alterations.

### Unsubscribe from a channel

To stop receiving message and all other event notifications from a channel, call `unsubscribe`.

<CodeBlockTabs defaultValue="java">
<CodeBlockTabsList>
 <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
 <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
</CodeBlockTabsList>

<CodeBlockTab value="java">

```java
// Unsubscribe from a channel
String channelName = "chats.room1";
mRtmClient.unsubscribe(channelName, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "unsubscribe channel " + channelName + " success");
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
// Unsubscribe from a channel
val channelName = "chats.room1"
mRtmClient.unsubscribe(channelName, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "unsubscribe channel $channelName success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```
</CodeBlockTab>

</CodeBlockTabs>

This method only unsubscribes from one channel at a time. To unsubscribe from multiple channels, call this method multiple times.

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### Message payload size

Signaling SDK imposes limits on the size of the message payload sent in message channels and stream channels. The limit is 32 KB for message channels and 1 KB for stream channels. The message payload size includes the message payload itself plus the size of the `customType` field. If the message payload package size exceeds the limit, you receive an error message.

```js
ErrorInfo {
    errorCode = -11010;
    reason = "Publish too long message.";
    operation = "publishTopicMessage"; // or "publish"
}
```

To avoid sending failure due to message payload size exceeding the limit, check the size before sending.

### API reference

- [`subscribe`](https://docs.agora.io/en/signaling/reference/api)
- [`unsubscribe`](https://docs.agora.io/en/signaling/reference/api)
- [`publish`](https://docs.agora.io/en/signaling/reference/api)
