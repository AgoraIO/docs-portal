import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { preserveRedirectSearch } from '@/lib/docs-redirect-url';
import reviewed from '@/lib/shengwang-guide-redirects.json';

export const Route = createFileRoute('/faq/$')({
  loader: ({ params, location }) => {
    const legacyPath = `/faq/${params._splat ?? ''}`.replace(/\/+$/, '');
    const target = (reviewed as Record<string, string>)[legacyPath];
    if (!target) throw notFound();
    throw redirect({
      href: preserveRedirectSearch(target, location ?? {}),
      statusCode: 301,
    });
  },
});
