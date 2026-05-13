#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const homeDir = path.join(rootDir, 'content', 'home');
const externalDir = path.join(rootDir, 'external', 'docs-cortex', 'raw', 'docs', 'convoai', 'restful');
const outputDir = path.join(rootDir, 'content', 'docs');

const locales = ['en', 'zh-CN'];
const dryRun = process.argv.includes('--dry-run');

const tabOrder = [
  'introduction',
  'ai',
  'realtime-media',
  'solutions',
  'api-reference',
  'best-practices',
];

const titles = {
  en: {
    'introduction': 'Introduction',
    'ai': 'AI',
    'realtime-media': 'Realtime & Media',
    'solutions': 'Solutions',
    'api-reference': 'API Reference',
    'best-practices': 'Best Practices',
  },
  'zh-CN': {
    'introduction': 'Introduction',
    'ai': 'AI',
    'realtime-media': 'Realtime & Media',
    'solutions': 'Solutions',
    'api-reference': 'API Reference',
    'best-practices': 'Best Practices',
  },
};

const homeMapping = {
  'overview-home': ['introduction', 'index'],
  'overview-about-agora': ['introduction', 'about-agora'],
  'overview-ai-agents': ['introduction', 'ai-agents'],
  'overview-browse-by-capability': ['introduction', 'browse-by-capability'],
  'overview-choose-your-path': ['introduction', 'choose-your-path'],
  'overview-community-resources': ['introduction', 'community-resources'],
  'overview-fusion-cdn': ['introduction', 'fusion-cdn'],
  'overview-general-account': ['introduction', 'account'],
  'overview-general-members-roles': ['introduction', 'members-roles'],
  'overview-general-projects': ['introduction', 'projects'],
  'overview-general-security-privacy': ['introduction', 'security-privacy'],
  'overview-general-support': ['introduction', 'support'],
  'overview-general-usage-analytics': ['introduction', 'usage-analytics'],
  'overview-media-services': ['introduction', 'media-services'],
  'overview-messaging': ['introduction', 'messaging'],
  'overview-pricing-access': ['introduction', 'pricing-access'],
  'overview-product-matrix': ['introduction', 'product-matrix'],
  'overview-realtime-audio-video': ['introduction', 'realtime-audio-video'],
  'overview-release-notes': ['introduction', 'release-notes'],
  'overview-rtc-server-sdk': ['introduction', 'rtc-server-sdk'],
  'overview-rtm': ['introduction', 'rtm'],
  'overview-rtsa': ['introduction', 'rtsa'],
  'overview-security-compliance': ['introduction', 'security-compliance'],
  'overview-speech-to-text': ['introduction', 'speech-to-text'],
  'overview-start-with-ai': ['introduction', 'start-with-ai'],
  'overview-whiteboard': ['introduction', 'whiteboard'],

  'ai-agent-lifecycle': ['ai', 'agent-lifecycle'],
  'ai-agents-and-realtime-channels': ['ai', 'agents-and-realtime-channels'],
  'ai-choose-your-integration-path': ['ai', 'choose-your-integration-path'],
  'ai-client-component-api': ['ai', 'client-component-api'],
  'ai-configure-asr-and-tts': ['ai', 'configure-asr-and-tts'],
  'ai-configure-presets': ['ai', 'configure-presets'],
  'ai-home': ['ai', 'domain-overview'],
  'ai-mobile-client': ['ai', 'mobile-client'],
  'ai-models-voice-and-context': ['ai', 'models-voice-and-context'],
  'ai-overview': ['ai', 'index'],
  'ai-production-checklist': ['ai', 'production-checklist'],
  'ai-start-with-agent-studio': ['ai', 'start-with-agent-studio'],
  'ai-test-an-agent': ['ai', 'test-an-agent'],
  'ai-web-client': ['ai', 'web-client'],

  'rm-overview': ['realtime-media', 'index'],
  'rm-foundation-realtime': ['realtime-media', 'foundation-realtime'],
  'rm-rtc': ['realtime-media', 'rtc'],
  'rm-rtm': ['realtime-media', 'rtm'],
  'rm-im': ['realtime-media', 'im'],
  'rm-speech-to-text': ['realtime-media', 'speech-to-text'],
  'rm-rtsa': ['realtime-media', 'rtsa'],
  'rm-rtc-server-sdk': ['realtime-media', 'rtc-server-sdk'],
  'rm-fusion-cdn': ['realtime-media', 'fusion-cdn'],
  'rm-whiteboard': ['realtime-media', 'whiteboard'],
  'rm-marketplace': ['realtime-media', 'marketplace'],
  'rm-sdk-extensions': ['realtime-media', 'sdk-extensions'],
  'rm-server-and-extensions': ['realtime-media', 'server-and-extensions'],
  'rm-media-processing-and-distribution': ['realtime-media', 'media-processing-and-distribution'],
  'rm-media-pull': ['realtime-media', 'media-pull'],
  'rm-media-push': ['realtime-media', 'media-push'],
  'rm-recording': ['realtime-media', 'recording'],
  'rm-rtmp-gateway': ['realtime-media', 'rtmp-gateway'],
  'rm-transcoding': ['realtime-media', 'transcoding'],
  'rm-setup-service-and-credentials': ['realtime-media', 'setup-service-and-credentials'],

  'rm-choose-your-product-path': ['solutions', 'index'],
  'ai-device-ai': ['solutions', 'device-ai'],
  'rm-collaboration-and-interaction': ['solutions', 'collaboration-and-interaction'],
  'rm-device-and-industry': ['solutions', 'device-and-industry'],
  'rm-education-classrooms': ['solutions', 'education-classrooms'],
  'rm-live-interaction': ['solutions', 'live-interaction'],
  'rm-meeting': ['solutions', 'meeting'],
  'rm-smart-devices': ['solutions', 'smart-devices'],
  'rm-teleoperation': ['solutions', 'teleoperation'],
  'rm-voip-call': ['solutions', 'voip-call'],

  'rm-analytics': ['best-practices', 'analytics'],
  'rm-billing': ['best-practices', 'billing'],
  'rm-console': ['best-practices', 'console'],
  'rm-governance': ['best-practices', 'governance'],
  'rm-security': ['best-practices', 'security'],
  'rm-status-page': ['best-practices', 'status-page'],
};

