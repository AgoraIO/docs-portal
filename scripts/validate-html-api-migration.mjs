#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = process.cwd();
const defaultOutputRoot = '/tmp/html-migration-matrix';
const defaultReportPath =
  'docs/agents/reports/2026-07-09-html-api-migration-validation-matrix.md';

const matrix = [
  {
    id: 'dita-rtc-android',
    lane: 'DITA/Oxygen',
    platform: 'android',
    product: 'rtc',
    sampleFiles: ['class-videocanvas.mdx', 'api-livetranscoding-adduser.mdx'],
    source: 'rtc/Android',
  },
  {
    id: 'typedoc-flex-web',
    lane: 'TypeDoc',
    platform: 'web',
    product: 'flexible-classroom',
    sampleFiles: [
      'classes/agora-rte-engine-config.mdx',
      'classes/agora-rte-engine.mdx',
    ],
    source: 'flexible-classroom/Web',
  },
  {
    contentChecks: [
      {
        file: 'globals.mdx',
        includes: [
          '### MemberState',
          '##### `arrowCompleteToSelector?: boolean`',
          '### PlayableCheckingParams',
          '##### `beginTimestamp?: number`',
        ],
        excludes: ['##### `Optional '],
      },
      {
        file: 'globals.mdx',
        orderedIncludes: [
          '##### `arrowCompleteToSelector?: boolean`',
          '是否在画完箭头后自动切到选择工具：',
          '- `true`：自动切换。',
          '- `false`：（默认）不自动切换。',
        ],
      },
      {
        file: 'globals.mdx',
        orderedIncludes: [
          '##### `region?: string`',
          '当前房间所在的数据中心，支持传入以下值：',
          '| `region` | 数据中心 | 服务区 |',
          '| `us-sv` | 美国硅谷 | 北美洲、南美洲 |',
          '##### `room: string`',
          '房间的 UUID，即房间的唯一标识符。成功创建房间后会返回该值。',
          '- 如果只传该属性，不传 `beginTimestamp` 和 `duration`，则表明回放该房间的所有录像片段。',
        ],
      },
      {
        file: 'globals.mdx',
        orderedIncludes: [
          '- **hotKeys?**: *Partial*',
          '  | 键盘按键 | 效果 |',
          '  | --- | --- |',
          '  | Backspace 或 Delete | 删除所选对象 |',
          '  | Ctrl + V 或 Command + V | 粘贴 |',
          '  如果你想关闭快捷键功能，可以将该属性的其值设为 `{}`。',
        ],
      },
    ],
    id: 'typedoc-whiteboard-web',
    lane: 'TypeDoc',
    platform: 'web',
    product: 'whiteboard',
    sampleFiles: ['globals.mdx'],
    source: 'whiteboard/Web',
  },
  {
    id: 'doxygen-recording-cpp',
    lane: 'Doxygen/Javadoc',
    platform: 'cpp',
    product: 'recording',
    sampleFiles: ['classagora-1-1recording-1-1-i-recording-engine.mdx'],
    source: 'recording/cpp',
  },
  {
    id: 'ios-whiteboard',
    lane: 'iOS doc-generator/appledoc',
    platform: 'ios',
    product: 'whiteboard',
    sampleFiles: [
      'classes/white-sdk.mdx',
      'protocols/white-common-callback-delegate.mdx',
    ],
    source: 'whiteboard/iOS',
  },
  {
    id: 'dartdoc-agora-chat-flutter',
    lane: 'Dartdoc',
    platform: 'flutter',
    product: 'agora-chat',
    sampleFiles: [
      'agora-chat-sdk/chat-client/index.mdx',
      'agora-chat-sdk/chat-client/add-connection-event-handler.mdx',
      'agora-chat-sdk/chat-type/index.mdx',
    ],
    source: 'agora-chat/Flutter',
  },
];

function parseArgs() {
  const opts = {
    compile: true,
    outputRoot: defaultOutputRoot,
    reportPath: defaultReportPath,
    routeBasePath: '/zh-CN/api-reference',
    sourceRoot: process.env.HTML_MIGRATION_SOURCE_ROOT,
  };

  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--source-root') opts.sourceRoot = args[++index];
    else if (arg === '--output-root') opts.outputRoot = args[++index];
    else if (arg === '--report') opts.reportPath = args[++index];
    else if (arg === '--route-base-path') opts.routeBasePath = args[++index];
    else if (arg === '--no-compile') opts.compile = false;
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!opts.sourceRoot) {
    throw new Error(
      'Missing legacy source root. Pass --source-root <dir> or set HTML_MIGRATION_SOURCE_ROOT.',
    );
  }

  return opts;
}

