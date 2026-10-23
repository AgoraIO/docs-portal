import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { selectPlatformMarkdown } from '../test/platform-markdown';

const source = readFileSync(
  'content/docs/zh-CN/realtime-media/rtm/build/messaging/send-message.mdx',
  'utf8',
);

describe('RTM send-message platform semantics', () => {
  it('shows Web API names and USER semantics without Unity-only restrictions', () => {
    const body = selectPlatformMarkdown(source, 'web');
    for (const name of [
      '`publish`',
      '`USER`',
      '`RTMStreamChannel`',
      '`joinTopic`',
      '`publishTopicMessage`',
    ]) {
      expect(body).toContain(name);
    }
    expect(body).not.toMatch(/`(?:message|enumv|channel|topic)\./);
    expect(body).not.toContain('方法仅适用于 Message Channel，你');
    expect(body).not.toContain('PublishResult');
    expect(body).not.toContain('消息负载序列化');
  });

  it('keeps Unity-only methods and acknowledgements out of other SDKs', () => {
    const body = selectPlatformMarkdown(source, 'unity');
    expect(body).toContain('`PublishAsync`');
    expect(body).toContain('`PublishResult`');
    expect(body).toContain('`JoinTopicAsync`');
    expect(body).toContain('`PublishTopicMessageAsync`');
    expect(body).not.toContain('## User Channel');
  });

  it('keeps Mini Program content free of Stream Channel integration steps', () => {
    const body = selectPlatformMarkdown(source, 'mini-program');
    expect(body).toContain('`USER`');
    expect(body).not.toContain('你需要创建一个');
    expect(body).not.toContain('120 QPS');
    expect(body).not.toContain('成功向 Topic');
  });

  it.each([
    ['android', 'StreamChannel', 'USER', 'join'],
    [
      'ios',
      'AgoraRtmStreamChannel',
      'AgoraRtmChannelTypeUser',
      'joinWithOption',
    ],
    ['swift', 'AgoraRtmStreamChannel', 'user', 'join'],
    ['cpp', 'IStreamChannel', 'RTM_CHANNEL_TYPE_USER', 'join'],
    ['flutter', 'StreamChannel', 'user', 'join'],
    ['harmonyos', 'StreamChannel', 'USER', 'join'],
  ] as const)(
    'preserves %s source symbol mappings',
    (platform, channel, user, join) => {
      const body = selectPlatformMarkdown(source, platform);
      expect(body).toContain(`\`${channel}\``);
      expect(body).toContain(`\`${user}\``);
      expect(body).toContain(`\`${join}\``);
      expect(body).not.toMatch(/`(?:message|enumv|channel|topic)\./);
      expect(body).not.toContain('`config.');
      if (platform === 'cpp') {
        expect(body).toContain('`onPublishResult`');
        expect(body).toContain('`onPublishTopicMessageResult`');
      }
    },
  );
});
