import fs from 'node:fs';
import path from 'node:path';

const dryRun = process.argv.includes('--dry-run');

const contentRoots = [
  'content/docs/zh-CN/realtime-media',
  'content/docs/zh-CN/solutions',
];

const allowedTopLevelPages = new Set([
  'index',
  'get-started',
  'build',
  'reference',
]);

const blockedCandidateSegments = new Set([
  'overview',
  'get-started',
  'basic-features',
  'advanced-features',
  'user-guides',
  'user-guide',
  'best-practices',
  'best-practice',
  'api',
  'api-ref',
  'webhook',
  'build',
  'reference',
]);

const legacyBuildRoots = new Set([
  'basic-features',
  'advanced-features',
  'user-guides',
  'user-guide',
  'best-practices',
  'best-practice',
  'webhook',
]);

const groupTitles = {
  'setup-and-access': '开通与接入',
  'implement-core-features': '实现核心功能',
  'manage-media-streams': '管理媒体流',
  'manage-recording': '管理录制任务',
  'manage-recorded-files': '管理录制文件',
  'recording-modes': '配置录制模式',
  'manage-whiteboard': '管理白板房间',
  'extend-whiteboard': '扩展白板能力',
  'manage-karaoke': '实现 K 歌能力',
  'extend-karaoke': '扩展 K 歌能力',
  'manage-classroom': '管理课堂',
  'customize-and-extend': '自定义与扩展',
  'manage-messages': '收发消息',
  'manage-channels': '管理频道',
  'manage-connections': '管理连接',
  'manage-presence': '管理在线状态',
  'manage-metadata': '管理元数据',
  'manage-topics': '使用 Topic',
  'security-and-auth': '实现安全与鉴权',
  audio: '实现音频',
  video: '实现视频',
  'channel-and-connection': '管理频道与连接',
  media: '处理媒体',
  extensions: '集成插件',
  'quality-and-operations': '质量与运维',
  'optimize-and-operate': '优化与运维',
  'monitor-events': '接收事件通知',
  'create-extensions': '创建插件',
  'integrate-extensions': '集成插件',
  paas: 'PaaS 方案',
  apaas: 'aPaaS 方案',
  'value-added-feature': '使用增值能力',
  implementation: '实现方案',
  fls: '分析 FLS 数据',
  rtc: '分析语音与视频数据',
  rtm: '分析信令数据',
  platforms: '按平台构建',
};

const apiReferenceRedirectOverrides = [
  [
    '/zh-CN/realtime-media/transcoding/webhook/ncs-events',
    '/zh-CN/api-reference/api-ref/cloud-transcoding/ncs-events',
  ],
  [
    '/zh-CN/realtime-media/transcoding/reference/ncs-events',
    '/zh-CN/api-reference/api-ref/cloud-transcoding/ncs-events',
  ],
  ...[
    ['auikaraoke', 'auikaraoke-api'],
    ['auikaraoke', 'lyrics-api'],
    ['ktv-scenario', 'ktv-api'],
    ['ktv-scenario', 'lyrics-api'],
    ['ktv-scenario', 'music-content-center'],
    ['ktv-scenario', 'rtc-api'],
    ['online-ktv-sdk', 'lyrics-api'],
    ['online-ktv-sdk', 'music-content-center'],
    ['online-ktv-sdk', 'rtc-api'],
  ].flatMap(([solution, leaf]) => [
    [
      `/zh-CN/realtime-media/online-ktv/${solution}/api/${leaf}`,
      `/zh-CN/api-reference/online-ktv/android/${solution}/api/${leaf}`,
    ],
    [
      `/zh-CN/solutions/online-ktv/${solution}/reference/${leaf}`,
      `/zh-CN/api-reference/online-ktv/android/${solution}/api/${leaf}`,
    ],
  ]),
];

