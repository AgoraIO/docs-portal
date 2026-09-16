#!/usr/bin/env node
/**
 * Compile-check extracted Swift and Objective-C documentation samples against a
 * real AgoraRtmKit xcframework. macOS only: it shells out to `xcrun swiftc` and
 * `xcrun clang`.
 *
 * Each block is tried in several candidate "shapes" (file level, type body,
 * method body). The first shape that type-checks wins, which is what lets a
 * bare statement fragment and a full sample be judged by the same run.
 *
 * Usage:
 *   node scripts/signaling-code-check/check-apple.mjs \
 *     --blocks blocks.json \
 *     --frameworks .sdk \
 *     --platform ios \
 *     --out report.json --summary summary.md
 *
 * Add --dry-run to write the generated candidate files without compiling. That
 * works on any OS and is the way to inspect what the harness actually feeds the
 * compiler.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const PLATFORMS = {
  ios: {
    sdk: 'iphonesimulator',
    triple: 'arm64-apple-ios14.0-simulator',
    slice: /^ios-.*-simulator$/,
  },
  macos: { sdk: 'macosx', triple: 'arm64-apple-macos11.0', slice: /^macos-/ },
};

function parseArgs(argv) {
  const opts = {
    blocks: null,
    frameworks: null,
    platform: 'ios',
    out: null,
    summary: null,
    work: null,
    dryRun: false,
    keep: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--blocks') opts.blocks = argv[++i];
    else if (arg === '--frameworks') opts.frameworks = argv[++i];
    else if (arg === '--platform') opts.platform = argv[++i];
    else if (arg === '--out') opts.out = argv[++i];
    else if (arg === '--summary') opts.summary = argv[++i];
    else if (arg === '--work') opts.work = argv[++i];
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--keep') opts.keep = true;
    else throw new Error(`Unknown flag: ${arg}`);
  }
  if (!opts.blocks) throw new Error('--blocks is required');
  if (!PLATFORMS[opts.platform])
    throw new Error(
      `--platform must be one of: ${Object.keys(PLATFORMS).join(', ')}`,
    );
  if (!opts.dryRun && !opts.frameworks)
    throw new Error('--frameworks is required unless --dry-run');
  return opts;
}

/** Every `*.xcframework` under `root`, however deeply the archive nested it. */
function findXcframeworks(root, depth = 4) {
  const found = [];
  if (depth < 0) return found;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(root, entry.name);
    if (entry.name.endsWith('.xcframework')) found.push(path);
    else found.push(...findXcframeworks(path, depth - 1));
  }
  return found;
}

/** Find the slice directory inside each `*.xcframework` that matches the platform. */
function frameworkSearchPaths(root, platform) {
  const { slice } = PLATFORMS[platform];
  const paths = [];
  const missing = [];
  for (const xcframework of findXcframeworks(root)) {
    const match = readdirSync(xcframework, { withFileTypes: true }).find(
      (child) => child.isDirectory() && slice.test(child.name),
    );
    if (match) paths.push(join(xcframework, match.name));
    else missing.push(xcframework);
  }
  if (!paths.length) {
    throw new Error(
      `No ${platform} slice found under ${root}. ` +
        `Found xcframeworks: ${missing.join(', ') || '(none)'}. ` +
        'Check that the SDK archives were downloaded and unzipped.',
    );
  }
  return paths;
}

// --- source generation -------------------------------------------------------

const PLACEHOLDER = /<#([^#]*)#>/g;

// `if let rtmKit = rtmKit` and `guard let rtmKit = rtmKit else` bind a local
// that shadows the member; they do not declare it. Treating them as a
// declaration suppresses the stub the block actually needs, and the block then
// fails with a misleading "cannot find 'rtmKit' in scope".
const SWIFT_BINDING_CONTEXT = /\b(?:if|guard|while|for|case|catch)\b[^;{}]*$/;

export function declaresSwift(code, name) {
  const pattern = new RegExp(
    `\\b(?:var|let|func|struct|class|enum)\\s+${name}\\b`,
    'g',
  );
  for (const match of code.matchAll(pattern)) {
    const lineStart = code.lastIndexOf('\n', match.index) + 1;
    const before = code.slice(lineStart, match.index);
    if (!SWIFT_BINDING_CONTEXT.test(before)) return true;
  }
  return false;
}

