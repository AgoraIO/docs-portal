import { createFileRoute, redirect } from '@tanstack/react-router';
import { docsRoute } from '@/lib/shared';

export const Route = createFileRoute('/')({
  loader: () => {
    throw redirect({
      href: docsRoute,
    });
  },
  component: () => null,
});