const productIaPrefixRedirects = [
  [
    'realtime-media/recording/cloud-recording',
    '/zh-CN/realtime-media/cloud-recording',
  ],
  [
    'realtime-media/recording/local-server-recording',
    '/zh-CN/realtime-media/local-server-recording',
  ],
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeFile(filePath, content) {
  if (dryRun) {
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function writeJson(filePath, value) {
  writeFile(`${filePath}`, `${JSON.stringify(value, null, 2)}\n`);
}

function stripPagePrefix(page) {
  return String(page).replace(/^[!.-]+/, '');
}

function withoutExt(relativePath) {
  return relativePath.replace(/\.mdx?$/, '');
}

function fileSlug(relativePath) {
  return path.basename(relativePath).replace(/\.mdx?$/, '');
}

function walkMetaDirs(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (!entry.isDirectory()) {
      continue;
    }
    if (fs.existsSync(path.join(filePath, 'meta.json'))) {
      out.push(filePath);
    }
    walkMetaDirs(filePath, out);
  }
  return out;
}

function listMarkdownFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listMarkdownFiles(filePath, out);
    } else if (/\.mdx?$/.test(entry.name)) {
      out.push(filePath);
    }
  }
  return out;
}

function titleOf(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatter) {
    const title = frontmatter[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (title) {
      return title[1].trim();
    }
  }
  const heading = content.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : fileSlug(filePath);
}

function setTitle(filePath, title) {
  const content = fs.readFileSync(filePath, 'utf8');
  let next = content;
  if (/^---\n[\s\S]*?\n---/.test(content)) {
    next = content.replace(
      /^---\n([\s\S]*?)\n---/,
      (match, frontmatter) => {
        if (/^title:/m.test(frontmatter)) {
          return `---\n${frontmatter.replace(/^title:.*$/m, `title: ${title}`)}\n---`;
        }
        return `---\ntitle: ${title}\n${frontmatter}\n---`;
      },
    );
  } else if (/^#\s+.+$/m.test(content)) {
    next = content.replace(/^#\s+.+$/m, `# ${title}`);
  }
  if (!dryRun && next !== content) {
    fs.writeFileSync(filePath, next);
  }
}

function isAggregator(dir, meta) {
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name));
  if (files.length > 0) {
    return false;
  }
  const pages = (meta.pages ?? []).map(stripPagePrefix);
  if (pages.length === 0) {
    return false;
  }
  return pages.every((page) => fs.existsSync(path.join(dir, page, 'meta.json')));
}

function hasNonAllowedPages(meta) {
  return (meta.pages ?? [])
    .map(stripPagePrefix)
    .some((page) => !allowedTopLevelPages.has(page));
}

function tabForRoot(root) {
  return root.endsWith('realtime-media') ? 'realtime-media' : 'solutions';
}

function routeUrl(tab, productRel, relativeFilePath) {
  let slug = withoutExt(relativeFilePath);
  if (slug === 'index') {
    slug = '';
  }
  if (slug.endsWith('/index')) {
    slug = slug.slice(0, -'/index'.length);
  }
  return `/zh-CN/${tab}/${[productRel, slug].filter(Boolean).join('/')}`;
}

function isOverviewIndex(relativeFilePath) {
  return (
    /(^|\/)overview\/(product-overview|product|introduction|paas-overview)\.mdx?$/.test(
      relativeFilePath,
    ) || /^(product-overview|overview)\.mdx?$/.test(relativeFilePath)
  );
}

