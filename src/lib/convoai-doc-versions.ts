import {
  CONVOAI_API_PAGES,
  CONVOAI_GUIDE_PAGES,
} from '../generated/convoai-doc-pages';

const GUIDE_ROOT = '/en/ai';
const API_ROOT = '/en/api-reference/api-ref/conversational-ai';
const SDK_ROOT = '/en/api-reference/api-ref/server-sdk';

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
    entryLinks: [GUIDE_ROOT],
    defaultVersion: 'v1',
    previousVersion: 'v1',
    sharedUrls: [`${GUIDE_ROOT}/reference/pricing`],
    previewMessage:
      "You're reading the Conversational AI Platform (Preview) docs.",
    versions: [
      {
        id: 'v1',
        label: 'Main',
        description: 'Voice Agent API',
        rootUrl: GUIDE_ROOT,
        restrictToMappedPages: true,
        pages: guideTopics(CONVOAI_GUIDE_PAGES.voice),
      },
      {
        id: 'v2',
        label: 'Preview',
        description: 'Conversational AI Platform',
        status: 'preview',
        rootUrl: `${GUIDE_ROOT}/platform`,
        restrictToMappedPages: true,
        navigationUrls: ['python', 'typescript', 'go'].map(
          (language) =>
            `/en/api-reference/api-ref/server-sdk/platform/${language}`,
        ),
        pages: guideTopics(CONVOAI_GUIDE_PAGES.platform),
      },
    ],
  },
  {
    id: 'convoai-api',
    label: 'Conversational AI API',
    preferenceKey: 'convoai',
    entryUrl: `${API_ROOT}/documentation-versions`,
    entryLinks: [API_ROOT],
    catalog: {
      rootUrl: '/en/api-reference',
      sectionId: 'separator-Voice Agents',
    },
    defaultVersion: 'v1',
    previousVersion: 'v1',
    previewMessage:
      "You're reading the Conversational AI Platform (Preview) docs.",
    versions: [
      {
        id: 'v1',
        label: 'Main',
        description: 'Voice Agent API',
        rootUrl: API_ROOT,
        restrictToMappedPages: true,
        pages: apiTopics(CONVOAI_API_PAGES.voice, 'voice'),
      },
      {
        id: 'v2',
        label: 'Preview',
        description: 'Conversational AI Platform',
        status: 'preview',
        rootUrl: `${API_ROOT}/platform`,
        restrictToMappedPages: true,
        pages: apiTopics(CONVOAI_API_PAGES.platform, 'platform'),
      },
    ],
  },
  {
    id: 'convoai-sdk',
    label: 'Voice Agents SDK reference',
    preferenceKey: 'convoai',
    entryUrl: `${SDK_ROOT}/documentation-versions`,
    defaultVersion: 'v1',
    previousVersion: 'v1',
    previewMessage:
      "You're reading the Conversational AI Platform (Preview) SDK docs.",
    versions: [
      {
        id: 'v1',
        label: 'Main',
        description: 'Voice Agent API',
        rootUrl: SDK_ROOT,
        restrictToMappedPages: true,
        pages: {
          overview: 'python',
          python: 'python',
          typescript: 'typescript',
          go: 'go',
        },
      },
      {
        id: 'v2',
        label: 'Preview',
        description: 'Conversational AI Platform',
        status: 'preview',
        rootUrl: `${SDK_ROOT}/platform`,
        restrictToMappedPages: true,
        pages: {
          overview: 'python',
          python: 'python',
          typescript: 'typescript',
          go: 'go',
        },
      },
    ],
  },
] as const;
