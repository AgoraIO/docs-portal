export const CONSENT_SUBJECT_STORAGE_KEY = 'agora_consent_subject_id';

const SET_PARAMS_POLL_INTERVAL_MS = 100;
const SET_PARAMS_MAX_ATTEMPTS = 50;

declare global {
  interface Window {
    setConsentBannerParams?: (params: { uuid: string }) => void;
  }
}

export function getConsentSubjectId() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const existing = window.localStorage.getItem(CONSENT_SUBJECT_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const id = crypto.randomUUID();
    window.localStorage.setItem(CONSENT_SUBJECT_STORAGE_KEY, id);
    return id;
  } catch {
    // Private mode / blocked storage: still provide an anonymous ID for this page.
    return crypto.randomUUID();
  }
}

export function applySecuritiConsentBannerParams() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const uuid = getConsentSubjectId();
  if (!uuid) {
    return () => {};
  }

  let attempts = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  const apply = () => {
    if (typeof window.setConsentBannerParams !== 'function') {
      return false;
    }

    window.setConsentBannerParams({ uuid });
    return true;
  };

  if (apply()) {
    return () => {};
  }

  timer = setInterval(() => {
    attempts += 1;
    if (apply() || attempts >= SET_PARAMS_MAX_ATTEMPTS) {
      clearInterval(timer);
    }
  }, SET_PARAMS_POLL_INTERVAL_MS);

  return () => {
    clearInterval(timer);
  };
}
