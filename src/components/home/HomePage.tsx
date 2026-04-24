import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/i18n/use-locale';

const cardKeys = ['docs', 'api', 'tools'] as const;

export function HomePage() {
  const { t } = useTranslation('common');
  const { locale } = useLocale();
  const isChinese = locale === 'zh-CN';
  const heroFontFamily = isChinese
    ? 'var(--font-heading)'
    : 'var(--font-display)';
  const heroLineHeight = 1.02;

  return (
    <div className="mx-auto flex w-full max-w-[var(--oatmeal-container-page)] flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="border-b border-fd-border/70 pb-10">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {t('home.eyebrow')}
          </p>
          <h1
            className="mt-4 max-w-3xl text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ fontFamily: heroFontFamily, lineHeight: heroLineHeight }}
          >
            {t('home.title')}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t('home.description')}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              href="/docs"
            >
              {t('home.primaryCta')}
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {cardKeys.map((key) => (
          <a
            className="group rounded-[1.35rem] border border-fd-border/80 bg-fd-card/70 p-5 transition hover:-translate-y-0.5 hover:border-fd-border hover:bg-fd-background/80"
            href={key === 'docs' ? '/docs' : key === 'api' ? '/api-ref' : '#'}
            key={key}
          >
            <h2 className="text-lg leading-tight text-foreground">
              {t(`home.cards.${key}.title`)}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(`home.cards.${key}.body`)}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {t(`home.cards.${key}.cta`)}
              </span>
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
