import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import GithubSlugger from 'github-slugger';
import { load as loadYaml } from 'js-yaml';
import type { Heading, RootContent } from 'mdast';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import type { DocsHttpMethodMetadata } from './docs-http-method';
import { loadDocsPagePayload } from './docs-page.server';
import type { DocsSidebarNode, DocsSidebarPageNode } from './docs-tree';
import { resolveOpenApiEndpointRoute } from './openapi/lanes';
import { getOpenApiOperation } from './openapi/source.server';
import { extractStructuredPlatformTabs } from './platforms/processed-text';
import { source } from './source.server';

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory()
      ? files(path)
      : /\.mdx?$/.test(path)
        ? [path]
        : [];
  });
}
function flatten(nodes: DocsSidebarNode[]): DocsSidebarPageNode[] {
  return nodes.flatMap((node) =>
    node.type === 'page' ? [node] : flatten(node.children),
  );
}
const references = files('content/docs/en/api-reference/api-ref');
const examplesOnly =
  /\/(?:authentication|restful-authentication|how-to-call-api|signature-algorithm)\.mdx?$/;
const declaration =
  /(?:^|\n|`)(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(?:https?:\/\/|\/)|\bMethod:\s*`?(?:GET|POST|PUT|PATCH|DELETE)\b|(?:-X|--request)\s*["']?(?:GET|POST|PUT|PATCH|DELETE)\b/;

function headingText(node: RootContent): string {
  if ('value' in node) return String(node.value);
  return 'children' in node
    ? node.children.map((child) => headingText(child as RootContent)).join('')
    : '';
}

// Read request declarations independently of the frontmatter and sidebar code.
// Catch newly added endpoints as well as entirely unannotated reference pages.
function declaredOperationFragments(text: string, file: string): string[] {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
  const tree = unified().use(remarkParse).use(remarkMdx).parse(body);
  const headings: (Heading & { title: string; fragment: string })[] = [];
  const slugger = new GithubSlugger();
  visit(tree, 'heading', (node) => {
    const title = headingText(node);
    headings.push({ ...node, title, fragment: slugger.slug(title) });
  });
  const maxDepth =
    /flexible-classroom|agora-analytics|push-notification-management/.test(file)
      ? 3
      : 2;
  const supportingHeading =
    /^(?:HTTP (?:request|response)(?: example)?|(?:Request|Response)(?: (?:parameters|headers?|bod(?:y|ies)|examples?))?|(?:Path|Query) parameters?|Body|Authorization|Common parameters|Examples?|Prototype|Endpoint|Basic information|Data format|API limits|Server|Authentication|Rate limits|Status codes|Ensure service reliability|[0-9]{3})$/i;
  const requests =
    /(?:^|\n|`)(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(?:https?:\/\/|\/)|\bMethod:\s*`?(?:GET|POST|PUT|PATCH|DELETE)\b|(?:-X|--request)\s*["']?(?:GET|POST|PUT|PATCH|DELETE)\b/g;
  return [
    ...new Set(
      [...body.matchAll(requests)].flatMap((match) => {
        const heading = headings
          .filter(
            (heading) =>
              (heading.position?.start.offset ?? 0) <= (match.index ?? 0) &&
              heading.depth <= maxDepth &&
              !supportingHeading.test(heading.title),
          )
          .at(-1);
        return heading ? [heading.fragment] : [];
      }),
    ),
  ];
}

describe('complete English REST method coverage', () => {
  it('requires method metadata on every REST reference with HTTP request declarations', () => {
    const missing = references.filter((file) => {
      const text = readFileSync(file, 'utf8');
      return (
        !examplesOnly.test(file) &&
        declaration.test(text) &&
        !/^httpMethods?:/m.test(text)
      );
    });
    expect(missing).toEqual([]);
  });

  it('requires an explicit method for each operation section, including future additions', () => {
    const missing: string[] = [];
    for (const file of references.filter((file) => !examplesOnly.test(file))) {
      const text = readFileSync(file, 'utf8');
      if (!declaration.test(text)) continue;
      const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
      const metadata = loadYaml(frontmatter) as DocsHttpMethodMetadata;
      if (metadata.httpMethod) continue;
      for (const fragment of declaredOperationFragments(text, file)) {
        if (!Object.hasOwn(metadata.httpMethods ?? {}, fragment))
          missing.push(`${file}#${fragment}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('resolves every declared operation to a labeled sidebar destination, including platform variants', async () => {
    const pages = source
      .getPages('en')
      .filter(
        (page) =>
          page.type === 'docs' &&
          (page.data.httpMethod || page.data.httpMethods),
      );
    const audit: unknown[] = [];
    const generated: unknown[] = [];
    const failures: string[] = [];
    for (const page of pages) {
      if (page.type !== 'docs') continue;
      const text = await page.data.getText('processed');
      const platforms = extractStructuredPlatformTabs(text)?.platforms;
      const variants = platforms ?? [undefined];
      const found = new Set<string>();
      const operations: {
        fragment?: string;
        method: string;
        title: string;
        url: string;
        platform?: string;
      }[] = [];
      for (const platform of variants) {
        const [locale, tab, ...slugs] = page.url.slice(1).split('/');
        const result = await loadDocsPagePayload(
          locale,
          tab,
          platform ? [...slugs, platform] : slugs,
        );
        if (!result || 'redirectUrl' in result) {
          // Retained migration sources can be published only through a canonical reference.
          if (platform === variants[0])
            audit.push({
              url: page.url,
              redirect:
                result && 'redirectUrl' in result ? result.redirectUrl : null,
            });
          continue;
        }
        const nodes = flatten(result.sidebar);
        const expected = page.data.httpMethod
          ? [[undefined, page.data.httpMethod] as const]
          : Object.entries(page.data.httpMethods ?? {});
        for (const [fragment, method] of expected) {
          const url = page.url + (fragment ? `#${fragment}` : '');
          const node = nodes.find(
            (node) => node.url === url && node.method === method,
          );
          if (!node) continue;
          found.add(fragment ?? '');
          if (!operations.some((op) => op.fragment === fragment))
            operations.push({
              fragment,
              method,
              title: node.title,
              url,
              platform: node.href?.split('#')[0].split('/').at(-1),
            });
        }
        if (platform && platform !== 'web') {
          const platformNodes = nodes.filter(
            (node) => node.url.startsWith(`${page.url}#`) && node.method,
          );
          expect(
            platformNodes.length,
            `${page.url}/${platform}`,
          ).toBeGreaterThan(0);
          expect(
            platformNodes.every(
              (node) => node.href?.split('#')[0] === `${page.url}/${platform}`,
            ),
          ).toBe(true);
        }
      }
      const declared = page.data.httpMethod
        ? ['']
        : Object.keys(page.data.httpMethods ?? {});
      const redirected = audit.some(
        (item) => (item as { url: string; redirect?: string }).url === page.url,
      );
      if (!redirected)
        for (const key of declared)
          if (!found.has(key)) failures.push(`${page.url}#${key}`);
      if (!redirected)
        audit.push({
          url: page.url,
          title: page.data.title,
          source: page.path,
          operations,
        });
    }
    for (const page of source
      .getPages('en')
      .filter((page) => page.type === 'openapi')) {
      const [, tab, ...slugs] = page.url.slice(1).split('/');
      const route = resolveOpenApiEndpointRoute('en', tab, slugs);
      if (!route) {
        failures.push(page.url);
        continue;
      }
      const operation = await getOpenApiOperation(
        route.lane,
        route.operationId,
        'en',
      );
      const result = await loadDocsPagePayload('en', tab, slugs);
      if (!result || 'redirectUrl' in result) {
        failures.push(page.url);
        continue;
      }
      if (
        !flatten(result.sidebar).some(
          (node) => node.url === page.url && node.method === operation.method,
        )
      )
        failures.push(page.url);
      generated.push({
        url: page.url,
        title: page.data.title,
        method: operation.method,
        lane: route.lane.id,
      });
    }
    if (process.env.REST_METHOD_AUDIT_OUTPUT) {
      mkdirSync(dirname(process.env.REST_METHOD_AUDIT_OUTPUT), {
        recursive: true,
      });
      writeFileSync(
        process.env.REST_METHOD_AUDIT_OUTPUT,
        JSON.stringify({ pages: audit, generated, missing: failures }, null, 2),
      );
    }
    expect(failures).toEqual([]);
  }, 120000);
});
