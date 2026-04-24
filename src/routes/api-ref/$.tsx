import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/api-ref/$')({
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
