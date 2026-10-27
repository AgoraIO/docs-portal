import { createFileRoute, redirect } from '@tanstack/react-router';
import shengwangGuideRedirects from '@/lib/shengwang-guide-redirects.json';

export const Route = createFileRoute('/doc/$')({
  loader: ({ params }) => {
    const splat = params._splat ?? '';
    const legacyPath = `/doc/${splat}`.replace(/\/+$/, '');
    const reviewedTarget = (shengwangGuideRedirects as Record<string, string>)[
      legacyPath
    ];

    if (reviewedTarget) {
      throw redirect({ href: reviewedTarget, statusCode: 301 });
    }

    throw redirect({
      href: `https://doc.shengwang.cn/doc/${splat}`,
      statusCode: 308,
    });
  },
});
