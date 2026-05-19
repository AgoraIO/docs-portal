---
title: 实现收发消息
description: 实现收发消息，用于帮助开发者在对应平台上快速完成 RTM 接入与基础验证。
---

本文将指导你如何利用 RTM HarmonyOS SDK 构建简单的应用程序，内容涵盖了集成和开发的基础知识：开通声网账号、获取 SDK、发送消息、接收消息等。

## 准备工作

开始构建项目前，你需要完成[开通服务](./enable-service.md)，并检查你的开发环境是否满足[平台支持](../overview/platform-support)中的最低版本要求。

## 构建项目

### 1. 获取 SDK

> **信息**
> 如果你同时集成了 2.2.0 及以上版本的 RTM SDK 和 4.3.0 及以上版本的 RTC SDK，请参考 [FAQ](/faq/integration-issues/rtm2-rtc-integration-issue) 处理集成问题。

### 2. 项目配置

根据以下步骤配置你的项目：

1. 在 DevEco Studio 中，创建一个新的 HarmonyOS 应用项目。

2. 将下载的 `.har` 文件导入到你的项目中：
   - 在项目根目录下创建 `libs` 文件夹（如果不存在）
   - 将 `.har` 文件复制到 `libs` 文件夹中
   - 在模块的 `oh-package.json5` 文件中添加依赖：

   ```json
   {
     "dependencies": {
        "@shengwang/rtm-full": "file:./libs/AgoraRtmSDK.har"
     }
   }
   ```

3. 在模块的 `module.json5` 文件中添加网络权限：

   ```json
   {
     "module": {
       "requestPermissions": [
          {
            "name": "ohos.permission.INTERNET"
          },
          {
            "name": "ohos.permission.GET_NETWORK_INFO"
          }
       ]
     }
   }
   ```

4. 同步项目依赖，确保 SDK 正确导入。

### 3. 创建并初始化 RTM

调用 RTM SDK 的任何 API 之前，需要先创建一个 `RtmClient` 对象实例。在你的项目中创建一个 ArkTS 文件（例如 `RtmManager.ets`），添加以下代码作为程序模版。你会发现此程序并不完整，不用紧张，我们在后续步骤中将一步步指导你补充完善代码。

> **信息**
> 你需要在初始化时填入已开通 RTM 服务的项目的 App ID 和 Token。在测试阶段，为快速验证功能，我们建议你在创建声网项目时将鉴权模式设置为调试模式，然后在示例中填入项目的 App ID 即可。

```typescript

// 填入你的 App ID
const APP_ID = '';
// 填入你的 Token（测试阶段可以为空字符串）
const TOKEN = '';

export class RtmManager {
  private rtmClient: RtmClient | null = null;
  private userId: string = '';

  /**
   * 初始化 RTM 客户端
   */
  async initialize(userId: string): Promise<void> {
    try {
      this.userId = userId;
      
      // 创建 RTM 配置
      const config: RtmConfig = {
        appId: APP_ID,
        userId: userId
      };

      // 创建 RTM 客户端实例
      this.rtmClient = new RtmClient(config);
      
      // 添加事件监听（后续步骤中补充）
      
      console.log('RTM client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RTM client:', error);
      if (error instanceof RtmError) {
        throw new Error(`初始化失败: $ (code: $)`);
      } else {
        throw new Error('RTM client initialization failed');
      }
    }
  }

  /**
   * 登录 RTM 服务
   */
  async login(): Promise<void> {
    // 后续步骤中补充
  }

  /**
   * 订阅频道
   */
  async subscribe(channelName: string): Promise<void> {
    // 后续步骤中补充
  }

  /**
   * 取消订阅频道
   */
  async unsubscribe(channelName: string): Promise<void> {
    // 后续步骤中补充
  }

  /**
   * 发送消息
   */
  async publish(channelName: string, message: string): Promise<void> {
    // 后续步骤中补充
  }

  /**
   * 登出 RTM 服务
   */
  async logout(): Promise<void> {
    // 后续步骤中补充
  }

  /**
   * 释放资源
   */
  release(): void {
    if (this.rtmClient) {
      this.rtmClient.release();
      this.rtmClient = null;
    }
  }
}
```
### 4. 添加事件监听