const externalMapping = {
  'landing-page': ['ai', 'landing-page'],
  'skills-integrate': ['ai', 'skills-integrate'],
  'mcp-integrate': ['ai', 'mcp-integrate'],
  'resources': ['ai', 'resources'],
  'overview/product-overview': ['ai', 'product-overview'],
  'overview/concepts': ['ai', 'concepts'],
  'overview/billing': ['ai', 'billing'],
  'get-started/enable-service': ['ai', 'enable-service'],
  'get-started/quick-start': ['ai', 'quick-start'],
  'get-started/quick-start-go': ['ai', 'quick-start-go'],
  'get-started/quick-start-java': ['ai', 'quick-start-java'],
  'user-guides/custom-llm': ['ai', 'custom-llm'],
  'user-guides/custom-data': ['ai', 'custom-data'],
  'user-guides/short-term-memory': ['ai', 'short-term-memory'],
  'user-guides/realtime-sub': ['ai', 'realtime-sub'],
  'user-guides/interrupt-agent': ['ai', 'interrupt-agent'],
  'user-guides/send-multimodal-message': ['ai', 'send-multimodal-message'],
  'user-guides/listen-agent-events': ['ai', 'listen-agent-events'],
  'overview/release-notes': ['best-practices', 'release-notes'],
  'user-guides/http-basic-auth': ['best-practices', 'http-basic-auth'],
  'best-practice/audio-settings': ['best-practices', 'audio-settings'],
  'best-practice/opt-latency': ['best-practices', 'opt-latency'],
  'best-practice/geofencing': ['best-practices', 'geofencing'],
  'user-guides/audio-modality': ['realtime-media', 'audio-modality'],
  'operations/start-agent': ['api-reference', 'start-agent'],
  'operations/stop-agent': ['api-reference', 'stop-agent'],
  'operations/agent-update': ['api-reference', 'agent-update'],
  'operations/query-agent-status': ['api-reference', 'query-agent-status'],
  'operations/get-agent-list': ['api-reference', 'get-agent-list'],
  'operations/agent-speak': ['api-reference', 'agent-speak'],
  'operations/agent-interrupt': ['api-reference', 'agent-interrupt'],
  'operations/agent-think': ['api-reference', 'agent-think'],
  'operations/get-history': ['api-reference', 'get-history'],
  'operations/get-turns': ['api-reference', 'get-turns'],
  'api/response-code': ['api-reference', 'response-code'],
  'api/api-limits': ['api-reference', 'api-limits'],
  'api/voice-ids': ['api-reference', 'voice-ids'],
  'webhook/enable-ncs': ['api-reference', 'enable-ncs'],
  'webhook/ncs-events': ['api-reference', 'ncs-events'],
};

