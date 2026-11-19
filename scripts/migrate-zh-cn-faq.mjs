#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import {
  findLegacyResidue,
  stripImportExport,
  transformLegacyMdx,
} from './migrate-legacy-docs.mjs';

const require = createRequire(import.meta.url);

const DEFAULT_SOURCE_ROOTS = [
  process.env.LEGACY_DOC_SOURCE_ROOT,
  '/Users/yangyixuan/Documents/GitHub/shengwang-doc-source',
  '/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source',
].filter(Boolean);

const FAQ_SOURCE_DIR = 'docs-faq';
const FAQ_TARGET_ROOT = 'content/docs/zh-CN/reference/faq';
const FAQ_EN_ROOT = 'content/docs/en/api-reference/faq';
const REPORT_DIR = 'docs/migration/generated/zh-cn-faq-migration';
const FAQ_DATA_TARGET = 'src/components/faq/faq-data.zh-cn.ts';
const ONLINE_INTEGRATION_URL =
  'https://doc.shengwang.cn/faq/list?category=integration-issues&platform=all&product=all';

const CATEGORY_TO_FOLDER = {
  'account-and-billing': 'account',
  'general-product-inquiry': 'product',
  'integration-issues': 'integration',
  'other-issues': 'other',
  'quality-issues': 'quality',
};

const FOLDER_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_TO_FOLDER).map(([category, folder]) => [
    folder,
    category,
  ]),
);

const CATEGORY_TITLES = {
  account: '账号与计费',
  integration: '集成类',
  other: '其他问题',
  product: '产品咨询类',
  quality: '质量类',
};

const CATEGORY_DESCRIPTIONS = {
  'account-and-billing': '账单、用量、发票、套餐和账号管理相关问题。',
  'general-product-inquiry': '产品能力、限制、适用场景和服务行为相关问题。',
  'integration-issues': '构建、打包、权限、SDK 设置和接入流程相关问题。',
  'other-issues': '无法归入其他分类的运维或使用问题。',
  'quality-issues': '音频、视频、渲染和媒体体验相关问题。',
};

const FALLBACK_METADATA = {
  'billing-package': {
    categories: ['account-and-billing'],
    note: 'missing-category-frontmatter; mapped to account-and-billing',
  },
  chatroom: {
    categories: ['other-issues'],
    platforms: ['all'],
    products: ['chatroom'],
    title: '声动语聊常见问题合集',
    note: 'missing-frontmatter; mapped to other-issues',
  },
};

