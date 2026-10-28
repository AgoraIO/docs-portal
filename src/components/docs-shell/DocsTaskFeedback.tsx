'use client';

import { MessageSquareTextIcon } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  type FeedbackQuestion,
  failureReasons,
  resolutionAnswers,
} from '@/lib/analytics/docs-measurement';
import {
  getDocsMeasurement,
  measurementEnabled,
} from '@/lib/analytics/measurement';
import { observeVisible } from '@/lib/analytics/visibility';
import { cn } from '@/lib/cn';

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
  compact = false,
  surface,
}: {
  compact?: boolean;
  surface: 'content' | 'search_page' | 'search_dialog';
}) {
  const [open, setOpen] = useState(false);
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
  const saved = Boolean(
    resolution || ease || (Array.isArray(reasons) && reasons.length),
  );
  // A portal mounts after the initial effect; observe its actual content node.
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    setEnabled(measurementEnabled());
  }, []);
  useEffect(() => {
    if (!enabled || !open || !root) return;
    const stops = [
      ...root.querySelectorAll<HTMLElement>('[data-feedback-question]'),
    ].map((element) =>
      observeVisible(element, () => {
        const question = element.dataset.feedbackQuestion as FeedbackQuestion;
        getDocsMeasurement()?.prompt(question, surface, 'manual');
      }),
    );
    return () => {
      for (const stop of stops) stop();
    };
  }, [open, root, surface, enabled]);
  if (!enabled) return null;
  const answer = (question: FeedbackQuestion, value: string | string[]) => {
    getDocsMeasurement()?.feedback(question, value, surface, 'manual');
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          'not-prose',
          compact
            ? 'contents'
            : 'flex flex-wrap items-center justify-between gap-2',
        )}
        data-testid="docs-task-feedback"
      >
        {!compact && (
          <p className="text-xs text-muted-foreground">
            {saved
              ? '谢谢反馈，帮助我们改进文档。'
              : '这次查找体验如何？欢迎告诉我们。'}
          </p>
        )}
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant={compact ? 'outline' : 'ghost'}
            className={compact ? 'h-8 rounded-md px-3 text-xs' : undefined}
          >
            <MessageSquareTextIcon data-icon="inline-start" />
            {compact ? '查找体验' : saved ? '修改查找反馈' : '反馈查找体验'}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent
        className="not-prose max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
        closeLabel="关闭反馈"
        ref={setRoot}
      >
        <DialogHeader className="text-left">
          <DialogTitle>这次查找有帮助吗？</DialogTitle>
          <DialogDescription>
            可只答一题，选择后自动保存。你的反馈将帮助我们改进文档。
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-w-0 flex-col gap-6 py-2 text-sm">
          <fieldset
            className="flex min-w-0 flex-col gap-3"
            data-feedback-question="resolution"
          >
            <legend className="mb-3 font-medium">
              这次找到的信息解决你的问题了吗？
            </legend>
            <ToggleGroup
              aria-label="问题解决情况"
              type="single"
              value={typeof resolution === 'string' ? resolution : ''}
              onValueChange={(value) => {
                if (!value) return;
                answer('resolution', value);
              }}
              variant="contrast"
              size="default"
              spacing={2}
              className="grid w-full grid-cols-2 sm:grid-cols-4"
            >
              {resolutionAnswers.map((value, index) => (
                <ToggleGroupItem key={value} value={value}>
                  {resolutionLabels[index]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </fieldset>
          <fieldset
            className="flex min-w-0 flex-col gap-3"
            data-feedback-question="ease"
          >
            <legend className="mb-3 font-medium">
              找到并使用这些信息有多容易？
              <span className="ml-1 font-normal text-muted-foreground">
                （选填）
              </span>
            </legend>
            <ToggleGroup
              aria-label="查找易用性评分"
              type="single"
              value={typeof ease === 'string' ? ease : ''}
              onValueChange={(value) => {
                if (!value) return;
                answer('ease', value);
              }}
              variant="contrast"
              size="default"
              spacing={2}
              className="grid w-full grid-cols-5"
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
            <p className="flex justify-between text-xs text-muted-foreground">
              <span>1 非常困难</span>
              <span>5 非常容易</span>
            </p>
          </fieldset>
          <fieldset
            className="flex min-w-0 flex-col gap-3"
            data-feedback-question="reasons"
          >
            <legend className="mb-3 font-medium">
              哪一步没有帮上忙？
              <span className="ml-1 font-normal text-muted-foreground">
                （选填，可多选）
              </span>
            </legend>
            <ToggleGroup
              aria-label="未能帮上忙的原因"
              type="multiple"
              value={Array.isArray(reasons) ? reasons : []}
              onValueChange={(value) => {
                answer('reasons', value);
              }}
              variant="contrast"
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
        </div>
        <div className="flex flex-col gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground" role="status">
            {saved
              ? '谢谢反馈，已自动保存，你可以随时修改。'
              : '不填写也可以关闭，继续阅读。'}
          </p>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                getDocsMeasurement()?.reset();
                setOpen(false);
              }}
            >
              开始新问题
            </Button>
            <DialogClose asChild>
              <Button>完成</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
