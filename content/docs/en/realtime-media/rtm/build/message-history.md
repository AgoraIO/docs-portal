---
title: "Message history (Beta)"
description: "Retrieve Signaling messages history."
---

# Message history (Beta)

The Signaling message history feature allows you to store messages when publishing them to a channel. For example, if a user joins a channel midway through a conversation, you can retrieve messages that were published before the user joined. You can configure the message retention period for each project, ranging from 1 day to permanent storage.

When a message is published, it is stored using the channel name and the message timestamp. You can use this information to retrieve historical messages.

:::info
The historical message feature is currently available for User Channels and Message Channels, but not for Stream Channels.

:::

## Prerequisites

Before implementing this feature, ensure that you have:

* Integrated the Signaling SDK in your project, and implemented the framework functionality from the [SDK quickstart](sdk-quickstart.mdx) page.
* Enabled the message history feature by contacting [support@agora.io](mailto:support@agora.io). You can request a storage duration of 1, 7, 30, 90, or 365 days, or opt for permanent storage.

:::info
    Changes to storage duration only affect future messages.

:::

## Implement message history

This section shows how to store and retrieve messages from history.

### Store messages

To store a message on the server, set `setStoreInHistory` to `true` in the `publish()` method. The following example shows the minimum code to store a message published to a message channel:

```java
PublishOptions options = new PublishOptions();
options.setCustomType("custom type");
options.setStoreInHistory(true); 

String channelName = "chatRoom";
String message = "Hello world!";
rtm.publish(channelName, message, options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "send message success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

To store a message in the history of a user channel, use the same parameter:

```java
PublishOptions options = new PublishOptions();
options.setChannelType(RtmChannelType.USER);
options.setCustomType("custom type");
options.setStoreInHistory(true);

String userId = "Tony";
String message = "Hello world!";
rtm.publish(userId, message, options, new ResultCallback<Void>() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "send message success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

### Retrieve messages

The SDK provides the `getMessages()` method to retrieve up to 100 history messages at a time. You can filter messages by setting the `start` and `end` parameters to define a time range. To retrieve only the most recent messages, such as those sent between the last offline time and now, set only the `end` parameter.

The following example retrieves the latest 50 messages sent before a specific time:

```java
GetHistoryMessagesOptions options = new GetHistoryMessagesOptions();
options.setMessageCount(50);
options.setEnd(1688978391800);

String channelName = "chatRoom";
rtm.getHistory().getMessages(channelName, RtmChannelType.MESSAGE, options, new ResultCallback<GetMessagesResult>() {
    @Override
    public void onSuccess(GetMessagesResult result) {
        log(CALLBACK, "get history messages! new start: " + result.getNewStart());
        for (HistoryMessage message : result.getMessageList()) {
            log(INFO, message.toString());
        }
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
```

The `result` includes a `newStart` field, which indicates whether there are unread messages in the history:

- If `newStart` is `0`, all messages have been retrieved.
- If `newStart` is not `0`, use this value as the new `start` parameter in the next `getMessages()` call to continue retrieving messages.

The following use-cases show how to specify the `start` and `end` parameters to retrieve messages in a specific range:

#### Retrieve before a start timestamp

| Parameter | Behavior |
|----------|----------|
| `start`  | Returns messages sent before the specified timestamp. The timestamp itself is excluded. |

```
Timeline:
[Older messages] ------------ start timestamp ------------ [Newer messages]
[             ←-- n messages]
```

#### Retrieve messages up to an end timestamp

| Parameter | Behavior |
|----------|----------|
| `end`    | Returns the n most recent messages sent up to and including the specified timestamp. |

```
Timeline:
[Older messages] ------------ end timestamp ------------ [Newer messages]
                                       [  ←-- n messages]
```

#### Retrieve messages between two timestamps

| Parameter | Behavior |
|----------|----------|
| `start`  | Returns messages sent before this timestamp (excluded). |
| `end`    | Returns messages sent up to and including this timestamp. |

```
Timeline:
[Older messages] ---- end timestamp ------------ start timestamp ---- [Newer messages]
                               [ ←-- n messages]
```