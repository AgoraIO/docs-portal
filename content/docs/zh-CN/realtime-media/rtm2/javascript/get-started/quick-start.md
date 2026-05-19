---
title: 实现收发消息
description: 实现收发消息，用于帮助开发者在对应平台上快速完成 RTM 接入与基础验证。
---

本文将指导你如何利用 RTM JavaScript SDK 构建简单的应用程序，内容涵盖了集成和开发的基础知识：开通声网账号、获取 SDK、发送消息、接收消息等。

## 准备工作

开始构建项目前，你需要完成[开通服务](./enable-service.md)，并检查你的浏览器是否满足[平台支持](../overview/platform-support)中的最低版本要求。

## 获取 SDK

你可以通过以下任意一种方式获取最新的 RTM JavaScript SDK。

## 构建项目

### 1. 项目配置

新建一个文件夹存放项目文件，进入文件夹中为你的 App 创建文件并安装其他依赖项。以下为在终端操作的命令行示例：

  ```shell showLineNumbers
  mkdir HelloWorld
  cd HelloWorld
  # Your app is in index.html.
  touch index.html
  ```

### 2. 初始化 RTM

初始化 `rtm` 时，你需要提供如下信息：
- 从控制台获取的 App ID（`appId`）。
- 你自行定义的用户 ID（`userId`），你需要保证其全局唯一性。

```html showLineNumbers
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Text Display App</title>
  <style>
    #container {
      width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    #textDisplay {
      width: 100%;
      height: 800px;
      border: 1px solid #b0b0b0;
      margin-bottom: 20px;
      overflow: auto;
      text-align: left;
      padding: 10px;
      box-sizing: border-box;
    }
    #inputContainer {
      display: flex;
      align-items: center;
    }
    #textInput {
      width: calc(100% - 100px);
      padding: 5px;
      margin-right: 10px;
    }
    #submitButton {
      width: 90px;
      padding: 5px;
    }
  </style>
  <script src="./AgoraRTM-production.js"></script>
</head>
<body>
  <script>
    const  = AgoraRTM;
    // Fill in the App ID of your project.
    const appId = "your_appId";
    // Fill in your user ID.
    const userId = "your_userId";
    // Fill in your channel name.
    let rtm;
    const msChannelName = "Chat_room";
    const buttonClick = () => {
      var input = document.getElementById("textInput");
      publishMessage(input.value);
      input.value = '';
    }
    const setupRTM = async () => {
      // Initialize the RTM client.
      try {
        rtm = new RTM(appId, userId);
      } catch (status) {
        console.log("Error");
        console.log(status);
      }

      // Add the event listener.

      // Log in the RTM server.

      // Subscribe to a channel.

    }
    // Publish a message.
    const showMessage = (user, msg) => {
      // Get text from the text box.
      const inputText = textInput.value;
      const newText = document.createTextNode(user + ": " + msg);
      const newLine = document.createElement("br");
      textDisplay.appendChild(newText);
      textDisplay.appendChild(newLine);
    }
    window.onload = setupRTM;
  </script>
  
    <h1>Hello RTM !</h1>
    
      
    
    
      <input type="text" id="textInput" placeholder="Enter text">
      <button id="submitButton" onclick="buttonClick()"> Send </button>
    
  
</body>
</html>
```

> **信息**
> 你需要在初始化时填入项目的 App ID 和 Token。在测试阶段，为快速验证功能，我们建议你在创建声网项目时将鉴权模式设置为调试模式，然后在初始化时只需填入项目的 App ID。

### 3. 添加事件监听

事件监听程序帮助你实现频道中消息、事件到达后的处理逻辑，添加以下代码到你的程序中以显示收到的消息或事件通知：
```javascript showLineNumbers
// Paste the following code snippet below "Add the event listener" comment
// Message event handler.
rtm.addEventListener("message", event => {
  showMessage(event.publisher, event.message);
});
// Pressence event handler.
rtm.addEventListener("presence", event => {
  if (event.eventType === "SNAPSHOT") {
    showMessage("INFO", "I Join");
  }
  else {
    showMessage("INFO", event.publisher + " is " + event.eventType);
  }
});
// Connection state changed event handler.
rtm.addEventListener("status", event => {
  // The current connection state.
  const currentState = event.state;
  // The reason why the connection state changes.
  const changeReason = event.reason;
  showMessage("INFO", JSON.stringify(event));
});
```

### 4. 登录服务

你需要执行登录操作才能建立与 RTM 服务器的连接，然后才能调用 SDK 的其他 API。将以下代码添加到程序中，并传入你在服务端自行生成的 Token：

```javascript showLineNumbers
// Paste the following code snippet below "Log in the RTM server." comment
try {
  const result = await rtm.login();
  console.log(result);
} catch (status) {
  console.log(status);
}
```

### 5. 收发消息

调用 `publish` 方法向 Message Channel 发送消息后，RTM 会把该消息分发给该频道的所有订阅者，以下代码演示如何发送字符串类型的消息，将此代码片段添加到程序中：

> **信息**
> 你需要先对消息负载进行字符串序列化，才能调用 `publish` 方法发送消息。

