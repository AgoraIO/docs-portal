import { ClientOnly, Link } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import { BotIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
import { syncDocsHashTargetFromLocation } from '@/lib/docs-hash';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import {
  isAiContentPath,
  isApiReferenceContentPath,
  isRtcAndroidApiReferenceContentPath,
} from '@/lib/docs-source-buckets';
import type { DocsBreadcrumbItem } from '@/lib/docs-tree';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';
import { useTranslation } from '@/lib/i18n/react';
import { FumadocsOpenApiContent } from '../openapi/FumadocsOpenApiContent';
import { FumadocsOpenApiContentHydrated } from '../openapi/FumadocsOpenApiContentHydrated';
import { DocsTableOfContents } from './DocsTableOfContents';
import { DocsTableOfContentsHydrated } from './DocsTableOfContentsHydrated';
import { shouldUseStaticDocsHtmlBody } from './docs-content-hydration';
import { getInitialStaticDocsHtml } from './docs-static-html';

const shouldLoadPrerenderDocsBodies =
  import.meta.env.MODE === 'test' ||
  process.env.DOCS_FORCE_PRERENDER_BODIES === 'true' ||
  (import.meta.env.SSR && process.env.TSS_PRERENDERING === 'true');

const prerenderDocsBodyModules = shouldLoadPrerenderDocsBodies
  ? await Promise.all([
      import('./DocsAiContentBody'),
      import('./DocsApiReferenceContentBody'),
      import('./DocsContentBody'),
      import('./DocsRtcAndroidApiReferenceContentBody'),
    ])
  : null;

const DocsAiContentBody = prerenderDocsBodyModules?.[0].DocsAiContentBody;
const DocsApiReferenceContentBody =
  prerenderDocsBodyModules?.[1].DocsApiReferenceContentBody;
const DocsContentBody = prerenderDocsBodyModules?.[2].DocsContentBody;
const DocsRtcAndroidApiReferenceContentBody =
  prerenderDocsBodyModules?.[3].DocsRtcAndroidApiReferenceContentBody;

function getMarkdownUrl(contentPath: string) {
  return `/llms.mdx/docs/${contentPath.replace(/\.mdx?$/, '.md')}`;
}

export function DocsContent({
  activePath,
  body,
  breadcrumb = [],
  contentPath,
  description,
  locale = DEFAULT_LOCALE,
  markdownUrl,
  sidebarHeader,
  slug,
  title,
  toc,
}: {
  activePath?: string;
  body?: DocsContentBodyPayload;
  breadcrumb?: DocsBreadcrumbItem[];
  contentPath?: string;
  description?: string;
  locale?: AppLocale | string;
  markdownUrl?: string;
  sidebarHeader?: DocsSidebarHeader;
  slug?: string;
  title?: string;
  toc: TOCItemType[];
}) {
  const { i18n } = useTranslation('common');
  const currentLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const t = i18n.getFixedT(currentLocale, 'common');
  const shouldRenderInlineContent = import.meta.env.MODE === 'test';
  const displayTitle = title ?? slug;
  const resolvedBody =
    body ??
    (contentPath
      ? ({
          contentPath,
          kind: 'mdx',
        } satisfies DocsContentBodyPayload)
      : undefined);
  const isOpenApiBody = resolvedBody?.kind === 'openapi';
  const isApiReferenceMdx =
    resolvedBody?.kind === 'mdx' &&
    isApiReferenceContentPath(resolvedBody.contentPath);
  const isAiMdx =
    resolvedBody?.kind === 'mdx' && isAiContentPath(resolvedBody.contentPath);
  const isRtcAndroidApiReferenceMdx =
    resolvedBody?.kind === 'mdx' &&
    isRtcAndroidApiReferenceContentPath(resolvedBody.contentPath);
  const shouldUseLightweightApiReferenceFallback =
    import.meta.env.MODE !== 'test' &&
    (isApiReferenceMdx || isRtcAndroidApiReferenceMdx);
  const payloadStaticHtml = resolvedBody?.kind === 'mdx' ? resolvedBody.html ?? null : null;
  const patchedStaticHtml =
    resolvedBody?.kind === 'mdx' && activePath
      ? getPatchedStaticDocsHtml(activePath)
      : null;
  const staticHtml = payloadStaticHtml ?? patchedStaticHtml;
  const shouldPreferStaticHtmlBody =
    resolvedBody?.kind === 'mdx' &&
    staticHtml !== null &&
    shouldUseStaticDocsHtmlBody(resolvedBody.contentPath);
  const resolvedMarkdownUrl =
    markdownUrl ??
    (resolvedBody?.kind === 'mdx'
      ? getMarkdownUrl(resolvedBody.contentPath)
      : undefined);
  const shouldRenderPrerenderInlineContent =
    !shouldPreferStaticHtmlBody &&
    (shouldRenderInlineContent ||
      process.env.DOCS_FORCE_PRERENDER_BODIES === 'true' ||
      (import.meta.env.SSR && process.env.TSS_PRERENDERING === 'true'));
  const pageIdentity =
    resolvedBody?.kind === 'mdx' ? resolvedBody.contentPath : null;
  const previousPageIdentityRef = useRef<string | null>(null);

  useEffect(() => {
    if (resolvedBody?.kind !== 'mdx') {
      previousPageIdentityRef.current = null;
      return;
    }

    if (previousPageIdentityRef.current === null) {
      previousPageIdentityRef.current = pageIdentity;
      return;
    }

    if (previousPageIdentityRef.current === pageIdentity) {
      return;
    }

    previousPageIdentityRef.current = pageIdentity;

    const scrollContainer = document.querySelector<HTMLElement>(
      '[data-testid="docs-main-desktop-scroll"]',
    );

    if (!scrollContainer) {
      return;
    }

    scrollContainer.scrollTo({ behavior: 'auto', top: 0 });
  }, [pageIdentity, resolvedBody?.kind]);

  useEffect(() => {
    if (resolvedBody?.kind !== 'mdx') {
      return;
    }

    const handleHashChange = () => {
      syncDocsHashTargetFromLocation('auto');
    };

    const frame = window.requestAnimationFrame(handleHashChange);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [resolvedBody?.kind]);

  return (
    <article
      data-dr={resolvedBody?.kind === 'mdx' ? activePath : undefined}
      className={cn(
        'flex min-w-0 flex-col gap-9',
        isOpenApiBody ? 'max-w-none' : 'max-w-[var(--content-max)]',
      )}
    >
      <header className="flex flex-col gap-4 border-b border-[color:var(--line-soft)] pb-7">
        {breadcrumb.length > 0 ? (
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-5 text-[color:var(--ink-4)]">
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;

                return (
                  <li
                    className="flex min-w-0 items-center gap-2"
                    key={item.url ?? item.title}
                  >
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className="text-[color:var(--line-strong)]"
                      >
                        /
                      </span>
                    ) : null}
                    {item.url && !isLast ? (
                      <a
                        className="truncate transition-colors hover:text-[color:var(--ink-1)]"
                        href={item.url}
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className={cn(
                          'truncate',
                          isLast && 'text-[color:var(--ink-2)]',
                        )}
                      >
                        {item.title}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
        <div className="flex flex-col gap-3">
          <h1 className="max-w-4xl text-[2rem] leading-[1.12] font-bold tracking-[-0.022em] text-[color:var(--ink-1)] sm:text-[2.375rem]">
            {displayTitle}
          </h1>
          {description ? (
            <p className="max-w-2xl text-[17.5px] leading-[1.55] text-[color:var(--ink-3)]">
              {description}
            </p>
          ) : null}
        </div>
        {resolvedMarkdownUrl ? (
          <div className="flex flex-col items-start gap-3">
            <a
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[color:var(--line-soft)] bg-card px-2.5 text-xs font-medium text-[color:var(--ink-3)] transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-1)]"
              href={resolvedMarkdownUrl}
              rel="noreferrer"
              target="_blank"
            >
              <BotIcon className="size-3.5" />
              {t('docs.viewAsMarkdown')}
            </a>
            {sidebarHeader?.versionSwitcher?.presentation === 'tabs' ? (
              <DocsHeaderScopeTabs header={sidebarHeader} />
            ) : null}
          </div>
        ) : null}
        {!markdownUrl &&
        sidebarHeader?.versionSwitcher?.presentation === 'tabs' ? (
          <DocsHeaderScopeTabs header={sidebarHeader} />
        ) : null}
      </header>
      {isOpenApiBody ? (
        shouldRenderPrerenderInlineContent ? (
          <FumadocsOpenApiContent
            payloadAssetPath={resolvedBody.payloadAssetPath}
            payloadMeta={resolvedBody.payloadMeta}
          />
        ) : (
          <ClientOnly
            fallback={
              <FumadocsOpenApiContent
                payloadAssetPath={resolvedBody.payloadAssetPath}
                payloadMeta={resolvedBody.payloadMeta}
              />
            }
          >
            <FumadocsOpenApiContentHydrated
              payloadAssetPath={resolvedBody.payloadAssetPath}
              payloadMeta={resolvedBody.payloadMeta}
            />
          </ClientOnly>
        )
      ) : (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {resolvedBody?.kind === 'mdx' ? (
            staticHtml ? (
              <DocsStaticHtmlBody html={staticHtml} />
            ) : shouldRenderPrerenderInlineContent ? (
              isRtcAndroidApiReferenceMdx ? (
                DocsRtcAndroidApiReferenceContentBody ? (
                  <DocsRtcAndroidApiReferenceContentBody
                    contentPath={resolvedBody.contentPath}
                  />
                ) : (
                  <DocsApiReferencePrerenderFallback
                    locale={currentLocale}
                    toc={toc}
                  />
                )
              ) : isApiReferenceMdx ? (
                DocsApiReferenceContentBody ? (
                  <DocsApiReferenceContentBody
                    contentPath={resolvedBody.contentPath}
                  />
                ) : (
                  <DocsApiReferencePrerenderFallback
                    locale={currentLocale}
                    toc={toc}
                  />
                )
              ) : isAiMdx ? (
                DocsAiContentBody ? (
                  <DocsAiContentBody contentPath={resolvedBody.contentPath} />
                ) : (
                  <DocsContentSkeleton />
                )
              ) : DocsContentBody ? (
                <DocsContentBody contentPath={resolvedBody.contentPath} />
              ) : (
                <DocsContentSkeleton />
              )
            ) : (
              <ClientOnly
                fallback={
                  shouldPreferStaticHtmlBody ? (
                    <DocsStaticHtmlBody html={staticHtml} />
                  ) : isRtcAndroidApiReferenceMdx ? (
                    shouldUseLightweightApiReferenceFallback ? (
                      <DocsApiReferencePrerenderFallback
                        locale={currentLocale}
                        toc={toc}
                      />
                    ) : (
                      <DocsContentSkeleton />
                    )
                  ) : isApiReferenceMdx ? (
                    shouldUseLightweightApiReferenceFallback ? (
                      <DocsApiReferencePrerenderFallback
                        locale={currentLocale}
                        toc={toc}
                      />
                    ) : (
                      staticHtml ? (
                        <DocsStaticHtmlBody html={staticHtml} />
                      ) : (
                        <DocsContentSkeleton />
                      )
                    )
                  ) : (
                    staticHtml ? (
                      <DocsStaticHtmlBody html={staticHtml} />
                    ) : (
                      <DocsContentSkeleton />
                    )
                  )
                }
              >
                <DocsStaticHtmlBody html={staticHtml ?? ''} />
              </ClientOnly>
            )
          ) : null}
        </div>
      )}
      {isOpenApiBody ? null : (
        isRtcAndroidApiReferenceMdx ? (
          <DocsTableOfContentsHydrated
            className="xl:hidden"
            contentPath={resolvedBody.contentPath}
            locale={currentLocale}
            toc={toc}
          />
        ) : (
          <DocsTableOfContents
            className="xl:hidden"
            locale={currentLocale}
            toc={toc}
          />
        )
      )}
    </article>
  );
}

function DocsContentSkeleton() {
  return (
    <div
      className="space-y-4 py-2"
      data-testid="docs-content-skeleton"
      role="status"
    >
      <div className="h-4 w-1/3 rounded bg-[color:var(--line-soft)]" />
      <div className="h-4 w-full rounded bg-[color:var(--line-soft)]" />
      <div className="h-4 w-5/6 rounded bg-[color:var(--line-soft)]" />
      <span className="sr-only">Loading documentation content</span>
    </div>
  );
}

function DocsStaticHtmlBody({ html }: { html: string }) {
  return (
    <div
      className="docs-body"
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}

function DocsApiReferencePrerenderFallback({
  locale,
  toc,
}: {
  locale: AppLocale;
  toc: TOCItemType[];
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(locale, 'common');
  const items = toc.filter((item) => item.url && typeof item.title === 'string');

  return (
    <div
      className="space-y-4 py-2"
      data-testid="docs-api-reference-prerender-fallback"
    >
      <p className="text-sm text-muted-foreground">
        {t('docs.toc')}
      </p>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item.url}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="space-y-3"
          data-testid="docs-content-skeleton"
          role="status"
        >
          <div className="h-4 w-1/3 rounded bg-[color:var(--line-soft)]" />
          <div className="h-4 w-full rounded bg-[color:var(--line-soft)]" />
          <div className="h-4 w-5/6 rounded bg-[color:var(--line-soft)]" />
          <span className="sr-only">Loading documentation content</span>
        </div>
      )}
    </div>
  );
}

function DocsHeaderScopeTabs({ header }: { header: DocsSidebarHeader }) {
  const versionSwitcher = header.versionSwitcher;

  if (!versionSwitcher) {
    return null;
  }

  return (
    <Tabs className="w-auto max-w-full" value={versionSwitcher.currentId}>
      <TabsList
        className="max-w-full justify-start gap-1 overflow-visible px-0"
        variant="line"
      >
        {versionSwitcher.versions.map((version) => (
          <TabsTrigger asChild key={version.id} value={version.id}>
            <Link
              className="h-9 rounded-none px-0 pr-4 text-[13.5px] font-medium after:!bottom-[-3px] data-[state=active]:font-semibold"
              params={{}}
              search={{}}
              to={version.href}
            >
              {version.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export type DocsContentBodyPayload =
  | { contentPath: string; html?: string; kind: 'mdx' }
  | {
      kind: 'openapi';
      payloadAssetPath: string;
      payloadMeta: {
        document: string;
        operations: Array<{
          method: string;
          path: string;
        }>;
        showDescription: true;
      };
    };

declare global {
  interface Window {
  }
}

function getPatchedStaticDocsHtml(activePath: string) {
  return getInitialStaticDocsHtml(activePath);
}
