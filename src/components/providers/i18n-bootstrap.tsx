import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getInitialLocale } from '@/lib/i18n/use-locale';

export function I18nBootstrap() {
  const { i18n } = useTranslation('common');

  useEffect(() => {
    const locale = getInitialLocale();

    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [i18n]);

  return null;
}