const SOURCE_TO_ENGLISH_PATH = {
  'adjust-music-volume': 'quality/adjust_music_volume.mdx',
  'android-background': 'quality/android_background.mdx',
  'android-noaudio': 'other/android_noaudio.mdx',
  'app-exit': 'integration/abnormal_exit.mdx',
  'arch-error': 'integration/ios_app_unity_reports_error.mdx',
  'audience-event': 'integration/audience_event.mdx',
  'audio-format': 'product/audio_format.mdx',
  'audio-freeze': 'quality/audio_freeze.mdx',
  'audio-low': 'quality/audio_low.mdx',
  'audio-noise': 'quality/audio_noise.mdx',
  'audio-role': 'quality/audio_role.mdx',
  audio_change: 'integration/android_audio_routing_change.mdx',
  'billing-account': 'account/billing_account.mdx',
  'billing-basis': 'account/billing_basis.mdx',
  'billing-free': 'account/billing_free.mdx',
  'bucket-region': 'integration/bucket_region.mdx',
  'business-billing': 'integration/call_duration.mdx',
  'call-browser': 'product/call_api_in_browser.mdx',
  'camera-exposure-focus': 'integration/camera_exposure_focus.mdx',
  capacity: 'product/capacity.mdx',
  'channel-issues': 'integration/channel.mdx',
  'class-audio-video': 'quality/audio_video_issues_in_classroom.mdx',
  'class-courseware': 'integration/cant_upload_courseware.mdx',
  'class-dynamic': 'integration/dynamic_storage_path.mdx',
  'class-errors': 'integration/common_mistakes_flexible_classroom.mdx',
  'class-im': 'integration/chat_issues.mdx',
  'class-language': 'integration/multi_language_support.mdx',
  'class-packaging': 'integration/class_packaging.mdx',
  'class-properties': 'integration/agora_class_custom_properties.mdx',
  'class-record': 'integration/class_recording_fails.mdx',
  'class-restapi': 'integration/obtain_restful_api_id.mdx',
  'class-states': 'integration/classroom_statuses.mdx',
  'class-stop': 'integration/stop_class.mdx',
  'class-threea': 'integration/turn_off_3a_config.mdx',
  'cmd-control-record': 'integration/cmd_control_record.mdx',
  'console-account-faq': 'account/console_account_faq.mdx',
  'console-error': 'integration/console_error_web.mdx',
  'device-occupied': 'quality/device_occupied.mdx',
  'diff-setenabled-setmuted': 'integration/set_enabled_set_muted.mdx',
  'differ-agora-cdn': 'product/differ_agora_cdn.mdx',
  'dynamic-or-static-library': 'integration/dynamic_or_static_library.mdx',
  'electron-faq': 'integration/electron_faq.mdx',
  'fail-to-upload': 'integration/fail_to_upload.mdx',
  'flutter-debug': 'quality/flutter_debug.mdx',
  'flutter-pod': 'integration/flutter_pod.mdx',
  'framework-cannot-be-opened': 'integration/framework_cannot_be_opened.mdx',
  'generate-token': 'integration/rtc_rtm_token.mdx',
  'get-channel-info': 'integration/get_channel_info.mdx',
  'get-m3u8-file': 'integration/acquire_file_directory.mdx',
  'ios-background': 'quality/ios_background.mdx',
  'ios-bluetooth': 'quality/ios_bluetooth.mdx',
  'ios-sign': 'integration/ios_sign.mdx',
  'judge-voice-video-call': 'integration/judge_voice_video_call.mdx',
  'kick-user': 'integration/kick_user.mdx',
  'macos15-beta-issue': 'other/macos_15_beta.mdx',
  'mirror-mode': 'integration/mirror_mode.mdx',
  'mobile-video-profile': 'integration/mobile_video_profile.mdx',
  multitasking: 'integration/multitasking.mdx',
  'music-pause': 'integration/music_pause.mdx',
  'ncs-query': 'integration/ncs_vs_query.mdx',
  'no-audio': 'quality/audio_noaudio.mdx',
  'playout-permission': 'integration/android_startaudiomixing_permission.mdx',
  privacyinfo: 'other/ios_privacy_manifest.mdx',
  'record-file-issues': 'quality/record_file_issue.mdx',
  'record-status-error': 'quality/record_status_error.mdx',
  'recording-concurrence': 'product/recording_concurrence.mdx',
  'recording-mode': 'integration/recording_mode.mdx',
  'recording-player': 'integration/recording_player.mdx',
  'recording-split': 'quality/record_split.mdx',
  'restful-api-call-frequency': 'integration/restful_api_call_frequency.mdx',
  'return-404': 'integration/return_404.mdx',
  'rtm2-rtc-integration-issue': 'integration/rtm2_rtc_integration_issue.mdx',
  sei: 'quality/sei.mdx',
  'set-log-file': 'integration/set_log_file.mdx',
  'streaming-difference': 'product/streaming_difference.mdx',
  'string-uid': 'integration/string_uid.mdx',
  'system-volume': 'integration/system_volume.mdx',
  'token-cohost': 'integration/token_cohost.mdx',
  'token-error': 'integration/token_related_issues.mdx',
  'unreal-permissions': 'integration/unreal_permissions.mdx',
  'video-bighead': 'quality/video_bighead.mdx',
  'video-blank': 'quality/video_blank.mdx',
  'video-blur': 'quality/video_blur.mdx',
  'video-camera': 'quality/video_camera.mdx',
  'video-enhancement': 'integration/video_enhancement.mdx',
  'video-frame-rendering': 'quality/optimize_video_rendering.mdx',
  'video-freeze': 'quality/video_freeze.mdx',
};