事件监听程序帮助你实现频道中消息、事件到达后的处理逻辑。在 `initialize` 方法中添加事件监听器，以显示收到的消息或事件通知：

```typescript showLineNumbers
// 在 initialize 方法中，创建 RTM 客户端后添加以下代码
// 添加事件监听（替换之前的注释）

// 监听连接状态变化
this.rtmClient.addEventListener('linkState', (event) => {
  console.log('Link state changed:', event);
  console.log(`State: $ -> $`);
  console.log(`Reason: $`);
});

// 监听接收到的消息
this.rtmClient.addEventListener('message', (event) => {
  console.log('Received message:', event);
  console.log(`From: $`);
  console.log(`Channel: $`);
  console.log(`Message: $`);
});

// 监听 Presence 事件（用户加入/离开）
this.rtmClient.addEventListener('presence', (event) => {
  console.log('Presence event:', event);
  console.log(`Event type: $`);
  console.log(`User: $`);
});
```

### 5. 登录服务

你需要执行登录操作才能建立与 RTM 服务器的连接，然后才能调用 SDK 的其他 API。在 `login` 方法中添加以下代码：

```typescript showLineNumbers
// 在 login 方法中添加以下代码
async login(): Promise<void> {
  if (!this.rtmClient) {
    throw new Error('RTM client not initialized');
  }

  try {
    const response = await this.rtmClient.login(TOKEN);
    console.log('Login successful:', response);
  } catch (error) {
    console.error('Login failed:', error);
    if (error instanceof RtmError) {
      throw new Error(`登录失败: $ (code: $)`);
    } else {
      throw new Error('Login failed');
    }
  }
}
```

> **信息**
> 你需要在登录时传入 Token。在测试阶段，为快速验证功能，我们建议你在创建声网项目时将鉴权模式设置为调试模式，然后在登录时传入空字符串即可。

### 6. 收发消息

调用 `publish` 方法向 Message Channel 发送消息后，RTM 会把该消息分发给该频道的所有订阅者。以下代码演示如何发送字符串类型的消息：

> **信息**
> 你需要先对消息负载进行字符串序列化，才能调用 `publish` 方法发送消息。

```typescript showLineNumbers
// 在 publish 方法中添加以下代码
async publish(channelName: string, message: string): Promise<void> {
  if (!this.rtmClient) {
    throw new Error('RTM client not initialized');
  }

  try {
    const options: PublishOptions = {
      channelType: RtmChannelType.MESSAGE,
      customType: ''
    };
    
    const response = await this.rtmClient.publish(channelName, message, options);
    console.log('Message published successfully:', response);
  } catch (error) {
    console.error('Failed to publish message:', error);
    if (error instanceof RtmError) {
      throw new Error(`发送消息失败: $ (code: $)`);
    } else {
      throw new Error('Publish failed');
    }
  }
}
```

调用 `subscribe` 方法订阅此频道以接收此频道中的消息：

```typescript showLineNumbers
// 在 subscribe 方法中添加以下代码
async subscribe(channelName: string): Promise<void> {
  if (!this.rtmClient) {
    throw new Error('RTM client not initialized');
  }

  try {
    const options: SubscribeOptions = {
      withMessage: true,
      withMetadata: false,
      withPresence: true,
      withLock: false
    };
    
    const response = await this.rtmClient.subscribe(channelName, options);
    console.log('Subscribed to channel successfully:', response);
  } catch (error) {
    console.error('Failed to subscribe to channel:', error);
    if (error instanceof RtmError) {
      throw new Error(`订阅失败: $ (code: $)`);
    } else {
      throw new Error('Subscribe failed');
    }
  }
}
```

如果你不再需要在此频道收发消息，你可以调用 `unsubscribe` 方法取消订阅此频道：

```typescript showLineNumbers
// 在 unsubscribe 方法中添加以下代码
async unsubscribe(channelName: string): Promise<void> {
  if (!this.rtmClient) {
    throw new Error('RTM client not initialized');
  }

  try {
    const response = await this.rtmClient.unsubscribe(channelName);
    console.log('Unsubscribed from channel successfully:', response);
  } catch (error) {
    console.error('Failed to unsubscribe from channel:', error);
    if (error instanceof RtmError) {
      throw new Error(`取消订阅失败: $ (code: $)`);
    } else {
      throw new Error('Unsubscribe failed');
    }
  }
}
```

