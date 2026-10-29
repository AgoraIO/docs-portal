// Ordered SDK entry points from shengwang-doc-source. RESTful entries are not
// downloadable SDKs. A target can share a package or contain multiple OS builds.
export type CnSdkDownloadTarget = {
  id: string;
  label: string;
  iconPlatformId: string;
  queryAliases?: readonly string[];
  sources: readonly { platformId: string; versionPrefix?: string }[];
};

const target = (
  id: string,
  label: string,
  sourcePlatformId = id,
  iconPlatformId = id,
): CnSdkDownloadTarget => ({
  id,
  label,
  iconPlatformId,
  sources: [{ platformId: sourcePlatformId }],
});

// docs/rtc/_platforms_.meta.js. Both Unreal entry points share one SDK archive.
const rtcTargets = [
  target('android', 'Android'),
  target('ios', 'iOS'),
  target('macos', 'macOS'),
  target('web', 'Web'),
  target('windows', 'Windows'),
  target('harmonyos', 'HarmonyOS'),
  target('mini-program', '小程序'),
  target('electron', 'Electron'),
  target('unity', 'Unity'),
  target('flutter', 'Flutter'),
  target('react-native', 'React Native'),
  target('unreal-cpp', 'Unreal (C++)', 'unreal-engine'),
  target('unreal-blueprint', 'Unreal (Blueprint)', 'unreal-engine'),
  target('react-js', 'React', 'react-js', 'react-native'),
];

const serverTarget = (
  id: string,
  label: string,
  language: string,
  prefix: string,
): CnSdkDownloadTarget => ({
  id,
  label,
  iconPlatformId: language,
  sources: [{ platformId: 'linux', versionPrefix: prefix }],
});

export const cnSdkDownloadTargets: Record<
  string,
  readonly CnSdkDownloadTarget[]
> = {
  // docs/convoai/get-started/quick-start-agent.mdx
  agents: [
    target('go', 'Go'),
    target('python', 'Python'),
    target('typescript', 'TypeScript'),
  ],
  'client-toolkit': [
    target('android', 'Android'),
    target('ios', 'iOS'),
    target('web', 'Web'),
  ],
  voice: rtcTargets,
  video: rtcTargets,
  // docs/rtm2/_platforms_.meta.js and shared/rtm2/_sdkdownload.mdx
  signaling: [
    target('web', 'JavaScript'),
    target('android', 'Java', 'android', 'java'),
    {
      ...target('ios', 'Objective-C', 'ios', 'objective-c'),
      queryAliases: ['macos'],
    },
    target('swift', 'Swift', 'ios'),
    {
      id: 'cpp',
      label: 'C++',
      iconPlatformId: 'cpp',
      sources: [{ platformId: 'windows' }, { platformId: 'linux' }],
    },
    target('harmonyos', 'HarmonyOS'),
    target('mini-program', '小程序（Beta）'),
    target('unity', 'Unity'),
    target('flutter', 'Flutter'),
  ],
  rtsa: [target('c', 'C')],
  // docs/meeting/_platforms_.meta.js; docs/whiteboard/_platforms_.meta.js
  meeting: [
    target('android', 'Android'),
    target('ios', 'iOS'),
    target('electron', 'Electron'),
  ],
  whiteboard: [
    target('android', 'Android'),
    target('ios', 'iOS'),
    target('web', 'Web'),
  ],
  fastboard: [
    target('android', 'Android'),
    target('ios', 'iOS'),
    target('web', 'Web'),
  ],
  // docs/rtc-server-sdk/_platforms_.meta.js and docs/recording/_platforms_.meta.js
  'server-gateway': [
    serverTarget('linux-cpp', 'C++', 'cpp', 'server-gateway-cpp'),
    serverTarget('linux-java', 'Java', 'java', 'server-gateway-java'),
    serverTarget('python', 'Python', 'python', 'python-server-gateway'),
    serverTarget('go', 'Go', 'go', 'go-server-gateway'),
  ],
  'on-premise-recording': [
    serverTarget('linux-cpp', '服务端 C++', 'cpp', 'on-premise-recording-cpp'),
    serverTarget(
      'linux-java',
      '服务端 Java',
      'java',
      'on-premise-recording-java',
    ),
  ],
};

export function getCnSdkDownloadTarget(productId: string, platformId: string) {
  const targets = cnSdkDownloadTargets[productId];
  return (
    targets?.find((entry) => entry.id === platformId) ??
    targets?.find((entry) =>
      entry.sources.some((source) => source.platformId === platformId),
    )
  );
}
