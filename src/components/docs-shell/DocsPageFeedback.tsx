'use client';

import { CheckIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getDocsMeasurement } from '@/lib/analytics/measurement';
import {
  captureDocsFeedbackOpened,
  captureDocsFeedbackPrompted,
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
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    let prompted = false;
    return observeVisible(root.current, () => {
      if (normalizedLocale === 'en') {
        if (!prompted) {
          prompted = true;
          captureDocsFeedbackPrompted({ locale: normalizedLocale });
        }
        return;
      }
      getDocsMeasurement()?.prompt(
        'page_helpfulness',
        'content',
        'manual',
        getDocsMeasurement()?.contentContext(window.location.pathname),
      );
    });
  }, [normalizedLocale]);
  const [feedback, setFeedback] = useState<DocsFeedbackValue | null>(null);
  const feedbackFormId = useId();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackPending, setFeedbackPending] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState(0);
  const feedbackTrigger = useRef<HTMLButtonElement | null>(null);
  const handleQuickFeedback = (
    value: DocsFeedbackValue,
    trigger: HTMLButtonElement,
  ) => {
    if (feedbackPending) return;
    feedbackTrigger.current = trigger;
    if (feedbackSubmitted) {
      setFeedbackDraft((draft) => draft + 1);
      setFeedbackSubmitted(false);
    }
    if (feedback !== value) {
      setFeedback(value);
      const measurement =
        normalizedLocale === 'zh-CN' ? getDocsMeasurement() : undefined;
      if (measurement)
        measurement.pageFeedback(value, window.location.pathname);
      else captureDocsPageFeedback({ locale: normalizedLocale, value });
    }
    const opening = feedbackSubmitted || feedback !== value || !feedbackOpen;
    if (opening && normalizedLocale === 'en')
      captureDocsFeedbackOpened({ locale: normalizedLocale, value });
    setFeedbackOpen(opening);
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
          {(['yes', 'no'] as const).map((value) => {
            const Icon =
              feedback === value
                ? CheckIcon
                : value === 'yes'
                  ? ThumbsUpIcon
                  : ThumbsDownIcon;
            return (
              <Button
                key={value}
                disabled={feedbackPending}
                aria-pressed={feedback === value}
                aria-controls={feedbackFormId}
                aria-expanded={feedbackOpen && feedback === value}
                className="h-8 rounded-md px-3 text-xs motion-safe:active:scale-95"
                onClick={(event) =>
                  handleQuickFeedback(value, event.currentTarget)
                }
                size="sm"
                variant={feedback === value ? 'default' : 'outline'}
              >
                <Icon
                  data-icon="inline-start"
                  aria-hidden="true"
                  className={
                    feedback === value
                      ? 'motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-150'
                      : undefined
                  }
                />
                {t(value === 'yes' ? 'docs.feedbackYes' : 'docs.feedbackNo')}
              </Button>
            );
          })}
        </div>
      </div>
      <DocsFeedbackForm
        key={feedbackDraft}
        id={feedbackFormId}
        locale={normalizedLocale}
        expanded={feedbackOpen}
        onCollapse={() => {
          setFeedbackOpen(false);
          feedbackTrigger.current?.focus();
        }}
        helpfulness={feedback}
        onSubmitted={() => setFeedbackSubmitted(true)}
        onPendingChange={setFeedbackPending}
      />
    </div>
  );
}
