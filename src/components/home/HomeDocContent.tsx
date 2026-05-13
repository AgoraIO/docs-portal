import browserCollections from 'collections/browser';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import type { TOCItemType } from 'fumadocs-core/toc';
import { TOCProvider } from 'fumadocs-ui/components/toc';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { DocsSharedContent } from '@/components/docs/DocsSharedContent';
import { getMDXComponents } from '@/components/mdx';
import { cn } from '@/lib/cn';
import { homeContentRoute } from '@/lib/shared';

const clientLoader = browserCollections.home.createClientLoader({
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
      <HomeDocShell toc={toc}>
        <DocsSharedContent
          description={description}
          markdownUrl={markdownUrl}
          path={undefined}
          title={title}
        >
          <MDX components={getMDXComponents()} />
        </DocsSharedContent>
      </HomeDocShell>
    );
  },
});

export function HomeDocContent({
  description,
  locale,
  pageKey,
  title,
}: {
  description?: string;
  locale: 'en' | 'zh-CN';
  pageKey: string;
  title: string;
}) {
  const path = `${locale}/${pageKey}.md`;
  const content = useFumadocsLoader({
    description,
    markdownUrl: `${homeContentRoute}/${path}/content.md`,
    path,
    title,
  });

  return (
    <Suspense>
      {clientLoader.useContent(content.path, {
        description: content.description,
        markdownUrl: content.markdownUrl,
        path: content.path,
        title: content.title,
      })}
    </Suspense>
  );
}

function HomeDocShell({
  children,
  toc,
}: {
  children: React.ReactNode;
  toc: TOCItemType[];
}) {
  const normalizedToc = useMemo(
    () => toc.filter((item) => typeof item.title === 'string'),
    [toc],
  );
  const fallbackToc = useFallbackToc(normalizedToc);
  const resolvedToc = fallbackToc.length > 0 ? fallbackToc : normalizedToc;

  return (
    <TOCProvider toc={resolvedToc}>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-start xl:gap-12">
        <article className="w-full max-w-none">{children}</article>
        <HomeToc toc={resolvedToc} />
      </div>
    </TOCProvider>
  );
}

function HomeToc({ toc }: { toc: TOCItemType[] }) {
  const { text } = useI18n();

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-[8.8rem] max-h-[calc(100vh-10rem)] overflow-y-auto border-l border-border/70 pl-5 text-muted-foreground">
        <h3
          className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.12em]"
          id="home-toc-title"
        >
          {text.toc}
        </h3>
        {toc.length > 0 ? (
          <ul className="space-y-1">
            {toc.map((item) => (
              <li key={item.url}>
                <a
                  className={cn(
                    'block rounded-lg px-3 py-1.5 text-[0.84rem] transition-colors hover:bg-accent/42 hover:text-foreground',
                    item.depth > 2 && 'ml-3',
                    item.depth > 3 && 'ml-6',
                  )}
                  href={item.url}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">{text.tocNoHeadings}</p>
        )}
      </div>
    </aside>
  );
}

function useFallbackToc(primaryToc: TOCItemType[]) {
  const [fallbackToc, setFallbackToc] = useState<TOCItemType[]>([]);

  useEffect(() => {
    if (primaryToc.length > 0) {
      setFallbackToc([]);
      return;
    }

    const article = document.querySelector('article.w-full');
    if (!article) {
      setFallbackToc([]);
      return;
    }

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]'),
    );

    setFallbackToc(
      headings.map((heading) => ({
        depth: Number(heading.tagName.slice(1)),
        title: heading.textContent?.trim() ?? '',
        url: `#${heading.id}`,
      })),
    );
  }, [primaryToc]);

  return fallbackToc;
}
