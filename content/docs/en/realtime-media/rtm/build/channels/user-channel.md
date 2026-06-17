---
title: "User channels"
description: "Send direct, point-to-point messages to individual users."
---

Signaling enables you to send direct, point-to-point messages to individual users through user channels. This feature is useful in one-on-one communication use-cases such as private chats and customer support interactions.

## Understand the tech

To implement point-to-point communication between individual users in your app:

1. **Set up the Signaling SDK**: [Integrate the Signaling SDK](../../index.mdx) in your app and initialize an instance of the Signaling client.
2. **Authenticate the user**: Log in to Signaling using a unique user ID.
3. **Send direct messages**: Call the `publish` method with the User channel type and specify the recipient's user ID as the channel name to send direct messages.
4. **Handle incoming messages**: Listen for message events to receive messages sent directly to the local user.

## Prerequisites

Ensure that you have:

* Integrated the Signaling SDK in your project, and implemented the framework functionality from the [SDK quickstart](../../index.mdx) page.

## Implement user messages

This section shows you how to use the Signaling SDK to send messages directly to a specified user.

To send a message to a user channel, call the `publish` method with the `channelType` parameter set to the User channel type and the `channelName` parameter set to the target user's `userId`. This method enables you to send a message to one user at a time. To send messages to multiple users, call this method for each user. While Signaling does not limit the number of users you can send messages to or receive messages from, it does [limit](../../reference/limitations.md) the frequency at which you can send messages to users.

Refer to the following sample code for sending messages:

* String message

    **Java**
    ```java
    // Send string message
    PublishOptions options = new PublishOptions();
    options.setChannelType(RtmChannelType.USER);
    options.setCustomType("PlainText");
    rtmClient.publish("Tony", "Hello world", options, new ResultCallback<Void>() {
        @Override
        public void onSuccess(Void responseInfo) {
            log(CALLBACK, "Send message success");
        }

        @Override
        public void onFailure(ErrorInfo errorInfo) {
            log(ERROR, errorInfo.toString());
        }
    });
    ```

    **Kotlin**
    ```kotlin
    // Send string message
    val options = PublishOptions()
    options.channelType = RtmChannelType.USER
    options.customType = "PlainText"
    rtmClient.publish("Tony", "Hello world", options, object : ResultCallback<Void> {
        override fun onSuccess(responseInfo: Void?) {
            log(CALLBACK, "Send message success")
        }

        override fun onFailure(errorInfo: ErrorInfo) {
            log(ERROR, errorInfo.toString())
        }
    })
    ```

    **Swift**
    ```swift
    let message = "Hello Agora!"
    let user = "Tony"

    let publishOption = AgoraRtmPublishOptions()
    publishOption.channelType = .user

    rtm.publish(channelName: user, message: message, option: publishOption, completion: { res, error in
        if error != nil {
            print("\(error?.operation) failed! error reason is \(error?.reason)")
        } else {
            print("success")
        }
    })
    ```

    **Objective-C**
    ```objc
    // Send string message
    NSString* message = @"Hello Agora!";
    NSString* user = @"Tony";

    AgoraRtmPublishOptions* publish_option = [[AgoraRtmPublishOptions alloc] init];
    publish_option.channelType = AgoraRtmChannelTypeUser;

    [rtm publish:user message:message option:publish_option completion:^(AgoraRtmCommonResponse * _Nullable response, AgoraRtmErrorInfo * _Nullable errorInfo) {
        if (errorInfo == nil) {
            NSLog(@"publish success!!");
        } else {
            NSLog(@"publish failed, errorCode %d, reason %@", errorInfo.errorCode, errorInfo.reason);
        }
    }];
    ```

    **C++**
    ```cpp
    // Send string message
    std::string message = "Hello Agora!";
    PublishOptions options;
    options.messageType = RTM_MESSAGE_TYPE_STRING;
    options.customType = "PlainText";
    options.channelType = RTM_CHANNEL_TYPE_USER;

    uint64_t requestId;
    rtmClient->publish("Tony", message.c_str(), message.size(), options, requestId);
    ```

    **JavaScript**
    ```js
    const payload = "Hello Agora!";
    const channelName = "Tony";
    const options = {
        customType: "PlainTxt",
        channelType: "USER",
    };
    try {
        const result = await rtm.publish(channelName, payload, options);
    } catch (status) {
        const { operation, reason, errorCode } = status;
        console.log(`${operation} failed, ErrorCode: ${errorCode}, due to: ${reason}.`);
    }
    ```

    **Flutter**
    ```dart
    final channelName = '"Tony"';
    var payload = 'Hello world';

    try {
        var (status, response) = await rtmClient.publish(
            channelName,
            payload,
            channelType: RtmChannelType.user,
            customType: 'PlainText');

        if (status.error == true ){
        print('${status.operation} failed, errorCode: ${status.errorCode}, due to ${status.reason}');
        } else {
            print('${status.operation} success!');
        }
    } catch (e) {
        print('something went wrong: $e');
    }
    ```

