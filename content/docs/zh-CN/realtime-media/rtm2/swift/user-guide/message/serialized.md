---
title: 消息负载序列化
description: 消息负载序列化，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

当你为消息负载构建结构化的格式后，还需要将消息数据进行序列化转换成字符串类型或二进制类型，以满足 RTM 中发送消息的格式要求。你可以自己实现或使用第三方的插件，我们有以下两种推荐做法：

- 使用 Json.Net
- 使用 Protocol Buffers

## 使用 Json.Net

Json.Net 是 .NET 平台上一个强大、灵活、易用和高性能的 JSON 框架，可用于序列化和反序列化 JSON 数据，支持多种数据格式和数据类型。

### 使用自定义类

以下步骤展示了如何使用自定义类把包含问题和答案选项的投票消息序列化为 JSON 格式，并通过 `publish` 方法发布到指定的消息通道中。

1. 定义一个 `PollMessage` 类，该类包含了投票消息的所有属性，包括 `type`（消息类型）、`question`（问题内容）、`answer`（答案选项）和 `sender`（消息发送者）。
2. 使用 `Dictionary<string, string>` 类型的 `answer` 变量定义答案选项，并将其赋值给 `PollMessage` 对象的 `answer` 属性。
3. 使用 `Newtonsoft.Json` 包中的 `JsonConvert.SerializeObject` 方法将 `PollMessage` 对象序列化为 JSON 格式的字符串，并赋值给 `payload` 变量。
4. 使用 `customType` 来标识数据结构是自定义的 `PollMessage` 数据类型。
5. 调用 `PublishAsync` 方法将 payload 字符串发布到指定的频道中。

示例代码如下：

```swift
let message = PollMessage()
// ...

// 序列化对象
let payload = message.serialize() // 自定义类型的序列化

// 发布消息
rtm.publish(channelName: channel, message: payload, option: nil) { response, errorInfo in
    if errorInfo == nil {
        print("publish success!!")
    } else {
        print("publish failed, errorCode \(errorInfo!.errorCode), reason \(errorInfo!.reason)")
    }
}
```

接收到消息时，你需要通过反序列化将字符串消息恢复成原先的自定义类型。示例代码如下：

```swift
extension YourClassName: AgoraRtmDelegate {
    // triggered when received message from remote
    func rtmKit(_ rtmKit: AgoraRtmClientKit, didReceiveMessageEvent event: AgoraRtmMessageEvent) {
        let channel = event.channelName
        let channelType = event.channelType
        
        if channelType == .stream {
            let topic = event.channelTopic // if message from stream channel, user can get topic name
        }

        let message = PollMessage()
        message.deserialize(event.message.stringData)
        let publisher = event.publisher
    }
}
```

### 使用 JSON Object

你也可以直接利用 JSON Object 类型对消息进行序列化。JSON Object 是一种轻量级、简单、易读、跨平台的数据交换格式，具有广泛的应用性。 Newtonsoft.Json.Linq 中包含了对 JSON Object 类型的支持。

```swift
let dictionary: [String: Any] = ["key1": "value1", "key2": "value2"]

// 序列化字典为 JSON 字符串
let jsonString: String
do {
    let jsonData = try JSONSerialization.data(withJSONObject: dictionary, options: [])
    jsonString = String(data: jsonData, encoding: .utf8) ?? ""
} catch {
    print("Error serializing dictionary to JSON: \(error)")
    jsonString = ""
}

// 发布消息
rtm.publish(channelName: channel, message: jsonString, option: nil) { response, errorInfo in
    if errorInfo == nil {
        print("publish success!!")
    } else {
        print("publish failed, errorCode \(errorInfo!.errorCode), reason \(errorInfo!.reason)")
    }
}
```

接收到消息时，你需要定义一个 JObject 对象，对接收到的字符串进行反序列化。示例代码如下：

```swift
class RtmHandler: NSObject, AgoraRtmClientDelegate {
    // triggered when received message from remote
    func rtmKit(_ rtmKit: AgoraRtmClientKit, didReceiveMessageEvent event: AgoraRtmMessageEvent) {
        let channel = event.channelName
        let channelType = event.channelType
        
        if channelType == .stream {
            let topic = event.channelTopic // if message from stream channel, user can get topic name
        }

        let jsonString = event.message.stringData
        if let jsonData = jsonString.data(using: .utf8) {
            do {
                if let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
                    let name = jsonObject["name"] as? String
                    let age = jsonObject["age"] as? Int
                    let publisher = event.publisher        
                }
            } catch {
                print("Error parsing JSON: \(error)")
            }
        }
    }
}
```

## 使用 Protocol Buffers

[Protocol Buffers](https://protobuf.dev/)（Protobuf）是一种轻便高效的序列化数据结构的方式，具有体积小，效率高，兼容性强，支持跨平台等优点，常被用于一些网络传输效率要求较高的场景，如在线游戏、大规模数据分析、物联网等。

以下示例代码显示了如何在 RTM 中利用 Protobuf 定义一个 `Position` 类型的 `message` 消息结构，完成数据的序列化、传输和反序列化。

1. 使用 Protobuf 定义一个 `Position` 类型的 `message` 消息结构。示例代码如下：

```protobuf
syntax = "proto3";
option cc_enable_arenas = true;
package MessageType;

message Position {

    string  type =1;
    Data data = 2;
    repeated string mentionedUsers = 3;
    string sender = 4;
}

message Data {
    Coordinate coordinate = 1;
    Direction direction =2;
}
message Coordinate {
    float x = 1;
    float y = 2;
    float z = 3;
}

message Direction {
    float pitch = 1;
    float roll = 2;
    float yaw =3;
}
```

2. 在程序中引用 `Google.Protobuf` 和定义好的 `MessageType`，把消息序列化成二进制格式后使用 RTM 的 `publish` 发送消息。示例代码如下：

```swift
let rawMessage: Data = position.toByteArray() // 这里需要确保 `toByteArray` 返回 Data 类型
let channel = "your_channel"

// 发布消息
rtm.publish(channelName: channel, data: rawMessage, option: nil) { response, errorInfo in
    if errorInfo == nil {
        print("publish success!!")
    } else {
        print("publish failed, errorCode \(errorInfo!.errorCode), reason \(errorInfo!.reason)")
    }
}
```

3. 当你接收到消息时，需要对消息进行反序列化。示例代码如下：

```swift
class RtmHandler: NSObject, AgoraRtmClientDelegate {
    func rtmKit(_ rtmKit: AgoraRtmClientKit, didReceiveMessageEvent event: AgoraRtmMessageEvent) {
        let channel = event.channelName
        let channelType = event.channelType
        
        if channelType == .stream {
            let topic = event.channelTopic 
        }

        let position = Position() 
        position.parse(data: event.message.rawData)
    }
}
```
