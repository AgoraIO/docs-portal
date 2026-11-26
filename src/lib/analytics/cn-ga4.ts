import { analyticsPath, safeAnalyticsUrl } from './measurement-privacy';

const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim() ?? '';
const productionOrigin = 'https://docs.shengwang.cn';
const resourceTimeoutMs = 10_000;
const maxPendingPageViews = 16;

export const cnGa4Enabled =
  import.meta.env.PROD &&
  import.meta.env.VITE_DOCS_REGION === 'cn' &&
  import.meta.env.VITE_DOCS_ENVIRONMENT === 'production' &&
  import.meta.env.VITE_DOCS_MEASUREMENT_ENABLED === 'true' &&
  /^G-[A-Z0-9]+$/.test(measurementId);

type TagWindow = Window & { dataLayer: IArguments[] };
let tag: ReturnType<typeof loadTag> | undefined;
let lastLocation: string | undefined;
let pendingViews = 0;

function optedOut() {
  return (
    Reflect.get(window, `ga-disable-${measurementId}`) === true ||
    navigator.doNotTrack === '1' ||
    Reflect.get(window, 'doNotTrack') === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  );
}

async function appendAndLoad(
  parent: HTMLElement,
  resource: HTMLIFrameElement | HTMLScriptElement,
) {
  let timeout: number | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      const failed = () => reject(new Error('GA4 resource unavailable'));
      timeout = window.setTimeout(failed, resourceTimeoutMs);
      resource.onerror = failed;
      resource.onload = () => resolve();
      parent.append(resource);
    });
  } finally {
    window.clearTimeout(timeout);
    resource.onerror = null;
    resource.onload = null;
  }
}

async function loadTag() {
  // Do not add a child document to the browser's main-page load dependencies.
  if (document.readyState !== 'complete') {
    await new Promise<void>((resolve) =>
      window.addEventListener('load', () => resolve(), { once: true }),
    );
  }
  if (optedOut()) return;

  // The shared stream measures browser history and site searches automatically.
  // A stationary document keeps those listeners off the portal's router and DOM.
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText =
    'position:fixed;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none';
  frame.title = 'Google Analytics';
  frame.referrerPolicy = 'no-referrer';
  frame.src = '/cn-ga4.html';
  try {
    await appendAndLoad(document.body, frame);
    const target = frame.contentWindow as TagWindow | null;
    if (
      !target ||
      !frame.contentDocument?.querySelector('meta[name="cn-ga4"]') ||
      optedOut()
    ) {
      frame.remove();
      return;
    }
    return await initializeTag(target);
  } catch {
    // Fail once per document. Navigation must work even with a blocked tag.
    frame.remove();
    return;
  }
}

async function initializeTag(target: TagWindow) {
  target.dataLayer = [];
  function gtag(..._command: unknown[]) {
    // biome-ignore lint/complexity/noArguments: Required by the gtag.js command format.
    target.dataLayer.push(arguments);
  }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_domain: 'none',
    cookie_prefix: 'sw_docs',
  });

  const script = target.document.createElement('script');
  script.async = true;
  script.referrerPolicy = 'no-referrer';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  await appendAndLoad(target.document.head, script);
  return gtag;
}

export async function captureCnGa4PageView(pathname: string) {
  if (!cnGa4Enabled) return;
  try {
    if (
      window.location.origin !== productionOrigin ||
      window.top !== window ||
      optedOut() ||
      pendingViews >= maxPendingPageViews
    )
      return;
    const location = productionOrigin + analyticsPath(pathname);
    if (lastLocation === location) return;

    const page = {
      page_location: location,
      page_title: document.title,
      page_referrer:
        lastLocation ??
        safeAnalyticsUrl(
          document.referrer,
          !document.referrer.startsWith(`${productionOrigin}/`),
        ) ??
        '',
    };
    lastLocation = location;
    pendingViews++;
    try {
      tag ??= loadTag();
      const gtag = await tag;
      if (gtag && !optedOut()) {
        gtag('set', page);
        gtag('event', 'page_view', { send_to: measurementId });
      }
    } finally {
      pendingViews--;
    }
  } catch {
    // Keep third-party and browser errors outside the React tree.
  }
}
