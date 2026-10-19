'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  type FeedbackQuestion,
  failureReasons,
  resolutionAnswers,
} from '@/lib/analytics/docs-measurement';
import {
  getDocsMeasurement,
  invitationAllowed,
  markInvitationVisible,
  measurementEnabled,
} from '@/lib/analytics/measurement.client';
import { observeVisible } from '@/lib/analytics/visibility';

const resolutionLabels = ['解决', '部分解决', '未解决', '尚未验证'];
const reasonLabels = [
  '找不到',
  '不相关',
  '产品 / 平台 / 版本不对',
  '内容过期',
  '内容错误',
  '看不懂',
  '步骤无效',
  '太慢',
  '其他',
];

export function DocsTaskFeedback({
  surface,
}: {
  surface: 'content' | 'search_page' | 'search_dialog';
}) {
  const [expanded, setExpanded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const measurement = getDocsMeasurement();
  useSyncExternalStore(
    measurement?.subscribe ?? (() => () => {}),
    measurement?.revision ?? (() => 0),
    () => 0,
  );
  const resolution = measurement?.answer('resolution');
  const ease = measurement?.answer('ease');
  const reasons = measurement?.answer('reasons');
  const [saved, setSaved] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const invited = enabled && invitationAllowed();
  const source = invited ? 'sampled_invitation' : 'manual';
  useEffect(() => {
    setEnabled(measurementEnabled());
  }, []);
  const visible = expanded || invited;
  useEffect(() => {
    if (!enabled || !visible || !root.current) return;
    const stops = [
      ...root.current.querySelectorAll<HTMLElement>('[data-feedback-question]'),
    ].map((element) =>
      observeVisible(element, () => {
        const question = element.dataset.feedbackQuestion as FeedbackQuestion;
        if (invited && question === 'resolution') markInvitationVisible();
        getDocsMeasurement()?.prompt(question, surface, source);
      }),
    );
    return () => {
      for (const stop of stops) stop();
    };
  }, [visible, invited, surface, source, enabled]);
  if (!enabled) return null;
  const answer = (question: FeedbackQuestion, value: string | string[]) => {
    getDocsMeasurement()?.feedback(question, value, surface, source);
    setSaved(true);
  };
  return (
    <div
      className="not-prose rounded-lg border bg-card px-4 py-3 text-sm"
      ref={root}
      data-testid="docs-task-feedback"
    >
      {!visible ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setExpanded(true)}
          className="h-auto px-0 py-1 text-muted-foreground"
        >
          反馈这次查找是否解决了问题
        </Button>
      ) : (
        <div className="flex flex-col gap-4">
          <fieldset
            className="min-w-0 space-y-2"
            data-feedback-question="resolution"
          >
            <legend className="font-medium">
              这次找到的信息解决你的问题了吗？
            </legend>
            <ToggleGroup
              type="single"
              value={typeof resolution === 'string' ? resolution : ''}
              onValueChange={(value) => {
                if (!value) return;
                answer('resolution', value);
              }}
              variant="outline"
              size="sm"
              spacing={2}
              className="flex-wrap justify-start"
            >
              {resolutionAnswers.map((value, index) => (
                <ToggleGroupItem key={value} value={value}>
                  {resolutionLabels[index]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </fieldset>
          <fieldset className="min-w-0 space-y-2" data-feedback-question="ease">
            <legend className="font-medium">
              找到并使用这些信息有多容易？
              <span className="ml-1 font-normal text-muted-foreground">
                （选填）
              </span>
            </legend>
            <ToggleGroup
              type="single"
              value={typeof ease === 'string' ? ease : ''}
              onValueChange={(value) => {
                if (!value) return;
                answer('ease', value);
              }}
              variant="outline"
              size="sm"
              spacing={2}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={String(value)}
                  aria-label={`${value} 分${value === 1 ? '，非常困难' : value === 5 ? '，非常容易' : ''}`}
                >
                  {value}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">
              1 非常困难 · 5 非常容易
            </p>
          </fieldset>
          <fieldset
            className="min-w-0 space-y-2"
            data-feedback-question="reasons"
          >
            <legend className="font-medium">
              哪一步没有帮上忙？
              <span className="ml-1 font-normal text-muted-foreground">
                （选填，可多选）
              </span>
            </legend>
            <ToggleGroup
              type="multiple"
              value={Array.isArray(reasons) ? reasons : []}
              onValueChange={(value) => {
                answer('reasons', value);
              }}
              variant="outline"
              size="sm"
              spacing={2}
              className="flex-wrap justify-start"
            >
              {failureReasons.map((value, index) => (
                <ToggleGroupItem key={value} value={value}>
                  {reasonLabels[index]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </fieldset>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground" role="status">
              {saved
                ? '谢谢反馈，你可以随时修改。'
                : '可只答一题，不填写也可以继续阅读。'}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                getDocsMeasurement()?.reset();
                setSaved(false);
                setExpanded(false);
              }}
            >
              开始新问题
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
