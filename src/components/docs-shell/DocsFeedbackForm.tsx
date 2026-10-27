'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  captureDocsFeedbackSubmission,
  type DocsFeedbackValue,
} from '@/lib/analytics/posthog';
import {
  buildFeedbackIssueUrl,
  type DocsFeedbackSubmission,
  feedbackReasonLabel,
  positiveFeedbackReasons as positiveLabels,
  prepareDocsFeedback,
  negativeFeedbackReasons as problemLabels,
} from '@/lib/docs-feedback';

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
}: {
  id: string;
  expanded: boolean;
  onCollapse: () => void;
  helpfulness: DocsFeedbackValue | null;
  onSubmitted?: () => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [problems, setProblems] = useState<ProblemReason[]>([]);
  const [positives, setPositives] = useState<PositiveReason[]>([]);
  const [details, setDetails] = useState('');
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
  const activeDetails = isPositive ? '' : details.trim();

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
          });
    if (!submission) return;
    attempt.current = { signature, submission };
    busy.current = true;
    setPending(true);
    setError('');
    onPendingChange?.(true);
    let githubWindow: Window | null = null;
    if (submission.details) {
      // Reserve the tab during the click gesture; the SDK may load asynchronously.
      try {
        githubWindow = window.open('about:blank', '_blank');
        if (githubWindow) githubWindow.opener = null;
      } catch {
        /* A manual continuation link remains available after submission. */
      }
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let recorded = false;
    try {
      recorded = await Promise.race([
        captureDocsFeedbackSubmission({
          id: submission.id,
          submittedAt: submission.submittedAt,
          helpfulness: submission.helpfulness,
          reasons: submission.reasons,
          hasComment: Boolean(submission.details),
          pagePath: new URL(submission.pageUrl).pathname,
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
      if (submission.details && githubWindow && !githubWindow.closed) {
        try {
          githubWindow.location.replace(buildFeedbackIssueUrl(submission));
        } catch {
          /* The saved continuation link can reopen the same prefilled draft. */
        }
      }
    } else {
      try {
        githubWindow?.close();
      } catch {
        /* The window may already be closed. */
      }
      setError('暂时无法上报，请稍后重试。填写内容已保留。');
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
        aria-label="已提交的反馈"
        className="not-prose flex flex-col gap-2 border-t pt-3 text-sm"
      >
        <p role="status" className="font-medium">
          {submitted.details
            ? '原因已上报。请在 GitHub 创建 Issue，完成文字反馈。'
            : '补充反馈已提交，谢谢！'}
        </p>
        <p className="text-muted-foreground">
          {submitted.reasons
            .map((reason) => feedbackReasonLabel(submitted.helpfulness, reason))
            .join('、')}
        </p>
        <p className="text-xs text-muted-foreground">
          本条反馈已锁定。再次点击“有”或“没有”可以提交新的反馈。
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCollapse}>
            收起
          </Button>
          {submitted.details ? (
            <Button asChild size="sm">
              <a
                href={buildFeedbackIssueUrl(submitted)}
                target="_blank"
                rel="noopener noreferrer"
              >
                继续在 GitHub 完成
              </a>
            </Button>
          ) : null}
        </div>
      </section>
    );
  return (
    <section
      id={id}
      aria-label={isPositive ? '正向反馈' : '改进反馈'}
      className="not-prose flex min-w-0 flex-col gap-3 border-t border-border pt-3"
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {isPositive
          ? '很高兴这篇文档对你有帮助，欢迎告诉我们哪些内容做得好。'
          : '愿意的话，告诉我们哪里没帮上忙，帮助我们改进文档。'}
      </p>
      <div className="flex min-w-0 flex-col gap-3 text-sm">
        {isPositive && (
          <fieldset className="min-w-0">
            <legend className="mb-1 font-medium">
              哪些地方对你有帮助？
              <span className="ml-1 font-normal text-muted-foreground">
                （选填，可多选）
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
                  <span>{positiveLabels[reason]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {!isPositive && (
          <fieldset className="min-w-0">
            <legend className="mb-1 font-medium">
              遇到的问题
              <span className="ml-1 font-normal text-muted-foreground">
                （选填，可多选）
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
                  <span>{problemLabels[problem]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {!isPositive && (
          <label className="flex flex-col gap-2 font-medium">
            <span>
              补充说明
              <span className="font-normal text-muted-foreground">
                （选填）
              </span>
            </span>
            <textarea
              className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-base font-normal outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 sm:text-sm"
              value={details}
              disabled={pending}
              maxLength={2000}
              placeholder="例如：哪一步没有讲清楚，或哪段代码运行不成功。"
              onChange={(event) => {
                setDetails(event.target.value);
                setError('');
              }}
            />
            {activeDetails && !problems.length ? (
              <span className="text-xs font-normal text-muted-foreground">
                未选择原因，将按“其他”提交。
              </span>
            ) : null}
          </label>
        )}
      </div>
      <div className="flex flex-col gap-3 border-t pt-3">
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {canSubmit && activeDetails ? (
          <p className="text-xs text-muted-foreground">
            原因会先上报，页面、评价、原因和说明会带到 GitHub。创建公开 Issue
            需要登录 GitHub。
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            disabled={pending}
          >
            收起
          </Button>
          {canSubmit ? (
            <Button size="sm" onClick={() => void submit()} disabled={pending}>
              {pending
                ? '提交中…'
                : activeDetails
                  ? '提交并前往 GitHub'
                  : '提交'}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