const generatedPages = {
  'best-practices': {
    en: `---
title: Best Practices
description: Operational guidance, governance, reliability, and production-readiness practices across the new docs portal.
---

## What belongs here

Use this tab for guidance that improves production quality rather than introducing a product for the first time.

- [Security compliance](/en/introduction/security-compliance)
- [Realtime & Media governance](/en/best-practices/governance)
- [Audio settings](/en/best-practices/audio-settings)
- [Latency optimization](/en/best-practices/opt-latency)
- [Geofencing](/en/best-practices/geofencing)
- [HTTP basic auth](/en/best-practices/http-basic-auth)
- [Release notes](/en/best-practices/release-notes)
`,
    'zh-CN': `---
title: Best Practices
description: 面向生产环境的稳定性、治理、安全与上线实践。
---

## 这里放什么

这个分组承载的是帮助团队更稳定上线和运维的内容，而不是产品首次认知入口。

- [安全合规](/zh-CN/introduction/security-compliance)
- [治理与运维](/zh-CN/best-practices/governance)
- [音频设置](/zh-CN/best-practices/audio-settings)
- [低时延优化](/zh-CN/best-practices/opt-latency)
- [地理围栏](/zh-CN/best-practices/geofencing)
- [HTTP 鉴权](/zh-CN/best-practices/http-basic-auth)
- [发版说明](/zh-CN/best-practices/release-notes)
`,
  },
  'api-reference': {
    en: `---
title: API Reference
description: Lifecycle, control, history, webhook, and status surfaces for the current AI docs experience.
---

## What belongs here

This tab groups the operational APIs and reference pages that were previously spread across the older RESTful docs tree.

- [Start agent](/en/api-reference/start-agent)
- [Stop agent](/en/api-reference/stop-agent)
- [Query agent status](/en/api-reference/query-agent-status)
- [Response codes](/en/api-reference/response-code)
- [Voice IDs](/en/api-reference/voice-ids)
- [Enable webhook](/en/api-reference/enable-ncs)
- [Webhook events](/en/api-reference/ncs-events)
`,
    'zh-CN': `---
title: API Reference
description: 承载智能体生命周期、控制、历史与回调的接口与参考信息。
---

## 这里放什么

这个分组汇总旧 RESTful 文档树中的接口与参考页面。

- [启动智能体](/zh-CN/api-reference/start-agent)
- [停止智能体](/zh-CN/api-reference/stop-agent)
- [查询状态](/zh-CN/api-reference/query-agent-status)
- [响应码](/zh-CN/api-reference/response-code)
- [Voice IDs](/zh-CN/api-reference/voice-ids)
- [启用回调](/zh-CN/api-reference/enable-ncs)
- [回调事件](/zh-CN/api-reference/ncs-events)
`,
  },
};

