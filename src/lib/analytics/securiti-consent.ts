export const CONSENT_SUBJECT_STORAGE_KEY = 'agora_consent_subject_id';
export const SECURITI_BANNER_LAYOUT_STYLE_ID =
  'agora-securiti-banner-layout-styles';

const SET_PARAMS_POLL_INTERVAL_MS = 100;
const SET_PARAMS_MAX_ATTEMPTS = 50;

declare global {
  interface Window {
    setConsentBannerParams?: (params: { uuid: string }) => void;
  }
}

const SECURITI_BANNER_LAYOUT_CSS = `
.cc-window.cc-floating {
  box-sizing: border-box !important;
  width: min(28rem, calc(100vw - 1.5rem)) !important;
  max-width: calc(100vw - 1.5rem) !important;
  height: auto !important;
  overflow: visible !important;
}

.cc-window.cc-floating .cc-compliance {
  flex-wrap: wrap !important;
  height: auto !important;
  overflow: visible !important;
}

.cc-window #securitiCmpCookiePrefBtn.cc-link.cmp-pref-link {
  display: flex !important;
  box-sizing: border-box !important;
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  min-height: 2rem !important;
  align-items: flex-start !important;
  white-space: normal !important;
  overflow: visible !important;
}

.cc-window #securitiCmpCookiePrefBtn.cc-link.cmp-pref-link > span {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  width: auto !important;
  max-width: 100% !important;
  height: auto !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  overflow-wrap: anywhere !important;
  line-height: 1.35 !important;
}
`;

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

export function ensureSecuritiBannerLayoutStyles() {
  if (typeof document === 'undefined') {
    return () => {};
  }

  let style = document.getElementById(
    SECURITI_BANNER_LAYOUT_STYLE_ID,
  ) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement('style');
    style.id = SECURITI_BANNER_LAYOUT_STYLE_ID;
    style.textContent = SECURITI_BANNER_LAYOUT_CSS;
    document.head.appendChild(style);
  }

  return () => {
    style?.remove();
  };
}

export function applySecuritiConsentBannerParams() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const removeLayoutStyles = ensureSecuritiBannerLayoutStyles();
  const uuid = getConsentSubjectId();
  if (!uuid) {
    return removeLayoutStyles;
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
    return removeLayoutStyles;
  }

  timer = setInterval(() => {
    attempts += 1;
    if (apply() || attempts >= SET_PARAMS_MAX_ATTEMPTS) {
      clearInterval(timer);
    }
  }, SET_PARAMS_POLL_INTERVAL_MS);

  return () => {
    clearInterval(timer);
    removeLayoutStyles();
  };
}
