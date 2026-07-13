#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const REACT_PAGES = [
  ['overview.react.mdx', 'overview.mdx'],
  ['components.react.mdx', 'components.mdx'],
  ['hooks.react.mdx', 'hooks.mdx'],
  ['data-types.react.mdx', 'data-types.mdx'],
];

const WEB_SIDEBAR = [
  ['概览', null],
  ['IAgoraRTC', 'interfaces/iagorartc.html'],
  ['IAgoraRTCClient', 'interfaces/iagorartcclient.html'],
  ['ILocalTrack', 'interfaces/ilocaltrack.html'],
  ['ILocalAudioTrack', 'interfaces/ilocalaudiotrack.html'],
  ['IMicrophoneAudioTrack', 'interfaces/imicrophoneaudiotrack.html'],
  ['IBufferSourceAudioTrack', 'interfaces/ibuffersourceaudiotrack.html'],
  ['ILocalVideoTrack', 'interfaces/ilocalvideotrack.html'],
  ['ICameraVideoTrack', 'interfaces/icameravideotrack.html'],
  ['IRemoteTrack', 'interfaces/iremotetrack.html'],
  ['IRemoteAudioTrack', 'interfaces/iremoteaudiotrack.html'],
  ['IRemoteVideoTrack', 'interfaces/iremotevideotrack.html'],
  ['类型别名 (Type alias)', 'globals.html'],
];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    output: null,
    source: null,
    targetBasePath: '/zh-CN/api-reference/rtc/react',
    webSource: null,
    webTargetBasePath: '/zh-CN/api-reference/rtc/web',
  };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === '--source') opts.source = args[++index];
    else if (value === '--output') opts.output = args[++index];
    else if (value === '--web-source') opts.webSource = args[++index];
    else if (value === '--target-base-path')
      opts.targetBasePath = args[++index];
    else if (value === '--web-target-base-path')
      opts.webTargetBasePath = args[++index];
  }
  if (!opts.source || !opts.output || !opts.webSource) {
    throw new Error('--source, --output, and --web-source are required.');
  }
  return opts;
}

function toKebab(value) {
  return value
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function normalizeTypeDocTitle(title) {
  return title
    .replace(
      /^(Class|Interface|Enumeration|Enum|Namespace|Module|Function|Variable|Type Alias)\s+/i,
      '',
    )
    .replace(/^"(.+)"$/, '$1')
    .trim();
}

async function createWebRouteResolver(webSource, webTargetBasePath) {
  const cache = new Map();
  return async (sourceName) => {
    if (!sourceName) return webTargetBasePath;
    if (sourceName === 'globals.html') return `${webTargetBasePath}/globals`;
    if (cache.has(sourceName)) return cache.get(sourceName);

    const html = await fs.readFile(path.join(webSource, sourceName), 'utf8');
    const $ = cheerio.load(html);
    const title = normalizeTypeDocTitle(
      $('.tsd-page-title h1, .page-title h1, h1').first().text().trim(),
    );
    if (!title)
      throw new Error(`Cannot resolve Web TypeDoc title: ${sourceName}`);
    const folder = path.posix.dirname(sourceName);
    const route = `${webTargetBasePath}/${folder}/${toKebab(title)}`;
    cache.set(sourceName, route);
    return route;
  };
}

async function rewriteLegacyLinks(contents, resolveWebRoute) {
  const matches = [...contents.matchAll(/\/api-ref\/rtc\/react\/[^)\s"']+/g)];
  const replacements = new Map();
  for (const match of matches) {
    const href = match[0];
    if (replacements.has(href)) continue;
    const url = new URL(href, 'https://legacy.invalid');
    if (url.pathname === '/api-ref/rtc/react/overview') {
      replacements.set(href, `${await resolveWebRoute(null)}${url.hash}`);
      continue;
    }
    const sourceName = url.pathname
      .replace('/api-ref/rtc/react/', '')
      .replace(/\.html$/, '.html');
    replacements.set(href, `${await resolveWebRoute(sourceName)}${url.hash}`);
  }

  let rewritten = contents;
  for (const [from, to] of replacements)
    rewritten = rewritten.replaceAll(from, to);
  return rewritten;
}

function normalizeMdx(contents) {
  return contents
    .replace(
      /<H2\b[^>]*\bid="([^"]+)"[^>]*>([^<]+)<\/H2>/g,
      (_match, _id, title) => `## ${title.trim()}`,
    )
    .replace(/(?:<li>(.*?)<\/li>)+/g, (list) =>
      [...list.matchAll(/<li>(.*?)<\/li>/g)]
        .map((item) => `- ${item[1].trim()}`)
        .join('<br />'),
    )
    .replace(/\n{3,}/g, '\n\n');
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main() {
  const opts = parseArgs();
  const resolveWebRoute = await createWebRouteResolver(
    opts.webSource,
    opts.webTargetBasePath,
  );
  const renderedPages = new Map();
  for (const [sourceName, targetName] of REACT_PAGES) {
    const source = await fs.readFile(
      path.join(opts.source, sourceName),
      'utf8',
    );
    renderedPages.set(
      targetName,
      normalizeMdx(await rewriteLegacyLinks(source, resolveWebRoute)),
    );
  }

  await fs.rm(opts.output, { force: true, recursive: true });
  const reactSdkRoot = path.join(opts.output, 'react-sdk');
  await fs.mkdir(reactSdkRoot, { recursive: true });
  for (const [targetName, contents] of renderedPages) {
    await fs.writeFile(path.join(reactSdkRoot, targetName), contents, 'utf8');
  }
  await fs.writeFile(
    path.join(opts.output, 'index.mdx'),
    renderedPages.get('overview.mdx'),
    'utf8',
  );

  const webPages = [];
  for (const [label, sourceName] of WEB_SIDEBAR) {
    webPages.push(`[${label}](${await resolveWebRoute(sourceName)})`);
  }
  await writeJson(path.join(opts.output, 'meta.json'), {
    title: 'React SDK API 参考',
    navScope: {},
    pages: [
      {
        type: 'group',
        title: 'API 概览',
        pages: [
          'index',
          `[Components（组件）](${opts.targetBasePath}/react-sdk/components)`,
          `[Hooks（钩子）](${opts.targetBasePath}/react-sdk/hooks)`,
          `[类型定义](${opts.targetBasePath}/react-sdk/data-types)`,
        ],
      },
      { type: 'group', title: 'Web SDK API', pages: webPages },
      '!react-sdk',
    ],
  });
  await writeJson(path.join(reactSdkRoot, 'meta.json'), {
    title: 'API 概览',
    pages: ['overview', 'components', 'hooks', 'data-types'],
  });

  console.log(`Migrated RTC React API reference to ${opts.output}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
