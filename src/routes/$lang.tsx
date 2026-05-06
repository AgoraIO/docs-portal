import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { normalizeLocale } from '@/lib/i18n/i18n-config';

export const Route = createFileRoute('/$lang')({
  beforeLoad: ({ params }) => {
    const normalized = normalizeLocale(params.lang);

    if (!normalized) {
      throw redirect({
        to: '/$lang',
        params: { lang: 'en' },
      });
    }

    if (normalized !== params.lang) {
      throw redirect({
        to: '/$lang',
        params: { lang: normalized },
      });
    }

    return {
      locale: normalized,
    };
  },
  component: () => <Outlet />,
});
