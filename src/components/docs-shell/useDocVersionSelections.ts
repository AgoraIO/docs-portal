import { useSyncExternalStore } from 'react';
import {
  getDocVersionPreferenceSnapshot,
  parseDocVersionPreferences,
  subscribeDocVersionPreferences,
} from '@/lib/doc-version-preference';
import { getDocVersionSelections } from '@/lib/doc-versions';

const serverSnapshot = () => null;

export function useDocVersionSelections(activePath: string) {
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
