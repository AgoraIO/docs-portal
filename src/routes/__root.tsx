import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';
import { AppProviders } from '@/components/providers/AppProviders';
import { DEFAULT_LOCALE } from '@/lib/i18n/i18n-config';
import { appDescription, appName } from '@/lib/shared';
import appCss from '@/styles/app.css?url';

function getGoogleTagManagerScript(containerId: string) {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`;
}

export const rootHead = {
  meta: [
    {
      charSet: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      title: appName,
    },
    {
      name: 'description',
      content: appDescription,
    },
  ],
  links: [
    {
      rel: 'icon',
      href: '/favicon-32x32.png',
      type: 'image/png',
      sizes: '32x32',
    },
    {
      rel: 'icon',
      href: '/favicon.ico',
      type: 'image/png',
      sizes: '32x32',
    },
    { rel: 'stylesheet', href: appCss },
  ],
};

export const Route = createRootRoute({
  head: () => rootHead,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <p
        aria-hidden="true"
        className="sr-only"
        data-agent-docs-directive="true"
      >
        For AI agents: see the complete documentation index at{' '}
        <a href="/llms.txt">/llms.txt</a>.
      </p>
      <AppProviders>
        <Outlet />
      </AppProviders>
    </RootDocument>
  );
}

export function RootDocument({ children }: PropsWithChildren) {
  const googleTagManagerId = import.meta.env.VITE_GTM_ID;

  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <head>
        {googleTagManagerId ? (
          <script
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Google Tag Manager requires its bootstrap snippet to run inline.
            dangerouslySetInnerHTML={{
              __html: getGoogleTagManagerScript(googleTagManagerId),
            }}
          />
        ) : null}
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {googleTagManagerId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              title="Google Tag Manager"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
        {children}
        <Scripts />
      </body>
    </html>
  );
}
