import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const typescriptPagePath = resolve(
  process.cwd(),
  'content/docs/zh-CN/api-reference/conversational-ai/agent-typescript/index.mdx',
);
const pythonPagePath = resolve(
  process.cwd(),
  'content/docs/zh-CN/api-reference/conversational-ai/agent-python/index.mdx',
);

function loadFengmingSTTSection() {
  const content = readFileSync(typescriptPagePath, 'utf8');
  const section = content.match(
    /^#### FengmingSTT\n([\s\S]*?)(?=^#### TencentSTT\n)/m,
  );

  expect(section, 'FengmingSTT section before TencentSTT').not.toBeNull();
  return section?.[1] ?? '';
}

describe('ConvoAI source PR 2063 TypeScript ASR keywords sync', () => {
  it('keeps FengmingSTT options optional in the constructor signature', () => {
    expect(loadFengmingSTTSection()).toContain(
      'new FengmingSTT(options?: FengmingSTTOptions)',
    );
  });

  it('documents the optional keywords array in the parameter table', () => {
    expect(loadFengmingSTTSection()).toMatch(
      /\|\s*`keywords`\s*\|\s*`string\[\]`\s*\|\s*否\s*\|\s*热词列表，用于提升 ASR 识别准确率\s*\|/,
    );
  });

  it('documents optional additional Fengming parameters merged into asr.params', () => {
    expect(loadFengmingSTTSection()).toMatch(
      /\|\s*`additionalParams`\s*\|\s*`Record<string, unknown>`\s*\|\s*否\s*\|\s*附加 Fengming 参数，合并进 `asr\.params`\s*\|/,
    );
  });

  it('replaces the no-parameters claim with optional keyword configuration', () => {
    const section = loadFengmingSTTSection();

    expect(section).not.toContain('无需任何参数');
    expect(section).toContain('无需外部凭据');
    expect(section).toContain(
      '可选传入 `keywords` 热词列表和 `additionalParams`',
    );
    expect(section).toContain('这些参数会写入 `asr.params`');
  });
});

describe('ConvoAI source PR 2063 Python ASR keywords sync', () => {
  function loadPythonSection(name: string) {
    const content = readFileSync(pythonPagePath, 'utf8');
    const section = content.match(
      new RegExp(`^#### ${name}\\n([\\s\\S]*?)(?=^#### )`, 'm'),
    );

    expect(section, `${name} section`).not.toBeNull();
    return section?.[1] ?? '';
  }

  it('documents optional keywords in the FengmingSTT table', () => {
    expect(loadPythonSection('FengmingSTT')).toMatch(
      /\|\s*`keywords`\s*\|\s*`List\[str\]`\s*\|\s*否\s*\|\s*`None`\s*\|\s*热词列表，用于提升 ASR 识别准确率\s*\|/,
    );
  });

  it('keeps the vendor description and later asr.keywords correction', () => {
    const section = loadPythonSection('FengmingSTT');

    expect(section).toContain('声网自研的「风鸣」STT 服务，无需外部凭据');
    expect(section).toContain('`asr.vendor = "fengming"`');
    expect(section).toContain('可选传入 `keywords` 热词列表');
    expect(section).toContain('这些参数会写入 `asr.keywords`');
    expect(section).not.toContain('asr.params.keywords');
  });

  it('does not misattribute Fengming keywords to TencentSTT', () => {
    expect(loadPythonSection('TencentSTT')).not.toMatch(
      /^\|\s*`keywords`\s*\|/m,
    );
  });
});
