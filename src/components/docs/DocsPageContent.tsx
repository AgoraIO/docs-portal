import {
  DocsBody,
  DocsPage,
  type DocsPageProps,
} from 'fumadocs-ui/layouts/docs/page';
import type { ReactNode } from 'react';
import {
  LocalizedMarkdownCopyButton,
  LocalizedViewOptionsPopover,
} from './page-actions';

export function DocsPageContent({
  children,
  markdownUrl,
  toc,
}: {
  children: ReactNode;
  markdownUrl: string;
  toc: DocsPageProps['toc'];
}) {
  return (
    <DocsPage
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      toc={toc}
    >
      <div className="not-prose -mt-2 mb-7 flex flex-row items-center gap-2 border-b border-fd-border/70 pb-5">
        <LocalizedMarkdownCopyButton markdownUrl={markdownUrl} />
        <LocalizedViewOptionsPopover markdownUrl={markdownUrl} />
      </div>
      <DocsBody>{children}</DocsBody>
    </DocsPage>
  );
}
