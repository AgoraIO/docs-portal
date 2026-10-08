import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { rootHead } from './__root';

const faviconPngPath = join(process.cwd(), 'public/favicon-32x32.png');
const fallbackFaviconPath = join(process.cwd(), 'public/favicon.ico');
const rootRouteSource = readFileSync(
  join(process.cwd(), 'src/routes/__root.tsx'),
  'utf8',
);
const docsContentSource = readFileSync(
  join(process.cwd(), 'src/components/docs-shell/DocsContent.tsx'),
  'utf8',
);

describe('root head favicon metadata', () => {
  it('configures the Agora favicon assets', () => {
    expect(rootHead.links).toEqual(
      expect.arrayContaining([
        {
          rel: 'icon',
          href: '/favicon-32x32.png',
          type: 'image/png',
          sizes: '32x32',
        },
        {
          rel: 'icon',
          href: '/favicon.ico',
          type: 'image/png',
          sizes: '32x32',
        },
      ]),
    );
  });

  it('uses Shengwang branding and a theme-aware favicon in CN builds', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_DOCS_REGION', 'cn');
    try {
      const { rootHead: cnHead } = await import('./__root');
      expect(cnHead.meta).toContainEqual({ title: '声网文档' });
      expect(cnHead.links).toContainEqual({
        rel: 'icon',
        href: '/shengwang-favicon.svg',
        type: 'image/svg+xml',
      });
      expect(
        existsSync(join(process.cwd(), 'public/shengwang-favicon.svg')),
      ).toBe(true);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });

  it('keeps the configured favicon files in public assets', () => {
    expect(existsSync(faviconPngPath)).toBe(true);
    expectPngDimensions(readFileSync(faviconPngPath), 32, 32);
    expect(existsSync(fallbackFaviconPath)).toBe(true);
    expectPngDimensions(readFileSync(fallbackFaviconPath), 32, 32);
  });

  it('places the agent discovery directive at the start of the document body', () => {
    const directivePosition = rootRouteSource.indexOf(
      'data-agent-docs-directive="true"',
    );
    const appPosition = rootRouteSource.indexOf('<AppProviders>');

    expect(directivePosition).toBeGreaterThan(-1);
    expect(directivePosition).toBeLessThan(appPosition);
    expect(docsContentSource).not.toContain('data-agent-docs-directive="true"');
  });
});

function expectPngDimensions(buffer: Buffer, width: number, height: number) {
  expect(buffer.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  expect(buffer.readUInt32BE(16)).toBe(width);
  expect(buffer.readUInt32BE(20)).toBe(height);
}
