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
});
