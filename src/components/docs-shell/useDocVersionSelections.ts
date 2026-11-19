import { useSyncExternalStore } from 'react';
import {
  getDocVersionPreferenceSnapshot,
  parseDocVersionPreferences,
  subscribeDocVersionPreferences,
} from '@/lib/doc-version-preference';
import { getDocVersionSelections } from '@/lib/doc-versions';

const serverSnapshot = () => null;

/** Without an active path, ordinary entries follow the saved choice or site default. */
export function useDocVersionSelections(activePath = '') {
  const snapshot = useSyncExternalStore(
    subscribeDocVersionPreferences,
    getDocVersionPreferenceSnapshot,
    serverSnapshot,
  );
  return getDocVersionSelections(
    activePath,
    parseDocVersionPreferences(snapshot),
  );
}
