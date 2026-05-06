---
title: Optimize Audio Settings
description: "In real-time interaction scenarios, conversations between humans and AI differ significantly from human-to-human conversations in pacing, speaking continuity, and vocal characteristics. Therefore, audio settings optimized for AI-to-human conversations are especially important for achieving a better experience."
---

# Optimize Audio Settings

In real-time interaction scenarios, conversations between humans and AI differ significantly from human-to-human conversations in pacing, speaking continuity, and vocal characteristics. Therefore, audio settings optimized for AI-to-human conversations are especially important for achieving a better experience.

When integrating the Conversational AI Engine with the iOS/Android/Web RTC SDK, you can use the optimized audio settings described in this article to improve conversation fluency and reliability and deliver a better user experience in complex network environments.

## Server-side Settings

When you create a conversational AI agent by calling the server-side API, using the default values for audio-related parameters already provides the best audio experience.

## Client-side Settings

### Integrate Required Dynamic Libraries

To achieve the best audio experience with Conversational AI Engine, the following plugin dynamic libraries are required. Make sure they are integrated and loaded in your project:

#### Android

- AI noise suppression plugin: `libagora_ai_noise_suppression_extension.so`
  - AI echo cancellation plugin: `libagora_ai_echo_cancellation_extension.so`

  For integration details, see [Reduce App Size](https://doc.shengwang.cn/doc/rtc/android/best-practice/reduce-app-size).

#### iOS

- AI noise suppression plugin: `AgoraAiNoiseSuppressionExtension.xcframework`
  - AI echo cancellation plugin: `AgoraAiEchoCancellationExtension.xcframework`

  For integration details, see [Reduce App Size](https://doc.shengwang.cn/doc/rtc/ios/best-practice/reduce-app-size).

#### Web

- Refer to [Use the AI Noise Suppression Extension](https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/extensions/noise-reduction) to integrate the AI noise suppression plugin: `agora-extension-ai-denoiser`.

### Set Optimal Audio Parameters

The best client-side audio settings can be implemented in either of the following ways:

1. Recommended: [Call the client component API](#option-1-use-the-client-component-api). This method applies to RTC SDK v4.5.1 and later. It currently supports only the Android and iOS SDKs.
2. [Call the RTC SDK API](#option-2-call-the-rtc-sdk-api). This method applies to RTC SDK v4.3.1 and later.

#### Option 1: Use the Client Component API

Agora provides a flexible, extensible, and standardized set of client components for Conversational AI Engine. These components support iOS, Android, and Web, and encapsulate multiple scenario-oriented APIs. By calling these APIs, you can combine the capabilities of the Agora [RTC SDK](https://doc.shengwang.cn/doc/rtc/homepage) and [RTM SDK](https://doc.shengwang.cn/doc/rtm2/homepage) to implement the following features:

- [Interrupt an agent](../user-guides/interrupt-agent.md)
- [Real-Time Subtitles](../user-guides/realtime-sub.md)
- [Listen to agent-related events](../user-guides/listen-agent-events.md)
- [Set optimal audio parameters](./audio-settings.md) (Android and iOS only)
- [Send image messages](../user-guides/send-multimodal-message.md)

##### Prerequisites

Before you start, make sure you have completed the following:

- Integrated RTC SDK v4.5.1 or later and implemented basic real-time audio and video capabilities in your app, including obtaining the required device permissions. See [Build a Video Calling App](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start).
- Enabled RTM for the project in the [Console](https://console.shengwang.cn/) and implemented basic real-time messaging capabilities in your app. See [Send and Receive Messages](https://doc.shengwang.cn/doc/rtm2/javascript/get-started/quick-start).
- Followed [Build Voice Interaction with an Agent](../get-started/quick-start.md) to implement the basic logic for interacting with the agent.
- Ensured that RTC is available, RTM is logged in, and the lifecycles of the RTC and RTM instances are longer than the lifecycle of the component. The component does not manage RTC or RTM initialization, lifecycle, authentication, or login state internally.

##### Integrate the Component

#### Android

Copy the `convoaiApi` folder into your project and import the component before calling its API. See [Component Structure](#component-structure) to learn the role of each file.

- [convoaiApi](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/Android/scenes/convoai/src/main/java/io/agora/scene/convoai/convoaiApi)

#### iOS

Copy the `ConversationalAIAPI` folder into your project and import the component before calling its API. See [Component Structure](#component-structure) to learn the role of each file.

- [ConversationalAIAPI](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/iOS/Scenes/ConvoAI/ConvoAI/ConvoAI/Classes/ConversationalAIAPI)

#### Web

Copy the `conversational-ai-api` file into your own project and import the component before calling its API. See [Component Structure](#component-structure) to learn the role of each file.

- [conversational-ai-api](https://github.com/Shengwang-Community/Conversational-AI-Demo/tree/main/Web/Scenes/VoiceAgent/src/conversational-ai-api)

##### Initialize the Component

Create a configuration object for the RTC and RTM instances, and then create a component instance:

#### Android

```kotlin
// Create a configuration object for the RTC and RTM instances
val config = ConversationalAIAPIConfig(
    rtcEngine = rtcEngineInstance,
    rtmClient = rtmClientInstance,
    enableLog = true
)
// Create the component instance
val api = ConversationalAIAPIImpl(config)
```

#### iOS

```swift
/// Create a configuration object for the RTC and RTM instances
let config = ConversationalAIAPIConfig(
    rtcEngine: rtcEngine,
    rtmEngine: rtmEngine,
    enableLog: true
)
/// Create the component instance
convoAIAPI = ConversationalAIAPIImpl(config: config)
```

##### Set Optimal Audio Parameters

#### Android

Before joining the RTC channel, call `loadAudioSettings` to apply the optimal audio parameters. Internally, the component listens to the RTC audio route change callback and calls this method again when the audio route changes.

```kotlin
api.loadAudioSettings()
rtcEngine.joinChannel(token, channelName, null, userId)
```

#### iOS

Before joining the RTC channel, call `loadAudioSettings` to apply the optimal audio parameters. Internally, the component listens to the RTC audio route change callback and calls this method again when the audio route changes.

```swift
convoAIAPI.loadAudioSettings()
rtcEngine.joinChannel(rtcToken: token, channelName: channelName, uid: uid, isIndependent: independent)
```

##### Make the Agent Join the Channel

Call [POST Create a Conversational AI Agent](../operations/start-agent.md) and complete the following parameter settings:

- `advanced_features.enable_rtm: true` - required, enables RTM
- `parameters.data_channel: "rtm"` - required, enables the RTM data transport channel
- `parameters.enable_metrics: true` - optional, receive agent performance metrics
- `parameters.enable_error_message: true` - optional, receive agent error events

After the call succeeds, the agent joins the specified RTC channel and the user can start interacting with the agent.

##### Destroy the Component Instance

After the AI conversation scenario ends or before closing the app, destroy the component instance to release all resources used by the component.

#### Android

```kotlin
api.destroy()
```

#### iOS

```swift
convoAIAPI.destroy()
```

#### Option 2: Call the RTC SDK API

##### Set Audio-related Parameters

> Note
> This section applies to the following RTC SDK versions:
> - Android/iOS: RTC SDK v4.3.1 and later. For versions earlier than 4.3.1, Agora recommends upgrading to v4.5.1 or later, or [contacting technical support](https://ticket.shengwang.cn/) to learn the configuration method.
> - Web: Web SDK v4.15.0 or later.

#### Android

To achieve the best AI conversation audio experience, complete the following audio-related settings:

1. **Set the audio scenario**: Set the audio scenario to the AI conversation scenario when initializing the engine. You can also call [`setAudioScenario`](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_basic#api_irtcengine_setaudioscenario) before joining the channel to set the audio scenario to the AI conversation scenario.
2. **Set audio-related parameters**: Before joining the channel and when the audio route changes, triggering [`onAudioRouteChanged`](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_route#onAudioRouteChanged), call [`setParameters`](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_network#api_irtcengine_setparameters) to set audio-related parameters. These mainly include enabling or disabling audio 3A plugins, including echo cancellation (AEC), noise suppression (ANS), and gain control (AGC), as well as audio sample rate and audio processing mode settings. See the sample code for recommended values.

> Note
> Because SDK versions 4.3.1 to 4.5.0 do not support the AI conversation scenario, you can switch the audio scenario to the chorus scenario (`AUDIO_SCENARIO_CHORUS`) to improve audio experience, but it cannot fully match the audio experience of v4.5.1 and later. For the best audio experience, upgrade to v4.5.1 or later.

The following sample code encapsulates a `setAudioConfigParameters` function for setting audio-related parameters, and calls it before joining the channel and when the audio route changes:

```kotlin
private var rtcEngine: RtcEngineEx? = null
private var mAudioRouting = Constants.AUDIO_ROUTE_DEFAULT

// highlight-start
// Set audio configuration parameters
private fun setAudioConfigParameters(routing: Int) {
    mAudioRouting = routing
    rtcEngine?.apply {
        setParameters("{\"che.audio.aec.split_srate_for_48k\":16000}")
        setParameters("{\"che.audio.sf.enabled\":true}")
        setParameters("{\"che.audio.sf.stftType\":6}")
        setParameters("{\"che.audio.sf.ainlpLowLatencyFlag\":1}")
        setParameters("{\"che.audio.sf.ainsLowLatencyFlag\":1}")
        setParameters("{\"che.audio.sf.procChainMode\":1}")
        setParameters("{\"che.audio.sf.nlpDynamicMode\":1}")

        if (routing == Constants.AUDIO_ROUTE_HEADSET // 0
            || routing == Constants.AUDIO_ROUTE_EARPIECE // 1
            || routing == Constants.AUDIO_ROUTE_HEADSETNOMIC // 2
            || routing == Constants.AUDIO_ROUTE_BLUETOOTH_DEVICE_HFP // 5
            || routing == Constants.AUDIO_ROUTE_BLUETOOTH_DEVICE_A2DP) { // 10
            setParameters("{\"che.audio.sf.nlpAlgRoute\":0}")
        } else {
            setParameters("{\"che.audio.sf.nlpAlgRoute\":1}")
        }

        setParameters("{\"che.audio.sf.ainlpModelPref\":10}")
        setParameters("{\"che.audio.sf.nsngAlgRoute\":12}")
        setParameters("{\"che.audio.sf.ainsModelPref\":10}")
        setParameters("{\"che.audio.sf.nsngPredefAgg\":11}")
        setParameters("{\"che.audio.agc.enable\":false}")
    }
}
// highlight-end

// Create and initialize the RTC engine
fun createRtcEngine(rtcCallback: IRtcEngineEventHandler): RtcEngineEx {
    val config = RtcEngineConfig()
    config.mContext = AgentApp.instance()
    config.mAppId = ServerConfig.rtcAppId
    config.mChannelProfile = Constants.CHANNEL_PROFILE_LIVE_BROADCASTING
    // highlight-start
    // Set the audio scenario to the AI conversation scenario (supported in 4.5.1 and later)
    // For versions 4.3.1 to 4.5.0, use the chorus scenario AUDIO_SCENARIO_CHORUS
    config.mAudioScenario = Constants.AUDIO_SCENARIO_AI_CLIENT
    // Register the audio route change callback
    config.mEventHandler = object : IRtcEngineEventHandler() {
        override fun onAudioRouteChanged(routing: Int) {
            super.onAudioRouteChanged(routing)
            // Set audio-related parameters
            setAudioConfigParameters(routing)
        }
    }
    // highlight-end
    try {
        rtcEngine = (RtcEngine.create(config) as RtcEngineEx).apply {
            // highlight-start
            // Load audio plugins
            loadExtensionProvider("ai_echo_cancellation_extension")
            loadExtensionProvider("ai_noise_suppression_extension")
            // highlight-end
        }
    } catch (e: Exception) {
        Log.e("CovAgoraManager", "createRtcEngine error: $e")
    }
    return rtcEngine!!
}

// Join the channel
fun joinChannel(rtcToken: String, channelName: String, uid: Int, isIndependent: Boolean = false) {

    // highlight-start
    // Initialize audio configuration parameters
    setAudioConfigParameters(mAudioRouting)
    // highlight-end

    // Configure channel options and join the channel
    val options = ChannelMediaOptions()
    options.clientRoleType = CLIENT_ROLE_BROADCASTER
    options.publishMicrophoneTrack = true
    options.publishCameraTrack = false
    options.autoSubscribeAudio = true
    options.autoSubscribeVideo = false
    val ret = rtcEngine?.joinChannel(rtcToken, channelName, uid, options)
}
```

#### iOS

To achieve the best AI conversation audio experience, complete the following audio-related settings:

1. **Set the audio scenario**: Set the audio scenario to the AI conversation scenario when initializing the engine. You can also call [`setAudioScenario`](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_audio_basic#api_irtcengine_setaudioscenario) before joining the channel to set the audio scenario to the AI conversation scenario.
2. **Set audio-related parameters**: Before joining the channel and when the audio route changes, triggering [`rtcEngine:didAudioRouteChanged:`](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_audio_route#rtcEngine:didAudioRouteChanged:), call [`setParameters`](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_network#api_irtcengine_setparameters) to set audio-related parameters. These mainly include enabling or disabling audio 3A plugins, including echo cancellation (AEC), noise suppression (ANS), and gain control (AGC), as well as audio sample rate and audio processing mode settings. See the sample code for recommended values.

> Note
> Because SDK versions 4.3.1 to 4.5.0 do not support the AI conversation scenario, you can switch the audio scenario to the chorus scenario (`AgoraAudioScenarioChorus`) to improve audio experience, but it cannot fully match the audio experience of v4.5.1 and later. For the best audio experience, upgrade to v4.5.1 or later.

The following sample code encapsulates a `setAudioConfigParameters` function for setting audio-related parameters, and calls it before joining the channel and when the audio route changes:

```swift
class RTCManager: NSObject {
    private var rtcEngine: AgoraRtcEngineKit!
    private var audioDumpEnabled: Bool = false
    private var audioRouting = AgoraAudioOutputRouting.default

    // highlight-start
    // Set audio-related parameters
    private func setAudioConfigParameters(routing: AgoraAudioOutputRouting) {
        audioRouting = routing
        rtcEngine.setParameters("{\"che.audio.aec.split_srate_for_48k\":16000}")
        rtcEngine.setParameters("{\"che.audio.sf.enabled\":true}")
        rtcEngine.setParameters("{\"che.audio.sf.stftType\":6}")
        rtcEngine.setParameters("{\"che.audio.sf.ainlpLowLatencyFlag\":1}")
        rtcEngine.setParameters("{\"che.audio.sf.ainsLowLatencyFlag\":1}")
        rtcEngine.setParameters("{\"che.audio.sf.procChainMode\":1}")
        rtcEngine.setParameters("{\"che.audio.sf.nlpDynamicMode\":1}")
        if routing == .headset ||
            routing == .earpiece ||
            routing == .headsetNoMic ||
            routing == .bluetoothDeviceHfp ||
            routing == .bluetoothDeviceA2dp {
            rtcEngine.setParameters("{\"che.audio.sf.nlpAlgRoute\":0}")
        } else {
            rtcEngine.setParameters("{\"che.audio.sf.nlpAlgRoute\":1}")
        }
        rtcEngine.setParameters("{\"che.audio.sf.ainlpModelPref\":10}")
        rtcEngine.setParameters("{\"che.audio.sf.nsngAlgRoute\":12}")
        rtcEngine.setParameters("{\"che.audio.sf.ainsModelPref\":10}")
        rtcEngine.setParameters("{\"che.audio.sf.nsngPredefAgg\":11}")
        rtcEngine.setParameters("{\"che.audio.agc.enable\":false}")
    }
    // highlight-end
}

extension RTCManager: RTCManagerProtocol {

    func createRtcEngine(delegate: AgoraRtcEngineDelegate) -> AgoraRtcEngineKit {
        let config = AgoraRtcEngineConfig()
        config.appId = AppContext.shared.appId
        config.channelProfile = .liveBroadcasting
        // highlight-start
        // Set the audio scenario to the AI conversation scenario (supported in 4.5.1 and later)
        // Versions 4.3.1 to 4.5.0 support the chorus scenario .chorus
        config.audioScenario = .aiClient
        rtcEngine = AgoraRtcEngineKit.sharedEngine(with: config, delegate: delegate)
        // Register the audio route change callback
        rtcEngine.addDelegate(self)
        // highlight-end
        return rtcEngine
    }

    func joinChannel(rtcToken: String, channelName: String, uid: String) {

        // highlight-start
        // Initialize audio configuration parameters
        setAudioConfigParameters(routing: audioRouting)
        // highlight-end

        // Configure channel options and join the channel
        let options = AgoraRtcChannelMediaOptions()
        options.clientRoleType = .broadcaster
        options.publishMicrophoneTrack = true
        options.publishCameraTrack = false
        options.autoSubscribeAudio = true
        options.autoSubscribeVideo = false
        let ret = rtcEngine.joinChannel(byToken: rtcToken, channelId: channelName, uid: UInt(uid) ?? 0, mediaOptions: options)
    }
}

// highlight-start
// Implement AgoraRtcEngineDelegate to handle audio route change callbacks
extension RTCManager: AgoraRtcEngineDelegate {
    public func rtcEngine(_ engine: AgoraRtcEngineKit, didAudioRouteChanged routing: AgoraAudioOutputRouting) {
        setAudioConfigParameters(routing: routing)
    }
}
// highlight-end
```

#### Web

Refer to [Use the AI Noise Suppression Extension](https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/extensions/noise-reduction) to learn how to integrate the AI noise suppression plugin and improve the AI conversation audio experience.

## Reference

### Sample Project

Agora provides open-source sample code that you can use as a reference for audio-related parameter settings.

#### Android

- [CovRtcManager.kt](https://github.com/Shengwang-Community/Conversational-AI-Demo/blob/main/Android/scenes/convoai/src/main/java/io/agora/scene/convoai/rtc/CovRtcManager.kt)

#### iOS

- [RTCManager.swift](https://github.com/Shengwang-Community/Conversational-AI-Demo/blob/main/iOS/Scenes/ConvoAI/ConvoAI/ConvoAI/Classes/Manager/RTCManager.swift)

### Component Structure

The structure of the client component folder and the role of each file are as follows:

> Info
> The following files and folders are the complete set of content required to integrate the client components. No other files need to be copied.

#### Android

- `IConversationalAIAPI.kt` - API interfaces, related data structures, and enums
  - `ConversationalAIAPIImpl.kt` - Main implementation logic of the ConversationalAI API
  - `ConversationalAIUtils.kt` - Utility functions and event callback management
  - `subRender/`
    - `v3/` - Subtitle-related modules
      - `TranscriptionController.kt` - Subtitle controller
      - `MessageParser.kt` - Message parser

#### iOS

- `ConversationalAIAPI.swift` - API interfaces, related data structures, and enums
  - `ConversationalAIAPIImpl.swift` - Main implementation logic of the ConversationalAI API
  - `Transcription/`
    - `TranscriptionController.swift` - Subtitle controller

#### Web

- `index.ts` - API class
  - `type.ts` - API interfaces, related data structures, and enums
  - `utils/index.ts` - API utility functions
  - `utils/events.ts` - Event manager class. You can extend it to implement event listening and playback more easily.
  - `utils/sub-render.ts` - Subtitle-related modules

### API Reference

#### RTC SDK API

#### Android

- [`setAudioScenario`](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_basic#api_irtcengine_setaudioscenario)
  - [`setParameters`](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_network#api_irtcengine_setparameters)
  - [`onAudioRouteChanged`](https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_route#onAudioRouteChanged)

#### iOS

- [`setAudioScenario`](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_audio_basic#api_irtcengine_setaudioscenario)
  - [`setParameters`](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_network#api_irtcengine_setparameters)
  - [`rtcEngine:didAudioRouteChanged:`](https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_audio_route#rtcEngine:didAudioRouteChanged:)

#### Client Component API

#### Android

- [`loadAudioSettings`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#loadaudiosettings)
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/android/android-component/iconversationalaiapi#destroy)

#### iOS

- [`loadAudioSettings [1/2]`](/api-ref/convoai/ios/ios-component/conversationalaiapi#loadaudiosettings[1/2])
  - [`loadAudioSettings [2/2]`](/api-ref/convoai/ios/ios-component/conversationalaiapi#loadaudiosettings[2/2])
  - [`destroy`](https://doc.shengwang.cn/api-ref/convoai/ios/ios-component/conversationalaiapi#destroy)