* Binary message

    **Java**
    ```java
    // Send binary message
    byte[] message = new byte[] {1, 2, 3, 4};
    PublishOptions options = new PublishOptions();
    options.setChannelType(RtmChannelType.USER);
    options.setCustomType("ByteArray");
    rtmClient.publish("Tony", message, options, new ResultCallback<Void>() {
        @Override
        public void onSuccess(Void responseInfo) {
            log(CALLBACK, "Send message success");
        }

        @Override
        public void onFailure(ErrorInfo errorInfo) {
            log(ERROR, errorInfo.toString());
        }
    });
    ```

    **Kotlin**
    ```kotlin
    // Send binary message
    val message = byteArrayOf(1, 2, 3, 4)
    val options = PublishOptions()
    options.channelType = RtmChannelType.USER
    options.customType = "ByteArray"
    rtmClient.publish("Tony", message, options, object : ResultCallback<Void> {
        override fun onSuccess(responseInfo: Void?) {
            log(CALLBACK, "Send message success")
        }

        override fun onFailure(errorInfo: ErrorInfo) {
            log(ERROR, errorInfo.toString())
        }
    })
    ```

    **Swift**
    ```swift
    let bytes: [UInt8] = [ /* your raw values */ ]
    let rawMessage = Data(bytes: bytes, count: bytes.count)

    streamChannel.publish(channelName: user, data: rawMessage, option: nil) { response, errorInfo in
        if errorInfo == nil {
            print("publish success!!")
        } else {
            print("publish failed, errorCode \(errorInfo!.errorCode), reason \(errorInfo!.reason)")
        }
    }
    ```

    **C++**
    ```cpp
    // Send binary message
    PublishOptions options;
    options.messageType = RTM_MESSAGE_TYPE_BINARY;
    options.customType = "ByteArray";
    options.channelType = RTM_CHANNEL_TYPE_USER;
    char message[5] = {0x00, 0x01, 0x02, 0x03, 0x04};

    uint64_t requestId;
    rtmClient->publish("Tony", message, 5, options, requestId);
    ```

    **JavaScript**
    ```js
    const message = "Hello Agora!";
    const payload = new TextEncoder().encode(message);
    const channelName = "Tony";
    const options = { customType:"ByteArray", channelType: "USER" }
    try {
        const result = await rtm.publish(channelName, payload, options);
    } catch (status) {
        const { operation, reason, errorCode } = status;
        console.log(`${operation} failed, ErrorCode: ${errorCode}, due to: ${reason}.`);
    }
    ```

    **Flutter**
    ```dart
    final channelName = '"Tony"';
    var payload = Uint8List.fromList([155, 26, 88, 0, 0]);

    try {
        var (status, response) = await rtmClient.publishBinaryMessage(
            channelName,
            payload,
            channelType: RtmChannelType.user,
            customType: 'Uint8List');

        if (status.error == true ){
        print('${status.operation} failed, errorCode: ${status.errorCode}, due to ${status.reason}');
        } else {
            print('${status.operation} success!');
        }
    } catch (e) {
        print('something went wrong: $e');
    }
    ```

For C++, when you call this method, the SDK triggers the `onPublishResult` callback and returns the API call result.

```cpp
// Asynchronous callback
class RtmEventHandler : public IRtmEventHandler {
    void onPublishResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) override {
        if (errorCode != RTM_ERROR_OK) {
            // publish message failed
        } else {
            // publish message success
        }
    }
};
```

:::info
Signaling currently supports only string and binary message formats. To send other types of data such as a JSON objects, or data from third-party data construction tools such as protobuf, serialize the data before sending the message. For information on how to effectively construct the payload data structure and recommended serialization methods, refer to [Message payload structuring](../messaging/message-payload-structuring.md).

:::

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### Message packet size

Signaling SDK imposes 32KB size limits on message payload packets sent in user channels. The message payload packet size includes the message payload itself plus the size of the `customType` field. If the message payload package size exceeds the limit, you receive the following error message.

```js
ErrorInfo {
    errorCode = -11010;
    reason = "Publish too long message.";
    operation = "publishTopicMessage"; // or "publish"
}
```

To avoid sending failure due to excess message payload packet size, check the packet size before sending.

### API reference

- [`publish`](https://docs.agora.io/en/signaling/reference/api)
- [`receive`](https://docs.agora.io/en/signaling/reference/api)
