---
title: 迁移指南
description: 迁移指南，用于说明 RTM 在该平台上的产品概览、版本变化或接入边界。
---

自 2023 年 6 月起，声网针对市场及行业需求，先后推出了 RTM v2（以下简称 v2）系列版本。此系列版本在功能、性能、体验上都有创新性提升：

- **功能覆盖**：该版本通过引入 `Channel`、`Message`、`Topic`、`Presence`、`Storage` 和 `Lock` 等功能模块，能覆盖更多业务场景，你可以把更多的精力集中在自己的业务创新上。

- **性能提升**：我们在新版本中重构了后台架构，通过优化网络连接进一步提升性能，提供长时间低延迟、高可靠、大并发、易扩展的实时网络接入能力，让你无需为业务质量担忧。

- **体验优化**：我们重新设计并简化了 API 接口；优化了包括用户指南、API 参考在内的所有文档，提供了更全面的示例程序，支持开发者低成本学习使用 SDK，快速完成集成，提高开发效率。

本文提供 RTM v1 和 v2 的主要区别及相关示例代码，从而帮助用户顺利地从 v1 迁移到 v2。

## 开通服务

开通 v2 和 v1 的步骤相同：

1. 注册并登录声网控制台
2. 创建声网项目
3. 进入功能配置，开通 RTM 服务
4. 获取开发所需参数，例如 App ID

