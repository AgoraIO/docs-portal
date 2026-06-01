import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  loader: () => {
    throw redirect({
      href: '/en/introduction',
    });
  },
  component: () => null,
});
