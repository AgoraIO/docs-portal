import {
  ArrowRight,
  BookOpenText,
  Braces,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { cn } from '@/lib/cn';
import { useLocale } from '@/lib/i18n/use-locale';

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
  const isZh = locale === 'zh-CN';
  const navDocs = locale === 'zh-CN' ? '文档' : 'Docs';
  const navApi = locale === 'zh-CN' ? 'API 参考' : 'API Reference';
  const navAi = locale === 'zh-CN' ? 'AI 工作流' : 'AI Workflows';
  const guideLinks = [
    {
      href: '/docs',
      description: t('home.guide.links.docs.description'),
      label: t('home.guide.links.docs.label'),
    },
    {
      href: '/api-ref',
      description: t('home.guide.links.api.description'),
      label: t('home.guide.links.api.label'),
    },
    {
      href: '/docs/convoai/restful/mcp-integrate',
      description: t('home.guide.links.tools.description'),
      label: t('home.guide.links.tools.label'),
    },
  ];
  const workflowSteps = [
    t('home.workflow.steps.enable'),
    t('home.workflow.steps.auth'),
    t('home.workflow.steps.quickstart'),
    t('home.workflow.steps.request'),
    t('home.workflow.steps.debug'),
    t('home.workflow.steps.expand'),
  ];
  const workspacePoints = [
    t('home.workspace.points.one'),
    t('home.workspace.points.two'),
    t('home.workspace.points.three'),
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden className="home-grid absolute inset-0 opacity-65" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(15,123,108,0.12),transparent_52%)] dark:bg-[radial-gradient(circle_at_top,rgba(76,174,155,0.12),transparent_56%)]"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[88rem] flex-col px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-6 border-b border-border/70 py-5">
          <a className="min-w-0" href="/">
            <Brand />
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a className="transition-colors hover:text-foreground" href="/docs">
              {navDocs}
            </a>
            <a
              className="transition-colors hover:text-foreground"
              href="/api-ref"
            >
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
          <section className="grid gap-6 border-b border-border/75 pb-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8">
            <div className="max-w-3xl">
              <Badge
                className={cn(isZh && 'tracking-[0.08em]')}
                variant="outline"
              >
                {t('home.eyebrow')}
              </Badge>
              <h1
                className={cn(
                  'mt-6 max-w-3xl text-balance font-semibold text-foreground',
                  isZh
                    ? 'text-[2.2rem] leading-[1.22] tracking-0 sm:text-[2.65rem] lg:text-[3.05rem]'
                    : 'text-[2.45rem] leading-[1.08] tracking-[-0.05em] sm:text-[3.05rem] lg:text-[3.45rem]',
                )}
              >
                {t('home.title')}
              </h1>
              <p
                className={cn(
                  'mt-5 max-w-2xl text-base text-muted-foreground',
                  isZh
                    ? 'leading-8 sm:text-[0.98rem]'
                    : 'leading-8 sm:text-[1rem]',
                )}
              >
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

            <Card className="workspace-panel overflow-hidden bg-card/96">
              <CardHeader className="gap-4">
                <Badge
                  className={cn('w-fit', isZh && 'tracking-[0.08em]')}
                  variant="outline"
                >
                  {t('home.workspace.eyebrow')}
                </Badge>
                <CardTitle className="text-[1.3rem] leading-snug">
                  {t('home.workspace.title')}
                </CardTitle>
                <CardDescription className="text-sm leading-7">
                  {t('home.workspace.body')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="grid gap-3 text-sm text-muted-foreground">
                  {workspacePoints.map((point) => (
                    <li
                      className="flex items-start gap-2.5 rounded-2xl bg-secondary/72 px-3.5 py-3"
                      key={point}
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="leading-6">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 py-8 sm:py-10 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
            <Card className="workspace-panel h-full bg-card/96">
              <CardHeader>
                <Badge
                  className={cn('w-fit', isZh && 'tracking-[0.08em]')}
                  variant="outline"
                >
                  {t('home.guide.eyebrow')}
                </Badge>
                <CardTitle className="text-[1.28rem] leading-snug">
                  {t('home.guide.title')}
                </CardTitle>
                <CardDescription>{t('home.guide.body')}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {guideLinks.map((item) => (
                  <a
                    className="workspace-link group flex items-start justify-between gap-3 rounded-2xl border border-border/85 bg-secondary/68 px-4 py-3 transition-colors hover:bg-accent/72"
                    href={item.href}
                    key={item.href}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </a>
                ))}
              </CardContent>
            </Card>

            <Card className="workspace-panel bg-card/96">
              <CardHeader>
                <Badge
                  className={cn('w-fit', isZh && 'tracking-[0.08em]')}
                  variant="outline"
                >
                  {t('home.workflow.eyebrow')}
                </Badge>
                <CardTitle className="text-[1.28rem] leading-snug">
                  {t('home.workflow.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="grid gap-3">
                  {workflowSteps.map((step, index) => (
                    <li
                      className="workflow-step grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-border/85 bg-background/74 px-4 py-3"
                      key={step}
                    >
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-foreground">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-sm leading-6 text-foreground/88">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-1 sm:my-2" />

          <section className="grid gap-4 py-8 lg:grid-cols-3">
            {cardKeys.map((key) => {
              const Icon = iconByKey[key];

              return (
                <a href={hrefByKey[key]} key={key}>
                  <Card className="workspace-panel group h-full border-border/85 bg-card/94 transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/28">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4">
                        <Badge
                          className={cn(isZh && 'tracking-[0.08em]')}
                          variant="outline"
                        >
                          {t(`home.cards.${key}.eyebrow`)}
                        </Badge>
                        <Icon className="size-4 text-primary/80" />
                      </div>
                      <CardTitle className="text-[1.28rem] leading-snug">
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

          <section className="grid gap-6 border-t border-border/80 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="max-w-2xl">
              <Badge
                className={cn(isZh && 'tracking-[0.08em]')}
                variant="outline"
              >
                {t('home.next.eyebrow')}
              </Badge>
              <h2 className="mt-5 max-w-xl text-[1.8rem] font-semibold tracking-[-0.02em] text-foreground sm:text-[2.05rem]">
                {t('home.next.title')}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
                {t('home.next.body')}
              </p>
            </div>
            <Card className="workspace-panel bg-card/94">
              <CardHeader>
                <CardTitle className="text-[1.1rem]">
                  {t('home.next.eyebrow')}
                </CardTitle>
                <CardDescription>
                  {isZh
                    ? '首页负责引导，正文负责深入，目录与 TOC 负责保持上下文。'
                    : 'Landing handles guidance, docs handle depth, and the shell keeps the context stable.'}
                </CardDescription>
              </CardHeader>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
