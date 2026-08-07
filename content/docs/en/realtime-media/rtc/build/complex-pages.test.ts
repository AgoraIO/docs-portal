import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const docsFile = (relativePath: string) => resolve(process.cwd(), relativePath);
const cloudProxyFile = docsFile(
  'content/docs/en/realtime-media/rtc/build/manage-connection-and-quality/cloud-proxy.mdx',
);
const files = [
  docsFile(
    'content/docs/en/realtime-media/rtc/build/authenticate-users/authentication-workflow.mdx',
  ),
  docsFile(
    'content/docs/en/realtime-media/rtc/build/control-audio-and-devices/volume-control-and-mute.mdx',
  ),
  cloudProxyFile,
];

describe('video complex build pages', () => {
  for (const file of files) {
    it(`${file.split('/').at(-1)} exists and is normalized`, () => {
      expect(existsSync(file)).toBe(true);

      const content = readFileSync(file, 'utf8');

      expect(content).toContain('<PlatformStructured');
      expect(content).not.toContain('<Tabs defaultValue="tab1">\n<Tabs defaultValue="tab1">');
      expect(content).not.toContain('platform="react-js"');
    });
  }

  it('cloud-proxy avoids CodeBlockTabs inside the web platform section', () => {
    const file = cloudProxyFile;
    const content = readFileSync(file, 'utf8');

    expect(content).not.toContain(
      '<CodeBlockTabs defaultValue="v4.3.0 or above">',
    );
  });
});
