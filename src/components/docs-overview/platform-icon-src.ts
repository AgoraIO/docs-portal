const platformIconBaseUrl =
  'https://assets-docs.agora.io/images/api-reference/platforms';

const platformIcons: Record<string, string> = {
  android: `${platformIconBaseUrl}/android.svg`,
  c: `${platformIconBaseUrl}/c.svg`,
  cpp: `${platformIconBaseUrl}/cpp.svg`,
  csharp: `${platformIconBaseUrl}/csharp.svg`,
  electron: `${platformIconBaseUrl}/electron.svg`,
  flutter: `${platformIconBaseUrl}/flutter.svg`,
  go: `${platformIconBaseUrl}/go.svg`,
  harmonyos: `${platformIconBaseUrl}/harmonyOS.svg`,
  ios: `${platformIconBaseUrl}/ios.svg`,
  java: `${platformIconBaseUrl}/java.svg`,
  macos: `${platformIconBaseUrl}/macos.svg`,
  'mini-program': `${platformIconBaseUrl}/min-program.svg`,
  python: `${platformIconBaseUrl}/python.svg`,
  'react-native': `${platformIconBaseUrl}/react-native.svg`,
  'restful-api': `${platformIconBaseUrl}/restful.svg`,
  swift: `${platformIconBaseUrl}/ios.svg`,
  typescript: `${platformIconBaseUrl}/js.svg`,
  unity: `${platformIconBaseUrl}/unity.svg`,
  'unreal-blueprint': `${platformIconBaseUrl}/unreal-engine.svg`,
  'unreal-cpp': `${platformIconBaseUrl}/unreal-engine.svg`,
  web: `${platformIconBaseUrl}/js.svg`,
  windows: 'https://doc.shengwang.cn/img/platforms/windows.svg',
};

export function getPlatformIconSrc(platformId: string) {
  return platformIcons[platformId] ?? `${platformIconBaseUrl}/all.svg`;
}
