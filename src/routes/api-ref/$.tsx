import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';
import shengwangGuideRedirects from '@/lib/shengwang-guide-redirects.json';

export const Route = createFileRoute('/api-ref/$')({
  loader: ({ params }) => {
    const legacyPath = `/api-ref/${params._splat ?? ''}`.replace(/\/+$/, '');
    const reviewedTarget = (shengwangGuideRedirects as Record<string, string>)[
      legacyPath
    ];

    if (reviewedTarget) {
      throw redirect({ href: reviewedTarget, statusCode: 301 });
    }
  },
  component: ApiRefRedirectPage,
});

function ApiRefRedirectPage() {
  const { _splat } = Route.useParams();

  const target = `https://doc.shengwang.cn/api-ref/${_splat ?? ''}`;

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[42rem] items-center justify-center px-6 py-16">
      <a
        className="text-sm font-medium text-foreground underline underline-offset-4"
        href={target}
        rel="noreferrer"
        target="_blank"
      >
        Open API reference
      </a>
    </main>
  );
}
