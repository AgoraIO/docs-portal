import {
  DocsBody,
  DocsDescription,
  DocsPage,
  type DocsPageProps,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LocalizedMarkdownCopyButton,
  LocalizedViewOptionsPopover,
} from './page-actions';

const TITLE_SCAN_LIMIT = 3;
const DESCRIPTION_SCAN_LIMIT = 6;

export function DocsPageContent({
  children,
  description,
  markdownUrl,
  path,
  title,
  toc,
}: {
  children: ReactNode;
  description?: string;
  markdownUrl: string;
  path?: string;
  title: string;
  toc: DocsPageProps['toc'];
}) {
  const { t } = useTranslation('common');
  const content = stripLeadingDocumentMeta(children, title, description);
  const eyebrow = deriveEyebrow(path);
  const guideItems = deriveGuideItems(toc);

  return (
    <DocsPage
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      className="gap-0 xl:max-w-[900px]"
      toc={toc}
    >
      <header className="not-prose mb-7 grid gap-4 border-b border-border/60 pb-6 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="mb-3 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              <span className="inline-flex size-1.5 rounded-full bg-primary/70" />
              <span>{eyebrow}</span>
            </div>
          ) : null}
          <DocsTitle className="text-[1.9rem] font-semibold tracking-[-0.01em] text-foreground sm:text-[2.12rem]">
            {title}
          </DocsTitle>
          <DocsDescription className="mt-3 mb-0 max-w-2xl text-[0.98rem] font-normal leading-8 text-muted-foreground sm:text-[1.02rem]">
            {description}
          </DocsDescription>
        </div>
        <div className="flex flex-wrap items-center gap-1 lg:justify-end">
          <LocalizedMarkdownCopyButton markdownUrl={markdownUrl} />
          <LocalizedViewOptionsPopover markdownUrl={markdownUrl} />
        </div>
      </header>
      {guideItems.length > 0 ? (
        <section className="docs-guide not-prose mb-7 rounded-[1.25rem] border border-border/80 bg-card/96 p-5 sm:p-6">
          <div className="flex flex-col gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[1.1rem] font-semibold tracking-[-0.015em] text-foreground">
                {t('docs.guide.title')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t('docs.guide.description')}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {guideItems.map((item) => (
              <a
                className="docs-guide-link rounded-2xl border border-border/70 bg-secondary/66 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/72"
                href={item.url}
                key={item.url}
              >
                {item.title}
              </a>
            ))}
          </div>
        </section>
      ) : null}
      <DocsBody className="docs-body pb-12">{content}</DocsBody>
    </DocsPage>
  );
}

function stripLeadingDocumentMeta(
  children: ReactNode,
  title: string,
  description?: string,
) {
  const items = flattenChildren(children);
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);
  let visibleCount = 0;
  let titleRemoved = false;
  let descriptionRemoved = false;

  return items.filter((item) => {
    if (isIgnorable(item)) {
      return true;
    }

    visibleCount += 1;

    if (
      !titleRemoved &&
      visibleCount <= TITLE_SCAN_LIMIT &&
      isTagMatch(item, 'h1', normalizedTitle)
    ) {
      titleRemoved = true;
      return false;
    }

    if (
      normalizedDescription &&
      !descriptionRemoved &&
      visibleCount <= DESCRIPTION_SCAN_LIMIT &&
      isDescriptionMatch(item, normalizedDescription)
    ) {
      descriptionRemoved = true;
      return false;
    }

    return true;
  });
}

function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return flattenChildren(
        (child.props as { children?: ReactNode }).children,
      );
    }

    return [child];
  });
}

function isIgnorable(node: ReactNode) {
  return typeof node === 'string' && normalizeText(node) === '';
}

function isTagMatch(node: ReactNode, tagName: string, expectedText: string) {
  if (!expectedText || !isValidElement(node) || node.type !== tagName) {
    return false;
  }

  return normalizeText(getNodeText(node)) === expectedText;
}

function isDescriptionMatch(node: ReactNode, expectedText: string) {
  if (!expectedText || !isValidElement(node) || node.type !== 'p') {
    return false;
  }

  const actualText = normalizeText(getNodeText(node));
  if (actualText === expectedText) {
    return true;
  }

  const truncatedPrefix = expectedText.replace(/(?:\.{3}|…)$/, '').trim();
  return truncatedPrefix.length > 0 && actualText.startsWith(truncatedPrefix);
}

function getNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join('');
  }

  if (isValidElement(node)) {
    return getNodeText((node.props as { children?: ReactNode }).children);
  }

  return '';
}

function normalizeText(value: string | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function deriveEyebrow(path?: string) {
  if (!path) {
    return null;
  }

  const segments = path
    .split('/')
    .map((segment) => segment.replace(/\.mdx?$/, ''))
    .filter(Boolean);

  const anchor = segments.at(-2) ?? segments.at(-1);

  if (!anchor) {
    return null;
  }

  return anchor
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function deriveGuideItems(toc: DocsPageProps['toc']) {
  return toc
    .filter((item) => item.depth <= 3)
    .map((item) => ({
      title: normalizeText(getNodeText(item.title)),
      url: item.url,
    }))
    .filter((item) => item.title.length > 0)
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.url === item.url) === index,
    )
    .slice(0, 6);
}
