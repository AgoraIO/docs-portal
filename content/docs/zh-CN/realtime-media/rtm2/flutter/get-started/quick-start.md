---
title: 实现收发消息
description: 实现收发消息，用于帮助开发者在对应平台上快速完成 RTM 接入与基础验证。
---

本文将指导你如何利用 RTM Flutter SDK 构建简单的应用程序，内容涵盖了集成和开发的基础知识：开通声网账号、获取 SDK、发送消息、接收消息等。

同时，我们也提供了开源的实时消息示例项目供你参考，你可以前往下载或查看其中的源代码。

## 准备工作

开始构建项目前，你需要完成[开通服务](./enable-service.md)，并检查你的开发环境是否满足[平台支持](../overview/platform-support)中的最低版本要求。

## 构建项目

### 1. 创建项目

根据以下步骤创建并配置项目：

打开 `main.dart` 文件，删除其中所有代码，并将以下代码复制进去，作为项目的模板文件。

    ```dart
    import 'package:agora_rtm/agora_rtm.dart';
    import 'package:flutter/material.dart';
    import 'dart:convert';

    void main() async {
      WidgetsFlutterBinding.ensureInitialized();        // 等待 Widgets 初始化完成。

      // create rtm instance

      // login rtm service

      // subscribe to a channel

      // publish messages

      // unsubscribe frome a channel

      // logout rtm service

    }
   ```

> **信息**
> （仅 iOS）在后续构建和发布 IPA 文件阶段，为避免因符号剥离而引发的问题，你还需要在 Xcode 中导航至 **Target Runner > Build Settings > Strip Style**，并将其设置为 **Non-Global Symbols**。

### 2. 创建并初始化 RTM

调用 RTM SDK 的任何 API 之前，需要先创建一个 `RtmClient` 对象实例。添加以下代码到 `main.dart` 文件中，注意：请将 `your_appId`、`your_userId` 替换成你的 `appId` 和 `userId`.

```dart

void main() async {
  WidgetsFlutterBinding.ensureInitialized();        // 等待 Widgets 初始化完成。

  const userId = 'your_userId';
  const appId = 'your_appId';
  const channelName = 'getting-started';
  late RtmClient rtmClient;

  //create rtm instance
  try {
    // create rtm client
    final (status, client) = await RTM( appId, userId);
    if (status.error == true) {
        print('$ failed due to $, error code: $');
    } else {
        rtmClient = client;
        print('Initialize success!');
    }
  // add events listner

  } catch (e) {
    print('Initialize falid!:$');
  }
}
```

### 3. 添加事件监听

事件监听程序帮助你实现频道中消息、事件到达后的处理逻辑，添加以下代码到你的程序中以显示收到的消息或事件通知：

```dart showLineNumbers
// Paste the following code snippet below "add event listener" comment
rtmClient.addListener(
  // add message event handler
  message: (event) {
    print('recieved a message from channel: $, channel type : $');
    print('message content: $, custome type: $');
  },
  // add link state event handler
  linkState: (event) {
    print('link state changed from $ to $');
    print('reason: $, due to operation $');
  });
```

### 4. 登录服务

你需要执行登录操作才能建立与 RTM 服务器的连接，然后才能调用 SDK 的其他 API。将以下代码添加到程序中：

```dart showLineNumbers
// Paste the following code snippet below "login rtm service" comment
try {
  // login rtm service
  var (status,response) = await rtmClient.login(appId);
  if (status.error == true) {
      print('$ failed due to $, error code: $');
  } else {
      print('login RTM success!');
  }
} catch (e) {
  print('Failed to login: $e');
}

```
> **信息**
> 你需要在登录时传入 Token。在测试阶段，为快速验证功能，我们建议你在创建声网项目时将鉴权模式设置为调试模式，然后在登录时只需传入项目的 App ID。

### 5. 收发消息

调用 `publish` 方法向 Message Channel 发送消息后，RTM 会把该消息分发给该频道的所有订阅者，以下代码演示如何发送字符串类型的消息，将此代码片段添加到程序中：

> **信息**
> 你需要先对消息负载进行字符串序列化，才能调用 `publish` 方法发送消息。

```dart showLineNumbers
// Paste the following code snippet below "Publish a message" comment
// Send a message every second for 100 seconds
for (var i = 0; i < 100; i++) {
  try {
    var (status, response) = await rtmClient.publish(
        channelName,
        'message number : $i',
        channelType: RtmChannelType.message,
        customType: 'PlainText'
        );
    if (status.error == true ){
      print('$ failed, errorCode: $, due to $');
    } else {
      print('$ success! message number:$i');
    }
  } catch (e) {
    print('Failed to publish message: $e');
  }
  await Future.delayed(Duration(seconds: 1));
}
```

调用 `subscribe` 方法订阅此频道以接收此频道中的消息。将以下代码添加到程序中：

```dart showLineNumbers
// Paste the following code snippet below "subscribe to a channel" comment
try {
  // subscribe to 'getting-started' channel
  var (status,response) = await rtmClient.subscribe(channelName);
  if (status.error == true) {
      print('$ failed due to $, error code: $');
  } else {
      print('subscribe channel: $ success!');
  }
} catch (e) {
  print('Failed to subscribe channel: $e');
}

```

如果你不再需要在此频道收发消息，你可以调用 `unsubscribe` 方法取消订阅此频道。