function isReferencePage(relativeFilePath, title) {
  const slugPath = withoutExt(relativeFilePath);
  const parts = slugPath.split('/');
  const leaf = parts.at(-1) ?? '';
  const top = parts[0] ?? '';
  const haystack = `${slugPath} ${title}`.toLowerCase();

  if (top === 'api' || top === 'api-ref') {
    return true;
  }

  if (
    top === 'webhook' &&
    /(event|events|ncs)/i.test(haystack) &&
    !/(enable|receive|接收)/.test(title)
  ) {
    return true;
  }

  if (
    [
      'resources',
      'resources-fb',
      'resources-wb',
      'quota',
      'response-code',
      'error-code',
      'error-codes',
      'security',
      'sunset-policy',
      'billing',
      'release-notes-fb',
      'release-notes-wb',
      'conversion-webhook',
      'solution-compare',
      'slide-api',
      'restful',
      'api',
      'advanced-feature',
    ].includes(leaf)
  ) {
    return true;
  }

  return (
    /(billing|payment|pricing|quota|response-code|error-code|error-codes|release-notes|sunset|migration|platform-support|browser-compatibility|api-limits|base-url|resources|security|feature-list|concept|concepts|tech-architect|tech-architecture|supported|compatibility|download|solution-compare|convert-ppt|api-reference|restful|webhook-events|ncs-events|event-type|events|api-overview)/.test(
      haystack,
    ) ||
    /(计费|付费|配额|响应状态码|错误码|发版|更新历史|退休|迁移|平台支持|兼容性|下载|资源获取|特性列表|基本概念|核心概念|技术架构|方案对比|API|参考|事件类型|回调事件|调用限制|合规)/.test(
      title,
    )
  );
}

function referenceDest(relativeFilePath) {
  const ext = path.extname(relativeFilePath);
  const slugPath = withoutExt(relativeFilePath);
  const parts = slugPath.split('/');
  let leaf = parts.at(-1) ?? fileSlug(relativeFilePath);
  const top = parts[0] ?? '';

  if (leaf === 'reference') {
    leaf = 'api-reference';
  }
  if (['resources', 'resources-fb', 'resources-wb'].includes(leaf)) {
    leaf = 'downloads';
  }
  if (top === 'overview' && parts.length > 2) {
    return `reference/${parts.slice(1).join('/')}${ext}`;
  }
  return `reference/${leaf}${ext}`;
}

function setupLike(relativeFilePath, title) {
  return (
    /(enable|authorization|auth|token|license|call-api|configure|config|setup|login|application|http|firewall|region|private|data-security|data-storage|account)/i.test(
      `${relativeFilePath} ${title}`,
    ) ||
    /(开通|鉴权|认证|配置|调用 API|License|防火墙|限定访问区域|私有化|数据安全|账号)/.test(
      title,
    )
  );
}

function receiveWebhookLike(relativeFilePath, title) {
  return (
    relativeFilePath.startsWith('webhook/') &&
    /(enable|receive|接收)/i.test(`${relativeFilePath} ${title}`)
  );
}

function getStartedScore(relativeFilePath) {
  const slug = withoutExt(relativeFilePath).split('/').at(-1) ?? '';
  if (/enable|auth|authorization|call-api|configure|license|backend/.test(slug)) {
    return 99;
  }
  if (slug === 'quick-start') {
    return 0;
  }
  if (/audio-quick-start|quick-start/.test(slug)) {
    return 1;
  }
  if (/run-example|run-demo|kit-demo/.test(slug)) {
    return 2;
  }
  if (/^(integrate|start|use|join|karaoke|render)/.test(slug)) {
    return 3;
  }
  return 50;
}

