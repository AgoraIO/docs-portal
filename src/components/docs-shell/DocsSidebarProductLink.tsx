'use client';

import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { AppLocale } from '@/lib/i18n/i18n-config';

export function DocsSidebarProductLink({
  href,
  locale,
  mode,
  onSelectPath,
}: {
  href: string;
  locale: AppLocale;
  mode: 'desktop' | 'mobile';
  onSelectPath: () => void;
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(locale, 'common');

  return (
    <div
      className={cn(
        'border-t border-border/70 pt-3',
        mode === 'desktop' ? 'mt-auto' : 'mt-2',
      )}
      data-testid="docs-sidebar-product-link"
    >
      <Button
        asChild
        className="w-full justify-between gap-2 text-left"
        size="sm"
        variant="outline"
      >
        <Link onClick={onSelectPath} params={{}} search={{}} to={href}>
          <ArrowLeftIcon aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 break-words whitespace-normal">
            {t('docs.viewProductDocs')}
          </span>
        </Link>
      </Button>
    </div>
  );
}
