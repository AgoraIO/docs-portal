import {
  DocsBody,
  DocsDescription,
  DocsPage,
  type DocsPageProps,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
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
  title,
  toc,
}: {
  children: ReactNode;
  description?: string;
  markdownUrl: string;
  title: string;
  toc: DocsPageProps['toc'];
}) {
  const content = stripLeadingDocumentMeta(children, title, description);

  return (
    <DocsPage
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      toc={toc}
    >
      <header className="not-prose mb-8 border-b border-fd-border/80 pb-5">
        <DocsTitle className="text-3xl tracking-[-0.035em] text-fd-foreground sm:text-4xl">
          {title}
        </DocsTitle>
        <DocsDescription className="mt-3 max-w-3xl text-base leading-7 text-fd-muted-foreground sm:text-[1.0625rem]">
          {description}
        </DocsDescription>
      </header>
      <div className="not-prose -mt-1 mb-8 flex flex-row items-center gap-2 border-b border-fd-border/70 pb-5">
        <LocalizedMarkdownCopyButton markdownUrl={markdownUrl} />
        <LocalizedViewOptionsPopover markdownUrl={markdownUrl} />
      </div>
      <DocsBody>{content}</DocsBody>
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
      isTagMatch(item, 'p', normalizedDescription)
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
