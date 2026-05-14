'use client';

import { Link } from '@tanstack/react-router';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DocsMainColumn({
  children,
  next,
  previous,
}: {
  children: React.ReactNode;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
}) {
  return (
    <main className="min-w-0 flex-1 bg-background" data-testid="docs-main-column">
      <div
        className="px-4 py-8 sm:px-6 lg:hidden lg:px-10"
        data-testid="docs-main-mobile-flow"
      >
        <div className="min-w-0">{children}</div>
        {previous || next ? (
          <footer className="mt-8 flex justify-between gap-3 border-t border-border pt-6">
            {previous ? (
              <FooterLink direction="Previous" link={previous} />
            ) : (
              <div />
            )}
            {next ? <FooterLink direction="Next" link={next} /> : <div />}
          </footer>
        ) : null}
      </div>
      <ScrollArea
        className="hidden h-full min-h-0 lg:block"
        data-testid="docs-main-desktop-scroll"
      >
        <div className="flex min-h-full flex-col px-4 py-8 sm:px-6 lg:px-10">
          <div className="min-w-0 flex-1">{children}</div>
          {previous || next ? (
            <footer className="mt-8 flex justify-between gap-3 border-t border-border pt-6">
              {previous ? (
                <FooterLink direction="Previous" link={previous} />
              ) : (
                <div />
              )}
              {next ? <FooterLink direction="Next" link={next} /> : <div />}
            </footer>
          ) : null}
        </div>
      </ScrollArea>
    </main>
  );
}

function FooterLink({
  direction,
  link,
}: {
  direction: string;
  link: { title: string; url: string };
}) {
  return (
    <Link
      className="flex min-w-0 flex-1 flex-col rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-accent"
      params={{}}
      search={{}}
      to={link.url}
    >
      <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {direction}
      </span>
      <span className="truncate font-medium text-foreground">{link.title}</span>
    </Link>
  );
}
