import { describe, expect, it } from 'vitest';
import { bestAttempt, declaresSwift, resolveContext } from './check-apple.mjs';

describe('declaresSwift', () => {
  it('recognises a real member declaration', () => {
    expect(
      declaresSwift('var rtmKit: AgoraRtmClientKit? = nil', 'rtmKit'),
    ).toBe(true);
    expect(declaresSwift('    var appid: String = "abc"', 'appid')).toBe(true);
    expect(declaresSwift('func login() {}', 'login')).toBe(true);
  });

  // The docs bind `rtmKit` to shadow the member before using it. Reading that
  // as a declaration suppressed the stub the block needed, and every affected
  // block then failed with a misleading "cannot find 'rtmKit' in scope".
  it('does not mistake an optional binding for a declaration', () => {
    expect(
      declaresSwift(
        'guard !message.isEmpty, let rtmKit = rtmKit else { return }',
        'rtmKit',
      ),
    ).toBe(false);
    expect(declaresSwift('if let rtmKit = rtmKit {', 'rtmKit')).toBe(false);
    expect(declaresSwift('if let error = error {', 'error')).toBe(false);
    expect(declaresSwift('while let next = iterator.next() {', 'next')).toBe(
      false,
    );
  });

  it('still finds a declaration when the block also shadows it later', () => {
    const code = [
      'var rtmKit: AgoraRtmClientKit? = nil',
      'func send() {',
      '    guard let rtmKit = rtmKit else { return }',
      '}',
    ].join('\n');

    expect(declaresSwift(code, 'rtmKit')).toBe(true);
  });
});

describe('bestAttempt', () => {
  // The last shape tried is the most permissive, so its diagnostics are mostly
  // wrapping noise. The shape that got furthest reports the real defect.
  it('picks the failing attempt with the fewest errors', () => {
    const attempts = [
      { shape: 'as-written', ok: false, diagnostics: 'a.m:1: error: one' },
      {
        shape: 'method-body',
        ok: false,
        diagnostics: [
          "b.m:1: error: unexpected '@' in program",
          "b.m:2: error: unexpected '@' in program",
          "b.m:3: error: unexpected '@' in program",
        ].join('\n'),
      },
    ];

    expect(bestAttempt(attempts)?.shape).toBe('as-written');
  });

  it('returns null when nothing failed', () => {
    expect(
      bestAttempt([{ shape: 'as-written', ok: true, diagnostics: '' }]),
    ).toBe(null);
  });

  it('returns null for an empty attempt list', () => {
    expect(bestAttempt([])).toBe(null);
  });
});

type Stub = { name: string; code: string };

describe('resolveContext', () => {
  const base = {
    swift: {
      members: [
        { name: 'rtmKit', code: 'var rtmKit: AgoraRtmClientKit? = nil' },
        { name: 'token', code: 'var token: String = ""' },
      ],
      fileLevel: ['struct Message {}'],
    },
    objc: { ivars: [{ name: 'rtm', code: 'AgoraRtmClientKit *rtm;' }] },
    overrides: [
      {
        match: 'rtm/build/',
        swift: {
          members: [
            { name: 'rtmKit', code: 'var rtmKit: AgoraRtmClientKit = x' },
            { name: 'handler', code: 'var handler = RtmListener()' },
          ],
          fileLevel: ['final class RtmListener {}'],
        },
      },
    ],
  };

  it('leaves a non-matching file on the base context', () => {
    const ctx = resolveContext(
      base,
      'content/docs/en/realtime-media/rtm/quickstart.mdx',
    );
    expect(
      ctx.swift.members.find((m: Stub) => m.name === 'rtmKit')?.code,
    ).toContain('?');
    expect(ctx.swift.members).toHaveLength(2);
  });

  // The guide pages call the client without unwrapping; the quickstart's own
  // optional would misreport every one of those blocks.
  it('replaces a stub by name for a matching file', () => {
    const ctx = resolveContext(
      base,
      'content/docs/en/realtime-media/rtm/build/x.mdx',
    );
    expect(
      ctx.swift.members.find((m: Stub) => m.name === 'rtmKit')?.code,
    ).not.toContain('?');
  });

  it('appends stubs the base context did not have', () => {
    const ctx = resolveContext(
      base,
      'content/docs/en/realtime-media/rtm/build/x.mdx',
    );
    expect(ctx.swift.members.map((m: Stub) => m.name)).toEqual([
      'rtmKit',
      'token',
      'handler',
    ]);
  });

  it('accumulates plain-string declaration lists', () => {
    const ctx = resolveContext(
      base,
      'content/docs/en/realtime-media/rtm/build/x.mdx',
    );
    expect(ctx.swift.fileLevel).toEqual([
      'struct Message {}',
      'final class RtmListener {}',
    ]);
  });

  it('does not mutate the base context', () => {
    resolveContext(base, 'content/docs/en/realtime-media/rtm/build/x.mdx');
    expect(
      base.swift.members.find((m: Stub) => m.name === 'rtmKit')?.code,
    ).toContain('?');
    expect(base.swift.fileLevel).toHaveLength(1);
  });

  it('normalises Windows path separators', () => {
    const ctx = resolveContext(
      base,
      String.raw`content\docs\en\realtime-media\rtm\build\x.mdx`,
    );
    expect(
      ctx.swift.members.find((m: Stub) => m.name === 'rtmKit')?.code,
    ).not.toContain('?');
  });
});
