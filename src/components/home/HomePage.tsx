import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/i18n/use-locale';

const railKeys = ['wiki', 'tools'] as const;
const cardKeys = ['docs', 'wiki', 'tools'] as const;

export function HomePage() {
  const { t } = useTranslation('common');
  const { locale } = useLocale();
  const isChinese = locale === 'zh-CN';
  const heroFontFamily =
    isChinese ? 'var(--font-heading)' : 'var(--font-display)';
  const heroLineHeight = isChinese ? 1.08 : 0.92;

  return (
    <div className="mx-auto flex w-full max-w-[var(--oatmeal-container-page)] flex-col gap-10 px-6 py-8 lg:px-10 lg:py-10">
      <section className="grid gap-10 border-b border-fd-border/70 pb-12 lg:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.62fr)] lg:items-start lg:gap-12">
        <div className="max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t('home.eyebrow')}
          </p>
          <h1
            className="mt-5 max-w-5xl text-5xl leading-[0.92] tracking-tight text-foreground sm:text-[5.7rem] lg:text-[6.8rem]"
            style={{ fontFamily: heroFontFamily, lineHeight: heroLineHeight }}
          >
            {t('home.title')}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t('home.description')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              href="/docs"
            >
              {t('home.primaryCta')}
            </a>
          </div>
        </div>

        <div className="grid gap-4 pt-2">
          {railKeys.map((key) => (
            <div
              className="rounded-[1.6rem] border border-fd-border/70 bg-fd-background/80 p-5"
              key={key}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t(`home.rail.${key}.title`)}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t(`home.rail.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {cardKeys.map((key) => (
          <a
            className="group rounded-[1.75rem] border border-fd-border/80 bg-fd-card/80 p-6 transition hover:-translate-y-0.5 hover:border-fd-border hover:bg-fd-background"
            href={key === 'docs' ? '/docs' : '#'}
            key={key}
          >
            <h2 className="text-2xl leading-tight text-foreground">
              {t(`home.cards.${key}.title`)}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {t(`home.cards.${key}.body`)}
            </p>
            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {t(`home.cards.${key}.cta`)}
              </span>
              {key === 'tools' ? (
                <span className="rounded-full border border-fd-border/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t('home.cards.tools.badge')}
                </span>
              ) : null}
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
