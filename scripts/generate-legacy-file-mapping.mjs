import { existsSync } from 'node:fs';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const legacyRoot = '/Users/yejiayi/Documents/shengwang-doc-source';
const mappingDocPath = path.join(
  repoRoot,
  'docs/superpowers/reports/2026-07-03-legacy-to-new-docs-mapping.md',
);
const fileMapPath = path.join(
  repoRoot,
  'docs/superpowers/reports/2026-07-03-legacy-file-map.csv',
);
const redirectPath = path.join(
  repoRoot,
  'docs/superpowers/reports/2026-07-03-legacy-file-redirects.csv',
);

const generatedAt = '2026-07-03';
const knownPlatforms = new Set([
  'agent-go',
  'agent-python',
  'agent-typescript',
  'android',
  'cpp',
  'csharp',
  'electron',
  'flutter',
  'go',
  'harmonyos',
  'ios',
  'java',
  'javascript',
  'macos',
  'python',
  'react',
  'restful',
  'rn',
  'swift',
  'typescript',
  'unity',
  'unreal-blueprint',
  'unreal-cpp',
  'web',
  'windows',
]);

const redirectColumns = [
  'old_source_path',
  'old_url',
  'source_type',
  'old_product',
  'old_platform',
  'new_source_path',
  'new_url',
  'redirect_status',
  'http_status',
  'notes',
];

const fileMapColumns = [
  'source_path',
  'source_type',
  'old_product',
  'old_platform',
  'target_path',
  'target_route',
  'mapping_status',
  'migration_action',
  'redirect_status',
  'http_status',
  'updated_at',
  'notes',
];

function splitMarkdownRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) =>
      cell
        .trim()
        .replace(/^`|`$/g, '')
        .replace(/<br\s*\/?>/g, ' '),
    );
}

function parseMappingTable(markdown, heading) {
  const start = markdown.indexOf(`## ${heading}`);
  if (start === -1) {
    throw new Error(`Cannot find heading: ${heading}`);
  }

  const lines = markdown.slice(start).split(/\r?\n/);
  const tableStart = lines.findIndex((line) => line.trim().startsWith('|'));
  if (tableStart === -1) {
    throw new Error(`Cannot find table under heading: ${heading}`);
  }

  const header = splitMarkdownRow(lines[tableStart]);
  const rows = [];
  for (let index = tableStart + 2; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim().startsWith('|')) {
      break;
    }

    const values = splitMarkdownRow(line);
    rows.push(
      Object.fromEntries(header.map((column, cellIndex) => [column, values[cellIndex] ?? ''])),
    );
  }

  return rows;
}

