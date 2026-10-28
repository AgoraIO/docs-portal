import type { DocsMeta } from '../docs-meta-schema';
import { createCnSdkPublicationPolicy } from './cn-sdk-publication';

// Bundle maintained metadata into both the application and static payload job.
// Deployment requests must not depend on a source checkout on disk.
const metadata = import.meta.glob<DocsMeta>(
  '/content/docs/zh-CN/api-reference/**/meta.json',
  { eager: true, import: 'default' },
);

export const resolveCnSdkPublication = createCnSdkPublicationPolicy(
  Object.entries(metadata).map(([filename, meta]) => ({
    scopeUrl: filename
      .replace('/content/docs', '')
      .replace(/\/meta\.json$/, '')
      .split('/')
      .filter((segment) => !/^\(.+\)$/.test(segment))
      .join('/'),
    navScope: meta.navScope,
  })),
);
