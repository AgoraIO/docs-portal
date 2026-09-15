import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getBundledOpenApiSourcePaths } from './source-text.server';

function getOpenApiYamlSourcePaths(dir = 'content/openapi'): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.posix.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getOpenApiYamlSourcePaths(entryPath);
      }

      return /\.ya?ml$/.test(entry.name) ? [entryPath] : [];
    })
    .sort();
}

describe('openapi bundled source text registry', () => {
  it('registers every maintained OpenAPI YAML file', () => {
    expect(getBundledOpenApiSourcePaths().sort()).toEqual(
      getOpenApiYamlSourcePaths(),
    );
  });

  it('keeps Analytics REST overview links on canonical Usage Analytics pages', () => {
    const source = fs.readFileSync(
      'content/openapi/agora-analytics/analytics-rest-api.zh-CN.yaml',
      'utf8',
    );
    expect(source).toContain(
      '/zh-CN/realtime-media/usage-analytics/build/investigate-call-problems/overview',
    );
    expect(source).toContain(
      '/zh-CN/realtime-media/usage-analytics/build/analyze-call-data/basic',
    );
    expect(source).toContain(
      '/zh-CN/realtime-media/usage-analytics/build/analyze-call-data/plus',
    );
    expect(source).toContain(
      '/zh-CN/realtime-media/usage-analytics/build/monitor-call-quality/monitor',
    );
    expect(source).not.toContain('/usage-analytics/build/rtc/');
  });
});
