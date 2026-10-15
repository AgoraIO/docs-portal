import type { PublishedDocsRoute } from '../published-docs-routes';
import type { SearchSection } from '../search/kb-record';
import { createKbDocument, type KbCorpus, requireText } from './corpus';

export async function buildKbCorpus(input: {
  routes: PublishedDocsRoute[];
  sections: SearchSection[];
  scope: string;
  revision: string;
  selectedSourceIds?: string[];
  readMarkdown: (path: string) => Promise<string>;
}): Promise<KbCorpus> {
  const scope = requireText(input.scope, 'scope');
  const revision = requireText(input.revision, 'revision');
  const routes = new Map<string, PublishedDocsRoute>();
  for (const route of input.routes) {
    if (routes.has(route.url)) throw new Error('Duplicate published route');
    routes.set(route.url, route);
  }
  const groups = new Map<string, SearchSection[]>();
  for (const section of input.sections) {
    if (
      section.hidden ||
      section.status === 'internal' ||
      section.locale !== 'zh-CN'
    )
      continue;
    const url = section.url.split('#')[0];
    if (!routes.has(url)) throw new Error(`Missing published route: ${url}`);
    const group = groups.get(url) ?? [];
    group.push(section);
    groups.set(url, group);
  }
  let identities = [...groups.keys()].sort();
  let selection: string[] | undefined;
  if (input.selectedSourceIds !== undefined) {
    if (
      !Array.isArray(input.selectedSourceIds) ||
      !input.selectedSourceIds.length
    )
      throw new Error('Selection must not be empty');
    selection = [...new Set(input.selectedSourceIds)].sort();
    for (const id of selection)
      if (!groups.has(id))
        throw new Error(`Selected source not published: ${id}`);
    identities = selection;
  }
  if (!identities.length) throw new Error('No published KB documents');
  const documents = [];
  for (const id of identities) {
    const route = routes.get(id)!;
    const sections = groups.get(id)!;
    const first = sections[0];
    const metadataFor = (section: SearchSection) => ({
      url: id,
      canonicalUrl: route.canonicalPath,
      title: section.pageTitle,
      locale: 'zh-CN' as const,
      products: section.products ?? (section.product ? [section.product] : []),
      platforms: route.platform ? [route.platform] : (section.platform ?? []),
      defaultPlatform: route.defaultPlatform ?? section.defaultPlatform,
      version: route.version ?? section.version,
      docType: section.docType,
      sections: [],
    });
    const base = createKbDocument({
      content: 'metadata consistency check',
      metadata: metadataFor(first),
    });
    for (const section of sections) {
      if (
        (section.canonicalUrl &&
          section.canonicalUrl !== route.canonicalPath) ||
        (route.platform &&
          section.platform &&
          !section.platform.includes(route.platform))
      )
        throw new Error(`Conflicting page metadata: ${id}`);
      if (
        createKbDocument({
          content: 'metadata consistency check',
          metadata: metadataFor(section),
        }).hash !== base.hash
      )
        throw new Error(`Conflicting page metadata: ${id}`);
    }
    documents.push(
      createKbDocument({
        content: await input.readMarkdown(route.markdownPath),
        metadata: {
          ...base.metadata,
          sections: sections.map((section) => ({
            title: section.sectionTitle,
            url: section.url,
            headingPath: section.headingPath,
          })),
        },
      }),
    );
  }
  return {
    schema: 1,
    scope,
    revision,
    complete: true,
    ...(selection ? { selection } : {}),
    documents,
  };
}
