import type { SdkDownloadPlatform } from './sdk-downloads-data';

export const zhCNSdkDownloadPlatforms: readonly SdkDownloadPlatform[] = [
  {
    id: 'android',
    label: 'Android',
    core: [
      {
        id: 'voice-sdk-android',
        label: '语音 SDK',
        info: '适用于语音通话、纯音频互动直播和纯音频极速直播的实时互动 SDK',
        versions: [
          {
            id: '4.6.3-voice-sdk-android',
            label: '版本 4.6.3（最新）',
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.6.3_VOICE.zip',
            md5: '2801dfea3c96a32e6aaaa354d819ec71',
            packageName: 'io.agora.rtc2.voice',
            packageManager:
              'https://central.sonatype.com/artifact/cn.shengwang.rtc/voice-sdk/4.6.3/aar',
            releaseDate: '2026 年 2 月 9 日',
          },
          {
            id: '4.4.1-voice-sdk-android',
            label: '版本 4.4.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.4.1_VOICE.zip',
          },
        ],
      },
      {
        id: 'video-sdk-android',
        label: '视频 SDK',
        info: '适用于音视频通话、互动直播和极速直播的实时互动 SDK',
        versions: [
          {
            id: '4.6.3-video-sdk-android-full',
            label: '版本 4.6.3 Full（最新）',
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.6.3_FULL.zip',
            md5: '70cb117df069f30501ca13f5147e3a99',
            packageName: 'io.agora.rtc2.video',
            packageManager:
              'https://central.sonatype.com/artifact/cn.shengwang.rtc/full-sdk/4.6.3/aar',
            releaseDate: '2026 年 2 月 9 日',
          },
          {
            id: '4.6.3-video-sdk-android-lite',
            label: '版本 4.6.3 Lite（最新）',
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.6.3_LITE.zip',
            md5: '00cb209f68c803e1aa17e8498efae94d',
            packageName: 'io.agora.rtc2.video',
            packageManager:
              'https://central.sonatype.com/artifact/cn.shengwang.rtc/lite-sdk/4.6.3/aar',
            releaseDate: '2026 年 2 月 9 日',
          },
          {
            id: '4.4.1-video-sdk-android-full',
            label: '版本 4.4.1 Full',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.4.1_FULL.zip',
          },
        ],
      },
      {
        id: 'rtm-sdk-android',
        label: 'Signaling SDK',
        info: '适用于低延时消息、信令、状态同步和频道管理的 SDK',
        versions: [
          {
            id: '2.2.8-rtm-sdk-android',
            label: '版本 2.2.8（最新）',
            downloadLink:
              'https://download.shengwang.cn/rtm2/release/RTM_JAVA_SDK_for_Android_v2.2.8.zip',
            md5: '2893634c7f24e4fc6945955f4753f13f',
            packageName: 'io.agora:agora-rtm',
            releaseDate: '2026 年 2 月 12 日',
          },
        ],
      },
    ],
    addOns: [
      {
        id: 'interactive-whiteboard-android',
        label: '互动白板 SDK',
        info: '适用于互动白板场景的 Whiteboard SDK',
        versions: [
          {
            id: '2.16.100-interactive-whiteboard-android',
            label: '版本 2.16.100（最新）',
            downloadLink:
              'https://github.com/netless-io/whiteboard-android/archive/refs/tags/2.16.100.zip',
            md5: 'ecf0c9d1f35124d93264dc46810d3e28',
            packageName: 'com.herewhite.sdk',
            releaseDate: '2025 年 4 月 7 日',
          },
        ],
      },
      {
        id: 'fastboard-android',
        label: 'Fastboard SDK',
        info: '适用于快速接入互动白板 UI 和能力的 Fastboard SDK',
        versions: [
          {
            id: '1.6.2-fastboard-android',
            label: '版本 1.6.2（最新）',
            downloadLink:
              'https://github.com/netless-io/fastboard-android/archive/refs/tags/1.6.2.zip',
            md5: '92a2240199faa74dc2bea46830623404',
            packageName: 'io.agora.board.fast',
            releaseDate: '2024 年 9 月 14 日',
          },
        ],
      },
    ],
  },
  {
    id: 'ios',
    label: 'iOS',
    core: [
      {
        id: 'voice-sdk-ios',
        label: '语音 SDK',
        info: '适用于语音通话、纯音频互动直播和纯音频极速直播的实时互动 SDK',
        versions: [
          {
            id: '4.6.2-voice-sdk-ios',
            label: '版本 4.6.2（最新）',
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_iOS_v4.6.2_VOICE.zip',
            md5: 'd1ef8c0f83ccea5110b8637d09357115',
            packageName: 'AgoraRtcKit',
            releaseDate: '2026 年 1 月 16 日',
          },
          {
            id: '4.4.0-voice-sdk-ios',
            label: '版本 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.4.0_VOICE.zip',
          },
        ],
      },
      {
        id: 'video-sdk-ios',
        label: '视频 SDK',
        info: '适用于音视频通话、互动直播和极速直播的实时互动 SDK',
        versions: [
          {
            id: '4.6.2-video-sdk-ios-full',
            label: '版本 4.6.2 Full（最新）',
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_iOS_v4.6.2_FULL.zip',
            md5: '1752d1bd20ee99373fc6d811544c559f',
            packageName: 'AgoraRtcEngineKit',
            releaseDate: '2026 年 1 月 16 日',
          },
          {
            id: '4.6.2-video-sdk-ios-lite',
            label: '版本 4.6.2 Lite（最新）',
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_iOS_v4.6.2_LITE.zip',
            md5: '15af353e5290ae883aa4ddde55a771a0',
            packageName: 'AgoraRtcEngineKit',
            releaseDate: '2026 年 1 月 16 日',
          },
          {
            id: '4.4.0-video-sdk-ios-full',
            label: '版本 4.4.0 Full',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.4.0_FULL.zip',
          },
        ],
      },
      {
        id: 'rtm-sdk-ios',
        label: 'Signaling SDK',
        info: '适用于低延时消息、信令、状态同步和频道管理的 SDK',
        versions: [
          {
            id: '2.2.8-rtm-sdk-ios',
            label: '版本 2.2.8（最新）',
            downloadLink:
              'https://download.shengwang.cn/rtm2/release/RTM_OC_SDK_v2.2.8.zip',
            md5: '02e29fb1003a507702ea0ad9ad0e941b',
            packageName: 'AgoraRtm',
            releaseDate: '2026 年 2 月 12 日',
          },
        ],
      },
    ],
    addOns: [
      {
        id: 'interactive-whiteboard-ios',
        label: '互动白板 SDK',
        info: '适用于互动白板场景的 Whiteboard SDK',
        versions: [
          {
            id: '2.16.112-interactive-whiteboard-ios',
            label: '版本 2.16.112（最新）',
            downloadLink:
              'https://github.com/netless-io/Whiteboard-iOS/archive/refs/tags/2.16.112.zip',
            md5: '5446cb723f59e7626db8ec1472ec6dc8',
            packageName: 'Whiteboard',
            releaseDate: '2025 年 4 月 7 日',
          },
        ],
      },
      {
        id: 'fastboard-ios',
        label: 'Fastboard SDK',
        info: '适用于快速接入互动白板 UI 和能力的 Fastboard SDK',
        versions: [
          {
            id: '1.4.2-fastboard-ios',
            label: '版本 1.4.2（最新）',
            downloadLink:
              'https://github.com/netless-io/fastboard-iOS/archive/refs/tags/1.4.2.zip',
            md5: 'b6366d11ab62b055b1ccd055290111e2',
            packageName: 'Fastboard',
            releaseDate: '2024 年 9 月 14 日',
          },
        ],
      },
    ],
  },
  {
    id: 'web',
    label: 'Web',
    core: [
      {
        id: 'video-sdk-web',
        label: '视频 SDK',
        info: '适用于 Web 端音视频通话、互动直播和极速直播的实时互动 SDK',
        versions: [
          {
            id: '4.24.5-video-sdk-web',
            label: '版本 4.24.5（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_5_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.5',
            releaseDate: '2026 年 6 月 24 日',
          },
          {
            id: '4.8.0-video-sdk-web',
            label: '版本 4.8.0',
            downloadLink:
              'https://download.agora.io/sdk/release/AgoraRTC_N-4.8.0.js',
          },
        ],
      },
      {
        id: 'rtm-sdk-web',
        label: 'Signaling SDK',
        info: '适用于低延时消息、信令、状态同步和频道管理的 SDK',
        versions: [
          {
            id: '2.2.4-rtm-sdk-web',
            label: '版本 2.2.4（最新）',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.2.4.zip',
            md5: '6043262f5e5999a06e12d83c3c40a943',
            packageName: 'agora-rtm',
            packageManager: 'https://www.npmjs.com/package/agora-rtm',
            releaseDate: '2026 年 4 月 13 日',
          },
        ],
      },
    ],
    addOns: [
      {
        id: 'interactive-whiteboard-web',
        label: '互动白板 SDK',
        info: '适用于互动白板场景的 Whiteboard SDK',
        versions: [
          {
            id: 'white-web-sdk',
            label: 'npm 包（最新）',
            packageName: 'white-web-sdk',
            packageManager: 'https://www.npmjs.com/package/white-web-sdk',
            releaseDate: '2025 年 4 月 7 日',
          },
        ],
      },
      {
        id: 'fastboard-web',
        label: 'Fastboard SDK',
        info: '适用于快速接入互动白板 UI 和能力的 Fastboard SDK',
        versions: [
          {
            id: 'fastboard-web',
            label: 'GitHub 源码（最新）',
            downloadLink: 'https://github.com/netless-io/fastboard',
            releaseDate: '2024 年 12 月 12 日',
          },
        ],
      },
    ],
  },
  {
    id: 'react-js',
    label: 'React',
    core: [
      {
        id: 'video-sdk-react-js',
        label: '视频 SDK',
        info: '适用于 React 应用的实时互动 SDK 封装',
        versions: [
          {
            id: '2.5.1-video-sdk-react-js',
            label: '版本 2.5.1（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/agora-rtc-react.2.5.1.js',
            releaseDate: '2025 年 12 月 17 日',
          },
        ],
      },
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    core: [
      {
        id: 'video-sdk-windows',
        label: '视频 SDK',
        info: '适用于 Windows 端音视频通话、互动直播和极速直播的实时互动 SDK',
        versions: [
          {
            id: '4.6.2-video-sdk-windows',
            label: '版本 4.6.2（最新）',
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Windows_v4.6.2_FULL.zip',
            releaseDate: '2026 年 1 月 16 日',
          },
        ],
      },
      {
        id: 'rtm-sdk-windows',
        label: 'Signaling SDK',
        info: '适用于低延时消息、信令、状态同步和频道管理的 SDK',
        versions: [
          {
            id: '2.2.8-rtm-sdk-windows',
            label: '版本 2.2.8（最新）',
            downloadLink:
              'https://download.shengwang.cn/rtm2/release/RTM_C%2B%2B_SDK_for_Windows_v2.2.8.zip',
            md5: 'b57b2bd538118ae78c17eaf48be9dd7f',
            packageName: 'libagora_rtm_sdk',
            releaseDate: '2026 年 2 月 12 日',
          },
        ],
      },
    ],
  },
  {
    id: 'macos',
    label: 'macOS',
    core: [
      {
        id: 'video-sdk-macos',
        label: '视频 SDK',
        info: '适用于 macOS 端音视频通话、互动直播和极速直播的实时互动 SDK',
        versions: [
          {
            id: '4.6.2-video-sdk-macos',
            label: '版本 4.6.2（最新）',
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Mac_v4.6.2_FULL.zip',
            packageName: 'ShengwangRtcEngine_macOS',
            releaseDate: '2026 年 1 月 16 日',
          },
        ],
      },
    ],
  },
  {
    id: 'linux',
    label: 'Linux',
    core: [
      {
        id: 'server-gateway-sdk-linux',
        label: 'RTC 服务端 SDK',
        info: '部署在服务端，用于向 RTC 频道发送音视频流或从频道接收音视频流',
        versions: [
          {
            id: '4.4.32-server-gateway-java-linux-x86-64',
            label: '版本 4.4.32 Java x86-64（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora-Linux-Java-SDK-v4.4.32-x86_64-675656-ccd9be501d-20250526_180235.zip',
            releaseDate: '2025 年 5 月 28 日',
          },
          {
            id: '4.4.32-server-gateway-cpp-linux-x86-64',
            label: '版本 4.4.32 C++ x86-64（最新）',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-x86_64-linux-gnu-v4.4.32-20250425_144419-675648.tgz',
            releaseDate: '2025 年 4 月 28 日',
          },
          {
            id: '4.4.32-server-gateway-cpp-linux-arm64',
            label: '版本 4.4.32 C++ arm64（最新）',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-aarch64-linux-gnu-v4.4.32-20250425_150503-675674.tgz',
            releaseDate: '2025 年 4 月 28 日',
          },
        ],
      },
      {
        id: 'rtm-sdk-linux',
        label: 'Signaling SDK',
        info: '适用于 Linux 端低延时消息、信令、状态同步和频道管理的 SDK',
        versions: [
          {
            id: '2.2.8-rtm-sdk-linux-cpp',
            label: '版本 2.2.8 C++（最新）',
            downloadLink:
              'https://download.shengwang.cn/rtm2/release/RTM_C%2B%2B_SDK_for_Linux_v2.2.8.zip',
            md5: 'f88b55a96cd975494d9592ba3ffe08d8',
            packageName: 'libagora_rtm_sdk',
            releaseDate: '2026 年 2 月 12 日',
          },
        ],
      },
      {
        id: 'on-premise-recording-linux',
        label: '本地服务端录制 SDK',
        info: '部署在本地服务端，用于录制 RTC 频道中的音视频流',
        versions: [
          {
            id: '4.4.151-on-premise-recording-cpp-linux-x86-64',
            label: '版本 4.4.151 C++ x86_64（最新）',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-x86_64-linux-gnu-v4.4.151-20250919_101833-891308.tgz',
            releaseDate: '2025 年 9 月 19 日',
          },
          {
            id: '4.4.151-on-premise-recording-cpp-linux-arm64',
            label: '版本 4.4.151 C++ arm64（最新）',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-aarch64-linux-gnu-v4.4.151-20250919_102817-891319.tgz',
            releaseDate: '2025 年 9 月 19 日',
          },
          {
            id: '4.4.151-on-premise-recording-java-linux-x86-64',
            label: '版本 4.4.151 Java x86_64（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora-Linux-Recording-Java-SDK-v4.4.151.1-x86_64-891308-28c706d74a-20250919_142050.zip',
            releaseDate: '2025 年 9 月 19 日',
          },
          {
            id: '4.4.151-on-premise-recording-java-linux-arm64',
            label: '版本 4.4.151 Java arm64（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora-Linux-Recording-Java-SDK-v4.4.151-aarch64-891319-952e64402b-20250919_140753.zip',
            releaseDate: '2025 年 9 月 19 日',
          },
        ],
      },
    ],
  },
  {
    id: 'harmonyos',
    label: 'HarmonyOS',
    core: [
      {
        id: 'voice-sdk-harmonyos',
        label: '语音 SDK',
        info: '适用于 HarmonyOS NEXT 端纯音频互动场景的实时互动 SDK',
        versions: [
          {
            id: '4.4.2-voice-sdk-harmonyos',
            label: '版本 4.4.2（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_HarmonyOS_V4.4.2_VOICE.har',
            md5: 'c23e66633da8fe341501b9572ed064c4',
            packageName: '@shengwang/rtc-voice',
            releaseDate: '2024 年 11 月 29 日',
          },
        ],
      },
      {
        id: 'video-sdk-harmonyos',
        label: '视频 SDK',
        info: '适用于 HarmonyOS NEXT 端音视频互动场景的实时互动 SDK',
        versions: [
          {
            id: '4.4.2-video-sdk-harmonyos',
            label: '版本 4.4.2（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_HarmonyOS_v4.4.2_FULL.har',
            md5: 'f02df2e181a7e25218eb87dbdca0db7d',
            packageName: '@shengwang/rtc-full',
            releaseDate: '2024 年 11 月 29 日',
          },
        ],
      },
      {
        id: 'rtm-sdk-harmonyos',
        label: 'Signaling SDK',
        info: '适用于低延时消息、信令、状态同步和频道管理的 SDK',
        versions: [
          {
            id: '2.2.8-rtm-sdk-harmonyos',
            label: '版本 2.2.8（最新）',
            downloadLink:
              'https://download.shengwang.cn/rtm2/release/RTM_ArkTS_SDK_for_HarmonyOS_v2.2.8.zip',
            md5: '9cdca555d23b7798edf92d4edb09014f',
            packageName: 'libagora_rtm_sdk',
            releaseDate: '2026 年 2 月 12 日',
          },
        ],
      },
    ],
  },
  {
    id: 'mini-program',
    label: '微信/QQ 小程序',
    core: [
      {
        id: 'video-sdk-mini-program',
        label: '视频 SDK',
        info: '适用于微信/QQ 小程序实时互动场景的 SDK',
        versions: [
          {
            id: '2.6.5-video-sdk-mini-program',
            label: '版本 2.6.5（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Miniapp_SDK_for_WeChat_v2.6.5.zip',
            releaseDate: '2024 年 8 月 21 日',
          },
        ],
      },
    ],
  },
  {
    id: 'electron',
    label: 'Electron',
    core: [
      {
        id: 'video-sdk-electron',
        label: '视频 SDK',
        info: '适用于 Electron 应用的实时互动 SDK',
        versions: [
          {
            id: '4.6.2-video-sdk-electron',
            label: '版本 4.6.2（最新）',
            packageManager:
              'https://www.npmjs.com/package/shengwang-electron-sdk/v/4.6.2',
            releaseDate: '2026 年 3 月 5 日',
          },
          {
            id: '4.5.40-rc.2-video-sdk-electron-uniontech',
            label: '版本 4.5.40-rc.2 统信 OS',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.5.40-rc.2',
            releaseDate: '2025 年 9 月 30 日',
          },
        ],
      },
    ],
  },
  {
    id: 'flutter',
    label: 'Flutter',
    core: [
      {
        id: 'video-sdk-flutter',
        label: '视频 SDK',
        info: '适用于 Flutter 应用的实时互动 SDK',
        versions: [
          {
            id: '6.6.2-video-sdk-flutter',
            label: '版本 6.6.2（最新）',
            packageManager:
              'https://pub.dev/packages/shengwang_rtc_engine/versions/6.6.2',
            releaseDate: '2026 年 3 月 18 日',
          },
        ],
      },
      {
        id: 'rtm-sdk-flutter',
        label: 'Signaling SDK',
        info: '适用于低延时消息、信令、状态同步和频道管理的 SDK',
        versions: [
          {
            id: '2.2.6-rtm-sdk-flutter',
            label: '版本 2.2.6（最新）',
            packageName: 'agora_rtm',
            packageManager: 'https://pub.dev/packages/agora_rtm/versions/2.2.6',
            releaseDate: '2025 年 11 月 18 日',
          },
        ],
      },
    ],
  },
  {
    id: 'react-native',
    label: 'React Native',
    core: [
      {
        id: 'video-sdk-react-native',
        label: '视频 SDK',
        info: '适用于 React Native 应用的实时互动 SDK',
        versions: [
          {
            id: '4.6.2-video-sdk-react-native',
            label: '版本 4.6.2（最新）',
            packageManager:
              'https://www.npmjs.com/package/react-native-shengwang/v/4.6.2',
            releaseDate: '2026 年 3 月 5 日',
          },
        ],
      },
    ],
  },
  {
    id: 'unity',
    label: 'Unity',
    core: [
      {
        id: 'voice-sdk-unity',
        label: '语音 SDK',
        info: '适用于 Unity 应用纯音频互动场景的实时互动 SDK',
        versions: [
          {
            id: '4.6.2-build.1-voice-sdk-unity',
            label: '版本 4.6.2-build.1（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_VOICE_20260212_634_4.6.2-build.1.zip',
            releaseDate: '2026 年 3 月 5 日',
          },
          {
            id: '4.3.2.14-voice-sdk-unity',
            label: '版本 4.3.2.14',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.3.2.14_VOICE_20250304_399.zip',
          },
        ],
      },
      {
        id: 'video-sdk-unity',
        label: '视频 SDK',
        info: '适用于 Unity 应用音视频互动场景的实时互动 SDK',
        versions: [
          {
            id: '4.6.2-build.1-video-sdk-unity',
            label: '版本 4.6.2-build.1（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_FULL_20260212_633_4.6.2-build.1.zip',
            releaseDate: '2026 年 3 月 5 日',
          },
        ],
      },
      {
        id: 'rtm-sdk-unity',
        label: 'Signaling SDK',
        info: '适用于低延时消息、信令、状态同步和频道管理的 SDK',
        versions: [
          {
            id: '2.1.9-rtm-sdk-unity',
            label: '版本 2.1.9（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTM_SDK_v2.1.9.zip',
            md5: '9aa4b2a542f3197ac9f905e20c5b7889',
            packageName: 'io.agora.rtm',
            releaseDate: '2024 年 1 月 25 日',
          },
        ],
      },
    ],
  },
  {
    id: 'unreal-engine',
    label: 'Unreal Engine',
    core: [
      {
        id: 'voice-sdk-unreal-engine',
        label: '语音 SDK',
        info: '适用于 Unreal Engine 应用纯音频互动场景的实时互动 SDK',
        versions: [
          {
            id: '4.5.1-voice-sdk-unreal-engine',
            label: '版本 4.5.1（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_VOICE_SDK_4.5.1_Unreal.zip',
            releaseDate: '2025 年 3 月 13 日',
          },
        ],
      },
      {
        id: 'video-sdk-unreal-engine',
        label: '视频 SDK',
        info: '适用于 Unreal Engine 应用音视频互动场景的实时互动 SDK',
        versions: [
          {
            id: '4.5.1-video-sdk-unreal-engine',
            label: '版本 4.5.1（最新）',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_FULL_SDK_4.5.1_Unreal.zip',
            releaseDate: '2025 年 3 月 13 日',
          },
        ],
      },
    ],
  },
];
