import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';
import { AppProviders } from '@/components/providers/AppProviders';
import {
  CONSENT_BRIDGE_PATH,
  resolveSecuritiConfig,
  SECURITI_BACKEND_URL,
  SECURITI_SDK_LOADER_URL,
  SECURITI_TENANT_UUID,
} from '@/lib/consent/securiti-config';
import { DEFAULT_LOCALE } from '@/lib/i18n/i18n-config';
import { appDescription, appName } from '@/lib/shared';
import appCss from '@/styles/app.css?url';

// Resolved at module load so a malformed VITE_SECURITI_DOMAIN_UUID fails the prerender build.
const securiti = resolveSecuritiConfig(
  import.meta.env.VITE_SECURITI_DOMAIN_UUID,
);

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
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <head>
        {/* Securiti order matters: auto-blocking first, then the bridge that queues SDK
            callbacks, then the SDK loader. Optional trackers start from consent (see
            src/lib/consent). */}
        <script src={securiti.autoBlockingUrl} />
        <script src={CONSENT_BRIDGE_PATH} data-skip-blocking="true" />
        <script
          defer
          src={SECURITI_SDK_LOADER_URL}
          data-tenant-uuid={SECURITI_TENANT_UUID}
          data-domain-uuid={securiti.domainUuid}
          data-backend-url={SECURITI_BACKEND_URL}
          data-skip-css="false"
        />
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
