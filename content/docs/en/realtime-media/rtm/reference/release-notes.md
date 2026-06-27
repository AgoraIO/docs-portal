---
title: "Release notes"
description: "Information about changes in each release of Signaling."
---

The Agora Signaling SDK provides a streamlined and stable messaging mechanism for you to quickly implement real-time messaging for various use-cases. See [product overview](../product-overview.md) for more information.

This page contains information on the following releases:

### Known issues and limitations

Starting from v2.2.0, the Signaling SDK and Video/Voice SDK (version 4.3.0 or later) both include the `libaosl.so` library. If you use both SDKs, take the following steps to avoid conflicts:

- If you manually integrate the SDK through CDN, manually delete the older version of the `libaosl.so` library;
- If you integrate the SDK using a dependency management tool, such as Maven or CocoaPods, ensure that the newer version of the `libaosl.so` library is included in your project.

For more information, see [How do I handle issues when integrating the Signaling SDK and Video/Voice SDK simultaneously?](https://docs.agora.io/en/help/integration-issues/rtm2_rtc_integration_issue)

- Signaling SDK v2.2.8 `libaosl.so` version: 1.3.0.
- Signaling SDK v2.2.6 `libaosl.so` version: 1.2.13.
- Signaling SDK v2.2.4 `libaosl.so` version: 1.2.13.
- Signaling SDK v2.2.2 `libaosl.so` version: 1.0.11.
- Signaling SDK v2.2.1 `libaosl.so` version: 1.0.11.
- Signaling SDK v2.2.0 `libaosl.so` version: 1.0.0.17.

### v2.2.8

Released on February 24, 2026.

#### Improvements

Included in this release:

- The Android Maven package name has changed from `io.agora:agora-rtm` to `io.agora.rtm:rtm-sdk`. Update your `build.gradle` dependency as follows:

    ```groovy
    implementation 'io.agora.rtm:rtm-sdk:x.y.z'
    ```
    
- A lite version to resolve integration issues when co-integrating with the Video SDK. For details, see [Handle issues when integrating the Signaling SDK and Video/Voice SDK simultaneously](https://docs.agora.io/en/help/integration-issues/rtm2_rtc_integration_issue).
    
    ```groovy
    implementation 'io.agora.rtm:rtm-sdk-lite:2.2.8'
    ```

#### Issues fixed

This release fixed the following issues:

- In certain scenarios, abnormal service connection states occurred when an app resumed from the background to the foreground while a network switch was in progress.
- In some cases, event notifications failed to be delivered properly after setting a temporary user presence state with Presence.
- On some device models running Android 16, the permission request occasionally exceeded the necessary scope.

### v2.2.6

Released on November 15, 2025.

#### New features

**Support for IoT device domain allowlist**

In IoT scenarios, devices may be restricted by Internet Service Providers (ISPs). To address this limitation, this version adds the `ispPolicyEnabled` field to [`RtmConfig`](https://docs.agora.io/en/signaling/reference/api). When you set this field to `true`, the SDK connects only to servers whose domain names or IP addresses have been registered with the ISP and are included in the allowlist.

#### Improvements

**New reconnection timeout configuration**

This version adds the `reconnectTimeout` field to [`RtmConfig`](https://docs.agora.io/en/signaling/reference/api). Use this field to configure the timeout period in seconds for the SDK to return a timeout error during login or reconnection. When the login or reconnection exceeds the configured duration, the SDK reports the current connection state and reason through a callback.

#### Issues fixed

- In some scenarios, the token expiration notification was triggered multiple times.
- In some scenarios, a peer-to-peer message was delivered to the recipient but the sender received a timeout error.
- In private deployment scenarios, frequent network switching caused abnormal connection states.

### v2.2.4

v2.2.4 was released on April 10, 2025.

#### Improvements

- New link state change reason

    This release adds the reason `LOGIN_TOO_FREQUENT` (37) to `RtmLinkStateChangeReason`, indicating that the current login operation is too frequent.

- New renew token timeout error code

    To better reflect the result of the renew token operation, this release adds the error code `RTM_RENEW_TOKEN_TIMEOUT` (10026).

- Presence event notification optimization

    When channel data fails to sync properly, the SDK retriggers the `SNAPSHOT` event. Upon receiving this event, you can update the app's local cache.

- Other improvements

    - Improved reconnection speed of the Signaling service when switching to background or sleep mode.
    - Optimized SDK performance in weak network conditions.
    - Improved selection of access nodes to enhance connection speed.
    - Further optimized the response time of the login service.

#### Issues fixed

- The subscription service occasionally did not recover during reconnection.
- Query results for users in some channels included information about abnormally offline users.
- Uncaught exceptions in callback functions could cause the SDK to crash.
- Subscribing to a topic could sometimes return an error indicating that the user was not in the channel.

### v2.2.2

v2.2.2 was released on December 13, 2024.

#### Compatibility changes

1. SNAPSHOT state trigger timing changes

    This release modifies the trigger timing of the `SNAPSHOT` event in the Presence event. Now, as long as the user is in the channel, they may receive the `SNAPSHOT` event again; after receiving it, the user can update their full information to avoid state inconsistencies caused by exceptions.

1. Lock timeout calculation rule changes

    This release modifies the calculation rule of the lock (Lock) timeout. Starting from this version, the lock timeout is calculated from the time when the server determines that the user is offline.

#### New features

1. SDK connection state change reason

    This release adds the [`RtmLinkStateChangeReason`](https://docs.agora.io/en/signaling/reference/api) enumeration class to the SDK connection state `LinkStateEvent` to report the reason for the connection state change.

1. Support 16 KB page size

    Starting from Android 15, the system supports a 16 KB page size. For more information, see [Support 16 KB page size](https://developer.android.com/guide/practices/page-sizes). Starting from this version, the SDK supports a 16 KB page size to ensure seamless operation on devices using 4 KB and 16 KB page sizes, improving compatibility and avoiding crashes.

#### Improvements

This release improves the performance of the basic messaging service during exceptions, avoiding service unavailability caused by the failure of some services.

#### Fixed issues

This release fixed the following issues:
- In some use-cases, incorrect token types cause exceptions.
- In some use-cases, users may receive repeated offline notifications from the same user who has gone offline.
- After logging in from different devices with the same UID, the connection state may be abnormal.
- When setting the Presence state frequently, data may be abnormal.
- When the specified service is not activated, joining a channel does not return an error.
- In some use-cases, abnormal property values may cause crashes.

### v2.2.1

v2.2.1 was released on August 9, 2024.

#### Compatibility changes

This release optimizes the implementation of the following features, which involves renaming, deleting, or modifying the behavior of some APIs. To ensure the proper functioning of your project, modify your implementation after upgrading the SDK.

- Removes the `createMetadata` method. Refer to the sample code below to modify your implementation:

  ```java
  // Before v2.2.1
  Metadata metadata = rtmClient.getStorage().createMetadata();
  ```

  ```java
  // v2.2.1 or later
  Metadata metadata = new Metadata();
  ```

- Removes the `StateItem` class, and changes the type of the following parameters from `ArrayList<StateItem>` to `HashMap<String, String>`:
  - The `items` parameter of the [`setState`](https://docs.agora.io/en/signaling/reference/api) method.
  - The `stateItems` parameter of the [`PresenceEvent`](https://docs.agora.io/en/signaling/reference/api) class.
  - The `states` parameter of the [`UserState`](https://docs.agora.io/en/signaling/reference/api) class.

- Adds `CERTIFICATION_VERIFY_FAILURE(22)` in [`RtmConnectionChangeReason`](https://docs.agora.io/en/signaling/reference/api). The values of `STREAM_CHANNEL_NOT_AVAILABLE` and `INCONSISTENT_APPID` change to 23 and 24, respectively.

#### New features

1. Private deployment capability

    This release adds the `privateConfig` parameter in [`RtmConfig`](https://docs.agora.io/en/signaling/reference/api) to set private deployment. See [Private deployment configuration](../build/connect-and-authenticate/client-configuration.mdx).

1. Heartbeat interval configuration

    This release adds the `heartbeatInterval` parameter in [`RtmConfig`](https://docs.agora.io/en/signaling/reference/api) to set the interval at which the SDK sends heartbeat packets to the server. See [Heartbeat interval and presence timeout parameters](../build/connect-and-authenticate/connection/connection-management.mdx).

1. Dual environment configuration

    This release adds the `protocolType` parameter in [`RtmConfig`](https://docs.agora.io/en/signaling/reference/api) to set the network transport protocol. See [Connection protocol](../build/connect-and-authenticate/client-configuration.mdx).

1. User channel

    This release adds the `USER` type in [`RtmChannelType`](https://docs.agora.io/en/signaling/reference/api) for sending messages to specific users. This feature can replace the peer-to-peer messaging feature in v1.

1. Quiet mode configuration

    This release adds the `beQuiet` property in [`SubscribeOptions`](https://docs.agora.io/en/signaling/reference/api) and [`JoinChannelOptions`](https://docs.agora.io/en/signaling/reference/api) to enable quiet mode when subscribing or joining a channel. Once you enable the quiet mode, other users in the channel cannot receive your presence event notifications.

#### Improvements

1. Connection state management

    This release deprecates the `onConnectionStateChanged` callback and adds the [`onLinkStateEvent`](https://docs.agora.io/en/signaling/reference/api) callback instead. See [Connection management](../build/connect-and-authenticate/connection/connection-management.mdx) for details.

1. `REMOTE_STATE_CHANGED` event notification logic

    This release changes the triggering logic of the `REMOTE_STATE_CHANGED` event. When a user sets or modifies multiple key-value pairs at once, other users in the channel receive only one event notification.

1. Support for event notification timestamps

    This release adds a new `timestamp` parameter in the following data structures to report the timestamp of the triggered event notification:

        - [`MessageEvent`](https://docs.agora.io/en/signaling/reference/api)
        - [`PresenceEvent`](https://docs.agora.io/en/signaling/reference/api)
        - [`TopicEvent`](https://docs.agora.io/en/signaling/reference/api)
        - [`StorageEvent`](https://docs.agora.io/en/signaling/reference/api)
        - [`LockEvent`](https://docs.agora.io/en/signaling/reference/api)

1. Optimized API behavior

    This release improves the behavior of the following APIs:
    - [`login`](https://docs.agora.io/en/signaling/reference/api)
      - Before v2.2.1: The SDK does not support multiple consecutive calls to this method, or passing an empty string in the `token` parameter.
      - v2.2.1 or later: The SDK supports multiple consecutive calls to this method without the need for additional calls to `logout` in between. Additionally, when the `token` parameter is an empty string, the SDK uses the app ID you provided during initialization as a replacement for the token.
    - [`subscribe`](https://docs.agora.io/en/signaling/reference/api)
      - Before v2.2.1: The SDK does not support multiple consecutive calls to this method.
      - v2.2.1 or later: The SDK supports multiple consecutive calls to this method.
    - [`join`](https://docs.agora.io/en/signaling/reference/api)
      - Before v2.2.1: The SDK does not support multiple consecutive calls to this method, or passing an empty string in the `token` parameter.
      - v2.2.1 or later: The SDK supports multiple consecutive calls to this method. Additionally, when the `token` parameter is an empty string, the SDK uses the app ID you provided during initialization as a replacement for the token.

1. Range of `presenceTimeout`

    This release changes the range of the `presenceTimeout` parameter in the [`RtmConfig`](https://docs.agora.io/en/signaling/reference/api) from [10, 300] to [5, 300].

1. Other improvements

    This release also enhances the underlying algorithm capability to improve the data synchronization speed.

#### Fixed issues

This release fixed the issue that remote users occasionally did not receive the `REMOTE_LEAVE` event notification when the local user directly called the `logout` method without calling the `leave` method.

### v2.1.12

v2.1.12 was released on July 2, 2024.

#### Improvements

This release includes the following improvements:

- For data synchronization errors caused by network issues, this release introduces a user logout mechanism, which ensures that the SDK automatically logs out of the Signaling system.
- Unsubscribing from a message channel during network disconnection will no longer return an error.

#### Fixed issues

This release fixed the following issues:

- During a disconnection with the Signaling system under poor network conditions, the user experienced errors when unsubscribing from a message channel.
- Under poor network conditions, the user occasionally failed to receive callbacks after a successful login.
- After reconnecting from a disconnection, the user occasionally could not receive the `{config.onstorageevent[props .ag_platform]}` event notification.
- After reconnecting from a disconnection, the SDK occasionally failed to restore subscription relationships in the stream channel.
- Occasional failure to receive topic messages from web clients.

### v2.1.11

v2.1.11 was released on May 13, 2024.

#### Improvements

This release optimizes the response mechanism when subscribing to or joining channels with the `withPresence=true` setting. If the user does not receive the `SNAPSHOT` type of `onPresenceEvent` event notification within 5 seconds, the SDK will report the `CHANNEL_PRESENCE_NOT_READY` error code in the `resultCallback` parameter.

#### Fixed issues

This release fixed the following issues:

- In specific use-cases, after logging out of the Signaling system and logging back in, occasional failures occurred when subscribing to or joining channels with the `withPresence=true` setting.
- In cases where the connection was lost due to network issues and then restored, if the local user actively called the `leave` method to leave the channel, the remote user occasionally did not receive the `REMOTE_TIMEOUT` type of the `onPresenceEvent` event notification.
- Occasional failures occurred when frequently calling the `subscribe` and `unsubscribe` methods.

### v2.1.10

v2.1.10 was released on March 11, 2024.

#### Fixed issues

This release fixed the following issues:

- When sending messages frequently, message sending occasionally timed out.
- After calling `renewToken` to renew the token, some services were not functioning correctly, resulting in unexpected disconnection.

### v2.1.9

v2.1.9 was released on February 22, 2024.

#### Compatibility changes

This release improves message publishing options as follows:

- Removes the `sendTs` parameter and adds the `channelType` parameter in `PublishOptions`. See details in [`PublishOptions`](https://docs.agora.io/en/signaling/reference/api/).
- Modifies the type of the `options` parameter in the `publishTopicMessage` method from `PublishOptions` to `TopicMessageOptions`. See details in [`TopicMessageOptions`](https://docs.agora.io/en/signaling/reference/api/).

Make sure to modify the implementation of the relevant features after upgrading the SDK.

#### Improvements

This release adds the following improvements:

- Adds error codes: `INVALID_CHANNEL_TYPE`, `RTM_ERROR_INVALID_ENCRYPTION_PARAMETER`, and `RTM_ERROR_OPERATION_RATE_EXCEED_LIMITATION`. For error code descriptions and solutions, see [Error Codes](https://docs.agora.io/en/signaling/reference/error-codes).
- Optimizes the handling logic for expired user status data during reconnection.

#### Fixed issues

This release fixed the occasional crash issue when calling the `getOnlineUsers` method to retrieve paginated results.

### v2.1.7

v2.1.7 was released on January 22, 2024.

#### New features

1. Stream Channel

    Experience seamless, delay-free data flow from one point to another. Stream channel solution refers to a real-time data pipeline that enables the uninterrupted flow of data from one point to another without delay or latency.

2. Pub/Sub

    Embrace asynchronous messaging, enabling instant communication between publishers and subscribers without the need for immediate responses. The pub/sub model is a messaging pattern used in real-time messaging solutions where publishers send messages to channels, and subscribers receive messages from the channels they are subscribed to.

3. Topic

    Effectively manage data streams with topics, enabling seamless communications between users. Topic serves as a data flow management mechanism in the stream channel. It enables users to subscribe to, distribute, and notify events of data streams. Topics allow users to register as message publishers, send messages, and receive messages from subscribed publishers in a channel.

4. Storage

    Storage is important in signaling solutions to ensure reliable message delivery and prevent message loss or drop.

5. Removing Event Listeners

    This release adds the removeEventListener method. You can use it to remove a specified event listener.

6. Interval Mode

    This release supports the interval mode of presence function. When the number of online users in a channel exceeds the specified Announce Max value, the channel enters the interval mode. The SDK triggers the presence event notification at regular intervals and provides aggregated incremental information about user join, leave, timeout, and state changes in the interval property. For more details, see [Interval Mode](https://docs.agora.io/en/signaling/reference/api).

7. Locks

    Implement locks to maintain the sequence of messages, ensuring your data is processed in a specific order, preventing any data conflicts. When a client accesses a resource, it can acquire a lock on that resource to prevent other clients from accessing it.
