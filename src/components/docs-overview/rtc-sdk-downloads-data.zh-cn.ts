import type {
  SdkDownloadPlatform,
  SdkDownloadVersion,
} from './sdk-downloads-data';

const releaseDate = '2026 年 9 月 22 日';

const version = (
  id: string,
  label: string,
  details: Omit<SdkDownloadVersion, 'id' | 'label'>,
): SdkDownloadVersion => ({
  id,
  label,
  releaseDate,
  ...details,
});

// Android Maven integration is documented in the download guide. Its artifacts
// are hosted in Shengwang's Maven repository, so do not infer Central links.
export const zhCNRtcSdkDownloadPlatforms: readonly SdkDownloadPlatform[] = [
  {
    id: 'android',
    label: 'Android',
    core: [
      {
        id: 'voice-sdk-android',
        label: '语音 SDK',
        info: '适用于语音通话、纯音频互动直播和纯音频极速直播的实时互动 SDK',
        versions: [
          version('4.7.0-voice-sdk-android', '版本 4.7.0（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.7.0_VOICE.zip',
            md5: 'acb70a13f5e001e324cb33e46624edf8',
            packageSize:
              'armeabi-v7a 7.27 MB；arm64-v8a 7.82 MB；x86 7.67 MB；x86_64 7.49 MB',
            packageName: 'io.agora.rtc2.voice',
          }),
        ],
      },
      {
        id: 'video-sdk-android',
        label: '视频 SDK',
        info: '适用于音视频通话、互动直播和极速直播的实时互动 SDK',
        versions: [
          version('4.7.0-video-sdk-android-full', '版本 4.7.0 Full（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.7.0_FULL.zip',
            md5: '867fb78c2eb1ec8ff02ba073a1fd2e1d',
            packageSize:
              'armeabi-v7a 16.55 MB；arm64-v8a 17.17 MB；x86 17.81 MB；x86_64 17.44 MB',
            packageName: 'io.agora.rtc2.video',
          }),
          version('4.7.0-video-sdk-android-lite', '版本 4.7.0 Lite（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.7.0_LITE.zip',
            latestVariant: true,
            md5: 'b5bb69fa8c7e79bf939fe1caa1fd8f9c',
            packageSize:
              'armeabi-v7a 8.42 MB；arm64-v8a 9.02 MB；x86 9.08 MB；x86_64 8.92 MB',
            packageName: 'io.agora.rtc2.video',
          }),
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
          version('4.7.0-voice-sdk-ios', '版本 4.7.0（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_iOS_v4.7.0_VOICE.zip',
            md5: 'db7fc92f1f56725758a5d71173e9fcab',
            packageSize: '13.15 MB',
            packageName: 'AgoraRtcKit',
          }),
        ],
      },
      {
        id: 'video-sdk-ios',
        label: '视频 SDK',
        info: '适用于音视频通话、互动直播和极速直播的实时互动 SDK',
        versions: [
          version('4.7.0-video-sdk-ios-full', '版本 4.7.0 Full（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_iOS_v4.7.0_FULL.zip',
            md5: '044dafd641e8d44b9e2583c5481aeaa8',
            packageSize: '31.69 MB',
            packageName: 'AgoraRtcEngineKit',
          }),
          version('4.7.0-video-sdk-ios-lite', '版本 4.7.0 Lite（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_iOS_v4.7.0_LITE.zip',
            latestVariant: true,
            md5: 'c29b295befc44fe4ab5023e166e93e41',
            packageSize: '14.97 MB',
            packageName: 'AgoraRtcEngineKit',
          }),
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
          version('4.7.0-video-sdk-macos', '版本 4.7.0（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Mac_v4.7.0_FULL.zip',
            packageName: 'ShengwangRtcEngine_macOS',
          }),
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
          version('4.7.0-video-sdk-windows', '版本 4.7.0（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Windows_v4.7.0_FULL.zip',
          }),
        ],
      },
    ],
  },
];
