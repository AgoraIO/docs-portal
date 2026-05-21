---
title: 消息负载序列化
description: 消息负载序列化，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

当你为消息负载构建结构化的格式后，还需要将消息数据进行序列化转换成字符串类型或二进制类型，以满足 RTM 中发送消息的格式要求。你可以自己实现或使用第三方的插件，我们有以下两种推荐做法：

- 使用 Json.Net
- 使用 Protocol Buffers

## 使用 Json.Net

Json.Net 是 .NET 平台上一个强大、灵活、易用和高性能的 JSON 框架，可用于序列化和反序列化 JSON 数据，支持多种数据格式和数据类型。

### 安装步骤

1. 在 Unity 中打开 **Package Manager**。
2. 在 **Add package by name** 中输入包名 **com.unity.nuget.newtonsoft-json**，点击确定后安装这个包。
3. 在你的程序中通过 `using Newtonsoft.Json` 语句引用 Json.Net。

安装完成后，你可以使用自定义类或者 JSON Object 序列化消息。

### 使用自定义类

以下步骤展示了如何使用自定义类把包含问题和答案选项的投票消息序列化为 JSON 格式，并通过 `PublishAsync` 方法发布到指定的消息通道中。

1. 定义一个 `PollMessage` 类，该类包含了投票消息的所有属性，包括 `type`（消息类型）、`question`（问题内容）、`answer`（答案选项）和 `sender`（消息发送者）。
2. 使用 `Dictionary<string, string>` 类型的 `answer` 变量定义答案选项，并将其赋值给 `PollMessage` 对象的 `answer` 属性。
3. 使用 `Newtonsoft.Json` 包中的 `JsonConvert.SerializeObject` 方法将 `PollMessage` 对象序列化为 JSON 格式的字符串，并赋值给 `payload` 变量。
4. 使用 `customType` 来标识数据结构是自定义的 `PollMessage` 数据类型。
5. 调用 `PublishAsync` 方法将 payload 字符串发布到指定的频道中。

示例代码如下：

```csharp
using Newtonsoft.Json;
using Agora.Rtm;

// 定义投票消息 PollMessage 类
public class PollMessage
{
    public string type 
    public string question 
    public Dictionary<string, string> answer 
    public string sender 
}

// 定义答案选项
Dictionary<string, string> answer = new Dictionary<string, string>()
{
    ,
    ,
    ,
    
};

// 将定义好的答案选项赋值给 PollMessage 类中的 answer 属性
PollMessage message = new PollMessage()
{
    type = "poll",
    question = "Which is your favorite season？",
    answer = answer,
    sender = "Tony"
};

// 把消息负载序列化为 JSON 格式，复制给 payload
string payload = JsonConvert.SerializeObject(message);

// 把 payload 发送到 msChannelName 频道中
public async void PublishStringMessage()
{
    if (rtmClient != null)
    {
        var options = new PublishOptions()
        {
            customType = "PollMessage";
        };

        var (status,response) = await rtmClient.PublishAsync(msChannelName, payload, options);

        if (status.Error)
        {
            Debug.Log(string.Format(" is failed, ErrorCode: ", status.Operation, status.ErrorCode));
        }
        else
        {
            Debug.Log("Publish Message Success!");
        }
    }
}
```

接收到消息时，你需要通过反序列化将字符串消息恢复成原先的自定义类型。示例代码如下：

```csharp
// 添加消息事件监听
rtmClient.OnMessageEvent += OnMessageEvent;

private void OnMessageEvent(MessageEvent event)
{
    var channelName = event.channelName;
    var channelType = event.channelType;
    var topic = event.channelTopic;
    var publisher = event.publisher;
    var messageType = event.messageType;
    var customType = event.customType;
    var message = event.message;

    if (messageType == RTM_MESSAGE_TYPE.STRING)
    {
        Debug.Log(string.Format("You have recieved a string type message:  from:  in channel:", message, publisher, channelName));
        if (customType == "PollMessage" )
        {
            PollMessage newPoll = new PollMessage();
            // 反序列化消息
            newPoll = JsonConvert.DeserializeObject(message);
            string type = newPoll.type;
            string question = newPoll.question;
            ...
        }
    }
    ...
}
```

### 使用 JSON Object