function declaresObjcProperty(code, name) {
  return new RegExp(`@property[^;\\n]*\\b${name}\\s*;`).test(code);
}

function declaresObjcMethod(code, name) {
  return new RegExp(`[-+]\\s*\\([^)]*\\)\\s*${name}\\b`).test(code);
}

function swiftCandidates(block, ctx, platform) {
  const notes = [];
  let code = block.code;
  if (PLACEHOLDER.test(code)) {
    PLACEHOLDER.lastIndex = 0;
    code = code.replace(
      PLACEHOLDER,
      (_m, hint) => `__harnessPlaceholder("${hint.trim()}")`,
    );
    notes.push(
      'Xcode `<#placeholder#>` tokens replaced with a generic stub value',
    );
  }

  const imports = (
    platform === 'macos' ? ctx.swift.macosImports : ctx.swift.imports
  )
    .map((name) => `import ${name}`)
    .join('\n');
  const placeholderFn =
    'func __harnessPlaceholder<T>(_ hint: String = "") -> T { fatalError(hint) }';
  const fileLevel = ctx.swift.fileLevel.filter((line) => {
    const name = /\b(?:struct|class|enum)\s+(\w+)/.exec(line)?.[1];
    return !name || !declaresSwift(code, name);
  });
  const members = ctx.swift.members
    .filter((m) => !declaresSwift(code, m.name))
    .map((m) => `    ${m.code}`);

  const preamble = [imports, '', placeholderFn, ...fileLevel, ''].join('\n');
  const open =
    'final class HarnessModel: NSObject, ObservableObject, AgoraRtmClientDelegate {';

  return [
    // Self-contained samples bring their own imports; a prelude in front of
    // them is a syntax error in Swift only if it duplicates a declaration, but
    // trying the block untouched first keeps the reported result honest.
    { shape: 'as-written', source: `${code}\n`, notes },
    { shape: 'file-level', source: `${preamble}${code}\n`, notes },
    {
      shape: 'type-body',
      source: `${preamble}${open}\n${members.join('\n')}\n\n${indent(code, 4)}\n}\n`,
      notes,
    },
    {
      shape: 'method-body',
      source: `${preamble}${open}\n${members.join('\n')}\n\n    func __harnessRun() async throws {\n${indent(code, 8)}\n    }\n}\n`,
      notes,
    },
  ];
}

function objcCandidates(block, ctx, platform) {
  const notes = [];
  let code = block.code;
  if (PLACEHOLDER.test(code)) {
    PLACEHOLDER.lastIndex = 0;
    code = code.replace(PLACEHOLDER, () => 'nil');
    notes.push('Xcode `<#placeholder#>` tokens replaced with `nil`');
  }

  const imports = (
    platform === 'macos' ? ctx.objc.macosImports : ctx.objc.imports
  )
    .map((name) => `#import ${name}`)
    .join('\n');
  const base = ctx.objc.baseClass;
  const properties = ctx.objc.properties
    .filter((p) => !declaresObjcProperty(code, p.name))
    .map((p) => p.code);
  const methods = ctx.objc.methods
    .filter((m) => !declaresObjcMethod(code, m.name))
    .map((m) => m.code);

  const preamble = [imports, `#import "${base}.h"`, ''].join('\n');
  const extension = [
    `@interface ${base} () <AgoraRtmClientDelegate>`,
    ...properties,
    ...methods,
    '@end',
    '',
  ].join('\n');

  return [
    { shape: 'as-written', source: `${code}\n`, notes },
    // The docs' "declare the variables you need" fragment is a class extension
    // with no closing @end; it is a real excerpt, not a broken sample.
    {
      shape: 'as-written+@end',
      source: `${code}\n@end\n`,
      notes: [...notes, '`@end` appended to close the excerpt'],
    },
    { shape: 'file-level', source: `${preamble}${code}\n`, notes },
    {
      shape: 'implementation-body',
      source: `${preamble}${extension}@implementation ${base}\n${code}\n@end\n`,
      notes,
    },
    {
      shape: 'method-body',
      source: `${preamble}${extension}@implementation ${base}\n- (void)__harnessRun {\n${indent(code, 4)}\n}\n@end\n`,
      notes,
    },
  ];
}

