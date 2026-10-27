import { Link, useLocation } from '@tanstack/react-router';
import { Callout } from 'fumadocs-ui/components/callout';
import { CheckIcon, ChevronDownIcon, InfoIcon } from 'lucide-react';
import { type MouseEvent, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
type DocVersionSelectorProps = DocVersionProps & {
  className?: string;
  onSelectPath?: () => void;
};

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
    return true;
  }
  return false;
}

/** Only registered families have a selector; ordinary sidebars need no router context. */
export function DocVersionSelector({
  activePath,
  className,
  onSelectPath,
}: DocVersionSelectorProps) {
  const context = resolveDocVersion(activePath);
  if (!context) return null;
  return (
    <RegisteredDocVersionSelector
      activePath={activePath}
      className={className}
      context={context}
      onSelectPath={onSelectPath}
    />
  );
}

function RegisteredDocVersionSelector({
  activePath,
  className,
  context,
  onSelectPath,
}: DocVersionSelectorProps & {
  context: NonNullable<ReturnType<typeof resolveDocVersion>>;
}) {
  const location = useLocation();

  const { scope, version } = context;
  const isPreview = version.status === 'preview';
  const currentHref = `${activePath}${location.hash ? `#${location.hash.replace(/^#/, '')}` : ''}`;
  const label = `${version.label}${isPreview ? ' · Preview' : ''}`;

  return (
    <div className={className} data-doc-version-selector>
      <p className="mb-2 text-xs font-medium leading-5 text-muted-foreground">
        Documentation version
      </p>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Documentation: ${label}`}
            className="h-11 w-full justify-between gap-3 rounded-md px-3 text-[13px] text-foreground shadow-none data-[state=open]:bg-accent lg:h-10"
            size="sm"
            variant="outline"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{version.label}</span>
              {isPreview ? (
                <Badge size="sm" variant="preview">
                  Preview
                </Badge>
              ) : null}
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              className="opacity-60"
              data-icon="inline-end"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          aria-label={`Documentation versions for ${scope.label}`}
          className="w-(--radix-dropdown-menu-trigger-width) min-w-52 rounded-lg p-1"
        >
          <DropdownMenuGroup>
            {scope.versions.map((item) => {
              const target = getDocVersionTarget(currentHref, item.id);
              if (!target) return null;
              return (
                <DropdownMenuItem
                  asChild
                  className="min-h-11 cursor-pointer justify-between gap-3 rounded-md px-2.5 text-[13px] lg:min-h-8"
                  key={item.id}
                >
                  <Link
                    aria-current={item.id === version.id ? 'page' : undefined}
                    aria-label={`${item.label}${item.status === 'preview' ? ' · Preview' : ''}`}
                    onClick={(event) => {
                      if (saveSelection(event, scope.id, item.id))
                        onSelectPath?.();
                    }}
                    to={target.href}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{item.label}</span>
                      {item.status === 'preview' ? (
                        <Badge size="sm" variant="preview">
                          Preview
                        </Badge>
                      ) : null}
                    </span>
                    {item.id === version.id ? (
                      <CheckIcon aria-hidden="true" className="size-4" />
                    ) : null}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Owns neutral-entry restoration and the notice, independently of selector placement. */
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
  const previousVersion = scope.previousVersion;
  const returnTarget =
    previousVersion && previousVersion !== version.id
      ? getDocVersionTarget(currentHref, previousVersion)
      : undefined;

  return (
    <>
      {version.status === 'preview' ? (
        <Callout
          aria-label="Preview documentation"
          className="doc-version-callout"
          icon={
            <InfoIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-[color:var(--docs-info)]"
            />
          }
          role="note"
          title="Preview documentation"
          type="info"
        >
          You’re reading the new {scope.label} docs.{' '}
          {returnTarget && previousVersion ? (
            <Link
              className="rounded-sm text-[color:var(--docs-info)] underline decoration-current/40 underline-offset-4 hover:decoration-current focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={(event) =>
                saveSelection(event, scope.id, previousVersion)
              }
              to={returnTarget.href}
            >
              Return to previous docs.
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