你也可以直接利用 JSON Object 类型对消息进行序列化。JSON Object 是一种轻量级、简单、易读、跨平台的数据交换格式，具有广泛的应用性。 Newtonsoft.Json.Linq 中包含了对 JSON Object 类型的支持。

```csharp
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Agora.Rtm;

// 将投票消息定义成 JSON Object 类型，即序列化
string pollpayload = @"{
        'type':'Poll',
        'question':'Which is your favorite season？',
        'answer' : {
            'A':'Spring',
            'B':'Summer',
            'C':'Fall',
            'D':'Winter'
            },
        'sender' : 'Tony'
    }";

// 将 JSON Object 类型的消息发送到 msChannelName 频道
public async void PublishStringMessage()
{
    if (rtmClient != null)
    {
        var options = new PublishOptions()
        {
            customType = "JObject"
        };

        var (status,response) = await rtmClient.PublishAsync(msChannelName, payload, options);

        if (status.Error)
        {
            Debug.Log(string.Format(" is failed, ErrorCode ", status.Operation, status.ErrorCode));
        }
        else
        {
            Debug.Log("Publish Message Success!");
        }
    }
}
```

接收到消息时，你需要定义一个 JObject 对象，对接收到的字符串进行反序列化。示例代码如下：

```csharp
// 添加消息事件监听
rtmClient.OnMessageEvent += OnMessageEvent;

private void OnMessageEvent(MessageEvent event)
{
    var channelName = event.channelName;
    var channelType = event.channelType;
    var topic = event.channelTopic;
    var publisher = event.publisher;
    var messageType = event.messageType;
    var customType = event.customType;
    var message = event.message;

    if (messageType == RTM_MESSAGE_TYPE.STRING)
    {
        Debug.Log(string.Format("You have recieved a string type message:  from:  in channel:", message, publisher, channelName));
        if ( customType == "JObject" )
        {
             // 定义 JObject
            JObject newPoll = JObject.Parse(message);
            // 将接收到的 JObject 对象的各属性的值反序列化为字符串
            string type = newPoll["type"].ToString();
            string question = newPoll["question"].ToString();
            ...
        }
    }
    ...
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

2. 在程序中引用 `Google.Protobuf` 和定义好的 `MessageType`，把消息序列化成二进制格式后使用 RTM 的 `PublishAsync` 发送消息。示例代码如下：

```csharp
    using Agora.Rtm;
    using Google.Protobuf;
    using MessageType;
    ...

    // 创建一个 Position 对象
    Position position = new Position()
    {
        Type = "positon",
        Data = new Data()
        {
            Coordinate = new Coordinate()
            {
                X = 10,
                Y = 5,
                Z =100
            },

            Direction = new Direction()
            {
                Pitch = 100,
                Roll = 200,
                Yaw =50
            }
        },
        MentionedUsers =,
        Sender = "Tony"
    };

    // 把 Position 对象转换为二进制格式
    byte[] message = position.ToByteArray();

    // 把二进制格式消息发送到 msChannelName 频道
    public async void PublishStringMessage()
    {
        if (rtmClient != null)
        {
            var options = new PublishOptions()
            {
                customType = "Position"
            };
            var (status,response) = await rtmClient.PublishAsync(msChannelName, message, options);

            if (status.Error)
            {
                Debug.Log(string.Format(" is failed, ErrorCode: ", status.Operation, status.ErrorCode));
            }
            else
            {
                Debug.Log("Publish Message Success!");
            }
        }
    }

    ...
    ```

3. 当你接收到消息时，需要对消息进行反序列化。示例代码如下：

```csharp
    // 添加消息事件监听
    rtmClient.OnMessageEvent += OnMessageEvent;

    private void OnMessageEvent(MessageEvent event)
    {
        var channelName = event.channelName;
        var channelType = event.channelType;
        var topic = event.channelTopic;
        var publisher = event.publisher;
        var messageType = event.messageType;
        var customType = event.customType;
        var message = event.message;

        if (messageType == RTM_MESSAGE_TYPE.BIANRY)
        {
            if (customType == "Position")
            {
                Position position = new Position();
                // 把二进制格式的消息反序列化为 Position 对象
                position = Position.ParseFrom(message.GetData<byte[]>());
                string type = position.type;
                ...
            }
        }
        ...
    }
    ```
