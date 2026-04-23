import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/i18n/use-locale';
import { docsRoute } from './shared';

function SiteTitle() {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-2xl border border-fd-border bg-fd-card text-sm font-semibold text-fd-foreground">
        A
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-fd-foreground">
          {t('app.name')}
        </p>
        <p className="truncate text-[11px] uppercase tracking-[0.18em] text-fd-muted-foreground">
          {t('app.endorsement')}
        </p>
      </div>
    </div>
  );
}

export function useBaseLayoutOptions({
  variant = 'docs',
}: {
  variant?: 'docs' | 'home';
} = {}): BaseLayoutProps {
  const { locale } = useLocale();

  return {
    links: [
      {
        text: locale === 'zh-CN' ? '文档' : 'Docs',
        url: docsRoute,
        active: 'nested-url',
      },
    ],
    nav: {
      title: <SiteTitle />,
      url: '/',
      transparentMode: variant === 'home' ? 'top' : 'none',
    },
    i18n: true,
    githubUrl: '#',
  };
}