function buildGroup(productRel, relativeFilePath, title) {
  const slugPath = withoutExt(relativeFilePath);
  const parts = slugPath.split('/');
  const top = parts[0] ?? '';
  const haystack = `${slugPath} ${title}`.toLowerCase();

  if (receiveWebhookLike(relativeFilePath, title)) {
    return 'monitor-events';
  }

  if (productRel.endsWith('marketplace')) {
    if (top === 'create-extensions') {
      return 'create-extensions';
    }
    if (top === 'integrate-extensions') {
      return 'integrate-extensions';
    }
  }

  if (
    [
      'paas',
      'apaas',
      'value-added-feature',
      'implementation',
      'fls',
      'rtc',
      'rtm',
    ].includes(top)
  ) {
    return top;
  }

  if (productRel.endsWith('rtm') && top === 'user-guide') {
    const domain = parts[1] ?? '';
    return (
      {
        setup: 'setup-and-access',
        link: 'manage-connections',
        channel: 'manage-channels',
        message: 'manage-messages',
        presence: 'manage-presence',
        storage: 'manage-metadata',
        token: 'security-and-auth',
        topic: 'manage-topics',
      }[domain] ?? 'implement-core-features'
    );
  }

  if (productRel.endsWith('rtc')) {
    if (parts[1] === 'extensions') {
      return 'extensions';
    }
    if (/audio|voice|volume|music|sound|spatial/.test(haystack)) {
      return 'audio';
    }
    if (
      /video|screen|beauty|background|picture|render|alpha|frame|layout|simulcast|clarity|watermark|face|inspect/.test(
        haystack,
      )
    ) {
      return 'video';
    }
    if (/channel|connection|join|leave|publish|subscribe|relay|multiple/.test(haystack)) {
      return 'channel-and-connection';
    }
    if (/token|auth|encrypt|security|firewall|region|privilege|bombing/.test(haystack)) {
      return 'security-and-auth';
    }
    if (/quality|fallback|preload|autoplay|availability|size|online|lastmile|diagnostics|monitor|optimi/.test(haystack)) {
      return 'quality-and-operations';
    }
    if (/media-player|raw|custom/.test(haystack)) {
      return 'media';
    }
  }

  if (productRel.includes('cloud-recording')) {
    if (/manage-file/.test(slugPath)) {
      return 'manage-recorded-files';
    }
    if (/individual-mode|mix-mode|web-mode|snapshot|recording-mode|composite|single|layout/.test(slugPath)) {
      return 'recording-modes';
    }
  }

  if (productRel.includes('local-server-recording')) {
    if (/restore|repair|崩溃|修复/.test(haystack)) {
      return 'optimize-and-operate';
    }
    if (/recording-mode|set-layout|watermark|screen|capture/.test(haystack)) {
      return 'recording-modes';
    }
  }

  if (/media-push|media-pull|rtmp-gateway|fusion-cdn|transcoding/.test(productRel)) {
    if (/analytics|recording|check|availability|ensure|status|webpage/.test(haystack)) {
      return 'optimize-and-operate';
    }
    return setupLike(relativeFilePath, title)
      ? 'setup-and-access'
      : 'manage-media-streams';
  }

  if (/whiteboard/.test(productRel)) {
    if (/convert|record|replay|custom-event/.test(haystack)) {
      return 'extend-whiteboard';
    }
    return setupLike(relativeFilePath, title)
      ? 'setup-and-access'
      : 'manage-whiteboard';
  }

  if (/ktv|karaoke|music-class/.test(productRel)) {
    if (/lyrics|music|score|sync|fish-eye|copyright/.test(haystack)) {
      return 'extend-karaoke';
    }
    return setupLike(relativeFilePath, title)
      ? 'setup-and-access'
      : 'manage-karaoke';
  }

  if (/classroom|meeting|learning|art-class|online-music-class/.test(productRel)) {
    if (/custom|widget|ui|plugin|brightness|trapezoid|correction/.test(haystack)) {
      return 'customize-and-extend';
    }
    if (/record|courseware|system|availability|property|proctor|whiteboard|room|user|classroom|meeting/.test(haystack)) {
      return 'manage-classroom';
    }
    return setupLike(relativeFilePath, title)
      ? 'setup-and-access'
      : 'implement-core-features';
  }

  if (/showroom|one-to-one|meta-world|game-voice|voip|iot|smart|teleoperation|status-page|ppt-transcoding/.test(productRel)) {
    if (/custom|beauty|video-loader|moderation|audio-scenario|hq-video|spatial|alarm|storage|ota|source|sink|control|advanced|value/.test(haystack)) {
      return 'customize-and-extend';
    }
    return setupLike(relativeFilePath, title)
      ? 'setup-and-access'
      : 'implement-core-features';
  }

  if (/best-practices|best-practice|check|availability|optimi|ensure/.test(haystack)) {
    return 'optimize-and-operate';
  }
  if (setupLike(relativeFilePath, title)) {
    return 'setup-and-access';
  }
  return 'implement-core-features';
}

