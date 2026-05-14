import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { getDocsTabIndex } from '@/lib/docs-page';
import { isSupportedDocLocale } from '@/lib/docs-routing';

export const Route = createFileRoute('/$locale/$tab/')({
  loader: async ({ params }) => {
    if (!isSupportedDocLocale(params.locale)) {
      throw notFound();
    }

    const page = await getDocsTabIndex({
      data: {
        locale: params.locale,
        tab: params.tab,
      },
    });

    if (!page) {
      throw notFound();
    }

    throw redirect({
      href: page.url,
    });
  },
  component: () => null,
});