如需了解更多收发消息的信息，查看<a href=>消息</a>。

### 7. 登出服务

当不再需要使用 RTM 服务时，你可以调用 `logout` 方法登出 RTM 系统：

```typescript showLineNumbers
// 在 logout 方法中添加以下代码
async logout(): Promise<void> {
  if (!this.rtmClient) {
    throw new Error('RTM client not initialized');
  }

  try {
    const response = await this.rtmClient.logout();
    console.log('Logout successful:', response);
  } catch (error) {
    console.error('Logout failed:', error);
    if (error instanceof RtmError) {
      throw new Error(`登出失败: $ (code: $)`);
    } else {
      throw new Error('Logout failed');
    }
  }
}
```

> **信息**
> 本操作会影响你账单中的 PCU 计费项。

### 8. 组合到一起

经过上述步骤，你的完整代码应该如下所示：

```typescript

// 填入你的 App ID
const APP_ID = '';
// 填入你的 Token（测试阶段可以为空字符串）
const TOKEN = '';

export class RtmManager {
  private rtmClient: RtmClient | null = null;
  private userId: string = '';

  /**
   * 初始化 RTM 客户端
   */
  async initialize(userId: string): Promise<void> {
    try {
      this.userId = userId;
      
      // 创建 RTM 配置
      const config: RtmConfig = {
        appId: APP_ID,
        userId: userId
      };

      // 创建 RTM 客户端实例
      this.rtmClient = new RtmClient(config);
      
      // 监听连接状态变化
      this.rtmClient.addEventListener('linkState', (event: object) => {
        const linkEvent = event as LinkStateEvent;
        console.log('Link state changed:', linkEvent);
        console.log(`State: $ -> $`);
        console.log(`Reason: $`);
      });

      // 监听接收到的消息
      this.rtmClient.addEventListener('message', (event: object) => {
        const msgEvent = event as MessageEvent;
        console.log('Received message:', msgEvent);
        console.log(`From: $`);
        console.log(`Channel: $`);
        console.log(`Message: $`);
      });

      // 监听 Presence 事件（用户加入/离开）
      this.rtmClient.addEventListener('presence', (event: object) => {
        const presenceEvent = event as PresenceEvent;
        console.log('Presence event:', presenceEvent);
        console.log(`Event type: $`);
        console.log(`User: $`);
      });
      
      console.log('RTM client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RTM client:', error);
      if (error instanceof RtmError) {
        throw new Error(`初始化失败: $ (code: $)`);
      } else {
        throw new Error('RTM client initialization failed');
      }
    }
  }

  /**
   * 登录 RTM 服务
   */
  async login(): Promise<void> {
    if (!this.rtmClient) {
      throw new Error('RTM client not initialized');
    }

    try {
      const response = await this.rtmClient.login(TOKEN);
      console.log('Login successful:', response);
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof RtmError) {
        throw new Error(`登录失败: $ (code: $)`);
      } else {
        throw new Error('Login failed');
      }
    }
  }

  /**
   * 订阅频道
   */
  async subscribe(channelName: string): Promise<void> {
    if (!this.rtmClient) {
      throw new Error('RTM client not initialized');
    }

    try {
      const options: SubscribeOptions = {
        withMessage: true,
        withMetadata: false,
        withPresence: true,
        withLock: false
      };
      
      const response = await this.rtmClient.subscribe(channelName, options);
      console.log('Subscribed to channel successfully:', response);
    } catch (error) {
      console.error('Failed to subscribe to channel:', error);
      if (error instanceof RtmError) {
        throw new Error(`订阅失败: $ (code: $)`);
      } else {
        throw new Error('Subscribe failed');
      }
    }
  }

  /**
   * 取消订阅频道
   */
  async unsubscribe(channelName: string): Promise<void> {
    if (!this.rtmClient) {
      throw new Error('RTM client not initialized');
    }

    try {
      const response = await this.rtmClient.unsubscribe(channelName);
      console.log('Unsubscribed from channel successfully:', response);
    } catch (error) {
      console.error('Failed to unsubscribe from channel:', error);
      if (error instanceof RtmError) {
        throw new Error(`取消订阅失败: $ (code: $)`);
      } else {
        throw new Error('Unsubscribe failed');
      }
    }
  }

  /**
   * 发送消息
   */
  async publish(channelName: string, message: string): Promise<void> {
    if (!this.rtmClient) {
      throw new Error('RTM client not initialized');
    }

    try {
      const options: PublishOptions = {
        channelType: RtmChannelType.MESSAGE,
        customType: ''
      };
      
      const response = await this.rtmClient.publish(channelName, message, options);
      console.log('Message published successfully:', response);
    } catch (error) {
      console.error('Failed to publish message:', error);
      if (error instanceof RtmError) {
        throw new Error(`发送消息失败: $ (code: $)`);
      } else {
        throw new Error('Publish failed');
      }
    }
  }

  /**
   * 登出 RTM 服务
   */
  async logout(): Promise<void> {
    if (!this.rtmClient) {
      throw new Error('RTM client not initialized');
    }

    try {
      const response = await this.rtmClient.logout();
      console.log('Logout successful:', response);
    } catch (error) {
      console.error('Logout failed:', error);
      if (error instanceof RtmError) {
        throw new Error(`登出失败: $ (code: $)`);
      } else {
        throw new Error('Logout failed');
      }
    }
  }

  /**
   * 释放资源
   */
  release(): void {
    if (this.rtmClient) {
      this.rtmClient.release();
      this.rtmClient = null;
    }
  }
}
```

