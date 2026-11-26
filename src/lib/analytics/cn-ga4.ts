import { analyticsPath, safeAnalyticsUrl } from './measurement-privacy';

const measurementId = 'G-FX05ECXBR2';
const productionOrigin = 'https://docs.shengwang.cn';

export const cnGa4Enabled =
  import.meta.env.PROD &&
  import.meta.env.VITE_DOCS_REGION === 'cn' &&
  import.meta.env.VITE_DOCS_ENVIRONMENT === 'production' &&
  import.meta.env.VITE_DOCS_MEASUREMENT_ENABLED === 'true';

type TagWindow = Window & { dataLayer: IArguments[] };
let tag: ReturnType<typeof loadTag> | undefined;
let lastLocation: string | undefined;

async function loadTag() {
  // The shared stream also measures history, clicks and searches automatically.
  // Load its tag in a stationary document so it only sees our page-view inputs.
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText =
    'position:fixed;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none';
  frame.title = 'Google Analytics';
  frame.referrerPolicy = 'no-referrer';
  const loaded = new Promise<void>((resolve) => {
    frame.onload = () => resolve();
  });
  frame.src = '/cn-ga4.html';
  document.body.append(frame);
  await loaded;
  const target = frame.contentWindow as TagWindow | null;
  if (!target || !frame.contentDocument?.querySelector('meta[name="cn-ga4"]')) {
    frame.remove();
    tag = undefined;
    lastLocation = undefined;
    return;
  }
  return initializeTag(target);
}

function initializeTag(target: TagWindow) {
  target.dataLayer = [];
  function gtag(..._command: unknown[]) {
    // The Google tag consumes arguments objects from its pre-load queue.
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
    cookie_domain: 'shengwang.cn',
  });

  const script = target.document.createElement('script');
  script.async = true;
  script.referrerPolicy = 'no-referrer';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  target.document.head.append(script);
  return gtag;
}

export function captureCnGa4PageView(pathname: string) {
  if (
    !cnGa4Enabled ||
    window.location.origin !== productionOrigin ||
    window.top !== window ||
    Reflect.get(window, `ga-disable-${measurementId}`) === true ||
    navigator.doNotTrack === '1' ||
    Reflect.get(window, 'doNotTrack') === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  ) {
    return;
  }

  const location = productionOrigin + analyticsPath(pathname);
  if (lastLocation === location) return;
  tag ??= loadTag();

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
  void tag.then((gtag) => {
    if (!gtag) return;
    gtag('set', page);
    gtag('event', 'page_view', { send_to: measurementId });
  });
}
