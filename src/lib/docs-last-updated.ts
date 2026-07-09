export type DocsLastUpdatedSource = 'fallback' | 'file-mtime' | 'git';

export type DocsLastUpdatedMetadata = {
  formatted: string;
  iso: string;
  source: DocsLastUpdatedSource;
};

export const DOCS_LAST_UPDATED_FALLBACK_ISO = '1970-01-01T00:00:00.000Z';

const FALLBACK_DATE = new Date(DOCS_LAST_UPDATED_FALLBACK_ISO);

export function createDocsLastUpdatedMetadata(
  value?: Date | string,
  source: DocsLastUpdatedSource = 'fallback',
): DocsLastUpdatedMetadata {
  const date = toValidDate(value) ?? FALLBACK_DATE;

  return {
    formatted: formatDocsLastUpdatedDate(date),
    iso: date.toISOString(),
    source: toValidDate(value) ? source : 'fallback',
  };
}

export function ensureDocsLastUpdatedMetadata(
  metadata?: Partial<DocsLastUpdatedMetadata> | null,
): DocsLastUpdatedMetadata {
  if (!metadata?.iso && !metadata?.formatted) {
    return createDocsLastUpdatedMetadata();
  }

  if (metadata.iso) {
    return createDocsLastUpdatedMetadata(
      metadata.iso,
      metadata.source ?? 'fallback',
    );
  }

  return {
    formatted: metadata.formatted ?? formatDocsLastUpdatedDate(FALLBACK_DATE),
    iso: DOCS_LAST_UPDATED_FALLBACK_ISO,
    source: metadata.source ?? 'fallback',
  };
}

export function formatDocsLastUpdatedDate(value: Date | string) {
  const date = toValidDate(value) ?? FALLBACK_DATE;

  return [
    [
      date.getUTCFullYear(),
      padDatePart(date.getUTCMonth() + 1),
      padDatePart(date.getUTCDate()),
    ].join('/'),
    [
      padDatePart(date.getUTCHours()),
      padDatePart(date.getUTCMinutes()),
      padDatePart(date.getUTCSeconds()),
    ].join(':'),
  ].join(' ');
}

function toValidDate(value?: Date | string) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isFinite(date.valueOf()) ? date : null;
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}
