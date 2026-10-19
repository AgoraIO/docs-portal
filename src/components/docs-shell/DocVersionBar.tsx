import { Link, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export function DocVersionBar({ activePath }: { activePath: string }) {
  const context = resolveDocVersion(activePath);
  const scope =
    context?.scope ??
    DOC_VERSION_SCOPES.find((item) => item.entryUrl === activePath);
  if (!scope) return null;
  return <DocVersionControls activePath={activePath} scope={scope} />;
}

function DocVersionControls({
  activePath,
  scope,
}: {
  activePath: string;
  scope: DocVersionScope;
}) {
  const context = resolveDocVersion(activePath);
  const isVersionedPage = Boolean(context);
  const location = useLocation();

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

  return (
    <div className="flex flex-col gap-2" data-testid="doc-version-bar">
      <nav
        aria-label={`${scope.label} documentation versions`}
        className="flex flex-wrap items-center gap-2"
      >
        <Badge variant="secondary">{scope.label}</Badge>
        {scope.versions.map((version) => {
          const target = getDocVersionTarget(currentHref, version.id);
          if (!target) return null;
          return (
            <Button
              asChild
              key={version.id}
              size="sm"
              variant={
                context?.version.id === version.id ? 'secondary' : 'outline'
              }
            >
              <Link
                aria-current={
                  context?.version.id === version.id ? 'page' : undefined
                }
                to={target.href}
                onClick={(event) => {
                  if (
                    event.button === 0 &&
                    !event.metaKey &&
                    !event.ctrlKey &&
                    !event.shiftKey &&
                    !event.altKey
                  )
                    setDocVersionPreference(scope.id, version.id);
                }}
              >
                {version.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      {fallback ? (
        <p role="status" className="text-sm text-muted-foreground">
          This topic is not available in this version. Showing its overview
          instead.
        </p>
      ) : null}
    </div>
  );
}