async function main() {
  const repoRoot = process.cwd();
  const sourceRoot = await resolveSourceRoot();
  const sourceDir = path.join(sourceRoot, FAQ_SOURCE_DIR);
  const targetRoot = path.join(repoRoot, FAQ_TARGET_ROOT);
  const reportDir = path.join(repoRoot, REPORT_DIR);
  const categories = require(path.join(sourceDir, '_category_.meta.js'));
  const productMeta = require(
    path.join(sourceDir, '_products_platforms_.meta.js'),
  );
  const productLabels = createProductLabelMap(productMeta);
  const platformLabels = createPlatformLabelMap(productMeta);
  const englishPaths = await listEnglishFaqPaths(
    path.join(repoRoot, FAQ_EN_ROOT),
  );
  const onlineIntegration = await fetchOnlineIntegrationChecklist();

  await fs.rm(targetRoot, { force: true, recursive: true });
  await fs.mkdir(targetRoot, { recursive: true });
  await fs.mkdir(reportDir, { recursive: true });

  await writeNavigationFiles(targetRoot);

  const sourceFiles = (await fs.readdir(sourceDir))
    .filter((file) => file.endsWith('.mdx'))
    .sort();
  const rows = [];
  const items = [];
  const copiedAssets = new Set();

  for (const file of sourceFiles) {
    const sourceSlug = file.replace(/\.mdx$/, '');
    const absoluteSourcePath = path.join(sourceDir, file);
    const raw = await fs.readFile(absoluteSourcePath, 'utf8');
    const parsed = parseFrontmatter(raw);
    const fallback = FALLBACK_METADATA[sourceSlug] ?? {};
    const frontmatter = {
      ...fallback,
      ...parsed.frontmatter,
      categories: parsed.frontmatter.categories ?? fallback.categories ?? [],
      platforms: parsed.frontmatter.platforms ?? fallback.platforms ?? ['all'],
      products: parsed.frontmatter.products ?? fallback.products ?? ['all'],
      title:
        parsed.frontmatter.title ??
        fallback.title ??
        titleFromBody(parsed.body) ??
        sourceSlug,
    };
    const target = resolveTarget({
      englishPaths,
      frontmatter,
      sourceSlug,
    });
    const targetPath = path.join(targetRoot, target.relativePath);
    const state = createTransformState({
      sourcePath: `docs-faq/${file}`,
      sourceRoot,
    });
    const tableHeaders = parseExportedTableHeaders(parsed.body);
    for (const [name, header] of tableHeaders) {
      state.tableHeaders.set(name, header);
    }

    let body = stripImportExport(parsed.body);
    body = removeFaqLinkCards(body);
    body = transformLegacyMdx(body, state);
    body = normalizeFaqBody(body);
    const content = `${serializeFrontmatter({
      title: frontmatter.title,
    })}${body.trim()}\n`;
    const residue = findLegacyResidue(content);
    const localAssets = findLocalImageRefs(content);
    for (const asset of localAssets) {
      copiedAssets.add(asset);
      await copyLocalAsset({
        asset,
        repoRoot,
        sourceRoot,
      });
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, content, 'utf8');

    const item = {
      category: target.category,
      href: `/zh-CN/reference/faq/${target.folder}/${target.stem}`,
      platforms: normalizeLabels(frontmatter.platforms, platformLabels),
      products: normalizeLabels(frontmatter.products, productLabels),
      summary: firstSummary(body),
      title: frontmatter.title,
    };
    items.push(item);

    const issues = unique([
      ...state.issues,
      ...residue.map((issue) => `legacy-residue:${issue}`),
      ...(fallback.note ? [fallback.note] : []),
      ...(localAssets.length ? [`copied-assets:${localAssets.length}`] : []),
    ]);

    rows.push({
      categories: frontmatter.categories,
      englishPath: target.englishPath,
      issues,
      onlineIntegration: onlineIntegration.slugs.has(sourceSlug),
      sourcePath: `docs-faq/${file}`,
      sourceSlug,
      status: requiresManualReview(issues) ? 'needs_review' : 'migrated',
      targetPath: path.posix.join(FAQ_TARGET_ROOT, target.relativePath),
      title: frontmatter.title,
    });
  }

  items.sort((a, b) => a.href.localeCompare(b.href));
  await writeFaqDataFile({
    categories,
    items,
    platformLabels,
    productLabels,
    targetPath: path.join(repoRoot, FAQ_DATA_TARGET),
  });
  await updateApiReferenceMeta(
    path.join(repoRoot, 'content/docs/zh-CN/api-reference/meta.json'),
  );

  const report = createReport({
    copiedAssets: [...copiedAssets].sort(),
    onlineIntegration,
    rows,
    sourceRoot,
  });
  await fs.writeFile(
    path.join(reportDir, 'mapping.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(reportDir, 'mapping.md'),
    reportToMarkdown(report),
    'utf8',
  );

  console.log(
    `Migrated ${rows.length} zh-CN FAQ files into ${FAQ_TARGET_ROOT}`,
  );
  console.log(`Report: ${path.join(REPORT_DIR, 'mapping.md')}`);
}

async function resolveSourceRoot() {
  for (const sourceRoot of DEFAULT_SOURCE_ROOTS) {
    try {
      await fs.access(path.join(sourceRoot, FAQ_SOURCE_DIR));
      return sourceRoot;
    } catch {
      // try next configured source root
    }
  }
  throw new Error('Unable to locate shengwang-doc-source/docs-faq');
}

function createProductLabelMap(productMeta) {
  const labels = new Map();
  for (const item of productMeta) {
    labels.set(item.value, item.label);
  }
  labels.set('meeting', '声网会议');
  labels.set('fastboard', 'Fastboard');
  return labels;
}

function createPlatformLabelMap(productMeta) {
  const labels = new Map();
  for (const product of productMeta) {
    for (const platform of product.platforms ?? []) {
      if (product.value === 'all' || !labels.has(platform.value)) {
        labels.set(platform.value, platform.label);
      }
    }
  }
  labels.set('javacript', 'JavaScript');
  labels.set('unreal', 'Unreal (C++)');
  labels.set('bp', 'Unreal (Blueprint)');
  return labels;
}

async function listEnglishFaqPaths(root) {
  const paths = new Set();
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.name.endsWith('.mdx') && entry.name !== 'index.mdx') {
        paths.add(toPosix(path.relative(root, entryPath)));
      }
    }
  }
  await walk(root);
  return paths;
}

