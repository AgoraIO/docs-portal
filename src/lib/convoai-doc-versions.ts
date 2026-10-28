import {
  CONVOAI_API_PAGES,
  CONVOAI_GUIDE_PAGES,
} from '../generated/convoai-doc-pages';

const GUIDE_ROOT = '/en/ai';
const API_ROOT = '/en/api-reference/api-ref/conversational-ai';

function guideTopics(paths: readonly string[]) {
  const aliases: Record<string, string> = {
    'build/start-stop-agent': 'start-session-guide',
    'get-started/start-stop-agent': 'start-session-guide',
    'build/shape-the-conversation/custom-information':
      'personalize-conversations',
    'build/shape-the-conversation/personalize-conversations':
      'personalize-conversations',
  };
  return Object.fromEntries(
    paths.map((path) => [aliases[path] ?? (path || 'overview'), path]),
  );
}

function apiTopics(paths: readonly string[], edition: string) {
  // Operation equivalence needs content/engineering review. Until then, only
  // overview/authentication/status topics map; operations use overview fallback.
  return Object.fromEntries(
    paths.map((path) => [
      !path
        ? 'overview'
        : ['authentication', 'status-codes'].includes(path)
          ? path
          : `${edition}:${path}`,
      path,
    ]),
  );
}

export const CONVOAI_DOC_VERSION_SCOPES = [
  {
    id: 'convoai-guides',
    label: 'Conversational AI',
    preferenceKey: 'convoai',
    entryUrl: `${GUIDE_ROOT}/documentation-versions`,
    defaultVersion: 'v2',
    previousVersion: 'v1',
    sharedUrls: [`${GUIDE_ROOT}/reference/pricing`],
    versions: [
      {
        id: 'v2',
        label: 'Platform',
        status: 'preview',
        rootUrl: `${GUIDE_ROOT}/platform`,
        restrictToMappedPages: true,
        pages: guideTopics(CONVOAI_GUIDE_PAGES.platform),
      },
      {
        id: 'v1',
        label: 'Voice Agent API',
        rootUrl: GUIDE_ROOT,
        restrictToMappedPages: true,
        pages: guideTopics(CONVOAI_GUIDE_PAGES.voice),
      },
    ],
  },
  {
    id: 'convoai-api',
    label: 'Conversational AI API',
    preferenceKey: 'convoai',
    entryUrl: `${API_ROOT}/documentation-versions`,
    defaultVersion: 'v2',
    previousVersion: 'v1',
    versions: [
      {
        id: 'v2',
        label: 'Platform',
        status: 'preview',
        rootUrl: `${API_ROOT}/platform`,
        restrictToMappedPages: true,
        pages: apiTopics(CONVOAI_API_PAGES.platform, 'platform'),
      },
      {
        id: 'v1',
        label: 'Voice Agent API',
        rootUrl: API_ROOT,
        restrictToMappedPages: true,
        pages: apiTopics(CONVOAI_API_PAGES.voice, 'voice'),
      },
    ],
  },
] as const;