function indent(code, spaces) {
  const pad = ' '.repeat(spaces);
  return code
    .split('\n')
    .map((line) => (line.trim() ? pad + line : line))
    .join('\n');
}

/**
 * Objective-C blocks that declare a real class interface (not a class
 * extension) are the page's own header files. Write them to the include
 * directory so sibling blocks that `#import "ViewController.h"` resolve against
 * the documented header rather than one this harness invented.
 */
function collectDocumentedHeaders(blocks) {
  const headers = new Map();
  for (const block of blocks) {
    if (block.lang !== 'objc') continue;
    if (/@implementation\b/.test(block.code)) continue;
    const match = /@interface\s+(\w+)\s*:\s*\w+/.exec(block.code);
    if (match) headers.set(match[1], { block: block.id, source: block.code });
  }
  return headers;
}

// --- compilation -------------------------------------------------------------

function sdkRoot(sdk) {
  return execFileSync('xcrun', ['--sdk', sdk, '--show-sdk-path'], {
    encoding: 'utf8',
  }).trim();
}

function compile(lang, file, cfg) {
  const args =
    lang === 'swift'
      ? [
          '--sdk',
          cfg.sdk,
          'swiftc',
          '-typecheck',
          '-target',
          cfg.triple,
          '-sdk',
          cfg.sdkRoot,
          ...cfg.frameworks.flatMap((p) => ['-F', p]),
          file,
        ]
      : [
          '--sdk',
          cfg.sdk,
          'clang',
          '-fsyntax-only',
          '-fobjc-arc',
          '-x',
          'objective-c',
          '-target',
          cfg.triple,
          '-isysroot',
          cfg.sdkRoot,
          ...cfg.frameworks.flatMap((p) => ['-F', p]),
          '-I',
          cfg.includeDir,
          file,
        ];

  const result = spawnSync('xcrun', args, {
    encoding: 'utf8',
    timeout: 120000,
  });
  return {
    ok: result.status === 0,
    diagnostics: `${result.stderr ?? ''}${result.stdout ?? ''}`.trim(),
  };
}

/** Keep only the lines a human needs: errors, and the line they point at. */
function summarizeDiagnostics(text) {
  const lines = text.split('\n');
  const errors = lines.filter((line) => /(^|:)\s*error:/.test(line));
  return (errors.length ? errors : lines).slice(0, 12).join('\n');
}

// Errors that only mean "this block was wrapped the wrong way". An attempt
// reporting nothing but these has told us nothing about the sample itself,
// however few errors it produced.
const STRUCTURAL_ERRORS = [
  'missing context for method declaration',
  'declaration is only valid at file scope',
  'expected external declaration',
];

function isStructuralOnly(diagnostics) {
  const errors = diagnostics
    .split('\n')
    .filter((line) => line.includes('error:'));
  return (
    errors.length > 0 &&
    errors.every((line) =>
      STRUCTURAL_ERRORS.some((marker) => line.includes(marker)),
    )
  );
}

/**
 * Pick the attempt whose diagnostics describe the block's real problem.
 *
 * The last shape tried is the most permissive one, so reporting it buries the
 * answer under wrapping noise: a method definition forced into a method body
 * reports "unexpected '@' in program" rather than the string literal that
 * actually broke it. The shape that got furthest generally produces the fewest
 * errors, but a shape that fails structurally can produce fewer still while
 * saying nothing, so those are ranked last regardless of count.
 */
export function bestAttempt(attempts) {
  const failures = attempts.filter((attempt) => !attempt.ok);
  if (!failures.length) return null;
  const rank = (attempt) => [
    isStructuralOnly(attempt.diagnostics) ? 1 : 0,
    errorCount(attempt.diagnostics),
  ];
  return failures.reduce((best, attempt) => {
    const [aStructural, aCount] = rank(attempt);
    const [bStructural, bCount] = rank(best);
    if (aStructural !== bStructural)
      return aStructural < bStructural ? attempt : best;
    return aCount < bCount ? attempt : best;
  });
}