function printHelp() {
  console.log(`Validate generated HTML API migration lanes.

Usage:
  node scripts/validate-html-api-migration.mjs [options]

Options:
  --source-root <dir>       Legacy html-docs root
                             (or set HTML_MIGRATION_SOURCE_ROOT)
  --output-root <dir>       Temporary output root
  --report <file>           Markdown report path
  --route-base-path <path>  Route base used for generated links
  --no-compile              Skip temporary docs copy and types:check
`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  });
  return {
    command: [command, ...args].join(' '),
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
    status: result.status ?? 1,
  };
}

function migrationArgs(entry, sourceDir, outputDir, opts, dryRun) {
  return [
    'scripts/html-to-md-migration.mjs',
    '--source',
    sourceDir,
    '--output',
    outputDir,
    '--product',
    entry.product,
    '--platform',
    entry.platform,
    '--route-base-path',
    opts.routeBasePath,
    ...(dryRun ? ['--dry-run'] : []),
  ];
}

function parseDryRun(output) {
  return {
    detected:
      output.match(/Detected source type:\s*(.+)/)?.[1]?.trim() ??
      output.match(/Detected:\s*(.+)/)?.[1]?.trim() ??
      '',
    fileCount: Number(output.match(/File count:\s*(\d+)/)?.[1] ?? 0),
    plannedOutputs: Number(
      output.match(/Planned output paths \((\d+)\)/)?.[1] ?? 0,
    ),
  };
}

async function countGeneratedFiles(outputDir) {
  const counts = { mdx: 0, meta: 0 };

  async function visit(dir) {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const filePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(filePath);
      } else if (entry.name.endsWith('.mdx')) {
        counts.mdx += 1;
      } else if (entry.name === 'meta.json') {
        counts.meta += 1;
      }
    }
  }

  await visit(outputDir);
  return counts;
}

async function readTextIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

export function hasInvalidMarkdownHeading(text) {
  let fence = null;

  for (const line of text.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (fence === null) {
        fence = { character: marker[0], length: marker.length };
        continue;
      }
      if (
        marker[0] === fence.character &&
        marker.length >= fence.length &&
        fenceMatch[2].trim() === ''
      ) {
        fence = null;
        continue;
      }
    }

    if (fence === null && /^\s*#{7,}\s/.test(line)) return true;
  }

  return false;
}

export function findDuplicateExplicitAnchorIds(text) {
  const counts = new Map();
  for (const match of text.matchAll(/<a id="([^"]+)"><\/a>/g)) {
    counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id)
    .sort();
}

async function scanGeneratedOutput(outputDir, sampleFiles, contentChecks = []) {
  const issues = {
    contentMismatches: [],
    duplicateAnchors: [],
    helperPollution: [],
    internalHtmlLinks: [],
    invalidHeadings: [],
    missingFiles: [],
  };

  for (const required of ['index.mdx', 'meta.json', ...sampleFiles]) {
    const text = await readTextIfExists(path.join(outputDir, required));
    if (text === null) issues.missingFiles.push(required);
  }

  for (const check of contentChecks) {
    const text = await readTextIfExists(path.join(outputDir, check.file));
    if (text === null) continue;
    for (const snippet of check.includes ?? []) {
      if (!text.includes(snippet)) {
        issues.contentMismatches.push(`${check.file}: missing ${snippet}`);
      }
    }
    for (const snippet of check.excludes ?? []) {
      if (text.includes(snippet)) {
        issues.contentMismatches.push(`${check.file}: contains ${snippet}`);
      }
    }
    let orderedOffset = 0;
    for (const snippet of check.orderedIncludes ?? []) {
      const index = text.indexOf(snippet, orderedOffset);
      if (index === -1) {
        issues.contentMismatches.push(
          `${check.file}: missing or out of order ${snippet}`,
        );
        continue;
      }
      orderedOffset = index + snippet.length;
    }
  }

  const helperPattern =
    /(__404error|flutter_main_page|library-index|functions(?:[_-].*)?\.html|globals(?:[_-].*)?\.html|[_-]source\.html|[-_]members\.html)/i;
  const markdownHtmlLinkPattern = /\[[^\]]+\]\(([^)]*\.html(?:#[^)]*)?)\)/g;

  async function visit(dir) {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const filePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(filePath);
        continue;
      }
      if (!entry.name.endsWith('.mdx') && entry.name !== 'meta.json') continue;

      const text = await fs.readFile(filePath, 'utf8');
      const relative = path.relative(outputDir, filePath);
      if (helperPattern.test(text)) issues.helperPollution.push(relative);
      if (hasInvalidMarkdownHeading(text))
        issues.invalidHeadings.push(relative);
      if (entry.name.endsWith('.mdx')) {
        for (const id of findDuplicateExplicitAnchorIds(text)) {
          issues.duplicateAnchors.push(`${relative}: ${id}`);
        }
      }

      for (const match of text.matchAll(markdownHtmlLinkPattern)) {
        const href = match[1];
        if (/^(?:https?:)?\/\//.test(href) || href.startsWith('/')) continue;
        issues.internalHtmlLinks.push(`${relative}: ${href}`);
      }
    }
  }

  await visit(outputDir);
  return issues;
}

