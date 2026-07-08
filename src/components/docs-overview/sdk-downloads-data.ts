export type SdkDownloadVersion = {
  downloadLink?: string;
  id: string;
  label: string;
  md5?: string;
  packageName?: string;
  packageManager?: string;
  releaseDate?: string;
};

export type SdkDownloadProduct = {
  id: string;
  info: string;
  label: string;
  versions: readonly SdkDownloadVersion[];
};

export type SdkDownloadPlatform = {
  addOns?: readonly SdkDownloadProduct[];
  core: readonly SdkDownloadProduct[];
  id: string;
  label: string;
};

export const sdkDownloadPlatforms: readonly SdkDownloadPlatform[] = [
  {
    id: 'typescript',
    label: 'TypeScript',
    core: [
      {
        id: 'agents-sdk-typescript',
        label: 'Agora Agents SDK',
        info: 'SDK for: Conversational AI — build and run server-side voice agents',
        versions: [
          {
            id: '2.3.1-agents-sdk-typescript',
            label: 'Version 2.3.1 (Latest)',
            packageManager: 'https://www.npmjs.com/package/agora-agents/v/2.3.1',
          },
        ],
      },
    ],
  },
  {
    id: 'python',
    label: 'Python',
    core: [
      {
        id: 'agents-sdk-python',
        label: 'Agora Agents SDK',
        info: 'SDK for: Conversational AI — build and run server-side voice agents',
        versions: [
          {
            id: '2.3.0-agents-sdk-python',
            label: 'Version 2.3.0 (Latest)',
            packageManager: 'https://pypi.org/project/agora-agents/',
          },
        ],
      },
    ],
  },
  {
    id: 'go',
    label: 'Go',
    core: [
      {
        id: 'agents-sdk-go',
        label: 'Agora Agents SDK',
        info: 'SDK for: Conversational AI — build and run server-side voice agents',
        versions: [
          {
            id: '2.3.1-agents-sdk-go',
            label: 'Version 2.3.1 (Latest)',
            packageManager:
              'https://pkg.go.dev/github.com/AgoraIO/agora-agents-go/v2@v2.3.1',
          },
        ],
      },
    ],
  },
  {
    id: 'android',
    label: 'Android',
    core: [
      {
        id: 'voice-sdk-android',
        label: 'Voice SDK',
        info: 'SDK for Voice Calling, Interactive Live Streaming (voice only), and Broadcast Streaming (voice only)',
        versions: [
          {
            id: '4.6.3-voice-sdk-android',
            label: 'Version 4.6.3 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.3_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.6.3/aar',
          },
          {
            id: '4.6.2-voice-sdk-android',
            label: 'Version 4.6.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.2_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.6.2/aar',
          },
          {
            id: '4.6.1-voice-sdk-android',
            label: 'Version 4.6.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.1_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.6.1/aar',
          },
          {
            id: '4.6.0-voice-sdk-android',
            label: 'Version 4.6.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.0_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.6.0/aar',
          },
          {
            id: '4.5.2-voice-sdk-android',
            label: 'Version 4.5.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.5.2_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.5.2/aar',
          },
          {
            id: '4.5.1-voice-sdk-android',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.5.1_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.5.1/aar',
          },
          {
            id: '4.5.0-voice-sdk-android',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.5.0_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.5.0/aar',
          },
          {
            id: '4.4.1-voice-sdk-android',
            label: 'Version 4.4.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.4.1_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.4.1/aar',
          },
          {
            id: '4.4.0-voice-sdk-android',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.4.0_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.4.0/aar',
          },
          {
            id: '4.3.2-voice-sdk-android',
            label: 'Version 4.3.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.3.2_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.3.2/aar',
          },
          {
            id: '4.3.1-voice-sdk-android',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.3.1_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.3.1/aar',
          },
          {
            id: '4.3.0-voice-sdk-android',
            label: 'Version 4.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.3.0_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.3.0/aar',
          },
          {
            id: '4.2.6-voice-sdk-android',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.2.6_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.2.6/aar',
          },
          {
            id: '4.2.3-voice-sdk-android',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_rel.v4.2.3_53581_VOICE_20231008_1754_279680.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.2.3/aar',
          },
          {
            id: '4.2.2-voice-sdk-android',
            label: 'Version 4.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.2.2_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.2.2/aar',
          },
          {
            id: '4.2.1-voice-sdk-android',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.2.1_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.2.1/aar',
          },
          {
            id: '4.2.0-voice-sdk-android',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.2.0_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.2.0/aar',
          },
          {
            id: '4.1.1-voice-sdk-android',
            label: 'Version 4.1.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.1.1_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.1.1/aar',
          },
          {
            id: '4.1.0-voice-sdk-android',
            label: 'Version 4.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_V4.1.0_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.1.0-1/aar',
          },
          {
            id: '4.0.1-voice-sdk-android',
            label: 'Version 4.0.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.0.1_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.0.1/aar',
          },
          {
            id: '3.7.2.1-voice-sdk-android',
            label: 'Version 3.7.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v3.7.2.1_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/3.7.1/aar',
          },
          {
            id: '3.7.2-voice-sdk-android',
            label: 'Version 3.7.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_V3.7.2_VOICE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/3.7.2/aar',
          },
        ],
      },
      {
        id: 'video-sdk-android',
        label: 'Video SDK',
        info: 'SDK for Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '4.6.3-video-sdk-android',
            label: 'Version 4.6.3 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.3_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.6.3/aar',
          },
          {
            id: '4.6.3-video-sdk-android-lite',
            label: 'Version 4.6.3 Lite (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.3_LITE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/lite-sdk/4.6.3/aar',
          },
          {
            id: '4.6.2-video-sdk-android',
            label: 'Version 4.6.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.2_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.6.2/aar',
          },
          {
            id: '4.6.2-video-sdk-android-lite',
            label: 'Version 4.6.2 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.2_LITE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/lite-sdk/4.6.2/aar',
          },
          {
            id: '4.6.1-video-sdk-android',
            label: 'Version 4.6.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.1_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.6.1/aar',
          },
          {
            id: '4.6.1-video-sdk-android-lite',
            label: 'Version 4.6.1 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.1_LITE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/lite-sdk/4.6.1/aar',
          },
          {
            id: '4.6.0-video-sdk-android',
            label: 'Version 4.6.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.0_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.6.0/aar',
          },
          {
            id: '4.6.0-video-sdk-android-lite',
            label: 'Version 4.6.0 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.0_LITE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/lite-sdk/4.6.0/aar',
          },
          {
            id: '4.5.2-video-sdk-android',
            label: 'Version 4.5.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.5.2_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.5.2/aar',
          },
          {
            id: '4.5.2-video-sdk-android-lite',
            label: 'Version 4.5.2 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.5.2_LITE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/lite-sdk/4.5.2/aar',
          },
          {
            id: '4.5.1-video-sdk-android',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.5.1_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.5.1/aar',
          },
          {
            id: '4.5.1-video-sdk-android-lite',
            label: 'Version 4.5.1 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.5.1_LITE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/lite-sdk/4.5.1/aar',
          },
          {
            id: '4.5.0-video-sdk-android',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.5.0_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.5.0/aar',
          },
          {
            id: '4.5.0-video-sdk-android-lite',
            label: 'Version 4.5.0 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.5.0_LITE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/lite-sdk/4.5.0/aar',
          },
          {
            id: '4.4.1-video-sdk-android',
            label: 'Version 4.4.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.4.1_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.4.1/aar',
          },
          {
            id: '4.4.1-video-sdk-android-lite',
            label: 'Version 4.4.1 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.4.1_LITE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/lite-sdk/4.4.1/aar',
          },
          {
            id: '4.4.0-video-sdk-android',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.4.0_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.4.0/aar',
          },
          {
            id: '4.4.0-video-sdk-android-lite',
            label: 'Version 4.4.0 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.4.0_LITE.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/lite-sdk/4.4.0/aar',
          },
          {
            id: '4.3.2-video-sdk-android',
            label: 'Version 4.3.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.3.2_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.3.2/aar',
          },
          {
            id: '4.3.1-video-sdk-android',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.3.1_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.3.1/aar',
          },
          {
            id: '4.3.0-video-sdk-android',
            label: 'Version 4.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.3.0_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.3.0/aar',
          },
          {
            id: '4.2.6-video-sdk-android',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.2.6_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.2.6/aar',
          },
          {
            id: '4.2.3-video-sdk-android',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_rel.v4.2.3_53580_FULL_20231008_1757_279679.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.2.3/aar',
          },
          {
            id: '4.2.2-video-sdk-android',
            label: 'Version 4.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.2.2_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.2.2/aar',
          },
          {
            id: '4.2.1-video-sdk-android',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.2.1_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.2.1/aar',
          },
          {
            id: '4.2.0-video-sdk-android',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.2.0_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.2.0/aar',
          },
          {
            id: '4.1.1-video-sdk-android',
            label: 'Version 4.1.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.1.1_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.1.1/aar',
          },
          {
            id: '4.1.0-video-sdk-android',
            label: 'Version 4.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_V4.1.0_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.1.0/aar',
          },
          {
            id: '4.0.1-video-sdk-android',
            label: 'Version 4.0.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.0.1_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/4.0.1/aar',
          },
          {
            id: '3.7.2.1-video-sdk-android',
            label: 'Version 3.7.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v3.7.2.1_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/3.7.2.1/aar',
          },
          {
            id: '3.7.2-video-sdk-android',
            label: 'Version 3.7.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_V3.7.2_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/3.7.2/aar',
          },
          {
            id: '3.7.1-video-sdk-android',
            label: 'Version 3.7.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v3.7.1_FULL.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/full-sdk/3.7.1/aar',
          },
        ],
      },
      {
        id: 'rtm-sdk-android',
        label: 'Signaling SDK',
        info: 'SDK for Signaling',
        versions: [
          {
            id: '2.2.8-rtm-sdk-android',
            label: 'Version 2.2.8 (Latest)',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v2.2.8.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.2.8',
          },
          {
            id: '2.2.6-rtm-sdk-android',
            label: 'Version 2.2.6',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v2.2.6.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.2.6',
          },
          {
            id: '2.2.4-rtm-sdk-android',
            label: 'Version 2.2.4',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v2.2.4.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.2.4',
          },
          {
            id: '2.2.2-rtm-sdk-android',
            label: 'Version 2.2.2',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v2.2.2.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.2.2',
          },
          {
            id: '2.2.1-rtm-sdk-android',
            label: 'Version 2.2.1',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v2.2.1.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.2.1',
          },
          {
            id: '2.1.12-rtm-sdk-android',
            label: 'Version 2.1.12',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v2.1.12.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.1.12',
          },
          {
            id: '2.1.11-rtm-sdk-android',
            label: 'Version 2.1.11',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v2.1.11.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.1.11',
          },
          {
            id: '2.1.10-rtm-sdk-android',
            label: 'Version 2.1.10',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v2.1.10.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.1.10',
          },
          {
            id: '2.1.9-rtm-sdk-android',
            label: 'Version 2.1.9',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v219.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.1.9',
          },
          {
            id: '2.1.7-rtm-sdk-android',
            label: 'Version 2.1.7',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JAVA_SDK_for_Android_v217.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtm/rtm-sdk/2.1.7',
          },
          {
            id: '1.5.3-rtm-sdk-android',
            label: 'Version 1.5.3',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_Android_v1_5_3.zip',
          },
          {
            id: '1.5.2-rtm-sdk-android',
            label: 'Version 1.5.2',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_Android_v1_5_2.zip',
          },
          {
            id: '1.5.1-rtm-sdk-android',
            label: 'Version 1.5.1',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_Android_v1_5_1.zip',
          },
        ],
      },
      {
        id: 'chat-sdk-android',
        label: 'Chat SDK',
        info: 'SDK for Chat',
        versions: [
          {
            id: '1.3.2-chat-sdk-android',
            label: 'Version 1.3.2 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_3_2.zip',
            packageManager:
              'https://search.maven.org/artifact/io.agora.rtc/chat-sdk/1.3.2/aar',
          },
          {
            id: '1.3.1-chat-sdk-android',
            label: 'Version 1.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_3_1.zip',
            packageManager:
              'https://search.maven.org/artifact/io.agora.rtc/chat-sdk/1.3.1/aar',
          },
          {
            id: '1.3.0-chat-sdk-android',
            label: 'Version 1.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_3_0.zip',
            packageManager:
              'https://search.maven.org/artifact/io.agora.rtc/chat-sdk/1.3.0/aar',
          },
          {
            id: '1.2.1-chat-sdk-android',
            label: 'Version 1.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_2_1.zip',
            packageManager:
              'https://search.maven.org/artifact/io.agora.rtc/chat-sdk/1.2.1/aar',
          },
          {
            id: '1.2.0-chat-sdk-android',
            label: 'Version 1.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_2_0.zip',
            packageManager:
              'https://search.maven.org/artifact/io.agora.rtc/chat-sdk/1.2.0/aar',
          },
          {
            id: '1.1.0-chat-sdk-android',
            label: 'Version 1.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_1_0.zip',
            packageManager:
              'https://search.maven.org/artifact/io.agora.rtc/chat-sdk/1.1.0/aar',
          },
          {
            id: '1.0.9-chat-sdk-android',
            label: 'Version 1.0.9',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_0_9.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/chat-sdk/1.0.9/aar',
          },
          {
            id: '1.0.8-chat-sdk-android',
            label: 'Version 1.0.8',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_0_8.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/chat-sdk/1.0.8/aar',
          },
          {
            id: '1.0.7-chat-sdk-android',
            label: 'Version 1.0.7',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_0_7.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/chat-sdk/1.0.7/aar',
          },
          {
            id: '1.0.6-chat-sdk-android',
            label: 'Version 1.0.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_SDK_for_Android_v1_0_6.zip',
            packageManager:
              'https://central.sonatype.com/artifact/io.agora.rtc/chat-sdk/1.0.6/aar',
          },
        ],
      },
      {
        id: 'iot-sdk-android',
        label: 'IoT SDK',
        info: 'SDK for Embedded Devices',
        versions: [
          {
            id: 'Agora-RTSALite-LJAutRmAcAjCP-Android-v1.8.0',
            label: 'Version 1.8.0 (Latest)',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTSALite-LJAutRmAcAjCP-Android-v1.8.0-20230421_161341-262178.tgz',
          },
        ],
      },
      {
        id: 'interactive-whiteboard-android',
        label: 'Interactive Whiteboard SDK',
        info: 'SDK for Interactive Whiteboard',
        versions: [
          {
            id: '2.16.100-interactive-whiteboard-android',
            label: 'Version 2.16.100 (Latest)',
            packageManager:
              'https://github.com/netless-io/whiteboard-android/releases/tag/2.16.100',
          },
          {
            id: '2.16.86-interactive-whiteboard-android',
            label: 'Version 2.16.86',
            packageManager:
              'https://github.com/netless-io/whiteboard-android/releases/tag/2.16.86',
          },
          {
            id: '2.16.81-interactive-whiteboard-android',
            label: 'Version 2.16.81 ',
            packageManager:
              'https://github.com/netless-io/whiteboard-android/releases/tag/2.16.81',
          },
          {
            id: '2.16.59-interactive-whiteboard-android',
            label: 'Version 2.16.59',
            packageManager:
              'https://github.com/netless-io/whiteboard-android/releases/tag/2.16.59',
          },
        ],
      },
      {
        id: 'fastboard-android',
        label: 'Interactive Whiteboard Fastboard',
        info: 'SDK for: Interactive Whiteboard Fastboard',
        versions: [
          {
            id: '1.7.2-fastboard-android',
            label: 'Version 1.7.2 (Latest)',
            packageManager:
              'https://github.com/netless-io/fastboard-android/releases/tag/1.7.2',
          },
          {
            id: '1.6.2-fastboard-android',
            label: 'Version 1.6.2',
            packageManager:
              'https://github.com/netless-io/fastboard-android/releases/tag/1.6.2',
          },
          {
            id: '1.6.0-fastboard-android',
            label: 'Version 1.6.0',
            packageManager:
              'https://github.com/netless-io/fastboard-android/releases/tag/1.6.0',
          },
          {
            id: '1.3.4-fastboard-android',
            label: 'Version 1.3.4',
            packageManager:
              'https://github.com/netless-io/fastboard-android/releases/tag/1.3.4',
          },
        ],
      },
      {
        id: 'mediaplayer-kit-android',
        label: 'Mediaplayer Kit SDK',
        info: 'SDK for Mediaplayer Kit',
        versions: [
          {
            id: '1.3.0-mediaplayer-kit-android',
            label: 'version 1.3.0 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Media_Player_for_Android_rel.v1.3.0_14564_ffmpeg_player_lite_20210723_1234.zip',
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
        label: 'Voice SDK',
        info: 'SDK for Voice Calling, Interactive Live Streaming (voice only), and Broadcast Streaming (voice only)',
        versions: [
          {
            id: '4.6.2-voice-sdk-ios',
            label: 'Version 4.6.2 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.6.2_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.6.0-voice-sdk-ios',
            label: 'Version 4.6.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.6.0_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.5.2-voice-sdk-ios',
            label: 'Version 4.5.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.5.2_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.5.1-voice-sdk-ios',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.5.1_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.5.0-voice-sdk-ios',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.5.0_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.4.0-voice-sdk-ios',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.4.0_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.3.2-voice-sdk-ios',
            label: 'Version 4.3.2 ',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.3.2_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.3.1-voice-sdk-ios',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.3.1_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.3.0-voice-sdk-ios',
            label: 'Version 4.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.3.0_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.2.6-voice-sdk-ios',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.2.6_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.2.3-voice-sdk-ios',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_rel.v4.2.3_67502_VOICE_20231008_1754_279683.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.2.2-voice-sdk-ios',
            label: 'Version 4.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.2.2_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.2.1-voice-sdk-ios',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.2.1_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.2.0-voice-sdk-ios',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.2.0_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.1.1-voice-sdk-ios',
            label: 'Version 4.1.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.1.1_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.1.0-voice-sdk-ios',
            label: 'Version 4.1.0 ',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_V4.1.0_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '4.0.1-voice-sdk-ios',
            label: 'Version 4.0.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.0.1_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '3.7.2-voice-sdk-ios',
            label: 'Version 3.7.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v3.7.2_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
          {
            id: '3.7.1-voice-sdk-ios',
            label: 'Version 3.7.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v3.7.1_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS',
          },
        ],
      },
      {
        id: 'video-sdk-ios',
        label: 'Video SDK',
        info: 'SDK for Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '4.6.2-video-sdk-ios',
            label: 'Version 4.6.2 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.6.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.6.2-video-sdk-ios-lite',
            label: 'Version 4.6.2 Lite (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.6.2_LITE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraLite_iOS',
          },
          {
            id: '4.6.0-video-sdk-ios',
            label: 'Version 4.6.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.6.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.6.0-video-sdk-ios-lite',
            label: 'Version 4.6.0 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.6.0_LITE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraLite_iOS',
          },
          {
            id: '4.5.2-video-sdk-ios',
            label: 'Version 4.5.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.5.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.5.2-video-sdk-ios-lite',
            label: 'Version 4.5.2 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.5.2_LITE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraLite_iOS',
          },
          {
            id: '4.5.1-video-sdk-ios',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.5.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.5.1-video-sdk-ios-lite',
            label: 'Version 4.5.1 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.5.1_LITE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraLite_iOS',
          },
          {
            id: '4.5.0-video-sdk-ios',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.5.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.5.0-video-sdk-ios-lite',
            label: 'Version 4.5.0 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.5.0_LITE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraLite_iOS',
          },
          {
            id: '4.4.0-video-sdk-ios',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.4.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.4.0-video-sdk-ios-lite',
            label: 'Version 4.4.0 Lite',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.4.0_LITE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraLite_iOS',
          },
          {
            id: '4.3.2-video-sdk-ios',
            label: 'Version 4.3.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.3.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.3.1-video-sdk-ios',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.3.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.3.0-video-sdk-ios',
            label: 'Version 4.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.3.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.2.6-video-sdk-ios',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.2.6_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.2.3-video-sdk-ios',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_rel.v4.2.3_67501_FULL_20231008_1801_279682.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.2.2-video-sdk-ios',
            label: 'Version 4.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.2.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.2.1-video-sdk-ios',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.2.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.2.0-video-sdk-ios',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.2.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.1.1-video-sdk-ios',
            label: 'Version 4.1.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.1.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.1.0-video-sdk-ios',
            label: 'Version 4.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_V4.1.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '4.0.1-video-sdk-ios',
            label: 'Version 4.0.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v4.0.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '3.7.2-video-sdk-ios',
            label: 'Version 3.7.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v3.7.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
          {
            id: '3.7.1-video-sdk-ios',
            label: 'Version 3.7.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_iOS_v3.7.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_iOS',
          },
        ],
      },
      {
        id: 'rtm-sdk-ios',
        label: 'Signaling SDK',
        info: 'SDK for Signaling',
        versions: [
          {
            id: '2.2.8-rtm-sdk-ios',
            label: 'Version 2.2.8 (Latest)',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.8.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.2.6-rtm-sdk-ios',
            label: 'Version 2.2.6',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.6.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.2.4-rtm-sdk-ios',
            label: 'Version 2.2.4',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.4.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.2.2-rtm-sdk-ios',
            label: 'Version 2.2.2',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.2.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.2.1-rtm-sdk-ios',
            label: 'Version 2.2.1',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.1.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.12-rtm-sdk-ios',
            label: 'Version 2.1.12',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v2.1.12.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.11-rtm-sdk-ios',
            label: 'Version 2.1.11',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v2.1.11.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.10-rtm-sdk-ios',
            label: 'Version 2.1.10',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v2.1.10.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.9-rtm-sdk-ios',
            label: 'Version 2.1.9',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v219.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.7-rtm-sdk-ios',
            label: 'Version 2.1.7',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v217.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '1.5.1-rtm-sdk-ios',
            label: 'Version 1.5.1',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_iOS_v1_5_1.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRTM_iOS',
          },
        ],
      },
      {
        id: 'chat-sdk-ios',
        label: 'Chat SDK',
        info: 'SDK for Chat',
        versions: [
          {
            id: '1.3.1-chat-sdk-ios',
            label: 'Version 1.3.1 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/AgoraChat1_3_1.xcframework.zip',
            packageManager: 'https://github.com/AgoraIO/AgoraChat_iOS.git',
          },
          {
            id: '1.3.0-chat-sdk-ios',
            label: 'Version 1.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/AgoraChat1_3_0.zip',
            packageManager: 'https://github.com/AgoraIO/AgoraChat_iOS.git',
          },
          {
            id: '1.2.0-chat-sdk-ios',
            label: 'Version 1.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/AgoraChat1_2_0.xcframework.zip',
            packageManager: 'https://github.com/AgoraIO/AgoraChat_iOS.git',
          },
          {
            id: '1.1.0-chat-sdk-ios',
            label: 'Version 1.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/AgoraChat1_1_0.xcframework.zip',
            packageManager: 'https://github.com/AgoraIO/AgoraChat_iOS.git',
          },
          {
            id: '1.0.9-chat-sdk-ios',
            label: 'Version 1.0.9',
            downloadLink:
              'https://download.agora.io/sdk/release/AgoraChat1_0_9.xcframework.zip',
            packageManager: 'https://github.com/AgoraIO/AgoraChat_iOS.git',
          },
          {
            id: '1.0.8-chat-sdk-ios',
            label: 'Version 1.0.8',
            downloadLink:
              'https://download.agora.io/sdk/release/AgoraChat_iOS_1_0_8.zip',
            packageManager: 'https://github.com/AgoraIO/AgoraChat_iOS.git',
          },
          {
            id: '1.0.7-chat-sdk-ios',
            label: 'Version 1.0.7',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Chat_SDK_for_iOS_v1_0_7.zip',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
          {
            id: '1.0.6-chat-sdk-ios',
            label: 'Version 1.0.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_CHAT_Native_SDK_for_iOS_v1_0_6.zip',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
        ],
      },
      {
        id: 'interactive-whiteboard-ios',
        label: 'Interactive Whiteboard SDK',
        info: 'SDK for Interactive Whiteboard',
        versions: [
          {
            id: '2.16.112-interactive-whiteboard-ios',
            label: 'Version 2.16.112 (Latest)',
            packageManager:
              'https://github.com/netless-io/Whiteboard-iOS/releases/tag/2.16.112',
          },
          {
            id: '2.16.95-interactive-whiteboard-ios',
            label: 'Version 2.16.95',
            packageManager:
              'https://github.com/netless-io/Whiteboard-iOS/releases/tag/2.16.95',
          },
          {
            id: '2.16.88-interactive-whiteboard-ios',
            label: 'Version 2.16.88',
            packageManager:
              'https://github.com/netless-io/Whiteboard-iOS/releases/tag/2.16.88',
          },
          {
            id: '2.16.62-interactive-whiteboard-ios',
            label: 'Version 2.16.62',
            packageManager:
              'https://github.com/netless-io/Whiteboard-iOS/releases/tag/2.16.62',
          },
        ],
      },
      {
        id: 'fastboard-ios',
        label: 'Interactive Whiteboard Fastboard',
        info: 'SDK for: Interactive Whiteboard Fastboard',
        versions: [
          {
            id: '1.4.2-fastboard-ios',
            label: 'Version 1.4.2 (Latest)',
            packageManager:
              'https://github.com/netless-io/fastboard-iOS/releases/tag/1.4.2',
          },
          {
            id: '1.4.0-fastboard-ios',
            label: 'Version 1.4.0',
            packageManager:
              'https://github.com/netless-io/fastboard-iOS/releases/tag/1.4.0',
          },
          {
            id: '1.2.2-fastboard-ios',
            label: 'Version 1.2.2',
            packageManager:
              'https://github.com/netless-io/fastboard-iOS/releases/tag/1.2.2',
          },
        ],
      },
      {
        id: 'mediaplayer-kit-ios',
        label: 'Mediaplayer Kit SDK',
        info: 'SDK for Mediaplayer Kit',
        versions: [
          {
            id: '1.3.0-mediaplayer-kit-ios',
            label: 'version 1.3.0 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Media_Player_for_iOS_rel.v1.3.0_53009_ffmpeg_player_lite_20210702_1606.zip',
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
        id: 'voice-sdk-web',
        label: 'Voice SDK',
        info: 'SDK for Voice Calling, Interactive Live Streaming (voice only), and Broadcast Streaming (voice only)',
        versions: [
          {
            id: '4.24.5-voice-sdk-web',
            label: 'Version 4.24.5 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_5_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.5',
          },
          {
            id: '4.24.4-voice-sdk-web',
            label: 'Version 4.24.4',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_4_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.4',
          },
          {
            id: '4.24.3-voice-sdk-web',
            label: 'Version 4.24.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_3_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.3',
          },
          {
            id: '4.24.2-voice-sdk-web',
            label: 'Version 4.24.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_2_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.2',
          },
          {
            id: '4.24.1-voice-sdk-web',
            label: 'Version 4.24.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_1_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.1',
          },
          {
            id: '4.24.0-voice-sdk-web',
            label: 'Version 4.24.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.4-voice-sdk-web',
            label: 'Version 4.23.4',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_4_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.3-voice-sdk-web',
            label: 'Version 4.23.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_3_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.2-voice-sdk-web',
            label: 'Version 4.23.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.1-voice-sdk-web',
            label: 'Version 4.23.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.0-voice-sdk-web',
            label: 'Version 4.23.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.22.2-voice-sdk-web',
            label: 'Version 4.22.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_22_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.22.1-voice-sdk-web',
            label: 'Version 4.22.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_22_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.22.0-voice-sdk-web',
            label: 'Version 4.22.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_22_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.21.2-voice-sdk-web',
            label: 'Version 4.21.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_21_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.20.2-voice-sdk-web',
            label: 'Version 4.20.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_20_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.20.1-voice-sdk-web',
            label: 'Version 4.20.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_20_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.20.0-voice-sdk-web',
            label: 'Version 4.20.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_20_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.19.3-voice-sdk-web',
            label: 'Version 4.19.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_19_3_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.19.2-voice-sdk-web',
            label: 'Version 4.19.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_19_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.19.1-voice-sdk-web',
            label: 'Version 4.19.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_19_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.19.0-voice-sdk-web',
            label: 'Version 4.19.0 ',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_19_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.18.3-voice-sdk-web',
            label: 'Version 4.18.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_18_3_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.18.2-voice-sdk-web',
            label: 'Version 4.18.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_18_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.18.1-voice-sdk-web',
            label: 'Version 4.18.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_18_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.18.0-voice-sdk-web',
            label: 'Version 4.18.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_18_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.17.2-voice-sdk-web',
            label: 'Version 4.17.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_17_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.17.1-voice-sdk-web',
            label: 'Version 4.17.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_17_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.17.0-voice-sdk-web',
            label: 'Version 4.17.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_17_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.16.1-voice-sdk-web',
            label: 'Version 4.16.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_16_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.16.0-voice-sdk-web',
            label: 'Version 4.16.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_16_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.15.1-voice-sdk-web',
            label: 'Version 4.15.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_15_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.15.0-voice-sdk-web',
            label: 'Version 4.15.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_15_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.14.2-voice-sdk-web',
            label: 'Version 4.14.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_14_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.14.1-voice-sdk-web',
            label: 'Version 4.14.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_14_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.14.0-voice-sdk-web',
            label: 'Version 4.14.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_14_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
        ],
      },
      {
        id: 'video-sdk-web',
        label: 'Video SDK',
        info: 'SDK for: Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '4.24.5-video-sdk-web',
            label: 'Version 4.24.5 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_5_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.5',
          },
          {
            id: '4.24.4-video-sdk-web',
            label: 'Version 4.24.4',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_4_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.4',
          },
          {
            id: '4.24.3-video-sdk-web',
            label: 'Version 4.24.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_3_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.3',
          },
          {
            id: '4.24.2-video-sdk-web',
            label: 'Version 4.24.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_2_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.2',
          },
          {
            id: '4.24.1-video-sdk-web',
            label: 'Version 4.24.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_1_FULL.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.1',
          },
          {
            id: '4.24.0-video-sdk-web',
            label: 'Version 4.24.0 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.4-video-sdk-web',
            label: 'Version 4.23.4',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_4_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.3-video-sdk-web',
            label: 'Version 4.23.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_3_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.2-video-sdk-web',
            label: 'Version 4.23.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.1-video-sdk-web',
            label: 'Version 4.23.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.23.0-video-sdk-web',
            label: 'Version 4.23.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_23_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.22.2-video-sdk-web',
            label: 'Version 4.22.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_22_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.22.1-video-sdk-web',
            label: 'Version 4.22.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_22_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.22.0-video-sdk-web',
            label: 'Version 4.22.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_22_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.21.0-video-sdk-web',
            label: 'Version 4.21.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_21_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.20.2-video-sdk-web',
            label: 'Version 4.20.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_20_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.20.1-video-sdk-web',
            label: 'Version 4.20.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_20_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.20.0-video-sdk-web',
            label: 'Version 4.20.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_20_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.19.3-video-sdk-web',
            label: 'Version 4.19.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_19_3_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.19.2-video-sdk-web',
            label: 'Version 4.19.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_19_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.19.1-video-sdk-web',
            label: 'Version 4.19.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_19_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.19.0-video-sdk-web',
            label: 'Version 4.19.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_19_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.18.3-video-sdk-web',
            label: 'Version 4.18.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_18_3_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.18.2-video-sdk-web',
            label: 'Version 4.18.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_18_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.18.1-video-sdk-web',
            label: 'Version 4.18.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_18_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.18.0-video-sdk-web',
            label: 'Version 4.18.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_18_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.17.2-video-sdk-web',
            label: 'Version 4.17.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_17_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.17.1-video-sdk-web',
            label: 'Version 4.17.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_17_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.17.0-video-sdk-web',
            label: 'Version 4.17.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_17_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.16.1-video-sdk-web',
            label: 'Version 4.16.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_16_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.16.0-video-sdk-web',
            label: 'Version 4.16.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_16_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.15.1-video-sdk-web',
            label: 'Version 4.15.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_15_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.15.0-video-sdk-web',
            label: 'Version 4.15.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_15_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.14.2-video-sdk-web',
            label: 'Version 4.14.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_14_2_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.14.1-video-sdk-web',
            label: 'Version 4.14.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_14_1_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
          {
            id: '4.14.0-video-sdk-web',
            label: 'Version 4.14.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_14_0_FULL.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtc-sdk-ng',
          },
        ],
      },
      {
        id: 'rtm-sdk-web',
        label: 'Signaling SDK',
        info: 'SDK for: Signaling',
        versions: [
          {
            id: '2.2.4-signaling-sdk-web',
            label: 'Version 2.2.4 (Latest)',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.2.4.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtm-sdk/v/2.2.4',
          },
          {
            id: '2.2.3-signaling-sdk-web',
            label: 'Version 2.2.3',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.2.3.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtm-sdk/v/2.2.3',
          },
          {
            id: '2.2.2-signaling-sdk-web',
            label: 'Version 2.2.2',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.2.2.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtm-sdk/v/2.2.2',
          },
          {
            id: '2.2.1-signaling-sdk-web',
            label: 'Version 2.2.1',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.2.1.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtm-sdk/v/2.2.1',
          },
          {
            id: '2.2.0-signaling-sdk-web',
            label: 'Version 2.2.0',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.2.0.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtm-sdk/v/2.2.0',
          },
          {
            id: '2.1.10-signaling-sdk-web',
            label: 'Version 2.1.10',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.1.10.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtm-sdk/v/2.1.10',
          },
          {
            id: '2.1.9-signaling-sdk-web',
            label: 'Version 2.1.9',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.1.9.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtm-sdk/v/2.1.9',
          },
          {
            id: '2.1.7-signaling-sdk-web',
            label: 'Version 2.1.7',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v217.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtm-sdk/v/2.1.7',
          },
          {
            id: '2.1.5-signaling-sdk-web',
            label: 'Version 2.1.5',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v215.zip',
            packageManager:
              'https://www.npmjs.com/package/agora-rtm-sdk/v/2.1.5',
          },
          {
            id: '1.5.1-rtm-sdk-web',
            label: 'Version 1.5.1',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_Web_v1.5.1.zip',
            packageManager: 'https://www.npmjs.com/package/agora-rtm-sdk',
          },
        ],
      },
      {
        id: 'chat-sdk-web',
        label: 'Chat SDK',
        info: 'SDK for: Chat',
        versions: [
          {
            id: '1.3.1-chat-sdk-web',
            label: 'Version 1.3.1 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/agora-chat-1.3.1.zip',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
          {
            id: '1.3.0-chat-sdk-web',
            label: 'Version 1.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora-chat-1.3.0.zip',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
          {
            id: '1.2.0-chat-sdk-web',
            label: 'Version 1.2.0',
            downloadLink:
              'https://downloadsdk.easemob.com/downloads/AgoraChat/Web/agora-chat-sdk/agora-chat-1.2.0.zip',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
          {
            id: '1.1.0-chat-sdk-web',
            label: 'Version 1.1.0',
            downloadLink:
              'https://downloadsdk.easemob.com/downloads/AgoraChat/Web/agora-chat-sdk/agora-chat-1.1.0.zip',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
          {
            id: '1.0.8-chat-sdk-web',
            label: 'Version 1.0.8',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
          {
            id: '1.0.7-chat-sdk-web',
            label: 'Version 1.0.7',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
          {
            id: '1.0.6-chat-sdk-web',
            label: 'Version 1.0.6',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
          {
            id: '1.0.5-chat-sdk-web',
            label: 'Version 1.0.5',
            packageManager: 'https://www.npmjs.com/package/agora-chat',
          },
        ],
      },
      {
        id: 'interactive-whiteboard-web',
        label: 'Interactive Whiteboard SDK',
        info: 'SDK for: Interactive Whiteboard',
        versions: [
          {
            id: '2.16.53-interactive-whiteboard-web',
            label: 'Version 2.16.53 (Latest)',
            packageManager:
              'https://www.npmjs.com/package/white-web-sdk/v/2.16.53',
          },
          {
            id: '2.16.51-interactive-whiteboard-web',
            label: 'Version 2.16.51',
            packageManager:
              'https://www.npmjs.com/package/white-web-sdk/v/2.16.51',
          },
          {
            id: '2.16.49-interactive-whiteboard-web',
            label: 'Version 2.16.49',
            packageManager:
              'https://www.npmjs.com/package/white-web-sdk/v/2.16.49',
          },
          {
            id: '2.16.43-interactive-whiteboard-web',
            label: 'Version 2.16.43',
            packageManager:
              'https://www.npmjs.com/package/white-web-sdk/v/2.16.43',
          },
        ],
      },
      {
        id: 'interactive-whiteboard-fastboard-web',
        label: 'Interactive Whiteboard Fastboard',
        info: 'SDK for: Interactive Whiteboard Fastboard',
        versions: [
          {
            id: '1.1.0-interactive-whiteboard-web',
            label: 'Version 1.1.0 (Latest)',
            packageManager:
              'https://www.npmjs.com/package/@netless/fastboard/v/1.1.0',
          },
          {
            id: '1.0.0-interactive-whiteboard-web',
            label: 'Version 1.0.0',
            packageManager:
              'https://www.npmjs.com/package/@netless/fastboard/v/1.0.0',
          },
          {
            id: '0.3.10-interactive-whiteboard-web',
            label: 'Version 0.3.10',
            packageManager:
              'https://www.npmjs.com/package/@netless/fastboard/v/0.3.10',
          },
          {
            id: '0.3.8-interactive-whiteboard-web',
            label: 'Version 0.3.8',
            packageManager:
              'https://www.npmjs.com/package/@netless/fastboard/v/0.3.8',
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
        id: 'voice-sdk-macOS',
        label: 'Voice SDK',
        info: 'SDK for: Voice Calling, Interactive Live Streaming (voice only), and Broadcast Streaming (voice only)',
        versions: [
          {
            id: '4.6.2-voice-sdk-macOS',
            label: 'Version 4.6.2 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.6.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.6.0-voice-sdk-macOS',
            label: 'Version 4.6.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.6.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.5.2-voice-sdk-macOS',
            label: 'Version 4.5.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.5.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.5.1-voice-sdk-macOS',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.5.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.5.0-voice-sdk-macOS',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.5.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.4.0-voice-sdk-macOS',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.4.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.3.2-voice-sdk-macOS',
            label: 'Version 4.3.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.3.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.3.1-voice-sdk-macOS',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.3.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.3.0-voice-sdk-macOS',
            label: 'Version 4.3.0 ',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.3.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.6-voice-sdk-macOS',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.2.6_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.3-voice-sdk-macOS',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_rel.v4.2.3_46919_FULL_20231008_1745_279681.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.2-voice-sdk-macOS',
            label: 'Version 4.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.2.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.1-voice-sdk-macOS',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.2.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.0-voice-sdk-macOS',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.2.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.1.1-voice-sdk-macOS',
            label: 'Version 4.1.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.1.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.1.0-voice-sdk-macOS',
            label: 'Version 4.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_V4.1.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.0.1-voice-sdk-macOS',
            label: 'Version 4.0.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.0.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_macOS',
          },
          {
            id: '3.7.2-voice-sdk-macOS',
            label: 'Version 3.7.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v3.7.2_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_macOS',
          },
          {
            id: '3.7.1-voice-sdk-macOS',
            label: 'Version 3.7.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v3.7.1_VOICE.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraAudio_macOS',
          },
        ],
      },
      {
        id: 'video-sdk-macOS',
        label: 'Video SDK',
        info: 'SDK for: Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '4.6.2-video-sdk-macOS',
            label: 'Version 4.6.2 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.6.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.6.0-video-sdk-macOS',
            label: 'Version 4.6.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.6.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.5.2-video-sdk-macOS',
            label: 'Version 4.5.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.5.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.5.1-video-sdk-macOS',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.5.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.5.0-video-sdk-macOS',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.5.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.4.0-video-sdk-macOS',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.4.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.3.2-video-sdk-macOS',
            label: 'Version 4.3.2 ',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.3.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.3.1-video-sdk-macOS',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.3.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.3.0-video-sdk-macOS',
            label: 'Version 4.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.3.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.6-video-sdk-macOS',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.2.6_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.3-video-sdk-macOS',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_rel.v4.2.3_46919_FULL_20231008_1745_279681.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.2-video-sdk-macOS',
            label: 'Version 4.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.2.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.1-video-sdk-macOS',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.2.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.2.0-video-sdk-macOS',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.2.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.1.1-video-sdk-macOS',
            label: 'Version 4.1.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.1.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.1.0-video-sdk-macOS',
            label: 'Version 4.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_V4.1.0_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '4.0.1-video-sdk-macOS',
            label: 'Version 4.0.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v4.0.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '3.7.2-video-sdk-macOS',
            label: 'Version 3.7.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v3.7.2_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
          {
            id: '3.7.1-video-sdk-macOS',
            label: 'Version 3.7.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Mac_v3.7.1_FULL.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRtcEngine_macOS',
          },
        ],
      },
      {
        id: 'rtm-sdk-macOS',
        label: 'Signaling SDK',
        info: 'SDK for: Signaling',
        versions: [
          {
            id: '2.2.8-rtm-sdk-macos',
            label: 'Version 2.2.8 (Latest)',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.8.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.2.6-rtm-sdk-macos',
            label: 'Version 2.2.6',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.6.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.2.4-rtm-sdk-macos',
            label: 'Version 2.2.4',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.4.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.2.2-rtm-sdk-macos',
            label: 'Version 2.2.2',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.2.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.2.1-rtm-sdk-macos',
            label: 'Version 2.2.1',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_v2.2.1.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.12-rtm-sdk-macos',
            label: 'Version 2.1.12',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v2.1.12.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.11-rtm-sdk-macos',
            label: 'Version 2.1.11',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v2.1.11.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.10-rtm-sdk-macos',
            label: 'Version 2.1.10',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v2.1.10.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.9-rtm-sdk-macos',
            label: 'Version 2.1.9',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v219.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '2.1.7-rtm-sdk-macos',
            label: 'Version 2.1.7',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_OC_SDK_for_IOS_v217.zip',
            packageManager:
              'https://github.com/CocoaPods/Specs/tree/master/Specs/7/b/0/AgoraRtm_iOS',
          },
          {
            id: '1.5.1-rtm-sdk-macOS',
            label: 'Version 1.5.1',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_Mac_v1_5_1.zip',
            packageManager:
              'https://swiftpackageindex.com/AgoraIO/AgoraRTM_macOS',
          },
        ],
      },
      {
        id: 'interactive-whiteboard-ios',
        label: 'Interactive Whiteboard SDK',
        info: 'SDK for: Interactive Whiteboard',
        versions: [
          {
            id: '2.16.46-interactive-whiteboard-ios',
            label: 'Version 2.16.46 (Latest)',
            packageManager: 'https://github.com/netless-io/whiteboard-ios',
          },
        ],
      },
      {
        id: 'mediaplayer-kit-macOS',
        label: 'Mediaplayer Kit SDK',
        info: 'SDK for: Mediaplayer Kit',
        versions: [
          {
            id: '1.3.0-mediaplayer-kit-macOS',
            label: 'version 1.3.0 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Media_Player_for_Mac_rel.v1.3.0_31754_ffmpeg_player_lite_20210716_1813.zip',
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
        label: 'Video SDK',
        info: 'SDK for: Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '4.6.2-video-sdk-react-native',
            label: 'Version 4.6.2 (Latest)',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.6.2',
          },
          {
            id: '4.5.2-video-sdk-react-native',
            label: 'Version 4.5.2',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.5.2',
          },
          {
            id: '4.5.0-video-sdk-react-native',
            label: 'Version 4.5.0',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.5.0',
          },
          {
            id: '4.4.0-video-sdk-react-native',
            label: 'Version 4.4.0',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.4.0',
          },
          {
            id: '4.3.2-video-sdk-react-native',
            label: 'Version 4.3.2',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.3.2',
          },
          {
            id: '4.3.1-video-sdk-react-native',
            label: 'Version 4.3.1',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.3.1',
          },
          {
            id: '4.3.0-build-1-video-sdk-react-native',
            label: 'Version 4.3.0-build.1',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.3.0-build.1',
          },
          {
            id: '4.3.0-video-sdk-react-native',
            label: 'Version 4.3.0',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.3.0',
          },
          {
            id: '4.2.6-video-sdk-react-native',
            label: 'Version 4.2.6',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.2.6',
          },
          {
            id: '4.2.5-video-sdk-react-native',
            label: 'Version 4.2.5',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.2.5',
          },
          {
            id: '4.2.4-video-sdk-react-native',
            label: 'Version 4.2.4',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.2.4',
          },
          {
            id: '4.2.3-video-sdk-react-native',
            label: 'Version 4.2.3',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.2.3',
          },
          {
            id: '4.2.1-video-sdk-react-native',
            label: 'Version 4.2.1',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.2.1',
          },
          {
            id: '4.2.0-video-sdk-react-native',
            label: 'Version 4.2.0',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/4.2.0',
          },
          {
            id: '4.1.0-video-sdk-react-native',
            label: 'Version 4.1.0',
            packageManager: 'https://www.npmjs.com/package/react-native-agora',
          },
          {
            id: '4.0.0-video-sdk-react-native',
            label: 'Version 4.0.0',
            packageManager: 'https://www.npmjs.com/package/react-native-agora',
          },
          {
            id: '3.7.0-video-sdk-react-native',
            label: 'Version 3.7.0',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora/v/3.7.0',
          },
        ],
      },
      {
        id: 'signaling-sdk-react-native',
        label: 'Signaling SDK',
        info: 'SDK for: Signaling',
        versions: [
          {
            id: '2.2.4-signaling-sdk-react-native',
            label: 'Version 2.2.4 (Latest)',
            packageManager:
              'https://www.npmjs.com/package/agora-react-native-rtm',
          },
        ],
      },
      {
        id: 'chat-sdk-react-native',
        label: 'Chat SDK',
        info: 'SDK for: Chat',
        versions: [
          {
            id: '1.3.6-chat-sdk-react-native',
            label: 'Version 1.3.6 (Latest)',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.3.6',
          },
          {
            id: '1.3.5-chat-sdk-react-native',
            label: 'Version 1.3.5',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.3.5',
          },
          {
            id: '1.3.4-chat-sdk-react-native',
            label: 'Version 1.3.4',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.3.4',
          },
          {
            id: '1.3.2-chat-sdk-react-native',
            label: 'Version 1.3.2',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.3.2',
          },
          {
            id: '1.3.1-chat-sdk-react-native',
            label: 'Version 1.3.1',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.3.1',
          },
          {
            id: '1.3.0-chat-sdk-react-native',
            label: 'Version 1.3.0',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.3.0',
          },
          {
            id: '1.2.1-chat-sdk-react-native',
            label: 'Version 1.2.1',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.2.1',
          },
          {
            id: '1.2.0-chat-sdk-react-native',
            label: 'Version 1.2.0',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.2.0',
          },
          {
            id: '1.1.3-chat-sdk-react-native',
            label: 'Version 1.1.3',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.1.3',
          },
          {
            id: '1.1.2-chat-sdk-react-native',
            label: 'Version 1.1.2',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.1.2',
          },
          {
            id: '1.1.1-chat-sdk-react-native',
            label: 'Version 1.1.1',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.1.1',
          },
          {
            id: '1.1.0-chat-sdk-react-native',
            label: 'Version 1.1.0',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.1.0',
          },
          {
            id: '1.0.11-chat-sdk-react-native',
            label: 'Version 1.0.11 ',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.0.11',
          },
          {
            id: '1.0.10-chat-sdk-react-native',
            label: 'Version 1.0.10',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.0.10',
          },
          {
            id: '1.0.8-chat-sdk-react-native',
            label: 'Version 1.0.8',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat',
          },
          {
            id: '1.0.7-chat-sdk-react-native',
            label: 'Version 1.0.7',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.0.7',
          },
          {
            id: '1.0.6-chat-sdk-react-native',
            label: 'Version 1.0.6',
            packageManager:
              'https://www.npmjs.com/package/react-native-agora-chat/v/1.0.6',
          },
        ],
      },
    ],
  },
  {
    id: 'react-js',
    label: 'ReactJS',
    core: [
      {
        id: 'video-sdk-js',
        label: 'Video SDK',
        info: 'SDK for: Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '2.5.1-video-sdk-react-js',
            label: 'Version 2.5.1 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/agora-rtc-react.2.5.1.js',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.5.1',
          },
          {
            id: '2.5.0-video-sdk-react-js',
            label: 'Version 2.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora-rtc-react.2.5.0.js',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.5.0',
          },
          {
            id: '2.4.0-video-sdk-react-js',
            label: 'Version 2.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora-rtc-react.2.4.0.js',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.4.0',
          },
          {
            id: '2.3.0-video-sdk-react-js',
            label: 'Version 2.3.0',
            downloadLink: 'https://unpkg.com/agora-rtc-react@2.3.0/dist/',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.3.0',
          },
          {
            id: '2.2.0-video-sdk-react-js',
            label: 'Version 2.2.0',
            downloadLink: 'https://unpkg.com/agora-rtc-react@2.2.0/dist/',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.2.0',
          },
          {
            id: '2.1.0-video-sdk-react-js',
            label: 'Version 2.1.0',
            downloadLink: 'https://unpkg.com/agora-rtc-react@2.1.0/dist/',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.1.0',
          },
          {
            id: '2.0.0-video-sdk-react-js',
            label: 'Version 2.0.0',
            downloadLink: 'https://unpkg.com/agora-rtc-react@2.0.0/dist/',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.0.0',
          },
        ],
      },
      {
        id: 'voice-sdk-js',
        label: 'Voice SDK',
        info: 'SDK for: Voice Calling',
        versions: [
          {
            id: '2.5.1-voice-sdk-react-js',
            label: 'Version 2.5.1 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/agora-rtc-react.2.5.1.js',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.5.1',
          },
          {
            id: '2.5.0-voice-sdk-react-js',
            label: 'Version 2.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora-rtc-react.2.5.0.js',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.5.0',
          },
          {
            id: '2.4.0-voice-sdk-react-js',
            label: 'Version 2.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora-rtc-react.2.4.0.js',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.4.0',
          },
          {
            id: '2.3.0-voice-sdk-react-js',
            label: 'Version 2.3.0',
            downloadLink: 'https://unpkg.com/agora-rtc-react@2.3.0/dist/',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.3.0',
          },
          {
            id: '2.2.0-voice-sdk-react-js',
            label: 'Version 2.2.0 ',
            downloadLink: 'https://unpkg.com/agora-rtc-react@2.2.0/dist/',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.2.0',
          },
          {
            id: '2.1.0-voice-sdk-react-js',
            label: 'Version 2.1.0',
            downloadLink: 'https://unpkg.com/agora-rtc-react@2.1.0/dist/',
            packageManager:
              'https://www.npmjs.com/package/agora-rtc-react/v/2.1.0',
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
        id: 'voice-sdk-windows',
        label: 'Voice SDK',
        info: 'SDK for: Voice Calling, Interactive Live Streaming (voice only), and Broadcast Streaming (voice only)',
        versions: [
          {
            id: '4.6.2-voice-sdk-windows',
            label: 'Version 4.6.2 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.6.2_FULL.zip',
          },
          {
            id: '4.6.0-voice-sdk-windows',
            label: 'Version 4.6.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.6.0_FULL.zip',
          },
          {
            id: '4.5.2-voice-sdk-windows',
            label: 'Version 4.5.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.5.2_FULL.zip',
          },
          {
            id: '4.5.1-voice-sdk-windows',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.5.1_FULL.zip',
          },
          {
            id: '4.5.0-voice-sdk-windows',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.5.0_FULL.zip',
          },
          {
            id: '4.4.0-voice-sdk-windows',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.4.0_FULL.zip',
          },
          {
            id: '4.3.2-voice-sdk-windows',
            label: 'Version 4.3.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.3.2_FULL.zip',
          },
          {
            id: '4.3.1-voice-sdk-windows',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.3.1_FULL.zip',
          },
          {
            id: '4.3.0-voice-sdk-windows',
            label: 'Version 4.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.3.0_FULL.zip',
          },
          {
            id: '4.2.6-voice-sdk-windows',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.2.6_FULL.zip',
          },
          {
            id: '4.2.3-voice-sdk-windows',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_rel.v4.2.3_22131_FULL_20231008_1750_279678.zip',
          },
          {
            id: '4.2.2-voice-sdk-windows',
            label: 'Version 4.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.2.2_FULL.zip',
          },
          {
            id: '4.2.1-voice-sdk-windows',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.2.1_FULL.zip',
          },
          {
            id: '4.2.0-voice-sdk-windows',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.2.0_FULL.zip',
          },
          {
            id: '4.1.1-voice-sdk-windows',
            label: 'Version 4.1.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.1.1_FULL.zip',
          },
          {
            id: '4.1.0-voice-sdk-windows',
            label: 'Version 4.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_V4.1.0_FULL.zip',
          },
          {
            id: '4.0.1-voice-sdk-windows',
            label: 'Version 4.0.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.0.1_FULL.zip',
          },
          {
            id: 'windows-cpp-3.7.2-voice-sdk-windows',
            label: 'Version 3.7.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_V3.7.2_VOICE.zip',
          },
          {
            id: 'windows-cpp-3.7.1-voice-sdk-windows',
            label: 'Version 3.7.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v3.7.1_VOICE.zip',
          },
        ],
      },
      {
        id: 'video-sdk-windows',
        label: 'Video SDK',
        info: 'SDK for: Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '4.6.2-video-sdk-windows',
            label: 'Version 4.6.2 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.6.2_FULL.zip',
          },
          {
            id: '4.6.0-video-sdk-windows',
            label: 'Version 4.6.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.6.0_FULL.zip',
          },
          {
            id: '4.5.2-video-sdk-windows',
            label: 'Version 4.5.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.5.2_FULL.zip',
          },
          {
            id: '4.5.1-video-sdk-windows',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.5.1_FULL.zip',
          },
          {
            id: '4.5.0-video-sdk-windows',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.5.0_FULL.zip',
          },
          {
            id: '4.4.0-video-sdk-windows',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.4.0_FULL.zip',
          },
          {
            id: '4.3.2-video-sdk-windows',
            label: 'Version 4.3.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.3.2_FULL.zip',
          },
          {
            id: '4.3.1-video-sdk-windows',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.3.1_FULL.zip',
          },
          {
            id: '4.3.0-video-sdk-windows',
            label: 'Version 4.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.3.0_FULL.zip',
          },
          {
            id: '4.2.6-video-sdk-windows',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.2.6_FULL.zip',
          },
          {
            id: '4.2.3-video-sdk-windows',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_rel.v4.2.3_22131_FULL_20231008_1750_279678.zip',
          },
          {
            id: '4.2.2-video-sdk-windows',
            label: 'Version 4.2.2 ',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.2.2_FULL.zip',
          },
          {
            id: '4.2.1-video-sdk-windows',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.2.1_FULL.zip',
          },
          {
            id: '4.2.0-video-sdk-windows',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.2.0_FULL.zip',
          },
          {
            id: '4.1.1-video-sdk-windows',
            label: 'Version 4.1.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.1.1_FULL.zip',
          },
          {
            id: '4.1.0-video-sdk-windows',
            label: 'Version 4.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_V4.1.0_FULL.zip',
          },
          {
            id: '4.0.1-video-sdk-windows',
            label: 'Version 4.0.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v4.0.1_FULL.zip',
          },
          {
            id: 'windows-cpp-3.7.2-video-sdk-windows',
            label: 'Version 3.7.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_V3.7.2_FULL.zip',
          },
          {
            id: 'windows-cpp-3.7.1-video-sdk-windows',
            label: 'Version 3.7.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Windows_v3.7.1_FULL.zip',
          },
        ],
      },
      {
        id: 'rtm-sdk-windows',
        label: 'Signaling SDK',
        info: 'SDK for: Signaling',
        versions: [
          {
            id: '2.2.8-rtm-sdk-windows',
            label: 'Version 2.2.8 (Latest)',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Windows_v2.2.8.zip',
          },
          {
            id: '2.2.6-rtm-sdk-windows',
            label: 'Version 2.2.6',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Windows_v2.2.6.zip',
          },
          {
            id: '2.2.4-rtm-sdk-windows',
            label: 'Version 2.2.4',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Windows_v2.2.4.zip',
          },
          {
            id: '2.2.2-rtm-sdk-windows',
            label: 'Version 2.2.2',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Windows_v2.2.2.zip',
          },
          {
            id: '1.5.1 (x86)-rtm-sdk-windows',
            label: 'Version 1.5.1 (x86)(Latest)',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_Windows_x86_v1.5.1.zip',
          },
          {
            id: '1.5.1 (x64)-rtm-sdk-windows',
            label: 'Version 1.5.1 (x64)(Latest)',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_Windows_x64_v1.5.1.zip',
          },
        ],
      },
      {
        id: 'chat-sdk-windows',
        label: 'Chat SDK',
        info: 'SDK for: Chat',
        versions: [
          {
            id: '1.3.1-chat-sdk-windows',
            label: 'Version 1.3.1 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_sdk.1.3.1.nupkg',
          },
          {
            id: '1.3.0-chat-sdk-windows',
            label: 'Version 1.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_sdk.1.3.0.nupkg',
          },
          {
            id: '1.2.0-chat-sdk-windows',
            label: 'Version 1.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_sdk.1.2.0.nupkg',
          },
          {
            id: '1.1.0-chat-sdk-windows',
            label: 'Version 1.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_sdk.1.1.0.nupkg',
          },
          {
            id: '1.0.9-chat-sdk-windows',
            label: 'Version 1.0.9',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_sdk.1.0.9.nupkg',
          },
          {
            id: '1.0.8-chat-sdk-windows',
            label: 'Version 1.0.8',
            downloadLink:
              'https://downloadsdk.easemob.com/downloads/SDK/WinSDK/agora_chat_sdk.1.0.8.nupkg',
          },
          {
            id: '1.0.5-chat-sdk-windows',
            label: 'Version 1.0.5',
            downloadLink:
              'https://downloadsdk.easemob.com/downloads/SDK/WinSDK/agora_chat_sdk.1.0.5.nupkg',
          },
        ],
      },
      {
        id: 'mediaplayer-kit-windows-x86',
        label: 'Mediaplayer Kit SDK (x86)',
        info: 'SDK for: Mediaplayer Kit',
        versions: [
          {
            id: '1.3.0-mediaplayer-kit-windows-x86',
            label: 'version 1.3.0 (x86)(Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Media_Player_for_Windows_x86_rel.v1.3.0_63393_ffmpeg_player_lite_20210727_1117.zip',
          },
        ],
      },
      {
        id: 'mediaplayer-kit-windows-x64',
        label: 'Mediaplayer Kit SDK (x64)',
        info: 'SDK for: Mediaplayer Kit',
        versions: [
          {
            id: '1.3.0-mediaplayer-kit-windows-x64',
            label: 'version 1.3.0 (x64)(Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Media_Player_for_Windows_x64_rel.v1.3.0_63392_ffmpeg_player_lite_20210727_1117.zip',
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
        id: 'voice-sdk-flutter',
        label: 'Voice SDK',
        info: 'SDK for Voice Calling',
        versions: [
          {
            id: '6.6.2-voice-sdk-flutter',
            label: 'Version 6.6.2 (Latest)',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.6.2',
          },
          {
            id: '6.5.2-voice-sdk-flutter',
            label: 'Version 6.5.2',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.5.2',
          },
          {
            id: '6.5.1-voice-sdk-flutter',
            label: 'Version 6.5.1',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.5.1',
          },
          {
            id: '6.5.0-voice-sdk-flutter',
            label: 'Version 6.5.0',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.5.0',
          },
          {
            id: '6.3.2-voice-sdk-flutter',
            label: 'Version 6.3.2',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.3.2',
          },
          {
            id: '6.3.1-voice-sdk-flutter',
            label: 'Version 6.3.1',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.3.1',
          },
          {
            id: '6.3.0-voice-sdk-flutter',
            label: 'Version 6.3.0',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.3.0',
          },
          {
            id: '6.2.6-voice-sdk-flutter',
            label: 'Version 6.2.6',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.6',
          },
          {
            id: '6.2.4-voice-sdk-flutter',
            label: 'Version 6.2.4',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.4',
          },
          {
            id: '6.2.3-voice-sdk-flutter',
            label: 'Version 6.2.3',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.3',
          },
          {
            id: '6.2.2-voice-sdk-flutter',
            label: 'Version 6.2.2',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.2',
          },
          {
            id: '6.2.1-voice-sdk-flutter',
            label: 'Version 6.2.1',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.1',
          },
          {
            id: '6.2.0-voice-sdk-flutter',
            label: 'Version 6.2.0',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.0',
          },
          {
            id: '6.1.0-voice-sdk-flutter',
            label: 'Version 6.1.0',
            packageManager: 'https://pub.dev/packages/agora_rtc_engine',
          },
          {
            id: '6.0.0-voice-sdk-flutter',
            label: 'Version 6.0.0',
            packageManager: 'https://pub.dev/packages/agora_rtc_engine',
          },
        ],
      },
      {
        id: 'video-sdk-flutter',
        label: 'Video SDK',
        info: 'SDK for: Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '6.6.2-video-sdk-flutter',
            label: 'Version 6.6.2 (Latest)',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.6.2',
          },
          {
            id: '6.5.2-video-sdk-flutter',
            label: 'Version 6.5.2',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.5.2',
          },
          {
            id: '6.5.1-video-sdk-flutter',
            label: 'Version 6.5.1',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.5.1',
          },
          {
            id: '6.5.0-video-sdk-flutter',
            label: 'Version 6.5.0',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.5.0',
          },
          {
            id: '6.3.2-video-sdk-flutter',
            label: 'Version 6.3.2',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.3.2',
          },
          {
            id: '6.3.1-video-sdk-flutter',
            label: 'Version 6.3.1',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.3.1',
          },
          {
            id: '6.3.0-video-sdk-flutter',
            label: 'Version 6.3.0',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.3.0',
          },
          {
            id: '6.2.6-video-sdk-flutter',
            label: 'Version 6.2.6',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.6',
          },
          {
            id: '6.2.4-video-sdk-flutter',
            label: 'Version 6.2.4',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.4',
          },
          {
            id: '6.2.3-video-sdk-flutter',
            label: 'Version 6.2.3',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.3',
          },
          {
            id: '6.2.2-video-sdk-flutter',
            label: 'Version 6.2.2',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.2',
          },
          {
            id: '6.2.1-video-sdk-flutter',
            label: 'Version 6.2.1',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.1',
          },
          {
            id: '6.2.0-video-sdk-flutter',
            label: 'Version 6.2.0',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/6.2.0',
          },
          {
            id: '6.1.0-video-sdk-flutter',
            label: 'Version 6.1.0',
            packageManager: 'https://pub.dev/packages/agora_rtc_engine',
          },
          {
            id: '6.0.0-video-sdk-flutter',
            label: 'Version 6.0.0',
            packageManager: 'https://pub.dev/packages/agora_rtc_engine',
          },
          {
            id: '5.3.1-video-sdk-flutter',
            label: 'Version 5.3.1',
            packageManager:
              'https://pub.dev/packages/agora_rtc_engine/versions/5.3.1',
          },
        ],
      },
      {
        id: 'chat-sdk-flutter',
        label: 'Chat SDK',
        info: 'SDK for: Chat',
        versions: [
          {
            id: '1.3.3-chat-sdk-flutter',
            label: 'Version 1.3.3 (Latest)',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
          {
            id: '1.3.2-chat-sdk-flutter',
            label: 'Version 1.3.2',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
          {
            id: '1.3.1-chat-sdk-flutter',
            label: 'Version 1.3.1',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
          {
            id: '1.3.0-chat-sdk-flutter',
            label: 'Version 1.3.0',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
          {
            id: '1.2.0-chat-sdk-flutter',
            label: 'Version 1.2.0',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
          {
            id: '1.1.1-chat-sdk-flutter',
            label: 'Version 1.1.1',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
          {
            id: '1.1.0-chat-sdk-flutter',
            label: 'Version 1.1.0',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
          {
            id: '1.0.9-chat-sdk-flutter',
            label: 'Version 1.0.9',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
          {
            id: '1.0.8-chat-sdk-flutter',
            label: 'Version 1.0.8',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
          {
            id: '1.0.7-chat-sdk-flutter',
            label: 'Version 1.0.7',
            packageManager: 'https://pub.dev/packages/agora_chat_sdk',
          },
        ],
      },
      {
        id: 'signaling-sdk-flutter',
        label: 'Signaling SDK',
        info: 'SDK for: Signaling',
        versions: [
          {
            id: '2.2.5-signaling-sdk-flutter',
            label: 'Version 2.2.5 (Latest)',
            packageManager: 'https://pub.dev/packages/agora_rtm/versions/2.2.5',
          },
          {
            id: '2.2.1-signaling-sdk-flutter',
            label: 'Version 2.2.1',
            packageManager: 'https://pub.dev/packages/agora_rtm/versions/2.2.1',
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
        id: 'rtm-sdk-linux',
        label: 'Signaling SDK',
        info: 'SDK for: Real-Time Messaging',
        versions: [
          {
            id: '2.2.8-rtm-sdk-linux-cpp',
            label: 'Version 2.2.8 for C++ (Latest)',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Linux_v2.2.8.zip',
          },
          {
            id: '2.2.6-rtm-sdk-linux-cpp',
            label: 'Version 2.2.6 for C++',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Linux_v2.2.6.zip',
          },
          {
            id: '2.2.4-rtm-sdk-linux-cpp',
            label: 'Version 2.2.4 for C++',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Linux_v2.2.4.zip',
          },
          {
            id: '2.2.2-rtm-sdk-linux-cpp',
            label: 'Version 2.2.2 for C++',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Linux_v2.2.2.zip',
          },
          {
            id: '2.2.1-rtm-sdk-linux-cpp',
            label: 'Version 2.2.1 for C++',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Linux_v2.2.1.zip',
          },
          {
            id: '2.1.12-rtm-sdk-linux-cpp',
            label: 'Version 2.1.12 for C++',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Linux_v2.1.12.zip',
          },
          {
            id: '2.1.11-rtm-sdk-linux-cpp',
            label: 'Version 2.1.11 for C++ ',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Linux_v2.1.11.zip',
          },
          {
            id: '2.1.10-rtm-sdk-linux-cpp',
            label: 'Version 2.1.10 for C++ ',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Linux_v2.1.10.zip',
          },
          {
            id: '2.1.9-rtm-sdk-linux-cpp',
            label: 'Version 2.1.9 for C++',
            downloadLink:
              'https://download.agora.io/rtm2/release/Agora_RTM_C%2B%2B_SDK_for_Linux_v219.zip',
          },
          {
            id: '1.5.1-rtm-sdk-linux-cpp',
            label: 'Version 1.5.1 for C++',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_Linux_v1_5_1.zip',
          },
          {
            id: '1.5.1-rtm-sdk-linux-java',
            label: 'Version 1.5.1 for Java',
            downloadLink:
              'https://download.agora.io/rtmsdk/release/Agora_RTM_SDK_for_Linux_Java_v1_5_1.zip',
          },
        ],
      },
      {
        id: 'iot-sdk-c',
        label: 'IoT SDK',
        info: 'SDK for: Embedded Devices',
        versions: [
          {
            id: 'Agora-RTSALite-RmAcAjCP-x86_64-linux-gnu-v1.8.0.tgz',
            label: 'Version 1.8.0 (Latest)',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTSALite-AutAcAj-x86_64-linux-gnu-v1.8.0.tgz',
          },
        ],
      },
    ],
    addOns: [
      {
        id: 'on-premise-recording-sdk-linux',
        label: 'Agora On-Premise Recording SDK',
        info: 'Compatible with: Voice Calling, Video Calling, or Interactive Live Streaming',
        versions: [
          {
            id: 'c++-x86_64',
            label: 'x86_64 Version 4.4.151 for C++ (Latest)',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-x86_64-linux-gnu-v4.4.151-20250919_101833-891308.tgz',
          },
          {
            id: 'c++-arm-x64',
            label: 'arm64 Version 4.4.151 for C++ (Latest)',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-aarch64-linux-gnu-v4.4.151-20250919_102817-891319.tgz',
          },
          {
            id: 'java-x86_64',
            label: 'x86_64 Version 4.4.151 for Java (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora-Linux-Recording-Java-SDK-v4.4.151.1-x86_64-891308-28c706d74a-20250919_142050.zip',
          },
          {
            id: 'java-arm-x64',
            label: 'arm64 Version 4.4.151 for Java (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora-Linux-Recording-Java-SDK-v4.4.151-aarch64-891319-952e64402b-20250919_140753.zip',
          },
        ],
      },
      {
        id: 'server-gateway-sdk-linux',
        label: 'Server Gateway SDK',
        info: 'Compatible with: Voice Calling, Video Calling, or Interactive Live Streaming',
        versions: [
          {
            id: 'java-server-gateway-sdk-linux',
            label: 'Version 4.4.32 for Java (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora-Linux-Java-SDK-v4.4.32-x86_64-675656-ccd9be501d-20250526_180235.zip',
          },
          {
            id: 'cpp-server-gateway-sdk-linux-arm',
            label: 'Version 4.4.32 aarch64 for C++ (Latest)',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-aarch64-linux-gnu-v4.4.32-20250425_150503-675674.tgz',
          },
          {
            id: 'cpp-server-gateway-sdk-linux',
            label: 'Version 4.4.32 x86_64 for C++ (Latest)',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-x86_64-linux-gnu-v4.4.32-20250425_144419-675648.tgz',
          },
          {
            id: 'go-server-gateway-sdk-linux',
            label: 'Version 2.2.8 for Go (Latest)',
            downloadLink:
              'https://github.com/AgoraIO-Extensions/Agora-Golang-Server-SDK/tree/release/2.2.8',
          },
          {
            id: 'python-server-gateway-sdk-linux',
            label: 'Version 2.2.4 for Python (Latest)',
            downloadLink:
              'https://github.com/AgoraIO-Extensions/Agora-Python-Server-SDK/tree/release/2.2.4',
            packageManager: 'https://pypi.org/project/agora-python-server-sdk/',
          },
          {
            id: 'java-server-gateway-sdk-linux',
            label: 'Version 4.4.30 for Java',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora-Linux-Java-SDK-v4.4.30-x86_64-398537-0440223121-20241024_121033.jar',
          },
          {
            id: 'go-server-gateway-sdk-linux',
            label: 'Version 2.1.0 for Go',
            downloadLink: '../en/server-gateway/reference/download?platform=go',
          },
          {
            id: 'python-server-gateway-sdk-linux',
            label: 'Version 2.1.0 for Python',
            downloadLink:
              '../en/server-gateway/reference/download?platform=python',
          },
          {
            id: 'cpp-server-gateway-sdk-linux',
            label: 'Version 4.4.30 for C++',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-x86_64-linux-gnu-v4.4.30-20241024_101940-398537.tgz',
          },
          {
            id: 'cpp-server-gateway-sdk-linux',
            label: 'Version 4.2.32 for C++',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-x86_64-linux-gnu-v4.2.32-20240814_113547-328017.tgz',
          },
          {
            id: 'cpp-server-gateway-sdk-linux',
            label: 'Version 4.2.30 for C++',
            downloadLink:
              'https://download.agora.io/rtsasdk/release/Agora-RTC-x86_64-linux-gnu-v4.2.30-20240202_172130-292462.tgz',
          },
          {
            id: 'cpp-server-gateway-sdk-linux',
            label: 'Version 3.8.2 for C++',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora-RTC-x86_64-linux-gnu-v3.8.202.20-20220627_152601-214165.tgz',
          },
          {
            id: 'java-server-gateway-sdk-linux',
            label: 'Version 3.7.2 for Java',
            packageManager:
              'https://mvnrepository.com/artifact/io.agora.rtc/linux-sdk',
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
        label: 'Voice SDK',
        info: 'SDK for: Voice Calling, Interactive Live Streaming (voice only), and Broadcast Streaming (voice only)',
        versions: [
          {
            id: '4.6.2-voice-sdk-unity',
            label: 'Version 4.6.2 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_VOICE_20260212_634_4.6.2-build.1.zip',
          },
          {
            id: '4.5.1-voice-sdk-unity',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_4.5.1_VOICE_20250617_471_build.5.zip',
          },
          {
            id: '4.5.0-voice-sdk-unity',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.5.0_VOICE.zip',
          },
          {
            id: '4.4.0-voice-sdk-unity',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.4.0_VOICE.zip',
          },
          {
            id: '4.3.2-voice-sdk-unity',
            label: 'Version 4.3.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.3.2_VOICE.zip',
          },
          {
            id: '4.3.1-voice-sdk-unity',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.3.1_VOICE.zip',
          },
          {
            id: '4.3.0-voice-sdk-unity',
            label: 'Version 4.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.3.0_VOICE.zip',
          },
          {
            id: '4.2.6-voice-sdk-unity',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_4.2.6_VOICE.zip',
          },
          {
            id: '4.2.4-voice-sdk-unity',
            label: 'Version 4.2.4',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.4_VOICE.zip',
          },
          {
            id: '4.2.3-voice-sdk-unity',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.3_VOICE.zip',
          },
          {
            id: '4.2.2-voice-sdk-unity',
            label: 'Version 4.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.2_VOICE.zip',
          },
          {
            id: '4.2.1-voice-sdk-unity',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.1_VOICE.zip',
          },
          {
            id: '4.2.0-voice-sdk-unity',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.0_VOICE.zip',
          },
          {
            id: '4.1.0-voice-sdk-unity',
            label: 'Version 4.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.1.0_VOICE.zip',
          },
          {
            id: '4.0.0-voice-sdk-unity',
            label: 'Version 4.0.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.0.0_VOICE.zip',
          },
          {
            id: '3.7.1-voice-sdk-unity',
            label: 'Version 3.7.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_3.7.1_VOICE.zip',
          },
        ],
      },
      {
        id: 'video-sdk-unity',
        label: 'Video SDK',
        info: 'SDK for: Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '4.6.2-video-sdk-unity',
            label: 'Version 4.6.2 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_FULL_20260212_633_4.6.2-build.1.zip',
          },
          {
            id: '4.5.1-video-sdk-unity',
            label: 'Version 4.5.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_4.5.1_FULL_20250617_468_build.5.zip',
          },
          {
            id: '4.5.0-video-sdk-unity',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.5.0_FULL.zip',
          },
          {
            id: '4.4.0-video-sdk-unity',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.4.0_FULL.zip',
          },
          {
            id: '4.3.2-video-sdk-unity',
            label: 'Version 4.3.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.3.2_FULL.zip',
          },
          {
            id: '4.3.1-video-sdk-unity',
            label: 'Version 4.3.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.3.1_FULL.zip',
          },
          {
            id: '4.3.0-video-sdk-unity',
            label: 'Version 4.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.3.0_FULL.zip',
          },
          {
            id: '4.2.6-video-sdk-unity',
            label: 'Version 4.2.6',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_4.2.6_FULL.zip',
          },
          {
            id: '4.2.4-video-sdk-unity',
            label: 'Version 4.2.4',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.4_FULL.zip',
          },
          {
            id: '4.2.3-video-sdk-unity',
            label: 'Version 4.2.3',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.3_FULL.zip',
          },
          {
            id: '4.2.2-video-sdk-unity',
            label: 'Version 4.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.2_FULL.zip',
          },
          {
            id: '4.2.1-video-sdk-unity',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.1_FULL.zip',
          },
          {
            id: '4.2.0-video-sdk-unity',
            label: 'Version 4.2.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.2.0_FULL.zip',
          },
          {
            id: '4.1.0-video-sdk-unity',
            label: 'Version 4.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.1.0_FULL.zip',
          },
          {
            id: '4.0.0-video-sdk-unity',
            label: 'Version 4.0.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_v4.0.0_FULL.zip',
          },
          {
            id: '3.7.1-video-sdk-unity',
            label: 'Version 3.7.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTC_SDK_3.7.1_FULL.zip',
          },
        ],
      },
      {
        id: 'rtm-sdk-unity',
        label: 'Signaling SDK',
        info: 'SDK for: Signaling',
        versions: [
          {
            id: '2.1.8-rtm-sdk-unity',
            label: 'Version 2.1.9 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTM_SDK_v2.1.9.zip',
          },
          {
            id: '1.4.10-rtm-sdk-unity',
            label: 'Version 1.4.10',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_Unity_RTM_SDK_1.4.10_20220726_163.zip',
          },
        ],
      },
      {
        id: 'chat-sdk-unity',
        label: 'Chat SDK',
        info: 'SDK for: Chat',
        versions: [
          {
            id: '1.3.1-chat-sdk-unity',
            label: 'Version 1.3.1 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.3.1.unitypackage',
          },
          {
            id: '1.3.0-chat-sdk-unity',
            label: 'Version 1.3.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.3.0.unitypackage',
          },
          {
            id: '1.2.2-chat-sdk-unity',
            label: 'Version 1.2.2',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.2.2.unitypackage',
          },
          {
            id: '1.2.1-chat-sdk-unity',
            label: 'Version 1.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.2.1.unitypackage',
          },
          {
            id: '1.2.0-chat-sdk-unity',
            label: 'Version 1.2.0 ',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.2.0.unitypackage',
          },
          {
            id: '1.1.4-chat-sdk-unity',
            label: 'Version 1.1.4',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.1.4.unitypackage',
          },
          {
            id: '1.1.3-chat-sdk-unity',
            label: 'Version 1.1.3',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.1.3.unitypackage',
          },
          {
            id: '1.1.2-chat-sdk-unity',
            label: 'Version 1.1.2',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.1.2.unitypackage',
          },
          {
            id: '1.1.1-chat-sdk-unity',
            label: 'Version 1.1.1',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.1.1.unitypackage',
          },
          {
            id: '1.1.0-chat-sdk-unity',
            label: 'Version 1.1.0',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.1.0.unitypackage',
          },
          {
            id: '1.0.9-chat-sdk-unity',
            label: 'Version 1.0.9',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.0.9.unitypackage',
          },
          {
            id: '1.0.8-chat-sdk-unity',
            label: 'Version 1.0.8',
            downloadLink:
              'https://download.agora.io/sdk/release/agora_chat_unity_sdk1.0.8.unitypackage',
          },
          {
            id: '1.0.5-chat-sdk-unity',
            label: 'Version 1.0.5',
            downloadLink:
              'https://downloadsdk.easemob.com/downloads/SDK/Unity/Agora_Unity_Chat_SDK_1.0.5.unitypackage',
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
        id: 'voice-sdk-electron',
        label: 'Voice SDK',
        info: 'SDK for: Voice Calling, Interactive Live Streaming (voice only), and Broadcast Streaming (voice only)',
        versions: [
          {
            id: '4.6.2-voice-sdk-electron',
            label: 'Version 4.6.2 (Latest)',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.6.2',
          },
          {
            id: '4.5.2-voice-sdk-electron',
            label: 'Version 4.5.2',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.5.2',
          },
          {
            id: '4.5.0-voice-sdk-electron',
            label: 'Version 4.5.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.5.0',
          },
          {
            id: '4.4.0-voice-sdk-electron',
            label: 'Version 4.4.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.4.0',
          },
          {
            id: '4.3.2-voice-sdk-electron',
            label: 'Version 4.3.2',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.3.2',
          },
          {
            id: '4.3.1-voice-sdk-electron',
            label: 'Version 4.3.1',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.3.1',
          },
          {
            id: '4.3.0-voice-sdk-electron',
            label: 'Version 4.3.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.3.0',
          },
          {
            id: '4.2.6-voice-sdk-electron',
            label: 'Version 4.2.6',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.6',
          },
          {
            id: '4.2.4-voice-sdk-electron',
            label: 'Version 4.2.4',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.4',
          },
          {
            id: '4.2.3-voice-sdk-electron',
            label: 'Version 4.2.3',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.3',
          },
          {
            id: '4.2.2-voice-sdk-electron',
            label: 'Version 4.2.2',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.2',
          },
          {
            id: '4.2.1-voice-sdk-electron',
            label: 'Version 4.2.1',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.1',
          },
          {
            id: '4.2.0-voice-sdk-electron',
            label: 'Version 4.2.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.0',
          },
          {
            id: '4.1.0-voice-sdk-electron',
            label: 'Version 4.1.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.1.0',
          },
          {
            id: '4.0.0-voice-sdk-electron',
            label: 'Version 4.0.0',
            packageManager: 'https://www.npmjs.com/package/agora-electron-sdk',
          },
        ],
      },
      {
        id: 'video-sdk-electron',
        label: 'Video SDK',
        info: 'SDK for: Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '4.6.2-video-sdk-electron',
            label: 'Version 4.6.2 (Latest)',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.6.2',
          },
          {
            id: '4.5.2-video-sdk-electron',
            label: 'Version 4.5.2',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.5.2',
          },
          {
            id: '4.5.0-video-sdk-electron',
            label: 'Version 4.5.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.5.0',
          },
          {
            id: '4.4.0-video-sdk-electron',
            label: 'Version 4.4.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.4.0',
          },
          {
            id: '4.3.2-video-sdk-electron',
            label: 'Version 4.3.2',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.3.2',
          },
          {
            id: '4.3.1-video-sdk-electron',
            label: 'Version 4.3.1',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.3.1',
          },
          {
            id: '4.3.0-video-sdk-electron',
            label: 'Version 4.3.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.3.0',
          },
          {
            id: '4.2.6-video-sdk-electron',
            label: 'Version 4.2.6',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.6',
          },
          {
            id: '4.2.4-video-sdk-electron',
            label: 'Version 4.2.4',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.4',
          },
          {
            id: '4.2.3-video-sdk-electron',
            label: 'Version 4.2.3',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.3',
          },
          {
            id: '4.2.2-video-sdk-electron',
            label: 'Version 4.2.2',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.2',
          },
          {
            id: '4.2.1-video-sdk-electron',
            label: 'Version 4.2.1',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.1',
          },
          {
            id: '4.2.0-video-sdk-electron',
            label: 'Version 4.2.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.2.0',
          },
          {
            id: '4.1.0-video-sdk-electron',
            label: 'Version 4.1.0',
            packageManager:
              'https://www.npmjs.com/package/agora-electron-sdk/v/4.1.0',
          },
          {
            id: '4.0.0-video-sdk-electron',
            label: 'Version 4.0.0',
            packageManager: 'https://www.npmjs.com/package/agora-electron-sdk',
          },
          {
            id: '3.7.0-video-sdk-electron',
            label: 'Version 3.7.0',
            packageManager: 'https://www.npmjs.com/package/agora-electron-sdk',
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
        id: 'video-sdk-unreal-engine',
        label: 'Video SDK',
        info: 'SDK for Video Calling, Interactive Live Streaming, and Broadcast Streaming',
        versions: [
          {
            id: '4.5.1-video-sdk-unreal-engine',
            label: 'Version 4.5.1 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_FULL_SDK_4.5.1_Unreal.zip',
          },
          {
            id: '4.5.0-video-sdk-unreal-engine',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_FULL_SDK_4.5.0_Unreal.zip',
          },
          {
            id: '4.4.0-video-sdk-unreal-engine',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_FULL_SDK_4.4.0_Unreal.zip',
          },
          {
            id: '4.2.1-video-sdk-unreal-engine',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_Full_SDK_4.2.1_Unreal.zip',
          },
        ],
      },
      {
        id: 'voice-sdk-unreal-engine',
        label: 'Voice SDK',
        info: 'SDK for Voice Calling',
        versions: [
          {
            id: '4.5.1-voice-sdk-unreal-engine',
            label: 'Version 4.5.1 (Latest)',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_VOICE_SDK_4.5.1_Unreal.zip',
          },
          {
            id: '4.5.0-voice-sdk-unreal-engine',
            label: 'Version 4.5.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_VOICE_SDK_4.5.0_Unreal.zip',
          },
          {
            id: '4.4.0-voice-sdk-unreal-engine',
            label: 'Version 4.4.0',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_VOICE_SDK_4.4.0_Unreal.zip',
          },
          {
            id: '4.2.1-voice-sdk-unreal-engine',
            label: 'Version 4.2.1',
            downloadLink:
              'https://download.agora.io/sdk/release/Agora_RTC_VOICE_SDK_4.2.1_Unreal.zip',
          },
        ],
      },
    ],
  },
];
