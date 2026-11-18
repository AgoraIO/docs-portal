'use client';

import {
  CheckIcon,
  MessageSquareTextIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDocsMeasurement } from '@/lib/analytics/measurement';
import {
  captureDocsPageFeedback,
  type DocsFeedbackValue,
} from '@/lib/analytics/posthog';
import { observeVisible } from '@/lib/analytics/visibility';
import { cn } from '@/lib/cn';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';

import { DocsFeedbackForm } from './DocsFeedbackForm';

type FeedbackKind = 'issue' | 'suggestion' | 'usability';

const FEEDBACK_ISSUE_URL = 'https://github.com/AgoraIO/docs-portal/issues/new';

export function DocsPageFeedback({
  className,
  compact = false,
  locale,
}: {
  className?: string;
  compact?: boolean;
  locale?: AppLocale | string;
}) {
  const { i18n } = useTranslation('common');
  const normalizedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const t = i18n.getFixedT(normalizedLocale, 'common');
  const selectedVariant =
    normalizedLocale === 'zh-CN' ? 'default' : 'secondary';
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (normalizedLocale !== 'zh-CN' || !root.current) return;
    return observeVisible(root.current, () =>
      getDocsMeasurement()?.prompt(
        'page_helpfulness',
        'content',
        'manual',
        getDocsMeasurement()?.contentContext(window.location.pathname),
      ),
    );
  }, [normalizedLocale]);
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const feedbackFormId = useId();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackPending, setFeedbackPending] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState(0);
  const feedbackTrigger = useRef<HTMLButtonElement | null>(null);
  const [feedbackKind, setFeedbackKind] = useState<FeedbackKind>('issue');
  const [feedbackText, setFeedbackText] = useState('');
  const feedbackUrl = buildFeedbackIssueUrl({
    kindLabel: t(`docs.feedbackKind.${feedbackKind}`),
    pageUrl:
      typeof window === 'undefined'
        ? ''
        : `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`,
    text: feedbackText,
    title: t('docs.feedbackIssueTitle'),
  });
  const submitHelpfulnessFeedback = (value: DocsFeedbackValue) => {
    setFeedback(value);
    const measurement =
      normalizedLocale === 'zh-CN' ? getDocsMeasurement() : undefined;
    if (measurement) {
      measurement.pageFeedback(value, window.location.pathname);
      return;
    }
    captureDocsPageFeedback({
      locale: normalizedLocale,
      value,
    });
  };
  const handleQuickFeedback = (
    value: DocsFeedbackValue,
    trigger: HTMLButtonElement,
  ) => {
    if (feedbackPending) return;
    if (normalizedLocale !== 'zh-CN') {
      submitHelpfulnessFeedback(value);
      return;
    }
    feedbackTrigger.current = trigger;
    if (feedbackSubmitted) {
      setFeedbackDraft((draft) => draft + 1);
      setFeedbackSubmitted(false);
    }
    if (feedback !== value) submitHelpfulnessFeedback(value);
    setFeedbackOpen((open) => feedbackSubmitted || feedback !== value || !open);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-[color:var(--line-soft)] bg-card px-4 py-3 shadow-[var(--docs-shadow-sm)]',
        className,
      )}
      data-testid="docs-feedback"
      ref={root}
    >
      <div
        className={cn(
          'flex flex-col gap-3',
          compact
            ? 'items-start'
            : 'sm:flex-row sm:items-center sm:justify-between',
        )}
      >
        <p className="text-sm font-medium text-[color:var(--ink-2)]">
          {t('docs.feedback')}
        </p>
        <div
          className={cn(
            'flex items-center gap-2',
            compact && 'w-full flex-wrap',
          )}
        >
          <Button
            disabled={feedbackPending}
            aria-pressed={feedback === 'yes'}
            aria-controls={
              normalizedLocale === 'zh-CN' ? feedbackFormId : undefined
            }
            aria-expanded={
              normalizedLocale === 'zh-CN'
                ? feedbackOpen && feedback === 'yes'
                : undefined
            }
            className={cn(
              'h-8 rounded-md px-3 text-xs',
              normalizedLocale === 'zh-CN' && 'motion-safe:active:scale-95',
            )}
            onClick={(event) => handleQuickFeedback('yes', event.currentTarget)}
            size="sm"
            variant={feedback === 'yes' ? selectedVariant : 'outline'}
          >
            {normalizedLocale === 'zh-CN' && feedback === 'yes' ? (
              <CheckIcon
                data-icon="inline-start"
                aria-hidden="true"
                className="motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-150"
              />
            ) : (
              <ThumbsUpIcon data-icon="inline-start" />
            )}
            {t('docs.feedbackYes')}
          </Button>
          <Button
            disabled={feedbackPending}
            aria-pressed={feedback === 'no'}
            aria-controls={
              normalizedLocale === 'zh-CN' ? feedbackFormId : undefined
            }
            aria-expanded={
              normalizedLocale === 'zh-CN'
                ? feedbackOpen && feedback === 'no'
                : undefined
            }
            className={cn(
              'h-8 rounded-md px-3 text-xs',
              normalizedLocale === 'zh-CN' && 'motion-safe:active:scale-95',
            )}
            onClick={(event) => handleQuickFeedback('no', event.currentTarget)}
            size="sm"
            variant={feedback === 'no' ? selectedVariant : 'outline'}
          >
            {normalizedLocale === 'zh-CN' && feedback === 'no' ? (
              <CheckIcon
                data-icon="inline-start"
                aria-hidden="true"
                className="motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-150"
              />
            ) : (
              <ThumbsDownIcon data-icon="inline-start" />
            )}
            {t('docs.feedbackNo')}
          </Button>
          {normalizedLocale !== 'zh-CN' ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className={cn(
                    'h-8 rounded-md px-3 text-xs',
                    compact && 'w-full',
                  )}
                  size="sm"
                >
                  <MessageSquareTextIcon data-icon="inline-start" />
                  {t('docs.feedbackOpen')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>{t('docs.feedbackDialogTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('docs.feedbackDialogDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <fieldset className="flex flex-col gap-2">
                    <legend className="text-sm font-medium text-[color:var(--ink-2)]">
                      {t('docs.feedbackKindLabel')}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {(['issue', 'suggestion', 'usability'] as const).map(
                        (kind) => (
                          <label
                            className={cn(
                              'flex cursor-pointer items-center gap-2 rounded-md border border-[color:var(--line-soft)] px-3 py-2 text-sm transition-colors hover:bg-[color:var(--surface-muted)]',
                              feedbackKind === kind &&
                                'border-[color:var(--line-strong)] bg-[color:var(--surface-muted)]',
                            )}
                            key={kind}
                          >
                            <input
                              checked={feedbackKind === kind}
                              className="size-4 accent-foreground"
                              name="docs-feedback-kind"
                              onChange={() => setFeedbackKind(kind)}
                              type="radio"
                            />
                            {t(`docs.feedbackKind.${kind}`)}
                          </label>
                        ),
                      )}
                    </div>
                  </fieldset>
                  <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--ink-2)]">
                    {t('docs.feedbackDetailsLabel')}
                    <textarea
                      className="min-h-32 resize-y rounded-md border border-[color:var(--line-soft)] bg-background px-3 py-2 text-sm font-normal text-[color:var(--ink-1)] outline-none transition-colors placeholder:text-[color:var(--ink-4)] focus:border-[color:var(--line-strong)]"
                      onChange={(event) => setFeedbackText(event.target.value)}
                      placeholder={t('docs.feedbackDetailsPlaceholder')}
                      value={feedbackText}
                    />
                  </label>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">
                      {t('docs.feedbackCancel')}
                    </Button>
                  </DialogClose>
                  <Button asChild>
                    <a href={feedbackUrl} rel="noreferrer" target="_blank">
                      {t('docs.feedbackSubmit')}
                    </a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>
      {normalizedLocale === 'zh-CN' ? (
        <DocsFeedbackForm
          key={feedbackDraft}
          id={feedbackFormId}
          expanded={feedbackOpen}
          onCollapse={() => {
            setFeedbackOpen(false);
            feedbackTrigger.current?.focus();
          }}
          helpfulness={feedback}
          onSubmitted={() => setFeedbackSubmitted(true)}
          onPendingChange={setFeedbackPending}
        />
      ) : null}
    </div>
  );
}

function buildFeedbackIssueUrl({
  kindLabel,
  pageUrl,
  text,
  title,
}: {
  kindLabel: string;
  pageUrl: string;
  text: string;
  title: string;
}) {
  const body = [
    `Page: ${pageUrl || '(unknown)'}`,
    `Feedback type: ${kindLabel}`,
    '',
    'Details:',
    text.trim(),
  ].join('\n');
  const params = new URLSearchParams({
    body,
    title,
  });

  return `${FEEDBACK_ISSUE_URL}?${params.toString()}`;
}
