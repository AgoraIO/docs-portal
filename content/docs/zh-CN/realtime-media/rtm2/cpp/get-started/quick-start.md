---
title: 实现收发消息
description: 实现收发消息，用于帮助开发者在对应平台上快速完成 RTM 接入与基础验证。
---

本文将从 Linux 环境视角指导你如何利用 RTM C++ SDK 构建简单的应用程序，内容涵盖了集成和开发的基础知识：开通声网账号、获取 SDK、发送消息、接收消息等。对于 Windows 平台，我们提供了完整的 Visual Studio 工程，开发者可以直接参考工程配置，来运行你的第一个 RTM 程序。

## 准备工作

开始构建项目前，你需要完成[开通服务](./enable-service.md)，并检查你的开发环境是否满足[平台支持](../overview/platform-support)中的最低版本要求。

## 构建项目

### 1. 项目配置

根据以下步骤配置你的项目：

1. 新建一个目录 `RTMProject`，目录中包含以下文件夹：

   ```shell
   RTMProject/
   ├── include
   └── lib
   ```
2. 

   > **注意**
> 如果你同时集成了 2.2.0 及以上版本的 RTM SDK 和 4.3.0 及以上版本的 RTC SDK，请手动删除更低版本的动态库文件。

3. 在 `RTMProject` 目录下新建 `CMakeLists.txt` 和 `build.sh` 文件，以便后续使用 CMake 编译项目。文件内容如下：

   ```txt
   # CMakeLists.txt
   cmake_minimum_required (VERSION 2.8)
   project(RTMQuickStart)
   set(TARGET_NAME rtm_demo)
   set(SOURCES rtm_quick_start.cpp)
   set(HEADERS)
   set(TARGET_BUILD_TYPE "Debug")
   set(CMAKE_CXX_FLAGS "-fPIC -O2 -g -std=c++11 -msse2")
   include_directories($/include)
   link_directories($/lib)
   add_executable($ $ $)
   target_link_libraries($ agora_rtm_sdk pthread)
   ```

   ```shell
   # build.sh
   rm -fr build
   mkdir -p build
   cd build
   cmake ..
   make
   cd ..
   ```

### 2. 创建并初始化 RTM

调用 RTM SDK 的任何 API 之前，需要先创建一个 `IRtmClient` 对象实例，再初始化该实例。在 `RTMProject` 目录下新建 `RTMQuickStart.cpp` 文件，添加以下代码作为程序模版。你会发现此程序并不完整，不用紧张，我们在后续步骤中将一步步指导你补充完善代码。

> **信息**
> 你需要在初始化时填入已开通 RTM 服务的项目的 App ID 和 Token。在测试阶段，为快速验证功能，我们建议你在创建声网项目时将鉴权模式设置为调试模式，然后在示例中填入项目的 App ID 即可。

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <exception>

#include "IAgoraRtmClient.h"

// Pass in your App ID here
const std::string APP_ID = "";

// Terminal color codes for UBUNTU/LINUX
#define RESET   "\033[0m"
#define BLACK   "\033[30m"      /* Black */
#define RED     "\033[31m"      /* Red */
#define GREEN   "\033[32m"      /* Green */
#define YELLOW  "\033[33m"      /* Yellow */
#define BLUE    "\033[34m"      /* Blue */
#define MAGENTA "\033[35m"      /* Magenta */
#define CYAN    "\033[36m"      /* Cyan */
#define WHITE   "\033[37m"      /* White */
#define BOLDBLACK   "\033[1m\033[30m"      /* Bold Black */
#define BOLDRED     "\033[1m\033[31m"      /* Bold Red */
#define BOLDGREEN   "\033[1m\033[32m"      /* Bold Green */
#define BOLDYELLOW  "\033[1m\033[33m"      /* Bold Yellow */
#define BOLDBLUE    "\033[1m\033[34m"      /* Bold Blue */
#define BOLDMAGENTA "\033[1m\033[35m"      /* Bold Magenta */
#define BOLDCYAN    "\033[1m\033[36m"      /* Bold Cyan */
#define BOLDWHITE   "\033[1m\033[37m"      /* Bold White */

using namespace agora::rtm;

class RtmEventHandler : public IRtmEventHandler {
public:
  // Add the event listener

private:
  void cbPrint(const char* fmt, ...) {
    printf("\x1b[32m<< RTM async callback: ");
    va_list args;
    va_start(args, fmt);
    vprintf(fmt, args);
    va_end(args);
    printf(" >>\x1b[0m\n");
  }
};

class RtmDemo {
public:
  RtmDemo()
    : eventHandler_(new RtmEventHandler()),
      rtmClient_(nullptr) 

