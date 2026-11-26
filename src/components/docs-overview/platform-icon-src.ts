const platformIconBaseUrl =
  'https://web-cdn.agora.io/docs-portal/img/platforms';

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
  'objective-c': '/img/platforms/oc.svg',
  'mini-program': `${platformIconBaseUrl}/min-program.svg`,
  python: `${platformIconBaseUrl}/python.svg`,
  'react-native': `${platformIconBaseUrl}/react-native.svg`,
  'restful-api': `${platformIconBaseUrl}/restful.svg`,
  swift: '/img/platforms/swift.svg',
  typescript: `${platformIconBaseUrl}/js.svg`,
  unity: `${platformIconBaseUrl}/unity.svg`,
  'unreal-blueprint': `${platformIconBaseUrl}/unreal-engine.svg`,
  'unreal-cpp': `${platformIconBaseUrl}/unreal-engine.svg`,
  web: `${platformIconBaseUrl}/js.svg`,
  windows: `${platformIconBaseUrl}/windows.svg`,
};

export function getPlatformIconSrc(platformId: string) {
  return platformIcons[platformId] ?? `${platformIconBaseUrl}/all.svg`;
}

// These source assets contain only dark monochrome marks. Keep the colored
// platform logos unchanged when adapting the marks to a dark background.
const monochromeIcons = new Set([
  platformIcons.ios,
  platformIcons.macos,
  platformIcons.unity,
  platformIcons['unreal-cpp'],
]);

export function isMonochromePlatformIcon(src: string) {
  return monochromeIcons.has(src);
}
