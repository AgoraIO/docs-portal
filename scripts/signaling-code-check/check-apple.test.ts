import { describe, expect, it } from 'vitest';
import { bestAttempt, declaresSwift } from './check-apple.mjs';

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
