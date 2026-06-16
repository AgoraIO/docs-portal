---
title: "Connection basics"
description: "Understand the basics of Signaling connections"
---

# Connection basics

A Signaling client must establish a connection with the server to access network resources. API calls, messages, and events in the channel are transmitted through network connections. While the Signaling SDK manages establishing and maintaining network connections, understanding its management mechanism helps you handle potential network errors in the app, and improves the end user experience.

This page shows how to manage the connection between the Signaling SDK and the Signaling server. 

## Prerequisites

Ensure that you have integrated the Signaling SDK in your project and implemented the framework functionality from the [SDK quickstart](sdk-quickstart.mdx) page.

## Understand the tech

The Signaling SDK abstracts the complexities of managing network connections and provides the `onLinkStateEvent` event notifications to inform users of various connection status transitions. To efficiently handle connection errors and manage the connection state, implement a listener for this event.

:::info
The `onLinkStateEvent` event is only available in Signaling `2.2.1` and above.

:::

It is important to understand that Signaling provides two types of services: `MESSAGE` services and `STREAM` services. The connection types corresponding to the two services are different. A client may use one or both of these services.

## Manage connections

This section provides an overview of the types of Signaling connections. It discusses how to create a connection, monitor the connection state, configure timeout and reconnection behavior, and close connections when they are no longer needed.

### Create connection

When you create a Signaling client instance, or a stream channel instance, the Signaling SDK does not immediately establish a network connection with the server. At this point, you have just created an object instance for calling the Signaling SDK APIs. The client attempts to establish a network connection with the server only when you call `login` or `join`.

#### Message connection

The `MESSAGE` service provides access to message channels, presence, storage, lock, token, and other functionalities. The messages, data, and event notifications of these functionalities share this connection. A connection only exists within the client life cycle. It is established when you call the `login` method to log in to the server, and ends when you call the `logout` method to log out of the server.

To establish a `MESSAGE` connection, refer to the following code:

**Java**
```java
rtmClient.login(token, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        // Successfully logged in
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        // Login failed
    }
});
```

**Kotlin**
```kotlin
rtmClient.login(token, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        // Successfully logged in
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        // Login failed
    }
})
```

:::info
Establishing a `MESSAGE` connection increments the peak connections count.

:::

The `MESSAGE` connection is persistent. The client regularly sends heartbeat packets to the server to maintain activity. When you subscribe to multiple message channels, you receive all channel messages and event notifications through this connection.

#### Stream connection

The `STREAM` service provides users with all the capabilities of a stream channel. Unlike a `MESSAGE` connection, a `STREAM` connection is not globally unique. Each stream channel instance creates a separate connection. For example, when you create three stream channel instances and call the `join` method, the client establishes three network connections with the server.

Before establishing a `STREAM` connection, you establish a `MESSAGE` connection. To do this, call the `login` method to log in to the server. The life cycle of a `STREAM` connection starts when you call `join` to join a channel and ends when you actively call `leave` to leave the channel. To establish a `STREAM` connection, refer to the following code:

**Java**
```java
JoinChannelOptions options = new JoinChannelOptions();
options.setToken("yourToken");
options.setWithPresence(true);
options.setWithMetadata(false);
options.setWithLock(false);

streamChannel.join(options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "join stream channel success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

**Kotlin**
```kotlin
val options = JoinChannelOptions().apply {
    token = "yourToken"
    withPresence = true
    withMetadata = false
    withLock = false
}

