import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const page = readFileSync(
  resolve(
    process.cwd(),
    'content/docs/zh-CN/api-reference/conversational-ai/agent-typescript/index.mdx',
  ),
  'utf8',
);
const aliasesStart = page.indexOf('### Type aliases\n');
const aliasesEnd = page.indexOf('\n## AgentSession', aliasesStart);
if (aliasesStart < 0 || aliasesEnd <= aliasesStart) {
  throw new Error(
    'Missing or unordered Type aliases / AgentSession boundaries',
  );
}
const aliases = page.slice(aliasesStart, aliasesEnd);

describe('ConvoAI source PR 2101 TypeScript context configuration', () => {
  it('uses the source generated_config name in the dynamic filler contract', () => {
    expect(aliases).toBeDefined();
    expect(aliases).toContain('`generated_config` 中的 `prompt`');
    expect(aliases).not.toContain('`generatedConfig`');
  });

  it('documents the context count range and service default', () => {
    expect(aliases).toContain(
      '`context_message_limit`（取值范围 `1` 到 `6`，省略时由服务按 `1` 处理）',
    );
  });

  it('documents the historical character range and service default', () => {
    expect(aliases).toContain(
      '`history_character_limit`（取值范围 `0` 到 `10000`，省略时由服务按 `1000` 处理）',
    );
  });

  it('counts the current user message and enables history only at 2–6', () => {
    expect(aliases).toContain(
      '前者包含当前用户消息，显式设置为 `2` 到 `6` 时启用近期历史',
    );
  });

  it('counts only historical text as Unicode code points', () => {
    expect(aliases).toContain('后者只统计历史消息文本的 Unicode code points');
  });

  it('preserves mandatory nonempty fallback and service-managed credentials', () => {
    expect(aliases).toContain('必须同时配置非空的静态短语作为回退');
    expect(aliases).toContain('模型服务和凭证由声网托管');
    expect(aliases).toContain(
      '/zh-CN/ai/build/shape-the-conversation/filler-words',
    );
  });

  it('preserves all state-specific Think append constants and behavior', () => {
    for (const state of ['Listening', 'Thinking', 'Speaking']) {
      expect(aliases).toContain(`\`ThinkOn${state}ActionAppend\``);
      expect(aliases).toContain(`\`ThinkOn${state}ActionInterrupt\``);
      expect(aliases).toContain(`\`ThinkOn${state}ActionIgnore\``);
    }
    expect(aliases).toContain('`ThinkOnListeningActionInject`');
    expect(aliases).toContain('`append` 不打断当前交互');
    expect(aliases).toContain('独立的 user 消息追加到上下文并发起新一轮对话');
  });
});
