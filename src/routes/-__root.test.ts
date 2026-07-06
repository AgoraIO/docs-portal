import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { rootHead } from './__root';

const faviconPngPath = join(process.cwd(), 'public/favicon-32x32.png');
const fallbackFaviconPath = join(process.cwd(), 'public/favicon.ico');

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

  it('keeps the configured favicon files in public assets', () => {
    expect(existsSync(faviconPngPath)).toBe(true);
    expectPngDimensions(readFileSync(faviconPngPath), 32, 32);
    expect(existsSync(fallbackFaviconPath)).toBe(true);
    expectPngDimensions(readFileSync(fallbackFaviconPath), 32, 32);
  });
});

function expectPngDimensions(buffer: Buffer, width: number, height: number) {
  expect(buffer.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  expect(buffer.readUInt32BE(16)).toBe(width);
  expect(buffer.readUInt32BE(20)).toBe(height);
}