async function copyOutputsForCompile(results, validationRoot) {
  await fs.rm(validationRoot, { force: true, recursive: true });
  await fs.mkdir(validationRoot, { recursive: true });
  for (const result of results) {
    await fs.cp(result.outputDir, path.join(validationRoot, result.id), {
      recursive: true,
    });
  }
}

function assertCommandPassed(result, label) {
  if (result.status !== 0) {
    throw new Error(
      `${label} failed with status ${result.status}\n${result.output}`,
    );
  }
}

function assertOutputAuditsPassed(issues, label) {
  const failures = Object.values(issues).flat();
  if (failures.length > 0) {
    throw new Error(`${label} output audit failed\n${failures.join('\n')}`);
  }
}

function assertRestSourceRejected(result) {
  const expectedGuidance = [
    'Unsupported source structure: RESTful/OpenAPI',
    'Use the OpenAPI/Fumadocs REST API lane for RESTful references',
  ];
  if (
    result.status === 0 ||
    expectedGuidance.some((snippet) => !result.output.includes(snippet))
  ) {
    throw new Error(
      `REST/OpenAPI scope guard failed with status ${result.status}\n${result.output}`,
    );
  }
}

function markdownList(items) {
  if (items.length === 0) return '- None';
  return items.map((item) => `- ${item}`).join('\n');
}

function renderReport({ compileResult, opts, restResult, results }) {
  const lines = [
    '# Generated HTML API Migration Validation Matrix',
    '',
    'Date: 2026-07-09',
    '',
    'This report validates the generated HTML API migration lanes against representative real legacy sources from `shengwang-doc-source`.',
    '',
    '## Matrix',
    '',
    '| Lane | Source | Detection | Input files | Planned outputs | Full output |',
    '| --- | --- | --- | ---: | ---: | ---: |',
  ];

  for (const result of results) {
    lines.push(
      `| ${result.lane} | \`${result.source}\` | \`${result.detected}\` | ${result.fileCount} | ${result.plannedOutputs} | ${result.counts.mdx} MDX + ${result.counts.meta} meta |`,
    );
  }

  lines.push(
    '',
    '## Commands',
    '',
    `Source root: \`${opts.sourceRoot}\``,
    '',
    'Each lane was run once with `--dry-run` and once as a full generation into the output root.',
    '',
    '```bash',
  );
  for (const result of results)
    lines.push(result.dryCommand, result.fullCommand);
  lines.push('```', '');

  lines.push('## Output Audits', '');
  for (const result of results) {
    lines.push(
      `### ${result.lane} (${result.source})`,
      '',
      `- Output: \`${result.outputDir}\``,
      `- Sample files checked: ${result.sampleFiles.map((file) => `\`${file}\``).join(', ')}`,
      `- Missing required files: ${result.issues.missingFiles.length}`,
      `- Content assertion mismatches: ${result.issues.contentMismatches.length}`,
      `- Duplicate explicit anchors: ${result.issues.duplicateAnchors.length}`,
      `- Internal relative .html links: ${result.issues.internalHtmlLinks.length}`,
      `- Helper-page pollution matches: ${result.issues.helperPollution.length}`,
      `- Invalid level-7+ headings: ${result.issues.invalidHeadings.length}`,
      '',
    );
    if (result.issues.missingFiles.length > 0) {
      lines.push(
        'Missing files:',
        markdownList(result.issues.missingFiles),
        '',
      );
    }
    if (result.issues.internalHtmlLinks.length > 0) {
      lines.push(
        'Internal .html links:',
        markdownList(result.issues.internalHtmlLinks.slice(0, 20)),
        '',
      );
    }
    if (result.issues.contentMismatches.length > 0) {
      lines.push(
        'Content assertion mismatches:',
        markdownList(result.issues.contentMismatches.slice(0, 20)),
        '',
      );
    }
    if (result.issues.helperPollution.length > 0) {
      lines.push(
        'Helper pollution matches:',
        markdownList(result.issues.helperPollution.slice(0, 20)),
        '',
      );
    }
  }

  lines.push(
    '## Fumadocs Compile Check',
    '',
    opts.compile
      ? `Temporary validation subtree: \`content/docs/zh-CN/api-reference/__html-migration-validation/\`\n\nResult: \`${compileResult.status === 0 ? 'passed' : `failed (${compileResult.status})`}\``
      : 'Skipped with `--no-compile`.',
    '',
    '## REST/OpenAPI Out Of Scope',
    '',
    `Command status: \`${restResult.status}\``,
    '',
    restResult.status === 0
      ? 'Unexpected: REST/OpenAPI source succeeded.'
      : 'Expected: REST/OpenAPI source exits nonzero with unsupported-source guidance.',
    '',
    '## Known Gaps',
    '',
    '- This matrix validates representative real sources, not every product/platform folder under `html-docs`.',
    '- REST/OpenAPI remains intentionally out of scope for this HTML migration CLI.',
    '- Generated content still needs human spot review before being committed as product documentation.',
    '',
  );

  return `${lines.join('\n')}\n`;
}