function normalizeTarget(value) {
  return value === '不迁移' ? '' : value;
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (!/[",\n\r]/.test(text)) {
    return text;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(columns, rows) {
  return `${columns.join(',')}\n${rows
    .map((row) => columns.map((column) => csvEscape(row[column])).join(','))
    .join('\n')}\n`;
}

async function listFiles(root, predicate) {
  if (!existsSync(root)) {
    return [];
  }

  const output = [];
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (entry.isFile() && predicate(fullPath)) {
        output.push(path.relative(legacyRoot, fullPath).split(path.sep).join('/'));
      }
    }
  }

  await walk(root);
  return output.sort();
}

function stripContentRoot(sourcePath) {
  return sourcePath.replace(/^content\/docs\/zh-CN\//, '');
}

function sourcePathToRoute(sourcePath) {
  if (!sourcePath) {
    return '';
  }

  const relative = stripContentRoot(sourcePath).replace(/\.(mdx|md)$/, '');
  const withoutIndex = relative.replace(/\/index$/, '');
  return `/zh-CN/${withoutIndex}`;
}

function parseFileName(fileName) {
  const ext = path.extname(fileName);
  const stem = fileName.slice(0, -ext.length);
  const parts = stem.split('.');
  const platforms = [];

  while (parts.length > 1 && knownPlatforms.has(parts.at(-1))) {
    platforms.unshift(parts.pop());
  }

  return {
    baseName: parts.join('.'),
    ext,
    platforms,
  };
}

function sourceUrl({ sourcePath, sourceType, platform }) {
  const [root, product, ...rest] = sourcePath.split('/');
  const { baseName } = parseFileName(rest.at(-1));
  const directory = rest.slice(0, -1);
  const routeParts = [
    sourceType === 'docs-api-reference' ? 'api-ref' : 'doc',
    product,
    ...(platform ? [platform] : []),
    ...directory,
    baseName === '_homepage_' ? 'homepage' : baseName,
  ];

  return `/${routeParts.filter(Boolean).join('/')}.html`;
}

function openApiTarget({ sourcePath, apiMaps }) {
  const [, product, ...rest] = sourcePath.split('/');
  const fileName = rest.at(-1);
  const ext = path.extname(fileName);
  const surface = path.basename(fileName, ext);
  const apiRoot = apiMaps.get(product)?.target;
  const canonicalProduct = apiRoot
    ? apiRoot.replace(/^api-reference\//, '').split('/')[0]
    : product;

  return `content/openapi/${canonicalProduct}/${surface}.zh-CN${ext}`;
}

function classifySpecialDocsFile(sourcePath) {
  const exact = new Map([
    ['docs/flexible-classroom/_resources.mdx', ['fallback-default/defer', '', '同级已有平台资源页，本轮不生成正式页面']],
    ['docs/iot-apaas/_resources.mdx', ['mapped', 'content/docs/zh-CN/solutions/iot-apaas/resources.mdx', '特殊资源页映射']],
    ['docs/meeting/_resources.mdx', ['mapped', 'content/docs/zh-CN/solutions/meeting/resources.mdx', '特殊资源页映射']],
    ['docs/rtm2/_resources.mdx', ['mapped', 'content/docs/zh-CN/realtime-media/rtm/resources.mdx', '特殊资源页映射']],
    ['docs/toybox/_resources.mdx', ['mapped', 'content/docs/zh-CN/ai/device-kit/resources.mdx', '特殊资源页映射']],
    ['docs/rtc/api/_reference.mdx', ['ignore-empty', '', '空文件，不迁移']],
    ['docs/rtc/basic-features/_token-authentication.mdx', ['fallback-default/defer', '', '同级已有多平台正式稿，本轮不生成正式页面']],
  ]);

  if (exact.has(sourcePath)) {
    const [status, target, notes] = exact.get(sourcePath);
    return { status, target, notes };
  }

  const fileName = sourcePath.split('/').at(-1);
  if (
    /(?:^|\/)_en(?:\/|-)/.test(sourcePath) ||
    /(?:^|[-_.])en(?:[-_.]|$)/.test(fileName) ||
    /_release-notes.*-en/.test(fileName)
  ) {
    return { status: 'defer-en', target: '', notes: '英文稿，当前 zh-CN 迁移不处理' };
  }

  if (sourcePath.includes('/_example/')) {
    return { status: 'ignore', target: '', notes: '示例片段不作为正式页面' };
  }

  if (sourcePath.includes('/integrate-extensions/legacy/')) {
    return { status: 'ignore', target: '', notes: '旧版扩展详情页不迁入 marketplace' };
  }

  if (fileName === '_homepage_.mdx') {
    return { status: 'ignore', target: '', notes: '旧站产品门户页/视觉首页，不覆盖新站首页' };
  }

  if (
    sourcePath
      .split('/')
      .slice(2)
      .some((segment) => segment.startsWith('_')) ||
    fileName.startsWith('_') ||
    fileName.startsWith('.')
  ) {
    return { status: 'ignore', target: '', notes: '隐藏页或片段页不生成正式页面' };
  }

  return null;
}

function docsTargets({ sourcePath, productMap }) {
  const [, product, ...rest] = sourcePath.split('/');
  const productEntry = productMap.get(product);
  const special = classifySpecialDocsFile(sourcePath);
  const parsed = parseFileName(rest.at(-1));
  const platforms = parsed.platforms.length > 0 ? parsed.platforms : [''];

  if (special) {
    return platforms.map((platform) => ({
      platform,
      status: special.status,
      target: special.target,
      notes: special.notes,
    }));
  }

  if (!productEntry || productEntry.status !== 'mapped') {
    const status = productEntry?.status ?? 'needs-decision';
    const notes = productEntry?.notes || '产品目录未在映射表中明确 mapped';
    return platforms.map((platform) => ({ platform, status, target: '', notes }));
  }

  return platforms.map((platform) => {
    const directory = rest.slice(0, -1);
    const targetFileName =
      parsed.baseName === 'landing-page'
        ? `index${platform ? `.${platform}` : ''}.md`
        : `${parsed.baseName}${platform ? `.${platform}` : ''}${parsed.ext}`;
    const target = [
      'content/docs/zh-CN',
      productEntry.target,
      ...directory,
      targetFileName,
    ]
      .filter(Boolean)
      .join('/');

    return {
      platform,
      status: 'mapped',
      target,
      notes:
        parsed.platforms.length > 1
          ? `多平台源文件拆分：${parsed.platforms.join(', ')}`
          : productEntry.notes,
    };
  });
}

function apiTargets({ sourcePath, apiMaps }) {
  const [, product, ...rest] = sourcePath.split('/');
  const productEntry = apiMaps.get(product);
  const parsed = parseFileName(rest.at(-1));
  const platforms = parsed.platforms.length > 0 ? parsed.platforms : [''];
  const fileName = rest.at(-1);

  if (
    /(?:^|\/)_en(?:\/|-)/.test(sourcePath) ||
    /(?:^|[-_.])en(?:[-_.]|$)/.test(fileName)
  ) {
    return platforms.map((platform) => ({
      platform,
      status: 'defer-en',
      target: '',
      notes: '英文 API reference 稿，当前 zh-CN 迁移不处理',
    }));
  }

  if (!productEntry || productEntry.status !== 'mapped') {
    const status = productEntry?.status ?? 'needs-decision';
    const notes = productEntry?.notes || 'API 产品目录未在映射表中明确 mapped';
    return platforms.map((platform) => ({ platform, status, target: '', notes }));
  }

  return platforms.map((platform) => {
    let directory = rest.slice(0, -1);
    let targetRoot = productEntry.target;
    let notes = productEntry.notes;

    if (
      product === 'convoai' &&
      [
        'go-api',
        'java-api',
        'web-component',
        'android-component',
        'ios-component',
        'agent-sdk-api',
      ].includes(directory[0])
    ) {
      directory = directory.slice(1);
      targetRoot = 'api-reference/conversational-ai/client-toolkit';
      notes = 'ConvoAI 客户端工具链子目录归并到 client-toolkit';
    }

    const targetFileName = `${parsed.baseName}${platform ? `.${platform}` : ''}${parsed.ext}`;
    const target = [
      'content/docs/zh-CN',
      targetRoot,
      ...directory,
      targetFileName,
    ]
      .filter(Boolean)
      .join('/');

    return {
      platform,
      status: 'mapped',
      target,
      notes:
        parsed.platforms.length > 1
          ? `多平台源文件拆分：${parsed.platforms.join(', ')}`
          : notes,
    };
  });
}

function statusToRedirect(status) {
  if (status === 'mapped') {
    return 'redirect';
  }
  if (status === 'ignore' || status === 'ignore-empty') {
    return 'ignore';
  }
  return 'defer';
}

function statusToAction(status, sourceType) {
  if (status === 'mapped') {
    return sourceType === 'openapi' ? 'openapi-lane' : 'rewrite';
  }
  if (status === 'ignore' || status === 'ignore-empty') {
    return 'drop';
  }
  if (sourceType === 'shared') {
    return 'shared-include';
  }
  if (sourceType === 'html-api') {
    return 'convert-html-api';
  }
  return 'defer';
}

function createRows({ sourcePath, sourceType, product, platform, target, status, notes }) {
  const redirectStatus = statusToRedirect(status);
  const targetRoute = sourcePathToRoute(target);
  const oldUrl =
    sourceType === 'docs' || sourceType === 'docs-api-reference'
      ? sourceUrl({ sourcePath, sourceType, platform })
      : '';
  const httpStatus = redirectStatus === 'redirect' ? '301' : '';

  return {
    fileMap: {
      source_path: sourcePath,
      source_type: sourceType,
      old_product: product,
      old_platform: platform,
      target_path: target,
      target_route: targetRoute,
      mapping_status: status,
      migration_action: statusToAction(status, sourceType),
      redirect_status: redirectStatus,
      http_status: httpStatus,
      updated_at: generatedAt,
      notes,
    },
    redirect: {
      old_source_path: sourcePath,
      old_url: oldUrl,
      source_type: sourceType,
      old_product: product,
      old_platform: platform,
      new_source_path: target,
      new_url: targetRoute,
      redirect_status: redirectStatus,
      http_status: httpStatus,
      notes,
    },
  };
}

async function main() {
  const mappingMarkdown = await readFile(mappingDocPath, 'utf8');
  const docsMaps = new Map(
    parseMappingTable(mappingMarkdown, '普通文档目录映射').map((row) => [
      row['旧站目录'],
      {
        target: normalizeTarget(row['新站目标根路径']),
        status: row['状态'],
        notes: row['备注'],
      },
    ]),
  );
  const apiMaps = new Map(
    parseMappingTable(mappingMarkdown, 'API Reference 目录映射').map((row) => [
      row['旧 API 目录'],
      {
        target: normalizeTarget(row['新站目标根路径']),
        status: row['状态'],
        notes: row['备注'],
      },
    ]),
  );

  const sourceMarkdownFiles = await listFiles(
    path.join(legacyRoot, 'docs'),
    (filePath) => /\.(mdx|md)$/.test(filePath),
  );
  const apiMarkdownFiles = await listFiles(
    path.join(legacyRoot, 'docs-api-reference'),
    (filePath) => /\.(mdx|md)$/.test(filePath),
  );
  const openApiFiles = await listFiles(
    path.join(legacyRoot, 'html-docs'),
    (filePath) => /\.(ya?ml)$/.test(filePath),
  );
  const htmlApiFiles = await listFiles(
    path.join(legacyRoot, 'html-docs'),
    (filePath) => /\.html$/.test(filePath),
  );

  const fileMapRows = [];
  const redirectRows = [];
  const push = (row) => {
    fileMapRows.push(row.fileMap);
    redirectRows.push(row.redirect);
  };

  for (const sourcePath of sourceMarkdownFiles) {
    const [, product] = sourcePath.split('/');
    const sourceType = product === 'shared' ? 'shared' : 'docs';
    if (sourceType === 'shared') {
      push(
        createRows({
          sourcePath,
          sourceType,
          product,
          platform: '',
          target: '',
          status: 'defer',
          notes: 'shared 片段展开到引用页面，不作为直接页面',
        }),
      );
      continue;
    }

    for (const target of docsTargets({ sourcePath, productMap: docsMaps })) {
      push(
        createRows({
          sourcePath,
          sourceType,
          product,
          platform: target.platform,
          target: target.target,
          status: target.status,
          notes: target.notes,
        }),
      );
    }
  }

  for (const sourcePath of apiMarkdownFiles) {
    const [, product] = sourcePath.split('/');
    const sourceType = product === 'shared' ? 'shared' : 'docs-api-reference';
    if (sourceType === 'shared') {
      push(
        createRows({
          sourcePath,
          sourceType,
          product,
          platform: '',
          target: '',
          status: 'defer',
          notes: 'API shared 片段展开到引用页面，不作为直接页面',
        }),
      );
      continue;
    }

    for (const target of apiTargets({ sourcePath, apiMaps })) {
      push(
        createRows({
          sourcePath,
          sourceType,
          product,
          platform: target.platform,
          target: target.target,
          status: target.status,
          notes: target.notes,
        }),
      );
    }
  }

  for (const sourcePath of openApiFiles) {
    const [, product] = sourcePath.split('/');
    push(
      createRows({
        sourcePath,
        sourceType: 'openapi',
        product,
        platform: '',
        target: openApiTarget({ sourcePath, apiMaps }),
        status: 'mapped',
        notes: 'OpenAPI 源文件进入 content/openapi；不直接生成页面 redirect',
      }),
    );
  }

  for (const sourcePath of htmlApiFiles) {
    const [, product, platform] = sourcePath.split('/');
    push(
      createRows({
        sourcePath,
        sourceType: 'html-api',
        product,
        platform: platform ?? '',
        target: '',
        status: 'defer',
        notes: 'SDK HTML API 当前 defer，后续保留 .html 文件类型再细化目标路径',
      }),
    );
  }

  fileMapRows.sort((a, b) => a.source_path.localeCompare(b.source_path));
  redirectRows.sort((a, b) => a.old_source_path.localeCompare(b.old_source_path));

  await writeFile(fileMapPath, toCsv(fileMapColumns, fileMapRows));
  await writeFile(redirectPath, toCsv(redirectColumns, redirectRows));

  const summary = {
    fileMapPath: path.relative(repoRoot, fileMapPath),
    redirectPath: path.relative(repoRoot, redirectPath),
    fileMapRows: fileMapRows.length,
    redirectRows: redirectRows.length,
    redirectableRows: redirectRows.filter((row) => row.redirect_status === 'redirect').length,
    ignoredRows: redirectRows.filter((row) => row.redirect_status === 'ignore').length,
    deferredRows: redirectRows.filter((row) => row.redirect_status === 'defer').length,
  };

  console.log(JSON.stringify(summary, null, 2));
}

const legacyStats = await stat(legacyRoot).catch(() => null);
if (!legacyStats?.isDirectory()) {
  throw new Error(`Legacy source root does not exist: ${legacyRoot}`);
}

await main();
