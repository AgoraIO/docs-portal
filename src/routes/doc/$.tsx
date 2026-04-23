import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/doc/$')({
  loader: ({ params }) => {
    throw redirect({
      to: '/docs/$',
      params: {
        _splat: params._splat ?? '',
      },
    });
  },
  component: () => null,
});
