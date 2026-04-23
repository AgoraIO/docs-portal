import { useTranslation } from 'react-i18next';

const sectionKeys = ['explore', 'build', 'adapt'] as const;

export function HomePage() {
  const { t } = useTranslation('common');

  return (
    <div className="mx-auto flex w-full max-w-[var(--oatmeal-container-page)] flex-col gap-12 px-6 py-8 lg:px-10 lg:py-10">
      <section className="overflow-hidden rounded-[2rem] border border-fd-border/80 bg-linear-to-br from-background via-card to-muted px-6 py-8 shadow-[0_1px_0_0_rgb(255_255_255_/_0.1)_inset] sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.7fr)] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {t('home.eyebrow')}
            </p>
            <h1
              className="mt-5 max-w-4xl text-5xl leading-[0.92] tracking-tight text-foreground sm:text-6xl lg:text-[5.6rem]"
              style={{ fontFamily: 'var(--font-display)' }}
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
              <a
                className="inline-flex items-center justify-center rounded-full border border-fd-border bg-fd-background/80 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-fd-accent"
                href="https://github.com/Shengwang-Community/docs-portal"
                rel="noreferrer"
                target="_blank"
              >
                {t('home.secondaryCta')}
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.6rem] border border-fd-border/70 bg-fd-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Oatmeal
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Calm surfaces, clearer reading rhythm, and a docs shell that
                feels aligned with the new console instead of a separate
                product.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-fd-border/70 bg-fd-secondary/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Vite 8 + TanStack
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Keep the current Fumadocs content pipeline, but modernize the
                app shell with theme and locale controls that match the console.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {sectionKeys.map((key) => (
          <article
            className="rounded-[1.75rem] border border-fd-border/80 bg-fd-card/80 p-6"
            key={key}
          >
            <h2 className="text-2xl leading-tight text-foreground">
              {t(`home.sections.${key}.title`)}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {t(`home.sections.${key}.body`)}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
