import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import {
  LocalizedMarkdownCopyButton,
  LocalizedViewOptionsPopover,
} from './page-actions';

const TITLE_SCAN_LIMIT = 3;
const DESCRIPTION_SCAN_LIMIT = 6;

export function DocsSharedContent({
  children,
  description,
  markdownUrl,
  path,
  title,
}: {
  children: ReactNode;
  description?: string;
  markdownUrl: string;
  path?: string;
  title: string;
}) {
  const content = stripLeadingDocumentMeta(children, title, description);
  const eyebrow = deriveEyebrow(path);

  return (
    <>
      <header className="not-prose mb-7 grid gap-4 border-b border-border/60 pb-6 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="mb-3 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              <span className="inline-flex size-1.5 rounded-full bg-primary/70" />
              <span>{eyebrow}</span>
            </div>
          ) : null}
          <DocsTitle className="text-[1.72rem] font-semibold tracking-[-0.01em] text-foreground sm:text-[1.92rem]">
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
      <DocsBody className="docs-body pb-12">{content}</DocsBody>
    </>
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
