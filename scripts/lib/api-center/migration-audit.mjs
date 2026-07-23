import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import { analyzeMdxBuildSyntax } from '../../audit-mdx-build-syntax.mjs';

const LEGACY_ORIGIN_PATTERN =
  /(?:\]\(|\bhref\s*=\s*["'])https?:\/\/doc\.shengwang\.cn\b/i;
const FORBIDDEN_BODY_PATTERNS = [
  {
    code: 'legacy-body-link',
    pattern: LEGACY_ORIGIN_PATTERN,
    message: 'Generated MDX body still references doc.shengwang.cn.',
  },
  {
    code: 'iframe',
    pattern: /<iframe\b/i,
    message: 'Generated MDX body contains an iframe.',
  },
  {
    code: 'redirect',
    pattern: /(?:window\.location|location\.href|http-equiv=["']?refresh)/i,
    message: 'Generated MDX body contains redirect behavior.',
  },
  {
    code: 'placeholder',
    pattern:
      /(?:TODO(?:\s*:\s*|\s+)(?:migrate|migration|迁移)|待迁移|迁移中|内容即将上线|coming soon)/i,
    message: 'Generated MDX body contains a migration placeholder.',
  },
  {
    code: 'legacy-raw-html',
    pattern: /<(?:img|li|table|thead|tbody|tr|th|td)\b/i,
    message: 'Generated MDX body contains forbidden legacy raw HTML.',
  },
  {
    code: 'escaped-anchor-text',
    pattern: /&lt;a\s+(?:id|name)=.*?&gt;&lt;\/a&gt;/i,
    message: 'Generated MDX body renders a legacy HTML anchor as visible text.',
  },
];

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function splitFrontmatter(source) {
  const match = String(source).match(
    /^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/,
  );
  if (!match)
    return {
      data: null,
      body: String(source),
      error: 'Missing YAML frontmatter.',
    };
  try {
    return {
      data: yaml.load(match[1]) ?? {},
      body: String(source).slice(match[0].length),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      body: String(source).slice(match[0].length),
      error: `Invalid YAML frontmatter: ${error.message}`,
    };
  }
}

function lineForIndex(source, index) {
  return String(source).slice(0, Math.max(0, index)).split(/\r?\n/).length;
}

function issue({ code, message, targetPath, severity = 'error', line = null }) {
  return { code, severity, message, targetPath, ...(line ? { line } : {}) };
}

function auditFrontmatter({ data, targetPath, record }) {
  const issues = [];
  if (!data) return issues;
  if (!data.title || typeof data.title !== 'string') {
    issues.push(
      issue({
        code: 'frontmatter-title',
        message: 'Frontmatter title is missing.',
        targetPath,
      }),
    );
  }
  const migration = data._migration;
  if (!migration || typeof migration !== 'object') {
    issues.push(
      issue({
        code: 'frontmatter-migration',
        message: 'Frontmatter _migration metadata is missing.',
        targetPath,
      }),
    );
    return issues;
  }
  for (const [key, expected] of [
    ['type', record.type],
    ['sourceUrl', record.sourceUrl],
    ['sourcePath', record.sourcePath],
  ]) {
    if (migration[key] !== expected) {
      issues.push(
        issue({
          code: 'frontmatter-provenance',
          message: `_migration.${key} does not match the ownership ledger.`,
          targetPath,
        }),
      );
    }
  }
  if (!['migrated', 'warning', 'verified'].includes(migration.status)) {
    issues.push(
      issue({
        code: 'frontmatter-status',
        message: `_migration.status has unsupported value ${JSON.stringify(migration.status)}.`,
        targetPath,
      }),
    );
  }
  if (!Array.isArray(migration.warnings)) {
    issues.push(
      issue({
        code: 'frontmatter-warnings',
        message: '_migration.warnings must be an array.',
        targetPath,
      }),
    );
  }
  return issues;
}

function auditBody({ body, targetPath }) {
  const issues = [];
  const emptyFence = /^(\s*)(`{3,}|~{3,})[^\n]*\n\s*^\1\2\s*$/m.exec(body);
  if (emptyFence) {
    issues.push(
      issue({
        code: 'empty-code-fence',
        message: 'Generated MDX contains an empty fenced code block.',
        targetPath,
        line: lineForIndex(body, emptyFence.index),
      }),
    );
  }
  const bodyWithoutFences = body.replace(
    /^(\s*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2\s*$/gm,
    '',
  );
  const literalMarkdownLink = /`\[[^\]\n]+\]\([^\n]+\)`/.exec(
    bodyWithoutFences,
  );
  if (literalMarkdownLink) {
    issues.push(
      issue({
        code: 'literal-markdown-link',
        message: 'Generated MDX renders a Markdown link as inline code text.',
        targetPath,
        line: lineForIndex(bodyWithoutFences, literalMarkdownLink.index),
      }),
    );
  }
  const headingLink = /^#{1,6}\s+.*\[[^\]\n]+\]\([^\n]+\)/m.exec(
    bodyWithoutFences,
  );
  if (headingLink) {
    issues.push(
      issue({
        code: 'heading-link',
        message:
          'Generated MDX contains a link inside an auto-linked Fumadocs heading.',
        targetPath,
        line: lineForIndex(bodyWithoutFences, headingLink.index),
      }),
    );
  }
  const scannableBody = bodyWithoutFences.replace(/`[^`\n]*`/g, '');
  if (body.trim().length === 0) {
    issues.push(
      issue({
        code: 'empty-body',
        message: 'Generated MDX body is empty.',
        targetPath,
      }),
    );
    return issues;
  }
  for (const check of FORBIDDEN_BODY_PATTERNS) {
    const match = check.pattern.exec(scannableBody);
    if (!match) continue;
    issues.push(
      issue({
        code: check.code,
        message: check.message,
        targetPath,
        line: lineForIndex(scannableBody, match.index),
      }),
    );
  }
  for (const syntaxIssue of analyzeMdxBuildSyntax(targetPath, body)) {
    issues.push(
      issue({
        code: `mdx-${syntaxIssue.ruleId}`,
        message: syntaxIssue.message,
        targetPath,
        line: syntaxIssue.line,
      }),
    );
  }
  return issues;
}

function reportMarkdown(report) {
  const lines = [
    '# API Center Generated Output Audit',
    '',
    '> Generated by `scripts/audit-api-center-migration.mjs`. Do not edit by hand.',
    '',
    `- Owned files: ${report.counts.ownedFiles}`,
    `- Generated MDX pages: ${report.counts.mdxFiles}`,
    `- Generated navigation metas: ${report.counts.metaFiles}`,
    `- Generated navigation data files: ${report.counts.navigationDataFiles}`,
    `- Generated assets: ${report.counts.assetFiles}`,
    `- Errors: ${report.counts.errors}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Checks',
    '',
    '- All owned outputs exist and match their recorded SHA-256.',
    '- Generated docs are local `.mdx` files with `_migration` provenance.',
    '- MDX bodies are non-empty and contain no empty code fence, old-site link, iframe, redirect, placeholder, visible escaped anchor, or legacy raw HTML.',
    '- Generated assets are local and hash-verified.',
    '- Generated bodies pass the repository MDX migration syntax preflight.',
    '',
    '## Issue summary',
    '',
  ];
  const entries = Object.entries(report.issueSummary);
  lines.push(
    ...(entries.length
      ? entries.map(
          ([code, value]) => `- \`${code}\`: ${value.count} ${value.severity}`,
        )
      : ['- None.']),
    '',
    '## Issues',
    '',
  );
  if (report.issues.length === 0) {
    lines.push('- None.', '');
  } else {
    lines.push(
      '| Severity | Code | Target | Line | Message |',
      '| --- | --- | --- | --- | --- |',
    );
    for (const item of report.issues) {
      lines.push(
        `| ${item.severity} | ${item.code} | \`${item.targetPath}\` | ${item.line ?? ''} | ${item.message.replace(/\|/g, '\\|')} |`,
      );
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

export async function auditApiCenterMigration({
  repoRoot = process.cwd(),
  ownershipPath = 'docs/migration/api-center-generated-files.json',
} = {}) {
  const root = path.resolve(repoRoot);
  const ownership = JSON.parse(
    await fs.readFile(path.resolve(root, ownershipPath), 'utf8'),
  );
  const issues = [];
  let mdxFiles = 0;
  let assetFiles = 0;
  let metaFiles = 0;
  let navigationDataFiles = 0;

  for (const record of ownership.files ?? []) {
    const targetPath = record.targetPath;
    const absolute = path.resolve(root, targetPath);
    let contents;
    try {
      contents = await fs.readFile(absolute);
    } catch (error) {
      issues.push(
        issue({
          code: 'missing-owned-file',
          message: `Owned output is missing: ${error.code ?? error.message}.`,
          targetPath,
        }),
      );
      continue;
    }
    if (sha256(contents) !== record.contentHash) {
      issues.push(
        issue({
          code: 'owned-hash-mismatch',
          message: 'Owned output hash does not match the ownership ledger.',
          targetPath,
        }),
      );
    }
    if (record.type === 'asset') {
      assetFiles += 1;
      if (!targetPath.startsWith('public/img/api-center-generated/')) {
        issues.push(
          issue({
            code: 'asset-output-path',
            message: 'Generated asset is outside the API Center asset root.',
            targetPath,
          }),
        );
      }
      continue;
    }
    if (record.type === 'navigation-data') {
      navigationDataFiles += 1;
      try {
        const data = JSON.parse(contents.toString('utf8'));
        if (
          targetPath !== 'src/lib/api-reference-cards-data.zh-cn.json' ||
          !Array.isArray(data.all)
        ) {
          issues.push(
            issue({
              code: 'navigation-data-shape',
              message:
                'Generated API reference navigation data has an unexpected path or shape.',
              targetPath,
            }),
          );
        }
      } catch (error) {
        issues.push(
          issue({
            code: 'navigation-data-parse',
            message: `Invalid navigation data JSON: ${error.message}`,
            targetPath,
          }),
        );
      }
      continue;
    }
    if (targetPath.endsWith('/meta.json')) {
      metaFiles += 1;
      try {
        const meta = JSON.parse(contents.toString('utf8'));
        if (!Array.isArray(meta.pages) || meta.pages.length === 0) {
          issues.push(
            issue({
              code: 'meta-pages',
              message:
                'Generated navigation meta must contain a non-empty pages array.',
              targetPath,
            }),
          );
        }
      } catch (error) {
        issues.push(
          issue({
            code: 'meta-parse',
            message: `Invalid navigation meta JSON: ${error.message}`,
            targetPath,
          }),
        );
      }
      continue;
    }
    mdxFiles += 1;
    if (
      !targetPath.startsWith('content/docs/zh-CN/api-reference/') ||
      !targetPath.endsWith('.mdx')
    ) {
      issues.push(
        issue({
          code: 'mdx-output-path',
          message:
            'Generated document is not a local MDX file under zh-CN/api-reference.',
          targetPath,
        }),
      );
    }
    const source = contents.toString('utf8');
    const parsed = splitFrontmatter(source);
    if (parsed.error) {
      issues.push(
        issue({ code: 'frontmatter-parse', message: parsed.error, targetPath }),
      );
    }
    issues.push(...auditFrontmatter({ data: parsed.data, targetPath, record }));
    if (
      parsed.body.trim().length === 0 &&
      parsed.data?._migration?.warnings?.some(
        (warning) => warning.code === 'empty-source-body',
      )
    ) {
      // The source-side empty page is explicitly tracked in frontmatter.
    } else {
      issues.push(...auditBody({ body: parsed.body, targetPath }));
    }
  }

  issues.sort(
    (left, right) =>
      left.targetPath.localeCompare(right.targetPath) ||
      String(left.code).localeCompare(String(right.code)) ||
      (left.line ?? 0) - (right.line ?? 0),
  );
  const issueSummary = {};
  for (const item of issues) {
    const current = issueSummary[item.code] ?? {
      count: 0,
      severity: item.severity,
    };
    current.count += 1;
    issueSummary[item.code] = current;
  }
  const report = {
    schemaVersion: 1,
    inputHash: ownership.inputHash ?? null,
    counts: {
      ownedFiles: (ownership.files ?? []).length,
      mdxFiles,
      assetFiles,
      metaFiles,
      navigationDataFiles,
      errors: issues.filter((item) => item.severity === 'error').length,
      warnings: issues.filter((item) => item.severity === 'warning').length,
    },
    issueSummary,
    issues,
  };
  return { report, markdown: reportMarkdown(report) };
}
