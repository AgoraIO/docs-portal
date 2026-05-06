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
import { Suspense } from 'react';
import { DocsPageContent } from '@/components/docs/DocsPageContent';
import { getMDXComponents } from '@/components/mdx';
import { useBaseLayoutOptions } from '@/lib/layout.shared';
import type { source as docsSource } from '@/lib/source';

export const Route = createFileRoute('/$lang/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await loader({ data: { lang: params.lang, slugs } });
    await clientLoader.preload(data.path);
    return data;
  },
});

const loader = createServerFn({
  method: 'GET',
})
  .inputValidator((input: { lang: string; slugs: string[] }) => input)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data }) => {
    const { getPageMarkdownUrl, source } = await import('@/lib/source');
    const resolvedPage = resolvePage(source, data.slugs, data.lang);

    const page = resolvedPage?.page;
    if (!page) {
      if (data.slugs.length === 0) {
        const firstPage = source.getPages(data.lang)[0];
        if (firstPage) {
          throw redirect({
            to: '/$lang/docs/$',
            params: {
              lang: data.lang,
              _splat: firstPage.slugs.join('/'),
            },
          });
        }
      }
      throw notFound();
    }

    return {
      description: page.data.description,
      locale: data.lang,
      path: page.path,
      markdownUrl: getPageMarkdownUrl(page).url,
      pageTree: await source.serializePageTree(source.getPageTree(data.lang)),
      title: page.data.title ?? page.slugs.at(-1) ?? 'Untitled',
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, default: MDX },
    {
      description,
      markdownUrl,
      path,
      title,
    }: {
      description?: string;
      markdownUrl: string;
      path: string;
      title: string;
    },
  ) {
    return (
      <DocsPageContent
        description={description}
        markdownUrl={markdownUrl}
        path={path}
        title={title}
        toc={toc}
      >
        <MDX components={getMDXComponents()} />
      </DocsPageContent>
    );
  },
});

function Page() {
  const { description, pageTree, path, markdownUrl, title } = useFumadocsLoader(
    Route.useLoaderData(),
  );
  const options = useBaseLayoutOptions();

  return (
    <DocsLayout {...options} tabs={false} tree={pageTree}>
      <Link to={markdownUrl} hidden />
      <Suspense>
        {clientLoader.useContent(path, {
          description,
          markdownUrl,
          path,
          title,
        })}
      </Suspense>
    </DocsLayout>
  );
}

function resolvePage(source: typeof docsSource, slugs: string[], language: string) {
  const page = source.getPage(slugs, language);
  if (!page) {
    return null;
  }

  return {
    page,
  };
}