streamChannel.join(options, object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "join stream channel success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```

:::info
Establishing a `STREAM` connection does not increase the peak connections count.

:::

A `STREAM` connection is also a persistent connection. The client sends heartbeat packets to the server at regular intervals to keep the connection active. The time interval for sending heartbeat packets is 0.5 seconds and cannot be changed. For application use-cases that require optimizing battery life, use of the `STREAM` service is not recommended.

### Monitoring the network connection

The `onLinkStateEvent` callback provides event notifications for monitoring and managing the change of network connection status. By listening to this event, you can access crucial information such as:

- The current state of the network connection.
- The reasons or actions leading to the state change.
- The previous network state before the change.
- The timing of network connection state change.
- The service type (message or stream) for which the connection status has changed.
- Joined channels affected by the network state change.
- Channels for which network connectivity was not successfully restored after the change.

The detailed information provided by the event is valuable for handling business processes after recovering from unexpected disconnection states. It enables you to promptly identify and resolve issues caused by network connection changes, and ensures smooth business operations.

To receive `onLinkStateEvent` notifications, refer to the following code:

**Java**
```java
RtmEventListener listener = new RtmEventListener() {
    @Override
    public void onLinkStateEvent(LinkStateEvent event) {
    }
};

rtmClient.addEventListener(listener);
```

**Kotlin**
```kotlin
val listener = object : RtmEventListener {
    override fun onLinkStateEvent(event: LinkStateEvent) {
    }
}

rtmClient.addEventListener(listener)
```

The following table describes the available event parameters:

| Attribute     | Description   |
|:--------------|:-----------------------------------------|
| `currentState`  | The current connection state.          |
| `previousState` | The previous connection state.         |
| `serviceType`   | The service type. `MESSAGE` or `STREAM` |
| `operation`     | The operation that triggered this state change.    |
| `reason`        | Why the state change was triggered.   |
| `affectedChannels`   | Channels affected by this state change. |
| `unrestoredChannels`| Information about channels that have not been subscribed to or joined, including channel name, channel type, and temporary state data in the channel. Normally empty. |
| `isResumed`     | Whether the connection state was restored from `DISCONNECTED` to `CONNECTED` within 2 minutes after the disconnection. `true` indicates that it has been restored. |
| `timestamp`     | The timestamp when this event notification was sent. |

### Heartbeat detection

Heartbeat detection helps Signaling clients and servers detect sudden network disconnections, such as client network disconnection or network switching, in a timely manner.

#### Message connection

The Signaling client automatically sends a ping packet to the server every 5 seconds by default. If the server does not respond with a pong packet within 10 seconds, the client interprets it as a network issue. Consequently, the client's network connection status (`RtmLinkState`) switches from `CONNECTED` to `DISCONNECTED`, and it initiates reconnection attempts.

Similarly, if the server does not receive a ping packet from the client within 15 seconds, it considers it a network problem on the client side. The server then waits for a predefined period (`presenceTimeout`). If the client fails to reconnect during this period, the Signaling server sends `REMOTE_TIMEOUT` event notifications to other users in the affected channel.

It is important to note that the timeout mechanism applies only to accidental disconnections. Active disconnections, such as logging out by calling `logout`, do not trigger this behavior.

The heartbeat interval is set to 5 seconds by default to balance device battery life and timely detection of network issues. However, you can customize this to increase battery life or to identify network disconnection in a more timely manner by specifying the `heartbeatInterval` parameter in `RtmConfig`. The supported range is [5, 1800] seconds.

While increasing `heartbeatInterval` saves battery, it delays detection of network issues and the peak connection count (PCU) may appear to be higher. Agora does not recommend setting the interval to the maximum value of 1800 seconds.

To customize the heartbeat interval, refer to the following code:

**Java**
```java
RtmConfig rtmConfig = new RtmConfig.Builder("appid", "userId")
    .heartbeatInterval(30)
    .build();
```

**Kotlin**
```kotlin
val rtmConfig = RtmConfig.Builder("appid", "userId")
    .heartbeatInterval(30)
    .build()
```

#### Stream connection

When you create a stream channel instance and successfully join a stream channel, the client sends heartbeat packets to the server at 0.5 second intervals to keep the connection active. The stream connection heartbeat interval cannot be changed. For application use-cases that require increased battery life, Agora does not recommend use of stream connections.

### Heartbeat interval and presence timeout parameters

`RtmConfig` includes two time interval parameters: `heartbeatInterval` and `presenceTimeout`. This section explains the two parameters and their relationship, to enable you to configure the Signaling client more effectively.

1. `heartbeatInterval`: This parameter determines how often the client sends ping packets to the server to maintain an active connection. It affects the PCU count and is crucial for the SDK's global connection management functionality.

1. `presenceTimeout`: If the client's ping packet is not received within the set `heartbeatInterval` plus a 10-second redundancy period, the server considers it a possible network connection failure. To account for the possibility that the client may be trying to fix the problem, the server delays broadcasting event notifications to other users in the channel for a period of time defined by the `presenceTimeout`. This approach helps avoid repeated notification of events as follows:

    - If the client successfully reconnects within the `presenceTimeout` period, the server does not send event notifications to other users, and the temporary user status set by the client is retained.
    
    - If the client fails to reconnect within the `presenceTimeout` period, the server broadcasts an `onPresenceEvent` event notification with `REMOTE_TIMEOUT` to other users in the channel and clears the client's temporary user status. When the client successfully reconnects and resumes its subscription to the channel, the server broadcasts `REMOTE_JOIN` event notifications to other users in the channel. If the client had previously set a temporary user state, it reapplies the cached temporary user state from the local session. Other users in the channel receive a corresponding `REMOTE_STATE_CHANGED` event notification.
    
For local users, departures triggered by presence timeout and departures resulting from calling `unsubscribe` are both considered channel leaving behaviors. The difference lies in the fact that presence timeout departures are typically caused by network connection failures. The local user may be in a `DISCONNECTED` or `SUSPENDED` state and attempting to reconnect. If the reconnection is successful, the channel subscription relationship and temporary user status are automatically restored. For other users in the channel, the user is identified as a rejoined user. An `unsubscribe` call is considered as a user actively leaving a channel. It prompts the client to clear the subscription relationship and the temporary user status for this channel.

For example, suppose Client A sets the `heartbeatInterval` to 10 seconds and the `presenceTimeout` to 5 seconds. If Client A sends a ping packet but fails to receive a pong packet within 10 seconds, its connection state changes to `DISCONNECTED`. As Client A attempts to reconnect, the server waits for up to 25 seconds. If Client A fails to reconnect within this time, the server broadcasts an `onPresenceEvent` notification of type `REMOTE_TIMEOUT` to other users in the channel. If Client A successfully restores the connection within 25 seconds, the server does not broadcast event notifications, and other users in the channel consider Client A to have never left the channel. In this example, it took the `heartbeatInterval` of 10 seconds, plus an error range of 10 seconds to allow for network delays, plus a `presenceTimeout` interval of 5 seconds from when Client A dropped offline to when other users were notified. The total time interval was 25 seconds.

The `presenceTimeout` is crucial for handling situations where the network connection is quickly restored after being disconnected, such as network switching or driving through a tunnel. It prevents excessive event notifications and improves the user experience.

### Close the connection

When a connection between the client and server is no longer required, call an appropriate method to close the connection.

#### Message connection

In a message channel, the connection status affects measurement of the peak number of connections. Best practice is to actively disconnect by calling the `logout` method to log out of Signaling.

**Java**
```java
rtmClient.logout(new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
    }
});
```

**Kotlin**
```kotlin
rtmClient.logout(object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
    }

    override fun onFailure(errorInfo: ErrorInfo) {
    }
})
```

:::info
When you call the `logout` method to disconnect, both `MESSAGE` and `STREAM` connections are terminated simultaneously. You exit all channels, and all cached data in the client is cleared.

:::

#### Stream connection

When you no longer need a stream connection, call the `leave` method to exit the channel and disconnect the stream connection.

**Java**
```java
streamChannel.leave(new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "leave stream channel success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

**Kotlin**
```kotlin
streamChannel.leave(object : ResultCallback<Void> {
    override fun onSuccess(responseInfo: Void?) {
        log(CALLBACK, "leave stream channel success")
    }

    override fun onFailure(errorInfo: ErrorInfo) {
        log(ERROR, errorInfo.toString())
    }
})
```

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### Integrate CallAPI

Agora `CallAPI` is a use-case-based solution designed for one-to-one calls that open in seconds. The API provides efficient call connection and image transmission functions that help you quickly set up video calls and transmit images during calls.

This section guides you through integrating the `CallAPI` source code into your project and configuring the necessary project settings.

#### Prerequisites

Make sure you have:

- Installed [Git](https://git-scm.com/downloads)
- [Java Development Kit](https://www.oracle.com/java/technologies/javase-downloads.html)
- [Android Studio](https://developer.android.com/studio/) 4.1 or higher

#### Integration

Take the following steps to integrate `CallAPI` into your project:

1. **Set up permissions**

    If you don't have an Android project, [create a new project](https://developer.android.com/studio/projects/create-project). In your project, add the following permissions to the project's `AndroidManifest.xml` file:

    ```xml
    <!-- Required permissions -->
    <uses-permission android:name="android.permission.INTERNET"/>

    <!-- Optional permissions -->
    <uses-permission android:name="android.permission.CAMERA"/>
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.BLUETOOTH"/>

    <!-- For devices running Android 12.0 and above with SDK versions below v4.1.0, the following permission is also required -->
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>

    <!-- For devices running Android 12.0 and above, the following permissions are also required -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE"/>
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
    ```

    To prevent the code from being obfuscated, open `/app/proguard-rules.pro` and add the following line:

    ```
    -keep class io.agora.**{*;}
    ```

1. **Add CallAPI**

    To add `CallAPI` to your project:

    1. Download or clone the [CallAPI source code repository](https://github.com/AgoraIO-Community/CallAPI/tree/main/Android/lib_callapi/src/main/java/io/agora/onetoone).

    1. Copy the files from the `onetoone` folder into your project folder.

        In the Android Studio toolbar, click **Sync Project With Gradle File** to integrate the `CallAPI` code.

1. **Check the SDK version** 

    If your project integrates Agora Video SDK or Signaling SDK, ensure that the integrated SDK version is compatible with `CallAPI`:

    - Video SDK: `4.1.1.26` or higher
    - Signaling SDK: `2.2.0` or higher
    
    If your current version is incompatible with `CallAPI`, modify the corresponding SDK version number under `dependencies` in the `/app/build.gradle` file.

    ```
    'io.agora:agora-rtm:2.2.0'
    'io.agora.rtc:agora-special-full:4.1.1.26'
    ```