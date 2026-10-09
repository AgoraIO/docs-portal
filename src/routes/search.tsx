import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { DOCS_REGION } from '@/lib/site-region';

export const Route = createFileRoute('/search')({
  beforeLoad: ({ location }) => {
    if (DOCS_REGION !== 'cn') throw notFound();
    throw redirect({ href: `/zh-CN/search${location.searchStr}` });
  },
});
