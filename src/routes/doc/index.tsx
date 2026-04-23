import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/doc/')({
  loader: () => {
    throw redirect({
      to: '/docs',
    });
  },
  component: () => null,
});