function buildDest(productRel, relativeFilePath, title) {
  const ext = path.extname(relativeFilePath);
  const slugPath = withoutExt(relativeFilePath);
  const parts = slugPath.split('/');
  const top = parts[0] ?? '';
  const group = buildGroup(productRel, relativeFilePath, title);
  let rest = parts;

  if (legacyBuildRoots.has(top) || top === 'get-started' || top === 'overview') {
    rest = parts.slice(1);
  }
  if (top === group) {
    rest = parts.slice(1);
  }
  if (rest.length === 0) {
    rest = [fileSlug(relativeFilePath)];
  }

  return `build/${group}/${rest.join('/')}${ext}`;
}

function uniqueDest(assignment, usedDests) {
  if (!assignment.newRel || !usedDests.has(assignment.newRel)) {
    return assignment;
  }

  const ext = path.extname(assignment.newRel);
  const withoutExtension = assignment.newRel.slice(0, -ext.length);
  const oldParts = withoutExt(assignment.oldRel).split('/');
  const prefix = oldParts.length > 1 ? oldParts.at(-2) : 'page';
  let candidate = `${withoutExtension}-${prefix}${ext}`;
  let index = 2;
  while (usedDests.has(candidate)) {
    candidate = `${withoutExtension}-${prefix}-${index}${ext}`;
    index += 1;
  }
  return { ...assignment, newRel: candidate };
}

function collectCandidates() {
  const candidates = [];

  for (const root of contentRoots) {
    const dirs = walkMetaDirs(root).sort(
      (a, b) =>
        a.split(path.sep).length - b.split(path.sep).length ||
        a.localeCompare(b),
    );
    const chosen = [];

    for (const dir of dirs) {
      const rel = path.relative(root, dir);
      const segments = rel.split(path.sep);
      if (segments.some((segment) => blockedCandidateSegments.has(segment))) {
        continue;
      }
      if (chosen.some((chosenDir) => dir.startsWith(`${chosenDir}${path.sep}`))) {
        continue;
      }

      const meta = readJson(path.join(dir, 'meta.json'));
      if (!hasNonAllowedPages(meta) || isAggregator(dir, meta)) {
        continue;
      }

      candidates.push({
        dir,
        meta,
        productRel: rel,
        root,
        tab: tabForRoot(root),
      });
      chosen.push(dir);
    }
  }

  return candidates;
}

function getKeepGetStarted(files, titles) {
  const candidates = files
    .filter((relativeFilePath) => relativeFilePath.startsWith('get-started/'))
    .map((relativeFilePath) => ({
      relativeFilePath,
      score: getStartedScore(relativeFilePath, titles.get(relativeFilePath) ?? ''),
    }))
    .sort((a, b) => a.score - b.score || a.relativeFilePath.localeCompare(b.relativeFilePath));

  const keep = new Set(
    candidates
      .filter((candidate) => candidate.score < 50)
      .slice(0, 3)
      .map((candidate) => candidate.relativeFilePath),
  );

  if (keep.size === 0 && candidates.length === 1) {
    keep.add(candidates[0].relativeFilePath);
  }

  return keep;
}

function createAssignments(candidate) {
  const files = listMarkdownFiles(candidate.dir)
    .map((filePath) => path.relative(candidate.dir, filePath))
    .filter(
      (relativeFilePath) =>
        !relativeFilePath.startsWith('build/') &&
        !relativeFilePath.startsWith('reference/'),
    )
    .sort();

  const titles = new Map(
    files.map((relativeFilePath) => [
      relativeFilePath,
      titleOf(path.join(candidate.dir, relativeFilePath)),
    ]),
  );
  const keepGetStarted = getKeepGetStarted(files, titles);
  const hasOverviewIndex = files.some(isOverviewIndex);
  const assignments = [];
  const usedDests = new Set();

  for (const oldRel of files) {
    const title = titles.get(oldRel) ?? '';
    let newRel = null;
    let deleteOnly = false;

    if (isOverviewIndex(oldRel)) {
      newRel = `index${path.extname(oldRel)}`;
    } else if (/^index\.mdx?$/.test(oldRel)) {
      if (hasOverviewIndex) {
        deleteOnly = true;
      } else {
        newRel = oldRel;
      }
    } else if (oldRel.startsWith('get-started/') && keepGetStarted.has(oldRel)) {
      newRel = oldRel;
    } else if (isReferencePage(oldRel, title)) {
      newRel = referenceDest(oldRel);
    } else {
      newRel = buildDest(candidate.productRel, oldRel, title);
    }

    const assignment = uniqueDest(
      {
        deleteOnly,
        newRel,
        oldRel,
        title,
      },
      usedDests,
    );
    if (assignment.newRel) {
      usedDests.add(assignment.newRel);
    }
    assignments.push(assignment);
  }

  return assignments;
}

