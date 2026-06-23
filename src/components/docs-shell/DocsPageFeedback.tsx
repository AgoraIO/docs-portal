'use client';

import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';

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
  const t = i18n.getFixedT(normalizeLocale(locale) ?? DEFAULT_LOCALE, 'common');
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-[color:var(--line-soft)] bg-card px-4 py-3 shadow-[var(--docs-shadow-sm)]',
        compact ? 'items-start' : 'sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
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
  );
}
