import {
  ArrowRight,
  BookOpenText,
  Braces,
  PanelsTopLeft,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/i18n/use-locale';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const cardKeys = ['docs', 'api', 'tools'] as const;
const hrefByKey = {
  docs: '/docs',
  api: '/api-ref',
  tools: '/docs/convoai/restful/mcp-integrate',
} as const;

const iconByKey = {
  docs: BookOpenText,
  api: Braces,
  tools: Sparkles,
} as const;

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card/90 shadow-[0_16px_40px_-28px_rgba(33,139,120,0.3)]">
        <div className="flex items-end gap-1">
          <span className="h-3.5 w-1 rounded-full bg-primary/75" />
          <span className="h-5.5 w-1 rounded-full bg-foreground" />
          <span className="h-2.5 w-1 rounded-full bg-border" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-[-0.02em]">
          Agora Docs
        </p>
        <p className="truncate text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
          Developer Surface
        </p>
      </div>
    </div>
  );
}

export function HomePage() {
  const { t } = useTranslation('common');
  const { locale } = useLocale();
  const navDocs = locale === 'zh-CN' ? '文档' : 'Docs';
  const navApi = locale === 'zh-CN' ? 'API 参考' : 'API Reference';
  const navAi = locale === 'zh-CN' ? 'AI 工作流' : 'AI Workflows';

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden className="home-grid absolute inset-0 opacity-80" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top,rgba(33,139,120,0.12),transparent_42%)]"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[96rem] flex-col px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-6 border-b border-border/70 py-5">
          <a className="min-w-0" href="/">
            <Brand />
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a className="transition-colors hover:text-foreground" href="/docs">
              {navDocs}
            </a>
            <a className="transition-colors hover:text-foreground" href="/api-ref">
              {navApi}
            </a>
            <a
              className="transition-colors hover:text-foreground"
              href="/docs/convoai/restful/mcp-integrate"
            >
              {navAi}
            </a>
          </nav>
        </header>

        <main className="flex-1 py-8 sm:py-10 lg:py-14">
          <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div className="max-w-4xl">
              <Badge variant="outline">{t('home.eyebrow')}</Badge>
              <h1 className="mt-7 max-w-4xl text-balance text-[2.95rem] font-semibold tracking-[-0.065em] text-foreground sm:text-[4.3rem] lg:text-[5.2rem]">
                {t('home.title')}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-[1.0625rem]">
                {t('home.description')}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  className={buttonVariants({
                    className: 'pl-4 pr-3',
                    size: 'lg',
                  })}
                  href="/docs"
                >
                  {t('home.primaryCta')}
                  <ArrowRight />
                </a>
                <a
                  className={buttonVariants({
                    className: 'pl-4 pr-3',
                    size: 'lg',
                    variant: 'outline',
                  })}
                  href="/api-ref"
                >
                  {t('home.secondaryCta')}
                  <ArrowRight />
                </a>
              </div>
            </div>

            <Card className="overflow-hidden bg-card/92">
              <CardHeader className="gap-4">
                <Badge className="w-fit" variant="secondary">
                  {t('home.panel.eyebrow')}
                </Badge>
                <CardTitle className="text-2xl">{t('home.panel.title')}</CardTitle>
                <CardDescription className="text-sm leading-7">
                  {t('home.panel.body')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1">
                <Separator className="mb-5" />
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <PanelsTopLeft className="size-4 text-primary" />
                  <span>{t('home.panel.caption')}</span>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-10 sm:my-14" />

          <section className="grid gap-4 lg:grid-cols-3">
            {cardKeys.map((key) => {
              const Icon = iconByKey[key];

              return (
                <a href={hrefByKey[key]} key={key}>
                  <Card className="group h-full border-border/85 bg-card/82 transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/28">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4">
                        <Badge variant="outline">{t(`home.cards.${key}.eyebrow`)}</Badge>
                        <Icon className="size-4 text-primary/80" />
                      </div>
                      <CardTitle className="text-[1.4rem] leading-tight">
                        {t(`home.cards.${key}.title`)}
                      </CardTitle>
                      <CardDescription>
                        {t(`home.cards.${key}.body`)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span>{t(`home.cards.${key}.cta`)}</span>
                      <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </section>

          <section className="grid gap-8 border-t border-border/80 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,18rem)_1fr]">
            <div>
              <Badge variant="outline">{t('home.notes.eyebrow')}</Badge>
              <h2 className="mt-5 max-w-sm text-3xl font-semibold tracking-[-0.05em] text-foreground">
                {t('home.notes.title')}
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              {t('home.notes.body')}
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
