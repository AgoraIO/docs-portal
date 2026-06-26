---
title: "Channel basics"
description: "Basic concepts of message and stream channels."
---

In Signaling, a channel is an efficient data transfer management mechanism for communicating data from one device to another. A user who subscribes to or joins a channel receives messages or events transmitted in that channel within 100 milliseconds. Agora enables a client to subscribe to or join multiple channels at the same time. Most Signaling SDK APIs, such as those for sending and receiving messages, and encryption, use channels as parameters.

## Channel types

Conceptually, a channel is a conduit that controls the flow of messages. Signaling provides the following channel types:

- **Message channel**

    A message channel uses a communication method similar to the MQTT protocol. It follows the pub/sub (publish-subscriber) model to deliver messages. In message channels, instead of creating a channel in advance, you simply publish messages to a specified channel or subscribe to receive messages from a channel. Due to the flexibility of the model, you can easily implement different topologies such as one-to-one channels, group channels, broadcast channels, and unicast channels. Since the number of subscribers can be larger, this channel type does not guarantee sending delivery receipts from all subscribers after receipt of a message. See [Message channels](message-channel.md) for implementation details.
    
- **User channel** 

    Use this channel type to implement a one-to-one topology. User channels enable you to send peer-to-peer messages to a specified `userId`. To send a message to a user channel, simply set the `channelType` parameter in the `publish` method to ``USER``  and the `channelName` to the `userId` of the recipient. To receive messages sent to your `userId`, you don't need to subscribe; you just implement the ``onMessageEvent`` event listener. User channels support delivery receipts. When a publisher sends a message, the API returns `success` if the receiver is online and receives the message successfully. If the receiver is not online or the reception fails, the method returns `failure` or `timeout`. Although you can use the return value to determine if the recipient is online, best practice is to use the `Presence` functionality for this purpose.

- **Stream channel**

    This is a special type of channel based on the room concept that is similar to the observer pattern. In stream channels, users cannot send messages directly to a channel. You call the `joinTopic` method to register as a publisher of a topic before sending messages. To receive messages, users subscribe to the specified message publisher, identified by the `userId`, in the specified topic. In stream channels, client-side messages support delivery at higher QPS. This channel type is often recommended for use-cases such as Metaverse, parallel driving, and cloud gaming. See [Stream channels](stream-channel.mdx) for implementation details.

The channel types are distinguished in the API by `channelType`. Apart from differences in the message sending and receiving mechanism, the features and use of message channels and stream channels for other features and events such as `Presence`, `Storage`, and `Locks`, is the same. User channels do not support these features as they are simple message pass-through channels.

## Create a channel

For message channels, you do not need to define or create a channel before using it. When you send a message or subscribe to a message channel for the first time, Signaling automatically creates the channel for you.

When using stream channels, although a channel is essentially ready-to-use, you must explicitly call the ``createStreamChannel`` method to create an instance of a ``StreamChannel`` object, before joining the channel.

## Channel usage restrictions

Signaling puts no limits on the number of message and stream channels that may exist at the same time. However, different types of channels have different restrictions on the number of channels a single client may subscribe to or join concurrently, and the QPS for sending and receiving messages. For details, see [API usage restrictions](../../reference/limitations.md).

## Channel naming

A channel name cannot be empty. It must be a string of up to 64 bytes in length, consisting of letters or numbers from the ASCII character set. Signaling uses the app ID as the namespace for the channel. Each channel under the app ID is jointly identified by the channel name and the channel type. If two channels have different channel types or different channel names, Signaling treats them as two separate channels. If two channels have the same channel type and channel name, Signaling treats them as the same channel.

### Legal characters

The supported legal characters are:

- 26 lowercase English letters a-z
- 26 uppercase English letters A-Z
- 10 numbers 0~9
- Space
- `!`, `#`, `$`, `%`, `&`, `(`, `)`, `+`, `,`, `-`, `:`, `;`, `<`, `=`, `>`, `?`, `@`, `[`, `]`, `^`, `_`, `{`, `|`, `}`, `~`, `` ` ``

:::warning
Channel names cannot begin with an underscore.

:::

### Illegal characters

The use of `.`, `*`, `/`, `\`, `\0` and non-printable ASCII characters in channel names is not allowed.

### Naming convention

Although not mandated by the SDK, best practice when naming your channels is to use meaningful prefix characters to indicate the purpose of the channel or the type of messages in the channel so that you present your business logic more clearly. For details, see [Channel naming recommendations](../../reference/channel-naming.md).