function moveFile(from, to) {
  if (dryRun) {
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (fs.existsSync(to)) {
    fs.rmSync(to);
  }
  fs.renameSync(from, to);
}

function removePath(filePath) {
  if (dryRun || !fs.existsSync(filePath)) {
    return;
  }
  fs.rmSync(filePath, { recursive: true, force: true });
}

function cleanupEmptyDirs(dir, stopDir) {
  if (dryRun || !fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanupEmptyDirs(filePath, stopDir);
    }
  }
  if (dir === stopDir) {
    return;
  }
  const entries = fs.readdirSync(dir);
  if (entries.length === 0 || entries.every((entry) => entry === 'meta.json')) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function pageSlugFromFile(fileName) {
  return fileName.replace(/\.mdx?$/, '');
}

function dirTitle(dir, productDir) {
  const rel = path.relative(productDir, dir);
  const parts = rel.split(path.sep);
  const leaf = parts.at(-1) ?? '';
  if (rel === 'get-started') {
    return '快速开始';
  }
  if (rel === 'build') {
    return '构建功能';
  }
  if (rel === 'reference') {
    return '参考';
  }
  if (parts[0] === 'build' && groupTitles[leaf]) {
    return groupTitles[leaf];
  }
  if (groupTitles[leaf]) {
    return groupTitles[leaf];
  }
  return leaf
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function writeMetas(productDir, productTitle, originalMeta) {
  if (dryRun) {
    return;
  }

  const dirs = [productDir, ...walkMetaDirs(productDir)]
    .filter((dir) => !path.relative(productDir, dir).startsWith('overview'))
    .sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);

  for (const dir of dirs) {
    if (dir === productDir) {
      continue;
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const filePages = entries
      .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name))
      .map((entry) => pageSlugFromFile(entry.name))
      .sort((a, b) => (a === 'index' ? -1 : b === 'index' ? 1 : a.localeCompare(b)));
    const childPages = entries
      .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, 'meta.json')))
      .map((entry) => entry.name)
      .sort();
    const pages = [...filePages, ...childPages];
    if (pages.length === 0) {
      continue;
    }
    writeJson(path.join(dir, 'meta.json'), {
      title: dirTitle(dir, productDir),
      pages,
    });
  }

  const rootPages = ['index'];
  if (fs.existsSync(path.join(productDir, 'get-started', 'meta.json'))) {
    rootPages.push('get-started');
  }
  if (fs.existsSync(path.join(productDir, 'build', 'meta.json'))) {
    rootPages.push('build');
  }
  if (fs.existsSync(path.join(productDir, 'reference', 'meta.json'))) {
    rootPages.push('reference');
  }

  writeJson(path.join(productDir, 'meta.json'), {
    title: originalMeta.title ?? productTitle,
    ...(originalMeta.navScope !== undefined ? { navScope: originalMeta.navScope } : {}),
    sidebarIndexTitle: `${productTitle}概览`,
    pages: rootPages,
  });
}

