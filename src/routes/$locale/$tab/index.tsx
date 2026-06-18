import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { DocsContent } from '@/components/docs-shell/DocsContent';
import { getDocsPagePayload, getDocsTabIndex } from '@/lib/docs-page';
import type { DocsPagePayload } from '@/lib/docs-page.server';
import { preloadDocsPageContent } from '@/lib/docs-route-preload';
import { isSupportedDocLocale } from '@/lib/docs-routing';
import {
  readStaticDocsPayload,
  shouldUseStaticDocsPayload,
} from '@/lib/docs-static-manifest';

export const Route = createFileRoute('/$locale/$tab/')({
  loader: async ({ params }) => {
    if (!isSupportedDocLocale(params.locale)) {
      throw notFound();
    }

    const payload = shouldUseStaticDocsPayload()
      ? await readStaticDocsPayload<DocsPagePayload | { redirectUrl: string }>({
          locale: params.locale,
          slugSegments: [],
          tab: params.tab,
        })
      : await (async () => {
          const page = await getDocsTabIndex({
            data: {
              locale: params.locale,
              tab: params.tab,
            },
          });

          if (!page) {
            return null;
          }

          if (page.url !== `/${params.locale}/${params.tab}`) {
            throw redirect({
              href: page.url,
            });
          }

          return getDocsPagePayload({
            data: {
              locale: params.locale,
              slugSegments: [],
              tab: params.tab,
            },
          });
        })();

    if (!payload) {
      throw notFound();
    }

    if ('redirectUrl' in payload) {
      throw redirect({
        href: payload.redirectUrl,
      });
    }

    await preloadDocsPageContent(payload);

    return {
      ...payload,
    };
  },
  component: TabIndexPage,
});

function TabIndexPage() {
  const params = Route.useParams();
  const {
    body,
    breadcrumb,
    contentPath,
    description,
    markdownUrl,
    sidebarHeader,
    slug,
    toc,
    title,
  } = Route.useLoaderData();

  return (
    <DocsContent
      body={body}
      breadcrumb={breadcrumb}
      contentPath={contentPath}
      description={description}
      locale={params.locale}
      markdownUrl={markdownUrl}
      sidebarHeader={sidebarHeader}
      slug={slug}
      title={title}
      toc={toc}
    />
  );
}
