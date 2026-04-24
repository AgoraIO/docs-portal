import { useTranslation } from 'react-i18next';

const cardKeys = ['docs', 'api', 'tools'] as const;
const hrefByKey = {
  docs: '/docs',
  api: '/api-ref',
  tools: '/docs/convoai/restful/mcp-integrate',
} as const;

export function HomePage() {
  const { t } = useTranslation('common');

  return (
    <div className="mx-auto flex w-full max-w-[var(--protocol-home-width)] flex-col gap-16 px-6 py-10 sm:py-14 lg:px-10 lg:py-20">
      <section className="grid gap-10 border-b border-fd-border/80 pb-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="max-w-4xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-fd-muted-foreground">
            {t('home.eyebrow')}
          </p>
          <h1 className="mt-5 max-w-3xl text-balance text-[2.6rem] font-semibold tracking-[-0.05em] text-fd-foreground sm:text-5xl lg:text-[3.7rem]">
            {t('home.title')}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-fd-muted-foreground">
            {t('home.description')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center justify-center rounded-full bg-fd-foreground px-4 py-2.5 text-sm font-medium text-fd-background transition hover:bg-fd-foreground/90"
              href="/docs"
            >
              {t('home.primaryCta')}
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full border border-fd-border bg-fd-card px-4 py-2.5 text-sm font-medium text-fd-foreground transition hover:border-fd-foreground/20 hover:bg-fd-accent/60"
              href="/api-ref"
            >
              {t('home.secondaryCta')}
            </a>
          </div>
        </div>
        <aside className="rounded-[1.75rem] border border-fd-border bg-fd-card/80 p-5 shadow-[0_24px_60px_-40px_rgba(17,24,39,0.35)] backdrop-blur">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-fd-muted-foreground">
            {t('home.panel.eyebrow')}
          </p>
          <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-fd-foreground">
            {t('home.panel.title')}
          </p>
          <p className="mt-3 text-sm leading-7 text-fd-muted-foreground">
            {t('home.panel.body')}
          </p>
          <div className="mt-5 border-t border-fd-border pt-4 text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
            {t('home.panel.caption')}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {cardKeys.map((key) => (
          <a
            className="group rounded-[1.5rem] border border-fd-border bg-fd-card/80 p-6 transition hover:-translate-y-0.5 hover:border-fd-foreground/15 hover:bg-fd-accent/40"
            href={hrefByKey[key]}
            key={key}
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-fd-muted-foreground">
              {t(`home.cards.${key}.eyebrow`)}
            </p>
            <h2 className="mt-4 text-lg leading-tight text-fd-foreground">
              {t(`home.cards.${key}.title`)}
            </h2>
            <p className="mt-3 text-sm leading-7 text-fd-muted-foreground">
              {t(`home.cards.${key}.body`)}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-fd-foreground">
                {t(`home.cards.${key}.cta`)}
              </span>
            </div>
          </a>
        ))}
      </section>

      <section className="grid gap-6 border-t border-fd-border/80 pt-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-fd-muted-foreground">
            {t('home.notes.eyebrow')}
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-fd-foreground">
            {t('home.notes.title')}
          </h2>
        </div>
        <p className="max-w-3xl text-base leading-8 text-fd-muted-foreground">
          {t('home.notes.body')}
        </p>
      </section>
    </div>
  );
}
