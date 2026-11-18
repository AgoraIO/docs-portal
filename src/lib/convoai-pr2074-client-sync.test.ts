import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = 'content/docs/zh-CN/api-reference/conversational-ai';
const platforms = ['android', 'ios', 'web'] as const;

function read(platform: string, page: string) {
  return readFileSync(
    resolve(process.cwd(), root, platform, `${page}.mdx`),
    'utf8',
  );
}

function section(content: string, title: string) {
  const match = content.match(
    new RegExp(`^## ${title}\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'),
  );
  expect(match, title).not.toBeNull();
  return match?.[1] ?? '';
}

function row(content: string, name: string) {
  const match = content
    .split('\n')
    .find((line) => line.startsWith(`| \`${name}\` |`));
  expect(match, name).toBeDefined();
  return match ?? '';
}

describe('ConvoAI source PR 2074 client methods', () => {
  it.each(platforms)(
    'links speak and think from the %s overview',
    (platform) => {
      const page = read(platform, 'overview');
      const api =
        platform === 'android' ? 'iconversationalaiapi' : 'conversationalaiapi';
      for (const method of ['speak', 'think']) {
        expect(page).toContain(
          `[\`${method}\`](/zh-CN/api-reference/conversational-ai/${platform}/${api}#${method})`,
        );
      }
    },
  );

  for (const platform of platforms) {
    it.each(['speak', 'think'] as const)(
      `${platform} %s distinguishes publish success from processing completion`,
      (method) => {
        const api =
          platform === 'android'
            ? 'iconversationalaiapi'
            : 'conversationalaiapi';
        const body = section(read(platform, api), method);
        const message = method === 'speak' ? 'SpeakMessage' : 'ThinkMessage';
        expect(row(body, 'message')).toContain(`\`${message}\``);
        expect(row(body, 'message')).toContain(
          `struct#${message.toLowerCase()}`,
        );
        expect(body).toContain('RTM 消息');
        expect(body).toContain(
          method === 'speak'
            ? '不代表智能体已经完成播报'
            : '不代表大模型已经完成处理',
        );
        if (platform === 'android') {
          expect(body).toContain('该方法需要 RTM');
          expect(row(body, 'completion')).toContain(
            '`(error: ConversationalAIAPIError?) -> Unit`',
          );
          expect(row(body, 'completion')).toContain(
            '成功时 `error` 为 null，失败时为非 null',
          );
        } else if (platform === 'ios') {
          expect(body).toContain('该方法需要 RTM');
          expect(row(body, 'agentUserId')).toContain(
            'RTM 用户 ID，必须全局唯一',
          );
          expect(row(body, 'completion')).toContain(
            '`@escaping (ConversationalAIAPIError?) -> Void`',
          );
          expect(row(body, 'completion')).toContain(
            '成功时返回 `nil`，失败时返回错误信息',
          );
        } else {
          expect(body).toContain('初始化时传入 `rtmEngine`');
          expect(body).toContain('Promise 成功仅表示 RTM 消息发布成功');
        }
      },
    );
  }
});

describe('ConvoAI source PR 2074 message member tables', () => {
  it.each(platforms)(
    'documents SpeakMessage field types and defaults for %s',
    (platform) => {
      const body = section(read(platform, 'struct'), 'SpeakMessage');
      const textType = platform === 'web' ? 'string' : 'String';
      const booleanType =
        platform === 'android'
          ? 'Boolean'
          : platform === 'ios'
            ? 'Bool'
            : 'boolean';
      const priority =
        platform === 'android'
          ? 'INTERRUPT'
          : platform === 'ios'
            ? '.interrupt'
            : 'INTERRUPTED';
      expect(row(body, 'text')).toContain(`\`${textType}\``);
      expect(row(body, 'text')).toContain('要播报的文本');
      expect(row(body, 'priority')).toContain(`默认值为 \`${priority}\``);
      expect(row(body, 'priority')).toContain(
        platform === 'web' ? 'enum#echatmessagepriority' : 'enum#priority',
      );
      expect(row(body, 'interruptable')).toContain(`\`${booleanType}\``);
      expect(row(body, 'interruptable')).toContain('默认值为 `true`');
    },
  );

  it.each(platforms)(
    'documents ThinkMessage actions, metadata, and defaults for %s',
    (platform) => {
      const body = section(read(platform, 'struct'), 'ThinkMessage');
      for (const [field, type, anchor] of [
        ['onListeningAction', 'ThinkListeningAction', 'thinklisteningaction'],
        ['onThinkingAction', 'ThinkThinkingAction', 'thinkthinkingaction'],
        ['onSpeakingAction', 'ThinkSpeakingAction', 'thinkspeakingaction'],
      ]) {
        const value = field === 'onListeningAction' ? 'interrupt' : 'ignore';
        const fallback = platform === 'ios' ? `.${value}` : value.toUpperCase();
        expect(row(body, field)).toContain(`\`${type}\``);
        expect(row(body, field)).toContain(`默认值为 \`${fallback}\``);
        expect(row(body, field)).toContain(`enum#${anchor}`);
      }
      expect(row(body, 'text')).toContain('要注入大模型的指令文本');
      expect(row(body, 'interruptable')).toContain('默认值为 `true`');
      const metadataType =
        platform === 'ios'
          ? '[String: String]?'
          : platform === 'android'
            ? 'Map<String, String>?'
            : 'Record<string, string>';
      expect(row(body, 'metadata')).toContain(`\`${metadataType}\``);
      if (platform !== 'web') {
        expect(row(body, 'metadata')).toContain(
          `为 ${platform === 'ios' ? 'nil' : 'null'} 时不会写入 RTM 消息`,
        );
      }
    },
  );

  it.each([
    ['ThinkListeningAction', '倾听'],
    ['ThinkThinkingAction', '思考'],
    ['ThinkSpeakingAction', '说话'],
  ])('describes the Web %s state before its enum mapping', (name, state) => {
    const body = section(read('web', 'enum'), name);
    expect(body).toContain(`Think 指令到达时智能体处于${state}状态的处理动作`);
    expect(row(body, 'APPEND')).toContain('`append`');
    expect(row(body, 'APPEND')).toContain('在当前交互完成后追加处理');
  });
});
