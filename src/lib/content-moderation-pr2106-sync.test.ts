import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(
    process.cwd(),
    'content/docs/zh-CN/realtime-media/content-moderation/build/netease-yidun-video-moderation.mdx',
  ),
  'utf8',
);
const enableServiceRoute =
  '/zh-CN/realtime-media/content-moderation/enable-service';

function readPlatform(platform: string) {
  const matches = [
    ...source.matchAll(
      /<PlatformStructured platform="([^"]+)">([\s\S]*?)<\/PlatformStructured>/g,
    ),
  ].filter((match) => match[1] === platform);
  expect(matches).toHaveLength(1);
  return matches[0]?.[2] ?? '';
}

describe('Content Moderation upstream PR #2106 parity', () => {
  it('puts Web service activation and callback-server prerequisites before implementation', () => {
    const web = readPlatform('web');
    expect(web).toContain(
      `## 前提条件\n\n开始前，请先按照[开通服务](${enableServiceRoute})中的步骤完成内容审核服务开通，并准备接收审核结果回调的业务服务器。`,
    );
    expect(web.indexOf('## 前提条件')).toBeLessThan(web.indexOf('## 实现步骤'));
    expect(web.match(/^## 前提条件$/gm)).toHaveLength(1);
  });

  it.each(['android', 'ios'])(
    'preserves the existing %s activation prerequisites',
    (platform) => {
      const body = readPlatform(platform);
      expect(body).toContain(
        `## 前提条件\n\n开始前，请先按照[开通服务](${enableServiceRoute})中的步骤完成内容审核服务开通。`,
      );
      expect(body).toContain('你需要自行准备接收审核结果回调的业务服务器。');
      expect(body.indexOf('## 前提条件')).toBeLessThan(
        body.indexOf('## 实现步骤'),
      );
    },
  );

  it('preserves the Web callback-server notice and all implementation steps', () => {
    const web = readPlatform('web');
    expect(web).toContain(
      ':::info[信息]\n你需要自行准备接收审核结果回调的业务服务器。\n:::',
    );
    for (const heading of [
      '## 实现步骤',
      '### 1. 集成 SDK',
      '### 2. 开始审核',
      '### 3. 接收审核结果',
    ]) {
      expect(web).toContain(heading);
    }
    expect(web).toContain(
      'client.setImageModeration(true, imageModerationConfig)',
    );
  });

  it('resolves the canonical service-activation link to a real local document', () => {
    expect(
      existsSync(
        resolve(process.cwd(), `content/docs${enableServiceRoute}.mdx`),
      ),
    ).toBe(true);
  });
});
