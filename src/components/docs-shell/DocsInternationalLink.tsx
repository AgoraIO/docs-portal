import { ExternalLinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { AppLocale } from '@/lib/i18n/i18n-config';
import { internationalDocsUrl } from '@/lib/shared';

export function DocsInternationalLink({
  className,
  locale,
  onClick,
}: {
  className?: string;
  locale: AppLocale;
  onClick?: () => void;
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(locale, 'common');

  if (locale !== 'zh-CN') {
    return null;
  }

  return (
    <Button asChild className={className} size="sm" variant="ghost">
      <a
        href={internationalDocsUrl}
        onClick={onClick}
        rel="noopener noreferrer"
        target="_blank"
      >
        {t('controls.site.internationalDocs')}
        <ExternalLinkIcon aria-hidden="true" data-icon="inline-end" />
        <span className="sr-only"> ({t('docs.opensInNewTab')})</span>
      </a>
    </Button>
  );
}
