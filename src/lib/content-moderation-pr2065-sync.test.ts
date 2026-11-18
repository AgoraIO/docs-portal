import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(
    process.cwd(),
    'content/docs/zh-CN/realtime-media/content-moderation/build/audio-moderation-api.mdx',
  ),
  'utf8',
);
const setup =
  source.match(
    /### 开通语音审核服务\n([\s\S]*?)(?=### 通过 Basic HTTP 认证)/,
  )?.[1] ?? '';
const stepThree = setup.match(/^3\.[\s\S]*?(?=\n\n成功开通)/m)?.[0] ?? '';
const moderationRoot = '/zh-CN/realtime-media/content-moderation';

describe('Content Moderation upstream PR #2065 parity', () => {
  it('uses console self-service with email and canonical setup links in step 3', () => {
    expect(stepThree).toBe(
      `3. 在声网控制台的**内容审核**页面填写邮箱等必要信息，并开启音频审核服务。开通步骤详见[开通服务](${moderationRoot}/enable-service)，透传字段和回调地址设计建议详见[配置说明](${moderationRoot}/build/configuration)。`,
    );
    expect(setup).not.toContain('联系声网技术支持');
    expect(setup).not.toContain('公司全称');
    expect(setup).not.toContain('邮箱：用于创建审核子账号');

    for (const route of ['enable-service', 'build/configuration']) {
      expect(
        existsSync(
          resolve(process.cwd(), `content/docs${moderationRoot}/${route}.mdx`),
        ),
      ).toBe(true);
    }
  });

  it.each([
    '可用于与审核频道以及发流端进行关联。',
    '可用于关联审核频道与发流端。',
  ])(
    'preserves the already-synced clientRequest wording: %s',
    (association) => {
      expect(source).toContain(
        `回调结果中包含 \`clientRequest\` 信息，其中包含 \`cname\` 和 \`uid\` 字段，${association}`,
      );
      expect(source).not.toContain(
        `回调结果中包含 \`clientInfo\` 信息，其中包含 \`cname\` 和 \`uid\` 字段，${association}`,
      );
    },
  );

  it('preserves API callback fields and callback-address configuration', () => {
    expect(source).toContain('| callbackUrl | String | 是 | 512 |');
    expect(source).toContain('| callback | String | 否 | 1024 |');
    expect(source).toContain(
      '语音审核结果会以 HTTP 请求的形式直接发送到你在 `extensionServiceConfig` 中设置的回调地址。',
    );
  });

  it('preserves the billing warning and successful-activation login guidance', () => {
    expect(setup).toContain(':::warning[注意]');
    expect(setup).toContain(
      '第三方语音审核服务依赖于声网云端录制服务，除了第三方语音审核服务费用，还会产生声网云端录制费用。',
    );
    expect(setup).toContain(
      '成功开通语音审核服务后，你可以使用邮箱登陆网易易盾控台，进行审核策略配置，获取审核权限信息（如 `SecretId`、`SecretKey` 等），后续调用接口时需要传入。',
    );
  });
});