function errorCount(diagnostics) {
  return diagnostics.split('\n').filter((line) => line.includes('error:'))
    .length;
}

function bestDiagnostics(attempts) {
  return bestAttempt(attempts)?.diagnostics ?? '';
}

/**
 * Prove the framework is reachable from both compilers before judging any doc
 * sample. Without this, a wrong `-F` path would fail every block and read as
 * twenty documentation bugs.
 */
function smokeTest(work, cfg) {
  const checks = [
    {
      lang: 'swift',
      file: join(work, '__smoke.swift'),
      source:
        'import AgoraRtmKit\nlet _: AgoraRtmClientKit.Type = AgoraRtmClientKit.self\n',
    },
    {
      lang: 'objc',
      file: join(work, '__smoke.m'),
      source:
        '#import <AgoraRtmKit/AgoraRtmKit.h>\nvoid __smoke(void) { (void)[AgoraRtmClientKit class]; }\n',
    },
  ];

  for (const check of checks) {
    writeFileSync(check.file, check.source);
    const { ok, diagnostics } = compile(check.lang, check.file, cfg);
    if (!ok) {
      throw new Error(
        `Harness smoke test failed for ${check.lang}: the SDK is not reachable, so no documentation ` +
          `result from this run would mean anything.\n\n${diagnostics}`,
      );
    }
  }
  console.log(
    'Smoke test passed: AgoraRtmKit imports from both Swift and Objective-C.\n',
  );
}

// --- main --------------------------------------------------------------------

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const ctx = JSON.parse(
    readFileSync(join(HERE, 'harness-context.json'), 'utf8'),
  );
  const { platform, blocks } = JSON.parse(
    readFileSync(resolve(opts.blocks), 'utf8'),
  );
  const target = opts.platform ?? platform;

  const work = resolve(
    opts.work ?? join(process.cwd(), '.signaling-code-check'),
  );
  const includeDir = join(work, 'include');
  rmSync(work, { recursive: true, force: true });
  mkdirSync(includeDir, { recursive: true });

  const headers = collectDocumentedHeaders(blocks);
  for (const [name, { source }] of headers) {
    writeFileSync(join(includeDir, `${name}.h`), `${source}\n`);
  }
  // Nothing in the page declared the class the fragments are wrapped into, so
  // give the compiler the bare minimum and let any missing member be reported.
  const base = ctx.objc.baseClass;
  if (!headers.has(base)) {
    const superclass =
      target === 'macos' ? 'NSViewController' : 'UIViewController';
    const uiImport =
      target === 'macos' ? '<AppKit/AppKit.h>' : '<UIKit/UIKit.h>';
    writeFileSync(
      join(includeDir, `${base}.h`),
      `#import ${uiImport}\n#import <AgoraRtmKit/AgoraRtmKit.h>\n@interface ${base} : ${superclass}\n@end\n`,
    );
  }

  const cfg = {
    ...PLATFORMS[target],
    frameworks: [],
    includeDir,
    sdkRoot: null,
  };
  if (!opts.dryRun) {
    cfg.frameworks = frameworkSearchPaths(resolve(opts.frameworks), target);
    cfg.sdkRoot = sdkRoot(cfg.sdk);
    console.log(`SDK:        ${cfg.sdkRoot}`);
    console.log(`Target:     ${cfg.triple}`);
    console.log(`Frameworks: ${cfg.frameworks.join('\n            ')}`);
    console.log('');
  }

  if (!opts.dryRun) smokeTest(work, cfg);

  const results = [];
  for (const block of blocks) {
    const candidates =
      block.lang === 'swift'
        ? swiftCandidates(block, ctx, target)
        : objcCandidates(block, ctx, target);
    const ext = block.lang === 'swift' ? 'swift' : 'm';
    const attempts = [];
    let passed = null;

    for (const candidate of candidates) {
      const file = join(
        work,
        `${block.id}.${candidate.shape.replace(/[^\w]+/g, '_')}.${ext}`,
      );
      writeFileSync(file, candidate.source);
      if (opts.dryRun) continue;
      const { ok, diagnostics } = compile(block.lang, file, cfg);
      attempts.push({
        shape: candidate.shape,
        ok,
        diagnostics: ok ? '' : summarizeDiagnostics(diagnostics),
      });
      if (ok) {
        passed = { shape: candidate.shape, notes: candidate.notes };
        break;
      }
    }

    results.push({
      id: block.id,
      lang: block.lang,
      file: block.file,
      lines: `${block.startLine}-${block.endLine}`,
      status: opts.dryRun ? 'skipped' : passed ? 'pass' : 'fail',
      shape: passed?.shape ?? null,
      notes: passed?.notes ?? [],
      diagnostics: passed ? '' : bestDiagnostics(attempts),
      shapeDiagnosed: passed ? null : (bestAttempt(attempts)?.shape ?? null),
      attempts,
    });

    if (!opts.dryRun) {
      const mark = passed ? 'PASS' : 'FAIL';
      console.log(
        `${mark}  ${block.id}  ${block.file}:${block.startLine}  ${passed?.shape ?? ''}`,
      );
    }
  }

  const pass = results.filter((r) => r.status === 'pass').length;
  const fail = results.filter((r) => r.status === 'fail').length;
  const report = {
    platform: target,
    total: results.length,
    pass,
    fail,
    results,
  };

  if (opts.out)
    writeFileSync(resolve(opts.out), `${JSON.stringify(report, null, 2)}\n`);
  if (opts.summary) writeFileSync(resolve(opts.summary), renderSummary(report));

  if (opts.dryRun) {
    console.log(
      `Wrote candidate sources for ${results.length} blocks to ${work}`,
    );
    return;
  }

  console.log(`\n${pass}/${results.length} blocks compile (${fail} failing)`);
  if (!opts.keep) rmSync(work, { recursive: true, force: true });
  // A failing block is a finding to triage, not a broken harness, so the run
  // itself only fails when nothing could be checked at all.
  process.exitCode = results.length === 0 ? 1 : 0;
}

