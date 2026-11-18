import { CheckIcon, ExternalLinkIcon, GlobeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AppLocale } from '@/lib/i18n/i18n-config';
import { internationalDocsUrl } from '@/lib/shared';

export function DocsSiteMenu({
  locale,
  mobile = false,
  onNavigate,
}: {
  locale: AppLocale;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(locale, 'common');

  if (locale !== 'zh-CN') {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t('controls.site.switchSite')}
          className="size-11 lg:size-[34px] lg:rounded-lg"
          size="icon"
          title={t('controls.site.switchSite')}
          variant="ghost"
        >
          <GlobeIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={mobile ? 'start' : 'end'}
        aria-label={t('controls.site.switchSite')}
        className="w-48"
        side={mobile ? 'top' : 'bottom'}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem aria-current="true" className="min-h-11">
            <span className="flex flex-1 flex-col gap-0.5">
              <span lang="zh-CN">{t('controls.site.chinese')}</span>
              <span className="text-xs text-muted-foreground">
                {t('controls.site.china')}
              </span>
            </span>
            <CheckIcon aria-hidden="true" />
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="min-h-11">
            <a
              href={internationalDocsUrl}
              hrefLang="en"
              onClick={onNavigate}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="flex flex-1 flex-col gap-0.5">
                <span lang="en">{t('controls.site.english')}</span>
                <span className="text-xs text-muted-foreground">
                  {t('controls.site.global')}
                </span>
              </span>
              <ExternalLinkIcon aria-hidden="true" />
              <span className="sr-only"> ({t('docs.opensInNewTab')})</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