const tabMeta = {
  'introduction': {
    en: ['index', 'about-agora', 'start-with-ai', 'choose-your-path', 'browse-by-capability', 'product-matrix', '---Capability Domains---', 'ai-agents', 'realtime-audio-video', 'media-services', 'messaging', 'rtm', 'speech-to-text', 'rtsa', 'rtc-server-sdk', 'fusion-cdn', 'whiteboard', '---Platform---', 'account', 'projects', 'members-roles', 'pricing-access', 'usage-analytics', 'security-compliance', 'security-privacy', 'support', 'release-notes', 'community-resources'],
    'zh-CN': ['index', 'about-agora', 'start-with-ai', 'choose-your-path', 'browse-by-capability', 'product-matrix', '---Capability Domains---', 'ai-agents', 'realtime-audio-video', 'media-services', 'messaging', 'rtm', 'speech-to-text', 'rtsa', 'rtc-server-sdk', 'fusion-cdn', 'whiteboard', '---Platform---', 'account', 'projects', 'members-roles', 'pricing-access', 'usage-analytics', 'security-compliance', 'security-privacy', 'support', 'release-notes', 'community-resources'],
  },
  'ai': {
    en: ['index', 'domain-overview', 'product-overview', 'concepts', 'billing', '---Getting Started---', 'enable-service', 'quick-start', 'quick-start-go', 'quick-start-java', 'start-with-agent-studio', 'test-an-agent', 'choose-your-integration-path', '---Build AI Experiences---', 'agent-lifecycle', 'agents-and-realtime-channels', 'models-voice-and-context', 'configure-asr-and-tts', 'configure-presets', 'client-component-api', 'mobile-client', 'web-client', 'production-checklist', 'custom-llm', 'custom-data', 'short-term-memory', 'realtime-sub', 'interrupt-agent', 'send-multimodal-message', 'listen-agent-events', '---Extensions---', 'skills-integrate', 'mcp-integrate', 'resources', 'landing-page'],
    'zh-CN': ['index', 'domain-overview', 'product-overview', 'concepts', 'billing', '---Getting Started---', 'enable-service', 'quick-start', 'quick-start-go', 'quick-start-java', 'start-with-agent-studio', 'test-an-agent', 'choose-your-integration-path', '---Build AI Experiences---', 'agent-lifecycle', 'agents-and-realtime-channels', 'models-voice-and-context', 'configure-asr-and-tts', 'configure-presets', 'client-component-api', 'mobile-client', 'web-client', 'production-checklist', 'custom-llm', 'custom-data', 'short-term-memory', 'realtime-sub', 'interrupt-agent', 'send-multimodal-message', 'listen-agent-events', '---Extensions---', 'skills-integrate', 'mcp-integrate', 'resources', 'landing-page'],
  },
  'realtime-media': {
    en: ['index', 'foundation-realtime', 'rtc', 'rtm', 'im', 'speech-to-text', 'rtsa', 'rtc-server-sdk', 'fusion-cdn', 'whiteboard', 'audio-modality', '---Media Workflows---', 'media-processing-and-distribution', 'media-push', 'media-pull', 'recording', 'transcoding', 'rtmp-gateway', '---Platform Surfaces---', 'marketplace', 'sdk-extensions', 'server-and-extensions', 'setup-service-and-credentials'],
    'zh-CN': ['index', 'foundation-realtime', 'rtc', 'rtm', 'im', 'speech-to-text', 'rtsa', 'rtc-server-sdk', 'fusion-cdn', 'whiteboard', 'audio-modality', '---Media Workflows---', 'media-processing-and-distribution', 'media-push', 'media-pull', 'recording', 'transcoding', 'rtmp-gateway', '---Platform Surfaces---', 'marketplace', 'sdk-extensions', 'server-and-extensions', 'setup-service-and-credentials'],
  },
  'solutions': {
    en: ['index', 'meeting', 'education-classrooms', 'live-interaction', 'voip-call', 'collaboration-and-interaction', 'teleoperation', 'smart-devices', 'device-and-industry', 'device-ai'],
    'zh-CN': ['index', 'meeting', 'education-classrooms', 'live-interaction', 'voip-call', 'collaboration-and-interaction', 'teleoperation', 'smart-devices', 'device-and-industry', 'device-ai'],
  },
  'api-reference': {
    en: ['index', '---Operations---', 'start-agent', 'stop-agent', 'agent-update', 'query-agent-status', 'get-agent-list', 'agent-speak', 'agent-interrupt', 'agent-think', 'get-history', 'get-turns', '---API---', 'response-code', 'api-limits', 'voice-ids', '---Webhook---', 'enable-ncs', 'ncs-events'],
    'zh-CN': ['index', '---Operations---', 'start-agent', 'stop-agent', 'agent-update', 'query-agent-status', 'get-agent-list', 'agent-speak', 'agent-interrupt', 'agent-think', 'get-history', 'get-turns', '---API---', 'response-code', 'api-limits', 'voice-ids', '---Webhook---', 'enable-ncs', 'ncs-events'],
  },
  'best-practices': {
    en: ['index', 'governance', 'security', 'status-page', 'analytics', 'console', 'billing', 'audio-settings', 'opt-latency', 'geofencing', 'http-basic-auth', 'release-notes'],
    'zh-CN': ['index', 'governance', 'security', 'status-page', 'analytics', 'console', 'billing', 'audio-settings', 'opt-latency', 'geofencing', 'http-basic-auth', 'release-notes'],
  },
};