  void Init() {
    std::cout << YELLOW << "Please enter userID (literal \"null\" or starting"
    << "with space is not allowed, no more than 64 characters!):" << std::endl;

    std::string userID;
    std::getline(std::cin, userID);

    RtmConfig config;
    config.appId = APP_ID.c_str();
    config.userId = userID.c_str();
    config.eventHandler = eventHandler_.get();

    // Create an IRtmClient instance
    int errorCode = 0;
    rtmClient_ = createAgoraRtmClient(config, errorCode);
    if (!rtmClient_ || errorCode != 0) {
      std::cout << RED <<"error creating rtm service!" << std::endl;
      exit(0);
    }
  }

  void start() {
    // Log in the RTM server
  }

  // Log out from the RTM server

  // Subscribe to a channel

  // Unsubscribe from a channel

  // Publish a message

  // Sample codes for the user interface
  void mainMeun() {
    bool quit  = false;
    while (!quit) {
      std::cout << WHITE
                << "1: subscribe channel\n"
                << "2: unsubscribe channel\n"
                << "3: publish message\n"
                << "4: logout" << std::endl;
      std::cout << YELLOW <<"please input your choice" << std::endl;
      std::string input;
      std::getline(std::cin, input);
      int32_t choice = 0;
      try {
        choice = std::stoi(input);
      } catch(...) {
        std::cout < eventHandler_;
  IRtmClient* rtmClient_;
};

int main(int argc, const char * argv[]) {
  RtmClient messaging;
  messaging.login();
  return 0;
}
```

### 3. 添加事件监听

事件监听程序帮助你实现频道中消息、事件到达后的处理逻辑，添加以下代码到你的程序中以显示收到的消息或事件通知：

```cpp showLineNumbers
// Paste the following code snippet below "Add the event listener" comment
void onLoginResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) override {
  cbPrint("onLoginResult, request id: %lld, errorCode: %d", requestId, errorCode);
}

void onLogoutResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) {
  cbPrint("onLogoutResult, request id: %lld, errorCode: %d", requestId, errorCode);
}

void onConnectionStateChanged(const char *channelName, RTM_CONNECTION_STATE state, RTM_CONNECTION_CHANGE_REASON reason) override {
  cbPrint("onConnectionStateChanged, channelName: %s, state: %d, reason: %d", channelName, state, reason);
}

void onLinkStateEvent(const LinkStateEvent& event) override {
  cbPrint("onLinkStateEvent, state: %d -> %d, operation: %d, reason code: %d, reason: %s", event.previousState, event.currentState, event.operation, event.reasonCode, event.reason);
}

void onPublishResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) override {
  cbPrint("onPublishResult request id: %lld result: %d", requestId, errorCode);
}

void onMessageEvent(const MessageEvent &event) override {
  cbPrint("receive message from: %s, message: %s", event.publisher, event.message);
}

void onSubscribeResult(const uint64_t requestId, const char *channelName, RTM_ERROR_CODE errorCode) override {
  cbPrint("onSubscribeResult: channel:%s, request id: %lld result: %d", channelName, requestId, errorCode);
}

void onUnsubscribeResult(const uint64_t requestId, const char *channelName, RTM_ERROR_CODE errorCode) override {
  cbPrint("onUnsubscribeResult: channel:%s, request id: %lld result: %d", channelName, requestId, errorCode);
}
```

### 4. 登录服务

你需要执行登录操作才能建立与 RTM 服务器的连接，然后才能调用 SDK 的其他 API。将以下代码添加到程序中：

```cpp showLineNumbers
// Paste the following code snippet below "Log in the RTM server" comment
uint64_t requestId = 0;
rtmClient_->login(APP_ID.c_str(), requestId);

