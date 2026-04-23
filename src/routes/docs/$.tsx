import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import browserCollections from 'collections/browser';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { source as docsSource } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { Suspense } from 'react';
import { getMDXComponents } from '@/components/mdx';
import { useBaseLayoutOptions } from '@/lib/layout.shared';

const legacyRootSections = new Set([
  'api',
  'best-practice',
  'get-started',
  'operations',
  'overview',
  'user-guides',
  'webhook',
]);

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await loader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

const loader = createServerFn({
  method: 'GET',
})
  .inputValidator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const { getPageMarkdownUrl, source } = await import('@/lib/source');
    const resolvedPage =
      resolvePage(source, slugs) ?? resolveLegacyPage(source, slugs);

    const page = resolvedPage?.page;
    if (!page) {
      if (slugs.length === 0) {
        const firstPage = source.getPages()[0];
        if (firstPage) {
          throw redirect({
            to: '/docs/$',
            params: {
              _splat: firstPage.slugs.join('/'),
            },
          });
        }
      }
      throw notFound();
    }

    return {
      path: page.path,
      markdownUrl: getPageMarkdownUrl(page).url,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    // you can define props for the component
    {
      markdownUrl,
      path: _path,
    }: {
      markdownUrl: string;
      path: string;
    },
  ) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl="#" />
        </div>
        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const { pageTree, path, markdownUrl } = useFumadocsLoader(
    Route.useLoaderData(),
  );
  const options = useBaseLayoutOptions();

  return (
    <DocsLayout {...options} tabs={false} tree={pageTree}>
      <Link to={markdownUrl} hidden />
      <Suspense>
        {clientLoader.useContent(path, { markdownUrl, path })}
      </Suspense>
    </DocsLayout>
  );
}

function resolvePage(
  source: typeof docsSource,
  slugs: string[],
) {
  const page = source.getPage(slugs);
  if (!page) {
    return null;
  }

  return {
    page,
  };
}

function resolveLegacyPage(
  source: typeof docsSource,
  slugs: string[],
) {
  const candidates = buildLegacyCandidates(slugs);

  for (const candidate of candidates) {
    const page = source.getPage(candidate);
    if (page) {
      return {
        page,
      };
    }
  }

  return null;
}

function buildLegacyCandidates(slugs: string[]) {
  const candidates: string[][] = [];
  const pushCandidate = (candidate: string[]) => {
    if (candidate.length === 0) {
      return;
    }

    const key = candidate.join('/');
    if (!candidates.some((item) => item.join('/') === key)) {
      candidates.push(candidate);
    }
  };

  const lastSlug = slugs.at(-1);
  const lastWithoutMd =
    lastSlug && lastSlug.endsWith('.md') ? lastSlug.slice(0, -3) : null;

  if (lastWithoutMd) {
    pushCandidate([...slugs.slice(0, -1), lastWithoutMd]);

    if (slugs.length >= 2) {
      pushCandidate([...slugs.slice(0, -2), lastWithoutMd]);
    }
  }

  if (legacyRootSections.has(slugs[0] ?? '')) {
    pushCandidate(['convoai', 'restful', ...slugs]);
    if (lastWithoutMd) {
      pushCandidate([
        'convoai',
        'restful',
        ...slugs.slice(0, -1),
        lastWithoutMd,
      ]);
      if (slugs.length >= 2) {
        pushCandidate([
          'convoai',
          'restful',
          ...slugs.slice(0, -2),
          lastWithoutMd,
        ]);
      }
    }
  }

  if (slugs[0] === 'convoai' && slugs[1] && slugs[1] !== 'restful') {
    const prefixed = ['convoai', 'restful', ...slugs.slice(1)];
    pushCandidate(prefixed);

    if (lastWithoutMd) {
      pushCandidate([
        'convoai',
        'restful',
        ...slugs.slice(1, -1),
        lastWithoutMd,
      ]);
      if (slugs.length >= 3) {
        pushCandidate([
          'convoai',
          'restful',
          ...slugs.slice(1, -2),
          lastWithoutMd,
        ]);
      }
    }
  }

  if (slugs[0] === 'convoai-restful-quick-start' && slugs.length > 1) {
    pushCandidate(['convoai', 'restful', 'get-started', ...slugs.slice(1)]);

    if (lastWithoutMd) {
      pushCandidate([
        'convoai',
        'restful',
        'get-started',
        ...slugs.slice(1, -1),
        lastWithoutMd,
      ]);
    }
  }

  return candidates;
}
