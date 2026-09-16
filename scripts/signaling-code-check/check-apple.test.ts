import { describe, expect, it } from 'vitest';
import {
  bestAttempt,
  declaresSwift,
  resolveContext,
  splitDeclarationsAndStatements,
} from './check-apple.mjs';

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

describe('splitDeclarationsAndStatements', () => {
  const args = ['PRE\n', 'EXT\n', 'Base', []] as const;

  // The docs declare a listener class, then instantiate it and register it.
  // The statements are invalid at file scope and the @interface is invalid in
  // a method body, so neither half can carry the other.
  it('sends declarations to file scope and statements to a method', () => {
    const code = [
      '@interface RtmListenerEx : NSObject',
      '@end',
      '',
      'RtmListenerEx* handlerEx = [[RtmListenerEx alloc] init];',
      '[rtm addDelegate:handlerEx];',
    ].join('\n');

    const [candidate] = splitDeclarationsAndStatements(code, ...args);

    expect(candidate.shape).toBe('declarations+statements');
    expect(candidate.source).toContain('@interface RtmListenerEx : NSObject');
    expect(candidate.source).toContain('- (void)__harnessRun {');
    expect(candidate.source.indexOf('@interface RtmListenerEx')).toBeLessThan(
      candidate.source.indexOf('__harnessRun'),
    );
    expect(candidate.notes.join(' ')).toContain('mixes declarations');
  });

  it('declines a block with no trailing statements', () => {
    const code = '@interface Foo : NSObject\n@end';
    expect(splitDeclarationsAndStatements(code, ...args)).toEqual([]);
  });

  it('declines a block with no declarations at all', () => {
    expect(splitDeclarationsAndStatements('[rtm login];', ...args)).toEqual([]);
  });
});

describe('bestAttempt with stubless shapes', () => {
  // A shape that carries no running-example stubs will always fail to find
  // them. Counting that as the clearest diagnosis let a single
  // "cannot find 'rtm' in scope" outrank the shape showing the real defect.
  it('ranks a stubless shape last when it only misses a stub symbol', () => {
    const attempts = [
      {
        shape: 'file-level',
        ok: false,
        stubless: true,
        diagnostics: "a.swift:1: error: cannot find 'rtm' in scope",
      },
      {
        shape: 'type-body',
        ok: false,
        stubless: false,
        diagnostics: [
          "b.swift:3: error: type 'X' has no member 'storage'",
          'b.swift:4: error: unterminated string literal',
        ].join('\n'),
      },
    ];

    expect(bestAttempt(attempts, ['rtm']).shape).toBe('type-body');
  });

  // The shape that showed the real defect must win even when the stubless
  // shape has other, unrelated errors alongside its stub miss.
  it('demotes a stubless shape on a single stub miss among other errors', () => {
    const attempts = [
      {
        shape: 'file-level',
        ok: false,
        stubless: true,
        diagnostics: [
          "a.swift:1: error: cannot find 'streamChannel' in scope",
          "a.swift:1: error: cannot find 'user' in scope",
          "a.swift:1: error: 'nil' requires a contextual type",
        ].join('\n'),
      },
      {
        shape: 'method-body',
        ok: false,
        stubless: false,
        diagnostics: [
          "b.swift:1: error: cannot find 'user' in scope",
          "b.swift:1: error: value of type 'X' has no member 'publish'",
          "b.swift:1: error: 'nil' requires a contextual type",
        ].join('\n'),
      },
    ];

    expect(bestAttempt(attempts, ['streamChannel']).shape).toBe('method-body');
  });

  it('still trusts a stubless shape for a symbol the harness never supplies', () => {
    const attempts = [
      {
        shape: 'file-level',
        ok: false,
        stubless: true,
        diagnostics: "a.swift:1: error: cannot find 'RtmClient' in scope",
      },
      {
        shape: 'type-body',
        ok: false,
        stubless: false,
        diagnostics: [
          "b.swift:1: error: cannot find 'RtmClient' in scope",
          'b.swift:2: error: cascading noise',
        ].join('\n'),
      },
    ];

    expect(bestAttempt(attempts, ['rtm']).shape).toBe('file-level');
  });
});

describe('resolveContext with several match paths', () => {
  const base = {
    swift: { members: [{ name: 'rtm', code: 'var rtm: X? = nil' }] },
    objc: {},
    overrides: [
      {
        match: ['realtime-media/rtm/', 'api-ref/signaling/'],
        swift: { members: [{ name: 'rtm', code: 'var rtm: X! = nil' }] },
      },
    ],
  };

  // The guide pages and the api-ref pages share a running example but live
  // under different trees, so one override has to reach both.
  it('applies to every listed path', () => {
    for (const file of [
      'content/docs/en/realtime-media/rtm/quickstart.mdx',
      'content/docs/en/api-reference/api-ref/signaling/ios.mdx',
    ]) {
      const ctx = resolveContext(base, file);
      expect(ctx.swift.members[0].code).toContain('!');
    }
  });

  it('leaves an unrelated path alone', () => {
    const ctx = resolveContext(base, 'content/docs/en/video-calling/index.mdx');
    expect(ctx.swift.members[0].code).toContain('?');
  });
});