async function fetchOnlineIntegrationChecklist() {
  try {
    const response = await fetch(ONLINE_INTEGRATION_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const html = await response.text();
    const entries = [];
    const pattern =
      /href="\/faq\/integration-issues\/([^"#?]+)"[\s\S]*?<div class="text-ellipsis[^"]*">([\s\S]*?)<\/div>/g;
    for (const match of html.matchAll(pattern)) {
      entries.push({
        slug: decodeHtml(match[1]),
        title: decodeHtml(stripTags(match[2])),
      });
    }
    const uniqueEntries = dedupeBy(entries, (entry) => entry.slug);
    return {
      entries: uniqueEntries,
      fetched: true,
      slugs: new Set(uniqueEntries.map((entry) => entry.slug)),
      url: ONLINE_INTEGRATION_URL,
    };
  } catch (error) {
    return {
      entries: [],
      error: error instanceof Error ? error.message : String(error),
      fetched: false,
      slugs: new Set(),
      url: ONLINE_INTEGRATION_URL,
    };
  }
}

async function writeNavigationFiles(targetRoot) {
  await fs.writeFile(
    path.join(targetRoot, 'meta.json'),
    `${JSON.stringify(
      {
        title: '常见问题',
        defaultOpen: false,
        pages: ['integration', 'quality', 'product', 'account', 'other'],
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(targetRoot, 'index.mdx'),
    [
      '---',
      'title: 常见问题',
      'hideToc: true',
      '---',
      '',
      '<FaqLanding locale="zh-CN" />',
      '',
    ].join('\n'),
    'utf8',
  );

  for (const folder of [
    'integration',
    'quality',
    'product',
    'account',
    'other',
  ]) {
    const dir = path.join(targetRoot, folder);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, 'meta.json'),
      `${JSON.stringify(
        {
          title: CATEGORY_TITLES[folder],
          pages: ['index'],
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'index.mdx'),
      [
        '---',
        `title: ${CATEGORY_TITLES[folder]}`,
        'hideToc: true',
        '---',
        '',
        `<FaqCategory category="${FOLDER_TO_CATEGORY[folder]}" locale="zh-CN" />`,
        '',
      ].join('\n'),
      'utf8',
    );
  }
}

function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n?/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\s*/);
  if (!match) {
    return {
      body: normalized,
      frontmatter: {},
    };
  }
  const frontmatter = {};
  const lines = match[1].split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const scalar = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!scalar) {
      continue;
    }
    const key = scalar[1];
    const value = scalar[2].trim();
    if (value) {
      frontmatter[key] = stripWrappingQuotes(value);
      continue;
    }
    const values = [];
    while (index + 1 < lines.length) {
      const next = lines[index + 1];
      const listItem = next.match(/^\s*-\s*(.+)$/);
      if (!listItem) {
        break;
      }
      values.push(stripWrappingQuotes(listItem[1].trim()));
      index += 1;
    }
    frontmatter[key] = values;
  }
  return {
    body: normalized.slice(match[0].length),
    frontmatter,
  };
}

