import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { AppProviders } from '@/components/providers/AppProviders';
import { DEFAULT_LOCALE } from '@/lib/i18n/i18n-config';
import { appDescription, appName } from '@/lib/shared';
import appCss from '@/styles/app.css?url';

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
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
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
        <Scripts />
      </body>
    </html>
  );
}
