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
    expect(getCnSearchPlatforms({ restful: 2, 'restful-api': 3 })).toEqual([
      'restful',
    ]);
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
