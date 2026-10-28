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
  MAX_FEEDBACK_COMMENT_LENGTH,
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
          补充反馈已提交，谢谢！
        </p>
        <p className="text-xs text-muted-foreground">
          如需补充其他反馈，可以再次点击“有”或“没有”。
        </p>
        <p className="text-xs text-muted-foreground">
          需要进一步跟进？可在 GitHub 创建 Issue，公开讨论并查看处理进展。需要
          GitHub 账号。
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCollapse}>
            收起
          </Button>
          <Button asChild size="sm" variant="outline">
            <a
              href={buildFeedbackIssueUrl(submitted)}
              target="_blank"
              rel="noopener noreferrer"
            >
              在 GitHub 创建 Issue
            </a>
          </Button>
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
        <label className="flex flex-col gap-2 font-medium">
          <span>
            补充说明
            <span className="font-normal text-muted-foreground">（选填）</span>
          </span>
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-base font-normal outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 sm:text-sm"
            value={helpfulness ? details[helpfulness] : ''}
            disabled={pending}
            maxLength={MAX_FEEDBACK_COMMENT_LENGTH}
            placeholder={
              isPositive
                ? '例如：哪些说明或示例对你有帮助，或还有什么建议。'
                : '例如：哪一步没有讲清楚，或哪段代码运行不成功。'
            }
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
            收起
          </Button>
          {canSubmit ? (
            <Button size="sm" onClick={() => void submit()} disabled={pending}>
              {pending ? '提交中…' : '提交'}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
