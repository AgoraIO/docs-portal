import { Tabs, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';
import { ChevronDownIcon } from 'lucide-react';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import { DOCS_HASH_TARGET_EVENT } from '@/lib/docs-hash';
import { type AppLocale, DEFAULT_LOCALE } from '@/lib/i18n/i18n-config';
import {
  getStoredPlatformPreference,
  PLATFORM_PREFERENCE_EVENT,
  setStoredPlatformPreference,
  syncPlatformDataset,
} from '@/lib/platforms/preference';
import {
  getPlatformLabel,
  isKnownPlatform,
  type PlatformKey,
} from '@/lib/platforms/registry';
import { buildPlatformPathname } from '@/lib/platforms/route';

type ControlledTabsProps = React.ComponentProps<typeof Tabs> & {
  onValueChange?: (value: string) => void;
  value?: string;
};

type PlatformPanelProps = {
  children?: ReactNode;
  platform: PlatformKey;
  activePlatform?: PlatformKey;
};

const ControlledTabs = Tabs as React.ComponentType<ControlledTabsProps>;
const PlatformTabsPlacementContext = createContext<{
  defaultPlatform?: PlatformKey;
  initialPlatform?: PlatformKey;
  placement: 'header' | 'inline';
}>({
  placement: 'inline',
});
const PlatformPageContext = createContext<{
  activePlatform?: PlatformKey;
  handlePlatformChange: (value: string) => void;
} | null>(null);
const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
const HEADER_TAB_GAP_WIDTH = 24;
const HEADER_MORE_GAP_WIDTH = 16;
const HEADER_WIDTH_EPSILON = 0.5;
const PLATFORM_HASH_TARGET_WAIT_MS = 30_000;
const HEADER_TAB_BUTTON_CLASS =
  'relative flex h-12 shrink-0 items-center px-0 text-[15px] font-medium text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink-1)] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[color:var(--ink-1)] after:opacity-0 after:transition-opacity';
const HEADER_MORE_BUTTON_CLASS =
  'relative flex h-12 shrink-0 items-center gap-1.5 px-0 text-[15px] font-medium text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink-1)] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[color:var(--ink-1)] after:opacity-0 after:transition-opacity';

type HeaderPlatformBuckets = {
  overflowPlatforms: PlatformKey[];
  primaryPlatforms: PlatformKey[];
};

type HeaderPlatformMeasurement = {
  availableWidth?: number;
  moreButtonWidth?: number;
  moreGapWidth?: number;
  tabGapWidth?: number;
  tabWidths?: Partial<Record<PlatformKey, number>>;
};

export function PlatformTabsPlacementProvider({
  children,
  defaultPlatform,
  initialPlatform,
  value,
}: {
  children?: ReactNode;
  defaultPlatform?: PlatformKey;
  initialPlatform?: PlatformKey;
  value: 'header' | 'inline';
}) {
  return (
    <PlatformTabsPlacementContext
      value={{ defaultPlatform, initialPlatform, placement: value }}
    >
      {children}
    </PlatformTabsPlacementContext>
  );
}

export function PlatformPageProvider({
  canonicalPlatform,
  children,
  defaultPlatform,
  initialPlatform,
  platforms,
}: {
  canonicalPlatform: PlatformKey;
  children?: ReactNode;
  defaultPlatform?: PlatformKey;
  initialPlatform?: PlatformKey;
  platforms: string;
}) {
  const parsedPlatforms = usePlatformList(platforms);
  const selection = usePlatformSelection({
    canonicalPlatform,
    defaultPlatform,
    initialPlatform,
    parsedPlatforms,
    deferStoredPreference: true,
    syncPath: true,
  });
  useHashPlatformPreference(initialPlatform, parsedPlatforms);

  return (
    <PlatformPageContext.Provider value={selection}>
      {children}
    </PlatformPageContext.Provider>
  );
}

export function usePlatformPageContext() {
  return useContext(PlatformPageContext);
}

function useHashPlatformPreference(
  initialPlatform: PlatformKey | undefined,
  platforms: PlatformKey[],
) {
  useEffect(() => {
    // An explicit platform in the URL takes precedence over an old fragment.
    if (initialPlatform) return;
    let observer: MutationObserver | undefined;
    let timeout: number | undefined;
    const stopWaiting = () => {
      observer?.disconnect();
      observer = undefined;
      window.clearTimeout(timeout);
      timeout = undefined;
    };
    const revealTarget = () => {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        stopWaiting();
        return true;
      }
      const target = document.getElementById(id);
      if (!target) return false;
      stopWaiting();
      const platform = target.closest<HTMLElement>('[data-platform-panel]')
        ?.dataset.platformPanel;
      if (
        platform &&
        isKnownPlatform(platform) &&
        platforms.includes(platform) &&
        getStoredPlatformPreference() !== platform
      ) {
        setStoredPlatformPreference(platform);
      }
      return true;
    };
    const requestTarget = () => {
      stopWaiting();
      if (!window.location.hash || revealTarget()) return;
      // MDX can arrive after the page shell; stop observing once it does.
      observer = new MutationObserver(() => {
        revealTarget();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      timeout = window.setTimeout(stopWaiting, PLATFORM_HASH_TARGET_WAIT_MS);
    };
    window.addEventListener('hashchange', requestTarget);
    window.addEventListener(DOCS_HASH_TARGET_EVENT, requestTarget);
    requestTarget();
    return () => {
      stopWaiting();
      window.removeEventListener('hashchange', requestTarget);
      window.removeEventListener(DOCS_HASH_TARGET_EVENT, requestTarget);
    };
  }, [initialPlatform, platforms]);
}

export function PlatformTabsGroup({
  canonicalPlatform,
  children,
  defaultPlatform,
  groupMode,
  initialPlatform,
  locale = DEFAULT_LOCALE,
  platforms,
  showTabs = 'true',
  tabsPlacement,
}: {
  canonicalPlatform: PlatformKey;
  children?: ReactNode;
  defaultPlatform?: PlatformKey;
  groupMode: 'inline' | 'structured';
  initialPlatform?: PlatformKey;
  locale?: AppLocale;
  platforms: string;
  showTabs?: string;
  tabsPlacement?: 'header' | 'inline';
}) {
  const parsedPlatforms = usePlatformList(platforms);
  const platformContext = useContext(PlatformTabsPlacementContext);
  const resolvedInitialPlatform =
    initialPlatform ?? platformContext.initialPlatform;
  const resolvedDefaultPlatform =
    defaultPlatform ?? platformContext.defaultPlatform;
  const resolvedTabsPlacement = tabsPlacement ?? platformContext.placement;
  const shouldShowTabs = showTabs !== 'false' && parsedPlatforms.length > 1;
  const shouldRenderInlineTabs =
    shouldShowTabs && resolvedTabsPlacement === 'inline';
  const shouldSyncPlatformPath =
    groupMode === 'structured' && resolvedTabsPlacement === 'header';
  const { activePlatform, handlePlatformChange } = usePlatformSelection({
    canonicalPlatform,
    defaultPlatform: resolvedDefaultPlatform,
    initialPlatform: resolvedInitialPlatform,
    parsedPlatforms,
    deferStoredPreference: false,
    syncPath: shouldSyncPlatformPath,
  });

  if (activePlatform === undefined) {
    return null;
  }

  const panelChildren = Children.map(children, (child) => {
    if (!isValidElement<PlatformPanelProps>(child)) {
      return child;
    }

    return cloneElement(child as ReactElement<PlatformPanelProps>, {
      activePlatform,
    });
  });

  return (
    <div
      className={cn(
        groupMode === 'structured'
          ? 'flex flex-col gap-4'
          : 'flex flex-col gap-3',
      )}
      data-platform-group={groupMode}
      data-platforms={parsedPlatforms.join(' ')}
    >
      {shouldRenderInlineTabs ? (
        <div className={cn(groupMode === 'structured' && 'not-prose')}>
          <PlatformTabs
            activePlatform={activePlatform}
            locale={locale}
            onValueChange={handlePlatformChange}
            platforms={parsedPlatforms}
          />
        </div>
      ) : null}
      {panelChildren}
    </div>
  );
}

export function PlatformHeaderTabs({
  canonicalPlatform,
  className,
  defaultPlatform,
  initialPlatform,
  locale = DEFAULT_LOCALE,
  platforms,
}: {
  canonicalPlatform: PlatformKey;
  className?: string;
  defaultPlatform?: PlatformKey;
  initialPlatform?: PlatformKey;
  locale?: AppLocale;
  platforms: string;
}) {
  const parsedPlatforms = usePlatformList(platforms);
  const { activePlatform, handlePlatformChange } = usePlatformSelection({
    canonicalPlatform,
    defaultPlatform,
    initialPlatform,
    parsedPlatforms,
    deferStoredPreference: false,
    syncPath: true,
  });

  if (parsedPlatforms.length <= 1 || activePlatform === undefined) {
    return null;
  }

  return (
    <div className={cn('not-prose max-w-full', className)}>
      <PlatformHeaderTabsList
        activePlatform={activePlatform}
        locale={locale}
        onValueChange={handlePlatformChange}
        platforms={parsedPlatforms}
      />
    </div>
  );
}

function PlatformHeaderTabsList({
  activePlatform,
  locale,
  onValueChange,
  platforms,
}: {
  activePlatform: PlatformKey;
  locale: AppLocale;
  onValueChange: (value: string) => void;
  platforms: PlatformKey[];
}) {
  const [headerBuckets, setHeaderBuckets] = useState<HeaderPlatformBuckets>(
    () => getHeaderPlatformBuckets(platforms, activePlatform),
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measurementTabsRef = useRef<HTMLDivElement | null>(null);
  const measurementMoreRef = useRef<HTMLButtonElement | null>(null);
  const measurementTabRefs = useRef(new Map<PlatformKey, HTMLButtonElement>());
  const { overflowPlatforms, primaryPlatforms } = headerBuckets;
  const moreActive = overflowPlatforms.includes(activePlatform);
  const moreLabel = moreActive
    ? getPlatformLabel(activePlatform, locale)
    : 'More';
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();
  const overflowMenuRef = useRef<HTMLDivElement | null>(null);
  const setMeasurementTabRef = useCallback(
    (platform: PlatformKey) => (node: HTMLButtonElement | null) => {
      if (node) {
        measurementTabRefs.current.set(platform, node);
        return;
      }

      measurementTabRefs.current.delete(platform);
    },
    [],
  );
  const updateHeaderBuckets = useCallback(() => {
    const container = containerRef.current;
    const measurementTabs = measurementTabsRef.current;
    const measurementMore = measurementMoreRef.current;

    const tabWidths = platforms.reduce<Partial<Record<PlatformKey, number>>>(
      (widths, platform) => {
        const node = measurementTabRefs.current.get(platform);
        widths[platform] = node?.getBoundingClientRect().width;
        return widths;
      },
      {},
    );
    const containerRect = container?.getBoundingClientRect();
    const viewportWidth =
      typeof window === 'undefined' ? undefined : window.innerWidth;
    const availableWidth =
      containerRect && viewportWidth
        ? Math.min(containerRect.width, viewportWidth - containerRect.left)
        : containerRect?.width;

    const nextBuckets = getHeaderPlatformBuckets(platforms, activePlatform, {
      availableWidth,
      moreButtonWidth: measurementMore?.getBoundingClientRect().width,
      moreGapWidth: readFlexGapWidth(container, HEADER_MORE_GAP_WIDTH),
      tabGapWidth: readFlexGapWidth(measurementTabs, HEADER_TAB_GAP_WIDTH),
      tabWidths,
    });

    setHeaderBuckets((currentBuckets) =>
      areHeaderPlatformBucketsEqual(currentBuckets, nextBuckets)
        ? currentBuckets
        : nextBuckets,
    );
  }, [activePlatform, platforms]);

  useBrowserLayoutEffect(() => {
    updateHeaderBuckets();
  }, [updateHeaderBuckets]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateHeaderBuckets);

      return () => {
        window.removeEventListener('resize', updateHeaderBuckets);
      };
    }

    const resizeObserver = new ResizeObserver(updateHeaderBuckets);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateHeaderBuckets]);

  useEffect(() => {
    if (overflowPlatforms.length === 0) {
      setIsMoreOpen(false);
    }
  }, [overflowPlatforms.length]);

  useEffect(() => {
    if (activeTabRef.current?.dataset.platformTab !== activePlatform) {
      return;
    }

    activeTabRef.current.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
    });
  }, [activePlatform]);

  useEffect(() => {
    if (!isMoreOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        overflowMenuRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsMoreOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreOpen]);

  return (
    <div
      className="relative flex w-full max-w-full min-w-0 items-stretch gap-4 overflow-visible"
      data-platform-header-tabs="true"
      ref={containerRef}
    >
      <div
        aria-label="Platform"
        className="flex min-w-0 flex-1 items-stretch gap-6 overflow-hidden pr-1"
        role="tablist"
      >
        {primaryPlatforms.map((platform) => (
          <button
            aria-selected={activePlatform === platform}
            className={cn(
              HEADER_TAB_BUTTON_CLASS,
              activePlatform === platform &&
                'text-[color:var(--ink-1)] after:opacity-100',
            )}
            data-platform-tab={platform}
            key={platform}
            onClick={() => onValueChange(platform)}
            ref={activePlatform === platform ? activeTabRef : undefined}
            role="tab"
            type="button"
          >
            {getPlatformLabel(platform, locale)}
          </button>
        ))}
      </div>
      {overflowPlatforms.length > 0 ? (
        <div className="relative shrink-0" ref={overflowMenuRef}>
          <button
            aria-controls={isMoreOpen ? menuId : undefined}
            aria-expanded={isMoreOpen}
            aria-haspopup="menu"
            aria-label="More platforms"
            className={cn(
              HEADER_MORE_BUTTON_CLASS,
              moreActive && 'text-[color:var(--ink-1)] after:opacity-100',
            )}
            data-state={moreActive ? 'active' : 'inactive'}
            onClick={() => setIsMoreOpen((isOpen) => !isOpen)}
            type="button"
          >
            {moreLabel}
            <ChevronDownIcon
              aria-hidden="true"
              className={cn(
                'size-4 transition-transform',
                isMoreOpen && 'rotate-180',
              )}
            />
          </button>
          {isMoreOpen ? (
            <div
              className="absolute top-full right-0 z-30 mt-2 min-w-52 rounded-lg border border-[color:var(--line-soft)] bg-card p-2 shadow-xl"
              id={menuId}
              role="menu"
            >
              {overflowPlatforms.map((platform) => (
                <button
                  className={cn(
                    'flex w-full items-center rounded-md px-3 py-2 text-left text-[15px] text-[color:var(--ink-2)] transition-colors hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]',
                    activePlatform === platform &&
                      'bg-[color:var(--docs-soft-fill)] text-[color:var(--ink-1)]',
                  )}
                  key={platform}
                  onClick={() => {
                    onValueChange(platform);
                    setIsMoreOpen(false);
                  }}
                  role="menuitem"
                  type="button"
                >
                  {getPlatformLabel(platform, locale)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        aria-hidden="true"
        className="invisible pointer-events-none absolute inset-0 flex items-stretch gap-6 overflow-hidden"
        data-platform-header-measurement="true"
        ref={measurementTabsRef}
      >
        {platforms.map((platform) => (
          <button
            className={HEADER_TAB_BUTTON_CLASS}
            data-platform-tab-measure={platform}
            key={platform}
            ref={setMeasurementTabRef(platform)}
            tabIndex={-1}
            type="button"
          >
            {getPlatformLabel(platform, locale)}
          </button>
        ))}
        <button
          className={HEADER_MORE_BUTTON_CLASS}
          data-platform-more-measure="true"
          ref={measurementMoreRef}
          tabIndex={-1}
          type="button"
        >
          More
          <ChevronDownIcon aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function getHeaderPlatformBuckets(
  platforms: PlatformKey[],
  activePlatform: PlatformKey,
  measurement: HeaderPlatformMeasurement = {},
): HeaderPlatformBuckets {
  if (platforms.length <= 1) {
    return {
      overflowPlatforms: [],
      primaryPlatforms: platforms,
    };
  }

  const { availableWidth, moreButtonWidth, tabWidths } = measurement;
  if (
    typeof availableWidth !== 'number' ||
    availableWidth <= 0 ||
    typeof moreButtonWidth !== 'number' ||
    moreButtonWidth <= 0 ||
    !tabWidths ||
    !platforms.every((platform) => {
      const width = tabWidths?.[platform];
      return typeof width === 'number' && width > 0;
    })
  ) {
    return {
      overflowPlatforms: [],
      primaryPlatforms: platforms,
    };
  }

  const tabGapWidth = measurement.tabGapWidth ?? HEADER_TAB_GAP_WIDTH;
  const allTabsWidth = getHeaderTabsWidth(platforms, tabWidths, tabGapWidth);

  if (fitsHeaderWidth(allTabsWidth, availableWidth)) {
    return {
      overflowPlatforms: [],
      primaryPlatforms: platforms,
    };
  }

  const moreGapWidth = measurement.moreGapWidth ?? HEADER_MORE_GAP_WIDTH;
  const visibleTabsWidth = Math.max(
    0,
    availableWidth - moreButtonWidth - moreGapWidth,
  );
  const visiblePlatforms = new Set<PlatformKey>();

  if (platforms.includes(activePlatform)) {
    visiblePlatforms.add(activePlatform);
  }

  for (const platform of platforms) {
    if (visiblePlatforms.has(platform)) {
      continue;
    }

    const candidatePlatforms = platforms.filter(
      (candidate) => visiblePlatforms.has(candidate) || candidate === platform,
    );
    const candidateWidth = getHeaderTabsWidth(
      candidatePlatforms,
      tabWidths,
      tabGapWidth,
    );

    if (fitsHeaderWidth(candidateWidth, visibleTabsWidth)) {
      visiblePlatforms.add(platform);
    }
  }

  const primaryPlatforms = platforms.filter((platform) =>
    visiblePlatforms.has(platform),
  );
  const overflowPlatforms = platforms.filter(
    (platform) => !visiblePlatforms.has(platform),
  );

  return {
    overflowPlatforms,
    primaryPlatforms,
  };
}

function getHeaderTabsWidth(
  platforms: PlatformKey[],
  tabWidths: Partial<Record<PlatformKey, number>>,
  tabGapWidth: number,
) {
  const tabWidth = platforms.reduce(
    (width, platform) => width + (tabWidths[platform] ?? 0),
    0,
  );

  return tabWidth + Math.max(0, platforms.length - 1) * tabGapWidth;
}

function fitsHeaderWidth(width: number, availableWidth: number) {
  return width <= availableWidth + HEADER_WIDTH_EPSILON;
}

function areHeaderPlatformBucketsEqual(
  currentBuckets: HeaderPlatformBuckets,
  nextBuckets: HeaderPlatformBuckets,
) {
  return (
    arePlatformListsEqual(
      currentBuckets.primaryPlatforms,
      nextBuckets.primaryPlatforms,
    ) &&
    arePlatformListsEqual(
      currentBuckets.overflowPlatforms,
      nextBuckets.overflowPlatforms,
    )
  );
}

function arePlatformListsEqual(
  currentPlatforms: PlatformKey[],
  nextPlatforms: PlatformKey[],
) {
  return (
    currentPlatforms.length === nextPlatforms.length &&
    currentPlatforms.every(
      (platform, index) => platform === nextPlatforms[index],
    )
  );
}

function readFlexGapWidth(
  element: Element | null | undefined,
  fallback: number,
) {
  if (!element || typeof window === 'undefined') {
    return fallback;
  }

  const styles = window.getComputedStyle(element);
  const gap = Number.parseFloat(styles.columnGap || styles.gap);

  return Number.isFinite(gap) ? gap : fallback;
}

function PlatformTabs({
  activePlatform,
  locale,
  onValueChange,
  platforms,
}: {
  activePlatform: PlatformKey;
  locale: AppLocale;
  onValueChange: (value: string) => void;
  platforms: PlatformKey[];
}) {
  return (
    <ControlledTabs onValueChange={onValueChange} value={activePlatform}>
      <TabsList>
        {platforms.map((platform) => (
          <TabsTrigger
            key={platform}
            onClick={() => onValueChange(platform)}
            value={platform}
          >
            {getPlatformLabel(platform, locale)}
          </TabsTrigger>
        ))}
      </TabsList>
    </ControlledTabs>
  );
}

function usePlatformList(platforms: string) {
  return useMemo(() => {
    const parsed = JSON.parse(platforms) as string[];
    return parsed.filter(isKnownPlatform);
  }, [platforms]);
}

function usePlatformSelection({
  canonicalPlatform,
  defaultPlatform,
  initialPlatform,
  parsedPlatforms,
  deferStoredPreference,
  syncPath,
}: {
  canonicalPlatform: PlatformKey;
  defaultPlatform?: PlatformKey;
  initialPlatform?: PlatformKey;
  parsedPlatforms: PlatformKey[];
  deferStoredPreference: boolean;
  syncPath: boolean;
}) {
  const pageContext = useContext(PlatformPageContext);
  const platformPreferenceRef = useRef<PlatformKey | null | undefined>(
    undefined,
  );

  if (platformPreferenceRef.current === undefined) {
    const stored = getStoredPlatformPreference();
    // A page fallback must not erase a preference supported by the next page.
    platformPreferenceRef.current =
      stored && isKnownPlatform(stored) ? stored : null;
  }

  const [localActivePlatform, setLocalActivePlatform] = useState<
    PlatformKey | undefined
  >(() => {
    if (initialPlatform && !parsedPlatforms.includes(initialPlatform)) {
      return undefined;
    }

    if (initialPlatform && parsedPlatforms.includes(initialPlatform)) {
      return initialPlatform;
    }

    // Match server HTML on hydration; the page owner applies storage before paint.
    const stored = deferStoredPreference ? null : platformPreferenceRef.current;

    if (stored && parsedPlatforms.includes(stored)) {
      return stored;
    }

    if (defaultPlatform && parsedPlatforms.includes(defaultPlatform)) {
      return defaultPlatform;
    }

    return getDefaultPlatform(
      parsedPlatforms,
      canonicalPlatform,
      defaultPlatform,
    );
  });
  const previousInitialPlatformRef = useRef(initialPlatform);
  const activePlatform =
    initialPlatform !== previousInitialPlatformRef.current &&
    initialPlatform &&
    parsedPlatforms.includes(initialPlatform)
      ? initialPlatform
      : pageContext?.activePlatform &&
          parsedPlatforms.includes(pageContext.activePlatform)
        ? pageContext.activePlatform
        : localActivePlatform;
  const activePlatformRef = useRef(localActivePlatform);
  const previousDefaultPlatformRef = useRef(defaultPlatform);

  useBrowserLayoutEffect(() => {
    previousInitialPlatformRef.current = initialPlatform;
  }, [initialPlatform]);

  useBrowserLayoutEffect(() => {
    if (initialPlatform && !parsedPlatforms.includes(initialPlatform)) {
      activePlatformRef.current = undefined;
      setLocalActivePlatform(undefined);
      return;
    }

    if (
      initialPlatform === undefined &&
      platformPreferenceRef.current &&
      parsedPlatforms.includes(platformPreferenceRef.current) &&
      platformPreferenceRef.current !== localActivePlatform
    ) {
      activePlatformRef.current = platformPreferenceRef.current;
      setLocalActivePlatform(platformPreferenceRef.current);
      return;
    }

    if (
      localActivePlatform === undefined ||
      !parsedPlatforms.includes(localActivePlatform)
    ) {
      const fallbackPlatform = getDefaultPlatform(
        parsedPlatforms,
        canonicalPlatform,
        defaultPlatform,
      );

      activePlatformRef.current = fallbackPlatform;
      setLocalActivePlatform(fallbackPlatform);
    }
  }, [
    localActivePlatform,
    canonicalPlatform,
    defaultPlatform,
    initialPlatform,
    parsedPlatforms,
  ]);

  useBrowserLayoutEffect(() => {
    const previousDefaultPlatform = previousDefaultPlatformRef.current;
    previousDefaultPlatformRef.current = defaultPlatform;

    if (
      initialPlatform !== undefined ||
      defaultPlatform === undefined ||
      !parsedPlatforms.includes(defaultPlatform) ||
      previousDefaultPlatform === defaultPlatform
    ) {
      return;
    }

    if (
      platformPreferenceRef.current &&
      parsedPlatforms.includes(platformPreferenceRef.current)
    ) {
      activePlatformRef.current = platformPreferenceRef.current;
      setLocalActivePlatform(platformPreferenceRef.current);
      return;
    }

    activePlatformRef.current = defaultPlatform;
    setLocalActivePlatform(defaultPlatform);
  }, [defaultPlatform, initialPlatform, parsedPlatforms]);

  useEffect(() => {
    if (initialPlatform && parsedPlatforms.includes(initialPlatform)) {
      activePlatformRef.current = initialPlatform;
      platformPreferenceRef.current = initialPlatform;
      setLocalActivePlatform(initialPlatform);
      setStoredPlatformPreference(initialPlatform);
    }
  }, [initialPlatform, parsedPlatforms]);

  useEffect(() => {
    if (pageContext) {
      return;
    }

    if (localActivePlatform) {
      activePlatformRef.current = localActivePlatform;
      syncPlatformDataset(localActivePlatform);
    }
  }, [localActivePlatform, pageContext]);

  useEffect(() => {
    function handlePreferenceChange(event: Event) {
      const nextPlatform =
        event instanceof CustomEvent
          ? event.detail
          : getStoredPlatformPreference();

      if (typeof nextPlatform === 'string' && isKnownPlatform(nextPlatform)) {
        platformPreferenceRef.current = nextPlatform;

        if (parsedPlatforms.includes(nextPlatform)) {
          activePlatformRef.current = nextPlatform;
          setLocalActivePlatform(nextPlatform);
        }
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== 'docs-portal:platform:v1') {
        return;
      }

      if (
        typeof event.newValue === 'string' &&
        isKnownPlatform(event.newValue)
      ) {
        platformPreferenceRef.current = event.newValue;

        if (parsedPlatforms.includes(event.newValue)) {
          activePlatformRef.current = event.newValue;
          setLocalActivePlatform(event.newValue);
        }
      }
    }

    window.addEventListener(PLATFORM_PREFERENCE_EVENT, handlePreferenceChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(
        PLATFORM_PREFERENCE_EVENT,
        handlePreferenceChange,
      );
      window.removeEventListener('storage', handleStorage);
    };
  }, [parsedPlatforms]);

  function handlePlatformChange(value: string) {
    if (!isKnownPlatform(value) || !parsedPlatforms.includes(value)) {
      return;
    }

    if (pageContext) {
      pageContext.handlePlatformChange(value);
      return;
    }

    if (activePlatformRef.current !== value) {
      activePlatformRef.current = value;
      setLocalActivePlatform(value);
    }

    if (platformPreferenceRef.current !== value) {
      platformPreferenceRef.current = value;
      setStoredPlatformPreference(value);
    }

    if (syncPath) {
      syncPlatformPath(value);
    }
  }

  return {
    activePlatform,
    handlePlatformChange,
  };
}

function getDefaultPlatform(
  parsedPlatforms: PlatformKey[],
  canonicalPlatform: PlatformKey,
  defaultPlatform?: PlatformKey,
) {
  if (defaultPlatform && parsedPlatforms.includes(defaultPlatform)) {
    return defaultPlatform;
  }

  return parsedPlatforms.includes(canonicalPlatform)
    ? canonicalPlatform
    : (parsedPlatforms[0] ?? canonicalPlatform);
}

function syncPlatformPath(platform: PlatformKey) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextPath = buildPlatformPathname(window.location.pathname, platform);
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete('platform');
  const nextSearch = searchParams.toString();
  const nextUrl = `${nextPath}${nextSearch ? `?${nextSearch}` : ''}`;

  if (
    nextUrl !==
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  ) {
    window.history.pushState({}, '', nextUrl);
  }
}

export function PlatformPanel({
  activePlatform,
  children,
  platform,
}: PlatformPanelProps) {
  const isActive = activePlatform === undefined || activePlatform === platform;

  return (
    <section
      aria-hidden={isActive ? 'false' : 'true'}
      data-platform-panel={platform}
      hidden={!isActive}
      inert={isActive ? undefined : true}
    >
      {children}
    </section>
  );
}
