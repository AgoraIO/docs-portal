import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const files = [
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/build/authenticate-users/authentication-workflow.mdx',
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute.mdx',
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/build/manage-connection-and-quality/cloud-proxy.mdx',
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
    const file =
      '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/build/manage-connection-and-quality/cloud-proxy.mdx';
    const content = readFileSync(file, 'utf8');

    expect(content).not.toContain(
      '<CodeBlockTabs defaultValue="v4.3.0 or above">',
    );
  });
});