现在，你可以在你的 HarmonyOS 应用中使用这个 `RtmManager` 类。以下是一个简单的页面示例，展示如何在 Index 页面中使用 RTM 功能：

```typescript
// Index.ets

@Entry
@Component
struct Index {
  @State userId: string = '';
  @State channelName: string = '';
  @State message: string = '';
  @State messageHistory: string = '';
  @State isLoggedIn: boolean = false;
  
  private rtmManager: RtmManager = new RtmManager();

  build() {
    Column() {
      // 标题
      Text('RTM 快速开始')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin()

      // 用户 ID 输入
      Row() {
        Text('用户 ID:')
          .width(80)
        TextInput()
          .layoutWeight(1)
          .onChange((value: string) => {
            this.userId = value;
          })
      }
      .width('90%')
      .margin()

      // 登录/登出按钮
      Row() {
        Button(this.isLoggedIn ? '登出' : '登录')
          .width('45%')
          .onClick(() => {
            if (this.isLoggedIn) {
              this.handleLogout();
            } else {
              this.handleLogin();
            }
          })
      }
      .width('90%')
      .margin()

      Divider()
        .margin()

      // 频道名输入
      Row() {
        Text('频道名:')
          .width(80)
        TextInput()
          .layoutWeight(1)
          .onChange((value: string) => {
            this.channelName = value;
          })
      }
      .width('90%')
      .margin()

      // 订阅/取消订阅按钮
      Row() {
        Button('订阅')
          .width('45%')
          .onClick(() => {
            this.handleSubscribe();
          })
          .enabled(this.isLoggedIn)

        Button('取消订阅')
          .width('45%')
          .onClick(() => {
            this.handleUnsubscribe();
          })
          .enabled(this.isLoggedIn)
      }
      .width('90%')
      .justifyContent(FlexAlign.SpaceBetween)
      .margin()

      // 消息输入
      Row() {
        Text('消息:')
          .width(80)
        TextInput()
          .layoutWeight(1)
          .onChange((value: string) => {
            this.message = value;
          })
      }
      .width('90%')
      .margin()

      // 发送消息按钮
      Button('发送消息')
        .width('90%')
        .onClick(() => {
          this.handlePublish();
        })
        .enabled(this.isLoggedIn)
        .margin()

      Divider()
        .margin()

      // 消息历史
      Text('消息历史:')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .alignSelf(ItemAlign.Start)
        .margin()

      Scroll() {
        Text(this.messageHistory)
          .width('100%')
          .padding(10)
      }
      .width('90%')
      .height(200)
      .backgroundColor('#F0F0F0')
      .borderRadius(8)
    }
    .width('100%')
    .height('100%')
    .padding()
  }

  // 登录处理
  async handleLogin() {
    if (!this.userId) {
      this.addMessage('请输入用户 ID');
      return;
    }

    try {
      await this.rtmManager.initialize(this.userId);
      await this.rtmManager.login();
      this.isLoggedIn = true;
      this.addMessage(`用户 $ 登录成功`);
    } catch (error) {
      this.addMessage(`登录失败: $`);
    }
  }

  // 登出处理
  async handleLogout() {
    try {
      await this.rtmManager.logout();
      this.rtmManager.release();
      this.isLoggedIn = false;
      this.addMessage('登出成功');
    } catch (error) {
      this.addMessage(`登出失败: $`);
    }
  }

  // 订阅频道
  async handleSubscribe() {
    if (!this.channelName) {
      this.addMessage('请输入频道名');
      return;
    }

    try {
      await this.rtmManager.subscribe(this.channelName);
      this.addMessage(`订阅频道 $ 成功`);
    } catch (error) {
      this.addMessage(`订阅失败: $`);
    }
  }

  // 取消订阅频道
  async handleUnsubscribe() {
    if (!this.channelName) {
      this.addMessage('请输入频道名');
      return;
    }

    try {
      await this.rtmManager.unsubscribe(this.channelName);
      this.addMessage(`取消订阅频道 $ 成功`);
    } catch (error) {
      this.addMessage(`取消订阅失败: $`);
    }
  }

  // 发送消息
  async handlePublish() {
    if (!this.channelName) {
      this.addMessage('请输入频道名');
      return;
    }

    if (!this.message) {
      this.addMessage('请输入消息内容');
      return;
    }

    try {
      await this.rtmManager.publish(this.channelName, this.message);
      this.addMessage(`发送消息到 $: $`);
    } catch (error) {
      this.addMessage(`发送消息失败: $`);
    }
  }

  // 添加消息到历史记录
  addMessage(msg: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.messageHistory += `[$] $\n`;
  }
}
```

