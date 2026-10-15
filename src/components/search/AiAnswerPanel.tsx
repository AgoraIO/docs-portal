'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { askDocumentQuestion } from '@/lib/ai-answer/client';
import type { AnswerRequest, AnswerResponse } from '@/lib/ai-answer/contracts';
import { AnswerMarkdown } from './AnswerMarkdown';

type Filters = Omit<AnswerRequest, 'question'>;
type View = {
  key: string;
  status: 'idle' | 'loading' | 'done' | 'error' | 'cancelled';
  result?: AnswerResponse;
};
export function AiAnswerPanel({
  filters,
  onClose,
}: {
  filters: Filters;
  onClose: () => void;
}) {
  const key = JSON.stringify([
    filters.product,
    filters.platform,
    filters.version,
    filters.type,
  ]);
  const [question, setQuestion] = useState('');
  const [view, setView] = useState<View>({ key, status: 'idle' });
  const active = useRef<AbortController | null>(null);
  const current = view.key === key ? view : { key, status: 'idle' as const };
  useEffect(() => {
    active.current?.abort();
    active.current = null;
    setView({ key, status: 'idle' });
    return () => {
      active.current?.abort();
      active.current = null;
    };
  }, [key]);
  function cancel() {
    active.current?.abort();
    active.current = null;
    setView({ key, status: 'cancelled' });
  }
  async function submit() {
    if (!question.trim()) return;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setView({ key, status: 'loading' });
    try {
      const result = await askDocumentQuestion(
        { question: question.trim(), ...filters },
        controller.signal,
      );
      if (active.current === controller && !controller.signal.aborted)
        setView({ key, status: 'done', result });
    } catch {
      if (active.current === controller && !controller.signal.aborted)
        setView({ key, status: 'error' });
    }
  }
  return (
    <section
      aria-labelledby="ai-answer-title"
      className="my-6 flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="ai-answer-title" className="text-lg font-semibold">
          AI 问答
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            cancel();
            onClose();
          }}
        >
          关闭 AI 问答
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {current.result?.mode === 'local-demo'
          ? '本地文档摘录演示，尚未调用百炼知识库和 AI 模型。'
          : current.result?.mode === 'bailian'
            ? current.result.status === 'answered'
              ? '百炼知识库与模型生成，回答仅供参考，请结合来源文档核对。'
              : '已检索百炼知识库，未找到足够依据。'
            : '基于文档内容回答，请结合参考文档核对。'}
      </p>
      <p className="text-sm text-muted-foreground">
        沿用当前产品、平台、版本和文档类型筛选；修改筛选后请重新提问。
      </p>
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label htmlFor="ai-question" className="text-sm font-medium">
          你的问题
        </label>
        <textarea
          id="ai-question"
          rows={3}
          maxLength={2000}
          value={question}
          className="w-full rounded-md border bg-background p-3 text-sm"
          placeholder="例如：如何生成 Token？"
          onChange={(event) => {
            active.current?.abort();
            active.current = null;
            setView({ key, status: 'idle' });
            setQuestion(event.target.value);
          }}
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!question.trim() || current.status === 'loading'}
          >
            提问
          </Button>
          {current.status === 'loading' && (
            <Button type="button" variant="outline" onClick={cancel}>
              取消
            </Button>
          )}
        </div>
      </form>
      {current.status === 'loading' && <p role="status">正在查找文档…</p>}
      {current.status === 'cancelled' && (
        <p role="status">已取消，可以重新提问。</p>
      )}
      {current.status === 'error' && (
        <div role="alert" className="flex items-center gap-3">
          <p>问答暂时不可用，请稍后重试。</p>
          <Button variant="outline" onClick={() => void submit()}>
            重试
          </Button>
        </div>
      )}
      {current.result && (
        <div aria-live="polite" className="flex min-w-0 flex-col gap-4">
          <AnswerMarkdown text={current.result.answer} />
          {current.result.citations.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">参考文档</h3>
              <ul className="flex flex-col gap-2">
                {current.result.citations.map((c) => (
                  <li key={c.id}>
                    <a
                      className="text-primary underline underline-offset-4"
                      href={c.url}
                    >
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