```javascript showLineNumbers
// Paste the following code snippet below "Publish a message" comment
const publishMessage = async (message) => {
  const payload = ;
  const publishMessage = JSON.stringify(payload);
  const publishOptions = 
  try {
    const result = await rtm.publish(msChannelName, publishMessage, publishOptions);
    showMessage(userId, publishMessage);
    console.log(result);
  } catch (status) {
    console.log(status);
  }
}
```

调用 `subscribe` 方法订阅此频道以接收此频道中的消息。将以下代码添加到程序中：

```javascript showLineNumbers
// Paste the following code snippet below "Subscribe to a channel." comment
try {
  const result = await rtm.subscribe(msChannelName);
  console.log(result);
} catch (status) {
  console.log(status);
}
```

如需了解更多收发消息的信息，查看<a href=>消息</a>。

### 6. 组合到一起

经过上述步骤，你程序中的代码应该如下所示：

```html showLineNumbers
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Text Display App</title>
  <style>
    #container {
      width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    #textDisplay {
      width: 100%;
      height: 800px;
      border: 1px solid #b0b0b0;
      margin-bottom: 20px;
      overflow: auto;
      text-align: left;
      padding: 10px;
      box-sizing: border-box;
    }
    #inputContainer {
      display: flex;
      align-items: center;
    }
    #textInput {
      width: calc(100% - 100px);
      padding: 5px;
      margin-right: 10px;
    }
    #submitButton {
      width: 90px;
      padding: 5px;
    }
  </style>
  <script src="./AgoraRTM-production.js"></script>
</head>
<body>
  <script>
    const  = AgoraRTM;
    // Fill in the App ID of your project.
    const appId = "your_appId";
    // Fill in your user ID.
    const userId = "your_userId";
    // Fill in your channel name.
    let rtm;
    const msChannelName = "Chat_room";
    const buttonClick = () => {
      var input = document.getElementById("textInput");
      publishMessage(input.value);
      input.value = '';
    }
    const setupRTM = async () => {
      // Initialize the RTM client.
      try {
        rtm = new RTM(appId, userId);
      } catch (status) {
        console.log("Error");
        console.log(status);
      }
      // Add the event listener.
      // Message event handler.
      rtm.addEventListener("message", event => {
        showMessage(event.publisher, event.message);
      });
      // Pressence event handler.
      rtm.addEventListener("presence", event => {
        if (event.eventType === "SNAPSHOT") {
          showMessage("INFO", "I Join");
        }
        else {
          showMessage("INFO", event.publisher + " is " + event.eventType);
        }
      });
      // Connection state changed event handler.
      rtm.addEventListener("status", event => {
        // The current connection state.
        const currentState = event.state;
        // The reason why the connection state changes.
        const changeReason = event.reason;
        showMessage("INFO", JSON.stringify(event));
      });
      // Log in the RTM server.
      try {
        const result = await rtm.login();
        console.log(result);
      } catch (status) {
        console.log(status);
      }
      // Subscribe to a channel.
      try {
        const result = await rtm.subscribe(msChannelName);
        console.log(result);
      } catch (status) {
        console.log(status);
      }
    }
    const publishMessage = async (message) => {
      const payload = ;
      const publishMessage = JSON.stringify(payload);
      const publishOptions = 
      try {
        const result = await rtm.publish(msChannelName, publishMessage, publishOptions);
        showMessage(userId, publishMessage);
        console.log(result);
      } catch (status) {
        console.log(status);
      }
    }
    const showMessage = (user, msg) => {
      // Get text from the text box.
      const inputText = textInput.value;
      const newText = document.createTextNode(user + ": " + msg);
      const newLine = document.createElement("br");
      textDisplay.appendChild(newText);
      textDisplay.appendChild(newLine);
    }
    window.onload = setupRTM;
  </script>
  
    <h1>Hello RTM !</h1>
    
      
    
    
      <input type="text" id="textInput" placeholder="Enter text">
      <button id="submitButton" onclick="buttonClick()"> Send </button>
    
  
</body>
</html>
```

现在，你可以开始运行你的程序：

1. 保存 **index.html**，并在浏览器中运行。我们称此时看到的页面为 A 页面。
2. 复制当前项目，在 **index.html** 的 `userId` 变量中填入一个不同的用户 ID，保存后运行。我们称此时看到的页面为 B 页面。
3. 在 A 页面文本输入框中输入要发送的信息，点击 **Send** 按钮发送，然后在 B 页面中观察是否收到信息。
4. 在 B 页面文本输入框中输入要发送的信息，点击 **Send** 按钮发送，然后在 A 页面中观察是否收到信息。

如果步骤 3 和步骤 4 中都能看到正确的信息，那么你已经成功集成并正确使用了 RTM 服务。

## 贯穿始终

相比于介绍如何写出代码，声网更愿意帮助你掌握上述程序编写的过程和逻辑。上述程序依次完成了以下操作，让你可以正确地收发消息：

1. 设置并初始化 RTM 对象。
2. 添加 `message`、`presence` 和 `status` 事件监听函数。
3. 调用 `login` 登录了 RTM 服务。
4. 调用 `subscribe` 订阅了一个 Message Channel。
5. 调用 `publish` 发送消息。

## 下一步

现在，你已经学会了如何使用 RTM JavaScript SDK 来实现 Message Channel 的收发消息功能。下一步，你可以通过 SDK 的 <a href=>API 参考</a >了解更多功能的使用方法。