function serializeFrontmatter(frontmatter) {
  return ['---', `title: ${JSON.stringify(frontmatter.title)}`, '---', ''].join(
    '\n',
  );
}

function resolveTarget({ englishPaths, frontmatter, sourceSlug }) {
  const mappedEnglishPath = SOURCE_TO_ENGLISH_PATH[sourceSlug];
  if (mappedEnglishPath && englishPaths.has(mappedEnglishPath)) {
    const folder = mappedEnglishPath.split('/')[0];
    return {
      category: FOLDER_TO_CATEGORY[folder],
      englishPath: path.posix.join(FAQ_EN_ROOT, mappedEnglishPath),
      folder,
      relativePath: mappedEnglishPath,
      stem: path.posix.basename(mappedEnglishPath, '.mdx'),
    };
  }

  const sourceCategories = frontmatter.categories ?? [];
  const category = sourceCategories.find((entry) => CATEGORY_TO_FOLDER[entry]);
  const folder = CATEGORY_TO_FOLDER[category] ?? 'other';
  const stem = sourceSlug.replaceAll('-', '_');
  return {
    category: FOLDER_TO_CATEGORY[folder],
    englishPath: null,
    folder,
    relativePath: `${folder}/${stem}.mdx`,
    stem,
  };
}

function createTransformState({ sourcePath, sourceRoot }) {
  return {
    componentMap: {
      angleBracketLiterals: [],
      components: new Map(),
      falsePositivePatterns: new Map(),
      path: '',
      syntaxPatterns: new Map(),
    },
    componentUsage: new Map(),
    context: {
      locale: 'zh-CN',
      platform: '',
      platforms: [],
      product: 'faq',
    },
    currentSourcePath: sourcePath,
    falsePositiveUsage: new Map(),
    issues: [],
    linkLists: new Map(),
    pathMap: new Map(),
    sharedDependencies: new Set(),
    sourceRoot,
    syntaxPatternUsage: new Map(),
    tableHeaders: new Map(),
  };
}

function parseExportedTableHeaders(content) {
  const tableHeaders = new Map();
  const exportPattern =
    /^export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\[([\s\S]*?)^\s*]\s*;?\s*$/gm;
  for (const exportMatch of content.matchAll(exportPattern)) {
    const labels = [];
    const labelPattern = /\blabel\s*:\s*['"]([^'"]+)['"]/g;
    for (const labelMatch of exportMatch[2].matchAll(labelPattern)) {
      labels.push(labelMatch[1]);
    }
    if (labels.length > 0) {
      tableHeaders.set(exportMatch[1], labels);
    }
  }
  return tableHeaders;
}

function removeFaqLinkCards(body) {
  return body.replace(/^<LinkCardV2\b[\s\S]*?\/>\s*$/gm, '');
}

