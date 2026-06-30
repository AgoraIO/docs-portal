import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { AppProviders } from '@/components/providers/AppProviders';
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
      href: '/favicon.svg',
      type: 'image/svg+xml',
      sizes: 'any',
    },
    {
      rel: 'icon',
      href: '/favicon.ico',
      type: 'image/png',
      sizes: '512x512',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          <Outlet />
        </AppProviders>
        <Scripts />
      </body>
    </html>
  );
}
