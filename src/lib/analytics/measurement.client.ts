import {
  type Attribution,
  createDocsMeasurement,
  type Journey,
  type ResultsSnapshot,
  type Selection,
} from './docs-measurement';
import { captureMeasurementEvent } from './posthog';

const sessionKey = 'docs-measurement-v1';
let instance: ReturnType<typeof createDocsMeasurement> | undefined;
const uuid = () => crypto.randomUUID();
function read<T>(storage: Storage, key: string): T | undefined {
  try {
    return JSON.parse(storage.getItem(key) ?? 'null') ?? undefined;
  } catch {
    return undefined;
  }
}
export function measurementEnabled() {
  return (
    typeof window !== 'undefined' &&
    import.meta.env.VITE_DOCS_REGION === 'cn' &&
    import.meta.env.VITE_DOCS_MEASUREMENT_ENABLED === 'true' &&
    window.location.pathname.startsWith('/zh-CN/')
  );
}
export function getDocsMeasurement() {
  if (!measurementEnabled()) return undefined;
  if (instance) return instance;
  let restore: Journey | undefined;
  let testRunId: string | undefined;
  try {
    // sessionStorage can be copied by a newly opened tab. A per-window marker
    // keeps ordinary new tabs independent while a refresh retains its journey.
    const tabId = window.name.startsWith('docs-tab:')
      ? window.name
      : `docs-tab:${uuid()}`;
    if (sessionStorage.getItem('docs-measurement-tab') === tabId)
      restore = read<Journey>(sessionStorage, sessionKey);
    window.name = tabId;
    sessionStorage.setItem('docs-measurement-tab', tabId);
    if (
      restore &&
      (typeof restore.id !== 'string' ||
        !Number.isFinite(restore.active) ||
        !Number.isFinite(restore.started))
    )
      restore = undefined;
    if (import.meta.env.VITE_DOCS_ENVIRONMENT !== 'production') {
      const candidate = new URLSearchParams(window.location.search).get(
        'docs_measurement_test',
      );
      if (candidate && /^[a-zA-Z0-9_-]{1,80}$/.test(candidate))
        sessionStorage.setItem('docs-measurement-test', candidate);
      testRunId = sessionStorage.getItem('docs-measurement-test') ?? undefined;
    }
  } catch {
    /* Storage can be blocked. Keep this tab in memory. */
  }
  instance = createDocsMeasurement({
    emit: captureMeasurementEvent,
    now: Date.now,
    id: uuid,
    restore,
    environment: import.meta.env.VITE_DOCS_ENVIRONMENT || 'local',
    appRelease: import.meta.env.VITE_DOCS_APP_RELEASE || 'unknown',
    entryPath: () => window.location.pathname,
    entrySource: (() => {
      try {
        return document.referrer ? new URL(document.referrer).origin : 'direct';
      } catch {
        return 'unknown';
      }
    })(),
    testRunId,
    restoreAnswers: (() => {
      try {
        return read<Record<string, { value: string; revision: number }>>(
          sessionStorage,
          'docs-feedback-answers',
        );
      } catch {
        return undefined;
      }
    })(),
    saveAnswers: (answers) => {
      try {
        sessionStorage.setItem(
          'docs-feedback-answers',
          JSON.stringify(answers),
        );
      } catch {
        /* optional */
      }
    },
    save: (journey) => {
      try {
        if (journey)
          sessionStorage.setItem(sessionKey, JSON.stringify(journey));
        else sessionStorage.removeItem(sessionKey);
      } catch {
        /* optional */
      }
    },
  });
  try {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('docs_from');
    const stored =
      token && /^[a-f0-9-]{36}$/.test(token)
        ? read<Attribution>(localStorage, `docs-from-${token}`)
        : undefined;
    if (
      stored &&
      typeof stored.target === 'string' &&
      stored.target === url.pathname.replace(/\/+$/, '') &&
      typeof stored.journey?.id === 'string' &&
      Number.isFinite(stored.expires)
    )
      instance.restoreAttribution(stored);
    if (token) {
      url.searchParams.delete('docs_from');
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
    const pending = read<Attribution>(sessionStorage, 'docs-result-target');
    if (
      !stored &&
      pending &&
      pending.target === url.pathname.replace(/\/+$/, '') &&
      Number.isFinite(pending.expires)
    )
      instance.restoreAttribution(pending);
    sessionStorage.removeItem('docs-result-target');
  } catch {
    /* Unknown attribution is preferable to guessing. */
  }
  window.addEventListener('pointerdown', () => instance?.touch(), {
    passive: true,
  });
  window.addEventListener('keydown', () => instance?.touch(), {
    passive: true,
  });
  window.addEventListener('docs-account-changed', () => {
    instance?.reset();
    try {
      sessionStorage.removeItem('docs-result-target');
      for (let index = localStorage.length - 1; index >= 0; index--) {
        const key = localStorage.key(index);
        if (key?.startsWith('docs-from-')) localStorage.removeItem(key);
      }
    } catch {
      /* optional */
    }
  });
  return instance;
}

/** Prepare a normal anchor before its browser default action (including middle click). */
export function selectDocsResult(
  snapshot: ResultsSnapshot | undefined,
  selection: Selection,
  newTab = false,
) {
  const measurement = getDocsMeasurement();
  if (!measurement || !snapshot) return selection.path;
  const attribution = measurement.selectResult(snapshot, {
    ...selection,
    method: newTab ? `${selection.method}_new_tab` : selection.method,
  });
  try {
    if (newTab) {
      const token = uuid();
      // Bound the small, short-lived cross-tab handoff store. It never contains raw queries.
      for (let index = localStorage.length - 1; index >= 0; index--) {
        const key = localStorage.key(index);
        if (key?.startsWith('docs-from-')) {
          const old = read<Attribution>(localStorage, key);
          if (!old || old.expires < Date.now()) localStorage.removeItem(key);
        }
      }
      localStorage.setItem(`docs-from-${token}`, JSON.stringify(attribution));
      const url = new URL(selection.path, window.location.origin);
      url.searchParams.set('docs_from', token);
      return `${url.pathname}${url.search}${url.hash}`;
    }
    sessionStorage.setItem('docs-result-target', JSON.stringify(attribution));
  } catch {
    /* Navigation still succeeds without attribution storage. */
  }
  return selection.path;
}

export function invitationAllowed() {
  const measurement = getDocsMeasurement();
  if (!measurement) return false;
  const journey = measurement.peek();
  if (!journey?.sampled) return false;
  try {
    const previous = Number(localStorage.getItem('docs-feedback-invited-at'));
    const invitedJourney = localStorage.getItem(
      'docs-feedback-invited-journey',
    );
    if (invitedJourney === journey.id) return true;
    if (previous && Date.now() - previous < 86400000) return false;
    return true;
  } catch {
    return false;
  }
}
export function markInvitationVisible() {
  try {
    const journey = getDocsMeasurement()?.current();
    if (!journey) return;
    localStorage.setItem('docs-feedback-invited-at', String(Date.now()));
    localStorage.setItem('docs-feedback-invited-journey', journey.id);
  } catch {
    /* Do not repeat automatic invitations when storage is blocked. */
  }
}
