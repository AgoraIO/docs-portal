---
title: 消息负载结构化
description: 消息负载结构化，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

消息负载的结构应该具备易读性和可扩展性，以减少程序的构建和维护成本，以及在未来版本升级时新老版本可以更容易地兼容。由于通过 RTM 发送的消息只能为字符串（String）或二进制（Binary）类型，RTM 无法直接提供可解析、可扩展的消息数据结构。但你可以根据业务需求自行构建结构化消息负载，并使用 `customType` 参数来标识和解析它。

你在业务流程中可能会涉及到以下类型的消息：
- **纯文本消息**
- **文本消息**：包含有图片、文件等附件的 URL。
- **视频文件消息**：包含文本说明、视频地址和缩略图地址等。
- **问卷调查、答题消息**：可能包含预先设置的答案选项。
- **邀请消息**：例如邀请其他用户参加私聊或者群聊。
- **信令消息**：例如发起视频或音频聊天的邀请指令。
- **指令消息**：例如平行驾驶或者 IoT 应用中向设备下发控制指令消息或传感器上传的设备状态消息。
- **状态同步消息**：例如元宇宙或游戏中玩家的位置、视角或当前状态消息。

假设你收到以下三条消息负载：

- `"This is a Message!"`
- ``
- `{ message:  }`

当你收到这些消息负载时，你很难快速判断这是一条带有图片地址的消息或是一条包含位置信息的消息。即便可以扫描所有消息，检查文本中是否包含 `jpg` 字符串或含有 `x,y,z` 字符，这个方法也会随着 App 用户和消息类型的增加而变得困难。

为了解决这类问题，你可以在消息负载结构中引入预定义的字段，通过结构化消息负载增加可解析性和扩展性。例如，在上面的例子中，我们在消息结构中引入 `type` 字段，改动如下：

| 原消息结构                                             | 结构化消息结构                                                   |
| --------------- | -------- |
| `"Hello, This is a Message!"`                          | ``           |
| ` ` | `` |
| `{message: }`               | `{type: "position", coordinate: }`       |

现在你可以根据接收到消息负载中的 `type` 字段来解析消息格式和数据，并对不同消息类型进行不同的处理。你也可以充分利用 `publish` 方法中的 `customType` 字段将你自定义的附加信息随着消息一起发送给接收端。用户接收到 Message Event 后可以通过 `customType` 字段来解析出数据。详见：[消息负载序列化](./serialized.md)。

```java
String message = {
    "type": "image",
    "asset_url": "https://my.app/image.png",
    "thumb_url": "https://my.app/thumbnail/image.png",
    "mentionedUsers": ["Tony","Lily"],
    "sender": "Max"
};

// Send message with customType
PublishOptions options = new PublishOptions();
options.customType = "image";
mRtmClient.publish("channel_name", message, options, new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        log(CALLBACK, "send message success");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        log(ERROR, errorInfo.toString());
    }
});
// When receiving a message, use the custom Type field to parse the message type

new RtmEventListener {
    @Override
    public void onMessageEvent(MessageEvent event) {
        log(INFO, "onMessageEvent");
        if (event.customType == "image") {
            log(INFO, "It is a image message!");
            // precess message
            log(INFO, "message: " + event.message.getData());
        }
    }
}

```

## 推荐消息负载结构

本节列举了一些应用场景中经常用到的可解析、可扩展的消息结构示例，你可以根据自己的实际业务场景进行修改。

### 文本消息

```java
{
    "type": "text",
    "message": "This is a message",
    "mentionedUsers": ["Tony","Lily"],
    "sender": "Max"
}
```

### 多语言消息

```java
{
    "type": "translation",
    "message": {
        "zh": "你好",
        "en": "Hello",
        "jp": "こんにちは"
    },
    "mentionedUsers": ["Tony","Lily"],
    "sender": "Max"
}
```

### 图片附件消息

```java
{
    "type": "attachment",
    "text": "Here is a image below!",
    "attachments": [
        {
            "type": "image",
            "asset_url": "https://bit.ly/2K74TaG",
            "thumb_url": "https://bit.ly/2Uumxti",
            "myCustomField": 123
        }
    ],
    "mentionedUsers": ["Tony","Lily"],
    "sender": "Max"
}
```

### 图片消息

```java
{
    "type": "image",
    "asset_url": "https://my.app/image.png",
    "thumb_url": "https://my.app/thumbnail/image.png",
    "mentionedUsers": ["Tony","Lily"],
    "sender": "Max"
}
```

### 视频消息

```java
{
    "type": "video",
    "asset_url": "https://my.app/video.mp4",
    "thumb_url": "https://my.app/thumbnail/video.png",
    "mentionedUsers": ["Tony","Lily"],
    "sender": "Max"
}
```

### 动作提示消息

```java
{
    "type": "action",
    "event": "正在输入",
    "sender": "Max"
}
```

### 聊天邀请消息

```java
{
    "type": "chatInvite",
    "channel": "this is the channel you are being invited too",
    "message": "Hi Tony, welcome to the team!"
}
```

### 视频呼叫消息

```java
{
    "type": "chatInvite",
    "session": "your_video_session",
    "message": "Hi Tony, welcome to the video chat!",
    "sender": "Max"
}
```

### 问卷消息

```java
{
    "type": "poll",
    "question": "Which option is right?",
    "answers":{
        "A": "Apple",
        "B": "Banana",
        "C": "Blackberry"
    },
    "sender": "Max"
}
```

### 状态同步消息

```java
{
    "type": "position",
    "question": "Which option is right?",
    "data":{
        "coordinate": ,
        "direction": 
    },
    "mentionedUsers": ["Tony","Lily"],
    "sender": "Max"
}
```