async function main() {
  const opts = parseArgs();
  await fs.rm(opts.outputRoot, { force: true, recursive: true });
  await fs.mkdir(opts.outputRoot, { recursive: true });

  const results = [];
  for (const entry of matrix) {
    const sourceDir = path.join(opts.sourceRoot, entry.source);
    const dryOutputDir = path.join(opts.outputRoot, `${entry.id}-dry`);
    const outputDir = path.join(opts.outputRoot, entry.id);
    const dry = run(
      'node',
      migrationArgs(entry, sourceDir, dryOutputDir, opts, true),
    );
    assertCommandPassed(dry, `${entry.id} dry-run`);

    const full = run(
      'node',
      migrationArgs(entry, sourceDir, outputDir, opts, false),
    );
    assertCommandPassed(full, `${entry.id} full generation`);

    const dryRun = parseDryRun(dry.output);
    const counts = await countGeneratedFiles(outputDir);
    const issues = await scanGeneratedOutput(
      outputDir,
      entry.sampleFiles,
      entry.contentChecks,
    );
    assertOutputAuditsPassed(issues, entry.id);

    results.push({
      ...entry,
      counts,
      detected: dryRun.detected,
      dryCommand: dry.command,
      fileCount: dryRun.fileCount,
      fullCommand: full.command,
      issues,
      outputDir,
      plannedOutputs: dryRun.plannedOutputs,
    });
  }

  const restResult = run('node', [
    'scripts/html-to-md-migration.mjs',
    '--source',
    path.join(opts.sourceRoot, 'whiteboard/RESTful'),
    '--output',
    path.join(opts.outputRoot, 'rest-whiteboard'),
    '--product',
    'whiteboard',
    '--platform',
    'restful',
    '--route-base-path',
    opts.routeBasePath,
  ]);
  assertRestSourceRejected(restResult);

  let compileResult = { output: '', status: 0 };
  const validationRoot = path.join(
    repoRoot,
    'content/docs/zh-CN/api-reference/__html-migration-validation',
  );
  if (opts.compile) {
    try {
      await copyOutputsForCompile(results, validationRoot);
      compileResult = run('bun', ['run', 'types:check']);
      assertCommandPassed(compileResult, 'types:check');
    } finally {
      await fs.rm(validationRoot, { force: true, recursive: true });
    }
  }

  const report = renderReport({ compileResult, opts, restResult, results });
  const reportPath = path.resolve(repoRoot, opts.reportPath);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report, 'utf8');
  console.log(`Validation report written to ${opts.reportPath}`);
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
