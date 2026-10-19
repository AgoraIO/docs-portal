import { Link, useLocation } from '@tanstack/react-router';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import { type MouseEvent, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import {
  getStoredDocVersionSelections,
  setDocVersionPreference,
} from '@/lib/doc-version-preference';
import type { DocVersionScope } from '@/lib/doc-versions';
import {
  DOC_VERSION_SCOPES,
  getDocVersionTarget,
  resolveDocVersion,
} from '@/lib/doc-versions';

type DocVersionBarProps = {
  activePath: string;
  onSelectPath?: () => void;
  placement?: 'article' | 'sidebar';
};

export function DocVersionBar({
  activePath,
  placement = 'article',
  ...props
}: DocVersionBarProps) {
  const context = resolveDocVersion(activePath);
  const scope =
    context?.scope ??
    DOC_VERSION_SCOPES.find((item) => item.entryUrl === activePath);
  if (!scope || (placement === 'sidebar' && !context)) return null;
  return (
    <DocVersionControls
      activePath={activePath}
      placement={placement}
      scope={scope}
      {...props}
    />
  );
}

function DocVersionControls({
  activePath,
  onSelectPath,
  placement,
  scope,
}: DocVersionBarProps & { scope: DocVersionScope }) {
  const context = resolveDocVersion(activePath);
  const isVersionedPage = Boolean(context);
  const location = useLocation();
  const isSidebar = placement === 'sidebar';

  useEffect(() => {
    if (isVersionedPage) return;
    // Read after hydration so a stored choice is not replaced by the SSR default.
    const selected = getStoredDocVersionSelections(activePath)[scope.id];
    const target = getDocVersionTarget(activePath, selected);
    // Load the target's deterministic HTML instead of changing route state while
    // a lazy MDX body in the neutral page may still be hydrating.
    if (target) window.location.replace(target.href);
  }, [activePath, isVersionedPage, scope]);

  const fallback = new URLSearchParams(location.searchStr).has(
    'versionFallback',
  );
  const currentHref = `${activePath}${location.hash ? `#${location.hash.replace(/^#/, '')}` : ''}`;
  const versions = isSidebar
    ? scope.versions
    : scope.versions.filter((version) => version.id !== context?.version.id);
  const selectVersion = (
    event: MouseEvent<HTMLAnchorElement>,
    versionId: string,
  ) => {
    if (
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      setDocVersionPreference(scope.id, versionId);
      onSelectPath?.();
    }
  };

  return (
    <div
      className={cn('flex flex-col gap-2', isSidebar && 'mt-3 px-2')}
      data-testid={isSidebar ? 'doc-version-sidebar' : 'doc-version-bar'}
    >
      <nav
        aria-label={`${scope.label} documentation versions`}
        className={cn(
          'flex flex-wrap items-center',
          isSidebar
            ? 'gap-1 rounded-lg bg-muted p-1'
            : 'justify-between gap-x-4 gap-y-1 border-b border-border pb-2',
        )}
      >
        {!isSidebar ? (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span>Docs version</span>
            {context ? (
              <Link
                aria-current="page"
                aria-label={context.version.label}
                className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={(event) => selectVersion(event, context.version.id)}
                to={currentHref}
              >
                <Badge
                  size="sm"
                  variant={
                    context.version.status === 'preview'
                      ? 'preview'
                      : 'secondary'
                  }
                >
                  {context.version.id}
                  {context.version.status === 'preview' ? (
                    <>
                      <span aria-hidden="true">🧪</span> Preview
                    </>
                  ) : null}
                </Badge>
              </Link>
            ) : null}
          </div>
        ) : null}
        {versions.map((version) => {
          const target = getDocVersionTarget(currentHref, version.id);
          if (!target) return null;
          const isActive = context?.version.id === version.id;
          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              aria-label={version.label}
              className={cn(
                'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-2 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
                isSidebar
                  ? 'flex-auto hover:bg-background/70'
                  : 'hover:bg-accent',
                isSidebar &&
                  isActive &&
                  'bg-background text-foreground shadow-xs',
                !isActive && version.status === 'preview'
                  ? 'text-[color:var(--docs-info)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              key={version.id}
              onClick={(event) => selectVersion(event, version.id)}
              to={target.href}
            >
              {isSidebar ? (
                <>
                  <CheckIcon
                    aria-hidden="true"
                    className={cn(
                      'size-3.5 shrink-0',
                      !isActive && 'invisible',
                    )}
                  />
                  {version.id}
                </>
              ) : (
                <span>
                  {version.status === 'preview' ? 'Try' : 'View'} {version.id}
                </span>
              )}
              {version.status === 'preview' ? (
                <Badge size="sm" variant="preview">
                  <span aria-hidden="true">🧪</span> Preview
                </Badge>
              ) : null}
              {!isSidebar ? (
                <ArrowRightIcon aria-hidden="true" className="size-3.5" />
              ) : null}
            </Link>
          );
        })}
      </nav>
      {fallback && !isSidebar ? (
        <p role="status" className="text-sm text-muted-foreground">
          This topic is not available in this version. Showing its overview
          instead.
        </p>
      ) : null}
    </div>
  );
}
