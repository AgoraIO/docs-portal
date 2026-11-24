import { isKnownPlatform, type PlatformKey } from '../platforms/registry';

export type CnSearchPlatform = PlatformKey | 'general' | 'iot';

// Matches legacyUi.platforms in the maintained CN search comparison fixture.
// Labels belong to search; document platform names and routes stay unchanged.
export const cnSearchPlatformOptions = [
  { value: 'general', label: '控制台' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
  { value: 'macos', label: 'macOS' },
  { value: 'web', label: 'JavaScript' },
  { value: 'windows', label: 'Windows' },
  { value: 'harmonyos', label: 'HarmonyOS' },
  { value: 'cpp', label: '服务端 C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: '服务端 Java' },
  { value: 'react', label: 'React' },
  { value: 'device-c', label: '设备端' },
  { value: 'electron', label: 'Electron' },
  { value: 'unity', label: 'Unity' },
  { value: 'flutter', label: 'Flutter' },
  { value: 'react-native', label: 'React Native' },
  { value: 'unreal', label: 'Unreal (C++)' },
  { value: 'blueprint', label: 'Unreal (Blueprint)' },
  { value: 'csharp', label: 'C#' },
  { value: 'mini-program', label: '小程序' },
  { value: 'iot', label: '智能硬件' },
  { value: 'restful', label: '服务端' },
] as const satisfies ReadonlyArray<{ value: CnSearchPlatform; label: string }>;

export function isCnSearchPlatform(value: string): value is CnSearchPlatform {
  const canonical = normalizeCnSearchPlatform(value);
  return (
    canonical === 'general' || canonical === 'iot' || isKnownPlatform(canonical)
  );
}

// Search groups equivalent publication IDs without changing documentation routes
// or requiring an index rebuild. Language choices cover client and server SDKs;
// REST APIs retain a separate server choice.
const aliases: Partial<Record<string, CnSearchPlatform>> = {
  javascript: 'web',
  rn: 'react-native',
  device: 'device-c',
  console: 'general',
  'unreal-cpp': 'unreal',
  'unreal-blueprint': 'blueprint',
  'mini-program-beta': 'mini-program',
  'server-cpp': 'cpp',
  'server-java': 'java',
  'restful-api': 'restful',
};

export function normalizeCnSearchPlatform(
  platform: CnSearchPlatform,
): CnSearchPlatform;
export function normalizeCnSearchPlatform(platform: string): string;
export function normalizeCnSearchPlatform(platform: string): string {
  return aliases[platform as PlatformKey] ?? platform;
}

export function getCnSearchPlatformAliases(platform: string): string[] {
  const canonical = normalizeCnSearchPlatform(platform);
  return [
    canonical,
    ...Object.keys(aliases).filter(
      (alias) => aliases[alias as PlatformKey] === canonical,
    ),
  ];
}
