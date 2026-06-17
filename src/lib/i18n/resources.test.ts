import { describe, expect, it } from 'vitest';
import { resources } from './resources';

describe('i18n resources', () => {
  it('keeps the shared common namespace scoped to docs shell copy', () => {
    expect(Object.keys(resources.en.common).sort()).toEqual([
      'app',
      'controls',
      'docs',
    ]);
    expect(Object.keys(resources['zh-CN'].common).sort()).toEqual([
      'app',
      'controls',
      'docs',
    ]);
  });
});
