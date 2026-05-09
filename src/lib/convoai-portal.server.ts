import convoaiMeta from '../../external/docs-cortex/raw/docs/convoai/restful/meta.json';
import { getPageMarkdownUrl, source } from './source';

export type PortalDoc = {
  description: string;
  markdownUrl: string;
  pageKey: string;
  path: string;
  routePath: string;
  title: string;
};

export type PortalTab = {
  docs: PortalDoc[];
  key: string;
  label: string;
};

const topTabLabelMap: Record<string, string> = {
  docs: '文档',
  skillmcp: 'Skill&MCP',
  sdks: 'SDKs',
  recepies: 'Recepies',
  reference: '参考',
  api: 'API',
  other: '其他',
};

const tabOrder = [
  'docs',
  'skillmcp',
  'sdks',
  'recepies',
  'reference',
  'api',
  'other',
] as const;

const tabKeyMap: Record<string, string> = {
  'landing-page': 'docs',
  overview: 'docs',
  'get-started': 'docs',
  'user-guides': 'docs',
  'best-practice': 'docs',
  api: 'api',
  operations: 'api',
  webhook: 'api',
  'skills-integrate': 'skillmcp',
  'mcp-integrate': 'skillmcp',
  resources: 'reference',
};

const pageKeyOverrides: Record<string, string> = {
  'get-started/quick-start-go': 'sdks',
  'get-started/quick-start-java': 'sdks',
  'user-guides/realtime-sub': 'recepies',
  'user-guides/audio-modality': 'recepies',
  'user-guides/short-term-memory': 'recepies',
  'user-guides/interrupt-agent': 'recepies',
  'user-guides/send-multimodal-message': 'recepies',
  'user-guides/listen-agent-events': 'recepies',
};

export async function loadConvoaiPortalData(): Promise<PortalTab[]> {
  const itemsByTab = new Map<string, PortalDoc[]>(
    [...tabOrder].map((key) => [key, []]),
  );
  const pages = convoaiMeta.pages as string[];

  for (const pageKey of pages) {
    const slugs = ['convoai', 'restful', ...pageKey.split('/')];
    const page = source.getPage(slugs);

    const title = page?.data.title ?? humanizePageTitle(pageKey);
    const description = page?.data.description ?? '';

    const tabKey = resolveTabKey(pageKey);
    const doc: PortalDoc = {
      description,
      markdownUrl: page ? getPageMarkdownUrl(page).url : '',
      pageKey,
      path: page?.path ?? `/docs/convoai/restful/${pageKey}`,
      routePath: `/docs/convoai/restful/${pageKey}`,
      title,
    };

    itemsByTab.get(tabKey)?.push(doc);
  }

  return [...tabOrder]
    .map((key) => ({
      docs: itemsByTab.get(key) ?? [],
      key,
      label: topTabLabelMap[key] ?? key,
    }))
    .filter((tab) => tab.docs.length > 0);
}

function resolveTabKey(pageKey: string) {
  const overridden = pageKeyOverrides[pageKey];
  if (overridden) {
    return overridden;
  }

  const rawGroupKey = pageKey.includes('/') ? pageKey.split('/')[0] : pageKey;
  return tabKeyMap[rawGroupKey] ?? 'other';
}

function humanizePageTitle(page: string) {
  const segment = page.split('/').at(-1) ?? page;
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
