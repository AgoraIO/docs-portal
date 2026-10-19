import { Link, useLocation } from '@tanstack/react-router';
import { Callout } from 'fumadocs-ui/components/callout';
import { type MouseEvent, useEffect } from 'react';
import { cn } from '@/lib/cn';
import {
  getStoredDocVersionSelections,
  setDocVersionPreference,
} from '@/lib/doc-version-preference';
import {
  DOC_VERSION_SCOPES,
  getDocVersionTarget,
  resolveDocVersion,
} from '@/lib/doc-versions';

type DocVersionProps = { activePath: string };

function saveSelection(
  event: MouseEvent<HTMLAnchorElement>,
  scopeId: string,
  versionId: string,
) {
  if (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  ) {
    setDocVersionPreference(scopeId, versionId);
  }
}

/** A direct preview toggle; release URLs remain usable without JavaScript. */
export function DocVersionSwitch({
  activePath,
  className,
}: DocVersionProps & { className?: string }) {
  const location = useLocation();
  const context = resolveDocVersion(activePath);
  if (!context) return null;

  const { scope, version } = context;
  const isPreview = version.status === 'preview';
  const preview = isPreview
    ? version
    : scope.versions.find((item) => item.status === 'preview');
  if (!preview) return null;

  const targetId = isPreview ? scope.defaultVersion : preview.id;
  const target = getDocVersionTarget(
    `${activePath}${location.hash ? `#${location.hash.replace(/^#/, '')}` : ''}`,
    targetId,
  );
  if (!target) return null;

  return (
    <Link
      aria-checked={isPreview}
      aria-label={`Preview documentation for ${scope.label}`}
      className={cn('doc-version-switch', className)}
      onClick={(event) => saveSelection(event, scope.id, targetId)}
      onKeyDown={(event) => {
        if (event.key === ' ') {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
      role="switch"
      to={target.href}
    >
      <span aria-hidden="true" className="doc-version-switch-track" />
      <span>{isPreview ? `${version.id} docs` : `Try ${preview.id}`}</span>
      <span aria-hidden="true" className="doc-version-preview-tag">
        Preview
      </span>
    </Link>
  );
}

/** Owns the neutral-entry restore and notices, independently of toggle placement. */
export function DocVersionNotice({ activePath }: DocVersionProps) {
  const location = useLocation();
  const context = resolveDocVersion(activePath);
  const entryScope = DOC_VERSION_SCOPES.find(
    (item) => item.entryUrl === activePath,
  );

  useEffect(() => {
    if (!entryScope) return;
    const selected = getStoredDocVersionSelections(activePath)[entryScope.id];
    const target = getDocVersionTarget(activePath, selected);
    // Re-enter the deterministic release HTML so lazy MDX hydrates with its own payload.
    if (target) window.location.replace(target.href);
  }, [activePath, entryScope]);

  if (!context) return null;
  const { scope, version } = context;
  const fallback = new URLSearchParams(location.searchStr).has(
    'versionFallback',
  );
  const currentHref = `${activePath}${location.hash ? `#${location.hash.replace(/^#/, '')}` : ''}`;
  const returnTarget = getDocVersionTarget(currentHref, scope.defaultVersion);

  return (
    <>
      {version.status === 'preview' ? (
        <Callout
          aria-label="Preview documentation"
          className="doc-version-callout"
          role="note"
          title={`Preview documentation · ${version.id}`}
          type="info"
        >
          {returnTarget ? (
            <Link
              className="rounded-sm underline decoration-current/40 underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={(event) =>
                saveSelection(event, scope.id, scope.defaultVersion)
              }
              to={returnTarget.href}
            >
              Turn Preview off to return to {scope.defaultVersion}.
            </Link>
          ) : null}
        </Callout>
      ) : null}
      {fallback ? (
        <p className="text-sm text-muted-foreground" role="status">
          This topic is not available in this version. Showing its overview
          instead.
        </p>
      ) : null}
    </>
  );
}
