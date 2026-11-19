import { describe, expect, it } from 'vitest';
import {
  readLegacyImageSizing,
  renderMigratedImage,
} from './lib/legacy-image-sizing.mjs';
import {
  extractLegacyImageSizes,
  restoreImageSizes,
} from './restore-legacy-image-sizes.mjs';

describe('legacy image sizing parity', () => {
  it('preserves percentage screenshots and static pixel dimensions', () => {
    const hints = extractLegacyImageSizes(
      '<Image src="/enable.png" width="40%" />\n<img src="/shot.png" height={320} />',
    );
    const result = restoreImageSizes(
      '   ![功能配置](/enable.png)\n\n![截图](/shot.png)',
      hints,
    );
    expect(result.changes).toHaveLength(2);
    expect(result.content).toContain(
      '   <DocsImage alt="功能配置" src="/enable.png" displayWidth="40%" />',
    );
    expect(result.content).toContain('displayHeight="320px"');
    expect(restoreImageSizes(result.content, hints).changes).toEqual([]);
  });

  it('matches rewritten assets while retaining the current URL and alt text', () => {
    const hints = extractLegacyImageSizes(
      '<Image src="/old.png" width="70%" />',
    );
    const result = restoreImageSizes(
      '![现有替代文本](https://cdn.example/hash.png)',
      hints,
      () => 'same-asset',
    );
    expect(result.content).toBe(
      '<DocsImage alt="现有替代文本" src="https://cdn.example/hash.png" displayWidth="70%" />',
    );
  });

  it('does not guess conflicting source sizes or overwrite authored target sizing', () => {
    const hints = extractLegacyImageSizes(
      '<Image src="/x.png" width="40%" /><Image src="/x.png" width="80%" />',
    );
    expect(restoreImageSizes('![示意](/x.png)', hints).conflicts).toHaveLength(
      1,
    );
    const sized = '<DocsImage alt="示意" src="/x.png" displayWidth="60%" />';
    expect(restoreImageSizes(sized, hints)).toMatchObject({
      content: sized,
      changes: [],
      conflicts: [],
    });
  });

  it('ignores examples and comments, and keeps unsized images unchanged', () => {
    const source =
      '```mdx\n<Image src="/x.png" width="40%" />\n```\n{/* <Image src="/x.png" width="20%" /> */}\n<Image src="/plain.png" />';
    expect(extractLegacyImageSizes(source)).toEqual([]);
    const hints = extractLegacyImageSizes('<Image src="/x.png" width="40%" />');
    const code = '```md\n![示意](/x.png)\n```';
    expect(restoreImageSizes(code, hints).content).toBe(code);
    expect(restoreImageSizes('![普通截图](/plain.png)', hints).changes).toEqual(
      [],
    );
  });

  it('uses the source platform when a shared image has different widths', () => {
    const hints = [
      { src: '/flow.svg', alt: '流程', width: '70%', platform: 'android' },
      { src: '/flow.svg', alt: '流程', width: '60%', platform: 'ios' },
    ];
    const content =
      '<PlatformStructured platform="android">\n![流程](/flow.svg)\n</PlatformStructured>\n<PlatformStructured platform="ios">\n![流程](/flow.svg)\n</PlatformStructured>';
    const result = restoreImageSizes(content, hints);
    expect(result.conflicts).toEqual([]);
    expect(result.content).toContain('displayWidth="70%"');
    expect(result.content).toContain('displayWidth="60%"');
  });

  it('preserves sized inline icons without a zoom wrapper', () => {
    const image = readLegacyImageSizing(
      'src="/icon.png" alt="运行" inline width={25}',
    );
    expect(renderMigratedImage(image)).toBe(
      '<InlineImage alt="运行" src="/icon.png" width={25} />',
    );
  });
});
