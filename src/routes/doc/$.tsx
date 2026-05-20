import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/doc/$')({
  loader: ({ params }) => {
    const splat = params._splat ?? '';

    throw redirect({
      href: `https://doc.shengwang.cn/doc/${splat}`,
      statusCode: 308,
    });
  },
});
