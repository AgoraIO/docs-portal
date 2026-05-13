---
title: 监听智能体事件
description: 与对话式智能体进行实时互动时，你可能需要监听智能体相关事件来实现更丰富的功能。本文介绍如何在你的 App 中监听智能体相关事件。
---

# 监听智能体事件

与对话式智能体进行实时互动时，你可能需要监听智能体相关事件来实现更丰富的功能。本文介绍如何在你的 App 中监听智能体相关事件。

## 技术原理

声网提供一套灵活可扩展、标准化的对话式 AI 引擎客户端组件（以下简称组件）。该组件支持 iOS、Android、Web 平台，封装了多个场景化 API，你只需要调用这些 API 即可结合声网[实时互动 (RTC) SDK](https://doc.shengwang.cn/doc/rtc/homepage) 和[实时消息 (RTM) SDK](https://doc.shengwang.cn/doc/rtm2/homepage) 的能力实现以下功能：
- [打断智能体](./interrupt-agent.md)
- [实时字幕](./realtime-sub.md)
- [监听智能体相关事件](./listen-agent-events.md)
- [设置最佳音频参数](../best-practice/audio-settings.md) （仅支持 Android 和 iOS）
- [发送图片消息](./send-multimodal-message.md)

组件提供一系列回调，支持监听不同的智能体相关事件和信息：

- `onAgentStateChanged`：通过接收 RTM `presence` 事件，监听智能体状态变化（静默/聆听/思考/说话）。可用于更新智能体 UI 或追踪对话流程。
- `onAgentInterrupted`：通过接收 RTM `message` 事件，监听智能体打断事件。
- `onAgentMetrics`：通过接收 RTM `message` 事件，监听智能体性能指标，包括 LLM 推理延迟、TTS 合成延迟等。可用于监控系统性能。
- `onAgentError`：通过接收 RTM `message` 事件，监听智能体错误事件，例如智能体某模块（例如 LLM、TTS 等）发生错误。可用于错误监控、日志记录和实现优雅降级策略。

## 前提条件

开始前，请确保完成以下准备工作：

- 已集成 RTC v4.5.1 及以上版本 SDK，且在 App 中实现了基本的实时音视频功能、获取了相关设备的使用权限。请参考[实现音视频互动](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start)。
- 已在[控制台](https://console.shengwang.cn/)为项目启用 RTM 服务，并在 App 中实现了基本的实时消息功能。请参考[实现收发消息](https://doc.shengwang.cn/doc/rtm2/javascript/get-started/quick-start)。
- 已参考[实现对话式智能体](../get-started/quick-start.md)实现与智能体对话的基本逻辑。
- 确保 RTC 可用、RTM 已登录，且 RTC 和 RTM 实例的生命周期大于组件的生命周期。组件内部不负责维护 RTC，RTM 的初始化、生命周期以及鉴权/登录状态的逻辑。

## 实现步骤

### 集成组件

#### Android

将 `convoaiApi` 文件夹拷贝到你的项目中，并在后续调用组件 API 前引入组件。你可以前往[组件结构](#组件结构)了解各个文件作用。

- [convoaiApi](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/Android/scenes/convoai/src/main/java/io/agora/scene/convoai/convoaiApi)

#### iOS

将 `ConversationalAIAPI` 文件夹拷贝到你的项目中，并在后续调用组件 API 前引入组件。你可以前往[组件结构](#组件结构)了解各个文件作用。

- [ConversationalAIAPI](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/iOS/Scenes/ConvoAI/ConvoAI/ConvoAI/Classes/ConversationalAIAPI)

#### Web

将 `conversational-ai-api` 文件拷贝到你自己的项目中，并在后续调用组件 API 前引入组件。你可以前往[组件结构](#组件结构)了解各个文件作用。

- [conversational-ai-api](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/Web/Scenes/VoiceAgent/src/conversational-ai-api)

### 初始化组件

为 RTC 和 RTM 实例创建配置对象，之后创建组件实例：

#### Android

```java
// 为 RTC 和 RTM 实例创建配置对象
val config = ConversationalAIAPIConfig(
    rtcEngine = rtcEngineInstance,
    rtmClient = rtmClientInstance,
    enableLog = true
)
// 创建组件实例
val api = ConversationalAIAPIImpl(config)
```

#### iOS

```swift
// 为 RTC 和 RTM 实例创建配置对象
let config = ConversationalAIAPIConfig(
    rtcEngine: rtcEngine,
    rtmEngine: rtmEngine,
    enableLog: true
)
/// 创建组件实例
convoAIAPI = ConversationalAIAPIImpl(config: config)
```

#### Web

```typescript
// 为 RTC 和 RTM 实例创建配置对象
ConversationalAIAPI.init({
    rtcEngine,
    rtmEngine,
    })

// 获取 API 实例（单例）
const conversationalAIAPI = ConversationalAIAPI.getInstance()
```

### 注册回调

#### Android

调用 `addHandler` 方法，注册并实现智能体相关事件回调：

```kotlin
// 注册回调
api.addHandler(object : IConversationalAIAPIEventHandler {
    // 监听智能体状态变化
    override fun onAgentStateChanged(agentUserId: String, event: StateChangeEvent) {
        when (event.state) {
            AgentState.SILENT -> {
                updateAgentStatus("等待中...")
            }
            AgentState.LISTENING -> {
                updateAgentStatus("正在听...")
            }
            AgentState.THINKING -> {
                updateAgentStatus("思考中...")
            }
            AgentState.SPEAKING -> {
                updateAgentStatus("说话中...")
            }
            AgentState.UNKNOWN -> {
                Log.w("AgentState", "Unknown agent state: $event")
            }
        }
    }
    // 监听智能体打断事件
    override fun onAgentInterrupted(agentUserId: String, event: InterruptEvent) {
        // 智能体被打断，可以更新 UI 或记录日志
        Log.d("AgentInterrupt", "Agent $agentUserId interrupted at turn ${event.turnId}")
        // 可以在这里更新 UI，比如显示"对话已中断"
        showInterruptNotification()
    }
    // 监听智能体性能指标，用于监控和优化
    override fun onAgentMetrics(agentUserId: String, metric: Metric) {
        when (metric.type) {
            ModuleType.LLM -> {
                Log.d("Metrics", "LLM latency: ${metric.value}ms")
                // 可以记录 LLM 响应时间用于性能分析
            }
            ModuleType.TTS -> {
                Log.d("Metrics", "TTS latency: ${metric.value}ms")
                // 可以记录 TTS 合成时间
            }
            else -> {
                Log.d("Metrics", "${metric.type}: ${metric.name} = ${metric.value}")
            }
        }
    }
    // 监听智能体错误事件
    override fun onAgentError(agentUserId: String, error: ModuleError) {

        Log.e("AgentError", "Error in ${error.type}: ${error.message} (code: ${error.code})")

        when (error.type) {
            ModuleType.LLM -> {
                // LLM 错误，可能需要重试或降级处理
                showErrorMessage("AI处理出错，请稍后重试")
            }
            ModuleType.TTS -> {
                // TTS 错误，可能需要切换到文本模式
                showErrorMessage("语音合成出错")
            }
            else -> {
                // 其他错误类型
                showErrorMessage("系统错误: ${error.message}")
            }
        }
    }

    override fun onDebugLog(log: String) {
        // 处理调试日志
        if (BuildConfig.DEBUG) {
            Log.d("ConvoAI", log)
        }
        // 可以将日志发送到远程服务器进行问题诊断
    }
})
```

#### iOS

调用 `addHandler` 方法，注册并实现智能体相关事件回调：

```swift
// 让你的类遵循 ConversationalAIAPIEventHandler 协议
class ConversationViewController: UIViewController, ConversationalAIAPIEventHandler {

    // 实现协议方法
    func onAgentStateChanged(agentUserId: String, event: StateChangeEvent) {
        // 更新 UI 显示智能体当前状态
        DispatchQueue.main.async {
            self.updateAgentStatus(event.state)
        }
    }

    func onAgentInterrupted(agentUserId: String, event: InterruptEvent) {
        // 智能体被中断，可以更新 UI 或记录日志
        print("Agent \(agentUserId) interrupted at turn \(event.turnId)")
        DispatchQueue.main.async {
            self.showInterruptNotification()
        }
    }

    func onAgentMetrics(agentUserId: String, metrics: Metric) {
        // 监听智能体性能指标，用于监控和优化
        switch metrics.type {
        case .llm:
            print("LLM latency: \(metrics.value)ms")
            // 可以记录LLM响应时间用于性能分析
        case .tts:
            print("TTS latency: \(metrics.value)ms")
            // 可以记录TTS合成时间
        case .unknown:
            print("Unknown metric: \(metrics.name) = \(metrics.value)")
        }
    }

    func onAgentError(agentUserId: String, error: ModuleError) {
        // 监听智能体错误事件
        print("Error in \(error.type): \(error.message) (code: \(error.code))")

        DispatchQueue.main.async {
            switch error.type {
            case .llm:
                // LLM错误，可能需要重试或降级处理
                self.showErrorMessage("AI处理出错，请稍后重试")
            case .tts:
                // TTS错误，可能需要切换到文本模式
                self.showErrorMessage("语音合成出错")
            case .mllm:
                // MLLM错误
                self.showErrorMessage("多模态AI处理出错")
            case .unknown:
                // 其他错误类型
                self.showErrorMessage("系统错误: \(error.message)")
            }
        }
    }

    // 辅助方法，用于更新 UI 显示智能体当前状态
    private func updateAgentStatus(_ state: AgentState) {
        let (text, color): (String, UIColor) = {
            switch state {
            case .idle:
                return ("空闲", .gray)
            case .silent:
                return ("等待中...", .gray)
            case .listening:
                return ("正在听...", .blue)
            case .thinking:
                return ("思考中...", .orange)
            case .speaking:
                return ("说话中...", .green)
            case .unknown:
                return ("未知状态", .red)
            }
        }()

        statusLabel.text = text
        statusLabel.textColor = color
    }

    private func showInterruptNotification() {
        statusLabel.text = "对话已中断"
        statusLabel.textColor = .red
    }

    private func showErrorMessage(_ message: String) {
        let alert = UIAlertController(title: "错误", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default))
        present(alert, animated: true)
    }
}

// 注册事件回调
convoAIAPI.addHandler(handler: self)
```

#### Web

```typescript
// 监听智能体状态变化
conversationalAIAPI.on(EConversationalAIAPIEvents.AGENT_STATE_CHANGED, onAgentStateChanged)
// 监听智能体性能指标
conversationalAIAPI.on(EConversationalAIAPIEvents.AGENT_METRICS, onAgentMetricsChanged)
// 监听智能体错误事件
conversationalAIAPI.on(EConversationalAIAPIEvents.AGENT_ERROR, onAgentError)
```

### 订阅频道消息

智能体的相关事件通过 RTM 频道消息传递，你需要在开始智能体会话前调用 `subscribeMessage` 订阅频道消息，以接收智能体相关事件。

#### Android

```kotlin
api.subscribeMessage("channelName") { error ->
    if (error != null) {
        // 处理错误
    }
}
```

#### iOS

```swift
convoAIAPI.subscribeMessage(channelName: channelName) { error in
    if let error = error {
        print("订阅失败: \(error.message)")
    } else {
        print("订阅成功")
    }
}
```

#### Web

```typescript
conversationalAIAPI.subscribeMessage(channel_name)
```

### 智能体加入频道

调用 [POST 创建对话式智能体](../operations/start-agent.md)接口，并完成以下参数设置：
- `advanced_features.enable_rtm: true` —— （必选）启动 RTM 服务
- `parameters.data_channel: "rtm"` —— （必选）开启 RTM 数据传输通道
- `parameters.enable_metrics: true` —— （按需开启）接收智能体性能数据
- `parameters.enable_error_message: true` —— （按需开启）接收智能体错误事件

调用成功后，智能体会加入指定 RTC 频道，用户可以开始与智能体互动。

### 取消订阅频道消息

每次智能体会话结束后，你需要取消订阅频道消息，以释放回调事件相关资源。

#### Android

```kotlin
api.unsubscribeMessage("channelName") { error ->
    if (error != null) {
        // 处理错误
    }
}
```

#### iOS

```swift
/// 取消订阅频道消息
convoAIAPI.unsubscribeMessage(channelName: channelName) { error in
    if let error = error {
        print("取消订阅失败: \(error.message)")
    } else {
        print("取消订阅成功")
    }
}
```

#### Web

```typescript
conversationalAIAPI.unsubscribeMessage(channel_name)
```

### 销毁组件实例

结束 AI 对话场景后或关闭 App 前，你需要销毁组件实例，以释放组件的所有资源。

#### Android

```kotlin
api.destroy()
```

#### iOS

```swift
convoAIAPI.destroy()
```

#### Web

```typescript
conversationalAIAPI.destroy()
```

## 参考信息

### 示例项目

声网提供了开源的示例项目供你参考，你可以前往下载或查看其中的源代码。

- [Conversational-AI-Demo](https://github.com/Shengwang-Community/Conversational-AI-Demo/)

### 组件结构

客户端组件文件夹的结构和各文件作用如下：

> 信息
> 以下文件和文件夹即为集成客户端组件所需全部内容，无需拷贝其他文件。

#### Android

- `IConversationalAIAPI.kt` — API 接口及相关数据结构和枚举
    - `ConversationalAIAPIImpl.kt` — ConversationalAI API 主要实现逻辑
    - `ConversationalAIUtils.kt` — 工具函数与事件回调管理
    - `subRender/`
        - `v3/` — 字幕部分模块
            - `TranscriptionController.kt` — 字幕控制器
            - `MessageParser.kt` — 消息解析器

#### iOS

- `ConversationalAIAPI.swift` — API 接口及相关数据结构和枚举
    - `ConversationalAIAPIImpl.swift` — ConversationalAI API 主要实现逻辑
    - `Transcription/`
        - `TranscriptionController.swift` — 字幕控制器

#### Web

- `index.ts` — API 类
    - `type.ts` — API 接口及相关数据结构和枚举
    - `utils/index.ts` — API 工具函数
    - `utils/events.ts` — 事件管理类，可以拓展该类以轻松实现事件监听和播报
    - `utils/sub-render.ts` — 字幕部分模块

### API 参考

#### Android

- [`addHandler`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#addhandler)
    - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#subscribemessage)
    - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#unsubscribemessage)
    - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#destroy)
    - [`onAgentStateChanged`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagentstatechanged)
    - [`onAgentInterrupted`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagentinterrupted)
    - [`onAgentMetrics`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagentmetrics)
    - [`onAgentError`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapieventhandler#onagenterror)

#### iOS

- [`addHandler`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#addhandler)
    - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#subscribemessage)
    - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#unsubscribemessage)
    - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#destroy)
    - [`onAgentStateChanged`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagentstatechanged)
    - [`onAgentInterrupted`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagentinterrupted)
    - [`onAgentMetrics`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagentmetrics)
    - [`onAgentError`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapieventhandler#onagenterror)

#### Web

- [`IConversationalAIAPIEventHandler`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/struct#iconversationalaiapieventhandlers)
    - [`EConversationalAIAPIEvents`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/enum#econversationalaiapievents)
    - [`subscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#subscribemessage)
    - [`unsubscribeMessage`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#unsubscribemessage)
    - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/typescript/web-component/conversationalaiapi#destroy)
