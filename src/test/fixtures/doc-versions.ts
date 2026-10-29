import type { DocVersionScope } from '@/lib/doc-versions';

// Test-only registrations; never import this module into application code.
const DEMO_ROOT = '/en/api-reference/versioning-demo';
const GUIDE_DEMO_ROOT = '/en/introduction/versioning-demo';

/** Any Markdown/MDX or generated reference group can opt into documentation versions. */
export const TEST_DOC_VERSION_SCOPES: readonly DocVersionScope[] = [
  {
    id: 'test-api',
    label: 'Test API',
    entryUrl: DEMO_ROOT,
    preferenceKey: 'convoai-v3',
    defaultVersion: 'v2',
    previousVersion: 'v1',
    versions: [
      {
        id: 'v1',
        label: 'Previous docs',
        rootUrl: `${DEMO_ROOT}/v1`,
        pages: {
          overview: '',
          authentication: 'authentication',
          widgets: 'widgets',
          legacy: 'legacy-notes',
        },
      },
      {
        id: 'v2',
        label: 'New docs',
        status: 'preview',
        rootUrl: `${DEMO_ROOT}/v2`,
        pages: {
          overview: '',
          authentication: 'authentication',
          widgets: 'list-widgets',
          migration: 'migration',
        },
      },
    ],
  },
  {
    id: 'test-guides',
    label: 'Guide demo',
    entryUrl: GUIDE_DEMO_ROOT,
    preferenceKey: 'convoai-v3',
    defaultVersion: 'v2',
    previousVersion: 'v1',
    versions: [
      {
        id: 'v2',
        label: 'New docs',
        status: 'preview',
        rootUrl: `${GUIDE_DEMO_ROOT}/new`,
        pages: { overview: '', setup: 'configure' },
      },
      {
        id: 'v1',
        label: 'Previous docs',
        rootUrl: `${GUIDE_DEMO_ROOT}/previous`,
        pages: { overview: '', setup: 'setup' },
      },
    ],
  },
];
