import { describe, expect, it } from 'vitest';
import { parseKbTarget, targetIdentity, workspaceHost } from './bailian-config';

const target = {
  schema: 1,
  environment: 'local-demo',
  region: 'cn-beijing',
  workspaceId: 'llm-test',
  categoryId: 'cate-test',
  name: 'cn-ai-bot-demo',
  origin: 'https://doc.shengwang.cn',
  scope: 'demo',
};
describe('KB target configuration', () => {
  it('constructs only the workspace endpoint and binds all target dimensions', () => {
    const a = parseKbTarget(target);
    expect(workspaceHost(a.workspaceId)).toBe(
      'https://llm-test.cn-beijing.maas.aliyuncs.com',
    );
    expect(targetIdentity(a)).not.toBe(
      targetIdentity(parseKbTarget({ ...target, categoryId: 'other' })),
    );
    expect(targetIdentity(a)).not.toBe(
      targetIdentity(parseKbTarget({ ...target, indexId: 'kb-new' })),
    );
  });
  it.each(['llm-test.attacker.test', 'llm-test/user', 'test', 'llm-a@host'])(
    'rejects untrusted workspace %s',
    (workspaceId) =>
      expect(() => parseKbTarget({ ...target, workspaceId })).toThrow(),
  );
  it.each([
    'http://docs.test',
    'https://user:pass@docs.test',
    'https://docs.test/x',
    'https://docs.test?q=a',
    'https://docs.test#x',
  ])('rejects an invalid citation origin %s', (origin) =>
    expect(() => parseKbTarget({ ...target, origin })).toThrow(),
  );
  it('normalizes selection without losing sample/full isolation', () => {
    const a = parseKbTarget({
      ...target,
      selection: ['/zh-CN/ai/b', '/zh-CN/ai/a'],
    });
    expect(a.selection).toEqual(['/zh-CN/ai/a', '/zh-CN/ai/b']);
    expect(targetIdentity(a)).not.toBe(targetIdentity(parseKbTarget(target)));
    expect(() => parseKbTarget({ ...target, selection: [] })).toThrow();
  });
});