function routeFor(locale, tab, slug) {
  return slug === 'index' ? `/${locale}/${tab}` : `/${locale}/${tab}/${slug}`;
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function writeFile(targetPath, content) {
  if (dryRun) {
    return;
  }

  ensureDir(path.dirname(targetPath));
  writeFileSync(targetPath, content);
}

function listMarkdownBasenames(dir) {
  return readdirSync(dir)
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => entry.slice(0, -3))
    .sort();
}

function buildRouteMaps() {
  const pageIdRouteMap = new Map();
  const externalPathRouteMap = new Map();

  for (const locale of locales) {
    for (const [key, [tab, slug]] of Object.entries(homeMapping)) {
      pageIdRouteMap.set(`${locale}:home:${key}`, routeFor(locale, tab, slug));
    }

    for (const [key, [tab, slug]] of Object.entries(externalMapping)) {
      const route = routeFor(locale, tab, slug);
      pageIdRouteMap.set(`${locale}:external:${key}`, route);
      externalPathRouteMap.set(`${locale}:${key}`, route);
    }
  }

  return { pageIdRouteMap, externalPathRouteMap };
}

const { pageIdRouteMap, externalPathRouteMap } = buildRouteMaps();

function resolveLegacyQueryUrl(url, locale) {
  const parsed = new URL(`https://docs-portal.local${url}`);
  const page = parsed.searchParams.get('page');
  const tab = parsed.searchParams.get('tab');
  const domain = parsed.searchParams.get('domain');

  if (page && homeMapping[page]) {
    return pageIdRouteMap.get(`${locale}:home:${page}`) ?? url;
  }

  if (page?.startsWith('ai-doc:docs:')) {
    const key = page.replace('ai-doc:docs:', '');
    return pageIdRouteMap.get(`${locale}:external:${key}`) ?? url;
  }

  if (page?.startsWith('overview-doc:docs:')) {
    const key = page.replace('overview-doc:docs:', '');
    return pageIdRouteMap.get(`${locale}:external:${key}`) ?? url;
  }

  const aliases = {
    'ai-quickstart': routeFor(locale, 'ai', 'quick-start'),
    'ai-agent': routeFor(locale, 'ai', 'agent-lifecycle'),
    'rtc-home': routeFor(locale, 'realtime-media', 'index'),
    'messaging-home': routeFor(locale, 'introduction', 'messaging'),
    'media-home': routeFor(locale, 'introduction', 'media-services'),
    'platform-overview': routeFor(locale, 'introduction', 'index'),
    'reference-api': routeFor(locale, 'api-reference', 'index'),
    'reference-security': routeFor(locale, 'introduction', 'security-compliance'),
  };

  if (page && aliases[page]) {
    return aliases[page];
  }

  if (tab && !page) {
    const tabAliases = {
      'overview': routeFor(locale, 'introduction', 'index'),
      'ai': routeFor(locale, 'ai', 'index'),
      'realtime-media': routeFor(locale, 'realtime-media', 'index'),
      'solutions': routeFor(locale, 'solutions', 'index'),
      'api-reference': routeFor(locale, 'api-reference', 'index'),
      'best-practices': routeFor(locale, 'best-practices', 'index'),
    };

    return tabAliases[tab] ?? url;
  }

  if (domain === 'ai' && page === 'ai-home') {
    return routeFor(locale, 'ai', 'domain-overview');
  }

  return url;
}

function resolveLegacyUrl(url, locale) {
  if (url.startsWith('/?')) {
    return resolveLegacyQueryUrl(url, locale);
  }

  if (url.startsWith('/docs/convoai/restful/')) {
    const key = url.replace('/docs/convoai/restful/', '');
    return externalPathRouteMap.get(`${locale}:${key}`) ?? url;
  }

  if (url === '/docs/toybox/iot/overview') {
    return routeFor(locale, 'solutions', 'device-ai');
  }

  return url;
}