// Sample codes for the user interface
mainMeun();
std::cout << YELLOW << "quit ? yes/no" << std::endl;
std::string input;
std::getline(std::cin, input);
if (input.compare("yes") == 0) {
  exit(0);
}
```

> **信息**
> 你需要在登录时传入 Token。在测试阶段，为快速验证功能，我们建议你在创建声网项目时将鉴权模式设置为调试模式，然后在登录时只需传入项目的 App ID。

### 5. 收发消息

调用 `publish` 方法向 Message Channel 发送消息后，RTM 会把该消息分发给该频道的所有订阅者，以下代码演示如何发送字符串类型的消息，将此代码片段添加到程序中：

> **信息**
> 你需要先对消息负载进行字符串序列化，才能调用 `publish` 方法发送消息。

```cpp showLineNumbers
// Paste the following code snippet below "Publish a message" comment
void publishMessage(const std::string& channelName, const std::string& message) {
  PublishOptions options;
  options.messageType = RTM_MESSAGE_TYPE_STRING;
  uint64_t requestId;
  rtmClient_->publish(channelName.c_str(), message.c_str(), message.size(), options, requestId);
}
```

调用 `subscribe` 方法订阅此频道以接收此频道中的消息。将以下代码添加到程序中：

```cpp showLineNumbers
// Paste the following code snippet below "Subscribe to a channel" comment
void subscribeChannel(const std::string& channelName) {
  uint64_t requestId = 0;
  rtmClient_->subscribe(channelName.c_str(), SubscribeOptions(), requestId);
}
```

如果你不再需要在此频道收发消息，你可以调用 `unsubscribe` 方法取消订阅此频道。

```cpp showLineNumbers
// Paste the following code snippet below "Unsubscribe from a channel" comment
void unsubscribeChannel(const std::string& channelName) {
  uint64_t requestId = 0;
  rtmClient_->unsubscribe(channelName.c_str(), requestId);
}
```

如需了解更多收发消息的信息，查看<a href=>消息</a>。

### 6. 登出服务

当不再需要使用 RTM 服务时，你可以调用 `logout` 方法登出 RTM 系统。将以下代码添加到程序中：

```cpp
// Paste the following code snippet below "Log out from the RTM server" comment
void logout() {
  uint64_t requestId = 0;
  rtmClient_->logout(requestId);
}
```

> **信息**
> 本操作会影响你账单中的 PCU 计费项。

### 7. 组合到一起

经过上述步骤，你程序中的代码应该如下所示：

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <exception>

#include "IAgoraRtmClient.h"

// Pass in your App ID here
const std::string APP_ID = "";

// Terminal color codes for UBUNTU/LINUX
#define RESET   "\033[0m"
#define BLACK   "\033[30m"      /* Black */
#define RED     "\033[31m"      /* Red */
#define GREEN   "\033[32m"      /* Green */
#define YELLOW  "\033[33m"      /* Yellow */
#define BLUE    "\033[34m"      /* Blue */
#define MAGENTA "\033[35m"      /* Magenta */
#define CYAN    "\033[36m"      /* Cyan */
#define WHITE   "\033[37m"      /* White */
#define BOLDBLACK   "\033[1m\033[30m"      /* Bold Black */
#define BOLDRED     "\033[1m\033[31m"      /* Bold Red */
#define BOLDGREEN   "\033[1m\033[32m"      /* Bold Green */
#define BOLDYELLOW  "\033[1m\033[33m"      /* Bold Yellow */
#define BOLDBLUE    "\033[1m\033[34m"      /* Bold Blue */
#define BOLDMAGENTA "\033[1m\033[35m"      /* Bold Magenta */
#define BOLDCYAN    "\033[1m\033[36m"      /* Bold Cyan */
#define BOLDWHITE   "\033[1m\033[37m"      /* Bold White */

using namespace agora::rtm;

class RtmEventHandler : public IRtmEventHandler {
public:
  // Add the event listener
  void onLoginResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) override {
    cbPrint("onLoginResult, request id: %lld, errorCode: %d", requestId, errorCode);
  }

  void onLogoutResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) {
    cbPrint("onLogoutResult, request id: %lld, errorCode: %d", requestId, errorCode);
  }

  void onConnectionStateChanged(const char *channelName, RTM_CONNECTION_STATE state, RTM_CONNECTION_CHANGE_REASON reason) override {
    cbPrint("onConnectionStateChanged, channelName: %s, state: %d, reason: %d", channelName, state, reason);
  }

  void onLinkStateEvent(const LinkStateEvent& event) override {
    cbPrint("onLinkStateEvent, state: %d -> %d, operation: %d, reason code: %d, reason: %s", event.previousState, event.currentState, event.operation, event.reasonCode, event.reason);
  }

  void onPublishResult(const uint64_t requestId, RTM_ERROR_CODE errorCode) override {
    cbPrint("onPublishResult request id: %lld result: %d", requestId, errorCode);
  }

  void onMessageEvent(const MessageEvent &event) override {
    cbPrint("receive message from: %s, message: %s", event.publisher, event.message);
  }

  void onSubscribeResult(const uint64_t requestId, const char *channelName, RTM_ERROR_CODE errorCode) override {
    cbPrint("onSubscribeResult: channel:%s, request id: %lld result: %d", channelName, requestId, errorCode);
  }

  void onUnsubscribeResult(const uint64_t requestId, const char *channelName, RTM_ERROR_CODE errorCode) override {
    cbPrint("onUnsubscribeResult: channel:%s, request id: %lld result: %d", channelName, requestId, errorCode);
  }

private:
  void cbPrint(const char* fmt, ...) {
    printf("\x1b[32m<< RTM async callback: ");
    va_list args;
    va_start(args, fmt);
    vprintf(fmt, args);
    va_end(args);
    printf(" >>\x1b[0m\n");
  }
};

class RtmDemo {
public:
  RtmDemo()
    : eventHandler_(new RtmEventHandler()),
      rtmClient_(nullptr) 

  void Init() {
    std::cout << YELLOW << "Please enter userID (literal \"null\" or starting"
    << "with space is not allowed, no more than 64 characters!):" << std::endl;

    std::string userID;
    std::getline(std::cin, userID);

    RtmConfig config;
    config.appId = APP_ID.c_str();
    config.userId = userID.c_str();
    config.eventHandler = eventHandler_.get();
    // Create an IRtmClient instance
    int errorCode = 0;
    rtmClient_ = createAgoraRtmClient(config, errorCode);
    if (!rtmClient_ || errorCode != 0) {
      std::cout << RED <<"error creating rtm service!" << std::endl;
      exit(0);
    }
  }

  void start() {
    // Log in the RTM server
    uint64_t requestId = 0;
    rtmClient_->login(APP_ID.c_str(), requestId);

    // Sample codes for the user interface
    mainMeun();

    std::cout << YELLOW << "quit ? yes/no" << std::endl;
    std::string input;
    std::getline(std::cin, input);
    if (input.compare("yes") == 0) {
      exit(0);
    }
  }

  // Log out from the RTM server
  void logout() {
    uint64_t requestId = 0;
    rtmClient_->logout(requestId);
  }

  // Subscribe to a channel
  void subscribeChannel(const std::string& channelName) {
    uint64_t requestId = 0;
    rtmClient_->subscribe(channelName.c_str(), SubscribeOptions(), requestId);
  }

  // Unsubscribe from a channel
  void unsubscribeChannel(const std::string& channelName) {
    uint64_t requestId = 0;
    rtmClient_->unsubscribe(channelName.c_str(), requestId);
  }

  // Publish a message
  void publishMessage(const std::string& channelName, const std::string& message) {
    PublishOptions options;
    options.messageType = RTM_MESSAGE_TYPE_STRING;
    uint64_t requestId;
    rtmClient_->publish(channelName.c_str(), message.c_str(), message.size(), options, requestId);
  }

  // Sample codes for the user interface
  void mainMeun() {
    bool quit  = false;
    while (!quit) {
      std::cout << WHITE
                << "1: subscribe channel\n"
                << "2: unsubscribe channel\n"
                << "3: publish message\n"
                << "4: logout" << std::endl;
      std::cout << YELLOW <<"please input your choice: " << std::endl;
      std::string input;
      std::getline(std::cin, input);
      int32_t choice = 0;
      try {
        choice = std::stoi(input);
      } catch(...) {
        std::cout < eventHandler_;
  IRtmClient* rtmClient_;
};

int main(int argc, const char * argv[]) {
  RtmClient messaging;
  messaging.login();
  return 0;
}
```