如果你没有声网账号，点击[此处](https://sso.shengwang.cn/cn/v4/signup/with-sms)注册账号。关于如何开通服务和如何创建项目，详见[开通服务](../get-started/enable-service)。

## 集成 SDK

v2 和 v1 的 SDK 包名不变，仅支持 CDN 集成方式。详见[项目配置](../get-started/quick-start#1-项目配置)。

## 初始化实例

相比于 v1，v2 对初始化参数做了很大的调整，增加了很多新特性，例如端侧加密、云代理等，详见 [API 参考](https://doc.shengwang.cn/api-ref/rtm2/unity/toc-configuration/configuration#create)。此外，v2 还对 `trycatch` 编程模式中捕获的错误信息进行了优化：将可能出现的错误进行了分类，并通过 `ErrorInfo` 数据结构回调，以便于你能更快地排查故障。结合[错误排查](../error-codes)文档，你也可以快速找到解决方法。 // TODO 这段描述适用么？

- v1 的示例代码如下：

    ```csharp
    rtmClient = new RtmClient(appId, clientEventHandler);
    ```

- v2 的示例代码如下：

    ```csharp
  RtmConfig config = new RtmConfig();
  config.appId = "your_appId";
  config.userId ="Tony";
  config.presenceTimeout = 30;
  try
  {
      rtmClient = RtmClient.CreateAgoraRtmClient(config);
  }
  catch (RTMException e)
  {
      Debug.Log(string.Format(" is failed, ErrorCode : , due to: ", e.Status.Operation, e.Status.ErrorCode, e.Status.Reason));
  }
    ```

## 登录服务

v2 采用了标准的 Async/Await 模式，支持异步编程。v2 登录服务的方法和 v1 有区别，如下所示：

- v1 的示例代码如下：

    ```csharp
    rtmClient.Login(token, UserName);
    ```

- v2 的示例代码如下：

    ```csharp
    var ( status,response ) = await rtmClient.LoginAsync(token);
    if (status.Error)
    {
      Debug.Log(string.Format(" is failed, ErrorCode: , due to: ", status.Operation, status.ErrorCode, status.Reason));
    }
    else
    {
      Debug.Log("Login Successfully")
    }
    ```

## 事件通知

相比于 v1，v2 重新设计了系统事件通知方式和 API 接口，对事件通知类型进行了更详细的分类和聚合，对事件通知的负载数据结构进行了优化。

v2 的事件通知类型有 7 种，如下所示：

| 事件类型                         | 描述                                                                                               |
|--------------| ---------- |
| `OnMessageEvent`             | 消息事件通知：接收用户所订阅的 Message Channel 及 Topic 中的所有消息事件通知。                                                     |
| `OnPresenceEvent`            | 用户出席与自定义状态变更事件通知（简称 Presence 事件通知）：接收用户所订阅的 Message Channel 及加入的 Stream Channel 中所有的 Presence 事件通知。                                  |
| `OnTopicEvent`               | Topic 变更事件通知：接收用户所加入的 Stream Channel 中所有 Topic 变更事件通知。                                                   |
| `OnStorageEvent`             | 频道属性和用户属性事件通知：接收用户所订阅的 Message Channel 及加入的 Stream Channel 中所有的 Channel Metadata 事件通知，及订阅用户的 User Metadata 事件通知。  |
| `OnLockEvent`                | 锁变更事件通知：接收用户所订阅的 Message Channel 及加入的 Stream Channel 中所有的 Lock 事件通知。                                      |
| `OnConnectionStateChanged`    | 网络连接状态变更事件通知：接收客户端网络连接状态变更的事件通知。                                                                     |
| `OnTokenPrivilegeWillExpire` | 接收客户端 Token 将要过期的事件通知。                                                                            |

关于事件通知的更多信息及负载数据结构见[事件监听](https://doc.shengwang.cn/api-ref/rtm2/unity/toc-configuration/configuration#事件监听)。

以监听 `OnMessageEvent` 事件通知为例，示例代码如下：

- v1：
// TODO 示例代码是 C++ 的，需要开发同学帮忙修改

    ```csharp
    class ChannelEventHandler: public agora::rtm::IChannelEventHandler {
        public:
        ChannelEventHandler(string channel) {
            channel_ = channel;
        }
        ~ChannelEventHandler() {}
        virtual void onMessageReceived(const char* userId,
                            const agora::rtm::IMessage *msg) override {
            cout << "receive message from channel: "<< channel_.c_str()
                << " user: " << userId << " message: " << msg->getText()
                << endl;
        }
    };
    ```

- v2：

    ```csharp
    rtmClient.OnMessageEvent += ( MessageEvent event ) =>
    {
        var channelName = event.channelName;
        var channelType = event.channelType;
        var topic = event.channelTopic;
        var publisher = event.publiser;
        var messageType = event.messageType;
        var message = event.message;
        var customType = event.customType;
        Debug.Log(string.Format("Received Message  from userId: at channel: with channel type of . ", message, publisher, channelName, channelType));
        if (message != null)
        {
            // your logic
        }
    };
    ```

从上面的示例代码可以看出以下显著区别：
// TODO 区别描述是 JavaScript 的，麻烦开发同学帮忙修改下
- v1 的消息事件通知绑定在具体的 `channel` 实例上，用户需要先调用 `createChannel()` 方法创建 `channel` 实例，然后才能调用 `channel.on()` 方法绑定事件通知处理程序，并且多个频道要实现绑定多次。而 v2 的消息事件通知绑定在客户端实例上，是全局设置，调用 `addEventListener()` 方法注册回调程序，只需要绑定一次，就可以监听所有订阅的频道或 Topic。

- v1 的消息事件通知负载数据结构包含的信息相对较少，而 v2 的消息事件通知负载数据结构包含了更多的信息，可以帮助你更好地实现自己的业务。

## 频道消息

在 1.x 中，发送频道消息的步骤如下：

1. 创建一个频道实例

2. 加入频道

3. 发送频道消息

这种设计会有个弊端，你无法实现发送消息而不收到消息。因为发送消息和接收消息没有解耦。v2 采用了基于 Pub/Sub 的新设计，将频道消息的发送和接收解耦：你无需加入频道即可向指定频道发送消息，你只需订阅指定频道即可接收该频道中的消息，两种操作互不影响。

- v1 的示例代码如下：
// TODO 示例代码是 JavaScript 的，需要开发同学帮忙修改
    ```csharp
    let channel = rtm.createChannel("demoChannel");
    await channel.join();
    let payload = "Hello World!";
    await channel.sendMessage().then(() => {
        console.log("Channel message:" + payload + " from " + channel.channelId);
    }
    ```

- v2 的示例代码如下：

    ```csharp
    // 发送频道消息
    var message = "Hello World";
    var channelName = "my_channel";
    var options = new PublishOptions();
    options.customType = "PlainText";

    var (status,response) = await rtmClient.PublishAsync(channelName, message, options);
    if (status.Error)
    {
        Debug.Log(string.Format(" is failed, ErrorCode: , due to: ", status.Operation, status.ErrorCode, status.Reason));
    }
    else
    {
        Debug.Log("Publish Message Success!");
    }

    // 订阅频道
    var options = new SubscribeOptions();
    options.withMessage = true;
    options.withPresence = true;
    var (status,response) = await rtmClient.SubscribeAsync("Chat_room", options);
    if (status.Error)
    {
        Debug.Log(string.Format(" is failed, ErrorCode:, due to: ", status.Operation, status.ErrorCode, status.Reason));
    }
    else
    {
        Debug.Log(string.Format("Subscribe channel success! at Channel:", response.ChannelName));
    }
    ```

## 点对点消息

v1 版本中的点对点消息 API 用于向指定的用户发送消息，例如，你如果向用户 ID 为 `Tony` 的用户发送消息，你可以按照如下方式实现：

```csharp
// v1
string msg = peerMessageBox.text;
string peer = peerUserBox.text;

string displayMsg = string.Format("->: ", UserName, peer, msg);
messageDisplay.AddTextToDisplay(displayMsg, Message.MessageType.PlayerMessage);

rtmClient.SendMessageToPeer(
    peerId: peer,
    message: rtmClient.CreateMessage(msg),
    options: _MessageOptions
);

peerMessageBox.text = "";
```

v1 设计这种接口的原因是为了满足一种端对端消息传输的场景需求，即：用户 A 只想给指定的用户 B 发送消息，用户 B 只想收到这条消息而不想关注其他事件。v1 的频道机制是一种基于 Room 模式的结构设计，这种设计无法实现发送消息和接收消息的解耦，所以也就无法满足前面这种场景的需求。

v2 重新设计了频道消息的分发模式，即采用了 Pub/Sub 模式，实现了发送消息和接收消息的解耦。在此基础上，点对点消息就可以统一使用频道消息来实现，实现思路如下：

1. 每个用户在初始化后订阅一个以 `inbox_` + `UserID` 为频道名的私人频道，下文称之为收件箱。这个频道只有自己能订阅，别人不能订阅。

2. 当你需要向某用户发送点对点消息时，你只需向这个用户的收件箱发送消息即可。

示例代码如下：

// TODO 示例代码是 JavaScript 的，需要开发同学帮忙修改
```csharp
// v2
// 1. 订阅自己的收件箱
const result = await rtm.subscribe("inbox_Tony");
// 消息内容
const payload = {
    type: "PrivateMessage",
    message: "This is a message",
    sender: "Tony"
};
try {
    // 2. 向用户 ID 为 Lily 的用户发送私密消息，这条消息只有 Lily 能收到
    const result = await rtm.publish("inbox_Lily", payload);
    console.log(result);
} catch (status) {
    console.log(status);
}
```

> **信息**
> 如需收到消息，你还需实现 `` 事件监听函数。

## 图片与文件消息

出于对用户数据和隐私保护合规性、成本优化的考虑，RTM 自 1.5.0 版本起不再直接支持传输图片和文件消息，相关的 API 也已经下架。你可以结合 RTM 和第三方对象存储服务（例如 Amazon S3 或者阿里云 OSS）来构建图片与文件消息功能，在获得极佳的实时消息传输体验的同时，还能实现更灵活的技术构建方案，例如，实现 CDN 静态资源加速、图片文本审核等业务需求。以下示例代码向你展示如何使用 v2 和 Amazon S3 对象存储服务实现图片和文件消息的构建和发送：

// TODO 示例代码是 JavaScript 的，需要开发同学帮忙修改
```csharp
const sendFileMessageAsync = async () => {
    try {
          // 使用 document-picker 组件选取设备上的需要上传的文件
          const result = await DocumentPicker.getDocumentAsync({
            // 可以选择任何类型的文件
            type: '*/*',
          });

      if ( result.canceled === false) {
          const file= result.assets[0].file;
          if(file) {
              const uploadParams = {
                    // 填写你在 Amazon S3 上的 bucket 名称
                    Bucket: 'your-awsbucket',
                    // 文件在 Amazon S3 上的键
                    Key: file.name,
                    Body: file,
                    ContentType: file.type,
                    };
              // 上传文件到 S3 上
              s3.upload(uploadParams, (err, data) => {
                if (err) {
                  console.error('Error uploading file:', err);
                } else {
                  console.log('File uploaded successfully. S3 URL:', data.Location);
                  // 文件上传成功后，自定义 RTM 文件消息负载结构
                  const imageMessagePayload ={
                        // 文件类型，接收方可以根据此字段解析消息包结构
                        type:'File',
                        // 你在 Amazon S3 上的 bucket 名称，接收方需要此字段来下载文件
                        bucket:uploadParams.Bucket,
                        // 文件在 Amazon S3 存储的 Key，接收方需要此字段来下载文件
                        key:uploadParams.Key,
                        // 文件类型
                        contentType:uploadParams.ContentType,
                        // 文件 URL 地址
                        url:data.Location,
                        // 发送方的用户 ID
                        sender:userId
                        };
                  // 使用 RTM v2 发送文件消息负载
                  rtm.publish(channelName,JSON.stringify(imageMessagePayload),);
                  }
                });
          }
      } else {
        console.log('Document pick cancelled');
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
}
```

> **信息**
> 使用 Amazon S3 实现静态文件存储时，你需要进入 Amazon S3 控制台，然后设置正确的用户权限和访问策略。详见[访问控制最佳实践](https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/userguide/access-control-best-practices.html)。

## 用户出席与自定义状态

在 v1 中，你可以订阅或查询多个用户的在线状态、查询频道人数或频道在线成员列表等。v2 不仅保留了这些能力，还在 v1 的基础上进行了升级和扩展，新设计了 Presence 模块。Presence 模块提供监控用户上线、下线及用户临时状态变更的能力，你可以实时获取以下信息：

- 用户加入或离开指定频道
- 自定义临时用户状态及其变更
- 查询指定用户加入或订阅了哪些频道
- 查询指定频道有哪些用户加入及其用户临时状态数据

你可以调用 `WhoNowAsync` 方法，实时查询指定频道的在线用户数量、在线用户列表及在线用户的临时状态等信息。

```csharp
// v2
var options = new PresenceOptions();
options.withState = true;

var (status,response) = await rtmClient.GetPresence().WhoNowAsync("Chat_room", RTM_CHANNEL_TYPE.MESSAGE, options);
if (result.Status.Error)
{
    Debug.Log(string.Format(" is failed, ErrorCode: , due to: ", status.Operation, status.ErrorCode, status.Reason));
}
else
{
    Debug.Log(string.Format("You have got  users information ", response.TotalOccupancy));
    if (response.NextPage != null)
    {
        Debug.Log("you have the next page information waiting for read!");
    }
}
```

你可以调用 `WhereNowAsync` 方法，实时获取指定用户所在频道的列表。

```csharp
// v2
var (status,respones) = await rtmClient.GetPresence().WhereNowAsync("Tony");
if (status.Error)
{
    Debug.Log(string.Format(" is failed, ErrorCode: , due to: ", status.Operation, status.ErrorCode, status.Reason));
}
else
{
    Debug.Log(string.Format("User Tony is now in  channels ", response.Channels.Length));
    if (response.Channels.Length > 0)
    {
        for (int i = 0; i < response.Channels.Length; i++)
        {
            var channelInfo = response.Channels[i];
            string infor = string.Format("Tony is in channelName:, channelType:", channelInfo.channelName, channelInfo.channelType);
            Debug.Log(infor);
        }
    }
}
```

为满足业务场景对用户状态的设置需求，v2 提供了设置临时用户状态的能力，你可以通过 `SetStateAsync` 方法自定义临时用户状态。用户可以为自己添加分数、游戏状态、位置、心情、连麦状态等自定义状态。

```csharp
// v2
var stateItems = new StateItem[1];
stateItems[0] = new StateItem("state", "Online");
var (status,response) = await rtmClient.GetPresence().SetStateAsync(channelName, RTM_CHANNEL_TYPE.MESSAGE, stateItems);
if (status.Error)
{
    Debug.Log(string.Format(" is failed, ErrorCode: , due to: ", status.Operation, status.ErrorCode, status.Reason));
}
else
{
    Debug.Log("Set State Success!");
}
```

你也可以随时通过 `GetStateAsync` 方法获取用户的在线状态，或者通过 `RemoveStateAsync` 方法删除用户的状态。用户临时状态变更后，RTM 服务器会触发 `REMOTE_STATE_CHANGED` 类型的 `OnPresenceEvent` 事件通知。具体用法见[临时用户状态
](../user-guide/presence/temporary-user-state)。

在 v2 中，实时监听频道中用户加入、离开、超时掉线或临时状态变更通知会更加方便，你只需实现如下步骤：

1. 实现 Presence 事件监听程序

2. 加入频道时，开启 `withPresence` 开关

// TODO 示例代码是 JavaScript 的，需要开发同学帮忙修改
```csharp
// v2
// 1. 实现 Presence 事件监听程序
rtm.addEventListener("presence", event => {
    const action = event.eventType;
    const channelType = event.channelType;
    const channelName = event.channelName;
    const publisher = event.publisher;
    const states = event.stateChanged;
    const interval = event.interval;
    const snapshot = event.snapshot;
    // 你的实现代码
});
// 2. 订阅频道时，开启 withPresence 开关
const options =;
try {
    const result = await rtm.subscribe("chat_room", options);
    console.log(result);
} catch (status) {
    console.log(status);
}
```

v2 对实时通知进行了全新的设计，在频道中采取两种模式将 Presence 事件通知到订阅用户：**实时通知模式 (Announce)** 和**定时通知模式 (Interval)**。你可以在控制台的项目设置中通过**实时通知最大人数**大小来决定两种模式相互切换的条件。其中，定时通知模式可防止频道内在线用户过多而导致的事件嘈杂，详见[事件通知模式](../user-guide/presence/event#事件通知模式)。

## 用户属性与频道属性

基于 v1 的用户属性和频道属性功能，v2 新增了版本控制和锁控制等能力，并优化了 API 接口形式，让功能的使用更加简单。v2 中把用户属性和频道属性挂载在 Storage 模块下，以设置频道属性为例，示例代码如下：

```csharp
// v2
var metadata = new RtmMetadata();
metadata.majorRevision = 174298270;
var apple = new MetadataItem()
            {
                key = "Apple",
                value = "100",
                revision = 174298200,
            };
var banana = new MetadataItem()
            {
                key = "Banana",
                value = "200",
                revision = 174298100,
            };
metadata.metadataItems = new MetadataItem[] ;
metadata.metadataItemsSize = 2;
var metadataOptions = new MetadataOptions()
            {
                recordUserId = true,
                recordTs = true
            };
var lockName = "lockName";

var (status,respones) = await rtmClient.GetStorage().SetChannelMetadataAsync("channel_name", RTM_CHANNEL_TYPE.MESSAGE, metadata, metadataOptions, lockName);
if (status.Error)
{
    Debug.Log(string.Format(" is failed, ErrorCode: , due to: ", status.Operation, status.ErrorCode, status.Reason));
}
else
{
    Debug.Log(string.Format("Set Channel : metadata success! Channel Type is :! ", response.ChannelName, response.ChannelType));
}
```

如何获取、更新、删除频道属性，如何使用 CAS 控制、锁控制等可以参考[频道属性](../user-guide/storage/channel-metadata)。用户属性的使用与频道属性是类似的，详见[用户属性](../user-guide/storage/user-metadata)。

v2 通过 `OnStorageEvent` 类型的事件通知将频道属性和用户属性分发给用户，监听 `OnStorageEvent` 事件通知的步骤如下：

1. 实现 Storage 事件监听程序

2. 加入频道时，开启 `withMetadata` 开关

// TODO 示例代码是 JavaScript 的，需要开发同学帮忙修改
```csharp
// v2
// 1. 实现 Storage 事件监听程序
rtm.addEventListener("storage", event => {
    const channelType = event.channelType;
    const channelName = event.channelName;
    const publisher = event.publisher;
    const storageType = event.storageType;
    const action = event.eventType;
    const data = event.data;
    // 你的实现代码
});
//  2. 加入频道时，开启 withMetadata 开关
const options =;
try {
    const result = await rtm.subscribe("chat_room", options);
    console.log(result);
} catch (status) {
    console.log(status);
}
```

## 访问区域限定

RTM 支持限定访问区域功能，以适应不同国家或地区的法律法规。开启限定访问区域功能后，不论用户在哪个区域使用你的 App，SDK 都只会访问指定区域的声网服务器。v1 实现访问区域限定的代码如下：

// TODO 示例代码是 JavaScript 的，需要开发同学帮忙修改
```csharp
AgoraRTM.setArea()
```

v2 同样支持限定访问区域功能，且用法完全一致。

## 其他新特性

除上述版本之间的功能差异之外，v2 还额外增加了很多被广泛验证和使用的新功能，你可以根据项目的需要选择和使用，相信革新版本的 v2 一定可以帮助你快速接入实时互动领域。v2 所具备的功能特性见[特性列表](./feature-list.md)。
