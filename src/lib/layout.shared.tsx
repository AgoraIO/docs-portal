import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/i18n/use-locale';
import { docsRoute } from './shared';

function SiteTitle() {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex size-8.5 items-center justify-center rounded-2xl border border-fd-border bg-fd-card/90 shadow-[0_12px_30px_-26px_rgba(33,139,120,0.22)]">
        <div className="flex items-end gap-1">
          <span className="h-3.5 w-1 rounded-full bg-fd-primary/75" />
          <span className="h-5.5 w-1 rounded-full bg-fd-foreground" />
          <span className="h-2.5 w-1 rounded-full bg-fd-border" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[0.9rem] font-medium tracking-[-0.02em] text-fd-foreground">
          {t('app.name')}
        </p>
        <p className="truncate text-[0.62rem] uppercase tracking-[0.16em] text-fd-muted-foreground">
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
      {
        text: locale === 'zh-CN' ? 'API' : 'API',
        url: '/api-ref',
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
