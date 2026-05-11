import { DocsPage, type DocsPageProps } from 'fumadocs-ui/layouts/docs/page';
import type { ReactNode } from 'react';
import { DocsSharedContent } from './DocsSharedContent';

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
  return (
    <DocsPage
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      className="gap-0 xl:max-w-[860px]"
      toc={toc}
    >
      <DocsSharedContent
        description={description}
        markdownUrl={markdownUrl}
        path={path}
        title={title}
      >
        {children}
      </DocsSharedContent>
    </DocsPage>
  );
}
