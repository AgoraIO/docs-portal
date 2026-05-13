import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/doc/$')({
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
