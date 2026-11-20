'use client';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  captureDocsFeedbackSubmission,
  type DocsFeedbackValue,
} from '@/lib/analytics/posthog';
import {
  buildFeedbackIssueUrl,
  type DocsFeedbackSubmission,
  feedbackReasonLabel,
  MAX_FEEDBACK_COMMENT_LENGTH,
  positiveFeedbackReasons as positiveLabels,
  prepareDocsFeedback,
  negativeFeedbackReasons as problemLabels,
} from '@/lib/docs-feedback';
import type { AppLocale } from '@/lib/i18n/i18n-config';

type PositiveReason = keyof typeof positiveLabels;
const positiveOptions = Object.keys(positiveLabels) as PositiveReason[];
type ProblemReason = keyof typeof problemLabels;
const problemReasons = Object.keys(problemLabels) as ProblemReason[];

export function DocsFeedbackForm({
  id,
  expanded,
  onCollapse,
  helpfulness,
  onSubmitted,
  onPendingChange,
  locale = 'zh-CN',
}: {
  id: string;
  expanded: boolean;
  onCollapse: () => void;
  helpfulness: DocsFeedbackValue | null;
  onSubmitted?: () => void;
  onPendingChange?: (pending: boolean) => void;
  locale?: AppLocale;
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(locale, 'common', 'docs.feedbackForm');
  const [problems, setProblems] = useState<ProblemReason[]>([]);
  const [positives, setPositives] = useState<PositiveReason[]>([]);
  const [details, setDetails] = useState({ yes: '', no: '' });
  const [submitted, setSubmitted] = useState<DocsFeedbackSubmission | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const attempt = useRef<{
    signature: string;
    submission: DocsFeedbackSubmission;
  } | null>(null);
  const isPositive = helpfulness === 'yes';
  const activeProblems = isPositive ? [] : problems;
  const activePositives = isPositive ? positives : [];
  const activeDetails = helpfulness ? details[helpfulness].trim() : '';

  const canSubmit = Boolean(
    helpfulness &&
      (activeProblems.length || activePositives.length || activeDetails),
  );
  const submit = async () => {
    if (busy.current || submitted || !canSubmit || !helpfulness) return;
    const pageUrl = `${window.location.origin}${window.location.pathname}`;
    const reasons = isPositive ? activePositives : activeProblems;
    const signature = JSON.stringify([
      helpfulness,
      reasons,
      activeDetails,
      pageUrl,
      document.title,
      locale,
    ]);
    const submission =
      attempt.current?.signature === signature
        ? attempt.current.submission
        : prepareDocsFeedback({
            id: crypto.randomUUID(),
            submittedAt: new Date().toISOString(),
            helpfulness,
            reasons,
            details: activeDetails,
            pageUrl,
            pageTitle: document.title,
            locale,
          });
    if (!submission) return;
    attempt.current = { signature, submission };
    busy.current = true;
    setPending(true);
    setError('');
    onPendingChange?.(true);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let recorded = false;
    try {
      recorded = await Promise.race([
        captureDocsFeedbackSubmission({
          id: submission.id,
          submittedAt: submission.submittedAt,
          helpfulness: submission.helpfulness,
          reasons: submission.reasons,
          details: submission.details,
          pagePath: new URL(submission.pageUrl).pathname,
          locale,
        }),
        new Promise<boolean>((resolve) => {
          timer = setTimeout(() => resolve(false), 10_000);
        }),
      ]);
    } catch {
      /* Keep the draft for retry. */
    } finally {
      clearTimeout(timer);
    }
    if (recorded) {
      setSubmitted(submission);
      onSubmitted?.();
    } else {
      setError(t('error'));
    }
    busy.current = false;
    setPending(false);
    onPendingChange?.(false);
  };

  if (!expanded) return null;
  if (submitted)
    return (
      <section
        id={id}
        aria-label={t('submittedLabel')}
        className="not-prose flex flex-col gap-2 border-t pt-3 text-sm"
      >
        <p role="status" className="font-medium">
          {t('submitted')}
        </p>
        <p className="text-xs text-muted-foreground">{t('newFeedback')}</p>
        <p className="text-xs text-muted-foreground">{t('followUp')}</p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCollapse}>
            {t('collapse')}
          </Button>
          <Button asChild size="sm" variant="outline">
            <a
              href={buildFeedbackIssueUrl(submitted)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('createIssue')}
            </a>
          </Button>
        </div>
      </section>
    );
  return (
    <section
      id={id}
      aria-label={t(isPositive ? 'positiveLabel' : 'negativeLabel')}
      className="not-prose flex min-w-0 flex-col gap-3 border-t border-border pt-3"
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t(isPositive ? 'positiveIntro' : 'negativeIntro')}
      </p>
      <div className="flex min-w-0 flex-col gap-3 text-sm">
        {isPositive && (
          <fieldset className="min-w-0">
            <legend className="mb-1 font-medium">
              {t('positiveReasons')}
              <span className="ml-1 font-normal text-muted-foreground">
                {t('optionalMultiple')}
              </span>
            </legend>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              {positiveOptions.map((reason) => (
                <label
                  key={reason}
                  className="flex max-w-full cursor-pointer items-center gap-2 py-1.5 pointer-coarse:min-h-11"
                >
                  <input
                    type="checkbox"
                    disabled={pending}
                    className="size-4 shrink-0 accent-primary"
                    checked={positives.includes(reason)}
                    onChange={(event) => {
                      setPositives(
                        event.target.checked
                          ? [...positives, reason]
                          : positives.filter((item) => item !== reason),
                      );
                      setError('');
                    }}
                  />
                  <span>{feedbackReasonLabel('yes', reason, locale)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {!isPositive && (
          <fieldset className="min-w-0">
            <legend className="mb-1 font-medium">
              {t('negativeReasons')}
              <span className="ml-1 font-normal text-muted-foreground">
                {t('optionalMultiple')}
              </span>
            </legend>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              {problemReasons.map((problem) => (
                <label
                  key={problem}
                  className="flex max-w-full cursor-pointer items-center gap-2 py-1.5 pointer-coarse:min-h-11"
                >
                  <input
                    type="checkbox"
                    disabled={pending}
                    className="size-4 shrink-0 accent-primary"
                    checked={problems.includes(problem)}
                    onChange={(event) => {
                      setProblems(
                        event.target.checked
                          ? [...problems, problem]
                          : problems.filter((item) => item !== problem),
                      );
                      setError('');
                    }}
                  />
                  <span>{feedbackReasonLabel('no', problem, locale)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label className="flex flex-col gap-2 font-medium">
          <span>
            {t('details')}
            <span className="ml-1 font-normal text-muted-foreground">
              {t('optional')}
            </span>
          </span>
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-base font-normal outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 sm:text-sm"
            value={helpfulness ? details[helpfulness] : ''}
            disabled={pending}
            maxLength={MAX_FEEDBACK_COMMENT_LENGTH}
            placeholder={t(
              isPositive ? 'positivePlaceholder' : 'negativePlaceholder',
            )}
            onChange={(event) => {
              if (!helpfulness) return;
              const value = event.target.value;
              setDetails((draft) => ({ ...draft, [helpfulness]: value }));
              setError('');
            }}
          />
        </label>
      </div>
      <div className="flex flex-col gap-3 border-t pt-3">
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            disabled={pending}
          >
            {t('collapse')}
          </Button>
          {canSubmit ? (
            <Button size="sm" onClick={() => void submit()} disabled={pending}>
              {t(pending ? 'pending' : 'submit')}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
