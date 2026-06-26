import { cn } from '@/lib/cn';
import { docsFooterContent } from '@/lib/footer-content';

export function DocsSiteFooter({
  className,
  contentClassName,
  style,
}: {
  className?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section
      aria-label="Agora footer"
      className={cn(
        'w-full border-t border-[color:var(--line-soft)] bg-background py-8',
        className,
      )}
      data-testid="docs-site-footer"
      style={style}
    >
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-7 px-4 sm:px-6',
          contentClassName,
        )}
        data-testid="docs-site-footer-content"
      >
        <div className="flex flex-col gap-8 rounded-lg bg-[color:var(--surface-muted)] px-5 py-6 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            {docsFooterContent.socialLinks.map((link) => {
              return (
                <li key={link.label}>
                  <a
                    aria-label={link.label}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-[color:var(--line-soft)] bg-card text-[color:var(--ink-3)] transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-1)]"
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    title={link.label}
                  >
                    <SocialIcon label={link.label} />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="grid grid-cols-1 gap-7 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-1)]">
                {docsFooterContent.contact.title}
              </h2>
              <p className="text-sm font-medium text-[color:var(--ink-2)]">
                {docsFooterContent.contact.phone}
              </p>
              <p className="text-sm leading-6 text-[color:var(--ink-3)]">
                {docsFooterContent.contact.address.map((line) => (
                  <span className="block" key={line}>
                    {line}
                  </span>
                ))}
              </p>
            </div>

            {docsFooterContent.navGroups.map((group) => (
              <nav
                aria-label={group.title}
                className="flex flex-col gap-3"
                key={group.title}
              >
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-1)]">
                  {group.title}
                </h2>
                <ul className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        className="text-sm text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink-1)]"
                        href={link.href}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 px-2">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs text-[color:var(--ink-4)] sm:text-sm">
            {docsFooterContent.legalLinks.map((link) => (
              <li key={link.label}>
                <a
                  className="transition-colors hover:text-[color:var(--ink-2)]"
                  href={link.href}
                  rel={link.href === '#' ? undefined : 'noopener noreferrer'}
                  target={link.href === '#' ? undefined : '_blank'}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-center justify-center gap-3 text-center text-sm text-[color:var(--ink-4)] sm:flex-row sm:gap-4">
            <AgoraLogoMark />
            <span>{docsFooterContent.copyright}</span>
            <span aria-hidden="true" className="hidden sm:inline">
              |
            </span>
            <span>{docsFooterContent.rights}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialIcon({ label }: { label: string }) {
  if (label === 'LinkedIn') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z" />
      </svg>
    );
  }

  if (label === 'X') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.49h2.04L6.49 3.24H4.3l13.31 17.4Z" />
      </svg>
    );
  }

  if (label === 'YouTube') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.51 3.55 12 3.55 12 3.55s-7.51 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.51 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 .3c-6.63 0-12 5.37-12 12 0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.41 1.02.01 2.04.14 3 .41 2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.21.69.83.57A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}

function AgoraLogoMark() {
  return (
    <svg
      aria-label="Agora"
      className="h-8 w-auto text-[color:var(--ink-1)]"
      fill="none"
      role="img"
      viewBox="0 0 176 62"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Agora</title>
      <g fill="currentColor">
        <path d="M98.38 28.7a9.85 9.85 0 1 1 9.84-9.85 9.86 9.86 0 0 1-9.84 9.85Zm0-27.72a17.86 17.86 0 1 0 17.86 17.86A17.89 17.89 0 0 0 98.38.98ZM128.05 5.58l-.22.22-.24.23-.16-.29-.14-.24a8.53 8.53 0 0 0-6.34-4.4l-.67-.13v35.74l.67-.09a8.3 8.3 0 0 0 7.35-8.41v-9.37a9.93 9.93 0 0 1 8.83-9.79l.53-.06v-8l-.64.07a15.21 15.21 0 0 0-9 4.54ZM18.24 28.7a9.85 9.85 0 1 1 9.85-9.85 9.86 9.86 0 0 1-9.85 9.85ZM29.71 4.5l-.15.2-.15.2-.2-.15-.19-.15A17.86 17.86 0 1 0 18.24 36.7a17.67 17.67 0 0 0 10.78-3.63l.19-.14.2-.16.15.21.15.2a8.52 8.52 0 0 0 5.73 3.44l.66.09V.98l-.66.09A8.53 8.53 0 0 0 29.71 4.5ZM157.52 28.7a9.85 9.85 0 1 1 9.86-9.85 9.86 9.86 0 0 1-9.85 9.85ZM174.72 1.07a8.57 8.57 0 0 0-5.74 3.43l-.14.19-.15.21-.2-.15-.19-.15a17.86 17.86 0 1 0-10.78 32.09 17.67 17.67 0 0 0 10.78-3.63l.19-.14.2-.16.15.21.14.2a8.56 8.56 0 0 0 5.74 3.44l.66.09V.98l-.66.09ZM58.56 8.99a9.85 9.85 0 1 1-9.86 9.85 9.86 9.86 0 0 1 9.88-9.85Zm11.15 23.78a17.82 17.82 0 0 0 3.67-23.94c-.25-.38-.53-.75-.82-1.11a8.66 8.66 0 0 0 3.82-6.07l.1-.67H58.49a17.85 17.85 0 0 0-11.11 31.79 17.81 17.81 0 0 0-2.14 2l5.44 6a9.85 9.85 0 1 1 13 14.3l5.45 6a17.84 17.84 0 0 0 .51-28.26" />
      </g>
    </svg>
  );
}
