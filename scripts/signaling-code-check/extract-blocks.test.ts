import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { extractBlocks } from './extract-blocks.mjs';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })),
  );
});

async function writeFixture(contents: string) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'signaling-extract-'));
  tempDirs.push(dir);
  const file = path.join(dir, 'page.mdx');
  await writeFile(file, contents, 'utf8');
  return file;
}

describe('extractBlocks', () => {
  it('keeps only the blocks inside the requested platform range', async () => {
    const file = await writeFixture(
      [
        '<PlatformStructured platform="android">',
        '```java',
        'int android = 1;',
        '```',
        '</PlatformStructured>',
        '',
        '<PlatformStructured platform="ios">',
        '```swift',
        'let ios = 1',
        '```',
        '</PlatformStructured>',
        '',
        '```swift',
        'let outsideAnyPlatform = 1',
        '```',
        '',
      ].join('\n'),
    );

    const blocks = extractBlocks([file], 'ios', ['swift', 'objc']);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toBe('let ios = 1');
    expect(blocks[0].lang).toBe('swift');
    expect(blocks[0].id).toBe('swift-001');
  });

  it('reports the source line numbers of the fence', async () => {
    const file = await writeFixture(
      [
        'Intro paragraph.',
        '',
        '<PlatformStructured platform="ios">',
        '```swift',
        'let first = 1',
        'let second = 2',
        '```',
        '</PlatformStructured>',
        '',
      ].join('\n'),
    );

    const [block] = extractBlocks([file], 'ios', ['swift']);

    expect(block.startLine).toBe(4);
    expect(block.endLine).toBe(7);
  });

  it('does not treat platform tags inside a code sample as range markers', async () => {
    const file = await writeFixture(
      [
        '<PlatformStructured platform="ios">',
        '```swift',
        '// </PlatformStructured> in a comment must not close the range',
        'let ios = 1',
        '```',
        '',
        '```swift',
        'let stillIos = 2',
        '```',
        '</PlatformStructured>',
        '',
      ].join('\n'),
    );

    const blocks = extractBlocks([file], 'ios', ['swift']);

    expect(blocks.map((block) => block.code)).toEqual([
      '// </PlatformStructured> in a comment must not close the range\nlet ios = 1',
      'let stillIos = 2',
    ]);
  });

  it('strips the fence indentation from blocks nested in list items', async () => {
    const file = await writeFixture(
      [
        '<PlatformStructured platform="ios">',
        '1. Do the thing:',
        '',
        '    ```swift',
        '    let indented = 1',
        '    if indented == 1 {',
        '        print("nested")',
        '    }',
        '    ```',
        '</PlatformStructured>',
        '',
      ].join('\n'),
    );

    const [block] = extractBlocks([file], 'ios', ['swift']);

    expect(block.code).toBe(
      'let indented = 1\nif indented == 1 {\n    print("nested")\n}',
    );
  });

  it('skips fences whose language was not requested', async () => {
    const file = await writeFixture(
      [
        '<PlatformStructured platform="ios">',
        '```ruby',
        "pod 'AgoraRtm'",
        '```',
        '```swift',
        'let ios = 1',
        '```',
        '</PlatformStructured>',
        '',
      ].join('\n'),
    );

    const blocks = extractBlocks([file], 'ios', ['swift', 'objc']);

    expect(blocks.map((block) => block.lang)).toEqual(['swift']);
  });

  it('handles CRLF sources without leaving carriage returns in the code', async () => {
    const file = await writeFixture(
      [
        '<PlatformStructured platform="ios">',
        '```swift',
        'let ios = 1',
        '```',
        '</PlatformStructured>',
        '',
      ].join('\r\n'),
    );

    const [block] = extractBlocks([file], 'ios', ['swift']);

    expect(block.code).toBe('let ios = 1');
  });
});

describe('exclusions', () => {
  async function extractOne(code: string) {
    const file = await writeFixture(
      [
        '<PlatformStructured platform="ios">',
        '```objc',
        code,
        '```',
        '</PlatformStructured>',
        '',
      ].join('\n'),
    );
    return extractBlocks([file], 'ios', ['objc'])[0];
  }

  // Migration guides show the old API beside the new one. Judging the "before"
  // half against the current SDK would report the page's whole purpose as a
  // defect.
  it('marks a block the docs label as pre-2.x', async () => {
    expect(
      (await extractOne('// 1.x\n[kit sendMessage:m];')).excluded,
    ).toContain('1.x');
    expect(
      (await extractOne('// Before v2.2.1\nlet x = 1;')).excluded,
    ).toContain('Before v2');
  });

  it('leaves current code unmarked', async () => {
    expect(
      (await extractOne('// 2.x\n[rtm publish:m];')).excluded,
    ).toBeUndefined();
    expect(
      (await extractOne('// v2.2.1 and later\n[rtm publish:m];')).excluded,
    ).toBeUndefined();
    expect((await extractOne('[rtm publish:m];')).excluded).toBeUndefined();
  });

  it('only considers the first non-empty line', async () => {
    const block = await extractOne(
      '[rtm publish:m];\n// 1.x did it differently',
    );
    expect(block.excluded).toBeUndefined();
  });

  // The api-ref pages put signature listings under "Method" and real samples
  // under "Basic usage". 79 of ios.mdx's 167 Swift blocks are listings, so
  // judging them would make the number meaningless.
  it('excludes blocks under a listing heading', async () => {
    const file = await writeFixture(
      [
        '#### Method',
        '```swift',
        'login(_ token: String?) async -> (Response?, Error?)',
        '```',
        '',
        '#### Basic usage',
        '```swift',
        'let (response, error) = await rtm.login("token")',
        '```',
        '',
      ].join('\n'),
    );

    const blocks = extractBlocks(file ? [file] : [], 'ios', ['swift'], true, [
      'Method',
    ]);

    expect(blocks[0].heading).toBe('Method');
    expect(blocks[0].excluded).toContain('signature listing');
    expect(blocks[1].heading).toBe('Basic usage');
    expect(blocks[1].excluded).toBeUndefined();
  });
});
