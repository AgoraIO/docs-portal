import type { AppLocale } from '../i18n/i18n-config';
import { type AlgoliaDocsRecord, buildExternalRecord } from './algolia-records.server';
import type { ExternalNavEntry } from './external-refs';

export type NavModel = {
  breadcrumbsByUrl: Map<string, string[]>;
  platformsByUrl: Map<string, string[]>;
  externalEntries: ExternalNavEntry[];
  locale: AppLocale;
};

/**
 * Enrich base records with authoritative nav data: override breadcrumbs and
 * platform where the nav model has an entry, and append synthetic external
 * api-ref records. Records with no nav entry are passed through unchanged.
 */
export function applyNavModel(
  records: AlgoliaDocsRecord[],
  nav: NavModel,
): AlgoliaDocsRecord[] {
  const enriched = records.map((record) => {
    const breadcrumbs = nav.breadcrumbsByUrl.get(record.url);
    const platform = nav.platformsByUrl.get(record.url);

    if (!breadcrumbs && !platform) {
      return record;
    }

    return {
      ...record,
      breadcrumbs: breadcrumbs ?? record.breadcrumbs,
      extra_data: {
        ...record.extra_data,
        platform: platform ?? record.extra_data.platform,
      },
    };
  });

  const external = nav.externalEntries.map((entry) =>
    buildExternalRecord(entry, nav.locale),
  );

  return [...enriched, ...external];
}