这个示例展示了如何：

1. **创建 RTM 管理器实例**：在组件中创建 `RtmManager` 实例
2. **用户登录**：输入用户 ID，点击登录按钮初始化并登录 RTM
3. **订阅频道**：输入频道名，点击订阅按钮订阅消息频道
4. **发送消息**：输入消息内容，点击发送按钮向频道发送消息
5. **取消订阅**：点击取消订阅按钮退出频道
6. **用户登出**：点击登出按钮断开 RTM 连接

你也可以使用更简单的方式来测试 RTM 功能：

```typescript
// 在你的页面或组件中使用

// 创建 RTM 管理器实例
const rtmManager = new RtmManager();

// 初始化并登录
await rtmManager.initialize('user123');
await rtmManager.login();

// 订阅频道
await rtmManager.subscribe('test-channel');

// 发送消息
await rtmManager.publish('test-channel', 'Hello, RTM!');

// 取消订阅
await rtmManager.unsubscribe('test-channel');

// 登出
await rtmManager.logout();

// 释放资源
rtmManager.release();
```

至此，你已经成功集成并正确使用了 RTM 服务。

## 贯穿始终

相比于介绍如何写出代码，声网更愿意帮助你掌握上述程序编写的过程和逻辑。上述程序依次完成了以下操作，让你可以正确地收发消息：

1. 创建并初始化 RTM 对象。
2. 添加 `linkState`、`message` 和 `presence` 事件监听函数。
3. 调用 `login` 登录了 RTM 服务。
4. 调用 `subscribe` 订阅了一个 Message Channel。
5. 调用 `publish` 发送消息。
6. 调用 `unsubscribe` 取消订阅一个 Message Channel。
7. 调用 `logout` 登出 RTM 系统。

## 下一步

现在，你已经学会了如何使用 RTM HarmonyOS SDK 来实现 Message Channel 的收发消息功能。下一步，你可以通过 SDK 的 <a href=>API 参考</a >了解更多功能的使用方法。
