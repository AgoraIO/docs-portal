import { useEffect, useState } from 'react';
import {
  getApiCatalogScope,
  normalizeApiCatalogReturn,
  readApiCatalogReturn,
} from '@/lib/api-reference-catalog-return';

const STORAGE_KEY = 'docs-portal:api-catalog-return:v1';
const MAX_AGE = 30 * 60 * 1000;
type CatalogReturn = { scope: string; href: string; createdAt: number };

export function useApiCatalogReturn(
  search: string,
  activePath: string,
  enabled: boolean,
) {
  const explicit = enabled ? readApiCatalogReturn(search) : undefined;
  const scope = enabled ? getApiCatalogScope(activePath) : undefined;
  const [remembered, setRemembered] = useState<CatalogReturn>();

  useEffect(() => {
    if (!scope) {
      setRemembered(undefined);
      return;
    }
    if (explicit) {
      const value = { scope, href: explicit, createdAt: Date.now() };
      setRemembered(value);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch {}
      return;
    }
    const restore = (value: CatalogReturn | undefined) => {
      if (!value) return;
      const age = Date.now() - value.createdAt;
      const href = normalizeApiCatalogReturn(value?.href);
      return value.scope === scope && href && age >= 0 && age < MAX_AGE
        ? { ...value, href }
        : undefined;
    };
    let stored: CatalogReturn | undefined;
    try {
      stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
    } catch {}
    setRemembered((current) => restore(stored) ?? restore(current));
  }, [scope, explicit]);

  return (
    explicit ??
    (remembered &&
    remembered.scope === scope &&
    Date.now() >= remembered.createdAt &&
    Date.now() - remembered.createdAt < MAX_AGE
      ? remembered.href
      : undefined)
  );
}
