import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { isSupportedDocLocale } from '@/lib/docs-routing';

export const Route = createFileRoute('/$locale/')({
  loader: ({ params }) => {
    if (!isSupportedDocLocale(params.locale)) {
      throw notFound();
    }

    throw redirect({
      to: '/$locale/$tab',
      params: {
        locale: params.locale,
        tab: 'introduction',
      },
    });
  },
  component: () => null,
});