function rewriteLinks(content, locale) {
  return content.replace(/\/[A-Za-z0-9?=&._~:/#%-]+/g, (match) => {
    return resolveLegacyUrl(match, locale);
  });
}

function validateHomeCoverage() {
  for (const locale of locales) {
    const basenames = listMarkdownBasenames(path.join(homeDir, locale));
    const uncovered = basenames.filter((name) => !(name in homeMapping));
    if (uncovered.length > 0) {
      throw new Error(`Uncovered home content for ${locale}: ${uncovered.join(', ')}`);
    }
  }
}

function validateExternalCoverage() {
  const metaPath = path.join(externalDir, 'meta.json');
  const externalMeta = JSON.parse(readFileSync(metaPath, 'utf8'));
  const uncovered = externalMeta.pages.filter((name) => !(name in externalMapping));

  if (uncovered.length > 0) {
    throw new Error(`Uncovered external docs: ${uncovered.join(', ')}`);
  }
}

function resetOutput() {
  if (dryRun) {
    return;
  }

  rmSync(outputDir, { force: true, recursive: true });
  ensureDir(outputDir);
}

function writeLocaleRootMeta(locale) {
  const localeDir = path.join(outputDir, locale);
  ensureDir(localeDir);
  writeFile(
    path.join(localeDir, 'meta.json'),
    `${JSON.stringify({ pages: tabOrder }, null, 2)}\n`,
  );
}

function writeTabMeta(locale, tab) {
  const meta = {
    title: titles[locale][tab],
    root: true,
    pages: tabMeta[tab][locale],
  };

  writeFile(
    path.join(outputDir, locale, tab, 'meta.json'),
    `${JSON.stringify(meta, null, 2)}\n`,
  );
}

function sourceToOutputPath(locale, tab, slug) {
  return slug === 'index'
    ? path.join(outputDir, locale, tab, 'index.md')
    : path.join(outputDir, locale, tab, `${slug}.md`);
}

function migrateHomeContent() {
  for (const locale of locales) {
    for (const basename of listMarkdownBasenames(path.join(homeDir, locale))) {
      const [tab, slug] = homeMapping[basename];
      const sourcePath = path.join(homeDir, locale, `${basename}.md`);
      const outputPath = sourceToOutputPath(locale, tab, slug);
      const content = readFileSync(sourcePath, 'utf8');

      writeFile(outputPath, rewriteLinks(content, locale));
    }
  }
}

function migrateExternalContent() {
  for (const locale of locales) {
    for (const [key, [tab, slug]] of Object.entries(externalMapping)) {
      const sourcePath = path.join(externalDir, `${key}.md`);
      const outputPath = sourceToOutputPath(locale, tab, slug);
      const content = readFileSync(sourcePath, 'utf8');

      writeFile(outputPath, rewriteLinks(content, locale));
    }
  }
}

function writeGeneratedPages() {
  for (const locale of locales) {
    for (const [tab, contentByLocale] of Object.entries(generatedPages)) {
      const outputPath = sourceToOutputPath(locale, tab, 'index');
      const hasExistingHomeSource = Object.values(homeMapping).some(
        ([mappedTab, slug]) => mappedTab === tab && slug === 'index',
      );

      if (hasExistingHomeSource && tab !== 'api-reference' && tab !== 'best-practices') {
        continue;
      }

      writeFile(outputPath, contentByLocale[locale]);
    }
  }
}

function printSummary() {
  const summary = {
    dryRun,
    homeCount: Object.keys(homeMapping).length,
    externalCount: Object.keys(externalMapping).length,
    tabs: tabOrder,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

function main() {
  validateHomeCoverage();
  validateExternalCoverage();
  resetOutput();

  for (const locale of locales) {
    writeLocaleRootMeta(locale);
    for (const tab of tabOrder) {
      writeTabMeta(locale, tab);
    }
  }

  migrateHomeContent();
  migrateExternalContent();
  writeGeneratedPages();
  printSummary();
}

main();
