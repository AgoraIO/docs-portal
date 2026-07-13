import { cn } from '@/lib/cn';
import { getDocsFooterContent } from '@/lib/footer-content';
import { DEFAULT_LOCALE } from '@/lib/i18n/i18n-config';
import { AgoraLogoMark } from './AgoraLogoMark';

export function DocsSiteFooter({
  className,
  contentClassName,
  locale = DEFAULT_LOCALE,
  style,
}: {
  className?: string;
  contentClassName?: string;
  locale?: string;
  style?: React.CSSProperties;
}) {
  const docsFooterContent = getDocsFooterContent(locale);

  return (
    <section
      aria-label={docsFooterContent.ariaLabel}
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
          <FooterSocialLinks content={docsFooterContent} />

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

        <div className="flex flex-col gap-5 px-5 text-[color:var(--ink-4)] sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm lg:justify-start">
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

            {docsFooterContent.regulatoryLinks ? (
              <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm lg:justify-start">
                {docsFooterContent.certification ? (
                  <li>
                    <span
                      className="font-semibold text-[color:var(--ink-3)]"
                      title={docsFooterContent.certification.title}
                    >
                      {docsFooterContent.certification.label}
                    </span>
                  </li>
                ) : null}
                {docsFooterContent.regulatoryLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      className="transition-colors hover:text-[color:var(--ink-2)]"
                      href={link.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 text-center text-sm sm:flex-row sm:gap-4">
            <AgoraLogoMark alt={docsFooterContent.logoAlt} />
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

function FooterSocialLinks({
  content,
}: {
  content: ReturnType<typeof getDocsFooterContent>;
}) {
  if (content.socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {content.socialLinks.map((link) => {
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
    </div>
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

  if (label === 'X' || label === 'Twitter') {
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

  if (label === 'Discord') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52c-.21.38-.46.89-.63 1.3a18.3 18.3 0 0 0-5.49 0 13 13 0 0 0-.64-1.3 19.7 19.7 0 0 0-4.89 1.52C.69 8.97-.15 13.47.27 17.9a19.9 19.9 0 0 0 6 3.04c.48-.66.91-1.36 1.28-2.1-.7-.26-1.36-.58-1.99-.94.17-.12.33-.25.49-.38a14.2 14.2 0 0 0 12.02 0c.16.13.32.26.49.38-.63.36-1.3.68-2 .94.38.74.8 1.44 1.29 2.1a19.8 19.8 0 0 0 6-3.04c.51-5.15-.85-9.61-3.53-13.53ZM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.96-2.41 2.15-2.41 1.2 0 2.17 1.09 2.15 2.41 0 1.33-.95 2.41-2.15 2.41Zm7.98 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.41 2.15-2.41 1.2 0 2.17 1.09 2.15 2.41 0 1.33-.95 2.41-2.15 2.41Z" />
      </svg>
    );
  }

  if (label === 'Facebook') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
      </svg>
    );
  }

  if (label === 'Slack') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M6 15a3 3 0 1 1-3-3h3v3Zm1.5 0a3 3 0 0 1 6 0v7.5a3 3 0 0 1-6 0V15ZM9 6a3 3 0 1 1 3-3v3H9Zm0 1.5a3 3 0 0 1 0 6H1.5a3 3 0 0 1 0-6H9ZM18 9a3 3 0 1 1 3 3h-3V9Zm-1.5 0a3 3 0 0 1-6 0V1.5a3 3 0 0 1 6 0V9Zm-1.5 9a3 3 0 1 1-3 3v-3h3Zm0-1.5a3 3 0 0 1 0-6h7.5a3 3 0 0 1 0 6H15Z" />
      </svg>
    );
  }

  if (label === 'Medium') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M13.54 12c0 3.62-2.91 6.56-6.5 6.56S.55 15.62.55 12s2.91-6.56 6.5-6.56 6.49 2.94 6.49 6.56Zm7.13 0c0 3.41-1.46 6.18-3.27 6.18S14.13 15.41 14.13 12s1.46-6.18 3.27-6.18 3.27 2.77 3.27 6.18Zm2.78 0c0 3.06-.51 5.54-1.14 5.54S21.17 15.06 21.17 12s.51-5.54 1.14-5.54 1.14 2.48 1.14 5.54Z" />
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