function renderSummary(report) {
  const lines = [
    `# Signaling ${report.platform} code check`,
    '',
    `**${report.pass}/${report.total} blocks compile** against the real SDK (${report.fail} failing).`,
    '',
    '| Block | Lang | Source | Shape | Result |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const r of report.results) {
    const mark = r.status === 'pass' ? 'pass' : '**fail**';
    lines.push(
      `| \`${r.id}\` | ${r.lang} | ${r.file}:${r.lines} | ${r.shape ?? '-'} | ${mark} |`,
    );
  }

  const failures = report.results.filter((r) => r.status === 'fail');
  if (failures.length) {
    lines.push('', '## Failures', '');
    for (const r of failures) {
      lines.push(
        `### \`${r.id}\` — ${r.file}:${r.lines}`,
        '',
        `Diagnostics from the \`${r.shapeDiagnosed ?? 'unknown'}\` shape, the wrapping that got furthest.`,
        '',
        '```',
        r.diagnostics || '(no diagnostics)',
        '```',
        '',
      );
      // Every shape is kept within reach: picking the clearest one is a
      // heuristic, and triage sometimes needs the shape it passed over.
      const others = r.attempts.filter(
        (attempt) => !attempt.ok && attempt.shape !== r.shapeDiagnosed,
      );
      if (others.length) {
        lines.push('<details><summary>Other shapes tried</summary>', '');
        for (const attempt of others) {
          lines.push(
            `\`${attempt.shape}\`:`,
            '',
            '```',
            attempt.diagnostics || '(no diagnostics)',
            '```',
            '',
          );
        }
        lines.push('</details>', '');
      }
    }
  }

  const noted = report.results.filter((r) => r.notes.length);
  if (noted.length) {
    lines.push('## Blocks the harness had to adjust', '');
    for (const r of noted) lines.push(`- \`${r.id}\`: ${r.notes.join('; ')}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