```dart showLineNumbers
// Paste the following code snippet below "unsubscribe frome a channel" comment
try {
  // unsubscribe channel
  var (status,response) = await rtmClient.unsubscribe(channelName);
  if (status.error == true) {
      print('$ failed due to $, error code: $');
  } else {
      print('unsubscribe success!');
  }
} catch (e) {
  print('something went wrong with logout: $e');
}
```

如需了解更多收发消息的信息，查看<a href=>消息</a>。

### 6. 登出服务

当不再需要使用 RTM 服务时，你可以调用 `logout` 方法登出 RTM 系统。将以下代码添加到程序中：

```dart
// Paste the following code snippet below "logout rtm service" comment
try {
  // logout rtm service
  var (status,response) = await rtmClient.logout();
  if (status.error == true) {
      print('$ failed due to $, error code: $');
  } else {
      print('logout RTM success!');
  }
} catch (e) {
  print('something went wrong with logout: $e');
}
```

> **信息**
> 本操作会影响你账单中的 PCU 计费项。

### 7. 组合到一起

经过上述步骤，你程序中的代码应该如下所示：

```dart

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  const userId = 'your_userId';
  const appId = 'your_appId';
  const channelName = 'getting-started';
  late RtmClient rtmClient;

  //create rtm instance
  try {
    // create rtm client
    final (status, client) = await RTM( appId, userId);
    if (status.error == true) {
        print('$ failed due to $, error code: $');
    } else {
        rtmClient = client;
        print('Initialize success!');
    }

    // add events listner
    rtmClient.addListener(
    // add message event handler
    message: (event) {
      print('recieved a message from channel: $, channel type : $');
      print('message content: $, custome type: $');
    },
    // add link state event handler
    linkState: (event) {
      print('link state changed from $ to $');
      print('reason: $, due to operation $');
    });
  } catch (e) {
    print('Initialize falid!:$');
  }

  // login rtm service
  try {
    // login rtm service
    var (status,response) = await rtmClient.login(appId);
    if (status.error == true) {
        print('$ failed due to $, error code: $');
    } else {
        print('login RTM success!');
    }
  } catch (e) {
    print('Failed to login: $e');
  }

  // subscribe to a channel
  try {
    // subscribe to 'getting-started' channel
    var (status,response) = await rtmClient.subscribe(channelName);
    if (status.error == true) {
        print('$ failed due to $, error code: $');
    } else {
        print('subscribe channel: $ success!');
    }
  } catch (e) {
    print('Failed to subscribe channel: $e');
  }

  // publish messages
  // Send a message every second for 100 seconds
  for (var i = 0; i < 100; i++) {
    try {
      var (status, response) = await rtmClient.publish(
          channelName,
          'message number : $i',
          channelType: RtmChannelType.message,
          customType: 'PlainText'
          );
      if (status.error == true ){
        print('$ failed, errorCode: $, due to $');
      } else {
        print('$ success! message number:$i');
      }
    } catch (e) {
      print('Failed to publish message: $e');
    }
    await Future.delayed(Duration(seconds: 1));
  }

  // unsubscribe frome a channel
  try {
    // unsubscribe channel
    var (status,response) = await rtmClient.unsubscribe(channelName);
    if (status.error == true) {
        print('$ failed due to $, error code: $');
    } else {
        print('unsubscribe success!');
    }
  } catch (e) {
    print('something went wrong with logout: $e');
  }

  // logout rtm service
  try {
    // logout rtm service
    var (status,response) = await rtmClient.logout();
    if (status.error == true) {
        print('$ failed due to $, error code: $');
    } else {
        print('logout RTM success!');
    }
  } catch (e) {
    print('something went wrong with logout: $e');
  }
}
```

现在，你可以开始运行你的程序：

1. 保存项目。
2. 将目标设备连接到电脑，或者打开模拟器。
3. 打开终端，在项目路径下执行以下命令在目标设备上运行示例项目：
   ```shell
   flutter run
   ```
   成功运行后，在终端上你将看到类似以下信息：
    ```shell
    flutter: publish success! message number:0
    flutter: publish success! message number:1
    flutter: publish success! message number:2
    flutter: publish success! message number:3
    ```
4. 复制项目，在 IDE 上打开，编辑 `main.dart` 文件，修改 `userId` 保存后按照上述步骤运行第二个进程，观察终端上的输出，你将收到类似以下信息：
   ```shell
   flutter: recieved a message from channel: getting-started, channel type : RtmChannelType.message
   flutter: message content: message number : 0, custome type: PlainText
   flutter: recieved a message from channel: getting-started, channel type : RtmChannelType.message
   flutter: message content: message number : 1, custome type: PlainText
   ```

至此，你已经成功集成并正确使用了 RTM 服务。

## 贯穿始终

相比于介绍如何写出代码，声网更愿意帮助你掌握上述程序编写的过程和逻辑。上述程序依次完成了以下操作，让你可以正确地收发消息：

1. 创建并初始化 RTM 对象。
2. 添加 `linkState`、`message` 事件监听函数。
3. 调用 `login` 登录了 RTM 服务。
4. 调用 `subscribe` 订阅了一个 Message Channel。
5. 调用 `publish` 发送消息。
6. 调用 `unsubscribe` 取消订阅一个 Message Channel。
7. 调用 `logout` 登出 RTM 系统。

## 下一步

现在，你已经学会了如何使用 RTM Flutter SDK 来实现 Message Channel 的收发消息功能。下一步，你可以通过 SDK 的 <a href=>API 参考</a >了解更多功能的使用方法。
