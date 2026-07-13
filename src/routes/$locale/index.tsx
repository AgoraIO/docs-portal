import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { isPublishedDocLocale } from '@/lib/docs-routing';

export const Route = createFileRoute('/$locale/')({
  loader: ({ params }) => {
    if (!isPublishedDocLocale(params.locale)) {
      throw notFound();
    }

    throw redirect({
      href: `/${params.locale}/introduction`,
    });
  },
  component: () => null,
});