function buildRedirectMap(redirects) {
  return Object.fromEntries(
    [...redirects, ...apiReferenceRedirectOverrides]
      .filter(([from, to]) => from !== to)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

function writeRedirects(redirects) {
  const redirectsByPath = buildRedirectMap(redirects);
  const templateExpression = '$';
  const entries = Object.entries(redirectsByPath)
    .map(([from, to]) => {
      const key = from.replace(/^\/zh-CN\//, '');
      return `  ${JSON.stringify(key)}: ${JSON.stringify(to)},`;
    })
    .join('\n');

  writeFile(
    'src/lib/zh-cn-product-ia-redirects.ts',
    `const ZH_CN_PRODUCT_IA_REDIRECTS: Record<string, string> = {\n${entries}\n};\n\nconst ZH_CN_PRODUCT_IA_PREFIX_REDIRECTS: Array<[string, string]> = ${JSON.stringify(
      productIaPrefixRedirects,
      null,
      2,
    )};\n\nexport function resolveZhCnProductIaRedirect(\n  locale: string,\n  tab: string,\n  slugSegments: string[],\n) {\n  if (locale !== 'zh-CN') {\n    return null;\n  }\n\n  const path = \`${templateExpression}{tab}/${templateExpression}{slugSegments.join('/')}\`;\n\n  for (const [sourcePrefix, targetPrefix] of ZH_CN_PRODUCT_IA_PREFIX_REDIRECTS) {\n    if (path === sourcePrefix || path.startsWith(\`${templateExpression}{sourcePrefix}/\`)) {\n      return \`${templateExpression}{targetPrefix}${templateExpression}{path.slice(sourcePrefix.length)}\`;\n    }\n  }\n\n  return ZH_CN_PRODUCT_IA_REDIRECTS[path] ?? null;\n}\n\nexport { ZH_CN_PRODUCT_IA_REDIRECTS };\n`,
  );
}

const candidates = collectCandidates();
const redirects = [];

for (const candidate of candidates) {
  const assignments = createAssignments(candidate);
  const productTitle = candidate.meta.title ?? path.basename(candidate.dir);

  const summary = {
    buildGroups: [
      ...new Set(
        assignments
          .filter((assignment) => assignment.newRel?.startsWith('build/'))
          .map((assignment) => assignment.newRel.split('/')[1]),
      ),
    ],
    files: assignments.length,
    getStarted: assignments.filter((assignment) =>
      assignment.newRel?.startsWith('get-started/'),
    ).length,
    reference: assignments.filter((assignment) =>
      assignment.newRel?.startsWith('reference/'),
    ).length,
  };

  console.log(
    `${candidate.tab}/${candidate.productRel}\tfiles=${summary.files}\tget=${summary.getStarted}\tbuild=${summary.buildGroups
      .map((group) => groupTitles[group] ?? group)
      .join('|')}\tref=${summary.reference}`,
  );

  if (!dryRun) {
    for (const assignment of assignments) {
      const from = path.join(candidate.dir, assignment.oldRel);
      if (assignment.deleteOnly) {
        removePath(from);
        continue;
      }
      if (!assignment.newRel) {
        continue;
      }
      const to = path.join(candidate.dir, assignment.newRel);
      if (assignment.oldRel !== assignment.newRel) {
        moveFile(from, to);
        redirects.push([
          routeUrl(candidate.tab, candidate.productRel, assignment.oldRel),
          routeUrl(candidate.tab, candidate.productRel, assignment.newRel),
        ]);
      }
    }

    for (const assignment of assignments) {
      if (assignment.newRel && /^index\.mdx?$/.test(assignment.newRel)) {
        setTitle(path.join(candidate.dir, assignment.newRel), `${productTitle}概览`);
      }
    }

    cleanupEmptyDirs(candidate.dir, candidate.dir);
    writeMetas(candidate.dir, productTitle, candidate.meta);
  } else {
    for (const assignment of assignments) {
      if (assignment.newRel && assignment.oldRel !== assignment.newRel) {
        redirects.push([
          routeUrl(candidate.tab, candidate.productRel, assignment.oldRel),
          routeUrl(candidate.tab, candidate.productRel, assignment.newRel),
        ]);
      }
    }
  }
}

writeRedirects(redirects);

console.log(
  `candidates=${candidates.length} redirects=${
    Object.keys(buildRedirectMap(redirects)).length
  }`,
);