现在，你可以开始运行你的程序：

1. 保存项目。
2. 在命令行工具中，运行以下命令编译项目：

   ```shell
   $ sh build.sh
   ```

3. 编译完成后，运行以下命令进入 `build` 目录并运行编译完成的可执行文件：

   ```shell
   $ cd build
   $ ./rtm_demo
   ```

4. 运行项目。成功运行后，你可以在命令行工具中看到消息收发的提示信息。

> **信息**
> 如果提示找不到 `libaosl.so`，需要添加一下动态库的加载路径，例如 `export LD_LIBRARY_PATH=./lib:$LD_LIBRARY_PATH`，其中，`./lib` 为存放RTM SDK `so` 库的路径。

至此，你已经成功集成并正确使用了 RTM 服务。

## 贯穿始终

相比于介绍如何写出代码，声网更愿意帮助你掌握上述程序编写的过程和逻辑。上述程序依次完成了以下操作，让你可以正确地收发消息：

1. 创建并初始化 RTM 对象。
2. 添加 `onLoginResult`、`onLinkStateEvent`、`onPublishResult`、`onMessageEvent` 和 `onSubscribeResult` 事件监听函数。
3. 调用 `login` 登录了 RTM 服务。
4. 调用 `subscribe` 订阅了一个 Message Channel。
5. 调用 `publish` 发送消息。
6. 调用 `unsubscribe` 取消订阅一个 Message Channel。
7. 调用 `logout` 登出 RTM 系统。

## 下一步

现在，你已经学会了如何使用 RTM C++ SDK 来实现 Message Channel 的收发消息功能。下一步，你可以通过 SDK 的 <a href=>API 参考</a >了解更多功能的使用方法。