function normalizeFaqBody(body) {
  const normalized = body
    .replace(/```Kotlin\/Swift/g, '```text')
    .replace(/```objective-c/g, '```objc')
    .replace(/<br\s*\/?>/gi, '<br />')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return normalizeEmptyCodeFences(normalized);
}

function normalizeEmptyCodeFences(body) {
  let inFence = false;
  return body
    .split('\n')
    .map((line) => {
      const fence = line.match(/^(\s*)```(.*)$/);
      if (!fence) {
        return line;
      }

      if (inFence) {
        inFence = false;
        return line;
      }

      inFence = true;
      return fence[2].trim() ? line : `${fence[1]}\`\`\`text`;
    })
    .join('\n');
}

function normalizeLabels(values, labels) {
  const normalized = unique(
    (Array.isArray(values) ? values : [values])
      .filter(Boolean)
      .map((value) => labels.get(value) ?? value),
  );
  return normalized.includes(labels.get('all') ?? 'all')
    ? normalized
    : [labels.get('all') ?? 'all', ...normalized];
}

function titleFromBody(body) {
  return body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null;
}

function firstSummary(body) {
  const lines = body
    .replace(/```[\s\S]*?```/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const line = lines.find(
    (entry) =>
      !entry.startsWith('#') &&
      !entry.startsWith(':::') &&
      !entry.startsWith('|') &&
      !entry.startsWith('<') &&
      !entry.startsWith('!['),
  );
  return stripMarkdown(line ?? '').slice(0, 180);
}

function stripMarkdown(value) {
  return value
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findLocalImageRefs(content) {
  return unique(
    [...content.matchAll(/!\[[^\]]*]\((\/img\/[^)\s]+)(?:\s+"[^"]*")?\)/g)].map(
      (match) => match[1],
    ),
  );
}

async function copyLocalAsset({ asset, repoRoot, sourceRoot }) {
  const sourcePath = path.join(sourceRoot, 'static', asset);
  const targetPath = path.join(repoRoot, 'public', asset);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
}

async function writeFaqDataFile({
  categories,
  items,
  platformLabels,
  productLabels,
  targetPath,
}) {
  const usedPlatforms = unique(items.flatMap((item) => item.platforms));
  const usedProducts = unique(items.flatMap((item) => item.products));
  const platformOrder = orderedLabels(platformLabels, usedPlatforms);
  const productOrder = orderedLabels(productLabels, usedProducts);
  const data = [
    "import type { FaqCategoryId, FaqItem } from './faq-data';",
    '',
    "export const FAQ_ZH_CN_ALL_PRODUCTS = '全部产品';",
    "export const FAQ_ZH_CN_ALL_PLATFORMS = '全部平台';",
    '',
    'export const zhCnFaqCategories: Array<{',
    '  description: string;',
    '  id: FaqCategoryId;',
    '  label: string;',
    '}> = ',
    `${JSON.stringify(
      categories.map((category) => ({
        description: CATEGORY_DESCRIPTIONS[category.value],
        id: category.value,
        label: category.label,
      })),
      null,
      2,
    )};`,
    '',
    `export const zhCnFaqPlatforms = ${JSON.stringify(platformOrder, null, 2)};`,
    '',
    `export const zhCnFaqProducts = ${JSON.stringify(productOrder, null, 2)};`,
    '',
    `export const zhCnFaqItems: FaqItem[] = ${JSON.stringify(items, null, 2)};`,
    '',
  ].join('\n');
  await fs.writeFile(targetPath, data, 'utf8');
}

function orderedLabels(labelMap, usedLabels) {
  const ordered = [];
  for (const label of labelMap.values()) {
    if (usedLabels.includes(label) && !ordered.includes(label)) {
      ordered.push(label);
    }
  }
  for (const label of usedLabels) {
    if (!ordered.includes(label)) {
      ordered.push(label);
    }
  }
  return ordered;
}

async function updateApiReferenceMeta(metaPath) {
  const raw = await fs.readFile(metaPath, 'utf8');
  const meta = JSON.parse(raw);
  const pages = meta.pages ?? [];
  if (!pages.includes('faq')) {
    const recipesIndex = pages.indexOf('recipes');
    const insertIndex = recipesIndex >= 0 ? recipesIndex + 1 : 1;
    pages.splice(insertIndex, 0, 'faq');
    meta.pages = pages;
  }
  await fs.writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
}

function createReport({ copiedAssets, onlineIntegration, rows, sourceRoot }) {
  const targetPaths = rows.map((row) => row.targetPath);
  const duplicateTargets = targetPaths.filter(
    (targetPath, index) => targetPaths.indexOf(targetPath) !== index,
  );
  const sourceSlugs = new Set(rows.map((row) => row.sourceSlug));
  const onlineMissingInSource = onlineIntegration.entries.filter(
    (entry) => !sourceSlugs.has(entry.slug),
  );
  const onlineMissingInTarget = onlineIntegration.entries.filter((entry) => {
    const row = rows.find((candidate) => candidate.sourceSlug === entry.slug);
    return !row || row.status === 'missing';
  });

  return {
    counts: {
      copiedAssets: copiedAssets.length,
      duplicateTargets: unique(duplicateTargets).length,
      migrated: rows.filter((row) => row.status === 'migrated').length,
      needsReview: rows.filter((row) => row.status === 'needs_review').length,
      noEnglishCounterpart: rows.filter((row) => !row.englishPath).length,
      rowsWithNotes: rows.filter((row) => row.issues.length > 0).length,
      onlineIntegration: onlineIntegration.entries.length,
      onlineMissingInSource: onlineMissingInSource.length,
      onlineMissingInTarget: onlineMissingInTarget.length,
      sourceFiles: rows.length,
    },
    generatedAt: new Date().toISOString(),
    onlineIntegration: {
      entries: onlineIntegration.entries,
      error: onlineIntegration.error,
      fetched: onlineIntegration.fetched,
      missingInSource: onlineMissingInSource,
      missingInTarget: onlineMissingInTarget,
      url: onlineIntegration.url,
    },
    copiedAssets,
    rows,
    sourceRoot,
  };
}

function requiresManualReview(issues) {
  return issues.some(
    (issue) =>
      issue.startsWith('legacy-residue:') ||
      issue.startsWith('missing-category-frontmatter') ||
      issue.startsWith('missing-frontmatter') ||
      issue.startsWith('needs-platform-filter-review') ||
      issue.startsWith('unresolved-'),
  );
}

function reportToMarkdown(report) {
  const lines = [
    '# zh-CN FAQ Migration Mapping',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Source root: \`${report.sourceRoot}\``,
    `- Source files: ${report.counts.sourceFiles}`,
    `- Migrated: ${report.counts.migrated}`,
    `- Needs manual review: ${report.counts.needsReview}`,
    `- Rows with conversion notes: ${report.counts.rowsWithNotes}`,
    `- No English counterpart: ${report.counts.noEnglishCounterpart}`,
    `- Copied local assets: ${report.counts.copiedAssets}`,
    `- Online integration checklist: ${report.counts.onlineIntegration} entries`,
    `- Online entries missing in source: ${report.counts.onlineMissingInSource}`,
    `- Online entries missing in target: ${report.counts.onlineMissingInTarget}`,
    '',
    '## Online Integration Checklist',
    '',
    `Source: ${report.onlineIntegration.url}`,
    '',
  ];

  if (!report.onlineIntegration.fetched) {
    lines.push(
      `Fetch failed: ${report.onlineIntegration.error ?? 'unknown'}`,
      '',
    );
  } else if (report.onlineIntegration.missingInTarget.length === 0) {
    lines.push(
      'All online integration entries are represented in the migration.',
      '',
    );
  } else {
    lines.push('| Online slug | Title |', '| --- | --- |');
    for (const entry of report.onlineIntegration.missingInTarget) {
      lines.push(`| \`${entry.slug}\` | ${escapeTable(entry.title)} |`);
    }
    lines.push('');
  }

  lines.push(
    '## Mapping',
    '',
    '| Source FAQ | Online integration | Target zh-CN path | English canonical path | Status | Notes |',
    '| --- | --- | --- | --- | --- | --- |',
  );
  for (const row of report.rows) {
    lines.push(
      [
        `\`${row.sourcePath}\``,
        row.onlineIntegration ? 'yes' : 'no',
        `\`${row.targetPath}\``,
        row.englishPath ? `\`${row.englishPath}\`` : 'none',
        row.status,
        row.issues.length ? escapeTable(row.issues.join('<br />')) : '',
      ]
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |'),
    );
  }
  lines.push('');
  return lines.join('\n');
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, '');
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function stripWrappingQuotes(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

function escapeTable(value) {
  return String(value).replace(/\|/g, '\\|');
}

function unique(values) {
  return [...new Set(values)];
}

function dedupeBy(values, keyFn) {
  const seen = new Set();
  const deduped = [];
  for (const value of values) {
    const key = keyFn(value);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(value);
  }
  return deduped;
}

function toPosix(value) {
  return value.split(path.sep).join(path.posix.sep);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
