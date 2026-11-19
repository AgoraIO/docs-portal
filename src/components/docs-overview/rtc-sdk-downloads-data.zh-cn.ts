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
          version('4.7.1-voice-sdk-android', '版本 4.7.1（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.7.1_VOICE.zip',
            md5: 'ad3318830f59fe7343a0e4675d9e5853',
            packageSize:
              'armeabi-v7a 5.23 MB；arm64-v8a 5.79 MB；x86 5.55 MB；x86_64 5.41 MB',
            packageName: 'io.agora.rtc2.voice',
            releaseDate: '2026 年 11 月 18 日',
          }),
        ],
      },
      {
        id: 'video-sdk-android',
        label: '视频 SDK',
        info: '适用于音视频通话、互动直播和极速直播的实时互动 SDK',
        versions: [
          version('4.7.1-video-sdk-android-full', '版本 4.7.1 Full（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.7.1_FULL.zip',
            md5: 'c3b3cbfae32ca1fe12d464e2577843b3',
            packageSize:
              'armeabi-v7a 15.26 MB；arm64-v8a 16.03 MB；x86 16.63 MB；x86_64 16.30 MB',
            packageName: 'io.agora.rtc2.video',
            releaseDate: '2026 年 11 月 18 日',
          }),
          version('4.7.1-video-sdk-android-lite', '版本 4.7.1 Lite（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.7.1_LITE.zip',
            latestVariant: true,
            md5: 'f5a7e98abe8b10d3b013c8ead1dec286',
            packageSize:
              'armeabi-v7a 7.40 MB；arm64-v8a 8.07 MB；x86 8.12 MB；x86_64 7.97 MB',
            packageName: 'io.agora.rtc2.video',
            releaseDate: '2026 年 11 月 18 日',
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
          version('4.7.1-voice-sdk-ios', '版本 4.7.1（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_iOS_v4.7.1_VOICE.zip',
            md5: 'afcb69331a575f86eb212494b13ca985',
            packageSize: '13.26 MB',
            packageName: 'AgoraRtcKit',
            releaseDate: '2026 年 11 月 18 日',
          }),
        ],
      },
      {
        id: 'video-sdk-ios',
        label: '视频 SDK',
        info: '适用于音视频通话、互动直播和极速直播的实时互动 SDK',
        versions: [
          version('4.7.1-video-sdk-ios-full', '版本 4.7.1 Full（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_iOS_v4.7.1_FULL.zip',
            md5: 'e5e4c3f036426e251c2b3ed4feaaea1c',
            packageSize: '34.35 MB',
            packageName: 'AgoraRtcKit',
            releaseDate: '2026 年 11 月 18 日',
          }),
          version('4.7.1-video-sdk-ios-lite', '版本 4.7.1 Lite（最新）', {
            downloadLink:
              'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_iOS_v4.7.1_LITE.zip',
            latestVariant: true,
            md5: '9506b191ee9592a75bc8645577aa68ac',
            packageSize: '15.95 MB',
            packageName: 'AgoraRtcKit',
            releaseDate: '2026 年 11 月 18 日',
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
            packageName: 'AgoraRtcKit',
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
