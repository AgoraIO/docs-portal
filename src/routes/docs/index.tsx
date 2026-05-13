import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/docs/')({
  loader: () => {
    throw redirect({
      to: '/',
      search: {
        tab: 'overview',
        page: 'platform-overview',
      },
    });
  },
  component: () => null,
});
