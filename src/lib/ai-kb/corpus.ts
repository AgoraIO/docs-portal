import { createHash } from 'node:crypto';

export type KbMetadata = {
  url: string;
  canonicalUrl: string;
  title: string;
  locale: 'zh-CN';
  products: string[];
  platforms: string[];
  defaultPlatform?: string;
  version?: string;
  docType: 'docs' | 'openapi';
  sections: { title: string; url: string; headingPath: string[] }[];
};
export type KbDocument = {
  sourceId: string;
  content: string;
  metadata: KbMetadata;
  hash: string;
};
export type KbCorpus = {
  schema: 1;
  scope: string;
  revision: string;
  complete: boolean;
  /** Absent for full export; explicit selected identity set for sample exports. */
  selection?: string[];
  documents: KbDocument[];
};

export function requireText(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`Invalid ${name}: expected nonempty string`);
  return value;
}

export function assertKbPath(value: unknown): asserts value is string {
  const path = requireText(value, 'CN document path');
  if (
    !/^\/zh-CN\/(realtime-media|introduction|api-reference|solutions|ai|reference)(\/[^?#\\\s]+)?$/.test(
      path,
    )
  )
    throw new Error('Invalid CN document path');
  const segments = path.split('/').slice(1);
  for (const segment of segments) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      throw new Error('Invalid encoded CN document path');
    }
    if (
      !decoded ||
      decoded === '.' ||
      decoded === '..' ||
      /[/\\?#\s%]/.test(decoded) ||
      Array.from(decoded).some((character) => character.charCodeAt(0) < 32)
    )
      throw new Error('Invalid CN document path segment');
  }
}

function stringSet(value: unknown, name: string): string[] {
  if (!Array.isArray(value)) throw new Error(`Invalid ${name}`);
  return [...new Set(value.map((item) => requireText(item, name)))].sort();
}

export function createKbDocument(input: {
  content: string;
  metadata: KbMetadata;
}): KbDocument {
  if (!input || typeof input !== 'object') throw new Error('Invalid document');
  const content = requireText(input.content, 'content')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n');
  const m = input.metadata;
  if (!m || typeof m !== 'object') throw new Error('Invalid metadata');
  assertKbPath(m.url);
  assertKbPath(m.canonicalUrl);
  if (m.locale !== 'zh-CN' || !['docs', 'openapi'].includes(m.docType))
    throw new Error('Invalid locale or document type');
  if (!Array.isArray(m.sections)) throw new Error('Invalid sections');
  const sections = m.sections
    .map((section) => {
      if (!section || typeof section !== 'object')
        throw new Error('Invalid section');
      const url = requireText(section.url, 'section URL');
      const [page, anchor, extra] = url.split('#');
      if (page !== m.url || extra !== undefined || anchor === '')
        throw new Error('Section must reference its own document');
      if (!Array.isArray(section.headingPath) || !section.headingPath.length)
        throw new Error('Invalid section heading path');
      return {
        title: requireText(section.title, 'section title'),
        url,
        headingPath: section.headingPath.map((item) =>
          requireText(item, 'heading'),
        ),
      };
    })
    .sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
  if (new Set(sections.map((section) => section.url)).size !== sections.length)
    throw new Error('Duplicate section URL');
  const metadata: KbMetadata = {
    url: m.url,
    canonicalUrl: m.canonicalUrl,
    title: requireText(m.title, 'title'),
    locale: 'zh-CN',
    products: stringSet(m.products, 'products'),
    platforms: stringSet(m.platforms, 'platforms'),
    ...(m.defaultPlatform !== undefined
      ? { defaultPlatform: requireText(m.defaultPlatform, 'default platform') }
      : {}),
    ...(m.version !== undefined
      ? { version: requireText(m.version, 'version') }
      : {}),
    docType: m.docType,
    sections,
  };
  const hash = createHash('sha256')
    .update(JSON.stringify({ schema: 1, content, metadata }))
    .digest('hex');
  return { sourceId: metadata.url, content, metadata, hash };
}
