import { createFileRoute, redirect } from '@tanstack/react-router';
import { DEFAULT_LOCALE } from '@/lib/shared';

export const Route = createFileRoute('/')({
  loader: () => {
    throw redirect({
      to: '/$lang',
      params: {
        lang: DEFAULT_LOCALE,
      },
    });
  },
  component: () => null,
});
