import {
  isPublicCnSearchUrl,
  toCnContentSearchUrl,
} from '@/lib/search/cn-search-urls.mjs';
import { analyticsPath } from './measurement-privacy';

export function isCnMeasurementPath(path: string) {
  return /^\/search\/?$/.test(path) || isPublicCnSearchUrl(path);
}

/** Keep historical document identity across the CN public-URL migration. */
export function measurementPath(value: string) {
  const path = analyticsPath(value);
  return isCnMeasurementPath(path) ? toCnContentSearchUrl(path) : path;
}
