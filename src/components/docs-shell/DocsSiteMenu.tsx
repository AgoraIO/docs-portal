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
import { chineseDocsUrl, internationalDocsUrl } from '@/lib/shared';

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
          {(
            [
              {
                locale: 'zh-CN',
                label: 'chinese',
                region: 'china',
                href: chineseDocsUrl,
              },
              {
                locale: 'en',
                label: 'english',
                region: 'global',
                href: internationalDocsUrl,
              },
            ] as const
          ).map((site) => {
            const isCurrent = site.locale === locale;
            const label = (
              <span className="flex flex-1 flex-col gap-0.5" key={site.locale}>
                <span lang={site.locale}>
                  {t(`controls.site.${site.label}`)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t(`controls.site.${site.region}`)}
                </span>
              </span>
            );

            return isCurrent ? (
              <DropdownMenuItem
                aria-current="true"
                className="min-h-11"
                key={site.locale}
              >
                {label}
                <CheckIcon aria-hidden="true" />
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild className="min-h-11" key={site.locale}>
                <a
                  href={site.href}
                  hrefLang={site.locale}
                  onClick={onNavigate}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {label}
                  <ExternalLinkIcon aria-hidden="true" />
                  <span className="sr-only"> ({t('docs.opensInNewTab')})</span>
                </a>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
