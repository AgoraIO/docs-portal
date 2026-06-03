'use client';

import { Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';
import { useTransientScrollbar } from './useTransientScrollbar';

export function DocsMainColumn({
  children,
  locale = DEFAULT_LOCALE,
  next,
  previous,
}: {
  children: React.ReactNode;
  locale?: AppLocale | string;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
}) {
  const { isScrollbarVisible, scrollContainerRef } =
    useTransientScrollbar<HTMLDivElement>();

  return (
    <main
      className="h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-background"
      data-testid="docs-main-column"
    >
      <div
        className="px-4 py-8 sm:px-6 lg:hidden lg:px-10"
        data-testid="docs-main-mobile-flow"
      >
        <div className="min-w-0">{children}</div>
        <DocsPageFooter locale={locale} next={next} previous={previous} />
      </div>
      <div
        className={cn(
          'docs-scrollbar hidden h-full min-h-0 overflow-y-auto lg:block',
          isScrollbarVisible && 'docs-scrollbar-visible',
        )}
        data-testid="docs-main-desktop-scroll"
        ref={scrollContainerRef}
      >
        <div className="flex min-h-full flex-col px-4 py-8 sm:px-6 lg:px-10">
          <div className="min-w-0 flex-1">{children}</div>
          <DocsPageFooter locale={locale} next={next} previous={previous} />
        </div>
      </div>
    </main>
  );
}

function DocsPageFooter({
  locale,
  next,
  previous,
}: {
  locale: AppLocale | string;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(normalizeLocale(locale) ?? DEFAULT_LOCALE, 'common');
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  return (
    <footer
      className="mt-10 flex max-w-[var(--content-max)] flex-col gap-5 border-t border-[color:var(--line-soft)] pt-6"
      data-testid="docs-page-footer"
    >
      <div
        className="flex flex-col gap-3 rounded-lg border border-[color:var(--line-soft)] bg-card px-4 py-3 shadow-[var(--docs-shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
        data-testid="docs-feedback"
      >
        <p className="text-sm font-medium text-[color:var(--ink-2)]">
          {t('docs.feedback')}
        </p>
        <div className="flex items-center gap-2">
          <Button
            aria-pressed={feedback === 'yes'}
            className="h-8 rounded-md px-3 text-xs"
            onClick={() => setFeedback('yes')}
            size="sm"
            variant={feedback === 'yes' ? 'secondary' : 'outline'}
          >
            <ThumbsUpIcon data-icon="inline-start" />
            {t('docs.feedbackYes')}
          </Button>
          <Button
            aria-pressed={feedback === 'no'}
            className="h-8 rounded-md px-3 text-xs"
            onClick={() => setFeedback('no')}
            size="sm"
            variant={feedback === 'no' ? 'secondary' : 'outline'}
          >
            <ThumbsDownIcon data-icon="inline-start" />
            {t('docs.feedbackNo')}
          </Button>
        </div>
      </div>
      {previous || next ? (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          data-testid="docs-pager"
        >
          {previous ? (
            <FooterLink direction={t('docs.previous')} link={previous} />
          ) : (
            <div />
          )}
          {next ? (
            <FooterLink align="end" direction={t('docs.next')} link={next} />
          ) : (
            <div />
          )}
        </div>
      ) : null}
    </footer>
  );
}

function FooterLink({
  align = 'start',
  direction,
  link,
}: {
  align?: 'start' | 'end';
  direction: string;
  link: { title: string; url: string };
}) {
  return (
    <Link
      className={cn(
        'flex min-w-0 flex-1 flex-col rounded-lg border border-[color:var(--line-soft)] bg-card px-4 py-3 text-sm transition-colors hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-muted)]',
        align === 'end' && 'items-end text-right',
      )}
      params={{}}
      search={{}}
      to={link.url}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-4)]">
        {direction}
      </span>
      <span className="max-w-full truncate font-medium text-[color:var(--ink-1)]">
        {align === 'start' ? (
          <ArrowLeftIcon className="mr-1.5 inline size-3.5" />
        ) : null}
        {link.title}
        {align === 'end' ? (
          <ArrowRightIcon className="ml-1.5 inline size-3.5" />
        ) : null}
      </span>
    </Link>
  );
}
