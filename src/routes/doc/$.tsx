import { createFileRoute, redirect } from '@tanstack/react-router';
import { preserveRedirectSearch } from '@/lib/docs-redirect-url';
import shengwangGuideRedirects from '@/lib/shengwang-guide-redirects.json';

export const Route = createFileRoute('/doc/$')({
  loader: ({ params, location }) => {
    const splat = params._splat ?? '';
    const legacyPath = `/doc/${splat}`.replace(/\/+$/, '');
    const reviewedTarget = (shengwangGuideRedirects as Record<string, string>)[
      legacyPath
    ];

    if (reviewedTarget) {
      throw redirect({
        href: preserveRedirectSearch(reviewedTarget, location ?? {}),
        statusCode: 301,
      });
    }

    throw redirect({
      href: `https://doc.shengwang.cn/doc/${splat}`,
      statusCode: 308,
    });
  },
});
