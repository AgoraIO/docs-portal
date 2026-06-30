import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { rootHead } from './__root';

const faviconSvgPath = join(process.cwd(), 'public/favicon.svg');
const fallbackFaviconPath = join(process.cwd(), 'public/favicon.ico');

describe('root head favicon metadata', () => {
  it('configures the Agora favicon assets', () => {
    expect(rootHead.links).toEqual(
      expect.arrayContaining([
        {
          rel: 'icon',
          href: '/favicon.svg',
          type: 'image/svg+xml',
          sizes: 'any',
        },
        {
          rel: 'icon',
          href: '/favicon.ico',
          type: 'image/png',
          sizes: '512x512',
        },
      ]),
    );
  });

  it('keeps the configured favicon files in public assets', () => {
    expect(existsSync(faviconSvgPath)).toBe(true);
    expect(readFileSync(faviconSvgPath, 'utf8')).toContain(
      'aria-label="Agora"',
    );
    expect(existsSync(fallbackFaviconPath)).toBe(true);
  });
});
