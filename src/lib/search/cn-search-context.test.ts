import { describe, expect, it } from 'vitest';
import {
  getCnSearchProductGroups,
  resolveCnSearchProduct,
} from './cn-product-labels';
import {
  getCnSearchPlatformLabel,
  getCnSearchPlatforms,
} from './cn-search-context';

describe('legacy-compatible Chinese search options', () => {
  it('offers one server platform for both indexed REST spellings', () => {
    expect(
      getCnSearchPlatforms({ restful: 2, 'restful-api': 3 }).filter((id) =>
        id.startsWith('restful'),
      ),
    ).toEqual(['restful']);
    expect(getCnSearchPlatformLabel('restful')).toBe('服务端');
    expect(getCnSearchPlatformLabel('restful-api')).toBe('服务端');
  });

  it('offers one plain product choice across guide and API namespaces', () => {
    const groups = getCnSearchProductGroups();
    const options = groups.flatMap((group) => group.options);
    expect(groups.map((group) => group.label)).toEqual(['产品', '解决方案']);
    expect(new Set(options.map((option) => option.value)).size).toBe(
      options.length,
    );
    expect(new Set(options.map((option) => option.label)).size).toBe(
      options.length,
    );
    for (const label of ['介绍', '参考文档', 'API 参考', '产品概览']) {
      expect(options.some((option) => option.label === label)).toBe(false);
    }
    expect(options.some((option) => 'description' in option)).toBe(false);
    expect(options.filter((option) => option.label === '水晶球')).toHaveLength(
      1,
    );
    expect(resolveCnSearchProduct('product:agora-analytics')).toBe('analytics');
    expect(resolveCnSearchProduct('private-room')).toBe('one-to-one-live');
    expect(resolveCnSearchProduct('introduction')).toBeUndefined();
    expect(options).toContainEqual({
      value: 'rtmp-gateway',
      label: 'RTMP 网关',
    });
    expect(resolveCnSearchProduct('rtmp-gateway')).toBe('rtmp-gateway');
  });
});

// These facets come from different guide/API publications of the same platform.
it('offers each platform once even before the publication catalog loads', () => {
  const options = getCnSearchPlatforms();
  const labels = options.map(getCnSearchPlatformLabel);
  expect(new Set(labels).size).toBe(labels.length);
  for (const alias of [
    'unreal-cpp',
    'unreal-blueprint',
    'mini-program-beta',
    'javascript',
  ]) {
    expect(options).not.toContain(alias);
  }
});

it('keeps the legacy catalog stable across loading, facets and selected aliases', () => {
  expect(
    getCnSearchPlatforms({ 'unreal-cpp': 3, 'mini-program-beta': 2 }),
  ).toEqual(getCnSearchPlatforms());
  expect(getCnSearchPlatforms({ android: 1 }, 'unreal-blueprint')).toEqual(
    getCnSearchPlatforms(),
  );
});

it('matches the complete legacy search platform catalog in screenshot order', () => {
  expect(getCnSearchPlatforms().map(getCnSearchPlatformLabel)).toEqual([
    '控制台',
    'Android',
    'iOS',
    'macOS',
    'JavaScript',
    'Windows',
    'HarmonyOS',
    '服务端 C++',
    'C',
    '服务端 Java',
    'React',
    '设备端',
    'Electron',
    'Unity',
    'Flutter',
    'React Native',
    'Unreal (C++)',
    'Unreal (Blueprint)',
    'C#',
    '小程序',
    '智能硬件',
    '服务端',
  ]);
});
